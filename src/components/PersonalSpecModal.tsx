import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
  Building2,
  Ruler,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { RoomData, DesignerSpecProfile, SpecAuditChange } from '../types';
import {
  getSavedDesignerProfiles,
  saveCustomDesignerProfile,
  deleteCustomDesignerProfile,
  getActiveDesignerProfile,
  setActiveDesignerProfileId,
  applyDesignerSpecToRooms,
} from '../utils/designerSpecEngine';

interface PersonalSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomData[];
  onApplySpec: (updatedRooms: RoomData[], summaryText: string, changes: SpecAuditChange[]) => void;
  onNotify: (msg: string) => void;
}

export const PersonalSpecModal: React.FC<PersonalSpecModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onApplySpec,
  onNotify,
}) => {
  const [profiles, setProfiles] = useState<DesignerSpecProfile[]>(() => getSavedDesignerProfiles());
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => getActiveDesignerProfile().id);
  const [auditChanges, setAuditChanges] = useState<SpecAuditChange[] | null>(null);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [customForm, setCustomForm] = useState<DesignerSpecProfile>(() => getActiveDesignerProfile());

  if (!isOpen) return null;

  const currentProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const handleSelectProfile = (p: DesignerSpecProfile) => {
    setSelectedProfileId(p.id);
    setActiveDesignerProfileId(p.id);
    setCustomForm({ ...p });
    setAuditChanges(null);
  };

  const handleApplyToProject = () => {
    const targetSpec = isEditingCustom ? customForm : currentProfile;
    const { updatedRooms, changes, summaryText } = applyDesignerSpecToRooms(rooms, targetSpec);
    setAuditChanges(changes);
    onApplySpec(updatedRooms, summaryText, changes);
    onNotify(`✓ 已成功套用「${targetSpec.name}」！全案 ${rooms.length} 個空間圖元與模數尺寸均已校正。`);
  };

  const handleSaveAsCustom = () => {
    const newId = `custom_spec_${Date.now()}`;
    const newProfile: DesignerSpecProfile = {
      ...customForm,
      id: newId,
      badge: '我的自訂',
      isDefault: false,
      isCustom: true,
    };
    saveCustomDesignerProfile(newProfile);
    const updated = getSavedDesignerProfiles();
    setProfiles(updated);
    setSelectedProfileId(newId);
    setIsEditingCustom(false);
    onNotify(`✓ 自訂規格「${newProfile.name}」已儲存！`);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomDesignerProfile(id);
    const updated = getSavedDesignerProfiles();
    setProfiles(updated);
    setSelectedProfileId(updated[0].id);
    setCustomForm({ ...updated[0] });
    onNotify('已移除該自訂規格。');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#121810] border border-[#3F5B63]/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#DDD7CE]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#3F5B63]/40 flex items-center justify-between bg-[#141d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#F8F8F6]">個人規格自動套用 (Designer Spec Profiles)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  全案模數自動化
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                客製化繪圖模數、RC 壁厚、天花與門窗標準尺寸，支援一鍵將全案所有空間對齊設計師個人契約規範
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#F8F8F6] hover:bg-[#23301F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Spec Template Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#DDD7CE]/80 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>選擇規格範本或自訂設計師標準</span>
              </label>
              <button
                onClick={() => {
                  setIsEditingCustom(true);
                  setCustomForm({
                    ...currentProfile,
                    id: `custom_${Date.now()}`,
                    name: `${currentProfile.author || '個人'}專屬規格 (複本)`,
                    badge: '我的自訂',
                    isCustom: true,
                  });
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增自訂個人規格</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-[#1a271c] border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-[#141d16] border-[#3F5B63]/40 hover:border-[#3F5B63]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#23301F] text-amber-400 border border-amber-500/30">
                        {p.badge}
                      </span>
                      {p.isCustom && (
                        <button
                          onClick={(e) => handleDeleteProfile(p.id, e)}
                          className="text-[#8E8E93] hover:text-red-400 transition p-0.5"
                          title="刪除此自訂規格"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-[#F8F8F6] mb-1 line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] text-[#8E8E93] line-clamp-2 leading-relaxed mb-3">
                      {p.description}
                    </p>
                    <div className="text-[10px] font-mono text-emerald-400/90 flex flex-wrap gap-2 pt-2 border-t border-[#23301F]">
                      <span>模數: {p.modularGridCm}cm</span>
                      <span>RC牆: {p.rcWallThickness}cm</span>
                      <span>比例: {p.floorPlanScale}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Spec Configuration Panel */}
          <div className="bg-[#141d16] border border-[#3F5B63]/50 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23301F] pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-[#F8F8F6]">
                  {isEditingCustom ? '編輯自訂規格參數' : `${currentProfile.name} 詳細規範參數`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditingCustom ? (
                  <button
                    onClick={handleSaveAsCustom}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>儲存為自訂規格</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingCustom(true);
                      setCustomForm({ ...currentProfile, isCustom: true });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2e4029] text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>調整此規格參數</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              {/* Profile Name & Author */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">規格名稱</label>
                <input
                  type="text"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.name : currentProfile.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Modular Grid */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">工程契約模數 (cm 整數化)</label>
                <select
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.modularGridCm : currentProfile.modularGridCm}
                  onChange={(e) => setCustomForm({ ...customForm, modularGridCm: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold focus:border-amber-400 outline-none disabled:opacity-70"
                >
                  <option value={5}>5 cm 倍數 (加減設計 Corey 契約標準)</option>
                  <option value={10}>10 cm 模數 (CNS 建築標準)</option>
                  <option value={15}>15 cm 模數 (日式無印標準)</option>
                  <option value={30}>30 cm 尺模數</option>
                  <option value={1}>1 cm 自由尺寸 (不強制進位)</option>
                </select>
              </div>

              {/* RC Wall Thickness */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">RC 結構壁厚 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.rcWallThickness : currentProfile.rcWallThickness}
                  onChange={(e) => setCustomForm({ ...customForm, rcWallThickness: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Partition Wall Thickness */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">室內輕隔間壁厚 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.partitionWallThickness : currentProfile.partitionWallThickness}
                  onChange={(e) => setCustomForm({ ...customForm, partitionWallThickness: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Beam Height */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">結構大梁底淨高 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.defaultBeamHeight : currentProfile.defaultBeamHeight}
                  onChange={(e) => setCustomForm({ ...customForm, defaultBeamHeight: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Ceiling Drop */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">平頂天花降板高度 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.defaultCeilingDrop : currentProfile.defaultCeilingDrop}
                  onChange={(e) => setCustomForm({ ...customForm, defaultCeilingDrop: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Standard Door Width */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">標準房門寬度 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.doorStandardWidth : currentProfile.doorStandardWidth}
                  onChange={(e) => setCustomForm({ ...customForm, doorStandardWidth: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Standard Door Height */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">標準門高 (210cm / 240cm頂天)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.doorStandardHeight : currentProfile.doorStandardHeight}
                  onChange={(e) => setCustomForm({ ...customForm, doorStandardHeight: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Switch Height */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">開關面板離地高度 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.switchHeight : currentProfile.switchHeight}
                  onChange={(e) => setCustomForm({ ...customForm, switchHeight: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Low Outlet Height */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">一般插座離地高度 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.outletHeightLow : currentProfile.outletHeightLow}
                  onChange={(e) => setCustomForm({ ...customForm, outletHeightLow: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Counter Outlet Height */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">檯面/廚房插座高度 (cm)</label>
                <input
                  type="number"
                  disabled={!isEditingCustom}
                  value={isEditingCustom ? customForm.outletHeightCounter : currentProfile.outletHeightCounter}
                  onChange={(e) => setCustomForm({ ...customForm, outletHeightCounter: Number(e.target.value) })}
                  className="w-full bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2.5 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                />
              </div>

              {/* Drawing Scale */}
              <div className="space-y-1">
                <label className="text-[#8E8E93]">出圖圖紙與比例 (LayOut / CAD)</label>
                <div className="flex gap-2">
                  <select
                    disabled={!isEditingCustom}
                    value={isEditingCustom ? customForm.paperSize : currentProfile.paperSize}
                    onChange={(e) => setCustomForm({ ...customForm, paperSize: e.target.value as any })}
                    className="w-1/2 bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2 py-1.5 text-[#DDD7CE] focus:border-amber-400 outline-none disabled:opacity-70"
                  >
                    <option value="A3">ISO A3</option>
                    <option value="A2">ISO A2</option>
                    <option value="A1">ISO A1</option>
                  </select>
                  <select
                    disabled={!isEditingCustom}
                    value={isEditingCustom ? customForm.floorPlanScale : currentProfile.floorPlanScale}
                    onChange={(e) => setCustomForm({ ...customForm, floorPlanScale: e.target.value as any })}
                    className="w-1/2 bg-[#0d140e] border border-[#3F5B63]/60 rounded-lg px-2 py-1.5 text-amber-400 font-bold focus:border-amber-400 outline-none disabled:opacity-70"
                  >
                    <option value="1/40">1/40</option>
                    <option value="1/50">1/50</option>
                    <option value="1/30">1/30</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Result Display if Applied */}
          {auditChanges && (
            <div className="bg-[#121f15] border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>全案規格自動套用完成稽核報告 (共已更新 {auditChanges.length} 處放樣參數)</span>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                {auditChanges.length === 0 ? (
                  <p className="text-xs text-[#8E8E93] italic">全案所有空間與放樣圖元原本即 100% 符合此規格，無需調整！</p>
                ) : (
                  auditChanges.map((ch, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0e1710] border border-[#23301F] rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F8F8F6]">{ch.roomName}</span>
                        <span className="text-[#8E8E93]">·</span>
                        <span className="text-amber-300 font-medium">{ch.item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 line-through">{ch.before}</span>
                        <ArrowRight className="w-3 h-3 text-[#8E8E93]" />
                        <span className="text-emerald-400 font-bold">{ch.after}</span>
                        <span className="text-[#8E8E93] text-[10px]">({ch.reason})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#3F5B63]/40 bg-[#141d16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>目前全案共有 {rooms.length} 個空間將即時獲得契約模數化與圖框參數更新</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#23301F] hover:bg-[#2c3d27] text-[#DDD7CE] text-xs font-bold transition"
            >
              關閉
            </button>

            <button
              onClick={handleApplyToProject}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#121810] text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>一鍵自動套用至全案空間</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
