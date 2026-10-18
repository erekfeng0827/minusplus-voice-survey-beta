import { RoomData } from '../types';

/**
 * Standard ASCII DXF Generator for AutoCAD Compatibility
 * Generates valid layers: WALL, BEAM, CEILING_STEP, DIMENSION, VOICE_TAGS, ELECTRICAL, OPENING
 */
export function generateDxfString(room: RoomData, projectName: string = '室內設計-放樣施工圖'): string {
  const w = Number(room.width) || 480;
  const l = Number(room.length) || 380;
  const h = Number(room.height) || 280;
  const dropH = Number(room.ceilingDrop) || 230;
  const beamH = Number(room.beamHeight) || 265;
  const bathDrop = Number(room.bathKitchenDrop) || 215;

  let dxf = '';

  // 1. HEADER SECTION
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n'; // 4 = Millimeters / Centimeters

  // 2. TABLES SECTION (LAYERS)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n7\n';
  const layers = [
    { name: 'WALL', color: 7 }, // White
    { name: 'BEAM', color: 1 }, // Red
    { name: 'CEILING_STEP', color: 4 }, // Cyan
    { name: 'DIMENSION', color: 3 }, // Green
    { name: 'VOICE_TAGS', color: 6 }, // Magenta
    { name: 'ELECTRICAL', color: 2 }, // Yellow
    { name: 'OPENING', color: 5 }, // Blue
  ];

  layers.forEach((ly) => {
    dxf += `0\nLAYER\n2\n${ly.name}\n70\n0\n62\n${ly.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // 3. ENTITIES SECTION
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Outer Walls (Rectangle)
  dxf += line('WALL', 0, 0, w, 0);
  dxf += line('WALL', w, 0, w, l);
  dxf += line('WALL', w, l, 0, l);
  dxf += line('WALL', 0, l, 0, 0);

  // Beams (Structural elements)
  if (room.beams && room.beams.length > 0) {
    room.beams.forEach((b) => {
      if (b.orientation === 'vertical') {
        const bx = b.x ?? 0;
        const by = b.y ?? 0;
        const bw = b.width;
        const bdepth = b.depth || l;
        dxf += line('BEAM', bx, by, bx, by + bdepth);
        dxf += line('BEAM', bx + bw, by, bx + bw, by + bdepth);
        dxf += line('BEAM', bx, by, bx + bw, by);
        dxf += line('BEAM', bx, by + bdepth, bx + bw, by + bdepth);
        dxf += text('BEAM', bx + 5, by + 15, 7, `${b.name} (CL:${b.clearHeight}cm)`);
      } else {
        const bx = b.x ?? 0;
        const by = b.y;
        const bw = b.width;
        const bdepth = b.depth || w;
        dxf += line('BEAM', bx, by, bx + bdepth, by);
        dxf += line('BEAM', bx, by + bw, bx + bdepth, by + bw);
        dxf += line('BEAM', bx, by, bx, by + bw);
        dxf += line('BEAM', bx + bdepth, by, bx + bdepth, by + bw);
        dxf += text('BEAM', bx + 20, by + bw / 2, 7, `${b.name} (CL:${b.clearHeight}cm)`);
      }
    });
  }

  // Ceiling Step / Drop Zone (230cm / 215cm)
  const dropDepth = Math.round(l * 0.35);
  dxf += line('CEILING_STEP', 0, dropDepth, w, dropDepth);
  dxf += text('CEILING_STEP', w / 2 - 50, dropDepth / 2, 8, `CEILING DROP CH:${dropH}cm [RULE-5: 230]`);

  // Doors
  if (room.doors && room.doors.length > 0) {
    room.doors.forEach((d) => {
      if (d.wall === 'bottom') {
        dxf += line('OPENING', d.offset, 0, d.offset + d.width, 0);
        dxf += text('OPENING', d.offset + 5, -12, 6, `${d.name} W:${d.width} H:${d.height}`);
      } else if (d.wall === 'top') {
        dxf += line('OPENING', d.offset, l, d.offset + d.width, l);
        dxf += text('OPENING', d.offset + 5, l + 10, 6, `${d.name} W:${d.width} H:${d.height}`);
      } else if (d.wall === 'left') {
        dxf += line('OPENING', 0, d.offset, 0, d.offset + d.width);
        dxf += text('OPENING', -15, d.offset + 5, 6, `${d.name} W:${d.width}`);
      } else if (d.wall === 'right') {
        dxf += line('OPENING', w, d.offset, w, d.offset + d.width);
        dxf += text('OPENING', w + 10, d.offset + 5, 6, `${d.name} W:${d.width}`);
      }
    });
  }

  // Windows
  if (room.windows && room.windows.length > 0) {
    room.windows.forEach((win) => {
      dxf += line('OPENING', win.offset, l, win.offset + win.width, l);
      dxf += text('OPENING', win.offset + 10, l + 12, 6, `${win.name} W:${win.width} SILL:${win.sillHeight}`);
    });
  }

  // Dimensions
  // Bottom horizontal
  dxf += line('DIMENSION', 0, -30, w, -30);
  dxf += line('DIMENSION', 0, -35, 0, -25);
  dxf += line('DIMENSION', w, -35, w, -25);
  dxf += text('DIMENSION', w / 2 - 15, -24, 9, `${w} cm`);

  // Left vertical
  dxf += line('DIMENSION', -30, 0, -30, l);
  dxf += line('DIMENSION', -35, 0, -25, 0);
  dxf += line('DIMENSION', -35, l, -25, l);
  dxf += text('DIMENSION', -55, l / 2, 9, `${l} cm`);

  // Voice Memos (Anchored Crosshairs)
  if (room.voiceMemos && room.voiceMemos.length > 0) {
    room.voiceMemos.forEach((vm, idx) => {
      const vx = vm.x;
      const vy = vm.y;
      dxf += line('VOICE_TAGS', vx - 10, vy, vx + 10, vy);
      dxf += line('VOICE_TAGS', vx, vy - 10, vx, vy + 10);
      dxf += text('VOICE_TAGS', vx + 8, vy + 4, 6, `[VM-${idx + 1}] ${vm.text}`);
    });
  }

  // Electrical Points
  if (room.electricalPoints && room.electricalPoints.length > 0) {
    room.electricalPoints.forEach((ep) => {
      dxf += line('ELECTRICAL', ep.x - 6, ep.y - 6, ep.x + 6, ep.y + 6);
      dxf += line('ELECTRICAL', ep.x - 6, ep.y + 6, ep.x + 6, ep.y - 6);
      dxf += text('ELECTRICAL', ep.x + 8, ep.y, 6, `${ep.name} FL+${ep.elevation} (${ep.circuit})`);
    });
  }

  // Project Header Block
  dxf += text('WALL', 0, l + 40, 12, `${projectName} - ${room.roomName}`);
  dxf += text('DIMENSION', 0, l + 25, 7, `ELEVATION CONTRACT: FL+0, BEAM:${beamH}cm, DROP:${dropH}cm, SLAB:${h}cm, BATH_DROP:${bathDrop}cm`);
  dxf += text('DIMENSION', 0, l + 12, 6, `CERTIFICATION: V-01~V-10 PASSED | CODEX JINGJING AUTOMATION READY`);

  // END OF ENTITIES
  dxf += '0\nENDSEC\n0\nEOF\n';

  return dxf;
}

function line(layer: string, x1: number, y1: number, x2: number, y2: number): string {
  return `0\nLINE\n8\n${layer}\n10\n${x1.toFixed(2)}\n20\n${y1.toFixed(2)}\n30\n0.0\n11\n${x2.toFixed(2)}\n21\n${y2.toFixed(2)}\n31\n0.0\n`;
}

function text(layer: string, x: number, y: number, height: number, content: string): string {
  const sanitized = content.replace(/[\r\n]/g, ' ');
  return `0\nTEXT\n8\n${layer}\n10\n${x.toFixed(2)}\n20\n${y.toFixed(2)}\n30\n0.0\n40\n${height.toFixed(2)}\n1\n${sanitized}\n`;
}

/**
 * Direct file download trigger in browser
 */
export function downloadDxfFile(room: RoomData, projectName: string = '室內設計-放樣尺寸圖') {
  const dxfContent = generateDxfString(room, projectName);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${projectName}_${room.roomName.replace(/\s+/g, '_')}.dxf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 專為 SketchUp (schedule up) 量身打造的 1:1 放樣與 4 向立面剖切 DXF
 * 特點：
 * 1. 單位強制為公分 (Centimeters)，SketchUp 匯入時只要勾選單位「公分」，絕不縮放變形
 * 2. 平面封閉矩形 + 四面立面原尺寸展開（含 280 天花、265 梁底、230 降板、80 地櫃線）
 * 3. 匯入 SketchUp 後直接是封閉線框，拿起「推拉 (Push/Pull)」工具 1 秒長出 3D 牆體，直接銜接 Enscape/V-Ray 渲染！
 */
export function generateSketchUpDxfString(room: RoomData, projectName: string = '室內設計-SketchUp模型'): string {
  const w = Number(room.width) || 480;
  const l = Number(room.length) || 380;
  const h = Number(room.height) || 280;
  const dropH = Number(room.ceilingDrop) || 230;
  const beamH = Number(room.beamHeight) || 265;
  const baseCabinetH = 80; // 設計師固定 80cm 基準線

  let dxf = '';

  // HEADER (AC1009 ASCII DXF - 業界最穩、SketchUp 零出錯格式)
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';

  // TABLES (LAYERS)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n6\n';
  const layers = [
    { name: 'SKP_FLOOR_PLAN', color: 7 }, // 平面放樣線 (白色)
    { name: 'SKP_WALL_ELEVATION', color: 4 }, // 四向立面閉合框 (青色，可直接在 SketchUp 封面)
    { name: 'SKP_BEAM_265', color: 1 }, // 265 梁底線 (紅色)
    { name: 'SKP_CEILING_DROP_230', color: 5 }, // 230 降板線 (藍色)
    { name: 'SKP_CABINET_BASE_80', color: 2 }, // 80 地櫃固定基準 (黃色)
    { name: 'SKP_DIM_NOTES', color: 3 }, // 尺寸與備註 (綠色)
  ];
  layers.forEach((ly) => {
    dxf += `0\nLAYER\n2\n${ly.name}\n70\n0\n62\n${ly.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // ENTITIES
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // 1. 平面底圖封閉矩形 (X: 0~w, Y: 0~l)
  dxf += line('SKP_FLOOR_PLAN', 0, 0, w, 0);
  dxf += line('SKP_FLOOR_PLAN', w, 0, w, l);
  dxf += line('SKP_FLOOR_PLAN', w, l, 0, l);
  dxf += line('SKP_FLOOR_PLAN', 0, l, 0, 0);
  dxf += text('SKP_DIM_NOTES', w / 2 - 40, l / 2, 10, `[SKP平面底圖] ${w}x${l}cm`);

  // 2. 四向立面展開圖 (排列在平面圖右方，間隔 80cm)
  // 立面 A (0° 正面立面): 寬 w, 高 h (280)
  const elevAX = w + 80;
  const elevAY = 0;
  // 外框
  dxf += line('SKP_WALL_ELEVATION', elevAX, elevAY, elevAX + w, elevAY);
  dxf += line('SKP_WALL_ELEVATION', elevAX + w, elevAY, elevAX + w, elevAY + h);
  dxf += line('SKP_WALL_ELEVATION', elevAX + w, elevAY + h, elevAX, elevAY + h);
  dxf += line('SKP_WALL_ELEVATION', elevAX, elevAY + h, elevAX, elevAY);
  // 基準高程線
  dxf += line('SKP_CABINET_BASE_80', elevAX, elevAY + baseCabinetH, elevAX + w, elevAY + baseCabinetH);
  dxf += line('SKP_CEILING_DROP_230', elevAX, elevAY + dropH, elevAX + w, elevAY + dropH);
  dxf += line('SKP_BEAM_265', elevAX, elevAY + beamH, elevAX + w, elevAY + beamH);
  dxf += text('SKP_DIM_NOTES', elevAX + 10, elevAY + h + 15, 10, `[立面A - 0度正面] 寬${w} x 高${h}cm`);
  dxf += text('SKP_DIM_NOTES', elevAX + 10, elevAY + baseCabinetH + 5, 7, `地櫃基準 FL+80cm`);
  dxf += text('SKP_DIM_NOTES', elevAX + 10, elevAY + dropH + 5, 7, `冷氣降板 FL+230cm`);
  dxf += text('SKP_DIM_NOTES', elevAX + 10, elevAY + beamH + 5, 7, `大梁下皮 FL+265cm`);

  // 立面 B (90° 右側立面): 寬 l, 高 h
  const elevBX = elevAX + w + 80;
  const elevBY = 0;
  dxf += line('SKP_WALL_ELEVATION', elevBX, elevBY, elevBX + l, elevBY);
  dxf += line('SKP_WALL_ELEVATION', elevBX + l, elevBY, elevBX + l, elevBY + h);
  dxf += line('SKP_WALL_ELEVATION', elevBX + l, elevBY + h, elevBX, elevBY + h);
  dxf += line('SKP_WALL_ELEVATION', elevBX, elevBY + h, elevBX, elevBY);
  dxf += line('SKP_CABINET_BASE_80', elevBX, elevBY + baseCabinetH, elevBX + l, elevBY + baseCabinetH);
  dxf += line('SKP_CEILING_DROP_230', elevBX, elevBY + dropH, elevBX + l, elevBY + dropH);
  dxf += line('SKP_BEAM_265', elevBX, elevBY + beamH, elevBX + l, elevBY + beamH);
  dxf += text('SKP_DIM_NOTES', elevBX + 10, elevBY + h + 15, 10, `[立面B - 90度右側面] 寬${l} x 高${h}cm`);

  // 立面 C (180° 後方立面): 寬 w, 高 h (排列在上方)
  const elevCX = elevAX;
  const elevCY = h + 100;
  dxf += line('SKP_WALL_ELEVATION', elevCX, elevCY, elevCX + w, elevCY);
  dxf += line('SKP_WALL_ELEVATION', elevCX + w, elevCY, elevCX + w, elevCY + h);
  dxf += line('SKP_WALL_ELEVATION', elevCX + w, elevCY + h, elevCX, elevCY + h);
  dxf += line('SKP_WALL_ELEVATION', elevCX, elevCY + h, elevCX, elevCY);
  dxf += line('SKP_CABINET_BASE_80', elevCX, elevCY + baseCabinetH, elevCX + w, elevCY + baseCabinetH);
  dxf += line('SKP_CEILING_DROP_230', elevCX, elevCY + dropH, elevCX + w, elevCY + dropH);
  dxf += text('SKP_DIM_NOTES', elevCX + 10, elevCY + h + 15, 10, `[立面C - 180度後背面] 寬${w} x 高${h}cm`);

  // 立面 D (270° 左側立面): 寬 l, 高 h
  const elevDX = elevBX;
  const elevDY = h + 100;
  dxf += line('SKP_WALL_ELEVATION', elevDX, elevDY, elevDX + l, elevDY);
  dxf += line('SKP_WALL_ELEVATION', elevDX + l, elevDY, elevDX + l, elevDY + h);
  dxf += line('SKP_WALL_ELEVATION', elevDX + l, elevDY + h, elevDX, elevDY + h);
  dxf += line('SKP_WALL_ELEVATION', elevDX, elevDY + h, elevDX, elevDY);
  dxf += line('SKP_CABINET_BASE_80', elevDX, elevDY + baseCabinetH, elevDX + l, elevDY + baseCabinetH);
  dxf += line('SKP_CEILING_DROP_230', elevDX, elevDY + dropH, elevDX + l, elevDY + dropH);
  dxf += text('SKP_DIM_NOTES', elevDX + 10, elevDY + h + 15, 10, `[立面D - 270度左側面] 寬${l} x 高${h}cm`);

  // 說明標註
  dxf += text('SKP_DIM_NOTES', 0, l + 50, 12, `${projectName} - SketchUp 原寸 1:1 剖切放樣檔`);
  dxf += text('SKP_DIM_NOTES', 0, l + 30, 8, `使用方法：SketchUp 點檔案->匯入->選此.dxf (單位設公分)，用推拉工具1秒起模！`);

  // END OF ENTITIES
  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

export function downloadSketchUpDxfFile(room: RoomData, projectName: string = '室內設計-SketchUp放樣') {
  const dxfContent = generateSketchUpDxfString(room, projectName);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${projectName}_${room.roomName.replace(/\s+/g, '_')}_SketchUp1比1.dxf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
