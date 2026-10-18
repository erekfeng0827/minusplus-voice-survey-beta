import assert from 'node:assert/strict';
import { FurnitureItem, PlacedBlockItem } from '../types';
import { removeLinkedFurniture, syncFurnitureFromPlacedBlocks } from './placedBlockFurnitureSync';

const furniture: FurnitureItem[] = [
  { id: 'f-1', name: '衣櫃', category: 'wardrobe', x: 0, y: 0, width: 60, depth: 45, height: 240, elevation: 0 },
  { id: 'f-2', name: '衣櫃', category: 'wardrobe', x: 100, y: 100, width: 60, depth: 45, height: 240, elevation: 0 },
];
const blocks: PlacedBlockItem[] = [{ id: 'b-1', furnitureId: 'f-1', blockId: 'wardrobe', name: '衣櫃', category: 'furniture', subCategory: 'wardrobe', x: 25, y: 35, widthCm: 45, depthCm: 60, heightCm: 240, elevationCm: 0, cadLayer: 'A-FURN', rotationDeg: 90 }];

const synced = syncFurnitureFromPlacedBlocks(furniture, blocks);
assert.deepEqual({ x: synced[0].x, y: synced[0].y, width: synced[0].width, depth: synced[0].depth, rotationY: synced[0].rotationY }, { x: 25, y: 35, width: 45, depth: 60, rotationY: 90 });
assert.equal(synced[1].x, 100, 'unlinked same-name furniture must remain unchanged');
assert.deepEqual(removeLinkedFurniture(furniture, blocks[0]).map((item) => item.id), ['f-2']);
assert.equal(removeLinkedFurniture(furniture, { ...blocks[0], furnitureId: undefined }).length, 2, 'legacy unlinked block must not delete by name');
console.log('placed block furniture sync logic test passed');
