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
assert.ok(/^FROM qwen3\.6:27b$/m.test(mf));
assert.ok(/PARAMETER num_ctx 8192/.test(mf));
assert.ok(/PARAMETER num_gpu 99/.test(mf));
assert.ok(profile.assertLocalSystem(mf).ok);
assert.ok(!/PARAMETER think/.test(mf));

console.log('ok ' + profile.DISTINCTIVE.length + ' distinctive clauses + Modelfile');
