import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  X,
  Upload,
  Plus,
  CheckCircle2,
  Trash2,
  Download,
  Search,
  Filter,
  Layers,
  Ruler,
  Check,
  Sparkles,
  Printer,
  Scissors,
  FileCode,
  Palette,
  Sliders,
  Grid,
  FileSpreadsheet,
  Tag,
  Tags,
  AlertTriangle,
  Wand2,
  Info,
  SlidersHorizontal,
  RefreshCw,
  LayoutGrid,
  LayoutList,
  GripVertical,
  Magnet,
  Maximize2,
  Minimize2,
  Move,
} from 'lucide-react';
import { PersonalDetailBlockItem, RoomData, CustomHatchPatternData } from '../types';

interface PersonalDetailBlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onInsertBlockToRoom?: (block: PersonalDetailBlockItem) => void;
  onNotify?: (msg: string) => void;
  onDragBlockStart?: (block: PersonalDetailBlockItem) => void;
  onDragBlockEnd?: () => void;
  isDockedPalette?: boolean;
  onToggleDockedPalette?: () => void;
}

// -------------------------------------------------------------
// CAD 圖層比例規範與剖面填充一致性校正矩陣 (Layer Hatch Specifications)
// -------------------------------------------------------------
export interface LayerHatchSpec {
  layerName: string;
  label: string;
  recommendedSpacingMm: number;
  minAllowedSpacingMm: number;
  maxAllowedSpacingMm: number;
  recommendedLineWeightMm: number;
  maxAllowedLineWeightMm: number;
  typicalAngleDeg: number;
  reason: string;
}

export const LAYER_HATCH_SPECS: Record<string, LayerHatchSpec> = {
  '01_結構牆體': {
    layerName: '01_結構牆體',
    label: 'RC結構 / 剪力牆剖面',
    recommendedSpacingMm: 1.0,
    minAllowedSpacingMm: 0.8,
    maxAllowedSpacingMm: 1.8,
    recommendedLineWeightMm: 0.13,
    maxAllowedLineWeightMm: 0.18,
    typicalAngleDeg: 0,
    reason: '結構斷面要求高密度細石顆粒或細斜線，線距不可大於 1.8mm，避免結構實體感流失',
  },
  '03_天花降板': {
    layerName: '03_天花降板',
    label: '天花降板 / 保溫隔音剖面',
    recommendedSpacingMm: 3.5,
    minAllowedSpacingMm: 2.5,
    maxAllowedSpacingMm: 5.0,
    recommendedLineWeightMm: 0.13,
    maxAllowedLineWeightMm: 0.18,
    typicalAngleDeg: 90,
    reason: '天花降板 (FL+230 / FL+215) 範圍廣闊，線距需在 2.5~5.0mm，避免大面積出圖黑斑',
  },
  '05_木作櫃體': {
    layerName: '05_木作櫃體',
    label: '木作櫃體 / 板材大樣剖面',
    recommendedSpacingMm: 2.0,
    minAllowedSpacingMm: 1.5,
    maxAllowedSpacingMm: 2.8,
    recommendedLineWeightMm: 0.09,
    maxAllowedLineWeightMm: 0.15,
    typicalAngleDeg: 45,
    reason: '符合 CNS 45° 細等距木作剖面規範，標準線距 2.0mm，出圖線寬 0.09mm 不壓制輪廓線',
  },
  '04_門窗開口': {
    layerName: '04_門窗開口',
    label: '門窗框架 / 開口隔音剖面',
    recommendedSpacingMm: 1.5,
    minAllowedSpacingMm: 1.0,
    maxAllowedSpacingMm: 2.2,
    recommendedLineWeightMm: 0.09,
    maxAllowedLineWeightMm: 0.13,
    typicalAngleDeg: 45,
    reason: '門窗五金框架斷面細窄，線距需鎖定 1.0~2.2mm 確保紋理清晰不掉失',
  },
  '02_地坪完成面': {
    layerName: '02_地坪完成面',
    label: '地坪鋪貼 / 石材磁磚面',
    recommendedSpacingMm: 4.0,
    minAllowedSpacingMm: 2.5,
    maxAllowedSpacingMm: 6.0,
    recommendedLineWeightMm: 0.09,
    maxAllowedLineWeightMm: 0.13,
    typicalAngleDeg: 0,
    reason: '地坪正交對縫需配合 60x60 / 80x80cm 模數，比例間距鎖定 4.0mm',
  },
  '06_施工註記': {
    layerName: '06_施工註記',
    label: '施工註記 / 剖切索引填充',
    recommendedSpacingMm: 2.5,
    minAllowedSpacingMm: 1.5,
    maxAllowedSpacingMm: 4.0,
    recommendedLineWeightMm: 0.13,
    maxAllowedLineWeightMm: 0.18,
    typicalAngleDeg: 45,
    reason: '標準出圖索引符號專用填充',
  },
};

export interface HatchCalibrationIssue {
  itemId: string;
  itemName: string;
  layer: string;
  specLabel: string;
  currentSpacing: number;
  recommendedSpacing: number;
  currentLineWeight: number;
  recommendedLineWeight: number;
  type: 'too_dense' | 'too_sparse' | 'lineweight_heavy';
  title: string;
  description: string;
}

export const getHatchCalibrationIssues = (items: PersonalDetailBlockItem[]): HatchCalibrationIssue[] => {
  const issues: HatchCalibrationIssue[] = [];

  items.forEach((item) => {
    if (item.category !== 'hatch_pattern' || !item.hatchData) return;
    const spec = LAYER_HATCH_SPECS[item.cadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
    const spacing = item.hatchData.spacingMm;
    const lineWeight = item.hatchData.lineWeightMm;

    if (spacing < spec.minAllowedSpacingMm) {
      issues.push({
        itemId: item.id,
        itemName: item.name,
        layer: item.cadLayer,
        specLabel: spec.label,
        currentSpacing: spacing,
        recommendedSpacing: spec.recommendedSpacingMm,
        currentLineWeight: lineWeight,
        recommendedLineWeight: spec.recommendedLineWeightMm,
        type: 'too_dense',
        title: `間距 ${spacing}mm 過密 (低於圖層規範 ${spec.minAllowedSpacingMm}mm)`,
        description: `當前間距過密，於 ${item.cadLayer} 出圖時極易形成深色糊斑或耗盡繪圖機記憶體。建議校正為 ${spec.recommendedSpacingMm}mm。`,
      });
    } else if (spacing > spec.maxAllowedSpacingMm) {
      issues.push({
        itemId: item.id,
        itemName: item.name,
        layer: item.cadLayer,
        specLabel: spec.label,
        currentSpacing: spacing,
        recommendedSpacing: spec.recommendedSpacingMm,
        currentLineWeight: lineWeight,
        recommendedLineWeight: spec.recommendedLineWeightMm,
        type: 'too_sparse',
        title: `間距 ${spacing}mm 過疏 (高於圖層規範 ${spec.maxAllowedSpacingMm}mm)`,
        description: `當前間距過大，於 ${item.cadLayer} 斷面無法呈現材質真實緊密紋理。建議校正為 ${spec.recommendedSpacingMm}mm。`,
      });
    } else if (lineWeight > spec.maxAllowedLineWeightMm) {
      issues.push({
        itemId: item.id,
        itemName: item.name,
        layer: item.cadLayer,
        specLabel: spec.label,
        currentSpacing: spacing,
        recommendedSpacing: spec.recommendedSpacingMm,
        currentLineWeight: lineWeight,
        recommendedLineWeight: spec.recommendedLineWeightMm,
        type: 'lineweight_heavy',
        title: `出圖線寬 ${lineWeight}mm 過粗 (上限 ${spec.maxAllowedLineWeightMm}mm)`,
        description: `剖面填充線寬不可超過 ${spec.maxAllowedLineWeightMm}mm，否則出圖時會壓制 0.25mm 斷面實體輪廓線。建議校正為 ${spec.recommendedLineWeightMm}mm。`,
      });
    }
  });

  return issues;
};

const SUGGESTED_QUICK_TAGS = ['地坪', '牆面', '木作', '結構', '天花', '衛浴', '玄關', '家具', '軟裝', '石材', '降板230', '出圖'];

const PRESET_PERSONAL_BLOCKS: PersonalDetailBlockItem[] = [
  // 1. 家具與設備
  {
    id: 'blk-furn-01',
    name: '義大利現代極簡雙人沙發 (含貴妃位)',
    category: 'furniture',
    subCategory: '客廳沙發',
    widthCm: 280,
    depthCm: 180,
    heightCm: 75,
    elevationCm: 0,
    cadLayer: 'A-FURN-SOFA',
    colorIndex: 6,
    notes: '模組化沙發，寬度280cm，已驗證不干涉玄關開門動線',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['客廳', '沙發', '家具', '軟裝'],
  },
  {
    id: 'blk-furn-02',
    name: '主臥頂天高收納系統衣櫃 (避讓降板230)',
    category: 'furniture',
    subCategory: '臥室衣櫃',
    widthCm: 180,
    depthCm: 60,
    heightCm: 225,
    elevationCm: 0,
    cadLayer: 'A-FURN-CABN',
    colorIndex: 6,
    notes: '高度鎖定 225cm (5倍數)，預留 5cm 維護間隙避讓 FL+230 降板',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['臥室', '系統櫃', '木作', '降板230'],
  },
  {
    id: 'blk-furn-03',
    name: '精品加寬雙人床組 (含懸浮床頭背板)',
    category: 'furniture',
    subCategory: '臥室床組',
    widthCm: 182,
    depthCm: 212,
    heightCm: 95,
    elevationCm: 0,
    cadLayer: 'A-FURN-BEDS',
    colorIndex: 6,
    notes: '床底退縮 10cm 做間接踢腳暖光燈帶',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['臥室', '床組', '家具', '軟裝'],
  },
  {
    id: 'blk-furn-04',
    name: '六人座岩板延伸餐桌 (圓弧倒角)',
    category: 'furniture',
    subCategory: '餐廳家具',
    widthCm: 160,
    depthCm: 85,
    heightCm: 75,
    elevationCm: 0,
    cadLayer: 'A-FURN-TABL',
    colorIndex: 6,
    notes: '12mm 義大利雪花白岩板，雙邊圓角 R30 安全收邊',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['餐廳', '餐桌', '家具', '石材'],
  },

  // 2. 施工大樣與工法節點
  {
    id: 'blk-detail-01',
    name: '10cm 暗嵌壁式踢腳板大樣 (黑鈦鋁條收邊)',
    category: 'detail_joint',
    subCategory: '踢腳收邊',
    widthCm: 10,
    depthCm: 1.2,
    heightCm: 10,
    elevationCm: 0,
    cadLayer: '05_木作櫃體',
    colorIndex: 1,
    notes: '內縮 12mm，與地坪拋光磚打 2mm 防霉矽利康微縫',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['地坪', '收邊', '踢腳', '木作'],
  },
  {
    id: 'blk-detail-02',
    name: '木作天花板 3.6cm 防震角料與吊筋剖面',
    category: 'detail_joint',
    subCategory: '天花大樣',
    widthCm: 3.6,
    depthCm: 3.6,
    heightCm: 15,
    elevationCm: 230,
    cadLayer: '03_天花降板',
    colorIndex: 2,
    notes: '集風箱預留淨空，吊筋間距 90cm 符合內政部防震規範',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['天花', '降板', '結構', '木作'],
  },
  {
    id: 'blk-detail-03',
    name: '客廳間接照明防眩遮光燈槽 (12×15cm)',
    category: 'detail_joint',
    subCategory: '照明燈槽',
    widthCm: 15,
    depthCm: 12,
    heightCm: 15,
    elevationCm: 230,
    cadLayer: '03_天花降板',
    colorIndex: 2,
    notes: '擋光唇高 4.5cm，出光角 45 度均勻洗牆不見燈珠',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['天花', '照明', '木作', '降板230'],
  },
  {
    id: 'blk-detail-04',
    name: '玄關落塵區 1.5cm 降板與高低差鋁壓條',
    category: 'detail_joint',
    subCategory: '地坪介面',
    widthCm: 3,
    depthCm: 1.5,
    heightCm: 1.5,
    elevationCm: 0,
    cadLayer: '01_結構牆體',
    colorIndex: 3,
    notes: '天然大理石地坪與室內木地板交接處專用止水收邊',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['玄關', '地坪', '降板', '收邊'],
  },

  // 3. 出圖圖框與標籤符號
  {
    id: 'blk-title-01',
    name: '標準 A3 橫式施工圖框 (右側縱向欄50mm)',
    category: 'title_symbol',
    subCategory: '圖框樣板',
    widthCm: 420,
    depthCm: 297,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '06_施工註記',
    colorIndex: 7,
    notes: '標準 A3 出圖圖框，內含公司資訊、圖號、簽章欄與免責宣告',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['圖框', '出圖', '施工'],
  },
  {
    id: 'blk-title-02',
    name: '立面剖切指標符號 (A-A\' 四向立面索引)',
    category: 'title_symbol',
    subCategory: '圖頭索引',
    widthCm: 40,
    depthCm: 40,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '06_施工註記',
    colorIndex: 4,
    notes: '標準圓形雙向剖切箭頭，字高 3.5mm',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['符號', '索引', '施工'],
  },
  {
    id: 'blk-title-03',
    name: '高程標註基準符號 (▼ FL+265 / FL+230)',
    category: 'title_symbol',
    subCategory: '高程符號',
    widthCm: 25,
    depthCm: 15,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '06_施工註記',
    colorIndex: 2,
    notes: '立面高程基準三角符號，鎖定星玥灣 5 倍數契約標高',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['高程', '標註', '符號', '星玥灣'],
  },

  // 4. 自訂剖面填充 (Hatch Patterns)
  {
    id: 'blk-hatch-01',
    name: 'ANSI31 (木作合板與實木角料剖面)',
    category: 'hatch_pattern',
    subCategory: '木作剖面填充',
    widthCm: 100,
    depthCm: 100,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '05_木作櫃體',
    colorIndex: 8,
    notes: '單向 45 度精密等距斜線，適用於天花板角材、櫃體立面板材與木作骨架',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['木作', '剖面', '天花', '櫃體'],
    scaleCalibrated: true,
    hatchData: {
      patName: 'ANSI31',
      patDefinition: '*ANSI31, ANSI Iron\n45, 0,0, 0,2.0',
      angleDeg: 45,
      spacingMm: 2.0,
      lineWeightMm: 0.09,
      colorIndex: 8,
      associatedMaterial: '木作合板與實木角料剖面',
      patternType: 'standard_pat',
      strokeDash: 'none',
    },
  },
  {
    id: 'blk-hatch-02',
    name: 'AR-CONC (RC 混凝土細石碎點剖面)',
    category: 'hatch_pattern',
    subCategory: 'RC結構填充',
    widthCm: 100,
    depthCm: 100,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '01_結構牆體',
    colorIndex: 252,
    notes: '結構樑柱與剪力牆剖面填充，呈現三角礫石與均勻微粒砂紋',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['結構', '牆面', '混凝土', '剖面'],
    scaleCalibrated: true,
    hatchData: {
      patName: 'AR-CONC',
      patDefinition: '*AR-CONC, Random stone and sand\n0, 0,0, 0,1.0',
      angleDeg: 0,
      spacingMm: 1.0,
      lineWeightMm: 0.13,
      colorIndex: 252,
      associatedMaterial: 'RC 結構混凝土實體',
      patternType: 'standard_pat',
      strokeDash: '1,3',
    },
  },
  {
    id: 'blk-hatch-03',
    name: 'CROSS_HATCH (天然石材/人造石雙向 45° 網格)',
    category: 'hatch_pattern',
    subCategory: '石材檯面填充',
    widthCm: 100,
    depthCm: 100,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '05_木作櫃體',
    colorIndex: 9,
    notes: '雙向 45 度交織網格，適用於固定 80cm 檯面、玄關落塵區大理石踏板',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['石材', '檯面', '地坪', '待校正'],
    scaleCalibrated: false,
    hatchData: {
      patName: 'CROSS_HATCH',
      patDefinition: '*CROSS, 45 degree crosshatch\n45, 0,0, 0,3.5\n135, 0,0, 0,3.5',
      angleDeg: 45,
      spacingMm: 3.5,
      lineWeightMm: 0.09,
      colorIndex: 9,
      associatedMaterial: '天然石材與人造石檯面',
      patternType: 'standard_pat',
      strokeDash: 'none',
    },
  },
  {
    id: 'blk-hatch-04',
    name: 'INSULATION (天花板隔音岩棉波浪紋)',
    category: 'hatch_pattern',
    subCategory: '隔音保溫填充',
    widthCm: 100,
    depthCm: 100,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '03_天花降板',
    colorIndex: 8,
    notes: '天花板降板處集風箱周圍隔音棉專用填充紋理',
    isCustomUploaded: false,
    uploadedAt: '2026-09-23',
    tags: ['天花', '降板', '隔音', '剖面'],
    scaleCalibrated: true,
    hatchData: {
      patName: 'INSULATION',
      patDefinition: '*INSULATION, Fiber insulation batt\n90, 0,0, 0,5.0',
      angleDeg: 90,
      spacingMm: 5.0,
      lineWeightMm: 0.15,
      colorIndex: 8,
      associatedMaterial: '保溫隔熱隔音岩棉',
      patternType: 'standard_pat',
      strokeDash: '6,2,2,2',
    },
  },
  {
    id: 'blk-hatch-05',
    name: 'FINE_TIMBER_CORE (匯入未校正超密木紋剖面)',
    category: 'hatch_pattern',
    subCategory: '木作剖面填充',
    widthCm: 100,
    depthCm: 100,
    heightCm: 0,
    elevationCm: 0,
    cadLayer: '05_木作櫃體',
    colorIndex: 8,
    notes: '由舊版 AutoCAD 匯入之未校正 .pat 檔案，線距 0.6mm 偏密，容易導致出圖成墨團糊斑',
    isCustomUploaded: true,
    uploadedAt: '2026-09-23',
    tags: ['木作', '剖面', '待校正', '櫃體'],
    scaleCalibrated: false,
    hatchData: {
      patName: 'FINE_TIMBER_CORE',
      patDefinition: '*FINE_TIMBER_CORE, Dense wood\n45, 0,0, 0,0.6',
      angleDeg: 45,
      spacingMm: 0.6,
      lineWeightMm: 0.18,
      colorIndex: 8,
      associatedMaterial: '密集實木角料剖面 (比例未校正)',
      patternType: 'standard_pat',
      strokeDash: 'none',
    },
  },
];

// -------------------------------------------------------------
// USER REQUESTED: 區塊列表自動化 2D 視覺縮圖渲染器 (Automated 2D Vector Thumbnail)
// -------------------------------------------------------------
interface Block2DVisualThumbnailProps {
  item: PersonalDetailBlockItem;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export const Block2DVisualThumbnail: React.FC<Block2DVisualThumbnailProps> = ({
  item,
  size = 64,
  className = '',
  showBadge = true,
}) => {
  // 1. Hatch Pattern (.pat 剖面樣式 - 即時 SVG 向量剖面線)
  if (item.category === 'hatch_pattern') {
    const angle = item.hatchData?.angleDeg ?? 45;
    const spacing = Math.max(3, (item.hatchData?.spacingMm ?? 2) * 2.8);
    const lineWeight = Math.max(1, (item.hatchData?.lineWeightMm ?? 0.09) * 11);
    const strokeDash = item.hatchData?.strokeDash || 'none';
    const isCross =
      (item.hatchData?.patName || '').toUpperCase().includes('CROSS') ||
      (item.name || '').includes('網格') ||
      (item.name || '').includes('地磚');
    const isDots =
      (item.hatchData?.patName || '').toUpperCase().includes('DOT') ||
      (item.hatchData?.patName || '').toUpperCase().includes('CONC') ||
      (item.name || '').includes('混凝土');

    const strokeColor =
      item.hatchData?.colorIndex === 252 || item.colorIndex === 8
        ? '#94a3b8'
        : item.colorIndex === 1
        ? '#f87171'
        : item.colorIndex === 3
        ? '#34d399'
        : '#38bdf8';

    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 flex-shrink-0 shadow-inner group ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id={`thumb-hatch-${item.id}`}
              width={spacing}
              height={spacing}
              patternTransform={`rotate(${angle} 0 0)`}
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={spacing}
                stroke={strokeColor}
                strokeWidth={lineWeight}
                strokeDasharray={strokeDash}
              />
              {isCross && (
                <line
                  x1="0"
                  y1="0"
                  x2={spacing}
                  y2="0"
                  stroke={strokeColor}
                  strokeWidth={lineWeight}
                  strokeDasharray={strokeDash}
                />
              )}
              {isDots && (
                <circle
                  cx={spacing / 2}
                  cy={spacing / 2}
                  r={Math.max(1, lineWeight * 0.8)}
                  fill={strokeColor}
                />
              )}
            </pattern>
          </defs>

          {/* Blueprint Dark Canvas */}
          <rect width="64" height="64" fill="#080d1a" />

          {/* 5mm Reference Grid */}
          <path
            d="M 16 0 V 64 M 32 0 V 64 M 48 0 V 64 M 0 16 H 64 M 0 32 H 64 M 0 48 H 64"
            stroke="#1e293b"
            strokeWidth="0.5"
            strokeDasharray="1,3"
          />

          {/* Applied Hatch Fill */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="4"
            fill={`url(#thumb-hatch-${item.id})`}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Center Crosshair Target */}
          <line x1="30" y1="32" x2="34" y2="32" stroke="#475569" strokeWidth="0.8" />
          <line x1="32" y1="30" x2="32" y2="34" stroke="#475569" strokeWidth="0.8" />
        </svg>

        {showBadge && (
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] font-mono text-emerald-400 border border-emerald-500/30">
            {item.hatchData?.angleDeg || 45}°
          </span>
        )}
      </div>
    );
  }

  // 2. Furniture (DWG 2D Architectural Projection - 家具與設備)
  if (item.category === 'furniture') {
    const isSofa =
      /沙發|單椅|椅|sofa|chair/i.test(item.name) ||
      /沙發|椅子/i.test(item.subCategory);
    const isBed =
      /床|臥室|bed/i.test(item.name) ||
      /床/i.test(item.subCategory);
    const isTable =
      /桌|茶几|檯面|餐桌|書桌|table|desk/i.test(item.name) ||
      /桌/i.test(item.subCategory);
    const isCabinet =
      /櫃|衣櫃|系統櫃|wardrobe|cabinet/i.test(item.name) ||
      /櫃/i.test(item.subCategory);

    // Compute aspect ratio scaling inside box
    const w = Math.max(30, item.widthCm);
    const d = Math.max(30, item.depthCm);
    const maxDim = Math.max(w, d);
    const scale = 44 / maxDim;
    const boxW = Math.max(16, Math.min(50, w * scale));
    const boxH = Math.max(16, Math.min(50, d * scale));
    const boxX = (64 - boxW) / 2;
    const boxY = (64 - boxH) / 2;

    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 flex-shrink-0 shadow-inner group ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <rect width="64" height="64" fill="#090e17" />
          <path
            d="M 16 0 V 64 M 32 0 V 64 M 48 0 V 64 M 0 16 H 64 M 0 32 H 64 M 0 48 H 64"
            stroke="#162032"
            strokeWidth="0.5"
          />

          {isSofa ? (
            <g transform={`translate(${boxX}, ${boxY})`}>
              <rect
                x="0"
                y="0"
                width={boxW}
                height={boxH}
                rx="3"
                fill="#1e293b"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <rect
                x="2"
                y="2"
                width={boxW - 4}
                height={Math.max(4, boxH * 0.28)}
                rx="2"
                fill="#334155"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              <rect
                x="2"
                y={boxH * 0.28 + 2}
                width={Math.max(3, boxW * 0.16)}
                height={boxH * 0.65}
                rx="1.5"
                fill="#334155"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              <rect
                x={boxW - Math.max(3, boxW * 0.16) - 2}
                y={boxH * 0.28 + 2}
                width={Math.max(3, boxW * 0.16)}
                height={boxH * 0.65}
                rx="1.5"
                fill="#334155"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              {boxW > 28 && (
                <line
                  x1={boxW / 2}
                  y1={boxH * 0.35}
                  x2={boxW / 2}
                  y2={boxH - 3}
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                  strokeDasharray="2,1"
                />
              )}
            </g>
          ) : isBed ? (
            <g transform={`translate(${boxX}, ${boxY})`}>
              <rect
                x="0"
                y="0"
                width={boxW}
                height={Math.max(4, boxH * 0.18)}
                rx="1"
                fill="#b45309"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <rect
                x="1"
                y={boxH * 0.18}
                width={boxW - 2}
                height={boxH * 0.8}
                rx="2"
                fill="#1e293b"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <rect
                x={boxW * 0.12}
                y={boxH * 0.22}
                width={boxW * 0.32}
                height={boxH * 0.22}
                rx="1.5"
                fill="#334155"
                stroke="#fbbf24"
                strokeWidth="0.7"
              />
              <rect
                x={boxW * 0.56}
                y={boxH * 0.22}
                width={boxW * 0.32}
                height={boxH * 0.22}
                rx="1.5"
                fill="#334155"
                stroke="#fbbf24"
                strokeWidth="0.7"
              />
              <path
                d={`M 3 ${boxH * 0.58} Q ${boxW / 2} ${boxH * 0.65} ${boxW - 3} ${boxH * 0.58}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="0.8"
              />
            </g>
          ) : isTable ? (
            <g transform={`translate(${boxX}, ${boxY})`}>
              <rect
                x="0"
                y="0"
                width={boxW}
                height={boxH}
                rx="2"
                fill="#1e293b"
                stroke="#06b6d4"
                strokeWidth="1.2"
              />
              <rect
                x="3"
                y="3"
                width={boxW - 6}
                height={boxH - 6}
                rx="1"
                fill="none"
                stroke="#0891b2"
                strokeWidth="0.6"
                strokeDasharray="2,2"
              />
              <circle cx="5" cy="5" r="2" fill="#22d3ee" />
              <circle cx={boxW - 5} cy="5" r="2" fill="#22d3ee" />
              <circle cx="5" cy={boxH - 5} r="2" fill="#22d3ee" />
              <circle cx={boxW - 5} cy={boxH - 5} r="2" fill="#22d3ee" />
            </g>
          ) : isCabinet ? (
            <g transform={`translate(${boxX}, ${boxY})`}>
              <rect
                x="0"
                y="0"
                width={boxW}
                height={boxH}
                rx="1"
                fill="#1e293b"
                stroke="#10b981"
                strokeWidth="1.2"
              />
              <line
                x1="0"
                y1="0"
                x2={boxW}
                y2={boxH}
                stroke="#059669"
                strokeWidth="0.7"
                strokeDasharray="1,2"
              />
              <line
                x1={boxW}
                y1="0"
                x2="0"
                y2={boxH}
                stroke="#059669"
                strokeWidth="0.7"
                strokeDasharray="1,2"
              />
              <line
                x1={boxW / 2}
                y1="0"
                x2={boxW / 2}
                y2={boxH}
                stroke="#34d399"
                strokeWidth="1"
              />
              <circle cx={boxW / 2 - 2} cy={boxH / 2} r="1" fill="#facc15" />
              <circle cx={boxW / 2 + 2} cy={boxH / 2} r="1" fill="#facc15" />
            </g>
          ) : (
            <g transform={`translate(${boxX}, ${boxY})`}>
              <rect
                x="0"
                y="0"
                width={boxW}
                height={boxH}
                rx="2"
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="1.2"
              />
              <line
                x1="0"
                y1="0"
                x2={boxW}
                y2={boxH}
                stroke="#0284c7"
                strokeWidth="0.6"
                strokeDasharray="2,2"
              />
              <line
                x1={boxW}
                y1="0"
                x2="0"
                y2={boxH}
                stroke="#0284c7"
                strokeWidth="0.6"
                strokeDasharray="2,2"
              />
              <circle
                cx={boxW / 2}
                cy={boxH / 2}
                r="2.5"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={boxW / 2 - 4}
                y1={boxH / 2}
                x2={boxW / 2 + 4}
                y2={boxH / 2}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={boxW / 2}
                y1={boxH / 2 - 4}
                x2={boxW / 2}
                y2={boxH / 2 + 4}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
            </g>
          )}
        </svg>

        {showBadge && (
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] font-mono text-amber-300 border border-amber-500/30">
            {item.widthCm}×{item.depthCm}
          </span>
        )}
      </div>
    );
  }

  // 3. Detail Joint (施工大樣節點)
  if (item.category === 'detail_joint') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 flex-shrink-0 shadow-inner group ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <rect width="64" height="64" fill="#080e18" />
          <polygon
            points="8,8 56,8 56,24 8,24"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="1"
          />
          <line x1="12" y1="12" x2="20" y2="20" stroke="#94a3b8" strokeWidth="0.8" />
          <line x1="28" y1="12" x2="36" y2="20" stroke="#94a3b8" strokeWidth="0.8" />
          <line x1="44" y1="12" x2="52" y2="20" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Timber Beam / Stud Joint */}
          <polygon
            points="14,24 38,24 38,48 14,48"
            fill="#451a03"
            stroke="#f59e0b"
            strokeWidth="1.2"
          />
          <line x1="14" y1="24" x2="38" y2="48" stroke="#d97706" strokeWidth="1" />
          <line x1="38" y1="24" x2="14" y2="48" stroke="#d97706" strokeWidth="1" />

          {/* Finish Panel / Skirting / Step */}
          <polygon
            points="38,24 54,24 54,54 44,54 44,32 38,32"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="1"
          />

          {/* Reference Datum */}
          <line
            x1="6"
            y1="56"
            x2="58"
            y2="56"
            stroke="#f87171"
            strokeWidth="1"
            strokeDasharray="3,1"
          />
          <circle cx="10" cy="56" r="1.5" fill="#f87171" />
        </svg>

        {showBadge && (
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] font-mono text-cyan-300 border border-cyan-500/30">
            FL+{item.elevationCm}
          </span>
        )}
      </div>
    );
  }

  // 4. Title Symbol / Drawing Sheet (圖框與標籤)
  if (item.category === 'title_symbol') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 flex-shrink-0 shadow-inner group ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <rect width="64" height="64" fill="#080e18" />
          <rect
            x="6"
            y="10"
            width="52"
            height="44"
            rx="1"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="0.8"
          />
          <rect
            x="12"
            y="14"
            width="42"
            height="36"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <rect
            x="34"
            y="36"
            width="20"
            height="14"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
          <line x1="34" y1="41" x2="54" y2="41" stroke="#64748b" strokeWidth="0.5" />
          <line x1="34" y1="45" x2="54" y2="45" stroke="#64748b" strokeWidth="0.5" />
          <line x1="44" y1="41" x2="44" y2="50" stroke="#64748b" strokeWidth="0.5" />

          {/* North Arrow */}
          <circle cx="22" cy="24" r="5" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
          <polygon points="22,19 25,24 22,23 19,24" fill="#f59e0b" />
          <text
            x="22"
            y="34"
            fill="#fbbf24"
            fontSize="5"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
          >
            N
          </text>
        </svg>

        {showBadge && (
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] font-mono text-purple-300 border border-purple-500/30">
            A3
          </span>
        )}
      </div>
    );
  }

  // 5. Default / MEP Symbol (機電與風箱)
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 flex-shrink-0 shadow-inner group ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect width="64" height="64" fill="#080e18" />
        <rect
          x="12"
          y="12"
          width="40"
          height="40"
          rx="3"
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <rect
          x="18"
          y="18"
          width="28"
          height="28"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.8"
        />
        <rect
          x="24"
          y="24"
          width="16"
          height="16"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.8"
        />
        <line x1="12" y1="12" x2="52" y2="52" stroke="#38bdf8" strokeWidth="0.8" />
        <line x1="52" y1="12" x2="12" y2="52" stroke="#38bdf8" strokeWidth="0.8" />
      </svg>
      {showBadge && (
        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] font-mono text-slate-400 border border-slate-700">
          CAD
        </span>
      )}
    </div>
  );
};

export const PersonalDetailBlockLibraryModal: React.FC<PersonalDetailBlockLibraryModalProps> = ({
  isOpen,
  onClose,
  room,
  onInsertBlockToRoom,
  onNotify,
  onDragBlockStart,
  onDragBlockEnd,
  isDockedPalette,
  onToggleDockedPalette,
}) => {
  const [internalDocked, setInternalDocked] = useState<boolean>(false);
  const isDocked = isDockedPalette !== undefined ? isDockedPalette : internalDocked;
  const toggleDock = () => {
    if (onToggleDockedPalette) {
      onToggleDockedPalette();
    } else {
      setInternalDocked((prev) => !prev);
    }
  };
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState<boolean>(false);

  const handleDragStartItem = (e: React.DragEvent, blk: PersonalDetailBlockItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(blk));
    e.dataTransfer.setData('text/plain', blk.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    setIsCurrentlyDragging(true);
    onDragBlockStart?.(blk);
  };

  const handleDragEndItem = () => {
    setIsCurrentlyDragging(false);
    onDragBlockEnd?.();
  };
  const [blocks, setBlocks] = useState<PersonalDetailBlockItem[]>(() => {
    const saved = localStorage.getItem('user_personal_blocks_database');
    if (saved) {
      try {
        const parsed: PersonalDetailBlockItem[] = JSON.parse(saved);
        // 遷移防護：確保現有本機項目皆具備 tags 陣列，避免舊資料結構缺失標籤
        return parsed.map((item) => {
          if (!item.tags || item.tags.length === 0) {
            const presetMatch = PRESET_PERSONAL_BLOCKS.find((p) => p.id === item.id);
            const autoTags: string[] = presetMatch?.tags || [];
            if (autoTags.length === 0) {
              if (/沙發|客廳/i.test(item.name)) autoTags.push('客廳', '家具');
              else if (/床|臥室/i.test(item.name)) autoTags.push('臥室', '家具');
              else if (/衣櫃|櫃/i.test(item.name)) autoTags.push('木作', '系統櫃');
              else if (/大樣|踢腳|收邊/i.test(item.name)) autoTags.push('木作', '收邊');
              else if (/天花|降板/i.test(item.name)) autoTags.push('天花', '降板');
              else if (/結構|混凝土|RC/i.test(item.name)) autoTags.push('結構', '牆面');
              else if (/地坪|落塵|踏板/i.test(item.name)) autoTags.push('地坪', '收邊');
              else if (/hatch|pat|填充/i.test(item.name)) autoTags.push('剖面', '自訂填充');
              else autoTags.push('常用');
            }
            return { ...item, tags: autoTags };
          }
          return item;
        });
      } catch {
        return PRESET_PERSONAL_BLOCKS;
      }
    }
    return PRESET_PERSONAL_BLOCKS;
  });

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'furniture' | 'detail_joint' | 'title_symbol' | 'hatch_pattern'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(PRESET_PERSONAL_BLOCKS[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // USER REQUESTED: 區塊列表自動化縮圖視覺呈現模式 (Visual List vs Thumbnail Grid)
  // -------------------------------------------------------------
  const [viewLayout, setViewLayout] = useState<'visual_list' | 'thumbnail_grid'>('visual_list');

  // -------------------------------------------------------------
  // USER REQUESTED: 標籤化分類系統 (Tags & Filtering System)
  // -------------------------------------------------------------
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // -------------------------------------------------------------
  // USER REQUESTED: 自動填充一致性校正狀態 (Hatch Calibration State)
  // -------------------------------------------------------------
  const [isCalibrationDrawerOpen, setIsCalibrationDrawerOpen] = useState<boolean>(false);

  // New Block Form Modal
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCat, setNewCat] = useState<'furniture' | 'detail_joint' | 'title_symbol'>('furniture');
  const [newSubCat, setNewSubCat] = useState<string>('自訂圖塊');
  const [newW, setNewW] = useState<number>(120);
  const [newD, setNewD] = useState<number>(60);
  const [newH, setNewH] = useState<number>(75);
  const [newElev, setNewElev] = useState<number>(0);
  const [newNotes, setNewNotes] = useState<string>('');
  const [newTagsInput, setNewTagsInput] = useState<string>('自訂, 木作');

  // -------------------------------------------------------------
  // USER REQUESTED: 自定義剖面填充 (Hatch) 匯入狀態與控制器
  // -------------------------------------------------------------
  const [isHatchImportModalOpen, setIsHatchImportModalOpen] = useState<boolean>(false);
  const [hatchMode, setHatchMode] = useState<'file_upload' | 'pat_code' | 'dwg_block'>('file_upload');
  const [hatchName, setHatchName] = useState<string>('ANSI31_COREY_WOOD');
  const [hatchMaterial, setHatchMaterial] = useState<string>('木作合板與實木角料剖面');
  const [hatchAngle, setHatchAngle] = useState<number>(45);
  const [hatchSpacing, setHatchSpacing] = useState<number>(2.0);
  const [hatchLineWeight, setHatchLineWeight] = useState<number>(0.09);
  const [hatchColorIndex, setHatchColorIndex] = useState<number>(8);
  const [hatchCadLayer, setHatchCadLayer] = useState<string>('05_木作櫃體');
  const [hatchStrokeDash, setHatchStrokeDash] = useState<string>('none');
  const [hatchNotes, setHatchNotes] = useState<string>('單向 45 度等距斜線，適用於木作骨架與檯面基層');
  const [hatchTagsInput, setHatchTagsInput] = useState<string>('木作, 剖面');
  const [hatchRawCode, setHatchRawCode] = useState<string>(
    '*ANSI31_COREY_WOOD, Custom Wood Hatch\n45, 0,0, 0,2.0'
  );
  const [hatchFileName, setHatchFileName] = useState<string>('');
  const hatchFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // USER REQUESTED: 標籤清單計算與過濾 (Tags Aggregation & Filtering)
  // -------------------------------------------------------------
  const allAvailableTags = useMemo(() => {
    const counts: Record<string, number> = {};
    blocks.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t) => {
          const clean = t.trim();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [blocks]);

  // -------------------------------------------------------------
  // USER REQUESTED: 自動填充一致性校正檢測 (Hatch Pattern Calibration Issues)
  // -------------------------------------------------------------
  const calibrationIssues = useMemo(() => {
    return getHatchCalibrationIssues(blocks);
  }, [blocks]);

  // Filtered Blocks (含分類、標籤與文字搜尋多維度過濾)
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const matchCat = activeCategory === 'all' || b.category === activeCategory;
      const matchTag = !activeTag || (Array.isArray(b.tags) && b.tags.includes(activeTag));
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCat && matchTag;
      return (
        matchCat &&
        matchTag &&
        (b.name.toLowerCase().includes(q) ||
          b.subCategory.toLowerCase().includes(q) ||
          b.notes.toLowerCase().includes(q) ||
          (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q))) ||
          (b.hatchData?.patName && b.hatchData.patName.toLowerCase().includes(q)) ||
          (b.hatchData?.associatedMaterial && b.hatchData.associatedMaterial.toLowerCase().includes(q)))
      );
    });
  }, [blocks, activeCategory, activeTag, searchQuery]);

  const activeBlock = blocks.find((b) => b.id === selectedBlockId) || filteredBlocks[0] || blocks[0];

  // -------------------------------------------------------------
  // 標籤操作函式 (Tag Management Handlers)
  // -------------------------------------------------------------
  const handleAddTagToActiveBlock = (tag: string) => {
    if (!activeBlock || !tag.trim()) return;
    const cleanTag = tag.trim().replace(/^#/, '');
    const currentTags = activeBlock.tags || [];
    if (currentTags.includes(cleanTag)) {
      onNotify?.(`標籤「#${cleanTag}」已存在於「${activeBlock.name}」`);
      return;
    }
    const updatedTags = [...currentTags, cleanTag];
    const updated = blocks.map((b) => (b.id === activeBlock.id ? { ...b, tags: updatedTags } : b));
    setBlocks(updated);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updated));
    onNotify?.(`🏷️ 已為「${activeBlock.name}」加入標籤「#${cleanTag}」！`);
  };

  const handleRemoveTagFromActiveBlock = (tagToRemove: string) => {
    if (!activeBlock) return;
    const currentTags = activeBlock.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    const updated = blocks.map((b) => (b.id === activeBlock.id ? { ...b, tags: updatedTags } : b));
    setBlocks(updated);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updated));
    onNotify?.(`已自「${activeBlock.name}」移除標籤「#${tagToRemove}」`);
  };

  // -------------------------------------------------------------
  // 自動填充一致性校正函式 (Auto Hatch Consistency Calibration Handlers)
  // -------------------------------------------------------------
  const handleBatchCalibrateHatchPatterns = () => {
    const issues = getHatchCalibrationIssues(blocks);
    if (issues.length === 0) {
      onNotify?.('✨ 所有 .pat 填充樣式皆符合專案圖層比例規範，無需校正！');
      return;
    }

    const updatedBlocks = blocks.map((item) => {
      const issue = issues.find((iss) => iss.itemId === item.id);
      if (!issue || !item.hatchData) return item;

      const spec = LAYER_HATCH_SPECS[item.cadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
      const newSpacing = spec.recommendedSpacingMm;
      const newLineWeight = spec.recommendedLineWeightMm;

      let updatedPatDef = item.hatchData.patDefinition;
      if (updatedPatDef) {
        updatedPatDef = updatedPatDef.replace(
          /(\d+,\s*0,\s*0,\s*0,)\s*[\d\.]+/g,
          `$1${newSpacing}`
        );
      }

      const cleanedTags = (item.tags || []).filter((t) => t !== '待校正');
      if (!cleanedTags.includes('已校正')) cleanedTags.push('已校正');

      return {
        ...item,
        scaleCalibrated: true,
        calibrationNote: `已於 ${new Date().toLocaleTimeString()} 自動校正為 ${spec.label} 規範 (間距 ${newSpacing}mm / 線寬 ${newLineWeight}mm)`,
        notes: `${item.notes.replace(/\[已依.*校正\]/g, '')} [已依 ${item.cadLayer} CAD規範校正: 間距 ${newSpacing}mm]`,
        tags: cleanedTags,
        hatchData: {
          ...item.hatchData,
          spacingMm: newSpacing,
          lineWeightMm: newLineWeight,
          patDefinition: updatedPatDef,
        },
      };
    });

    setBlocks(updatedBlocks);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updatedBlocks));
    setIsCalibrationDrawerOpen(false);
    onNotify?.(`🎉 自動填充一致性校正完成！已將 ${issues.length} 款 .pat 填充樣式校正至圖層標準出圖比例！`);
  };

  const handleCalibrateSingleHatchPattern = (itemId: string) => {
    const targetItem = blocks.find((b) => b.id === itemId);
    if (!targetItem || !targetItem.hatchData) return;

    const spec = LAYER_HATCH_SPECS[targetItem.cadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
    const newSpacing = spec.recommendedSpacingMm;
    const newLineWeight = spec.recommendedLineWeightMm;

    let updatedPatDef = targetItem.hatchData.patDefinition;
    if (updatedPatDef) {
      updatedPatDef = updatedPatDef.replace(
        /(\d+,\s*0,\s*0,\s*0,)\s*[\d\.]+/g,
        `$1${newSpacing}`
      );
    }

    const cleanedTags = (targetItem.tags || []).filter((t) => t !== '待校正');
    if (!cleanedTags.includes('已校正')) cleanedTags.push('已校正');

    const updatedBlocks = blocks.map((b) => {
      if (b.id !== itemId || !b.hatchData) return b;
      return {
        ...b,
        scaleCalibrated: true,
        calibrationNote: `已依 ${b.cadLayer} 規範校正比例 (線距 ${newSpacing}mm / 線寬 ${newLineWeight}mm)`,
        notes: `${b.notes.replace(/\[已依.*校正\]/g, '')} [已依 ${b.cadLayer} 規範校正]`,
        tags: cleanedTags,
        hatchData: {
          ...b.hatchData,
          spacingMm: newSpacing,
          lineWeightMm: newLineWeight,
          patDefinition: updatedPatDef,
        },
      };
    });

    setBlocks(updatedBlocks);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updatedBlocks));
    onNotify?.(`✓ 已成功將「${targetItem.name}」校正為 ${spec.label} 標準比例 (間距 ${newSpacing}mm, 線寬 ${newLineWeight}mm)！`);
  };

  // Batch Drop DWG / DXF / JSON
  const handleBatchDropFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: PersonalDetailBlockItem[] = Array.from(files).map((file, idx) => {
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
      const isFurniture = /沙發|床|椅|櫃|桌|sofa|bed|chair|table|wardrobe/i.test(fileNameClean);
      const isDetail = /大樣|節點|踢腳|收邊|天花|detail|joint|section/i.test(fileNameClean);
      const isTitle = /圖框|標籤|指北針|高程|title|sheet|tag/i.test(fileNameClean);
      const isHatch = /hatch|pat|填充|剖面線/i.test(fileNameClean);

      const category = isHatch
        ? 'hatch_pattern'
        : isFurniture
        ? 'furniture'
        : isDetail
        ? 'detail_joint'
        : isTitle
        ? 'title_symbol'
        : 'furniture';

      const autoTags: string[] = [];
      if (isHatch) autoTags.push('剖面', '自訂填充');
      if (/沙發|客廳/i.test(fileNameClean)) autoTags.push('客廳', '家具');
      else if (/床|臥室/i.test(fileNameClean)) autoTags.push('臥室', '家具');
      else if (/衣櫃|櫃/i.test(fileNameClean)) autoTags.push('木作', '系統櫃');
      else if (/大樣|踢腳|收邊/i.test(fileNameClean)) autoTags.push('木作', '收邊');
      else if (/天花|降板/i.test(fileNameClean)) autoTags.push('天花', '降板');
      else if (/地坪|落塵|踏板/i.test(fileNameClean)) autoTags.push('地坪', '收邊');
      else if (/結構|混凝土/i.test(fileNameClean)) autoTags.push('結構', '牆面');
      else if (isFurniture) autoTags.push('家具');
      else if (isDetail) autoTags.push('木作', '大樣');
      else if (isTitle) autoTags.push('圖框', '施工');
      if (autoTags.length === 0) autoTags.push('常用');

      return {
        id: `blk-custom-${Date.now()}-${idx}`,
        name: fileNameClean,
        category,
        subCategory: isHatch
          ? '自訂剖面填充'
          : isFurniture
          ? '個人家具插圖'
          : isDetail
          ? '個人常用大樣'
          : '出圖圖框圖頭',
        widthCm: isFurniture ? 180 : isDetail ? 15 : isHatch ? 100 : 420,
        depthCm: isFurniture ? 80 : isDetail ? 10 : isHatch ? 100 : 297,
        heightCm: isFurniture ? 75 : isDetail ? 15 : 0,
        elevationCm: isDetail ? 230 : 0,
        cadLayer: isHatch ? '05_木作櫃體' : isFurniture ? 'A-FURN-CUST' : isDetail ? '05_木作櫃體' : '06_施工註記',
        colorIndex: isHatch ? 8 : isFurniture ? 6 : isDetail ? 1 : 7,
        notes: `由本機檔案「${file.name}」匯入之個人專用圖塊模板`,
        tags: autoTags,
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString().slice(0, 10),
        hatchData: isHatch
          ? {
              patName: fileNameClean,
              patDefinition: `*${fileNameClean}, Imported Hatch\n45, 0,0, 0,2.0`,
              angleDeg: 45,
              spacingMm: 2.0,
              lineWeightMm: 0.09,
              colorIndex: 8,
              associatedMaterial: '自訂木作剖面填充',
              patternType: 'standard_pat',
            }
          : undefined,
      };
    });

    const updated = [...newItems, ...blocks];
    setBlocks(updated);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updated));
    onNotify?.(`🎉 已成功收錄 ${newItems.length} 個圖塊檔案，並已即時自動生成 2D 向量視覺縮圖！`);
    e.target.value = '';
  };

  // -------------------------------------------------------------
  // 解析使用者上傳的 .pat 或 DWG 檔案
  // -------------------------------------------------------------
  const handleUploadHatchFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHatchFileName(file.name);
    const isPat = file.name.toLowerCase().endsWith('.pat');
    const isDwgOrDxf = file.name.toLowerCase().endsWith('.dwg') || file.name.toLowerCase().endsWith('.dxf');

    if (isPat) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setHatchRawCode(text);

        // 解析 AutoCAD .pat 檔案結構 (*PATTERN_NAME, Description)
        const lines = text
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith(';'));

        const headerLine = lines.find((l) => l.startsWith('*'));
        if (headerLine) {
          const parts = headerLine.substring(1).split(',');
          const pName = parts[0]?.trim();
          const pDesc = parts.slice(1).join(',').trim();
          if (pName) setHatchName(pName);
          if (pDesc) setHatchMaterial(pDesc);
        } else {
          setHatchName(file.name.replace(/\.pat$/i, ''));
        }

        // 解析線條定義行 (angle, x-origin, y-origin, delta-x, delta-y)
        const defLine = lines.find((l) => !l.startsWith('*') && l.includes(','));
        if (defLine) {
          const numParts = defLine.split(',').map((p) => parseFloat(p.trim()));
          if (!isNaN(numParts[0])) setHatchAngle(Math.round(numParts[0]));
          if (numParts.length >= 5 && !isNaN(numParts[4])) {
            const dy = Math.abs(numParts[4]);
            setHatchSpacing(dy > 0 ? Number(dy.toFixed(2)) : 2.0);
          }
        }
      };
      reader.readAsText(file);
    } else if (isDwgOrDxf) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setHatchName(cleanName);
      setHatchMaterial(`由 DWG 區塊「${file.name}」提取之剖面填充`);
      setHatchMode('dwg_block');
    }

    e.target.value = '';
  };

  // -------------------------------------------------------------
  // 保存自定義 Hatch 並自動整合至個人施工圖規格庫
  // -------------------------------------------------------------
  const handleSaveHatchPattern = () => {
    if (!hatchName.trim()) return;

    const parsedTags = hatchTagsInput
      .split(/[,，、\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    if (parsedTags.length === 0) parsedTags.push('剖面', '自訂填充');

    const spec = LAYER_HATCH_SPECS[hatchCadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
    const currentSpacing = Number(hatchSpacing) || 2.0;
    const isCompliant =
      currentSpacing >= spec.minAllowedSpacingMm && currentSpacing <= spec.maxAllowedSpacingMm;

    const newHatchItem: PersonalDetailBlockItem = {
      id: `blk-hatch-${Date.now()}`,
      name: `${hatchName} (${hatchMaterial})`,
      category: 'hatch_pattern',
      subCategory: '自訂剖面填充',
      widthCm: 100,
      depthCm: 100,
      heightCm: 0,
      elevationCm: 0,
      cadLayer: hatchCadLayer || '05_木作櫃體',
      colorIndex: Number(hatchColorIndex) || 8,
      notes: hatchNotes || `自訂 .pat 剖面樣式 ${hatchName}`,
      tags: parsedTags,
      scaleCalibrated: isCompliant,
      calibrationNote: isCompliant
        ? `比例合規 (符合 ${spec.label} 規範)`
        : `比例未校正 (目前 ${currentSpacing}mm，規範建議 ${spec.recommendedSpacingMm}mm)`,
      isCustomUploaded: true,
      uploadedAt: new Date().toISOString().slice(0, 10),
      hatchData: {
        patName: hatchName,
        patDefinition:
          hatchRawCode ||
          `*${hatchName}, ${hatchMaterial}\n${hatchAngle}, 0,0, 0,${hatchSpacing}`,
        angleDeg: Number(hatchAngle) || 45,
        spacingMm: Number(hatchSpacing) || 2.0,
        lineWeightMm: Number(hatchLineWeight) || 0.09,
        colorIndex: Number(hatchColorIndex) || 8,
        associatedMaterial: hatchMaterial,
        patternType: hatchMode === 'dwg_block' ? 'dwg_hatch_block' : 'standard_pat',
        strokeDash: hatchStrokeDash,
      },
    };

    const updatedBlocks = [newHatchItem, ...blocks];
    setBlocks(updatedBlocks);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updatedBlocks));

    // 自動整合至使用者的個人施工圖規格庫 (user_personal_cad_dna_profile)
    try {
      const savedProfileJson = localStorage.getItem('user_personal_cad_dna_profile');
      let profile = savedProfileJson ? JSON.parse(savedProfileJson) : null;
      if (!profile) {
        profile = {
          id: 'learned-prof-master',
          profileName: '設計師個人專屬 CAD 規範規格表',
          hatchRules: [],
        };
      }
      if (!Array.isArray(profile.hatchRules)) {
        profile.hatchRules = [];
      }

      const existingIdx = profile.hatchRules.findIndex(
        (r: any) => r.pattern === hatchName || r.material === hatchMaterial
      );
      const newRule = {
        material: hatchMaterial,
        pattern: hatchName,
        angleDeg: Number(hatchAngle) || 45,
        spacingMm: Number(hatchSpacing) || 2.0,
        lineWeightMm: Number(hatchLineWeight) || 0.09,
        colorIndex: Number(hatchColorIndex) || 8,
      };

      if (existingIdx >= 0) {
        profile.hatchRules[existingIdx] = newRule;
      } else {
        profile.hatchRules.push(newRule);
      }
      localStorage.setItem('user_personal_cad_dna_profile', JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to update user_personal_cad_dna_profile', err);
    }

    setSelectedBlockId(newHatchItem.id);
    setActiveCategory('hatch_pattern');
    setIsHatchImportModalOpen(false);
    onNotify?.(
      `🎉 已成功將自訂剖面填充「${hatchName}」匯入，已自動渲染 2D 視覺縮圖並整合至個人施工圖規格庫！`
    );
  };

  // 匯出單一 .pat 檔案
  const handleExportSinglePat = (item: PersonalDetailBlockItem) => {
    const code =
      item.hatchData?.patDefinition ||
      `*${item.hatchData?.patName || 'CUSTOM_HATCH'}, ${item.hatchData?.associatedMaterial || ''}\n${
        item.hatchData?.angleDeg || 45
      }, 0,0, 0,${item.hatchData?.spacingMm || 2.0}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.hatchData?.patName || 'HATCH'}.pat`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`📥 已匯出 AutoCAD 標準樣式檔「${item.hatchData?.patName || 'HATCH'}.pat」！`);
  };

  // 手動登錄一般家具/大樣
  const handleSaveManualBlock = () => {
    if (!newName) return;
    const parsedTags = newTagsInput
      .split(/[,，、\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    if (parsedTags.length === 0) parsedTags.push(newCat === 'furniture' ? '家具' : '大樣');

    const item: PersonalDetailBlockItem = {
      id: `blk-manual-${Date.now()}`,
      name: newName,
      category: newCat,
      subCategory: newSubCat,
      widthCm: Number(newW) || 100,
      depthCm: Number(newD) || 50,
      heightCm: Number(newH) || 75,
      elevationCm: Number(newElev) || 0,
      cadLayer: newCat === 'furniture' ? 'A-FURN-CUST' : newCat === 'detail_joint' ? '05_木作櫃體' : '06_施工註記',
      colorIndex: newCat === 'furniture' ? 6 : newCat === 'detail_joint' ? 1 : 7,
      notes: newNotes || '自訂圖塊元件',
      tags: parsedTags,
      isCustomUploaded: true,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [item, ...blocks];
    setBlocks(updated);
    localStorage.setItem('user_personal_blocks_database', JSON.stringify(updated));
    setSelectedBlockId(item.id);
    setIsAddFormOpen(false);
    setNewName('');
    onNotify?.(`✨ 已成功建立專屬圖塊「${item.name}」！`);
  };

  // Delete Block
  const handleDeleteBlock = (id: string) => {
    if (confirm('確定要自本機資料庫移除此項目嗎？')) {
      const updated = blocks.filter((b) => b.id !== id);
      setBlocks(updated);
      localStorage.setItem('user_personal_blocks_database', JSON.stringify(updated));
      onNotify?.('已自本機資料庫移除項目');
    }
  };

  // Export Library JSON
  const handleExportLibraryJson = () => {
    const blob = new Blob([JSON.stringify(blocks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `My_Personal_CAD_Blocks_Library_${blocks.length}Items.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`📦 已匯出包含 ${blocks.length} 個圖塊/填充之本機資料庫備份包！`);
  };

  // Insert to current room
  const handleInsertToRoom = (blk: PersonalDetailBlockItem) => {
    onInsertBlockToRoom?.(blk);
    onNotify?.(`📐 已將「${blk.name}」置入目前空間放樣畫布！`);
  };

  if (!isOpen) return null;

  return (
    <div
      className={
        isDocked
          ? 'fixed top-14 right-4 bottom-4 z-40 w-[450px] max-w-[calc(100vw-2rem)] flex flex-col pointer-events-auto transition-all duration-200 shadow-2xl'
          : `fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn transition-opacity duration-200 ${
              isCurrentlyDragging ? 'opacity-35 pointer-events-none' : ''
            }`
      }
    >
      <div
        className={`bg-slate-950 border border-slate-700 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden text-slate-200 ${
          isDocked ? 'h-full border-amber-500/70 ring-2 ring-amber-500/20' : 'max-w-5xl max-h-[95vh]'
        }`}
      >
        {/* Hidden Batch Drop Input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".dwg,.dxf,.svg,.json"
          className="hidden"
          onChange={handleBatchDropFiles}
        />

        {/* Hidden Hatch Specific Upload Input */}
        <input
          type="file"
          ref={hatchFileInputRef}
          accept=".pat,.dwg,.dxf"
          className="hidden"
          onChange={handleUploadHatchFile}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-b border-amber-500/30 p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  本機專屬圖塊與剖面填充庫
                </h3>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                  {blocks.length} 款
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                支援 DWG/.pat 匯入 · 支援圖塊拖拽至 2D 畫布自動吸附牆面基準線
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <button
              onClick={toggleDock}
              title={isDocked ? '展開為全螢幕視窗' : '側邊停靠工作台 (方便直接拖曳至 2D 畫布)'}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold px-2.5 ${
                isDocked
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'text-slate-300 hover:text-white bg-slate-800/90 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isDocked ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDocked ? '展開視窗' : '側邊停靠'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drag Guidance Banner */}
        <div className="bg-cyan-950/90 border-b border-cyan-500/40 px-3.5 py-1.5 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2 truncate">
            <Magnet className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              <strong>🧲 圖塊拖拽吸附：</strong>按住任意縮圖拖入 2D 畫布，自動產生半透明鬼影並吸附至最近牆面與施工基準線！
            </span>
          </div>
          {isDocked && (
            <span className="text-[10px] bg-cyan-900/60 border border-cyan-400/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono flex-shrink-0 ml-2">
              停靠工作台
            </span>
          )}
        </div>

        {/* Search, Filter & Action Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'all', label: `全部項目 (${blocks.length})` },
              {
                id: 'furniture',
                label: `家具與設備 (${blocks.filter((b) => b.category === 'furniture').length})`,
              },
              {
                id: 'detail_joint',
                label: `施工大樣與節點 (${blocks.filter((b) => b.category === 'detail_joint').length})`,
              },
              {
                id: 'hatch_pattern',
                label: `自訂剖面填充 (${blocks.filter((b) => b.category === 'hatch_pattern').length})`,
              },
              {
                id: 'title_symbol',
                label: `圖框與圖頭標籤 (${blocks.filter((b) => b.category === 'title_symbol').length})`,
              },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.id === 'hatch_pattern' && <Palette className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* USER REQUESTED: 自定義剖面填充 (Hatch) 匯入按鈕 */}
            <button
              onClick={() => setIsHatchImportModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 active:scale-95"
              title="匯入特定 .pat 樣式檔或 DWG 區塊，並自動整合進個人施工圖規格庫"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>自定義剖面填充 (Hatch) 匯入</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>批次丟入本機圖檔</span>
            </button>

            <button
              onClick={() => setIsAddFormOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>手動新增圖塊</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* USER REQUESTED: 自動填充一致性校正橫幅 (Consistency Check Banner) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900/90 border-b border-slate-800">
          {calibrationIssues.length > 0 ? (
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-amber-500">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      自動填充一致性校正警示
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                      {calibrationIssues.length} 項比例不符
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    檢測到已匯入之 .pat 樣式線距過密或過疏，未符合當前 CAD 圖層規範，可能導致出圖糊斑或紋理失真。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCalibrationDrawerOpen(!isCalibrationDrawerOpen)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isCalibrationDrawerOpen ? '收合明細' : '檢視診斷'}</span>
                </button>
                <button
                  onClick={handleBatchCalibrateHatchPatterns}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-600/30 active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一鍵全項目自動校正 ({calibrationIssues.length})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 px-4 py-2 flex items-center justify-between text-[11px] border-l-4 border-emerald-500 text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  CAD 圖層比例一致性檢測通過：所有 .pat 剖面填充皆符合圖層比例規範 (星玥灣出圖比例已驗證)
                </span>
              </div>
              <button
                onClick={() => onNotify?.('✨ 已重新掃描資料庫！所有剖面樣式比例完全合規。')}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>重新檢測</span>
              </button>
            </div>
          )}

          {/* Expandable Diagnostic Drawer */}
          {isCalibrationDrawerOpen && calibrationIssues.length > 0 && (
            <div className="bg-slate-950/95 p-3 sm:px-5 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  圖層比例不一致項目診斷清單
                </span>
                <span className="text-[10px] text-slate-400">
                  按一下即可單獨將樣式校正至圖層標準線距與線寬
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {calibrationIssues.map((iss) => (
                  <div
                    key={iss.itemId}
                    className="p-2.5 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-white truncate">{iss.itemName}</span>
                        <span className="text-[9px] bg-slate-800 text-cyan-300 px-1 py-0.2 rounded font-mono">
                          {iss.layer}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono">
                        {iss.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        標準建議：間距 {iss.recommendedSpacing}mm · 線寬 {iss.recommendedLineWeight}mm
                      </div>
                    </div>
                    <button
                      onClick={() => handleCalibrateSingleHatchPattern(iss.itemId)}
                      className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] whitespace-nowrap flex items-center gap-1 transition flex-shrink-0"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>校正</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* USER REQUESTED: 標籤化分類系統過濾列 (Tag Filter System Bar)   */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-950/80 border-b border-slate-800/80 px-3 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium flex-shrink-0 pr-1">
            <Tags className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">標籤過濾：</span>
          </div>

          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTag === null
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            全部 ({blocks.length})
          </button>

          {allAvailableTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs transition whitespace-nowrap flex items-center gap-1 ${
                activeTag === tag
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 border border-slate-800'
              }`}
            >
              <span>#{tag}</span>
              <span className={`text-[10px] ${activeTag === tag ? 'text-slate-900 font-mono font-bold' : 'text-slate-500'}`}>
                {count}
              </span>
              {activeTag === tag && <X className="w-3 h-3 ml-0.5" />}
            </button>
          ))}

          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline whitespace-nowrap ml-2 flex-shrink-0"
            >
              清除標籤篩選
            </button>
          )}
        </div>

        {/* Content Body: Dual Column */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Blocks List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-2 bg-slate-950/60">
            {/* Search Input, View Mode Switcher, & Active Filter Notice */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋關鍵字、標籤、材料、圖層..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2D 縮圖檢視模式切換 */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewLayout('visual_list')}
                    title="圖文縮圖清單 (推薦)"
                    className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
                      viewLayout === 'visual_list'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">清單</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('thumbnail_grid')}
                    title="雙排大縮圖網格"
                    className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
                      viewLayout === 'thumbnail_grid'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">網格</span>
                  </button>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                <span>
                  共 <strong className="text-white font-mono">{filteredBlocks.length}</strong> 項 · 2D 視覺縮圖即時渲染
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono">
                  {viewLayout === 'visual_list' ? '圖文清單' : '大縮圖網格'}
                </span>
              </div>

              {activeTag && (
                <div className="flex items-center justify-between bg-amber-950/50 border border-amber-500/40 rounded-lg px-2.5 py-1 text-[11px] text-amber-300">
                  <span className="flex items-center gap-1 font-mono">
                    <Tag className="w-3 h-3 text-amber-400" />
                    已鎖定標籤：#{activeTag} ({filteredBlocks.length} 項)
                  </span>
                  <button
                    onClick={() => setActiveTag(null)}
                    className="hover:text-white ml-2 flex items-center gap-0.5 text-[10px]"
                  >
                    <X className="w-3 h-3" />
                    清除
                  </button>
                </div>
              )}
            </div>

            {filteredBlocks.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-500 text-xs">
                <Box className="w-8 h-8 mx-auto text-slate-600" />
                <p>無符合當前分類或標籤的項目</p>
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="text-amber-400 underline text-xs"
                  >
                    清除標籤篩選以查看全部
                  </button>
                )}
              </div>
            ) : viewLayout === 'visual_list' ? (
              /* ----------------------------------------------------------- */
              /* USER REQUESTED: 圖文清單檢視 (2D Visual Thumbnail List)      */
              /* ----------------------------------------------------------- */
              filteredBlocks.map((blk) => (
                <div
                  key={blk.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStartItem(e, blk)}
                  onDragEnd={handleDragEndItem}
                  onClick={() => setSelectedBlockId(blk.id)}
                  title="按住拖拽至 2D 畫布放樣（自動產生半透明鬼影並吸附至最近牆面與施工基準線）"
                  className={`p-2.5 rounded-xl border cursor-pointer transition text-left flex items-center gap-3 relative select-none group/item ${
                    selectedBlockId === blk.id
                      ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  {/* Automated 2D Vector Thumbnail with Drag Indicator */}
                  <div className="relative flex-shrink-0 cursor-grab active:cursor-grabbing group/thumb">
                    <Block2DVisualThumbnail item={blk} size={64} />
                    <div className="absolute inset-0 bg-cyan-950/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center rounded-xl transition backdrop-blur-[1px]">
                      <GripVertical className="w-5 h-5 text-cyan-300 animate-pulse" />
                    </div>
                  </div>

                  {/* Metadata and Specs */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {blk.category === 'hatch_pattern' ? (
                          <Palette className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Box className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="font-bold text-xs truncate">{blk.name}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                          blk.category === 'hatch_pattern'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-amber-300'
                        }`}
                      >
                        {blk.subCategory}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      {blk.category === 'hatch_pattern' ? (
                        <span className="text-emerald-300">
                          角度 {blk.hatchData?.angleDeg}° / 間距 {blk.hatchData?.spacingMm}mm
                        </span>
                      ) : (
                        <span>
                          {blk.widthCm} × {blk.depthCm} {blk.heightCm ? `× ${blk.heightCm}` : ''} cm
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-400 text-[10px]">{blk.cadLayer}</span>
                        <div
                          className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-[9px] text-cyan-300 font-sans cursor-grab active:cursor-grabbing hover:bg-cyan-900/80"
                          title="按住此圖塊拖拽至 2D 畫布即可吸附放樣"
                        >
                          <GripVertical className="w-2.5 h-2.5" />
                          <span>拖拽</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags & Calibration Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-1">
                        {blk.tags && blk.tags.length > 0 ? (
                          blk.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTag(activeTag === t ? null : t);
                              }}
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono transition ${
                                activeTag === t
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-600 font-mono">無標籤</span>
                        )}
                        {blk.tags && blk.tags.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-mono">
                            +{blk.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Hatch Calibration Pill */}
                      {blk.category === 'hatch_pattern' && blk.hatchData && (
                        <div>
                          {calibrationIssues.some((iss) => iss.itemId === blk.id) ||
                          blk.scaleCalibrated === false ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-0.5 font-medium">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                              待校正
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5 font-medium">
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              比例合規
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* ----------------------------------------------------------- */
              /* USER REQUESTED: 雙排縮圖網格 (2D Visual Thumbnail Grid)      */
              /* ----------------------------------------------------------- */
              <div className="grid grid-cols-2 gap-2">
                {filteredBlocks.map((blk) => (
                  <div
                    key={blk.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStartItem(e, blk)}
                    onDragEnd={handleDragEndItem}
                    onClick={() => setSelectedBlockId(blk.id)}
                    title="按住拖拽至 2D 畫布放樣（自動產生半透明鬼影並吸附至最近牆面與施工基準線）"
                    className={`p-2 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between space-y-1.5 relative select-none group/griditem ${
                      selectedBlockId === blk.id
                        ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-lg ring-1 ring-amber-500/40'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {/* Top Vector Thumbnail Canvas with Drag Badge */}
                    <div className="w-full flex items-center justify-center relative cursor-grab active:cursor-grabbing">
                      <Block2DVisualThumbnail item={blk} size={76} className="w-full h-[76px]" />
                      <div className="absolute top-1 right-1 opacity-70 group-hover/griditem:opacity-100 bg-slate-950/85 border border-cyan-500/40 rounded px-1 py-0.5 text-[8px] text-cyan-300 flex items-center gap-0.5 shadow">
                        <GripVertical className="w-2.5 h-2.5" />
                        <span>拖曳</span>
                      </div>
                    </div>

                    {/* Block Info */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{blk.name}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono flex-shrink-0">
                          {blk.subCategory}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {blk.category === 'hatch_pattern'
                          ? `${blk.hatchData?.angleDeg}° · ${blk.hatchData?.spacingMm}mm`
                          : `${blk.widthCm}×${blk.depthCm} cm`}
                      </div>
                    </div>

                    {/* Bottom Status & Tag */}
                    <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-slate-800/60">
                      <span className="text-amber-400/80 truncate max-w-[65%]">
                        {blk.tags?.[0] ? `#${blk.tags[0]}` : blk.cadLayer}
                      </span>
                      {blk.category === 'hatch_pattern' ? (
                        <span
                          className={
                            blk.scaleCalibrated === false
                              ? 'text-amber-400 font-bold'
                              : 'text-emerald-400'
                          }
                        >
                          {blk.scaleCalibrated === false ? '待校正' : '✓合規'}
                        </span>
                      ) : (
                        <span className="text-cyan-400">DWG</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Inspector & 2D Vector Preview (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900/60 flex flex-col justify-between">
            {activeBlock ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      {activeBlock.category === 'hatch_pattern' && (
                        <Palette className="w-5 h-5 text-emerald-400" />
                      )}
                      <span>{activeBlock.name}</span>
                    </h4>
                    <span className="text-xs text-amber-400 font-mono">
                      分類：{activeBlock.subCategory} · 圖層：{activeBlock.cadLayer} (ACI {activeBlock.colorIndex})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeBlock.category === 'hatch_pattern' && (
                      <button
                        onClick={() => handleExportSinglePat(activeBlock)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        title="匯出此填充為 AutoCAD 標準 .pat 檔案"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>匯出 .pat</span>
                      </button>
                    )}
                    {activeBlock.isCustomUploaded && (
                      <button
                        onClick={() => handleDeleteBlock(activeBlock.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="刪除此項目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2D Vector Schematic Preview */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[220px]">
                  {activeBlock.category === 'hatch_pattern' ? (
                    /* HATCH PATTERN PREVIEW CANVAS */
                    <svg viewBox="-10 -10 120 120" className="w-full max-h-[200px]" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <pattern
                          id={`hatch-viewer-${activeBlock.id}`}
                          width={Math.max(4, (activeBlock.hatchData?.spacingMm || 4) * 2)}
                          height={Math.max(4, (activeBlock.hatchData?.spacingMm || 4) * 2)}
                          patternTransform={`rotate(${activeBlock.hatchData?.angleDeg || 45} 0 0)`}
                          patternUnits="userSpaceOnUse"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2={Math.max(4, (activeBlock.hatchData?.spacingMm || 4) * 2)}
                            stroke={activeBlock.hatchData?.colorIndex === 252 ? '#94a3b8' : '#38bdf8'}
                            strokeWidth={Math.max(1, (activeBlock.hatchData?.lineWeightMm || 0.15) * 6)}
                            strokeDasharray={activeBlock.hatchData?.strokeDash || 'none'}
                          />
                          {activeBlock.hatchData?.patName.includes('CROSS') && (
                            <line
                              x1="0"
                              y1="0"
                              x2={Math.max(4, (activeBlock.hatchData?.spacingMm || 4) * 2)}
                              y2="0"
                              stroke="#38bdf8"
                              strokeWidth={Math.max(1, (activeBlock.hatchData?.lineWeightMm || 0.15) * 6)}
                            />
                          )}
                        </pattern>
                      </defs>

                      {/* Boundary */}
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        fill="#0b0f19"
                        stroke="#334155"
                        strokeWidth="1.5"
                        rx="4"
                      />

                      {/* Hatch Fill */}
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        fill={`url(#hatch-viewer-${activeBlock.id})`}
                        rx="4"
                      />

                      {/* Badge in SVG */}
                      <rect x="5" y="5" width="90" height="18" fill="#000000aa" rx="3" />
                      <text
                        x="50"
                        y="17"
                        fill="#34d399"
                        fontSize="7"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {activeBlock.hatchData?.patName || 'HATCH'} · {activeBlock.hatchData?.angleDeg}° · {activeBlock.hatchData?.spacingMm}mm
                      </text>
                    </svg>
                  ) : (
                    /* FURNITURE / DETAIL 2D PREVIEW CANVAS */
                    <svg
                      viewBox={`-20 -20 ${activeBlock.widthCm + 40} ${activeBlock.depthCm + 40}`}
                      className="w-full max-h-[200px]"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <rect
                        x="-20"
                        y="-20"
                        width={activeBlock.widthCm + 40}
                        height={activeBlock.depthCm + 40}
                        fill="#0b0f19"
                        stroke="#1e293b"
                        strokeWidth="0.5"
                      />
                      <rect
                        x="0"
                        y="0"
                        width={activeBlock.widthCm}
                        height={activeBlock.depthCm}
                        fill="#1e293b"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        rx="3"
                      />
                      {activeBlock.category === 'furniture' && (
                        <rect
                          x="5"
                          y="5"
                          width={Math.max(10, activeBlock.widthCm - 10)}
                          height={Math.max(10, activeBlock.depthCm - 10)}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="0.8"
                          strokeDasharray="2,2"
                        />
                      )}
                      {activeBlock.category === 'detail_joint' && (
                        <g>
                          <line
                            x1="0"
                            y1="0"
                            x2={activeBlock.widthCm}
                            y2={activeBlock.depthCm}
                            stroke="#f87171"
                            strokeWidth="1"
                          />
                          <line
                            x1="0"
                            y1={activeBlock.depthCm}
                            x2={activeBlock.widthCm}
                            y2="0"
                            stroke="#f87171"
                            strokeWidth="1"
                          />
                        </g>
                      )}
                      <text
                        x={activeBlock.widthCm / 2}
                        y={-6}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {activeBlock.widthCm} cm
                      </text>
                      <text
                        x={-6}
                        y={activeBlock.depthCm / 2}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        transform={`rotate(-90 -6 ${activeBlock.depthCm / 2})`}
                        fontWeight="bold"
                      >
                        {activeBlock.depthCm} cm
                      </text>
                    </svg>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono mt-2">
                    {activeBlock.category === 'hatch_pattern'
                      ? 'AutoCAD 標準剖面線向量幾何預覽'
                      : '1:1 實體尺寸向量幾何投影'}
                  </span>
                </div>

                {/* Parameters Matrix */}
                {activeBlock.category === 'hatch_pattern' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">傾斜角度</span>
                      <span className="text-cyan-300 font-bold">{activeBlock.hatchData?.angleDeg}°</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">線條間距</span>
                      <span className="text-emerald-300 font-bold">{activeBlock.hatchData?.spacingMm} mm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">出圖線寬</span>
                      <span className="text-purple-300 font-bold">{activeBlock.hatchData?.lineWeightMm} mm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">樣式類型</span>
                      <span className="text-amber-400 font-bold font-sans">
                        {activeBlock.hatchData?.patternType === 'dwg_hatch_block'
                          ? 'DWG 區塊'
                          : '標準 .PAT'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">開間寬度</span>
                      <span className="text-white font-bold">{activeBlock.widthCm} cm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">進深深度</span>
                      <span className="text-white font-bold">{activeBlock.depthCm} cm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">總體高度</span>
                      <span className="text-cyan-300 font-bold">{activeBlock.heightCm || '--'} cm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">安裝基準高程</span>
                      <span className="text-amber-400 font-bold">FL+{activeBlock.elevationCm} cm</span>
                    </div>
                  </div>
                )}

                {/* PAT Code Display for Hatch */}
                {activeBlock.category === 'hatch_pattern' && activeBlock.hatchData?.patDefinition && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-400 block font-mono text-[11px]">
                      AutoCAD .PAT 語法定義碼：
                    </span>
                    <pre className="text-emerald-300 font-mono text-[11px] overflow-x-auto p-2 bg-slate-900 rounded-lg">
                      {activeBlock.hatchData.patDefinition}
                    </pre>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* USER REQUESTED: 自動填充一致性校正檢視 (Hatch Consistency Check) */}
                {/* --------------------------------------------------------- */}
                {activeBlock.category === 'hatch_pattern' && activeBlock.hatchData && (() => {
                  const spec = LAYER_HATCH_SPECS[activeBlock.cadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
                  const curSpacing = activeBlock.hatchData.spacingMm;
                  const curLineWeight = activeBlock.hatchData.lineWeightMm;
                  const isSpacingLow = curSpacing < spec.minAllowedSpacingMm;
                  const isSpacingHigh = curSpacing > spec.maxAllowedSpacingMm;
                  const isLineWeightHigh = curLineWeight > spec.maxAllowedLineWeightMm;
                  const hasIssue = isSpacingLow || isSpacingHigh || isLineWeightHigh;

                  return (
                    <div
                      className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                        hasIssue
                          ? 'bg-amber-950/40 border-amber-500/60'
                          : 'bg-emerald-950/30 border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {hasIssue ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <span
                            className={`font-bold text-xs ${
                              hasIssue ? 'text-amber-300' : 'text-emerald-300'
                            }`}
                          >
                            CAD 圖層比例一致性規範審核：{hasIssue ? '比例異常需校正' : '比例完全合規'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {spec.label}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>
                            目前線距：<strong className={hasIssue ? 'text-amber-400' : 'text-emerald-400'}>{curSpacing} mm</strong>
                            <span className="text-slate-400 text-[10px] ml-1.5">
                              (規範容許範圍：{spec.minAllowedSpacingMm} ~ {spec.maxAllowedSpacingMm} mm · 推薦值：{spec.recommendedSpacingMm} mm)
                            </span>
                          </span>
                          <span>
                            出圖線寬：<strong className={isLineWeightHigh ? 'text-amber-400' : 'text-purple-300'}>{curLineWeight} mm</strong>
                          </span>
                        </div>

                        {hasIssue && (
                          <p className="text-[10.5px] text-amber-200/90 leading-relaxed bg-slate-950/80 p-2 rounded-lg border border-amber-500/30">
                            {isSpacingLow && `⚠️ 檢測警示：線距 ${curSpacing}mm 偏密（低於安全門檻 ${spec.minAllowedSpacingMm}mm），出圖時墨線容易糊斑聚墨，遮蓋主要輪廓線。`}
                            {isSpacingHigh && `⚠️ 檢測警示：線距 ${curSpacing}mm 偏疏（高於容許上限 ${spec.maxAllowedSpacingMm}mm），在縮圖視埠下容易失去材質填充質感。`}
                            {isLineWeightHigh && `⚠️ 檢測警示：線寬 ${curLineWeight}mm 過粗，可能喧賓奪主遮蔽外框實線。`}
                          </p>
                        )}
                        {!hasIssue && (
                          <p className="text-[10.5px] text-emerald-300/80 leading-relaxed">
                            ✓ {spec.reason}，符合 CNS 與星玥灣施工圖一致性驗收準則。
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          {activeBlock.calibrationNote || '尚未進行自動校正紀錄'}
                        </span>
                        {hasIssue ? (
                          <button
                            onClick={() => handleCalibrateSingleHatchPattern(activeBlock.id)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-600/30 active:scale-95"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>一鍵自動校正至圖層規範 ({spec.recommendedSpacingMm}mm)</span>
                          </button>
                        ) : curSpacing !== spec.recommendedSpacingMm ? (
                          <button
                            onClick={() => handleCalibrateSingleHatchPattern(activeBlock.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] border border-slate-700 flex items-center gap-1 transition"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>重置微調至標準值 ({spec.recommendedSpacingMm}mm)</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })()}

                {/* --------------------------------------------------------- */}
                {/* USER REQUESTED: 標籤化分類系統管理 (Tag Management for item) */}
                {/* --------------------------------------------------------- */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>自訂標籤化分類 (關鍵字過濾搜尋)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      點擊標籤可快速篩選圖庫
                    </span>
                  </div>

                  {/* Active tags on this item */}
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
                    {activeBlock.tags && activeBlock.tags.length > 0 ? (
                      activeBlock.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-950/70 text-amber-300 border border-amber-500/40 font-mono shadow-sm"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => handleRemoveTagFromActiveBlock(tag)}
                            className="text-amber-400/80 hover:text-white p-0.5 rounded-full hover:bg-amber-800/60 transition"
                            title={`移除標籤 #${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs italic">尚未設定任何關鍵字標籤</span>
                    )}
                  </div>

                  {/* Quick-add recommended tags */}
                  <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      常用快捷標籤 (按一下立即加入)：
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        '地坪',
                        '牆面',
                        '木作',
                        '系統櫃',
                        '天花',
                        '降板230',
                        '衛浴',
                        '玄關',
                        '客廳',
                        '臥室',
                        '石材',
                        '剖面',
                      ].map((quickTag) => {
                        const isAlreadyPresent = (activeBlock.tags || []).includes(quickTag);
                        return (
                          <button
                            key={quickTag}
                            disabled={isAlreadyPresent}
                            onClick={() => handleAddTagToActiveBlock(quickTag)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-0.5 ${
                              isAlreadyPresent
                                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700/80'
                            }`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{quickTag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom tag text input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTagToActiveBlock(customTagInput);
                          setCustomTagInput('');
                        }
                      }}
                      placeholder="輸入自訂標籤 (如：烤漆、五金、防火板)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        handleAddTagToActiveBlock(customTagInput);
                        setCustomTagInput('');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-slate-950 font-bold rounded-lg text-xs transition border border-slate-700"
                    >
                      加入標籤
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1">施工與工法重點提示：</span>
                  {activeBlock.notes}
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleExportLibraryJson}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>匯出圖庫備份包 JSON</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Draggable button for direct drag from detail pane */}
                {activeBlock && (
                  <div
                    draggable={true}
                    onDragStart={(e) => handleDragStartItem(e, activeBlock)}
                    onDragEnd={handleDragEndItem}
                    className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/60 rounded-xl text-xs font-bold cursor-grab active:cursor-grabbing shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 transition select-none"
                    title="按住此按鈕拖移至 2D 畫布，自動產生半透明縮圖鬼影並吸附至最近牆面與基準線"
                  >
                    <Magnet className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>按住拖拽至畫布磁吸</span>
                  </div>
                )}

                <button
                  onClick={() => handleInsertToRoom(activeBlock)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>一鍵置入目前空間放樣</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* USER REQUESTED MODAL: 自定義剖面填充 (Hatch) 匯入視窗               */}
        {/* ------------------------------------------------------------------ */}
        {isHatchImportModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-500/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">自定義剖面填充 (Hatch) 匯入器</h4>
                    <p className="text-[11px] text-slate-300">
                      選取保存 .pat 填充樣式或 DWG 區塊 · 自動整合進個人施工圖規格庫
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHatchImportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-2 text-xs font-semibold">
                <button
                  onClick={() => setHatchMode('file_upload')}
                  className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    hatchMode === 'file_upload'
                      ? 'border-emerald-400 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>選取 .pat / DWG 樣式檔</span>
                </button>
                <button
                  onClick={() => setHatchMode('pat_code')}
                  className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    hatchMode === 'pat_code'
                      ? 'border-emerald-400 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>貼上 AutoCAD .PAT 語法</span>
                </button>
                <button
                  onClick={() => setHatchMode('dwg_block')}
                  className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    hatchMode === 'dwg_block'
                      ? 'border-emerald-400 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>視覺化幾何參數調校</span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
                {/* Upload Zone */}
                {hatchMode === 'file_upload' && (
                  <div
                    onClick={() => hatchFileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 rounded-xl p-5 text-center cursor-pointer transition space-y-2"
                  >
                    <Upload className="w-7 h-7 mx-auto text-emerald-400 animate-bounce" />
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        點擊選取或拖曳 .pat 填充樣式檔或 DWG 區塊
                      </span>
                      <span className="text-[11px] text-slate-400">
                        支援 AutoCAD .pat 樣式庫、DWG / DXF 填充圖塊
                      </span>
                    </div>
                    {hatchFileName && (
                      <span className="inline-block px-3 py-1 bg-emerald-900/80 text-emerald-200 rounded-lg text-xs font-mono border border-emerald-500/50">
                        已載入檔案：{hatchFileName}
                      </span>
                    )}
                  </div>
                )}

                {/* PAT Code Editor */}
                {hatchMode === 'pat_code' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block flex items-center justify-between">
                      <span>AutoCAD .PAT 原始定義碼</span>
                      <span className="text-[10px] text-slate-500">標準 ANSI / ISO 規範</span>
                    </label>
                    <textarea
                      rows={4}
                      value={hatchRawCode}
                      onChange={(e) => setHatchRawCode(e.target.value)}
                      placeholder="*ANSI31, ANSI Iron\n45, 0,0, 0,2.0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Real-time Live SVG Hatch Preview */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-slate-950 rounded-xl border border-slate-700 relative overflow-hidden flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <pattern
                          id="dynamic-hatch-test"
                          width={Math.max(4, hatchSpacing * 2.5)}
                          height={Math.max(4, hatchSpacing * 2.5)}
                          patternTransform={`rotate(${hatchAngle} 0 0)`}
                          patternUnits="userSpaceOnUse"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2={Math.max(4, hatchSpacing * 2.5)}
                            stroke="#34d399"
                            strokeWidth={Math.max(1, hatchLineWeight * 7)}
                            strokeDasharray={hatchStrokeDash}
                          />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#dynamic-hatch-test)" />
                    </svg>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-white block">即時向量剖面幾何預覽</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      旋轉角度：<strong className="text-cyan-300">{hatchAngle}°</strong> ·
                      線條間距：<strong className="text-emerald-300">{hatchSpacing} mm</strong> ·
                      出圖線寬：<strong className="text-purple-300">{hatchLineWeight} mm</strong>
                      <br />
                      當前設定將直接套用至立面切圖、大樣斷面與全域規格表。
                    </p>
                  </div>
                </div>

                {/* Parameters Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">填充樣式名稱 (Pattern Name)</label>
                    <input
                      type="text"
                      value={hatchName}
                      onChange={(e) => setHatchName(e.target.value)}
                      placeholder="例如：ANSI31_COREY_WOOD"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">關聯材質語意 (Associated Material)</label>
                    <input
                      type="text"
                      value={hatchMaterial}
                      onChange={(e) => setHatchMaterial(e.target.value)}
                      placeholder="例如：木作合板與實木角料剖面"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">傾斜角度 (°)</label>
                    <input
                      type="number"
                      value={hatchAngle}
                      onChange={(e) => setHatchAngle(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">線條間距 (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={hatchSpacing}
                      onChange={(e) => setHatchSpacing(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">出圖線寬 (mm)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={hatchLineWeight}
                      onChange={(e) => setHatchLineWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">AutoCAD 圖層 (CAD Layer)</label>
                    <select
                      value={hatchCadLayer}
                      onChange={(e) => setHatchCadLayer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    >
                      <option value="05_木作櫃體">05_木作櫃體 (櫃體與檯面剖面)</option>
                      <option value="03_天花降板">03_天花降板 (集風箱與天花剖面)</option>
                      <option value="01_結構牆體">01_結構牆體 (混凝土剪力牆剖面)</option>
                      <option value="04_門窗開口">04_門窗開口 (門框與隔音剖面)</option>
                      <option value="HATCH_CUSTOM">HATCH_CUSTOM (專用自訂填充層)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">ACI 顏色代碼 (Color Index)</label>
                    <input
                      type="number"
                      value={hatchColorIndex}
                      onChange={(e) => setHatchColorIndex(Number(e.target.value))}
                      placeholder="8 = 灰色 / 1 = 紅色 / 9 = 淺灰"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    >
                    </input>
                  </div>
                </div>

                {/* USER REQUESTED: 比例即時檢測與規範提示 */}
                {(() => {
                  const spec = LAYER_HATCH_SPECS[hatchCadLayer] || LAYER_HATCH_SPECS['05_木作櫃體'];
                  const isOutOfRange = hatchSpacing < spec.minAllowedSpacingMm || hatchSpacing > spec.maxAllowedSpacingMm;
                  return (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        isOutOfRange
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isOutOfRange ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        <span className="text-[11px]">
                          {isOutOfRange
                            ? `比例提示：此圖層規範建議間距 ${spec.recommendedSpacingMm}mm (容許 ${spec.minAllowedSpacingMm}~${spec.maxAllowedSpacingMm}mm)，目前 ${hatchSpacing}mm 偏離規範！`
                            : `比例合格：目前線距 ${hatchSpacing}mm 符合「${spec.label}」出圖規範 (${spec.minAllowedSpacingMm}~${spec.maxAllowedSpacingMm}mm)。`}
                        </span>
                      </div>
                      {isOutOfRange && (
                        <button
                          type="button"
                          onClick={() => {
                            setHatchSpacing(spec.recommendedSpacingMm);
                            setHatchLineWeight(spec.recommendedLineWeightMm);
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] whitespace-nowrap flex items-center gap-1 transition"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>一鍵代入標準值 ({spec.recommendedSpacingMm}mm)</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* USER REQUESTED: 自定義標籤系統 (Tags Input) */}
                <div>
                  <label className="text-slate-400 block mb-1">
                    自訂分類標籤 (Tags / 關鍵字，以逗號或空格分隔)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hatchTagsInput}
                      onChange={(e) => setHatchTagsInput(e.target.value)}
                      placeholder="例如：地坪, 剖面, 木作, 實木, 降板230"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                    <div className="flex items-center gap-1">
                      {['地坪', '牆面', '木作', '天花'].map((presetTag) => (
                        <button
                          key={presetTag}
                          type="button"
                          onClick={() => {
                            const cur = hatchTagsInput.trim();
                            if (!cur.includes(presetTag)) {
                              setHatchTagsInput(cur ? `${cur}, ${presetTag}` : presetTag);
                            }
                          }}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                        >
                          +{presetTag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">工法備註與施工說明</label>
                  <input
                    type="text"
                    value={hatchNotes}
                    onChange={(e) => setHatchNotes(e.target.value)}
                    placeholder="例如：單向 45 度等距斜線，適用於木作骨架與檯面基層"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>保存時將自動寫入個人 CAD 規格規格表 (DNA Profile)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsHatchImportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveHatchPattern}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>儲存並自動整合至個人規格庫</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding Manual Block */}
        {isAddFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm">手動登錄新圖塊 / 大樣節點</span>
                <button onClick={() => setIsAddFormOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">圖塊名稱</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：主臥懸空化妝桌"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">主分類</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="furniture">家具與設備</option>
                      <option value="detail_joint">施工大樣節點</option>
                      <option value="title_symbol">圖框與標籤</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">細部分類標籤</label>
                    <input
                      type="text"
                      value={newSubCat}
                      onChange={(e) => setNewSubCat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">寬度(cm)</label>
                    <input
                      type="number"
                      value={newW}
                      onChange={(e) => setNewW(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">深度(cm)</label>
                    <input
                      type="number"
                      value={newD}
                      onChange={(e) => setNewD(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">高度(cm)</label>
                    <input
                      type="number"
                      value={newH}
                      onChange={(e) => setNewH(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">高程(FL+)</label>
                    <input
                      type="number"
                      value={newElev}
                      onChange={(e) => setNewElev(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    自訂分類標籤 (Tags / 關鍵字，以逗號或空格分隔)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagsInput}
                      onChange={(e) => setNewTagsInput(e.target.value)}
                      placeholder="例如：家具, 客廳, 沙發, 軟裝"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <div className="flex items-center gap-1">
                      {['家具', '木作', '收邊', '地坪'].map((presetTag) => (
                        <button
                          key={presetTag}
                          type="button"
                          onClick={() => {
                            const cur = newTagsInput.trim();
                            if (!cur.includes(presetTag)) {
                              setNewTagsInput(cur ? `${cur}, ${presetTag}` : presetTag);
                            }
                          }}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                        >
                          +{presetTag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">施工或尺寸說明</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="例如：檯面固定 80cm，預留插座孔"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveManualBlock}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  儲存圖塊
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
