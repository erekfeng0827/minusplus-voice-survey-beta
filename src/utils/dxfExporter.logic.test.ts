import assert from 'node:assert/strict';
import { RoomData } from '../types';
import { buildAppParametricBlocks, generateDxfString, generateSketchUpDxfString } from './dxfExporter';

const room: RoomData = {
  id: 'dxf-room', roomName: '450x1400 測試空間', width: 450, length: 1400, height: 280,
  ceilingDrop: 230, beamHeight: 265, bathKitchenDrop: 215, wallThickness: 15,
  evaluation: { score: 0, clarity: '', missingElements: [], rule5MultiplePassed: true, suggestions: '' },
  beams: [], doors: [], windows: [{ id: 'east-window', name: '東窗', width: 120, height: 120, sillHeight: 90, wall: 'east', offset: 200 }],
  columns: [{ id: 'c1', name: 'C1', width: 50, depth: 40, x: 20, y: 30, positionType: 'free', corner: 'top-left', wall: 'north', offset: 0 }],
  placedBlocks: [{ id: 'stair-1', blockId: 'stair-l', name: 'L型梯', category: 'detail_joint', subCategory: 'stair:l', x: 100, y: 300, widthCm: 180, depthCm: 220, cadLayer: 'A-STAIR', rotationDeg: 90, tags: ['risers:17', 'verification:APP_PARAMETRIC_ONLY'] }],
  voiceMemos: [], electricalPoints: [], lastUpdated: '',
};

for (const dxf of [generateDxfString(room), generateSketchUpDxfString(room)]) {
  assert.match(dxf, /\$INSUNITS\n70\n4/, 'DXF must declare millimeters');
  assert.match(dxf, /11\n4500\.00\n21\n0\.00/, '450cm wall must be written as 4500mm');
  assert.ok(!dxf.includes('V-01~V-10 PASSED'), 'generated file must not claim unverified certification');
}
const planDxf = generateDxfString(room);
assert.match(planDxf, /2\nSTRUCT_COLUMN\n/, 'column layer must exist');
assert.match(planDxf, /2\nSTAIR\n/, 'stair layer must exist');
assert.match(planDxf, /10\n4500\.00\n20\n2000\.00/, 'east wall window must be exported on x=4500mm at y=2000mm');
const appBlocks = buildAppParametricBlocks(room);
assert.equal(appBlocks.names.length, 1);
assert.match(appBlocks.blocks, /0\nBLOCK\n/);
assert.match(appBlocks.blocks, /APP_PARAMETRIC_ONLY/);
assert.match(appBlocks.inserts, /0\nINSERT\n/);
assert.match(planDxf, /2\nBLOCKS[\s\S]*0\nINSERT\n/);
console.log('DXF unit and truth-label test passed');
