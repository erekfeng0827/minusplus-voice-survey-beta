import assert from 'node:assert/strict';
import type { RoomData } from '../types';
import { calculateQuotationMetrics } from './QuotationEstimatorModal';

const room: RoomData = {
  id: 'room', roomName: '测试空间', width: 400, length: 500, height: 280, ceilingDrop: 230, beamHeight: 265, wallThickness: 15,
  columns: [], beams: [], voiceMemos: [], electricalPoints: [], lightingPoints: [], virtualAnnotations: [], furniture: [], lastUpdated: new Date().toISOString(),
  doors: [{ id: 'd', name: '门', width: 90, height: 210, wall: 'left', offset: 30 }], windows: [{ id: 'w', name: '窗', width: 120, height: 120, sillHeight: 90, wall: 'top', offset: 40 }],
  placedBlocks: [
    { id: 'cab', blockId: 'cab', name: '衣柜', category: 'furniture', subCategory: 'wardrobe', x: 0, y: 0, widthCm: 240, depthCm: 60, heightCm: 240, elevationCm: 0, cadLayer: 'FURNITURE', colorIndex: 3, rotationDeg: 0, snappedTo: 'test', tags: [], placedAt: new Date().toISOString() },
    { id: 'stair', blockId: 'stair', name: 'L型楼梯', category: 'furniture', subCategory: 'stair:l', x: 0, y: 100, widthCm: 180, depthCm: 300, heightCm: 280, elevationCm: 0, cadLayer: 'STAIR', colorIndex: 6, rotationDeg: 0, snappedTo: 'test', tags: [], placedAt: new Date().toISOString() },
  ],
};
assert.deepEqual(calculateQuotationMetrics([room]), { cabinetRunMeters: 2.4, cabinetBlockCount: 1, stairSetCount: 1, openingCount: 2 });
console.log('quotation data interface: PASS');
