import React, { useState } from 'react';
import {
  Ruler,
  Layers,
  LayoutGrid,
  FileText,
  Moon,
  Sun,
  Check,
  ChevronDown,
  FolderPlus,
} from 'lucide-react';
import type { ThemePreference } from '../utils/themePreference';
interface CleanStepNavigationProps {
  currentStep: '1_survey' | '2_stitch' | '3_layout';
  onStepChange: (step: '1_survey' | '2_stitch' | '3_layout') => void;
  projectName: string;
  onOpenProjectWizard?: () => void;
  onOpenPdfImport?: () => void;
  theme?: 'light' | 'dark';
  themePreference?: ThemePreference;
  onToggleTheme?: () => void;
  completedSteps?: Array<'1_survey' | '2_stitch' | '3_layout'>;
}

export const CleanStepHeader: React.FC<CleanStepNavigationProps> = ({
  currentStep,
  onStepChange,
  projectName,
  onOpenProjectWizard,
  onOpenPdfImport,
  theme = 'dark',
  themePreference = 'auto',
  onToggleTheme,
  completedSteps = [],
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const steps = [
    { id: '1_survey' as const, num: 1, title: '階段一：現場丈量', subtitle: '空間長寬 · RC挑高 · 梁位門窗 · 凹凸缺角', icon: Ruler, color: 'amber' },
    { id: '2_stitch' as const, num: 2, title: '階段二：空間拼湊與放樣圖', subtitle: '門洞咬合 · 自動共壁扣除 · 全案尺寸放樣圖', icon: Layers, color: 'cyan' },
    { id: '3_layout' as const, num: 3, title: '階段三：平面配置與深化', subtitle: '傢俱排版 · 動線規劃 · 3D模擬 · 施工圖匯出', icon: LayoutGrid, color: 'emerald' },
  ];
  const handleOpenPdfImport = () => {
    if (onOpenPdfImport) onOpenPdfImport();
  };

  return (
    <header className="survey-header survey-safe-header z-30 flex w-full min-w-0 shrink-0 flex-col gap-2 border-b px-3 pb-2.5 shadow-lg backdrop-blur-md sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <img src="./minusplus-logo.png" alt="加減設計 MINUSPLUS DESIGN" className="h-8 w-24 object-contain object-left sm:h-10 sm:w-28" />
        <div>
          <div className="flex items-center gap-2">
            <span className="survey-text max-w-[200px] truncate text-sm font-bold tracking-wide md:max-w-[320px]">{projectName}</span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600">極簡引導流程</span>
          </div>
          <div className="hidden text-[10px] survey-muted sm:block">MINUS+ 幾何放樣流水線 · 各階段僅顯示專屬操作工具</div>
        </div>
        <div className="relative ml-auto lg:ml-2">
          <button onClick={() => setProjectMenuOpen((value) => !value)} className="flex items-center gap-1 rounded-lg border border-[#3F5B63]/40 px-2.5 py-1.5 text-xs font-semibold survey-text transition hover:bg-amber-500/10">
            專案 <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {projectMenuOpen && <div className="survey-card absolute right-0 top-10 z-50 w-48 rounded-xl border p-2 shadow-2xl">
            {onOpenProjectWizard && <button onClick={() => { setProjectMenuOpen(false); onOpenProjectWizard(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold survey-text hover:bg-amber-500/10"><FolderPlus className="h-4 w-4 text-[#B4503A]" />開立新案場</button>}
            {onOpenPdfImport && <button onClick={() => { setProjectMenuOpen(false); handleOpenPdfImport(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold survey-text hover:bg-amber-500/10"><FileText className="h-4 w-4 text-[#3F5B63]" />匯入圖面</button>}
          </div>}
        </div>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="shrink-0 rounded-lg border border-[#3F5B63]/40 p-1.5 survey-text transition hover:bg-amber-500/15"
            aria-label={`主題：${themePreference === 'auto' ? '自動' : themePreference === 'light' ? '日間' : '夜間'}；點擊切換`}
            title="自動 → 日間 → 夜間"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav aria-label="丈量工作階段" className="survey-nav grid w-full min-w-0 grid-cols-3 gap-1 rounded-xl border p-1 lg:w-auto lg:gap-3">
        {steps.map((st) => {
          const isActive = currentStep === st.id;
          const isCompleted = completedSteps.includes(st.id);
          return (
            <button key={st.id} onClick={() => onStepChange(st.id)} className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 transition-all cursor-pointer sm:px-3.5 ${isActive ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' : isCompleted ? 'bg-[#3F5B63] text-white' : 'bg-[#172019] text-[#8f958b] hover:bg-[#23301F]'}`}>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-xs font-bold ${isActive ? 'bg-black text-amber-400' : isCompleted ? 'bg-[#F8F8F6] text-[#3F5B63]' : 'bg-black text-[#DDD7CE]'}`}>{isCompleted ? <Check className="h-3 w-3" /> : st.num}</div>
              <div className="min-w-0 text-left"><div className="truncate text-[10px] leading-none sm:text-xs">{st.title.replace(/階段[一二三]：/, '')}</div><div className="mt-1 hidden text-[9px] opacity-70 sm:block">{isActive ? '現在進行' : isCompleted ? '已完成' : '尚未開始'}</div></div>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
