import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectShell, RoomData, StitchedRoomPlacement } from '../types';
import { Check, MousePointer2, PenLine, RotateCcw, Trash2, X } from 'lucide-react';
import { readFileFromIndexedDb } from './FloorplanPdfImportModal';
import { syncFurnitureFromPlacedBlocks } from '../utils/placedBlockFurnitureSync';

interface WholeHouseShellCanvasProps {
  shell: ProjectShell;
  compact?: boolean;
  editable?: boolean;
  onChange?: (shell: ProjectShell) => void;
  rooms?: RoomData[];
  placements?: StitchedRoomPlacement[];
  onUpdateRoom?: (room: RoomData) => void;
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

export function wholeHouseFurniturePolygons(rooms: RoomData[], placements: StitchedRoomPlacement[]) {
  return placements.flatMap((placement) => {
    const room = rooms.find((candidate) => candidate.id === placement.roomId);
    if (!room) return [];
    return (room.placedBlocks || []).map((item) => {
      const itemRadians = ((item.rotationDeg || 0) * Math.PI) / 180;
      const roomRadians = (placement.rotation * Math.PI) / 180;
      const corners = [{ x: 0, y: 0 }, { x: item.widthCm, y: 0 }, { x: item.widthCm, y: item.depthCm }, { x: 0, y: item.depthCm }].map((corner) => {
        const localX = item.x + corner.x * Math.cos(itemRadians) - corner.y * Math.sin(itemRadians);
        const localY = item.y + corner.x * Math.sin(itemRadians) + corner.y * Math.cos(itemRadians);
        return {
          x: placement.x + localX * Math.cos(roomRadians) - localY * Math.sin(roomRadians),
          y: placement.y + localX * Math.sin(roomRadians) + localY * Math.cos(roomRadians),
        };
      });
      return { id: `${placement.roomId}:${item.id}`, roomId: placement.roomId, blockId: item.id, name: item.name, roomName: room.roomName, points: corners };
    });
  });
}

const projectPolygon = (points: Array<{ x: number; y: number }>, axis: { x: number; y: number }) => {
  const values = points.map((point) => point.x * axis.x + point.y * axis.y);
  return { min: Math.min(...values), max: Math.max(...values) };
};

export function polygonsOverlap(a: Array<{ x: number; y: number }>, b: Array<{ x: number; y: number }>): boolean {
  const axes: Array<{ x: number; y: number }> = [];
  for (const polygon of [a, b]) {
    for (let index = 0; index < polygon.length; index += 1) {
      const start = polygon[index];
      const end = polygon[(index + 1) % polygon.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy) || 1;
      axes.push({ x: -dy / length, y: dx / length });
    }
  }
  return axes.every((axis) => {
    const pa = projectPolygon(a, axis);
    const pb = projectPolygon(b, axis);
    return pa.max > pb.min && pb.max > pa.min;
  });
}

export function findFurnitureCollisions(items: ReturnType<typeof wholeHouseFurniturePolygons>): Set<string> {
  const collisions = new Set<string>();
  items.forEach((item, index) => items.slice(index + 1).forEach((other) => {
    if (!polygonsOverlap(item.points, other.points)) return;
    collisions.add(item.id);
    collisions.add(other.id);
  }));
  return collisions;
}

export const WholeHouseShellCanvas: React.FC<WholeHouseShellCanvasProps> = ({ shell, compact = false, editable = false, onChange, rooms = [], placements = [], onUpdateRoom }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ProjectShell | null>(null);
  const [underlayUrl, setUnderlayUrl] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const selected = shell.segments.find((segment) => segment.id === selectedId) || null;
  const pad = Math.max(shell.width, shell.length) * 0.035 || 20;
  const viewBox = `${-pad} ${-pad} ${shell.width + pad * 2} ${shell.length + pad * 2}`;
  const segmentCountLabel = useMemo(() => `${shell.segments.length} 条线段`, [shell.segments.length]);
  const furniturePolygons = useMemo(() => wholeHouseFurniturePolygons(rooms, placements), [rooms, placements]);
  const collisionIds = useMemo(() => findFurnitureCollisions(furniturePolygons), [furniturePolygons]);
  const selectedFurniture = furniturePolygons.find((item) => item.id === selectedFurnitureId) || null;
  const selectedFurnitureRoom = selectedFurniture ? rooms.find((room) => room.id === selectedFurniture.roomId) : null;
  const selectedBlock = selectedFurnitureRoom?.placedBlocks?.find((block) => block.id === selectedFurniture?.blockId) || null;

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

  const updateFurniture = (field: 'x' | 'y' | 'widthCm' | 'depthCm' | 'rotationDeg', value: number) => {
    if (!selectedFurnitureRoom || !selectedBlock || !onUpdateRoom || !Number.isFinite(value)) return;
    const placedBlocks = (selectedFurnitureRoom.placedBlocks || []).map((block) => block.id === selectedBlock.id ? { ...block, [field]: field === 'rotationDeg' ? value : Math.max(0, value) } : block);
    onUpdateRoom({ ...selectedFurnitureRoom, placedBlocks, furniture: syncFurnitureFromPlacedBlocks(selectedFurnitureRoom.furniture, placedBlocks), lastUpdated: new Date().toISOString() });
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
          <g fill="#B4503A" fillOpacity="0.16" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
            {furniturePolygons.map((item) => <polygon key={item.id} points={item.points.map((point) => `${point.x},${point.y}`).join(' ')} stroke={collisionIds.has(item.id) ? '#ef4444' : selectedFurnitureId === item.id ? '#E0A83C' : '#B4503A'} strokeWidth={collisionIds.has(item.id) || selectedFurnitureId === item.id ? 3 : 1.5} className={onUpdateRoom ? 'cursor-pointer' : undefined} onClick={(event) => { if (!onUpdateRoom) return; event.stopPropagation(); setSelectedFurnitureId(item.id); }}><title>{item.roomName} · {item.name}{collisionIds.has(item.id) ? ' · 配置碰撞' : ''}</title></polygon>)}
          </g>
        </svg>
        {editable && selectedBlock && selectedFurnitureRoom && <div className="survey-card absolute inset-x-2 bottom-2 max-h-[48%] overflow-y-auto rounded-2xl border survey-border p-3 shadow-2xl sm:left-auto sm:right-4 sm:w-80">
          <div className="flex items-center justify-between gap-2"><div className="min-w-0"><strong className="survey-text block truncate">{selectedBlock.name}</strong><span className={`text-[10px] ${collisionIds.has(selectedFurnitureId || '') ? 'text-red-500' : 'survey-muted'}`}>{selectedFurnitureRoom.roomName}{collisionIds.has(selectedFurnitureId || '') ? ' · 与其他家具重叠' : ' · 全局配置'}</span></div><button type="button" onClick={() => setSelectedFurnitureId(null)} className="rounded-lg p-2" aria-label="关闭家具编辑"><X className="h-4 w-4" /></button></div>
          <div className="mt-2 grid grid-cols-2 gap-2">{([['x', 'X', selectedBlock.x], ['y', 'Y', selectedBlock.y], ['widthCm', '宽', selectedBlock.widthCm], ['depthCm', '深', selectedBlock.depthCm], ['rotationDeg', '角度', selectedBlock.rotationDeg || 0]] as const).map(([field, label, value]) => <label key={field} className="survey-muted text-[10px]">{label}（{field === 'rotationDeg' ? '°' : 'cm'}）<input type="number" min="0" step={field === 'rotationDeg' ? 15 : 5} value={value} onChange={(event) => updateFurniture(field, Number(event.target.value))} className="survey-input mt-1 w-full rounded-lg border px-2 py-2 text-sm" /></label>)}</div>
        </div>}
        {editable && selected && <div className="survey-card absolute inset-x-2 bottom-2 max-h-[52%] overflow-y-auto rounded-2xl border survey-border p-3 shadow-2xl sm:left-auto sm:right-4 sm:w-80">
          <div className="flex items-center justify-between gap-2"><div className="min-w-0"><strong className="survey-text block truncate">{selected.layer}</strong><span className="survey-muted text-[10px]">{selected.entityType} · {selected.points.length} 点</span></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-2" aria-label="关闭线段编辑"><X className="h-4 w-4" /></button></div>
          <div className="mt-2 grid grid-cols-2 gap-2">{selected.points.map((point, index) => <React.Fragment key={`${selected.id}-${index}`}><label className="survey-muted text-[10px]">点 {index + 1} · X<input type="number" min="0" step="1" value={Math.round(point.x * 100) / 100} onChange={(event) => updatePoint(index, 'x', Number(event.target.value))} className="survey-card survey-text mt-1 w-full rounded-lg border survey-border px-2 py-2 text-sm" /></label><label className="survey-muted text-[10px]">点 {index + 1} · Y<input type="number" min="0" step="1" value={Math.round(point.y * 100) / 100} onChange={(event) => updatePoint(index, 'y', Number(event.target.value))} className="survey-card survey-text mt-1 w-full rounded-lg border survey-border px-2 py-2 text-sm" /></label></React.Fragment>)}</div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={deleteSelected} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-500"><Trash2 className="h-4 w-4" />删除线段</button><button type="button" onClick={() => setSelectedId(null)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B4503A] px-3 py-2 text-xs font-bold text-white"><Check className="h-4 w-4" />完成</button></div>
        </div>}
      </div>
    </div>
  );
};
