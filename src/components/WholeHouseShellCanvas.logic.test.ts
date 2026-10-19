import assert from 'node:assert/strict';
import { deleteProjectShellSegment, updateProjectShellPoint } from './WholeHouseShellCanvas';
import type { ProjectShell } from '../types';

const shell: ProjectShell = {
  id: 'shell-1', sourceFileName: 'test.dxf', sourceFormat: 'DXF', unitName: 'cm', scaleToCm: 1,
  width: 500, length: 400, importedAt: '2026-10-19T00:00:00Z', zones: [],
  segments: [
    { id: 's1', layer: 'A-WALL', entityType: 'LINE', points: [{ x: 10, y: 20 }, { x: 100, y: 20 }], closed: false },
    { id: 's2', layer: 'A-DOOR', entityType: 'LINE', points: [{ x: 50, y: 50 }, { x: 80, y: 50 }], closed: false },
  ],
};

const moved = updateProjectShellPoint(shell, 's1', 1, 'x', 125);
assert.equal(moved.segments[0].points[1].x, 125);
assert.equal(shell.segments[0].points[1].x, 100, 'must not mutate imported source state');
assert.equal(updateProjectShellPoint(shell, 's1', 0, 'y', -10).segments[0].points[0].y, 0, 'coordinates are clamped inside editable canvas');
assert.deepEqual(deleteProjectShellSegment(shell, 's1').segments.map((item) => item.id), ['s2']);
console.log('WholeHouseShellCanvas editable geometry: PASS');
