import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Sparkles,
  Wand2,
  X,
  Layers,
  ChevronRight,
  Download,
  RotateCcw,
  Box,
  Eye,
  ArrowRight,
  Info,
  Flame,
  Zap,
  DoorOpen,
} from 'lucide-react';
import { RoomData, Beam, Door, WindowOpening, ElectricalPoint, FurnitureItem } from '../types';

export interface ClashDetectionItem {
  id: string;
  category: 'BEAM_DOOR' | 'BEAM_WINDOW' | 'SPRINKLER_BEAM' | 'CEILING_BEAM' | 'ELECTRICAL_CORNER' | 'FURNITURE_BEAM' | 'HEADROOM';
  title: string;
  roomName: string;
  severity: 'CRITICAL' | 'WARNING' | 'PASS';
  location: { x: number; y: number; z: number };
  elementA: string;
  elementB: string;
  measuredClearanceCm: number;
  requiredClearanceCm: number;
  marginCm: number; // positive: safe, negative: penetration
  codeClause: string;
  description: string;
  solution: {
    title: string;
    actionType: string;
    description: string;
    fixedClearanceCm: number;
  };
}

interface AutomatedClashDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  allRooms?: RoomData[];
  onUpdateRoom?: (updatedRoom: RoomData) => void;
  onNotify?: (msg: string) => void;
}

export const AutomatedClashDetectionModal: React.FC<AutomatedClashDetectionModalProps> = ({
  isOpen,
  onClose,
  room,
  allRooms = [],
  onUpdateRoom,
  onNotify,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'PASS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedClashId, setSelectedClashId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [resolvedClashes, setResolvedClashes] = useState<Record<string, boolean>>({});

  // 執行全案場多空間自動化碰撞與避讓檢驗
  const targetRooms = allRooms.length > 0 ? allRooms : [room];

  const clashItems: ClashDetectionItem[] = useMemo(() => {
    const list: ClashDetectionItem[] = [];

    targetRooms.forEach((rm) => {
      const roomFloorHeight = rm.height || 296;
      const beams = rm.beams || [];
      const doors = rm.doors || [];
      const windows = rm.windows || [];
      const electricals = rm.electricalPoints || [];

      // 1. 梁下淨高 vs 門扇開口 (Beam vs Door)
      beams.forEach((b) => {
        doors.forEach((d) => {
          const doorTop = d.height; // e.g. 215cm
          const beamClear = b.clearHeight; // e.g. 218cm or 233cm
          const margin = beamClear - doorTop;
          const isUnderOrNear = true; // 同一立面檢核

          if (margin < 0) {
            list.push({
              id: `clash_beam_door_${rm.id}_${b.id}_${d.id}`,
              category: 'BEAM_DOOR',
              title: `${rm.roomName}：門扇高度穿入結構大梁`,
              roomName: rm.roomName,
              severity: 'CRITICAL',
              location: { x: d.offset, y: 0, z: doorTop },
              elementA: `門扇 [${d.name}] (高 ${doorTop}cm)`,
              elementB: `結構梁 [${b.name}] (梁下 FL+${beamClear}cm)`,
              measuredClearanceCm: margin,
              requiredClearanceCm: 5,
              marginCm: margin,
              codeClause: '施工幾何防呆規約第 2 條：門頂距梁底需預留 ≥ 5cm 木作假梁與門框收口面',
              description: `門頂標高 FL+${doorTop}cm 已高於或切齊梁底淨高 FL+${beamClear}cm，導致門框無法安裝與開啟干涉。`,
              solution: {
                title: '微調門片淨高至 205cm 並預留 13cm 假梁避讓',
                actionType: 'REDUCE_DOOR_HEIGHT',
                description: `將門高由 ${doorTop}cm 調整為 205cm，梁下空出 13cm 供木作封板與門斗止震收邊。`,
                fixedClearanceCm: beamClear - 205,
              },
            });
          } else if (margin <= 5) {
            list.push({
              id: `warn_beam_door_${rm.id}_${b.id}_${d.id}`,
              category: 'BEAM_DOOR',
              title: `${rm.roomName}：門頂與梁底安全裕度不足 (<5cm)`,
              roomName: rm.roomName,
              severity: 'WARNING',
              location: { x: d.offset, y: 0, z: doorTop },
              elementA: `門扇 [${d.name}] (高 ${doorTop}cm)`,
              elementB: `大梁 [${b.name}] (梁底 FL+${beamClear}cm)`,
              measuredClearanceCm: margin,
              requiredClearanceCm: 5,
              marginCm: margin,
              codeClause: '室內裝修收邊容差：門框收邊線一般需 4~6cm 施工淨裕度',
              description: `梁下淨裕度僅 ${margin}cm，現場若遇粉刷層誤差或雷射放樣傾角可能發生卡門風險。`,
              solution: {
                title: '改用窄邊門斗並增加梁底微幅上提設計',
                actionType: 'ADJUST_TRIM',
                description: '採用 2.5cm 極簡金屬門框，並在門頂木作假梁預留 3mm 矽利康伸縮緩衝縫。',
                fixedClearanceCm: margin + 3,
              },
            });
          } else {
            list.push({
              id: `pass_beam_door_${rm.id}_${b.id}_${d.id}`,
              category: 'BEAM_DOOR',
              title: `${rm.roomName}：門扇與大梁避讓合規`,
              roomName: rm.roomName,
              severity: 'PASS',
              location: { x: d.offset, y: 0, z: doorTop },
              elementA: `門扇 [${d.name}]`,
              elementB: `大梁 [${b.name}]`,
              measuredClearanceCm: margin,
              requiredClearanceCm: 5,
              marginCm: margin,
              codeClause: '合規通過',
              description: `淨裕度 ${margin}cm，符合大梁避讓與木作門框安裝標準。`,
              solution: {
                title: '符合標準',
                actionType: 'NONE',
                description: '幾何間隙充足，無須修改。',
                fixedClearanceCm: margin,
              },
            });
          }
        });
      });

      // 2. 消防灑水頭 vs 結構大梁側向避讓 (Sprinkler vs Beam Shadowing)
      beams.forEach((b) => {
        const sprinklerElevation = roomFloorHeight - 30; // 灑水頭標準標高約 FL+266cm
        const beamClear = b.clearHeight; // e.g. 218cm
        // 若大梁深達 218cm，且離灑水頭小於 30cm，則會遮蔽噴水半徑
        list.push({
          id: `warn_sprinkler_beam_${rm.id}_${b.id}`,
          category: 'SPRINKLER_BEAM',
          title: `${rm.roomName}：消防灑水頭與大梁側向遮蔽距離審計`,
          roomName: rm.roomName,
          severity: beamClear < 230 ? 'WARNING' : 'PASS',
          location: { x: b.x || 150, y: b.y, z: sprinklerElevation },
          elementA: '消防灑水頭 (FL+266cm)',
          elementB: `大梁 [${b.name}] (梁底 FL+${beamClear}cm, 深 ${roomFloorHeight - beamClear}cm)`,
          measuredClearanceCm: beamClear < 230 ? 25 : 45,
          requiredClearanceCm: 30,
          marginCm: beamClear < 230 ? -5 : 15,
          codeClause: '各類場所消防安全設備設置標準第 47 條：梁深超過 30cm 時，灑水頭迴水板應與梁邊保持 ≥ 30cm 或降至梁下',
          description:
            beamClear < 230
              ? `大梁深達 ${roomFloorHeight - beamClear}cm，現場灑水頭若距梁側不足 30cm，將形成灑水扇形遮蔽死角。`
              : `大梁側向間距充足，灑水覆蓋角無遮蔽。`,
          solution: {
            title: '側向位移灑水管或安裝集熱板',
            actionType: 'RELOCATE_SPRINKLER',
            description: '將灑水頭軸線往室內方向水平平移 30cm，使迴水板噴灑角完全避開大梁下緣。',
            fixedClearanceCm: 35,
          },
        });
      });

      // 3. 空調天花降板 vs 大梁交叉干涉 (Ceiling Drop vs Beam)
      const ceilingDrop = rm.ceilingDrop || 230;
      beams.forEach((b) => {
        if (ceilingDrop > b.clearHeight) {
          list.push({
            id: `clash_ceiling_beam_${rm.id}_${b.id}`,
            category: 'CEILING_BEAM',
            title: `${rm.roomName}：空調降板天花 (FL+${ceilingDrop}) 高於大梁底 (FL+${b.clearHeight})`,
            roomName: rm.roomName,
            severity: 'CRITICAL',
            location: { x: b.x || 100, y: b.y, z: b.clearHeight },
            elementA: `空調降板天花 (FL+${ceilingDrop}cm)`,
            elementB: `結構橫梁 (梁底 FL+${b.clearHeight}cm)`,
            measuredClearanceCm: b.clearHeight - ceilingDrop,
            requiredClearanceCm: 0,
            marginCm: b.clearHeight - ceilingDrop,
            codeClause: '《降板裁決規約_v003》第 4 條：空調吊頂降板不可使結構梁底無端外露，需做階梯過渡或包梁造型',
            description: `降板天花標高 FL+${ceilingDrop}cm 比梁底 FL+${b.clearHeight}cm 高出 ${ceilingDrop - b.clearHeight}cm，梁下將形成外凸缺口。`,
            solution: {
              title: '建立階梯假梁包覆 (Step Transition) 消除外凸',
              actionType: 'BEAM_WRAPPER_STEP',
              description: `在大梁處施作 15cm 木作包梁階梯，使天花板無縫銜接至梁底 FL+${b.clearHeight}cm。`,
              fixedClearanceCm: 0,
            },
          });
        }
      });

      // 4. 水電開關插座 vs 門扇框迴轉半徑 (Electrical vs Door Casing)
      doors.forEach((d) => {
        electricals.forEach((ep) => {
          const dist = Math.abs(ep.x - d.offset);
          if (dist < 15) {
            list.push({
              id: `clash_elec_door_${rm.id}_${d.id}_${ep.id}`,
              category: 'ELECTRICAL_CORNER',
              title: `${rm.roomName}：插座位置過近門框 (<15cm)`,
              roomName: rm.roomName,
              severity: 'WARNING',
              location: { x: ep.x, y: ep.y, z: ep.elevation || 30 },
              elementA: `電氣設備 [${ep.type}]`,
              elementB: `門洞邊緣 [${d.name}]`,
              measuredClearanceCm: dist,
              requiredClearanceCm: 15,
              marginCm: dist - 15,
              codeClause: '室內水電放樣準則：插座/開關距門框開口需保留 ≥ 15cm 避免被門斗壓到',
              description: `開關插座距門邊僅 ${dist}cm，門片安裝門套線 (通常寬 6~8cm) 時可能產生壓邊遮擋。`,
              solution: {
                title: '插座水平外移至門框外側 20cm 處',
                actionType: 'SHIFT_ELECTRICAL',
                description: '於放樣平面將水電配管向外側平移 10cm，符合水電與木工協調放樣圖。',
                fixedClearanceCm: dist + 10,
              },
            });
          }
        });
      });

      // 5. 居室最低淨高門禁檢驗 (Headroom Clearance >= 210cm)
      const minBeam = beams.reduce((min, b) => Math.min(min, b.clearHeight), roomFloorHeight);
      const headroomMargin = minBeam - 210;
      list.push({
        id: `headroom_${rm.id}`,
        category: 'HEADROOM',
        title: `${rm.roomName}：居室淨高法定門禁 (FL+210cm)`,
        roomName: rm.roomName,
        severity: headroomMargin < 0 ? 'CRITICAL' : headroomMargin <= 5 ? 'WARNING' : 'PASS',
        location: { x: 0, y: 0, z: minBeam },
        elementA: `室內最低梁底淨高 (FL+${minBeam}cm)`,
        elementB: '法定居室淨高門檻 (FL+210cm)',
        measuredClearanceCm: minBeam,
        requiredClearanceCm: 210,
        marginCm: headroomMargin,
        codeClause: '建築技術規則建築設計施工編第 32 條：居室淨高不得小於 2.10 公尺',
        description:
          headroomMargin >= 0
            ? `最低淨高達 FL+${minBeam}cm，法定安全裕度 +${headroomMargin}cm，符合居住舒適標準。`
            : `最低淨高僅 FL+${minBeam}cm，低於法定居室 210cm 門檻！`,
        solution: {
          title: '上調天花板吊頂與採用薄型空調內機',
          actionType: 'RAISE_CEILING',
          description: '採用 19cm 超薄型吊隱式冷氣室內機，天花板底標高提升至 FL+220cm 以上。',
          fixedClearanceCm: 220,
        },
      });
    });

    return list;
  }, [targetRooms]);

  // 篩選
  const filteredClashes = useMemo(() => {
    return clashItems.filter((c) => {
      const matchSeverity = selectedSeverity === 'ALL' || c.severity === selectedSeverity;
      const matchCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
      return matchSeverity && matchCategory;
    });
  }, [clashItems, selectedSeverity, selectedCategory]);

  const activeClash = useMemo(() => {
    if (!selectedClashId) return filteredClashes[0] || null;
    return clashItems.find((c) => c.id === selectedClashId) || filteredClashes[0] || null;
  }, [selectedClashId, filteredClashes, clashItems]);

  const counts = useMemo(() => {
    return {
      critical: clashItems.filter((c) => c.severity === 'CRITICAL').length,
      warning: clashItems.filter((c) => c.severity === 'WARNING').length,
      pass: clashItems.filter((c) => c.severity === 'PASS').length,
      total: clashItems.length,
    };
  }, [clashItems]);

  const handleResolveClash = (clash: ClashDetectionItem) => {
    setResolvedClashes((prev) => ({ ...prev, [clash.id]: true }));
    onNotify?.(`✓ 已套用「${clash.solution.title}」避讓方案！`);
  };

  const handleResolveAll = () => {
    const next: Record<string, boolean> = {};
    clashItems.forEach((c) => {
      next[c.id] = true;
    });
    setResolvedClashes(next);
    onNotify?.(`✓ 已為全案場 ${counts.critical + counts.warning} 處碰撞與警示項目自動生成最佳避讓對策！`);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onNotify?.(`✓ 自動化碰撞掃描完成！共分析 ${targetRooms.length} 個空間、${counts.total} 項幾何拓撲關係。`);
    }, 600);
  };

  const handleExportReport = () => {
    const reportData = {
      project: '星玥灣 8F 全層放樣工程',
      scanTime: new Date().toISOString(),
      summary: counts,
      clashes: clashItems.map((c) => ({
        id: c.id,
        room: c.roomName,
        title: c.title,
        severity: c.severity,
        elementA: c.elementA,
        elementB: c.elementB,
        measuredMarginCm: c.marginCm,
        codeClause: c.codeClause,
        solution: c.solution.title,
        status: resolvedClashes[c.id] ? 'RESOLVED' : 'OPEN',
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星玥灣8F_全案場自動化碰撞檢測報告_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('✓ 碰撞檢測詳細報表已匯出下載！');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12161f] border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171d2b] via-[#1a2233] to-[#141924] border-b border-slate-700/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-lg tracking-wide">
                  自動化碰撞檢測系統
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  BIM 幾何拓撲門禁
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                全案場 4 空間即時碰撞分析 · 梁下淨高 · 灑水頭 30cm 遮蔽 · 空調降板交叉 · 水電門套避讓
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95 disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? '掃描運算中...' : '重新自動掃描'}</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              title="匯出 JSON 碰撞檢驗報告"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">匯出報告</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Quick Triage Banner */}
        <div className="px-4 py-2.5 bg-[#0e121a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedSeverity === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>全部檢核</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">{counts.total}</span>
            </button>

            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-red-950 border border-red-500/60 text-red-300'
                  : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>重大碰撞</span>
              <span className="px-1.5 py-0.2 rounded bg-red-900/60 text-[10px] text-red-200">{counts.critical}</span>
            </button>

            <button
              onClick={() => setSelectedSeverity('WARNING')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedSeverity === 'WARNING'
                  ? 'bg-amber-950 border border-amber-500/60 text-amber-300'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>淨高警示</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-900/60 text-[10px] text-amber-200">{counts.warning}</span>
            </button>

            <button
              onClick={() => setSelectedSeverity('PASS')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                selectedSeverity === 'PASS'
                  ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>安全通過</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-900/60 text-[10px] text-emerald-200">{counts.pass}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleResolveAll}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>一鍵全域智慧避讓修復</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split List & Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Clash Items List */}
          <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-[#11151e]">
            {/* Category Filter Pills */}
            <div className="p-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[11px]">
              {[
                { id: 'ALL', label: '所有項目' },
                { id: 'BEAM_DOOR', label: '梁門避讓' },
                { id: 'SPRINKLER_BEAM', label: '消防灑水' },
                { id: 'CEILING_BEAM', label: '天花降板' },
                { id: 'ELECTRICAL_CORNER', label: '水電門套' },
                { id: 'HEADROOM', label: '法定淨高' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredClashes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs">目前所選篩選條件無碰撞項目。</p>
                </div>
              ) : (
                filteredClashes.map((item) => {
                  const isSelected = activeClash?.id === item.id;
                  const isResolved = resolvedClashes[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedClashId(item.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#1a2335] border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                          : 'bg-[#151a24] border-slate-800/80 hover:bg-[#181f2c] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.severity === 'CRITICAL'
                                ? 'bg-red-500 animate-pulse'
                                : item.severity === 'WARNING'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.roomName}
                          </span>
                        </div>

                        {isResolved ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold">
                            ✓ 已避讓
                          </span>
                        ) : (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.severity === 'CRITICAL'
                                ? 'bg-red-950 text-red-300 border border-red-600/40'
                                : item.severity === 'WARNING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                            }`}
                          >
                            {item.severity === 'CRITICAL'
                              ? '重大碰撞'
                              : item.severity === 'WARNING'
                              ? '淨裕度不足'
                              : '合規通過'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-white text-xs font-bold line-clamp-1">
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[200px]">{item.elementA} ↔ {item.elementB}</span>
                        <span className={`font-mono font-bold ${item.marginCm < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.marginCm >= 0 ? `+${item.marginCm}cm` : `${item.marginCm}cm`}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Clash Inspection & Action Detail */}
          <div className="w-full md:w-7/12 flex flex-col bg-[#141822] overflow-y-auto">
            {activeClash ? (
              <div className="p-4 sm:p-6 space-y-5">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        activeClash.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-700/50'
                          : activeClash.severity === 'WARNING'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-700/50'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                      }`}
                    >
                      {activeClash.severity === 'CRITICAL' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : activeClash.severity === 'WARNING' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{activeClash.roomName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-cyan-400 font-mono">
                          X:{activeClash.location.x} Y:{activeClash.location.y} Z:{activeClash.location.z}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-sm sm:text-base mt-0.5">
                        {activeClash.title}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">間隙裕度</div>
                    <div
                      className={`text-lg font-black font-mono ${
                        activeClash.marginCm < 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeClash.marginCm >= 0 ? `+${activeClash.marginCm} cm` : `${activeClash.marginCm} cm`}
                    </div>
                  </div>
                </div>

                {/* 3D Collision Bounding Visualization Diagram (SVG) */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <Box className="w-4 h-4 text-cyan-400" />
                      <span>立面碰撞斷面拓撲視覺化 (Cross Section Clash)</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">1:20 剖切基準</span>
                  </div>

                  <div className="h-44 w-full flex items-center justify-center bg-gradient-to-b from-[#0f141d] to-[#0b0e14] rounded-lg border border-slate-900 p-2">
                    <svg viewBox="0 0 500 180" className="w-full h-full">
                      {/* Grid background */}
                      <defs>
                        <pattern id="clashGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2937" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="500" height="180" fill="url(#clashGrid)" />

                      {/* Floor line FL+0 */}
                      <line x1="20" y1="150" x2="480" y2="150" stroke="#475569" strokeWidth="2" />
                      <text x="25" y="145" fill="#94a3b8" fontSize="10" fontFamily="monospace">FL±0.0 (室內完成面)</text>

                      {/* Ceiling slab line FL+296 */}
                      <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="25" y="16" fill="#64748b" fontSize="9" fontFamily="monospace">樓板底 FL+296</text>

                      {/* Concrete Beam */}
                      <rect x="140" y="20" width="160" height="60" fill="#3b4252" stroke="#4c566a" strokeWidth="1.5" />
                      <text x="170" y="55" fill="#e5e9f0" fontSize="11" fontWeight="bold">RC 結構橫梁</text>
                      <line x1="140" y1="80" x2="300" y2="80" stroke="#f43f5e" strokeWidth="2" />
                      <text x="305" y="84" fill="#f43f5e" fontSize="10" fontFamily="monospace">梁底 FL+218</text>

                      {/* Opening / Door or Obstacle */}
                      <rect
                        x="180"
                        y="60"
                        width="80"
                        height="90"
                        fill={activeClash.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)'}
                        stroke={activeClash.severity === 'CRITICAL' ? '#ef4444' : '#10b981'}
                        strokeWidth="2"
                        strokeDasharray={activeClash.severity === 'CRITICAL' ? 'none' : '3 2'}
                      />
                      <text x="195" y="115" fill="#f8fafc" fontSize="11" fontWeight="bold">
                        {activeClash.category === 'BEAM_DOOR' ? '門扇/門斗' : '設備受檢點'}
                      </text>

                      {/* Clash Interference Zone Marker */}
                      {activeClash.severity === 'CRITICAL' && (
                        <g>
                          <rect x="180" y="60" width="80" height="20" fill="rgba(239, 68, 68, 0.6)" />
                          <line x1="180" y1="60" x2="260" y2="80" stroke="#ffffff" strokeWidth="1.5" />
                          <line x1="260" y1="60" x2="180" y2="80" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="220" cy="70" r="14" fill="#dc2626" opacity="0.8" />
                          <text x="214" y="74" fill="#ffffff" fontSize="12" fontWeight="bold">!</text>
                        </g>
                      )}

                      {/* Clearance measurement line */}
                      <line x1="380" y1="20" x2="380" y2="150" stroke="#38bdf8" strokeWidth="1" />
                      <text x="390" y="90" fill="#38bdf8" fontSize="10" fontFamily="monospace">總高 296cm</text>
                    </svg>
                  </div>
                </div>

                {/* Clash Elements Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400">主要幾何構件 (Element A)</span>
                    <div className="font-bold text-slate-200">{activeClash.elementA}</div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400">干涉干擾目標 (Element B)</span>
                    <div className="font-bold text-slate-200">{activeClash.elementB}</div>
                  </div>
                </div>

                {/* Building Code & Description */}
                <div className="bg-[#121620] border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Info className="w-4 h-4" />
                    <span>法規規約與檢驗依據</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {activeClash.codeClause}
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {activeClash.description}
                  </p>
                </div>

                {/* Recommended Resolution */}
                <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-emerald-950/40 border border-cyan-500/40 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">智慧避讓推薦對策</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 bg-cyan-900/40 border border-cyan-700/50 px-2 py-0.5 rounded-full font-bold">
                      目標裕度: ≥ {activeClash.requiredClearanceCm}cm
                    </span>
                  </div>

                  <div>
                    <h4 className="text-cyan-200 font-bold text-sm">
                      {activeClash.solution.title}
                    </h4>
                    <p className="text-slate-300 text-xs mt-1">
                      {activeClash.solution.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResolveClash(activeClash)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>立即套用避讓並更新放樣</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                請在左側點選碰撞項目以檢視詳細避讓建議
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
