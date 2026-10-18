import React, { useState } from 'react';
import {
  Activity,
  X,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Send,
  Download,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Zap,
  BarChart3,
  PieChart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuditDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onOpenAuditDashboard?: () => void;
  onOpenGoogleApiIde?: () => void;
}

export const AuditDistributionModal: React.FC<AuditDistributionModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  onOpenAuditDashboard,
  onOpenGoogleApiIde,
}) => {
  const [activeTab, setActiveTab] = useState<'backlog' | 'triage' | 'geometry' | 'vrules'>('backlog');
  const [isCleanedC, setIsCleanedC] = useState<boolean>(false);
  const [isDispatchedA, setIsDispatchedA] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Backlog Age Distribution
  const backlogData = [
    { range: '0~5 天', count: 2, pct: 10, color: 'bg-emerald-500', alert: false },
    { range: '6~10 天', count: 4, pct: 21, color: 'bg-blue-500', alert: false },
    { range: '11~15 天', count: 5, pct: 26, color: 'bg-amber-500', alert: false },
    { range: '16~20 天 (嚴重滯留)', count: 8, pct: 43, color: 'bg-red-500', alert: true },
  ];

  // 2. Triage Stacks
  const triageStacks = [
    {
      name: 'A 堆 · 立即派發晶晶繪圖',
      count: isDispatchedA ? 0 : 8,
      status: isDispatchedA ? '已全數派發' : '待派工',
      color: 'border-emerald-500 bg-emerald-950/30 text-emerald-300',
      badge: '優先級最高',
      desc: '幾何資料齊全、符合 265/230 高程契約，可直接生成 AutoCAD 腳本 (.scr)。',
    },
    {
      name: 'B 堆 · 排程維護 / Notion 備份',
      count: 11,
      status: '維護排程中',
      color: 'border-amber-500 bg-amber-950/30 text-amber-300',
      badge: '需補件',
      desc: '缺少梁底高程照片、客變圖面待比對，先轉入 Notion 待補齊後二次審查。',
    },
    {
      name: 'C 堆 · 無效 / 過期 / 重複清理',
      count: isCleanedC ? 0 : 4,
      status: isCleanedC ? '已全數清除' : '佔用工單池',
      color: 'border-red-500 bg-red-950/30 text-red-300',
      badge: '無效廢單',
      desc: '早期測試用假圖面、重疊圖元單、超時未更新之重複草稿，建議立即清理。',
    },
  ];

  // 3. 5-Multiple Geometry Contract Compliance
  const geometryCompliance = [
    { title: '大梁淨高 (Beam +265 cm)', rate: 92, target: '265 cm (5倍數)', pass: true },
    { title: '天花降板 (Drop +230 cm)', rate: 89, target: '230 cm (5倍數)', pass: true },
    { title: '核心立面檯面 (Datum +80 cm)', rate: 95, target: '80 cm 基準線', pass: true },
    { title: '吊隱風管穿梁間隙 (≥35 cm)', rate: 84, target: '35 cm 充足穿管', pass: true },
    { title: '門斗與天花收邊距 (≥15 cm)', rate: 90, target: '15 cm 窗簾盒間距', pass: true },
  ];

  // 4. V-01~10 Acceptance Rules
  const vRules = [
    { id: 'V-01', name: '空間封閉多段線閉合', rate: 96, risk: '低' },
    { id: 'V-02', name: '所有高程全面符合 5 倍數', rate: 90, risk: '中' },
    { id: 'V-03', name: '尺寸引線文字自動避讓無重疊', rate: 81, risk: '高 (視埠邊界遮擋)' },
    { id: 'V-04', name: '無重複圖元與重複圖塊疊圖', rate: 78, risk: '高 (客廳有重疊線)' },
    { id: 'V-05', name: '出圖視埠範圍內圖元未凍結', rate: 100, risk: '低' },
    { id: 'V-06', name: '圖框邊界與 A3 標籤圖層吻合', rate: 94, risk: '低' },
    { id: 'V-07', name: '弱電水電開關標高一致性', rate: 91, risk: '中' },
  ];

  const handleCleanCStack = () => {
    setIsCleanedC(true);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
    onNotify('🧹 已一鍵清理 C 堆 4 份無效過期廢單！工單池純度提升 17.4%！');
  };

  const handleDispatchAStack = () => {
    setIsDispatchedA(true);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
    onNotify('🚀 已一鍵將 A 堆 8 份合規工單派發至 Codex 晶晶繪圖！');
  };

  const handleExportAuditReport = () => {
    onNotify('📊 審計分佈圖全盤健檢報告 (.json/.pdf) 已生成並匯出！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e121a] border border-slate-700/90 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#131824]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  審計分佈圖 (Audit Distribution Map)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40">
                  全盤深度健檢 · 解塞診斷
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                19 張單滯留時長分佈、工單池 A/B/C 純化分診、5 倍數幾何契約合規率與 V 規風險可視化
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Cards Banner */}
        <div className="px-5 py-3 bg-[#111622] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#171d2b] border border-red-500/30">
            <div className="text-slate-400 text-[10px]">工單積壓滯留時長</div>
            <div className="text-base font-mono font-bold text-red-400 mt-0.5">
              19 單 · 19.8 天
            </div>
            <div className="text-[10px] text-red-300/80">心跳紅燈 69.4 hr</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171d2b] border border-emerald-500/30">
            <div className="text-slate-400 text-[10px]">A 堆 (可立即派發晶晶)</div>
            <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
              {isDispatchedA ? '0 (已派)' : '8 單 (35%)'}
            </div>
            <div className="text-[10px] text-emerald-300/80">5倍數契約通過</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171d2b] border border-amber-500/30">
            <div className="text-slate-400 text-[10px]">B 堆 (排程維護/Notion)</div>
            <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
              11 單 (48%)
            </div>
            <div className="text-[10px] text-amber-300/80">待補梁底照片</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171d2b] border border-red-500/30">
            <div className="text-slate-400 text-[10px]">C 堆 (無效/過期廢單)</div>
            <div className="text-base font-mono font-bold text-red-400 mt-0.5">
              {isCleanedC ? '0 (已清)' : '4 單 (17%)'}
            </div>
            <div className="text-[10px] text-slate-400">一鍵清檔釋放空間</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-slate-800/80 bg-[#0f131d] text-xs">
          <button
            onClick={() => setActiveTab('backlog')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'backlog'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>滯留時長分佈圖</span>
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'triage'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>A/B/C 工單分診堆疊</span>
          </button>
          <button
            onClick={() => setActiveTab('geometry')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'geometry'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5倍數契約合規分佈</span>
          </button>
          <button
            onClick={() => setActiveTab('vrules')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'vrules'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>V-01~10 驗收風險點</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-grow">
          {/* TAB 1: 滯留時長分佈圖 */}
          {activeTab === 'backlog' && (
            <div className="space-y-4">
              <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">工單滯留時長直方圖 (Backlog Age Histogram)</div>
                  <span className="font-mono text-xs text-red-400">平均滯留：19.8 天</span>
                </div>
                <p className="text-slate-400 text-xs">
                  分析為何會出現 19 張單滯留 19.8 天、開工心跳紅燈 69 小時：根因在於「寫檔落盤」後缺乏本機自動 Watcher 派工機制，高度仰賴人工手動搬運。
                </p>

                {/* Visual Bar Chart */}
                <div className="space-y-3 pt-2">
                  {backlogData.map((item) => (
                    <div key={item.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${item.alert ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {item.range}
                        </span>
                        <span className="font-mono text-slate-300">
                          {item.count} 張單 ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.pct * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heartbeat Status */}
              <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-red-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                    <span>開工心跳紅燈警戒：69.4 小時未開工</span>
                  </div>
                  <div className="text-slate-300 text-xs mt-1">
                    斷鏈原因：落盤至 `pending_audit/` 後未自動觸發 Codex 晶晶繪圖腳本，造成工單塞在佇列中。
                  </div>
                </div>
                {onOpenGoogleApiIde && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGoogleApiIde();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs shadow transition active:scale-95 whitespace-nowrap"
                  >
                    開啟 Google API 派發台
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: A/B/C 工單分診堆疊 */}
          {activeTab === 'triage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">工單池純化分診裁決 (Triage Report)</span>
                <div className="flex items-center gap-2">
                  {!isCleanedC && (
                    <button
                      onClick={handleCleanCStack}
                      className="px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/50 font-bold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>一鍵清理 C 堆廢單</span>
                    </button>
                  )}
                  {!isDispatchedA && (
                    <button
                      onClick={handleDispatchAStack}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>一鍵派發 A 堆到晶晶</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {triageStacks.map((stk) => (
                  <div
                    key={stk.name}
                    className={`p-4 rounded-2xl border ${stk.color} flex flex-col justify-between space-y-3 shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                          {stk.badge}
                        </span>
                        <span className="font-mono font-bold text-lg">{stk.count} 單</span>
                      </div>
                      <div className="font-bold text-white text-sm mt-2">{stk.name}</div>
                      <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">{stk.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">狀態：{stk.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 5倍數契約合規分佈 */}
          {activeTab === 'geometry' && (
            <div className="space-y-4">
              <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">《降板裁決_v003》高程 5 倍數契約合規率</div>
                  <span className="font-mono text-emerald-400 text-xs">平均合規率：90.0%</span>
                </div>
                <p className="text-slate-400 text-xs">
                  檢驗圖紙之大梁底 (265)、天花降板 (230)、檯面 (80)、門斗 (215) 是否全面符合「5 倍數」原則。
                </p>

                <div className="space-y-3 pt-2">
                  {geometryCompliance.map((g) => (
                    <div key={g.title} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{g.title}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">{g.target}</span>
                          <span className="text-emerald-400 font-bold">{g.rate}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: `${g.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: V-01~10 驗收風險點 */}
          {activeTab === 'vrules' && (
            <div className="space-y-4">
              <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">V-01～V-10 幾何驗收條件通過率與潛在風險點</div>
                  <span className="text-xs text-amber-400 font-mono">標註 2 處潛在違規風險</span>
                </div>
                <p className="text-slate-400 text-xs">
                  標註驗收條件中潛在的違規風險點（如：視埠遮擋、重複圖元疊圖、非5倍數尺寸標註）。
                </p>

                <div className="space-y-2 pt-1">
                  {vRules.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-[#192030] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-cyan-400 font-bold text-xs">{v.id}</span>
                        <span className="font-medium text-slate-200 text-xs">{v.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            v.risk.includes('高')
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : v.risk.includes('中')
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          風險：{v.risk}
                        </span>
                        <span className="font-mono text-cyan-300 font-bold text-xs">{v.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#121622] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditReport}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>匯出審計分佈圖報告</span>
            </button>
            {onOpenAuditDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuditDashboard();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs flex items-center gap-1.5 transition"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>切換至完整審計儀表板</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
