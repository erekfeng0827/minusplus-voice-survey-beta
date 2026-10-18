import { strict as assert } from 'node:assert';
import { parseSafeDxfShells } from './safeDxfShellImporter';

const dxf = `0
SECTION
2
HEADER
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
ENTITIES
0
LWPOLYLINE
8
A-WALL
70
1
10
0
20
0
10
4500
20
0
10
4500
20
14000
10
0
20
14000
0
ENDSEC
0
EOF`;

const result = parseSafeDxfShells(dxf, 'townhouse.dxf');
assert.equal(result.success, true);
assert.equal(result.metadata.unitName, 'mm');
assert.equal(result.rooms.length, 1);
assert.equal(result.rooms[0].width, 450);
assert.equal(result.rooms[0].length, 1400);
assert.equal(result.rooms[0].doors.length, 0);
assert.equal(result.rooms[0].beams.length, 0);
assert.ok(result.shell, 'must preserve a continuous whole-house shell');
assert.equal(result.shell?.width, 450);
assert.equal(result.shell?.length, 1400);
assert.equal(result.shell?.segments.length, 1);
assert.equal(result.shell?.zones.length, 1);
assert.deepEqual(result.shell?.segments[0].points[0], { x: 0, y: 1400 });

const unitless = parseSafeDxfShells(dxf.replace('$INSUNITS\n70\n4', '$INSUNITS\n70\n0'), 'unitless.dxf');
assert.equal(unitless.success, false);
assert.match(unitless.error || '', /單位代碼/);

console.log('Safe DXF shell importer: PASS');
