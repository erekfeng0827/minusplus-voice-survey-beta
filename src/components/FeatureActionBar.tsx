import React from 'react';
import { Sparkles, Palette, Mic, Sun, Layers, FileCheck2, Box, ShieldCheck, HelpCircle, Scissors } from 'lucide-react';

interface FeatureActionBarProps {
  onOpenAiFeatures: () => void;
  onOpenMaterialLibrary: () => void;
  onOpenVoiceSummary: () => void;
  onOpenVoiceOptimizer?: () => void;
  onOpenSunlightSim: () => void;
  onOpenDxfSettings: () => void;
  onOpenComplianceReport: () => void;
  onOpenArStaking: () => void;
  onOpenScanCamera: () => void;
  onOpenQuotation: () => void;
  onOpenDetailPdf: () => void;
  onOpenBatchDxf: () => void;
  onOpenExtendedFeature?: (featureId: 'project_template' | 'site_checkin' | 'offline_sync' | 'interactive_dimension' | 'multi_version_cad' | 'qr_site_sticker' | 'construction_log' | 'claude_ui_spec') => void;
  onOpenSketchUp?: () => void;
  onOpenScanTutorial?: () => void;
  onOpenDesignerExtractor?: () => void;
  onOpenMultiRoomStitcher?: () => void;
}

export const FeatureActionBar: React.FC<FeatureActionBarProps> = ({
  onOpenAiFeatures,
  onOpenMaterialLibrary,
  onOpenVoiceSummary,
  onOpenVoiceOptimizer,
  onOpenSunlightSim,
  onOpenDxfSettings,
  onOpenComplianceReport,
  onOpenArStaking,
  onOpenScanCamera,
  onOpenQuotation,
  onOpenDetailPdf,
  onOpenBatchDxf,
  onOpenExtendedFeature,
  onOpenSketchUp,
  onOpenScanTutorial,
  onOpenDesignerExtractor,
  onOpenMultiRoomStitcher,
}) => {
  return (
    <div className="w-full bg-[#121620] border-b border-slate-800/80 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Action Buttons matching exact user screenshot UI */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* USER REQUESTED: 門片對齊全室拼圖 (免手稿單房丈量自動拼接) */}
          {onOpenMultiRoomStitcher && (
            <button
              onClick={onOpenMultiRoomStitcher}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold border border-cyan-400/80 shadow-md shadow-cyan-950/40 transition-all active:scale-95 whitespace-nowrap animate-pulse"
              title="各房間各自量完一圈 ➜ 標註門片代號 (A↔A) ➜ 自動拓撲串聯伸出全室總平面圖"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-200" />
              <span className="tracking-wide">門片對應全室拼圖</span>
              <span className="text-[9px] bg-cyan-900/90 text-cyan-200 px-1.5 py-0.2 rounded-full border border-cyan-400/40">
                免手稿
              </span>
            </button>
          )}

          {/* USER SCREENSHOT EXACT BUTTON 1: 實作SketchUp自動轉檔 */}
          {onOpenSketchUp && (
            <button
              onClick={onOpenSketchUp}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs font-semibold border border-slate-700/80 hover:border-purple-400/80 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="實作 SketchUp 自動轉檔 (1:1 3D 切圖匯出)"
            >
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span className="tracking-wide">實作SketchUp自動轉檔</span>
            </button>
          )}

          {/* USER SCREENSHOT EXACT BUTTON 2: 自動化合規稽核分析 */}
          <button
            onClick={onOpenComplianceReport}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-400/80 shadow-sm transition-all active:scale-95 whitespace-nowrap"
            title="自動化合規稽核分析 (5倍數契約與法規報告)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide">自動化合規稽核分析</span>
          </button>

          {/* USER SCREENSHOT EXACT BUTTON 3: 創辦360攝影教學 */}
          {onOpenScanTutorial && (
            <button
              onClick={onOpenScanTutorial}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-400/80 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="創辦 360 攝影教學 (iPad 超廣角全室丈量步驟教學)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="tracking-wide">創辦360攝影教學</span>
            </button>
          )}

          {/* USER SCREENSHOT EXACT BUTTON 4: 新增 CAD 擷取預覽 */}
          {onOpenDesignerExtractor && (
            <button
              onClick={onOpenDesignerExtractor}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#242936] hover:bg-[#303749] text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-400/80 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="新增 CAD 擷取預覽 (原圖立面直切、固定80cm契約、圖塊/線寬/填充樣式預覽)"
            >
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              <span className="tracking-wide">新增 CAD 擷取預覽</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

          {/* User Requested: iPad 鏡頭攝影環繞丈量 (360度環境攝影) */}
          <button
            onClick={onOpenScanCamera}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold border border-cyan-400/80 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            title="手持 iPad 站在門口順時針轉 1 圈，0.5x 超廣角自動丈量 4 面牆與天花降板"
          >
            <span className="text-sm">📷</span>
            <span className="tracking-wide">360° 鏡頭攝影繞圈丈量</span>
            <span className="text-[9px] bg-cyan-900/90 text-cyan-200 px-1.5 py-0.2 rounded-full border border-cyan-400/40">
              0.5x超廣角
            </span>
          </button>

          {/* User Requested Button 1: 現場標註 AR 預覽 */}
          <button
            onClick={onOpenArStaking}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-500/50 shadow-sm transition-all active:scale-95"
            title="現場實景相機 AR 投影與 265/230/215 降板高層雷射放樣標註"
          >
            <span className="tracking-wide">現場標註 AR 預覽</span>
          </button>

          {/* User Requested Button 2: 自動生成報價概算 */}
          <button
            onClick={onOpenQuotation}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-amber-500/50 shadow-sm transition-all active:scale-95"
            title="依據天花降板面積、水電點位與 5 倍數契約自動估算工料與總價"
          >
            <span className="tracking-wide">自動生成報價概算</span>
          </button>

          {/* User Requested Button 3: 施工大樣 PDF 產出 */}
          <button
            onClick={onOpenDetailPdf}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-blue-500/50 shadow-sm transition-all active:scale-95"
            title="將 6 大天花造型與空調配合剖面產出標準 A4/A3 工程圖框 PDF"
          >
            <span className="tracking-wide">施工大樣 PDF 產出</span>
          </button>

          {/* User Requested Button 4: 批量 DXF 圖層優化 */}
          <button
            onClick={onOpenBatchDxf}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-500/50 shadow-sm transition-all active:scale-95"
            title="全室圖面批量 Purge 孤立圖層、清除疊圖線段 (V-07)、強制標準色碼線寬"
          >
            <span className="tracking-wide">批量 DXF 圖層優化</span>
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

          {/* USER SCREENSHOT EXACT BUTTONS (新增專案範本, 施工現場打卡, 離線數據同步, 互動尺寸標註) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenExtendedFeature?.('project_template')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-white text-xs font-semibold border border-slate-700/80 hover:border-blue-400/60 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="新增專案範本：一鍵建立室內設計降板裁決標準戶型與幾何"
            >
              <span className="tracking-wide">新增專案範本</span>
            </button>

            <button
              onClick={() => onOpenExtendedFeature?.('site_checkin')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-400/60 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="施工現場打卡：GPS定位與放樣雷射標高留存打卡"
            >
              <span className="tracking-wide">施工現場打卡</span>
            </button>

            <button
              onClick={() => onOpenExtendedFeature?.('offline_sync')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-white text-xs font-semibold border border-slate-700/80 hover:border-amber-400/60 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="離線數據同步：無網路工地現場數據快取與續傳"
            >
              <span className="tracking-wide">離線數據同步</span>
            </button>

            <button
              onClick={() => onOpenExtendedFeature?.('interactive_dimension')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-400/60 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="互動尺寸標註：現場快速點擊標註天花高程與水電點位"
            >
              <span className="tracking-wide">互動尺寸標註</span>
            </button>

            {/* Quick Arrow to View More 7+ Extended Tools */}
            <button
              onClick={() => onOpenExtendedFeature?.('claude_ui_spec')}
              className="p-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition shadow-sm active:scale-95 flex items-center justify-center"
              title="展開更多擴充功能 (跨版本CAD比對、QR貼紙、放樣日誌、克勞的Design規範)"
            >
              <span className="text-xs font-bold font-mono">›</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

          {/* ✦ AI Features */}
          <button
            onClick={onOpenAiFeatures}
            className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-blue-500/50 shadow-sm transition-all active:scale-95"
            title="開啟 AI 智能工務全功能中心"
          >
            <span className="text-blue-400 font-black text-xs">✦</span>
            <span className="tracking-wide">AI Features</span>
          </button>

          {/* 新增材質庫選配 */}
          <button
            onClick={onOpenMaterialLibrary}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-amber-500/50 shadow-sm transition-all active:scale-95"
            title="材質庫選配"
          >
            <span className="tracking-wide">材質選配</span>
          </button>

          {/* 語音自動生成摘要 */}
          <button
            onClick={onOpenVoiceSummary}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-500/50 shadow-sm transition-all active:scale-95"
            title="語音自動生成摘要"
          >
            <span className="tracking-wide">語音摘要</span>
          </button>

          {/* USER REQUESTED: 口述指令優化 (Voice Command Optimizer) */}
          {onOpenVoiceOptimizer && (
            <button
              onClick={onOpenVoiceOptimizer}
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 text-cyan-200 hover:text-white text-xs font-bold border border-blue-400/60 shadow-md shadow-blue-950/40 transition-all active:scale-95"
              title="口述指令優化：過濾環境雜音、諧音口音校準、強固5倍數契約幾何"
            >
              <span className="text-cyan-400 font-bold">🎙️</span>
              <span className="tracking-wide">口述指令優化</span>
              <span className="text-[9px] bg-blue-950 text-cyan-300 px-1.5 py-0.2 rounded border border-blue-500/40">
                5x契約
              </span>
            </button>
          )}

          {/* 光影模擬效果 */}
          <button
            onClick={onOpenSunlightSim}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-yellow-500/50 shadow-sm transition-all active:scale-95"
            title="光影模擬"
          >
            <span className="tracking-wide">光影模擬</span>
          </button>

          {/* DXF 圖層自訂設定 */}
          <button
            onClick={onOpenDxfSettings}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-500/50 shadow-sm transition-all active:scale-95"
            title="自訂 DXF 圖層"
          >
            <span className="tracking-wide">圖層設定</span>
          </button>

          {/* 自動生成合規報表 */}
          <button
            onClick={onOpenComplianceReport}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222834] hover:bg-[#2c3444] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-500/50 shadow-sm transition-all active:scale-95"
            title="合規報表"
          >
            <span className="tracking-wide">合規報表</span>
          </button>
        </div>

        {/* Right Status Badge */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>室內設計自動化工具鏈已就緒</span>
        </div>
      </div>
    </div>
  );
};
