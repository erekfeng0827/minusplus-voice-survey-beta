import { RoomData, CADCustomProfile } from '../types';

export interface CustomSectionExportOptions {
  room: RoomData;
  profile: CADCustomProfile;
  wallSpanWidth: number; // e.g. 300 or 600 cm
  baseCabinetHeight: number; // e.g. 80 cm
  cabinetDoorCount: number; // e.g. 5 or 10
  upperCabinetHeight?: number; // e.g. 80 cm
  toeKickHeight?: number; // e.g. 10 cm
  beamClearHeight: number; // e.g. 265 cm
  dropCeilingHeight: number; // e.g. 230 cm
  projectName?: string;
}

/**
 * 依據使用者完全自訂的 CAD 設定檔 (圖塊庫、線寬層級映射表、預設填充線參數)
 * 產出 100% 忠實切圖的 AutoCAD ASCII DXF
 */
export function generateCustomSectionDxfString(options: CustomSectionExportOptions): string {
  const {
    room,
    profile,
    wallSpanWidth: spanW,
    baseCabinetHeight: baseH,
    cabinetDoorCount: doorCount,
    toeKickHeight = 10,
    beamClearHeight: beamH,
    dropCeilingHeight: dropH,
  } = options;

  const totalH = Number(room.height) || 280;

  // 取得使用者映射表圖層 (統一使用 MinusPlus A 系列圖層與中文標準圖層)
  const cutLayer =
    profile.lineweights?.find((l) => l.key === 'cut_structural') || {
      layerName: '01_結構牆體',
      colorIndex: 7,
      lineType: 'CONTINUOUS',
    };
  const profileLayer =
    profile.lineweights?.find((l) => l.key === 'profile_outline') || {
      layerName: '05_木作櫃體',
      colorIndex: 4,
      lineType: 'CONTINUOUS',
    };
  const divisionLayer =
    profile.lineweights?.find((l) => l.key === 'cabinet_division') || {
      layerName: '05_木作櫃體',
      colorIndex: 3,
      lineType: 'CONTINUOUS',
    };
  const hiddenLayer =
    profile.lineweights?.find((l) => l.key === 'hidden_projection') || {
      layerName: '06_施工註記',
      colorIndex: 5,
      lineType: 'DASHED',
    };
  const dimLayer =
    profile.lineweights?.find((l) => l.key === 'dimension_leader') || {
      layerName: '05_尺寸標註',
      colorIndex: 3,
      lineType: 'CONTINUOUS',
    };
  const datumLayer =
    profile.lineweights?.find((l) => l.key === 'elevation_datum') || {
      layerName: '05_尺寸標註',
      colorIndex: 1,
      lineType: 'CONTINUOUS',
    };

  // 取得填充線參數
  const woodHatch =
    profile.hatchSettings?.find((h) => h.targetMaterial === 'wood_joinery') || {
      patternName: 'ANSI31',
      angleDeg: 45,
      spacingMm: 2.0,
      layerName: '01_結構牆體',
      colorIndex: 6,
    };
  const stoneHatch =
    profile.hatchSettings?.find((h) => h.targetMaterial === 'stone_countertop') || {
      patternName: 'CROSS_HATCH',
      angleDeg: 45,
      spacingMm: 1.5,
      layerName: '01_結構牆體',
      colorIndex: 3,
    };
  const concHatch =
    profile.hatchSettings?.find((h) => h.targetMaterial === 'rc_concrete') || {
      patternName: 'AR-CONC',
      angleDeg: 0,
      spacingMm: 3.0,
      layerName: '01_結構牆體',
      colorIndex: 8,
    };

  // 取得圖塊設定
  const elevBlock =
    profile.blockLibrary?.find((b) => b.category === 'elevation_tag') || {
      prefix: '▼ FL+',
      layerName: '05_尺寸標註',
      colorIndex: 1,
    };
  const secBlock =
    profile.blockLibrary?.find((b) => b.category === 'section_callout') || {
      prefix: '⮜ A-A\' ⮞',
      layerName: '06_施工註記',
      colorIndex: 4,
    };
  const titleBlock =
    profile.blockLibrary?.find((b) => b.category === 'title_block') || {
      prefix: 'corey-a3',
      layerName: '07_圖框圖頭',
      colorIndex: 7,
    };

  let dxf = '';

  // 1. HEADER SECTION
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n'; // 4 = cm/mm

  // 2. TABLES (LAYERS)
  const uniqueLayers = new Map<string, { color: number; lineType: string }>();
  profile.lineweights.forEach((lw) => {
    uniqueLayers.set(lw.layerName, { color: lw.colorIndex, lineType: lw.lineType || 'CONTINUOUS' });
  });
  profile.hatchSettings.forEach((ht) => {
    if (!uniqueLayers.has(ht.layerName)) {
      uniqueLayers.set(ht.layerName, { color: ht.colorIndex, lineType: 'CONTINUOUS' });
    }
  });
  profile.blockLibrary.forEach((blk) => {
    if (!uniqueLayers.has(blk.layerName)) {
      uniqueLayers.set(blk.layerName, { color: blk.colorIndex, lineType: 'CONTINUOUS' });
    }
  });

  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${uniqueLayers.size}\n`;
  uniqueLayers.forEach((val, name) => {
    dxf += `0\nLAYER\n2\n${name}\n70\n0\n62\n${val.color}\n6\n${val.lineType}\n`;
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // 3. ENTITIES SECTION
  dxf += '0\nSECTION\n2\nENTITIES\n';

  const ox = 50; // 原點位移
  const oy = 50;

  // (1) 地坪基準線 (Floor line FL+0) & 結構剖斷外框
  dxf += line(cutLayer.layerName, ox - 30, oy, ox + spanW + 30, oy);
  dxf += text(dimLayer.layerName, ox - 28, oy + 4, 6, `${elevBlock.prefix}0 (基準地坪)`);

  // 天花板線 (FL + totalH)
  dxf += line(cutLayer.layerName, ox - 20, oy + totalH, ox + spanW + 20, oy + totalH);
  dxf += text(dimLayer.layerName, ox - 28, oy + totalH + 4, 6, `${elevBlock.prefix}${totalH} (結構樓板下皮)`);

  // 左右結構牆剖斷線
  dxf += line(cutLayer.layerName, ox, oy, ox, oy + totalH);
  dxf += line(cutLayer.layerName, ox + spanW, oy, ox + spanW, oy + totalH);

  // (2) RC 大梁結構橫跨 (Beam FL + beamH)
  if (beamH < totalH) {
    dxf += line(cutLayer.layerName, ox, oy + beamH, ox + spanW, oy + beamH);
    dxf += text(
      dimLayer.layerName,
      ox + 10,
      oy + beamH + 4,
      7,
      `結構大梁下皮 ${elevBlock.prefix}${beamH} cm [5倍數整數契約]`
    );

    // 梁體剖面填充 (混凝土顆粒/疏斜線)
    const beamThick = totalH - beamH;
    const hatchStep = concHatch.spacingMm * 5;
    for (let hx = ox + 10; hx < ox + spanW; hx += hatchStep) {
      dxf += line(concHatch.layerName, hx, oy + beamH + 2, hx + 10, oy + totalH - 2);
    }
  }

  // (3) 吊隱冷氣天花降板 (Ceiling Drop FL + dropH)
  if (dropH < totalH) {
    dxf += line(hiddenLayer.layerName, ox, oy + dropH, ox + spanW, oy + dropH);
    dxf += text(
      dimLayer.layerName,
      ox + 10,
      oy + dropH + 4,
      7,
      `空調降板天花 ${elevBlock.prefix}${dropH} cm [5倍數整數契約]`
    );
  }

  // (4) 設計師固定 80cm 檯面契約基準線 (FL + baseH)
  dxf += line(datumLayer.layerName, ox - 25, oy + baseH, ox + spanW + 25, oy + baseH);
  dxf += text(
    datumLayer.layerName,
    ox + 10,
    oy + baseH + 4,
    9,
    `★ 設計師檯面契約標高：${elevBlock.prefix}${baseH} cm (絕對鎖死固定)`
  );

  // (5) 踢腳板 (Toe Kick)
  dxf += line(profileLayer.layerName, ox + 5, oy, ox + 5, oy + toeKickHeight);
  dxf += line(profileLayer.layerName, ox + spanW - 5, oy, ox + spanW - 5, oy + toeKickHeight);
  dxf += line(profileLayer.layerName, ox + 5, oy + toeKickHeight, ox + spanW - 5, oy + toeKickHeight);

  // (6) 下櫃櫃體外觀輪廓 (Cabinet Profile)
  dxf += line(profileLayer.layerName, ox, oy + toeKickHeight, ox, oy + baseH);
  dxf += line(profileLayer.layerName, ox + spanW, oy + toeKickHeight, ox + spanW, oy + baseH);
  dxf += line(profileLayer.layerName, ox, oy + baseH, ox + spanW, oy + baseH);

  // (7) 石材檯面 4cm 剖面 (Countertop)
  const countertopH = 4;
  dxf += line(profileLayer.layerName, ox - 2, oy + baseH, ox + spanW + 2, oy + baseH);
  dxf += line(profileLayer.layerName, ox - 2, oy + baseH - countertopH, ox + spanW + 2, oy + baseH - countertopH);
  dxf += line(profileLayer.layerName, ox - 2, oy + baseH - countertopH, ox - 2, oy + baseH);
  dxf += line(profileLayer.layerName, ox + spanW + 2, oy + baseH - countertopH, ox + spanW + 2, oy + baseH);

  // 石材檯面填充線 (依使用者 stoneHatch 參數)
  const stoneStep = stoneHatch.spacingMm * 3;
  for (let sx = ox; sx < ox + spanW; sx += stoneStep) {
    dxf += line(stoneHatch.layerName, sx, oy + baseH - countertopH, sx + 5, oy + baseH);
    if (stoneHatch.patternName === 'CROSS_HATCH') {
      dxf += line(stoneHatch.layerName, sx + 5, oy + baseH - countertopH, sx, oy + baseH);
    }
  }

  // (8) 門片均分分割 (Door Divisions)
  const singleDoorW = spanW / doorCount;
  for (let d = 1; d < doorCount; d++) {
    const doorX = ox + d * singleDoorW;
    dxf += line(divisionLayer.layerName, doorX, oy + toeKickHeight, doorX, oy + baseH - countertopH);
  }

  // (9) 櫃體木作剖面填充 (依使用者 woodHatch 參數)
  // 在櫃體立面實切斷面兩側產生 ANSI31 45度斜線
  const woodStep = Math.max(1, woodHatch.spacingMm * 4);
  const cabinetNetH = baseH - toeKickHeight - countertopH;
  for (let wx = 0; wx < spanW; wx += woodStep) {
    const x1 = ox + wx;
    const y1 = oy + toeKickHeight;
    const x2 = ox + wx + cabinetNetH * 0.4;
    const y2 = oy + baseH - countertopH;
    dxf += line(woodHatch.layerName, x1, y1, Math.min(ox + spanW, x2), y2);
  }

  // (10) 連續尺寸標註 (Continuous Dimensions)
  const dimY = oy - 25;
  dxf += line(dimLayer.layerName, ox, dimY, ox + spanW, dimY);
  dxf += line(dimLayer.layerName, ox, dimY - 4, ox, dimY + 4);
  dxf += line(dimLayer.layerName, ox + spanW, dimY - 4, ox + spanW, dimY + 4);
  dxf += text(dimLayer.layerName, ox + spanW / 2 - 15, dimY + 6, 8, `總面寬 ${spanW} cm`);

  // 門片細部尺寸
  const subDimY = oy - 12;
  for (let d = 0; d < doorCount; d++) {
    const dX1 = ox + d * singleDoorW;
    const dX2 = dX1 + singleDoorW;
    dxf += line(dimLayer.layerName, dX1, subDimY, dX2, subDimY);
    dxf += line(dimLayer.layerName, dX1, subDimY - 2, dX1, subDimY + 2);
    dxf += line(dimLayer.layerName, dX2, subDimY - 2, dX2, subDimY + 2);
    dxf += text(dimLayer.layerName, dX1 + singleDoorW / 2 - 8, subDimY + 3, 5, `${Math.round(singleDoorW)}`);
  }

  // 垂直高程標註 (Vertical Dimensions)
  const vDimX = ox - 40;
  dxf += line(dimLayer.layerName, vDimX, oy, vDimX, oy + baseH);
  dxf += line(dimLayer.layerName, vDimX - 3, oy, vDimX + 3, oy);
  dxf += line(dimLayer.layerName, vDimX - 3, oy + baseH, vDimX + 3, oy + baseH);
  dxf += text(dimLayer.layerName, vDimX - 25, oy + baseH / 2, 7, `${baseH}cm (固定)`);

  // (11) 剖切索引與圖名 (Section Title & Callout)
  dxf += text(
    secBlock.layerName,
    ox,
    oy + totalH + 35,
    14,
    `${secBlock.prefix} ${profile.sheetConfig.drawingTitle} [比例 ${profile.sheetConfig.drawingScale}]`
  );
  dxf += text(
    titleBlock.layerName,
    ox,
    oy + totalH + 18,
    8,
    `專案：${profile.sheetConfig.projectTitle} | 出圖代號：${profile.sheetConfig.drawingCode} | 圖紙：${profile.sheetConfig.paperSize}`
  );
  dxf += text(
    titleBlock.layerName,
    ox,
    oy - 42,
    7,
    `【依自訂 CAD 樣式輸出】樣式：${profile.profileName} (v${profile.version}) | 設計師：${profile.sheetConfig.designerName} | 單位：${profile.sheetConfig.companyName}`
  );

  // 4. END OF ENTITIES & EOF
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
 * 瀏覽器直接觸發自訂樣式立面切圖 DXF 下載
 */
export function downloadCustomSectionDxf(options: CustomSectionExportOptions) {
  const dxfContent = generateCustomSectionDxfString(options);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `立面切圖_依${options.profile.profileName.replace(/\s+/g, '_')}_${options.wallSpanWidth}cm配固定${options.baseCabinetHeight}cm.dxf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
