import assert from 'node:assert/strict';
import { appendProjectShellSegment, deleteProjectShellSegment, findFurnitureCollisions, polygonsOverlap, updateProjectShellPoint, wholeHouseFurniturePolygons } from './WholeHouseShellCanvas';
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
const appended = appendProjectShellSegment(shell, { x: 10, y: 20 }, { x: 30, y: 40 });
assert.equal(appended.segments.length, 3);
assert.deepEqual(appended.segments[2].points, [{ x: 10, y: 20 }, { x: 30, y: 40 }]);
const roomWithFurniture = { id: 'room-1', roomName: '客厅', width: 400, length: 500, height: 280, ceilingDrop: 230, beamHeight: 265, wallThickness: 15, columns: [], beams: [], doors: [], windows: [], voiceMemos: [], electricalPoints: [], lightingPoints: [], virtualAnnotations: [], furniture: [], lastUpdated: new Date().toISOString(), placedBlocks: [{ id: 'sofa', blockId: 'sofa', name: '沙发', category: 'furniture' as const, subCategory: 'sofa', x: 10, y: 20, widthCm: 100, depthCm: 50, heightCm: 80, elevationCm: 0, cadLayer: 'FURNITURE', colorIndex: 3, rotationDeg: 0, snappedTo: 'test', tags: [], placedAt: new Date().toISOString() }] };
const polygons = wholeHouseFurniturePolygons([roomWithFurniture], [{ roomId: 'room-1', roomName: '客厅', x: 500, y: 100, rotation: 0, width: 400, length: 500, effectiveWidth: 400, effectiveLength: 500, color: '#fff', isBaseRoom: true, sharedWalls: [] }]);
assert.deepEqual(polygons[0].points[0], { x: 510, y: 120 });
assert.deepEqual(polygons[0].points[2], { x: 610, y: 170 });
assert.equal(polygonsOverlap(polygons[0].points, [{ x: 600, y: 150 }, { x: 700, y: 150 }, { x: 700, y: 250 }, { x: 600, y: 250 }]), true);
assert.equal(polygonsOverlap(polygons[0].points, [{ x: 700, y: 300 }, { x: 800, y: 300 }, { x: 800, y: 400 }, { x: 700, y: 400 }]), false);
assert.deepEqual([...findFurnitureCollisions([polygons[0], { ...polygons[0], id: 'other', points: polygons[0].points.map((point) => ({ x: point.x + 20, y: point.y })) }])].sort(), ['other', polygons[0].id].sort());
console.log('WholeHouseShellCanvas editable geometry: PASS');
