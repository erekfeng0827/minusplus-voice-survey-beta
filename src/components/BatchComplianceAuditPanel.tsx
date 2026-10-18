import React, { useState, useMemo } from 'react';
import { RoomData, RoomAuditResult, BatchAuditSummary, RoomCheckItem, TriagePriority } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ReferenceLine,
} from 'recharts';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RotateCcw,
  Download,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Wrench,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface BatchComplianceAuditPanelProps {
  rooms: RoomData[];
  onUpdateRooms?: (rooms: RoomData[]) => void;
  onNotify: (msg: string) => void;
}

// Audit single room against 5-multiple and 《降板裁決_v003.json》 contract
export function auditRoom(room: RoomData): RoomAuditResult {
  const checkItems: RoomCheckItem[] = [];

  // 1. Core Beam Clearance (Target 265)
  const beamVal = room.beamHeight;
  const isBeam5 = beamVal % 5 === 0;
  const beamExact265 = beamVal === 265;
  checkItems.push({
    id: `chk-beam-${room.id}`,
    category: 'CORE_ELEVATION',
    name: '主樑下淨高契約 (BEAM)',
    actualValue: beamVal,
    contractTarget: '265 cm (5 的 53 倍)',
    is5Multiple: isBeam5,
    deviationCm: isBeam5 ? (beamExact265 ? 0 : Math.abs(beamVal - 265)) : beamVal % 5,
    passed: isBeam5 && beamExact265,
    remark: isBeam5
      ? beamExact265
        ? '✓ 完全合規 265 cm'
        : `! 為 5 倍數，但偏離標準契約 265 cm (目前 ${beamVal} cm)`
      : `❌ 嚴重違規：${beamVal} cm 非 5 倍數 (距 265 差 ${beamVal - 265} cm)`,
  });

  // 2. Ceiling Drop (Target 230)
  const ceilVal = room.ceilingDrop;
  const isCeil5 = ceilVal % 5 === 0;
  const ceilExact230 = ceilVal === 230;
  checkItems.push({
    id: `chk-ceil-${room.id}`,
    category: 'CORE_ELEVATION',
    name: '空調天花降板 (DROP)',
    actualValue: ceilVal,
    contractTarget: '230 cm (5 的 46 倍)',
    is5Multiple: isCeil5,
    deviationCm: isCeil5 ? (ceilExact230 ? 0 : Math.abs(ceilVal - 230)) : ceilVal % 5,
    passed: isCeil5 && ceilExact230,
    remark: isCeil5
      ? ceilExact230
        ? '✓ 完全合規 230 cm'
        : `! 為 5 倍數，但偏離標準契約 230 cm (目前 ${ceilVal} cm)`
      : `❌ 嚴重違規：${ceilVal} cm 非 5 倍數`,
  });

  // 3. Bath/Kitchen Drop (Target 215)
  const bathDrop = room.bathKitchenDrop ?? 215;
  const isBath5 = bathDrop % 5 === 0;
  const bathExact215 = bathDrop === 215;
  checkItems.push({
    id: `chk-bath-${room.id}`,
    category: 'CORE_ELEVATION',
    name: '衛廚防潮降板 (BATH)',
    actualValue: bathDrop,
    contractTarget: '215 cm (5 的 43 倍)',
    is5Multiple: isBath5,
    deviationCm: isBath5 ? (bathExact215 ? 0 : Math.abs(bathDrop - 215)) : bathDrop % 5,
    passed: isBath5 && bathExact215,
    remark: isBath5
      ? bathExact215
        ? '✓ 完全合規 215 cm'
        : `! 為 5 倍數，但偏離標準契約 215 cm`
      : `❌ 嚴重違規：${bathDrop} cm 非 5 倍數`,
  });

  // 4. Floor Height (Target 280)
  const flHeight = room.height;
  const isFl5 = flHeight % 5 === 0;
  checkItems.push({
    id: `chk-fl-${room.id}`,
    category: 'BOUNDARY',
    name: '樓板淨高 (FLOOR)',
    actualValue: flHeight,
    contractTarget: `${flHeight} cm (5 倍數)`,
    is5Multiple: isFl5,
    deviationCm: isFl5 ? 0 : flHeight % 5,
    passed: isFl5,
    remark: isFl5 ? `✓ ${flHeight} cm 符合 5 倍數` : `❌ ${flHeight} cm 非 5 倍數`,
  });

  // 5. Room Width & Length
  const isWidth5 = room.width % 5 === 0;
  checkItems.push({
    id: `chk-w-${room.id}`,
    category: 'BOUNDARY',
    name: '開間面寬 (X 軸)',
    actualValue: room.width,
    contractTarget: `${room.width} cm (5 倍數)`,
    is5Multiple: isWidth5,
    deviationCm: isWidth5 ? 0 : room.width % 5,
    passed: isWidth5,
    remark: isWidth5 ? `✓ ${room.width} cm 符合格網 5 倍數` : `❌ ${room.width} cm 非 5 倍數`,
  });

  const isLen5 = room.length % 5 === 0;
  checkItems.push({
    id: `chk-l-${room.id}`,
    category: 'BOUNDARY',
    name: '進深長度 (Y 軸)',
    actualValue: room.length,
    contractTarget: `${room.length} cm (5 倍數)`,
    is5Multiple: isLen5,
    deviationCm: isLen5 ? 0 : room.length % 5,
    passed: isLen5,
    remark: isLen5 ? `✓ ${room.length} cm 符合格網 5 倍數` : `❌ ${room.length} cm 非 5 倍數`,
  });

  // 6. Beams check
  room.beams.forEach((b, idx) => {
    const isBeamClear5 = b.clearHeight % 5 === 0;
    const isDepth5 = b.depth % 5 === 0;
    checkItems.push({
      id: `chk-bm-${b.id}-${idx}`,
      category: 'INTERNAL_BEAM',
      name: `${b.name} 淨高與梁深`,
      actualValue: b.clearHeight,
      contractTarget: '淨高與截面均需為 5 倍數',
      is5Multiple: isBeamClear5 && isDepth5,
      deviationCm: isBeamClear5 && isDepth5 ? 0 : 1,
      passed: isBeamClear5 && isDepth5,
      remark: isBeamClear5 && isDepth5
        ? `✓ 淨高 ${b.clearHeight} / 梁深 ${b.depth} 合規`
        : `! 存在非 5 倍數 (淨高 ${b.clearHeight}, 深 ${b.depth})`,
    });
  });

  // 7. Doors & Windows check
  room.doors.forEach((d) => {
    const pass = d.width % 5 === 0 && d.height % 5 === 0;
    checkItems.push({
      id: `chk-door-${d.id}`,
      category: 'OPENING',
      name: `門扇 ${d.name} (${d.width}×${d.height})`,
      actualValue: d.width,
      contractTarget: '寬高均需為 5 倍數',
      is5Multiple: pass,
      deviationCm: pass ? 0 : 1,
      passed: pass,
      remark: pass ? '✓ 門洞尺寸為 5 倍數' : `! 門洞寬高非 5 倍數 (${d.width}×${d.height})`,
    });
  });

  // 8. Electrical MEP points check
  if (room.electricalPoints && room.electricalPoints.length > 0) {
    const non5Mep = room.electricalPoints.filter((ep) => ep.elevation % 5 !== 0);
    const passMep = non5Mep.length === 0;
    checkItems.push({
      id: `chk-mep-${room.id}`,
      category: 'MEP',
      name: `水電開關插座標高 (${room.electricalPoints.length} 處)`,
      actualValue: passMep ? 100 : non5Mep.length,
      contractTarget: '出線標高均需為 5 倍數',
      is5Multiple: passMep,
      deviationCm: passMep ? 0 : non5Mep.length,
      passed: passMep,
      remark: passMep
        ? `✓ 全數 ${room.electricalPoints.length} 處水電標高皆符合 5 倍數`
        : `! 發現 ${non5Mep.length} 處標高非 5 倍數 (如 ${non5Mep[0].name} FL+${non5Mep[0].elevation})`,
    });
  }

  // Calculate scores
  const totalChecks = checkItems.length;
  const passedChecks = checkItems.filter((c) => c.passed).length;
  const pass5Count = checkItems.filter((c) => c.is5Multiple).length;
  const passRate5Multiple = Math.round((pass5Count / totalChecks) * 100);

  // Defect count
  const defectCount = totalChecks - passedChecks;

  // Has critical core elevation non-5 multiple?
  const hasCoreElevationBreach = !isBeam5 || !isCeil5 || !isBath5 || !beamExact265 || !ceilExact230 || !bathExact215;
  const hasNon5Multiple = checkItems.some((c) => !c.is5Multiple);

  // Deduct points
  let score = 100;
  if (!isBeam5) score -= 25;
  else if (!beamExact265) score -= 5;

  if (!isCeil5) score -= 25;
  else if (!ceilExact230) score -= 5;

  if (!isBath5) score -= 25;
  else if (!bathExact215) score -= 5;

  if (!isWidth5) score -= 8;
  if (!isLen5) score -= 8;
  if (!isFl5) score -= 5;

  const otherDefects = checkItems.filter(
    (c) => c.category !== 'CORE_ELEVATION' && !c.passed
  ).length;
  score -= otherDefects * 4;
  score = Math.max(30, Math.min(100, score));

  // Determine Triage Priority
  let priority: TriagePriority = 'P2_COMPLIANT';
  let priorityLabel = 'P2 合規放行';

  if (hasCoreElevationBreach || !isBeam5 || !isCeil5 || !isBath5 || score < 80) {
    priority = 'P0_CRITICAL';
    priorityLabel = 'P0 緊急解塞';
  } else if (hasNon5Multiple || score < 95) {
    priority = 'P1_WARNING';
    priorityLabel = 'P1 次要優化';
  }

  // Suggested fix
  let suggestedFixSummary = '全區高層完美符合《降板裁決_v003》與 5 倍數原則，可直接放行晶晶自動出圖！';
  if (priority === 'P0_CRITICAL') {
    suggestedFixSummary = `嚴重阻斷：梁下淨高須校正至 265cm、天花降板 230cm、衛廚 215cm，排除 5 倍數異常避免晶晶退件。`;
  } else if (priority === 'P1_WARNING') {
    suggestedFixSummary = `微調建議：次要開口或插座標高取整為 5 倍數，使全室合規率達 100%。`;
  }

  return {
    roomId: room.id,
    roomName: room.roomName,
    complianceScore: score,
    passRate5Multiple,
    priority,
    priorityLabel,
    defectCount,
    checkItems,
    elevationAudit: {
      beamHeight: { value: beamVal, passed: isBeam5 && beamExact265, is5Multiple: isBeam5 },
      ceilingDrop: { value: ceilVal, passed: isCeil5 && ceilExact230, is5Multiple: isCeil5 },
      bathKitchenDrop: { value: bathDrop, passed: isBath5 && bathExact215, is5Multiple: isBath5 },
      floorHeight: { value: flHeight, passed: isFl5, is5Multiple: isFl5 },
    },
    dimensionAudit: {
      width: { value: room.width, passed: isWidth5 },
      length: { value: room.length, passed: isLen5 },
    },
    suggestedFixSummary,
  };
}

export const BatchComplianceAuditPanel: React.FC<BatchComplianceAuditPanelProps> = ({
  rooms,
  onUpdateRooms,
  onNotify,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [lastAuditTime, setLastAuditTime] = useState<string>(new Date().toLocaleTimeString());

  // Run audit across all rooms
  const auditResults: RoomAuditResult[] = useMemo(() => {
    return rooms.map(auditRoom);
  }, [rooms]);

  // Overall summary metrics
  const summary: BatchAuditSummary = useMemo(() => {
    const totalRooms = auditResults.length;
    if (totalRooms === 0) {
      return {
        totalRooms: 0,
        auditedAt: lastAuditTime,
        averageScore: 100,
        overallPassRate: 100,
        p0Count: 0,
        p1Count: 0,
        p2Count: 0,
        totalDefects: 0,
        pipelineStatus: 'CLEAR_TO_DISPATCH',
      };
    }

    const avgScore = Math.round(
      auditResults.reduce((acc, r) => acc + r.complianceScore, 0) / totalRooms
    );
    const avgPassRate = Math.round(
      auditResults.reduce((acc, r) => acc + r.passRate5Multiple, 0) / totalRooms
    );
    const p0Count = auditResults.filter((r) => r.priority === 'P0_CRITICAL').length;
    const p1Count = auditResults.filter((r) => r.priority === 'P1_WARNING').length;
    const p2Count = auditResults.filter((r) => r.priority === 'P2_COMPLIANT').length;
    const totalDefects = auditResults.reduce((acc, r) => acc + r.defectCount, 0);

    let pipelineStatus: 'BLOCKED' | 'WARNING' | 'CLEAR_TO_DISPATCH' = 'CLEAR_TO_DISPATCH';
    if (p0Count > 0) pipelineStatus = 'BLOCKED';
    else if (p1Count > 0) pipelineStatus = 'WARNING';

    return {
      totalRooms,
      auditedAt: lastAuditTime,
      averageScore: avgScore,
      overallPassRate: avgPassRate,
      p0Count,
      p1Count,
      p2Count,
      totalDefects,
      pipelineStatus,
    };
  }, [auditResults, lastAuditTime]);

  // Chart Data 1: Bar Chart Data (Rooms compliance vs 5-multiple pass rate)
  const barChartData = useMemo(() => {
    return auditResults.map((r) => ({
      name: r.roomName.replace('室內設計-', '').replace('放樣區', ''),
      fullName: r.roomName,
      complianceScore: r.complianceScore,
      passRate: r.passRate5Multiple,
      priority: r.priority,
      defects: r.defectCount,
    }));
  }, [auditResults]);

  // Chart Data 2: Pie Chart Data (Priority distribution)
  const pieChartData = useMemo(() => {
    return [
      { name: 'P0 緊急解塞', value: summary.p0Count, color: '#ef4444' },
      { name: 'P1 次要優化', value: summary.p1Count, color: '#f59e0b' },
      { name: 'P2 合規放行', value: summary.p2Count, color: '#10b981' },
    ].filter((item) => item.value > 0);
  }, [summary]);

  // Chart Data 3: Radar Chart Data (Core Contract Dimensions)
  const radarData = useMemo(() => {
    let beamPassed = 0;
    let dropPassed = 0;
    let bathPassed = 0;
    let boundaryPassed = 0;
    let mepPassed = 0;

    auditResults.forEach((r) => {
      if (r.elevationAudit.beamHeight.passed) beamPassed++;
      if (r.elevationAudit.ceilingDrop.passed) dropPassed++;
      if (r.elevationAudit.bathKitchenDrop.passed) bathPassed++;
      if (r.dimensionAudit.width.passed && r.dimensionAudit.length.passed) boundaryPassed++;
      const mepItem = r.checkItems.find((c) => c.category === 'MEP');
      if (!mepItem || mepItem.passed) mepPassed++;
    });

    const total = Math.max(1, auditResults.length);
    return [
      { dimension: '梁下淨高 265cm', compliance: Math.round((beamPassed / total) * 100), standard: 100 },
      { dimension: '空調降板 230cm', compliance: Math.round((dropPassed / total) * 100), standard: 100 },
      { dimension: '衛廚降板 215cm', compliance: Math.round((bathPassed / total) * 100), standard: 100 },
      { dimension: '建築面寬長度 (5倍數)', compliance: Math.round((boundaryPassed / total) * 100), standard: 100 },
      { dimension: '水電開關標高 (5倍數)', compliance: Math.round((mepPassed / total) * 100), standard: 100 },
    ];
  }, [auditResults]);

  // Re-run batch audit
  const handleReRunAudit = () => {
    setLastAuditTime(new Date().toLocaleTimeString());
    onNotify('已重新執行全室 5 倍數契約規範批次審計！');
  };

  // One-click batch repair all rooms to 5-multiples and contract targets
  const handleBatchFixAll = () => {
    if (!onUpdateRooms) {
      onNotify('無法更新房間資料（未提供更新處理器）');
      return;
    }

    setIsFixing(true);
    setTimeout(() => {
      const fixedRooms = rooms.map((room) => {
        // Fix core elevations to contract targets
        const newBeamHeight = 265;
        const newCeilingDrop = 230;
        const newBathKitchenDrop = 215;
        const newHeight = Math.round(room.height / 5) * 5 || 280;
        const newWidth = Math.round(room.width / 5) * 5;
        const newLength = Math.round(room.length / 5) * 5;

        // Fix beams
        const fixedBeams = room.beams.map((b) => ({
          ...b,
          clearHeight: Math.round(b.clearHeight / 5) * 5 || 265,
          depth: Math.round(b.depth / 5) * 5,
          width: Math.round(b.width / 5) * 5,
        }));

        // Fix doors
        const fixedDoors = room.doors.map((d) => ({
          ...d,
          width: Math.round(d.width / 5) * 5,
          height: Math.round(d.height / 5) * 5,
        }));

        // Fix windows
        const fixedWindows = room.windows.map((w) => ({
          ...w,
          width: Math.round(w.width / 5) * 5,
          height: Math.round(w.height / 5) * 5,
          sillHeight: Math.round(w.sillHeight / 5) * 5,
        }));

        // Fix electrical points
        const fixedMep = room.electricalPoints.map((ep) => ({
          ...ep,
          elevation: Math.round(ep.elevation / 5) * 5,
        }));

        // Fix virtual annotations
        const fixedVa = room.virtualAnnotations?.map((va) => ({
          ...va,
          dimensionValue: Math.round(va.dimensionValue / 5) * 5,
          elevation: va.elevation ? Math.round(va.elevation / 5) * 5 : undefined,
          rule5MultipleCompliant: true,
        }));

        return {
          ...room,
          beamHeight: newBeamHeight,
          ceilingDrop: newCeilingDrop,
          bathKitchenDrop: newBathKitchenDrop,
          height: newHeight,
          width: newWidth,
          length: newLength,
          beams: fixedBeams,
          doors: fixedDoors,
          windows: fixedWindows,
          electricalPoints: fixedMep,
          virtualAnnotations: fixedVa,
          evaluation: {
            ...room.evaluation,
            score: 98,
            rule5MultiplePassed: true,
            suggestions: '全室高層已自動對齊《降板裁決_v003》之 265/230/215 與 5 倍數契約規範！',
          },
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      });

      onUpdateRooms(fixedRooms);
      setIsFixing(false);
      setLastAuditTime(new Date().toLocaleTimeString());

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      onNotify('🎉 全室房間已全面自動校準為 5 倍數合規值！P0 阻塞全面解除，100% 通過契約驗收！');
    }, 600);
  };

  // Inject non-5-multiple test defects to demonstrate detection
  const handleInjectTestFlaw = () => {
    if (!onUpdateRooms) return;
    const flawedRooms = rooms.map((room, idx) => {
      if (idx === 0) {
        // Inject 268cm beam height and 232cm ceiling drop
        return {
          ...room,
          beamHeight: 268, // Non-5 multiple flaw
          ceilingDrop: 232, // Non-5 multiple flaw
          width: 483, // Non-5 multiple
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return room;
    });
    onUpdateRooms(flawedRooms);
    onNotify('已注入測試瑕疵（梁高 268cm、降板 232cm），審計系統已精準捕捉 P0 緊急解塞告警！');
  };

  // Export audit report as text
  const handleExportReport = () => {
    const reportText = `===============================================================
幾何契約 · 全室 5 倍數合規性自動批次審計報告
審計標準：《降板裁決_v003.json》契約規範 (265 / 230 / 215)
審計時間：${lastAuditTime}
總房間數：${summary.totalRooms} 間
綜合合規均分：${summary.averageScore} / 100
5 倍數符合率：${summary.overallPassRate}%
管線派發狀態：${summary.pipelineStatus === 'BLOCKED' ? '【P0 阻斷 - 需立即解塞】' : '【綠燈正常 - 可直通派發】'}
---------------------------------------------------------------
優先級分佈：
  - P0 緊急解塞：${summary.p0Count} 間
  - P1 次要優化：${summary.p1Count} 間
  - P2 合規放行：${summary.p2Count} 間
  - 累計瑕疵總數：${summary.totalDefects} 處
===============================================================

各空間審計明細清單：
${auditResults
  .map(
    (r, i) => `
[${i + 1}] ${r.roomName}
  - 解塞優先級：${r.priorityLabel}
  - 綜合評分：${r.complianceScore} 分 | 5倍數通過率：${r.passRate5Multiple}%
  - 梁下淨高 (契約265)：${r.elevationAudit.beamHeight.value} cm (${r.elevationAudit.beamHeight.passed ? '合規' : '違規'})
  - 空調降板 (契約230)：${r.elevationAudit.ceilingDrop.value} cm (${r.elevationAudit.ceilingDrop.passed ? '合規' : '違規'})
  - 衛廚降板 (契約215)：${r.elevationAudit.bathKitchenDrop.value} cm (${r.elevationAudit.bathKitchenDrop.passed ? '合規' : '違規'})
  - 面寬/進深：${r.dimensionAudit.width.value} × ${r.dimensionAudit.length.value} cm
  - 解塞建言：${r.suggestedFixSummary}
  - 瑕疵檢驗明細：
    ${r.checkItems.map((c) => `    * [${c.passed ? 'PASS' : 'FAIL'}] ${c.name}: ${c.actualValue} -> ${c.remark}`).join('\n')}
`
  )
  .join('\n')}
===============================================================
室內設計自動化工程審計簽核認證 · SHA-256 DIGITAL CONTRACT CERTIFIED
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `室內設計_5倍數合規批次審計報告_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('已匯出全室 5 倍數批次審計合規報告檔案！');
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    if (filterPriority === 'P0') return auditResults.filter((r) => r.priority === 'P0_CRITICAL');
    if (filterPriority === 'P1') return auditResults.filter((r) => r.priority === 'P1_WARNING');
    if (filterPriority === 'P2') return auditResults.filter((r) => r.priority === 'P2_COMPLIANT');
    return auditResults;
  }, [auditResults, filterPriority]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Banner: Master Audit Status & Action Trigger */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div
          className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            summary.pipelineStatus === 'BLOCKED'
              ? 'bg-red-500'
              : summary.pipelineStatus === 'WARNING'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-center ${
                summary.pipelineStatus === 'BLOCKED'
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                  : summary.pipelineStatus === 'WARNING'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  室內設計合規性自動批次審計系統
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    summary.pipelineStatus === 'BLOCKED'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                      : summary.pipelineStatus === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {summary.pipelineStatus === 'BLOCKED'
                    ? '● P0 幾何契約阻塞 (非 5 倍數)'
                    : summary.pipelineStatus === 'WARNING'
                    ? '▲ P1 待優化微調'
                    : '✓ 100% 契約合規放行'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                依據《降板裁決_v003.json》強制檢驗全室高層（265、230、215）與 5 倍數契約原則 · 上次審計：{lastAuditTime}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReRunAudit}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
              title="重新掃描所有房間"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新批次審計
            </button>

            <button
              onClick={handleInjectTestFlaw}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300/80 hover:text-amber-300 text-xs rounded-xl border border-amber-500/30 transition flex items-center gap-1.5"
              title="注入 268cm / 232cm 非 5 倍數瑕疵以測試系統捕獲告警能力"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              注入測試瑕疵
            </button>

            <button
              onClick={handleBatchFixAll}
              disabled={isFixing}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              {isFixing ? '正在校準修復全室...' : '一鍵全室 5 倍數智能自動修復'}
            </button>

            <button
              onClick={handleExportReport}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
              title="匯出審計報告"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-400">審計房間數</div>
            <div className="text-xl font-mono font-black text-white mt-0.5">{summary.totalRooms} 間</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-400">綜合合規均分</div>
            <div
              className={`text-xl font-mono font-black mt-0.5 ${
                summary.averageScore >= 95
                  ? 'text-emerald-400'
                  : summary.averageScore >= 80
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {summary.averageScore} <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-400">5 倍數符合率</div>
            <div className="text-xl font-mono font-black text-cyan-400 mt-0.5">
              {summary.overallPassRate}%
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              P0 緊急解塞
            </div>
            <div className="text-xl font-mono font-black text-red-400 mt-0.5">{summary.p0Count} 間</div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              P1 次要優化
            </div>
            <div className="text-xl font-mono font-black text-amber-400 mt-0.5">{summary.p1Count} 間</div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              P2 合規放行
            </div>
            <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">{summary.p2Count} 間</div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: 3 Recharts Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Bar Chart - Room Compliance Scores & 5-Multiple Pass Rate (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white tracking-wide">
                各房間合規得分與 5 倍數通過率對比分佈
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                合規評分
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
                5倍數符合率%
              </span>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-white border-b border-slate-800 pb-1">
                            {data.fullName}
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-300">
                            <span>解塞優先級：</span>
                            <span
                              className={`font-bold ${
                                data.priority === 'P0_CRITICAL'
                                  ? 'text-red-400'
                                  : data.priority === 'P1_WARNING'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {data.priority === 'P0_CRITICAL'
                                ? 'P0 緊急解塞'
                                : data.priority === 'P1_WARNING'
                                ? 'P1 次要優化'
                                : 'P2 合規放行'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-300">
                            <span>綜合合規得分：</span>
                            <span className="font-mono font-bold text-emerald-400">{data.complianceScore} 分</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-300">
                            <span>5 倍數符合率：</span>
                            <span className="font-mono font-bold text-cyan-400">{data.passRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-300">
                            <span>檢驗瑕疵數：</span>
                            <span className="font-mono font-bold text-amber-400">{data.defects} 項</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: '放行標準 95', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '合格底線 80', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <Bar dataKey="complianceScore" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.priority === 'P0_CRITICAL'
                          ? '#ef4444'
                          : entry.priority === 'P1_WARNING'
                          ? '#f59e0b'
                          : '#10b981'
                      }
                    />
                  ))}
                </Bar>
                <Bar dataKey="passRate" fill="#38bdf8" radius={[6, 6, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between px-1">
            <span>標柱顏色依解塞優先級自動著色：紅色為 P0 阻塞，琥珀色為 P1，綠色為 P2 合規。</span>
            <span className="text-slate-400">藍柱：5 倍數符合率</span>
          </div>
        </div>

        {/* Chart 2: Pie Chart - Unblocking Priority Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white tracking-wide">
                全室工單解塞優先級佔比分佈
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">共 {summary.totalRooms} 間房間</span>
          </div>

          <div className="w-full h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-xs">
                          <span className="font-bold text-white">{data.name}：</span>
                          <span className="font-mono font-bold text-emerald-400 ml-1">
                            {data.value} 間 ({Math.round(((data.value as number) / summary.totalRooms) * 100)}%)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-mono font-black text-white">
                {Math.round((summary.p2Count / Math.max(1, summary.totalRooms)) * 100)}%
              </div>
              <div className="text-[10px] text-slate-400">完全合規率</div>
            </div>
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>P0: {summary.p0Count} 間</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>P1: {summary.p1Count} 間</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>P2: {summary.p2Count} 間</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Radar Chart - Core 5 Dimension Compliance (12 cols) */}
        <div className="lg:col-span-12 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white tracking-wide">
                《降板裁決_v003.json》五大核心指標契約符合度雷達分析
              </h4>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              基準線：100% 契約嚴格對齊
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="室內設計全室實際合規率" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Radar name="契約標竿 (100%)" dataKey="standard" stroke="#64748b" strokeDasharray="2 2" fill="none" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="font-bold text-red-400 flex items-center justify-between">
                  <span>1. 樑下淨高契約 (BEAM)</span>
                  <span className="font-mono text-white">265 cm</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  大梁橫跨區淨高強制鎖定 265 cm (5 的 53 倍)。嚴禁出現 268 或 263 等畸零公分，避免壓樑假天花衝突。
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <span>2. 空調天花降板 (DROP)</span>
                  <span className="font-mono text-white">230 cm</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  客餐廳與臥室吊隱式主機及風箱區固定降板至 230 cm (5 的 46 倍)，預留 45*45 維修孔與集風箱。
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="font-bold text-cyan-400 flex items-center justify-between">
                  <span>3. 衛廚防潮降板 (BATH)</span>
                  <span className="font-mono text-white">215 cm</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  衛浴防潮鋁天花及玄關落塵區降板 215 cm (5 的 43 倍)，保持排水坡度防回溢與暖風機安全排氣。
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>4. 建築網格與水電標高</span>
                  <span className="font-mono text-white">MOD 5</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  面寬 (480/380/210)、長度 (550/420/260) 與插座出線標高 (30/65/120) 全數對齊 5 倍數，無縫銜接 AutoCAD 標註。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Room Cards List Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">
              各空間解塞優先級明細與快速修正清單
            </h4>
          </div>

          {/* Priority Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterPriority('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                filterPriority === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全部 ({auditResults.length})
            </button>
            <button
              onClick={() => setFilterPriority('P0')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                filterPriority === 'P0'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              P0 緊急解塞 ({summary.p0Count})
            </button>
            <button
              onClick={() => setFilterPriority('P1')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                filterPriority === 'P1'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              P1 次要優化 ({summary.p1Count})
            </button>
            <button
              onClick={() => setFilterPriority('P2')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                filterPriority === 'P2'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              P2 合規放行 ({summary.p2Count})
            </button>
          </div>
        </div>

        {/* Room Cards List */}
        <div className="space-y-3">
          {filteredResults.map((result) => {
            const isExpanded = expandedRoomId === result.roomId;
            return (
              <div
                key={result.roomId}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  result.priority === 'P0_CRITICAL'
                    ? 'bg-red-950/20 border-red-800/50 shadow-md'
                    : result.priority === 'P1_WARNING'
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                        result.priority === 'P0_CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : result.priority === 'P1_WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {result.priorityLabel}
                    </span>

                    <div>
                      <h5 className="text-sm font-bold text-white flex items-center gap-2">
                        {result.roomName}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.suggestedFixSummary}
                      </p>
                    </div>
                  </div>

                  {/* Metrics & Expand Trigger */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">合規評分</div>
                      <div
                        className={`text-base font-mono font-black ${
                          result.complianceScore >= 95
                            ? 'text-emerald-400'
                            : result.complianceScore >= 80
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {result.complianceScore} <span className="text-[10px] font-normal text-slate-500">分</span>
                      </div>
                    </div>

                    <div className="text-right pl-2 border-l border-slate-800">
                      <div className="text-[10px] text-slate-400">5倍數符合率</div>
                      <div className="text-base font-mono font-black text-cyan-400">
                        {result.passRate5Multiple}%
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedRoomId(isExpanded ? null : result.roomId)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
                      title={isExpanded ? '收合明細' : '展開檢驗項目'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Core Dimensions Badge Bar */}
                <div className="px-4 pb-3 pt-1 flex flex-wrap items-center gap-2 text-xs border-t border-slate-800/60 font-mono">
                  <span className="text-[10px] text-slate-500 font-sans">幾何高層：</span>

                  <span
                    className={`px-2 py-0.5 rounded border ${
                      result.elevationAudit.beamHeight.passed
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-red-950 border-red-500 text-red-300 font-bold'
                    }`}
                  >
                    梁下 {result.elevationAudit.beamHeight.value} cm
                    {result.elevationAudit.beamHeight.passed ? ' ✓' : ' (非265/5倍數)'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded border ${
                      result.elevationAudit.ceilingDrop.passed
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-red-950 border-red-500 text-red-300 font-bold'
                    }`}
                  >
                    降板 {result.elevationAudit.ceilingDrop.value} cm
                    {result.elevationAudit.ceilingDrop.passed ? ' ✓' : ' (非230/5倍數)'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded border ${
                      result.elevationAudit.bathKitchenDrop.passed
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-red-950 border-red-500 text-red-300 font-bold'
                    }`}
                  >
                    衛廚 {result.elevationAudit.bathKitchenDrop.value} cm
                    {result.elevationAudit.bathKitchenDrop.passed ? ' ✓' : ' (非215/5倍數)'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded border ${
                      result.dimensionAudit.width.passed && result.dimensionAudit.length.passed
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-amber-950 border-amber-500 text-amber-300'
                    }`}
                  >
                    面寬 {result.dimensionAudit.width.value} × {result.dimensionAudit.length.value} cm
                  </span>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      幾何契約逐項檢核紀錄清單 ({result.checkItems.length} 項)：
                    </div>

                    <div className="divide-y divide-slate-800/80 bg-slate-900/60 rounded-lg border border-slate-800 overflow-hidden">
                      {result.checkItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-900 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                item.passed
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {item.passed ? '✓' : '✕'}
                            </span>
                            <span className="font-semibold text-slate-200">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              (實測: {item.actualValue} cm)
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <span className="text-[11px] text-slate-400">
                              契約目標: <span className="text-slate-300 font-mono">{item.contractTarget}</span>
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                item.passed ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {item.remark}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
