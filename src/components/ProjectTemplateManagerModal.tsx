import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Trash2,
  RotateCcw,
  CheckCircle2,
  FolderPlus,
  Home,
  Sliders,
  Ruler,
  Info,
  ShieldCheck,
  Plus,
  ArrowRight,
  Maximize2,
  LayoutGrid,
  FileCode,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { RoomData } from '../types';
import {
  ROOM_TEMPLATES,
  RoomTemplate,
  createCleanRoomFromTemplate,
  createTwoBedOneBathSuite,
  createCustomBlankRoom,
} from '../data/roomTemplates';
import { INITIAL_ROOMS } from '../data/defaultProject';

interface ProjectTemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: RoomData;
  rooms: RoomData[];
  projectName: string;
  onSetProjectName: (name: string) => void;
  onStartFreshProject: (newRooms: RoomData[], projectName: string) => void;
  onAddRoomFromTemplate: (newRoom: RoomData) => void;
  onClearCurrentRoomElements: () => void;
  onNotify: (msg: string) => void;
}

export const ProjectTemplateManagerModal: React.FC<ProjectTemplateManagerModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  rooms,
  projectName,
  onSetProjectName,
  onStartFreshProject,
  onAddRoomFromTemplate,
  onClearCurrentRoomElements,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'fresh_project' | 'template_gallery' | 'custom_dimension' | 'wipe_reset'>('fresh_project');

  // 新專案表單狀態
  const [newProjectInputName, setNewProjectInputName] = useState<string>('現場實測新建工程');
  const [freshMode, setFreshMode] = useState<'single_blank' | 'two_bed_suite' | 'custom_template'>('single_blank');
  const [selectedTplId, setSelectedTplId] = useState<string>('tpl-living');

  // 自訂尺寸狀態
  const [customRoomName, setCustomRoomName] = useState<string>('自訂純淨空間');
  const [customWidth, setCustomWidth] = useState<number>(480);
  const [customLength, setCustomLength] = useState<number>(360);
  const [customHeight, setCustomHeight] = useState<number>(280);
  const [customBeamHeight, setCustomBeamHeight] = useState<number>(265);
  const [customCeilingDrop, setCustomCeilingDrop] = useState<number>(230);

  // 清空確認防呆
  const [showConfirmWipeAll, setShowConfirmWipeAll] = useState<boolean>(false);
  const [showConfirmClearCurrent, setShowConfirmClearCurrent] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. 執行「開立全新純淨案場」
  const handleExecuteFreshProject = () => {
    let freshRooms: RoomData[] = [];
    if (freshMode === 'single_blank') {
      const blankTpl = ROOM_TEMPLATES.find((t) => t.id === 'tpl-blank')!;
      freshRooms = [createCleanRoomFromTemplate(blankTpl, '放樣區 A')];
    } else if (freshMode === 'two_bed_suite') {
      freshRooms = createTwoBedOneBathSuite();
    } else {
      const targetTpl = ROOM_TEMPLATES.find((t) => t.id === selectedTplId) || ROOM_TEMPLATES[0];
      freshRooms = [createCleanRoomFromTemplate(targetTpl)];
    }

    const finalName = newProjectInputName.trim() || '未命名純淨放樣新案';
    onStartFreshProject(freshRooms, finalName);
    onSetProjectName(finalName);
    onNotify(`✨ 已成功開立純淨新案「${finalName}」！舊案例已完全抹除，畫布 100% 乾淨。`);
    onClose();
  };

  // 2. 執行「從範本加入為目前專案的新空間」
  const handleAddTemplateAsNewRoom = (tpl: RoomTemplate) => {
    const newRoom = createCleanRoomFromTemplate(tpl);
    onAddRoomFromTemplate(newRoom);
    onNotify(`已加入純淨房型「${newRoom.roomName}」至現有案場！`);
    onClose();
  };

  // 3. 執行「以選定範本單獨開立新案」
  const handleStartProjectWithSingleTemplate = (tpl: RoomTemplate) => {
    const freshRoom = createCleanRoomFromTemplate(tpl);
    const newName = `${tpl.title.split(' ')[0]}專案放樣`;
    onStartFreshProject([freshRoom], newName);
    onSetProjectName(newName);
    onNotify(`✨ 已以「${tpl.title}」開立純淨新專案！`);
    onClose();
  };

  // 4. 執行自訂尺寸建立
  const handleCreateCustomRoom = (asNewProject: boolean) => {
    const room = createCustomBlankRoom(
      customRoomName,
      customWidth,
      customLength,
      customHeight,
      customBeamHeight,
      customCeilingDrop
    );

    if (asNewProject) {
      const pName = `${customRoomName}放樣工程`;
      onStartFreshProject([room], pName);
      onSetProjectName(pName);
      onNotify(`✨ 已成功開立自訂尺寸純淨新案「${pName}」！`);
    } else {
      onAddRoomFromTemplate(room);
      onNotify(`已將自訂尺寸空間「${room.roomName}」加入目前案場！`);
    }
    onClose();
  };

  // 5. 重新載入示範案例 (星玥灣)
  const handleReloadDemoProject = () => {
    onStartFreshProject(INITIAL_ROOMS, '星玥灣 8F 住宅室內裝修新建工程');
    onSetProjectName('星玥灣 8F 住宅室內裝修新建工程');
    onNotify('已重新載入星玥灣完整展示示範工程！');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#121810]/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#1A2417] border border-[#3F5B63] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-[#F8F8F6] flex flex-col max-h-[92vh]">
        
        {/* Header (Minusplus 品牌標準字與關閉按鈕) */}
        <div className="bg-[#23301F] border-b border-[#3F5B63]/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3F5B63]/40 border border-[#E0A83C]/40 flex items-center justify-center text-[#E0A83C]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wider" style={{ fontFamily: "'Noto Serif TC', serif" }}>
                  案場專案管理與房型選擇器
                </h2>
                <span className="text-[10px] bg-[#E0A83C]/20 text-[#E0A83C] px-2 py-0.5 rounded-full font-mono border border-[#E0A83C]/30">
                  純淨無雜物保證
                </span>
              </div>
              <p className="text-xs text-[#DDD7CE]">
                當前案場：<span className="text-[#E0A83C] font-semibold">{projectName}</span> ({rooms.length} 個空間)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#DDD7CE] hover:text-[#F8F8F6] hover:bg-[#3F5B63]/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#3F5B63]/40 bg-[#151D13] px-6 overflow-x-auto hide-scrollbar gap-2 py-2">
          {[
            { id: 'fresh_project', label: '✨ 開立純淨新案 (歸零重來)', icon: Sparkles },
            { id: 'template_gallery', label: '📐 房型範本選擇庫', icon: LayoutGrid },
            { id: 'custom_dimension', label: '✏️ 自訂尺寸空間', icon: Ruler },
            { id: 'wipe_reset', label: '🗑️ 清空與重置專區', icon: Trash2 },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#3F5B63] text-[#F8F8F6] shadow-md border border-[#E0A83C]/40'
                    : 'text-[#DDD7CE] hover:text-[#F8F8F6] hover:bg-[#23301F]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E0A83C]' : 'text-[#DDD7CE]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: ✨ 開立純淨新案 (歸零重來)                                           */}
          {/* ========================================================================= */}
          {activeTab === 'fresh_project' && (
            <div className="space-y-6">
              <div className="bg-[#23301F] border border-[#3F5B63]/50 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#E0A83C]/20 text-[#E0A83C] border border-[#E0A83C]/30 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F8F8F6]">
                      重新開始：建立一個 100% 乾淨的全新工程案場
                    </h3>
                    <p className="text-xs text-[#DDD7CE] mt-1 leading-relaxed">
                      系統將完全抹除目前現場殘留的所有示範圖元、假語音備忘、假插座與假梁柱，為您奉上一張乾乾淨淨的空白工程圖紙，隨時開始全新的實測放樣。
                    </p>
                  </div>
                </div>

                {/* 案場名稱設定 */}
                <div className="space-y-1.5 pt-2 border-t border-[#3F5B63]/40">
                  <label className="text-xs font-semibold text-[#DDD7CE] flex items-center justify-between">
                    <span>新案場名稱 (工程代號)：</span>
                    <span className="text-[11px] text-[#8E8E93]">例如：民生東路林公館現場丈量</span>
                  </label>
                  <input
                    type="text"
                    value={newProjectInputName}
                    onChange={(e) => setNewProjectInputName(e.target.value)}
                    placeholder="請輸入新案場名稱..."
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-4 py-2.5 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] transition"
                  />
                </div>

                {/* 初始房型選擇 */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-[#DDD7CE]">選擇初始畫布配置：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* 選項 A: 單一純淨空白畫布 */}
                    <div
                      onClick={() => setFreshMode('single_blank')}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        freshMode === 'single_blank'
                          ? 'bg-[#3F5B63]/40 border-[#E0A83C] ring-1 ring-[#E0A83C]'
                          : 'bg-[#121810] border-[#3F5B63]/40 hover:border-[#3F5B63]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#F8F8F6]">🌟 單一純淨空白畫布</span>
                          {freshMode === 'single_blank' && <Check className="w-4 h-4 text-[#E0A83C]" />}
                        </div>
                        <p className="text-[11px] text-[#DDD7CE] leading-relaxed">
                          480 × 360 cm，完全 0 物件、0 備忘，最純粹的乾淨起點。
                        </p>
                      </div>
                      <span className="text-[10px] text-[#E0A83C] mt-3 font-mono">推薦首選・最簡約</span>
                    </div>

                    {/* 選項 B: 標準兩房一廳純淨成案 */}
                    <div
                      onClick={() => setFreshMode('two_bed_suite')}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        freshMode === 'two_bed_suite'
                          ? 'bg-[#3F5B63]/40 border-[#E0A83C] ring-1 ring-[#E0A83C]'
                          : 'bg-[#121810] border-[#3F5B63]/40 hover:border-[#3F5B63]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#F8F8F6]">🏡 標準兩房一廳組合</span>
                          {freshMode === 'two_bed_suite' && <Check className="w-4 h-4 text-[#E0A83C]" />}
                        </div>
                        <p className="text-[11px] text-[#DDD7CE] leading-relaxed">
                          客餐廳 + 主臥 + 次臥 3 個純淨空間，僅含必要門窗外框，零多餘標註。
                        </p>
                      </div>
                      <span className="text-[10px] text-[#3F5B63] text-emerald-400 mt-3 font-mono">成套放樣專案</span>
                    </div>

                    {/* 選項 C: 選擇特定單一房型 */}
                    <div
                      onClick={() => setFreshMode('custom_template')}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        freshMode === 'custom_template'
                          ? 'bg-[#3F5B63]/40 border-[#E0A83C] ring-1 ring-[#E0A83C]'
                          : 'bg-[#121810] border-[#3F5B63]/40 hover:border-[#3F5B63]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#F8F8F6]">🛋️ 挑選特定房型開案</span>
                          {freshMode === 'custom_template' && <Check className="w-4 h-4 text-[#E0A83C]" />}
                        </div>
                        <select
                          value={selectedTplId}
                          onChange={(e) => setSelectedTplId(e.target.value)}
                          className="w-full mt-1 bg-[#1A2417] border border-[#3F5B63] rounded-lg px-2 py-1 text-xs text-[#F8F8F6]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ROOM_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.width}x{t.length}cm)
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-[10px] text-[#DDD7CE] mt-3">自選房型尺寸</span>
                    </div>
                  </div>
                </div>

                {/* 行動按鈕 */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#3F5B63]/40">
                  <div className="flex items-center gap-2 text-xs text-[#E0A83C]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>安全保證：開立後可隨時在歷程中復原 (Ctrl+Z)</span>
                  </div>
                  <button
                    onClick={handleExecuteFreshProject}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B4503A] hover:bg-[#9e4330] text-[#F8F8F6] text-xs font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>清除舊案例並開立純淨新案</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 📐 房型範本選擇庫 (空間參考)                                         */}
          {/* ========================================================================= */}
          {activeTab === 'template_gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F8F8F6]">標準純淨房型參考範本</h3>
                  <p className="text-xs text-[#DDD7CE]">
                    點擊「➕ 加入為新空間」或「以本房型建立獨立新案」，所有範本皆經過 5 倍數工程校驗，無假資料沾染。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROOM_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-[#23301F] border border-[#3F5B63]/60 rounded-2xl p-4 flex flex-col justify-between hover:border-[#E0A83C]/60 transition group shadow-md"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#3F5B63]/40 text-[#E0A83C] border border-[#3F5B63]">
                          {tpl.badge}
                        </span>
                        <span className="text-xs text-[#DDD7CE] font-mono">
                          約 {tpl.approxAreaPing} 坪
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#F8F8F6] group-hover:text-[#E0A83C] transition">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-[#DDD7CE] leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-[#121810] p-2.5 rounded-xl border border-[#3F5B63]/30 text-[#DDD7CE]">
                        <div>開間面寬：<span className="text-[#F8F8F6] font-bold">{tpl.width} cm</span></div>
                        <div>進深長度：<span className="text-[#F8F8F6] font-bold">{tpl.length} cm</span></div>
                        <div>標準樓高：<span className="text-[#F8F8F6] font-bold">{tpl.height} cm</span></div>
                        <div>梁下淨高：<span className="text-[#E0A83C] font-bold">{tpl.beamHeight} cm</span></div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#3F5B63]/30 flex items-center gap-2">
                      <button
                        onClick={() => handleAddTemplateAsNewRoom(tpl)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#3F5B63] hover:bg-[#4a6b74] text-[#F8F8F6] text-xs font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                        title="將此空間加入當前專案"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>加入為新空間</span>
                      </button>
                      <button
                        onClick={() => handleStartProjectWithSingleTemplate(tpl)}
                        className="px-3 py-2 rounded-xl bg-[#121810] hover:bg-[#23301F] text-[#E0A83C] border border-[#E0A83C]/40 text-xs font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                        title="以此房型作為新案場起點 (清空舊資料)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>獨立開案</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ✏️ 自訂尺寸空間                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'custom_dimension' && (
            <div className="bg-[#23301F] border border-[#3F5B63]/50 rounded-2xl p-5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#F8F8F6]">手動輸入尺寸・建立純淨幾何空間</h3>
                <p className="text-xs text-[#DDD7CE] mt-0.5">
                  輸入精準的現場放樣尺寸，系統將自動校準為 5 倍數工程模數（5 cm 對齊）。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">空間名稱：</label>
                  <input
                    type="text"
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">開間面寬 (寬度 W, cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">進深長度 (長度 L, cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={customLength}
                    onChange={(e) => setCustomLength(Number(e.target.value))}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">樓板淨高 (高度 H, cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">大梁下淨高基準 (cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={customBeamHeight}
                    onChange={(e) => setCustomBeamHeight(Number(e.target.value))}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#DDD7CE]">天花吊隱降板高 (cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={customCeilingDrop}
                    onChange={(e) => setCustomCeilingDrop(Number(e.target.value))}
                    className="w-full bg-[#121810] border border-[#3F5B63] rounded-xl px-3 py-2 text-sm text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C] font-mono"
                  />
                </div>
              </div>

              {/* 即時換算卡片 */}
              <div className="bg-[#121810] p-3 rounded-xl border border-[#3F5B63]/40 flex items-center justify-between text-xs">
                <span className="text-[#DDD7CE]">
                  預估地坪面積：
                  <strong className="text-[#E0A83C] font-mono font-bold ml-1">
                    {((customWidth * customLength) / 10000).toFixed(2)} m² (約{' '}
                    {(((customWidth * customLength) / 10000) * 0.3025).toFixed(1)} 坪)
                  </strong>
                </span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 5倍數模數合規
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCreateCustomRoom(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#3F5B63] hover:bg-[#4a6b74] text-[#F8F8F6] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>加入為新空間</span>
                </button>
                <button
                  onClick={() => handleCreateCustomRoom(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#B4503A] hover:bg-[#9e4330] text-[#F8F8F6] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>以此尺寸開立新專案</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: 🗑️ 清空與重置專區                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'wipe_reset' && (
            <div className="space-y-4">
              {/* Option 1: 清空當前空間內的圖元 */}
              <div className="bg-[#23301F] border border-[#3F5B63]/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-[#F8F8F6]">
                      清空當前空間「{currentRoom.roomName}」畫布圖元
                    </h4>
                  </div>
                  <p className="text-xs text-[#DDD7CE]">
                    保留目前的空間尺寸（{currentRoom.width} × {currentRoom.length} cm），但將內部所有結構梁、門窗開口、水電開關、口述備忘錄音全數清空。
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClearCurrentRoomElements();
                    onNotify(`已清空「${currentRoom.roomName}」畫布內所有放樣圖元！`);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>清空當前畫布</span>
                </button>
              </div>

              {/* Option 2: 徹底重置抹除所有案例 */}
              <div className="bg-[#23301F] border border-rose-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-rose-200">
                      徹底抹除所有示範案例 (清空歸零)
                    </h4>
                  </div>
                  <p className="text-xs text-[#DDD7CE]">
                    刪除目前載入的「星玥灣」等所有展示用房間與舊資料，直接建立單一 100% 空白房間。
                  </p>
                </div>
                <button
                  onClick={() => {
                    const blankTpl = ROOM_TEMPLATES.find((t) => t.id === 'tpl-blank')!;
                    onStartFreshProject([createCleanRoomFromTemplate(blankTpl, '放樣區 A')], '全新放樣案場');
                    onSetProjectName('全新放樣案場');
                    onNotify('已徹底抹除所有既有展示案例，畫布已歸零純淨！');
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 shadow-lg shadow-rose-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>徹底抹除並重啟新案</span>
                </button>
              </div>

              {/* Option 3: 重新載入星玥灣完整展示示範 */}
              <div className="bg-[#23301F] border border-[#3F5B63]/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <h4 className="text-sm font-bold text-[#F8F8F6]">
                      重新載入星玥灣完整示範案例
                    </h4>
                  </div>
                  <p className="text-xs text-[#DDD7CE]">
                    如果您想參考包含 265/230/215 幾何契約、水電標註、口述備忘的完整標準案例，可隨時一鍵重新載入。
                  </p>
                </div>
                <button
                  onClick={handleReloadDemoProject}
                  className="px-4 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/40 text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>載入星玥灣示範</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#151D13] border-t border-[#3F5B63]/40 flex items-center justify-between text-xs text-[#DDD7CE]">
          <span>Minusplus · 現場丈量放樣系統 · 純淨幾何契約</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#23301F] hover:bg-[#3F5B63] text-[#F8F8F6] text-xs font-semibold transition"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
