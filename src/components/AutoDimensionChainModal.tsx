import React, { useState } from 'react';
import { RoomData, Beam } from '../types';
import {
  WallBeamDimensionChainResult,
  WallBeamDimensionSegment,
  calculateWallBeamDimensionChains,
  snapRoomBeamsToRule5,
  generateCadDimensionLisp,
} from '../utils/autoDimensionEngine';
import {
  Ruler,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  RotateCcw,
  PlusCircle,
  FileCode,
  Info,
} from 'lucide-react';

interface AutoDimensionChainModalProps {
  room: RoomData;
  onUpdateRoom: (updated: RoomData) => void;
  onClose: () => void;
  onHighlightSegment?: (segmentId: string) => void;
}

export const AutoDimensionChainModal: React.FC<AutoDimensionChainModalProps> = ({
  room,
  onUpdateRoom,
  onClose,
  onHighlightSegment,
}) => {
  const [activeTab, setActiveTab] = useState<'y_chain' | 'x_chain' | 'violations' | 'lisp'>('y_chain');
  const [copiedLisp, setCopiedLisp] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 計算當前空間尺寸鏈
  const chainResult: WallBeamDimensionChainResult = calculateWallBeamDimensionChains(room);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 一鍵契約校正 (Snap to 5-multiple)
  const handleSnapToRule5 = () => {
    const updated = snapRoomBeamsToRule5(room);
    onUpdateRoom(updated);
    showToast('✨ 已完成星玥灣幾何契約校正！梁體坐標與寬度已全數對齊 5 倍數模數。');
  };

  // 注入非 5 倍數測試梁 (供驗收人員驗證紅框警示功能)
  const handleInjectNon5xBeam = () => {
    const newBeam: Beam = {
      id: `beam-test-non5-${Date.now()}`,
      name: '現場追加非標管線包梁 (實測 138cm)',
      width: 38, // 非 5 倍數
      depth: 45,
      clearHeight: 247, // 非 5 倍數
      orientation: 'horizontal',
      y: 138, // 非 5 倍數，距離北牆 138cm
    };

    const updated = {
      ...room,
      beams: [...(room.beams || []), newBeam],
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateRoom(updated);
    setActiveTab('violations');
    showToast('⚠️ 已注入測試用非 5 倍數包梁 (北牆距梁 138cm / 梁寬 38cm)，立即觸發紅框警示！');
  };

  // 複製 CAD LISP 腳本
  const handleCopyLisp = () => {
    const lispCode = generateCadDimensionLisp(chainResult);
    navigator.clipboard.writeText(lispCode).then(() => {
      setCopiedLisp(true);
      setTimeout(() => setCopiedLisp(false), 2500);
      showToast('📋 已複製 AutoCAD LISP 標註尺寸鏈程式碼！');
    });
  };

  // 下載 CAD LISP 檔案
  const handleDownloadLisp = () => {
    const lispCode = generateCadDimensionLisp(chainResult);
    const blob = new Blob([lispCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星玥灣8F_${room.roomName}_自動尺寸鏈標註.lsp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 已下載 AutoCAD LISP 標註檔案！');
  };

  // 複製尺寸鏈放樣檢核表
  const handleCopyReport = () => {
    const lines = [
      `【星玥灣幾何契約 · 牆面與梁自動尺寸鏈放樣檢核總表】`,
      `空間名稱：${room.roomName}`,
      `空間開間：面寬 ${room.width} cm × 進深 ${room.length} cm · 清水樓高 ${room.height} cm`,
      `檢驗結果：總間距 ${chainResult.totalSegments} 處，5 倍數合規率 ${chainResult.rule5PassRate}%`,
      `警示統計：${chainResult.violationsCount} 處非 5 倍數間距（需紅框標定與調整）`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `軸向\t放樣區間\t實測間距\t5倍數契約\t規範建議值\t偏離公差\t說明`,
    ];

    chainResult.allSegments.forEach((seg, idx) => {
      const devStr = seg.rule5Compliant ? '0 cm' : `${seg.deviation > 0 ? '+' : ''}${seg.deviation} cm`;
      lines.push(
        `#${idx + 1} [${seg.axis}軸]\t${seg.fromLabel} ➜ ${seg.toLabel}\t${seg.distance} cm\t${
          seg.rule5Compliant ? 'PASS' : 'ALERT (紅框警示)'
        }\t${seg.recommendedValue} cm\t${devStr}\t${seg.description}`
      );
    });

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
      showToast('📋 已複製尺寸鏈放樣文字報告！');
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 text-center animate-slideDown shadow-lg flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-wide">
                  自動尺寸鏈工具 · 牆面與梁間距檢核
                </h3>
                <span className="bg-amber-950 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 font-mono font-bold">
                  {room.roomName}
                </span>
                {chainResult.violationsCount > 0 ? (
                  <span className="bg-red-950 text-red-300 text-xs px-2.5 py-0.5 rounded-full border border-red-500/60 font-mono font-bold flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    {chainResult.violationsCount} 處非 5 倍數紅框警示
                  </span>
                ) : (
                  <span className="bg-emerald-950 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    星玥灣 5 倍數契約 100% 合規
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                自動演算空間外牆至結構梁及各跨梁間淨距，產生合規 5 倍數連續尺寸鏈，違規間距以紅框警示。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="複製放樣尺寸鏈檢核報告"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? '已複製報告' : '複製報告'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">尺寸鏈總段數</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{chainResult.totalSegments}</span>
              <span className="text-xs text-slate-400 font-normal">段標註</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Y軸 {chainResult.yChainSegments.length} 段 + X軸 {chainResult.xChainSegments.length} 段</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">5 倍數契約合規率</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${chainResult.rule5PassRate === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {chainResult.rule5PassRate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">合規 {chainResult.rule5CompliantCount} / 總數 {chainResult.totalSegments}</div>
          </div>

          <div className={`p-2.5 rounded-xl border ${
            chainResult.violationsCount > 0
              ? 'bg-red-950/40 border-red-500/60 text-red-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="text-[11px] font-semibold flex items-center gap-1">
              {chainResult.violationsCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>非 5 倍數紅框警示</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>紅框警示清零</span>
                </>
              )}
            </div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${chainResult.violationsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {chainResult.violationsCount} 處
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              {chainResult.violationsCount > 0 ? '已在圖面上以紅框標示' : '全部間距閉合且合規'}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center gap-1">
            <button
              onClick={handleSnapToRule5}
              disabled={chainResult.violationsCount === 0}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow ${
                chainResult.violationsCount > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>一鍵契約校準 (5x)</span>
            </button>

            <button
              onClick={handleInjectNon5xBeam}
              className="w-full py-1 px-2 rounded-lg text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-rose-900/60 transition"
              title="測試警示效果：置入 138cm / 38cm 的非 5 倍數梁位"
            >
              + 注入非 5 倍數梁 (測試紅框)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('y_chain')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'y_chain'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              縱向 Y 軸尺寸鏈 (北牆 ➜ 橫梁 ➜ 南牆)
              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 font-mono">
                {chainResult.yChainSegments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('x_chain')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'x_chain'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              橫向 X 軸尺寸鏈 (西牆 ➜ 縱梁 ➜ 東牆)
              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 font-mono">
                {chainResult.xChainSegments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('violations')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'violations'
                  ? 'bg-red-600 text-white font-bold shadow'
                  : chainResult.violationsCount > 0
                  ? 'bg-red-950 text-red-300 border border-red-700/60 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>紅框警示清單 ({chainResult.violationsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('lisp')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'lisp'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-300" />
              <span>AutoCAD LISP 指令</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            星玥灣規範：公差需 ≤ 0cm (嚴格 5 的整數倍)
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {/* Y-Chain Table */}
          {activeTab === 'y_chain' && (
            <DimensionChainTable
              segments={chainResult.yChainSegments}
              axisTitle="Y 軸縱向 (進深 0 ➜ L cm)"
              totalSpan={chainResult.roomLength}
              onHighlightSegment={onHighlightSegment}
              onSnapToRule5={handleSnapToRule5}
            />
          )}

          {/* X-Chain Table */}
          {activeTab === 'x_chain' && (
            <DimensionChainTable
              segments={chainResult.xChainSegments}
              axisTitle="X 軸橫向 (開間 0 ➜ W cm)"
              totalSpan={chainResult.roomWidth}
              onHighlightSegment={onHighlightSegment}
              onSnapToRule5={handleSnapToRule5}
            />
          )}

          {/* Violations Only Tab */}
          {activeTab === 'violations' && (
            <div className="space-y-4">
              {chainResult.violationsCount === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">恭喜！全室牆面與梁間距 100% 符合星玥灣契約規範</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    所有外牆至梁邊緣、跨梁淨距及梁體斷面尺寸皆為 5 的整數倍，無任何紅框警示，施工放樣無切磚割板耗損風險。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-950/50 border border-red-500/60 rounded-xl text-xs flex items-center justify-between text-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>
                        共偵測到 <strong>{chainResult.violationsCount} 處非 5 倍數間距</strong>。已在 2D 圖面上加繪<strong>紅框警示框</strong>，請於施工放樣前校正。
                      </span>
                    </div>
                    <button
                      onClick={handleSnapToRule5}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow flex items-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>一鍵修復至 5 倍數</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chainResult.allSegments
                      .filter((s) => !s.rule5Compliant)
                      .map((seg, idx) => (
                        <div
                          key={seg.id}
                          className="p-3.5 bg-slate-950/90 border-2 border-red-500 rounded-xl relative shadow-lg overflow-hidden group hover:border-red-400 transition"
                        >
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl">
                            紅框警示 #{idx + 1}
                          </div>

                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 font-mono text-[10px]">
                              {seg.axis} 軸
                            </span>
                            <span>{seg.fromLabel} ➜ {seg.toLabel}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-red-900/40">
                            <div>
                              <div className="text-[10px] text-slate-400">現況實測間距</div>
                              <div className="text-base font-bold font-mono text-red-400">
                                {seg.distance} cm
                              </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-600" />

                            <div>
                              <div className="text-[10px] text-slate-400">星玥灣 5 倍數建議值</div>
                              <div className="text-base font-bold font-mono text-emerald-400">
                                {seg.recommendedValue} cm
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-slate-400">偏離公差</div>
                              <div className="text-sm font-bold font-mono text-amber-400">
                                {seg.deviation > 0 ? `+${seg.deviation}` : seg.deviation} cm
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            {seg.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LISP Script Tab */}
          {activeTab === 'lisp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  此 AutoLISP 腳本可直接載入 AutoCAD (APPLOAD) 或在命令行貼上，自動在專用圖層繪製連續尺寸鏈與紅框警示：
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLisp}
                    className="flex items-center gap-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/60 px-2.5 py-1 rounded text-xs font-semibold transition"
                  >
                    {copiedLisp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLisp ? '已複製' : '複製 LISP'}</span>
                  </button>
                  <button
                    onClick={handleDownloadLisp}
                    className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded text-xs font-semibold transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載 .lsp 檔案</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-96 selection:bg-cyan-900 selection:text-white">
                {generateCadDimensionLisp(chainResult)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              星玥灣幾何契約原則：所有尺寸鏈段落須相互閉合（總和等於開間/進深），非 5 倍數間距以雙線紅框強提醒，防止施工切角產生呆料。
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSnapToRule5}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>全室尺寸鏈 5 倍數校正</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              返回畫布
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DimensionChainTableProps {
  segments: WallBeamDimensionSegment[];
  axisTitle: string;
  totalSpan: number;
  onHighlightSegment?: (id: string) => void;
  onSnapToRule5?: () => void;
}

const DimensionChainTable: React.FC<DimensionChainTableProps> = ({
  segments,
  axisTitle,
  totalSpan,
  onHighlightSegment,
  onSnapToRule5,
}) => {
  const sumDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const isClosed = Math.abs(sumDistance - totalSpan) <= 0.1;

  return (
    <div className="space-y-3">
      {/* Closed Chain Verification Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{axisTitle}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">
            各段累計：<strong className="font-mono text-amber-300">{sumDistance} cm</strong>
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-300">
            空間全跨：<strong className="font-mono text-sky-300">{totalSpan} cm</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
              isClosed
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : 'bg-red-950 text-red-400 border border-red-800/60'
            }`}
          >
            {isClosed ? '✓ 尺寸鏈 100% 閉合' : '⚠️ 尺寸鏈未閉合'}
          </span>
        </div>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden shadow">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-2.5 w-12 text-center">序號</th>
              <th className="p-2.5 w-60">放樣區間 (起點 ➜ 終點)</th>
              <th className="p-2.5 w-24">區間類型</th>
              <th className="p-2.5 w-28 text-right">實測間距 (cm)</th>
              <th className="p-2.5 w-28 text-center">5倍數契約狀態</th>
              <th className="p-2.5 w-24 text-right">規範建議值</th>
              <th className="p-2.5 w-20 text-center">偏離差</th>
              <th className="p-2.5">星玥灣施工規範說明</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {segments.map((seg, idx) => (
              <tr
                key={seg.id}
                onClick={() => onHighlightSegment && onHighlightSegment(seg.id)}
                className={`transition-colors cursor-pointer ${
                  !seg.rule5Compliant
                    ? 'bg-red-950/20 hover:bg-red-950/40'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <td className="p-2.5 text-center font-mono text-slate-500">#{idx + 1}</td>

                <td className="p-2.5 font-medium text-white">
                  <div className="flex items-center gap-1.5">
                    <span>{seg.fromLabel}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{seg.toLabel}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    坐標區間：[{seg.fromCoord} ➜ {seg.toCoord} cm]
                  </div>
                </td>

                <td className="p-2.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      seg.segmentType === 'wall_to_beam'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                        : seg.segmentType === 'beam_width'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        : seg.segmentType === 'beam_to_beam'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : seg.segmentType === 'beam_to_wall'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    }`}
                  >
                    {seg.segmentType === 'wall_to_beam'
                      ? '外牆至梁'
                      : seg.segmentType === 'beam_width'
                      ? '梁體斷面'
                      : seg.segmentType === 'beam_to_beam'
                      ? '跨梁淨距'
                      : seg.segmentType === 'beam_to_wall'
                      ? '末梁至牆'
                      : '全區淨跨'}
                  </span>
                </td>

                <td className="p-2.5 text-right font-mono font-bold">
                  {seg.rule5Compliant ? (
                    <span className="text-emerald-400">{seg.distance} cm</span>
                  ) : (
                    <span className="border-2 border-red-500 bg-red-950/80 text-red-300 px-2 py-0.5 rounded inline-block shadow animate-pulse">
                      {seg.distance} cm
                    </span>
                  )}
                </td>

                <td className="p-2.5 text-center">
                  {seg.rule5Compliant ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" />
                      5X PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-red-600 text-white shadow animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      紅框警示
                    </span>
                  )}
                </td>

                <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">
                  {seg.recommendedValue} cm
                </td>

                <td className="p-2.5 text-center font-mono font-bold text-xs">
                  {seg.rule5Compliant ? (
                    <span className="text-slate-500">0</span>
                  ) : (
                    <span className="text-red-400">
                      {seg.deviation > 0 ? `+${seg.deviation}` : seg.deviation}
                    </span>
                  )}
                </td>

                <td className="p-2.5 text-slate-300 text-[11px] leading-relaxed">
                  {seg.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
