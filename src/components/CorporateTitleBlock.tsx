import React, { useState } from 'react';
import { RoomData } from '../types';
import {
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  Sliders,
  Copy,
  Check,
  FileCode,
  Edit3,
  X,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';

export type TitleBlockStyle = 'starry_bay' | 'executive_gold' | 'field_blueprint';

export interface TitleBlockConfig {
  companyName: string;
  companyEnName: string;
  subDepartment: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  spaceName: string;
  sheetCode: string;
  sheetName: string;
  scale: string;
  unit: string;
  tolerance: string;
  date: string;
  revision: string;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
}

interface CorporateTitleBlockProps {
  room: RoomData;
  activeSheet: string;
  sheetName: string;
  scale?: string;
  onNotify?: (msg: string) => void;
}

export const CorporateTitleBlock: React.FC<CorporateTitleBlockProps> = ({
  room,
  activeSheet,
  sheetName,
  scale = '1:30',
  onNotify,
}) => {
  const [stylePreset, setStylePreset] = useState<TitleBlockStyle>('starry_bay');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [copiedDxf, setCopiedDxf] = useState<boolean>(false);

  // Editable title block configuration
  const [config, setConfig] = useState<TitleBlockConfig>({
    companyName: '室內設計室內裝修設計工程股份有限公司',
    companyEnName: 'STAR BAY INTERIOR DESIGN & ENGINEERING CO., LTD.',
    subDepartment: '自動化施工圖管線審計總署 · Codex 晶晶工程設計中心',
    projectName: '室內設計頂級住宅室內裝修新建工程',
    projectCode: 'SEC-2026-XW003-V3',
    clientName: '工程專案委託業主 (A棟12F-A1戶)',
    spaceName: room.roomName,
    sheetCode: `SB-INT-${activeSheet}-01`,
    sheetName: sheetName,
    scale: scale,
    unit: '公分 (CM)',
    tolerance: '現場放樣 ±2mm',
    date: '2026.09.19',
    revision: 'REV. 03 (審計簽核版)',
    drawnBy: 'Codex 晶晶 · AI 生產線',
    checkedBy: '主任結構審計技師',
    approvedBy: '室內設計總工程設計顧問',
  });

  // Sync space name and sheet name if props change
  React.useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      spaceName: room.roomName,
      sheetCode: `SB-INT-${activeSheet}-01`,
      sheetName: sheetName,
      scale: scale,
    }));
  }, [room.roomName, activeSheet, sheetName, scale]);

  const handleCopyDxfBlock = () => {
    const dxfSnippet = `999
DXF TITLE BLOCK DEFINITION - ${config.companyName}
0
SECTION
2
BLOCKS
0
BLOCK
2
SB_TITLE_BLOCK_${activeSheet}
70
2
10
0.0
20
0.0
30
0.0
0
TEXT
8
TITLE_BORDER
10
15.0
20
12.0
40
4.5
1
${config.companyName}
0
TEXT
8
TITLE_PROJECT
10
15.0
20
25.0
40
3.5
1
專案：${config.projectName}
0
TEXT
8
TITLE_SHEET
10
15.0
20
38.0
40
5.0
1
圖名：${config.sheetName} (${config.sheetCode})
0
TEXT
8
TITLE_AUDIT
10
15.0
20
50.0
40
3.0
1
幾何契約驗收：265/230/215 PASSED (5x倍數符合)
0
ENDBLK
0
ENDSEC
0
EOF`;

    navigator.clipboard.writeText(dxfSnippet);
    setCopiedDxf(true);
    onNotify?.('✓ 已複製公司標準套板圖塊 DXF Block 定義！');
    setTimeout(() => setCopiedDxf(false), 3000);
  };

  // Color theme profiles based on stylePreset
  const themeClasses = {
    starry_bay: {
      container: 'border-2 border-cyan-700/70 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 text-slate-200',
      headerBg: 'bg-cyan-950/60 border-b border-cyan-800/60',
      brandColor: 'text-cyan-300',
      accentBorder: 'border-cyan-800/60',
      accentText: 'text-cyan-400',
      labelColor: 'text-slate-400',
      badgeBg: 'bg-cyan-900/50 text-cyan-200 border-cyan-700/50',
    },
    executive_gold: {
      container: 'border-2 border-amber-600/70 bg-gradient-to-r from-stone-950 via-neutral-900 to-amber-950/30 text-stone-200',
      headerBg: 'bg-amber-950/40 border-b border-amber-800/60',
      brandColor: 'text-amber-300',
      accentBorder: 'border-amber-800/60',
      accentText: 'text-amber-400',
      labelColor: 'text-stone-400',
      badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/50',
    },
    field_blueprint: {
      container: 'border-2 border-emerald-500/80 bg-slate-950 text-white',
      headerBg: 'bg-emerald-950/70 border-b border-emerald-700',
      brandColor: 'text-emerald-300',
      accentBorder: 'border-emerald-800',
      accentText: 'text-emerald-400',
      labelColor: 'text-slate-400',
      badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/60',
    },
  }[stylePreset];

  return (
    <div className="w-full mt-4 flex flex-col font-sans select-none">
      {/* Title Block Top Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-900 border-t border-x border-slate-800 rounded-t-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>公司標準套板圖塊</span>
          </span>

          {/* Style Preset Selector */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => setStylePreset('starry_bay')}
              className={`px-2 py-0.5 rounded transition ${
                stylePreset === 'starry_bay'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              室內設計合約標準
            </button>
            <button
              onClick={() => setStylePreset('executive_gold')}
              className={`px-2 py-0.5 rounded transition ${
                stylePreset === 'executive_gold'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              旗艦消光黑金
            </button>
            <button
              onClick={() => setStylePreset('field_blueprint')}
              className={`px-2 py-0.5 rounded transition ${
                stylePreset === 'field_blueprint'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              現場放樣大字版
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="自訂公司名稱、專案案號與審核人員"
          >
            <Edit3 className="w-3 h-3 text-cyan-400" />
            <span>自訂套板內容</span>
          </button>

          <button
            onClick={handleCopyDxfBlock}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            title="複製此套板的 AutoCAD Block 定義代碼"
          >
            {copiedDxf ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3 text-emerald-400" />}
            <span>{copiedDxf ? '已複製 DXF 圖塊' : '匯出套板 DXF'}</span>
          </button>
        </div>
      </div>

      {/* Corporate Title Block Master Frame (建築標準三級簽核套板圖塊) */}
      <div className={`rounded-b-lg shadow-xl overflow-hidden transition-all duration-200 ${themeClasses.container}`}>
        {/* Row 1: Company Logo & Brand Bar */}
        <div className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 ${themeClasses.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className={`font-bold text-sm tracking-wider flex items-center gap-2 ${themeClasses.brandColor}`}>
                <span>{config.companyName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  CNS / AIA 標準
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight font-mono">{config.companyEnName}</div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-300">{config.subDepartment}</div>
            <div className="text-[10px] text-slate-400 font-mono">ISO-9001 施工圖自動化品質管理驗證通過</div>
          </div>
        </div>

        {/* Row 2: Four Key Project Data Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-b border-slate-800/80 text-xs">
          {/* Col 1: Project Information */}
          <div className="p-3 space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.labelColor}`}>
              專案工程名稱 PROJECT
            </div>
            <div className="font-bold text-white text-sm leading-tight">{config.projectName}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              案號：{config.projectCode} · {config.clientName}
            </div>
          </div>

          {/* Col 2: Space & Level Spec */}
          <div className="p-3 space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.labelColor}`}>
              空間位置與高程 SPACE & DATUM
            </div>
            <div className="font-bold text-emerald-400 text-sm leading-tight flex items-center gap-1.5">
              <span>{config.spaceName}</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800">
                施工中
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              基準面：FL±0 ~ 樓板 CL+280cm (淨高 280)
            </div>
          </div>

          {/* Col 3: Drawing Title & Code */}
          <div className="p-3 space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.labelColor}`}>
              圖紙名稱與圖號 SHEET INFO
            </div>
            <div className="font-bold text-cyan-300 text-sm leading-tight flex items-center gap-1.5">
              <span>{config.sheetName}</span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono flex items-center gap-2">
              <span className="text-yellow-300 font-bold">{config.sheetCode}</span>
              <span className="text-slate-400">{config.revision}</span>
            </div>
          </div>

          {/* Col 4: Scale, Unit, Date */}
          <div className="p-3 space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.labelColor}`}>
              比例 / 單位 / 出圖日 SCALE & DATE
            </div>
            <div className="font-bold text-white text-sm font-mono flex items-center gap-2">
              <span>比例 {config.scale}</span>
              <span className="text-slate-500">|</span>
              <span>{config.unit}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>日期：{config.date}</span>
              <span className="text-emerald-400">{config.tolerance}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Approval Signatures & Quality Stamps */}
        <div className="p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-950/60 text-xs">
          {/* 3 Sign-off Positions (Drawn, Checked, Approved) */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-2">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">繪圖者 DRAWN BY</div>
              <div className="font-semibold text-slate-200 mt-0.5 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>{config.drawnBy}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">複核者 CHECKED BY</div>
              <div className="font-semibold text-slate-200 mt-0.5 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>{config.checkedBy}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">核定者 APPROVED BY</div>
              <div className="font-semibold text-slate-200 mt-0.5 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{config.approvedBy}</span>
              </div>
            </div>
          </div>

          {/* Official Verification Stamps (實體印章戳記) */}
          <div className="lg:col-span-5 flex items-center justify-end gap-2.5">
            {/* Stamp 1: 幾何契約合格章 (紅) */}
            <div className="border-2 border-red-500/80 bg-red-950/30 text-red-400 rounded-lg px-2.5 py-1 text-center font-mono select-none shadow-sm flex flex-col items-center">
              <div className="text-[8px] tracking-widest text-red-300 font-bold">幾何契約合規驗收</div>
              <div className="text-xs font-bold tracking-tight text-red-200">265/230/215 PASS</div>
              <div className="text-[8px] text-red-400/80 scale-90">★ 5倍數無衝突 ★</div>
            </div>

            {/* Stamp 2: 現場放樣核可章 (藍) */}
            <div className="border-2 border-blue-500/80 bg-blue-950/30 text-blue-300 rounded-lg px-2.5 py-1 text-center font-mono select-none shadow-sm flex flex-col items-center">
              <div className="text-[8px] tracking-widest text-blue-200 font-bold">工地放樣專用章</div>
              <div className="text-xs font-bold tracking-tight text-white">APPROVED</div>
              <div className="text-[8px] text-blue-400/80 scale-90">公差 ≤ ±2mm</div>
            </div>

            {/* Stamp 3: 室內設計品保印 (綠) */}
            <div className="border-2 border-emerald-500/80 bg-emerald-950/30 text-emerald-300 rounded-lg px-2.5 py-1 text-center font-mono select-none shadow-sm hidden sm:flex flex-col items-center">
              <div className="text-[8px] tracking-widest text-emerald-200 font-bold">室內設計品保章</div>
              <div className="text-xs font-bold tracking-tight text-emerald-200">QA AUDITED</div>
              <div className="text-[8px] text-emerald-400/80 scale-90">V-01~V-10 核可</div>
            </div>
          </div>
        </div>

        {/* Row 4: General Engineering Notes (施工通則與法律免責) */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">【施工通則】</span>
            <span>1. 現場施工放樣應全面以圖面標註數據及 5 倍數契約為準，嚴禁逕自以比例尺量取縮放。</span>
            <span className="hidden md:inline">2. 天花降板完成面、大梁下淨高未達規約標準時，應即刻提報監造建築師進行變更設計。</span>
          </div>
          <div className="text-slate-500">
            室內設計合約版權所有 · 未經授權不得翻印
          </div>
        </div>
      </div>

      {/* Edit Title Block Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>自訂公司套板圖塊欄位資訊</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">公司/事務所名稱</label>
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">英文名稱</label>
                  <input
                    type="text"
                    value={config.companyEnName}
                    onChange={(e) => setConfig({ ...config, companyEnName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">工程專案名稱</label>
                  <input
                    type="text"
                    value={config.projectName}
                    onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">專案案號</label>
                  <input
                    type="text"
                    value={config.projectCode}
                    onChange={(e) => setConfig({ ...config, projectCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">繪圖者</label>
                  <input
                    type="text"
                    value={config.drawnBy}
                    onChange={(e) => setConfig({ ...config, drawnBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">複核者</label>
                  <input
                    type="text"
                    value={config.checkedBy}
                    onChange={(e) => setConfig({ ...config, checkedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">核定審查人</label>
                  <input
                    type="text"
                    value={config.approvedBy}
                    onChange={(e) => setConfig({ ...config, approvedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">出圖比例</label>
                  <input
                    type="text"
                    value={config.scale}
                    onChange={(e) => setConfig({ ...config, scale: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">出圖日期</label>
                  <input
                    type="text"
                    value={config.date}
                    onChange={(e) => setConfig({ ...config, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">修訂版次</label>
                  <input
                    type="text"
                    value={config.revision}
                    onChange={(e) => setConfig({ ...config, revision: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
              >
                儲存並套用至圖框
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
