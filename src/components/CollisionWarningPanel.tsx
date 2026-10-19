import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Wand2,
  ChevronRight,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FurnitureItem, CollisionWarningIssue, CollisionOptimizationSolution } from '../types';

interface CollisionWarningPanelProps {
  issues: CollisionWarningIssue[];
  furnitureList: FurnitureItem[];
  onApplySolution: (furnitureId: string, solution: CollisionOptimizationSolution) => void;
  onApplyAllOptimizations: () => void;
  onResetToConflictPreset: () => void;
  onResetToOptimizedPreset: () => void;
  selectedFurnitureId: string | null;
  onSelectFurniture: (id: string | null) => void;
  collisionWarningEnabled: boolean;
  onToggleWarning: (enabled: boolean) => void;
  showDemoPresets?: boolean;
}

export const CollisionWarningPanel: React.FC<CollisionWarningPanelProps> = ({
  issues,
  furnitureList,
  onApplySolution,
  onApplyAllOptimizations,
  onResetToConflictPreset,
  onResetToOptimizedPreset,
  selectedFurnitureId,
  onSelectFurniture,
  collisionWarningEnabled,
  onToggleWarning,
  showDemoPresets = false,
}) => {
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${issues.length > 0 ? 'bg-red-950 text-red-400 border border-red-800/50 animate-pulse' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'}`}>
            {issues.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>碰撞預警系統</span>
              <span className="text-[10px] text-slate-400 font-normal">幾何契約</span>
            </h4>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {issues.length > 0 ? (
                <span className="text-red-400 font-semibold">
                  偵測到 {issues.length} 處幾何干涉 ({criticalCount} 重度 / {warningCount} 模數)
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  ✓ 全部物件通過 5 倍數與梁板高程檢核
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleWarning(!collisionWarningEnabled)}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
              collisionWarningEnabled
                ? 'bg-red-950/80 border-red-700 text-red-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="開啟/關閉 3D 場景紅框標示"
          >
            {collisionWarningEnabled ? '預警標示 (開)' : '預警標示 (關)'}
          </button>
        </div>
      </div>

      {/* Preset Switchers & Quick Fix Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {showDemoPresets && <div className="flex items-center gap-1">
          <button
            onClick={onResetToConflictPreset}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
            title="載入典型室內設計違規碰撞情境"
          >
            載入違規衝突情境
          </button>
          <button
            onClick={onResetToOptimizedPreset}
            className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] border border-emerald-700/60 transition"
            title="載入 100% 合規避讓成果"
          >
            合規優化情境
          </button>
        </div>}

        {issues.length > 0 && (
          <button
            onClick={onApplyAllOptimizations}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition active:scale-95"
            title="依幾何契約原則，一鍵全部修復並符合 5 倍數"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>一鍵自動優化</span>
          </button>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {furnitureList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/60 border border-slate-700/50 rounded-xl my-4">
            <Layers className="h-8 w-8 text-slate-400" />
            <div><h5 className="font-bold text-white text-sm">目前空间尚无家具</h5><p className="mt-1 text-[11px] leading-relaxed text-slate-400">请先在平面配置加入家具或柜体；3D 将读取同一份案件资料，不再自动放入示范物件。</p></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl my-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">3D 空間幾何契約全部合規</h5>
              <p className="text-[11px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                目前资料未侦测到碰撞；这是即时检查结果，仍需施工图回读与独立验收。
              </p>
            </div>
            {showDemoPresets && <button
              onClick={onResetToConflictPreset}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-2"
            >
              <RotateCcw className="w-3 h-3" />
              點擊重新模擬衝突情境
            </button>}
          </div>
        ) : (
          issues.map((issue) => {
            const isSelected = selectedFurnitureId === issue.furnitureId;
            return (
              <div
                key={issue.id}
                onClick={() => onSelectFurniture(issue.furnitureId)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-red-500 shadow-lg shadow-red-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Issue Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{issue.furnitureName}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-red-400 font-semibold mt-0.5 flex items-center gap-1">
                      <span>碰撞實體：</span>
                      <span className="text-white underline">{issue.collidingWithTitle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900">
                      +{issue.penetrationCm} cm 干涉
                    </span>
                  </div>
                </div>

                {/* Clause & Description */}
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-slate-900/90 p-2 rounded border border-slate-800">
                  {issue.issueDescription}
                </p>

                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>契約依據：{issue.contractRuleClause}</span>
                </div>

                {/* Optimization Solutions */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>合規優化方案 (點擊立即生效)：</span>
                  </div>

                  {issue.solutions.map((sol) => (
                    <button
                      key={sol.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplySolution(issue.furnitureId, sol);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 transition group flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-white group-hover:text-cyan-300 text-[11px]">
                          {sol.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {sol.description}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        室內設計《降板裁決_v003》高層契約：梁下 265cm · 降板 230cm · 衛廚 215cm
      </div>
    </div>
  );
};
