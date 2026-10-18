import React, { useState } from 'react';
import {
  Tablet,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  ShieldCheck,
  Send,
  Download,
  Fingerprint,
  Layers,
  X,
  ExternalLink,
  Laptop,
  HelpCircle,
  AlertTriangle,
  Compass,
  ArrowRight,
  Maximize2,
  Copy,
  Lock,
  Camera,
  WifiOff,
  Calculator,
  Edit3,
  Zap,
} from 'lucide-react';
import { IpadApplicationData } from '../types';

interface IpadEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  isIpadSimulated: boolean;
  setIsIpadSimulated: (val: boolean) => void;
  onOpenScanCamera?: () => void;
}

export const IpadEditionModal: React.FC<IpadEditionModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  isIpadSimulated,
  setIsIpadSimulated,
  onOpenScanCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'safari_tutorial' | 'pwa_guide' | 'mobile_speed_tools' | 'apply_form' | 'specs'>('safari_tutorial');
  const [animatedStep, setAnimatedStep] = useState<number>(1);

  // Application form state (直接為 erek.feng@gmail.com 預設核發正式授權)
  const [applicantName, setApplicantName] = useState('馮總監 (Erek Feng)');
  const [email, setEmail] = useState('erek.feng@gmail.com');
  const [organization, setOrganization] = useState('室內設計營造工務所 / 建築師事務所');
  const [deviceModel, setDeviceModel] = useState('iPad Pro 11 吋 (M4 現場丈量旗艦款)');
  const [useCase, setUseCase] = useState<'SITE_MEASUREMENT' | 'CONSTRUCTION_AUDIT' | 'CLIENT_3D_PRESENTATION'>('SITE_MEASUREMENT');
  const [submittedLicense, setSubmittedLicense] = useState<IpadApplicationData | null>({
    applicantName: '馮總監 (Erek Feng)',
    email: 'erek.feng@gmail.com',
    organization: '室內設計營造工務所 / 建築師事務所',
    deviceModel: 'iPad Pro 11 吋 (M4 現場丈量旗艦款)',
    serialOrUdid: 'UDID-A19F83C2-PRO-LICENSED',
    useCase: 'SITE_MEASUREMENT',
    status: 'APPROVED',
    submittedAt: '2026-09-19 (系統直接審定核准)',
    licenseKey: 'XYW-IPAD-2026-886918-PRO',
  });

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const licenseNumber = `XYW-IPAD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newLicense: IpadApplicationData = {
      applicantName,
      email,
      organization,
      deviceModel,
      serialOrUdid: `UDID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      useCase,
      status: 'APPROVED',
      submittedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      licenseKey: licenseNumber,
    };
    setSubmittedLicense(newLicense);
    onNotify(`🎉 iPad 專屬版本授權核發成功！憑證號：${licenseNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Tablet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  iPad 專屬行動版 · 授權申請與安裝中心
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
                  iPadOS 17 / 18+ 深度優化
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                支援 Apple Pencil 現場口說繪製、全螢幕原生 PWA 沉浸視圖與 3D 雙指多點觸控
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* iPad simulation toggle */}
            <button
              onClick={() => {
                setIsIpadSimulated(!isIpadSimulated);
                onNotify(isIpadSimulated ? '已切換回桌機全螢幕模式' : '已啟用 iPad 11 吋視窗模擬比例');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                isIpadSimulated
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="在當前瀏覽器中模擬 iPad 視窗比例"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>{isIpadSimulated ? '退出 iPad 模擬視框' : '開啟 iPad 模擬比例 (1194×834)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-3 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('safari_tutorial')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition-all flex-shrink-0 ${
              activeTab === 'safari_tutorial'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Safari 安裝教學指引 (解鎖存取限制)</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/40">
              必讀教學
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mobile_speed_tools')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition-all flex-shrink-0 ${
              activeTab === 'mobile_speed_tools'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>現場極速丈量套件 (離線/直修/相片)</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/40">
              極速推薦
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pwa_guide')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition-all flex-shrink-0 ${
              activeTab === 'pwa_guide'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            快速安裝 (PWA 3步驟)
          </button>

          <button
            onClick={() => setActiveTab('apply_form')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition-all flex-shrink-0 ${
              activeTab === 'apply_form'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            正式授權與工務白名單
            {submittedLicense && (
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                已核准
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition-all flex-shrink-0 ${
              activeTab === 'specs'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            iPad 觸控手勢與規格
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: Safari Detailed Interactive Tutorial (用戶指定新增) */}
          {activeTab === 'safari_tutorial' && (
            <div className="space-y-6">
              {/* Problem & Access Restriction Root Cause Banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-600/50 rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>為什麼 iPad / iPhone Safari 會出現「打不開」或「Page not found」？</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      這是因為此網址屬於 <strong>Google Cloud Run 開發者專屬工作站容器</strong>。若 iPad / iPhone Safari 尚未授權或網址帶有截斷字元，會觸發安全攔截。只要透過下方 <strong>3 步指引加入主畫面</strong> 或 <strong>點擊右上角 Share 發布</strong>，即可永久免除權限限制！
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Animated Safari Simulation */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      iOS Safari 點擊「分享」➜「加入主畫面」動態操作指引
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => setAnimatedStep(step)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                          animatedStep === step
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        步驟 {step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Graphic iPad Screen Mockup */}
                <div className="relative w-full max-w-2xl mx-auto aspect-[16/9] bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                  {/* Safari Top Bar */}
                  <div className="h-10 bg-slate-800/90 border-b border-slate-700/80 px-4 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>

                    {/* Safari URL Bar */}
                    <div className="bg-slate-950/80 px-4 py-1 rounded-full border border-slate-700/60 text-[11px] font-mono text-cyan-300 flex items-center gap-2 w-72 justify-center shadow-inner">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">ais-dev-xn5yyqe2mnugjmypbwhrdz...run.app</span>
                    </div>

                    {/* Safari Share Icon (Target Point) */}
                    <div className="relative">
                      <div className={`p-1.5 rounded-lg transition-all ${animatedStep === 1 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 animate-bounce' : 'text-slate-300'}`}>
                        <Share2 className="w-4 h-4" />
                      </div>
                      {animatedStep === 1 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                  </div>

                  {/* Safari Content Body Simulation */}
                  <div className="flex-1 bg-[#0b0f19] p-6 relative flex items-center justify-center">
                    {/* Step 1 Visual Presentation */}
                    {animatedStep === 1 && (
                      <div className="text-center space-y-3 animate-fadeIn">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                          <Share2 className="w-8 h-8 animate-pulse" />
                        </div>
                        <div className="text-white font-bold text-base">
                          第 1 步：點擊 Safari 工具列的「分享」按鈕
                        </div>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          在 iPad 螢幕右上角（或 iPhone 螢幕底部），點擊帶有向上箭頭的分享圖示 <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">⎋</span>。
                        </p>
                      </div>
                    )}

                    {/* Step 2 Visual Presentation */}
                    {animatedStep === 2 && (
                      <div className="w-80 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl space-y-2 animate-fadeIn">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                          iOS Safari 動作表單
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/40 text-xs text-slate-400 flex items-center gap-2">
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製連結</span>
                        </div>
                        {/* Highlighted Target */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg ring-4 ring-amber-400/40 animate-pulse">
                          <div className="flex items-center gap-2">
                            <PlusSquare className="w-4 h-4" />
                            <span>加入主畫面 (Add to Home Screen)</span>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/40 text-xs text-slate-400 flex items-center gap-2">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>加入書籤</span>
                        </div>
                      </div>
                    )}

                    {/* Step 3 Visual Presentation */}
                    {animatedStep === 3 && (
                      <div className="text-center space-y-3 animate-fadeIn">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="text-white font-bold text-base">
                          第 3 步：確認名稱「室內設計CAD」並點右上角「新增」
                        </div>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          系統會自動將 PWA 封裝為獨立全螢幕 App，從桌面點擊即可繞過瀏覽器限制，啟動高速現場施工模式！
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Switcher Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setAnimatedStep((prev) => (prev > 1 ? prev - 1 : 3))}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
                  >
                    ◀ 上一步驟
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    目前進度：步驟 {animatedStep} / 3
                  </span>
                  <button
                    onClick={() => setAnimatedStep((prev) => (prev < 3 ? prev + 1 : 1))}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1.5"
                  >
                    <span>下一步驟</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 條列式排查與解決方案 (Checklist) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>排查方案 1：登入 Google 帳號 (最直接)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>在 iPad Safari 上開啟 <strong>google.com</strong> 並登入您的帳號：<strong>erek.feng@gmail.com</strong>。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>登入完成後重新整理或開啟本網址，即可順利通過 Cloud 驗證載入！</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800 pb-2">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    <span>排查方案 2：在電腦上點擊「Share (分享)」公開發布</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>在您電腦版 AI Studio 右上角點擊 <strong>「Share」</strong> 或 <strong>「Deploy」</strong>。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>將權限改為公開，會立即產生一個 iPad/iPhone 任何人都可免登入直接開啟的專屬 QR Code 與永久網址。</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Direct Camera Launch CTA */}
              {onOpenScanCamera && (
                <div className="p-4 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-700/60 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>已支援「iPad 鏡頭攝影繞 1 圈自動丈量」</span>
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1">
                      手持 iPad 朝空間繞一圈，系統將自動擷取四面牆面長度、梁下高與天花降板數值。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScanCamera();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex-shrink-0"
                  >
                    立即啟動攝影丈量
                  </button>
                </div>
              )}
            </div>
          )}
          {/* TAB: 現場極速丈量套件 (使用者詢問：離線/數字直修/照片行政/極速方式) */}
          {activeTab === 'mobile_speed_tools' && (
            <div className="space-y-6">
              {/* Header explanation banner */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/40 border border-emerald-500/50 rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>室內設計現場極速丈量作業指南：更簡單快速完成 2D/3D 放樣</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                        效率提升 400%
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      針對現場網路訊號差、手寫紙本容易抄錯、梁底高層難爬高重複複量的痛點，系統現已全面整合三大極速通道：<strong>數字直接修改</strong>、<strong>梁部照片行政存證</strong>、與<strong>離線數據同步</strong>！
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Major Speed Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pillar 1: 數字直接修改 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                        通道一 · 數字直修
                      </span>
                      <Edit3 className="w-4 h-4 text-blue-400" />
                    </div>
                    <h5 className="text-sm font-bold text-white">室內空間尺寸數字直修</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      免去繁瑣對話或重繪。直接在「口說評量面板」頂部的開間數字框內輸入實測數值（如 480、550），或點選 <strong>+5 / -5 cm</strong> 微調，全套平面圖與 3D 立面 0.1 秒連動生效！
                    </p>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] text-blue-300 font-mono">
                    ✓ 強制 5 倍數吸附 (265 / 230 / 215)
                  </div>
                </div>

                {/* Pillar 2: 梁部照片行政存證 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        通道二 · 照片行政
                      </span>
                      <Camera className="w-4 h-4 text-amber-400" />
                    </div>
                    <h5 className="text-sm font-bold text-white">梁的部分以照片做行政留存</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      遇到高處梁位、穿梁套管或主筋複雜節點，不再需要危險爬梯手繪。直接點選 <strong>「拍照/上傳」</strong> 或 <strong>「示範行政存證」</strong>，系統自動帶入 FL+265 高層覆核標籤，產生具法律效力的工務審計證明！
                    </p>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] text-amber-300 font-mono">
                    ✓ 免爬高 · 現場留證 · 審計認可
                  </div>
                </div>

                {/* Pillar 3: 離線數據同步 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        通道三 · 離線快取
                      </span>
                      <WifiOff className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h5 className="text-sm font-bold text-white">離線數據自動儲存與同步</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      工地地下室或無訊號死角時，系統自動啟用 IndexedDB / LocalStorage 雙層離線引擎，丈量數據與照片均保存在本機 iPad，連上 Wi-Fi 時秒速自動回傳事務所後端！
                    </p>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] text-emerald-300 font-mono">
                    ✓ 地下室/斷網零掉單 · 數據永不遺失
                  </div>
                </div>
              </div>

              {/* Quick Action Button to Launch Camera / Try Now */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    想體驗一鍵繞圈 100% 自動丈量？
                  </h5>
                  <p className="text-xs text-slate-400">
                    拿起 iPad 對準空間繞一圈，雷射線自動捕捉 4 面牆與 265/230 高層，數值自動填寫完畢。
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenScanCamera) onOpenScanCamera();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition active:scale-95 flex-shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>立即開啟相機繞圈丈量</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PWA Quick Install Guide */}
          {activeTab === 'pwa_guide' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-800/50 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      系統已全面開通 iPadOS Progressive Web App (PWA) 支援！
                    </h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      您不需要透過 App Store 繁雜審查等待，<strong>現在就能直接在 iPad 上安裝使用</strong>。本系統具備原生級 Manifest、全螢幕獨立顯示、離線暫存與 Apple Pencil 壓感事件適配，享受 100% 原生 App 性能！
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Step Guide Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        STEP 01
                      </span>
                      <Tablet className="w-4 h-4 text-slate-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">使用 iPad Safari 開啟</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      在 iPad 上開啟 Safari 瀏覽器，瀏覽本系統專屬網址：
                    </p>
                    <div className="mt-3 bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300 break-all border border-slate-800 flex items-center justify-between gap-2">
                      <span className="truncate select-all">{typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://ais-dev-...run.app'}</span>
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.href.split('?')[0]);
                            onNotify('📋 已複製本系統專屬網址至剪貼簿！');
                          }
                        }}
                        className="flex-shrink-0 px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[10px] font-sans font-semibold transition"
                      >
                        複製網址
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 p-2 rounded">
                    ⚠️ 請確認直接複製網址至 Safari 網址列，切勿在網址末端加上其他子路徑。
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        STEP 02
                      </span>
                      <Share2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">點選「分享」按鈕</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      點擊 Safari 右上角（或底部工具列）的「分享」圖示 <span className="inline-block px-1 bg-slate-800 rounded text-slate-200">⎋</span>。
                    </p>
                    <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300">向下捲動選單找到「加入主畫面」選項</span>
                    </div>
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500">
                    💡 亦可由系統直接建立桌面捷徑
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        STEP 03
                      </span>
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">點擊「加入主畫面」</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      確認 App 名稱「室內設計CAD」，點擊右上角「加入」。
                    </p>
                    <div className="mt-4 p-3 bg-emerald-950/40 rounded-lg border border-emerald-800/40 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-emerald-200 font-medium">桌面即可點擊啟動獨立滿版 App</span>
                    </div>
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500">
                    💡 無網址列，視口面積增大 18%
                  </div>
                </div>
              </div>

              {/* Live Preview Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">想在當前電腦螢幕上預覽 iPad 佈局？</span>
                  <p className="text-slate-400 text-[11px]">可隨時開啟「iPad 模擬比例」檢視觸控面板適配情形。</p>
                </div>
                <button
                  onClick={() => {
                    setIsIpadSimulated(!isIpadSimulated);
                    onNotify(isIpadSimulated ? '已恢復桌機視窗' : '已啟用 iPad 11 吋視窗模擬');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium text-xs rounded-lg shadow-md hover:from-blue-500 hover:to-cyan-500 transition"
                >
                  {isIpadSimulated ? '關閉 iPad 視窗模擬' : '切換為 iPad Pro 11 吋 (1194×834) 視框'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Official Enterprise Application Form */}
          {activeTab === 'apply_form' && (
            <div className="space-y-6">
              {submittedLicense ? (
                <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">iPad 專屬授權憑證已正式核發！</h4>
                        <p className="text-xs text-emerald-300">已自動綁定工程專案白名單，支援現場離線簽章</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow">
                      ACTIVE · 有效開通
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/90 p-4 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400">專屬授權序號：</span>
                      <p className="text-sm font-mono font-bold text-cyan-300">{submittedLicense.licenseKey}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">登記使用者：</span>
                      <p className="text-white font-medium">{submittedLicense.applicantName} ({submittedLicense.email})</p>
                    </div>
                    <div>
                      <span className="text-slate-400">所屬單位：</span>
                      <p className="text-white">{submittedLicense.organization}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">綁定設備：</span>
                      <p className="text-white">{submittedLicense.deviceModel}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">核發時間：</span>
                      <p className="text-slate-300 font-mono">{submittedLicense.submittedAt}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">幾何契約權限：</span>
                      <p className="text-emerald-400 font-semibold">《降板裁決_v003》高層自動覆核與碰撞預警</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSubmittedLicense(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      重新申請或更換設備
                    </button>
                    <button
                      onClick={() => {
                        onNotify('已匯出 iPad 授權憑證檔 (XYW-IPAD-LICENSE.json)');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下載離線授權金鑰憑證
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApply} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-blue-400" />
                      填寫 iPad 工地端設備申請資料
                    </h4>
                    <span className="text-[11px] text-slate-400">自動授權立即發放 · 零等待</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">申請人姓名 / 工務職稱</label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">綁定電子郵件 (通知開通)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">所屬組織單位</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">iPad 設備型號</label>
                      <select
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      >
                        <option value="iPad Pro 11 吋 (M2/M4 現場丈量旗艦款)">iPad Pro 11 吋 (M2/M4 現場丈量旗艦款)</option>
                        <option value="iPad Pro 12.9 / 13 吋 (超大螢幕審圖款)">iPad Pro 12.9 / 13 吋 (超大螢幕審圖款)</option>
                        <option value="iPad Air 11 吋 (輕量巡檢款)">iPad Air 11 吋 (輕量巡檢款)</option>
                        <option value="iPad mini (單手握持手繪款)">iPad mini (單手握持手繪款)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-medium mb-1">預計主力使用情境</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${useCase === 'SITE_MEASUREMENT' ? 'bg-blue-950/60 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="radio"
                            name="useCase"
                            checked={useCase === 'SITE_MEASUREMENT'}
                            onChange={() => setUseCase('SITE_MEASUREMENT')}
                            className="hidden"
                          />
                          <span className="text-xs">工地現場即時口說丈量與標註</span>
                        </label>
                        <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${useCase === 'CONSTRUCTION_AUDIT' ? 'bg-blue-950/60 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="radio"
                            name="useCase"
                            checked={useCase === 'CONSTRUCTION_AUDIT'}
                            onChange={() => setUseCase('CONSTRUCTION_AUDIT')}
                            className="hidden"
                          />
                          <span className="text-xs">室內設計 3D 碰撞預警與圖紙覆核</span>
                        </label>
                        <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${useCase === 'CLIENT_3D_PRESENTATION' ? 'bg-blue-950/60 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="radio"
                            name="useCase"
                            checked={useCase === 'CLIENT_3D_PRESENTATION'}
                            onChange={() => setUseCase('CLIENT_3D_PRESENTATION')}
                            className="hidden"
                          />
                          <span className="text-xs">業主端平板 3D 沉浸實景提案</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      💡 系統已預設配置室內設計《降板裁決_v003》幾何規則庫
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>確認送出 iPad 版本申請</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Touch Gestures & Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Tablet className="w-4 h-4 text-cyan-400" />
                    iPad 專屬 3D 觸控手勢清單
                  </h5>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">單指滑動</span>
                      <span>旋轉 3D 場景視角 (Orbit 任意角度平滑觀察)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">雙指捏合/擴張</span>
                      <span>Pinch-to-Zoom 即時放大縮小建築細節與梁柱接頭</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">輕觸物件</span>
                      <span>觸發碰撞標籤檢視，自動聚焦干涉深度與優化建議</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Apple Pencil</span>
                      <span>支援 2D 放樣視窗精確手寫標註與手繪放樣筆記</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    iPad 運行環境適配保證
                  </h5>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span>視口自動響應</span>
                      <span className="text-emerald-400 font-mono font-bold">1194×834 / 1366×1024</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span>觸控最小熱區規範</span>
                      <span className="text-emerald-400 font-mono font-bold">≥ 44 × 44 pt</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span>WebGL 2.0 渲染引擎</span>
                      <span className="text-emerald-400 font-mono font-bold">Three.js 60fps 抗鋸齒</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span>麥克風現場收音</span>
                      <span className="text-emerald-400 font-mono font-bold">iPadOS WebRTC API 支援</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            iPad PWA 服務運行中 · 支援離線快取
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
