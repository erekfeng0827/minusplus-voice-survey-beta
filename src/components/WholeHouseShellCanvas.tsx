import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectShell } from '../types';
import { Check, MousePointer2, PenLine, RotateCcw, Trash2, X } from 'lucide-react';
import { readFileFromIndexedDb } from './FloorplanPdfImportModal';

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

export function appendProjectShellSegment(shell: ProjectShell, start: { x: number; y: number }, end: { x: number; y: number }): ProjectShell {
  const id = `manual-line-${Date.now()}-${shell.segments.length}`;
  return { ...shell, segments: [...shell.segments, { id, layer: 'WALL-MANUAL', entityType: 'LINE', points: [start, end], closed: false }] };
}

export const WholeHouseShellCanvas: React.FC<WholeHouseShellCanvasProps> = ({ shell, compact = false, editable = false, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ProjectShell | null>(null);
  const [underlayUrl, setUnderlayUrl] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const selected = shell.segments.find((segment) => segment.id === selectedId) || null;
  const pad = Math.max(shell.width, shell.length) * 0.035 || 20;
  const viewBox = `${-pad} ${-pad} ${shell.width + pad * 2} ${shell.length + pad * 2}`;
  const segmentCountLabel = useMemo(() => `${shell.segments.length} 条线段`, [shell.segments.length]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (!shell.underlay) { setUnderlayUrl(null); return; }
    void readFileFromIndexedDb(shell.underlay.storageKey).then((file) => {
      if (!file) return;
      objectUrl = URL.createObjectURL(file);
      setUnderlayUrl(objectUrl);
    }).catch(() => setUnderlayUrl(null));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [shell.underlay]);

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

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!editable || !drawingMode || !svgRef.current) return;
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svgRef.current.getScreenCTM();
    if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    const current = { x: Math.max(0, Math.min(shell.width, local.x)), y: Math.max(0, Math.min(shell.length, local.y)) };
    if (!drawingStart) { setDrawingStart(current); return; }
    commit(appendProjectShellSegment(shell, drawingStart, current));
    setDrawingStart(null);
  };

  return (
    <div className="survey-card flex h-full w-full min-h-0 flex-col overflow-hidden border">
      <div className="survey-border flex items-center justify-between border-b px-3 py-2 text-xs">
        <div className="min-w-0"><strong className="survey-text block truncate">{shell.sourceFileName}</strong><span className="survey-muted">{segmentCountLabel}</span></div>
        <div className="flex shrink-0 items-center gap-2"><span className="survey-muted">{Math.round(shell.width)} × {Math.round(shell.length)} cm</span>{editable && <button type="button" onClick={() => { setDrawingMode((value) => !value); setDrawingStart(null); }} className={`rounded-lg border p-2 ${drawingMode ? 'border-[#B4503A] bg-[#B4503A] text-white' : 'survey-border'}`} aria-label="新增描线"><PenLine className="h-4 w-4" /></button>}{editable && snapshot && <button type="button" onClick={undoSession} className="rounded-lg border survey-border p-2" aria-label="撤销本次底图编辑"><RotateCcw className="h-4 w-4" /></button>}</div>
      </div>
      {editable && <div className="survey-border flex items-center gap-2 border-b px-3 py-2 text-[11px]"><MousePointer2 className="h-4 w-4 text-[#B4503A]" /><span className="survey-muted">{drawingMode ? (drawingStart ? '再点一次确定线段终点。' : '点底图确定线段起点。') : '点选线段可修改坐标；按描线图示可新增墙线。'}</span></div>}
      <div className="relative min-h-0 flex-1 p-2 sm:p-4">
        {underlayUrl && shell.sourceFormat === 'PDF' && <object data={`${underlayUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=Fit`} type="application/pdf" aria-label="PDF 描线底图" className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] opacity-55 sm:inset-4 sm:h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)]" />}
        <svg ref={svgRef} viewBox={viewBox} className={`relative h-full w-full ${drawingMode ? 'cursor-crosshair' : ''}`} preserveAspectRatio="xMidYMid meet" aria-label="连续整户底图" onClick={handleCanvasClick}>
          {underlayUrl && shell.sourceFormat === 'IMAGE' && <image href={underlayUrl} x="0" y="0" width={shell.width} height={shell.length} preserveAspectRatio="none" opacity={shell.underlay?.opacity ?? 0.55} />}
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
