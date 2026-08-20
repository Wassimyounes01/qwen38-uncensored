// Cross-platform hardware detection + optimal Qwen config selection.
// Mac M5 Pro 48GB → Q3_K_M (13.5GB), Windows 24GB → Q4_K_M (16.8GB).
'use strict';
const os = require('os');
const { spawnSync } = require('child_process');

/**
 * Detect platform, chip, and total memory.
 * @returns {{ os: 'darwin'|'win32'|'linux', arch: string, chip: string, totalGB: number, gpuCores: number }}
 */
function detect() {
  const platform = process.platform;
  const totalGB = Math.round(os.totalmem() / (1024 ** 3));
  let chip = 'unknown';
  let gpuCores = 0;

  if (platform === 'darwin') {
    // Apple Silicon: read chip from sysctl
    const hw = spawnSync('sysctl', ['-n', 'machdep.cpu.brand_string'], { encoding: 'utf8' });
    if (hw.status === 0) chip = hw.stdout.trim();
    // GPU core count
    const gpu = spawnSync('system_profiler', ['SPDisplaysDataType'], { encoding: 'utf8' });
    if (gpu.status === 0) {
      const m = gpu.stdout.match(/Total Number of Cores:\s*(\d+)/i);
      if (m) gpuCores = parseInt(m[1], 10);
    }
  } else if (platform === 'win32') {
    const gpu = spawnSync('wmic', ['path', 'win32_VideoController', 'get', 'Name,AdapterRAM', '/format:csv'], { encoding: 'utf8' });
    if (gpu.status === 0) chip = gpu.stdout.trim().split('\n').slice(1).join('; ');
  }

  return { os: platform, arch: os.arch(), chip, totalGB, gpuCores };
}

/**
 * Pick optimal quant + Ollama parameters for the detected hardware.
 * @param {object} [hw] - override detect() output
 * @returns {{ quant: string, ollamaTag: string, ggufName: string, ggufUrl: string, sizeGB: number, numCtx: number, numGpu: number, numBatch: number, numThread: number, backend: string, notes: string }}
 */
function optimalConfig(hw) {
  const h = hw || detect();
  const isMac = h.os === 'darwin';

  // Mac with ≥48GB → Q3_K_M (13.5GB), leaves 23GB+ for KV + OS
  // Mac with ≥32GB → Q3_K_M (13.5GB), comfortable
  // Mac with <32GB → Q3_K_M (13.5GB), tight but runnable at 4K ctx
  // Windows/Linux  → Q4_K_M (16.8GB), matches existing setup
  if (isMac) {
    const numCtx = h.totalGB >= 48 ? 8192 : 4096;
    // 12 threads = the 12 performance cores on M5 Pro, leaving super cores for OS
    const numThread = h.totalGB >= 48 ? 12 : Math.max(4, Math.floor(os.cpus().length * 0.66));
    return {
      quant: 'Q3_K_M',
      ollamaTag: 'orcarouter/Qwen3.8-27B-Uncensored:q3_k_m',
      ggufName: 'Qwen3.8-27B-Uncensored-Q3_K_M.gguf',
      ggufUrl: 'https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF/resolve/main/Qwen3.8-27B-Uncensored-Q3_K_M.gguf',
      sizeGB: 13.5,
      numCtx,
      numGpu: 999,     // all layers on GPU — unified memory, no CPU offload
      numBatch: 512,   // optimal for Apple Silicon's wide memory bus
      numThread,
      backend: 'metal',
      notes: `Mac ${h.chip || 'Apple Silicon'} ${h.totalGB}GB → Q3_K_M 13.5GB, ${numCtx} ctx, all-GPU Metal`,
    };
  }

  // Windows / Linux — keep existing Q4_K_M behavior
  return {
    quant: 'Q4_K_M',
    ollamaTag: 'orcarouter/Qwen3.8-27B-Uncensored:q4_k_m',
    ggufName: 'Qwen3.8-27B-Uncensored-Q4_K_M.gguf',
    ggufUrl: 'https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF/resolve/main/Qwen3.8-27B-Uncensored-Q4_K_M.gguf',
    sizeGB: 16.8,
    numCtx: 8192,
    numGpu: 999,
    numBatch: 512,
    numThread: Math.max(4, Math.floor(os.cpus().length * 0.75)),
    backend: 'cuda',
    notes: `Windows/Linux → Q4_K_M 16.8GB, 8192 ctx`,
  };
}

/** All available quant tiers for manual override. */
const QUANTS = Object.freeze({
  Q3_K_M:  { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q3_k_m',  sizeGB: 13.5, gguf: 'Qwen3.8-27B-Uncensored-Q3_K_M.gguf' },
  IQ4_XS:  { tag: 'orcarouter/Qwen3.8-27B-Uncensored:iq4_xs',  sizeGB: 15.3, gguf: 'Qwen3.8-27B-Uncensored-IQ4_XS.gguf' },
  Q4_K_M:  { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q4_k_m',  sizeGB: 16.8, gguf: 'Qwen3.8-27B-Uncensored-Q4_K_M.gguf' },
  Q4_K_S:  { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q4_k_s',  sizeGB: 16.2, gguf: 'Qwen3.8-27B-Uncensored-Q4_K_S.gguf' },
  Q5_K_M:  { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q5_k_m',  sizeGB: 19.5, gguf: 'Qwen3.8-27B-Uncensored-Q5_K_M.gguf' },
  Q6_K:    { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q6_k',    sizeGB: 22.4, gguf: 'Qwen3.8-27B-Uncensored-Q6_K.gguf' },
  Q8_0:    { tag: 'orcarouter/Qwen3.8-27B-Uncensored:q8_0',    sizeGB: 29.0, gguf: 'Qwen3.8-27B-Uncensored-Q8_0.gguf' },
});

module.exports = { detect, optimalConfig, QUANTS };
