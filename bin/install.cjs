#!/usr/bin/env node
'use strict';
// Cross-platform installer for Qwen 3.8 27B Uncensored.
// Mac M5 Pro: Q3_K_M (13.5GB) abliterated weights, all-GPU Metal.
// Windows:    Q4_K_M (16.8GB) abliterated weights, CUDA.
// Both use truly abliterated weights from orcarouter (refusal direction removed).
//
// Flags:
//   --gguf       Download GGUF from Hugging Face instead of Ollama pull
//   --mlx        (Mac only) Install MLX backend instead of Ollama (~30-50% faster)
//   --quant=X    Override quant: Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0
//   --legacy     Use official weights + system pack (old behavior, NOT abliterated)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const profile = require('../lib/profile.cjs');
const platform = require('../lib/platform.cjs');

const ROOT = path.join(__dirname, '..');
const TAG = process.env.OLLAMA_MODEL || 'qwen3.8:27b-uncensored';
const GGUF_DIR = path.join(ROOT, 'models');

const wantGguf = process.argv.includes('--gguf') || process.env.QWEN_FROM_GGUF === '1';
const wantMlx = process.argv.includes('--mlx');
const wantLegacy = process.argv.includes('--legacy');

// Parse --quant=X
const quantArg = process.argv.find(a => a.startsWith('--quant='));
const quantOverride = quantArg ? quantArg.split('=')[1].toUpperCase() : null;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status || 1);
}

function hasOllama() {
  const r = spawnSync('ollama', ['--version'], { encoding: 'utf8', windowsHide: true });
  return r && r.status === 0;
}

function hasPython() {
  for (const cmd of ['python3', 'python']) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8', windowsHide: true });
    if (r && r.status === 0) return cmd;
  }
  return null;
}

// --- Detect hardware ---
const hw = platform.detect();
const config = platform.optimalConfig(hw);
const isMac = hw.os === 'darwin';

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  Qwen 3.8 27B Uncensored — Cross-Platform Installer    ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log('Platform:  ' + hw.os + ' ' + hw.arch);
console.log('Chip:      ' + (hw.chip || 'unknown'));
console.log('Memory:    ' + hw.totalGB + ' GB');
console.log('Config:    ' + config.notes);
console.log('');

// --- MLX path (Mac only) ---
if (wantMlx) {
  if (!isMac) {
    console.error('--mlx is only supported on macOS with Apple Silicon.');
    process.exit(2);
  }
  const py = hasPython();
  if (!py) {
    console.error('Python 3 is required for MLX. Install: brew install python3');
    process.exit(2);
  }
  console.log('Installing MLX backend (30-50% faster than Ollama on Apple Silicon)...');
  console.log('');
  run(py, ['-m', 'pip', 'install', '--upgrade', 'mlx-lm', 'huggingface-hub']);
  console.log('');
  console.log('Downloading abliterated MLX model...');
  run(py, ['-m', 'huggingface_hub', 'download', 'orcarouter/Qwen3.8-27B-Uncensored-MLX', '--local-dir', path.join(ROOT, 'models', 'mlx')]);
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  MLX installed! Start the server:                       ║');
  console.log('║                                                         ║');
  console.log('║  mlx_lm.server \\                                        ║');
  console.log('║    --model models/mlx \\                                  ║');
  console.log('║    --port 11434                                          ║');
  console.log('║                                                         ║');
  console.log('║  Then: node examples/chat.cjs "hello"                   ║');
  console.log('║  (same port as Ollama — harness works unchanged)        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  process.exit(0);
}

// --- Ollama path ---
if (!hasOllama()) {
  console.error('Ollama is not on PATH. Install https://ollama.com then re-run.');
  process.exit(2);
}

// Determine quant + source
let ollamaTag, ggufName, ggufUrl, sizeGB, quantLabel;

if (quantOverride) {
  const q = platform.QUANTS[quantOverride];
  if (!q) {
    console.error('Unknown quant: ' + quantOverride + '. Available: ' + Object.keys(platform.QUANTS).join(', '));
    process.exit(2);
  }
  ollamaTag = q.tag;
  ggufName = q.gguf;
  ggufUrl = 'https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF/resolve/main/' + q.gguf;
  sizeGB = q.sizeGB;
  quantLabel = quantOverride;
} else if (wantLegacy) {
  // Old behavior: official weights + system pack
  ollamaTag = profile.WEIGHTS.ollama;
  ggufName = profile.WEIGHTS.ggufName;
  ggufUrl = profile.WEIGHTS.q4kmDownload;
  sizeGB = profile.WEIGHTS.bytesGB;
  quantLabel = 'Q4_K_M (legacy/official)';
} else {
  // Default: abliterated, platform-optimized
  ollamaTag = config.ollamaTag;
  ggufName = config.ggufName;
  ggufUrl = config.ggufUrl;
  sizeGB = config.sizeGB;
  quantLabel = config.quant + ' (abliterated)';
}

console.log('Quant:     ' + quantLabel + ' · ~' + sizeGB + ' GB');
console.log('Source:    ' + (wantLegacy ? 'official weights + system pack' : 'abliterated weights (orcarouter)'));
console.log('');

// Pick the right Modelfile
const mfPath = isMac
  ? path.join(ROOT, 'Modelfile.mac')
  : path.join(ROOT, 'Modelfile');

let from;
if (wantGguf) {
  // Download GGUF directly
  fs.mkdirSync(GGUF_DIR, { recursive: true });
  const dest = path.join(GGUF_DIR, ggufName);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1e9) {
    console.log('Using existing ' + dest);
  } else {
    console.log('Downloading ' + quantLabel + ' GGUF (~' + sizeGB + ' GB)...');
    run('curl', ['-L', '--fail', '--retry', '3', '-o', dest, ggufUrl]);
  }
  from = dest;
} else {
  from = ollamaTag;
}

// Write platform-specific Modelfile
const mfText = profile.modelfileText(from, {
  numCtx: config.numCtx,
  numBatch: config.numBatch,
  numGpu: config.numGpu,
  numThread: isMac ? config.numThread : 0,
});
fs.writeFileSync(mfPath, mfText, 'utf8');
console.log('Wrote ' + (isMac ? 'Modelfile.mac' : 'Modelfile') + ' FROM ' + from);

if (!wantGguf) {
  console.log('Pulling ' + from + ' (~' + sizeGB + ' GB)...');
  run('ollama', ['pull', from]);
}

console.log('Creating ' + TAG + '...');
run('ollama', ['create', TAG, '-f', mfPath]);
console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  Ready!                                                  ║');
console.log('║                                                         ║');
console.log('║  ollama run --think=false ' + TAG.padEnd(28) + '  ║');
console.log('║  node examples/chat.cjs "hello"                        ║');
if (isMac) {
  console.log('║                                                         ║');
  console.log('║  Want 30-50% faster? Re-run with --mlx                 ║');
}
console.log('╚══════════════════════════════════════════════════════════╝');
