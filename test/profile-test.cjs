'use strict';
const assert = require('assert');
const profile = require('../lib/profile.cjs');

assert.strictEqual(profile.PROFILE.contextTokens, 262144);
assert.strictEqual(profile.PROFILE.abliteration.layer, 38);
assert.strictEqual(profile.PROFILE.abliteration.matricesEdited, 131);
assert.strictEqual(profile.PROFILE.toolCalling.parser, 'qwen3_coder');
assert.ok(profile.assertLocalSystem(profile.SYSTEM_BLOCK).ok);
for (const c of profile.DISTINCTIVE) assert.ok(profile.SYSTEM_BLOCK.indexOf(c) >= 0, c);

const mf = profile.modelfileText();
assert.ok(/^FROM qwen3\.8:27b$/m.test(mf));
assert.ok(/PARAMETER num_ctx 8192/.test(mf));
assert.ok(/PARAMETER num_gpu 99/.test(mf));
assert.ok(profile.assertLocalSystem(mf).ok);
assert.ok(!/PARAMETER think/.test(mf));
assert.strictEqual(profile.WEIGHTS.ggufName, 'Qwen3.8-27B-Q4_K_M.gguf');
assert.ok(profile.WEIGHTS.q4kmFile.indexOf('unsloth/Qwen3.8-27B-GGUF') >= 0);
assert.ok(profile.WEIGHTS.q4kmDownload.indexOf('Qwen3.8-27B-Q4_K_M.gguf') >= 0);
assert.strictEqual(profile.WEIGHTS.serving, 'qwen3.8:27b-uncensored');
assert.ok(!/qwen3\.6/.test(profile.WEIGHTS.ollama));

console.log('ok ' + profile.DISTINCTIVE.length + ' distinctive clauses + Modelfile + HF Q4_K_M');
