import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, LayoutGrid, Mic, Plus, RotateCw, Save, Sparkles, Trash2, X } from 'lucide-react';
import { FurnitureItem, RoomData } from '../types';
import {
  FURNITURE_MARKETPLACE_CATALOG,
  FURNITURE_TEMPLATES,
  FurnitureMarketplaceCategory,
  FurnitureTemplate,
  LayoutStyle,
  RoomKind,
  STYLE_RULES,
} from '../data/furnitureTemplates';

interface AutoSpaceLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  rooms: RoomData[];
  onApplyOptimizedLayout: (roomId: string, newFurniture: FurnitureItem[]) => void;
  onNotify?: (msg: string) => void;
}

const CATEGORIES: { id: FurnitureMarketplaceCategory | 'all'; label: string }[] = [
  { id: 'all', label: '全部' }, { id: 'wardrobe', label: '衣櫃' }, { id: 'tv_cabinet', label: '電視櫃' },
  { id: 'storage', label: '收納' }, { id: 'sofa', label: '沙發' }, { id: 'bed', label: '床組' },
  { id: 'table', label: '桌類' }, { id: 'chair', label: '椅類' },
];

export type CabinetWall = 'top' | 'bottom' | 'left' | 'right';
export interface CabinetCommand {
  wall: CabinetWall;
  fillWall: boolean;
  width?: number;
  depth: number;
  height: number;
  compartments: number;
  sourceText: string;
}
export type CabinetCommandResult = { ok: true; value: CabinetCommand } | { ok: false; missing: string[] };

export const parseCabinetCommand = (sourceText: string): CabinetCommandResult => {
  const text = sourceText.replace(/[，,。；;]/g, ' ').replace(/\s+/g, ' ').trim();
  const wallMatches: { wall: CabinetWall; pattern: RegExp }[] = [
    { wall: 'top', pattern: /(上|北)(牆|墙)/ }, { wall: 'bottom', pattern: /(下|南)(牆|墙)/ },
    { wall: 'left', pattern: /(左|西)(牆|墙)/ }, { wall: 'right', pattern: /(右|東|东)(牆|墙)/ },
  ];
  const wall = wallMatches.find((candidate) => candidate.pattern.test(text))?.wall;
  const fillWall = /(從|从)?牆到牆|(从|從)?墙到墙|做滿|做满|滿牆|满墙/.test(text);
  const numberAfter = (pattern: RegExp) => Number(text.match(pattern)?.[1] || 0) || undefined;
  const width = numberAfter(/(?:寬|宽)\s*(\d+(?:\.\d+)?)/);
  const depth = numberAfter(/(?:進深|进深|深)\s*(\d+(?:\.\d+)?)/);
  const height = numberAfter(/高\s*(\d+(?:\.\d+)?)/);
  const compartments = numberAfter(/(?:分|做)\s*(\d+)\s*格/);
  const missing: string[] = [];
  if (!/(衣櫃|衣柜)/.test(text)) missing.push('家具类型（衣柜）');
  if (!wall) missing.push('墙位（上/下/左/右或东/南/西/北墙）');
  if (!fillWall && !width) missing.push('宽度（明确数值或“从墙到墙做满”）');
  if (!depth) missing.push('深度');
  if (!height) missing.push('高度');
  if (!compartments) missing.push('分格数');
  if (missing.length || !wall || !depth || !height || !compartments) return { ok: false, missing };
  return { ok: true, value: { wall, fillWall, width, depth, height, compartments, sourceText } };
};

export const cabinetCommandToFurniture = (command: CabinetCommand, room: Pick<RoomData, 'id' | 'width' | 'length'>, id = `wardrobe-command-${Date.now()}`): FurnitureItem => {
  const snap = (value: number) => Math.round(value / 5) * 5;
  const wallRun = command.wall === 'top' || command.wall === 'bottom' ? room.width : room.length;
  const run = command.fillWall ? Math.floor(wallRun / 5) * 5 : snap(command.width!);
  const thickness = snap(command.depth);
  const horizontal = command.wall === 'top' || command.wall === 'bottom';
  const width = horizontal ? run : thickness;
  const depth = horizontal ? thickness : run;
  const rawX = command.wall === 'right' ? room.width - width : 0;
  const rawY = command.wall === 'bottom' ? room.length - depth : 0;
  return {
    id, name: `参数式衣柜（${command.compartments}格）`, category: 'wardrobe',
    x: snap(rawX), y: snap(rawY), width, depth, height: snap(command.height), elevation: 0,
    rotationY: 0, colorHex: '#3F5B63',
    specNote: `参数口令；墙位:${command.wall}；${command.fillWall ? '从墙到墙做满' : `宽:${run}cm`}；深:${thickness}cm；高:${snap(command.height)}cm；分格:${command.compartments}；原文:${command.sourceText}`,
  };
};

const rotatedSize = (item: FurnitureItem) => item.rotationY === 90 || item.rotationY === 270
  ? { width: item.depth, depth: item.width } : { width: item.width, depth: item.depth };

const inspectGeometry = (items: FurnitureItem[], room: RoomData, minWalkwayWidth: number, reserveBeamClearance: boolean) => {
  const issues: string[] = [];
  items.forEach((item) => {
    const size = rotatedSize(item);
    if (item.x < 0 || item.y < 0 || item.x + size.width > room.width || item.y + size.depth > room.length) {
      issues.push(`${item.name} 超出房間邊界`);
    }
    if (reserveBeamClearance && item.elevation + item.height > room.beamHeight - 5) {
      issues.push(`${item.name} 未達梁下 5cm 預留`);
    }
  });
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i]; const b = items[j]; const as = rotatedSize(a); const bs = rotatedSize(b);
      const overlapX = Math.min(a.x + as.width, b.x + bs.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + as.depth, b.y + bs.depth) - Math.max(a.y, b.y);
      if (overlapX > 0 && overlapY > 0) issues.push(`${a.name} 與 ${b.name} 矩形碰撞`);
      else {
        const gapX = Math.max(b.x - (a.x + as.width), a.x - (b.x + bs.width), 0);
        const gapY = Math.max(b.y - (a.y + as.depth), a.y - (b.y + bs.depth), 0);
        const clearance = overlapX > 0 ? gapY : overlapY > 0 ? gapX : Math.hypot(gapX, gapY);
        if (clearance > 0 && clearance < minWalkwayWidth) {
          issues.push(`${a.name} 與 ${b.name} 淨距 ${Math.round(clearance)}cm，小於 ${minWalkwayWidth}cm`);
        }
      }
    }
  }
  return issues;
};

export const AutoSpaceLayoutModal: React.FC<AutoSpaceLayoutModalProps> = ({
  isOpen, onClose, room, onApplyOptimizedLayout, onNotify,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<LayoutStyle>('ergonomic');
  const [snapTo5xMultiples, setSnapTo5xMultiples] = useState(true);
  const [reserveBeamClearance, setReserveBeamClearance] = useState(true);
  const [minWalkwayWidth, setMinWalkwayWidth] = useState(90);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [category, setCategory] = useState<FurnitureMarketplaceCategory | 'all'>('all');
  const [templateKey, setTemplateKey] = useState(FURNITURE_MARKETPLACE_CATALOG[0].key);
  const [cabinetText, setCabinetText] = useState('');
  const [cabinetResult, setCabinetResult] = useState<CabinetCommandResult | null>(null);
  const [isListening, setIsListening] = useState(false);

  const snap = (value: number) => snapTo5xMultiples ? Math.round(value / 5) * 5 : Math.round(value);
  const generateCandidates = () => {
    const isLiving = room.id.includes('living') || room.roomName.includes('客廳');
    const isMaster = room.id.includes('master') || room.roomName.includes('主臥');
    const kind: RoomKind = isLiving ? 'living' : isMaster ? 'master' : 'bedroom';
    const rule = STYLE_RULES[selectedStyle];
    return FURNITURE_TEMPLATES[kind].map((template, index) => {
      const width = snap(template.width * (template.category === 'wardrobe' ? rule.sizeFactor : 1));
      const depth = snap(template.depth); const edge = snap(rule.edge);
      const positions = {
        top: { x: edge, y: edge }, bottom: { x: edge, y: room.length - depth - edge },
        left: { x: edge, y: edge + index * (depth + minWalkwayWidth) },
        right: { x: room.width - width - edge, y: edge },
        center: { x: (room.width - width) / 2, y: (room.length - depth) / 2 },
      };
      const pos = positions[template.wall];
      const height = reserveBeamClearance && template.height >= room.beamHeight
        ? Math.max(0, room.beamHeight - 5 - (template.elevation ?? 0)) : template.height;
      return {
        id: `auto_${room.id}_${template.key}`, name: template.name, category: template.category,
        width, depth, height: snap(height), elevation: template.elevation ?? 0,
        x: snap(pos.x), y: snap(pos.y), rotationY: 0, colorHex: template.colorHex,
        specNote: `${template.note}；策略：${rule.label}`,
      } satisfies FurnitureItem;
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    setItems(room.furniture?.length ? room.furniture : generateCandidates());
    setSelectedItemId('');
  }, [isOpen, room.id]);

  const filteredTemplates = useMemo(() => FURNITURE_MARKETPLACE_CATALOG.filter(
    (template) => template.availability === 'available' && (category === 'all' || template.marketplaceCategory === category),
  ), [category]);
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const geometryIssues = inspectGeometry(items, room, minWalkwayWidth, reserveBeamClearance);

  const updateItem = (id: string, patch: Partial<FurnitureItem>) => setItems((current) => current.map(
    (item) => item.id === id ? { ...item, ...patch } : item,
  ));

  const addTemplate = () => {
    const template = FURNITURE_MARKETPLACE_CATALOG.find((candidate) => candidate.key === templateKey) ?? filteredTemplates[0];
    if (!template) return;
    const item: FurnitureItem = {
      id: `manual_${room.id}_${template.key}_${Date.now()}`, name: template.name, category: template.category,
      width: template.width, depth: template.depth, height: template.height, elevation: template.elevation ?? 0,
      x: snap(Math.max(0, (room.width - template.width) / 2)), y: snap(Math.max(0, (room.length - template.depth) / 2)),
      rotationY: 0, colorHex: template.colorHex, specNote: `${template.note}；來源：${template.source.reference}`,
    };
    setItems((current) => [...current, item]); setSelectedItemId(item.id);
  };

  const reviewCabinetCommand = () => setCabinetResult(parseCabinetCommand(cabinetText));
  const confirmCabinetCommand = () => {
    if (!cabinetResult?.ok) return;
    const item = cabinetCommandToFurniture(cabinetResult.value, room);
    setItems((current) => [...current, item]);
    setSelectedItemId(item.id);
    setCabinetResult(null);
    setCabinetText('');
  };
  const startSpeechInput = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setCabinetResult({ ok: false, missing: ['此浏览器不支持语音辨识，请使用文字输入'] });
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'zh-TW'; recognition.interimResults = false; recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); setCabinetResult({ ok: false, missing: ['语音辨识失败，请重试或改用文字输入'] }); };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      setCabinetText(transcript);
      setCabinetResult(parseCabinetCommand(transcript));
    };
    recognition.start();
  };

  const saveLayout = () => {
    onApplyOptimizedLayout(room.id, items);
    onNotify?.(`已保存「${room.roomName}」2D 家具配置（${items.length} 件）至现有专案；重开此空间可继续编辑。`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#3F5B63]/60 bg-[#121810] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3F5B63]/40 bg-[#1A2417] px-5 py-4">
          <div><h2 className="flex items-center gap-2 text-lg font-black text-white"><LayoutGrid className="h-5 w-5 text-emerald-300" />2D 家具配置</h2><p className="text-xs text-[#DDD7CE]/70">{room.roomName} · {room.width}×{room.length}cm · 配置草案，非自动设计或施工图</p></div>
          <button onClick={onClose} className="rounded-xl bg-[#23301F] p-2 text-[#DDD7CE]"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
          <section className="space-y-3 rounded-2xl border border-[#3F5B63]/40 bg-[#161F13] p-3">
            <h3 className="text-xs font-bold text-amber-300">家具模板（{FURNITURE_MARKETPLACE_CATALOG.length} 组）</h3>
            <div className="flex flex-wrap gap-1">{CATEGORIES.map((entry) => <button key={entry.id} onClick={() => { setCategory(entry.id); const first = FURNITURE_MARKETPLACE_CATALOG.find((t) => entry.id === 'all' || t.marketplaceCategory === entry.id); if (first) setTemplateKey(first.key); }} className={`rounded px-2 py-1 text-[10px] ${category === entry.id ? 'bg-amber-500 text-black' : 'bg-[#23301F] text-[#DDD7CE]'}`}>{entry.label}</button>)}</div>
            <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} className="w-full rounded-lg border border-[#3F5B63] bg-[#121810] p-2 text-xs text-white">
              {filteredTemplates.map((template) => <option key={template.key} value={template.key}>{template.name} · {template.width}×{template.depth}</option>)}
            </select>
            <button onClick={addTemplate} disabled={!filteredTemplates.length} className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black"><Plus className="h-4 w-4" />加入房间中央</button>
            <div className="space-y-2 border-t border-[#3F5B63]/40 pt-3">
              <h4 className="text-xs font-bold text-cyan-300">参数式衣柜口令</h4>
              <textarea value={cabinetText} onChange={(event) => { setCabinetText(event.target.value); setCabinetResult(null); }} placeholder="右墙衣柜从墙到墙做满，深60，高240，分14格" className="h-20 w-full rounded-lg border border-[#3F5B63] bg-[#121810] p-2 text-xs text-white" />
              <div className="grid grid-cols-2 gap-2"><button onClick={startSpeechInput} className="flex items-center justify-center gap-1 rounded-lg bg-[#23301F] p-2 text-xs text-cyan-200"><Mic className="h-4 w-4" />{isListening ? '聆听中…' : '语音输入'}</button><button onClick={reviewCabinetCommand} className="rounded-lg bg-amber-500 p-2 text-xs font-bold text-black">解析并确认</button></div>
              {cabinetResult && (cabinetResult.ok ? <div className="space-y-2 rounded-lg border border-emerald-500/50 bg-emerald-950/30 p-2 text-[10px] text-emerald-200"><div className="font-bold">写入前确认摘要</div><div>墙位：{cabinetResult.value.wall}墙</div><div>宽：{cabinetResult.value.fillWall ? '从墙到墙做满' : `${cabinetResult.value.width}cm`} · 深：{cabinetResult.value.depth}cm · 高：{cabinetResult.value.height}cm</div><div>分格：{cabinetResult.value.compartments}格 · 尺寸与坐标将吸附 5cm</div><button onClick={confirmCabinetCommand} className="w-full rounded bg-emerald-500 p-2 font-bold text-black">确认加入画布</button></div> : <div className="rounded-lg border border-rose-500/50 bg-rose-950/30 p-2 text-[10px] text-rose-200"><div className="font-bold">无法建立，缺少字段：</div>{cabinetResult.missing.map((field) => <div key={field}>• {field}</div>)}</div>)}
            </div>
            <div className="border-t border-[#3F5B63]/40 pt-3">
              <label className="text-[10px] text-[#DDD7CE]">候选策略</label>
              <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value as LayoutStyle)} className="mt-1 w-full rounded bg-[#121810] p-2 text-xs text-white"><option value="ergonomic">人因动线</option><option value="spacious">视野开阔</option><option value="storage_max">收纳优先</option></select>
              <button onClick={() => { const generated = generateCandidates(); setItems(generated); setSelectedItemId(''); }} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-[#23301F] px-3 py-2 text-xs text-amber-300"><Sparkles className="h-4 w-4" />重新产生候选</button>
            </div>
            <label className="flex items-center gap-2 text-[10px] text-[#DDD7CE]"><input type="checkbox" checked={snapTo5xMultiples} onChange={(e) => setSnapTo5xMultiples(e.target.checked)} />5cm 吸附</label>
            <label className="flex items-center gap-2 text-[10px] text-[#DDD7CE]"><input type="checkbox" checked={reserveBeamClearance} onChange={(e) => setReserveBeamClearance(e.target.checked)} />检查梁下 5cm</label>
            <label className="block text-[10px] text-[#DDD7CE]">最低净距 {minWalkwayWidth}cm<input className="mt-1 w-full accent-amber-500" type="range" min="70" max="120" step="5" value={minWalkwayWidth} onChange={(e) => setMinWalkwayWidth(Number(e.target.value))} /></label>
          </section>

          <section className="space-y-2">
            <div className={`flex items-start gap-2 rounded-xl border p-2 text-[10px] ${geometryIssues.length ? 'border-amber-500/50 text-amber-200' : 'border-emerald-500/40 text-emerald-300'}`}>
              {geometryIssues.length ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              <div>{geometryIssues.length ? geometryIssues.map((issue) => <div key={issue}>• {issue}</div>) : '当前未检出矩形碰撞、越界或净距不足；仍需设计师确认门窗与实际使用动线。'}</div>
            </div>
            <div className="relative mx-auto aspect-square max-h-[58vh] w-full overflow-hidden rounded-xl border-2 border-[#DDD7CE]/60 bg-[#F2EFE8]">
              <svg viewBox={`0 0 ${room.width} ${room.length}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                <rect x="0" y="0" width={room.width} height={room.length} fill="#F2EFE8" stroke="#26352B" strokeWidth="5" />
                {items.map((item) => {
                  const size = rotatedSize(item); const selected = item.id === selectedItemId;
                  const compartments = Number(item.specNote?.match(/分格:(\d+)/)?.[1] || 0);
                  return <g key={item.id} onClick={() => setSelectedItemId(item.id)} className="cursor-pointer">
                    <rect x={item.x} y={item.y} width={size.width} height={size.depth} fill={item.colorHex ?? '#6B7280'} fillOpacity="0.82" stroke={selected ? '#F59E0B' : '#18221A'} strokeWidth={selected ? 5 : 2} />
                    {compartments > 1 && Array.from({ length: compartments - 1 }, (_, index) => {
                      const ratio = (index + 1) / compartments;
                      return size.width >= size.depth
                        ? <line key={index} x1={item.x + size.width * ratio} y1={item.y} x2={item.x + size.width * ratio} y2={item.y + size.depth} stroke="#F8F8F6" strokeWidth="1" opacity="0.75" />
                        : <line key={index} x1={item.x} y1={item.y + size.depth * ratio} x2={item.x + size.width} y2={item.y + size.depth * ratio} stroke="#F8F8F6" strokeWidth="1" opacity="0.75" />;
                    })}
                    <text x={item.x + 4} y={item.y + 14} fontSize="11" fill="white">{item.name}</text><text x={item.x + 4} y={item.y + 28} fontSize="9" fill="white">{size.width}×{size.depth} · {item.rotationY ?? 0}°</text>
                  </g>;
                })}
              </svg>
            </div>
            <p className="text-center text-[10px] text-[#DDD7CE]/60">点击图块后在右侧调整；平面采用房间实际厘米比例。</p>
          </section>

          <section className="space-y-3 rounded-2xl border border-[#3F5B63]/40 bg-[#161F13] p-3">
            <h3 className="text-xs font-bold text-amber-300">选中家具调整</h3>
            {!selectedItem ? <p className="text-xs text-[#DDD7CE]/60">请在平面图点击一个家具。</p> : <>
              <div className="text-xs font-bold text-white">{selectedItem.name}</div>
              <div className="grid grid-cols-2 gap-2">{(['x', 'y', 'width', 'depth', 'height'] as const).map((field) => <label key={field} className="text-[10px] text-[#DDD7CE]">{field.toUpperCase()} (cm)<input type="number" step={snapTo5xMultiples ? 5 : 1} value={selectedItem[field]} onChange={(e) => updateItem(selectedItem.id, { [field]: snap(Number(e.target.value)) })} className="mt-1 w-full rounded bg-[#121810] p-2 text-xs text-white" /></label>)}</div>
              <div className="grid grid-cols-4 gap-1">{([[-5, 0, '←'], [5, 0, '→'], [0, -5, '↑'], [0, 5, '↓']] as const).map(([dx, dy, label]) => <button key={label} onClick={() => updateItem(selectedItem.id, { x: snap(selectedItem.x + dx), y: snap(selectedItem.y + dy) })} className="rounded bg-[#23301F] p-2 text-white">{label}</button>)}</div>
              <button onClick={() => updateItem(selectedItem.id, { rotationY: ((selectedItem.rotationY ?? 0) + 90) % 360 })} className="flex w-full items-center justify-center gap-1 rounded bg-[#23301F] p-2 text-xs text-white"><RotateCw className="h-4 w-4" />旋转 90°</button>
              <button onClick={() => { setItems((current) => current.filter((item) => item.id !== selectedItem.id)); setSelectedItemId(''); }} className="flex w-full items-center justify-center gap-1 rounded bg-rose-900/50 p-2 text-xs text-rose-200"><Trash2 className="h-4 w-4" />删除家具</button>
            </>}
            <div className="border-t border-[#3F5B63]/40 pt-3 text-[10px] text-[#DDD7CE]/60">本工具只保存可继续编辑的 2D 配置草案，不代表自动设计、法规或施工审查完成。</div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-[#3F5B63]/40 bg-[#1A2417] px-5 py-3">
          <span className="text-xs text-[#DDD7CE]/70">{items.length} 件家具 · {geometryIssues.length ? `需复核 ${geometryIssues.length} 项` : '未检出基本几何问题'}</span>
          <div className="flex gap-2"><button onClick={onClose} className="rounded-xl bg-[#23301F] px-4 py-2 text-xs text-white">关闭</button><button onClick={saveLayout} className="flex items-center gap-1 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-black text-black"><Save className="h-4 w-4" />保存配置</button></div>
        </div>
      </div>
    </div>
  );
};
