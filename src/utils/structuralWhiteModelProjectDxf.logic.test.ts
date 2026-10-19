import { generateFullProjectStructuralWhiteModelDxf } from './structuralWhiteModelDxf';
import { RoomData, StitchedFloorPlanResult } from '../types';

const rooms = [
  { id: 'r1', roomName: '客廳', width: 400, length: 500, height: 280, doors: [], windows: [], beams: [], columns: [], placedBlocks: [] },
  { id: 'r2', roomName: '臥室', width: 300, length: 350, height: 280, doors: [], windows: [], beams: [], columns: [], placedBlocks: [] },
] as unknown as RoomData[];

const stitched = {
  placements: [
    { roomId: 'r1', roomName: '客廳', x: 0, y: 0, rotation: 0, width: 400, length: 500, effectiveWidth: 400, effectiveLength: 500, color: '#fff', isBaseRoom: true, sharedWalls: [] },
    { roomId: 'r2', roomName: '臥室', x: 400, y: 0, rotation: 90, width: 300, length: 350, effectiveWidth: 350, effectiveLength: 300, color: '#fff', isBaseRoom: false, sharedWalls: [] },
  ],
  boundingBox: { minX: 0, minY: 0, maxX: 750, maxY: 500, totalWidth: 750, totalLength: 500 },
  totalAreaM2: 30.5, totalAreaPing: 9.23, pairedDoorsCount: 0, unpairedDoorsCount: 0, sharedWallCount: 0, auditNotes: [],
} as StitchedFloorPlanResult;

const dxf = generateFullProjectStructuralWhiteModelDxf(rooms, stitched);
if ((dxf.match(/0\n3DFACE\n/g) || []).length < 60) throw new Error('全案白模未包含兩個空間的樓板與牆體');
if (!dxf.includes('10\n4000\n20\n0\n30\n-100')) throw new Error('第二空間沒有依拼接座標輸出');
if (!dxf.includes('$INSUNITS\n70\n4')) throw new Error('全案白模不是毫米制');
console.log('structuralWhiteModelProjectDxf.logic.test passed');
