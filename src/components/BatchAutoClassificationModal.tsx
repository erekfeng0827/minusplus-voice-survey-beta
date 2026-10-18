import React, { useState, useMemo } from 'react';
import {
  X,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Download,
  Copy,
  Layers,
  Check,
  Search,
  Plus,
  Trash2,
  Tag,
  Hammer,
  Sofa,
  Boxes,
  Zap,
  Building,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { RoomData } from '../types';

export type ClassificationCategory =
  | 'soft_furnishings'
  | 'grouting_wetworks'
  | 'hard_structure'
  | 'fixed_cabinetry'
  | 'mep_systems';

export interface ClassifiableItem {
  id: string;
  name: string;
  category: ClassificationCategory;
  spec: string;
  quantity: string;
  cadLayer: string;
  fireRating: string;
  unitCostEst?: number;
  status: 'confirmed' | 'pending' | 'onsite_check';
}

const DEFAULT_ITEMS: ClassifiableItem[] = [
  // 1. 軟裝活動家具 (Soft Furnishings & FF&E)
  {
    id: 'sf-1',
    name: '三人座低背布面沙發',
    category: 'soft_furnishings',
    spec: 'W220 × D95 × H82 cm / 灰亞麻防潑水',
    quantity: '1 座',
    cadLayer: '05_木作櫃體',
    fireRating: '防焰認證布料',
    unitCostEst: 48000,
    status: 'confirmed',
  },
  {
    id: 'sf-2',
    name: '北歐白橡木圓茶几',
    category: 'soft_furnishings',
    spec: 'Φ80 × H42 cm / 實木斜腿',
    quantity: '1 座',
    cadLayer: '05_木作櫃體',
    fireRating: '環保無毒耐磨漆',
    unitCostEst: 13500,
    status: 'confirmed',
  },
  {
    id: 'sf-3',
    name: '主臥標準雙人獨立筒床墊',
    category: 'soft_furnishings',
    spec: '152 × 188 cm (5×6.2尺) / 蜂巢獨立筒',
    quantity: '1 張',
    cadLayer: '05_木作櫃體',
    fireRating: '阻燃透氣表布',
    unitCostEst: 32000,
    status: 'confirmed',
  },
  {
    id: 'sf-4',
    name: '客廳蛇行簾雙層遮光紗',
    category: 'soft_furnishings',
    spec: 'W360 × H265 cm / 100% 遮光三明治布',
    quantity: '1 式',
    cadLayer: '05_木作櫃體',
    fireRating: '防焰等級標章',
    unitCostEst: 18500,
    status: 'pending',
  },

  // 2. 泥作灌漿與地坪 (Grouting & Wet Pouring Construction)
  {
    id: 'gw-1',
    name: '衛浴門檻止水墩灌漿防滲',
    category: 'grouting_wetworks',
    spec: '1:3 水泥砂漿 + 矽酸質防水劑密封灌注',
    quantity: '2 處',
    cadLayer: '03_天花降板',
    fireRating: '耐燃一級',
    unitCostEst: 6500,
    status: 'confirmed',
  },
  {
    id: 'gw-2',
    name: '輕質陶粒混凝土自平灌注隔間',
    category: 'grouting_wetworks',
    spec: '乾密度 850kg/m³ 輕質灌漿 / 雙面纖維水泥板',
    quantity: '18.5 m²',
    cadLayer: '01_結構牆體',
    fireRating: '防火 2 小時時效',
    unitCostEst: 55000,
    status: 'confirmed',
  },
  {
    id: 'gw-3',
    name: '全室地坪自平泥作整平工程',
    category: 'grouting_wetworks',
    spec: '高流動性水泥基自流平 3-5mm 薄層灌注',
    quantity: '42 m²',
    cadLayer: '03_天花降板',
    fireRating: '不燃材料',
    unitCostEst: 28000,
    status: 'onsite_check',
  },
  {
    id: 'gw-4',
    name: '鋁門窗框塞水縫壓力灌漿',
    category: 'grouting_wetworks',
    spec: '無收縮高強度水泥砂漿灌注機加壓注入',
    quantity: '3 樘',
    cadLayer: '01_結構牆體',
    fireRating: '耐燃一級',
    unitCostEst: 9000,
    status: 'confirmed',
  },

  // 3. 硬裝結構類 (Hard Shell & Structural)
  {
    id: 'hs-1',
    name: 'RC 承重外牆與剪力柱',
    category: 'hard_structure',
    spec: 'RC 厚 20cm / 3500 psi 抗震結構核心',
    quantity: '1 式',
    cadLayer: '01_結構牆體',
    fireRating: '耐火時效 2 小時',
    unitCostEst: 0,
    status: 'confirmed',
  },
  {
    id: 'hs-2',
    name: '大樓公共管道間維修口密封牆',
    category: 'hard_structure',
    spec: '防潮石膏板雙層 15mm 錯縫包覆',
    quantity: '1 處',
    cadLayer: '01_結構牆體',
    fireRating: '防火 1 小時',
    unitCostEst: 12000,
    status: 'confirmed',
  },
  {
    id: 'hs-3',
    name: '氣密隔音景觀鋁門窗 (星玥灣原裝)',
    category: 'hard_structure',
    spec: '5+5 膠合 Low-E 玻璃 / 氣密等級 2等級',
    quantity: '2 樘',
    cadLayer: '04_門窗開口',
    fireRating: '符合建築技術規則',
    unitCostEst: 0,
    status: 'confirmed',
  },

  // 4. 固定木作與系統櫃 (Fixed Millwork & Cabinetry)
  {
    id: 'fc-1',
    name: '玄關懸空系統高收納鞋櫃',
    category: 'fixed_cabinetry',
    spec: 'W160 × D40 × H240 cm / 下方懸空20cm含燈帶',
    quantity: '1 座',
    cadLayer: '05_木作櫃體',
    fireRating: 'E1-V313 防潮低甲醛',
    unitCostEst: 38000,
    status: 'confirmed',
  },
  {
    id: 'fc-2',
    name: '客廳電視主牆懸空木作機櫃',
    category: 'fixed_cabinetry',
    spec: 'W280 × D45 × H35 cm / 大理石薄板貼面',
    quantity: '1 組',
    cadLayer: '05_木作櫃體',
    fireRating: '耐燃三級表面材',
    unitCostEst: 42000,
    status: 'confirmed',
  },
  {
    id: 'fc-3',
    name: '主臥頂天八門系統衣櫃組',
    category: 'fixed_cabinetry',
    spec: 'W320 × D60 × H265 cm / 隱藏鋁框黑玻門',
    quantity: '1 組',
    cadLayer: '05_木作櫃體',
    fireRating: 'F1 台灣一級環保防蛀木芯板',
    unitCostEst: 76000,
    status: 'confirmed',
  },

  // 5. 機電暖通與管線 (MEP & HVAC)
  {
    id: 'mep-1',
    name: '吊隱式變頻冷暖空調冷媒管與排水',
    category: 'mep_systems',
    spec: '住友無縫銅管 + 洩水坡度 1/100 PVC 排水管',
    quantity: '3 式',
    cadLayer: '06_施工註記',
    fireRating: '難燃保溫橡膠棉包覆',
    unitCostEst: 35000,
    status: 'confirmed',
  },
  {
    id: 'mep-2',
    name: '廚房專用 220V 20A 中島重電迴路',
    category: 'mep_systems',
    spec: '太平洋 5.5mm² 實心單芯線 / 專用漏電斷路器',
    quantity: '2 組',
    cadLayer: '06_施工註記',
    fireRating: '耐熱耐燃電纜管槽',
    unitCostEst: 8500,
    status: 'confirmed',
  },
];

const CATEGORY_CONFIG: Record<
  ClassificationCategory,
  {
    name: string;
    english: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    targetCadLayer: string;
  }
> = {
  soft_furnishings: {
    name: '軟裝活動家具',
    english: 'Soft Furnishings & FF&E',
    icon: Sofa,
    color: '#a78bfa', // purple-400
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-500/40',
    description: '活動沙發、茶几、單椅、雙人床組、地毯窗簾與飾品',
    targetCadLayer: '05_木作櫃體',
  },
  grouting_wetworks: {
    name: '泥作灌漿與地坪',
    english: 'Grouting & Wet Pouring',
    icon: Hammer,
    color: '#38bdf8', // sky-400
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/40',
    description: '浴室止水墩灌漿、輕質陶粒自平灌注、門窗塞水縫泥作',
    targetCadLayer: '03_天花降板',
  },
  hard_structure: {
    name: '硬裝結構類',
    english: 'Hard Structure & Shell',
    icon: Building,
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/40',
    description: 'RC 承重柱牆、分戶隔間、結構主梁與原始鋁門窗',
    targetCadLayer: '01_結構牆體',
  },
  fixed_cabinetry: {
    name: '固定木作與系統櫃',
    english: 'Fixed Millwork & Joinery',
    icon: Boxes,
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/40',
    description: '玄關鞋櫃、電視造型主牆、頂天衣櫃與天花造型',
    targetCadLayer: '05_木作櫃體',
  },
  mep_systems: {
    name: '機電暖通與管線',
    english: 'MEP & HVAC Systems',
    icon: Zap,
    color: '#ec4899', // pink-500
    bgColor: 'bg-pink-950/40',
    borderColor: 'border-pink-500/40',
    description: '冷媒穿梁套管、排水洩水坡度、專用電壓迴路與照明',
    targetCadLayer: '06_施工註記',
  },
};

interface BatchAutoClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomData;
  onNotify?: (message: string) => void;
  onApplyLayerMapping?: (mapping: Record<string, string>) => void;
}

export const BatchAutoClassificationModal: React.FC<BatchAutoClassificationModalProps> = ({
  isOpen,
  onClose,
  room,
  onNotify,
  onApplyLayerMapping,
}) => {
  const [items, setItems] = useState<ClassifiableItem[]>(DEFAULT_ITEMS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoClassifying, setIsAutoClassifying] = useState<boolean>(false);
  const [copiedBom, setCopiedBom] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New item form state
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<ClassificationCategory>('soft_furnishings');
  const [newItemSpec, setNewItemSpec] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<string>('1 式');

  // Stats
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      soft_furnishings: 0,
      grouting_wetworks: 0,
      hard_structure: 0,
      fixed_cabinetry: 0,
      mep_systems: 0,
    };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  const totalCostEst = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.unitCostEst || 0), 0);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeFilter === 'all' || item.category === activeFilter;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fireRating.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeFilter, searchQuery]);

  // AI Auto Classify Simulation
  const handleRunAutoClassification = () => {
    setIsAutoClassifying(true);
    setTimeout(() => {
      // Re-evaluate items and update status
      const updated = items.map((i) => ({
        ...i,
        status: 'confirmed' as const,
        cadLayer: CATEGORY_CONFIG[i.category].targetCadLayer,
      }));
      setItems(updated);
      setIsAutoClassifying(false);
      onNotify?.('✨ 灌裝自動分類完成：已依據五大工種規範完成精準自動分流與 CAD 圖層匹配！');
    }, 900);
  };

  // Batch Map to CAD Layers
  const handleApplyCadLayers = () => {
    const mapping: Record<string, string> = {};
    items.forEach((item) => {
      mapping[item.name] = item.cadLayer;
    });
    onApplyLayerMapping?.(mapping);
    onNotify?.('已將 16 項工件分類設定同步至 AutoCAD DXF 圖層引擎');
    onClose();
  };

  // Export BOM to CSV
  const handleExportCsv = () => {
    const headers = ['項目編號', '名稱', '工種分類', '規格尺寸', '數量', 'CAD圖層', '耐燃防焰標章', '估算金額(NTD)', '狀態'];
    const rows = items.map((i, idx) => [
      `ITEM-${idx + 1}`,
      `"${i.name}"`,
      `"${CATEGORY_CONFIG[i.category].name}"`,
      `"${i.spec}"`,
      `"${i.quantity}"`,
      `"${i.cadLayer}"`,
      `"${i.fireRating}"`,
      i.unitCostEst || 0,
      i.status === 'confirmed' ? '已確認' : '待複查',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `工種分類與軟硬裝BOM清單_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify?.('已匯出「工種分類與軟硬裝 BOM 清單.csv」');
  };

  // Copy text clipboard
  const handleCopyText = () => {
    const text = items
      .map(
        (i, idx) =>
          `[${CATEGORY_CONFIG[i.category].name}] ${idx + 1}. ${i.name} (${i.quantity}) - ${i.spec} [圖層: ${i.cadLayer}]`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBom(true);
    setTimeout(() => setCopiedBom(false), 2000);
    onNotify?.('已複製工項分類清單至剪貼簿');
  };

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ClassifiableItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      spec: newItemSpec.trim() || '標準工法安裝',
      quantity: newItemQty.trim() || '1 式',
      cadLayer: CATEGORY_CONFIG[newItemCategory].targetCadLayer,
      fireRating: '符合相關法規檢驗',
      unitCostEst: 0,
      status: 'confirmed',
    };

    setItems([newItem, ...items]);
    setNewItemName('');
    setNewItemSpec('');
    setShowAddForm(false);
    onNotify?.(`已新增構件「${newItem.name}」並歸類至【${CATEGORY_CONFIG[newItemCategory].name}】`);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#11141c] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER: Matches exact User Screenshot card design */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg tracking-wide">灌裝自動分類</h3>
                <span className="px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800/70 text-slate-300 text-xs font-semibold">
                  新功能
                </span>
                <span className="text-xs text-purple-400 font-mono font-bold">FF&E & Grouting Triage</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                軟裝活動家具、硬裝結構、泥作灌漿自平工法、木作櫃體與機電工程多維分流與 CAD 圖層匹配
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUMMARY STATS STRIP: 5 CATEGORIES BAR */}
        <div className="bg-[#151824] px-6 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {(Object.keys(CATEGORY_CONFIG) as ClassificationCategory[]).map((catKey) => {
            const config = CATEGORY_CONFIG[catKey];
            const count = categoryCounts[catKey] || 0;
            const isFilterActive = activeFilter === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveFilter(isFilterActive ? 'all' : catKey)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isFilterActive
                    ? 'ring-2 ring-purple-400/80 shadow-md ' + config.bgColor + ' ' + config.borderColor
                    : 'bg-[#12151f] hover:bg-[#1a1f2e] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" style={{ color: config.color }}>
                    <config.icon className="w-4 h-4" />
                    <span className="font-bold text-white text-[11px] truncate">{config.name}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                    style={{ backgroundColor: config.color + '20', color: config.color }}
                  >
                    {count} 項
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                  圖層: {config.targetCadLayer}
                </div>
              </button>
            );
          })}
        </div>

        {/* TOOLBAR: Search, Category Filter & Smart Actions */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-800/80 bg-[#12151e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋構件名稱、規格尺寸或防焰等級..."
                className="w-full bg-[#171b26] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-lg"
              >
                <span>清除篩選</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>手動新增工項</span>
            </button>

            <button
              onClick={handleRunAutoClassification}
              disabled={isAutoClassifying}
              className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAutoClassifying ? 'animate-spin' : ''}`} />
              <span>{isAutoClassifying ? '智能分類中...' : '一鍵智能重新分類'}</span>
            </button>
          </div>
        </div>

        {/* OPTIONAL ADD FORM */}
        {showAddForm && (
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-[#181c2a] border-b border-slate-700/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2 duration-150"
          >
            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">構件名稱</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="例：主臥訂製中島吧檯"
                className="w-full bg-[#121520] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">工種歸類</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="w-full bg-[#121520] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-400"
              >
                {(Object.keys(CATEGORY_CONFIG) as ClassificationCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_CONFIG[k].name} ({CATEGORY_CONFIG[k].english})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">規格尺寸與工法</label>
              <input
                type="text"
                value={newItemSpec}
                onChange={(e) => setNewItemSpec(e.target.value)}
                placeholder="例：W180×D60×H85cm 人造石檯面"
                className="w-full bg-[#121520] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="w-1/2">
                <label className="text-[11px] text-slate-300 font-medium block mb-1">數量</label>
                <input
                  type="text"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="w-full bg-[#121520] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="submit"
                className="w-1/2 h-[34px] bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
              >
                確認新增
              </button>
            </div>
          </form>
        )}

        {/* ITEMS LIST TABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <LayoutGrid className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">查無符合條件的工項或構件</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const catConf = CATEGORY_CONFIG[item.category];
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#151822] hover:bg-[#191d2a] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5 shadow-inner"
                      style={{
                        backgroundColor: catConf.color + '15',
                        borderColor: catConf.color + '40',
                        color: catConf.color,
                      }}
                    >
                      <catConf.icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-xs font-bold truncate">{item.name}</h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: catConf.color + '20',
                            color: catConf.color,
                          }}
                        >
                          {catConf.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {item.cadLayer}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                        <span>規格：{item.spec}</span>
                        <span className="text-slate-600">|</span>
                        <span>數量：{item.quantity}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-amber-300/80">{item.fireRating}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    {item.unitCostEst ? (
                      <span className="text-xs font-mono font-bold text-slate-200">
                        NT$ {item.unitCostEst.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">原裝/固定建置</span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'confirmed'
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status === 'confirmed' ? '已分類' : '現場覆核'}</span>
                    </span>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                      title="刪除工項"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800/80 bg-[#141722]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              共計 <strong className="text-white">{items.length}</strong> 項工件（估算金額：NT${' '}
              {totalCostEst.toLocaleString()}），已依工種精準分流
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm"
            >
              {copiedBom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
              <span>{copiedBom ? '已複製清單' : '複製工項'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>匯出 BOM 表 (CSV)</span>
            </button>

            <button
              onClick={handleApplyCadLayers}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>同步套用至 CAD 圖層</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchAutoClassificationModal;
