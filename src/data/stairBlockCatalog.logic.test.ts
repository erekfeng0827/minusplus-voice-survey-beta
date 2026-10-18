import assert from 'node:assert/strict';
import { detectStairType, STAIR_BLOCK_CATALOG } from './stairBlockCatalog';

assert.equal(detectStairType('右牆直梯，寬90'), 'straight');
assert.equal(detectStairType('左牆 L 型梯，右轉'), 'l_shape');
assert.equal(detectStairType('北牆 U型梯，左轉'), 'u_shape');
assert.equal(detectStairType('南牆旋轉梯，直徑160'), 'spiral');

const definitions = Object.values(STAIR_BLOCK_CATALOG);
assert.equal(definitions.length, 4);
assert.equal(new Set(definitions.map((item) => item.blockId)).size, 4);
assert.ok(definitions.every((item) => item.requiredParameters.length >= 3));
assert.ok(definitions.every((item) => item.verificationStatus === 'APP_PARAMETRIC_ONLY'));

console.log('Stair block catalog logic: 8 checks passed');
