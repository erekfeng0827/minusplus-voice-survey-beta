import { RoomData, Door, WindowOpening, Beam } from '../types';

export interface AutoDimensionItem {
  id: string;
  category: 'wall' | 'opening' | 'drop' | 'beam' | 'elevation';
  label: string;
  value: number; // in cm
  unit: 'cm' | 'mm';
  rule5Compliant: boolean;
  wall?: 'top' | 'bottom' | 'left' | 'right' | 'interior' | 'elevation';
  description: string;
  targetEntity: string;
  startOffset?: number;
  endOffset?: number;
}

export interface WallDimensionChain {
  wall: 'top' | 'bottom' | 'left' | 'right';
  wallLength: number;
  overallDimension: AutoDimensionItem;
  segmentDimensions: AutoDimensionItem[];
}

export interface ElevationDimensionSet {
  slabHeight: AutoDimensionItem;
  beamClearance: AutoDimensionItem;
  ceilingDrop: AutoDimensionItem;
  bathKitchenDrop: AutoDimensionItem;
  dropDepthDifference: AutoDimensionItem;
  switchElevation: AutoDimensionItem;
  socketElevation: AutoDimensionItem;
  sillElevation?: AutoDimensionItem;
}

export interface GeneratedDimensionSet {
  wallChains: WallDimensionChain[];
  openingOffsets: AutoDimensionItem[];
  elevationSet: ElevationDimensionSet;
  allDimensions: AutoDimensionItem[];
  totalCount: number;
  rule5PassedCount: number;
  rule5PassRate: number;
}

/**
 * Automatically computes all architectural dimension chains for a room:
 * 1. Wall dimensions (outer overall + segmented wall chains)
 * 2. Door & Window offset dimensions from reference corners
 * 3. Ceiling drop, beam clearances, and vertical elevation marks
 */
export function generateAutoDimensions(room: RoomData): GeneratedDimensionSet {
  const w = Number(room.width) || 480;
  const l = Number(room.length) || 550;
  const h = Number(room.height) || 280;
  const dropH = Number(room.ceilingDrop) || 230;
  const beamH = Number(room.beamHeight) || 265;
  const bathDrop = Number(room.bathKitchenDrop) || 215;

  const allDimensions: AutoDimensionItem[] = [];
  const openingOffsets: AutoDimensionItem[] = [];

  // Helper to build a dimension item
  const createItem = (
    id: string,
    category: AutoDimensionItem['category'],
    label: string,
    value: number,
    wall: AutoDimensionItem['wall'],
    description: string,
    targetEntity: string,
    startOffset?: number,
    endOffset?: number
  ): AutoDimensionItem => {
    const item: AutoDimensionItem = {
      id,
      category,
      label,
      value: Math.round(value * 10) / 10,
      unit: 'cm',
      rule5Compliant: Math.round(value) % 5 === 0,
      wall,
      description,
      targetEntity,
      startOffset,
      endOffset,
    };
    allDimensions.push(item);
    return item;
  };

  // 1. WALL CHAINS & OPENING OFFSETS
  const wallChains: WallDimensionChain[] = [];

  // Helper for computing segmented openings on a wall
  const computeWallSegments = (
    wallKey: 'top' | 'bottom' | 'left' | 'right',
    wallLength: number,
    wallNameZh: string
  ): WallDimensionChain => {
    // 1. Overall wall dimension
    const overall = createItem(
      `dim-wall-overall-${wallKey}`,
      'wall',
      `${wallNameZh}外牆開間總長 ${wallLength}cm`,
      wallLength,
      wallKey,
      `${wallNameZh}外牆軸線至軸線總放樣尺寸`,
      `${wallNameZh}外牆結構體`,
      0,
      wallLength
    );

    // Collect openings on this wall
    const doorsOnWall: Array<{ id: string; name: string; offset: number; width: number; height: number; type: 'door' }> =
      (room.doors || [])
        .filter((d) => d.wall === wallKey)
        .map((d) => ({ ...d, type: 'door' }));

    const windowsOnWall: Array<{
      id: string;
      name: string;
      offset: number;
      width: number;
      height: number;
      sillHeight: number;
      type: 'window';
    }> = (room.windows || [])
      .filter((w) => w.wall === wallKey)
      .map((w) => ({ ...w, type: 'window' }));

    const openings = [...doorsOnWall, ...windowsOnWall].sort((a, b) => a.offset - b.offset);
    const segments: AutoDimensionItem[] = [];

    let currentCursor = 0;

    openings.forEach((op, index) => {
      // Offset from previous cursor to opening start
      const offsetDist = op.offset - currentCursor;
      if (offsetDist > 0) {
        const segItem = createItem(
          `dim-seg-${wallKey}-${index}-wall`,
          'wall',
          `${wallNameZh}段 #${index + 1} 淨長 ${offsetDist}cm`,
          offsetDist,
          wallKey,
          `牆角基準線至開口 #${index + 1} 邊緣距離`,
          `${wallNameZh}牆體淨段`,
          currentCursor,
          op.offset
        );
        segments.push(segItem);
      }

      // Opening width dimension
      const opWidthItem = createItem(
        `dim-op-${op.id}-w`,
        'opening',
        `${op.name} 淨開口寬 ${op.width}cm`,
        op.width,
        wallKey,
        `${op.name} 預留施工放樣淨開口寬度 (H:${op.height}cm)`,
        op.name,
        op.offset,
        op.offset + op.width
      );
      segments.push(opWidthItem);
      openingOffsets.push(opWidthItem);

      // Opening corner offset annotation
      const cornerOffsetItem = createItem(
        `dim-op-${op.id}-corner-offset`,
        'opening',
        `${op.name} 距端牆角偏移 ${op.offset}cm`,
        op.offset,
        wallKey,
        `${op.name} 從${wallNameZh}起點角鋼向內放樣偏移量`,
        op.name,
        0,
        op.offset
      );
      openingOffsets.push(cornerOffsetItem);

      currentCursor = op.offset + op.width;
    });

    // Remainder segment to end of wall
    const remainder = wallLength - currentCursor;
    if (remainder > 0 && openings.length > 0) {
      const remainderItem = createItem(
        `dim-seg-${wallKey}-end-wall`,
        'wall',
        `${wallNameZh}收尾牆段淨長 ${remainder}cm`,
        remainder,
        wallKey,
        `最後開口至對向牆角餘長尺寸`,
        `${wallNameZh}收尾牆體`,
        currentCursor,
        wallLength
      );
      segments.push(remainderItem);
    } else if (openings.length === 0) {
      // Solid wall without openings
      segments.push(overall);
    }

    return {
      wall: wallKey,
      wallLength,
      overallDimension: overall,
      segmentDimensions: segments,
    };
  };

  wallChains.push(computeWallSegments('top', w, '北向(頂牆)'));
  wallChains.push(computeWallSegments('bottom', w, '南向(底牆)'));
  wallChains.push(computeWallSegments('left', l, '西向(左牆)'));
  wallChains.push(computeWallSegments('right', l, '東向(右牆)'));

  // 2. BEAM DIMENSIONS (梁下淨高、梁寬、梁深與軸線偏移)
  if (room.beams && room.beams.length > 0) {
    room.beams.forEach((b, idx) => {
      createItem(
        `dim-beam-${b.id}-clear`,
        'beam',
        `${b.name} 梁底淨高 FL+${b.clearHeight}cm`,
        b.clearHeight,
        'interior',
        `結構大梁下淨高實測與驗收標準，符合《降板裁決_v003》`,
        b.name,
        0,
        b.clearHeight
      );

      createItem(
        `dim-beam-${b.id}-axis-y`,
        'beam',
        `${b.name} 軸線距頂牆偏移 ${b.y}cm`,
        b.y,
        'interior',
        `${b.name} 梁結構中心線距北牆之水平放樣距離`,
        b.name,
        0,
        b.y
      );

      createItem(
        `dim-beam-${b.id}-section`,
        'beam',
        `${b.name} 斷面 (寬${b.width}cm × 深${b.depth}cm)`,
        b.width,
        'interior',
        `${b.name} RC結構梁外擴放樣斷面尺寸`,
        b.name
      );
    });
  }

  // 3. ELEVATION DIMENSION SET (降板高度與垂向標高)
  const slabHeight = createItem(
    'dim-elev-slab',
    'elevation',
    `原結構樓板清水淨高 FL+${h}cm`,
    h,
    'elevation',
    `清水 RC 頂板水平標高，全室垂直吊筋與天花角材依據`,
    '結構頂板'
  );

  const beamClearance = createItem(
    'dim-elev-beam',
    'beam',
    `大樑下淨高契約標高 FL+${beamH}cm`,
    beamH,
    'elevation',
    `《降板裁決_v003》主結構梁下淨高規範 (5倍數核准)`,
    '結構大樑 B1'
  );

  const ceilingDrop = createItem(
    'dim-elev-ceiling-drop',
    'drop',
    `天花空調吊隱風箱降板 FL+${dropH}cm`,
    dropH,
    'elevation',
    `吊隱式冷氣主機與集風箱吊頂降板高程，預留維修孔`,
    '空調降板天花'
  );

  const bathKitchenDrop = createItem(
    'dim-elev-bath-drop',
    'drop',
    `廚衛/玄關落塵區降板 FL+${bathDrop}cm`,
    bathDrop,
    'elevation',
    `落塵區與衛浴防潮降板標高，地坪高差 1.5cm`,
    '落塵降板區'
  );

  const dropDepthDifference = createItem(
    'dim-elev-drop-depth',
    'drop',
    `空調天花降板深度 Δh = ${h - dropH}cm`,
    h - dropH,
    'elevation',
    `由原樓板高(${h}cm)降至天花底(${dropH}cm)之天花封板深度`,
    '天花降板層'
  );

  const switchElevation = createItem(
    'dim-elev-switch',
    'elevation',
    `進門照明雙切開關出線 FL+120cm`,
    120,
    'elevation',
    `開關底盒中心標高，人體工學標準 5 倍數`,
    '電氣開關'
  );

  const socketElevation = createItem(
    'dim-elev-socket',
    'elevation',
    `主牆/地坪插座出線標高 FL+30cm`,
    30,
    'elevation',
    `一般插座與影音弱電插座中心出線標高`,
    '弱電插座'
  );

  let sillElevation: AutoDimensionItem | undefined;
  if (room.windows && room.windows.length > 0) {
    const firstWin = room.windows[0];
    sillElevation = createItem(
      `dim-elev-win-sill-${firstWin.id}`,
      'elevation',
      `${firstWin.name} 窗台度標高 FL+${firstWin.sillHeight}cm`,
      firstWin.sillHeight,
      'elevation',
      `落地窗下緣台度完成面標高`,
      firstWin.name
    );
  }

  // Pass rate stats
  const totalCount = allDimensions.length;
  const rule5PassedCount = allDimensions.filter((d) => d.rule5Compliant).length;
  const rule5PassRate = totalCount > 0 ? Math.round((rule5PassedCount / totalCount) * 100) : 100;

  return {
    wallChains,
    openingOffsets,
    elevationSet: {
      slabHeight,
      beamClearance,
      ceilingDrop,
      bathKitchenDrop,
      dropDepthDifference,
      switchElevation,
      socketElevation,
      sillElevation,
    },
    allDimensions,
    totalCount,
    rule5PassedCount,
    rule5PassRate,
  };
}

/**
 * -------------------------------------------------------------
 * 星玥灣幾何契約規範：自動尺寸鏈 (牆面與梁間距自動計算與5倍數紅框檢核)
 * -------------------------------------------------------------
 */
export interface WallBeamDimensionSegment {
  id: string;
  axis: 'X' | 'Y';
  fromLabel: string;
  toLabel: string;
  fromCoord: number; // in cm
  toCoord: number;   // in cm
  distance: number;  // in cm
  rule5Compliant: boolean;
  recommendedValue: number; // nearest 5-multiple
  deviation: number;        // distance - recommendedValue
  severity: 'COMPLIANT' | 'WARNING';
  targetBeamId?: string;
  beamName?: string;
  segmentType: 'wall_to_beam' | 'beam_width' | 'beam_to_beam' | 'beam_to_wall' | 'full_span';
  description: string;
}

export interface WallBeamDimensionChainResult {
  roomName: string;
  roomWidth: number;
  roomLength: number;
  yChainSegments: WallBeamDimensionSegment[];
  xChainSegments: WallBeamDimensionSegment[];
  allSegments: WallBeamDimensionSegment[];
  totalSegments: number;
  rule5CompliantCount: number;
  violationsCount: number;
  rule5PassRate: number;
  hasViolations: boolean;
}

/**
 * 自動計算所選空間牆面與梁的間距尺寸鏈：
 * 1. 縱向 Y 軸尺寸鏈：北牆(Y:0) ➜ 橫向各梁 ➜ 南牆(Y:L)
 * 2. 橫向 X 軸尺寸鏈：西牆(X:0) ➜ 縱向各梁 ➜ 東牆(X:W)
 * 3. 逐段進行星玥灣幾何契約 5 倍數標準檢核，非 5 倍數間距標記為 WARNING 並指定紅框警示
 */
export function calculateWallBeamDimensionChains(room: RoomData): WallBeamDimensionChainResult {
  const roomWidth = Math.round(Number(room.width) || 480);
  const roomLength = Math.round(Number(room.length) || 550);
  const beams = Array.isArray(room.beams) ? room.beams : [];

  const yChainSegments: WallBeamDimensionSegment[] = [];
  const xChainSegments: WallBeamDimensionSegment[] = [];

  // Helper to create a dimension chain segment
  const createSegment = (
    axis: 'X' | 'Y',
    fromLabel: string,
    toLabel: string,
    fromCoord: number,
    toCoord: number,
    segmentType: WallBeamDimensionSegment['segmentType'],
    targetBeamId?: string,
    beamName?: string,
    customDesc?: string
  ): WallBeamDimensionSegment => {
    const rawDist = Math.abs(toCoord - fromCoord);
    const distance = Math.round(rawDist * 10) / 10;
    const is5Multiple = Math.round(distance) % 5 === 0;
    const recommendedValue = Math.max(5, Math.round(distance / 5) * 5);
    const deviation = Math.round((distance - recommendedValue) * 10) / 10;

    const id = `chain-${axis}-${fromCoord}-${toCoord}-${segmentType}`;
    let description = customDesc;
    if (!description) {
      if (is5Multiple) {
        description = `${fromLabel} 至 ${toLabel} 間距 ${distance} cm，符合星玥灣 5 倍數契約模數。`;
      } else {
        const sign = deviation > 0 ? `+${deviation}` : `${deviation}`;
        description = `⚠️【紅框警示】${fromLabel} 至 ${toLabel} 實測 ${distance} cm (非5倍數，偏離 ${sign} cm)。建議調整為 ${recommendedValue} cm。`;
      }
    }

    return {
      id,
      axis,
      fromLabel,
      toLabel,
      fromCoord,
      toCoord,
      distance,
      rule5Compliant: is5Multiple,
      recommendedValue,
      deviation,
      severity: is5Multiple ? 'COMPLIANT' : 'WARNING',
      targetBeamId,
      beamName,
      segmentType,
      description,
    };
  };

  // 1. 計算 Y 軸尺寸鏈 (北牆 ➜ 橫梁 ➜ 南牆)
  const hBeams = beams
    .filter((b) => b.orientation !== 'vertical')
    .sort((a, b) => a.y - b.y);

  if (hBeams.length === 0) {
    // 無橫梁，全開間淨跨
    yChainSegments.push(
      createSegment('Y', '北向外牆 (Y:0)', `南向外牆 (Y:${roomLength})`, 0, roomLength, 'full_span', undefined, undefined, `全室無橫梁阻斷，進深淨跨 ${roomLength} cm`)
    );
  } else {
    let currentY = 0;
    hBeams.forEach((b, idx) => {
      const beamTop = Math.max(0, b.y);
      const beamThick = Math.max(10, b.width || 35);
      const beamBottom = beamTop + beamThick;

      // 牆到梁 或 梁到梁 間距
      if (beamTop > currentY) {
        const fromName = idx === 0 ? '北向牆面 (Y:0)' : `${hBeams[idx - 1].name} 下緣 (Y:${currentY})`;
        const toName = `${b.name} 上緣 (Y:${beamTop})`;
        const segType = idx === 0 ? 'wall_to_beam' : 'beam_to_beam';
        yChainSegments.push(createSegment('Y', fromName, toName, currentY, beamTop, segType, b.id, b.name));
      }

      // 梁體本身寬度/斷面尺寸
      yChainSegments.push(
        createSegment('Y', `${b.name} 上緣 (Y:${beamTop})`, `${b.name} 下緣 (Y:${beamBottom})`, beamTop, beamBottom, 'beam_width', b.id, b.name, `${b.name} 斷面結構寬度 ${beamThick} cm (梁下淨高 FL+${b.clearHeight}cm)`)
      );

      currentY = beamBottom;
    });

    // 末梁到南牆間距
    if (currentY < roomLength) {
      const lastBeam = hBeams[hBeams.length - 1];
      yChainSegments.push(
        createSegment(
          'Y',
          `${lastBeam.name} 下緣 (Y:${currentY})`,
          `南向牆面 (Y:${roomLength})`,
          currentY,
          roomLength,
          'beam_to_wall',
          lastBeam.id,
          lastBeam.name
        )
      );
    }
  }

  // 2. 計算 X 軸尺寸鏈 (西牆 ➜ 縱梁 ➜ 東牆)
  const vBeams = beams
    .filter((b) => b.orientation === 'vertical')
    .sort((a, b) => (a.x ?? 0) - (b.x ?? 0));

  if (vBeams.length === 0) {
    // 無縱梁，全開間面寬淨跨
    xChainSegments.push(
      createSegment('X', '西向外牆 (X:0)', `東向外牆 (X:${roomWidth})`, 0, roomWidth, 'full_span', undefined, undefined, `全室無縱向立柱/縱梁阻斷，開間面寬 ${roomWidth} cm`)
    );
  } else {
    let currentX = 0;
    vBeams.forEach((b, idx) => {
      const beamLeft = Math.max(0, b.x ?? 0);
      const beamThick = Math.max(10, b.width || 35);
      const beamRight = beamLeft + beamThick;

      // 牆到梁 或 梁到梁 間距
      if (beamLeft > currentX) {
        const fromName = idx === 0 ? '西向牆面 (X:0)' : `${vBeams[idx - 1].name} 右緣 (X:${currentX})`;
        const toName = `${b.name} 左緣 (X:${beamLeft})`;
        const segType = idx === 0 ? 'wall_to_beam' : 'beam_to_beam';
        xChainSegments.push(createSegment('X', fromName, toName, currentX, beamLeft, segType, b.id, b.name));
      }

      // 梁體本身寬度
      xChainSegments.push(
        createSegment('X', `${b.name} 左緣 (X:${beamLeft})`, `${b.name} 右緣 (X:${beamRight})`, beamLeft, beamRight, 'beam_width', b.id, b.name, `${b.name} 縱梁結構寬度 ${beamThick} cm`)
      );

      currentX = beamRight;
    });

    // 末梁到東牆間距
    if (currentX < roomWidth) {
      const lastBeam = vBeams[vBeams.length - 1];
      xChainSegments.push(
        createSegment(
          'X',
          `${lastBeam.name} 右緣 (X:${currentX})`,
          `東向牆面 (X:${roomWidth})`,
          currentX,
          roomWidth,
          'beam_to_wall',
          lastBeam.id,
          lastBeam.name
        )
      );
    }
  }

  const allSegments = [...yChainSegments, ...xChainSegments];
  const totalSegments = allSegments.length;
  const rule5CompliantCount = allSegments.filter((s) => s.rule5Compliant).length;
  const violationsCount = totalSegments - rule5CompliantCount;
  const rule5PassRate = totalSegments > 0 ? Math.round((rule5CompliantCount / totalSegments) * 100) : 100;

  return {
    roomName: room.roomName,
    roomWidth,
    roomLength,
    yChainSegments,
    xChainSegments,
    allSegments,
    totalSegments,
    rule5CompliantCount,
    violationsCount,
    rule5PassRate,
    hasViolations: violationsCount > 0,
  };
}

/**
 * 星玥灣一鍵契約校正 (Snap to Rule 5):
 * 將所有梁體的坐標 (y, x) 與寬度 (width) 強制四捨五入至最接近之 5 倍數，
 * 保證尺寸鏈 100% 符合星玥灣幾何契約。
 */
export function snapRoomBeamsToRule5(room: RoomData): RoomData {
  const updatedBeams = (room.beams || []).map((b) => {
    const snappedY = Math.round(b.y / 5) * 5;
    const snappedWidth = Math.max(10, Math.round((b.width || 35) / 5) * 5);
    const snappedX = b.x !== undefined ? Math.round(b.x / 5) * 5 : undefined;
    const snappedClearHeight = Math.round((b.clearHeight || 265) / 5) * 5;

    return {
      ...b,
      y: snappedY,
      width: snappedWidth,
      x: snappedX,
      clearHeight: snappedClearHeight,
    };
  });

  return {
    ...room,
    beams: updatedBeams,
    lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}

/**
 * 星玥灣一鍵單段尺寸校正 (One-Click Snap Red Box to Rule 5):
 * 當使用者點擊警示紅框 (非 5 倍數之牆面與梁間距)，自動將該尺寸調整為最接近之 5 倍數，
 * 並即時更新對應之梁體坐標 (Y/X)、梁體寬度或開間尺寸，同步更新 CAD 繪圖物件。
 */
export function correctSegmentToRule5(
  room: RoomData,
  segment: WallBeamDimensionSegment
): {
  updatedRoom: RoomData;
  message: string;
  prevDist: number;
  newDist: number;
  targetObjectDesc: string;
} {
  const prevDist = segment.distance;
  const newDist = segment.recommendedValue;
  let updatedBeams = [...(room.beams || [])];
  let updatedWidth = room.width;
  let updatedLength = room.length;
  let message = '';
  let targetObjectDesc = '';

  if (segment.segmentType === 'beam_width' && segment.targetBeamId) {
    updatedBeams = updatedBeams.map((b) => {
      if (b.id === segment.targetBeamId) {
        return { ...b, width: newDist };
      }
      return b;
    });
    targetObjectDesc = `梁體斷面 [${segment.beamName || '結構梁'}]`;
    message = `已將「${segment.beamName || '梁體'}」斷面寬度由 ${prevDist} cm 校正為 ${newDist} cm (符合 5 倍數契約模數)`;
  } else if (segment.segmentType === 'wall_to_beam' && segment.targetBeamId) {
    if (segment.axis === 'Y') {
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, y: newDist };
        }
        return b;
      });
      targetObjectDesc = `北向外牆至梁間距 [${segment.beamName || '結構梁'}]`;
      message = `已將北牆至「${segment.beamName || '梁體'}」淨距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 梁頂坐標對齊 Y=${newDist})`;
    } else {
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, x: newDist };
        }
        return b;
      });
      targetObjectDesc = `西向外牆至梁間距 [${segment.beamName || '結構梁'}]`;
      message = `已將西牆至「${segment.beamName || '梁體'}」淨距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 梁左坐標對齊 X=${newDist})`;
    }
  } else if (segment.segmentType === 'beam_to_beam' && segment.targetBeamId) {
    // segment.fromCoord 是上一根梁的底緣，segment.toCoord 是本梁頂緣
    if (segment.axis === 'Y') {
      const newY = Math.round(segment.fromCoord + newDist);
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, y: newY };
        }
        return b;
      });
      targetObjectDesc = `跨梁跨距 [${segment.beamName || '次梁'}]`;
      message = `已將跨梁淨距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 物件位移「${segment.beamName}」至 Y=${newY})`;
    } else {
      const newX = Math.round(segment.fromCoord + newDist);
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, x: newX };
        }
        return b;
      });
      targetObjectDesc = `跨梁跨距 [${segment.beamName || '縱梁'}]`;
      message = `已將跨梁淨距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 物件位移「${segment.beamName}」至 X=${newX})`;
    }
  } else if (segment.segmentType === 'beam_to_wall' && segment.targetBeamId) {
    if (segment.axis === 'Y') {
      const lastBeam = updatedBeams.find((b) => b.id === segment.targetBeamId);
      const beamThick = lastBeam?.width || 35;
      const targetY = Math.max(0, updatedLength - newDist - beamThick);
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, y: targetY };
        }
        return b;
      });
      targetObjectDesc = `末梁至南牆間距 [${segment.beamName || '結構梁'}]`;
      message = `已將末梁至南牆間距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 坐標調整至 Y=${targetY})`;
    } else {
      const lastBeam = updatedBeams.find((b) => b.id === segment.targetBeamId);
      const beamThick = lastBeam?.width || 35;
      const targetX = Math.max(0, updatedWidth - newDist - beamThick);
      updatedBeams = updatedBeams.map((b) => {
        if (b.id === segment.targetBeamId) {
          return { ...b, x: targetX };
        }
        return b;
      });
      targetObjectDesc = `末梁至東牆間距 [${segment.beamName || '縱梁'}]`;
      message = `已將末梁至東牆間距由 ${prevDist} cm 校正為 ${newDist} cm (CAD 坐標調整至 X=${targetX})`;
    }
  } else if (segment.segmentType === 'full_span') {
    if (segment.axis === 'Y') {
      updatedLength = newDist;
      targetObjectDesc = `空間進深長度 (Y 全跨)`;
      message = `已將空間進深由 ${prevDist} cm 校正為 ${newDist} cm (5 倍數契約模數)`;
    } else {
      updatedWidth = newDist;
      targetObjectDesc = `空間開間面寬 (X 全跨)`;
      message = `已將空間開間面寬由 ${prevDist} cm 校正為 ${newDist} cm (5 倍數契約模數)`;
    }
  } else {
    const snapped = snapRoomBeamsToRule5(room);
    return {
      updatedRoom: snapped,
      message: `已將梁位與尺寸校正為 5 倍數模數 (${prevDist} cm ➜ ${newDist} cm)`,
      prevDist,
      newDist,
      targetObjectDesc: '梁體與開間',
    };
  }

  // 同步虛擬標註 (若存在)
  const updatedVirtualAnnotations = room.virtualAnnotations?.map((va) => {
    if (!va.rule5MultipleCompliant) {
      const snappedVal = Math.round(va.dimensionValue / 5) * 5;
      return {
        ...va,
        dimensionValue: snappedVal,
        rule5MultipleCompliant: true,
      };
    }
    return va;
  });

  const updatedRoom: RoomData = {
    ...room,
    width: updatedWidth,
    length: updatedLength,
    beams: updatedBeams,
    virtualAnnotations: updatedVirtualAnnotations,
    lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };

  return {
    updatedRoom,
    message,
    prevDist,
    newDist,
    targetObjectDesc,
  };
}

/**
 * 匯出 AutoCAD 自動尺寸鏈批次標註指令 (LISP / Script)
 */
export function generateCadDimensionLisp(result: WallBeamDimensionChainResult): string {
  const lines: string[] = [
    `;;; ========================================================`,
    `;;; 星玥灣 8F 自動尺寸鏈 (牆-梁 5 倍數契約規範) AutoLISP 批次指令`,
    `;;; 空間名稱：${result.roomName}`,
    `;;; 檢驗結果：總段數 ${result.totalSegments} 處，合規率 ${result.rule5PassRate}%`,
    `;;; 警示段數：${result.violationsCount} 處 (非 5 倍數需紅框標註)`,
    `;;; ========================================================`,
    `(defun c:DRAW_DIM_CHAINS ()`,
    `  (setvar "CMDECHO" 0)`,
    `  (command "_LAYER" "_M" "DIM_CHAIN_5X" "_C" "3" "" "")   ; 綠色 5倍數合規層`,
    `  (command "_LAYER" "_M" "DIM_CHAIN_ALERT" "_C" "1" "" "") ; 紅色 違規紅框層`,
    ``,
    `  ;;; 1. 縱向 Y 軸尺寸鏈 (北牆 ➜ 梁 ➜ 南牆)`,
  ];

  result.yChainSegments.forEach((seg, idx) => {
    const layer = seg.rule5Compliant ? "DIM_CHAIN_5X" : "DIM_CHAIN_ALERT";
    lines.push(`  ;; [Y-#${idx + 1}] ${seg.fromLabel} ➜ ${seg.toLabel} (${seg.distance} cm) ${seg.rule5Compliant ? 'PASS' : 'ALERT'}`);
    lines.push(`  (command "_LAYER" "_S" "${layer}" "")`);
    lines.push(`  (command "_DIMLINEAR" (list -25.0 ${seg.fromCoord}) (list -25.0 ${seg.toCoord}) (list -40.0 ${seg.fromCoord}))`);
    if (!seg.rule5Compliant) {
      lines.push(`  ;; 繪製紅框警示方塊 (非 5 倍數)`);
      lines.push(`  (command "_RECTANG" (list -55.0 ${seg.fromCoord}) (list 5.0 ${seg.toCoord}))`);
    }
  });

  lines.push(``);
  lines.push(`  ;;; 2. 橫向 X 軸尺寸鏈 (西牆 ➜ 梁 ➜ 東牆)`);
  result.xChainSegments.forEach((seg, idx) => {
    const layer = seg.rule5Compliant ? "DIM_CHAIN_5X" : "DIM_CHAIN_ALERT";
    lines.push(`  ;; [X-#${idx + 1}] ${seg.fromLabel} ➜ ${seg.toLabel} (${seg.distance} cm) ${seg.rule5Compliant ? 'PASS' : 'ALERT'}`);
    lines.push(`  (command "_LAYER" "_S" "${layer}" "")`);
    lines.push(`  (command "_DIMLINEAR" (list ${seg.fromCoord} -25.0) (list ${seg.toCoord} -25.0) (list ${seg.fromCoord} -40.0))`);
    if (!seg.rule5Compliant) {
      lines.push(`  ;; 繪製紅框警示方塊 (非 5 倍數)`);
      lines.push(`  (command "_RECTANG" (list ${seg.fromCoord} -55.0) (list ${seg.toCoord} 5.0))`);
    }
  });

  lines.push(`  (princ "\\n星玥灣自動尺寸鏈標註已繪製完成！\\n")`);
  lines.push(`  (princ)`);
  lines.push(`)`);
  lines.push(`(c:DRAW_DIM_CHAINS)`);

  return lines.join('\n');
}
