import React from 'react';
import { RoomData, Door, Beam, WindowOpening, ElectricalPoint } from '../types';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  X,
  Maximize2,
  Layers,
  Ruler,
  Zap,
  Box,
  FileText
} from 'lucide-react';

export interface GuidedTourStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  cadRule: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}

interface GuidedMeasurementTourProps {
  room: RoomData;
  currentStep: number;
  isOpen: boolean;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onApplyStepAction: (step: number) => void;
  onNavigateToConstructionSheets?: () => void;
}

export const TOUR_STEPS: GuidedTourStep[] = [
  {
    stepNumber: 1,
    title: '玄關起點定位 (Origin & Main Door)',
    subtitle: '第 1 步：確立全室放樣基準原點 (0,0)',
    tag: '玄關起錨',
    description: '正統丈量首重「起錨點」！以進門玄關防爆門為原點 (0,0)，確立門片淨寬 (100cm)、角部開口偏移 (50cm) 與開向弧度，作為全室尺寸閉合的基準線。',
    cadRule: '《降板裁決》規定：玄關落塵區地坪預留 -1.5cm 降板止水，門片開啟旋轉半徑 90° 內不得有障礙圖元。',
    hotspot: {
      x: 100,
      y: 500,
      label: '📍 基準原點 (0,0) · 玄關防爆門'
    }
  },
  {
    stepNumber: 2,
    title: '順時針閉合量測 (Clockwise Perimeter)',
    subtitle: '第 2 步：依順時針方向封閉量測四向外牆與門窗',
    tag: '順時針閉合',
    description: '從玄關起點出發，依順時針原則依序量測：【西牆進深】➜【北向景觀採光落地窗】➜【東向隔間推拉門】➜【南牆閉合】，確保所有外牆尺寸全面符合 5 倍數且無公差裂縫。',
    cadRule: '閉合審計原則：總開間 480cm、進深 550cm、落地窗淨寬 320cm，角部開孔偏移嚴格校核 (V-01~05 Passed)。',
    hotspot: {
      x: 240,
      y: 40,
      label: '📐 順時針閉合回線 · 北向落地窗'
    }
  },
  {
    stepNumber: 3,
    title: '結構橫梁定位與淨高實測 (Beam Alignment)',
    subtitle: '第 3 步：標註橫梁距牆距離、梁寬與梁下標高',
    tag: '橫梁幾何',
    description: '實測關鍵承重橫梁！標定梁體從北牆出來多少公分 (Y:220cm)、橫梁截面寬度 (35cm) 與深 (55cm)，並實測梁下淨高 FL+265cm，確認是否符合 5 倍數契約規範。',
    cadRule: '剛性規範：梁下淨高不得低於 230cm (居室底線)，星玥灣標準契約裁決梁底為 FL+265cm (5倍數)。',
    hotspot: {
      x: 240,
      y: 220,
      label: '📏 大梁 B1 · 距北牆 220cm · 梁下 FL+265'
    }
  },
  {
    stepNumber: 4,
    title: '天花空調降板區規劃 (Ceiling Drop Zone)',
    subtitle: '第 4 步：規劃吊隱冷氣降板與出風口迴風箱',
    tag: '空調降板',
    description: '根據大梁與冷媒管穿樑套管位置，規劃天花降板區。主天花維持 FL+265cm，冷氣吊頂降板至 FL+230cm，玄關廚衛降板至 FL+215cm，避開結構橫梁雙重壓迫。',
    cadRule: '《降板裁決_v003.json》剛性契約：空調降板 FL+230cm 下緣緊貼集風箱，杜絕冷熱短循環與壓迫碰撞。',
    hotspot: {
      x: 240,
      y: 110,
      label: '❄️ 空調降板區 CH:230cm (5倍數)'
    }
  },
  {
    stepNumber: 5,
    title: '水電出線與開關插座 (MEP Outlets)',
    subtitle: '第 5 步：標定弱電專用迴路與照明開關出線高程',
    tag: '水電定位',
    description: '在牆面放樣出線孔位：電視主牆配置 110V 雙連插座與 CAT6 網路埠 (出線標高 FL+30cm)，門口配置照明雙切開關 (出線標高 FL+120cm)，並指定專用迴路編號。',
    cadRule: '強弱電管線間距需維持 15cm 以上避開電磁干擾，廚衛潮濕區必須具備漏電斷路器 (GFCI)。',
    hotspot: {
      x: 440,
      y: 200,
      label: '⚡ 主牆弱電插座 FL+30 · 照明開關 FL+120'
    }
  },
  {
    stepNumber: 6,
    title: '生成全套施工圖 (Print-Ready Sheets)',
    subtitle: '第 6 步：全自動出圖、圖紙張數與材質面積總表',
    tag: '印刷出圖',
    description: '恭喜完成正統丈量！系統已自動將丈量數據編入全套施工圖（A-00 圖紙目錄與材料總面積摘要、A-01 放樣尺寸圖、A-02 天花降板圖、A-03 水電圖、A-04 立面圖、A-05 施工序列圖），可直接一鍵閱覽最後印刷發包版本！',
    cadRule: '出圖標準：符合建築圖學 A3 橫式比例 1:50 / 1:30，三級工程簽核套板圖塊 (Corporate Title Block) 齊全。',
    hotspot: {
      x: 240,
      y: 275,
      label: '📑 一鍵閱覽全套施工圖 (最後印刷發包版)'
    }
  }
];

export const GuidedMeasurementTour: React.FC<GuidedMeasurementTourProps> = ({
  room,
  currentStep,
  isOpen,
  onStepChange,
  onClose,
  onApplyStepAction,
  onNavigateToConstructionSheets
}) => {
  if (!isOpen) return null;

  const step = TOUR_STEPS.find((s) => s.stepNumber === currentStep) || TOUR_STEPS[0];
  const isFirst = currentStep === 1;
  const isLast = currentStep === TOUR_STEPS.length;

  return (
    <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-[420px] z-30 bg-[#121810]/95 backdrop-blur-md border-2 border-[#E0A83C] rounded-2xl shadow-2xl shadow-black/80 text-[#F8F8F6] p-4 transition-all duration-300 animate-fadeIn">
      {/* Header with Step Tracker */}
      <div className="flex items-center justify-between border-b border-[#3F5B63]/40 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E0A83C] text-[#121810] flex items-center justify-center font-black text-xs shadow-md">
            {step.stepNumber}
          </div>
          <div>
            <div className="text-[10px] text-[#E0A83C] font-bold tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>正統現場丈量引導工法 ({step.stepNumber}/{TOUR_STEPS.length})</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide">{step.title}</h4>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#DDD7CE] hover:text-white hover:bg-[#3F5B63]/30 rounded-lg transition"
          title="關閉引導"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Pills Navigation */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {TOUR_STEPS.map((s) => (
          <button
            key={s.stepNumber}
            onClick={() => onStepChange(s.stepNumber)}
            className={`py-1 rounded-md text-[10px] font-bold transition-all text-center ${
              s.stepNumber === currentStep
                ? 'bg-[#E0A83C] text-[#121810] shadow-sm'
                : s.stepNumber < currentStep
                ? 'bg-[#23301F] text-emerald-300 border border-emerald-500/40'
                : 'bg-[#1A2417] text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
            title={`步驟 ${s.stepNumber}: ${s.tag}`}
          >
            {s.stepNumber} {s.tag.slice(0, 2)}
          </button>
        ))}
      </div>

      {/* Subtitle & Description */}
      <div className="space-y-2 mb-3.5">
        <p className="text-xs font-semibold text-[#DDD7CE] leading-snug">
          {step.subtitle}
        </p>
        <p className="text-[11px] text-slate-300 leading-relaxed bg-[#1A2417] p-2.5 rounded-xl border border-[#3F5B63]/30">
          {step.description}
        </p>

        {/* CAD & Geometry Rule Note */}
        <div className="flex items-start gap-2 bg-[#23301F]/70 border border-[#E0A83C]/30 rounded-xl p-2 text-[10px] text-amber-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#E0A83C] shrink-0 mt-0.5" />
          <span>{step.cadRule}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#3F5B63]/40">
        <button
          onClick={() => onStepChange(Math.max(1, currentStep - 1))}
          disabled={isFirst}
          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
            isFirst
              ? 'opacity-40 cursor-not-allowed text-[#8E8E93]'
              : 'bg-[#1A2417] hover:bg-[#3F5B63] text-[#DDD7CE]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 上一步
        </button>

        {/* Apply Step Action Button */}
        {currentStep < 6 ? (
          <button
            onClick={() => onApplyStepAction(currentStep)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>套用此步放樣</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (onNavigateToConstructionSheets) onNavigateToConstructionSheets();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E0A83C] hover:bg-[#c9922c] text-[#121810] shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>一鍵閱覽印刷圖紙</span>
          </button>
        )}

        <button
          onClick={() => onStepChange(Math.min(TOUR_STEPS.length, currentStep + 1))}
          disabled={isLast}
          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 font-bold transition ${
            isLast
              ? 'opacity-40 cursor-not-allowed text-[#8E8E93]'
              : 'bg-[#E0A83C] hover:bg-[#c9922c] text-[#121810]'
          }`}
        >
          下一步 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
