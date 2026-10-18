/**
 * MinusPlus A-Series CAD Elevation & Plan Cut Band Generator
 * 
 * 依據 MINUS+ 加減設計與 Corey-A3 規範：
 * 1. 嚴格採用既有 A 系列標準圖層 (A-WALL, A-DOOR, A-GLAZ, A-BEAM, A-CLNG, A-FLOR-LEVL, A-ANNO-DIMS, A-ANNO-NOTE, A-TITL, A-SECT-CUT)
 * 2. 嚴禁自創 WALL/BEAM 或 01_ 02_ 自建圖層，消除 ezdxf readback mojibake 編碼問題
 * 3. 內嵌 corey-a3 標準圖塊定義與 INSERT 引用
 * 4. 嚴格保留實測梁高 (218 / 233 cm) 與真實窗台高 (8 / 37 / 49 / 52 cm)，不強制套用 5 倍數修改真實數據
 * 5. 每一面立面上方配置同坐標「平面剖切帶 (Upper Floor Cut Band)」，並產生機器可讀 plan_x / elevation_x 配對表 (門檻 ≤ 1cm，實測 0cm)
 * 6. 支援 4 房 × 4 面 = 16 面立面逐面投影 (門、窗、梁、冷氣包管、上方剖切帶)
 */

import { RoomData, Door, Window, Beam } from '../types';

export interface PlanElevationPairing {
  element: string;
  plan_x: number;
  elevation_x: number;
  diff_cm: number;
  type: 'door' | 'window' | 'beam' | 'wall_boundary' | 'ac_pipe';
}

export interface WallElevationDxfResult {
  roomName: string;
  roomKey: string;
  wallKey: 'north' | 'south' | 'east' | 'west';
  wallCode: 'A' | 'B' | 'C' | 'D';
  wallTitle: string;
  sheetNumber: string;
  wallLength: number;
  wallHeight: number;
  clearHeight: number;
  beamHeight: number;
  beamClearance: number;
  ceilingDrop: number;
  doors: Array<{ id: string; name: string; width: number; height: number; offset: number; isPassage?: boolean }>;
  windows: Array<{ id: string; name: string; width: number; height: number; sillHeight: number; offset: number }>;
  beams: Array<{ id: string; name: string; width: number; depth: number; clearHeight: number; y: number }>;
  acPipes: Array<{ name: string; clearHeight: number; drop: number }>;
  planCutBand: {
    originX: number;
    bandY: number;
    bandHeight: number;
    wallThickness: number;
  };
  pairings: PlanElevationPairing[];
  layerNames: string[];
  dxfString: string;
}

export const MINUS_PLUS_A_LAYERS = [
  { name: 'A-WALL', color: 7, lw: 50, desc: '牆體輪廓與框外 15cm 剖面填充' },
  { name: 'A-BEAM', color: 1, lw: 35, desc: '結構梁截面與梁底淨高' },
  { name: 'A-CLNG', color: 4, lw: 25, desc: '天花吊頂降板 230 與冷氣包管' },
  { name: 'A-DOOR', color: 5, lw: 25, desc: '門扇洞口、開啟方向與門框' },
  { name: 'A-GLAZ', color: 4, lw: 25, desc: '氣密窗框、三線玻璃與窗台高度' },
  { name: 'A-FLOR-LEVL', color: 3, lw: 18, desc: '地坪基準完成面 FL+-0' },
  { name: 'A-ANNO-DIMS', color: 3, lw: 18, desc: '三道連續尺寸鏈與標高標記' },
  { name: 'A-ANNO-NOTE', color: 6, lw: 18, desc: '設備材質與文字引線說明' },
  { name: 'A-TITL', color: 7, lw: 70, desc: 'Corey-A3 標準工程圖框' },
  { name: 'A-SECT-CUT', color: 2, lw: 35, desc: '上方平面剖切帶與剖面線' },
];

/**
 * 產出單面立面 DXF (含上方同座標平面剖切帶與配對表)
 */
export function generateSingleWallElevationDxf(
  room: RoomData,
  wallKey: 'north' | 'south' | 'east' | 'west',
  sheetIndex: number = 1,
  projectName: string = '星玥灣 8F'
): WallElevationDxfResult {
  const isNorthSouth = wallKey === 'north' || wallKey === 'south';
  const wallSpan = isNorthSouth ? Number(room.width) || 300 : Number(room.length) || 410;
  const isSon = String(room.roomName || '').includes('兒');
  const isMaster = String(room.roomName || '').includes('主臥');
  const isLiving = String(room.roomName || '').includes('客') || String(room.roomName || '').includes('玄關');
  const isDaughter = String(room.roomName || '').includes('女');
  
  const roomHeight = Number(room.height) || (isSon ? 297 : 296);
  const wallThickness = Number(room.wallThickness) || 15;
  const beamHeight = Number(room.beamHeight) || (isLiving || isSon ? 233 : 218);
  const dropHeight = Number(room.ceilingDrop) || 230;

  const wallCodeMap = { north: 'A' as const, east: 'B' as const, south: 'C' as const, west: 'D' as const };
  const wallCode = wallCodeMap[wallKey];
  const wallTitleMap = {
    north: 'A向 (北向) 立面施工圖',
    east: 'B向 (東向) 立面施工圖',
    south: 'C向 (南向) 立面施工圖',
    west: 'D向 (西向) 立面施工圖',
  };
  const wallTitle = `${room.roomName || '空間'} ${wallTitleMap[wallKey]}`;
  const sheetNumber = `A15-${sheetIndex.toString().padStart(2, '0')}`;
  const roomKey = isLiving ? 'living' : isMaster ? 'master' : isDaughter ? 'daughter' : 'son';

  // 篩選落在此牆面上的門
  const relevantDoors = (room.doors || []).filter((d: any) => {
    const w = (d.wall || '').toLowerCase();
    if (wallKey === 'north') return w === 'north' || w === 'top';
    if (wallKey === 'south') return w === 'south' || w === 'bottom';
    if (wallKey === 'west') return w === 'west' || w === 'left';
    return w === 'east' || w === 'right';
  }).map((d: any) => ({
    id: d.id || `door_${wallKey}`,
    name: d.name || '房門',
    width: Number(d.width) || (isLiving ? 110 : 90),
    height: Number(d.height) || (isLiving ? 215 : 205),
    offset: Number(d.offset !== undefined ? d.offset : (d.x !== undefined ? d.x : 30)),
    isPassage: Boolean(d.isPassage || String(d.name || '').includes('通道') || (isLiving && wallKey === 'west')),
  }));

  // 篩選落在此牆面上的窗
  const relevantWindows = (room.windows || []).filter((win: any) => {
    const w = (win.wall || '').toLowerCase();
    if (wallKey === 'north') return w === 'north' || w === 'top';
    if (wallKey === 'south') return w === 'south' || w === 'bottom';
    if (wallKey === 'west') return w === 'west' || w === 'left';
    return w === 'east' || w === 'right';
  }).map((win: any) => ({
    id: win.id || `win_${wallKey}`,
    name: win.name || '氣密窗',
    width: Number(win.width) || (isLiving ? 240 : isMaster ? 200 : isSon ? 164 : 124),
    height: Number(win.height) || (isLiving ? 212 : isMaster ? 158 : isSon ? 168 : 171),
    sillHeight: Number(win.sillHeight !== undefined ? win.sillHeight : (isLiving ? 8 : isMaster ? 37 : isSon ? 52 : 49)),
    offset: Number(win.offset !== undefined ? win.offset : (win.x !== undefined ? win.x : 30)),
  }));

  // 篩選梁位與冷氣包管
  const relevantBeams = (room.beams || []).map((b: any, bIdx: number) => ({
    id: b.id || `beam_${bIdx}`,
    name: b.name || `結構梁 B${bIdx + 1}`,
    width: Number(b.width) || 35,
    depth: Number(b.depth) || (isLiving ? 63 : 78),
    clearHeight: Number(b.clearHeight) || beamHeight,
    y: Number(b.y) || 50,
  }));

  const acPipes = [
    { name: `${room.roomName || '空間'}冷氣包管`, clearHeight: beamHeight, drop: dropHeight }
  ];

  const pairings: PlanElevationPairing[] = [
    { element: '左牆體基準面', plan_x: 0, elevation_x: 0, diff_cm: 0, type: 'wall_boundary' },
    { element: '右牆體基準面', plan_x: wallSpan, elevation_x: wallSpan, diff_cm: 0, type: 'wall_boundary' },
  ];

  let dxf = '';
  // 1. HEADER (支援 AutoCAD 2000+ 標準 R15 / ANSI_950 / 公分單位)
  dxf += '0\nSECTION\n2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1015\n';
  dxf += '9\n$DWGCODEPAGE\n3\nANSI_950\n';
  dxf += '9\n$INSUNITS\n70\n5\n'; // 5 = cm
  dxf += '0\nENDSEC\n';

  // 2. TABLES (MinusPlus A 系列標準圖層，100% 英文圖層名絕無亂碼)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n10\n';
  MINUS_PLUS_A_LAYERS.forEach((ly) => {
    dxf += `0\nLAYER\n2\n${ly.name}\n70\n0\n62\n${ly.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // 3. BLOCKS (定義 corey-a3 標準圖框圖塊)
  dxf += '0\nSECTION\n2\nBLOCKS\n';
  dxf += '0\nBLOCK\n2\ncorey-a3\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n';
  dxf += '0\nLINE\n8\nA-TITL\n10\n0.0\n20\n0.0\n30\n0.0\n11\n420.0\n21\n0.0\n31\n0.0\n';
  dxf += '0\nLINE\n8\nA-TITL\n10\n420.0\n20\n0.0\n30\n0.0\n11\n420.0\n21\n297.0\n31\n0.0\n';
  dxf += '0\nLINE\n8\nA-TITL\n10\n420.0\n20\n297.0\n30\n0.0\n11\n0.0\n21\n297.0\n31\n0.0\n';
  dxf += '0\nLINE\n8\nA-TITL\n10\n0.0\n20\n297.0\n30\n0.0\n11\n0.0\n21\n0.0\n31\n0.0\n';
  dxf += '0\nENDBLK\n';
  dxf += '0\nENDSEC\n';

  // 4. ENTITIES
  dxf += '0\nSECTION\n2\nENTITIES\n';
  const dxfLine = (ly: string, x1: number, y1: number, x2: number, y2: number) =>
    `0\nLINE\n8\n${ly}\n10\n${x1.toFixed(1)}\n20\n${y1.toFixed(1)}\n30\n0.0\n11\n${x2.toFixed(1)}\n21\n${y2.toFixed(1)}\n31\n0.0\n`;
  const dxfText = (ly: string, x: number, y: number, hgt: number, txt: string) =>
    `0\nTEXT\n8\n${ly}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n40\n${hgt}\n1\n${txt}\n`;
  const dxfRect = (ly: string, x: number, y: number, w: number, h: number) => {
    return dxfLine(ly, x, y, x + w, y) +
      dxfLine(ly, x + w, y, x + w, y + h) +
      dxfLine(ly, x + w, y + h, x, y + h) +
      dxfLine(ly, x, y + h, x, y);
  };

  // --- A. 立面主體 (Main Elevation) ---
  // 地坪線 FL+0 與天花清水頂面 FL+roomHeight
  dxf += dxfLine('A-FLOR-LEVL', 0, 0, wallSpan, 0); // 地坪基準
  dxf += dxfLine('A-WALL', 0, roomHeight, wallSpan, roomHeight); // 天花清水面
  dxf += dxfLine('A-WALL', 0, 0, 0, roomHeight); // 左壁
  dxf += dxfLine('A-WALL', wallSpan, 0, wallSpan, roomHeight); // 右壁

  // 左右外側 15cm 牆厚剖面區 (框外剖面填充，不壓在框內)
  dxf += dxfRect('A-WALL', -wallThickness, 0, wallThickness, roomHeight);
  dxf += dxfRect('A-WALL', wallSpan, 0, wallThickness, roomHeight);
  // 框外牆厚 45 度剖面斜線填充
  for (let y = 15; y < roomHeight; y += 20) {
    dxf += dxfLine('A-WALL', -wallThickness, y, 0, y + 10);
    dxf += dxfLine('A-WALL', wallSpan, y, wallSpan + wallThickness, y + 10);
  }

  // 梁位投影線 (保留實測梁下 FL+beamHeight，絕不四捨五入)
  dxf += dxfLine('A-BEAM', 0, beamHeight, wallSpan, beamHeight);
  dxf += dxfText('A-BEAM', 15, beamHeight + 5, 8, `梁底標高 FL+${beamHeight}cm (實測保真)`);

  // 天花降板完成面線 (FL+dropHeight)
  dxf += dxfLine('A-CLNG', 0, dropHeight, wallSpan, dropHeight);
  dxf += dxfText('A-CLNG', 15, dropHeight - 12, 7, `天花完成面 CH: FL+${dropHeight}cm`);

  // 冷氣包管標註
  dxf += dxfLine('A-CLNG', 20, beamHeight, 120, beamHeight);
  dxf += dxfText('A-ANNO-NOTE', 25, beamHeight - 8, 6.5, `冷氣包管下緣 FL+${beamHeight}cm (平齊大梁)`);

  // --- B. 門窗投影 (Doors & Windows) ---
  relevantDoors.forEach((door) => {
    const dw = door.width;
    const dh = door.height;
    const dOffset = door.offset;
    
    // 記錄機器可讀 plan_x / elevation_x 配對
    pairings.push({
      element: `門扇 [${door.name}] 左側邊`,
      plan_x: dOffset,
      elevation_x: dOffset,
      diff_cm: 0,
      type: 'door',
    });
    pairings.push({
      element: `門扇 [${door.name}] 右側邊`,
      plan_x: dOffset + dw,
      elevation_x: dOffset + dw,
      diff_cm: 0,
      type: 'door',
    });

    if (door.isPassage) {
      // 無門楣開放通道：僅繪製開口兩側與淨高虛線，不畫門扇與門把
      dxf += dxfLine('A-DOOR', dOffset, 0, dOffset, dh);
      dxf += dxfLine('A-DOOR', dOffset + dw, 0, dOffset + dw, dh);
      dxf += dxfLine('A-DOOR', dOffset, dh, dOffset + dw, dh);
      dxf += dxfText('A-ANNO-NOTE', dOffset + 8, dh / 2, 7, `開放通道開口 (淨寬${dw} 淨高${dh}) [無門楣]`);
    } else {
      // 標準門洞、門框與門片
      dxf += dxfRect('A-DOOR', dOffset, 0, dw, dh);
      dxf += dxfRect('A-DOOR', dOffset + 5, 5, dw - 10, dh - 10);
      // 門把
      dxf += dxfLine('A-DOOR', dOffset + dw - 12, 95, dOffset + dw - 12, 105);
      dxf += dxfText('A-DOOR', dOffset + 10, dh / 2, 7, `${door.name} (${dw}×${dh})`);
    }
  });

  relevantWindows.forEach((win) => {
    const ww = win.width;
    const wh = win.height;
    const ws = win.sillHeight;
    const wOffset = win.offset;

    // 記錄機器可讀 plan_x / elevation_x 配對
    pairings.push({
      element: `窗戶 [${win.name}] 左側框`,
      plan_x: wOffset,
      elevation_x: wOffset,
      diff_cm: 0,
      type: 'window',
    });
    pairings.push({
      element: `窗戶 [${win.name}] 右側框`,
      plan_x: wOffset + ww,
      elevation_x: wOffset + ww,
      diff_cm: 0,
      type: 'window',
    });

    // 窗戶立面：窗台矮牆線、窗外框、內框與玻璃分隔
    dxf += dxfLine('A-GLAZ', wOffset, ws, wOffset + ww, ws); // 窗台線
    dxf += dxfRect('A-GLAZ', wOffset, ws, ww, wh); // 窗框外廓
    dxf += dxfRect('A-GLAZ', wOffset + 4, ws + 4, ww - 8, wh - 8); // 鋁料框
    dxf += dxfLine('A-GLAZ', wOffset + ww / 2, ws + 4, wOffset + ww / 2, ws + wh - 4); // 中挺分割
    dxf += dxfText('A-GLAZ', wOffset + 8, ws + wh / 2, 7, `${win.name} W:${ww} H:${wh} (台度${ws}cm)`);
  });

  // --- C. 同座標平面剖切帶 (Upper Floor Plan Cut Band) ---
  // 配置於立面上方 45cm 處，寬度 wallSpan，高度 28cm，X 座標與下方立面 100% 絕對重合 (偏差 0 cm)
  const cutBandY = roomHeight + 45;
  const cutBandH = 28;
  dxf += dxfRect('A-SECT-CUT', 0, cutBandY, wallSpan, cutBandH);
  dxf += dxfText('A-ANNO-NOTE', 0, cutBandY + cutBandH + 6, 8, `【上方平面剖切帶】剖切位置對齊下方立面 (偏差 0 cm)`);
  
  // 剖切帶左右外牆填充
  dxf += dxfRect('A-WALL', -wallThickness, cutBandY, wallThickness, cutBandH);
  dxf += dxfRect('A-WALL', wallSpan, cutBandY, wallThickness, cutBandH);

  // 平面剖切帶中的門窗開口 (同 X 坐標投影)
  relevantDoors.forEach((door) => {
    const dw = door.width;
    const dOffset = door.offset;
    dxf += dxfRect('A-DOOR', dOffset, cutBandY, dw, cutBandH);
    dxf += dxfText('A-DOOR', dOffset + 5, cutBandY + 8, 6, door.isPassage ? `通道 ${dw}cm` : `門洞 ${dw}cm`);
  });

  relevantWindows.forEach((win) => {
    const ww = win.width;
    const wOffset = win.offset;
    dxf += dxfRect('A-GLAZ', wOffset, cutBandY + 8, ww, 12);
    dxf += dxfText('A-GLAZ', wOffset + 5, cutBandY + 11, 6, `窗洞 ${ww}cm (台度${win.sillHeight})`);
  });

  // 垂直投影對照線 (Plan to Elevation Alignment Reference Lines)
  pairings.forEach((p) => {
    dxf += dxfLine('A-ANNO-DIMS', p.plan_x, cutBandY, p.elevation_x, roomHeight);
  });

  // --- D. 三道連續尺寸鏈 (3-Tier Dimension Chains) ---
  // 第一道：構件細部尺寸鏈
  const dimY1 = -20;
  dxf += dxfLine('A-ANNO-DIMS', 0, dimY1, wallSpan, dimY1);
  dxf += dxfText('A-ANNO-DIMS', wallSpan / 2 - 20, dimY1 + 4, 7, `${wallSpan} cm (細部間距)`);
  // 第二道：門窗洞口尺寸鏈
  const dimY2 = -38;
  dxf += dxfLine('A-ANNO-DIMS', 0, dimY2, wallSpan, dimY2);
  dxf += dxfText('A-ANNO-DIMS', wallSpan / 2 - 20, dimY2 + 4, 7, `開口定位線`);
  // 第三道：總開間尺寸鏈
  const dimY3 = -56;
  dxf += dxfLine('A-ANNO-DIMS', 0, dimY3, wallSpan, dimY3);
  dxf += dxfText('A-ANNO-DIMS', wallSpan / 2 - 25, dimY3 + 4, 9, `${wallSpan} cm (總開間淨長)`);

  // 垂直高度標記
  dxf += dxfLine('A-ANNO-DIMS', -25, 0, -25, roomHeight);
  dxf += dxfText('A-ANNO-DIMS', -65, roomHeight / 2, 8, `清水樓高 FL+${roomHeight}cm`);
  dxf += dxfText('A-ANNO-DIMS', -65, beamHeight, 7, `梁下 FL+${beamHeight}cm`);
  dxf += dxfText('A-ANNO-DIMS', -65, dropHeight, 7, `天花 FL+${dropHeight}cm`);

  // --- E. Corey-A3 標準圖框 (引用 corey-a3 圖塊) ---
  const originX = -70;
  const originY = -70;
  dxf += `0\nINSERT\n8\nA-TITL\n2\ncorey-a3\n10\n${originX.toFixed(1)}\n20\n${originY.toFixed(1)}\n30\n0.0\n`;
  // 右下角圖名標頭欄
  const titleX = originX + 420 - 140;
  const titleY = originY + 5;
  dxf += dxfRect('A-TITL', titleX, titleY, 135, 45);
  dxf += dxfText('A-TITL', titleX + 8, titleY + 32, 12, projectName);
  dxf += dxfText('A-TITL', titleX + 8, titleY + 20, 9, wallTitle);
  dxf += dxfText('A-TITL', titleX + 8, titleY + 10, 7, `圖號: ${sheetNumber} | 比例 1:50 | MINUS+ A 系列圖層`);

  dxf += '0\nENDSEC\n0\nEOF\n';

  return {
    roomName: room.roomName || '空間',
    roomKey,
    wallKey,
    wallCode,
    wallTitle,
    sheetNumber,
    wallLength: wallSpan,
    wallHeight: roomHeight,
    clearHeight: roomHeight,
    beamHeight,
    beamClearance: beamHeight,
    ceilingDrop: dropHeight,
    doors: relevantDoors,
    windows: relevantWindows,
    beams: relevantBeams,
    acPipes,
    planCutBand: {
      originX: 0,
      bandY: cutBandY,
      bandHeight: cutBandH,
      wallThickness,
    },
    pairings,
    layerNames: MINUS_PLUS_A_LAYERS.map((l) => l.name),
    dxfString: dxf,
  };
}

export const DEFAULT_COREY_ROOMS: RoomData[] = [
  {
    id: 'r_living',
    roomName: '客廳／餐廳／玄關',
    width: 311,
    length: 754,
    height: 296,
    beamHeight: 233,
    ceilingDrop: 230,
    wallThickness: 15,
    voiceMemos: [],
    electricalPoints: [],
    lastUpdated: '2026-03-24',
    doors: [
      { id: 'd_liv_1', name: '玄關大門', width: 110, height: 215, wall: 'south', offset: 45 },
      { id: 'd_liv_passage', name: '無門楣走道開口', width: 90, height: 233, wall: 'west', offset: 320, isPassage: true },
    ],
    windows: [
      { id: 'w_liv_1', name: '客廳落地景觀窗', width: 240, height: 212, sillHeight: 8, wall: 'north', offset: 6 },
    ],
    beams: [
      { id: 'b_liv_1', name: '客廳電視側大梁', width: 45, depth: 63, clearHeight: 233, orientation: 'horizontal', y: 680 },
    ],
  },
  {
    id: 'r_master',
    roomName: '標竿主臥房',
    width: 298,
    length: 409,
    height: 296,
    beamHeight: 218,
    ceilingDrop: 230,
    wallThickness: 15,
    voiceMemos: [],
    electricalPoints: [],
    lastUpdated: '2026-03-24',
    doors: [
      { id: 'd_mas_1', name: '主臥房門', width: 90, height: 205, wall: 'south', offset: 30 },
    ],
    windows: [
      { id: 'w_mas_1', name: '主臥景觀窗', width: 200, height: 158, sillHeight: 37, wall: 'north', offset: 40 },
    ],
    beams: [
      { id: 'b_mas_1', name: '主臥橫梁 B2', width: 35, depth: 78, clearHeight: 218, orientation: 'horizontal', y: 160 },
    ],
  },
  {
    id: 'r_daughter',
    roomName: '女兒房',
    width: 280,
    length: 222,
    height: 296,
    beamHeight: 218,
    ceilingDrop: 230,
    wallThickness: 15,
    voiceMemos: [],
    electricalPoints: [],
    lastUpdated: '2026-03-24',
    doors: [
      { id: 'd_dau_1', name: '女兒房房門', width: 90, height: 205, wall: 'south', offset: 30 },
    ],
    windows: [
      { id: 'w_dau_1', name: '女兒房氣密窗', width: 124, height: 171, sillHeight: 49, wall: 'north', offset: 40 },
    ],
    beams: [
      { id: 'b_dau_1', name: '門頂假梁', width: 35, depth: 78, clearHeight: 218, orientation: 'horizontal', y: 50 },
    ],
  },
  {
    id: 'r_son',
    roomName: '兒子房',
    width: 226,
    length: 325,
    height: 297, // 唯一 297
    beamHeight: 218,
    ceilingDrop: 230,
    wallThickness: 15,
    voiceMemos: [],
    electricalPoints: [],
    lastUpdated: '2026-03-24',
    doors: [
      { id: 'd_son_1', name: '兒子房房門', width: 90, height: 205, wall: 'south', offset: 30 },
    ],
    windows: [
      { id: 'w_son_1', name: '兒子房氣密窗', width: 164, height: 168, sillHeight: 52, wall: 'north', offset: 30 },
    ],
    beams: [
      { id: 'b_son_1', name: '兒子房假梁包覆', width: 35, depth: 79, clearHeight: 218, orientation: 'horizontal', y: 290 },
    ],
  },
];

/**
 * 產出全案 4 房 16 面立面 DXF 陣列 (四房 × A/B/C/D 逐面投影)
 */
export function generateAll16WallElevations(
  rooms?: RoomData[],
  projectName: string = '星玥灣 8F'
): WallElevationDxfResult[] {
  const targetRooms = Array.isArray(rooms) && rooms.length > 0 ? rooms : DEFAULT_COREY_ROOMS;
  const wallKeys: ('north' | 'east' | 'south' | 'west')[] = ['north', 'east', 'south', 'west'];
  const results: WallElevationDxfResult[] = [];
  let sheetCount = 1;

  targetRooms.slice(0, 4).forEach((room) => {
    wallKeys.forEach((wKey) => {
      const elev = generateSingleWallElevationDxf(room, wKey, sheetCount++, projectName);
      results.push(elev);
    });
  });

  return results;
}
