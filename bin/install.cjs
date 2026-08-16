#!/usr/bin/env node
'use strict';
// Install official Qwen3.8-27B Q4_K_M (~17 GB) and bake the uncensored SYSTEM tag.
// Default: ollama pull qwen3.8:27b
// --gguf : download Unsloth Q4_K_M GGUF from Hugging Face, then ollama create FROM that file.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const profile = require('../lib/profile.cjs');

const ROOT = path.join(__dirname, '..');
const TAG = process.env.OLLAMA_MODEL || 'qwen3.8:27b-uncensored';
const MF = path.join(ROOT, 'Modelfile');
const GGUF_DIR = path.join(ROOT, 'models');
const wantGguf = process.argv.includes('--gguf') || process.env.QWEN_FROM_GGUF === '1';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status || 1);
}

function hasOllama() {
  const r = spawnSync('ollama', ['--version'], { encoding: 'utf8', windowsHide: true });
  return r && r.status === 0;
}

function downloadGguf() {
  fs.mkdirSync(GGUF_DIR, { recursive: true });
  const dest = path.join(GGUF_DIR, profile.WEIGHTS.ggufName);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1e9) {
    console.log('using existing ' + dest);
    return dest;
  }
  console.log('downloading Q4_K_M GGUF (~16.8 GB)');
  console.log(profile.WEIGHTS.q4kmDownload);
  run('curl', ['-L', '--fail', '--retry', '3', '-o', dest, profile.WEIGHTS.q4kmDownload]);
  return dest;
}

if (!hasOllama()) {
  console.error('ollama is not on PATH. Install https://ollama.com then re-run: node bin/install.cjs');
  process.exit(2);
}

let from = process.env.QWEN_FROM || profile.WEIGHTS.ollama;
if (wantGguf) from = downloadGguf();

fs.writeFileSync(MF, profile.modelfileText(from), 'utf8');
console.log('wrote Modelfile FROM ' + from);
if (!wantGguf) {
  console.log('pulling ' + from + ' (~17 GB Q4_K_M) — official library, not this git tree');
  console.log('Hugging Face Q4_K_M: ' + profile.WEIGHTS.q4kmFile);
  run('ollama', ['pull', from]);
}
console.log('creating ' + TAG);
run('ollama', ['create', TAG, '-f', MF]);
console.log('ready: ollama run --think=false ' + TAG);
console.log('or:    node examples/chat.cjs "hello"');
