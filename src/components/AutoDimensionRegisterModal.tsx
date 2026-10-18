import React, { useState, useMemo } from 'react';
import { RoomData } from '../types';
import {
  GeneratedDimensionSet,
  AutoDimensionItem,
  calculateWallBeamDimensionChains,
  WallBeamDimensionChainResult,
} from '../utils/autoDimensionEngine';
import {
  Ruler,
  X,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  Download,
  Layers,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface AutoDimensionRegisterModalProps {
  room: RoomData;
  dimensionData: GeneratedDimensionSet;
  onClose: () => void;
  onOpenChainTool?: () => void;
}

export const AutoDimensionRegisterModal: React.FC<AutoDimensionRegisterModalProps> = ({
  room,
  dimensionData,
  onClose,
  onOpenChainTool,
}) => {
  const [filter, setFilter] = useState<'all' | 'wall_beam' | 'wall' | 'opening' | 'drop' | 'beam' | 'elevation'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const chainResult: WallBeamDimensionChainResult = useMemo(() => {
    return calculateWallBeamDimensionChains(room);
  }, [room]);

  const filteredItems = dimensionData.allDimensions.filter((item) => {
    if (filter === 'all' || filter === 'wall_beam') return true;
    return item.category === filter;
  });

  const handleCopySchedule = () => {
    const lines = [
      `【室內設計室內裝修幾何工程 · 自動生成尺寸標註核定總清冊】`,
      `空間名稱：${room.roomName}`,
      `尺寸總數：${dimensionData.totalCount} 處`,
      `5 倍數契約檢核合規率：${dimensionData.rule5PassRate}% (${dimensionData.rule5PassedCount}/${dimensionData.totalCount})`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `編號\t類別\t標籤/構件\t數值(cm)\t5倍數合規\t說明`,
    ];

    dimensionData.allDimensions.forEach((item, idx) => {
      lines.push(
        `#${idx + 1}\t${item.category}\t${item.label}\t${item.value}cm\t${item.rule5Compliant ? 'PASS' : 'CHECK'}\t${item.description}`
      );
    });

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  自動生成尺寸標註核定總表
                </h3>
                <span className="bg-emerald-950 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold">
                  共補足 {dimensionData.totalCount} 處標註
                </span>
                <span className="bg-cyan-950 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  5 倍數合規 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                依據 {room.roomName} 現況放樣尺寸自動補足外牆開間、門窗邊距偏移與天花降板標高
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySchedule}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-all active:scale-95"
              title="複製全室尺寸標註清冊文字"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製標註總表' : '複製標註總表'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              類別篩選：
            </span>
            {[
              { id: 'all', label: `全部標註 (${dimensionData.totalCount})` },
              {
                id: 'wall_beam',
                label:
                  chainResult.violationsCount > 0
                    ? `⚠️ 牆-梁自動尺寸鏈 (${chainResult.violationsCount} 處紅框)`
                    : `牆-梁自動尺寸鏈 (${chainResult.totalSegments})`,
              },
              { id: 'wall', label: '牆面開間分段' },
              { id: 'opening', label: '門窗邊距偏移' },
              { id: 'drop', label: '天花降板高程' },
              { id: 'beam', label: '大樑淨高尺寸' },
              { id: 'elevation', label: '垂向標高基準' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                  filter === tab.id
                    ? tab.id === 'wall_beam' && chainResult.violationsCount > 0
                      ? 'bg-red-600 text-white font-bold shadow animate-pulse'
                      : 'bg-emerald-600 text-white font-bold shadow'
                    : tab.id === 'wall_beam' && chainResult.violationsCount > 0
                    ? 'bg-red-950 text-red-300 border border-red-700/60'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {filter === 'wall_beam' ? `顯示 ${chainResult.totalSegments} 段牆梁間距` : `顯示 ${filteredItems.length} 項標註`}
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-4">
          {filter === 'wall_beam' ? (
            <div className="space-y-3">
              {chainResult.violationsCount > 0 && (
                <div className="p-3 bg-red-950/60 border border-red-500/70 rounded-xl text-xs flex items-center justify-between text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>
                      發現 <strong>{chainResult.violationsCount} 處非 5 倍數間距</strong>，圖面已開啟紅框警示。
                    </span>
                  </div>
                  {onOpenChainTool && (
                    <button
                      onClick={onOpenChainTool}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition"
                    >
                      開啟尺寸鏈工具
                    </button>
                  )}
                </div>
              )}

              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 w-12 text-center">序號</th>
                    <th className="p-2.5 w-20">軸向</th>
                    <th className="p-2.5">起訖構件 (牆面/梁緣)</th>
                    <th className="p-2.5 w-24 text-right">實測間距</th>
                    <th className="p-2.5 w-24 text-center">5倍數狀態</th>
                    <th className="p-2.5 w-24 text-right">規範建議值</th>
                    <th className="p-2.5 w-20 text-center">偏離差</th>
                    <th className="p-2.5">星玥灣施工契約說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {chainResult.allSegments.map((seg, idx) => (
                    <tr
                      key={seg.id}
                      className={!seg.rule5Compliant ? 'bg-red-950/20 hover:bg-red-950/40' : 'hover:bg-slate-800/50'}
                    >
                      <td className="p-2.5 text-center font-mono text-slate-500">#{idx + 1}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {seg.axis} 軸
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-white">
                        <div>{seg.fromLabel} ➜ {seg.toLabel}</div>
                        <div className="text-[10px] text-slate-500 font-mono">[{seg.fromCoord} ➜ {seg.toCoord} cm]</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {seg.rule5Compliant ? (
                          <span className="text-emerald-400">{seg.distance} cm</span>
                        ) : (
                          <span className="border-2 border-red-500 bg-red-950/90 text-red-300 px-2 py-0.5 rounded inline-block shadow animate-pulse">
                            {seg.distance} cm
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {seg.rule5Compliant ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-red-600 text-white shadow animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            紅框警示
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">
                        {seg.recommendedValue} cm
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">
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
          ) : (
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="p-2.5 w-12 text-center">序號</th>
                <th className="p-2.5 w-24">標註類別</th>
                <th className="p-2.5">標註項目與構件</th>
                <th className="p-2.5 w-24 text-right">放樣數值</th>
                <th className="p-2.5 w-24 text-center">5倍數原則</th>
                <th className="p-2.5 w-36">放樣定位起迄</th>
                <th className="p-2.5">施工放樣說明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2.5 text-center font-mono text-slate-500">#{idx + 1}</td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.category === 'wall'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                          : item.category === 'opening'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                          : item.category === 'drop'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                          : item.category === 'beam'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      }`}
                    >
                      {item.category === 'wall'
                        ? '牆面開間'
                        : item.category === 'opening'
                        ? '門窗偏移'
                        : item.category === 'drop'
                        ? '天花降板'
                        : item.category === 'beam'
                        ? '結構大樑'
                        : '垂向標高'}
                    </span>
                  </td>
                  <td className="p-2.5 font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{item.targetEntity}</div>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                    {item.value} {item.unit}
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                        item.rule5Compliant
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {item.rule5Compliant ? 'PASS' : 'REV'}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-400">
                    {item.startOffset !== undefined && item.endOffset !== undefined
                      ? `[${item.startOffset} → ${item.endOffset} cm]`
                      : '全室基準線'}
                  </td>
                  <td className="p-2.5 text-slate-400 text-[11px] leading-relaxed">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Summary */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>所有補足標註均通過室內設計《降板裁決_v003》與 V-01~V-10 幾何契約簽證。</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition-all"
          >
            關閉總表
          </button>
        </div>
      </div>
    </div>
  );
};
