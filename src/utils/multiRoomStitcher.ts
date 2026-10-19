import { RoomData, Door, ProjectShell, StitchedRoomPlacement, StitchedFloorPlanResult } from '../types';

export interface StitchGraphNode {
  room: RoomData;
  placement?: StitchedRoomPlacement;
}

export interface WallElevationDetail {
  orientation: 'north' | 'south' | 'east' | 'west';
  name: string; // e.g. "北面牆 (上)"
  wallKey: 'top' | 'bottom' | 'right' | 'left';
  widthCm: number;
  heightCm: number;
  grossAreaM2: number;
  grossAreaPing: number;
  openings: {
    type: 'door' | 'window';
    name: string;
    widthCm: number;
    heightCm: number;
    areaM2: number;
    areaPing: number;
  }[];
  deductionsM2: number;
  deductionsPing: number;
  netAreaM2: number;
  netAreaPing: number;
  beamNotes: string[];
}

export interface RoomAreaAndWallCalculation {
  roomId: string;
  roomName: string;
  floorWidthCm: number;
  floorLengthCm: number;
  clearHeightCm: number;
  floorAreaM2: number;
  floorAreaPing: number;
  walls: {
    north: WallElevationDetail;
    south: WallElevationDetail;
    east: WallElevationDetail;
    west: WallElevationDetail;
  };
  totalWallGrossAreaM2: number;
  totalWallGrossAreaPing: number;
  totalWallDeductionsM2: number;
  totalWallDeductionsPing: number;
  totalWallNetAreaM2: number;
  totalWallNetAreaPing: number;
}

export interface FullProjectAreaSummary {
  totalFloorAreaM2: number;
  totalFloorAreaPing: number;
  totalWallGrossAreaM2: number;
  totalWallGrossAreaPing: number;
  totalWallDeductionsM2: number;
  totalWallDeductionsPing: number;
  totalWallNetAreaM2: number;
  totalWallNetAreaPing: number;
  roomCalculations: RoomAreaAndWallCalculation[];
}

// 臺灣專用坪數換算常數 (1 m² = 0.3025 坪, 1 坪 = 3.305785 m²)
export const M2_TO_PING = 0.3025;
export const PING_TO_M2 = 3.305785;

/**
 * 計算單一空間的平面積 (米平方 m² 與 臺灣專用坪數)
 */
export function calculateRoomFloorArea(room: RoomData): { areaM2: number; areaPing: number } {
  const areaCm2 = (room.width || 0) * (room.length || 0);
  const areaM2 = Number((areaCm2 / 10000).toFixed(2));
  const areaPing = Number((areaM2 * M2_TO_PING).toFixed(2));
  return { areaM2, areaPing };
}

/**
 * 計算單一空間 4 個面向（北/上、南/下、東/右、西/左）的立面牆面工程面積
 * 包含：毛面積、門窗開口扣除、淨施作面積 (m² 與 臺灣專用坪數)
 */
export function calculateRoom4WallsArea(room: RoomData): RoomAreaAndWallCalculation {
  const height = room.height || 280;
  const { areaM2: floorAreaM2, areaPing: floorAreaPing } = calculateRoomFloorArea(room);

  // 定義 4 個面向之牆面寬度 (北/南為 room.width，東/西為 room.length)
  const wallDefs: { orientation: 'north' | 'south' | 'east' | 'west'; name: string; wallKey: 'top' | 'bottom' | 'right' | 'left'; width: number }[] = [
    { orientation: 'north', name: '北面牆 (上牆面)', wallKey: 'top', width: room.width || 0 },
    { orientation: 'south', name: '南面牆 (下牆面)', wallKey: 'bottom', width: room.width || 0 },
    { orientation: 'east', name: '東面牆 (右牆面)', wallKey: 'right', width: room.length || 0 },
    { orientation: 'west', name: '西面牆 (左牆面)', wallKey: 'left', width: room.length || 0 },
  ];

  const wallsResult: any = {};
  let totalGrossM2 = 0;
  let totalDeductionsM2 = 0;

  wallDefs.forEach((def) => {
    const grossCm2 = def.width * height;
    const grossAreaM2 = Number((grossCm2 / 10000).toFixed(2));
    const grossAreaPing = Number((grossAreaM2 * M2_TO_PING).toFixed(2));

    const openings: {
      type: 'door' | 'window';
      name: string;
      widthCm: number;
      heightCm: number;
      areaM2: number;
      areaPing: number;
    }[] = [];

    // 尋找落在該面向的門
    if (room.doors) {
      room.doors.forEach((d) => {
        const isMatch = d.wall === def.wallKey ||
          ((d.wall === 'north' || d.wall === 'top') && (def.wallKey === 'top')) ||
          ((d.wall === 'south' || d.wall === 'bottom') && (def.wallKey === 'bottom')) ||
          ((d.wall === 'east' || d.wall === 'right') && (def.wallKey === 'right')) ||
          ((d.wall === 'west' || d.wall === 'left') && (def.wallKey === 'left'));
        if (isMatch) {
          const w = d.width || 90;
          const h = d.height || 210;
          const aM2 = Number(((w * h) / 10000).toFixed(2));
          openings.push({
            type: 'door',
            name: d.name || '門扇開口',
            widthCm: w,
            heightCm: h,
            areaM2: aM2,
            areaPing: Number((aM2 * M2_TO_PING).toFixed(2)),
          });
        }
      });
    }

    // 尋找落在該面向的窗
    if (room.windows) {
      room.windows.forEach((w) => {
        const isMatch = w.wall === def.wallKey ||
          ((w.wall === 'north' || w.wall === 'top') && (def.wallKey === 'top')) ||
          ((w.wall === 'south' || w.wall === 'bottom') && (def.wallKey === 'bottom')) ||
          ((w.wall === 'east' || w.wall === 'right') && (def.wallKey === 'right')) ||
          ((w.wall === 'west' || w.wall === 'left') && (def.wallKey === 'left'));
        if (isMatch) {
          const ww = w.width || 120;
          const wh = w.height || 120;
          const aM2 = Number(((ww * wh) / 10000).toFixed(2));
          openings.push({
            type: 'window',
            name: w.name || '採光氣密窗',
            widthCm: ww,
            heightCm: wh,
            areaM2: aM2,
            areaPing: Number((aM2 * M2_TO_PING).toFixed(2)),
          });
        }
      });
    }

    const deductionsM2 = Number(openings.reduce((sum, op) => sum + op.areaM2, 0).toFixed(2));
    const deductionsPing = Number((deductionsM2 * M2_TO_PING).toFixed(2));
    const netAreaM2 = Number(Math.max(0, grossAreaM2 - deductionsM2).toFixed(2));
    const netAreaPing = Number((netAreaM2 * M2_TO_PING).toFixed(2));

    // 檢查大樑影響
    const beamNotes: string[] = [];
    if (room.beams) {
      room.beams.forEach((b) => {
        if (
          (b.orientation === 'horizontal' && (def.wallKey === 'top' || def.wallKey === 'bottom')) ||
          (b.orientation === 'vertical' && (def.wallKey === 'left' || def.wallKey === 'right'))
        ) {
          beamNotes.push(`${b.name} (深 ${b.depth}cm，淨高 ${b.clearHeight}cm)`);
        }
      });
    }

    wallsResult[def.orientation] = {
      orientation: def.orientation,
      name: def.name,
      wallKey: def.wallKey,
      widthCm: def.width,
      heightCm: height,
      grossAreaM2,
      grossAreaPing,
      openings,
      deductionsM2,
      deductionsPing,
      netAreaM2,
      netAreaPing,
      beamNotes,
    };

    totalGrossM2 += grossAreaM2;
    totalDeductionsM2 += deductionsM2;
  });

  const totalWallGrossAreaM2 = Number(totalGrossM2.toFixed(2));
  const totalWallGrossAreaPing = Number((totalWallGrossAreaM2 * M2_TO_PING).toFixed(2));
  const totalWallDeductionsM2 = Number(totalDeductionsM2.toFixed(2));
  const totalWallDeductionsPing = Number((totalWallDeductionsM2 * M2_TO_PING).toFixed(2));
  const totalWallNetAreaM2 = Number(Math.max(0, totalWallGrossAreaM2 - totalWallDeductionsM2).toFixed(2));
  const totalWallNetAreaPing = Number((totalWallNetAreaM2 * M2_TO_PING).toFixed(2));

  return {
    roomId: room.id,
    roomName: room.roomName,
    floorWidthCm: room.width || 0,
    floorLengthCm: room.length || 0,
    clearHeightCm: height,
    floorAreaM2,
    floorAreaPing,
    walls: wallsResult,
    totalWallGrossAreaM2,
    totalWallGrossAreaPing,
    totalWallDeductionsM2,
    totalWallDeductionsPing,
    totalWallNetAreaM2,
    totalWallNetAreaPing,
  };
}

/**
 * 統計全案所有空間的平面積與立面牆體面積總計
 */
export function calculateProjectAreaSummary(rooms: RoomData[]): FullProjectAreaSummary {
  let totalFloorAreaM2 = 0;
  let totalWallGrossAreaM2 = 0;
  let totalWallDeductionsM2 = 0;
  let totalWallNetAreaM2 = 0;

  const roomCalculations = (rooms || []).map((r) => {
    const calc = calculateRoom4WallsArea(r);
    totalFloorAreaM2 += calc.floorAreaM2;
    totalWallGrossAreaM2 += calc.totalWallGrossAreaM2;
    totalWallDeductionsM2 += calc.totalWallDeductionsM2;
    totalWallNetAreaM2 += calc.totalWallNetAreaM2;
    return calc;
  });

  const fM2 = Number(totalFloorAreaM2.toFixed(2));
  const wgM2 = Number(totalWallGrossAreaM2.toFixed(2));
  const wdM2 = Number(totalWallDeductionsM2.toFixed(2));
  const wnM2 = Number(totalWallNetAreaM2.toFixed(2));

  return {
    totalFloorAreaM2: fM2,
    totalFloorAreaPing: Number((fM2 * M2_TO_PING).toFixed(2)),
    totalWallGrossAreaM2: wgM2,
    totalWallGrossAreaPing: Number((wgM2 * M2_TO_PING).toFixed(2)),
    totalWallDeductionsM2: wdM2,
    totalWallDeductionsPing: Number((wdM2 * M2_TO_PING).toFixed(2)),
    totalWallNetAreaM2: wnM2,
    totalWallNetAreaPing: Number((wnM2 * M2_TO_PING).toFixed(2)),
    roomCalculations,
  };
}

/**
 * 匯出全案空間平面積與 4 面牆立面工程計算報表 (CSV 格式，包含 UTF-8 BOM，Excel 直接開啟不亂碼)
 */
export function generateAreaReportCsv(
  summary: FullProjectAreaSummary,
  unit: 'ping' | 'm2' = 'ping'
): string {
  const isPing = unit === 'ping';
  const u = isPing ? '坪' : 'm²';
  let csv = '\uFEFF'; // UTF-8 BOM for Excel
  csv += `【全案空間平面積與 4 個面向立面牆體工程量計算總表】\n`;
  csv += `計算基準單位,${isPing ? '臺灣專用坪數 (坪)' : '米平方 (m²)'},單位換算比率,1 m² = 0.3025 坪 (1 坪 = 3.305785 m²)\n\n`;

  csv += `指標項目,數值 (${u}),換算對照 (${isPing ? 'm²' : '坪'})\n`;
  csv += `全室室內地坪總淨面積,${isPing ? summary.totalFloorAreaPing : summary.totalFloorAreaM2},${isPing ? summary.totalFloorAreaM2 : summary.totalFloorAreaPing}\n`;
  csv += `全案 4 面牆立面總毛面積,${isPing ? summary.totalWallGrossAreaPing : summary.totalWallGrossAreaM2},${isPing ? summary.totalWallGrossAreaM2 : summary.totalWallGrossAreaPing}\n`;
  csv += `全案門窗開口總扣除面積,-${isPing ? summary.totalWallDeductionsPing : summary.totalWallDeductionsM2},-${isPing ? summary.totalWallDeductionsM2 : summary.totalWallDeductionsPing}\n`;
  csv += `全案 4 面牆淨施作工程量 (油漆/壁紙/石材泥作),${isPing ? summary.totalWallNetAreaPing : summary.totalWallNetAreaM2},${isPing ? summary.totalWallNetAreaM2 : summary.totalWallNetAreaPing}\n\n`;

  csv += `空間編號,空間名稱,面寬 (cm),進深 (cm),挑高淨高 (cm),空間地坪平面積 (${u}),面向名稱,牆面面寬 (cm),立面高度 (cm),立面毛面積 (${u}),門窗開口扣除明細,開口扣除面積 (${u}),立面淨施作面積 (${u}),結構大樑備註\n`;

  summary.roomCalculations.forEach((r, rIdx) => {
    (['north', 'south', 'east', 'west'] as const).forEach((orient, wIdx) => {
      const w = r.walls[orient];
      const openingText = w.openings.length > 0
        ? w.openings.map((op) => `${op.name} [${op.widthCm}×${op.heightCm}cm]`).join('; ')
        : '無開口';
      const beamText = w.beamNotes.length > 0 ? w.beamNotes.join('; ') : '無大樑穿過';

      csv += `${rIdx + 1},"${r.roomName}",${wIdx === 0 ? r.floorWidthCm : ''},${wIdx === 0 ? r.floorLengthCm : ''},${wIdx === 0 ? r.clearHeightCm : ''},${wIdx === 0 ? (isPing ? r.floorAreaPing : r.floorAreaM2) : ''},"${w.name}",${w.widthCm},${w.heightCm},${isPing ? w.grossAreaPing : w.grossAreaM2},"${openingText}",-${isPing ? w.deductionsPing : w.deductionsM2},${isPing ? w.netAreaPing : w.netAreaM2},"${beamText}"\n`;
    });
  });

  return csv;
}

// Room display colors (sophisticated architectural palette)
const ROOM_PALETTE = [
  '#3b82f6', // Living/Dining (Blue)
  '#8b5cf6', // Master Bed (Purple)
  '#06b6d4', // Bath (Cyan)
  '#10b981', // Kitchen (Emerald)
  '#f59e0b', // Second Bed (Amber)
  '#ec4899', // Balcony (Pink)
  '#6366f1', // Study (Indigo)
  '#14b8a6', // Guest Room (Teal)
];

/**
 * 取得特定門在其房間局部坐標系下的中點坐標與向外法向量
 */
export function getDoorLocalGeometry(door: Door, roomWidth: number, roomLength: number) {
  const w = door.width || 90;
  const offset = door.offset || 0;
  let midX = 0;
  let midY = 0;
  let normalX = 0;
  let normalY = 0;
  let normalAngle = 0; // 0: East, 90: South, 180: West, 270: North

  switch (door.wall) {
    case 'top':
      midX = offset + w / 2;
      midY = 0;
      normalX = 0;
      normalY = -1;
      normalAngle = 270;
      break;
    case 'bottom':
      midX = offset + w / 2;
      midY = roomLength;
      normalX = 0;
      normalY = 1;
      normalAngle = 90;
      break;
    case 'left':
      midX = 0;
      midY = offset + w / 2;
      normalX = -1;
      normalY = 0;
      normalAngle = 180;
      break;
    case 'right':
    default:
      midX = roomWidth;
      midY = offset + w / 2;
      normalX = 1;
      normalY = 0;
      normalAngle = 0;
      break;
  }

  return { midX, midY, normalX, normalY, normalAngle, width: w, offset };
}

/**
 * 2D 剛體旋轉變換 (90 度正交倍數)
 */
export function rotatePoint(x: number, y: number, rotation: 0 | 90 | 180 | 270): { x: number; y: number } {
  switch (rotation) {
    case 90:
      return { x: -y, y: x };
    case 180:
      return { x: -x, y: -y };
    case 270:
      return { x: y, y: -x };
    case 0:
    default:
      return { x, y };
  }
}

/**
 * 空間功能空間親和力權重計算（用於使用者口述多空間時的建築學合理串聯拓撲）
 */
export function getArchitecturalSpatialAffinity(roomA: RoomData, roomB: RoomData): number {
  const a = (roomA.roomName || '').toLowerCase();
  const b = (roomB.roomName || '').toLowerCase();

  // 主臥 ↔ 主衛浴/浴室 (高親和力，通常套房內相鄰或共壁)
  if ((a.includes('主臥') && b.includes('衛')) || (b.includes('主臥') && a.includes('衛'))) return 130;
  if ((a.includes('臥') && b.includes('衛')) || (b.includes('臥') && a.includes('衛'))) return 95;

  // 廚房 ↔ 客廳/餐廳/飯廳 (高度相鄰親和力)
  if ((a.includes('廚') && (b.includes('客') || b.includes('餐'))) || (b.includes('廚') && (a.includes('客') || a.includes('餐')))) return 115;

  // 陽台 ↔ 客廳/廚房 (外側採光通風空間)
  if (a.includes('陽台') && (b.includes('客') || b.includes('廚'))) return 100;
  if (b.includes('陽台') && (a.includes('客') || a.includes('廚'))) return 100;

  // 書房/多功能 ↔ 客廳/主臥
  if ((a.includes('書') && b.includes('客')) || (b.includes('書') && a.includes('客'))) return 85;

  // 次臥/客房 ↔ 客廳/起居走道
  if ((a.includes('次臥') || a.includes('房')) && (b.includes('客') || b.includes('起居') || b.includes('公'))) return 80;

  return 35;
}

/**
 * 基於空間邊界矩形的剛體碰撞計算邏輯演算法 (Rigid-Body Spatial Boundary Rectangle Collision & Wall Coincidence Engine)
 * 將使用者口述的多個房間空間，依照『相鄰空間牆體重合』原則與 0 剛體穿透約束，
 * 自動拼湊並串聯成長成一張具有正確幾何比例、密合共壁的建築總平面圖。
 */
export function calculateRigidBodyCoincidentStitchedFloorPlan(
  rooms: RoomData[],
  baseRoomId?: string,
  wallThickness: number = 15 // 預設共用隔間牆厚 15cm
): StitchedFloorPlanResult {
  if (!rooms || rooms.length === 0) {
    return {
      placements: [],
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, totalWidth: 0, totalLength: 0 },
      totalAreaM2: 0,
      totalAreaPing: 0,
      pairedDoorsCount: 0,
      unpairedDoorsCount: 0,
      sharedWallCount: 0,
      auditNotes: ['無可用的房間數據'],
      stitchMethod: 'rigid_body_collision',
      zeroCollisionVerified: true,
      totalCoincidentWallLength: 0,
    };
  }

  // 1. 決定基準空間 (優先選擇客餐廳、公領域或面寬面積最大者)
  let rootRoom = rooms.find((r) => r.id === baseRoomId);
  if (!rootRoom) {
    rootRoom =
      rooms.find(
        (r) =>
          r.roomName.includes('客') ||
          r.roomName.includes('起居') ||
          r.roomName.includes('公領域') ||
          r.roomName.includes('玄關')
      ) || rooms[0];
  }

  const auditNotes: string[] = [];
  const placedMap = new Map<string, StitchedRoomPlacement>();

  // 放置基準空間於原點 (0, 0)，旋轉 0 度
  const basePlacement: StitchedRoomPlacement = {
    roomId: rootRoom.id,
    roomName: rootRoom.roomName,
    x: 0,
    y: 0,
    rotation: 0,
    width: rootRoom.width,
    length: rootRoom.length,
    effectiveWidth: rootRoom.width,
    effectiveLength: rootRoom.length,
    color: ROOM_PALETTE[0],
    isBaseRoom: true,
    collisionStatus: 'passed_zero_collision',
    coincidentOverlapTotal: 0,
    coincidentSegments: [],
    sharedWalls: [],
  };
  placedMap.set(rootRoom.id, basePlacement);
  auditNotes.push(
    `基準空間確立：「${rootRoom.roomName}」(${rootRoom.width}×${rootRoom.length}cm) 鎖定於世界原點 (0,0)，作為剛體相鄰牆體生長中樞`
  );

  let paletteIndex = 1;
  let totalCoincidentWallLength = 0;
  let sharedWallCount = 0;

  // 2. 依據空間親和力與相鄰空間牆體重合原則，依序吸附成長未放置的空間
  while (placedMap.size < rooms.length) {
    const unplacedRooms = rooms.filter((r) => !placedMap.has(r.id));
    const alreadyPlaced = Array.from(placedMap.values());

    // 計算每個未放置空間對已放置聚落的最大親和力，優先放置親和力最高者
    unplacedRooms.sort((ra, rb) => {
      let maxAffA = 0;
      let maxAffB = 0;
      for (const p of alreadyPlaced) {
        const pr = rooms.find((r) => r.id === p.roomId)!;
        maxAffA = Math.max(maxAffA, getArchitecturalSpatialAffinity(ra, pr));
        maxAffB = Math.max(maxAffB, getArchitecturalSpatialAffinity(rb, pr));
      }
      return maxAffB - maxAffA;
    });

    const currentRoom = unplacedRooms[0];

    // 尋找最佳吸附候選位姿 (Candidate Pose)
    let bestCandidate: {
      x: number;
      y: number;
      rotation: 0 | 90;
      effectiveWidth: number;
      effectiveLength: number;
      coincidenceScore: number;
      totalOverlapLength: number;
      dockedWithRoomId: string;
      dockedWithRoomName: string;
      sharedWallEdge: 'top' | 'bottom' | 'left' | 'right';
      segments: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        edge: string;
        lengthCm: number;
        targetRoomName: string;
      }[];
    } | null = null;

    const rotationsToTest: (0 | 90)[] = [0, 90];

    for (const rot of rotationsToTest) {
      const effW = rot === 90 ? currentRoom.length : currentRoom.width;
      const effL = rot === 90 ? currentRoom.width : currentRoom.length;

      for (const p of alreadyPlaced) {
        const parentRoom = rooms.find((r) => r.id === p.roomId);
        const affinity = parentRoom ? getArchitecturalSpatialAffinity(currentRoom, parentRoom) : 30;

        // 生成 4 面相鄰牆體的貼合候選位姿 (帶有隔間牆厚 wallThickness)
        const candidates: { x: number; y: number; edge: 'top' | 'bottom' | 'left' | 'right' }[] = [
          // 東側 (Right of p)
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y, edge: 'right' },
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y + p.effectiveLength - effL, edge: 'right' },
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y + (p.effectiveLength - effL) / 2, edge: 'right' },

          // 南側 (Bottom of p)
          { x: p.x, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },
          { x: p.x + p.effectiveWidth - effW, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },
          { x: p.x + (p.effectiveWidth - effW) / 2, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },

          // 北側 (Top of p)
          { x: p.x, y: p.y - effL - wallThickness, edge: 'top' },
          { x: p.x + p.effectiveWidth - effW, y: p.y - effL - wallThickness, edge: 'top' },
          { x: p.x + (p.effectiveWidth - effW) / 2, y: p.y - effL - wallThickness, edge: 'top' },

          // 西側 (Left of p)
          { x: p.x - effW - wallThickness, y: p.y, edge: 'left' },
          { x: p.x - effW - wallThickness, y: p.y + p.effectiveLength - effL, edge: 'left' },
          { x: p.x - effW - wallThickness, y: p.y + (p.effectiveLength - effL) / 2, edge: 'left' },
        ];

        // 同時加入與全域已放置空間邊界的齊平候選點 (Flush with existing global bounds)
        for (const other of alreadyPlaced) {
          if (other.x === p.x) {
            candidates.push({ x: p.x + p.effectiveWidth + wallThickness, y: other.y, edge: 'right' });
            candidates.push({ x: p.x - effW - wallThickness, y: other.y, edge: 'left' });
          }
          if (other.y === p.y) {
            candidates.push({ x: other.x, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' });
            candidates.push({ x: other.x, y: p.y - effL - wallThickness, edge: 'top' });
          }
        }

        for (const cand of candidates) {
          const candMinX = cand.x;
          const candMaxX = cand.x + effW;
          const candMinY = cand.y;
          const candMaxY = cand.y + effL;

          // 1. 嚴格 2D 剛體 AABB 碰撞檢測 (Zero Collision Verification)
          // 兩空間矩形不可有任何交集穿透
          let hasCollision = false;
          for (const other of alreadyPlaced) {
            const otherMinX = other.x;
            const otherMaxX = other.x + other.effectiveWidth;
            const otherMinY = other.y;
            const otherMaxY = other.y + other.effectiveLength;

            const isSeparated =
              candMaxX <= otherMinX + 0.5 ||
              candMinX >= otherMaxX - 0.5 ||
              candMaxY <= otherMinY + 0.5 ||
              candMinY >= otherMaxY - 0.5;

            if (!isSeparated) {
              hasCollision = true;
              break;
            }
          }

          if (hasCollision) continue;

          // 2. 計算與所有相鄰房間的「相鄰空間牆體重合」長度與共壁線段
          let totalOverlap = 0;
          let flushBonus = 0;
          const segments: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            edge: string;
            lengthCm: number;
            targetRoomName: string;
          }[] = [];

          for (const other of alreadyPlaced) {
            // 水平共壁 (東/西面向相鄰)
            const isLeftAdjacent = Math.abs(candMaxX + wallThickness - other.x) <= 2;
            const isRightAdjacent = Math.abs(candMinX - (other.x + other.effectiveWidth + wallThickness)) <= 2;

            if (isLeftAdjacent || isRightAdjacent) {
              const startY = Math.max(candMinY, other.y);
              const endY = Math.min(candMaxY, other.y + other.effectiveLength);
              const overlapY = Math.max(0, endY - startY);
              if (overlapY > 10) {
                totalOverlap += overlapY;
                if (
                  Math.abs(candMinY - other.y) <= 2 ||
                  Math.abs(candMaxY - (other.y + other.effectiveLength)) <= 2
                ) {
                  flushBonus += 60; // 邊界齊平獎勵
                }
                const wallX = isLeftAdjacent
                  ? (candMaxX + other.x) / 2
                  : (candMinX + other.x + other.effectiveWidth) / 2;
                segments.push({
                  x1: wallX,
                  y1: startY,
                  x2: wallX,
                  y2: endY,
                  edge: isLeftAdjacent ? 'right' : 'left',
                  lengthCm: Math.round(overlapY),
                  targetRoomName: other.roomName,
                });
              }
            }

            // 垂直共壁 (南/北面向相鄰)
            const isTopAdjacent = Math.abs(candMaxY + wallThickness - other.y) <= 2;
            const isBottomAdjacent = Math.abs(candMinY - (other.y + other.effectiveLength + wallThickness)) <= 2;

            if (isTopAdjacent || isBottomAdjacent) {
              const startX = Math.max(candMinX, other.x);
              const endX = Math.min(candMaxX, other.x + other.effectiveWidth);
              const overlapX = Math.max(0, endX - startX);
              if (overlapX > 10) {
                totalOverlap += overlapX;
                if (
                  Math.abs(candMinX - other.x) <= 2 ||
                  Math.abs(candMaxX - (other.x + other.effectiveWidth)) <= 2
                ) {
                  flushBonus += 60; // 邊界齊平獎勵
                }
                const wallY = isTopAdjacent
                  ? (candMaxY + other.y) / 2
                  : (candMinY + other.y + other.effectiveLength) / 2;
                segments.push({
                  x1: startX,
                  y1: wallY,
                  x2: endX,
                  y2: wallY,
                  edge: isTopAdjacent ? 'bottom' : 'top',
                  lengthCm: Math.round(overlapX),
                  targetRoomName: other.roomName,
                });
              }
            }
          }

          if (totalOverlap <= 0) continue;

          // 3. 建築學綜合評分 (相鄰牆體重合度最大化 + 空間親和力 + 齊平加分 - 中心散逸懲罰)
          const distToCenter = Math.hypot((candMinX + candMaxX) / 2, (candMinY + candMaxY) / 2);
          const score = totalOverlap * 12 + affinity * 2 + flushBonus - distToCenter * 0.08;

          if (!bestCandidate || score > bestCandidate.coincidenceScore) {
            bestCandidate = {
              x: Math.round(cand.x),
              y: Math.round(cand.y),
              rotation: rot,
              effectiveWidth: effW,
              effectiveLength: effL,
              coincidenceScore: score,
              totalOverlapLength: Math.round(totalOverlap),
              dockedWithRoomId: p.roomId,
              dockedWithRoomName: p.roomName,
              sharedWallEdge: cand.edge,
              segments,
            };
          }
        }
      }
    }

    if (bestCandidate && bestCandidate.totalOverlapLength > 0) {
      totalCoincidentWallLength += bestCandidate.totalOverlapLength;
      sharedWallCount += bestCandidate.segments.length;

      const dockedParent = placedMap.get(bestCandidate.dockedWithRoomId);
      if (dockedParent) {
        dockedParent.sharedWalls.push({
          wall: bestCandidate.sharedWallEdge,
          targetRoomId: currentRoom.id,
          targetRoomName: currentRoom.roomName,
          overlapLength: bestCandidate.totalOverlapLength,
        });
      }

      const newPlacement: StitchedRoomPlacement = {
        roomId: currentRoom.id,
        roomName: currentRoom.roomName,
        x: bestCandidate.x,
        y: bestCandidate.y,
        rotation: bestCandidate.rotation,
        width: currentRoom.width,
        length: currentRoom.length,
        effectiveWidth: bestCandidate.effectiveWidth,
        effectiveLength: bestCandidate.effectiveLength,
        color: ROOM_PALETTE[paletteIndex % ROOM_PALETTE.length],
        isBaseRoom: false,
        collisionStatus: 'passed_zero_collision',
        coincidentOverlapTotal: bestCandidate.totalOverlapLength,
        coincidentSegments: bestCandidate.segments,
        sharedWalls: [
          {
            wall:
              bestCandidate.sharedWallEdge === 'top'
                ? 'bottom'
                : bestCandidate.sharedWallEdge === 'bottom'
                ? 'top'
                : bestCandidate.sharedWallEdge === 'left'
                ? 'right'
                : 'left',
            targetRoomId: bestCandidate.dockedWithRoomId,
            targetRoomName: bestCandidate.dockedWithRoomName,
            overlapLength: bestCandidate.totalOverlapLength,
          },
        ],
      };

      paletteIndex++;
      placedMap.set(currentRoom.id, newPlacement);
      auditNotes.push(
        `✓ 空間邊界矩形剛體吸附：「${currentRoom.roomName}」(${newPlacement.effectiveWidth}×${newPlacement.effectiveLength}cm) 成功吻合至「${bestCandidate.dockedWithRoomName}」，共壁重合 ${bestCandidate.totalOverlapLength}cm，0 碰撞驗證通過`
      );
    } else {
      // 容錯機制：若無法重合，放置在外圍最近的無碰撞空位
      let fallbackX = 0;
      let fallbackY = 0;
      for (const p of alreadyPlaced) {
        if (p.x + p.effectiveWidth + wallThickness > fallbackX) {
          fallbackX = p.x + p.effectiveWidth + wallThickness;
        }
      }
      const fallbackPlacement: StitchedRoomPlacement = {
        roomId: currentRoom.id,
        roomName: currentRoom.roomName,
        x: fallbackX,
        y: fallbackY,
        rotation: 0,
        width: currentRoom.width,
        length: currentRoom.length,
        effectiveWidth: currentRoom.width,
        effectiveLength: currentRoom.length,
        color: ROOM_PALETTE[paletteIndex % ROOM_PALETTE.length],
        isBaseRoom: false,
        collisionStatus: 'passed_zero_collision',
        coincidentOverlapTotal: 0,
        coincidentSegments: [],
        sharedWalls: [],
      };
      paletteIndex++;
      placedMap.set(currentRoom.id, fallbackPlacement);
      auditNotes.push(`⚠️「${currentRoom.roomName}」放置於外側獨立區`);
    }
  }

  const placements = Array.from(placedMap.values());

  // 計算全局包圍盒 (Bounding Box)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalAreaCm2 = 0;

  for (const p of placements) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.effectiveWidth);
    maxY = Math.max(maxY, p.y + p.effectiveLength);
    totalAreaCm2 += p.effectiveWidth * p.effectiveLength;
  }

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = rootRoom.width;
    maxY = rootRoom.length;
  }

  const totalWidth = Math.round(maxX - minX);
  const totalLength = Math.round(maxY - minY);
  const totalAreaM2 = Number((totalAreaCm2 / 10000).toFixed(2));
  const totalAreaPing = Number((totalAreaM2 * M2_TO_PING).toFixed(2));

  auditNotes.unshift(
    `🎯 基於邊界矩形剛體碰撞之相鄰牆體重合拼接完工！共串聯 ${placements.length} 間空間、共壁嵌合總長度 ${totalCoincidentWallLength} cm，全室 0 碰撞無穿透，幾何比例 1:1 精確成圖`
  );

  return {
    placements,
    boundingBox: { minX, minY, maxX, maxY, totalWidth, totalLength },
    totalAreaM2,
    totalAreaPing,
    pairedDoorsCount: sharedWallCount,
    unpairedDoorsCount: 0,
    sharedWallCount,
    auditNotes,
    stitchMethod: 'rigid_body_collision',
    zeroCollisionVerified: true,
    totalCoincidentWallLength,
  };
}

/**
 * 核心拓撲拼接演算法：
 * 給定全量房間清單與基準房間 ID，支援門洞錨點配對模式與空間邊界矩形剛體碰撞重合模式！
 */
export function calculateStitchedFloorPlan(
  rooms: RoomData[],
  baseRoomId?: string,
  wallThickness: number = 15, // 預設共用隔間牆厚 15cm (RC 或磚牆)
  stitchMode: 'door_anchored' | 'rigid_body_collision' = 'door_anchored'
): StitchedFloorPlanResult {
  if (stitchMode === 'rigid_body_collision') {
    return applyManualRoomPlacements(calculateRigidBodyCoincidentStitchedFloorPlan(rooms, baseRoomId, wallThickness), rooms);
  }

  if (!rooms || rooms.length === 0) {
    return {
      placements: [],
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, totalWidth: 0, totalLength: 0 },
      totalAreaM2: 0,
      totalAreaPing: 0,
      pairedDoorsCount: 0,
      unpairedDoorsCount: 0,
      sharedWallCount: 0,
      auditNotes: ['無可用的房間數據'],
    };
  }

  // 1. 決定基準空間 (預設第一個或選定之客廳/公共區)
  const rootRoom = rooms.find((r) => r.id === baseRoomId) || rooms[0];
  const auditNotes: string[] = [];
  let pairedDoorsCount = 0;
  let unpairedDoorsCount = 0;

  // 2. 建立已放置空間 Map 與待放置隊列
  const placedMap = new Map<string, StitchedRoomPlacement>();

  // 放置基準空間於原點 (0, 0)，旋轉 0 度
  const basePlacement: StitchedRoomPlacement = {
    roomId: rootRoom.id,
    roomName: rootRoom.roomName,
    x: 0,
    y: 0,
    rotation: 0,
    width: rootRoom.width,
    length: rootRoom.length,
    effectiveWidth: rootRoom.width,
    effectiveLength: rootRoom.length,
    color: ROOM_PALETTE[0],
    isBaseRoom: true,
    sharedWalls: [],
  };
  placedMap.set(rootRoom.id, basePlacement);

  // 3. 遞迴/圖搜尋遍歷匹配所有有對應 anchorTag 或 pairedRoomId 的門洞
  let queue: string[] = [rootRoom.id];
  const visitedRooms = new Set<string>([rootRoom.id]);

  let paletteIndex = 1;

  while (queue.length > 0) {
    const currentPlacedId = queue.shift()!;
    const currentPlacement = placedMap.get(currentPlacedId)!;
    const currentRoom = rooms.find((r) => r.id === currentPlacedId);
    if (!currentRoom || !currentRoom.doors) continue;

    for (const d1 of currentRoom.doors) {
      if (!d1.anchorTag) {
        unpairedDoorsCount++;
        continue;
      }

      // 尋找其他未放置的房間中具有相同 anchorTag 的門
      let matchedRoom: RoomData | undefined;
      let matchedDoor: Door | undefined;

      for (const candidateRoom of rooms) {
        if (visitedRooms.has(candidateRoom.id)) continue;
        const foundDoor = candidateRoom.doors?.find(
          (d) =>
            d.anchorTag &&
            d.anchorTag.toUpperCase() === d1.anchorTag?.toUpperCase() &&
            d.id !== d1.id
        );
        if (foundDoor) {
          matchedRoom = candidateRoom;
          matchedDoor = foundDoor;
          break;
        }
      }

      if (!matchedRoom || !matchedDoor) {
        continue;
      }

      // 找到了匹配的一組門：d1 (在 currentRoom) ↔ matchedDoor (在 matchedRoom)
      pairedDoorsCount++;
      visitedRooms.add(matchedRoom.id);

      // 計算 d1 在全局世界坐標系下的幾何
      const d1Geom = getDoorLocalGeometry(d1, currentRoom.width, currentRoom.length);
      const d1RotatedMid = rotatePoint(d1Geom.midX, d1Geom.midY, currentPlacement.rotation);
      const d1GlobalMidX = currentPlacement.x + d1RotatedMid.x;
      const d1GlobalMidY = currentPlacement.y + d1RotatedMid.y;

      const d1RotatedNormal = rotatePoint(d1Geom.normalX, d1Geom.normalY, currentPlacement.rotation);
      const d1GlobalNormalAngle = (d1Geom.normalAngle + currentPlacement.rotation) % 360;

      // 目標門 d2 的全局法向量必須與 d1GlobalNormal 反向 (180度)
      const targetD2GlobalNormalAngle = (d1GlobalNormalAngle + 180) % 360;

      // d2 在 matchedRoom 局部坐標系下的法向量角度
      const d2Geom = getDoorLocalGeometry(matchedDoor, matchedRoom.width, matchedRoom.length);
      const d2LocalNormalAngle = d2Geom.normalAngle;

      // 推算 matchedRoom 的所需旋轉角度 (0, 90, 180, 270)
      const rawRot = (targetD2GlobalNormalAngle - d2LocalNormalAngle + 360) % 360;
      const requiredRotation = (Math.round(rawRot / 90) * 90) % 360 as 0 | 90 | 180 | 270;

      // 隔間牆中心偏移：d2 的全局門中心位置 = d1 全局門中心 + (d1GlobalNormal * wallThickness)
      const d2GlobalMidX = d1GlobalMidX + d1RotatedNormal.x * wallThickness;
      const d2GlobalMidY = d1GlobalMidY + d1RotatedNormal.y * wallThickness;

      // 計算 d2 局部中點旋轉後之偏移
      const d2RotatedMid = rotatePoint(d2Geom.midX, d2Geom.midY, requiredRotation);

      // 解出 matchedRoom 的全局原點 (tx, ty)
      const targetX = d2GlobalMidX - d2RotatedMid.x;
      const targetY = d2GlobalMidY - d2RotatedMid.y;

      const effectiveWidth = requiredRotation === 90 || requiredRotation === 270 ? matchedRoom.length : matchedRoom.width;
      const effectiveLength = requiredRotation === 90 || requiredRotation === 270 ? matchedRoom.width : matchedRoom.length;

      // 記錄共用隔間牆
      currentPlacement.sharedWalls.push({
        wall: d1.wall,
        targetRoomId: matchedRoom.id,
        targetRoomName: matchedRoom.roomName,
        overlapLength: Math.min(d1.width, matchedDoor.width),
      });

      const newPlacement: StitchedRoomPlacement = {
        roomId: matchedRoom.id,
        roomName: matchedRoom.roomName,
        x: targetX,
        y: targetY,
        rotation: requiredRotation,
        width: matchedRoom.width,
        length: matchedRoom.length,
        effectiveWidth,
        effectiveLength,
        color: ROOM_PALETTE[paletteIndex % ROOM_PALETTE.length],
        isBaseRoom: false,
        connectedViaDoorTag: d1.anchorTag,
        connectedToRoomId: currentRoom.id,
        sharedWalls: [
          {
            wall: matchedDoor.wall,
            targetRoomId: currentRoom.id,
            targetRoomName: currentRoom.roomName,
            overlapLength: Math.min(d1.width, matchedDoor.width),
          },
        ],
      };

      paletteIndex++;
      placedMap.set(matchedRoom.id, newPlacement);
      queue.push(matchedRoom.id);

      auditNotes.push(
        `✓ 門洞 [${d1.anchorTag}] 對齊成功：${currentRoom.roomName} (${d1.name}) ↔ ${matchedRoom.roomName} (${matchedDoor.name})，旋轉 ${requiredRotation}°，嵌合牆厚 ${wallThickness}cm`
      );
    }
  }

  // 4. 對於未透過門洞連通的房間，執行「基於空間邊界矩形的剛體碰撞計算與相鄰空間牆體重合」演算法
  for (const unplacedRoom of rooms) {
    if (placedMap.has(unplacedRoom.id)) continue;

    const alreadyPlaced = Array.from(placedMap.values());
    let bestCandidate: {
      x: number;
      y: number;
      rotation: 0 | 90;
      effectiveWidth: number;
      effectiveLength: number;
      coincidenceScore: number;
      dockedWithRoomId: string;
      dockedWithRoomName: string;
      sharedWallEdge: 'top' | 'bottom' | 'left' | 'right';
      overlapLength: number;
    } | null = null;

    // 測試兩種旋轉角度 (0度 與 90度)
    const rotationsToTest: (0 | 90)[] = [0, 90];

    for (const rot of rotationsToTest) {
      const effW = rot === 90 ? unplacedRoom.length : unplacedRoom.width;
      const effL = rot === 90 ? unplacedRoom.width : unplacedRoom.length;

      // 遍歷所有已放置房間的 4 個面向牆體進行貼合測試
      for (const p of alreadyPlaced) {
        const candidatePositions: { x: number; y: number; edge: 'top' | 'bottom' | 'left' | 'right' }[] = [
          // 貼在 p 右側 (東面牆): x = p.x + p.effectiveWidth + wallThickness
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y, edge: 'right' },
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y + p.effectiveLength - effL, edge: 'right' },
          { x: p.x + p.effectiveWidth + wallThickness, y: p.y + (p.effectiveLength - effL) / 2, edge: 'right' },

          // 貼在 p 底部 (南面牆): y = p.y + p.effectiveLength + wallThickness
          { x: p.x, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },
          { x: p.x + p.effectiveWidth - effW, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },
          { x: p.x + (p.effectiveWidth - effW) / 2, y: p.y + p.effectiveLength + wallThickness, edge: 'bottom' },

          // 貼在 p 頂部 (北面牆): y = p.y - effL - wallThickness
          { x: p.x, y: p.y - effL - wallThickness, edge: 'top' },
          { x: p.x + p.effectiveWidth - effW, y: p.y - effL - wallThickness, edge: 'top' },
          { x: p.x + (p.effectiveWidth - effW) / 2, y: p.y - effL - wallThickness, edge: 'top' },

          // 貼在 p 左側 (西面牆): x = p.x - effW - wallThickness
          { x: p.x - effW - wallThickness, y: p.y, edge: 'left' },
          { x: p.x - effW - wallThickness, y: p.y + p.effectiveLength - effL, edge: 'left' },
          { x: p.x - effW - wallThickness, y: p.y + (p.effectiveLength - effL) / 2, edge: 'left' },
        ];

        for (const cand of candidatePositions) {
          // AABB 剛體碰撞檢測：檢查是否與任何已放置房間重疊 (容差 1cm)
          const candMinX = cand.x;
          const candMaxX = cand.x + effW;
          const candMinY = cand.y;
          const candMaxY = cand.y + effL;

          let hasCollision = false;
          for (const other of alreadyPlaced) {
            const otherMinX = other.x;
            const otherMaxX = other.x + other.effectiveWidth;
            const otherMinY = other.y;
            const otherMaxY = other.y + other.effectiveLength;

            const isSeparated =
              candMaxX <= otherMinX + 1 ||
              candMinX >= otherMaxX - 1 ||
              candMaxY <= otherMinY + 1 ||
              candMinY >= otherMaxY - 1;

            if (!isSeparated) {
              hasCollision = true;
              break;
            }
          }

          if (hasCollision) continue;

          // 計算此位置與鄰近所有房間的「牆體重合度 (Coincident Wall Overlap Length)」
          let totalCoincidenceLength = 0;
          for (const other of alreadyPlaced) {
            // 水平重合 (共用東/西牆):
            const isLeftRightAdjacent =
              Math.abs(candMinX - (other.x + other.effectiveWidth + wallThickness)) <= 2 ||
              Math.abs(candMaxX + wallThickness - other.x) <= 2;
            if (isLeftRightAdjacent) {
              const overlapY = Math.max(0, Math.min(candMaxY, other.y + other.effectiveLength) - Math.max(candMinY, other.y));
              totalCoincidenceLength += overlapY;
            }

            // 垂直重合 (共用南/北牆):
            const isTopBottomAdjacent =
              Math.abs(candMinY - (other.y + other.effectiveLength + wallThickness)) <= 2 ||
              Math.abs(candMaxY + wallThickness - other.y) <= 2;
            if (isTopBottomAdjacent) {
              const overlapX = Math.max(0, Math.min(candMaxX, other.x + other.effectiveWidth) - Math.max(candMinX, other.x));
              totalCoincidenceLength += overlapX;
            }
          }

          // 評分：重合長度越高越好，並偏好靠近總體原點 (0,0) 以保持緊湊
          const distToOrigin = Math.hypot(cand.x, cand.y);
          const score = totalCoincidenceLength * 10 - distToOrigin * 0.05;

          if (!bestCandidate || score > bestCandidate.coincidenceScore) {
            bestCandidate = {
              x: Math.round(cand.x),
              y: Math.round(cand.y),
              rotation: rot,
              effectiveWidth: effW,
              effectiveLength: effL,
              coincidenceScore: score,
              dockedWithRoomId: p.roomId,
              dockedWithRoomName: p.roomName,
              sharedWallEdge: cand.edge,
              overlapLength: Math.round(totalCoincidenceLength),
            };
          }
        }
      }
    }

    if (bestCandidate && bestCandidate.overlapLength > 0) {
      const dockedRoom = placedMap.get(bestCandidate.dockedWithRoomId);
      if (dockedRoom) {
        dockedRoom.sharedWalls.push({
          wall: bestCandidate.sharedWallEdge,
          targetRoomId: unplacedRoom.id,
          targetRoomName: unplacedRoom.roomName,
          overlapLength: bestCandidate.overlapLength,
        });
      }

      const newPlacement: StitchedRoomPlacement = {
        roomId: unplacedRoom.id,
        roomName: unplacedRoom.roomName,
        x: bestCandidate.x,
        y: bestCandidate.y,
        rotation: bestCandidate.rotation,
        width: unplacedRoom.width,
        length: unplacedRoom.length,
        effectiveWidth: bestCandidate.effectiveWidth,
        effectiveLength: bestCandidate.effectiveLength,
        color: ROOM_PALETTE[paletteIndex % ROOM_PALETTE.length],
        isBaseRoom: false,
        sharedWalls: [
          {
            wall:
              bestCandidate.sharedWallEdge === 'top'
                ? 'bottom'
                : bestCandidate.sharedWallEdge === 'bottom'
                ? 'top'
                : bestCandidate.sharedWallEdge === 'left'
                ? 'right'
                : 'left',
            targetRoomId: bestCandidate.dockedWithRoomId,
            targetRoomName: bestCandidate.dockedWithRoomName,
            overlapLength: bestCandidate.overlapLength,
          },
        ],
      };

      paletteIndex++;
      placedMap.set(unplacedRoom.id, newPlacement);
      auditNotes.push(
        `🧩 剛體牆體重合拼接成功：「${unplacedRoom.roomName}」緊密嵌合至「${bestCandidate.dockedWithRoomName}」，共壁重合長度 ${bestCandidate.overlapLength} cm，零碰撞吻合`
      );
    } else {
      // 若極端情況下無貼合點，置於緊湊外緣
      let fallbackOffsetX = rootRoom.width + 100;
      for (const p of alreadyPlaced) {
        if (p.x + p.effectiveWidth > fallbackOffsetX) {
          fallbackOffsetX = p.x + p.effectiveWidth + 50;
        }
      }
      const fallbackPlacement: StitchedRoomPlacement = {
        roomId: unplacedRoom.id,
        roomName: unplacedRoom.roomName,
        x: fallbackOffsetX,
        y: 0,
        rotation: 0,
        width: unplacedRoom.width,
        length: unplacedRoom.length,
        effectiveWidth: unplacedRoom.width,
        effectiveLength: unplacedRoom.length,
        color: '#64748b',
        isBaseRoom: false,
        sharedWalls: [],
      };
      placedMap.set(unplacedRoom.id, fallbackPlacement);
      auditNotes.push(
        `⚠️ 房間「${unplacedRoom.roomName}」置於外側獨立放樣區。`
      );
    }
  }

  const placements = Array.from(placedMap.values());

  // 5. 計算全局包圍盒 (Bounding Box)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalAreaCm2 = 0;

  for (const p of placements) {
    const room = rooms.find((r) => r.id === p.roomId);
    if (!room) continue;

    // 四個角點在全局坐標下的位置
    const corners = [
      { x: 0, y: 0 },
      { x: room.width, y: 0 },
      { x: room.width, y: room.length },
      { x: 0, y: room.length },
    ];

    for (const c of corners) {
      const rot = rotatePoint(c.x, c.y, p.rotation);
      const gx = p.x + rot.x;
      const gy = p.y + rot.y;
      if (gx < minX) minX = gx;
      if (gy < minY) minY = gy;
      if (gx > maxX) maxX = gx;
      if (gy > maxY) maxY = gy;
    }

    totalAreaCm2 += room.width * room.length;
  }

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = rootRoom.width;
    maxY = rootRoom.length;
  }

  const totalWidth = Math.round(maxX - minX);
  const totalLength = Math.round(maxY - minY);
  const totalAreaM2 = Number((totalAreaCm2 / 10000).toFixed(2));
  const totalAreaPing = Number((totalAreaM2 * 0.3025).toFixed(2));
  const totalCoincidentWallLength = Math.round(placements.reduce((sum, placement) => sum + placement.sharedWalls.reduce((wallSum, wall) => wallSum + wall.overlapLength, 0), 0) / 2);
  const zeroCollisionVerified = placements.every((placement, index) => placements.slice(index + 1).every((other) => {
    const overlapX = Math.min(placement.x + placement.effectiveWidth, other.x + other.effectiveWidth) - Math.max(placement.x, other.x);
    const overlapY = Math.min(placement.y + placement.effectiveLength, other.y + other.effectiveLength) - Math.max(placement.y, other.y);
    return !(overlapX > 1 && overlapY > 1);
  }));

  auditNotes.unshift(
    `全室拓撲拼接完成：${placements.length} 個空間、${pairedDoorsCount} 組門洞錨點、共壁 ${totalCoincidentWallLength}cm、碰撞檢查${zeroCollisionVerified ? '通过' : '未通过'}。總實坪 ${totalAreaPing} 坪 (${totalAreaM2} m²)`
  );

  return applyManualRoomPlacements({
    placements,
    boundingBox: { minX, minY, maxX, maxY, totalWidth, totalLength },
    totalAreaM2,
    totalAreaPing,
    pairedDoorsCount,
    unpairedDoorsCount,
    sharedWallCount: pairedDoorsCount,
    auditNotes,
    stitchMethod: 'door_anchored',
    zeroCollisionVerified,
    totalCoincidentWallLength,
  }, rooms);
}

export function applyManualRoomPlacements(result: StitchedFloorPlanResult, rooms: RoomData[]): StitchedFloorPlanResult {
  if (!rooms.some((room) => room.manualPlacement)) return result;
  const placements = result.placements.map((placement) => {
    const room = rooms.find((candidate) => candidate.id === placement.roomId);
    const manual = room?.manualPlacement;
    if (!room || !manual) return placement;
    const rotated = manual.rotation === 90 || manual.rotation === 270;
    return {
      ...placement,
      x: manual.x,
      y: manual.y,
      rotation: manual.rotation,
      effectiveWidth: rotated ? room.length : room.width,
      effectiveLength: rotated ? room.width : room.length,
      sharedWalls: [],
      coincidentSegments: [],
      coincidentOverlapTotal: 0,
      collisionStatus: undefined,
    };
  });
  const minX = Math.min(...placements.map((p) => p.x));
  const minY = Math.min(...placements.map((p) => p.y));
  const maxX = Math.max(...placements.map((p) => p.x + p.effectiveWidth));
  const maxY = Math.max(...placements.map((p) => p.y + p.effectiveLength));
  const zeroCollisionVerified = placements.every((p, index) => placements.slice(index + 1).every((other) => {
    const overlapX = Math.min(p.x + p.effectiveWidth, other.x + other.effectiveWidth) - Math.max(p.x, other.x);
    const overlapY = Math.min(p.y + p.effectiveLength, other.y + other.effectiveLength) - Math.max(p.y, other.y);
    return !(overlapX > 1 && overlapY > 1);
  }));
  return {
    ...result,
    placements,
    boundingBox: { minX, minY, maxX, maxY, totalWidth: Math.round(maxX - minX), totalLength: Math.round(maxY - minY) },
    pairedDoorsCount: 0,
    sharedWallCount: 0,
    totalCoincidentWallLength: 0,
    zeroCollisionVerified,
    auditNotes: [
      `已套用 ${rooms.filter((room) => room.manualPlacement).length} 个房间人工坐标；自动共壁数据已作废，碰撞检查${zeroCollisionVerified ? '通过' : '未通过'}。`,
      ...result.auditNotes,
    ],
  };
}

/**
 * 產生全室合併 AutoCAD DXF 字串 (含所有房間、共用牆、門洞標註)
 */
export function generateFullHouseDxfString(
  rooms: RoomData[],
  stitchedResult: StitchedFloorPlanResult,
  projectName: string = '全室合併平面放樣圖',
  projectShell?: ProjectShell | null,
): string {
  let dxf = '';

  // 1. HEADER
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';

  // 2. TABLES (LAYERS)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n10\n';
  const layers = [
    { name: 'WALL', color: 7 }, // White 0.50mm
    { name: 'SHARED_WALL', color: 6 }, // Magenta 0.35mm (共用隔間牆)
    { name: 'DOOR_ANCHOR', color: 4 }, // Cyan 0.25mm
    { name: 'BEAM', color: 1 }, // Red 0.35mm
    { name: 'DIMENSION', color: 3 }, // Green 0.18mm
    { name: 'ROOM_LABEL', color: 2 }, // Yellow
    { name: 'ELECTRICAL', color: 5 }, // Blue
    { name: 'CEILING_STEP', color: 4 },
    { name: 'IMPORTED_SHELL', color: 8 },
    { name: 'FURNITURE', color: 3 },
  ];

  layers.forEach((ly) => {
    dxf += `0\nLAYER\n2\n${ly.name}\n70\n0\n62\n${ly.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // 3. ENTITIES
  dxf += '0\nSECTION\n2\nENTITIES\n';

  const line = (ly: string, x1: number, y1: number, x2: number, y2: number) => {
    return `0\nLINE\n8\n${ly}\n10\n${(x1 * 10).toFixed(1)}\n20\n${(y1 * 10).toFixed(1)}\n30\n0.0\n11\n${(x2 * 10).toFixed(1)}\n21\n${(y2 * 10).toFixed(1)}\n31\n0.0\n`;
  };

  const text = (ly: string, x: number, y: number, height: number, val: string) => {
    return `0\nTEXT\n8\n${ly}\n10\n${(x * 10).toFixed(1)}\n20\n${(y * 10).toFixed(1)}\n30\n0.0\n40\n${height * 10}\n1\n${val}\n`;
  };

  if (projectShell) {
    for (const segment of projectShell.segments) {
      for (let pointIndex = 1; pointIndex < segment.points.length; pointIndex += 1) {
        const start = segment.points[pointIndex - 1];
        const end = segment.points[pointIndex];
        dxf += line('IMPORTED_SHELL', start.x, start.y, end.x, end.y);
      }
      if (segment.closed && segment.points.length > 2) {
        const first = segment.points[0];
        const last = segment.points[segment.points.length - 1];
        if (first.x !== last.x || first.y !== last.y) dxf += line('IMPORTED_SHELL', last.x, last.y, first.x, first.y);
      }
    }
    dxf += text('IMPORTED_SHELL', 0, -15, 6, `SOURCE_SHELL:${projectShell.sourceFileName} | ${projectShell.sourceFormat} | ${projectShell.unitName}`);
  }

  // 繪製每個放置好的房間
  for (const placement of stitchedResult.placements) {
    const room = rooms.find((r) => r.id === placement.roomId);
    if (!room) continue;

    // 四個頂點在全局坐標系
    const c1 = rotatePoint(0, 0, placement.rotation);
    const c2 = rotatePoint(room.width, 0, placement.rotation);
    const c3 = rotatePoint(room.width, room.length, placement.rotation);
    const c4 = rotatePoint(0, room.length, placement.rotation);

    const g1 = { x: placement.x + c1.x, y: placement.y + c1.y };
    const g2 = { x: placement.x + c2.x, y: placement.y + c2.y };
    const g3 = { x: placement.x + c3.x, y: placement.y + c3.y };
    const g4 = { x: placement.x + c4.x, y: placement.y + c4.y };

    // 外牆線
    dxf += line('WALL', g1.x, g1.y, g2.x, g2.y);
    dxf += line('WALL', g2.x, g2.y, g3.x, g3.y);
    dxf += line('WALL', g3.x, g3.y, g4.x, g4.y);
    dxf += line('WALL', g4.x, g4.y, g1.x, g1.y);

    // 房間中心文字標註
    const centerLocal = { x: room.width / 2, y: room.length / 2 };
    const centerRot = rotatePoint(centerLocal.x, centerLocal.y, placement.rotation);
    const centerGlobal = { x: placement.x + centerRot.x, y: placement.y + centerRot.y };

    const ping = (room.width * room.length * 0.0001 * 0.3025).toFixed(1);
    dxf += text('ROOM_LABEL', centerGlobal.x - 30, centerGlobal.y - 10, 10, room.roomName);
    dxf += text('ROOM_LABEL', centerGlobal.x - 20, centerGlobal.y + 15, 8, `${room.width}x${room.length}cm (${ping}坪)`);

    // 門洞標記
    if (room.doors) {
      for (const d of room.doors) {
        const geom = getDoorLocalGeometry(d, room.width, room.length);
        const midRot = rotatePoint(geom.midX, geom.midY, placement.rotation);
        const gx = placement.x + midRot.x;
        const gy = placement.y + midRot.y;
        if (d.anchorTag) {
          dxf += text('DOOR_ANCHOR', gx - 10, gy, 8, `[門片${d.anchorTag}] ${d.width}cm`);
        }
      }
    }

    for (const item of room.placedBlocks || []) {
      const blockCorners = [
        { x: 0, y: 0 },
        { x: item.widthCm, y: 0 },
        { x: item.widthCm, y: item.depthCm },
        { x: 0, y: item.depthCm },
      ].map((corner) => {
        const radians = ((item.rotationDeg || 0) * Math.PI) / 180;
        const local = {
          x: item.x + corner.x * Math.cos(radians) - corner.y * Math.sin(radians),
          y: item.y + corner.x * Math.sin(radians) + corner.y * Math.cos(radians),
        };
        const roomRotated = rotatePoint(local.x, local.y, placement.rotation);
        return { x: placement.x + roomRotated.x, y: placement.y + roomRotated.y };
      });
      for (let cornerIndex = 0; cornerIndex < blockCorners.length; cornerIndex += 1) {
        const start = blockCorners[cornerIndex];
        const end = blockCorners[(cornerIndex + 1) % blockCorners.length];
        dxf += line('FURNITURE', start.x, start.y, end.x, end.y);
      }
      dxf += text('FURNITURE', blockCorners[0].x, blockCorners[0].y, 5, `${item.name} ${item.widthCm}x${item.depthCm}cm`);
    }
  }

  // 全室總開間進深尺寸線 (Outer Overall Bounding Dimensions)
  const bb = stitchedResult.boundingBox;
  const dimOffset = 40;
  // 底部總寬度
  dxf += line('DIMENSION', bb.minX, bb.maxY + dimOffset, bb.maxX, bb.maxY + dimOffset);
  dxf += text('DIMENSION', (bb.minX + bb.maxX) / 2 - 40, bb.maxY + dimOffset + 15, 12, `全室總面寬: ${bb.totalWidth} cm`);
  // 左側總進深
  dxf += line('DIMENSION', bb.minX - dimOffset, bb.minY, bb.minX - dimOffset, bb.maxY);
  dxf += text('DIMENSION', bb.minX - dimOffset - 30, (bb.minY + bb.maxY) / 2, 12, `全室總進深: ${bb.totalLength} cm`);

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

export function downloadFullHouseDxfFile(
  rooms: RoomData[],
  stitchedResult: StitchedFloorPlanResult,
  projectName: string,
  projectShell?: ProjectShell | null,
) {
  const content = generateFullHouseDxfString(rooms, stitchedResult, projectName, projectShell);
  const blob = new Blob([content], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${projectName.replace(/[\\/:*?"<>|\s]+/g, '_')}_全案底圖與配置.dxf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
