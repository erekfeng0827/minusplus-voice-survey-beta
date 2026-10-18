import React from 'react';
import {
  Ruler,
  Layers,
  LayoutGrid,
  Sparkles,
  FileText,
  Moon,
  Sun,
} from 'lucide-react';
interface CleanStepNavigationProps {
  currentStep: '1_survey' | '2_stitch' | '3_layout';
  onStepChange: (step: '1_survey' | '2_stitch' | '3_layout') => void;
  projectName: string;
  onOpenProjectWizard?: () => void;
  onOpenPdfImport?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const CleanStepHeader: React.FC<CleanStepNavigationProps> = ({
  currentStep,
  onStepChange,
  projectName,
  onOpenProjectWizard,
  onOpenPdfImport,
  theme = 'dark',
  onToggleTheme,
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
    <header className="survey-header z-30 flex w-full min-w-0 shrink-0 flex-col gap-2 border-b px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <img src="./minusplus-logo.png" alt="加減設計 MINUSPLUS DESIGN" className="h-8 w-24 object-contain object-left sm:h-10 sm:w-28" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#F8F8F6] tracking-wide truncate max-w-[200px] md:max-w-[320px]">{projectName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2417] text-amber-300 border border-amber-500/30">極簡引導流程</span>
          </div>
          <div className="hidden text-[10px] survey-muted sm:block">MINUS+ 幾何放樣流水線 · 各階段僅顯示專屬操作工具</div>
        </div>
        {onOpenProjectWizard && (
          <button onClick={onOpenProjectWizard} className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">開立新案場</span>
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
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="shrink-0 rounded-lg border border-[#3F5B63]/40 p-1.5 survey-text transition hover:bg-amber-500/15"
            aria-label={theme === 'dark' ? '切換白天模式' : '切換夜間模式'}
            title={theme === 'dark' ? '切換白天模式' : '切換夜間模式'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav aria-label="丈量工作階段" className="survey-nav grid w-full min-w-0 grid-cols-3 gap-1 rounded-xl border p-1 lg:w-auto lg:gap-3">
        {steps.map((st) => {
          const isActive = currentStep === st.id;
          return (
            <button key={st.id} onClick={() => onStepChange(st.id)} className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 py-1.5 transition-all cursor-pointer sm:px-3.5 ${isActive ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' : 'survey-muted hover:bg-amber-500/10'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${isActive ? 'bg-black text-amber-400' : 'bg-[#1A2417] text-neutral-300'}`}>{st.num}</div>
              <div className="min-w-0 text-left"><div className="truncate text-[10px] leading-none sm:text-xs">{st.title.replace(/階段[一二三]：/, '')}</div></div>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
