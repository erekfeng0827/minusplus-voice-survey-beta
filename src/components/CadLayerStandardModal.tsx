import React, { useState } from 'react';
import {
  Layers,
  FileCode2,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  Settings2,
  X,
  Copy,
  FolderTree,
  FileText,
  Palette,
  Check,
} from 'lucide-react';
import { CAD_SHEET_STANDARDS, SheetStandardCategory, CadLayerSpec } from '../data/cadLayerStandards';

interface CadLayerStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const CadLayerStandardModal: React.FC<CadLayerStandardModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string>('mep_plan');
  const [layerPrefix, setLayerPrefix] = useState<'NONE' | 'A_' | 'AR_'>('NONE');
  const [namingLanguage, setNamingLanguage] = useState<'ZH' | 'EN'>('ZH');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSheet = CAD_SHEET_STANDARDS.find((s) => s.id === selectedSheetId) || CAD_SHEET_STANDARDS[0];

  const getFormattedLayerName = (rawName: string) => {
    let name = rawName;
    if (layerPrefix === 'A_') name = `A-${rawName}`;
    if (layerPrefix === 'AR_') name = `AR-${rawName}`;
    return name;
  };

  // Generate AutoCAD Script (.scr)
  const generateAutoCadScript = () => {
    let script = '; ==================================================\n';
    script += '; 室內設計工程設計標準 AutoCAD 圖層建立腳本 (.SCR)\n';
    script += '; 依據《降板裁決_v003》與個人化繪圖習慣規格模組化\n';
    script += '; ==================================================\n\n';
    script += '-LAYER\n';

    CAD_SHEET_STANDARDS.forEach((sheet) => {
      sheet.layers.forEach((layer) => {
        const finalName = getFormattedLayerName(layer.name);
        script += `M "${finalName}" C ${layer.colorAci} "${finalName}" LW ${layer.lineweightMm} "${finalName}" \n`;
      });
    });

    script += '\n; 圖層建立完成\n';
    return script;
  };

  const handleCopyScript = () => {
    const script = generateAutoCadScript();
    navigator.clipboard.writeText(script);
    setCopied(true);
    onNotify('✓ 已複製 AutoCAD 圖層建立命令腳本！在 AutoCAD 命令列輸入 SCRIPT 即可一鍵載入。');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadScript = () => {
    const script = generateAutoCadScript();
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `室內設計_AutoCAD標準圖層規範_${layerPrefix === 'NONE' ? '標準' : layerPrefix}.scr`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 AutoCAD 圖層腳本 (室內設計_AutoCAD標準圖層規範.scr)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FolderTree className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  AutoCAD 圖層規格模組化與繪圖習慣規範中心
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
                  7大圖面全面規格化
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                水電圖 · 索引圖 · 燈具回路圖 · 空調配置圖 · 拆除圖 · 地板計畫圖 · 天花板計畫圖
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Controls Toolbar */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Layer Prefix Preference */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">圖層前綴習慣：</span>
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setLayerPrefix('NONE')}
                  className={`px-2.5 py-1 rounded-md transition ${layerPrefix === 'NONE' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  無前綴 (E-POWR)
                </button>
                <button
                  onClick={() => setLayerPrefix('A_')}
                  className={`px-2.5 py-1 rounded-md transition ${layerPrefix === 'A_' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  建築 A- (A-E-POWR)
                </button>
                <button
                  onClick={() => setLayerPrefix('AR_')}
                  className={`px-2.5 py-1 rounded-md transition ${layerPrefix === 'AR_' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  裝修 AR- (AR-E-POWR)
                </button>
              </div>
            </div>

            {/* Language Preference */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">名稱顯示：</span>
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setNamingLanguage('ZH')}
                  className={`px-2.5 py-1 rounded-md transition ${namingLanguage === 'ZH' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  標準英文圖層 (附繁中說明)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製腳本' : '複製 AutoCAD 腳本'}</span>
            </button>
            <button
              onClick={handleDownloadScript}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出 .SCR 圖層樣板</span>
            </button>
          </div>
        </div>

        {/* Main Body: Sheet Selector Left + Layer Details Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: 7 Sheet Types */}
          <div className="w-64 sm:w-72 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              7 大標準施工圖面清單
            </div>
            {CAD_SHEET_STANDARDS.map((sheet) => {
              const isSelected = sheet.id === selectedSheetId;
              return (
                <button
                  key={sheet.id}
                  onClick={() => setSelectedSheetId(sheet.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {sheet.sheetCode}
                    </span>
                    <span className="text-[10px] text-slate-400">{sheet.layers.length} 個標準圖層</span>
                  </div>
                  <div className="font-bold text-xs text-white truncate mt-0.5">{sheet.sheetTitle}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{sheet.purpose}</div>
                </button>
              );
            })}
          </div>

          {/* Right Content: Selected Sheet Details & Layer Table */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Sheet Overview Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{currentSheet.sheetCode}</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{currentSheet.sheetTitle}</h4>
                </div>
                <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  繪圖習慣規格化模組
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{currentSheet.purpose}</p>

              {/* Drawing Habit Principles */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>專屬繪圖習慣與規範準則 (Drawing Habit Conventions)：</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentSheet.drawingHabitRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Standard Layer Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>圖層分配與 ACI 色彩、線型、線寬規範</span>
                </h5>
                <span className="text-[11px] text-slate-400 font-mono">
                  AutoCAD DXF / DWG 100% 相容
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">圖層名稱 (Layer Name)</th>
                      <th className="py-2.5 px-3">類別</th>
                      <th className="py-2.5 px-3">ACI 顏色</th>
                      <th className="py-2.5 px-3">線型 (Linetype)</th>
                      <th className="py-2.5 px-3">線寬 (LW)</th>
                      <th className="py-2.5 px-3">圖元用途說明</th>
                      <th className="py-2.5 px-3">幾何契約原則</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {currentSheet.layers.map((layer) => {
                      const displayLayerName = getFormattedLayerName(layer.name);
                      return (
                        <tr key={layer.name} className="hover:bg-slate-900/60 transition">
                          <td className="py-2.5 px-3 font-bold text-cyan-300 select-all">
                            {displayLayerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans">{layer.category}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded border border-white/20 flex-shrink-0"
                                style={{ backgroundColor: layer.colorHex }}
                              />
                              <span className="text-slate-300 font-sans">
                                {layer.colorAci} ({layer.colorHex})
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{layer.linetype}</td>
                          <td className="py-2.5 px-3 text-slate-300">{layer.lineweightMm} mm</td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans">{layer.description}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-sans text-[10px]">
                            {layer.starMoonBayRule}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            全套 7 大施工圖層定義就緒 · 可直接一鍵批次載入 AutoCAD / 浩辰 CAD
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
