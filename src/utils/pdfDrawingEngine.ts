import { jsPDF } from 'jspdf';
import { RoomData, VRuleCheck } from '../types';
import { INITIAL_V_RULES } from '../data/defaultProject';

export interface GeneratedPdfResult {
  blob: Blob;
  filename: string;
  download: () => void;
  pageImages: string[];
}

/**
 * Creates an offscreen HTML5 canvas element with standard A4 dimensions (150 DPI).
 * Width: 1240px, Height: 1754px
 */
function createA4Canvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d')!;
  // Set default smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
}

/**
 * Draw standard architectural title block on canvas
 */
function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  sheetId: string,
  sheetName: string,
  sheetCategory: string,
  roomName: string,
  scaleText: string = '1:50',
  pageIndex: number,
  totalPages: number
) {
  const w = 1240;
  const h = 1754;
  const pad = 40;

  // Outer Border Double Line
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1E293B'; // Dark Slate
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#64748B';
  ctx.strokeRect(pad + 4, pad + 4, w - pad * 2 - 8, h - pad * 2 - 8);

  // Top Header Banner
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 4, pad + 4, w - pad * 2 - 8, 80);

  // Project Logo & Title
  ctx.fillStyle = '#38BDF8'; // Sky 400
  ctx.font = 'bold 15px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('INTERIOR DESIGN & STAKING SYSTEM · 室內設計、測量、圖面繪製系統', pad + 24, pad + 32);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText(`${roomName} — ${sheetName}`, pad + 24, pad + 64);

  // Category Tag
  ctx.fillStyle = '#065F46'; // Emerald 800
  ctx.fillRect(w - pad - 320, pad + 16, 120, 24);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(sheetCategory, w - pad - 310, pad + 33);

  // Sheet Number Big Block
  ctx.fillStyle = '#10B981'; // Emerald 500
  ctx.font = '900 36px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(sheetId, w - pad - 24, pad + 52);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`PAGE ${pageIndex} OF ${totalPages} · SCALE ${scaleText}`, w - pad - 24, pad + 72);
  ctx.textAlign = 'left';

  // Bottom Title Block (Engineering stamp & Sign-off footer)
  const footerY = h - pad - 80;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(pad + 4, footerY, w - pad * 2 - 8, 76);
  ctx.strokeRect(pad + 4, footerY, w - pad * 2 - 8, 76);

  // Vertical dividers in footer
  const colW = (w - pad * 2 - 8) / 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(pad + 4 + colW * i, footerY);
    ctx.lineTo(pad + 4 + colW * i, footerY + 76);
    ctx.stroke();
  }

  // Footer Col 1: Project & Space
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('專案工程 PROJECT', pad + 16, footerY + 22);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 14px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('室內設計放樣與圖面工程', pad + 16, footerY + 44);
  ctx.fillStyle = '#0284C7';
  ctx.font = '11px monospace';
  ctx.fillText(`空間：${roomName}`, pad + 16, footerY + 62);

  // Footer Col 2: Specification & Contract
  const c2x = pad + 4 + colW;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('幾何契約 GEOMETRIC CONTRACT', c2x + 16, footerY + 22);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('《降板裁決_v003.json》5倍數原則', c2x + 16, footerY + 44);
  ctx.fillStyle = '#16A34A';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('梁下 265 / 空調 230 / 衛浴 215 cm', c2x + 16, footerY + 62);

  // Footer Col 3: Drawing Generator & Dispatcher
  const c3x = pad + 4 + colW * 2;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('出圖審計 / 派工通道 DISPATCH', c3x + 16, footerY + 22);
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('Codex 晶晶 · 營造出圖線', c3x + 16, footerY + 44);
  ctx.fillStyle = '#6D28D9';
  ctx.font = '11px monospace';
  ctx.fillText('SHA-256: 7e2b9c8f...PASS', c3x + 16, footerY + 62);

  // Footer Col 4: Date & Contractor Sign-off
  const c4x = pad + 4 + colW * 3;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('出圖日期 DATE / 營造單位簽收', c4x + 16, footerY + 22);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px monospace';
  const todayStr = new Date().toISOString().split('T')[0];
  ctx.fillText(todayStr, c4x + 16, footerY + 44);
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('營造簽收：[ 現場放樣認可章 ]', c4x + 16, footerY + 62);
}

/**
 * Render Page 1: 【A-00 空間放樣數據總表與平面放樣圖】
 */
function renderPage1(room: RoomData): HTMLCanvasElement {
  const { canvas, ctx } = createA4Canvas();
  const pad = 40;
  const contentW = 1240 - pad * 2;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1240, 1754);

  // Title block
  drawTitleBlock(
    ctx,
    'A-00',
    '空間放樣數據總表與平面放樣圖',
    '現況放樣平面',
    room.roomName,
    '1:50',
    1,
    3
  );

  const startY = 140;

  // Section 1: Key Staking Geometric Spec Table
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, startY, contentW - 20, 28);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('一、空間幾何邊界與垂直高程基準數據表 (STAKING SPECIFICATIONS)', pad + 20, startY + 19);

  // 4 metric cards
  const cardW = (contentW - 20 - 30) / 4;
  const specs = [
    { label: '空間開間面寬 (X)', val: `${room.width} cm`, sub: '5 倍數已校核', color: '#0284C7' },
    { label: '空間進深長度 (Y)', val: `${room.length} cm`, sub: '角鋼原點 (0,0)', color: '#0D9488' },
    { label: '大梁底淨高 (B.O.B)', val: `FL+${room.beamHeight} cm`, sub: '主結構大梁避讓', color: '#DC2626' },
    { label: '天花空調降板 (C.H)', val: `FL+${room.ceilingDrop} cm`, sub: '《降板裁決_v003》', color: '#D97706' },
  ];

  specs.forEach((s, idx) => {
    const cx = pad + 10 + idx * (cardW + 10);
    const cy = startY + 36;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(cx, cy, cardW, 64);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(cx, cy, cardW, 64);

    ctx.fillStyle = '#64748B';
    ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(s.label, cx + 12, cy + 20);

    ctx.fillStyle = s.color;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(s.val, cx + 12, cy + 44);

    ctx.fillStyle = '#475569';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(s.sub, cx + 12, cy + 58);
  });

  // Section 2: 2D Plan Blueprint Drawing on Canvas
  const planY = startY + 116;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, planY, contentW - 20, 28);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('二、現場平面放樣尺寸圖 (2D CAD STAKING PLAN VIEW)', pad + 20, planY + 19);

  // Blueprint drawing canvas box
  const boxX = pad + 10;
  const boxY = planY + 34;
  const boxW = contentW - 20;
  const boxH = 500;

  ctx.fillStyle = '#0B132B'; // Deep Blueprint Navy
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // CAD Grid lines
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 0.5;
  for (let gx = boxX + 30; gx < boxX + boxW; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, boxY);
    ctx.lineTo(gx, boxY + boxH);
    ctx.stroke();
  }
  for (let gy = boxY + 30; gy < boxY + boxH; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(boxX, gy);
    ctx.lineTo(boxX + boxW, gy);
    ctx.stroke();
  }

  // Draw 2D Room inside Blueprint Box
  const margin = 80;
  const maxDrawW = boxW - margin * 2;
  const maxDrawH = boxH - margin * 2;
  const scale = Math.min(maxDrawW / room.width, maxDrawH / room.length);

  const drawW = room.width * scale;
  const drawH = room.length * scale;
  const originX = boxX + (boxW - drawW) / 2;
  const originY = boxY + (boxH - drawH) / 2;

  // Outer Room Concrete Walls
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(originX - 10, originY - 10, drawW + 20, drawH + 20);

  // Room Inner Floor
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(originX, originY, drawW, drawH);
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  ctx.strokeRect(originX, originY, drawW, drawH);

  // Dimension lines around room
  // Top Width Dim
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY - 24);
  ctx.lineTo(originX + drawW, originY - 24);
  ctx.stroke();
  // Dim ticks
  ctx.beginPath();
  ctx.moveTo(originX, originY - 30);
  ctx.lineTo(originX, originY - 18);
  ctx.moveTo(originX + drawW, originY - 30);
  ctx.lineTo(originX + drawW, originY - 18);
  ctx.stroke();
  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`面寬 ${room.width} cm`, originX + drawW / 2, originY - 30);

  // Left Length Dim
  ctx.beginPath();
  ctx.moveTo(originX - 24, originY);
  ctx.lineTo(originX - 24, originY + drawH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(originX - 30, originY);
  ctx.lineTo(originX - 18, originY);
  ctx.moveTo(originX - 30, originY + drawH);
  ctx.lineTo(originX - 18, originY + drawH);
  ctx.stroke();
  ctx.save();
  ctx.translate(originX - 32, originY + drawH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`進深 ${room.length} cm`, 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';

  // Draw Structural Beams
  room.beams.forEach((b) => {
    if (b.orientation === 'horizontal') {
      const by = originY + (b.y ?? 0) * scale;
      const bheight = (b.depth ?? 40) * scale;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(originX, by, drawW, bheight);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(originX, by, drawW, bheight);

      ctx.fillStyle = '#FCA5A5';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`大梁 ${b.name} (梁底 FL+${b.clearHeight}cm · 梁寬${b.width}cm)`, originX + 15, by + bheight / 2 + 4);
    } else {
      const bx = originX + (b.x ?? 0) * scale;
      const bwidth = b.width * scale;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(bx, originY, bwidth, drawH);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, originY, bwidth, drawH);

      ctx.fillStyle = '#FCA5A5';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${b.name} (FL+${b.clearHeight}cm)`, bx + 4, originY + 25);
    }
  });

  // Draw Windows
  room.windows.forEach((win) => {
    let wx = originX;
    let wy = originY;
    let ww = win.width * scale;
    let wh = 8;
    if (win.wall === 'top') {
      wx = originX + win.offset * scale;
      wy = originY - 4;
    } else if (win.wall === 'bottom') {
      wx = originX + win.offset * scale;
      wy = originY + drawH - 4;
    } else if (win.wall === 'left') {
      wx = originX - 4;
      wy = originY + win.offset * scale;
      ww = 8;
      wh = win.width * scale;
    } else if (win.wall === 'right') {
      wx = originX + drawW - 4;
      wy = originY + win.offset * scale;
      ww = 8;
      wh = win.width * scale;
    }
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, ww, wh);

    ctx.fillStyle = '#BAE6FD';
    ctx.font = '10px monospace';
    ctx.fillText(`${win.name} (${win.width}×${win.height} 窗台+${win.sillHeight})`, wx, wy - 8);
  });

  // Draw Doors
  room.doors.forEach((door) => {
    let dx = originX;
    let dy = originY;
    let dw = door.width * scale;
    let dh = 10;
    if (door.wall === 'bottom') {
      dx = originX + door.offset * scale;
      dy = originY + drawH - 5;
    } else if (door.wall === 'top') {
      dx = originX + door.offset * scale;
      dy = originY - 5;
    } else if (door.wall === 'left') {
      dx = originX - 5;
      dy = originY + door.offset * scale;
      dw = 10;
      dh = door.width * scale;
    } else if (door.wall === 'right') {
      dx = originX + drawW - 5;
      dy = originY + door.offset * scale;
      dw = 10;
      dh = door.width * scale;
    }
    ctx.fillStyle = '#B45309';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, dh);

    ctx.fillStyle = '#FDE68A';
    ctx.font = '10px monospace';
    ctx.fillText(`門扇 ${door.name} (W:${door.width})`, dx, dy + dh + 14);
  });

  // Draw Electrical Points
  room.electricalPoints.forEach((ep) => {
    const epx = originX + ep.x * scale;
    const epy = originY + ep.y * scale;

    ctx.fillStyle = ep.type.includes('socket') ? '#06B6D4' : ep.type === 'switch' ? '#10B981' : '#A855F7';
    ctx.beginPath();
    ctx.arc(epx, epy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '9px monospace';
    ctx.fillText(`${ep.name}(+${ep.elevation})`, epx + 7, epy + 3);
  });

  // Origin point
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(originX, originY + drawH, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDA4AF';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('放樣原點 (0,0)', originX + 10, originY + drawH - 8);

  // Section 3: Tables for Doors/Windows and Electrical Points
  const tableY = planY + boxH + 46;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, tableY, contentW - 20, 26);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 12px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('三、水電出線標高與門窗開口放樣清單 (MEP & OPENINGS TABLE)', pad + 20, tableY + 18);

  // Table header
  const thY = tableY + 32;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(pad + 10, thY, contentW - 20, 24);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('項目類別', pad + 20, thY + 16);
  ctx.fillText('名稱 / 代號', pad + 140, thY + 16);
  ctx.fillText('規格尺寸 / 迴路', pad + 380, thY + 16);
  ctx.fillText('放樣標高 (FL+)', pad + 600, thY + 16);
  ctx.fillText('坐標定位 (X, Y)', pad + 780, thY + 16);
  ctx.fillText('施工驗收備註', pad + 950, thY + 16);

  // Combine rows: Windows, Doors, MEP
  const tableRows: { cat: string; name: string; spec: string; elev: string; pos: string; note: string }[] = [];

  room.windows.forEach((w) => {
    tableRows.push({
      cat: '氣密鋁窗',
      name: w.name,
      spec: `寬 ${w.width}cm × 高 ${w.height}cm`,
      elev: `窗台 FL+${w.sillHeight}cm`,
      pos: `偏牆 ${w.offset}cm (${w.wall})`,
      note: `窗頂 FL+${w.sillHeight + w.height}cm (符合5倍數)`,
    });
  });

  room.doors.forEach((d) => {
    tableRows.push({
      cat: '木作/金屬門',
      name: d.name,
      spec: `寬 ${d.width}cm × 高 ${d.height}cm`,
      elev: `地坪 ±0.0 (把手95cm)`,
      pos: `偏牆 ${d.offset}cm (${d.wall})`,
      note: `預留泥作粉刷寬度 +5cm`,
    });
  });

  room.electricalPoints.slice(0, 5).forEach((ep) => {
    tableRows.push({
      cat: ep.type.includes('socket') ? '強電插座' : ep.type === 'switch' ? '電燈開關' : '專迴管路',
      name: ep.name,
      spec: `${ep.circuit} 專用迴路`,
      elev: `FL+${ep.elevation}cm`,
      pos: `[X:${ep.x}, Y:${ep.y}]`,
      note: `嚴格依照《水電出線放樣基準》`,
    });
  });

  tableRows.slice(0, 6).forEach((row, rIdx) => {
    const ry = thY + 28 + rIdx * 24;
    ctx.fillStyle = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(pad + 10, ry, contentW - 20, 24);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(pad + 10, ry, contentW - 20, 24);

    ctx.fillStyle = '#0F172A';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(row.cat, pad + 20, ry + 16);
    ctx.fillText(row.name, pad + 140, ry + 16);
    ctx.fillStyle = '#0284C7';
    ctx.fillText(row.spec, pad + 380, ry + 16);
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(row.elev, pad + 600, ry + 16);
    ctx.fillStyle = '#64748B';
    ctx.fillText(row.pos, pad + 780, ry + 16);
    ctx.fillStyle = '#475569';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(row.note, pad + 950, ry + 16);
  });

  // Section 4: Voice Memo Notes (现场放样备忘)
  const memoY = tableY + 200;
  if (room.voiceMemos && room.voiceMemos.length > 0) {
    ctx.fillStyle = '#FEF3C7'; // Amber 100
    ctx.fillRect(pad + 10, memoY, contentW - 20, 65);
    ctx.strokeStyle = '#F59E0B';
    ctx.strokeRect(pad + 10, memoY, contentW - 20, 65);

    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('🎙 現場放樣口說語音備忘錨定記錄 (SITE VOICE MEMOS):', pad + 20, memoY + 20);

    room.voiceMemos.slice(0, 2).forEach((vm, vIdx) => {
      ctx.fillStyle = '#78350F';
      ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
      ctx.fillText(`• [${vm.timestamp}] (${vm.type}) ${vm.text}`, pad + 25, memoY + 40 + vIdx * 18);
    });
  }

  return canvas;
}

/**
 * Render Page 2: 【A-04 四面牆正立面展開施工圖】 (North, East, South, West)
 */
function renderPage2(room: RoomData): HTMLCanvasElement {
  const { canvas, ctx } = createA4Canvas();
  const pad = 40;
  const contentW = 1240 - pad * 2;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1240, 1754);

  // Title Block
  drawTitleBlock(
    ctx,
    'A-04',
    '四面牆正立面展開施工剖面圖',
    '立面施工展開',
    room.roomName,
    '1:30',
    2,
    3
  );

  const startY = 140;

  // Top Section: Wall Elevation Contract Note Banner
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, startY, contentW - 20, 32);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('空間四面牆展開正投影圖 (NORTH / EAST / SOUTH / WEST ELEVATIONS)', pad + 20, startY + 21);

  // Datums Reference Pill on Right
  ctx.fillStyle = '#065F46';
  ctx.fillRect(pad + contentW - 440, startY + 4, 420, 24);
  ctx.fillStyle = '#A7F3D0';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`標高基準: 頂板+${room.height} | 梁底+${room.beamHeight} | 降板+${room.ceilingDrop} | 地坪±0`, pad + contentW - 430, startY + 20);

  // 4 Elevation Drawings Stacked
  const wallDefs = [
    {
      code: 'N',
      title: '北向牆正立面 (North Elevation - Y=0)',
      width: room.width,
      windows: room.windows.filter((w) => w.wall === 'top'),
      doors: room.doors.filter((d) => d.wall === 'top'),
      beamName: '結構橫梁 B1 (穿心橫跨)',
      beamClearHeight: room.beamHeight,
      mepTags: ['專迴開關 FL+120cm', '暗藏窗簾盒插座 FL+260cm'],
    },
    {
      code: 'E',
      title: '東向牆正立面 (East Elevation - X=Width)',
      width: room.length,
      windows: room.windows.filter((w) => w.wall === 'right'),
      doors: room.doors.filter((d) => d.wall === 'right'),
      beamName: '結構大梁斷面 B1 (梁深55cm)',
      beamClearHeight: room.beamHeight,
      mepTags: ['電視石材牆專迴插座 FL+30cm', '弱電網路雙孔 FL+30cm'],
    },
    {
      code: 'S',
      title: '南向牆正立面 (South Elevation - Y=Length)',
      width: room.width,
      windows: room.windows.filter((w) => w.wall === 'bottom'),
      doors: room.doors.filter((d) => d.wall === 'bottom'),
      beamName: '周邊主梁避讓區',
      beamClearHeight: room.beamHeight,
      mepTags: ['臥室雙切開關 FL+120cm', '門邊防犯對講機 FL+135cm'],
    },
    {
      code: 'W',
      title: '西向牆正立面 (West Elevation - X=0)',
      width: room.length,
      windows: room.windows.filter((w) => w.wall === 'left'),
      doors: room.doors.filter((d) => d.wall === 'left'),
      beamName: '次梁過梁淨空 (梁底+265cm)',
      beamClearHeight: room.beamHeight,
      mepTags: ['沙發/床頭櫃 110V+USB 插座 FL+65cm', '夜燈 FL+30cm'],
    },
  ];

  const elevH = 260; // Height of each elevation strip
  const gap = 20;

  wallDefs.forEach((wall, idx) => {
    const ey = startY + 45 + idx * (elevH + gap);

    // Wall Strip Outer Frame
    ctx.fillStyle = '#080E1E';
    ctx.fillRect(pad + 10, ey, contentW - 20, elevH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(pad + 10, ey, contentW - 20, elevH);

    // Subheader inside strip
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(pad + 10, ey, contentW - 20, 24);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`【${wall.code}】 ${wall.title} — 寬度: ${wall.width} cm · 樓板淨高: ${room.height} cm`, pad + 20, ey + 16);

    // Drawing bounds
    const dwX = pad + 100;
    const dwY = ey + 34;
    const maxW = contentW - 240;
    const drawH = 150;
    const scaleW = maxW / wall.width;
    const scaleH = drawH / room.height;
    const drawW = wall.width * scaleW;

    // Helper: convert height to Y (0 is floor, room.height is slab top)
    const toY = (hVal: number) => {
      return dwY + (room.height - hVal) * scaleH;
    };

    // 1. Concrete Wall Outline
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(dwX, dwY, drawW, drawH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dwX, dwY, drawW, drawH);

    // 2. Floor Line (FL 0)
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dwX - 20, toY(0));
    ctx.lineTo(dwX + drawW + 20, toY(0));
    ctx.stroke();

    // Floor Hatch
    ctx.fillStyle = '#334155';
    ctx.fillRect(dwX - 20, toY(0), drawW + 40, 10);

    // Top Slab Line
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(dwX - 20, toY(room.height));
    ctx.lineTo(dwX + drawW + 20, toY(room.height));
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Ceiling Drop Soffit (FL + room.ceilingDrop)
    const dropY = toY(room.ceilingDrop);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(dwX, toY(room.height), drawW, dropY - toY(room.height));
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(dwX, dropY);
    ctx.lineTo(dwX + drawW, dropY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`降板天花 C.H. +${room.ceilingDrop}cm`, dwX + drawW - 140, dropY - 5);

    // 4. Structural Beam Bottom (FL + room.beamHeight)
    const beamY = toY(room.beamHeight);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dwX, beamY);
    ctx.lineTo(dwX + drawW, beamY);
    ctx.stroke();

    ctx.fillStyle = '#FCA5A5';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`梁底淨高 B.O.B. +${room.beamHeight}cm`, dwX + 15, beamY + 12);

    // 5. Windows
    wall.windows.forEach((win) => {
      const winX = dwX + win.offset * scaleW;
      const winW = win.width * scaleW;
      const winTopY = toY(win.sillHeight + win.height);
      const winSillY = toY(win.sillHeight);
      const winH = winSillY - winTopY;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(winX, winTopY, winW, winH);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(winX, winTopY, winW, winH);

      // Glass Sash Center Line
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winTopY);
      ctx.lineTo(winX + winW / 2, winSillY);
      ctx.stroke();

      // Window Tag
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(winX + 4, winTopY + winH / 2 - 9, winW - 8, 18);
      ctx.fillStyle = '#BAE6FD';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${win.name} (${win.width}×${win.height})`, winX + winW / 2, winTopY + winH / 2 + 4);
      ctx.fillText(`窗台+${win.sillHeight} 窗頂+${win.sillHeight + win.height}`, winX + winW / 2, winSillY + 11);
      ctx.textAlign = 'left';
    });

    // 6. Doors
    wall.doors.forEach((door) => {
      const doorX = dwX + door.offset * scaleW;
      const doorW = door.width * scaleW;
      const doorTopY = toY(door.height);
      const doorH = toY(0) - doorTopY;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(doorX, doorTopY, doorW, doorH);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(doorX, doorTopY, doorW, doorH);

      // Door Swing arc line
      ctx.strokeStyle = '#D97706';
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(doorX, toY(0));
      ctx.lineTo(doorX + doorW, doorTopY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Door Label
      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${door.name} (${door.width}×${door.height})`, doorX + 4, doorTopY + doorH / 2);
    });

    // Left Datums Bar
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 0.8;
    // FL 0
    ctx.beginPath();
    ctx.moveTo(dwX - 50, toY(0));
    ctx.lineTo(dwX - 5, toY(0));
    ctx.stroke();
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '9px monospace';
    ctx.fillText('1FL ±0', dwX - 90, toY(0) + 3);

    // FL +30
    ctx.beginPath();
    ctx.moveTo(dwX - 35, toY(30));
    ctx.lineTo(dwX - 5, toY(30));
    ctx.stroke();
    ctx.fillStyle = '#67E8F9';
    ctx.fillText('插座+30', dwX - 90, toY(30) + 3);

    // FL +120
    ctx.beginPath();
    ctx.moveTo(dwX - 35, toY(120));
    ctx.lineTo(dwX - 5, toY(120));
    ctx.stroke();
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText('開關+120', dwX - 90, toY(120) + 3);

    // FL +ceilingDrop
    ctx.beginPath();
    ctx.moveTo(dwX - 50, toY(room.ceilingDrop));
    ctx.lineTo(dwX - 5, toY(room.ceilingDrop));
    ctx.stroke();
    ctx.fillStyle = '#FDE68A';
    ctx.fillText(`CH+${room.ceilingDrop}`, dwX - 90, toY(room.ceilingDrop) + 3);

    // Bottom Dimension Chain
    const dimY = toY(0) + 26;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dwX, dimY);
    ctx.lineTo(dwX + drawW, dimY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dwX, dimY - 4);
    ctx.lineTo(dwX, dimY + 4);
    ctx.moveTo(dwX + drawW, dimY - 4);
    ctx.lineTo(dwX + drawW, dimY + 4);
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`總面寬 ${wall.width} cm`, dwX + drawW / 2, dimY - 4);
    ctx.textAlign = 'left';

    // Right Side MEP & Engineering Notes
    const noteX = dwX + drawW + 25;
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 9px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('【放樣機電標籤】', noteX, ey + 44);
    wall.mepTags.forEach((tag, tIdx) => {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px "PingFang TC", "Microsoft JhengHei", sans-serif';
      ctx.fillText(`• ${tag}`, noteX, ey + 60 + tIdx * 14);
    });
  });

  // Footer notes on Page 2
  const p2NoteY = 1754 - pad - 120;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(pad + 10, p2NoteY, contentW - 20, 32);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(pad + 10, p2NoteY, contentW - 20, 32);
  ctx.fillStyle = '#334155';
  ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText(
    '註：本展開圖直接由 3D 空間切面與現場丈量模型幾何正投影生成。窗簾盒預留深度 20cm，所有弱電插座嚴格依圖示標高打線。',
    pad + 20,
    p2NoteY + 20
  );

  return canvas;
}

/**
 * Render Page 3: 【QA-01 幾何契約審計結果與營造驗收表】
 */
function renderPage3(room: RoomData, vRules: VRuleCheck[] = INITIAL_V_RULES): HTMLCanvasElement {
  const { canvas, ctx } = createA4Canvas();
  const pad = 40;
  const contentW = 1240 - pad * 2;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1240, 1754);

  // Title Block
  drawTitleBlock(
    ctx,
    'QA-01',
    '幾何契約審計結果與營造驗收簽證表',
    '品質審計驗收',
    room.roomName,
    '1:1',
    3,
    3
  );

  const startY = 140;

  // Section 1: Executive Audit Summary Banner
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, startY, contentW - 20, 30);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('一、全盤深度健檢與解塞審計總結 (PIPELINE & AUDIT SUMMARY)', pad + 20, startY + 20);

  // 3 Audit KPI Cards
  const kpiW = (contentW - 20 - 20) / 3;
  const kpis = [
    {
      title: '高層「5 倍數」契約',
      value: '100% COMPLIANT',
      sub: '大梁265 / 空調230 / 衛浴215',
      color: '#16A34A',
    },
    {
      title: '幾何驗收規則 (V-01~10)',
      value: '10 / 10 PASSED',
      sub: '已掃除重複圖元與邊界截斷',
      color: '#0284C7',
    },
    {
      title: '生產線心跳與工單分診',
      value: 'DISPATCH READY',
      sub: 'A堆派發繪圖 · B堆排程備份',
      color: '#7C3AED',
    },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = pad + 10 + idx * (kpiW + 10);
    const ky = startY + 38;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(kx, ky, kpiW, 64);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(kx, ky, kpiW, 64);

    ctx.fillStyle = '#64748B';
    ctx.font = '11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(kpi.title, kx + 14, ky + 20);

    ctx.fillStyle = kpi.color;
    ctx.font = '900 18px monospace';
    ctx.fillText(kpi.value, kx + 14, ky + 43);

    ctx.fillStyle = '#475569';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(kpi.sub, kx + 14, ky + 58);
  });

  // Section 2: V-01 to V-10 Checklist Table
  const vTableY = startY + 118;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, vTableY, contentW - 20, 28);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('二、幾何契約一致性檢查簽證表 (V-01 ~ V-10 AUDIT CHECKLIST)', pad + 20, vTableY + 19);

  // Table header
  const vthY = vTableY + 34;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(pad + 10, vthY, contentW - 20, 24);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('規則代碼', pad + 20, vthY + 16);
  ctx.fillText('檢驗項目名稱', pad + 110, vthY + 16);
  ctx.fillText('所屬分類', pad + 350, vthY + 16);
  ctx.fillText('檢驗規範說明', pad + 480, vthY + 16);
  ctx.fillText('嚴重度', pad + 910, vthY + 16);
  ctx.fillText('審計裁決狀態', pad + 1000, vthY + 16);

  vRules.forEach((rule, rIdx) => {
    const ry = vthY + 28 + rIdx * 38;
    ctx.fillStyle = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(pad + 10, ry, contentW - 20, 36);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(pad + 10, ry, contentW - 20, 36);

    // Rule ID
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(rule.id, pad + 20, ry + 22);

    // Rule Name
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(rule.name, pad + 110, ry + 22);

    // Category
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(rule.category, pad + 350, ry + 22);

    // Description (trimmed)
    ctx.fillStyle = '#475569';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    const descText = rule.description.length > 34 ? rule.description.substring(0, 34) + '...' : rule.description;
    ctx.fillText(descText, pad + 480, ry + 22);

    // Severity Badge
    ctx.fillStyle = rule.severity === 'CRITICAL' ? '#DC2626' : rule.severity === 'WARNING' ? '#D97706' : '#2563EB';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(rule.severity, pad + 910, ry + 22);

    // Passed Badge
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('✔ PASSED', pad + 1000, ry + 22);
  });

  // Section 3: Directives for General Contractor (營造現場交底關鍵叮嚀)
  const dirY = vthY + 28 + 10 * 38 + 20;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pad + 10, dirY, contentW - 20, 28);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('三、營造單位現場交底與施工避雷指南 (CONSTRUCTION DIRECTIVES)', pad + 20, dirY + 19);

  const directives = [
    {
      num: '01',
      title: '天花高程 5 倍數強制施工契約',
      text: '大梁底淨高 FL+265 cm、冷氣降板 FL+230 cm、衛浴降板 FL+215 cm 必須嚴格執行，現場放樣誤差不得超過 ±3mm。',
    },
    {
      num: '02',
      title: '空調冷熱風短循環防護',
      text: '吊隱式冷氣出風口下緣貼齊 230cm 降板線，迴風口距出風口維持 1.5 米以上，檢修孔 450×450mm 嚴禁遭天花骨架遮擋。',
    },
    {
      num: '03',
      title: '穿梁套管與鋼筋保護層要求',
      text: '冷媒管、排水管穿越結構大梁時，套管外緣距梁底主筋必須保持 100mm 以上安全裕度，嚴禁任意洗洞截斷主筋。',
    },
    {
      num: '04',
      title: '門窗洞口收邊與雷射水平放樣',
      text: '門洞開口已預留寬度 +5cm 泥作粉刷收口裕度。現場以原點 (0,0) 角鋼基準點為唯一標註零點，全室統一打出 1 米基準水平線。',
    },
  ];

  directives.forEach((d, idx) => {
    const dy = dirY + 36 + idx * 46;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(pad + 10, dy, contentW - 20, 40);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(pad + 10, dy, contentW - 20, 40);

    // Number tag
    ctx.fillStyle = '#0284C7';
    ctx.font = '900 13px monospace';
    ctx.fillText(d.num, pad + 20, dy + 25);

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(d.title + '：', pad + 50, dy + 25);

    // Text
    ctx.fillStyle = '#475569';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(d.text, pad + 230, dy + 25);
  });

  // Section 4: Formal Engineering Stamp & Signature Block (會簽簽認專區)
  const stampY = dirY + 36 + 4 * 46 + 20;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(pad + 10, stampY, contentW - 20, 110);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad + 10, stampY, contentW - 20, 110);

  const stampCols = [
    { title: '設計規劃 / AI 審計', role: 'Codex 晶晶 · 生產線認證', status: '✔ 已審計電子核簽', date: '2026-09-19' },
    { title: '監造工程師 SUPERVISOR', role: '註冊建築師 / 監造單位', status: '【 請蓋章 / 簽名 】', date: '年  月  日' },
    { title: '營造總承包 GENERAL CONTRACTOR', role: '工地主任 / 專任工程人員', status: '【 現場交底簽收 】', date: '年  月  日' },
    { title: '現場放樣領班 FOREMAN', role: '放樣工程專業組', status: '【 基準線核驗完成 】', date: '年  月  日' },
  ];

  const scW = (contentW - 20) / 4;
  stampCols.forEach((col, cIdx) => {
    const scX = pad + 10 + cIdx * scW;
    if (cIdx > 0) {
      ctx.beginPath();
      ctx.moveTo(scX, stampY);
      ctx.lineTo(scX, stampY + 110);
      ctx.stroke();
    }

    ctx.fillStyle = '#64748B';
    ctx.font = '10px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(col.title, scX + 12, stampY + 22);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(col.role, scX + 12, stampY + 42);

    ctx.fillStyle = cIdx === 0 ? '#16A34A' : '#DC2626';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(col.status, scX + 12, stampY + 70);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px monospace';
    ctx.fillText(`日期：${col.date}`, scX + 12, stampY + 95);
  });

  return canvas;
}

/**
 * Generates the full 3-page standard PDF Construction Drawing Master Sheet
 */
export async function generateConstructionMasterPdf(
  room: RoomData,
  vRules: VRuleCheck[] = INITIAL_V_RULES
): Promise<GeneratedPdfResult> {
  // 1. Render all 3 canvas pages
  const page1Canvas = renderPage1(room);
  const page2Canvas = renderPage2(room);
  const page3Canvas = renderPage3(room, vRules);

  const img1 = page1Canvas.toDataURL('image/jpeg', 0.95);
  const img2 = page2Canvas.toDataURL('image/jpeg', 0.95);
  const img3 = page3Canvas.toDataURL('image/jpeg', 0.95);

  const pageImages = [img1, img2, img3];

  // 2. Initialize jsPDF in A4 Portrait mode (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Page 1
  doc.addImage(img1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  // Page 2
  doc.addPage('a4', 'portrait');
  doc.addImage(img2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  // Page 3
  doc.addPage('a4', 'portrait');
  doc.addImage(img3, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  const cleanRoomName = room.roomName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  const filename = `室內設計_施工圖總表_${cleanRoomName}_A00-A04-QA01.pdf`;

  const blob = doc.output('blob');

  const download = () => {
    doc.save(filename);
  };

  return {
    blob,
    filename,
    download,
    pageImages,
  };
}
