'use strict';
const assert = require('assert');
const profile = require('../lib/profile.cjs');
const platform = require('../lib/platform.cjs');

// Profile constants
assert.strictEqual(profile.PROFILE.contextTokens, 262144);
assert.strictEqual(profile.PROFILE.abliteration.layer, 38);
assert.strictEqual(profile.PROFILE.abliteration.matricesEdited, 131);
assert.strictEqual(profile.PROFILE.toolCalling.parser, 'qwen3_coder');
assert.ok(profile.assertLocalSystem(profile.SYSTEM_BLOCK).ok);
for (const c of profile.DISTINCTIVE) assert.ok(profile.SYSTEM_BLOCK.indexOf(c) >= 0, c);

// Modelfile generation (default)
const mf = profile.modelfileText();
assert.ok(/^FROM qwen3\.8:27b$/m.test(mf));
assert.ok(/PARAMETER num_ctx 8192/.test(mf));
assert.ok(/PARAMETER num_gpu 999/.test(mf));
assert.ok(profile.assertLocalSystem(mf).ok);
assert.ok(!/PARAMETER think/.test(mf));

// Modelfile generation (with opts)
const mfMac = profile.modelfileText('orcarouter/Qwen3.8-27B-Uncensored:q3_k_m', {
  numCtx: 8192, numBatch: 512, numGpu: 999, numThread: 12,
});
assert.ok(/^FROM orcarouter\/Qwen3\.8-27B-Uncensored:q3_k_m$/m.test(mfMac));
assert.ok(/PARAMETER num_thread 12/.test(mfMac));
assert.ok(/PARAMETER num_gpu 999/.test(mfMac));
assert.ok(profile.assertLocalSystem(mfMac).ok);

// Weights — abliterated repos present
assert.ok(profile.WEIGHTS.abliteratedRepo.indexOf('orcarouter') >= 0);
assert.ok(profile.WEIGHTS.abliteratedMlx.indexOf('orcarouter') >= 0);
assert.ok(profile.WEIGHTS.mac.ollamaTag.indexOf('q3_k_m') >= 0);
assert.strictEqual(profile.WEIGHTS.mac.bytesGB, 13.5);
assert.ok(profile.WEIGHTS.win.ollamaTag.indexOf('q4_k_m') >= 0);
assert.strictEqual(profile.WEIGHTS.win.bytesGB, 16.8);
assert.strictEqual(profile.WEIGHTS.serving, 'qwen3.8:27b-uncensored');
assert.ok(!/qwen3\.6/.test(profile.WEIGHTS.ollama));

// Platform detection
const hw = platform.detect();
assert.ok(['darwin', 'win32', 'linux'].includes(hw.os));
assert.ok(hw.totalGB > 0);

// Optimal config
const config = platform.optimalConfig(hw);
assert.ok(config.quant);
assert.ok(config.sizeGB > 0);
assert.ok(config.numCtx >= 4096);
assert.ok(config.numGpu >= 99);

// Mac config simulation
const macConfig = platform.optimalConfig({ os: 'darwin', totalGB: 48, chip: 'Apple M5 Pro', gpuCores: 20 });
assert.strictEqual(macConfig.quant, 'Q3_K_M');
assert.strictEqual(macConfig.sizeGB, 13.5);
assert.strictEqual(macConfig.numGpu, 999);
assert.strictEqual(macConfig.numThread, 12);
assert.strictEqual(macConfig.backend, 'metal');

// Windows config simulation
const winConfig = platform.optimalConfig({ os: 'win32', totalGB: 32, chip: 'NVIDIA', gpuCores: 0 });
assert.strictEqual(winConfig.quant, 'Q4_K_M');
assert.strictEqual(winConfig.sizeGB, 16.8);
assert.strictEqual(winConfig.backend, 'cuda');

// QUANTS table
assert.ok(platform.QUANTS.Q3_K_M);
assert.strictEqual(platform.QUANTS.Q3_K_M.sizeGB, 13.5);
assert.ok(platform.QUANTS.Q4_K_M);
assert.ok(platform.QUANTS.IQ4_XS);

console.log('ok ' + profile.DISTINCTIVE.length + ' distinctive clauses + Modelfile + platform + abliterated weights');
