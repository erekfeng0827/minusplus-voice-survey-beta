import assert from 'node:assert/strict';
import { cabinetCommandToFurniture, parseCabinetCommand } from './AutoSpaceLayoutModal';

const example = parseCabinetCommand('右墙衣柜从墙到墙做满，深60，高240，分14格');
assert.equal(example.ok, true);
if (example.ok) {
  const item = cabinetCommandToFurniture(example.value, { id: 'room-test', width: 400, length: 500 }, 'wardrobe-test');
  assert.deepEqual(
    { x: item.x, y: item.y, width: item.width, depth: item.depth, height: item.height },
    { x: 340, y: 0, width: 60, depth: 500, height: 240 },
  );
  assert.match(item.specNote ?? '', /分格:14/);
}

const explicitWidth = parseCabinetCommand('北墙衣柜 宽275 深55 高225 分5格');
assert.equal(explicitWidth.ok, true);
if (explicitWidth.ok) {
  const item = cabinetCommandToFurniture(explicitWidth.value, { id: 'room-test', width: 400, length: 500 }, 'wardrobe-explicit');
  assert.deepEqual({ x: item.x, y: item.y, width: item.width, depth: item.depth }, { x: 0, y: 0, width: 275, depth: 55 });
}

const missing = parseCabinetCommand('衣柜做满，深60');
assert.equal(missing.ok, false);
if (!missing.ok) {
  assert.deepEqual(missing.missing, ['墙位（上/下/左/右或东/南/西/北墙）', '高度', '分格数']);
}

console.log('AutoSpaceLayoutModal cabinet command logic: 3 cases passed');
