import React, { useState } from 'react';
import {
  PenTool,
  BookOpen,
  MoreVertical,
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Sparkles,
  Sliders,
  Lock,
  Unlock,
  FileCode,
  Globe,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoomData } from '../types';

export interface CadLayerItem {
  name: string;
  color: string;
  description: string;
  count?: number;
}

export const CAD_LAYERS: CadLayerItem[] = [
  { name: '01_結構牆體', color: '#f59e0b', description: '承重牆、隔間牆與 RC 柱心' },
  { name: '02_柱體尺寸', color: '#3b82f6', description: '結構柱、開間進深標註' },
  { name: '03_天花降板', color: '#10b981', description: '梁下 265 / 降板 230 / 廚衛 215' },
  { name: '04_門窗開口', color: '#ec4899', description: '室內門扇、鋁窗、開口定位' },
  { name: '05_木作櫃體', color: '#8b5cf6', description: '玄關櫃、系統衣櫃、中島' },
  { name: '06_施工註記', color: '#06b6d4', description: '丈量備忘、法規檢索標註' },
];

export type LayerNamingConvention = 'TW_STANDARD' | 'AIA_STANDARD' | 'BILINGUAL';

interface AutoLayerPreviewBarProps {
  room?: RoomData;
  activeLayer: string;
  onSelectLayer: (layerName: string) => void;
  visibleLayers: Record<string, boolean>;
  onToggleLayerVisibility: (layerName: string) => void;
  onOpenAuthModal: () => void;
  onOpenSearchGroundingModal: () => void;
  onNotify?: (msg: string) => void;
}

export const AutoLayerPreviewBar: React.FC<AutoLayerPreviewBarProps> = ({
  room,
  activeLayer,
  onSelectLayer,
  visibleLayers,
  onToggleLayerVisibility,
  onOpenAuthModal,
  onOpenSearchGroundingModal,
  onNotify,
}) => {
  const { user, syncStatus } = useAuth();
  const [showLayersDrawer, setShowLayersDrawer] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [namingConvention, setNamingConvention] = useState<LayerNamingConvention>('TW_STANDARD');
  const [isDrawModeActive, setIsDrawModeActive] = useState<boolean>(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(100);
  const [lockedLayers, setLockedLayers] = useState<Record<string, boolean>>({});

  // Layer mapping dictionary
  const LAYER_DICTIONARY: Record<string, { aia: string; tw: string; desc: string }> = {
    '01_結構牆體': { aia: 'A-WALL-FULL', tw: '01_結構牆體', desc: '承重牆、隔間牆與 RC 柱心' },
    '02_柱體尺寸': { aia: 'A-COLS-DIMS', tw: '02_柱體尺寸', desc: '結構柱、開間進深標註' },
    '03_天花降板': { aia: 'A-CLNG-DROP', tw: '03_天花降板', desc: '梁下 265 / 降板 230 / 廚衛 215' },
    '04_門窗開口': { aia: 'A-DOOR-WIND', tw: '04_門窗開口', desc: '室內門扇、鋁窗、開口定位' },
    '05_木作櫃體': { aia: 'A-FURN-MILL', tw: '05_木作櫃體', desc: '玄關櫃、系統衣櫃、中島' },
    '06_施工註記': { aia: 'A-ANNO-TEXT', tw: '06_施工註記', desc: '丈量備忘、法規檢索標註' },
  };

  const getDisplayName = (layerName: string) => {
    const entry = LAYER_DICTIONARY[layerName];
    if (!entry) return layerName;
    if (namingConvention === 'AIA_STANDARD') return entry.aia;
    if (namingConvention === 'BILINGUAL') return `${entry.tw} (${entry.aia})`;
    return entry.tw;
  };

  const toggleLayerLock = (layerName: string) => {
    setLockedLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
    onNotify?.(`圖層「${layerName}」已${!lockedLayers[layerName] ? '鎖定' : '解除鎖定'}`);
  };

  return (
    <div className="relative group">
      {/* Outer Card Container styled matching the prompt screenshot */}
      <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 hover:border-slate-700">
        {/* Card Title matching screenshot: 新增自動圖層預覽 */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
            新增自動圖層預覽
          </span>
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
            LIVE PREVIEW
          </span>
        </div>

        {/* Central Floating Pill Toolbar matching the exact screenshot design */}
        <div className="bg-[#24272e]/95 border border-slate-700/80 rounded-full px-3.5 py-1.5 flex items-center gap-2.5 sm:gap-3.5 shadow-2xl backdrop-blur-md">
          {/* 1. Drawing / Pen Icon with active Yellow underline bar */}
          <button
            onClick={() => {
              setIsDrawModeActive(!isDrawModeActive);
              onNotify?.(
                isDrawModeActive
                  ? '已退出繪圖標記模式'
                  : `已切換至「${getDisplayName(activeLayer)}」幾何精準繪圖標記模式`
              );
            }}
            title="精準繪圖標記模式 (點擊切換)"
            className={`relative p-1 text-slate-300 hover:text-white transition group flex flex-col items-center ${
              isDrawModeActive ? 'text-yellow-400 font-bold' : ''
            }`}
          >
            <PenTool className="w-4 h-4 text-slate-200 group-hover:text-yellow-300 transition" />
            {isDrawModeActive && (
              <span className="absolute -bottom-1 left-0.5 right-0.5 h-[2.5px] bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            )}
          </button>

          {/* 2. Split Window / Layers Book Icon */}
          <button
            onClick={() => {
              setShowLayersDrawer(!showLayersDrawer);
              setShowLangMenu(false);
              setShowMoreMenu(false);
            }}
            title="自動圖層透視預覽抽屜"
            className={`p-1 rounded-lg text-slate-300 hover:text-white transition relative ${
              showLayersDrawer ? 'text-cyan-400 bg-slate-800' : ''
            }`}
          >
            <div className="w-4 h-4 border border-slate-300 rounded-[2px] flex overflow-hidden">
              <div className="w-1.5 bg-slate-400/60 border-r border-slate-400/60" />
              <div className="flex-1 flex flex-col justify-center gap-0.5 p-0.5">
                <div className="h-[1px] bg-slate-300 w-full" />
                <div className="h-[1px] bg-slate-300 w-3/4" />
              </div>
            </div>
            {/* Active layer count badge */}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {/* 3. Language Translation '文/A' with Downward Chevron */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowLayersDrawer(false);
                setShowMoreMenu(false);
              }}
              title="CAD 圖層標準命名切換 (文/A)"
              className="flex items-center gap-0.5 p-1 text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-800"
            >
              <div className="flex items-center text-xs font-bold font-mono tracking-tighter text-slate-200">
                <span className="text-[11px]">文</span>
                <span className="text-[10px] text-slate-400 mx-[1px]">/</span>
                <span className="text-[11px] text-cyan-300">A</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Language dropdown menu */}
            {showLangMenu && (
              <div className="absolute top-9 left-1/2 -translate-x-1/2 z-50 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 text-xs text-slate-300 animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                  CAD 圖層命名標準切換
                </div>
                <button
                  onClick={() => {
                    setNamingConvention('TW_STANDARD');
                    setShowLangMenu(false);
                    onNotify?.('已切換為：台灣室內施工標準圖層命名');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-800 ${
                    namingConvention === 'TW_STANDARD' ? 'text-cyan-300 bg-slate-800/80 font-bold' : ''
                  }`}
                >
                  <span>標準中文 (01_結構牆體)</span>
                  {namingConvention === 'TW_STANDARD' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => {
                    setNamingConvention('AIA_STANDARD');
                    setShowLangMenu(false);
                    onNotify?.('已切換為：國際 AIA/AutoCAD 英文標準圖層命名');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-800 ${
                    namingConvention === 'AIA_STANDARD' ? 'text-cyan-300 bg-slate-800/80 font-bold' : ''
                  }`}
                >
                  <span>國際 AIA (A-WALL)</span>
                  {namingConvention === 'AIA_STANDARD' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => {
                    setNamingConvention('BILINGUAL');
                    setShowLangMenu(false);
                    onNotify?.('已切換為：雙語對照圖層命名');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-800 ${
                    namingConvention === 'BILINGUAL' ? 'text-cyan-300 bg-slate-800/80 font-bold' : ''
                  }`}
                >
                  <span>中英雙語對照</span>
                  {namingConvention === 'BILINGUAL' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              </div>
            )}
          </div>

          {/* 4. Three Vertical Dots */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowLayersDrawer(false);
                setShowLangMenu(false);
              }}
              title="圖層進階設定與控制"
              className="p-1 text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4 text-slate-300" />
            </button>

            {/* More options menu */}
            {showMoreMenu && (
              <div className="absolute top-9 right-0 z-50 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 text-xs text-slate-300 animate-fadeIn">
                <div className="font-bold text-[11px] text-slate-400 px-2 py-0.5 border-b border-slate-800 flex items-center justify-between">
                  <span>圖層控制與契約工具</span>
                </div>

                {/* Opacity slider */}
                <div className="px-2 py-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>底圖不透明度</span>
                    <span className="font-mono text-cyan-300">{layerOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Google Search Grounding Trigger */}
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSearchGroundingModal();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 text-cyan-300"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google 實時法規檢索</span>
                </button>

                {/* Lock All */}
                <button
                  onClick={() => {
                    const allLocked = Object.keys(lockedLayers).length === CAD_LAYERS.length;
                    const next: Record<string, boolean> = {};
                    if (!allLocked) {
                      CAD_LAYERS.forEach((l: CadLayerItem) => (next[l.name] = true));
                    }
                    setLockedLayers(next);
                    setShowMoreMenu(false);
                    onNotify?.(allLocked ? '已解鎖全部圖層' : '已鎖定全部底圖圖層');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{Object.keys(lockedLayers).length === CAD_LAYERS.length ? '解鎖全部圖層' : '全圖層防竄改鎖定'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Purple Avatar Icon (Firebase Auth & User Profile Trigger) */}
          <button
            onClick={onOpenAuthModal}
            title={user ? `已登入：${user.displayName || user.email} (點擊管理 Firestore 同步)` : '以 Google 帳號登入 (啟用 Firestore 雲端同步)'}
            className="relative flex items-center justify-center transition active:scale-95 group"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google User'}
                className="w-7 h-7 rounded-full border border-purple-400 object-cover ring-2 ring-purple-500/40"
              />
            ) : (
              /* Purple avatar badge matching screenshot styling exactly */
              <div className="w-6 h-6 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-purple-900/50 relative">
                {/* 2 eyes like the cartoon character in image */}
                <div className="flex items-center gap-[2.5px]">
                  <div className="w-[2.5px] h-[3.5px] bg-slate-900 rounded-full" />
                  <div className="w-[2.5px] h-[3.5px] bg-slate-900 rounded-full" />
                </div>
              </div>
            )}

            {/* Cloud Sync Status Indicator */}
            {user && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-purple-400'
                }`}
              />
            )}
          </button>
        </div>

        {/* Bottom Label matching screenshot: 設計 */}
        <div className="w-full flex items-center justify-center mt-3 text-slate-400 text-xs font-medium tracking-widest relative">
          <span className="relative z-10 font-bold text-slate-300">設計</span>
          {/* Subtle background drafting cross / ruler watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-16 h-[1px] bg-slate-400" />
          </div>
        </div>
      </div>

      {/* Auto Layer Preview Inspector Drawer (Opens when split window icon is clicked) */}
      {showLayersDrawer && (
        <div className="mt-3 bg-slate-900 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">六大 CAD 圖層自動預覽與狀態控制</span>
            </div>
            <button
              onClick={() => setShowLayersDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              收合 ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {CAD_LAYERS.map((layer: CadLayerItem) => {
              const isVisible = visibleLayers[layer.name] !== false;
              const isActive = activeLayer === layer.name;
              const isLocked = Boolean(lockedLayers[layer.name]);
              const displayName = getDisplayName(layer.name);
              const dictEntry = LAYER_DICTIONARY[layer.name];

              return (
                <div
                  key={layer.name}
                  onClick={() => onSelectLayer(layer.name)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Layer color indicator dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{displayName}</span>
                        {isActive && (
                          <span className="text-[9px] bg-cyan-900 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                            當前繪製
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {dictEntry?.desc || '標準圖元'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Lock toggle */}
                    <button
                      onClick={() => toggleLayerLock(layer.name)}
                      title={isLocked ? '已鎖定' : '未鎖定'}
                      className={`p-1 rounded hover:bg-slate-800 transition ${
                        isLocked ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Visibility toggle */}
                    <button
                      onClick={() => onToggleLayerVisibility(layer.name)}
                      title={isVisible ? '隱藏圖層' : '顯示圖層'}
                      className={`p-1 rounded hover:bg-slate-800 transition ${
                        isVisible ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              當前使用標準：<span className="text-cyan-300 font-bold">{namingConvention}</span>
            </span>
            <button
              onClick={onOpenSearchGroundingModal}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
            >
              <span>查核該圖層 2026 最新法規依據</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
