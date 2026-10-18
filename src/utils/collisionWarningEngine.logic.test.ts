import assert from 'node:assert/strict';
import { Door, FurnitureItem, RoomData } from '../types';
import { checkCollisionAndContractCompliance, getDoorSwingBounds } from './collisionWarningEngine';

const baseRoom: RoomData = {
  id: 'r1', roomName: '測試空間', width: 400, length: 500, height: 280,
  ceilingDrop: 230, beamHeight: 265, bathKitchenDrop: 215, wallThickness: 15,
  evaluation: { score: 0, clarity: '', missingElements: [], rule5MultiplePassed: true, suggestions: '' },
  beams: [], doors: [], windows: [], voiceMemos: [], electricalPoints: [], lastUpdated: '',
};
const walls: Door['wall'][] = ['top', 'bottom', 'left', 'right'];
for (const wall of walls) {
  const door: Door = { id: `d-${wall}`, name: `${wall}門`, width: 90, height: 210, wall, offset: 100 };
  const bounds = getDoorSwingBounds(baseRoom, door);
  const item: FurnitureItem = { id: `f-${wall}`, name: '測試櫃', category: 'cabinet', x: bounds.minX + 5, y: bounds.minY + 5, width: 30, depth: 30, height: 100, elevation: 0 };
  const issues = checkCollisionAndContractCompliance({ ...baseRoom, doors: [door] }, [item]);
  assert.equal(issues.filter((issue) => issue.collisionType === 'DOOR_SWING_BLOCKAGE').length, 1, `${wall} wall must detect door swing blockage`);
}
const clearDoor: Door = { id: 'clear', name: '上牆門', width: 90, height: 210, wall: 'top', offset: 100 };
const clearItem: FurnitureItem = { id: 'clear-item', name: '遠端櫃', category: 'cabinet', x: 300, y: 300, width: 40, depth: 40, height: 100, elevation: 0 };
assert.equal(checkCollisionAndContractCompliance({ ...baseRoom, doors: [clearDoor] }, [clearItem]).filter((issue) => issue.collisionType === 'DOOR_SWING_BLOCKAGE').length, 0);
console.log('collision warning engine four-wall door swing test passed');
