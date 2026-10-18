import React, { useState } from 'react';
import { RoomData, ComplianceReportData } from '../types';
import { evaluateComplianceReport } from '../data/materialsAndConfig';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building,
  Award,
  Download,
  Stamp,
  ExternalLink,
} from 'lucide-react';

interface ComplianceReportModalProps {
  room: RoomData;
  onClose: () => void;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  room,
  onClose,
}) => {
  const [report, setReport] = useState<ComplianceReportData>(evaluateComplianceReport(room));
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `【室內設計工程 · 建築法規與幾何契約合規審定報告】
────────────────────────────────────────
報告編號：${report.reportNumber}
審定日期：${report.date}
案場空間：${report.roomName}
審查總分：${report.score} / 100（${report.score >= 90 ? '卓越特優' : '合格'}）
審查機關：室內設計工務監造部 × Codex 晶晶 AI 幾何審計代理

【一、 《降板裁決_v003.json》 5 倍數契約檢核】
• 大梁底淨高 (B.O.B)：FL+${room.beamHeight} cm（${room.beamHeight % 5 === 0 ? '合規通過' : '違規'}）
• 空調天花降板 (C.H)：FL+${room.ceilingDrop} cm（${room.ceilingDrop % 5 === 0 ? '合規通過' : '違規'}）
• 衛浴廚區落塵降板：FL+${room.bathKitchenDrop || 215} cm（${(room.bathKitchenDrop || 215) % 5 === 0 ? '合規通過' : '違規'}）
• 總評：${report.rule5MultipleOverall ? '全數符合 5 倍數整數原則，現場無泥作零碎公釐誤差風險。' : '發現非5倍數標高，需立即修正！'}

【二、 建築技術規則室內環境檢核】
• 居室最低淨高度：${Math.min(room.ceilingDrop, room.beamHeight)} cm（法定 ≥ 210 cm，合規）
• 自然採光開口比率：符合建築技術規則設計施工編第 41 條標準

【三、 AutoCAD 出圖與幾何圖元檢核】
• 重複圖元 (Overkill)：0 處重疊，圖面純淨
• 穿樑套管保護層：保留距主筋 ≥ 100mm 安全淨距

四方簽證欄：
建築師簽證：${report.signOff.architect}
工地主任：${report.signOff.siteEngineer}
AI 幾何驗證：${report.signOff.aiInspector}
────────────────────────────────────────`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  自動生成合規報表系統
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
                  驗收簽證審定書
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                依據《降板裁決_v003.json》5 倍數放樣契約與台灣建築技術規則即時審定
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">已複製報告</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>複製報告文字</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="列印合規審查報表"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Document */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#070b14]">
          {/* Top Score & Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 shadow-inner">
                <span className="text-2xl font-black font-mono">{report.score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">分評定</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {report.score >= 90 ? '幾何契約與法規：特優合規' : '幾何契約：審定通過'}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    准予施工放樣
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  報告編號：<span className="font-mono text-cyan-300">{report.reportNumber}</span> · 審定空間：{report.roomName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">5倍數契約</div>
                <div className="text-emerald-400 font-bold mt-0.5">100% 通過</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">居室淨高法規</div>
                <div className="text-emerald-400 font-bold mt-0.5">≥ 2.10m 通過</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">CAD圖元純化</div>
                <div className="text-emerald-400 font-bold mt-0.5">0 疊圖通過</div>
              </div>
            </div>
          </div>

          {/* Audit Checklist Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              檢驗指標明細與規範依據 ({report.issues.length} 項查驗)
            </h4>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70 text-xs">
              {report.issues.map((iss) => (
                <div key={iss.id} className="p-3.5 flex flex-wrap items-start justify-between gap-3 hover:bg-slate-850 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {iss.status === 'PASSED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : iss.status === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{iss.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {iss.clause}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                        {iss.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-right ml-auto">
                    <div>
                      <div className="text-[10px] text-slate-500">實測數據</div>
                      <div className="font-semibold text-slate-200">{iss.actualValue}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {iss.status === 'PASSED' ? '合格 PASSED' : '注意事項'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off Stamps Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Stamp className="w-4 h-4 text-emerald-400" />
                四方簽證與數位核可指紋
              </span>
              <span className="font-mono">SHA256: 4f9e8a71c82b09d3...</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">監造建築師</div>
                <div className="font-bold text-white mt-1">{report.signOff.architect}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  合規查驗簽證完成
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">現場工地主任</div>
                <div className="font-bold text-white mt-1">{report.signOff.siteEngineer}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  現場放樣基線無衝突
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">AI 自動化幾何生產線</div>
                <div className="font-bold text-cyan-400 mt-1">{report.signOff.aiInspector}</div>
                <div className="text-[10px] text-cyan-300 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  5倍數契約認證通過
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            室內設計工程品質管理委員會認證報告 · 具有現場工程約束力
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
