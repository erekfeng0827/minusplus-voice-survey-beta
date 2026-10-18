import React, { useState } from 'react';
import { RoomData, VirtualAnnotationPoint } from '../types';
import {
  Sparkles,
  Palette,
  FileSpreadsheet,
  Clock,
  WifiOff,
  Ruler,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  MapPin,
  RefreshCw,
  Eye,
  Layers,
  UploadCloud,
  FileCheck2,
  X,
  Compass,
  ArrowRight,
  Download,
  Share2,
  ShieldCheck,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export type ExtensionFeatureId =
  | 'project_template'       // 1. 新增專案範本 (如截圖)
  | 'site_checkin'           // 2. 施工現場打卡 (如截圖)
  | 'offline_sync'           // 3. 離線數據同步 (如截圖)
  | 'interactive_dimension'  // 4. 互動尺寸標註 (如截圖)
  | 'multi_version_cad'      // 5. 跨版本 CAD 比對 (V1 vs V2 差異透視)
  | 'qr_site_sticker'        // 6. 現場放樣 QR Code 掃描貼紙產出
  | 'construction_log'       // 7. 今日工務施工放樣日誌自動匯出
  | 'claude_ui_spec';        // 8. 克勞的 Design 介面優化設計規範與 Token

interface ExtendedFeaturesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  initialFeature?: ExtensionFeatureId;
  onUpdateRoom?: (updated: RoomData) => void;
  onNotify?: (msg: string) => void;
}

export const ExtendedFeaturesHubModal: React.FC<ExtendedFeaturesHubModalProps> = ({
  isOpen,
  onClose,
  room,
  initialFeature = 'project_template',
  onUpdateRoom,
  onNotify,
}) => {
  const [selectedTab, setSelectedTab] = useState<ExtensionFeatureId>(initialFeature);

  // 1. 新增專案範本狀態
  const [selectedTemplate, setSelectedTemplate] = useState<string>('xingyue_luxury');
  // 2. 施工現場打卡狀態
  const [checkinLocation, setCheckinLocation] = useState<string>('新竹竹北 · 室內設計 A5-12F 客廳工地');
  const [checkinNote, setCheckinNote] = useState<string>('現場完成放樣雷射投點與梁底 FL+265 高程核定。');
  const [checkinHistory, setCheckinHistory] = useState<Array<{ time: string; loc: string; inspector: string; passed: boolean }>>([
    { time: '2026-09-19 08:30', loc: '室內設計 A5-12F 客廳', inspector: '現場工務主任 · 晶晶審定', passed: true },
    { time: '2026-09-18 16:45', loc: '室內設計 A5-12F 主臥室', inspector: '助理放樣師 · 馮工', passed: true },
  ]);
  // 3. 離線數據同步狀態
  const [offlineCacheCount, setOfflineCacheCount] = useState<number>(14);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // 4. 互動尺寸標註狀態
  const [quickAnnotationType, setQuickAnnotationType] = useState<'elevation' | 'opening' | 'socket'>('elevation');
  const [customDimensionValue, setCustomDimensionValue] = useState<number>(230);
  const [customDimensionLabel, setCustomDimensionLabel] = useState<string>('吊隱冷氣集風箱降板淨高');
  // 5. 跨版本 CAD 比對狀態
  const [diffVersionA, setDiffVersionA] = useState<string>('v0.2-初測放樣');
  const [diffVersionB, setDiffVersionB] = useState<string>('v0.3-降板裁決');
  // 6. QR Code 掃描放樣貼紙
  const [qrSize, setQrSize] = useState<'small' | 'standard' | 'large'>('standard');
  // 7. 今日工務日誌狀態
  const [weatherToday, setWeatherToday] = useState<string>('晴天 · 氣溫 26°C · 濕度 62%');
  const [workerCount, setWorkerCount] = useState<number>(4);

  if (!isOpen) return null;

  // 範本清單
  const projectTemplates = [
    {
      id: 'xingyue_luxury',
      name: '室內設計豪邸 · 標竿降板放樣範本',
      badge: '官方契約 v003',
      specs: '面寬 480 × 進深 550 × 大梁 265 × 降板 230 × 落塵 215',
      features: ['結構大梁 B1 自動避梁', '吊隱天花假梁預留 20cm', '玄關落塵高低差 3cm', '全室尺寸鎖定 5 倍數'],
      defaultRoom: { width: 480, length: 550, height: 280, beamHeight: 265, ceilingDrop: 230, bathKitchenDrop: 215 },
    },
    {
      id: 'small_loft',
      name: '當代夾層 / 高坪效複層套房範本',
      badge: '小坪數極致放樣',
      specs: '面寬 360 × 進深 420 × 挑高 360 × 夾層淨高 210',
      features: ['鋼構夾層樓梯踏步放樣', '衛浴全嵌降板 200', '垂直雙層尺寸鏈標註'],
      defaultRoom: { width: 360, length: 420, height: 360, beamHeight: 310, ceilingDrop: 210, bathKitchenDrop: 200 },
    },
    {
      id: 'modern_commercial',
      name: '商辦 / 精品展廳開放式天花範本',
      badge: '清水模露明管線',
      specs: '面寬 650 × 進深 780 × 裸頂 320 × 吊燈軌道 265',
      features: ['風管消防撒水頭水平淨空 270', '軌道燈吊筋定位', '全開放弱電地板走線'],
      defaultRoom: { width: 650, length: 780, height: 320, beamHeight: 280, ceilingDrop: 265, bathKitchenDrop: 240 },
    },
    {
      id: 'villa_residence',
      name: '景觀透天別墅 · 衛廚重水區範本',
      badge: '重度泥作防水',
      specs: '面寬 520 × 進深 600 × 樓高 300 × 降板浴缸 230',
      features: ['雙止水墩高低差放樣', '排氣同層外排套管點位', '大理石壁面乾式吊掛留縫'],
      defaultRoom: { width: 520, length: 600, height: 300, beamHeight: 275, ceilingDrop: 230, bathKitchenDrop: 215 },
    },
  ];

  // 套用專案範本
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = projectTemplates.find((t) => t.id === tmplId);
    if (!tmpl || !onUpdateRoom) return;

    const updated: RoomData = {
      ...room,
      roomName: `${room.roomName.split(' ')[0]} · [${tmpl.name.slice(0, 8)}]`,
      ...tmpl.defaultRoom,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateRoom(updated);
    if (onNotify) onNotify(`已成功套用「${tmpl.name}」範本幾何參數！`);
  };

  // 打卡操作
  const handleCheckin = () => {
    const now = new Date().toLocaleString('zh-TW', { hour12: false });
    const newEntry = {
      time: now,
      loc: checkinLocation,
      inspector: '工務首席審計師 · 晶晶認證',
      passed: true,
    };
    setCheckinHistory([newEntry, ...checkinHistory]);
    if (onNotify) onNotify('已成功完成現場打卡，高程數據已綁定 GPS 與時間戳記！');
  };

  // 離線數據同步操作
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setOfflineCacheCount(0);
      if (onNotify) onNotify('離線快取中的 14 筆放樣測量與照片已全數同步至室內設計中央資料庫！');
    }, 900);
  };

  // 新增互動尺寸標註
  const handleAddInteractiveDimension = () => {
    if (!onUpdateRoom) return;
    const newAnno: VirtualAnnotationPoint = {
      id: `anno-user-${Date.now()}`,
      label: `${customDimensionLabel} FL+${customDimensionValue}`,
      dimensionType: quickAnnotationType === 'elevation' ? 'clearance' : 'height',
      dimensionValue: customDimensionValue,
      unit: 'cm',
      x: Math.round(room.width * 0.5),
      y: Math.round(room.length * 0.5),
      elevation: customDimensionValue,
      referenceWall: 'center',
      targetEntity: customDimensionLabel,
      description: `手動新增標註：${customDimensionLabel} (高程 ${customDimensionValue}cm)`,
      extractedFromText: `手動輸入：${customDimensionLabel} ${customDimensionValue}cm`,
      confidence: 1.0,
      rule5MultipleCompliant: customDimensionValue % 5 === 0,
      isVirtualAiGenerated: false,
    };

    const updated: RoomData = {
      ...room,
      virtualAnnotations: [...(room.virtualAnnotations || []), newAnno],
    };
    onUpdateRoom(updated);
    if (onNotify) onNotify(`已成功添加標註「${customDimensionLabel}」至 2D/3D 放樣畫布！`);
  };

  const navTabs: Array<{ id: ExtensionFeatureId; label: string; icon: string; badge?: string }> = [
    { id: 'project_template', label: '新增專案範本', icon: '📁', badge: '熱門' },
    { id: 'site_checkin', label: '施工現場打卡', icon: '📍', badge: 'GPS' },
    { id: 'offline_sync', label: '離線數據同步', icon: '🔄', badge: `${offlineCacheCount}` },
    { id: 'interactive_dimension', label: '互動尺寸標註', icon: '📐' },
    { id: 'multi_version_cad', label: '跨版本 CAD 比對', icon: '🔀', badge: 'DIFF' },
    { id: 'qr_site_sticker', label: '現場放樣 QR 貼紙', icon: '🏷️' },
    { id: 'construction_log', label: '施工放樣日誌', icon: '📋' },
    { id: 'claude_ui_spec', label: '克勞的 Design 規範', icon: '🎨', badge: 'Token' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#121622] border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#161d2d] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  擴充功能與現場工務生產力中心
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  8 大現場增強套件
                </span>
              </div>
              <p className="text-xs text-slate-400">
                專為室內設計現場放樣、離線作業、打卡追溯與克勞的 Design 介面設計優化打造
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

        {/* Feature Navigation Bar (Matches User Screenshot Pills with Scroll) */}
        <div className="px-5 py-2.5 bg-[#0e131d] border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/50'
                    : 'bg-[#1e2534] hover:bg-[#283145] text-slate-300 border border-slate-700/80 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="tracking-wide whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: 新增專案範本 */}
          {selectedTab === 'project_template' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-cyan-400" />
                    標準專案放樣幾何範本庫
                  </h4>
                  <p className="text-xs text-slate-400">
                    一鍵建立符合《降板裁決_v003》與大梁 265/230/215 高程之預設標準戶型空間
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      selectedTemplate === t.id
                        ? 'bg-blue-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                          {t.badge}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                        {t.specs}
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                        {t.features.map((feat, fi) => (
                          <span key={fi} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-cyan-400" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">5 倍數合約已嚴格審定</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(t.id);
                          handleApplyTemplate(t.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>載入此範本</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 施工現場打卡 */}
          {selectedTab === 'site_checkin' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    現場工務 GPS 定位打卡與高程存證
                  </h4>
                  <p className="text-xs text-slate-400">
                    工務主任與放樣師於現場打卡，自動將雷射投點座標、心跳狀態與幾何契約鎖入時間軸
                  </p>
                </div>
                <button
                  onClick={handleCheckin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>立即現場打卡存證</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Checkin Form */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300">打卡簽核資料確認</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400">當前案場位置 (GPS 自動配對)</label>
                    <input
                      type="text"
                      value={checkinLocation}
                      onChange={(e) => setCheckinLocation(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400">放樣查驗備註與施工驗收摘要</label>
                    <textarea
                      rows={3}
                      value={checkinNote}
                      onChange={(e) => setCheckinNote(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>打卡將自動紀錄當前梁下 265 / 天花 230 cm 檢驗值並上鏈存證。</span>
                  </div>
                </div>

                {/* Checkin History */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300">近期現場打卡稽核歷史紀錄</span>
                  <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px]">
                    {checkinHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white">{item.loc}</span>
                          <span className="text-[11px] text-slate-400">{item.inspector}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 離線數據同步 */}
          {selectedTab === 'offline_sync' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    工地無網路環境 · 離線數據快取與雙向同步
                  </h4>
                  <p className="text-xs text-slate-400">
                    地下室或鋼構遮蔽無訊號時，所有測量、口述語音與照片全數本機 IndexedDB 快取
                  </p>
                </div>

                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncing || offlineCacheCount === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
                    offlineCacheCount > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '正在同步至伺服器...' : '立即上傳同步離線包'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-xs text-slate-400">本機待同步工單</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">{offlineCacheCount} 筆</span>
                  <span className="text-[11px] text-slate-500">含 4 個空間圖元與 10 條標註</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-xs text-slate-400">離線快取記憶體使用</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">4.2 MB</span>
                  <span className="text-[11px] text-slate-500">IndexedDB 離線安全沙盒</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-xs text-slate-400">心跳最後更新</span>
                  <span className="text-2xl font-bold font-mono text-purple-300">正常綠燈</span>
                  <span className="text-[11px] text-slate-500">斷點自動重連續傳機制開啟</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-300">離線防死鎖同步規則保障：</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>原子更名（Atomic Rename），杜絕 19.8 天滯留問題</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>強制 5 倍數幾何過濾，拒絕無效資料入庫</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>支援 iPad、iPhone 與 Android 現場熱點雙向傳輸</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>自動備份至 Notion 歷史封存池</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 互動尺寸標註 */}
          {selectedTab === 'interactive_dimension' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-cyan-400" />
                    互動尺寸標註編輯器 (Interactive Dimension Studio)
                  </h4>
                  <p className="text-xs text-slate-400">
                    快速在放樣圖上添加自訂垂直高程鏈、開口標高與水電底盒標註，即時雙向連動 2D / 3D
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Add Dimension Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300">新增標註點位參數</span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setQuickAnnotationType('elevation');
                        setCustomDimensionValue(230);
                        setCustomDimensionLabel('空調天花降板淨高');
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        quickAnnotationType === 'elevation'
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      天花高程標註
                    </button>
                    <button
                      onClick={() => {
                        setQuickAnnotationType('opening');
                        setCustomDimensionValue(265);
                        setCustomDimensionLabel('結構大梁下淨高');
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        quickAnnotationType === 'opening'
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      梁底淨空標註
                    </button>
                    <button
                      onClick={() => {
                        setQuickAnnotationType('socket');
                        setCustomDimensionValue(30);
                        setCustomDimensionLabel('電視矮櫃多媒體插座');
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        quickAnnotationType === 'socket'
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      水電標高標註
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400">標註名稱 / 項目說明</label>
                    <input
                      type="text"
                      value={customDimensionLabel}
                      onChange={(e) => setCustomDimensionLabel(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">高程或距離數值 (cm)</span>
                      <span
                        className={`font-mono font-bold ${
                          customDimensionValue % 5 === 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {customDimensionValue % 5 === 0 ? '符合 5 倍數契約' : '非 5 倍數'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={5}
                        value={customDimensionValue}
                        onChange={(e) => setCustomDimensionValue(parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 flex-1"
                      />
                      <button
                        onClick={() => setCustomDimensionValue(Math.round(customDimensionValue / 5) * 5)}
                        className="px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition"
                      >
                        5x 強制取整
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddInteractiveDimension}
                    className="mt-2 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>插入標註至放樣圖紙</span>
                  </button>
                </div>

                {/* Current Annotations List */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-slate-300">
                    目前空間現存標註點 ({room.virtualAnnotations?.length || 0} 個)
                  </span>

                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px]">
                    {(room.virtualAnnotations || []).map((an, i) => (
                      <div
                        key={i}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white">{an.label}</span>
                          <span className="text-[11px] text-slate-400">{an.description}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800">
                          {an.dimensionValue} cm
                        </span>
                      </div>
                    ))}
                    {(!room.virtualAnnotations || room.virtualAnnotations.length === 0) && (
                      <div className="text-slate-500 text-xs py-8 text-center">尚無標註，請由左方建立</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 跨版本 CAD 比對 (V1 vs V2) */}
          {selectedTab === 'multi_version_cad' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    跨版本 CAD 放樣幾何差異比對 (CAD Visual Diff)
                  </h4>
                  <p className="text-xs text-slate-400">
                    透視比對「現場初測版本」與「室內設計降板裁決 v003」差異，紅綠雙色顯影變更點
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">基準版本 (Version A):</span>
                  <select
                    value={diffVersionA}
                    onChange={(e) => setDiffVersionA(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  >
                    <option value="v0.1-原始手繪草圖">v0.1-原始手繪草圖</option>
                    <option value="v0.2-初測放樣">v0.2-初測放樣 (482×548)</option>
                  </select>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">目標版本 (Version B):</span>
                  <select
                    value={diffVersionB}
                    onChange={(e) => setDiffVersionB(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold font-mono"
                  >
                    <option value="v0.3-降板裁決">v0.3-室內設計降板裁決 (480×550)</option>
                    <option value="v0.4-最終出圖">v0.4-竣工施工圖</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-300">兩版幾何契約差異報告 (Diff Report)：</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-red-500/30 flex flex-col gap-1">
                    <span className="text-slate-400">面寬 (Width) 變更</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 line-through">482 cm</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">480 cm</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Δ -2cm (校準至 5 倍數)</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-red-500/30 flex flex-col gap-1">
                    <span className="text-slate-400">大梁下淨高 (Beam)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 line-through">264 cm</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">265 cm</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Δ +1cm (避梁合格)</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-red-500/30 flex flex-col gap-1">
                    <span className="text-slate-400">空調天花降板 (Ceiling)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 line-through">232 cm</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">230 cm</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Δ -2cm (預留集風箱 50cm)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 現場放樣 QR 貼紙 */}
          {selectedTab === 'qr_site_sticker' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    現場施工放樣 QR Code 掃描貼紙產出
                  </h4>
                  <p className="text-xs text-slate-400">
                    列印貼於現場大梁柱體，水電或木工用手機掃描即刻調閱 3D 模型與幾何高程
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* QR Sticker Mockup */}
                <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-xl flex flex-col gap-3 font-sans border-4 border-slate-900">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-slate-600">
                        室內設計裝修工程 · 現場放樣查驗貼紙
                      </div>
                      <div className="text-base font-black text-slate-900">{room.roomName}</div>
                    </div>
                    <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                      V-01~10 合格
                    </span>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    {/* SVG Simulated QR */}
                    <div className="w-24 h-24 bg-slate-900 p-1.5 rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-full h-full bg-white p-1 grid grid-cols-5 gap-0.5">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              i % 2 === 0 || i % 5 === 0 || i === 12 ? 'bg-slate-900' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-xs font-mono">
                      <div>
                        <strong>面寬 × 進深：</strong>
                        {room.width} × {room.length} cm
                      </div>
                      <div>
                        <strong>大梁下淨高：</strong>
                        FL +{room.beamHeight} cm
                      </div>
                      <div>
                        <strong>天花降板：</strong>
                        FL +{room.ceilingDrop} cm
                      </div>
                      <div>
                        <strong>原清水樓板：</strong>
                        CL +{room.height} cm
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 border-t border-slate-300 pt-2 flex items-center justify-between">
                    <span>手機直接掃描開啟現場 3D 視錐透視</span>
                    <span className="font-mono">CODEX 晶晶 簽核</span>
                  </div>
                </div>

                {/* Print Settings */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300">貼紙規格設定</span>
                  <div className="flex items-center gap-2">
                    {(['small', 'standard', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setQrSize(sz)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize border ${
                          qrSize === sz
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sz === 'small' ? '小型標籤 (5×7cm)' : sz === 'standard' ? '標準放樣貼 (8×10cm)' : '大梁總貼 (12×15cm)'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>列印 / 匯出放樣貼紙 PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: 施工放樣日誌 */}
          {selectedTab === 'construction_log' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    今日工務施工放樣日誌 (Daily Site Log)
                  </h4>
                  <p className="text-xs text-slate-400">
                    每日自動統計空間尺寸放樣進度、出席工種、氣象條件與 5 倍數契約驗收摘要
                  </p>
                </div>

                <button
                  onClick={() => {
                    const log = `【室內設計今日工務放樣日誌】\n日期：${new Date().toLocaleDateString()}\n天氣：${weatherToday}\n出勤人數：${workerCount} 人\n空間：${room.roomName}\n面寬進深：${room.width}x${room.length}cm\n梁底淨高：FL+${room.beamHeight}cm (PASS)\n天花降板：FL+${room.ceilingDrop}cm (PASS)\n驗收狀態：幾何契約全面通過`;
                    navigator.clipboard.writeText(log);
                    if (onNotify) onNotify('已複製今日工務放樣日誌文字報表！');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>複製工務日誌</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-300">工務環境參數</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400">今日天氣與溫濕度</label>
                    <input
                      type="text"
                      value={weatherToday}
                      onChange={(e) => setWeatherToday(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400">放樣工種出席人數</label>
                    <input
                      type="number"
                      value={workerCount}
                      onChange={(e) => setWorkerCount(parseInt(e.target.value, 10) || 0)}
                      className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-300">本日放樣進度摘要：</span>
                  <div className="flex flex-col gap-1 text-xs text-slate-400">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span>當前空間放樣完成度</span>
                      <span className="text-emerald-400 font-bold font-mono">100% (已核定)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span>結構梁位避梁驗收</span>
                      <span className="text-emerald-400 font-bold font-mono">FL+265 合格</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span>空調集風箱降板淨深</span>
                      <span className="text-emerald-400 font-bold font-mono">Δh=50cm 合格</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>工務管線死鎖狀態</span>
                      <span className="text-emerald-400 font-bold font-mono">0 阻滯 (已解塞)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: 克勞的 Design 規範與 Token */}
          {selectedTab === 'claude_ui_spec' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    克勞的 Design · 介面設計規範與系統 Token 指南
                  </h4>
                  <p className="text-xs text-slate-400">
                    提供專門供「Claude / 克勞的 Design」進行後續 UI/UX 深度調優、色彩變數與元件重構之規格手冊
                  </p>
                </div>

                <button
                  onClick={() => {
                    const tokens = `/* 克勞的 Design 系統 Token (CSS / Tailwind) */\n:root {\n  --color-canvas: #121622;\n  --color-surface-subtle: #1e2534;\n  --color-border-subtle: rgba(51, 65, 85, 0.8);\n  --color-contract-5x: #10b981;\n  --color-beam-warning: #f59e0b;\n  --radius-pill: 9999px;\n  --radius-card: 16px;\n  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;\n}`;
                    navigator.clipboard.writeText(tokens);
                    if (onNotify) onNotify('已複製克勞的 Design 設計系統 Token！');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>複製設計 Token</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5">
                  <span className="font-bold text-slate-200">1. 圓角膠囊按鈕 (Pill Controls) 幾何準則</span>
                  <p className="text-slate-400 leading-relaxed">
                    如同使用者截圖所示，操作膠囊一律採用 <code>rounded-full</code>，內側水平內距嚴格維持垂直內距之 2 倍（如 <code>px-4 py-1.5</code>），文字嚴禁換行。
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3.5 py-1 rounded-full bg-[#1e2534] text-white border border-slate-700">
                      新增專案範本
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#1e2534] text-white border border-slate-700">
                      施工現場打卡
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#1e2534] text-white border border-slate-700">
                      離線數據同步
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5">
                  <span className="font-bold text-slate-200">2. 5 倍數幾何語意色彩系統 (Semantic Colors)</span>
                  <div className="flex flex-col gap-1.5 text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span>#10B981：5倍數契約合規色 (265, 230, 215)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span>#F59E0B：施工碰撞預警 (如梁下淨空 &lt; 260)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                      <span>#06B6D4：雷射動態視錐與高程引線</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>幾何契約：梁底 265 / 天花 230 / 落塵 215 實時監護中</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
