import { ProjectShell, RoomData } from '../types';
import { tokenizeDxf } from './dxfParser';

interface ParsedEntity {
  type: 'LINE' | 'LWPOLYLINE';
  layer: string;
  closed: boolean;
  points: Array<{ x: number; y: number }>;
}

export interface SafeDxfShellResult {
  success: boolean;
  error?: string;
  rooms: RoomData[];
  shell?: ProjectShell;
  metadata: {
    unitCode: number;
    unitName: string;
    scaleToCm: number;
    entityCount: number;
    closedShellCount: number;
    layers: string[];
  };
}

const UNIT_SCALE_TO_CM: Record<number, { name: string; scale: number }> = {
  1: { name: 'inch', scale: 2.54 },
  2: { name: 'foot', scale: 30.48 },
  4: { name: 'mm', scale: 0.1 },
  5: { name: 'cm', scale: 1 },
  6: { name: 'm', scale: 100 },
};

const makeRoom = (name: string, width: number, length: number, fileName: string, layer: string, index: number): RoomData => ({
  id: `room-dxf-shell-${Date.now()}-${index}`,
  roomName: name,
  width: Math.round(width),
  length: Math.round(length),
  height: 280,
  ceilingDrop: 230,
  beamHeight: 265,
  wallThickness: 10,
  columns: [], beams: [], doors: [], windows: [], voiceMemos: [], electricalPoints: [], lightingPoints: [], virtualAnnotations: [], placedBlocks: [], furniture: [],
  lastUpdated: new Date().toISOString(),
  notes: ['DXF 几何已读取；只建立真实闭合边界，门窗、梁柱与净高仍待现场确认。'],
  sourceProvenance: { textEntities: [`source:${fileName}`, `layer:${layer}`], parsedEntityCount: 1 },
});

export function parseSafeDxfShells(content: string, fileName: string): SafeDxfShellResult {
  const tokens = tokenizeDxf(content);
  let unitCode = 0;
  let section = '';
  const entities: ParsedEntity[] = [];
  let current: ParsedEntity | null = null;
  let pendingX: number | null = null;

  const flush = () => {
    if (current && current.points.length >= 2) entities.push(current);
    current = null;
    pendingX = null;
  };

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.code === 0 && token.val === 'SECTION' && tokens[i + 1]?.code === 2) {
      flush(); section = tokens[i + 1].val.toUpperCase(); i += 1; continue;
    }
    if (token.code === 0 && token.val === 'ENDSEC') { flush(); section = ''; continue; }
    if (section === 'HEADER' && token.code === 9 && token.val === '$INSUNITS') {
      unitCode = Number(tokens[i + 1]?.val || 0); continue;
    }
    if (section !== 'ENTITIES') continue;
    if (token.code === 0) {
      flush();
      if (token.val === 'LINE' || token.val === 'LWPOLYLINE') current = { type: token.val, layer: '0', closed: false, points: [] };
      continue;
    }
    if (!current) continue;
    if (token.code === 8) current.layer = token.val || '0';
    if (token.code === 70 && current.type === 'LWPOLYLINE') current.closed = (Number(token.val) & 1) === 1;
    if (token.code === 10 || token.code === 11) pendingX = Number(token.val);
    if ((token.code === 20 || token.code === 21) && pendingX !== null) {
      current.points.push({ x: pendingX, y: Number(token.val) }); pendingX = null;
    }
  }
  flush();

  const unit = UNIT_SCALE_TO_CM[unitCode];
  if (!unit) return { success: false, error: `DXF 單位代碼 ${unitCode || '未設定'} 無法安全換算；請在 CAD 設定為 mm、cm、m、inch 或 foot 後重存。`, rooms: [], metadata: { unitCode, unitName: 'unknown', scaleToCm: 0, entityCount: entities.length, closedShellCount: 0, layers: [...new Set(entities.map((item) => item.layer))] } };

  const bounds = (entity: ParsedEntity) => {
    const xs = entity.points.map((point) => point.x * unit.scale);
    const ys = entity.points.map((point) => point.y * unit.scale);
    return { width: Math.max(...xs) - Math.min(...xs), length: Math.max(...ys) - Math.min(...ys) };
  };
  const closed = entities.filter((entity) => entity.type === 'LWPOLYLINE' && entity.closed).map((entity) => ({ entity, ...bounds(entity) })).filter((item) => item.width >= 100 && item.length >= 100 && item.width <= 5000 && item.length <= 5000);
  const uniqueClosed = closed.filter((item, index, all) => all.findIndex((candidate) => Math.abs(candidate.width - item.width) < 1 && Math.abs(candidate.length - item.length) < 1) === index);
  let rooms = uniqueClosed.slice(0, 20).map((item, index) => makeRoom(`DXF 闭合空间 ${index + 1}`, item.width, item.length, fileName, item.entity.layer, index));

  if (rooms.length === 0 && entities.length > 0) {
    const allPoints = entities.flatMap((entity) => entity.points);
    const xs = allPoints.map((point) => point.x * unit.scale);
    const ys = allPoints.map((point) => point.y * unit.scale);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    if (width >= 100 && length >= 100 && width <= 10000 && length <= 10000) rooms = [makeRoom('DXF 全图边界（待分房）', width, length, fileName, 'MULTI_LAYER', 0)];
  }

  const allScaled = entities.flatMap((entity) => entity.points.map((point) => ({ x: point.x * unit.scale, y: point.y * unit.scale })));
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of allScaled) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }
  if (allScaled.length === 0) minX = minY = maxX = maxY = 0;
  const normalize = (point: { x: number; y: number }) => ({ x: point.x * unit.scale - minX, y: maxY - point.y * unit.scale });
  const shell: ProjectShell | undefined = allScaled.length ? {
    id: `shell-${Date.now()}`,
    sourceFileName: fileName,
    sourceFormat: 'DXF',
    unitName: unit.name,
    scaleToCm: unit.scale,
    width: maxX - minX,
    length: maxY - minY,
    segments: entities.map((entity, index) => ({ id: `shell-seg-${index + 1}`, layer: entity.layer, entityType: entity.type, points: entity.points.map(normalize), closed: entity.closed })),
    zones: uniqueClosed.slice(0, 50).map((item, index) => ({ id: `zone-${index + 1}`, name: `空間 ${index + 1}`, polygon: item.entity.points.map(normalize), sourceLayer: item.entity.layer })),
    importedAt: new Date().toISOString(),
  } : undefined;

  return { success: Boolean(shell), error: shell ? undefined : '沒有找到可回讀的向量圖元。', rooms, shell, metadata: { unitCode, unitName: unit.name, scaleToCm: unit.scale, entityCount: entities.length, closedShellCount: uniqueClosed.length, layers: [...new Set(entities.map((item) => item.layer))] } };
}
