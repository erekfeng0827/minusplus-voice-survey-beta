import { Door, RoomData, StitchedFloorPlanResult, StitchedRoomPlacement, WindowOpening } from '../types';
import { getWallThickness } from './wallUtils';
import { rotatePoint } from './multiRoomStitcher';

type Opening = { start: number; end: number; bottom: number; top: number };

function face(layer: string, points: Array<[number, number, number]>, placement?: Pick<StitchedRoomPlacement, 'x' | 'y' | 'rotation'>): string {
  const p = points.map(([x, y, z]) => {
    const rotated = placement ? rotatePoint(x, y, placement.rotation) : { x, y };
    return [((placement?.x || 0) + rotated.x) * 10, ((placement?.y || 0) + rotated.y) * 10, z * 10];
  });
  return `0\n3DFACE\n8\n${layer}\n10\n${p[0][0]}\n20\n${p[0][1]}\n30\n${p[0][2]}\n11\n${p[1][0]}\n21\n${p[1][1]}\n31\n${p[1][2]}\n12\n${p[2][0]}\n22\n${p[2][1]}\n32\n${p[2][2]}\n13\n${p[3][0]}\n23\n${p[3][1]}\n33\n${p[3][2]}\n`;
}

function box(layer: string, x: number, y: number, z: number, width: number, depth: number, height: number, placement?: Pick<StitchedRoomPlacement, 'x' | 'y' | 'rotation'>): string {
  const x2 = x + width; const y2 = y + depth; const z2 = z + height;
  return face(layer, [[x,y,z],[x2,y,z],[x2,y2,z],[x,y2,z]], placement)
    + face(layer, [[x,y,z2],[x,y2,z2],[x2,y2,z2],[x2,y,z2]], placement)
    + face(layer, [[x,y,z],[x,y,z2],[x2,y,z2],[x2,y,z]], placement)
    + face(layer, [[x,y2,z],[x2,y2,z],[x2,y2,z2],[x,y2,z2]], placement)
    + face(layer, [[x,y,z],[x,y2,z],[x,y2,z2],[x,y,z2]], placement)
    + face(layer, [[x2,y,z],[x2,y,z2],[x2,y2,z2],[x2,y2,z]], placement);
}

function wallName(wall: string): 'top' | 'bottom' | 'left' | 'right' {
  if (wall === 'north') return 'top'; if (wall === 'south') return 'bottom';
  if (wall === 'west') return 'left'; if (wall === 'east') return 'right';
  return wall as 'top' | 'bottom' | 'left' | 'right';
}

function openingsForWall(room: RoomData, wall: 'top' | 'bottom' | 'left' | 'right'): Opening[] {
  const doors = (room.doors || []).filter((item: Door) => wallName(item.wall) === wall)
    .map((item) => ({ start: item.offset, end: item.offset + item.width, bottom: 0, top: item.height }));
  const windows = (room.windows || []).filter((item: WindowOpening) => wallName(item.wall) === wall)
    .map((item) => ({ start: item.offset, end: item.offset + item.width, bottom: item.sillHeight, top: item.sillHeight + item.height }));
  return [...doors, ...windows];
}

function wallWithOpenings(room: RoomData, wall: 'top' | 'bottom' | 'left' | 'right', placement?: Pick<StitchedRoomPlacement, 'x' | 'y' | 'rotation'>): string {
  const horizontal = wall === 'top' || wall === 'bottom';
  const length = horizontal ? room.width : room.length;
  const height = room.height;
  const thickness = getWallThickness(room, wall === 'top' ? 'north' : wall === 'bottom' ? 'south' : wall === 'left' ? 'west' : 'east');
  const openings = openingsForWall(room, wall).map((opening) => ({
    start: Math.max(0, Math.min(length, opening.start)), end: Math.max(0, Math.min(length, opening.end)),
    bottom: Math.max(0, Math.min(height, opening.bottom)), top: Math.max(0, Math.min(height, opening.top)),
  }));
  const alongCuts = [...new Set([0, length, ...openings.flatMap((item) => [item.start, item.end])])].sort((a,b) => a-b);
  const heightCuts = [...new Set([0, height, ...openings.flatMap((item) => [item.bottom, item.top])])].sort((a,b) => a-b);
  let output = '';
  for (let ai = 0; ai < alongCuts.length - 1; ai += 1) for (let zi = 0; zi < heightCuts.length - 1; zi += 1) {
    const start = alongCuts[ai]; const end = alongCuts[ai + 1]; const bottom = heightCuts[zi]; const top = heightCuts[zi + 1];
    if (end <= start || top <= bottom) continue;
    const alongMid = (start + end) / 2; const zMid = (bottom + top) / 2;
    if (openings.some((item) => alongMid > item.start && alongMid < item.end && zMid > item.bottom && zMid < item.top)) continue;
    if (horizontal) output += box('A-WALL', start, wall === 'top' ? 0 : room.length - thickness, bottom, end - start, thickness, top - bottom, placement);
    else output += box('A-WALL', wall === 'left' ? 0 : room.width - thickness, start, bottom, thickness, end - start, top - bottom, placement);
  }
  return output;
}

export function generateStructuralWhiteModelDxf(room: RoomData): string {
  const layers = ['A-SLAB', 'A-WALL', 'S-COL', 'S-BEAM', 'A-FURN', 'A-STAIR'];
  let dxf = '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';
  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${layers.length}\n`;
  layers.forEach((layer, index) => { dxf += `0\nLAYER\n2\n${layer}\n70\n0\n62\n${[8,7,1,1,3,6][index]}\n6\nCONTINUOUS\n`; });
  dxf += '0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
  dxf += box('A-SLAB', 0, 0, -10, room.width, room.length, 10);
  (['top','bottom','left','right'] as const).forEach((wall) => { dxf += wallWithOpenings(room, wall); });
  (room.columns || []).forEach((item) => { dxf += box('S-COL', item.x ?? 0, item.y ?? 0, 0, item.width, item.depth, item.height ?? room.height); });
  (room.beams || []).forEach((item) => {
    const beamHeight = Math.max(1, room.height - item.clearHeight);
    if (item.orientation === 'vertical') dxf += box('S-BEAM', item.x ?? 0, item.y ?? 0, item.clearHeight, item.width, item.depth || room.length, beamHeight);
    else dxf += box('S-BEAM', item.x ?? 0, item.y, item.clearHeight, item.depth || room.width, item.width, beamHeight);
  });
  (room.placedBlocks || []).forEach((item) => {
    const layer = item.subCategory.startsWith('stair:') ? 'A-STAIR' : 'A-FURN';
    dxf += box(layer, item.x, item.y, item.elevationCm || 0, item.widthCm, item.depthCm, item.heightCm || 10);
  });
  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

function roomStructuralEntities(room: RoomData, placement: Pick<StitchedRoomPlacement, 'x' | 'y' | 'rotation'>): string {
  let output = box('A-SLAB', 0, 0, -10, room.width, room.length, 10, placement);
  (['top','bottom','left','right'] as const).forEach((wall) => { output += wallWithOpenings(room, wall, placement); });
  (room.columns || []).forEach((item) => { output += box('S-COL', item.x ?? 0, item.y ?? 0, 0, item.width, item.depth, item.height ?? room.height, placement); });
  (room.beams || []).forEach((item) => {
    const beamHeight = Math.max(1, room.height - item.clearHeight);
    if (item.orientation === 'vertical') output += box('S-BEAM', item.x ?? 0, item.y ?? 0, item.clearHeight, item.width, item.depth || room.length, beamHeight, placement);
    else output += box('S-BEAM', item.x ?? 0, item.y, item.clearHeight, item.depth || room.width, item.width, beamHeight, placement);
  });
  (room.placedBlocks || []).forEach((item) => {
    const layer = item.subCategory.startsWith('stair:') ? 'A-STAIR' : 'A-FURN';
    output += box(layer, item.x, item.y, item.elevationCm || 0, item.widthCm, item.depthCm, item.heightCm || 10, placement);
  });
  return output;
}

export function generateFullProjectStructuralWhiteModelDxf(rooms: RoomData[], stitched: StitchedFloorPlanResult): string {
  const layers = ['A-SLAB', 'A-WALL', 'S-COL', 'S-BEAM', 'A-FURN', 'A-STAIR'];
  let dxf = '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';
  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${layers.length}\n`;
  layers.forEach((layer, index) => { dxf += `0\nLAYER\n2\n${layer}\n70\n0\n62\n${[8,7,1,1,3,6][index]}\n6\nCONTINUOUS\n`; });
  dxf += '0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
  for (const placement of stitched.placements) {
    const room = rooms.find((candidate) => candidate.id === placement.roomId);
    if (room) dxf += roomStructuralEntities(room, placement);
  }
  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

export function downloadStructuralWhiteModelDxf(room: RoomData): void {
  const blob = new Blob([generateStructuralWhiteModelDxf(room)], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `MINUSPLUS_${room.roomName.replace(/\s+/g, '_')}_結構白模_mm.dxf`;
  document.body.appendChild(anchor); anchor.click(); document.body.removeChild(anchor); URL.revokeObjectURL(url);
}

export function downloadFullProjectStructuralWhiteModelDxf(rooms: RoomData[], stitched: StitchedFloorPlanResult, projectName: string): void {
  const blob = new Blob([generateFullProjectStructuralWhiteModelDxf(rooms, stitched)], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `${projectName.replace(/[\\/:*?"<>|\s]+/g, '_')}_全案結構白模_mm.dxf`;
  document.body.appendChild(anchor); anchor.click(); document.body.removeChild(anchor); URL.revokeObjectURL(url);
}
