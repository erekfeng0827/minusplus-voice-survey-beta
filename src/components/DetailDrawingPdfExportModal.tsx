import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ZoomIn,
  Sparkles,
  X,
} from 'lucide-react';
import { RoomData } from '../types';
import { DETAIL_DRAWINGS_LIBRARY, DetailDrawing } from '../data/detailDrawingsData';

interface DetailDrawingPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onNotify: (msg: string) => void;
}

export const DetailDrawingPdfExportModal: React.FC<DetailDrawingPdfExportModalProps> = ({
  isOpen,
  onClose,
  room,
  onNotify,
}) => {
  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentDetail: DetailDrawing =
    DETAIL_DRAWINGS_LIBRARY[selectedDetailIndex] || DETAIL_DRAWINGS_LIBRARY[0];

  const handlePrintPdf = () => {
    window.print();
    onNotify('🖨️ 已開啟系統列印預覽，請在印表機選項中選擇「另存為 PDF (Save as PDF)」');
  };

  const handleDownloadSingleSvg = () => {
    const svgElement = document.getElementById(`detail-sheet-${currentDetail.id}`);
    if (!svgElement) {
      onNotify('匯出發生異常，請重試');
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `室內設計_施工大樣_${currentDetail.id}_${currentDetail.title}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`📥 大樣圖 ${currentDetail.id} 向量圖已成功匯出！`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  施工大樣 PDF 產出 (標準工程出圖冊)
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-semibold">
                  A4/A3 橫式工程圖框
                </span>
              </div>
              <p className="text-xs text-slate-400">
                符合幾何契約規範之 6 大天花造型與空調配合剖面大樣詳圖
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 產出 PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Detail Drawing Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {DETAIL_DRAWINGS_LIBRARY.map((det: DetailDrawing, idx: number) => (
              <button
                key={det.id}
                onClick={() => setSelectedDetailIndex(idx)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                  selectedDetailIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'bg-slate-800/90 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{det.id.replace('DETAIL-', '')}</span>
                <span>{det.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSingleSvg}
              className="px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs flex items-center gap-1 transition-all"
              title="匯出此張向量 SVG 幾何圖面"
            >
              <Download className="w-3 h-3" />
              <span>下載向量大樣</span>
            </button>
          </div>
        </div>

        {/* Printable Blueprint Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50 flex justify-center">
          {/* Engineering Title-Block Drawing Sheet (Simulated White Paper A4 Sheet) */}
          <div
            id={`detail-sheet-${currentDetail.id}`}
            className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between border-4 border-slate-950 font-sans min-h-[620px]"
          >
            {/* Top Sheet Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Sing-Yue-Wan Waterfront Residence Interior Construction Standards
                </div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">
                  室內設計景觀住宅新建工程 · 天花造型與空調大樣詳圖
                </h1>
                <div className="text-xs font-semibold text-blue-700 mt-0.5">
                  {currentDetail.contractClause}
                </div>
              </div>

              <div className="text-right border-l-2 border-slate-900 pl-4">
                <div className="text-xs font-bold text-slate-600">圖面編號 (DWG NO.)</div>
                <div className="text-2xl font-black font-mono text-slate-950">
                  {currentDetail.id.replace('DETAIL-', 'D-')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">SCALE 1:15 · SHEET 01/01</div>
              </div>
            </div>

            {/* Drawing Main Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 flex-1 items-center">
              {/* Left 2 Cols: High Precision Vector Section Diagram */}
              <div className="md:col-span-2 bg-slate-50 border-2 border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center relative min-h-[300px]">
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 font-bold">
                  CROSS-SECTION DETAIL 剖面大樣
                </div>

                {/* Vector SVG Detail Representation */}
                <svg viewBox="0 0 500 240" className="w-full max-w-md h-auto select-none">
                  <defs>
                    <pattern id="grid-sheet" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="500" height="240" fill="url(#grid-sheet)" />

                  {/* RC Ceiling Slab */}
                  <rect x="20" y="20" width="460" height="24" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                  <text x="30" y="36" fill="#334155" fontSize="10" fontWeight="bold">RC 結構樓板 (FL+280)</text>

                  {/* Hanging Rods */}
                  <line x1="100" y1="44" x2="100" y2="130" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
                  <line x1="260" y1="44" x2="260" y2="130" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
                  <line x1="400" y1="44" x2="400" y2="130" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Steel Channel Framing */}
                  <rect x="90" y="130" width="20" height="12" fill="#94a3b8" stroke="#334155" />
                  <rect x="250" y="130" width="20" height="12" fill="#94a3b8" stroke="#334155" />
                  <rect x="390" y="130" width="20" height="12" fill="#94a3b8" stroke="#334155" />

                  {/* Ceiling Drywall Plaster Board (Silicate Board 6mm/12mm) */}
                  <rect x="30" y="142" width="440" height="8" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="30" y1="146" x2="470" y2="146" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Dimension Lines & Elevation Marks */}
                  <g transform="translate(430, 80)">
                    <line x1="0" y1="-30" x2="0" y2="62" stroke="#dc2626" strokeWidth="1.5" />
                    <line x1="-8" y1="-30" x2="8" y2="-30" stroke="#dc2626" strokeWidth="1.5" />
                    <line x1="-8" y1="62" x2="8" y2="62" stroke="#dc2626" strokeWidth="1.5" />
                    <text x="12" y="20" fill="#dc2626" fontSize="10" fontWeight="bold">
                      FL + {currentDetail.targetElevation}cm
                    </text>
                  </g>

                  {/* Detail Title */}
                  <text x="250" y="195" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="bold">
                    【{currentDetail.title}】標準斷面構造圖
                  </text>
                  <text x="250" y="215" textAnchor="middle" fill="#64748b" fontSize="10">
                    高層規範：FL + {currentDetail.targetElevation} cm · 模數化節點
                  </text>
                </svg>
              </div>

              {/* Right 1 Col: Material Specifications & Execution Notes */}
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                  <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    材料工料清冊 (SCHEDULE)
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    {currentDetail.materials.map((m: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-tight text-[11px]">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-amber-300 rounded-lg p-3 bg-amber-50/80 text-xs text-amber-950">
                  <div className="font-bold text-amber-900 mb-1">施工查核驗收要點</div>
                  <ul className="text-[11px] space-y-1 text-slate-700">
                    {currentDetail.constructionNotes.map((note: string, nIdx: number) => (
                      <li key={nIdx} className="leading-tight">
                        • {note}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1.5 text-[10px] font-mono text-amber-800 font-semibold">
                    嚴格落實 V-01 5 倍數吸附，嚴禁畸零公分。
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Title Block (Engineering Signature Block) */}
            <div className="border-t-2 border-slate-900 pt-3 grid grid-cols-4 gap-2 text-[10px] text-slate-600 font-mono">
              <div className="border border-slate-300 p-1.5 rounded">
                <div className="text-slate-400">DESIGNED BY 設計人</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">室內設計建築主持設計師</div>
              </div>
              <div className="border border-slate-300 p-1.5 rounded">
                <div className="text-slate-400">CHECKED BY 查核工程師</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">現場甲級工務主管</div>
              </div>
              <div className="border border-slate-300 p-1.5 rounded">
                <div className="text-slate-400">APPROVED BY 總審定</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">降板裁決_v003 委員會</div>
              </div>
              <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                <div className="text-slate-400">DATE & VERSION</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">2026-09-19 / REV.03</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setSelectedDetailIndex((prev) =>
                  prev > 0 ? prev - 1 : DETAIL_DRAWINGS_LIBRARY.length - 1
                )
              }
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs flex items-center gap-1 border border-slate-700 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>上一張大樣</span>
            </button>

            <span className="text-xs text-slate-400 font-mono px-2">
              {selectedDetailIndex + 1} / {DETAIL_DRAWINGS_LIBRARY.length}
            </span>

            <button
              onClick={() =>
                setSelectedDetailIndex((prev) =>
                  prev < DETAIL_DRAWINGS_LIBRARY.length - 1 ? prev + 1 : 0
                )
              }
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs flex items-center gap-1 border border-slate-700 transition-all"
            >
              <span>下一張大樣</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>整冊產出 PDF (A4 施工大樣)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
