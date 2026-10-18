import { RoomData, Door, WindowOpening, Beam, PlacedBlockItem } from '../types';

export interface RoomTemplate {
  id: string;
  title: string;
  category: 'basic' | 'residential' | 'special';
  description: string;
  approxAreaPing: number;
  width: number; // cm
  length: number; // cm
  height: number; // cm (default 280)
  beamHeight: number; // cm (default 265)
  ceilingDrop: number; // cm (default 230)
  bathKitchenDrop?: number; // cm (default 215)
  doors: Door[];
  windows: WindowOpening[];
  beams: Beam[];
  placedBlocks?: PlacedBlockItem[];
  badge: string;
  iconType: 'blank' | 'living' | 'bedroom' | 'study' | 'studio' | 'kitchen' | 'bath';
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'tpl-blank',
    title: '完全空白畫布 (零雜質)',
    category: 'basic',
    description: '100% 乾淨極簡矩形邊界，無任何預載樑柱、門窗、錄音或標註，專為現場全新放樣打造。',
    approxAreaPing: 5.2,
    width: 480,
    length: 360,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [],
    windows: [],
    beams: [],
    badge: '100% 純淨空白',
    iconType: 'blank',
  },
  {
    id: 'tpl-living',
    title: '現代客餐廳開放格局',
    category: 'residential',
    description: '大器公領域開間，預設 720 × 480 cm，僅包含大門開口與採光景觀窗，畫布無多餘雜項。',
    approxAreaPing: 10.5,
    width: 720,
    length: 480,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-main', name: '大門入戶防爆門', width: 100, height: 210, wall: 'bottom', offset: 50 },
    ],
    windows: [
      { id: 'w-view', name: '落地採光景觀窗', width: 320, height: 240, sillHeight: 15, wall: 'top', offset: 80 },
    ],
    beams: [],
    badge: '客餐廳標準款',
    iconType: 'living',
  },
  {
    id: 'tpl-townhouse-longitudinal',
    title: '透天窄面寬 · 中段直向梯',
    category: 'residential',
    description: '面寬 450cm、進深 1400cm 的長型透天空模；只保留入口與建築中段直向樓梯，其他格局完全留白供現場丈量。',
    approxAreaPing: 19.1,
    width: 450,
    length: 1400,
    height: 300,
    beamHeight: 280,
    ceilingDrop: 245,
    bathKitchenDrop: 225,
    doors: [{ id: 'd-townhouse-long', name: '透天玄關大門', type: 'entryway', width: 120, height: 225, wall: 'bottom', offset: 165 }],
    windows: [], beams: [],
    placedBlocks: [{ id: 'tpl-stair-long', blockId: 'stair-straight-parametric-v1', name: '中段直向梯', category: 'detail_joint', subCategory: 'stair:straight', x: 175, y: 520, widthCm: 100, depthCm: 360, heightCm: 300, cadLayer: 'A-STAIR', colorIndex: 3, rotationDeg: 0, snappedTo: '建築中段軸線', tags: ['stairType:straight', 'verification:APP_PARAMETRIC_ONLY'] }],
    badge: '透天空模 · 直向梯', iconType: 'blank',
  },
  {
    id: 'tpl-townhouse-transverse',
    title: '透天窄面寬 · 中段橫向梯',
    category: 'residential',
    description: '面寬 450cm、進深 1400cm 的長型透天空模；只保留入口與建築中段橫向樓梯，適合樓梯跨越面寬配置。',
    approxAreaPing: 19.1,
    width: 450,
    length: 1400,
    height: 300,
    beamHeight: 280,
    ceilingDrop: 245,
    bathKitchenDrop: 225,
    doors: [{ id: 'd-townhouse-cross', name: '透天玄關大門', type: 'entryway', width: 120, height: 225, wall: 'bottom', offset: 165 }],
    windows: [], beams: [],
    placedBlocks: [{ id: 'tpl-stair-cross', blockId: 'stair-straight-parametric-v1', name: '中段橫向梯', category: 'detail_joint', subCategory: 'stair:straight', x: 45, y: 650, widthCm: 360, depthCm: 100, heightCm: 300, cadLayer: 'A-STAIR', colorIndex: 3, rotationDeg: 90, snappedTo: '建築中段橫軸', tags: ['stairType:straight', 'verification:APP_PARAMETRIC_ONLY'] }],
    badge: '透天空模 · 橫向梯', iconType: 'blank',
  },
  {
    id: 'tpl-master-bed',
    title: '標準主臥套房',
    category: 'residential',
    description: '標準主臥進深比例 450 × 380 cm，純淨牆體，預留一扇進門開口與大採光窗。',
    approxAreaPing: 5.2,
    width: 450,
    length: 380,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-master', name: '主臥木作房門', width: 90, height: 210, wall: 'bottom', offset: 40 },
    ],
    windows: [
      { id: 'w-master', name: '主臥雙推氣密窗', width: 180, height: 160, sillHeight: 80, wall: 'top', offset: 60 },
    ],
    beams: [],
    badge: '主臥舒適規格',
    iconType: 'bedroom',
  },
  {
    id: 'tpl-secondary-bed',
    title: '多功能次臥 / 書房',
    category: 'residential',
    description: '精緻方正次臥 360 × 300 cm，適合小孩房、客房或獨立書房放樣。',
    approxAreaPing: 3.3,
    width: 360,
    length: 300,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-sec', name: '次臥房門', width: 90, height: 210, wall: 'bottom', offset: 30 },
    ],
    windows: [
      { id: 'w-sec', name: '採光窗', width: 140, height: 140, sillHeight: 90, wall: 'top', offset: 50 },
    ],
    beams: [],
    badge: '次臥/書房款',
    iconType: 'study',
  },
  {
    id: 'tpl-studio',
    title: '都會單身小宅 / 套房',
    category: 'residential',
    description: '長型開放式 Studio 格局 600 × 380 cm，起居睡眠一體化，空間流暢無柱。',
    approxAreaPing: 6.9,
    width: 600,
    length: 380,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-studio', name: '玄關門', width: 95, height: 210, wall: 'bottom', offset: 40 },
    ],
    windows: [
      { id: 'w-studio', name: '陽台落地門窗', width: 220, height: 230, sillHeight: 15, wall: 'top', offset: 60 },
    ],
    beams: [],
    badge: '單身公寓/套房',
    iconType: 'studio',
  },
  {
    id: 'tpl-kitchen',
    title: '獨立廚房工作間',
    category: 'special',
    description: '標準一字型或 L 型廚房空間 320 × 240 cm，預設地坪降板 215 cm。',
    approxAreaPing: 2.3,
    width: 320,
    length: 240,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-kitchen', name: '廚房推拉門', width: 90, height: 215, wall: 'bottom', offset: 30 },
    ],
    windows: [
      { id: 'w-kitchen', name: '工作陽台出入門', width: 80, height: 200, sillHeight: 0, wall: 'top', offset: 120 },
    ],
    beams: [],
    badge: '廚區降板契約',
    iconType: 'kitchen',
  },
  {
    id: 'tpl-bathroom',
    title: '乾濕分離主衛浴',
    category: 'special',
    description: '標準四件式或三件式衛浴空間 240 × 180 cm，地坪落塵/排水降板標高 215 cm。',
    approxAreaPing: 1.3,
    width: 240,
    length: 180,
    height: 280,
    beamHeight: 265,
    ceilingDrop: 230,
    bathKitchenDrop: 215,
    doors: [
      { id: 'd-bath', name: '衛浴防潮門', width: 75, height: 200, wall: 'bottom', offset: 25 },
    ],
    windows: [
      { id: 'w-bath', name: '高側百葉通風窗', width: 60, height: 50, sillHeight: 180, wall: 'top', offset: 40 },
    ],
    beams: [],
    badge: '水區降板契約',
    iconType: 'bath',
  },
];

/**
 * 根據範本建立全新純淨的 RoomData 物件
 * 嚴格保證：0 條假語音備忘、0 個假水電插座、0 根假樑！
 */
export function createCleanRoomFromTemplate(
  template: RoomTemplate,
  customName?: string,
  keepMinimalOpenings: boolean = true
): RoomData {
  const ts = Date.now().toString().slice(-4);
  return {
    id: `room-${template.id}-${ts}`,
    roomName: customName || template.title.split(' ')[0],
    width: template.width,
    length: template.length,
    height: template.height,
    ceilingDrop: template.ceilingDrop,
    beamHeight: template.beamHeight,
    bathKitchenDrop: template.bathKitchenDrop || 215,
    wallThickness: 15,
    evaluation: {
      score: 95,
      clarity: '特優',
      missingElements: [],
      rule5MultiplePassed: true,
      suggestions: '新建空間已自動套用《降板裁決_v003》之 265/230/215 標準契約規範。',
    },
    beams: [], // 永遠純淨空白！
    doors: keepMinimalOpenings ? template.doors : [],
    windows: keepMinimalOpenings ? template.windows : [],
    voiceMemos: [], // 永遠為空！不留任何雜質
    electricalPoints: [], // 永遠為空！
    lightingPoints: [],
    virtualAnnotations: [],
    placedBlocks: (template.placedBlocks || []).map((item) => ({ ...item, id: `${item.id}-${ts}`, placedAt: new Date().toISOString() })),
    lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    notes: [`純淨畫布建立於 ${new Date().toLocaleDateString()}`],
  };
}

/**
 * 建立整套「純淨兩房一廳」全新成案（客廳 + 主臥 + 次臥）
 */
export function createTwoBedOneBathSuite(): RoomData[] {
  const livingTpl = ROOM_TEMPLATES.find((t) => t.id === 'tpl-living')!;
  const masterTpl = ROOM_TEMPLATES.find((t) => t.id === 'tpl-master-bed')!;
  const secTpl = ROOM_TEMPLATES.find((t) => t.id === 'tpl-secondary-bed')!;

  return [
    createCleanRoomFromTemplate(livingTpl, '客餐廳放樣區'),
    createCleanRoomFromTemplate(masterTpl, '主臥室放樣區'),
    createCleanRoomFromTemplate(secTpl, '次臥/書房放樣區'),
  ];
}

/**
 * 建立單一純淨空白房間 (自訂尺寸)
 */
export function createCustomBlankRoom(
  name: string,
  width: number,
  length: number,
  height: number = 280,
  beamHeight: number = 265,
  ceilingDrop: number = 230
): RoomData {
  const ts = Date.now().toString().slice(-4);
  return {
    id: `room-custom-${ts}`,
    roomName: name || `自訂空間放樣 #${ts}`,
    width: Math.max(100, Math.round(width / 5) * 5),
    length: Math.max(100, Math.round(length / 5) * 5),
    height: Math.max(200, Math.round(height / 5) * 5),
    beamHeight: Math.max(180, Math.round(beamHeight / 5) * 5),
    ceilingDrop: Math.max(180, Math.round(ceilingDrop / 5) * 5),
    bathKitchenDrop: 215,
    wallThickness: 15,
    evaluation: {
      score: 95,
      clarity: '優良',
      missingElements: [],
      rule5MultiplePassed: true,
      suggestions: '自訂純淨空間已就緒，高層符合 5 倍數工程模數。',
    },
    beams: [],
    doors: [],
    windows: [],
    voiceMemos: [],
    electricalPoints: [],
    lightingPoints: [],
    virtualAnnotations: [],
    lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}
