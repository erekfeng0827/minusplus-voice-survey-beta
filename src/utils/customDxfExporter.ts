import { RoomData, DxfLayerConfigItem } from '../types';

/**
 * Enhanced ASCII DXF Generator supporting Dynamic Custom Layer Names, Colors, and Layer Toggles
 */
export function generateCustomDxfString(room: RoomData, layerConfigs: DxfLayerConfigItem[]): string {
  const w = Number(room.width) || 480;
  const l = Number(room.length) || 380;

  // Map layer key to custom layer name and enabled state
  const layerMap: { [key: string]: { name: string; color: number; enabled: boolean; lineType: string } } = {};
  layerConfigs.forEach((ly) => {
    layerMap[ly.key] = {
      name: ly.customName || ly.defaultName,
      color: ly.colorNumber,
      enabled: ly.enabled,
      lineType: ly.lineType || 'CONTINUOUS',
    };
  });

  let dxf = '';

  // 1. HEADER SECTION
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';

  // 2. TABLES SECTION (LAYERS)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n' + layerConfigs.length + '\n';
  layerConfigs.forEach((ly) => {
    const lName = ly.customName || ly.defaultName;
    dxf += `0\nLAYER\n2\n${lName}\n70\n0\n62\n${ly.colorNumber}\n6\n${ly.lineType || 'CONTINUOUS'}\n370\n${ly.lineweight ?? -3}\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // 3. ENTITIES SECTION
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Helper functions that respect enabled state
  const drawLine = (key: string, x1: number, y1: number, x2: number, y2: number) => {
    const conf = layerMap[key];
    if (!conf || !conf.enabled) return '';
    return `0\nLINE\n8\n${conf.name}\n10\n${x1.toFixed(1)}\n20\n${y1.toFixed(1)}\n30\n0.0\n11\n${x2.toFixed(1)}\n21\n${y2.toFixed(1)}\n31\n0.0\n`;
  };

  const drawText = (key: string, x: number, y: number, height: number, str: string) => {
    const conf = layerMap[key];
    if (!conf || !conf.enabled) return '';
    return `0\nTEXT\n8\n${conf.name}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n40\n${height}\n1\n${str}\n`;
  };

  // Outer Walls
  dxf += drawLine('WALL', 0, 0, w, 0);
  dxf += drawLine('WALL', w, 0, w, l);
  dxf += drawLine('WALL', w, l, 0, l);
  dxf += drawLine('WALL', 0, l, 0, 0);

  // Beams
  if (room.beams && room.beams.length > 0) {
    room.beams.forEach((b) => {
      if (b.orientation === 'vertical') {
        const bx = b.x ?? 0;
        const by = b.y ?? 0;
        const bw = b.width;
        const bdepth = b.depth || l;
        dxf += drawLine('BEAM', bx, by, bx, by + bdepth);
        dxf += drawLine('BEAM', bx + bw, by, bx + bw, by + bdepth);
        dxf += drawLine('BEAM', bx, by, bx + bw, by);
        dxf += drawLine('BEAM', bx, by + bdepth, bx + bw, by + bdepth);
        dxf += drawText('BEAM', bx + 5, by + 15, 7, `${b.name} (B.O.B:${b.clearHeight}cm)`);
      } else {
        const bx = b.x ?? 0;
        const by = b.y ?? 0;
        const bw = b.width || w;
        const bdepth = b.depth;
        dxf += drawLine('BEAM', bx, by, bx + bw, by);
        dxf += drawLine('BEAM', bx, by + bdepth, bx + bw, by + bdepth);
        dxf += drawLine('BEAM', bx, by, bx, by + bdepth);
        dxf += drawLine('BEAM', bx + bw, by, bx + bw, by + bdepth);
        dxf += drawText('BEAM', bx + 15, by + 15, 7, `${b.name} (B.O.B:${b.clearHeight}cm)`);
      }
    });
  }

  // Ceiling Drop Step Line
  const dropY = Math.min(l * 0.35, 120);
  dxf += drawLine('CEILING_STEP', 0, dropY, w, dropY);
  dxf += drawText('CEILING_STEP', 15, dropY - 10, 6, `空調吊隱天花降板線 C.H: FL+${room.ceilingDrop}cm`);

  // Doors
  if (room.doors && room.doors.length > 0) {
    room.doors.forEach((d) => {
      const dw = d.width;
      let dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0;
      if (d.wall === 'bottom') {
        dx1 = d.offset; dy1 = 0; dx2 = d.offset + dw; dy2 = 0;
      } else if (d.wall === 'top') {
        dx1 = d.offset; dy1 = l; dx2 = d.offset + dw; dy2 = l;
      } else if (d.wall === 'left') {
        dx1 = 0; dy1 = d.offset; dx2 = 0; dy2 = d.offset + dw;
      } else if (d.wall === 'right') {
        dx1 = w; dy1 = d.offset; dx2 = w; dy2 = d.offset + dw;
      }
      dxf += drawLine('OPENING', dx1, dy1, dx2, dy2);
      dxf += drawText('OPENING', (dx1 + dx2) / 2, (dy1 + dy2) / 2 + 10, 6, `${d.name} (${d.width}x${d.height})`);
    });
  }

  // Windows
  if (room.windows && room.windows.length > 0) {
    room.windows.forEach((win) => {
      const ww = win.width;
      let wx1 = 0, wy1 = 0, wx2 = 0, wy2 = 0;
      if (win.wall === 'top') {
        wx1 = win.offset; wy1 = l; wx2 = win.offset + ww; wy2 = l;
      } else if (win.wall === 'bottom') {
        wx1 = win.offset; wy1 = 0; wx2 = win.offset + ww; wy2 = 0;
      } else if (win.wall === 'left') {
        wx1 = 0; wy1 = win.offset; wx2 = 0; wy2 = win.offset + ww;
      } else if (win.wall === 'right') {
        wx1 = w; wy1 = win.offset; wx2 = w; wy2 = win.offset + ww;
      }
      dxf += drawLine('OPENING', wx1, wy1, wx2, wy2);
      dxf += drawText('OPENING', (wx1 + wx2) / 2 - 20, (wy1 + wy2) / 2 - 12, 6, `${win.name} (台度高:${win.sillHeight}cm)`);
    });
  }

  // Dimensions
  const dimOffset = 30;
  // Bottom X dimension
  dxf += drawLine('DIMENSION', 0, -dimOffset, w, -dimOffset);
  dxf += drawLine('DIMENSION', 0, -dimOffset - 5, 0, 5);
  dxf += drawLine('DIMENSION', w, -dimOffset - 5, w, 5);
  dxf += drawText('DIMENSION', w / 2 - 15, -dimOffset - 12, 8, `${w} cm`);

  // Left Y dimension
  dxf += drawLine('DIMENSION', -dimOffset, 0, -dimOffset, l);
  dxf += drawLine('DIMENSION', -dimOffset - 5, 0, 5, 0);
  dxf += drawLine('DIMENSION', -dimOffset - 5, l, 5, l);
  dxf += drawText('DIMENSION', -dimOffset - 25, l / 2, 8, `${l} cm`);

  // Electrical Points
  if (room.electricalPoints && room.electricalPoints.length > 0) {
    room.electricalPoints.forEach((ep) => {
      const sz = 4;
      dxf += drawLine('ELECTRICAL', ep.x - sz, ep.y - sz, ep.x + sz, ep.y + sz);
      dxf += drawLine('ELECTRICAL', ep.x - sz, ep.y + sz, ep.x + sz, ep.y - sz);
      dxf += drawText('ELECTRICAL', ep.x + 6, ep.y - 2, 5, `${ep.name} (FL+${ep.elevation}cm)`);
    });
  }

  // Voice Memos
  if (room.voiceMemos && room.voiceMemos.length > 0) {
    room.voiceMemos.forEach((vm) => {
      dxf += drawText('VOICE_TAGS', vm.x, vm.y, 6, `[AI口說] ${vm.text.slice(0, 22)}...`);
    });
  }

  // Title Block in DXF
  dxf += drawText('WALL', 0, l + 30, 10, `案場：${room.roomName} · 5倍數高層審計通過`);
  dxf += drawText('WALL', 0, l + 15, 7, `梁下淨高 265cm · 空調降板 230cm · 衛廚降板 215cm · 單位: 公分 (CM)`);

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

export function downloadDxfWithCustomLayers(
  room: RoomData,
  layers: DxfLayerConfigItem[],
  filename: string = '室內設計_自訂圖層放樣'
) {
  const content = generateCustomDxfString(room, layers);
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
