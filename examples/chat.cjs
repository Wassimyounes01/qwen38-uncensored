#!/usr/bin/env node
'use strict';
// One local completion against the uncensored tag. No cloud. No tools.
const profile = require('../lib/profile.cjs');

const HOST = String(process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');
const MODEL = process.env.OLLAMA_MODEL || 'qwen3.6:27b-uncensored';
const THINK = /^(1|true|on|yes)$/i.test(String(process.env.QWEN_THINK || ''));
const CTX = Math.max(4096, Math.min(16384, Number(process.env.QWEN_NUM_CTX) || 8192));
const prompt = process.argv.slice(2).join(' ').trim() || 'Reply with PONG only.';

(async () => {
  const res = await fetch(HOST + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      think: THINK,
      keep_alive: '10m',
      messages: [
        { role: 'system', content: profile.SYSTEM_BLOCK },
        { role: 'user', content: prompt },
      ],
      options: { num_ctx: CTX, num_gpu: 99, num_batch: 512, num_predict: 512 },
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    console.error('HTTP ' + res.status + ' ' + raw.slice(0, 240));
    process.exit(1);
  }
  const j = JSON.parse(raw);
  const text = (j && j.message && j.message.content) || '';
  if (!String(text).trim()) {
    console.error('empty-reply');
    process.exit(1);
  }
  process.stdout.write(String(text).trim() + '\n');
})().catch((e) => {
  console.error(e && e.message ? e.message : e);
  process.exit(1);
});
