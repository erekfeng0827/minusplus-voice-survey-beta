import React, { useEffect, useRef, useState } from 'react';
import { Check, Compass, DoorOpen, Mic, MicOff, RotateCcw, Ruler, SquareDashed } from 'lucide-react';
import { Door, PlacedBlockItem, RoomData, WindowOpening } from '../types';
import { detectStairType, STAIR_BLOCK_CATALOG, StairType } from '../data/stairBlockCatalog';

type Wall = 'top' | 'bottom' | 'left' | 'right';
type Draft =
  | { kind: 'door'; label: string; wall: Wall; offset: number; width: number; height: number; summary: string[]; source: string }
  | { kind: 'window'; label: string; wall: Wall; offset: number; width: number; height: number; sillHeight: number; summary: string[]; source: string }
  | { kind: 'stair'; stairType: StairType; label: string; wall: Wall; offset: number; width: number; depth: number; risers?: number; turnDirection?: 'left' | 'right'; summary: string[]; source: string };

interface Props {
  room: RoomData;
  onUpdateRoom: (room: RoomData) => void;
  onNotify: (message: string) => void;
}

const WALL_LABEL: Record<Wall, string> = { top: '北牆／上牆', right: '東牆／右牆', bottom: '南牆／下牆', left: '西牆／左牆' };

const valueCm = (text: string, labels: string[]) => {
  const label = labels.join('|');
  const match = text.match(new RegExp(`(?:${label})\\s*(?:為|是|約)?\\s*(\\d+(?:\\.\\d+)?)\\s*(米|公尺|m|公分|cm)?`, 'i'));
  if (!match) return undefined;
  const number = Number(match[1]);
  return /^(米|公尺|m)$/i.test(match[2] || '') ? Math.round(number * 100) : Math.round(number);
};

const detectWall = (text: string): Wall | undefined => {
  if (/北牆|上牆|上面/.test(text)) return 'top';
  if (/南牆|下牆|下面/.test(text)) return 'bottom';
  if (/西牆|左牆|左面/.test(text)) return 'left';
  if (/東牆|右牆|右面/.test(text)) return 'right';
  return undefined;
};

export const parsePerimeterCommand = (source: string): { draft?: Draft; missing: string[] } => {
  const text = source.replace(/[，,。、；;！!？?]/g, ' ').replace(/\s+/g, ' ').trim();
  const wall = detectWall(text);
  const offset = valueCm(text, ['離(?:左|右)?牆角', '距(?:左|右)?牆角', '離起點', '距起點', '偏移']);
  const width = valueCm(text, ['寬度', '寬']);
  const height = valueCm(text, ['高度', '高']);
  const missing: string[] = [];
  if (!wall) missing.push('牆面');
  if (offset === undefined) missing.push('離牆角距離');
  if (width === undefined) missing.push('寬度');

  if (/樓梯|楼梯|[LU]\s*(?:型)?梯|旋轉梯|旋转梯|螺旋梯|直梯/i.test(text)) {
    const stairType = detectStairType(text);
    const definition = STAIR_BLOCK_CATALOG[stairType];
    const depth = valueCm(text, ['總長', '長度', '進深', '深度', '長']);
    const risers = text.match(/(?:共|做|分)?\s*(\d+)\s*(?:階|级|級)/)?.[1];
    const turnDirection = /左轉|左转/.test(text) ? 'left' : /右轉|右转/.test(text) ? 'right' : undefined;
    if (depth === undefined) missing.push('樓梯總長或進深');
    if ((stairType === 'l_shape' || stairType === 'u_shape' || stairType === 'spiral') && !turnDirection) missing.push('轉向（左轉或右轉）');
    if (!wall || offset === undefined || width === undefined || depth === undefined) return { missing };
    if (missing.length) return { missing };
    const summary = [`${WALL_LABEL[wall]}${definition.label}`, `離牆角 ${offset}cm`, `寬 ${width}cm`, `總長 ${depth}cm`];
    if (risers) summary.push(`${risers} 階`);
    if (turnDirection) summary.push(turnDirection === 'left' ? '左轉' : '右轉');
    return { draft: { kind: 'stair', stairType, label: definition.label, wall, offset, width, depth, risers: risers ? Number(risers) : undefined, turnDirection, summary, source }, missing };
  }

  if (/窗/.test(text)) {
    const sillHeight = valueCm(text, ['窗台高度', '台度', '窗台']);
    if (height === undefined) missing.push('窗高');
    if (sillHeight === undefined) missing.push('窗台高度');
    if (!wall || offset === undefined || width === undefined || height === undefined || sillHeight === undefined) return { missing };
    const label = /落地窗/.test(text) ? '落地窗' : /氣密窗|气密窗/.test(text) ? '氣密窗' : /推射窗/.test(text) ? '推射窗' : '窗戶';
    return { draft: { kind: 'window', label, wall, offset, width, height, sillHeight, summary: [`${WALL_LABEL[wall]}${label}`, `離牆角 ${offset}cm`, `寬 ${width}cm × 高 ${height}cm`, `台度 ${sillHeight}cm`], source }, missing };
  }

  if (/門|门/.test(text)) {
    if (height === undefined) missing.push('門高');
    if (!wall || offset === undefined || width === undefined || height === undefined) return { missing };
    const label = /玄關|大門/.test(text) ? '玄關大門' : /浴室|衛浴/.test(text) ? '衛浴門' : /陽台/.test(text) ? '陽台門' : '室內門';
    return { draft: { kind: 'door', label, wall, offset, width, height, summary: [`${WALL_LABEL[wall]}${label}`, `離牆角 ${offset}cm`, `寬 ${width}cm × 高 ${height}cm`], source }, missing };
  }
  return { missing: ['物件类型（門、窗或樓梯）'] };
};

export const PerimeterSurveyGuide: React.FC<Props> = ({ room, onUpdateRoom, onNotify }) => {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let transcript = '';
      let final = false;
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
        final ||= event.results[i].isFinal;
      }
      setText(transcript);
      if (final) prepare(transcript);
    };
    recognition.onerror = () => { setIsListening(false); onNotify('語音辨識中斷，請重試或直接輸入文字。'); };
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const prepare = (value: string) => {
    const result = parsePerimeterCommand(value);
    setDraft(result.draft || null);
    setMissing(result.missing);
    onNotify(result.draft ? '定位摘要已建立，确认后才会写入图面。' : `尚缺：${result.missing.join('、')}`);
  };

  const confirm = () => {
    if (!draft) return;
    const now = Date.now();
    if (draft.kind === 'door') {
      const door: Door = { id: `guided-door-${now}`, name: draft.label, type: draft.label === '玄關大門' ? 'entryway' : draft.label === '衛浴門' ? 'bathroom' : draft.label === '陽台門' ? 'balcony' : 'room', width: draft.width, height: draft.height, wall: draft.wall, offset: draft.offset, offsetReference: 'left', anchorTag: String.fromCharCode(65 + ((room.doors || []).length % 26)) };
      onUpdateRoom({ ...room, doors: [...(room.doors || []), door], lastUpdated: new Date().toISOString() });
    } else if (draft.kind === 'window') {
      const windowItem: WindowOpening = { id: `guided-window-${now}`, name: draft.label, width: draft.width, height: draft.height, sillHeight: draft.sillHeight, wall: draft.wall, offset: draft.offset, offsetReference: 'left' };
      onUpdateRoom({ ...room, windows: [...(room.windows || []), windowItem], lastUpdated: new Date().toISOString() });
    } else {
      const horizontal = draft.wall === 'top' || draft.wall === 'bottom';
      const definition = STAIR_BLOCK_CATALOG[draft.stairType];
      const block: PlacedBlockItem = { id: `guided-stair-${now}`, blockId: definition.blockId, name: draft.label, category: 'detail_joint', subCategory: `stair:${draft.stairType}`, x: horizontal ? draft.offset : draft.wall === 'left' ? 0 : Math.max(0, room.width - draft.width), y: horizontal ? (draft.wall === 'top' ? 0 : Math.max(0, room.length - draft.depth)) : draft.offset, widthCm: horizontal ? draft.width : draft.depth, depthCm: horizontal ? draft.depth : draft.width, cadLayer: 'A-STAIR', colorIndex: 3, rotationDeg: horizontal ? 0 : 90, snappedTo: WALL_LABEL[draft.wall], tags: [`stairType:${draft.stairType}`, `risers:${draft.risers || 'unconfirmed'}`, `turn:${draft.turnDirection || 'not_applicable'}`, `verification:${definition.verificationStatus}`, `source:${draft.source}`], placedAt: new Date().toISOString() };
      onUpdateRoom({ ...room, placedBlocks: [...(room.placedBlocks || []), block], lastUpdated: new Date().toISOString() });
    }
    onNotify(`✓ 已写入：${draft.summary.join(' · ')}`);
    setDraft(null); setMissing([]); setText('');
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-500/40 bg-[#10170f] shadow-2xl shadow-black/30">
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-amber-500/20 bg-[#182216] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 text-amber-300"><Compass className="h-5 w-5" /><strong>玄關起點丈量</strong></div>
          {['1  玄關門定原點', '2  輸入總長總寬', '3  順時針口述物件', '4  看摘要再確認'].map((item, index) => <div key={item} className={`mb-2 rounded-xl px-3 py-2 text-xs ${index === 2 ? 'bg-amber-500 text-black font-bold' : 'border border-[#3F5B63]/40 text-[#DDD7CE]'}`}>{item}</div>)}
          <p className="mt-4 text-[11px] leading-relaxed text-[#DDD7CE]/65">面对玄关门，先定义它在图面的墙面；之后沿顺时针逐一口述门、窗、柱与楼梯。</p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Perimeter Walk</div><h3 className="text-xl font-black tracking-tight text-[#F8F8F6]">沿牆走一圈，說出看到的物件</h3></div>
            <div className="rounded-xl border border-[#3F5B63]/50 px-3 py-2 text-[11px] text-[#DDD7CE]">{room.roomName} · {room.width} × {room.length} cm</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(WALL_LABEL) as Wall[]).map((wall) => <button key={wall} type="button" onClick={() => setText(`${WALL_LABEL[wall]} `)} className="rounded-xl border border-[#3F5B63]/50 bg-[#182216] px-2 py-2 text-[11px] font-bold text-[#DDD7CE] hover:border-amber-400 hover:text-amber-300">{WALL_LABEL[wall]}</button>)}
          </div>

          <div className="rounded-2xl border border-[#3F5B63]/50 bg-[#0b100b] p-3">
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} className="w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none" placeholder="例如：北牆有一扇氣密窗，離左牆角80，寬180，高150，台度45" />
            <div className="mt-3 flex flex-wrap gap-2 border-t border-[#3F5B63]/30 pt-3">
              <button type="button" onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black ${isListening ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'}`}>{isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}{isListening ? '停止聆聽' : '按住思路，直接口述'}</button>
              <button type="button" onClick={() => prepare(text)} className="flex min-h-12 items-center gap-2 rounded-xl bg-[#23301F] px-4 text-sm font-bold text-white"><Ruler className="h-4 w-4" />建立定位摘要</button>
            </div>
          </div>

          {missing.length > 0 && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">还缺少：{missing.join('、')}。系统不会自行猜测。</div>}
          {draft && <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-300"><SquareDashed className="h-4 w-4" />写入前确认</div><div className="flex flex-wrap gap-2">{draft.summary.map((item) => <span key={item} className="rounded-lg bg-[#10170f] px-2.5 py-1.5 text-xs text-[#F8F8F6]">{item}</span>)}</div><div className="mt-4 flex gap-2"><button type="button" onClick={confirm} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-black"><Check className="h-5 w-5" />确认并放到图面</button><button type="button" onClick={() => { setDraft(null); setMissing([]); }} className="rounded-xl bg-[#23301F] px-4 text-[#DDD7CE]"><RotateCcw className="h-4 w-4" /></button></div></div>}

          <div className="grid grid-cols-3 gap-2 text-center text-[11px]"><div className="rounded-xl bg-[#182216] p-2 text-[#DDD7CE]"><DoorOpen className="mx-auto mb-1 h-4 w-4 text-amber-300" />门 {room.doors?.length || 0}</div><div className="rounded-xl bg-[#182216] p-2 text-[#DDD7CE]"><SquareDashed className="mx-auto mb-1 h-4 w-4 text-sky-300" />窗 {room.windows?.length || 0}</div><div className="rounded-xl bg-[#182216] p-2 text-[#DDD7CE]"><Compass className="mx-auto mb-1 h-4 w-4 text-emerald-300" />楼梯 {(room.placedBlocks || []).filter((item) => item.subCategory.startsWith('stair')).length}</div></div>
        </div>
      </div>
    </section>
  );
};
