import React from 'react';
import { ArrowRight, FolderOpen, LayoutTemplate, Plus } from 'lucide-react';

interface Props {
  hasSavedProject: boolean;
  savedProjectName: string;
  onStartBlank: () => void;
  onUseExample: () => void;
  onContinue: () => void;
}

export const CleanLaunchScreen: React.FC<Props> = ({ hasSavedProject, savedProjectName, onStartBlank, onUseExample, onContinue }) => (
  <main className="min-h-[100svh] overflow-y-auto bg-[#F8F8F6] text-[#23301F]">
    <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-6 pb-10 pt-[max(32px,env(safe-area-inset-top))] sm:px-10 lg:px-16">
      <header className="flex items-center justify-between border-b border-[#DDD7CE] pb-6">
        <div className="flex items-center gap-4">
          <img src="./minusplus-logo.png" alt="加減設計 MINUSPLUS DESIGN" className="h-16 w-44 object-contain object-left" />
          <div className="hidden border-l border-[#DDD7CE] pl-4 sm:block">
            <div className="font-['Archivo'] text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5B63]">Minusplus Design</div>
            <div className="mt-1 font-['Noto_Sans_TC'] text-sm text-[#23301F]/65">室內設計數位工作台</div>
          </div>
        </div>
        <span className="rounded-full border border-[#3F5B63]/25 px-3 py-1.5 font-['Archivo'] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3F5B63]">Field Beta</span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="mb-4 font-['Archivo'] text-xs font-semibold uppercase tracking-[0.24em] text-[#B4503A]">Measure · Arrange · Build</p>
          <h1 className="font-['Noto_Serif_TC'] text-4xl font-black leading-[1.2] tracking-[-0.035em] text-[#23301F] sm:text-6xl">从现场丈量开始，<br />一步一步完成空间。</h1>
          <p className="mt-6 max-w-xl font-['Noto_Sans_TC'] text-base leading-8 text-[#23301F]/65 sm:text-lg">先选择一种开始方式。进入工作台后，每个画面只显示当前阶段需要的工具。</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <button type="button" onClick={onStartBlank} className="group min-h-44 rounded-3xl bg-[#23301F] p-6 text-left text-[#F8F8F6] shadow-[0_18px_45px_rgba(35,48,31,0.18)] transition hover:-translate-y-1 active:translate-y-0">
            <Plus className="h-7 w-7" />
            <strong className="mt-8 block font-['Noto_Serif_TC'] text-2xl">开始空白案</strong>
            <span className="mt-2 block text-sm text-[#F8F8F6]/75">从玄关起点开始口说丈量</span>
          </button>

          <button type="button" onClick={onUseExample} className="group min-h-44 rounded-3xl border border-[#DDD7CE] bg-white p-6 text-left shadow-[0_18px_45px_rgba(35,48,31,0.06)] transition hover:-translate-y-1 hover:border-[#E0A83C] active:translate-y-0">
            <LayoutTemplate className="h-7 w-7 text-[#E0A83C]" />
            <strong className="mt-8 block font-['Noto_Serif_TC'] text-2xl">看看完整范例</strong>
            <span className="mt-2 block text-sm text-[#23301F]/60">直接查看完成配置能呈现什么</span>
          </button>

          <button type="button" onClick={onContinue} disabled={!hasSavedProject} className="group min-h-44 rounded-3xl border border-[#DDD7CE] bg-[#EEEAE3] p-6 text-left transition enabled:hover:-translate-y-1 enabled:hover:border-[#3F5B63] disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-0">
            <FolderOpen className="h-7 w-7 text-[#B4503A]" />
            <strong className="mt-8 block font-['Noto_Serif_TC'] text-2xl">继续上次</strong>
            <span className="mt-2 flex items-center justify-between gap-3 text-sm text-[#23301F]/60"><span className="truncate">{hasSavedProject ? savedProjectName : '尚无储存中的案场'}</span><ArrowRight className="h-4 w-4 shrink-0" /></span>
          </button>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DDD7CE] pt-5 text-xs text-[#23301F]/45">
        <span>加減設計 · 空間設計工具</span><span>iPhone / iPad / Desktop</span>
      </footer>
    </div>
  </main>
);
