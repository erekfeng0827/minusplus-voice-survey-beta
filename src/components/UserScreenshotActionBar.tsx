import React from 'react';
import {
  Box,
  ShieldCheck,
  HelpCircle,
  Scissors,
  Sliders,
  Sparkles,
  Layers,
  Settings2,
  RotateCcw,
  RotateCw,
  Trash2,
  BookOpen,
  Compass,
  Printer,
  Globe,
  Database,
} from 'lucide-react';
import { AutoLayerPreviewBar } from './AutoLayerPreviewBar';
import { ThreeActionCardsBanner } from './ThreeActionCardsBanner';

interface UserScreenshotActionBarProps {
  // Exact User Screenshot IMG_1425.jpeg 3 Cards
  onOpenClashDetection?: () => void;
  onOpenBeamDepthCalculator?: () => void;
  onOpenLayerColorContrast?: () => void;

  // New User Screenshot 2 Cards (AI Features & Cloud Backup)
  onOpenAiFeatures?: () => void;
  onOpenCloudBackup?: () => void;
  onOpenDwgHabitsLearner?: () => void;
  onOpenCompanyTitleBlockDesigner?: () => void;
  onOpenPersonalBlockLibrary?: () => void;
  onOpenSearchGrounding?: () => void;
  onOpenFirebaseAuth?: () => void;
  onOpenHatchPatternPreview?: () => void;
  onOpenBatchAutoClassification?: () => void;
  activeLayer?: string;
  onSelectLayer?: (layer: string) => void;
  visibleLayers?: Record<string, boolean>;
  onToggleLayerVisibility?: (layer: string) => void;
  onNotify?: (msg: string) => void;

  // New User Screenshot 5 Features (測驗必備功能)
  onOpenDrawingHabits?: () => void;
  onOpenElevationBenchmark?: () => void;
  onOpenIpadHiddenMenu?: () => void;
  onOpenPanoramicGuide?: () => void;
  onOpenAuditDistribution?: () => void;

  // Undo / Redo & Clear All (一鍵刪除與一鍵復原/上一步)
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onClearAll?: () => void;

  // Construction Details Library & 3D Render Explanation
  onOpenConstructionLibrary?: () => void;
  onOpen3DExplanation?: () => void;

  // Directional Menu Toggle
  isDirectionalMenuOpen?: boolean;
  onToggleDirectionalMenu?: () => void;

  // Existing Designer Shortcuts
  onOpenSketchUp: () => void;
  onOpenComplianceReport: () => void;
  onOpenScanTutorial: () => void;
  onOpenDesignerExtractor: () => void;
  onOpenElevationSlice?: () => void;
  onOpenCadStyleSync?: () => void;
  onOpenStepPhotoNav?: () => void;
  onOpenUiComfortSettings?: () => void;
  isMinimalComfortMode?: boolean;
  onToggleComfortMode?: () => void;
  onEnterZenMode?: () => void;
}

export const UserScreenshotActionBar: React.FC<UserScreenshotActionBarProps> = ({
  onOpenClashDetection,
  onOpenBeamDepthCalculator,
  onOpenLayerColorContrast,
  onOpenAiFeatures,
  onOpenCloudBackup,
  onOpenDwgHabitsLearner,
  onOpenCompanyTitleBlockDesigner,
  onOpenPersonalBlockLibrary,
  onOpenSearchGrounding,
  onOpenFirebaseAuth,
  onOpenHatchPatternPreview,
  onOpenBatchAutoClassification,
  activeLayer = '01_結構牆體',
  onSelectLayer = () => {},
  visibleLayers = {},
  onToggleLayerVisibility = () => {},
  onNotify,
  onOpenDrawingHabits,
  onOpenElevationBenchmark,
  onOpenIpadHiddenMenu,
  onOpenPanoramicGuide,
  onOpenAuditDistribution,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClearAll,
  onOpenConstructionLibrary,
  onOpen3DExplanation,
  isDirectionalMenuOpen = true,
  onToggleDirectionalMenu,
  onOpenSketchUp,
  onOpenComplianceReport,
  onOpenScanTutorial,
  onOpenDesignerExtractor,
  onOpenElevationSlice,
  onOpenCadStyleSync,
  onOpenStepPhotoNav,
  onOpenUiComfortSettings,
  isMinimalComfortMode = false,
  onToggleComfortMode,
  onEnterZenMode,
}) => {
  return (
    <div className="w-full bg-[#11141c] border-b border-slate-800/90 px-3 sm:px-5 py-2.5 shadow-md space-y-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* ROW -1: EXACT USER SCREENSHOT IMG_1425.jpeg (自動化碰撞檢測 | 新增樑深自動計算 | 優化圖層顏色對比) */}
        <ThreeActionCardsBanner
          onOpenClashDetection={onOpenClashDetection || (() => {})}
          onOpenBeamDepthCalculator={onOpenBeamDepthCalculator || (() => {})}
          onOpenLayerColorContrast={onOpenLayerColorContrast || (() => {})}
        />

        {/* ROW 0: EXACT USER SCREENSHOT HERO CARDS (✦ 人工智慧功能 & 新功能 專案雲端備份 & 新增自動圖層預覽) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          {/* Card 1: 為您的應用程式添加人工智慧功能和集成 (Google Search Grounding + Gemini) */}
          <button
            onClick={onOpenSearchGrounding || onOpenAiFeatures}
            className="w-full text-left bg-gradient-to-r from-[#171c28] via-[#1a202e] to-[#161a25] hover:from-[#1e2536] hover:to-[#1c2230] border border-slate-700/80 hover:border-cyan-500/70 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-cyan-900/20 group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm sm:text-base tracking-wide group-hover:text-cyan-200 transition-colors">
                  為您的應用程式添加人工智慧功能和集成
                </h4>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131720] border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-inner">
                  <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                  <span>Google Search Grounding 實時檢索</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0 shadow-md">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              gemini-3.6-flash · 內政部防火/耐燃法規實時查核
            </div>
          </button>

          {/* Card 2: 新增專案雲端備份 (Firebase Firestore + Google Sign-In) */}
          <button
            onClick={onOpenFirebaseAuth || onOpenCloudBackup}
            className="w-full text-left bg-gradient-to-r from-[#171c28] via-[#1a202e] to-[#161a25] hover:from-[#1e2536] hover:to-[#1c2230] border border-slate-700/80 hover:border-purple-500/70 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-purple-900/20 group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm sm:text-base tracking-wide group-hover:text-purple-200 transition-colors">
                  新增專案雲端備份與驗證
                </h4>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131720] border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-inner">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>Firebase Auth + Firestore 持久化</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0 shadow-md">
                <Box className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Google 登入 · 案場、自訂圖塊與規格表跨裝置漫遊
            </div>
          </button>

          {/* Card 3: EXACT REPRODUCTION OF USER SCREENSHOT: 新增自動圖層預覽 */}
          <div className="w-full h-full flex flex-col justify-center">
            <AutoLayerPreviewBar
              activeLayer={activeLayer}
              onSelectLayer={onSelectLayer}
              visibleLayers={visibleLayers}
              onToggleLayerVisibility={onToggleLayerVisibility}
              onOpenAuthModal={onOpenFirebaseAuth || onOpenCloudBackup || (() => {})}
              onOpenSearchGroundingModal={onOpenSearchGrounding || onOpenAiFeatures || (() => {})}
              onNotify={onNotify}
            />
          </div>
        </div>

        {/* ROW 0.5: EXACT USER SCREENSHOT CARDS (填滿樣式預覽 [設計] & 灌裝自動分類 [新功能]) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {/* Card 1: 填滿樣式預覽 [設計] */}
          <button
            onClick={onOpenHatchPatternPreview}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-cyan-950/20 group relative overflow-hidden flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-start justify-between w-full">
              <h4 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-cyan-200 transition-colors">
                填滿樣式預覽
              </h4>
            </div>

            <div className="flex items-center justify-between w-full mt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-md border border-slate-700/80 bg-slate-800/40 text-slate-300 text-xs font-medium tracking-wide">
                設計
              </div>

              {/* Watermark Icon: Crossed drafting ruler and pencil */}
              <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-slate-600/40 pointer-events-none transition-colors">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 50L50 14" />
                  <path d="M22 42l4-4" />
                  <path d="M30 34l4-4" />
                  <path d="M38 26l4-4" />
                  <rect x="12" y="12" width="12" height="40" rx="2" transform="rotate(-45 20 32)" />
                  <path d="M48 16l-4-4-24 24v4h4l24-24z" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card 2: 灌裝自動分類 [新功能] */}
          <button
            onClick={onOpenBatchAutoClassification}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-purple-950/20 group relative overflow-hidden flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-start justify-between w-full">
              <h4 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-purple-200 transition-colors">
                灌裝自動分類
              </h4>
            </div>

            <div className="flex items-center justify-between w-full mt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-md border border-slate-700/80 bg-slate-800/40 text-slate-300 text-xs font-medium tracking-wide">
                新功能
              </div>

              {/* Watermark Icon: 2x2 grid of 4 rounded squares */}
              <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-slate-600/40 pointer-events-none transition-colors">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="10" y="10" width="18" height="18" rx="4.5" />
                  <rect x="36" y="10" width="18" height="18" rx="4.5" />
                  <rect x="10" y="36" width="18" height="18" rx="4.5" />
                  <rect x="36" y="36" width="18" height="18" rx="4.5" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* ROW 1: USER SCREENSHOT 5 TEST FEATURES BAR + UNDO/REDO/CLEAR ALL */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>測驗驗收必備</span>
            </div>

            {/* 設計師個人規格表洗練器 (User Requested 10套DWG學習) */}
            {onOpenDwgHabitsLearner && (
              <button
                onClick={onOpenDwgHabitsLearner}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs sm:text-sm font-bold border border-emerald-500/60 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="設計師 DWG 全套施工圖批次洗練學習器：丟入 10 個 DWG 拆解學習個人圖層、線寬、剖面線與大樣習慣，生成個人規格表"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">個人規格表洗練器 (10套DWG)</span>
              </button>
            )}

            {/* 公司圖框與 Logo 設計器 (User Requested) */}
            {onOpenCompanyTitleBlockDesigner && (
              <button
                onClick={onOpenCompanyTitleBlockDesigner}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs sm:text-sm font-bold border border-purple-500/60 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="公司專屬出圖圖框設計器：可上傳公司 Logo、自訂公司資訊、證號、簽章欄，即時 A3 預覽並寫入全套施工圖"
              >
                <Printer className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">公司圖框與Logo設計</span>
              </button>
            )}

            {/* 本機大樣與圖塊系統庫 (User Requested) */}
            {onOpenPersonalBlockLibrary && (
              <button
                onClick={onOpenPersonalBlockLibrary}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-xs sm:text-sm font-bold border border-amber-500/60 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="本機專屬大樣與家具圖塊系統庫：批次丟入 DWG/DXF/SVG 圖塊、永久儲存於本機、精緻家具插圖與施工大樣庫"
              >
                <Box className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">本機大樣圖塊庫</span>
              </button>
            )}

            {/* 1. 繪製保存習慣 (User Screenshot 1) */}
            {onOpenDrawingHabits && (
              <button
                onClick={onOpenDrawingHabits}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-blue-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="繪製保存習慣：定時寫檔落盤、強制5倍數對齊、CAD圖層線寬規範與習慣配置管理"
              >
                <span className="tracking-wide text-white">繪製保存習慣</span>
              </button>
            )}

            {/* 2. 立面基準基準 (User Screenshot 1) */}
            {onOpenElevationBenchmark && (
              <button
                onClick={onOpenElevationBenchmark}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-amber-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="立面基準基準：FL+80cm 核心檯面基準線、A/B/C/D 4面牆直切與冷氣穿梁衝突檢驗"
              >
                <span className="tracking-wide text-white">立面基準基準</span>
              </button>
            )}

            {/* 3. iPad隱藏式選單 (User Screenshot 1 & 2) */}
            {onOpenIpadHiddenMenu && (
              <button
                onClick={onOpenIpadHiddenMenu}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-emerald-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="iPad隱藏式選單：上下左右四向隱藏抽屜選單配置、觸控靈敏度與一鍵啟動 100% 滿版純淨丈量"
              >
                <span className="tracking-wide text-white">iPad隱藏式選單</span>
              </button>
            )}

            {/* 4. 360度攝影視覺指引 (User Screenshot 2) */}
            {onOpenPanoramicGuide && (
              <button
                onClick={onOpenPanoramicGuide}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-cyan-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="360度攝影視覺指引：玄關原點中軸線定錨、雙軸電子水平儀 0.0° 平水校準與順時針 15°/秒 旋轉SOP"
              >
                <span className="tracking-wide text-white">360度攝影視覺指引</span>
              </button>
            )}

            {/* 5. 審計分佈圖 (User Screenshot 2) */}
            {onOpenAuditDistribution && (
              <button
                onClick={onOpenAuditDistribution}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-red-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="審計分佈圖：19張單滯留時長分佈、工單池A/B/C純化分診、5倍數幾何合規率與V規風險可視化"
              >
                <span className="tracking-wide text-white">審計分佈圖</span>
              </button>
            )}

            {/* 6. 施工大樣與公規庫 (User Requested) */}
            {onOpenConstructionLibrary && (
              <button
                onClick={onOpenConstructionLibrary}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#18283d] hover:bg-[#203652] text-cyan-300 text-xs sm:text-sm font-semibold border border-cyan-500/60 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="施工大樣與公規尺寸智庫：天花吊頂、空調降板、人體工學櫥櫃、水電標高與結構避坑資料庫"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide text-cyan-200">施工大樣智庫 (公規尺寸)</span>
              </button>
            )}
          </div>

          {/* Right Part of Row 1: UNDO / REDO / CLEAR ALL BUTTONS (一鍵操作) */}
          <div className="flex items-center gap-1.5">
            {/* 上一步 / 一鍵復原 (Undo) */}
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                  canUndo
                    ? 'bg-[#1b263b] hover:bg-[#263756] text-white border border-cyan-500/60 hover:border-cyan-400 active:scale-95'
                    : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
                title="上一步 / 一鍵復原 (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>上一步</span>
              </button>
            )}

            {/* 下一步 / 一鍵重做 (Redo) */}
            {onRedo && (
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                  canRedo
                    ? 'bg-[#1b263b] hover:bg-[#263756] text-white border border-cyan-500/60 hover:border-cyan-400 active:scale-95'
                    : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
                title="下一步 / 一鍵重做 (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>下一步</span>
              </button>
            )}

            {/* 一鍵刪除 / 清除所有圖面 (Clear All) */}
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-600/50 text-xs font-bold shadow-sm transition active:scale-95"
                title="一鍵清空圖面所有放樣圖元 (清空後可隨時按【上一步】還原)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>一鍵清空</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: OTHER DESIGNER SHORTCUTS (SketchUp, 3D技術規格, 3層選單, 合規, 360教學, CAD擷取, 舒適度) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>設計師工務捷徑</span>
            </div>

            {/* 3D 渲染技術剖析 (User Requested) */}
            {onOpen3DExplanation && (
              <button
                onClick={onOpen3DExplanation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#201833] hover:bg-[#2d2247] text-purple-300 text-xs sm:text-sm font-semibold border border-purple-500/50 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="3D 渲染技術規格剖析：解答當前 3D 為實時 WebGL PBR 工程物理級渲染，以及如何達成照片級光追效果"
              >
                <Box className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide text-purple-200">3D渲染技術規格</span>
              </button>
            )}

            {/* 上下左右 3 層選單開關 (User Requested) */}
            {onToggleDirectionalMenu && (
              <button
                onClick={onToggleDirectionalMenu}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border shadow-md transition-all active:scale-95 whitespace-nowrap group ${
                  isDirectionalMenuOpen
                    ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-300'
                    : 'bg-[#242936] hover:bg-[#303749] text-white border-slate-700/80'
                }`}
                title="切換上下左右 3 層式展開/收合選單系統"
              >
                <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">上下左右 3 層選單</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isDirectionalMenuOpen ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDirectionalMenuOpen ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* 1. 實作SketchUp自動轉檔 (User Screenshot 1) */}
            <button
              onClick={onOpenSketchUp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-purple-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
              title="實作 SketchUp 自動轉檔：一鍵將當前 2D 放樣與梁高降板轉出為 1:1 3D 切圖模型"
            >
              <Box className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">實作SketchUp自動轉檔</span>
            </button>

            {/* 2. 自動化合規稽核分析 (User Screenshot 1) */}
            <button
              onClick={onOpenComplianceReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-emerald-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
              title="自動化合規稽核分析：全面檢核《降板裁決》5倍數契約(265/230/215)與建築技術規則法規報告"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">自動化合規稽核分析</span>
            </button>

            {/* 3. 創辦360攝影教學 (User Screenshot 2) */}
            <button
              onClick={onOpenScanTutorial}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-cyan-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
              title="創辦 360 攝影教學：站在入戶門順時針旋轉 1 圈，0.5x 超廣角自動丈量圖文與姿勢教學"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">創辦360攝影教學</span>
            </button>

            {/* 4. 新增 CAD 擷取預覽 (User Screenshot 2) */}
            <button
              onClick={onOpenDesignerExtractor}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-indigo-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
              title="新增 CAD 擷取預覽：原圖直切、立面固定 80cm 基準、線寬/圖塊/填充線樣式自訂與即時預覽"
            >
              <Scissors className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">新增 CAD 擷取預覽</span>
            </button>

            {/* 5. 自動化立面片 */}
            {onOpenElevationSlice && (
              <button
                onClick={onOpenElevationSlice}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-amber-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="自動化立面片：固定 80cm 基準切圖、自動生成A/B/C/D牆面展開圖片"
              >
                <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">自動化立面片</span>
              </button>
            )}

            {/* 6. CAD樣式同步 */}
            {onOpenCadStyleSync && (
              <button
                onClick={onOpenCadStyleSync}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-blue-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="CAD樣式同步：一鍵同步AutoCAD 7大圖層標準、線寬與文字標註樣式"
              >
                <Sliders className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">CAD樣式同步</span>
              </button>
            )}

            {/* 7. 步驟攝影導航 */}
            {onOpenStepPhotoNav && (
              <button
                onClick={onOpenStepPhotoNav}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs sm:text-sm font-medium border border-slate-700/80 hover:border-rose-400/80 shadow-md transition-all active:scale-95 whitespace-nowrap group"
                title="步驟攝影導航：iPad 空間繞圈指引、雷達水平校正與4面牆順時針導航"
              >
                <Sparkles className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">步驟攝影導航</span>
              </button>
            )}
          </div>

          {/* Right Section: Zen Mode & UI Comfort */}
          <div className="flex items-center gap-2">
            {/* iPad 純淨丈量模式 */}
            {onEnterZenMode && (
              <button
                onClick={onEnterZenMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-95 whitespace-nowrap"
                title="進入 iPad 純淨丈量模式：完全淨空畫面、100% 滿版畫布、上下左右四向隱藏抽屜選單"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" style={{ animationDuration: '6s' }} />
                <span>📱 iPad 純淨丈量模式</span>
              </button>
            )}

            {/* Full UI Comfort Settings Modal Trigger */}
            {onOpenUiComfortSettings && (
              <button
                onClick={onOpenUiComfortSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b212f] hover:bg-[#252e42] text-slate-300 hover:text-cyan-300 border border-slate-700/80 text-xs font-semibold transition-all active:scale-95"
                title="開啟介面設計與視覺舒適度自訂視窗"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">介面自訂</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
