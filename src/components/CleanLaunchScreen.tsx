import React, { useState } from 'react';
import { ArrowRight, Building2, FolderOpen, Hammer, Home, LayoutTemplate, Moon, Sparkles, Sun } from 'lucide-react';
import type { ThemePreference } from '../utils/themePreference';

export type BuildingKind = 'apartment' | 'townhouse';
export type SiteCondition = 'new_build' | 'shell';

interface Props {
  hasSavedProject: boolean;
  savedProjectName: string;
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  onToggleTheme: () => void;
  onStartBlank: (kind: BuildingKind, condition: SiteCondition) => void;
  onUseExample: () => void;
  onContinue: () => void;
}

export const CleanLaunchScreen: React.FC<Props> = ({ hasSavedProject, savedProjectName, theme, themePreference, onToggleTheme, onStartBlank, onUseExample, onContinue }) => {
  const [kind, setKind] = useState<BuildingKind>('apartment');
  const [condition, setCondition] = useState<SiteCondition>('new_build');
  const [showExample, setShowExample] = useState(false);
  const Choice = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`survey-card flex min-h-24 items-center justify-center gap-3 rounded-2xl border p-5 text-lg font-bold transition ${active ? 'border-[#E0A83C] bg-[#E0A83C]/15 ring-2 ring-[#E0A83C]/35' : 'survey-border hover:border-[#E0A83C]/65'}`}>
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <main data-theme={theme} className="survey-app min-h-[100svh] overflow-y-auto">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))] sm:px-9">
        <header className="survey-border flex items-center justify-between border-b pb-4">
          <img src="./minusplus-logo.png" alt="加減設計 MINUSPLUS DESIGN" className="h-14 w-40 object-contain object-left" />
          <button type="button" onClick={onToggleTheme} aria-label={`主題：${themePreference === 'auto' ? '自動' : themePreference === 'light' ? '日間' : '夜間'}；點擊切換`} title="自動 → 日間 → 夜間" className="survey-card flex items-center gap-1.5 rounded-xl border px-2.5 py-2"><span className="text-[10px] font-bold">{themePreference === 'auto' ? '自動' : themePreference === 'light' ? '日間' : '夜間'}</span>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-7 text-center">
            <div className="mb-2 text-xs font-bold tracking-[0.2em] text-[#B4503A]">建立新案</div>
            <h1 className="survey-text font-['Noto_Serif_TC'] text-3xl font-black sm:text-5xl">先選房型，再開始丈量</h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="survey-muted mb-2 text-center text-xs font-bold">1　建築類型</div>
              <div className="grid grid-cols-2 gap-3">
                <Choice active={kind === 'apartment'} icon={<Building2 className="h-7 w-7 text-[#3F5B63]" />} label="大樓" onClick={() => setKind('apartment')} />
                <Choice active={kind === 'townhouse'} icon={<Home className="h-7 w-7 text-[#B4503A]" />} label="透天" onClick={() => setKind('townhouse')} />
              </div>
            </div>
            <div>
              <div className="survey-muted mb-2 text-center text-xs font-bold">2　現場狀態</div>
              <div className="grid grid-cols-2 gap-3">
                <Choice active={condition === 'new_build'} icon={<Sparkles className="h-7 w-7 text-[#E0A83C]" />} label="新成屋" onClick={() => setCondition('new_build')} />
                <Choice active={condition === 'shell'} icon={<Hammer className="h-7 w-7 text-[#B4503A]" />} label="毛胚" onClick={() => setCondition('shell')} />
              </div>
            </div>
          </div>

          <button type="button" onClick={() => onStartBlank(kind, condition)} className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#B4503A] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[#9b412f] active:scale-[0.99]">
            <span>開始新案例</span><ArrowRight className="h-5 w-5" />
          </button>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setShowExample(true)} className="survey-card survey-border flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 font-bold"><LayoutTemplate className="h-5 w-5 text-[#E0A83C]" />查看畫面範例</button>
            <button type="button" onClick={onContinue} disabled={!hasSavedProject} className="survey-card survey-border flex min-w-0 items-center justify-center gap-3 rounded-2xl border px-5 py-4 font-bold disabled:opacity-35"><FolderOpen className="h-5 w-5 text-[#3F5B63]" /><span className="truncate">{hasSavedProject ? savedProjectName : '沒有上次案件'}</span></button>
          </div>
        </section>
        {showExample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="平面圖範例">
            <div className="survey-card survey-border w-full max-w-3xl rounded-3xl border p-4 shadow-2xl sm:p-6">
              <div className="mb-3 flex items-center justify-between"><strong className="survey-text text-lg">完成後會長這樣</strong><button type="button" onClick={() => setShowExample(false)} className="survey-muted rounded-lg px-3 py-2 text-sm">關閉</button></div>
              <div className="survey-input rounded-2xl border p-3">
                <svg viewBox="0 0 720 430" className="h-auto w-full" aria-label="連續整戶平面圖示意">
                  <g fill="none" stroke="currentColor" strokeWidth="7" className="survey-text">
                    <path d="M50 40H670V390H50Z" /><path d="M280 40V230M470 40V230M280 230H670M470 230V390" />
                    <path d="M50 250H280M160 250V390" />
                  </g>
                  <g className="survey-muted" fill="currentColor" fontSize="18" textAnchor="middle">
                    <text x="165" y="150">客廳</text><text x="375" y="135">主臥</text><text x="570" y="135">房間</text><text x="165" y="325">玄關</text><text x="375" y="315">廚房</text><text x="570" y="315">衛浴</text>
                  </g>
                  <g stroke="#E0A83C" strokeWidth="5" fill="none"><path d="M110 390v-55a55 55 0 0 1 55 55" /><path d="M280 170h45a45 45 0 0 0-45-45" /></g>
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => setShowExample(false)} className="survey-card survey-border rounded-xl border px-4 py-3 font-bold">只看一下</button><button type="button" onClick={onUseExample} className="rounded-xl bg-[#B4503A] px-4 py-3 font-bold text-white">套用範例</button></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
