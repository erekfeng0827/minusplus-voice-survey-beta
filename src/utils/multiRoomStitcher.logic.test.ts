import { strict as assert } from 'node:assert';
import { RoomData } from '../types';
import { calculateStitchedFloorPlan, generateFullHouseDxfString } from './multiRoomStitcher';

const base = (id: string, name: string): RoomData => ({
  id, roomName: name, width: 400, length: 500, height: 280, ceilingDrop: 230, beamHeight: 265, wallThickness: 15,
  columns: [], beams: [], windows: [], voiceMemos: [], electricalPoints: [], placedBlocks: [], furniture: [], lastUpdated: new Date().toISOString(), doors: [],
});

const living = base('living', '客厅');
living.doors = [{ id: 'living-A', name: '通道 A', width: 90, height: 210, wall: 'right', offset: 180, anchorTag: 'A' }];
const bedroom = base('bedroom', '卧室');
bedroom.width = 300;
bedroom.length = 360;
bedroom.doors = [{ id: 'bed-A', name: '通道 A', width: 90, height: 210, wall: 'left', offset: 120, anchorTag: 'A' }];
living.placedBlocks = [{ id: 'sofa-1', blockId: 'sofa', name: '沙发', category: 'furniture', subCategory: 'sofa', x: 50, y: 60, widthCm: 200, depthCm: 90, heightCm: 80, elevationCm: 0, cadLayer: 'FURNITURE', colorIndex: 3, rotationDeg: 0, snappedTo: 'test', tags: [], placedAt: new Date().toISOString() }];

const result = calculateStitchedFloorPlan([living, bedroom], living.id, 15, 'door_anchored');
assert.equal(result.placements.length, 2);
assert.equal(result.pairedDoorsCount, 1);
assert.equal(result.sharedWallCount, 1);
assert.equal(result.zeroCollisionVerified, true);
assert.equal(result.totalCoincidentWallLength, 90);
assert.ok(result.boundingBox.totalWidth > living.width);
assert.ok(result.boundingBox.totalLength >= living.length);

const dxf = generateFullHouseDxfString([living, bedroom], result, 'stitch-test', {
  id: 'shell-test', sourceFileName: 'shell.dxf', sourceFormat: 'DXF', unitName: 'cm', scaleToCm: 1, width: 700, length: 500,
  segments: [{ id: 'wall-1', layer: 'WALL', entityType: 'LINE', points: [{ x: 10, y: 20 }, { x: 110, y: 20 }], closed: false }], zones: [], importedAt: new Date().toISOString(),
});
assert.match(dxf, /\$INSUNITS/);
assert.match(dxf, /全室總面寬/);
assert.match(dxf, /\[門片A\]/);
assert.match(dxf, /IMPORTED_SHELL/);
assert.match(dxf, /SOURCE_SHELL:shell.dxf/);
assert.match(dxf, /FURNITURE/);
assert.match(dxf, /沙发 200x90cm/);
assert.match(dxf, /10\n100\.0\n20\n200\.0/, 'shell coordinates must be exported as cm x10 millimeters');

console.log('Multi-room stitcher: PASS');
