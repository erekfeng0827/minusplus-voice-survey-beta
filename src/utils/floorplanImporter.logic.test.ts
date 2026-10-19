import { strict as assert } from 'node:assert';
import { createDefaultRoomScaffold, parseDxfFloorplan } from './floorplanImporter';

const empty = createDefaultRoomScaffold('空白导入');
assert.equal(empty.doors.length, 0);
assert.equal(empty.windows.length, 0);
assert.equal(empty.beams.length, 0);
assert.equal(empty.electricalPoints.length, 0);

const dxf = `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n5\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nA-WALL\n10\n0\n20\n0\n11\n400\n21\n0\n0\nLINE\n8\nA-WALL\n10\n400\n20\n0\n11\n400\n21\n500\n0\nENDSEC\n0\nEOF`;
const parsed = parseDxfFloorplan(dxf, 'truthful.dxf', false);
assert.equal(parsed.room.doors.length, 0);
assert.equal(parsed.room.windows.length, 0);
assert.equal(parsed.room.beams.length, 0);
assert.equal(parsed.metadata.doorsDetected, 0);
assert.match(parsed.metadata.message, /未自动生成门窗、梁柱/);

console.log('floorplan importer truthfulness test passed');
