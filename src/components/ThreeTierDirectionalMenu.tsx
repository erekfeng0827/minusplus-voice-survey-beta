import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Trash2,
  Layers,
  Ruler,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Box,
  Eye,
  Camera,
  Download,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Pin,
  X,
  Maximize2,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { RoomData } from '../types';

interface ThreeTierDirectionalMenuProps {
  room: RoomData;
  rooms: RoomData[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddNewRoom: () => void;
  onUpdateRoom: (updatedRoom: RoomData) => void;
  onNotify: (msg: string) => void;

  // Undo / Redo & Clear All
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAllCanvas: () => void;
  historyCount?: number;
  historyIndex?: number;

  // View Switching
  activeMainTab: '2d_staking' | '3d_simulation' | 'blueprints' | 'audit_dashboard';
  setActiveMainTab: (tab: '2d_staking' | '3d_simulation' | 'blueprints' | 'audit_dashboard') => void;

  // Modals triggers
  onOpenConstructionLibrary: () => void;
  onOpenDrawingHabits: () => void;
  onOpenElevationBenchmark: () => void;
  onOpenAuditDistribution: () => void;
  onOpenPanoramicGuide: () => void;
  onOpenSketchUp: () => void;
  onOpenComplianceReport: () => void;
  onOpen3DExplanation: () => void;
  onOpenDxfSettings: () => void;
  onExportDxf: () => void;

  // Optional layer filters
  visibleLayers?: {
    wall: boolean;
    beam: boolean;
    mep: boolean;
    voice: boolean;
    annotations: boolean;
  };
  onToggleLayer?: (layerKey: 'wall' | 'beam' | 'mep' | 'voice' | 'annotations') => void;
}

export const ThreeTierDirectionalMenu: React.FC<ThreeTierDirectionalMenuProps> = ({
  room,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onAddNewRoom,
  onUpdateRoom,
  onNotify,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAllCanvas,
  historyCount = 1,
  historyIndex = 0,
  activeMainTab,
  setActiveMainTab,
  onOpenConstructionLibrary,
  onOpenDrawingHabits,
  onOpenElevationBenchmark,
  onOpenAuditDistribution,
  onOpenPanoramicGuide,
  onOpenSketchUp,
  onOpenComplianceReport,
  onOpen3DExplanation,
  onOpenDxfSettings,
  onExportDxf,
  visibleLayers = { wall: true, beam: true, mep: true, voice: true, annotations: true },
  onToggleLayer,
}) => {
  // Fold/Expand state for each direction
  const [isTopOpen, setIsTopOpen] = useState<boolean>(false);
  const [isBottomOpen, setIsBottomOpen] = useState<boolean>(true); // default open for Undo/Redo & View
  const [isLeftOpen, setIsLeftOpen] = useState<boolean>(false);
  const [isRightOpen, setIsRightOpen] = useState<boolean>(false);

  // Pin state
  const [pinnedBottom, setPinnedBottom] = useState<boolean>(false);

  // Active Tiers selections for TOP
  const [topTier1, setTopTier1] = useState<'staking' | 'audit' | 'library'>('staking');
  const [topTier2, setTopTier2] = useState<string>('sub_standard');

  // Active Tiers selections for BOTTOM
  const [bottomTier1, setBottomTier1] = useState<'actions' | 'views' | 'survey'>('actions');
  const [bottomTier2, setBottomTier2] = useState<string>('undo_clear');

  // Active Tiers selections for LEFT
  const [leftTier1, setLeftTier1] = useState<'rooms' | 'layers' | 'history'>('rooms');
  const [leftTier2, setLeftTier2] = useState<string>('room_list');

  // Active Tiers selections for RIGHT
  const [rightTier1, setRightTier1] = useState<'elevations' | 'dimensions' | 'export'>('elevations');
  const [rightTier2, setRightTier2] = useState<string>('5x_heights');

  const collapseAll = () => {
    setIsTopOpen(false);
    if (!pinnedBottom) setIsBottomOpen(false);
    setIsLeftOpen(false);
    setIsRightOpen(false);
    onNotify('已收合四向選單，進入純淨全景視野！點擊邊緣即可重新展開');
  };

  // Adjust room heights with 5-multiples rule
  const handleAdjustHeight = (key: 'beamHeight' | 'ceilingDrop' | 'bathKitchenDrop', delta: number) => {
    const currentVal = room[key] ?? 230;
    const newVal = Math.max(150, Math.min(320, currentVal + delta));
    const snapped = Math.round(newVal / 5) * 5;
    const updated = {
      ...room,
      [key]: snapped,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateRoom(updated);
    onNotify(`✓ 已調整 ${key === 'beamHeight' ? '大梁淨高' : key === 'ceilingDrop' ? '空調降板' : '衛廚降板'} 為 ${snapped} cm (符合5倍數)`);
  };

  return (
    <>
      {/* ========================================================
          1. TOP 3-TIER MENU (頂部展開選單)
         ======================================================== */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
        {/* Top Handle Pill (When Collapsed or Expanded) */}
        <div className="pointer-events-auto mt-1 transition-all">
          <button
            onClick={() => setIsTopOpen(!isTopOpen)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl transition-all border ${
              isTopOpen
                ? 'bg-[#182236] text-cyan-300 border-cyan-500/60 ring-2 ring-cyan-500/20'
                : 'bg-[#121724]/90 hover:bg-[#1c263b] text-slate-300 border-slate-700/80 hover:border-cyan-400/60'
            }`}
            title="點選展開/收合頂部三層式工程選單"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>▲ 頂部三層選單：工程放樣 · 契約審計 · 公規大樣庫</span>
            {isTopOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Top 3-Tier Expandable Panel */}
        {isTopOpen && (
          <div className="pointer-events-auto w-[96vw] max-w-6xl mt-2 bg-[#101522]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-200">
            {/* Tier 1 Header: Main Categories */}
            <div className="bg-[#151c2e] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  TIER 1
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'staking', label: '1. 工程放樣規範', icon: Ruler },
                    { id: 'audit', label: '2. 幾何契約審計', icon: ShieldCheck },
                    { id: 'library', label: '3. 施工大樣與公規', icon: BookOpen },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isActive = topTier1 === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setTopTier1(cat.id as any);
                          setTopTier2(cat.id === 'staking' ? 'sub_standard' : cat.id === 'audit' ? 'sub_contracts' : 'sub_ceiling');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={collapseAll}
                  className="text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700"
                >
                  一鍵全收合
                </button>
                <button
                  onClick={() => setIsTopOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tier 2 & Tier 3 Content Row */}
            <div className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#0d121c]">
              {/* Tier 2: Sub-categories (col-span-4) */}
              <div className="md:col-span-4 border-r border-slate-800/80 pr-3 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                  <span className="text-cyan-400">TIER 2</span>
                  <span>次級分類導覽</span>
                </div>

                {topTier1 === 'staking' && (
                  <>
                    <button
                      onClick={() => setTopTier2('sub_standard')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_standard' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>📐 標準 5 倍數放樣</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => setTopTier2('sub_habits')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_habits' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>💾 繪製保存習慣 (落盤)</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </>
                )}

                {topTier1 === 'audit' && (
                  <>
                    <button
                      onClick={() => setTopTier2('sub_contracts')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_contracts' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>🛡️ 合規稽核與V規條件</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => setTopTier2('sub_elevation_bench')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_elevation_bench' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>📏 立面基準基準 (80cm線)</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => setTopTier2('sub_audit_dist')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_audit_dist' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>📊 審計分佈圖與工單分診</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </>
                )}

                {topTier1 === 'library' && (
                  <>
                    <button
                      onClick={() => setTopTier2('sub_ceiling')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_ceiling' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>☁️ 天花降板與窗簾盒</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => setTopTier2('sub_cabinets')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_cabinets' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>🗄️ 櫥櫃人體工學 (鞋櫃/廚房)</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => setTopTier2('sub_mep_specs')}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                        topTier2 === 'sub_mep_specs' ? 'bg-[#1a2335] text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>⚡ 水電開關插座標高</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </>
                )}
              </div>

              {/* Tier 3: Concrete Action & Parameter Controls (col-span-8) */}
              <div className="md:col-span-8 pl-1 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                  <span className="text-emerald-400">TIER 3</span>
                  <span>具體執行動作與即時參數</span>
                </div>

                <div className="space-y-2.5">
                  {topTier2 === 'sub_standard' && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">5 倍數幾何核心契約：</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          大梁 265cm · 空調降板 230cm · 衛廚降板 215cm · 樓板 280cm
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onUpdateRoom({ ...room, beamHeight: 265, ceilingDrop: 230 });
                            onNotify('✓ 已一鍵校正當前空間為 265/230 標準契約！');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          一鍵強制5倍數對齊
                        </button>
                      </div>
                    </div>
                  )}

                  {topTier2 === 'sub_habits' && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        設定自動落盤週期、CAD 出圖線寬規範與個人繪圖偏好
                      </div>
                      <button
                        onClick={onOpenDrawingHabits}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>開啟保存習慣設定</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {topTier2 === 'sub_elevation_bench' && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        FL+80cm 核心檯面基準線、A/B/C/D 四面牆立面直切與冷氣穿梁避讓
                      </div>
                      <button
                        onClick={onOpenElevationBenchmark}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>開啟立面基準視窗</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {topTier2 === 'sub_audit_dist' && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        19張滯留單時長直方圖、A/B/C 工單分診堆疊與一鍵排廢
                      </div>
                      <button
                        onClick={onOpenAuditDistribution}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>開啟審計分佈儀表</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {topTier2 === 'sub_contracts' && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        V-01~10 驗收條件檢查與防呆覆核報表
                      </div>
                      <button
                        onClick={onOpenComplianceReport}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>產生合規稽核分析</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {['sub_ceiling', 'sub_cabinets', 'sub_mep_specs'].includes(topTier2) && (
                    <div className="bg-[#141b2a] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-300">
                        查閱詳細大樣圖解、人體工學尺寸與現場施工避坑注意事項
                      </div>
                      <button
                        onClick={onOpenConstructionLibrary}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>開啟施工大樣公規智庫</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          2. BOTTOM 3-TIER MENU (底部一鍵操作、復原/重做與視圖)
         ======================================================== */}
      <div className="fixed bottom-2 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
        {/* Bottom 3-Tier Expandable Panel */}
        {isBottomOpen && (
          <div className="pointer-events-auto w-[96vw] max-w-5xl mb-2 bg-[#101624]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-200">
            {/* Tier 1 Header */}
            <div className="bg-[#151d2f] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  TIER 1 操作主軸
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBottomTier1('actions');
                      setBottomTier2('undo_clear');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      bottomTier1 === 'actions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>一鍵操作 (復原/清空)</span>
                  </button>

                  <button
                    onClick={() => {
                      setBottomTier1('views');
                      setBottomTier2('view_switch');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      bottomTier1 === 'views' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>視圖與 3D 模擬</span>
                  </button>

                  <button
                    onClick={() => {
                      setBottomTier1('survey');
                      setBottomTier2('survey_tools');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      bottomTier1 === 'survey' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>現場攝影導航</span>
                  </button>
                </div>
              </div>

              {/* Pin & Collapse buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPinnedBottom(!pinnedBottom)}
                  className={`p-1 rounded-md text-xs transition ${
                    pinnedBottom ? 'text-amber-400 bg-amber-950/60' : 'text-slate-400 hover:text-white'
                  }`}
                  title={pinnedBottom ? '解除常駐' : '常駐固定底部工具列'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsBottomOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  title="收合底部面板"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tier 2 & Tier 3: Controls Area */}
            <div className="p-3 bg-[#0d121c] flex flex-wrap items-center justify-between gap-3">
              {bottomTier1 === 'actions' && (
                <div className="flex flex-wrap items-center justify-between w-full gap-3">
                  {/* Left: Undo, Redo, Clear All Buttons */}
                  <div className="flex items-center gap-2">
                    {/* 一鍵復原 (Undo / 上一步) */}
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                        canUndo
                          ? 'bg-[#1b263b] hover:bg-[#253552] text-white border border-cyan-500/50 hover:border-cyan-400 active:scale-95'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                      title="上一步 / 一鍵復原 (Ctrl+Z)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>上一步 (復原)</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                        {historyIndex + 1}/{historyCount}
                      </span>
                    </button>

                    {/* 一鍵重做 (Redo / 下一步) */}
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                        canRedo
                          ? 'bg-[#1b263b] hover:bg-[#253552] text-white border border-cyan-500/50 hover:border-cyan-400 active:scale-95'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                      title="下一步 / 一鍵重做 (Ctrl+Y)"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>下一步 (重做)</span>
                    </button>

                    {/* 一鍵刪除 / 清除所有圖面 (Clear All) */}
                    <button
                      onClick={onClearAllCanvas}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-600/50 transition shadow-sm active:scale-95"
                      title="一鍵清除所有圖面 (若誤按可按「上一步」復原)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>一鍵清空圖面</span>
                    </button>
                  </div>

                  {/* Right: Quick shortcut tips */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="hidden sm:inline">快捷鍵：<kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl+Z</kbd> 復原 · <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl+Y</kbd> 重做</span>
                    <span className="text-emerald-400 font-medium">✓ 放樣圖元自動安全保存</span>
                  </div>
                </div>
              )}

              {bottomTier1 === 'views' && (
                <div className="flex flex-wrap items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    {[
                      { id: '2d_staking', label: '2D 放樣互動', icon: Ruler },
                      { id: '3d_simulation', label: '3D 實時幾何 (PBR)', icon: Box },
                      { id: 'blueprints', label: '施工圖圖冊 (PDF)', icon: FileText },
                      { id: 'audit_dashboard', label: '審計管線儀表', icon: ShieldCheck },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeMainTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveMainTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-[#151c2b] text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3D 渲染說明按鈕 */}
                  <button
                    onClick={onOpen3DExplanation}
                    className="px-3 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>3D 渲染技術剖析</span>
                  </button>
                </div>
              )}

              {bottomTier1 === 'survey' && (
                <div className="flex flex-wrap items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenPanoramicGuide}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>360° 攝影視覺指引 (電子水平儀)</span>
                    </button>
                    <button
                      onClick={onOpenSketchUp}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>SketchUp 自動轉檔</span>
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">現場 0.5x 超廣角定錨與模型導出</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Toggle Pill */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsBottomOpen(!isBottomOpen)}
            className="px-4 py-1 rounded-full bg-[#141b2a]/95 hover:bg-[#1f2a40] text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 shadow-xl transition active:scale-95"
          >
            <span>▼ 底部操作：一鍵清空 · 復原上一步 · 視圖切換</span>
            {isBottomOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          3. LEFT 3-TIER MENU (左側展開：戶型空間 · 圖層 · 歷史)
         ======================================================== */}
      <div className="fixed left-2 top-24 bottom-20 z-30 pointer-events-none flex items-center">
        {/* Left Toggle Handle */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsLeftOpen(!isLeftOpen)}
            className={`py-3 px-1 rounded-r-xl border border-l-0 text-xs font-bold transition-all shadow-xl flex flex-col items-center gap-1.5 ${
              isLeftOpen
                ? 'bg-cyan-900/90 text-cyan-200 border-cyan-500/60'
                : 'bg-[#131926]/90 hover:bg-[#1a2336] text-slate-300 border-slate-700/80 hover:border-cyan-400/60'
            }`}
            title="點選展開/收合左側空間與圖層抽屜"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="[writing-mode:vertical-lr] tracking-widest text-[11px]">
              {isLeftOpen ? '收合空間' : '空間與圖層'}
            </span>
            {isLeftOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {/* Left Expandable Drawer */}
        {isLeftOpen && (
          <div className="pointer-events-auto ml-1 w-72 h-[75vh] bg-[#111726]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Drawer Header */}
            <div className="bg-[#161f33] px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  LEFT
                </span>
                <span className="text-xs font-bold text-white">空間與圖層管理</span>
              </div>
              <button
                onClick={() => setIsLeftOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tier 1 Tabs */}
            <div className="flex border-b border-slate-800 bg-[#0e1320] text-xs">
              <button
                onClick={() => setLeftTier1('rooms')}
                className={`flex-1 py-2 font-medium text-center transition ${
                  leftTier1 === 'rooms' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-slate-800/40' : 'text-slate-400'
                }`}
              >
                空間戶型 ({rooms.length})
              </button>
              <button
                onClick={() => setLeftTier1('layers')}
                className={`flex-1 py-2 font-medium text-center transition ${
                  leftTier1 === 'layers' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-slate-800/40' : 'text-slate-400'
                }`}
              >
                CAD 圖層
              </button>
            </div>

            {/* Tier 2 & Tier 3 Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {leftTier1 === 'rooms' && (
                <>
                  <div className="space-y-1.5">
                    {rooms.map((r) => {
                      const isSel = r.id === selectedRoomId;
                      return (
                        <div
                          key={r.id}
                          onClick={() => onSelectRoom(r.id)}
                          className={`p-2.5 rounded-xl cursor-pointer border text-xs transition ${
                            isSel
                              ? 'bg-cyan-950/60 border-cyan-500/70 text-white font-bold'
                              : 'bg-[#151c2a] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{r.roomName}</span>
                            <span className="text-[10px] font-mono text-emerald-400">
                              {r.width}×{r.length}cm
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>梁底 {r.beamHeight}cm · 降板 {r.ceilingDrop}cm</span>
                            <span className="text-cyan-400">✓5x</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={onAddNewRoom}
                    className="w-full mt-3 py-2 rounded-xl bg-[#172133] hover:bg-[#202d45] text-cyan-300 border border-dashed border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增空間放樣</span>
                  </button>
                </>
              )}

              {leftTier1 === 'layers' && (
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] text-slate-400 mb-1">勾選控制 2D 圖面圖層顯示狀態：</div>
                  {[
                    { key: 'wall', label: 'WALL 空間邊界牆體', color: 'text-slate-200' },
                    { key: 'beam', label: 'BEAM 結構橫大樑', color: 'text-amber-300' },
                    { key: 'mep', label: 'MEP 水電弱電開關插座', color: 'text-cyan-300' },
                    { key: 'voice', label: 'VOICE 現場口述標註', color: 'text-purple-300' },
                    { key: 'annotations', label: 'DIM 5倍數虛擬尺寸線', color: 'text-emerald-300' },
                  ].map((layer) => {
                    const isVisible = (visibleLayers as any)[layer.key] !== false;
                    return (
                      <div
                        key={layer.key}
                        onClick={() => onToggleLayer && onToggleLayer(layer.key as any)}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#141a27] border border-slate-800 cursor-pointer hover:bg-slate-800"
                      >
                        <span className={`font-mono text-xs ${layer.color}`}>{layer.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isVisible ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isVisible ? '顯示' : '隱藏'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. RIGHT 3-TIER MENU (右側展開：高程速調 · 公規速查 · 導出)
         ======================================================== */}
      <div className="fixed right-2 top-24 bottom-20 z-30 pointer-events-none flex items-center">
        {/* Right Expandable Drawer */}
        {isRightOpen && (
          <div className="pointer-events-auto mr-1 w-76 h-[75vh] bg-[#111726]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Drawer Header */}
            <div className="bg-[#161f33] px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                  RIGHT
                </span>
                <span className="text-xs font-bold text-white">高程契約速調與出圖</span>
              </div>
              <button
                onClick={() => setIsRightOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tier 1 Tabs */}
            <div className="flex border-b border-slate-800 bg-[#0e1320] text-xs">
              <button
                onClick={() => setRightTier1('elevations')}
                className={`flex-1 py-2 font-medium text-center transition ${
                  rightTier1 === 'elevations' ? 'text-amber-300 border-b-2 border-amber-400 bg-slate-800/40' : 'text-slate-400'
                }`}
              >
                5倍數高程
              </button>
              <button
                onClick={() => setRightTier1('dimensions')}
                className={`flex-1 py-2 font-medium text-center transition ${
                  rightTier1 === 'dimensions' ? 'text-amber-300 border-b-2 border-amber-400 bg-slate-800/40' : 'text-slate-400'
                }`}
              >
                公規速查
              </button>
              <button
                onClick={() => setRightTier1('export')}
                className={`flex-1 py-2 font-medium text-center transition ${
                  rightTier1 === 'export' ? 'text-amber-300 border-b-2 border-amber-400 bg-slate-800/40' : 'text-slate-400'
                }`}
              >
                出圖匯出
              </button>
            </div>

            {/* Tier 2 & Tier 3 Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {rightTier1 === 'elevations' && (
                <div className="space-y-3 text-xs">
                  {/* Beam Height */}
                  <div className="bg-[#151c2a] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>結構大梁淨高 (BEAM)</span>
                      <span className="font-mono font-bold text-emerald-400">{room.beamHeight} cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustHeight('beamHeight', -5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        -5 cm
                      </button>
                      <button
                        onClick={() => {
                          onUpdateRoom({ ...room, beamHeight: 265 });
                          onNotify('已套用大梁標準 265 cm');
                        }}
                        className="px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                      >
                        定錨 265
                      </button>
                      <button
                        onClick={() => handleAdjustHeight('beamHeight', 5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        +5 cm
                      </button>
                    </div>
                  </div>

                  {/* Ceiling Drop */}
                  <div className="bg-[#151c2a] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>空調降板高程 (DROP)</span>
                      <span className="font-mono font-bold text-emerald-400">{room.ceilingDrop} cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustHeight('ceilingDrop', -5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        -5 cm
                      </button>
                      <button
                        onClick={() => {
                          onUpdateRoom({ ...room, ceilingDrop: 230 });
                          onNotify('已套用降板標準 230 cm');
                        }}
                        className="px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                      >
                        定錨 230
                      </button>
                      <button
                        onClick={() => handleAdjustHeight('ceilingDrop', 5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        +5 cm
                      </button>
                    </div>
                  </div>

                  {/* Bath drop */}
                  <div className="bg-[#151c2a] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>衛廚降板高程 (BATH)</span>
                      <span className="font-mono font-bold text-emerald-400">{room.bathKitchenDrop ?? 215} cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustHeight('bathKitchenDrop', -5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        -5 cm
                      </button>
                      <button
                        onClick={() => {
                          onUpdateRoom({ ...room, bathKitchenDrop: 215 });
                          onNotify('已套用衛廚降板標準 215 cm');
                        }}
                        className="px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                      >
                        定錨 215
                      </button>
                      <button
                        onClick={() => handleAdjustHeight('bathKitchenDrop', 5)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold"
                      >
                        +5 cm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {rightTier1 === 'dimensions' && (
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] text-slate-400">現場常用人體工學公規：</div>
                  <div className="bg-[#141b27] p-2 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">水電插座開關</div>
                    <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                      插座 FL+30 · 開關 FL+120 · 檯面 FL+105
                    </div>
                  </div>
                  <div className="bg-[#141b27] p-2 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">玄關鞋櫃</div>
                    <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                      進深 38cm · 懸空高 18cm · 檯面 FL+80
                    </div>
                  </div>
                  <div className="bg-[#141b27] p-2 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">廚房與檯面</div>
                    <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                      檯面高 FL+85~90 · 深度 60 · 吊櫃底 155
                    </div>
                  </div>
                  <button
                    onClick={onOpenConstructionLibrary}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition mt-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>開啟完整公規資料庫</span>
                  </button>
                </div>
              )}

              {rightTier1 === 'export' && (
                <div className="space-y-2.5 text-xs">
                  <button
                    onClick={onExportDxf}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>匯出 AutoCAD DXF 圖檔</span>
                  </button>
                  <button
                    onClick={onOpenSketchUp}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                  >
                    <Box className="w-4 h-4" />
                    <span>SketchUp 自動轉檔</span>
                  </button>
                  <button
                    onClick={onOpenDxfSettings}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>DXF 圖層標準設定</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Toggle Handle */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsRightOpen(!isRightOpen)}
            className={`py-3 px-1 rounded-l-xl border border-r-0 text-xs font-bold transition-all shadow-xl flex flex-col items-center gap-1.5 ${
              isRightOpen
                ? 'bg-amber-900/90 text-amber-200 border-amber-500/60'
                : 'bg-[#131926]/90 hover:bg-[#1a2336] text-slate-300 border-slate-700/80 hover:border-amber-400/60'
            }`}
            title="點選展開/收合右側高程契約與導出抽屜"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="[writing-mode:vertical-lr] tracking-widest text-[11px]">
              {isRightOpen ? '收合高程' : '高程與導出'}
            </span>
            {isRightOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </>
  );
};
