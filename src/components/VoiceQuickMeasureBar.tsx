import React, { useEffect, useRef, useState } from 'react';
import { RoomData, Column } from '../types';
import { AlertCircle, Check, Mic, MicOff, RotateCcw } from 'lucide-react';
import { measurementToCentimeters, SPOKEN_LENGTH_UNIT_PATTERN } from '../utils/measurementUnits';

interface VoiceQuickMeasureBarProps {
  room: RoomData;
  onUpdateRoom: (room: RoomData) => void;
  onNotify: (msg: string) => void;
}

interface ParsedDraft {
  source: string;
  changes: Partial<Pick<RoomData, 'roomName' | 'width' | 'length' | 'height'>>;
  addedColumns: Column[];
  summary: string[];
  warnings: string[];
}

const toCentimeters = (value: string, unit?: string) => {
  return measurementToCentimeters(value, unit, 'legacy-meters-under-20');
};

export const VoiceQuickMeasureBar: React.FC<VoiceQuickMeasureBarProps> = ({ room, onUpdateRoom, onNotify }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [draft, setDraft] = useState<ParsedDraft | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    setDraft(null);
    setTranscript('');
  }, [room.id]);

  const parseVoiceText = (textInput: string): ParsedDraft | null => {
    const raw = textInput.trim();
    if (!raw) return null;

    const currentRoom = roomRef.current;
    const text = raw.replace(/[，,。、；;！!？?]/g, ' ').replace(/\s+/g, ' ');
    let width = currentRoom.width;
    let length = currentRoom.length;
    let height = currentRoom.height;
    let roomName = currentRoom.roomName;
    const columns: Column[] = [...(currentRoom.columns || [])];
    const summary: string[] = [];
    const warnings: string[] = [];
    const changes: ParsedDraft['changes'] = {};
    const addedColumns: Column[] = [];

    const dimensionPattern = `(\\d+(?:\\.\\d+)?)\\s*(${SPOKEN_LENGTH_UNIT_PATTERN})?`;
    const lengthMatch = text.match(new RegExp(`(?:總長|進深|深度|長度|長)\\s*(?:為|是|約)?\\s*${dimensionPattern}`, 'i'));
    const widthMatch = text.match(new RegExp(`(?:總寬|面寬|開間|寬度|寬)\\s*(?:為|是|約)?\\s*${dimensionPattern}`, 'i'));
    const heightMatch = text.match(new RegExp(`(?:RC|樓高|淨高|高度|高)\\s*(?:為|是|約)?\\s*${dimensionPattern}`, 'i'));

    if (lengthMatch) {
      length = Math.max(30, toCentimeters(lengthMatch[1], lengthMatch[2]));
      changes.length = length;
      summary.push(`總長 ${length} cm`);
    }
    if (widthMatch) {
      width = Math.max(30, toCentimeters(widthMatch[1], widthMatch[2]));
      changes.width = width;
      summary.push(`總寬 ${width} cm`);
    }
    if (heightMatch) {
      height = Math.max(100, toCentimeters(heightMatch[1], heightMatch[2]));
      changes.height = height;
      summary.push(`RC 淨高 ${height} cm`);
    }

    const roomNames = ['客廳', '主臥房', '主臥', '次臥', '臥室', '玄關', '書房', '餐廳', '廚房', '陽台', '更衣室', '衛浴'];
    const matchedName = roomNames.find((name) => text.includes(name));
    if (matchedName) {
      roomName = matchedName === '主臥' ? '主臥房' : matchedName;
      changes.roomName = roomName;
      summary.push(`空間名稱：${roomName}`);
    }

    const addColumn = (corner: NonNullable<Column['corner']>, label: string, size = 50) => {
      if (columns.some((column) => column.corner === corner)) {
        warnings.push(`${label}已有柱體，將保留原資料`);
        return;
      }
      const newColumn: Column = {
        id: `col_${Date.now()}_${corner}`,
        name: `C${columns.length + 1} ${label}角柱`,
        width: size,
        depth: size,
        positionType: 'corner',
        corner,
        wall: corner.startsWith('top') ? 'north' : 'south',
        offset: 0,
        x: corner.endsWith('left') ? 0 : Math.max(0, width - size),
        y: corner.startsWith('top') ? 0 : Math.max(0, length - size),
      };
      columns.push(newColumn);
      addedColumns.push(newColumn);
      summary.push(`${label}角柱 ${size}×${size} cm`);
    };

    if (text.includes('四角') || text.includes('四個角')) {
      addColumn('top-left', '左上');
      addColumn('top-right', '右上');
      addColumn('bottom-left', '左下');
      addColumn('bottom-right', '右下');
    } else {
      const corners: Array<[string, NonNullable<Column['corner']>]> = [
        ['左上|西北', 'top-left'], ['右上|東北', 'top-right'], ['左下|西南', 'bottom-left'], ['右下|東南', 'bottom-right'],
      ];
      for (const [words, corner] of corners) {
        const cornerMatch = text.match(new RegExp(`(${words})[^0-9]*(?:柱子?|放柱)[^0-9]*(\\d{2,3})?`));
        if (cornerMatch) addColumn(corner, cornerMatch[1], cornerMatch[2] ? Number(cornerMatch[2]) : 50);
      }
    }

    if (!lengthMatch) warnings.push('缺少總長，本次不會變更總長');
    if (!widthMatch) warnings.push('缺少總寬，本次不會變更總寬');
    if (summary.length === 0) warnings.push('沒有辨識到可寫入的尺寸、空間名稱或柱位');

    return {
      source: raw,
      changes,
      addedColumns,
      summary,
      warnings,
    };
  };

  const prepareDraft = (text: string) => {
    const parsed = parseVoiceText(text);
    if (!parsed) return;
    setDraft(parsed);
    setRecognitionError(null);
    setManualText('');
    onNotify(parsed.summary.length ? '辨識完成，請確認摘要後再寫入。' : '未辨識到可寫入資料，請補充總長與總寬。');
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-TW';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let currentText = '';
      let isFinal = false;
      for (let i = 0; i < event.results.length; i += 1) {
        currentText += event.results[i][0].transcript;
        isFinal ||= event.results[i].isFinal;
      }
      setTranscript(currentText);
      if (isFinal) prepareDraft(currentText);
    };
    recognition.onerror = (event: { error?: string }) => {
      setIsListening(false);
      const message = event.error === 'not-allowed'
        ? '麥克風權限未開啟。請允許權限後重試，或直接使用文字輸入。'
        : event.error === 'no-speech'
          ? '沒有聽到語音。請靠近麥克風重試，或改用文字輸入。'
          : '語音辨識中斷。可重新口述，或改用文字輸入。';
      setRecognitionError(message);
      onNotify(message);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      onNotify('此瀏覽器不支援麥克風辨識，請改用文字輸入。');
      return;
    }
    if (isListening) recognitionRef.current?.stop();
    else {
      setTranscript('');
      setDraft(null);
      setRecognitionError(null);
      try { recognitionRef.current?.start(); } catch { onNotify('麥克風尚未就緒，請稍後再試。'); }
    }
  };

  const confirmDraft = () => {
    if (!draft || draft.summary.length === 0) return;
    const latestRoom = roomRef.current;
    const existingColumns = latestRoom.columns || [];
    onUpdateRoom({
      ...latestRoom,
      ...draft.changes,
      columns: [
        ...existingColumns,
        ...draft.addedColumns.filter((added) => !existingColumns.some((existing) => existing.corner === added.corner)),
      ],
    });
    onNotify(`已確認寫入：${draft.summary.join('、')}`);
    setDraft(null);
    setTranscript('');
  };

  const cancelDraft = () => {
    setDraft(null);
    setTranscript('');
    onNotify('已取消，原丈量資料沒有變更。');
  };

  return (
    <section className="survey-card min-w-0 space-y-4 rounded-2xl border-2 border-emerald-500/50 p-4 shadow-xl md:p-5" aria-labelledby="voice-measure-title">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">目前只做一件事</p>
          <h2 id="voice-measure-title" className="break-words text-base font-bold survey-text">說出這個空間的總長與總寬</h2>
          <p className="mt-1 text-xs survey-muted">辨識後先讓你核對，不會直接改動現場資料。</p>
        </div>
        {isListening && <span className="self-start rounded-full border border-red-500/60 bg-red-950/80 px-3 py-1.5 text-xs font-bold text-red-200 animate-pulse">正在聆聽</span>}
      </div>

      {!draft && (
        <div className="space-y-3">
          {recognitionError && (
            <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-500 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span className="flex min-w-0 items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="break-words">{recognitionError}</span></span>
              <button type="button" onClick={() => { setRecognitionError(null); setManualText(''); }} className="shrink-0 rounded-lg border border-amber-500/40 px-3 py-1.5 font-bold">改用文字輸入</button>
            </div>
          )}
          <button onClick={toggleListening} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white transition active:scale-[.98] ${isListening ? 'bg-red-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening ? '結束口述' : '開始口述'}
          </button>
          <form onSubmit={(event) => { event.preventDefault(); prepareDraft(manualText); }} className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input value={isListening ? transcript : manualText} onChange={(event) => !isListening && setManualText(event.target.value)} readOnly={isListening} placeholder="例如：主臥長 480、寬 360、高 280" className="survey-input min-w-0 flex-1 rounded-xl border px-3.5 py-3 text-sm outline-none" />
            <button type="submit" disabled={!manualText.trim() || isListening} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">辨識內容</button>
          </form>
          <button type="button" onClick={() => prepareDraft('客廳 長 5米 寬 4米 高 280')} className="max-w-full rounded-lg border border-emerald-500/30 px-2.5 py-1 text-left text-[11px] text-emerald-400">試用範例：客廳長 5 米、寬 4 米、高 280</button>
        </div>
      )}

      {draft && (
        <div className="survey-review min-w-0 space-y-3 rounded-xl border p-3" role="status" aria-live="polite">
          <div>
            <p className="text-xs font-bold survey-text">辨識摘要（尚未寫入）</p>
            <p className="mt-1 break-words text-[11px] survey-muted">原句：{draft.source}</p>
          </div>
          {draft.summary.length > 0 ? (
            <ul className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              {draft.summary.map((item) => <li key={item} className="flex min-w-0 items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="break-words">{item}</span></li>)}
            </ul>
          ) : <p className="text-xs text-amber-500">沒有可寫入項目，請取消後重新口述。</p>}
          {draft.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-500">
              <p className="mb-1 flex items-center gap-1 font-bold"><AlertCircle className="h-3.5 w-3.5" />需留意</p>
              {draft.warnings.map((warning) => <p key={warning} className="break-words">・{warning}</p>)}
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={cancelDraft} className="flex items-center justify-center gap-1.5 rounded-xl border survey-border px-4 py-2.5 text-sm font-bold survey-text"><RotateCcw className="h-4 w-4" />取消，不寫入</button>
            <button type="button" onClick={confirmDraft} disabled={draft.summary.length === 0} className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"><Check className="h-4 w-4" />確認寫入丈量資料</button>
          </div>
        </div>
      )}
    </section>
  );
};
