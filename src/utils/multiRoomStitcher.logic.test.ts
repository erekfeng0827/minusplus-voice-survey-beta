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

const result = calculateStitchedFloorPlan([living, bedroom], living.id, 15, 'door_anchored');
assert.equal(result.placements.length, 2);
assert.equal(result.pairedDoorsCount, 1);
assert.equal(result.sharedWallCount, 1);
assert.equal(result.zeroCollisionVerified, true);
assert.equal(result.totalCoincidentWallLength, 90);
assert.ok(result.boundingBox.totalWidth > living.width);
assert.ok(result.boundingBox.totalLength >= living.length);

const dxf = generateFullHouseDxfString([living, bedroom], result, 'stitch-test');
assert.match(dxf, /\$INSUNITS/);
assert.match(dxf, /全室總面寬/);
assert.match(dxf, /\[門片A\]/);

console.log('Multi-room stitcher: PASS');
