import React, { useState } from 'react';
import {
  X,
  FileCode,
  Download,
  CheckCircle2,
  Layers,
  Copy,
  Terminal,
  Printer,
  FileSpreadsheet,
  Check,
  Sparkles,
  ExternalLink,
  Cpu,
  Monitor,
} from 'lucide-react';
import { RoomData, CadBatchExportConfig, CadBatchSheetSelection } from '../types';
import {
  DEFAULT_CAD_BATCH_SHEETS,
  generateAutoCadBatchScript,
  generateWindowsBatchPlotBat,
  generateMacBatchPlotSh,
  generateCtbStyleGuide,
} from '../utils/cadBatchEngine';
import { generateCoreyMinusPlusAutoCadDxf } from '../utils/minusPlusDesignEngine';

interface CadBatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomData[];
  projectName: string;
  onNotify: (msg: string) => void;
}

export const CadBatchExportModal: React.FC<CadBatchExportModalProps> = ({
  isOpen,
  onClose,
  rooms,
  projectName,
  onNotify,
}) => {
  const [sheets, setSheets] = useState<CadBatchSheetSelection[]>(DEFAULT_CAD_BATCH_SHEETS);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'selection' | 'script_preview' | 'ctb_guide'>('selection');

  if (!isOpen) return null;

  const config: CadBatchExportConfig = {
    projectName: projectName || '星玥灣 B3-7F 陳宅 設計規劃案',
    projectCode: 'B3-7F',
    designer: 'Corey 馮凱瑞',
    date: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
    sheets,
    exportFormats: {
      singleAllInOneDxf: true,
      individualDxfs: true,
      autoCadScriptScr: true,
      batchPlotBat: true,
      ctbStyleGuide: true,
    },
    outputScale: '1/40',
    paperSize: 'A3',
  };

  const selectedCount = sheets.filter((s) => s.selected).length;

  const handleToggleSheet = (sheetId: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.sheetId === sheetId ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setSheets((prev) => prev.map((s) => ({ ...s, selected: select })));
  };

  // 1. 下載 DXF 模型檔案
  const handleDownloadDxf = () => {
    const dxf = generateCoreyMinusPlusAutoCadDxf();
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MinusPlus_Master_FullFloor_${config.projectCode}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載全案多圖層 AutoCAD DXF！');
  };

  // 2. 下載 AutoCAD 批次出圖腳本 (.scr)
  const handleDownloadScr = () => {
    const scr = generateAutoCadBatchScript(config, rooms);
    const blob = new Blob([scr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_plot_corey.scr';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 AutoCAD 自動化批次出圖腳本 (.scr)！');
  };

  // 3. 下載 Windows 批次執行檔 (.bat)
  const handleDownloadBat = () => {
    const bat = generateWindowsBatchPlotBat(config.projectName);
    const blob = new Blob([bat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_batch_plot.bat';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 Windows 一鍵出圖執行檔 (.bat)！');
  };

  // 4. 下載 CTB 列印樣式規範
  const handleDownloadCtbGuide = () => {
    const guide = generateCtbStyleGuide();
    const blob = new Blob([guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MinusPlus_CTB_Style_Guide.md';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 CTB 筆寬與列印樣式對照表！');
  };

  // 5. 一鍵連續打包下載所有批次檔案
  const handleDownloadCompleteBundle = () => {
    handleDownloadDxf();
    setTimeout(() => handleDownloadScr(), 200);
    setTimeout(() => handleDownloadBat(), 400);
    setTimeout(() => handleDownloadCtbGuide(), 600);
    onNotify('🚀 全套 CAD 批次交接包 (DXF + SCR + BAT + CTB 規範) 已全部觸發下載！');
  };

  const handleCopyScript = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
    onNotify('✓ 程式碼已複製至剪貼簿！');
  };

  const generatedScript = generateAutoCadBatchScript(config, rooms);
  const ctbGuideText = generateCtbStyleGuide();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#121810] border border-[#3F5B63]/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#DDD7CE]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3F5B63]/40 flex items-center justify-between bg-[#141d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#F8F8F6]">CAD 批次輸出引擎 (AutoCAD Batch Engine)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  全案施工圖自動化
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                依照加減設計 Corey 施工圖層、黑實 RC 牆、11種燈具與14種水電圖塊，批次生成全套 DXF 與無人值守出圖腳本
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#F8F8F6] hover:bg-[#23301F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#3F5B63]/30 bg-[#0e1610] flex gap-2">
          <button
            onClick={() => setActiveTab('selection')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'selection'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>施工圖紙勾選 ({selectedCount}/{sheets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('script_preview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'script_preview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>.SCR 批次自動出圖腳本預覽</span>
          </button>
          <button
            onClick={() => setActiveTab('ctb_guide')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ctb_guide'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CTB 筆寬與列印樣式對照表</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'selection' && (
            <div className="space-y-5">
              {/* Batch Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#141d16] border border-[#3F5B63]/40 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#DDD7CE] font-bold">批次出圖圖紙清單：</span>
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    全選
                  </button>
                  <span className="text-[#8E8E93]">|</span>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="text-[11px] text-[#8E8E93] hover:underline"
                  >
                    全部取消
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-emerald-400">
                  <span>紙張：ISO A3 橫式</span>
                  <span>·</span>
                  <span>比例：1/40 &amp; 1/20</span>
                  <span>·</span>
                  <span>單位：CM</span>
                </div>
              </div>

              {/* Sheets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sheets.map((s) => (
                  <div
                    key={s.sheetId}
                    onClick={() => handleToggleSheet(s.sheetId)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      s.selected
                        ? 'bg-[#18261b] border-cyan-500/80 shadow-sm'
                        : 'bg-[#141d16] border-[#3F5B63]/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          s.selected
                            ? 'bg-cyan-500 border-cyan-400 text-black'
                            : 'border-[#3F5B63]'
                        }`}
                      >
                        {s.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-400">{s.sheetNo}</span>
                          <span className="text-xs font-bold text-[#F8F8F6]">{s.title}</span>
                        </div>
                        <div className="text-[11px] text-[#8E8E93]">
                          分類：{s.category === 'architecture' ? '建築放樣' : s.category === 'mep' ? '機電水電' : s.category === 'elevation' ? '立面剖面' : '專案圖封'} · 比例：{s.scale}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d140e] text-cyan-300 border border-cyan-500/30">
                      A3 向量
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Features Callout */}
              <div className="bg-[#141d16] border border-[#3F5B63]/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AutoCAD 專業交接三大工程優勢</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#8E8E93]">
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F]">
                    <div className="text-[#F8F8F6] font-bold mb-1">1. 完整分層圖元 (Standard Layers)</div>
                    <p>RC 外牆 (0.5mm)、木作櫃體 (0.25mm)、燈具迴路 (Cyan 4)、尺寸鏈 (Red 1) 嚴格分層，利於工班與協同設計師套圖。</p>
                  </div>
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F]">
                    <div className="text-[#F8F8F6] font-bold mb-1">2. 無人值守批次出圖 (.SCR)</div>
                    <p>無需手動一張張點列印，執行腳本會自動切換至 A3 視埠並載入 CTB，5 秒內全套圖紙自動導出 PDF。</p>
                  </div>
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F]">
                    <div className="text-[#F8F8F6] font-bold mb-1">3. 星玥灣 1:1 簽章圖框</div>
                    <p>完整嵌入加減設計專用右側工程欄位、比例尺、案名代號與客戶簽認章，立即可做為施工合約附件。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script_preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E93]">
                  AutoCAD 指令列鍵入 <code className="text-amber-400 bg-black/40 px-1.5 py-0.5 rounded font-mono">SCRIPT batch_plot_corey.scr</code> 即可自動執行：
                </div>
                <button
                  onClick={() => handleCopyScript(generatedScript, 'scr')}
                  className="px-3 py-1 rounded-lg bg-[#23301F] hover:bg-[#2e4029] text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedType === 'scr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'scr' ? '已複製腳本' : '複製全案腳本'}</span>
                </button>
              </div>
              <pre className="bg-[#0a0f0b] border border-[#23301F] rounded-xl p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-96 leading-relaxed select-all">
                {generatedScript}
              </pre>
            </div>
          )}

          {activeTab === 'ctb_guide' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E93]">
                  MinusPlus_Corey_Monochrome.ctb 筆寬出圖樣式規範：
                </div>
                <button
                  onClick={() => handleCopyScript(ctbGuideText, 'ctb')}
                  className="px-3 py-1 rounded-lg bg-[#23301F] hover:bg-[#2e4029] text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedType === 'ctb' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'ctb' ? '已複製指南' : '複製對照說明'}</span>
                </button>
              </div>
              <div className="bg-[#0a0f0b] border border-[#23301F] rounded-xl p-5 text-xs text-[#DDD7CE] overflow-y-auto max-h-96 leading-relaxed whitespace-pre-wrap font-mono">
                {ctbGuideText}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#3F5B63]/40 bg-[#141d16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDxf}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>全套 DXF 模型</span>
            </button>
            <button
              onClick={handleDownloadScr}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>批次腳本 (.scr)</span>
            </button>
            <button
              onClick={handleDownloadBat}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>一鍵執行檔 (.bat)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#23301F] hover:bg-[#2c3d27] text-[#DDD7CE] text-xs font-bold transition"
            >
              關閉
            </button>

            <button
              onClick={handleDownloadCompleteBundle}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4 text-black" />
              <span>一鍵打包下載全套 CAD 交接包</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
