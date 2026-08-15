#!/usr/bin/env node
'use strict';
// Pull official Ollama qwen3.6:27b (~17 GB Q4_K_M) and bake the uncensored SYSTEM tag.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const profile = require('../lib/profile.cjs');

const ROOT = path.join(__dirname, '..');
const FROM = process.env.QWEN_FROM || 'qwen3.6:27b';
const TAG = process.env.OLLAMA_MODEL || 'qwen3.6:27b-uncensored';
const MF = path.join(ROOT, 'Modelfile');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status || 1);
}

function hasOllama() {
  const r = spawnSync('ollama', ['--version'], { encoding: 'utf8', windowsHide: true });
  return r && r.status === 0;
}

if (!hasOllama()) {
  console.error('ollama is not on PATH. Install https://ollama.com then re-run: node bin/install.cjs');
  process.exit(2);
}

fs.writeFileSync(MF, profile.modelfileText(FROM), 'utf8');
console.log('wrote Modelfile FROM ' + FROM);
console.log('pulling ' + FROM + ' (~17 GB Q4_K_M) — official library weights, not this repo');
run('ollama', ['pull', FROM]);
console.log('creating ' + TAG);
run('ollama', ['create', TAG, '-f', MF]);
console.log('ready: ollama run --think=false ' + TAG);
console.log('or:    node examples/chat.cjs "hello"');
