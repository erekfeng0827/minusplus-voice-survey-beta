import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Building,
  Home,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  RotateCcw,
  Ruler,
  Layers,
  Compass,
  Sliders,
  Check,
  Info,
  Maximize2,
  DoorOpen,
} from 'lucide-react';
import { RoomData, Door, WindowOpening, Beam } from '../types';

interface NewProjectSurveyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFreshProject: (newRooms: RoomData[], projectName: string) => void;
  onOpenStitcher?: () => void;
  onNotify?: (msg: string) => void;
}

interface RoomConfigDraft {
  id: string;
  roomName: string;
  typeKey: string;
  width: number; // cm
  length: number; // cm
  height: number; // cm
  beamHeight: number;
  ceilingDrop: number;
  bathKitchenDrop?: number;
  doorTag?: string; // Anchor Tag A, B, C...
  connectedToName?: string;
  doorWall: 'top' | 'bottom' | 'left' | 'right';
  doorOffset: number;
  isBaseRoom?: boolean;
}

export const NewProjectSurveyWizardModal: React.FC<NewProjectSurveyWizardModalProps> = ({
  isOpen,
  onClose,
  onStartFreshProject,
  onOpenStitcher,
  onNotify,
}) => {
  // Step 1: 房型格局問答
  // Step 2: 尺寸填寫表 (可逐一填寫或稍後到畫布填寫)
  const [step, setStep] = useState<1 | 2>(1);

  const [projectName, setProjectName] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `現場實測案場_${mm}${dd}`;
  });

  // 格局配置選項
  const [bedroomsCount, setBedroomsCount] = useState<number>(3); // 1, 2, 3, 4, 5
  const [livingDiningType, setLivingDiningType] = useState<'combined' | 'separated'>('combined'); // 客餐廳合一 / 獨立客廳+獨立餐廳
  const [bathroomsCount, setBathroomsCount] = useState<number>(2); // 1, 2, 3
  const [includeEntryway, setIncludeEntryway] = useState<boolean>(true); // 玄關
  const [includeKitchen, setIncludeKitchen] = useState<boolean>(true); // 廚房
  const [includeBalcony, setIncludeBalcony] = useState<boolean>(true); // 景觀陽台
  const [includeUtilityBalcony, setIncludeUtilityBalcony] = useState<boolean>(true); // 工作陽台
  const [includeStudy, setIncludeStudy] = useState<boolean>(false); // 書房/多功能室

  // 尺寸填寫資料表
  const [roomDrafts, setRoomDrafts] = useState<RoomConfigDraft[]>([]);

  // 當格局選項變更時，自動重新計算建議的空間清單與門洞拓撲
  const generatedDrafts = useMemo(() => {
    const list: RoomConfigDraft[] = [];

    // 1. 基底空間：客餐廳 (Base Room, 原點 (0,0))
    if (livingDiningType === 'combined') {
      list.push({
        id: 'room-living',
        roomName: '客餐廳公領域 (基底主軸)',
        typeKey: 'living',
        width: 600,
        length: 450,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 230,
        bathKitchenDrop: 215,
        doorWall: 'bottom',
        doorOffset: 50,
        isBaseRoom: true,
      });
    } else {
      list.push({
        id: 'room-living',
        roomName: '客廳 (基底主軸)',
        typeKey: 'living',
        width: 480,
        length: 420,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 230,
        doorWall: 'bottom',
        doorOffset: 50,
        isBaseRoom: true,
      });
      list.push({
        id: 'room-dining',
        roomName: '餐廳區',
        typeKey: 'dining',
        width: 360,
        length: 300,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 230,
        doorTag: 'DINING',
        connectedToName: '客廳',
        doorWall: 'left',
        doorOffset: 60,
      });
    }

    // 2. 玄關
    if (includeEntryway) {
      list.push({
        id: 'room-entry',
        roomName: '落塵玄關',
        typeKey: 'entry',
        width: 220,
        length: 180,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 220,
        bathKitchenDrop: 215,
        doorTag: 'ENTRY',
        connectedToName: '客餐廳',
        doorWall: 'top',
        doorOffset: 40,
      });
    }

    // 3. 廚房
    if (includeKitchen) {
      list.push({
        id: 'room-kitchen',
        roomName: '獨立廚房',
        typeKey: 'kitchen',
        width: 320,
        length: 220,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 230,
        bathKitchenDrop: 215,
        doorTag: 'KT',
        connectedToName: '客餐廳',
        doorWall: 'left',
        doorOffset: 60,
      });
    }

    // 4. 臥室群 (主臥、次臥1、次臥2...)
    for (let i = 1; i <= bedroomsCount; i++) {
      if (i === 1) {
        list.push({
          id: 'room-master-bed',
          roomName: '大套主臥房',
          typeKey: 'bedroom',
          width: 450,
          length: 360,
          height: 280,
          beamHeight: 265,
          ceilingDrop: 230,
          doorTag: 'BED-M',
          connectedToName: '客餐廳',
          doorWall: 'left',
          doorOffset: 60,
        });
      } else {
        list.push({
          id: `room-bed-${i}`,
          roomName: `次臥房 ${i - 1}`,
          typeKey: 'bedroom',
          width: 360,
          length: 300,
          height: 280,
          beamHeight: 265,
          ceilingDrop: 230,
          doorTag: `BED-${i}`,
          connectedToName: '客餐廳',
          doorWall: 'bottom',
          doorOffset: 60,
        });
      }
    }

    // 5. 衛浴群 (主衛、客衛...)
    for (let j = 1; j <= bathroomsCount; j++) {
      if (j === 1 && bedroomsCount >= 1) {
        list.push({
          id: 'room-bath-master',
          roomName: '主臥專用衛浴',
          typeKey: 'bath',
          width: 240,
          length: 160,
          height: 280,
          beamHeight: 265,
          ceilingDrop: 220,
          bathKitchenDrop: 215,
          doorTag: 'BATH-M',
          connectedToName: '大套主臥房',
          doorWall: 'bottom',
          doorOffset: 30,
        });
      } else {
        list.push({
          id: `room-bath-guest-${j}`,
          roomName: `公共客衛浴 ${j > 2 ? j - 1 : ''}`.trim(),
          typeKey: 'bath',
          width: 220,
          length: 160,
          height: 280,
          beamHeight: 265,
          ceilingDrop: 220,
          bathKitchenDrop: 215,
          doorTag: `BATH-G${j}`,
          connectedToName: '客餐廳/走道',
          doorWall: 'bottom',
          doorOffset: 30,
        });
      }
    }

    // 6. 書房
    if (includeStudy) {
      list.push({
        id: 'room-study',
        roomName: '多功能書房',
        typeKey: 'study',
        width: 320,
        length: 280,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 230,
        doorTag: 'STUDY',
        connectedToName: '客餐廳',
        doorWall: 'bottom',
        doorOffset: 50,
      });
    }

    // 7. 陽台
    if (includeBalcony) {
      list.push({
        id: 'room-balcony-view',
        roomName: '景觀前陽台',
        typeKey: 'balcony',
        width: 360,
        length: 150,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 260,
        doorTag: 'BAL-1',
        connectedToName: '客餐廳',
        doorWall: 'bottom',
        doorOffset: 40,
      });
    }

    if (includeUtilityBalcony) {
      list.push({
        id: 'room-balcony-util',
        roomName: '工作家事陽台',
        typeKey: 'balcony',
        width: 280,
        length: 150,
        height: 280,
        beamHeight: 265,
        ceilingDrop: 260,
        doorTag: 'BAL-2',
        connectedToName: '廚房',
        doorWall: 'bottom',
        doorOffset: 40,
      });
    }

    return list;
  }, [
    bedroomsCount,
    livingDiningType,
    bathroomsCount,
    includeEntryway,
    includeKitchen,
    includeBalcony,
    includeUtilityBalcony,
    includeStudy,
  ]);

  // 同步 generatedDrafts 至可編輯狀態 roomDrafts
  const handleProceedToStep2 = () => {
    setRoomDrafts(generatedDrafts);
    setStep(2);
  };

  const handleUpdateDraft = (id: string, field: keyof RoomConfigDraft, value: any) => {
    setRoomDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleRemoveDraft = (id: string) => {
    if (roomDrafts.length <= 1) {
      onNotify?.('全案至少需保留一個核心空間！');
      return;
    }
    setRoomDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddCustomRoom = () => {
    const nextIdx = roomDrafts.length + 1;
    const newDraft: RoomConfigDraft = {
      id: `room-custom-${Date.now().toString().slice(-4)}`,
      roomName: `自訂空間 #${nextIdx}`,
      typeKey: 'custom',
      width: 400,
      length: 320,
      height: 280,
      beamHeight: 265,
      ceilingDrop: 230,
      doorWall: 'bottom',
      doorOffset: 40,
    };
    setRoomDrafts((prev) => [...prev, newDraft]);
  };

  // 生成正式 RoomData[] 並提交開立新案
  const handleCreateProjectAndStartSurvey = () => {
    const targetDrafts = step === 2 && roomDrafts.length > 0 ? roomDrafts : generatedDrafts;

    // 找出 Base Room (通常為客餐廳)
    const baseDraft = targetDrafts.find((d) => d.isBaseRoom) || targetDrafts[0];

    // 為 Base Room 產生對應到各子空間的門洞
    const baseDoors: Door[] = [
      { id: `d-main-${Date.now()}`, name: '大門入戶防爆門', width: 100, height: 210, wall: 'bottom', offset: 40, anchorTag: 'OUT' },
    ];

    let anchorIdx = 1;
    targetDrafts.forEach((d) => {
      if (d.id !== baseDraft.id && d.doorTag) {
        // 在 Base Room 上開一個對接門片
        const wallChoice: 'top' | 'bottom' | 'left' | 'right' =
          anchorIdx % 2 === 0 ? 'top' : anchorIdx % 3 === 0 ? 'left' : 'right';
        baseDoors.push({
          id: `d-base-${d.id}`,
          name: `往 ${d.roomName} 門片`,
          width: 90,
          height: 210,
          wall: wallChoice,
          offset: Math.min(60 + anchorIdx * 50, baseDraft.width - 100),
          anchorTag: d.doorTag,
          pairedRoomId: d.id,
        });
        anchorIdx++;
      }
    });

    // 轉換成標準 RoomData 陣列
    const finalRooms: RoomData[] = targetDrafts.map((draft) => {
      const isBase = draft.id === baseDraft.id;

      // 空間自己的門洞配置
      const doors: Door[] = isBase
        ? baseDoors
        : draft.doorTag
        ? [
            {
              id: `d-in-${draft.id}`,
              name: `房門 (${draft.roomName})`,
              width: 90,
              height: 210,
              wall: draft.doorWall || 'bottom',
              offset: draft.doorOffset || 40,
              anchorTag: draft.doorTag,
              pairedRoomId: baseDraft.id,
            },
          ]
        : [];

      // 基礎採光窗 (臥室、客廳預設開窗)
      const windows: WindowOpening[] =
        draft.typeKey === 'living'
          ? [{ id: `w-${draft.id}`, name: '景觀落地採光窗', width: 280, height: 240, sillHeight: 15, wall: 'top', offset: 80 }]
          : draft.typeKey === 'bedroom'
          ? [{ id: `w-${draft.id}`, name: '外牆氣密採光窗', width: 160, height: 140, sillHeight: 90, wall: 'top', offset: 60 }]
          : [];

      // 標準橫樑預設 (客廳或主臥)
      const beams: Beam[] =
        draft.typeKey === 'living'
          ? [{ id: `b-${draft.id}`, name: '結構橫樑 B1', width: 35, depth: 55, clearHeight: draft.beamHeight || 265, orientation: 'horizontal', y: 180 }]
          : [];

      return {
        id: draft.id,
        roomName: draft.roomName,
        width: draft.width,
        length: draft.length,
        height: draft.height,
        beamHeight: draft.beamHeight || 265,
        ceilingDrop: draft.ceilingDrop,
        bathKitchenDrop: draft.bathKitchenDrop,
        wallThickness: 10, // 丈量統一預設 10cm (輕隔間標準，外牆可個別指定 15cm)
        beams,
        doors,
        windows,
        voiceMemos: [],
        electricalPoints: [],
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        evaluation: {
          score: 100,
          clarity: '全新純淨待測',
          missingElements: [],
          rule5MultiplePassed: true,
          suggestions: `本空間已建立，請點選放樣畫布開始輸入現場實測尺寸。所有門窗已自動標記門洞代號 (${draft.doorTag || 'BASE'})，便於後續全案幾何剛體咬合！`,
        },
      };
    });

    onStartFreshProject(finalRooms, projectName);
    onClose();
    onNotify?.(`🎉 全新案場「${projectName}」開立成功！已自動建立 ${finalRooms.length} 個獨立空間丈量區域！`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#141d16] border border-[#3F5B63]/70 rounded-[28px] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#3F5B63]/40 bg-[#0d140e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="text-xl font-bold text-[#F8F8F6] tracking-wider">
                新建案場丈量嚮導精靈
              </h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                依照您的房型問答配置，一鍵開立全新獨立空間，隨後自動進行幾何剛體門洞咬合
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A2417] text-[#8E8E93] hover:text-[#F8F8F6] hover:bg-[#3F5B63]/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-6 py-3 bg-[#121810] border-b border-[#3F5B63]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1 ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
              房型格局問答 (幾房幾廳幾衛)
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-600" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-amber-400 font-bold' : 'text-neutral-400'}>
              各空間實測尺寸預填與門洞拓撲
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            /* ================= Step 1: 房型格局問答 ================= */
            <div className="space-y-6">
              {/* 專案名稱 */}
              <div className="bg-[#0d140e] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-2">
                <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider block">
                  1. 案場名稱 (Project Name)
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#1A2417] border border-[#3F5B63]/60 rounded-xl px-4 py-2.5 text-[#F8F8F6] text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="輸入本次新建丈量案名，例：信義大安 8F 現場放樣"
                />
              </div>

              {/* 幾房 */}
              <div className="bg-[#0d140e] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider">
                    2. 臥室間數 (Bedrooms)
                  </label>
                  <span className="text-xs text-amber-400 font-semibold">{bedroomsCount} 間臥室</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBedroomsCount(num)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                        bedroomsCount === num
                          ? 'bg-amber-500 text-[#121810] border-amber-400 shadow-md'
                          : 'bg-[#1A2417] text-[#DDD7CE] border-[#3F5B63]/40 hover:bg-[#3F5B63]/30'
                      }`}
                    >
                      {num} 房
                    </button>
                  ))}
                </div>
              </div>

              {/* 幾廳 (客餐廳型態) */}
              <div className="bg-[#0d140e] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
                <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider block">
                  3. 客餐廳型態 (Living & Dining)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLivingDiningType('combined')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      livingDiningType === 'combined'
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-[#1A2417] border-[#3F5B63]/40 text-[#DDD7CE] hover:bg-[#3F5B63]/20'
                    }`}
                  >
                    <Home className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <div className="font-bold text-sm">客餐廳一體化 (開放式公領域)</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        主流大開間戶型，客廳、餐廳與動線整合為單一基準空間 (600×450cm)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLivingDiningType('separated')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      livingDiningType === 'separated'
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-[#1A2417] border-[#3F5B63]/40 text-[#DDD7CE] hover:bg-[#3F5B63]/20'
                    }`}
                  >
                    <Layers className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <div className="font-bold text-sm">客廳 + 獨立餐廳 (兩廳分開)</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        客廳 (480×420cm) 與獨立餐廳 (360×300cm) 獨立建立各自放樣區域
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 幾衛浴 */}
              <div className="bg-[#0d140e] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider">
                    4. 衛浴間數 (Bathrooms)
                  </label>
                  <span className="text-xs text-amber-400 font-semibold">{bathroomsCount} 間衛浴</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBathroomsCount(num)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                        bathroomsCount === num
                          ? 'bg-amber-500 text-[#121810] border-amber-400 shadow-md'
                          : 'bg-[#1A2417] text-[#DDD7CE] border-[#3F5B63]/40 hover:bg-[#3F5B63]/30'
                      }`}
                    >
                      {num} 衛浴 {num === 2 ? '(主衛 + 客衛)' : num === 3 ? '(主衛 + 2客衛)' : '(單衛浴)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 附屬功能空間勾選 */}
              <div className="bg-[#0d140e] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
                <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider block">
                  5. 附屬空間勾選 (Ancillary Spaces)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1A2417] border border-[#3F5B63]/40 cursor-pointer hover:bg-[#3F5B63]/20">
                    <input
                      type="checkbox"
                      checked={includeEntryway}
                      onChange={(e) => setIncludeEntryway(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#F8F8F6]">獨立落塵玄關</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1A2417] border border-[#3F5B63]/40 cursor-pointer hover:bg-[#3F5B63]/20">
                    <input
                      type="checkbox"
                      checked={includeKitchen}
                      onChange={(e) => setIncludeKitchen(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#F8F8F6]">獨立廚房</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1A2417] border border-[#3F5B63]/40 cursor-pointer hover:bg-[#3F5B63]/20">
                    <input
                      type="checkbox"
                      checked={includeBalcony}
                      onChange={(e) => setIncludeBalcony(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#F8F8F6]">景觀前陽台</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1A2417] border border-[#3F5B63]/40 cursor-pointer hover:bg-[#3F5B63]/20">
                    <input
                      type="checkbox"
                      checked={includeUtilityBalcony}
                      onChange={(e) => setIncludeUtilityBalcony(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#F8F8F6]">工作家事陽台</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1A2417] border border-[#3F5B63]/40 cursor-pointer hover:bg-[#3F5B63]/20">
                    <input
                      type="checkbox"
                      checked={includeStudy}
                      onChange={(e) => setIncludeStudy(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#F8F8F6]">多功能書房</span>
                  </label>
                </div>
              </div>

              {/* 即將自動建立的空間清單即時預覽 */}
              <div className="bg-[#121810] p-4 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    即將為本案自動開立 {generatedDrafts.length} 個獨立空間丈量區域：
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {bedroomsCount}房 · {livingDiningType === 'combined' ? '1廳(客餐一體)' : '2廳'} · {bathroomsCount}衛
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {generatedDrafts.map((d) => (
                    <span
                      key={d.id}
                      className="px-3 py-1 rounded-lg bg-[#1A2417] border border-[#3F5B63]/50 text-xs font-medium text-[#F8F8F6] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {d.roomName}
                      <span className="text-[10px] text-neutral-400 font-mono">({d.width}×{d.length}cm)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= Step 2: 各空間實測尺寸預填與門洞拓撲 ================= */
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm mb-0.5">如何形成真實建築平面圖？而不是拼湊概念圖：</div>
                  <p className="leading-relaxed text-amber-200/90">
                    在下方表格中輸入各空間實測尺寸。系統以「客餐廳」為基底主軸，並為各房間配置好門洞代號 (Anchor Tags)。在全案合併時，系統會自動透過門洞法向量鎖定剛體旋轉，並<strong>自動咬合共壁扣除 15cm 牆厚</strong>，融合成具備標準雙線實牆、貫通門洞與建築尺寸鏈的真正平面圖！
                  </p>
                </div>
              </div>

              {/* 空間尺寸清單表 */}
              <div className="bg-[#0d140e] rounded-2xl border border-[#3F5B63]/50 overflow-hidden">
                <div className="p-3 bg-[#121810] border-b border-[#3F5B63]/40 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#DDD7CE]">空間實測尺寸一覽表 ({roomDrafts.length} 個空間)</span>
                  <button
                    onClick={handleAddCustomRoom}
                    className="px-2.5 py-1 rounded-lg bg-[#1A2417] hover:bg-[#3F5B63]/40 border border-[#3F5B63]/40 text-amber-300 text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> 新增其他空間
                  </button>
                </div>

                <div className="divide-y divide-[#3F5B63]/20 max-h-[46vh] overflow-y-auto">
                  {roomDrafts.map((d, index) => (
                    <div key={d.id} className="p-3.5 hover:bg-[#1A2417]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      {/* 空間標題與拓撲門洞 */}
                      <div className="w-full md:w-56 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={d.roomName}
                            onChange={(e) => handleUpdateDraft(d.id, 'roomName', e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-[#3F5B63] focus:border-amber-400 text-sm font-bold text-[#F8F8F6] focus:outline-none px-1"
                          />
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-1 ml-7">
                          <DoorOpen className="w-3 h-3 text-cyan-400" />
                          <span>門洞: {d.doorTag ? `[${d.doorTag}] 連接至 ${d.connectedToName || '公領域'}` : '核心基底 (原點 0,0)'}</span>
                        </div>
                      </div>

                      {/* 尺寸輸入欄 (長、寬、樑高、降板) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-[#121810] px-2 py-1.5 rounded-lg border border-[#3F5B63]/40">
                          <span className="text-neutral-400 text-[10px]">面寬 W:</span>
                          <input
                            type="number"
                            value={d.width}
                            onChange={(e) => handleUpdateDraft(d.id, 'width', Number(e.target.value))}
                            className="w-16 bg-transparent text-right font-mono font-bold text-amber-400 focus:outline-none"
                          />
                          <span className="text-neutral-500 text-[10px]">cm</span>
                        </div>

                        <div className="flex items-center gap-1 bg-[#121810] px-2 py-1.5 rounded-lg border border-[#3F5B63]/40">
                          <span className="text-neutral-400 text-[10px]">進深 L:</span>
                          <input
                            type="number"
                            value={d.length}
                            onChange={(e) => handleUpdateDraft(d.id, 'length', Number(e.target.value))}
                            className="w-16 bg-transparent text-right font-mono font-bold text-amber-400 focus:outline-none"
                          />
                          <span className="text-neutral-500 text-[10px]">cm</span>
                        </div>

                        <div className="flex items-center gap-1 bg-[#121810] px-2 py-1.5 rounded-lg border border-[#3F5B63]/40">
                          <span className="text-neutral-400 text-[10px]">樑淨高:</span>
                          <input
                            type="number"
                            value={d.beamHeight}
                            onChange={(e) => handleUpdateDraft(d.id, 'beamHeight', Number(e.target.value))}
                            className="w-14 bg-transparent text-right font-mono text-[#DDD7CE] focus:outline-none"
                          />
                          <span className="text-neutral-500 text-[10px]">cm</span>
                        </div>

                        <div className="flex items-center gap-1 bg-[#121810] px-2 py-1.5 rounded-lg border border-[#3F5B63]/40">
                          <span className="text-neutral-400 text-[10px]">天花降板:</span>
                          <input
                            type="number"
                            value={d.ceilingDrop}
                            onChange={(e) => handleUpdateDraft(d.id, 'ceilingDrop', Number(e.target.value))}
                            className="w-14 bg-transparent text-right font-mono text-[#DDD7CE] focus:outline-none"
                          />
                          <span className="text-neutral-500 text-[10px]">cm</span>
                        </div>

                        <button
                          onClick={() => handleRemoveDraft(d.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="刪除此空間"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#3F5B63]/40 bg-[#0d140e] flex items-center justify-between">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-[#1A2417] hover:bg-[#3F5B63]/40 text-[#DDD7CE] text-sm font-semibold transition"
            >
              ← 返回格局設定
            </button>
          ) : (
            <div className="text-xs text-neutral-400">
              共計 <span className="font-bold text-amber-400">{generatedDrafts.length}</span> 個獨立空間
            </div>
          )}

          <div className="flex items-center gap-3">
            {step === 1 ? (
              <>
                <button
                  onClick={handleCreateProjectAndStartSurvey}
                  className="px-4 py-2.5 rounded-xl bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-[#DDD7CE] text-sm font-semibold transition"
                  title="直接採用標準尺寸開立案場"
                >
                  直接建立待測空間
                </button>
                <button
                  onClick={handleProceedToStep2}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#121810] text-sm font-bold flex items-center gap-2 shadow-lg transition active:scale-95"
                >
                  <span>下一步：檢視與填入實測尺寸</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateProjectAndStartSurvey}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#121810] text-sm font-bold flex items-center gap-2 shadow-xl transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>立即開立全新案場並開啟丈量</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
