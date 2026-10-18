import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Layers,
  FileCode,
  Layout,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Copy,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  COREY_SHEETS,
  MinusPlusSheetInfo,
  generateCoreyMinusPlusAutoCadDxf,
  generateAutoCadBatchPlotScript,
  generateSketchup3dDxf,
  generateSketchupLayOutGuide,
  generateCoreyMinusPlusPdfBlob,
} from '../utils/minusPlusDesignEngine';

interface MinusPlusLayoutWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const MinusPlusLayoutWorkspaceModal: React.FC<MinusPlusLayoutWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(1); // Default to P-01
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'autocad_batch' | 'sketchup_layout'>('preview');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSheet: MinusPlusSheetInfo = COREY_SHEETS[activeSheetIndex] || COREY_SHEETS[0];

  // 下載 AutoCAD 批次交接包
  const handleDownloadAutoCadBundle = () => {
    // 1. DXF 檔案
    const dxfContent = generateCoreyMinusPlusAutoCadDxf();
    const dxfBlob = new Blob([dxfContent], { type: 'application/dxf' });
    const dxfUrl = URL.createObjectURL(dxfBlob);
    const a1 = document.createElement('a');
    a1.href = dxfUrl;
    a1.download = 'Corey_MinusPlus_Master_FullFloor.dxf';
    a1.click();
    URL.revokeObjectURL(dxfUrl);

    // 2. SCR 批次腳本
    setTimeout(() => {
      const scrContent = generateAutoCadBatchPlotScript();
      const scrBlob = new Blob([scrContent], { type: 'text/plain' });
      const scrUrl = URL.createObjectURL(scrBlob);
      const a2 = document.createElement('a');
      a2.href = scrUrl;
      a2.download = 'batch_plot_corey.scr';
      a2.click();
      URL.revokeObjectURL(scrUrl);
    }, 300);

    onNotify('📁 已下載【AutoCAD 專業交接包】：包含全層多圖層 DXF 與一鍵批次出圖腳本 (batch_plot_corey.scr)！');
  };

  // 下載 SketchUp & LayOut 整合包
  const handleDownloadSketchupBundle = () => {
    // 1. 3D DXF
    const suDxf = generateSketchup3dDxf();
    const suBlob = new Blob([suDxf], { type: 'application/dxf' });
    const suUrl = URL.createObjectURL(suBlob);
    const a1 = document.createElement('a');
    a1.href = suUrl;
    a1.download = 'Corey_3D_SuModel_Tags.dxf';
    a1.click();
    URL.revokeObjectURL(suUrl);

    // 2. LayOut 指南
    setTimeout(() => {
      const guideContent = generateSketchupLayOutGuide();
      const guideBlob = new Blob([guideContent], { type: 'text/markdown' });
      const guideUrl = URL.createObjectURL(guideBlob);
      const a2 = document.createElement('a');
      a2.href = guideUrl;
      a2.download = 'SketchUp_LayOut_Workflow_Guide.md';
      a2.click();
      URL.revokeObjectURL(guideUrl);
    }, 300);

    onNotify('📦 已下載【SketchUp & LayOut 整合包】：包含 3D 分層實體面 DXF 與 LayOut 1/40 出圖排版手冊！');
  };

  // 下載加減設計標準 A3 施工圖冊 PDF
  const handleDownloadFullPdf = async () => {
    try {
      setIsExportingPdf(true);
      onNotify('⏳ 正在以加減設計標準字型與圖框渲染 A3 橫向全套施工圖冊 PDF...');
      const blob = await generateCoreyMinusPlusPdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '星玥灣_B3-7F_陳宅_全案施工圖冊_加減設計_Corey.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setIsExportingPdf(false);
      onNotify('🎉 成功下載【加減設計 1:1 標準 A3 施工圖冊 (全案 6 頁完整版)】！');
    } catch (err) {
      console.error(err);
      setIsExportingPdf(false);
      onNotify('⚠️ PDF 產生失敗，請稍候重試');
    }
  };

  // 複製 SCR 腳本內容
  const handleCopyScript = () => {
    const scr = generateAutoCadBatchPlotScript();
    navigator.clipboard.writeText(scr);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
    onNotify('📋 已複製 AutoCAD 批次出圖腳本 (batch_plot_corey.scr) 內容！');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Minus plus design 加減設計 · 施工圖與 CAD/LayOut 批次交接系統</span>
                </h3>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  星玥灣 B3-7F 陳宅 (Corey 馮凱瑞)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                100% 依據加減設計繪圖規範：全層厚黑 RC 牆、臥室地坪色塊、家具細部、大黑入戶箭頭與標準圖例
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? '轉出中...' : '下載 A3 施工圖冊 PDF (全套6頁)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector & Page Carousel */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main Action Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>圖紙即時審閱 (A3 1:40 向量)</span>
            </button>

            <button
              onClick={() => setActiveTab('autocad_batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'autocad_batch'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>AutoCAD 批次輸出方案 (.scr + .dxf)</span>
            </button>

            <button
              onClick={() => setActiveTab('sketchup_layout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'sketchup_layout'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>SketchUp LayOut 整合包</span>
            </button>
          </div>

          {/* Quick Page Picker when in Preview */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700/80">
              <span className="text-[11px] text-slate-400 font-mono mr-1">頁面切換:</span>
              {COREY_SHEETS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSheetIndex(idx)}
                  className={`px-2 py-1 rounded text-xs font-mono transition ${
                    activeSheetIndex === idx
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  title={s.title}
                >
                  {s.sheetNo}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="縮小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="重設比例"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative">
          
          {/* TAB 1: PREVIEW (A3 Landscape Drawing Viewport) */}
          {activeTab === 'preview' && (
            <div
              className="transition-transform duration-200 origin-center bg-white text-slate-900 rounded-sm shadow-2xl p-6 relative border border-slate-300"
              style={{
                width: `${1120 * zoomLevel}px`,
                height: `${792 * zoomLevel}px`, // 420:297 ratio
              }}
            >
              {/* Outer Border Double Line (加減設計 A3 框) */}
              <div className="w-full h-full border-2 border-slate-900 relative p-3 flex flex-col justify-between">
                <div className="absolute inset-2 border border-slate-400 pointer-events-none" />

                {/* 1. DRAWING CONTENT AREA */}
                <div className="flex-1 relative overflow-hidden">
                  
                  {/* SHEET: COVER */}
                  {currentSheet.type === 'COVER' && (
                    <div className="h-full flex flex-col justify-center px-16 relative">
                      <div className="space-y-4 max-w-xl">
                        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-mono tracking-widest uppercase">
                          Minus Plus Design Project Drawing Set
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
                          星玥灣 B3-7F 陳宅 設計規劃案
                        </h1>
                        <p className="text-lg text-slate-600 font-medium">
                          高雄市苓雅區三多四路62號7樓
                        </p>

                        <div className="pt-8 border-l-2 border-slate-400 pl-4 space-y-1.5 text-xs text-slate-700">
                          <p className="font-bold text-slate-900">專案設計師 : Corey 馮凱瑞</p>
                          <p>TEL : +886 955 050 400</p>
                          <p>E-mail : erek.feng@gmail.com</p>
                          <p className="pt-2 text-slate-500">日期 : 2026/08/05 · 紙張 : ISO A3 SIZE</p>
                        </div>
                      </div>

                      <div className="absolute right-12 bottom-12 w-64 p-4 border border-slate-300 rounded bg-slate-50 text-[11px] text-slate-600 leading-relaxed">
                        <p className="font-bold text-slate-900 mb-1">施工圖冊目錄說明：</p>
                        <p>A1 - 全層平面配置圖-1 (1/40)</p>
                        <p>A2 - 平面配置圖-3 / 電視牆木作剖立面 (1/40)</p>
                        <p>A3 - 客房A面立面圖 / 跨室剖立面 (1/40)</p>
                        <p>A4 - 燈具迴路圖 (1/40)</p>
                        <p>A5 - 水電配置圖 (1/40)</p>
                      </div>
                    </div>
                  )}

                  {/* SHEET: P01_FLOOR_PLAN (全層平面圖) */}
                  {currentSheet.type === 'P01_FLOOR_PLAN' && (
                    <div className="h-full w-full relative flex items-center justify-center p-4">
                      {/* SVG Vector Full Floor Plan matching Corey's 100% exact style */}
                      <svg viewBox="0 0 1000 680" className="w-full h-full max-h-[580px] drop-shadow-sm select-none">
                        <defs>
                          <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#888888" strokeWidth="1" />
                          </pattern>
                        </defs>

                        {/* 1. Bedroom Shaded Floor Area (灰底色塊) */}
                        <rect x="420" y="80" width="260" height="260" fill="#E2E2E2" />
                        <rect x="680" y="80" width="280" height="260" fill="#E2E2E2" />

                        {/* 2. RC External Walls - Thick Solid Charcoal/Black (#222222) */}
                        <path
                          d="M 60 40 L 960 40 L 960 620 L 60 620 Z M 80 60 L 80 600 L 940 600 L 940 60 Z"
                          fill="#222222"
                          fillRule="evenodd"
                        />

                        {/* 3. Interior Partition Walls (10~12cm) */}
                        <rect x="400" y="60" width="20" height="540" fill="#2B2B2B" />
                        <rect x="400" y="340" width="540" height="16" fill="#2B2B2B" />
                        <rect x="680" y="60" width="16" height="280" fill="#2B2B2B" />

                        {/* 4. Entrance Lobby Solid Black Arrow */}
                        <g transform="translate(130, 20)">
                          <polygon points="0,0 -8,-14 8,-14" fill="#111111" />
                          <rect x="-3" y="-24" width="6" height="12" fill="#111111" />
                        </g>

                        {/* 5. Room Labels */}
                        <text x="130" y="560" fontSize="13" fontWeight="bold" fill="#333" textAnchor="middle">Lobby</text>
                        <text x="230" y="440" fontSize="13" fontWeight="bold" fill="#333" textAnchor="middle">Dining</text>
                        <text x="230" y="240" fontSize="15" fontWeight="bold" fill="#111" textAnchor="middle">Living Room</text>
                        <text x="530" y="530" fontSize="13" fontWeight="bold" fill="#333" textAnchor="middle">Kitchen</text>
                        <text x="530" y="210" fontSize="13" fontWeight="bold" fill="#444" textAnchor="middle">Guest Room</text>
                        <text x="810" y="210" fontSize="13" fontWeight="bold" fill="#444" textAnchor="middle">Master Room</text>
                        <text x="810" y="530" fontSize="13" fontWeight="bold" fill="#333" textAnchor="middle">Balcony</text>
                        <text x="810" y="400" fontSize="11" fontWeight="bold" fill="#555" textAnchor="middle">Toilet</text>

                        {/* 6. Living Room TV Unit & Sofa */}
                        {/* TV Unit on Left Wall */}
                        <rect x="80" y="100" width="30" height="260" fill="none" stroke="#333" strokeWidth="1.5" />
                        <line x1="80" y1="100" x2="110" y2="360" stroke="#888" strokeWidth="0.8" />
                        <line x1="80" y1="360" x2="110" y2="100" stroke="#888" strokeWidth="0.8" />
                        <text x="95" y="235" fontSize="9" fill="#555" textAnchor="middle" transform="rotate(-90 95 235)">65" TV Wall</text>

                        {/* Low Back Modern Sofa & Round Coffee Table */}
                        <rect x="220" y="140" width="120" height="170" rx="8" fill="#F4F4F4" stroke="#444" strokeWidth="1.5" />
                        <rect x="300" y="150" width="30" height="150" rx="4" fill="#E8E8E8" stroke="#666" strokeWidth="1" />
                        <line x1="220" y1="225" x2="300" y2="225" stroke="#AAA" strokeWidth="1" />
                        <circle cx="170" cy="225" r="28" fill="#FAFAFA" stroke="#555" strokeWidth="1.5" />

                        {/* Dining Table & 4 Chairs */}
                        <rect x="180" y="400" width="80" height="120" rx="4" fill="#FDFDFD" stroke="#444" strokeWidth="1.5" />
                        <circle cx="155" cy="430" r="14" fill="#EEE" stroke="#555" strokeWidth="1" />
                        <circle cx="155" cy="490" r="14" fill="#EEE" stroke="#555" strokeWidth="1" />
                        <circle cx="285" cy="430" r="14" fill="#EEE" stroke="#555" strokeWidth="1" />
                        <circle cx="285" cy="490" r="14" fill="#EEE" stroke="#555" strokeWidth="1" />

                        {/* Kitchen L-Counter, Sink, Stove, REF */}
                        <rect x="420" y="520" width="240" height="60" fill="#F9F9F9" stroke="#333" strokeWidth="1.5" />
                        <rect x="420" y="520" width="60" height="60" fill="#FFF" stroke="#444" strokeWidth="1.5" />
                        <text x="450" y="555" fontSize="11" fontWeight="bold" fill="#444" textAnchor="middle">REF</text>
                        {/* 2-burner gas stove */}
                        <circle cx="530" cy="550" r="12" fill="none" stroke="#444" strokeWidth="1.2" />
                        <circle cx="530" cy="550" r="4" fill="#444" />
                        <circle cx="570" cy="550" r="12" fill="none" stroke="#444" strokeWidth="1.2" />
                        <circle cx="570" cy="550" r="4" fill="#444" />
                        {/* Double Sink */}
                        <rect x="610" y="535" width="40" height="30" rx="3" fill="none" stroke="#444" strokeWidth="1.2" />

                        {/* Master Bedroom Queen Bed (5*6.2) */}
                        <rect x="740" y="90" width="150" height="180" rx="4" fill="#FFFFFF" stroke="#333" strokeWidth="1.5" />
                        <rect x="750" y="100" width="55" height="35" rx="3" fill="#E8E8E8" stroke="#888" strokeWidth="1" />
                        <rect x="825" y="100" width="55" height="35" rx="3" fill="#E8E8E8" stroke="#888" strokeWidth="1" />
                        <line x1="740" y1="160" x2="890" y2="160" stroke="#BBB" strokeWidth="1" strokeDasharray="3,3" />
                        <text x="815" y="210" fontSize="10" fill="#666" textAnchor="middle">5'*6.2 Queen</text>
                        {/* Master Wardrobe */}
                        <rect x="700" y="280" width="220" height="50" fill="#FAFAFA" stroke="#333" strokeWidth="1.5" />
                        <line x1="700" y1="280" x2="920" y2="330" stroke="#CCC" strokeWidth="0.8" />
                        <line x1="700" y1="330" x2="920" y2="280" stroke="#CCC" strokeWidth="0.8" />

                        {/* Guest Room Bed & Desk */}
                        <rect x="430" y="90" width="110" height="170" rx="4" fill="#FFFFFF" stroke="#333" strokeWidth="1.5" />
                        <rect x="560" y="120" width="90" height="45" fill="#FAFAFA" stroke="#444" strokeWidth="1.2" />
                        <circle cx="605" cy="190" r="16" fill="#EEE" stroke="#555" strokeWidth="1" />

                        {/* Doors with 90° Swing Arcs */}
                        <g stroke="#333" strokeWidth="1.2" fill="none">
                          <path d="M 400 300 A 70 70 0 0 1 470 370" />
                          <line x1="400" y1="300" x2="400" y2="370" />
                          <path d="M 680 300 A 70 70 0 0 1 750 370" />
                          <line x1="680" y1="300" x2="680" y2="370" />
                        </g>

                        {/* Dimension Chains around perimeter */}
                        <g stroke="#666" strokeWidth="0.8" fontSize="8" fill="#444">
                          <line x1="80" y1="25" x2="940" y2="25" />
                          <text x="510" y="20" textAnchor="middle">總長 1080 CM</text>
                          <line x1="40" y1="60" x2="40" y2="600" />
                          <text x="30" y="330" textAnchor="middle" transform="rotate(-90 30 330)">總深 760 CM</text>
                        </g>
                      </svg>

                      {/* Right Stamp Box (如使用者實照之免責聲明與簽名) */}
                      <div className="absolute right-6 top-6 w-60 border border-slate-400 bg-white/95 p-2 text-[9px] text-slate-700 space-y-1.5 shadow-sm">
                        <div className="border-b border-slate-300 pb-1 font-medium leading-tight">
                          備註: 實際材質與施工法皆依附施工圖為準, 尺寸比照施工圖依現場施工為準
                        </div>
                        <div className="pt-0.5 text-slate-900 font-bold">
                          圖面確認 客戶簽名: ________________
                        </div>
                        <div className="pt-1 text-[8px] text-slate-500 space-y-0.5 border-t border-slate-200">
                          <p className="font-bold">附註:</p>
                          <p>1. 本圖於施工時應按現場尺寸為準, 如有更改須知會設計師修改。</p>
                          <p>2. 設計師有權於施工進行中, 對設計進行局部性修改。</p>
                          <p>3. 本圖非經授權不得複製、轉載, 如有違反依法追究。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SHEET: E01_TV_CABINET (客廳電視牆木作立面剖面) */}
                  {currentSheet.type === 'E01_TV_CABINET' && (
                    <div className="h-full w-full relative flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">客廳電視牆木作剖立面施工圖</h2>
                          <p className="text-xs text-slate-500">含上方天花剖面、+10木作格柵造形、65"/86"電視預留位、抽屜五金細部</p>
                        </div>

                        {/* Material Box [A] 門片規格 */}
                        <div className="w-80 border-2 border-slate-800 p-2.5 bg-slate-50 text-[10px] space-y-1 text-slate-800">
                          <p className="font-bold text-slate-950 border-b border-slate-300 pb-1">[A] 編號: 門片形式編號A</p>
                          <p>• 桶身 - S-1166 米薩橡木</p>
                          <p>• 層板 - S-1166 米薩橡木</p>
                          <p>• 五金 - BLUM 鉸練</p>
                          <p>• 吊櫃下方離背板5公分 / 崁入鋁槽燈條 / 自然光</p>
                        </div>
                      </div>

                      {/* Elevation Section Vector */}
                      <div className="flex-1 flex items-center justify-center my-2">
                        <svg viewBox="0 0 900 380" className="w-full max-h-[360px]">
                          {/* RC Beam Section with 45° diagonal hatch */}
                          <rect x="100" y="40" width="700" height="40" fill="#EAEAEA" stroke="#333" strokeWidth="1.5" />
                          {Array.from({ length: 45 }).map((_, i) => (
                            <line key={i} x1={100 + i * 16} y1={40} x2={115 + i * 16} y2={80} stroke="#888" strokeWidth="1" />
                          ))}
                          <text x="450" y="65" fontSize="11" fill="#444" fontWeight="bold" textAnchor="middle">RC 結構大梁 (梁下 FL+233 CM)</text>

                          {/* Ceiling line */}
                          <line x1="80" y1="80" x2="820" y2="80" stroke="#333" strokeWidth="2" />
                          <text x="830" y="85" fontSize="9" fill="#333">天花頂板 FL+265</text>

                          {/* TV Feature Wall Wood Slat (+10) */}
                          <rect x="180" y="100" width="540" height="200" fill="#F8F8F8" stroke="#333" strokeWidth="1.5" />
                          <text x="200" y="125" fontSize="10" fontWeight="bold" fill="#666">+10 木作底板造形</text>

                          {/* TV Outlines */}
                          <rect x="260" y="130" width="380" height="140" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,4" />
                          <text x="450" y="195" fontSize="11" fontWeight="bold" fill="#2563EB" textAnchor="middle">
                            LG 86吋電視 193*118CM / 65吋電視 144*81CM
                          </text>

                          {/* Soundbar */}
                          <rect x="360" y="275" width="180" height="20" fill="#FFF" stroke="#444" strokeWidth="1.2" strokeDasharray="3,3" />
                          <text x="450" y="290" fontSize="9" fill="#444" textAnchor="middle">Sound Bar 120*17CM</text>

                          {/* Drawers Base Cabinet */}
                          <rect x="140" y="300" width="620" height="50" fill="#F0F0F0" stroke="#333" strokeWidth="1.5" />
                          <line x1="340" y1="300" x2="340" y2="350" stroke="#666" strokeWidth="1.2" />
                          <line x1="540" y1="300" x2="540" y2="350" stroke="#666" strokeWidth="1.2" />
                          <text x="240" y="330" fontSize="11" fill="#333" textAnchor="middle">抽屜 (BLUM)</text>
                          <text x="440" y="330" fontSize="11" fill="#333" textAnchor="middle">抽屜 (BLUM)</text>
                          <text x="640" y="330" fontSize="11" fill="#333" textAnchor="middle">抽屜 (BLUM)</text>

                          {/* Floor line */}
                          <line x1="80" y1="350" x2="820" y2="350" stroke="#111" strokeWidth="3" />
                          <text x="830" y="355" fontSize="9" fontWeight="bold" fill="#111">完成面 1FL ±0</text>
                        </svg>
                      </div>

                      {/* Dimension Strings (Top & Bottom) */}
                      <div className="flex justify-between text-[10px] text-slate-600 font-mono px-12 border-t border-slate-300 pt-2">
                        <span>水平標註 (CM): 35 | 50 | 271 | 22 | 242 | 20</span>
                        <span>下櫃標註 (CM): 319 | 73 | 73 | 60 | 114</span>
                      </div>
                    </div>
                  )}

                  {/* SHEET: E02_ROOMS_ELEV (客房A面立面圖) */}
                  {currentSheet.type === 'E02_ROOMS_ELEV' && (
                    <div className="h-full w-full relative flex flex-col justify-between p-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">客房A面跨室剖面立面圖 (1/40)</h2>
                        <p className="text-xs text-slate-500">次臥 / 客房 / 主臥跨室立面，含雙折斷撕裂線、大梁斜剖面、冷氣格柵與氣密窗框</p>
                      </div>

                      <div className="flex-1 flex items-center justify-center my-2">
                        <svg viewBox="0 0 900 360" className="w-full max-h-[340px]">
                          {/* RC Beam Section */}
                          <rect x="80" y="30" width="740" height="40" fill="#EAEAEA" stroke="#333" strokeWidth="1.5" />
                          {Array.from({ length: 48 }).map((_, i) => (
                            <line key={i} x1={80 + i * 16} y1={30} x2={95 + i * 16} y2={70} stroke="#999" strokeWidth="1" />
                          ))}

                          {/* Wavy Breaklines (折斷線/撕裂線) */}
                          <path d="M 330 20 L 330 160 L 340 170 L 320 180 L 330 190 L 330 330" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3,2" />
                          <path d="M 600 20 L 600 160 L 610 170 L 590 180 L 600 190 L 600 330" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3,2" />

                          {/* Room 1 (Left): Balcony / Living */}
                          <rect x="110" y="80" width="180" height="40" fill="#F4F4F4" stroke="#444" strokeWidth="1" />
                          <text x="200" y="105" fontSize="11" fontWeight="bold" fill="#333" textAnchor="middle">AC 吊隱式冷氣格柵</text>
                          <rect x="100" y="140" width="200" height="160" fill="none" stroke="#333" strokeWidth="1.5" />
                          <text x="200" y="230" fontSize="12" fill="#666" textAnchor="middle">三線鋁門窗 240 CM</text>

                          {/* Room 2 (Center): Guest Room */}
                          <rect x="370" y="80" width="180" height="40" fill="#F4F4F4" stroke="#444" strokeWidth="1" />
                          <text x="460" y="105" fontSize="11" fontWeight="bold" fill="#333" textAnchor="middle">AC 吊隱式冷氣格柵</text>
                          <rect x="360" y="150" width="200" height="150" fill="none" stroke="#333" strokeWidth="1.5" />
                          <text x="460" y="230" fontSize="12" fill="#666" textAnchor="middle">景觀窗 164 CM</text>

                          {/* Room 3 (Right): Master Bedroom */}
                          <rect x="640" y="80" width="180" height="40" fill="#F4F4F4" stroke="#444" strokeWidth="1" />
                          <text x="730" y="105" fontSize="11" fontWeight="bold" fill="#333" textAnchor="middle">AC 吊隱式冷氣格柵</text>
                          <rect x="630" y="140" width="200" height="160" fill="none" stroke="#333" strokeWidth="1.5" />
                          <text x="730" y="230" fontSize="12" fill="#666" textAnchor="middle">大落地推拉窗 200 CM</text>

                          {/* Floor line */}
                          <line x1="60" y1="300" x2="840" y2="300" stroke="#111" strokeWidth="2.5" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-600 font-mono px-12 border-t border-slate-300 pt-2">
                        <span>上層跨距 (CM): 292 | 40 | 181 | 40 | 226 | 43</span>
                        <span>窗位下口 (CM): 10 | 225 | 59 | 224 | 244 | 50</span>
                      </div>
                    </div>
                  )}

                  {/* SHEET: M01_LIGHTING (燈具迴路圖) */}
                  {currentSheet.type === 'M01_LIGHTING' && (
                    <div className="h-full w-full relative flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">燈具開關迴路配置圖 (1/40)</h2>
                          <p className="text-xs text-slate-500">含 11 項標準圖例、S/S3/ONE 雙切開關符號、雙曲線迴路與 118cm 高度規範</p>
                        </div>

                        {/* 11 Lighting Legend Table (IMG_1419) */}
                        <div className="w-80 border-2 border-slate-800 bg-white p-2 text-[9px] text-slate-800 space-y-1 shadow-sm">
                          <p className="font-bold text-slate-950 border-b border-slate-300 pb-1 text-center">燈具與開關標準圖例表</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <p>◉ 直徑15cm筒燈(省電燈泡)</p>
                            <p>◐ AR LED投射燈-單燈</p>
                            <p>◑ AR LED投射燈-二燈</p>
                            <p>● 直徑7cm LED投射燈</p>
                            <p>═ T5 層板燈</p>
                            <p>✦ 主燈 / 壁燈</p>
                            <p>╪ LED 投射軌道燈 12CM</p>
                            <p>▬ 專用軌道(1/1.5/2/3米)</p>
                            <p className="font-bold text-blue-700">S : 單切開關</p>
                            <p className="font-bold text-purple-700">S3: 雙切開關</p>
                          </div>
                          <p className="text-[8px] text-amber-700 font-bold border-t border-slate-200 pt-1">
                            ※ 備註: 未標示高度之開關符號中心高度以離地 118cm 為基準。
                          </p>
                        </div>
                      </div>

                      {/* Schematic Circuits Canvas */}
                      <div className="flex-1 flex items-center justify-center my-2">
                        <svg viewBox="0 0 900 360" className="w-full max-h-[340px]">
                          {/* Floor Plan Outline Background (Light Gray) */}
                          <rect x="80" y="30" width="740" height="300" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
                          <line x1="380" y1="30" x2="380" y2="330" stroke="#E5E7EB" strokeWidth="1.5" />
                          <line x1="380" y1="180" x2="820" y2="180" stroke="#E5E7EB" strokeWidth="1.5" />

                          {/* Living Room Lighting Circuit */}
                          <circle cx="230" cy="110" r="10" fill="none" stroke="#111" strokeWidth="1.5" />
                          <circle cx="230" cy="110" r="4" fill="#111" />
                          <circle cx="230" cy="240" r="10" fill="none" stroke="#111" strokeWidth="1.5" />
                          <circle cx="230" cy="240" r="4" fill="#111" />

                          {/* Switches S3 & Splines */}
                          <rect x="110" y="280" width="28" height="18" rx="2" fill="#7C3AED" />
                          <text x="124" y="293" fontSize="10" fontWeight="bold" fill="#FFF" textAnchor="middle">S3</text>

                          <rect x="360" y="110" width="28" height="18" rx="2" fill="#7C3AED" />
                          <text x="374" y="123" fontSize="10" fontWeight="bold" fill="#FFF" textAnchor="middle">S3</text>

                          <path d="M 124 280 Q 150 200 230 240" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4,4" />
                          <path d="M 230 240 Q 230 170 230 110" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4,4" />
                          <path d="M 230 110 Q 300 90 360 110" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4,4" />

                          {/* Master Bedroom Circuit */}
                          <circle cx="600" cy="100" r="12" fill="none" stroke="#111" strokeWidth="1.5" />
                          <circle cx="600" cy="100" r="5" fill="#2563EB" />
                          <rect x="400" y="90" width="24" height="18" rx="2" fill="#2563EB" />
                          <text x="412" y="103" fontSize="10" fontWeight="bold" fill="#FFF" textAnchor="middle">S</text>
                          <path d="M 424 99 Q 500 80 600 100" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,4" />
                        </svg>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono text-center border-t border-slate-300 pt-2">
                        所有強電配線迴路皆符合電工法規 · 雙切迴路採用 1.6mm 耐熱線
                      </div>
                    </div>
                  )}

                  {/* SHEET: M02_ELECTRICAL (水電配置圖) */}
                  {currentSheet.type === 'M02_ELECTRICAL' && (
                    <div className="h-full w-full relative flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">水電與弱電放樣配置圖 (1/40)</h2>
                          <p className="text-xs text-slate-500">含 14 項標準水電圖例、插座/網路/給排水定位尺寸鏈與 30cm 標高備註</p>
                        </div>

                        {/* 14 MEP Legend Table (IMG_1416) */}
                        <div className="w-84 border-2 border-slate-800 bg-white p-2 text-[8.5px] text-slate-800 space-y-0.5 shadow-sm">
                          <p className="font-bold text-slate-950 border-b border-slate-300 pb-0.5 text-center">水電設備標準圖例表 (14項)</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            <p>⚏ (二) 110V 電源插座(接地)</p>
                            <p>⚏ (二220V) 220V 電源插座</p>
                            <p>☎ (T) 電話線路</p>
                            <p>📺 (TV) 電視同軸電纜</p>
                            <p>💻 (PC) 網路資訊插座</p>
                            <p>○ (出) 線槽出線孔</p>
                            <p>♫ (SP) 音響環繞線路</p>
                            <p>🌀 (F) 抽風機(110V)</p>
                            <p>📱 (MT) 視訊對講機</p>
                            <p>🔵 冷水給水出水孔</p>
                            <p>🔴 熱水給水出水孔</p>
                            <p>◎ 排水管 (面盆/浴缸)</p>
                            <p>⚙ 馬桶用汙水排汙管</p>
                            <p>⊞ 地面落水防臭頭</p>
                          </div>
                          <p className="text-[7.5px] text-amber-800 font-bold border-t border-slate-200 pt-0.5">
                            ※ 備註: 未標示高度插座中心離地 30cm; 專用迴路請留意負載容量。
                          </p>
                        </div>
                      </div>

                      {/* MEP Plan Graphic */}
                      <div className="flex-1 flex items-center justify-center my-2">
                        <svg viewBox="0 0 900 360" className="w-full max-h-[340px]">
                          {/* Floor Plan Outline */}
                          <rect x="80" y="30" width="740" height="300" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
                          <line x1="380" y1="30" x2="380" y2="330" stroke="#E5E7EB" strokeWidth="1.5" />

                          {/* TV Wall Sockets Cluster */}
                          <g transform="translate(100, 140)">
                            <rect x="0" y="0" width="12" height="12" fill="#F59E0B" />
                            <text x="18" y="10" fontSize="9" fontWeight="bold" fill="#B45309">(二)×3 專迴</text>
                            <rect x="0" y="20" width="12" height="12" fill="#2563EB" />
                            <text x="18" y="30" fontSize="9" fontWeight="bold" fill="#1D4ED8">(TV)+(PC)+(出)</text>
                            <line x1="-20" y1="10" x2="0" y2="10" stroke="#666" strokeWidth="0.8" />
                            <text x="-25" y="13" fontSize="8" fill="#666" textAnchor="end">牆角+145cm</text>
                          </g>

                          {/* Bathroom Water Outlets */}
                          <g transform="translate(680, 220)">
                            <circle cx="10" cy="10" r="7" fill="#3B82F6" />
                            <circle cx="30" cy="10" r="7" fill="#EF4444" />
                            <text x="45" y="13" fontSize="9" fontWeight="bold" fill="#333">冷熱水出水 (FL+55cm)</text>
                            <circle cx="20" cy="40" r="9" fill="none" stroke="#111" strokeWidth="2" />
                            <text x="45" y="44" fontSize="9" fontWeight="bold" fill="#333">面盆排水 ◎ (FL+45cm)</text>
                          </g>
                        </svg>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono text-center border-t border-slate-300 pt-2">
                        強電線路: 2.2mm / 5.5mm 太平洋單芯銅線 · 弱電請以單點單線配置
                      </div>
                    </div>
                  )}

                </div>

                {/* 2. MINUS PLUS DESIGN BOTTOM TITLE BLOCK (加減設計 A3 底框) */}
                <div className="h-16 border-t-2 border-slate-900 pt-2 flex items-center justify-between text-slate-800 shrink-0">
                  {/* Company Logo & Address */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-mono font-bold">● +</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-sm tracking-tight text-slate-950">Minus plus design</span>
                        <span className="text-xs font-bold text-slate-700">加減設計</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono space-y-0.5">
                        <p>[ 地址 ] 高雄市左營區洲仔路121號</p>
                        <p>[ 電話 ] +886 955 050 400 | [ E-mail ] erek.feng@gmail.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Project & Designer */}
                  <div className="h-full border-l border-slate-300 px-4 flex flex-col justify-center text-[10px] space-y-0.5">
                    <p><span className="text-slate-500">專案名稱:</span> <strong className="text-slate-900">星玥灣 B3-7F 陳宅 設計規劃案</strong></p>
                    <p><span className="text-slate-500">檔案名稱:</span> 高雄市苓雅區三多四路62號7樓</p>
                    <p><span className="text-slate-500">設計:</span> Corey | &nbsp;&nbsp; <span className="text-slate-500">繪圖:</span> Corey | &nbsp;&nbsp; <span className="text-slate-500">日期:</span> 2026/08/05</p>
                  </div>

                  {/* Sheet Title & Specs */}
                  <div className="h-full border-l border-slate-300 pl-4 flex flex-col justify-center text-[10px] space-y-0.5">
                    <p className="font-extrabold text-sm text-slate-950">圖面名稱: {currentSheet.title}</p>
                    <p className="text-slate-600 font-mono">
                      紙張尺寸: ISO A3 SIZE &nbsp;|&nbsp; 圖面比例: {currentSheet.scaleText}
                    </p>
                    <p className="text-slate-600 font-mono">
                      單位: CM | &nbsp;|&nbsp; 張號: <strong className="text-amber-700 text-xs">{currentSheet.sheetNo}</strong>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: AUTOCAD BATCH PLOTTING (批次出圖交接方案) */}
          {activeTab === 'autocad_batch' && (
            <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-700 rounded-xl p-6 space-y-6 text-slate-200">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>AutoCAD 一鍵批次出圖自動化方案 (Batch Plotting Automation)</span>
                    <span className="text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/40">
                      解決朋友協作與出圖標準不一致痛點
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    針對您提到的「匯入 AutoCAD 批次輸出」與「朋友交接一起畫圖要有共同內容」，我們為您建立標準 AutoCAD Script (.scr) 與專用 DXF！
                  </p>
                </div>
                <button
                  onClick={handleDownloadAutoCadBundle}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>下載 AutoCAD 批次交接包 (.dxf + .scr)</span>
                </button>
              </div>

              {/* Step by Step workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                    01
                  </div>
                  <h5 className="text-sm font-bold text-white">開啟標準 DXF</h5>
                  <p className="text-xs text-slate-400">
                    在 AutoCAD 開啟 <code className="text-blue-300 font-mono">Corey_MinusPlus_Master_FullFloor.dxf</code>，已完整建立所有標準圖層：
                    <code className="block mt-1 text-[11px] text-slate-300">0_WALL_RC (0.5mm 粗實黑)</code>
                    <code className="block text-[11px] text-slate-300">0_WALL_PART (0.35mm 隔間)</code>
                    <code className="block text-[11px] text-slate-300">A_FURN_FIXED (固定櫥櫃)</code>
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                    02
                  </div>
                  <h5 className="text-sm font-bold text-white">載入批次出圖腳本</h5>
                  <p className="text-xs text-slate-400">
                    在 AutoCAD 指令列直接輸入指令：
                    <kbd className="block mt-1 px-2 py-1 bg-slate-800 text-amber-300 font-mono text-xs rounded border border-slate-700">
                      SCRIPT batch_plot_corey.scr
                    </kbd>
                    腳本會自動將全案 5 張圖面依 1:40、A3 橫向自動列印成個別高品質 PDF！
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                    03
                  </div>
                  <h5 className="text-sm font-bold text-white">朋友團隊無縫交接</h5>
                  <p className="text-xs text-slate-400">
                    朋友無需重新設定圖框、不用手動調整字型與印表機筆寬。只要執行腳本，產出的施工圖冊風格 100% 一模一樣！
                  </p>
                </div>
              </div>

              {/* Script code viewer */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span>AutoCAD 批次腳本原始碼預覽 (batch_plot_corey.scr)</span>
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? '✓ 已複製！' : '複製腳本'}</span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800">
                  {generateAutoCadBatchPlotScript()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SKETCHUP & LAYOUT INTEGRATION */}
          {activeTab === 'sketchup_layout' && (
            <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-700 rounded-xl p-6 space-y-6 text-slate-200">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>SketchUp & LayOut 專業工作流程整合包</span>
                    <span className="text-xs bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                      依照您的習慣在 LayOut 輸出標準施工圖
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    解決傳統 2D 圖紙轉入 SketchUp 時破面、遺失分層群組的問題。我們直接生成 SketchUp Tags 友善的 3D 群組模型！
                  </p>
                </div>
                <button
                  onClick={handleDownloadSketchupBundle}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>下載 SketchUp 3D 模型 + LayOut 指南</span>
                </button>
              </div>

              {/* LayOut features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h5 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>SketchUp 3D 標籤 (Tags) 分層架構</span>
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
                      <span><strong>01_RC_WALL</strong>: 結構外牆與柱位，高度 280cm 實心封閉面，直接可推拉推擠。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
                      <span><strong>02_BEAMS</strong>: 實體結構大梁 (梁底標高 FL+218 / FL+233 / FL+265)，避讓水電管路。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
                      <span><strong>04_CABINET_WOODWORK</strong>: 客廳電視牆、主臥次臥衣櫃，依 S-1166 規格分組。</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h5 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    <span>在 LayOut 中 1:40 出圖 SOP</span>
                  </h5>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                    <li>在 SketchUp 切換到「頂視圖」與「平行投影」，儲存為 Scene 1 (平面配置)。</li>
                    <li>點選「檔案 &gt; 傳送到 LayOut」，選擇 ISO A3 橫向畫布。</li>
                    <li>視口比例設定為 <strong>1:40</strong>，渲染模式選擇 <strong>混合 (Hybrid)</strong>。</li>
                    <li>套用我們附上的「加減設計標準 A3 圖框底圖」，所有線條、字型與比例即可與您的圖紙一模一樣！</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>加減設計專案施工圖冊規格引擎已連線 · 繪圖標準：Corey 馮凱瑞 (星玥灣 B3-7F)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSheetIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSheetIndex === 0}
              className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一頁</span>
            </button>

            <span className="font-mono text-slate-300 font-bold">
              {activeSheetIndex + 1} / {COREY_SHEETS.length}
            </span>

            <button
              onClick={() => setActiveSheetIndex((prev) => Math.min(COREY_SHEETS.length - 1, prev + 1))}
              disabled={activeSheetIndex === COREY_SHEETS.length - 1}
              className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition disabled:opacity-30"
            >
              <span>下一頁</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
