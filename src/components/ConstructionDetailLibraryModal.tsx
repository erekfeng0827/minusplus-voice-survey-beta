import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Maximize2,
  ChevronRight,
  FolderDown,
  Info,
} from 'lucide-react';
import {
  CONSTRUCTION_DETAILS_DATABASE,
  ConstructionDetailItem,
} from '../data/constructionDetailsDatabase';
import { RoomData, VirtualAnnotationPoint, ElectricalPoint } from '../types';

interface ConstructionDetailLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom: (updatedRoom: RoomData) => void;
  onNotify: (msg: string) => void;
  initialCategory?: string;
}

export const ConstructionDetailLibraryModal: React.FC<ConstructionDetailLibraryModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>(CONSTRUCTION_DETAILS_DATABASE[0].id);

  // Filter items
  const filteredItems = useMemo(() => {
    return CONSTRUCTION_DETAILS_DATABASE.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCategory;
      const matchText =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.standardDimension.toLowerCase().includes(q) ||
        item.criticalGotchas.some((g) => g.toLowerCase().includes(q)) ||
        item.keySpecs.some((s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q));
      return matchCategory && matchText;
    });
  }, [selectedCategory, searchQuery]);

  const activeItem = useMemo(() => {
    return (
      filteredItems.find((i) => i.id === selectedItemId) ||
      filteredItems[0] ||
      CONSTRUCTION_DETAILS_DATABASE[0]
    );
  }, [filteredItems, selectedItemId]);

  if (!isOpen) return null;

  const handleCopySpecs = (item: ConstructionDetailItem) => {
    const text = `【${item.name} (${item.code})】\n標準尺寸：${item.standardDimension}\n容許公差：${item.toleranceRange}\nCAD 圖層：${item.cadLayer}\n重點規格：\n${item.keySpecs
      .map((s) => `• ${s.label}: ${s.value}`)
      .join('\n')}\n施工特別注意事項：\n${item.criticalGotchas
      .map((g) => `⚠️ ${g}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    onNotify(`✓ 已複製「${item.name}」標準施工規範參數至剪貼簿！`);
  };

  const handleApplyToRoom = (item: ConstructionDetailItem) => {
    if (!item.recommendedActions) {
      onNotify(`「${item.name}」已載入規範`);
      return;
    }

    const { applyType, params } = item.recommendedActions;

    if (applyType === 'apply_height' && params) {
      const updated = {
        ...room,
        ceilingDrop: params.ceilingDrop ?? room.ceilingDrop,
        beamHeight: params.beamHeight ?? room.beamHeight,
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onUpdateRoom(updated);
      onNotify(`✓ 已成功將「${item.name}」降板高程 (${item.standardDimension}) 套用至空間！`);
    } else if (applyType === 'add_annotation' && params) {
      const newAnnotation: VirtualAnnotationPoint = {
        id: `va-${Date.now()}`,
        label: params.label || item.name,
        dimensionType: 'elevation',
        dimensionValue: params.elevation ?? 230,
        unit: 'cm',
        x: Math.round(room.width * 0.5),
        y: Math.round(room.length * 0.35),
        elevation: params.elevation ?? 230,
        referenceWall: 'top',
        targetEntity: item.name,
        description: item.description,
        extractedFromText: item.standardDimension,
        confidence: 0.99,
        rule5MultipleCompliant: true,
        isVirtualAiGenerated: false,
      };

      const existing = room.virtualAnnotations || [];
      const updated = {
        ...room,
        virtualAnnotations: [...existing, newAnnotation],
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onUpdateRoom(updated);
      onNotify(`✓ 已在「${room.roomName}」中心放樣區新增大樣標註點！`);
    } else if (applyType === 'add_mep' && params) {
      const newSwitch: ElectricalPoint = {
        id: `ep-sw-${Date.now()}`,
        type: 'switch',
        name: '門口開關 (公規FL+120)',
        x: 30,
        y: Math.min(room.length - 40, 300),
        elevation: 120,
        circuit: 'L-STD',
      };
      const newSocket: ElectricalPoint = {
        id: `ep-so-${Date.now()}`,
        type: 'socket_110v',
        name: '一般插座 (公規FL+30)',
        x: 60,
        y: Math.min(room.length - 40, 300),
        elevation: 30,
        circuit: 'P-STD',
      };

      const updated = {
        ...room,
        electricalPoints: [...room.electricalPoints, newSwitch, newSocket],
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onUpdateRoom(updated);
      onNotify(`✓ 已成功將公規開關 (FL+120cm) 與插座 (FL+30cm) 點位配置至圖面！`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#121722] border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/80 bg-[#161d2b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  施工大樣與公規尺寸智庫
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  室內設計工程標準 v003
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                收錄天花吊頂、空調降板、人體工學櫥櫃、水電標高與結構禁忌之公規尺寸與避坑注意事項
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-[#141a26] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {[
              { key: 'all', label: '全部大樣 (8)' },
              { key: 'ceiling', label: '天花吊頂 (3)' },
              { key: 'cabinet', label: '櫥櫃人體工學 (4)' },
              { key: 'mep', label: '水電弱電 (1)' },
              { key: 'door_window', label: '門窗開口 (1)' },
              { key: 'gotchas', label: '結構避坑 (1)' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === tab.key
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋大樣名稱、尺寸、空調、插座..."
              className="w-full bg-[#0d121c] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: List of Items (md:col-span-5) */}
          <div className="md:col-span-5 border-r border-slate-800/80 overflow-y-auto p-3 space-y-2 bg-[#0d121c]">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                沒有符合關鍵字的大樣資料
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === activeItem.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? 'bg-[#1a2333] border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-[#131824] border-slate-800 hover:border-slate-700 hover:bg-[#161d2b]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                        {item.code}
                      </span>
                      <span className="text-[11px] text-amber-400 font-medium">
                        {item.categoryLabel}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mb-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      <span>{item.standardDimension}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Inspector & Visual Diagram (md:col-span-7) */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-6 bg-[#131824] flex flex-col gap-4">
            {activeItem && (
              <>
                {/* Title & Quick Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded">
                        {activeItem.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {activeItem.name}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>CAD 圖層：<code className="text-amber-300">{activeItem.cadLayer}</code></span>
                      <span>·</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 5倍數合規
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySpecs(activeItem)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                      title="複製 CAD 規範文字"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製參數</span>
                    </button>

                    {activeItem.recommendedActions && (
                      <button
                        onClick={() => handleApplyToRoom(activeItem)}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                        <span>套用至當前空間</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 1: Standard Dimension Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#182130] p-3 rounded-xl border border-slate-700/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                      標準公規尺寸基準
                    </div>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-1">
                      {activeItem.standardDimension}
                    </div>
                  </div>
                  <div className="bg-[#182130] p-3 rounded-xl border border-slate-700/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      現場容許公差與設計要求
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-1">
                      {activeItem.toleranceRange}
                    </div>
                  </div>
                </div>

                {/* Section 2: SVG Cross-section Diagram */}
                <div className="bg-[#0b1019] rounded-xl border border-slate-800 p-4 relative overflow-hidden">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                    <span>標準工程剖面示意 (Cross Section Diagram)</span>
                    <span className="text-[10px] font-mono text-cyan-400">SCALE 1:20 / CAD READY</span>
                  </div>

                  {/* SVG Renderers based on diagram type */}
                  <div className="h-44 w-full flex items-center justify-center bg-[#070b13] rounded-lg border border-slate-800/80 relative">
                    {activeItem.svgDiagramType === 'ceiling_drop' && (
                      <svg viewBox="0 0 400 160" className="w-full h-full max-h-40">
                        {/* Slab Top */}
                        <rect x="20" y="10" width="360" height="15" fill="#334155" />
                        <text x="30" y="22" fill="#94a3b8" fontSize="9">結構樓板 (FL+280 cm)</text>
                        {/* Concrete Beam */}
                        <rect x="180" y="25" width="70" height="35" fill="#475569" stroke="#64748b" />
                        <text x="185" y="47" fill="#cbd5e1" fontSize="9" fontWeight="bold">大樑 265</text>
                        {/* Ceiling Drop Area (Left) */}
                        <rect x="20" y="70" width="220" height="6" fill="#0284c7" />
                        <text x="30" y="65" fill="#38bdf8" fontSize="10" fontWeight="bold">空調降板天花 (FL+230 cm)</text>
                        {/* AC Unit & Vent box */}
                        <rect x="60" y="32" width="100" height="32" fill="#1e293b" stroke="#0ea5e9" strokeDasharray="3 3" />
                        <text x="75" y="52" fill="#38bdf8" fontSize="9">吊隱式室內機 (30cm)</text>
                        {/* Inspection Hatch */}
                        <rect x="70" y="70" width="60" height="4" fill="#f59e0b" />
                        <text x="72" y="85" fill="#fbbf24" fontSize="8">檢修孔 400×600</text>
                        {/* Living Room High Ceiling (Right) */}
                        <rect x="240" y="40" width="140" height="6" fill="#10b981" />
                        <text x="260" y="35" fill="#34d399" fontSize="10" fontWeight="bold">客廳原高天花 (FL+270 cm)</text>
                        {/* Vertical step board */}
                        <line x1="240" y1="40" x2="240" y2="70" stroke="#f43f5e" strokeWidth="2" />
                        <text x="245" y="58" fill="#fb7185" fontSize="9">高低差 40cm</text>
                      </svg>
                    )}

                    {activeItem.svgDiagramType === 'cove_lighting' && (
                      <svg viewBox="0 0 400 160" className="w-full h-full max-h-40">
                        {/* Ceiling */}
                        <rect x="20" y="20" width="360" height="10" fill="#334155" />
                        {/* Main ceiling */}
                        <rect x="20" y="70" width="240" height="8" fill="#0284c7" />
                        {/* Baffle (擋光板) */}
                        <rect x="252" y="55" width="8" height="25" fill="#0284c7" />
                        {/* LED Strip */}
                        <circle cx="240" cy="65" r="4" fill="#fbbf24" />
                        <path d="M 240 65 L 360 25 L 360 50 Z" fill="url(#yellowGlow)" opacity="0.3" />
                        {/* Dimension arrows */}
                        <line x1="240" y1="88" x2="260" y2="88" stroke="#38bdf8" strokeWidth="1" />
                        <text x="210" y="105" fill="#38bdf8" fontSize="9">開口寬 150mm</text>
                        <text x="265" y="68" fill="#fbbf24" fontSize="9">擋光立板高 80mm</text>
                      </svg>
                    )}

                    {activeItem.svgDiagramType === 'shoe_cabinet' && (
                      <svg viewBox="0 0 400 160" className="w-full h-full max-h-40">
                        {/* Floor */}
                        <line x1="20" y1="140" x2="380" y2="140" stroke="#64748b" strokeWidth="2" />
                        <text x="20" y="152" fill="#94a3b8" fontSize="9">完成面 FL+0</text>
                        {/* Wall */}
                        <line x1="120" y1="10" x2="120" y2="140" stroke="#64748b" strokeWidth="4" />
                        {/* Cabinet Body */}
                        <rect x="122" y="20" width="120" height="100" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                        {/* Floating Gap */}
                        <rect x="122" y="120" width="120" height="20" fill="none" stroke="#f59e0b" strokeDasharray="3 2" />
                        <text x="250" y="132" fill="#fbbf24" fontSize="9">懸空 FL+18~20cm (夜燈/掃地機)</text>
                        {/* Countertop */}
                        <line x1="122" y1="75" x2="242" y2="75" stroke="#10b981" strokeWidth="2" />
                        <text x="250" y="78" fill="#34d399" fontSize="9">中段置物檯面 FL+80cm</text>
                        {/* Dimensions */}
                        <text x="145" y="15" fill="#38bdf8" fontSize="9">進深 380mm</text>
                      </svg>
                    )}

                    {activeItem.svgDiagramType === 'mep_elevation' && (
                      <svg viewBox="0 0 400 160" className="w-full h-full max-h-40">
                        {/* Floor */}
                        <line x1="20" y1="140" x2="380" y2="140" stroke="#64748b" strokeWidth="2" />
                        <text x="20" y="152" fill="#94a3b8" fontSize="9">完成地坪 (FL+0)</text>
                        {/* Wall */}
                        <rect x="80" y="20" width="240" height="120" fill="#111827" stroke="#374151" />
                        {/* Socket 30 */}
                        <rect x="110" y="125" width="12" height="12" fill="#0284c7" />
                        <line x1="75" y1="131" x2="105" y2="131" stroke="#38bdf8" strokeDasharray="2 2" />
                        <text x="30" y="134" fill="#38bdf8" fontSize="9">插座 FL+30</text>
                        {/* Switch 120 */}
                        <rect x="160" y="75" width="12" height="12" fill="#10b981" />
                        <line x1="75" y1="81" x2="155" y2="81" stroke="#34d399" strokeDasharray="2 2" />
                        <text x="25" y="84" fill="#34d399" fontSize="9">開關 FL+120</text>
                        {/* Counter Socket 105 */}
                        <rect x="220" y="85" width="12" height="12" fill="#f59e0b" />
                        <text x="240" y="94" fill="#fbbf24" fontSize="9">檯面插座 FL+105</text>
                        {/* AC Socket 220 */}
                        <rect x="270" y="35" width="12" height="12" fill="#ec4899" />
                        <text x="220" y="30" fill="#f472b6" fontSize="9">冷氣出線 FL+220</text>
                      </svg>
                    )}

                    {['curtain_box', 'kitchen_counter', 'tv_cabinet', 'wardrobe', 'door_opening', 'pipe_beam_penetration'].includes(
                      activeItem.svgDiagramType
                    ) && (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Layers className="w-10 h-10 text-cyan-400 mb-2 opacity-80" />
                        <div className="text-xs font-mono text-cyan-300 font-bold">
                          {activeItem.code} · {activeItem.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 max-w-sm">
                          標準公規數值：<span className="text-emerald-400 font-bold">{activeItem.standardDimension}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Critical Gotchas (施工特別注意事項) */}
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>現場施工與驗收「特別注意事項 (Gotchas)」：</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {activeItem.criticalGotchas.map((gotcha, idx) => (
                      <li key={idx} className="text-xs text-rose-200/90 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{gotcha}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 4: Key Specs Table */}
                <div className="bg-[#161d2b] rounded-xl border border-slate-800 p-3.5">
                  <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>公規數據細部規格清單</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeItem.keySpecs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-[#0f141f] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <span className="text-slate-400 text-[11px]">{spec.label}</span>
                        <span className="font-mono font-bold text-slate-200 text-[11px]">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
