import React, { useState, useRef } from 'react';
import {
  Printer,
  X,
  Upload,
  Image as ImageIcon,
  Building2,
  CheckCircle2,
  Sliders,
  Download,
  Check,
  Eye,
  Sparkles,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { CompanyTitleBlockSettings, RoomData } from '../types';

interface CompanyTitleBlockDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onSaveSettings?: (settings: CompanyTitleBlockSettings) => void;
  onNotify?: (msg: string) => void;
}

export const DEFAULT_COMPANY_TITLE_BLOCK: CompanyTitleBlockSettings = {
  companyName: '原砌室內建築空間設計工程有限公司',
  companyEnName: 'ORIGIN ARCHITECTURAL INTERIOR DESIGN CO., LTD.',
  registrationNumber: '內營室技字第 40E1023847 號',
  taxId: '82947103',
  address: '台北市信義區松仁路 100 號 18 樓',
  phone: '(02) 8780-9988',
  websiteOrEmail: 'service@origin-design.com.tw',
  logoUrl: '', // base64 or SVG
  logoWidthMm: 38,
  logoHeightMm: 16,
  layoutPosition: 'right_column',
  paperSize: 'A3',
  orientation: 'LANDSCAPE',
  projectName: '星玥灣 8F 住宅室內裝修新建工程',
  projectCode: 'SEC-2026-XW003',
  clientName: '星玥灣 8F 尊爵業主委託',
  drawnBy: '主責空間設計師',
  checkedBy: '專案總監 / 審計工程師',
  approvedBy: '主持建築設計主持人',
  sealStampText: '專業設計與施工技術人員簽證章',
  disclaimerText: '本圖著作權屬本公司所有，非經書面授權不得翻印或挪作他用。工地現場放樣應以實體尺寸為準。',
  revisionHistory: [
    { rev: 'REV 01', date: '2026.09.18', desc: '初版放樣配置圖核發', by: 'ARCH' },
    { rev: 'REV 02', date: '2026.09.21', desc: '5倍數幾何契約與固定80cm檯面校正', by: 'AUDIT' },
    { rev: 'REV 03', date: '2026.09.23', desc: '全套立面與公司圖框簽章正式出圖', by: 'DIR' },
  ],
};

export const CompanyTitleBlockDesignerModal: React.FC<CompanyTitleBlockDesignerModalProps> = ({
  isOpen,
  onClose,
  room,
  onSaveSettings,
  onNotify,
}) => {
  const [settings, setSettings] = useState<CompanyTitleBlockSettings>(() => {
    const saved = localStorage.getItem('user_company_titleblock_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COMPANY_TITLE_BLOCK;
      }
    }
    return DEFAULT_COMPANY_TITLE_BLOCK;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'logo' | 'layout' | 'preview'>('preview');

  if (!isOpen) return null;

  // Handle Logo Upload (PNG / SVG / JPG)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSettings((prev) => ({
        ...prev,
        logoUrl: dataUrl,
      }));
      onNotify?.(`✨ 公司 Logo「${file.name}」已成功上傳並嵌入圖框！`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logoUrl: '' }));
    onNotify?.('已重設為預設文字圖章樣式');
  };

  // Save Settings to Local Storage and System
  const handleSaveAndApply = () => {
    localStorage.setItem('user_company_titleblock_config', JSON.stringify(settings));
    onSaveSettings?.(settings);
    onNotify?.(`🏢 公司圖框與 Logo「${settings.companyName}」已套用至全套出圖引擎！`);
    onClose();
  };

  // Export DXF Title Block template
  const handleExportDxfTitleBlock = () => {
    const dxfContent = `0\nSECTION\n2\nENTITIES\n0\nTEXT\n8\n06_施工註記\n10\n380\n20\n20\n40\n5\n1\n${settings.companyName}\n0\nTEXT\n8\n06_施工註記\n10\n380\n20\n14\n40\n3\n1\n${settings.companyEnName}\n0\nTEXT\n8\n06_施工註記\n10\n380\n20\n8\n40\n3\n1\n圖號: SB-INT-01 / 比例 1:30\n0\nENDSEC\n0\nEOF`;
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.companyName}_A3_TitleBlock.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`📐 已匯出公司專屬 A3 施工圖框 DXF 檔！`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Hidden Logo Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-500/30 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  公司專屬出圖圖框與 Logo 版面設計器
                </h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/50 px-2 py-0.5 rounded-full font-semibold">
                  A3 / A2 施工圖出圖標準
                </span>
              </div>
              <p className="text-xs text-slate-300">
                可自由上傳公司品牌 Logo · 自由定義公司資訊、證號、簽證章與審核欄位 · 100% 寫入全套施工圖 DXF/PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-purple-400 text-purple-300 bg-purple-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>圖框即時視覺化預覽</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>公司資訊與審核簽證欄</span>
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>上傳公司 Logo 與圖章</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'layout'
                ? 'border-amber-400 text-amber-300 bg-amber-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>圖框版型與紙張比例</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* TAB 1: 圖框即時預覽 (Interactive SVG Title Block Canvas) */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4 text-purple-400" />
                  <span>
                    標準 {settings.paperSize} 施工圖框視覺化 (排版：
                    {settings.layoutPosition === 'right_column' ? '右側欄位式' : '底部橫條式'})
                  </span>
                </span>
                <span className="text-[11px] font-mono text-purple-300 bg-purple-950 border border-purple-500/40 px-2 py-0.5 rounded">
                  符合台灣建築與室內裝修製圖標準規範
                </span>
              </div>

              {/* A3 Title Block SVG Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 420 297"
                  className="w-full h-auto max-h-[460px] bg-slate-900 border border-slate-700 shadow-2xl select-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Drawing Outer Frame (A3 420 x 297 mm, border inset 10mm) */}
                  <rect x="10" y="10" width="400" height="277" fill="#0b0f19" stroke="#94a3b8" strokeWidth="0.8" />
                  <rect x="12" y="12" width="396" height="273" fill="none" stroke="#475569" strokeWidth="0.3" />

                  {/* Drawing Area Content Placeholder */}
                  <g opacity="0.6">
                    <rect x="25" y="25" width="320" height="247" fill="none" stroke="#1e293b" strokeDasharray="3,3" />
                    <text x="180" y="145" fill="#475569" fontSize="12" textAnchor="middle" fontFamily="sans-serif">
                      【施工圖面主要繪製與放樣區 (1:30)】
                    </text>
                  </g>

                  {/* Title Block Placement: Right Column (50mm width) */}
                  {settings.layoutPosition === 'right_column' ? (
                    <g transform="translate(355, 12)">
                      {/* Title block background & border */}
                      <rect x="0" y="0" width="53" height="273" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />

                      {/* Header 1: Logo & Company Name */}
                      <rect x="0" y="0" width="53" height="42" fill="#1e293b" stroke="#64748b" strokeWidth="0.4" />
                      {settings.logoUrl ? (
                        <image
                          href={settings.logoUrl}
                          x="5"
                          y="4"
                          width="43"
                          height="22"
                          preserveAspectRatio="xMidYMid meet"
                        />
                      ) : (
                        <g>
                          <rect
                            x="8"
                            y="5"
                            width="37"
                            height="18"
                            fill="#334155"
                            rx="2"
                            stroke="#64748b"
                            strokeWidth="0.3"
                          />
                          <text
                            x="26.5"
                            y="17"
                            fill="#38bdf8"
                            fontSize="5.5"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                          >
                            LOGO
                          </text>
                        </g>
                      )}
                      <text
                        x="26.5"
                        y="30"
                        fill="#f8fafc"
                        fontSize="3.8"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {settings.companyName.length > 14
                          ? settings.companyName.slice(0, 14) + '...'
                          : settings.companyName}
                      </text>
                      <text
                        x="26.5"
                        y="35"
                        fill="#94a3b8"
                        fontSize="2.4"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {settings.companyEnName.length > 24
                          ? settings.companyEnName.slice(0, 24) + '...'
                          : settings.companyEnName}
                      </text>
                      <text
                        x="26.5"
                        y="39"
                        fill="#64748b"
                        fontSize="2.2"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {settings.registrationNumber}
                      </text>

                      {/* Section 2: Project Information */}
                      <g transform="translate(0, 42)">
                        <rect x="0" y="0" width="53" height="36" fill="none" stroke="#64748b" strokeWidth="0.4" />
                        <text x="4" y="7" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          工程案名 PROJECT
                        </text>
                        <text x="4" y="14" fill="#38bdf8" fontSize="3.8" fontWeight="bold" fontFamily="sans-serif">
                          {settings.projectName.length > 12
                            ? settings.projectName.slice(0, 12) + '...'
                            : settings.projectName}
                        </text>
                        <text x="4" y="21" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          案號 CODE: {settings.projectCode}
                        </text>
                        <text x="4" y="28" fill="#94a3b8" fontSize="2.8" fontFamily="sans-serif">
                          業主 CLIENT: {settings.clientName}
                        </text>
                      </g>

                      {/* Section 3: Sheet Information */}
                      <g transform="translate(0, 78)">
                        <rect x="0" y="0" width="53" height="42" fill="none" stroke="#64748b" strokeWidth="0.4" />
                        <text x="4" y="7" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          圖面名稱 SHEET TITLE
                        </text>
                        <text x="4" y="15" fill="#f8fafc" fontSize="4.2" fontWeight="bold" fontFamily="sans-serif">
                          {room.roomName} 放樣施工圖
                        </text>
                        <line x1="0" y1="21" x2="53" y2="21" stroke="#475569" strokeWidth="0.3" />
                        <text x="4" y="28" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          圖號: SB-INT-01
                        </text>
                        <text x="28" y="28" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          比例: 1:30
                        </text>
                        <text x="4" y="36" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          單位: 公分 (CM)
                        </text>
                        <text x="28" y="36" fill="#64748b" fontSize="2.8" fontFamily="sans-serif">
                          日期: 2026.09
                        </text>
                      </g>

                      {/* Section 4: Signatures */}
                      <g transform="translate(0, 120)">
                        <rect x="0" y="0" width="53" height="46" fill="none" stroke="#64748b" strokeWidth="0.4" />
                        <line x1="17.6" y1="0" x2="17.6" y2="46" stroke="#475569" strokeWidth="0.3" />
                        <line x1="35.3" y1="0" x2="35.3" y2="46" stroke="#475569" strokeWidth="0.3" />
                        <line x1="0" y1="12" x2="53" y2="12" stroke="#475569" strokeWidth="0.3" />

                        <text x="8.8" y="8" fill="#94a3b8" fontSize="2.6" textAnchor="middle">
                          設計 DRAWN
                        </text>
                        <text x="26.5" y="8" fill="#94a3b8" fontSize="2.6" textAnchor="middle">
                          審核 CHECK
                        </text>
                        <text x="44.2" y="8" fill="#94a3b8" fontSize="2.6" textAnchor="middle">
                          核准 APPR
                        </text>

                        <text x="8.8" y="28" fill="#f8fafc" fontSize="3" fontWeight="bold" textAnchor="middle">
                          {settings.drawnBy.slice(0, 4)}
                        </text>
                        <text x="26.5" y="28" fill="#f8fafc" fontSize="3" fontWeight="bold" textAnchor="middle">
                          {settings.checkedBy.slice(0, 4)}
                        </text>
                        <text x="44.2" y="28" fill="#f8fafc" fontSize="3" fontWeight="bold" textAnchor="middle">
                          {settings.approvedBy.slice(0, 4)}
                        </text>
                      </g>

                      {/* Section 5: Revisions */}
                      <g transform="translate(0, 166)">
                        <rect x="0" y="0" width="53" height="60" fill="none" stroke="#64748b" strokeWidth="0.4" />
                        <text x="4" y="7" fill="#64748b" fontSize="2.6" fontFamily="sans-serif">
                          版次修改紀錄 REVISIONS
                        </text>
                        {settings.revisionHistory.slice(0, 3).map((r, i) => (
                          <g key={i} transform={`translate(4, ${16 + i * 14})`}>
                            <text fill="#38bdf8" fontSize="2.8" fontWeight="bold">
                              {r.rev}
                            </text>
                            <text x="18" fill="#94a3b8" fontSize="2.4">
                              {r.date}
                            </text>
                            <text y="7" fill="#64748b" fontSize="2.2">
                              {r.desc.slice(0, 15)}
                            </text>
                          </g>
                        ))}
                      </g>

                      {/* Section 6: Seal & Disclaimer Stamp */}
                      <g transform="translate(0, 226)">
                        <rect x="0" y="0" width="53" height="47" fill="#1e1e2d" stroke="#64748b" strokeWidth="0.4" />
                        <text x="26.5" y="8" fill="#e2e8f0" fontSize="3" fontWeight="bold" textAnchor="middle">
                          {settings.sealStampText}
                        </text>
                        <rect
                          x="10"
                          y="12"
                          width="33"
                          height="20"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="0.4"
                          strokeDasharray="2,2"
                        />
                        <text x="26.5" y="23" fill="#f87171" fontSize="2.8" textAnchor="middle">
                          【技師簽證印鑑】
                        </text>
                        <text x="26.5" y="38" fill="#64748b" fontSize="2" textAnchor="middle">
                          {settings.disclaimerText.slice(0, 20)}...
                        </text>
                      </g>
                    </g>
                  ) : (
                    /* Title Block Placement: Bottom Bar (30mm height) */
                    <g transform="translate(12, 255)">
                      <rect x="0" y="0" width="396" height="30" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
                      <g transform="translate(5, 5)">
                        <text fill="#f8fafc" fontSize="4.5" fontWeight="bold">
                          {settings.companyName}
                        </text>
                        <text y="8" fill="#94a3b8" fontSize="3">
                          {settings.companyEnName} · {settings.registrationNumber}
                        </text>
                      </g>
                      <line x1="140" y1="0" x2="140" y2="30" stroke="#475569" strokeWidth="0.3" />
                      <g transform="translate(145, 8)">
                        <text fill="#64748b" fontSize="3">
                          案名: {settings.projectName}
                        </text>
                        <text y="10" fill="#38bdf8" fontSize="3.5" fontWeight="bold">
                          圖名: {room.roomName} 放樣施工圖 (1:30)
                        </text>
                      </g>
                      <line x1="280" y1="0" x2="280" y2="30" stroke="#475569" strokeWidth="0.3" />
                      <g transform="translate(285, 10)">
                        <text fill="#94a3b8" fontSize="3">
                          繪圖: {settings.drawnBy} | 審核: {settings.checkedBy}
                        </text>
                        <text y="8" fill="#94a3b8" fontSize="3">
                          圖號: SB-INT-01 | REV 03
                        </text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* TAB 2: 公司基本資訊與審核簽證欄 */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">公司法定全名 (中文)</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">公司英文名稱 (English Name)</label>
                  <input
                    type="text"
                    value={settings.companyEnName}
                    onChange={(e) => setSettings({ ...settings, companyEnName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">室內裝修業登記證號 / 建築師執照</label>
                  <input
                    type="text"
                    value={settings.registrationNumber}
                    onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">統一編號 / 公司統編</label>
                  <input
                    type="text"
                    value={settings.taxId}
                    onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">公司地址</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs">聯絡電話 / 網址 / Email</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Signatures & Approvals */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">圖面審核與專業簽章欄位</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">繪圖者 (Drawn by)</label>
                    <input
                      type="text"
                      value={settings.drawnBy}
                      onChange={(e) => setSettings({ ...settings, drawnBy: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">審核者 (Checked by)</label>
                    <input
                      type="text"
                      value={settings.checkedBy}
                      onChange={(e) => setSettings({ ...settings, checkedBy: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">核准者 (Approved by)</label>
                    <input
                      type="text"
                      value={settings.approvedBy}
                      onChange={(e) => setSettings({ ...settings, approvedBy: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs">圖框底部施工通則與版權免責聲明</label>
                <textarea
                  rows={2}
                  value={settings.disclaimerText}
                  onChange={(e) => setSettings({ ...settings, disclaimerText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 上傳公司 Logo */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>公司專屬 Logo 圖檔上傳與尺寸微調</span>
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Logo Preview Box */}
                  <div className="w-48 h-32 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center p-3 relative group">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Company Logo Preview"
                        className="max-w-full max-h-full object-contain filter drop-shadow"
                      />
                    ) : (
                      <div className="text-center text-slate-500 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                        <span className="text-[11px] block">尚未上傳 Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      支援格式：<strong>PNG (建議去背透明底)、SVG 向量檔、JPG</strong>。
                      <br />
                      上傳後的 Logo 將自動嵌入至標準 A3 施工圖框的右上角或標題欄首格，並在匯出 DXF 時轉換為圖塊或附屬點陣圖參照！
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-700/30"
                      >
                        <Upload className="w-4 h-4" />
                        <span>選擇本機 Logo 檔案</span>
                      </button>

                      {settings.logoUrl && (
                        <button
                          onClick={handleRemoveLogo}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-semibold transition"
                        >
                          移除 Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logo Dimensions in Title Block */}
                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-xs">Logo 在圖框中顯示寬度 (mm)</label>
                    <input
                      type="number"
                      min={10}
                      max={60}
                      value={settings.logoWidthMm}
                      onChange={(e) => setSettings({ ...settings, logoWidthMm: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-xs">Logo 在圖框中顯示高度 (mm)</label>
                    <input
                      type="number"
                      min={5}
                      max={40}
                      value={settings.logoHeightMm}
                      onChange={(e) => setSettings({ ...settings, logoHeightMm: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 圖框版型配置 */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold">標題欄位置 (Title Block Layout)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, layoutPosition: 'right_column' })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.layoutPosition === 'right_column'
                          ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">右側欄位式 (推薦)</div>
                      <div className="text-[10px] text-slate-400 mt-1">寬度 50mm · 國際室內設計標準規範</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, layoutPosition: 'bottom_bar' })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.layoutPosition === 'bottom_bar'
                          ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">底部橫條式</div>
                      <div className="text-[10px] text-slate-400 mt-1">高度 30mm · 適合全寬大跨距展開圖</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold">標準出圖紙張規格</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['A3', 'A2', 'A1'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSettings({ ...settings, paperSize: sz })}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                          settings.paperSize === sz
                            ? 'bg-purple-900 text-purple-200 border-purple-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {sz} ({sz === 'A3' ? '420×297' : sz === 'A2' ? '594×420' : '841×594'})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExportDxfTitleBlock}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="下載純圖框 DXF 樣板檔"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>匯出公司圖框 DXF 檔</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              取消
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              <span>儲存並套用至全套施工圖</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
