import { FurnitureItem } from '../types';

export type LayoutStyle = 'ergonomic' | 'spacious' | 'storage_max';
export type RoomKind = 'living' | 'master' | 'bedroom';

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
}

const COMMON = {
  sofa: { key: 'sofa', name: '三人座低背沙發', category: 'desk_table', width: 240, depth: 95, height: 85, colorHex: '#3F5B63', wall: 'bottom', note: '活動家具配置候選' },
  tv: { key: 'tv', name: '懸空電視收納櫃', category: 'cabinet', width: 280, depth: 40, height: 45, elevation: 20, colorHex: '#E0A83C', wall: 'top', note: '懸空低櫃配置候選' },
  coffee: { key: 'coffee', name: '薄型實木茶几', category: 'desk_table', width: 120, depth: 60, height: 40, colorHex: '#DDD7CE', wall: 'center', note: '中央茶几配置候選' },
  shoe: { key: 'shoe', name: '玄關鞋櫃與穿鞋椅', category: 'cabinet', width: 150, depth: 40, height: 220, colorHex: '#2C3E2B', wall: 'left', note: '高身收納配置候選' },
  queen: { key: 'queen', name: '標準雙人床', category: 'bed', width: 180, depth: 200, height: 95, colorHex: '#2C3E2B', wall: 'bottom', note: '雙人床配置候選' },
  single: { key: 'single', name: '單人加大床架', category: 'bed', width: 120, depth: 200, height: 90, colorHex: '#2C3E2B', wall: 'left', note: '單人床配置候選' },
  wardrobe: { key: 'wardrobe', name: '高身收納衣櫃', category: 'wardrobe', width: 180, depth: 60, height: 240, colorHex: '#3F5B63', wall: 'top', note: '衣櫃配置候選' },
  desk: { key: 'desk', name: '採光工作書桌', category: 'desk_table', width: 140, depth: 60, height: 75, colorHex: '#E0A83C', wall: 'bottom', note: '書桌配置候選' },
} satisfies Record<string, FurnitureTemplate>;

export const FURNITURE_TEMPLATES: Record<RoomKind, FurnitureTemplate[]> = {
  living: [COMMON.sofa, COMMON.tv, COMMON.coffee, COMMON.shoe],
  master: [COMMON.queen, { ...COMMON.wardrobe, width: 240 }],
  bedroom: [COMMON.single, COMMON.desk, { ...COMMON.wardrobe, width: 100 }],
};

export const STYLE_RULES: Record<LayoutStyle, { edge: number; sizeFactor: number; label: string }> = {
  ergonomic: { edge: 15, sizeFactor: 1, label: '人因動線優先' },
  spacious: { edge: 20, sizeFactor: 0.9, label: '視野開闊' },
  storage_max: { edge: 10, sizeFactor: 1.12, label: '收納優先' },
};
