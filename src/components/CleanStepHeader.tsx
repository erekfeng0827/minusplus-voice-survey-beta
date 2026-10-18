import React, { useState } from 'react';
import {
  Ruler,
  Layers,
  LayoutGrid,
  Sparkles,
  FileText,
  Building,
} from 'lucide-react';
interface CleanStepNavigationProps {
  currentStep: '1_survey' | '2_stitch' | '3_layout';
  onStepChange: (step: '1_survey' | '2_stitch' | '3_layout') => void;
  projectName: string;
  onOpenProjectWizard?: () => void;
  onOpenPdfImport?: () => void;
}

export const CleanStepHeader: React.FC<CleanStepNavigationProps> = ({
  currentStep,
  onStepChange,
  projectName,
  onOpenProjectWizard,
  onOpenPdfImport,
}) => {
  const steps = [
    { id: '1_survey' as const, num: 1, title: '階段一：現場丈量', subtitle: '空間長寬 · RC挑高 · 梁位門窗 · 凹凸缺角', icon: Ruler, color: 'amber' },
    { id: '2_stitch' as const, num: 2, title: '階段二：空間拼湊與放樣圖', subtitle: '門洞咬合 · 自動共壁扣除 · 全案尺寸放樣圖', icon: Layers, color: 'cyan' },
    { id: '3_layout' as const, num: 3, title: '階段三：平面配置與深化', subtitle: '傢俱排版 · 動線規劃 · 3D模擬 · 施工圖匯出', icon: LayoutGrid, color: 'emerald' },
  ];

  const handleOpenPdfImport = () => {
    if (onOpenPdfImport) onOpenPdfImport();
  };

  return (
    <header className="w-full bg-[#121810]/95 backdrop-blur-md border-b border-[#3F5B63]/40 px-4 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">CAD</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#F8F8F6] tracking-wide truncate max-w-[200px] md:max-w-[320px]">{projectName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2417] text-amber-300 border border-amber-500/30">極簡引導流程</span>
          </div>
          <div className="text-[10px] text-neutral-400">MINUS+ 幾何放樣流水線 · 各階段僅顯示專屬操作工具</div>
        </div>
        {onOpenProjectWizard && (
          <button onClick={onOpenProjectWizard} className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" />
            <span>開立新案場</span>
          </button>
        )}
        {onOpenPdfImport && (
          <button
            onClick={handleOpenPdfImport}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">匯入建商圖/PDF</span>
          </button>
        )}
      </div>

      <nav className="flex items-center gap-1.5 md:gap-3 bg-[#0d140e] p-1 rounded-2xl border border-[#3F5B63]/40">
        {steps.map((st) => {
          const isActive = currentStep === st.id;
          return (
            <button key={st.id} onClick={() => onStepChange(st.id)} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1A2417]'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${isActive ? 'bg-black text-amber-400' : 'bg-[#1A2417] text-neutral-300'}`}>{st.num}</div>
              <div className="text-left hidden sm:block"><div className="text-xs leading-none">{st.title}</div></div>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
