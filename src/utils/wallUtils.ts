import { RoomData, Column, WallConfigs } from '../types';

export type WallDirection = 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'left' | 'right';

/**
 * 將方向標準化為 north | south | east | west
 */
export function normalizeWallDirection(dir: WallDirection): 'north' | 'south' | 'east' | 'west' {
  if (dir === 'top' || dir === 'north') return 'north';
  if (dir === 'bottom' || dir === 'south') return 'south';
  if (dir === 'left' || dir === 'west') return 'west';
  return 'east';
}

/**
 * 取得指定牆面的厚度 (cm)
 * 丈量階段統一預設 10cm (輕隔間標準)
 * 若有設定外牆，則標準為 15cm (或使用者自訂如紅磚 12cm、RC 20cm)
 */
export function getWallThickness(room: RoomData, wallDir: WallDirection): number {
  const norm = normalizeWallDirection(wallDir);
  const sideConfig = room.wallConfigs?.[norm];
  if (sideConfig && typeof sideConfig.thickness === 'number' && sideConfig.thickness > 0) {
    return sideConfig.thickness;
  }
  if (sideConfig?.isExterior) {
    return 15;
  }
  // 若房間未單獨設定該牆，預設採房間全室壁厚 (若無設定則預設丈量標準 10cm)
  return room.wallThickness || 10;
}

/**
 * 檢查指定牆面是否設定為外牆
 */
export function isExteriorWall(room: RoomData, wallDir: WallDirection): boolean {
  const norm = normalizeWallDirection(wallDir);
  const sideConfig = room.wallConfigs?.[norm];
  if (sideConfig) {
    return sideConfig.type === 'exterior' || Boolean(sideConfig.isExterior) || sideConfig.thickness >= 15;
  }
  return false;
}

/**
 * 更新房間指定牆面的外牆/內牆屬性與厚度
 */
export function updateWallConfig(
  room: RoomData,
  wallDir: WallDirection,
  type: 'interior' | 'exterior' | 'brick' | 'custom',
  customThickness?: number
): RoomData {
  const norm = normalizeWallDirection(wallDir);
  const thickness = customThickness !== undefined && customThickness > 0
    ? customThickness
    : type === 'exterior'
    ? 15
    : type === 'brick'
    ? 12
    : 10; // interior default 10

  const currentConfigs: WallConfigs = room.wallConfigs || {};
  const newConfigs: WallConfigs = {
    ...currentConfigs,
    [norm]: {
      type,
      thickness,
      isExterior: type === 'exterior',
    },
  };

  return {
    ...room,
    wallConfigs: newConfigs,
  };
}

/**
 * 取得牆體方向的面對視角說明與起算基準
 */
export function getWallCornerDescriptions(wallDir: WallDirection): {
  leftCornerName: string;
  rightCornerName: string;
  facingDescription: string;
} {
  const norm = normalizeWallDirection(wallDir);
  switch (norm) {
    case 'north':
      return {
        leftCornerName: '西北角 (NW)',
        rightCornerName: '東北角 (NE)',
        facingDescription: '面向北牆：左側為西北牆角，右側為東北牆角',
      };
    case 'south':
      return {
        leftCornerName: '東南角 (SE)',
        rightCornerName: '西南角 (SW)',
        facingDescription: '面向南牆：左側為東南牆角，右側為西南牆角',
      };
    case 'east':
      return {
        leftCornerName: '東北角 (NE)',
        rightCornerName: '東南角 (SE)',
        facingDescription: '面向東牆：左側為東北牆角，右側為東南牆角',
      };
    case 'west':
      return {
        leftCornerName: '西南角 (SW)',
        rightCornerName: '西北角 (NW)',
        facingDescription: '面向西牆：左側為西南牆角，右側為西北牆角',
      };
  }
}

/**
 * 計算開口部 (門/窗) 離左側與離右側的雙向即時尺寸換算
 * @param wallSpan 牆面總淨長度 (如北牆面寬 480cm)
 * @param openingWidth 開口部寬度 (如窗寬 120cm)
 * @param currentOffset 目前儲存的 offset (以左側為內部絕對基準)
 * @param reference 使用者當前選擇的輸入基準 ('left' | 'right' | 'center')
 */
export function calculateOpeningDualOffsets(
  wallSpan: number,
  openingWidth: number,
  currentOffset: number,
  reference: 'left' | 'right' | 'center' = 'left'
): {
  fromLeft: number;
  fromRight: number;
  isCenter: boolean;
  centerLeftOffset: number;
} {
  const safeWall = Math.max(30, wallSpan);
  const safeWidth = Math.max(10, Math.min(safeWall, openingWidth));
  const maxOffset = Math.max(0, safeWall - safeWidth);
  const centerLeftOffset = Math.max(0, Math.round((safeWall - safeWidth) / 2));

  let fromLeft = currentOffset;
  if (reference === 'center') {
    fromLeft = centerLeftOffset;
  } else {
    fromLeft = Math.max(0, Math.min(maxOffset, currentOffset));
  }

  const fromRight = Math.max(0, safeWall - (fromLeft + safeWidth));
  const isCenter = Math.abs(fromLeft - centerLeftOffset) <= 1;

  return {
    fromLeft,
    fromRight,
    isCenter,
    centerLeftOffset,
  };
}

/**
 * 計算柱體在房間坐標系中的 (x, y) 位置與邊界
 */
export function getColumnCoordinates(room: RoomData, col: Column): {
  x: number;
  y: number;
  width: number;
  depth: number;
} {
  const w = col.width || 50;
  const d = col.depth || 50;
  let x = 0;
  let y = 0;

  if (col.positionType === 'corner') {
    switch (col.corner) {
      case 'top-left':
        x = 0;
        y = 0;
        break;
      case 'top-right':
        x = Math.max(0, room.width - w);
        y = 0;
        break;
      case 'bottom-left':
        x = 0;
        y = Math.max(0, room.length - d);
        break;
      case 'bottom-right':
      default:
        x = Math.max(0, room.width - w);
        y = Math.max(0, room.length - d);
        break;
    }
  } else if (col.positionType === 'wall') {
    const norm = normalizeWallDirection((col.wall as any) || 'north');
    const offset = col.offset || 0;
    switch (norm) {
      case 'north':
        x = Math.max(0, Math.min(room.width - w, offset));
        y = 0;
        break;
      case 'south':
        x = Math.max(0, Math.min(room.width - w, offset));
        y = Math.max(0, room.length - d);
        break;
      case 'west':
        x = 0;
        y = Math.max(0, Math.min(room.length - d, offset));
        break;
      case 'east':
        x = Math.max(0, room.width - w);
        y = Math.max(0, Math.min(room.length - d, offset));
        break;
    }
  } else {
    // 獨立柱 free
    x = Math.max(0, Math.min(room.width - w, col.x ?? 50));
    y = Math.max(0, Math.min(room.length - d, col.y ?? 50));
  }

  return { x, y, width: w, depth: d };
}
