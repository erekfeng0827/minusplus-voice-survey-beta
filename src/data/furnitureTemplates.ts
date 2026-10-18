import { FurnitureItem } from '../types';

export type LayoutStyle = 'ergonomic' | 'spacious' | 'storage_max';
export type RoomKind = 'living' | 'master' | 'bedroom';
export type FurnitureMarketplaceCategory = 'wardrobe' | 'tv_cabinet' | 'storage' | 'sofa' | 'bed' | 'table' | 'chair';
export type TemplateAvailability = 'available' | 'review_required' | 'unavailable';

export interface TemplateDimensionParameter {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: 'cm';
}

export interface TemplateSource {
  kind: 'built_in' | 'designer_library' | 'vendor_catalog';
  reference: string;
  verifiedAt?: string;
}

export interface FurnitureTemplate {
  key: string;
  name: string;
  category: FurnitureItem['category'];
  width: number;
  depth: number;
  height: number;
  elevation?: number;
  colorHex: string;
  wall: 'top' | 'bottom' | 'left' | 'right' | 'center';
  note: string;
  marketplaceCategory: FurnitureMarketplaceCategory;
  dimensions: {
    width: TemplateDimensionParameter;
    depth: TemplateDimensionParameter;
    height: TemplateDimensionParameter;
  };
  source: TemplateSource;
  availability: TemplateAvailability;
}

const dimension = (value: number, min: number, max: number): TemplateDimensionParameter => ({
  value, min, max, step: 5, unit: 'cm',
});

const builtInTemplate = (
  item: Omit<FurnitureTemplate, 'dimensions' | 'source' | 'availability'>,
  ranges: { width: [number, number]; depth: [number, number]; height: [number, number] },
): FurnitureTemplate => ({
  ...item,
  dimensions: {
    width: dimension(item.width, ...ranges.width),
    depth: dimension(item.depth, ...ranges.depth),
    height: dimension(item.height, ...ranges.height),
  },
  source: { kind: 'built_in', reference: 'MINUSPLUS v8 starter template catalog' },
  availability: 'available',
});

const COMMON = {
  sofa: builtInTemplate({ key: 'sofa', name: '三人座低背沙發', category: 'desk_table', marketplaceCategory: 'sofa', width: 240, depth: 95, height: 85, colorHex: '#3F5B63', wall: 'bottom', note: '活動家具配置候選' }, { width: [160, 320], depth: [80, 110], height: [70, 100] }),
  tv: builtInTemplate({ key: 'tv', name: '懸空電視收納櫃', category: 'cabinet', marketplaceCategory: 'tv_cabinet', width: 280, depth: 40, height: 45, elevation: 20, colorHex: '#E0A83C', wall: 'top', note: '懸空低櫃配置候選' }, { width: [120, 360], depth: [35, 60], height: [35, 80] }),
  coffee: builtInTemplate({ key: 'coffee', name: '薄型實木茶几', category: 'desk_table', marketplaceCategory: 'table', width: 120, depth: 60, height: 40, colorHex: '#DDD7CE', wall: 'center', note: '中央茶几配置候選' }, { width: [60, 180], depth: [40, 90], height: [30, 55] }),
  shoe: builtInTemplate({ key: 'shoe', name: '玄關鞋櫃與穿鞋椅', category: 'cabinet', marketplaceCategory: 'storage', width: 150, depth: 40, height: 220, colorHex: '#2C3E2B', wall: 'left', note: '高身收納配置候選' }, { width: [80, 240], depth: [30, 50], height: [90, 240] }),
  queen: builtInTemplate({ key: 'queen', name: '標準雙人床', category: 'bed', marketplaceCategory: 'bed', width: 180, depth: 200, height: 95, colorHex: '#2C3E2B', wall: 'bottom', note: '雙人床配置候選' }, { width: [150, 200], depth: [188, 220], height: [40, 120] }),
  single: builtInTemplate({ key: 'single', name: '單人加大床架', category: 'bed', marketplaceCategory: 'bed', width: 120, depth: 200, height: 90, colorHex: '#2C3E2B', wall: 'left', note: '單人床配置候選' }, { width: [90, 150], depth: [188, 220], height: [40, 120] }),
  wardrobe: builtInTemplate({ key: 'wardrobe', name: '高身收納衣櫃', category: 'wardrobe', marketplaceCategory: 'wardrobe', width: 180, depth: 60, height: 240, colorHex: '#3F5B63', wall: 'top', note: '衣櫃配置候選' }, { width: [60, 360], depth: [50, 70], height: [180, 280] }),
  desk: builtInTemplate({ key: 'desk', name: '採光工作書桌', category: 'desk_table', marketplaceCategory: 'table', width: 140, depth: 60, height: 75, colorHex: '#E0A83C', wall: 'bottom', note: '書桌配置候選' }, { width: [80, 240], depth: [50, 90], height: [70, 80] }),
  chair: builtInTemplate({ key: 'chair', name: '標準工作椅', category: 'desk_table', marketplaceCategory: 'chair', width: 55, depth: 55, height: 85, colorHex: '#6B7280', wall: 'center', note: '桌椅類商城候選；尚未加入自動空模配置' }, { width: [45, 75], depth: [45, 75], height: [70, 130] }),
} satisfies Record<string, FurnitureTemplate>;

/** 商城／圖塊選品資料源；只代表可供挑選，不代表已通過案場配置複核。 */
export const FURNITURE_MARKETPLACE_CATALOG: readonly FurnitureTemplate[] = Object.values(COMMON);

const withTemplateWidth = (template: FurnitureTemplate, width: number): FurnitureTemplate => ({
  ...template,
  width,
  dimensions: { ...template.dimensions, width: { ...template.dimensions.width, value: width } },
});

export const FURNITURE_TEMPLATES: Record<RoomKind, FurnitureTemplate[]> = {
  living: [COMMON.sofa, COMMON.tv, COMMON.coffee, COMMON.shoe],
  master: [COMMON.queen, withTemplateWidth(COMMON.wardrobe, 240)],
  bedroom: [COMMON.single, COMMON.desk, withTemplateWidth(COMMON.wardrobe, 100)],
};

export const STYLE_RULES: Record<LayoutStyle, { edge: number; sizeFactor: number; label: string }> = {
  ergonomic: { edge: 15, sizeFactor: 1, label: '人因動線優先' },
  spacious: { edge: 20, sizeFactor: 0.9, label: '視野開闊' },
  storage_max: { edge: 10, sizeFactor: 1.12, label: '收納優先' },
};
