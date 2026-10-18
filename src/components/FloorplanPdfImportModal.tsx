import React, { useState } from 'react';
import { RoomData, Door, WindowOpening, Beam, Column } from '../types';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Ruler,
  Maximize2,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  Check,
  Eye,
  Info,
  X,
  FileCheck,
  Building
} from 'lucide-react';
import { getWallThickness, updateWallConfig } from '../utils/wallUtils';

interface SegmentedAreaDraft {
  id: string;
  name: string;
  category: 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'foyer' | 'balcony' | 'study';
  width: number; // cm
  length: number; // cm
  height: number; // cm
  wallThickness: number; // cm, 預設 10cm (丈量標準)
  exteriorWalls: ('north' | 'south' | 'east' | 'west')[];
  doorsCount: number;
  windowsCount: number;
  beamsCount: number;
  columnsCount: number;
  // 現場待確認/複核項目特別跳出
  auditChecklist: {
    item: string;
    description: string;
    status: 'needs_audit' | 'confirmed';
    category: 'height' | 'mep' | 'recessed' | 'wall';
  }[];
}

interface FloorplanPdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRooms: (rooms: RoomData[], projectName?: string) => void;
  onNotify: (msg: string) => void;
}

export const FloorplanPdfImportModal: React.FC<FloorplanPdfImportModalProps> = ({
  isOpen,
  onClose,
  onImportRooms,
  onNotify,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('建商A棟8F標準層全戶平面配置圖.pdf');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'cad'>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'scale' | 'segmented_review'>('segmented_review');

  // 比例尺設定 (依照圖面上的比例)
  const [scalePreset, setScalePreset] = useState<'1:100' | '1:50' | '1:75' | 'custom'>('1:100');
  const [knownReferenceDimension, setKnownReferenceDimension] = useState<number>(480); // cm 已知客廳面寬
  const [customRatio, setCustomRatio] = useState<number>(1.0); // 縮放係數

  // 解析切割出的全戶空間區域
  const [detectedAreas, setDetectedAreas] = useState<SegmentedAreaDraft[]>([
    {
      id: 'area_living',
      name: '客餐廳大公領域',
      category: 'living',
      width: 520,
      length: 440,
      height: 295,
      wallThickness: 10,
      exteriorWalls: ['north'],
      doorsCount: 2,
      windowsCount: 1,
      beamsCount: 2,
      columnsCount: 1,
      auditChecklist: [
        {
          item: '客餐廳橫跨大樑底淨高複核',
          description: '建商圖面顯示跨距 520cm 存在結構主樑，圖面無高程標記，需現場雷射實測梁底離地淨高 (預估 265cm)。',
          status: 'needs_audit',
          category: 'height',
        },
        {
          item: '吊隱冷氣冷媒穿樑孔與排水高度',
          description: '確認建商預留穿樑套管與排水口下緣離地完成面高度 (建議 210~240cm)。',
          status: 'needs_audit',
          category: 'mep',
        },
      ],
    },
    {
      id: 'area_master_bed',
      name: '景觀大主臥房',
      category: 'bedroom',
      width: 420,
      length: 360,
      height: 295,
      wallThickness: 10,
      exteriorWalls: ['north', 'east'],
      doorsCount: 1,
      windowsCount: 1,
      beamsCount: 1,
      columnsCount: 1,
      auditChecklist: [
        {
          item: '更衣區與客衛置入穿插凹損深度',
          description: '主臥床區與衛浴共壁有內縮凹凸結構，需現場複測內凹缺口進深 (預估 120cm)。',
          status: 'needs_audit',
          category: 'recessed',
        },
        {
          item: '外牆厚度 15cm 複查',
          description: '北面與東面鄰接建築外牆，圖面繪製厚度為 15cm，需現場複核實測。',
          status: 'needs_audit',
          category: 'wall',
        },
      ],
    },
    {
      id: 'area_bed2',
      name: '陽光次臥房',
      category: 'bedroom',
      width: 320,
      length: 300,
      height: 295,
      wallThickness: 10,
      exteriorWalls: ['east'],
      doorsCount: 1,
      windowsCount: 1,
      beamsCount: 1,
      columnsCount: 0,
      auditChecklist: [
        {
          item: '窗台離地台度實測',
          description: '建商標記氣密窗，需現場確認窗台離地台度（一般為 85~90cm）。',
          status: 'needs_audit',
          category: 'height',
        },
      ],
    },
    {
      id: 'area_kitchen',
      name: '獨立中島廚房',
      category: 'kitchen',
      width: 260,
      length: 290,
      height: 295,
      wallThickness: 10,
      exteriorWalls: ['south'],
      doorsCount: 1,
      windowsCount: 0,
      beamsCount: 0,
      columnsCount: 0,
      auditChecklist: [
        {
          item: '排煙管道間尺寸與吊頂降板',
          description: '廚房排油煙孔出牆位置與消防灑水頭高度需至現場實核。',
          status: 'needs_audit',
          category: 'mep',
        },
      ],
    },
    {
      id: 'area_master_bath',
      name: '主套房景觀衛浴',
      category: 'bathroom',
      width: 220,
      length: 260,
      height: 285,
      wallThickness: 10,
      exteriorWalls: ['east'],
      doorsCount: 1,
      windowsCount: 1,
      beamsCount: 0,
      columnsCount: 0,
      auditChecklist: [
        {
          item: '衛浴降板區施作淨高',
          description: '衛浴天花通常需配合排風暖風機與冷熱水管，建議降板淨高實測 215~220cm。',
          status: 'needs_audit',
          category: 'height',
        },
      ],
    },
    {
      id: 'area_guest_bath',
      name: '客用乾濕分離衛浴',
      category: 'bathroom',
      width: 180,
      length: 210,
      height: 285,
      wallThickness: 10,
      exteriorWalls: [],
      doorsCount: 1,
      windowsCount: 0,
      beamsCount: 0,
      columnsCount: 0,
      auditChecklist: [
        {
          item: '穿插置入牆體位置複測',
          description: '此衛浴置入於主臥與走道之間，請現場核對門動線與給排水孔洞。',
          status: 'needs_audit',
          category: 'recessed',
        },
      ],
    },
  ]);

  if (!isOpen) return null;

  // 模擬上傳與重新解析
  const handleSimulateFileUpload = (fileName: string, type: 'pdf' | 'image' | 'cad') => {
    setSelectedFileName(fileName);
    setFileType(type);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('segmented_review');
      onNotify(`✓ 已成功完成「${fileName}」圖面影像特徵與空間切分解析！`);
    }, 700);
  };

  // 切換待確認項目狀態
  const handleToggleAuditStatus = (areaId: string, index: number) => {
    setDetectedAreas((prev) =>
      prev.map((a) => {
        if (a.id !== areaId) return a;
        const updatedList = [...a.auditChecklist];
        updatedList[index].status =
          updatedList[index].status === 'needs_audit' ? 'confirmed' : 'needs_audit';
        return { ...a, auditChecklist: updatedList };
      })
    );
  };

  // 更新切割區域長寬尺寸
  const handleUpdateAreaDim = (areaId: string, w: number, l: number) => {
    setDetectedAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, width: Math.max(50, w), length: Math.max(50, l) } : a))
    );
  };

  // 執行轉換：將所有切割出來的區域轉為完整 RoomData，並帶入系統
  const handleConfirmAndImportToSurvey = () => {
    const finalRooms: RoomData[] = detectedAreas.map((area, idx) => {
      const roomId = `room_imported_${Date.now()}_${idx}`;

      // 建立門洞
      const doors: Door[] = [];
      if (area.doorsCount > 0) {
        doors.push({
          id: `door_${roomId}_1`,
          name: `${area.name} 出入口門洞`,
          width: 90,
          height: 210,
          wall: 'bottom',
          offset: 40,
          anchorTag: String.fromCharCode(65 + idx), // A, B, C...
        });
      }

      // 建立窗戶
      const windows: WindowOpening[] = [];
      if (area.windowsCount > 0) {
        windows.push({
          id: `win_${roomId}_1`,
          name: `${area.name} 採光景觀窗`,
          width: 160,
          height: 140,
          sillHeight: area.category === 'bathroom' ? 120 : 85,
          wall: 'top',
          offset: 50,
        });
      }

      // 建立結構梁
      const beams: Beam[] = [];
      if (area.beamsCount > 0) {
        beams.push({
          id: `beam_${roomId}_1`,
          name: `結構橫梁 B${idx + 1}`,
          width: 35,
          depth: 50,
          clearHeight: 265,
          orientation: 'horizontal',
          y: 80,
        });
      }

      // 建立柱體 (若有)
      const columns: Column[] = [];
      if (area.columnsCount > 0) {
        columns.push({
          id: `col_${roomId}_1`,
          name: `C${idx + 1} 結構柱`,
          width: 50,
          depth: 50,
          positionType: 'corner',
          corner: 'top-left',
        });
      }

      // 凹凸缺角：如果此空間是主臥房，預設帶入置入衛浴缺角
      const recessedCutouts =
        area.id === 'area_master_bed'
          ? [
              {
                id: `cut_${roomId}_1`,
                name: '穿插客用衛浴置入凹槽',
                wall: 'east' as const,
                offset: 60,
                width: 180,
                depth: 120,
                targetRoomName: '客用衛浴',
              },
            ]
          : [];

      // 外牆 vs 內隔間牆厚設定 (外牆 15cm，內牆 10cm)
      let roomObj: RoomData = {
        id: roomId,
        roomName: area.name,
        width: area.width,
        length: area.length,
        height: area.height,
        ceilingDrop: 230,
        beamHeight: 265,
        bathKitchenDrop: area.category === 'bathroom' || area.category === 'kitchen' ? 215 : 230,
        wallThickness: 10, // 丈量階段統一預設 10cm
        sprinklerHeight: 255,
        acDrainHeight: 210,
        refrigerantHoleHeight: 240,
        doors,
        windows,
        beams,
        columns,
        recessedCutouts,
        voiceMemos: [],
        electricalPoints: [],
        lastUpdated: new Date().toISOString(),
      };

      // 依據偵測到的外牆設定 15cm
      area.exteriorWalls.forEach((extWall) => {
        roomObj = updateWallConfig(roomObj, extWall, 'exterior', 15);
      });

      return roomObj;
    });

    onImportRooms(finalRooms, selectedFileName.replace(/\.[^/.]+$/, ''));
    onNotify(`✓ 已成功將建商圖檔 ${detectedAreas.length} 個切分空間全數載入！各空間皆保留尺寸調整、梁柱與外牆選項。`);
    onClose();
  };

  const totalAuditItems = detectedAreas.reduce((acc, a) => acc + a.auditChecklist.length, 0);
  const pendingAuditItems = detectedAreas.reduce(
    (acc, a) => acc + a.auditChecklist.filter((i) => i.status === 'needs_audit').length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-[#101712] border border-[#3F5B63]/60 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* 頂部標題列 */}
        <div className="p-4 md:p-5 border-b border-[#3F5B63]/40 bg-[#0c130e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#F8F8F6]">
                  建商平面配置圖 / PDF / 既有圖檔解析切割器
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  已經有圖了嗎？直接匯入
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                依照圖面比例自動切割區域，並自動額外跳出<strong>「現場需再確認/複核項目」</strong>！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心內容區 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* 1. 圖檔上傳與快捷範本選擇 */}
          <div className="bg-[#141e16] border border-[#3F5B63]/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                1. 匯入建商圖面檔案 (支援 PDF、PNG、JPG、CAD 圖面)
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                當前解析中：{selectedFileName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 拖曳上傳區 */}
              <label className="border-2 border-dashed border-[#3F5B63]/60 hover:border-amber-400/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#0d140e]/60 group">
                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-amber-400 mb-1.5 transition" />
                <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-300">
                  點擊或拖曳上傳圖檔
                </span>
                <span className="text-[10px] text-neutral-500 mt-1">
                  支援 PDF、JPG、PNG 或 DXF
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*,.dxf,.dwg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      handleSimulateFileUpload(
                        f.name,
                        f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.dxf') ? 'cad' : 'image'
                      );
                    }
                  }}
                />
              </label>

              {/* 預售屋 A棟 3房2廳2衛 標準範本 */}
              <button
                onClick={() =>
                  handleSimulateFileUpload('建商A棟8F標準層全戶平面配置圖.pdf', 'pdf')
                }
                className="p-3.5 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-[#0d140e] text-left transition hover:bg-cyan-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>🏢 建商 3房2廳2衛 全戶平面</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-900/50 px-1.5 py-0.5 rounded">PDF</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    含客餐廳、主臥、次臥、獨立廚房與雙衛浴切分
                  </p>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3 text-cyan-400" />
                  已配置標準比例尺 1:100
                </div>
              </button>

              {/* 都更成屋 2房1廳1衛 範本 */}
              <button
                onClick={() =>
                  handleSimulateFileUpload('新案成屋_2房1廳_家配放樣圖.jpg', 'image')
                }
                className="p-3.5 rounded-xl border border-emerald-500/30 hover:border-emerald-400 bg-[#0d140e] text-left transition hover:bg-emerald-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>📐 都更住宅 2房1廳 精品小豪宅</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-1.5 py-0.5 rounded">JPG</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    開放式廚房與置入式衛浴凹凸結構
                  </p>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  比例尺 1:50 高精度校準
                </div>
              </button>
            </div>
          </div>

          {/* 2. 依照圖面上的比例 (比例尺校準與換算) */}
          <div className="bg-[#141e16] border border-[#3F5B63]/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-cyan-400" />
                2. 依圖面比例尺校準 (全戶自動公分等比例換算)
              </span>
              <span className="text-[11px] text-neutral-400">
                若圖面標有比例（如 1:100），或已知某牆面長度，輸入即可全圖精確鎖定！
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* 預設比例選取 */}
              <div className="bg-[#0d140e] p-2.5 rounded-xl border border-[#3F5B63]">
                <label className="text-[11px] text-neutral-400 block mb-1">圖面標準比例</label>
                <select
                  value={scalePreset}
                  onChange={(e) => setScalePreset(e.target.value as any)}
                  className="w-full bg-[#182216] border border-cyan-500/40 rounded p-1.5 text-cyan-300 font-mono font-bold outline-none"
                >
                  <option value="1:100">1:100 (建商全戶平面最常用)</option>
                  <option value="1:50">1:50 (大比例細部放樣圖)</option>
                  <option value="1:75">1:75 (中型戶型圖)</option>
                  <option value="custom">已知尺寸對齊校正</option>
                </select>
              </div>

              {/* 已知牆面參考尺寸 */}
              <div className="bg-[#0d140e] p-2.5 rounded-xl border border-[#3F5B63]">
                <label className="text-[11px] text-neutral-400 block mb-1">
                  已知對齊尺寸 (如客廳面寬)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={knownReferenceDimension}
                    onChange={(e) => setKnownReferenceDimension(Number(e.target.value) || 480)}
                    className="w-full bg-[#182216] border border-cyan-500/40 rounded p-1.5 text-center text-white font-mono font-bold outline-none"
                  />
                  <span className="text-neutral-500 font-mono">cm</span>
                </div>
              </div>

              {/* 縮放倍率即時計算 */}
              <div className="bg-[#0d140e] p-2.5 rounded-xl border border-[#3F5B63] flex flex-col justify-between">
                <label className="text-[11px] text-neutral-400 block">像素公分換算比</label>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {scalePreset === '1:100' ? '1 px ≒ 2.50 cm' : scalePreset === '1:50' ? '1 px ≒ 1.25 cm' : '1 px ≒ 1.88 cm'}
                </div>
                <div className="text-[10px] text-emerald-400">✓ 向量刻度已精確鎖定</div>
              </div>

              {/* 丈量壁厚預設說明 */}
              <div className="bg-[#0d140e] p-2.5 rounded-xl border border-[#3F5B63] flex flex-col justify-between">
                <label className="text-[11px] text-neutral-400 block">丈量階段壁厚規範</label>
                <div className="text-xs font-bold text-white">
                  內牆統一 10cm · 外牆 15cm
                </div>
                <div className="text-[10px] text-neutral-400">各牆可獨立切換調整</div>
              </div>
            </div>
          </div>

          {/* 3. ⚠️ 現場需再確認/複核項目特別跳出清單 (用戶核心痛點：讓使用者一眼看出哪邊需要現場複量！) */}
          <div className="bg-[#1f1710] border border-amber-500/50 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-black font-black flex items-center justify-center text-sm">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    現場需再確認 / 額外跳出之實測複核清單 ({pendingAuditItems} 項待確認)
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    建商平面圖僅繪製水平二維格局，以下垂直高程、梁位淨高、凹凸畸角需現場雷射測距實查！
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                待現場確認：{pendingAuditItems} / 總項：{totalAuditItems}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {detectedAreas.flatMap((area) =>
                area.auditChecklist.map((audit, idx) => {
                  const isPending = audit.status === 'needs_audit';
                  return (
                    <div
                      key={`${area.id}_${idx}`}
                      onClick={() => handleToggleAuditStatus(area.id, idx)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        isPending
                          ? 'bg-[#181109] border-amber-500/50 hover:border-amber-400 text-neutral-200'
                          : 'bg-[#101912] border-emerald-500/40 text-neutral-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500 text-black font-bold'
                        }`}
                      >
                        {isPending ? '!' : '✓'}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 font-normal">
                              {area.name}
                            </span>
                            {audit.item}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isPending
                                ? 'bg-amber-900/60 text-amber-300'
                                : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                          >
                            {isPending ? '需現場複量' : '已確認'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                          {audit.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. 自動切割空間預覽與尺寸微調 (保留所有丈量功能) */}
          <div className="bg-[#141e16] border border-[#3F5B63]/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#3F5B63]/30 pb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                3. 已自動切分出之全戶空間清單 (共 {detectedAreas.length} 個區域 · 可直接微調長寬)
              </span>
              <span className="text-[11px] text-neutral-400">
                匯入後完整保留四面牆長寬、門窗開口、梁柱及外牆厚度設定
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {detectedAreas.map((area, idx) => {
                const areaPing = (((area.width * area.length) / 10000) * 0.3025).toFixed(1);
                const areaM2 = ((area.width * area.length) / 10000).toFixed(1);

                return (
                  <div
                    key={area.id}
                    className="p-3.5 rounded-xl bg-[#0d140e] border border-[#3F5B63]/40 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={area.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDetectedAreas((prev) =>
                              prev.map((a) => (a.id === area.id ? { ...a, name: val } : a))
                            );
                          }}
                          className="bg-transparent border-b border-transparent hover:border-[#3F5B63] focus:border-emerald-400 font-bold text-white text-xs outline-none"
                        />
                      </div>
                      <div className="text-[11px] font-mono text-amber-400 font-bold">
                        {areaPing} 坪 ({areaM2} m²)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="bg-[#182216] p-1.5 rounded-lg border border-[#3F5B63]/30">
                        <span className="text-[10px] text-neutral-400 block">開間面寬 W</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={area.width}
                            onChange={(e) =>
                              handleUpdateAreaDim(area.id, Number(e.target.value), area.length)
                            }
                            className="w-full bg-transparent text-center font-bold text-cyan-300 outline-none"
                          />
                          <span className="text-[10px] text-neutral-500">cm</span>
                        </div>
                      </div>
                      <div className="bg-[#182216] p-1.5 rounded-lg border border-[#3F5B63]/30">
                        <span className="text-[10px] text-neutral-400 block">進深長度 L</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={area.length}
                            onChange={(e) =>
                              handleUpdateAreaDim(area.id, area.width, Number(e.target.value))
                            }
                            className="w-full bg-transparent text-center font-bold text-cyan-300 outline-none"
                          />
                          <span className="text-[10px] text-neutral-500">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* 開口特徵與外牆標籤 */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        🚪 門洞 ×{area.doorsCount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        🪟 採光窗 ×{area.windowsCount}
                      </span>
                      {area.beamsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          🧱 結構樑 ×{area.beamsCount}
                        </span>
                      )}
                      {area.columnsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          🏛️ 柱體 ×{area.columnsCount}
                        </span>
                      )}
                      {area.exteriorWalls.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          🛡️ 外牆 15cm ({area.exteriorWalls.join('、')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部動作列 */}
        <div className="p-4 md:p-5 border-t border-[#3F5B63]/40 bg-[#0c130e] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              已解析 <strong>{detectedAreas.length}</strong> 個空間區域 · 包含門窗、外牆與梁柱預設
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition"
            >
              取消
            </button>
            <button
              onClick={handleConfirmAndImportToSurvey}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/50 transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>確認解析並帶入現場丈量系統 (保留各空間功能)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
