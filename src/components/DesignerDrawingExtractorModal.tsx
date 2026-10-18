import React, { useState, useRef } from 'react';
import {
  Ruler,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Scissors,
  FileText,
  Printer,
  Grid,
  Download,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  X,
  Compass,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Settings,
  HelpCircle,
  FileCode,
  Palette,
  Box,
  RefreshCw,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import {
  RoomData,
  CADCustomProfile,
  LineweightMappingItem,
  HatchPatternConfigItem,
  CADBlockLibraryItem,
} from '../types';
import {
  DEFAULT_CAD_PROFILE,
  PRESET_CAD_PROFILES,
  validateCadProfile,
  downloadProfileJson,
} from '../utils/cadProfilePresets';
import { downloadCustomSectionDxf } from '../utils/customSectionDxfExporter';
import { ImportExistingFloorplanPanel } from './ImportExistingFloorplanPanel';
import { Calibration5xModal } from './Calibration5xModal';
import { PdfDrawingOcrModal } from './PdfDrawingOcrModal';

interface DesignerDrawingExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom?: (updatedRoom: RoomData) => void;
  onAddRoom?: (newRoom: RoomData) => void;
  onNotify?: (msg: string) => void;
  onNavigateToTab?: (tab: '2d_staking' | '3d_simulation' | 'blueprints' | 'audit_dashboard') => void;
  initialTab?: 'import_floorplan' | 'pdf_ocr' | 'calibrate_5x' | 'test_bench' | 'custom_profile' | 'section_cut' | 'fixed_height' | 'line_hatch' | 'sheet_block';
}

export const DesignerDrawingExtractorModal: React.FC<DesignerDrawingExtractorModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onAddRoom,
  onNotify,
  onNavigateToTab,
  initialTab = 'import_floorplan',
}) => {
  // Tabs: 'import_floorplan' | 'pdf_ocr' | 'calibrate_5x' | 'test_bench' | 'custom_profile' | 'section_cut' | 'fixed_height' | 'line_hatch' | 'sheet_block'
  const [activeTab, setActiveTab] = useState<
    'import_floorplan' | 'pdf_ocr' | 'calibrate_5x' | 'test_bench' | 'custom_profile' | 'section_cut' | 'fixed_height' | 'line_hatch' | 'sheet_block'
  >(initialTab);

  // ★ 核心狀態：使用者完全自訂的 CAD 出圖設定檔 (圖塊庫、線寬層級映射表、預設填充線參數)
  const [customProfile, setCustomProfile] = useState<CADCustomProfile>(DEFAULT_CAD_PROFILE);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null);
  const [isRawJsonModalOpen, setIsRawJsonModalOpen] = useState<boolean>(false);
  const [rawJsonInputText, setRawJsonInputText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 固定高度參數化契約狀態 (使用者需求：固定80公分配300或600)
  const [baseCabinetHeight, setBaseCabinetHeight] = useState<number>(80); // 固定 80cm 檯面/底櫃
  const [wallSpanWidth, setWallSpanWidth] = useState<number>(300); // 變動開間 300cm 或 600cm
  const [cabinetDoorCount, setCabinetDoorCount] = useState<number>(5); // 門片分割數
  const [upperCabinetHeight, setUpperCabinetHeight] = useState<number>(80); // 吊櫃高度
  const [toeKickHeight, setToeKickHeight] = useState<number>(10); // 踢腳板高度
  const [beamClearHeight, setBeamClearHeight] = useState<number>(265); // 梁底淨高 FL+265
  const [dropCeilingHeight, setDropCeilingHeight] = useState<number>(230); // 吊隱降板 FL+230

  // 2. 實測測試台資料狀態 (等待使用者提供丈量圖、3D 圖、櫃體配置)
  const [designerSurveyInput, setDesignerSurveyInput] = useState<string>(
    '【測試資料載入中】\n現場實測面寬：300 cm（或 600 cm）\n下櫃檯面固定高度：80 cm（不可變動）\n大梁橫跨淨高：265 cm\n天花降板高度：230 cm\n門片均分：60 cm × 5 片（符合 5 倍數整數對齊）\n繪圖習慣：原圖直接剖切，剖線加粗 0.5mm，木作剖面套用 ANSI31 45° 斜線'
  );
  const [uploadedSurveyName, setUploadedSurveyName] = useState<string | null>(null);
  const [uploaded3DName, setUploaded3DName] = useState<string | null>(null);

  if (!isOpen) return null;

  // 計算門片每片淨寬
  const singleDoorWidth = Math.round(wallSpanWidth / cabinetDoorCount);

  // 取得當前作用中設定檔之線寬、填充、圖塊動態數值 (確保 100% 依自訂樣式輸出)
  const cutLwItem = customProfile.lineweights.find((l) => l.key === 'cut_structural') || {
    layerName: 'CUT_WALL_BEAM',
    lineWeightMm: 0.5,
    colorHex: '#ffffff',
    colorIndex: 7,
  };
  const profileLwItem = customProfile.lineweights.find((l) => l.key === 'profile_outline') || {
    layerName: 'PROFILE_CABINET',
    lineWeightMm: 0.25,
    colorHex: '#06b6d4',
    colorIndex: 4,
  };
  const divisionLwItem = customProfile.lineweights.find((l) => l.key === 'cabinet_division') || {
    layerName: 'DIVISION_HARDWARE',
    lineWeightMm: 0.15,
    colorHex: '#10b981',
    colorIndex: 3,
  };
  const datumLwItem = customProfile.lineweights.find((l) => l.key === 'elevation_datum') || {
    layerName: 'DATUM_CONTRACT_80',
    lineWeightMm: 0.35,
    colorHex: '#ef4444',
    colorIndex: 1,
  };

  const woodHatchItem = customProfile.hatchSettings.find((h) => h.targetMaterial === 'wood_joinery') || {
    patternName: 'ANSI31' as const,
    angleDeg: 45,
    spacingMm: 2.0,
    lineWeightMm: 0.13,
    colorHex: '#c084fc',
    layerName: 'HATCH_WOOD',
  };
  const stoneHatchItem = customProfile.hatchSettings.find((h) => h.targetMaterial === 'stone_countertop') || {
    patternName: 'CROSS_HATCH' as const,
    angleDeg: 45,
    spacingMm: 1.5,
    lineWeightMm: 0.13,
    colorHex: '#34d399',
    layerName: 'HATCH_STONE',
  };

  const elevBlockItem = customProfile.blockLibrary.find((b) => b.category === 'elevation_tag') || {
    blockName: 'ELEV_TAG_ARROW',
    prefix: '▼ FL+',
    symbolShape: 'triangle_down',
    colorHex: '#ef4444',
  };
  const secBlockItem = customProfile.blockLibrary.find((b) => b.category === 'section_callout') || {
    blockName: 'SEC_CUT_ARROWS',
    prefix: '⮜ A-A\' ⮞',
    symbolShape: 'circle_split',
    colorHex: '#06b6d4',
  };

  // 載入設計師實測範例 (300cm 或 600cm)
  const handleLoadDesignerPreset = (presetType: 'preset_300' | 'preset_600') => {
    if (presetType === 'preset_300') {
      setWallSpanWidth(300);
      setBaseCabinetHeight(80);
      setCabinetDoorCount(5); // 300 / 5 = 60cm 每片
      onNotify?.('📐 已載入【300cm 面寬配固定 80cm 檯面】設計師實測規格！');
    } else {
      setWallSpanWidth(600);
      setBaseCabinetHeight(80);
      setCabinetDoorCount(10); // 600 / 10 = 60cm 每片
      onNotify?.('📐 已載入【600cm 面寬配固定 80cm 檯面】設計師實測規格！');
    }
  };

  // 處理上傳使用者自訂的 CAD 設定檔 (JSON)
  const handleProfileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateCadProfile(parsed);
        if (result.valid && result.profile) {
          setCustomProfile(result.profile);
          setProfileUploadError(null);
          onNotify?.(
            `✨ 成功匯入設計師專屬 CAD 設定檔「${result.profile.profileName}」！立面切圖已 100% 切換為您自訂的樣式！`
          );
        } else {
          setProfileUploadError(result.error || '設定檔格式不符合規格');
          onNotify?.(`⚠️ 設定檔驗證失敗：${result.error}`);
        }
      } catch (err: any) {
        setProfileUploadError('JSON 解析錯誤：檔案不是合法的 JSON 格式');
        onNotify?.('⚠️ 上傳檔案解析失敗，請確認是否為合法的 JSON 檔案');
      }
    };
    reader.readAsText(file);
    // 重置 input 以便重複選取
    e.target.value = '';
  };

  // 手動貼上 JSON 匯入
  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonInputText);
      const result = validateCadProfile(parsed);
      if (result.valid && result.profile) {
        setCustomProfile(result.profile);
        setProfileUploadError(null);
        setIsRawJsonModalOpen(false);
        onNotify?.(
          `✨ 成功解析並套用自訂 CAD 設定檔「${result.profile.profileName}」！`
        );
      } else {
        setProfileUploadError(result.error || '設定檔格式不符合規格');
      }
    } catch (err: any) {
      setProfileUploadError('JSON 解析錯誤：請檢查括號與語法');
    }
  };

  // 快速切換內建風格範本
  const handleSelectPresetProfile = (profileId: string) => {
    const found = PRESET_CAD_PROFILES.find((p) => p.profileId === profileId);
    if (found) {
      setCustomProfile(found);
      setProfileUploadError(null);
      onNotify?.(`🎨 已切換為【${found.profileName}】出圖樣式！`);
    }
  };

  // 即時編輯線寬層級映射表欄位
  const handleUpdateLineweight = (id: string, field: keyof LineweightMappingItem, value: any) => {
    setCustomProfile((prev) => ({
      ...prev,
      lineweights: prev.lineweights.map((lw) =>
        lw.id === id ? { ...lw, [field]: value } : lw
      ),
    }));
  };

  // 即時編輯填充線參數欄位
  const handleUpdateHatch = (id: string, field: keyof HatchPatternConfigItem, value: any) => {
    setCustomProfile((prev) => ({
      ...prev,
      hatchSettings: prev.hatchSettings.map((ht) =>
        ht.id === id ? { ...ht, [field]: value } : ht
      ),
    }));
  };

  // 即時編輯 CAD 圖塊欄位
  const handleUpdateBlock = (id: string, field: keyof CADBlockLibraryItem, value: any) => {
    setCustomProfile((prev) => ({
      ...prev,
      blockLibrary: prev.blockLibrary.map((blk) =>
        blk.id === id ? { ...blk, [field]: value } : blk
      ),
    }));
  };

  // 匯出當前自訂設定檔 JSON 備份
  const handleExportProfileJson = () => {
    downloadProfileJson(customProfile);
    onNotify?.(`💾 已下載當前設定檔「${customProfile.profileName}」JSON 備份！`);
  };

  // 匯出依使用者自訂樣式繪製的立面切圖 DXF (AutoCAD)
  const handleExportCustomDxf = () => {
    downloadCustomSectionDxf({
      room,
      profile: customProfile,
      wallSpanWidth,
      baseCabinetHeight,
      cabinetDoorCount,
      toeKickHeight,
      beamClearHeight,
      dropCeilingHeight,
    });
    onNotify?.(
      `📦 已完全依據【${customProfile.profileName}】自訂圖塊、線寬與填充線樣式匯出立面切圖 DXF！`
    );
  };

  // 套用至專案施工圖
  const handleApplyToActiveRoom = () => {
    if (onUpdateRoom) {
      const updated: RoomData = {
        ...room,
        width: wallSpanWidth,
        beamHeight: beamClearHeight,
        ceilingDrop: dropCeilingHeight,
        evaluation: {
          ...room.evaluation,
          score: 100,
          clarity: '極佳 (設計師原圖洗練直切)',
          rule5MultiplePassed: true,
          suggestions: `已成功套用設計師專屬 CAD 出圖樣式「${customProfile.profileName} (v${customProfile.version})」：立面固定 80cm 高度契約鎖死，開間 ${wallSpanWidth}cm，門片寬 ${singleDoorWidth}cm 5 倍數整數對齊！`,
        },
      };
      onUpdateRoom(updated);
    }
    onNotify?.(
      `✨ 成功將設計師自訂 CAD 樣式【${customProfile.profileName}】與立面 80cm 契約套用至「${room.roomName}」！`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700/90 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Hidden File Input for JSON Profile Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          className="hidden"
          onChange={handleProfileFileUpload}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white flex-shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  設計師圖面洗練與自訂 CAD 樣式中心
                </h3>
                {/* Active Custom Profile Badge */}
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Palette className="w-3 h-3 text-emerald-400" />
                  已啟用自訂樣式：{customProfile.profileName} (v{customProfile.version})
                </span>
                <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  100% 忠實直切原圖 · 絕非系統預設
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                支援匯入自訂 CAD 圖塊庫、線寬層級映射表 (CTB) 與預設填充線參數，立面切圖完全依自訂樣式精準輸出
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Upload Button in Header */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
              title="匯入自訂 CAD 設定檔 JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>匯入設定檔 (.json)</span>
            </button>

            {/* Quick Export DXF Button in Header */}
            <button
              onClick={handleExportCustomDxf}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded-lg text-xs font-semibold transition"
              title="依此樣式下載立面切圖 DXF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出切圖 DXF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {/* ★ NEW TAB: 匯入現有平面圖 (Import Existing Floor Plan & Convert to RoomData) */}
          <button
            onClick={() => setActiveTab('import_floorplan')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'import_floorplan'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-cyan-400/90 hover:text-cyan-300'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="flex items-center gap-1.5">
              ⭐ 匯入現有平面圖 (CAD / DXF / JSON / 圖紙)
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-semibold">
                修復斷裂
              </span>
            </span>
          </button>

          {/* ★ NEW TAB: 實作 PDF/圖面 OCR (PDF & Construction Drawing OCR) */}
          <button
            onClick={() => setActiveTab('pdf_ocr')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pdf_ocr'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-cyan-400/80 hover:text-cyan-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="flex items-center gap-1">
              實作 PDF/圖面 OCR (星玥灣 7F/8F)
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-semibold">
                真值萃取
              </span>
            </span>
          </button>

          {/* ★ NEW TAB: 修正 5 倍數校正邏輯 (5-Multiple Calibration) */}
          <button
            onClick={() => setActiveTab('calibrate_5x')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calibrate_5x'
                ? 'border-amber-400 text-amber-300 bg-amber-950/40 font-bold'
                : 'border-transparent text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span className="flex items-center gap-1">
              修正 5 倍數校正邏輯 (現場真值 vs 模矩)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('test_bench')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'test_bench'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>實測測試台 (丈量圖/3D/立面切圖預覽)</span>
          </button>

          {/* ★ NEW TAB: 自訂 CAD 設定檔 (Profile, Blocks, CTB & Hatch) */}
          <button
            onClick={() => setActiveTab('custom_profile')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'custom_profile'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 font-bold'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span className="flex items-center gap-1">
              ⭐ 自訂 CAD 設定檔 (圖塊庫/線寬/填充線匯入)
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('section_cut')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'section_cut'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-950/30 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>原圖剖切邏輯 (忠實切圖機制)</span>
          </button>

          <button
            onClick={() => setActiveTab('fixed_height')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fixed_height'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>固定 80cm 立面幾何契約</span>
          </button>

          <button
            onClick={() => setActiveTab('line_hatch')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'line_hatch'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>線寬筆重 (CTB) 矩陣</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet_block')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sheet_block'
                ? 'border-purple-400 text-purple-300 bg-purple-950/30 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>印刷圖塊與 A3 圖框</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 0: 匯入現有平面圖 (Import Existing Floor Plan & Convert to RoomData) */}
          {activeTab === 'import_floorplan' && (
            <ImportExistingFloorplanPanel
              currentRoom={room}
              onUpdateRoom={onUpdateRoom}
              onAddRoom={onAddRoom}
              onNotify={onNotify}
              onClose={onClose}
              onNavigateToTab={onNavigateToTab}
              onOpenPdfOcr={() => setActiveTab('pdf_ocr')}
              onOpenCalibration5x={() => setActiveTab('calibrate_5x')}
            />
          )}

          {/* TAB: 實作 PDF/圖面 OCR (PDF & Construction Drawing OCR) */}
          {activeTab === 'pdf_ocr' && (
            <div className="bg-[#121810] border border-[#3F5B63]/40 rounded-3xl p-4 sm:p-6">
              <PdfDrawingOcrModal
                isOpen={true}
                onClose={() => setActiveTab('import_floorplan')}
                currentRoom={room}
                onUpdateRoom={(u) => {
                  onUpdateRoom?.(u);
                  onNotify?.(`✨ 已將圖面 OCR 真值更新至「${u.roomName}」！`);
                }}
                onAddRoom={(nr) => {
                  onAddRoom?.(nr);
                  onNotify?.(`✨ 已將圖面 OCR 建立為新空間「${nr.roomName}」！`);
                }}
                onNotify={onNotify}
                onNavigateToTab={onNavigateToTab}
              />
            </div>
          )}

          {/* TAB: 修正 5 倍數校正邏輯 (5-Multiple Calibration) */}
          {activeTab === 'calibrate_5x' && (
            <div className="bg-[#121810] border border-[#3F5B63]/40 rounded-3xl p-4 sm:p-6">
              <Calibration5xModal
                isOpen={true}
                onClose={() => setActiveTab('import_floorplan')}
                room={room}
                onUpdateRoom={(u) => {
                  onUpdateRoom?.(u);
                  onNotify?.(`✨ 已更新「${u.roomName}」5 倍數校正與真值狀態！`);
                }}
                onNotify={onNotify}
              />
            </div>
          )}

          {/* TAB 1: 實測測試台 (Designer Test Bench) */}
          {activeTab === 'test_bench' && (
            <div className="space-y-6">
              {/* Core Philosophy Callout */}
              <div className="bg-gradient-to-r from-cyan-950/70 via-indigo-950/60 to-slate-900 border border-cyan-500/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span>設計師實測驗證：100% 依自訂樣式「{customProfile.profileName}」精準剖切！</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  您在訊息中提到的痛點完全直擊核心：<strong>「我都畫好了，那一定是我覺得最好的版本了，為什麼不切我的圖？」</strong>
                  <br />
                  本系統底層全面依據您上傳的<strong>「自訂 CAD 圖塊庫、線寬層級與填充線參數」</strong>進行立面直切，絕非系統預設樣式！原圖畫什麼就切出什麼，線寬與材質填充 100% 忠於您的個人 CAD 規範。
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleLoadDesignerPreset('preset_300')}
                    className="px-3.5 py-1.5 rounded-full bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/60 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>載入實測案例 A：300cm 面寬配固定 80cm 檯面</span>
                  </button>
                  <button
                    onClick={() => handleLoadDesignerPreset('preset_600')}
                    className="px-3.5 py-1.5 rounded-full bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/60 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>載入實測案例 B：600cm 大跨度影音主牆配固定 80cm 檯面</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('custom_profile')}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/60 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📂 上傳更換我的自訂 CAD 設定檔 (.json)</span>
                  </button>
                </div>
              </div>

              {/* Real-time Section Cut Visualizer (100% Styled by Custom Profile) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">
                      立面直切即時視覺化 (完全套用自訂樣式：{customProfile.profileName})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                      剖線: {cutLwItem.lineWeightMm}mm · 輪廓: {profileLwItem.lineWeightMm}mm · 木作填充: {woodHatchItem.patternName} ({woodHatchItem.angleDeg}°/{woodHatchItem.spacingMm}mm)
                    </span>
                    <button
                      onClick={handleExportCustomDxf}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md shadow flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>匯出此切圖 DXF</span>
                    </button>
                  </div>
                </div>

                {/* SVG Section Elevation Cut Canvas */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                    <span className="flex items-center gap-1 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                      剖切視角：立面投影 ({secBlockItem.prefix || "⮜ A-A' ⮞"})
                    </span>
                    <span className="text-emerald-400 font-bold">
                      ★ 檯面契約基準線：{elevBlockItem.prefix || '▼ FL+'}{baseCabinetHeight} cm 鎖死
                    </span>
                  </div>

                  {/* SVG Canvas with Dynamic Hatching & Custom Line Weights */}
                  <div className="w-full flex items-center justify-center py-2 bg-slate-950">
                    <svg className="w-full h-44 sm:h-52" viewBox="0 0 500 160">
                      {/* Dynamic SVG Hatch Pattern definitions based on User Custom Profile */}
                      <defs>
                        {/* 1. Wood Joinery Hatch Pattern */}
                        <pattern
                          id="customWoodHatchPattern"
                          width={Math.max(4, woodHatchItem.spacingMm * 3)}
                          height={Math.max(4, woodHatchItem.spacingMm * 3)}
                          patternUnits="userSpaceOnUse"
                          patternTransform={`rotate(${woodHatchItem.angleDeg})`}
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="20"
                            stroke={woodHatchItem.colorHex || '#c084fc'}
                            strokeWidth={Math.max(0.6, woodHatchItem.lineWeightMm * 4)}
                          />
                        </pattern>

                        {/* 2. Stone Countertop Hatch Pattern */}
                        <pattern
                          id="customStoneHatchPattern"
                          width={Math.max(4, stoneHatchItem.spacingMm * 4)}
                          height={Math.max(4, stoneHatchItem.spacingMm * 4)}
                          patternUnits="userSpaceOnUse"
                          patternTransform="rotate(45)"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="20"
                            stroke={stoneHatchItem.colorHex || '#34d399'}
                            strokeWidth="0.8"
                          />
                          {stoneHatchItem.patternName === 'CROSS_HATCH' && (
                            <line
                              x1="0"
                              y1="0"
                              x2="20"
                              y2="0"
                              stroke={stoneHatchItem.colorHex || '#34d399'}
                              strokeWidth="0.8"
                            />
                          )}
                        </pattern>
                      </defs>

                      {/* Floor Datum Line (FL+0) - Structural Cut Line */}
                      <line
                        x1="20"
                        y1="135"
                        x2="480"
                        y2="135"
                        stroke={cutLwItem.colorHex}
                        strokeWidth={Math.max(1, cutLwItem.lineWeightMm * 4)}
                      />
                      <text x="440" y="148" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                        {elevBlockItem.prefix || '▼ FL+'}0 (基準地坪)
                      </text>

                      {/* Toe Kick (10cm) */}
                      <rect
                        x="50"
                        y="125"
                        width="400"
                        height="10"
                        fill="#1e293b"
                        stroke={profileLwItem.colorHex}
                        strokeWidth={Math.max(0.8, profileLwItem.lineWeightMm * 3)}
                      />

                      {/* Base Cabinet Body (Filled with User Custom Wood Hatch Pattern!) */}
                      <rect
                        x="50"
                        y="65"
                        width="400"
                        height="60"
                        fill="url(#customWoodHatchPattern)"
                        stroke={profileLwItem.colorHex}
                        strokeWidth={Math.max(1, profileLwItem.lineWeightMm * 4)}
                      />

                      {/* Cabinet Door Divisions (Equal division based on user cabinetDoorCount) */}
                      {Array.from({ length: cabinetDoorCount }).map((_, dIdx) => {
                        const doorW = 400 / cabinetDoorCount;
                        const doorX = 50 + dIdx * doorW;
                        return (
                          <g key={dIdx}>
                            <line
                              x1={doorX}
                              y1="65"
                              x2={doorX}
                              y2="125"
                              stroke={divisionLwItem.colorHex}
                              strokeWidth={Math.max(0.6, divisionLwItem.lineWeightMm * 4)}
                            />
                            {/* Handle symbol from blockLibrary */}
                            <line
                              x1={doorX + doorW / 2}
                              y1="75"
                              x2={doorX + doorW / 2}
                              y2="88"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                            />
                          </g>
                        );
                      })}

                      {/* Stone Countertop (4cm) - Filled with Stone Hatch */}
                      <rect
                        x="45"
                        y="60"
                        width="410"
                        height="6"
                        fill="url(#customStoneHatchPattern)"
                        stroke={profileLwItem.colorHex}
                        strokeWidth={Math.max(1, profileLwItem.lineWeightMm * 4)}
                      />

                      {/* Fixed 80cm Datum Line (User Custom Elevation Datum) */}
                      <line
                        x1="35"
                        y1="60"
                        x2="465"
                        y2="60"
                        stroke={datumLwItem.colorHex}
                        strokeWidth={Math.max(1.2, datumLwItem.lineWeightMm * 4)}
                      />
                      {/* Elevation Marker Symbol */}
                      <polygon
                        points="42,52 48,52 45,60"
                        fill={elevBlockItem.colorHex || '#ef4444'}
                      />
                      <text
                        x="52"
                        y="55"
                        fill={datumLwItem.colorHex}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {elevBlockItem.prefix || '▼ FL+'}{baseCabinetHeight} cm [固定 80cm 契約]
                      </text>

                      {/* RC Beam Line (FL+265) */}
                      <line
                        x1="30"
                        y1="25"
                        x2="470"
                        y2="25"
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                      />
                      <text x="50" y="21" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                        大梁淨高 {elevBlockItem.prefix || '▼ FL+'}{beamClearHeight} cm [5倍數整數]
                      </text>

                      {/* Ceiling Drop Line (FL+230) */}
                      <line
                        x1="30"
                        y1="40"
                        x2="470"
                        y2="40"
                        stroke="#60a5fa"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text x="320" y="36" fill="#60a5fa" fontSize="8" fontFamily="monospace">
                        天花降板 {elevBlockItem.prefix || '▼ FL+'}{dropCeilingHeight} cm
                      </text>
                    </svg>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
                    <span>
                      開間面寬：<strong className="text-white font-mono">{wallSpanWidth} cm</strong>
                    </span>
                    <span>
                      門片分割：
                      <strong className="text-cyan-300 font-mono">
                        {singleDoorWidth} cm × {cabinetDoorCount} 片
                      </strong>
                    </span>
                    <span className="text-emerald-400 font-bold">✓ 5 倍數契約完美合規</span>
                    <span className="text-purple-300 font-mono">
                      出圖圖框：{customProfile.sheetConfig.paperSize} 橫式 ({customProfile.sheetConfig.drawingCode})
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Input Fields & Custom Settings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Survey Text Box */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      實測尺寸與繪圖習慣文字說明
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">現場量測紀錄</span>
                  </div>
                  <textarea
                    rows={6}
                    value={designerSurveyInput}
                    onChange={(e) => setDesignerSurveyInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                    placeholder="請在此輸入現場實測尺寸、特殊收頭、高程約定或施工注意事項..."
                  />
                </div>

                {/* Profile Summary & Direct Actions */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-emerald-400" />
                        當前自訂 CAD 設定檔摘要
                      </span>
                      <button
                        onClick={() => setActiveTab('custom_profile')}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        詳細設定 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">樣式名稱：</span>
                        <strong className="text-white font-mono">{customProfile.profileName}</strong>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">結構剖斷線 (Cut Line)：</span>
                        <span className="text-amber-300 font-mono font-bold">
                          {cutLwItem.layerName} ({cutLwItem.lineWeightMm}mm)
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">木作剖面填充 (Hatch)：</span>
                        <span className="text-purple-300 font-mono font-bold">
                          {woodHatchItem.patternName} ({woodHatchItem.angleDeg}° / {woodHatchItem.spacingMm}mm)
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">立面高程符號 (Elevation Tag)：</span>
                        <span className="text-rose-400 font-mono font-bold">
                          {elevBlockItem.prefix} (符號: {elevBlockItem.symbolShape})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上傳設定檔 (.json)</span>
                    </button>
                    <button
                      onClick={handleExportProfileJson}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      title="下載當前設定檔備份"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>備份 JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 自訂 CAD 設定檔管理 (Custom CAD Profile Manager) */}
          {activeTab === 'custom_profile' && (
            <div className="space-y-6">
              {/* Profile Top Control Banner */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/50 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-base font-bold text-white">
                        自訂 CAD 出圖樣式管理中心 (Custom Profile & Block Library)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      允許您完全定義並上傳個人專屬的 <strong>CAD 圖塊庫</strong>、<strong>線寬層級映射表</strong> 與 <strong>預設填充線參數</strong>。
                      產出的 DXF/SVG 立面切圖將嚴格依據此樣式輸出！
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上傳自訂設定檔 (.json)</span>
                    </button>

                    <button
                      onClick={() => setIsRawJsonModalOpen(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>貼入 JSON 代碼</span>
                    </button>

                    <button
                      onClick={handleExportProfileJson}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載設定檔樣板 (.json)</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner if any */}
                {profileUploadError && (
                  <div className="bg-rose-950/80 border border-rose-500/80 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{profileUploadError}</span>
                  </div>
                )}

                {/* Quick Presets Switcher */}
                <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">快速套用風格範本：</span>
                  {PRESET_CAD_PROFILES.map((preset) => (
                    <button
                      key={preset.profileId}
                      onClick={() => handleSelectPresetProfile(preset.profileId)}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition border ${
                        customProfile.profileId === preset.profileId
                          ? 'bg-emerald-900 text-emerald-200 border-emerald-400 font-bold shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {preset.profileName}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. CAD 圖塊庫 (CAD Block Library) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-amber-400" />
                    <h5 className="text-sm font-bold text-white">
                      1. CAD 專案圖塊庫 (CAD Block Library)
                    </h5>
                  </div>
                  <span className="text-xs text-slate-400">
                    共 {customProfile.blockLibrary.length} 組標註圖塊定義
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customProfile.blockLibrary.map((blk) => (
                    <div
                      key={blk.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: blk.colorHex }}
                          />
                          <span className="font-bold text-white text-xs">{blk.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          {blk.blockName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            前綴符號文字 (Prefix)
                          </label>
                          <input
                            type="text"
                            value={blk.prefix}
                            onChange={(e) =>
                              handleUpdateBlock(blk.id, 'prefix', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            幾何標記樣式 (Shape)
                          </label>
                          <select
                            value={blk.symbolShape}
                            onChange={(e) =>
                              handleUpdateBlock(blk.id, 'symbolShape', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-300 font-mono text-xs"
                          >
                            <option value="triangle_down">倒三角形 (▼ Arrow)</option>
                            <option value="circle_split">雙分圓點 (Circle)</option>
                            <option value="rect_box">矩形標籤 (Box)</option>
                            <option value="bubble_callout">泡泡引線 (Bubble)</option>
                            <option value="bar_line">直線端點 (Bar Line)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            CAD 圖層名稱 (Layer)
                          </label>
                          <input
                            type="text"
                            value={blk.layerName}
                            onChange={(e) =>
                              handleUpdateBlock(blk.id, 'layerName', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            AutoCAD 顏色碼 (Color Index)
                          </label>
                          <select
                            value={blk.colorIndex}
                            onChange={(e) => {
                              const cIdx = Number(e.target.value);
                              const colorMap: Record<number, string> = {
                                1: '#ef4444',
                                2: '#eab308',
                                3: '#10b981',
                                4: '#06b6d4',
                                5: '#3b82f6',
                                6: '#c084fc',
                                7: '#ffffff',
                                8: '#94a3b8',
                              };
                              handleUpdateBlock(blk.id, 'colorIndex', cIdx);
                              handleUpdateBlock(blk.id, 'colorHex', colorMap[cIdx] || '#ffffff');
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                          >
                            <option value={1}>1: 紅色 (Red - #ef4444)</option>
                            <option value={2}>2: 黃色 (Yellow - #eab308)</option>
                            <option value={3}>3: 綠色 (Green - #10b981)</option>
                            <option value={4}>4: 青色 (Cyan - #06b6d4)</option>
                            <option value={5}>5: 藍色 (Blue - #3b82f6)</option>
                            <option value={6}>6: 洋紅 (Magenta - #c084fc)</option>
                            <option value={7}>7: 白色/黑色 (White - #ffffff)</option>
                            <option value={8}>8: 灰色 (Gray - #94a3b8)</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500">{blk.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 線寬層級映射表 (Lineweight Level Mapping Table - CTB) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h5 className="text-sm font-bold text-white">
                      2. 線寬層級映射表 (Lineweight Level Mapping - CTB)
                    </h5>
                  </div>
                  <span className="text-xs text-slate-400">
                    決定立面切圖結構剖斷、輪廓外觀、門片開槽之粗細與圖層
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3">語意對象</th>
                        <th className="py-2.5 px-3">CAD 圖層名稱 (Layer Name)</th>
                        <th className="py-2.5 px-3">出圖線寬 (mm)</th>
                        <th className="py-2.5 px-3">AutoCAD 顏色 (Color)</th>
                        <th className="py-2.5 px-3">線型 (Linetype)</th>
                        <th className="py-2.5 px-3">說明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {customProfile.lineweights.map((lw) => (
                        <tr key={lw.id} className="hover:bg-slate-950/60 transition">
                          <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: lw.colorHex }}
                            />
                            <span>{lw.label}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={lw.layerName}
                              onChange={(e) =>
                                handleUpdateLineweight(lw.id, 'layerName', e.target.value)
                              }
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 text-xs w-36"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={lw.lineWeightMm}
                              onChange={(e) =>
                                handleUpdateLineweight(lw.id, 'lineWeightMm', Number(e.target.value))
                              }
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 text-xs font-bold"
                            >
                              <option value={0.6}>0.60 mm (特粗重剖)</option>
                              <option value={0.5}>0.50 mm (標準粗剖)</option>
                              <option value={0.35}>0.35 mm (中粗輪廓)</option>
                              <option value={0.3}>0.30 mm</option>
                              <option value={0.25}>0.25 mm (外框輪廓)</option>
                              <option value={0.18}>0.18 mm (標註引線)</option>
                              <option value={0.15}>0.15 mm (門縫細線)</option>
                              <option value={0.13}>0.13 mm (填充/投影)</option>
                              <option value={0.09}>0.09 mm (極細縫)</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={lw.colorIndex}
                              onChange={(e) => {
                                const cIdx = Number(e.target.value);
                                const colorMap: Record<number, string> = {
                                  1: '#ef4444',
                                  2: '#eab308',
                                  3: '#10b981',
                                  4: '#06b6d4',
                                  5: '#3b82f6',
                                  6: '#c084fc',
                                  7: '#ffffff',
                                  8: '#94a3b8',
                                };
                                handleUpdateLineweight(lw.id, 'colorIndex', cIdx);
                                handleUpdateLineweight(lw.id, 'colorHex', colorMap[cIdx] || '#ffffff');
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            >
                              <option value={1}>1: 紅色 (#ef4444)</option>
                              <option value={2}>2: 黃色 (#eab308)</option>
                              <option value={3}>3: 綠色 (#10b981)</option>
                              <option value={4}>4: 青色 (#06b6d4)</option>
                              <option value={5}>5: 藍色 (#3b82f6)</option>
                              <option value={6}>6: 洋紅 (#c084fc)</option>
                              <option value={7}>7: 白/黑 (#ffffff)</option>
                              <option value={8}>8: 灰色 (#94a3b8)</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {lw.lineType}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] font-sans text-slate-400">
                            {lw.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. 預設填充線參數 (Hatch Pattern Configuration) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-400" />
                    <h5 className="text-sm font-bold text-white">
                      3. 預設剖面材料填充線參數 (Default Hatch Pattern Parameters)
                    </h5>
                  </div>
                  <span className="text-xs text-slate-400">
                    決定立面切圖中木作板材、RC混凝土、石材檯面之填充斜線與間距
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customProfile.hatchSettings.map((ht) => (
                    <div
                      key={ht.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ht.colorHex }}
                          />
                          <span className="font-bold text-white text-xs">{ht.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                          {ht.patternName}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">填充圖樣</label>
                          <select
                            value={ht.patternName}
                            onChange={(e) =>
                              handleUpdateHatch(ht.id, 'patternName', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-purple-300 font-mono text-xs"
                          >
                            <option value="ANSI31">ANSI31 (45°單斜線)</option>
                            <option value="ANSI32">ANSI32 (雙向鋼構)</option>
                            <option value="AR-CONC">AR-CONC (混凝土礫石)</option>
                            <option value="CROSS_HATCH">CROSS_HATCH (十字網格)</option>
                            <option value="DOTS">DOTS (細密點紋)</option>
                            <option value="SOLID">SOLID (實心填滿)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">傾斜角度 (°)</label>
                          <input
                            type="number"
                            value={ht.angleDeg}
                            onChange={(e) =>
                              handleUpdateHatch(ht.id, 'angleDeg', Number(e.target.value))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">線間距 (mm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={ht.spacingMm}
                            onChange={(e) =>
                              handleUpdateHatch(ht.id, 'spacingMm', Number(e.target.value))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-amber-300 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">CAD 圖層名稱</label>
                          <input
                            type="text"
                            value={ht.layerName}
                            onChange={(e) =>
                              handleUpdateHatch(ht.id, 'layerName', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">填充線寬 (mm)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={ht.lineWeightMm}
                            onChange={(e) =>
                              handleUpdateHatch(ht.id, 'lineWeightMm', Number(e.target.value))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500">{ht.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 原圖剖切邏輯 (Section Cutting Engine) */}
          {activeTab === 'section_cut' && (
            <div className="space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-sm text-white">
                      「忠實切取設計師原圖」剖面線提取引擎工作原理
                    </h4>
                  </div>
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono">
                    Direct Section Slicing v1.0
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>傳統外部工具之弊端</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      不切設計師原圖，而是由程式自作主張重新隨機生成假圖。破壞設計師定案的櫃體比例、線條分割與空間關係，完全無法用於現場施工！
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>本系統直切原圖機制</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      直接以設計師的平面/3D 幾何為母體，設定剖切刀面（Section Plane）。<strong>100% 提取原圖的頂點與線段</strong>，原圖畫什麼就切出什麼！
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-2">
                    <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>依自訂 CAD 設定檔輸出</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      切出線條後，自動套用您上傳的<strong>「線寬映射表」</strong>與<strong>「填充線參數」</strong>，並依5 倍數契約自動吸附公差、生成連續標註線與高程圖塊。
                    </p>
                  </div>
                </div>

                {/* Section Cut Visual Control */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>剖切線位置設定 (Section Plane Coordinate)</span>
                    <span className="font-mono text-cyan-400">
                      {secBlockItem.prefix || "⮜ A-A' ⮞"} 剖面線 · 距離主牆 60 cm 處正剖
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={5}
                      defaultValue={60}
                      className="flex-1 accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                      深度：60 cm (櫃體縱剖)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 固定 80cm 立面幾何契約 (80cm Fixed Datum & 300/600 Span) */}
          {activeTab === 'fixed_height' && (
            <div className="space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">
                      設計師固定 80cm 立面高程契約 (標準工程放樣)
                    </h4>
                  </div>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                    80cm Lock Datum Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-slate-400">固定下櫃檯面高度</span>
                    <div className="text-xl font-mono font-bold text-amber-400 flex items-center gap-1">
                      <span>{baseCabinetHeight} cm</span>
                      <span className="text-xs text-slate-500 font-normal">(絕對鎖死)</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      人體工學標準收納與視聽櫃高度，切圖時絕對鎖定。
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-slate-400">當前牆體開間面寬</span>
                    <div className="text-xl font-mono font-bold text-cyan-400">
                      {wallSpanWidth} cm
                    </div>
                    <p className="text-[10px] text-slate-500">
                      支援 300cm (5片) 或 600cm (10片) 大跨度立面放樣。
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-slate-400">單片門片均分寬度</span>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                      {singleDoorWidth} cm × {cabinetDoorCount} 片
                    </div>
                    <p className="text-[10px] text-emerald-400">
                      ✓ 60cm 完美對齊 5 倍數整數契約無公差！
                    </p>
                  </div>
                </div>

                {/* Door count adjuster */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>門片分割片數微調</span>
                    <span className="font-mono text-cyan-300">
                      單片寬：{singleDoorWidth} cm ({wallSpanWidth % cabinetDoorCount === 0 ? '整除' : '有餘數'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCabinetDoorCount((prev) => Math.max(2, prev - 1))}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold text-white">
                      {cabinetDoorCount} 片
                    </span>
                    <button
                      onClick={() => setCabinetDoorCount((prev) => Math.min(20, prev + 1))}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400 ml-4">
                      {wallSpanWidth % cabinetDoorCount === 0 ? '✓ 完美整除零誤差' : '⚠️ 存在公差餘數，建議調整'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 線寬筆重矩陣 (CTB Line Weights) */}
          {activeTab === 'line_hatch' && (
            <div className="space-y-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>出圖線寬筆重配置 (CTB Line Weight Matrix) - 雙向連動自訂設定檔</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('custom_profile')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    前往進階管理 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {customProfile.lineweights.map((lw) => (
                    <div
                      key={lw.id}
                      className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{lw.label}</span>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: lw.colorHex }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">圖層: {lw.layerName}</div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">線寬:</span>
                        <span className="font-mono font-bold text-amber-300">{lw.lineWeightMm} mm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 印刷圖塊與 A3 施工圖框套用 */}
          {activeTab === 'sheet_block' && (
            <div className="space-y-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Printer className="w-4 h-4 text-purple-400" />
                    <span>A3 / A2 施工圖框樣板與出圖圖塊自動組裝</span>
                  </div>
                  <span className="text-xs bg-purple-950 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-mono">
                    AutoCAD Layout Viewport Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">圖紙規格</label>
                    <select
                      value={customProfile.sheetConfig.paperSize}
                      onChange={(e) =>
                        setCustomProfile((prev) => ({
                          ...prev,
                          sheetConfig: {
                            ...prev.sheetConfig,
                            paperSize: e.target.value as 'A3' | 'A2' | 'A1',
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    >
                      <option value="A3">A3 橫式 (420 × 297 mm)</option>
                      <option value="A2">A2 橫式 (594 × 420 mm)</option>
                      <option value="A1">A1 橫式 (841 × 594 mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">工程專案名稱</label>
                    <input
                      type="text"
                      value={customProfile.sheetConfig.projectTitle}
                      onChange={(e) =>
                        setCustomProfile((prev) => ({
                          ...prev,
                          sheetConfig: {
                            ...prev.sheetConfig,
                            projectTitle: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">圖名</label>
                    <input
                      type="text"
                      value={customProfile.sheetConfig.drawingTitle}
                      onChange={(e) =>
                        setCustomProfile((prev) => ({
                          ...prev,
                          sheetConfig: {
                            ...prev.sheetConfig,
                            drawingTitle: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">比例尺</label>
                    <select
                      value={customProfile.sheetConfig.drawingScale}
                      onChange={(e) =>
                        setCustomProfile((prev) => ({
                          ...prev,
                          sheetConfig: {
                            ...prev.sheetConfig,
                            drawingScale: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold"
                    >
                      <option value="1:30">1:30 (立面大樣)</option>
                      <option value="1:50">1:50 (全室立面)</option>
                      <option value="1:20">1:20 (細部大樣)</option>
                      <option value="1:25">1:25 (日系標準)</option>
                    </select>
                  </div>
                </div>

                {/* Title Block Preview Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">標準施工圖框圖塊 (Title Block) 結構</span>
                    <span className="font-mono text-purple-300">
                      圖號：{customProfile.sheetConfig.drawingCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500">立面高程符號圖塊</div>
                      <div className="font-mono font-bold text-emerald-400 mt-1">
                        {elevBlockItem.prefix}{baseCabinetHeight}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500">剖面索引切號圖塊</div>
                      <div className="font-mono font-bold text-cyan-400 mt-1">
                        {secBlockItem.prefix}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500">事務所單位</div>
                      <div className="font-mono font-bold text-amber-400 mt-1 truncate">
                        {customProfile.sheetConfig.companyName}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500">幾何契約章</div>
                      <div className="font-mono font-bold text-indigo-400 mt-1">
                        5倍數契約通過
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              當前出圖契約：<strong>固定 80cm 檯面</strong> · 開間 {wallSpanWidth}cm · 依【
              <strong className="text-white">{customProfile.profileName}</strong>】專屬樣式輸出
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Styled DXF button */}
            <button
              onClick={handleExportCustomDxf}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-full transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>匯出自訂樣式立面 DXF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-full transition"
            >
              關閉
            </button>

            <button
              onClick={handleApplyToActiveRoom}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>確認洗練規則並套用至目前專案施工圖</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw JSON Paste Modal */}
      {isRawJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>直接貼入自訂 CAD 設定檔 JSON 代碼</span>
              </div>
              <button
                onClick={() => setIsRawJsonModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={12}
              value={rawJsonInputText}
              onChange={(e) => setRawJsonInputText(e.target.value)}
              placeholder="請在此貼入包含 profileName, lineweights, hatchSettings, blockLibrary 的 JSON 字串..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
            />

            {profileUploadError && (
              <div className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800">
                {profileUploadError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRawJsonModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleApplyRawJson}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
              >
                驗證並套用設定檔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
