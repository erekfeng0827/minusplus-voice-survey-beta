import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, HardDrive, Loader2, Upload, X } from 'lucide-react';
import { ProjectShell, RoomData } from '../types';
import { parseSafeDxfShells, SafeDxfShellResult } from '../utils/safeDxfShellImporter';

interface FloorplanPdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRooms: (rooms: RoomData[], projectName?: string) => void;
  onImportShell: (shell: ProjectShell, rooms: RoomData[], projectName?: string) => void;
  onNotify: (msg: string) => void;
}

export interface StoredDrawingMeta {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  savedAt: string;
  status: 'stored_only' | 'parsed_dxf';
}

export const FLOORPLAN_META_KEY = 'minusplus_floorplan_upload_meta_v1';
const DB_NAME = 'minusplus-survey-files';
const STORE_NAME = 'drawings';
const ACTIVE_FILE_KEY = 'active-floorplan';
const MAX_FILE_BYTES = 50 * 1024 * 1024;

export const validateFloorplanFile = (file: Pick<File, 'name' | 'size'>): string | null => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['pdf', 'png', 'jpg', 'jpeg', 'dxf', 'dwg'].includes(extension)) {
    return '格式不支援。請選擇 PDF、PNG、JPG、DXF 或 DWG。';
  }
  if (file.size <= 0) return '檔案是空的，請重新選擇。';
  if (file.size > MAX_FILE_BYTES) return '檔案超過 50 MB，請先縮小檔案後重試。';
  return null;
};

export const createManualTraceRoom = (name: string, width: number, length: number, height: number): RoomData => ({
  id: `room-manual-${Date.now()}`,
  roomName: name.trim() || '待人工描圖空間',
  width: Math.max(30, width || 420),
  length: Math.max(30, length || 360),
  height: Math.max(100, height || 280),
  ceilingDrop: 230,
  beamHeight: 265,
  wallThickness: 10,
  columns: [],
  beams: [],
  doors: [],
  windows: [],
  voiceMemos: [],
  electricalPoints: [],
  lightingPoints: [],
  virtualAnnotations: [],
  lastUpdated: new Date().toISOString(),
  notes: ['圖面已保存於本機；目前無自動解析後端，尺寸由現場口述或人工描圖確認。'],
});

const saveFileToIndexedDb = (file: File) => new Promise<void>((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('此瀏覽器不支援 IndexedDB'));
    return;
  }
  const request = indexedDB.open(DB_NAME, 1);
  request.onerror = () => reject(request.error || new Error('無法開啟本機檔案庫'));
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(file, ACTIVE_FILE_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('檔案寫入失敗')); };
  };
});

const readStoredMeta = (): StoredDrawingMeta | null => {
  try {
    const value = localStorage.getItem(FLOORPLAN_META_KEY);
    return value ? JSON.parse(value) as StoredDrawingMeta : null;
  } catch {
    return null;
  }
};

export const FloorplanPdfImportModal: React.FC<FloorplanPdfImportModalProps> = ({ isOpen, onClose, onImportRooms, onImportShell, onNotify }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [storedMeta, setStoredMeta] = useState<StoredDrawingMeta | null>(() => readStoredMeta());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('待人工描圖空間');
  const [width, setWidth] = useState(420);
  const [length, setLength] = useState(360);
  const [height, setHeight] = useState(280);
  const [dxfResult, setDxfResult] = useState<SafeDxfShellResult | null>(null);

  useEffect(() => {
    if (isOpen) setStoredMeta(readStoredMeta());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = async (file?: File) => {
    if (!file) return;
    const validationError = validateFloorplanFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    setError(null);
    setDxfResult(null);
    try {
      await saveFileToIndexedDb(file);
      const extension = file.name.split('.').pop()?.toLowerCase();
      const parsed = extension === 'dxf' ? parseSafeDxfShells(await file.text(), file.name) : null;
      const meta: StoredDrawingMeta = {
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop()?.toUpperCase() || 'unknown',
        lastModified: file.lastModified,
        savedAt: new Date().toISOString(),
        status: parsed?.success ? 'parsed_dxf' : 'stored_only',
      };
      localStorage.setItem(FLOORPLAN_META_KEY, JSON.stringify(meta));
      setStoredMeta(meta);
      setDxfResult(parsed);
      setRoomName(file.name.replace(/\.[^/.]+$/, '') || '待人工描圖空間');
      if (parsed?.success) onNotify(`DXF 已读取连续整户底图与 ${parsed.rooms.length} 个可辨识空间；门窗梁柱仍待现场确认。`);
      else if (extension === 'dxf') onNotify(`DXF 已保存，但安全解析未通过：${parsed?.error || '无法读取几何'}。`);
      else onNotify(extension === 'dwg' ? 'DWG 已保存；浏览器无法直接解析二进制 DWG，请转存 DXF 后再导入。' : '图面已保存到本机；PDF／图片目前进入人工描图流程。');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '圖面無法保存到本機';
      setError(`${message}。請確認瀏覽器允許本機儲存後重試。`);
    } finally {
      setIsSaving(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const startManualTrace = () => {
    if (!storedMeta) {
      setError('請先選擇並保存一份真實圖面。');
      return;
    }
    const room = createManualTraceRoom(roomName, width, length, height);
    onImportRooms([room], storedMeta.name.replace(/\.[^/.]+$/, ''));
    onNotify('已建立人工描圖空間；接著可口述尺寸，確認後會保存於本機。');
    onClose();
  };

  const importParsedDxf = () => {
    if (!dxfResult?.success || !dxfResult.shell || !storedMeta) return;
    onImportShell(dxfResult.shell, dxfResult.rooms, storedMeta.name.replace(/\.[^/.]+$/, ''));
    onNotify(`已导入连续整户 DXF 底图与 ${dxfResult.rooms.length} 个空间候选；请核对比例并补录门窗梁柱。`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md md:p-6" role="dialog" aria-modal="true" aria-labelledby="floorplan-import-title">
      <div className="survey-card flex max-h-[92vh] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-3xl border shadow-2xl">
        <header className="flex min-w-0 items-start justify-between gap-3 border-b survey-border p-4 md:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 text-amber-500"><FileText className="h-5 w-5" /></div>
            <div className="min-w-0">
              <h2 id="floorplan-import-title" className="break-words text-base font-bold survey-text">上傳空模／建商圖面</h2>
              <p className="mt-1 text-xs survey-muted">DXF 可在本机安全读取真实几何；PDF／图片进入人工描图；DWG 需先转存 DXF。</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-2 survey-muted hover:bg-white/10" aria-label="關閉"><X className="h-5 w-5" /></button>
        </header>

        <div className="min-w-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          <section className="space-y-3">
            <div><p className="text-xs font-bold text-amber-500">1. 選擇真實圖面</p><p className="text-[11px] survey-muted">DXF：读取几何 · PDF/JPG/PNG：保存后人工描图 · DWG：保存但需转 DXF。单档上限 50 MB。</p></div>
            <button type="button" disabled={isSaving} onClick={() => inputRef.current?.click()} className="flex w-full min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed survey-border p-6 text-center hover:border-amber-500 disabled:opacity-50">
              {isSaving ? <Loader2 className="mb-2 h-7 w-7 animate-spin text-amber-500" /> : <Upload className="mb-2 h-7 w-7 text-amber-500" />}
              <span className="text-sm font-bold survey-text">{isSaving ? '正在保存到本機…' : '選擇圖面檔案'}</span>
            </button>
            <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.dxf,.dwg" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </section>

          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-400"><AlertTriangle className="h-4 w-4 shrink-0" /><span className="break-words">{error}</span></div>}

          {storedMeta && (
            <section className="space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <div className="flex min-w-0 items-start gap-2 text-xs text-emerald-500">
                <HardDrive className="h-4 w-4 shrink-0" />
                <div className="min-w-0"><p className="break-all font-bold">本機已保存：{storedMeta.name}</p><p className="mt-1">{(storedMeta.size / 1024 / 1024).toFixed(2)} MB · {new Date(storedMeta.savedAt).toLocaleString('zh-TW')}</p></div>
              </div>
              {dxfResult?.success ? <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                <p className="font-bold">DXF 連續整戶底圖讀取完成</p>
                <p className="mt-1">单位 {dxfResult.metadata.unitName} · 图元 {dxfResult.metadata.entityCount} · 可辨识空间 {dxfResult.rooms.length}。保留同一坐标系，不再拆成互不相连的房间卡片。</p>
              </div> : <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600">
                <p className="font-bold">{dxfResult ? 'DXF 安全解析未通过' : '人工描图模式'}</p>
                <p className="mt-1">{dxfResult?.error || '系统不会从 PDF、图片或 DWG 猜测房间、门窗、梁柱与比例尺。'}</p>
              </div>}

              <div className="space-y-3">
                <p className="text-xs font-bold survey-text">2. 建立第一個人工描圖空間</p>
                <label className="block text-[11px] survey-muted">空間名稱<input value={roomName} onChange={(event) => setRoomName(event.target.value)} className="survey-input mt-1 w-full min-w-0 rounded-lg border px-3 py-2 text-sm" /></label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[['總寬', width, setWidth], ['總長', length, setLength], ['RC 淨高', height, setHeight]].map(([label, value, setter]) => (
                    <label key={label as string} className="text-[11px] survey-muted">{label as string}（cm）<input type="number" min={label === 'RC 净高' ? 100 : 30} value={value as number} onChange={(event) => (setter as React.Dispatch<React.SetStateAction<number>>)(Number(event.target.value))} className="survey-input mt-1 w-full min-w-0 rounded-lg border px-3 py-2 text-sm" /></label>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t survey-border p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border survey-border px-4 py-2.5 text-sm font-bold survey-text">稍後處理</button>
          {dxfResult?.success ? <button type="button" onClick={importParsedDxf} disabled={isSaving} className="flex items-center justify-center gap-2 rounded-xl bg-[#B4503A] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />導入連續整戶底圖</button> : <button type="button" onClick={startManualTrace} disabled={!storedMeta || isSaving} className="flex items-center justify-center gap-2 rounded-xl bg-[#B4503A] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />建立空間並繼續口述</button>}
        </footer>
      </div>
    </div>
  );
};
