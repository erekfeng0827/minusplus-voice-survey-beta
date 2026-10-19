import React, { useMemo, useState } from 'react';
import { ProjectShell } from '../types';
import { Check, MousePointer2, RotateCcw, Trash2, X } from 'lucide-react';

interface WholeHouseShellCanvasProps {
  shell: ProjectShell;
  compact?: boolean;
  editable?: boolean;
  onChange?: (shell: ProjectShell) => void;
}

export function updateProjectShellPoint(shell: ProjectShell, segmentId: string, pointIndex: number, axis: 'x' | 'y', raw: number): ProjectShell {
  if (!Number.isFinite(raw)) return shell;
  return { ...shell, segments: shell.segments.map((segment) => segment.id !== segmentId ? segment : { ...segment, points: segment.points.map((point, index) => index === pointIndex ? { ...point, [axis]: Math.max(0, raw) } : point) }) };
}

export function deleteProjectShellSegment(shell: ProjectShell, segmentId: string): ProjectShell {
  return { ...shell, segments: shell.segments.filter((segment) => segment.id !== segmentId) };
}

export const WholeHouseShellCanvas: React.FC<WholeHouseShellCanvasProps> = ({ shell, compact = false, editable = false, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ProjectShell | null>(null);
  const selected = shell.segments.find((segment) => segment.id === selectedId) || null;
  const pad = Math.max(shell.width, shell.length) * 0.035 || 20;
  const viewBox = `${-pad} ${-pad} ${shell.width + pad * 2} ${shell.length + pad * 2}`;
  const segmentCountLabel = useMemo(() => `${shell.segments.length} 条线段`, [shell.segments.length]);

  const commit = (next: ProjectShell) => {
    if (!snapshot) setSnapshot(structuredClone(shell));
    onChange?.(next);
  };

  const updatePoint = (pointIndex: number, axis: 'x' | 'y', raw: number) => {
    if (!selected || !Number.isFinite(raw)) return;
    commit(updateProjectShellPoint(shell, selected.id, pointIndex, axis, raw));
  };

  const deleteSelected = () => {
    if (!selected) return;
    commit(deleteProjectShellSegment(shell, selected.id));
    setSelectedId(null);
  };

  const undoSession = () => {
    if (!snapshot) return;
    onChange?.(snapshot);
    setSnapshot(null);
    setSelectedId(null);
  };

  return (
    <div className="survey-card flex h-full w-full min-h-0 flex-col overflow-hidden border">
      <div className="survey-border flex items-center justify-between border-b px-3 py-2 text-xs">
        <div className="min-w-0"><strong className="survey-text block truncate">{shell.sourceFileName}</strong><span className="survey-muted">{segmentCountLabel}</span></div>
        <div className="flex shrink-0 items-center gap-2"><span className="survey-muted">{Math.round(shell.width)} × {Math.round(shell.length)} cm</span>{editable && snapshot && <button type="button" onClick={undoSession} className="rounded-lg border survey-border p-2" aria-label="撤销本次底图编辑"><RotateCcw className="h-4 w-4" /></button>}</div>
      </div>
      {editable && <div className="survey-border flex items-center gap-2 border-b px-3 py-2 text-[11px]"><MousePointer2 className="h-4 w-4 text-[#B4503A]" /><span className="survey-muted">点选线段后，可直接修改每个端点坐标。</span></div>}
      <div className="relative min-h-0 flex-1 p-2 sm:p-4">
        <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="DXF 連續整戶底圖">
          <g fill="none" stroke="currentColor" className="survey-text" strokeWidth={compact ? 2.4 : 1.5} vectorEffect="non-scaling-stroke">
            {shell.segments.map((segment) => segment.points.length > 1 && (
              <polyline key={segment.id} points={segment.points.map((p) => `${p.x},${p.y}`).join(' ')} opacity={selectedId === segment.id ? 1 : segment.layer.includes('牆') ? 1 : 0.55} stroke={selectedId === segment.id ? '#B4503A' : 'currentColor'} strokeWidth={selectedId === segment.id ? 4 : undefined} className={editable ? 'cursor-pointer' : undefined} onClick={() => editable && setSelectedId(segment.id)} />
            ))}
          </g>
          <g fill="#E0A83C" fillOpacity="0.06" stroke="#E0A83C" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {shell.zones.map((zone) => <polygon key={zone.id} points={zone.polygon.map((p) => `${p.x},${p.y}`).join(' ')} />)}
          </g>
        </svg>
        {editable && selected && <div className="survey-card absolute inset-x-2 bottom-2 max-h-[52%] overflow-y-auto rounded-2xl border survey-border p-3 shadow-2xl sm:left-auto sm:right-4 sm:w-80">
          <div className="flex items-center justify-between gap-2"><div className="min-w-0"><strong className="survey-text block truncate">{selected.layer}</strong><span className="survey-muted text-[10px]">{selected.entityType} · {selected.points.length} 点</span></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-2" aria-label="关闭线段编辑"><X className="h-4 w-4" /></button></div>
          <div className="mt-2 grid grid-cols-2 gap-2">{selected.points.map((point, index) => <React.Fragment key={`${selected.id}-${index}`}><label className="survey-muted text-[10px]">点 {index + 1} · X<input type="number" min="0" step="1" value={Math.round(point.x * 100) / 100} onChange={(event) => updatePoint(index, 'x', Number(event.target.value))} className="survey-card survey-text mt-1 w-full rounded-lg border survey-border px-2 py-2 text-sm" /></label><label className="survey-muted text-[10px]">点 {index + 1} · Y<input type="number" min="0" step="1" value={Math.round(point.y * 100) / 100} onChange={(event) => updatePoint(index, 'y', Number(event.target.value))} className="survey-card survey-text mt-1 w-full rounded-lg border survey-border px-2 py-2 text-sm" /></label></React.Fragment>)}</div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={deleteSelected} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-500"><Trash2 className="h-4 w-4" />删除线段</button><button type="button" onClick={() => setSelectedId(null)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B4503A] px-3 py-2 text-xs font-bold text-white"><Check className="h-4 w-4" />完成</button></div>
        </div>}
      </div>
    </div>
  );
};
