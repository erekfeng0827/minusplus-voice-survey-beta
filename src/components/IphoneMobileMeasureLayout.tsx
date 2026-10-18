import React, { useState } from 'react';
import { RoomData, VoiceMemo } from '../types';
import { StakingCanvas2D } from './StakingCanvas2D';
import {
  Mic,
  Video,
  Layers,
  Box,
  FileText,
  Sliders,
  ChevronUp,
  X,
  Plus,
  Compass,
  Sparkles,
  ShieldCheck,
  Download,
  Palette,
  Maximize2,
  RotateCcw,
  Smartphone,
  Tablet,
  CheckCircle2,
  ChevronRight,
  Wifi,
  Battery,
} from 'lucide-react';

interface IphoneMobileMeasureLayoutProps {
  room: RoomData;
  allRooms: RoomData[];
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onUpdateRoom: (updated: RoomData) => void;
  activeViewMode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep';
  setActiveViewMode: (mode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep') => void;
  onSelectVoiceMemo: (memo: VoiceMemo) => void;
  onOpenVoiceModal: () => void;
  onSwitchTo3D: () => void;
  onOpenDeviceSwitcher: () => void;
  onOpenFastBeam: () => void;
  onOpenHatchModal: () => void;
  onOpenBlockLibrary: () => void;
  onOpenCompliance: () => void;
  onOpenQuotation: () => void;
  onExportDxf: () => void;
  onOpenCameraScan: () => void;
  onOpenCadStandards: () => void;
  onNotify: (msg: string) => void;
  zoomScale: number;
}

export const IphoneMobileMeasureLayout: React.FC<IphoneMobileMeasureLayoutProps> = ({
  room,
  allRooms,
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  activeViewMode,
  setActiveViewMode,
  onSelectVoiceMemo,
  onOpenVoiceModal,
  onSwitchTo3D,
  onOpenDeviceSwitcher,
  onOpenFastBeam,
  onOpenHatchModal,
  onOpenBlockLibrary,
  onOpenCompliance,
  onOpenQuotation,
  onExportDxf,
  onOpenCameraScan,
  onOpenCadStandards,
  onNotify,
  zoomScale,
}) => {
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="flex flex-col h-full w-full bg-[#121810] text-[#F8F8F6] select-none overflow-hidden relative"
      style={{
        transform: zoomScale !== 1.0 ? `scale(${zoomScale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* 1. iOS Status Bar & Dynamic Island */}
      <div className="pt-2 px-5 pb-1 flex items-center justify-between bg-[#151A14] border-b border-[#3F5B63]/30 z-20">
        <span className="text-xs font-semibold text-[#DDD7CE]">{currentTime}</span>

        {/* Dynamic Island Capsule */}
        <button
          onClick={onOpenDeviceSwitcher}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#000000] border border-[#3F5B63]/60 shadow-inner group active:scale-95 transition"
          title="點擊切換設備模組 (iPhone / iPad / 桌面)"
        >
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
          <span className="text-[11px] font-bold text-[#E0A83C] flex items-center gap-1">
            iPhone 模組
          </span>
          <span className="text-[9px] text-[#DDD7CE]/60">5倍數契約生效</span>
        </button>

        <div className="flex items-center gap-2 text-[#DDD7CE]">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 text-[#30D158]" />
        </div>
      </div>

      {/* 2. Compact Room Selector Bar */}
      <div className="px-3 py-2 bg-[#23301F]/90 border-b border-[#3F5B63]/40 flex items-center gap-2 overflow-x-auto hide-scrollbar z-10">
        {allRooms.map((r) => {
          const isSelected = r.id === room.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoom(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#E0A83C] text-[#23301F] shadow-md shadow-[#E0A83C]/20'
                  : 'bg-[#151A14] text-[#DDD7CE] border border-[#3F5B63]/40 hover:bg-[#3F5B63]/30'
              }`}
            >
              <span>{r.roomName}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-[#23301F]' : 'text-[#8E8E93]'}`}>
                {r.width}×{r.length}
              </span>
            </button>
          );
        })}
        <button
          onClick={onAddRoom}
          className="p-1.5 rounded-full bg-[#151A14] text-[#DDD7CE] border border-dashed border-[#3F5B63] hover:text-[#E0A83C] flex items-center justify-center flex-shrink-0"
          title="新增房間"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Sub-HUD: Height Benchmark Badge & Fast View Mode */}
      <div className="px-3 py-1.5 bg-[#151A14] flex items-center justify-between text-[11px] border-b border-[#3F5B63]/20">
        <div className="flex items-center gap-1 text-[#DDD7CE]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
          <span>梁下淨高 <strong className="text-[#E0A83C] font-mono">{room.beamHeight}</strong></span>
          <span className="text-[#8E8E93]">|</span>
          <span>降板 <strong className="text-[#E0A83C] font-mono">{room.ceilingDrop}</strong></span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#23301F] p-0.5 rounded-lg border border-[#3F5B63]/40">
          {(['staking', 'ceiling_drop', 'mep'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveViewMode(m)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                activeViewMode === m
                  ? 'bg-[#3F5B63] text-white shadow-sm'
                  : 'text-[#DDD7CE] hover:text-white'
              }`}
            >
              {m === 'staking' ? '放樣' : m === 'ceiling_drop' ? '降板' : '水電'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Canvas Viewport (Main Touch Workspace) */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#182016]">
        <StakingCanvas2D
          room={room}
          activeViewMode={activeViewMode}
          setActiveViewMode={setActiveViewMode}
          onSelectVoiceMemo={onSelectVoiceMemo}
          onUpdateRoom={onUpdateRoom}
          onSwitchTo3D={onSwitchTo3D}
        />

        {/* Floating Quick Action Buttons on Canvas */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Switch 2D / 3D */}
          <button
            onClick={onSwitchTo3D}
            className="w-10 h-10 rounded-2xl bg-[#E0A83C] text-[#23301F] shadow-lg flex items-center justify-center font-bold active:scale-90 transition border border-[#F8F8F6]/20"
            title="切換至 3D 模擬"
          >
            <Box className="w-5 h-5" />
          </button>

          {/* Quick Add Beam */}
          <button
            onClick={onOpenFastBeam}
            className="w-10 h-10 rounded-2xl bg-[#23301F]/90 backdrop-blur-md text-[#E0A83C] border border-[#3F5B63] shadow-lg flex items-center justify-center active:scale-90 transition"
            title="快建實樑"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Camera Scan */}
          <button
            onClick={onOpenCameraScan}
            className="w-10 h-10 rounded-2xl bg-[#23301F]/90 backdrop-blur-md text-[#30D158] border border-[#3F5B63] shadow-lg flex items-center justify-center active:scale-90 transition"
            title="360° 空間攝影"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Floating Drawer Peek Button */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => setIsToolDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#23301F]/90 backdrop-blur-md border border-[#3F5B63] text-xs text-[#E0A83C] shadow-lg active:scale-95"
          >
            <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
            <span>滑出手機快捷工具箱</span>
          </button>
        </div>
      </div>

      {/* 5. iOS Bottom Ergonomic Thumb Bar */}
      <div className="bg-[#151A14]/95 backdrop-blur-xl border-t border-[#3F5B63]/40 px-4 py-2 flex items-center justify-between relative z-30 pb-5">
        
        {/* Left 1: 360 攝影 */}
        <button
          onClick={onOpenCameraScan}
          className="flex flex-col items-center gap-1 text-[#DDD7CE] hover:text-[#E0A83C] active:scale-95 transition"
        >
          <Video className="w-5 h-5" />
          <span className="text-[10px]">空間攝影</span>
        </button>

        {/* Left 2: 圖塊庫 */}
        <button
          onClick={onOpenBlockLibrary}
          className="flex flex-col items-center gap-1 text-[#DDD7CE] hover:text-[#E0A83C] active:scale-95 transition"
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px]">圖塊放樣</span>
        </button>

        {/* Center: BIG Floating Action Voice Mic Button (靈動島語音大鍵) */}
        <div className="-mt-7">
          <button
            onClick={onOpenVoiceModal}
            className="w-14 h-14 rounded-full bg-[#B4503A] text-white shadow-[0_8px_24px_rgba(180,80,58,0.6)] border-2 border-[#F8F8F6]/30 flex items-center justify-center active:scale-90 transition group"
            title="現場口說語音備忘"
          >
            <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Right 1: 圖紙與報價 */}
        <button
          onClick={() => {
            onExportDxf();
            onNotify('已在 iPhone 模組觸發 DXF 標準圖面輸出！');
          }}
          className="flex flex-col items-center gap-1 text-[#DDD7CE] hover:text-[#E0A83C] active:scale-95 transition"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px]">匯出DXF</span>
        </button>

        {/* Right 2: 更多工具抽屜 */}
        <button
          onClick={() => setIsToolDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-[#DDD7CE] hover:text-[#E0A83C] active:scale-95 transition"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px]">工具選單</span>
        </button>

      </div>

      {/* 6. Mobile Bottom Sheet Drawer */}
      {isToolDrawerOpen && (
        <div className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
          <div className="bg-[#1C1C1E] border-t border-[#38383A] rounded-t-[32px] w-full max-w-lg p-5 text-[#EBEBF5] max-h-[80vh] overflow-y-auto shadow-2xl">
            
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-[#38383A] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#38383A]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#30D158]" />
                  iPhone 單手工具箱
                </h3>
                <p className="text-xs text-[#8E8E93]">專為手機垂直螢幕最佳化之快速功能</p>
              </div>
              <button
                onClick={() => setIsToolDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => {
                  setIsToolDrawerOpen(false);
                  onOpenFastBeam();
                }}
                className="p-3.5 rounded-2xl bg-[#23301F] border border-[#3F5B63] text-left hover:border-[#E0A83C] transition"
              >
                <Layers className="w-5 h-5 text-[#E0A83C] mb-1" />
                <div className="text-xs font-bold text-white">快建結構實樑</div>
                <div className="text-[10px] text-[#DDD7CE]">自動鎖定 265cm 梁高</div>
              </button>

              <button
                onClick={() => {
                  setIsToolDrawerOpen(false);
                  onOpenHatchModal();
                }}
                className="p-3.5 rounded-2xl bg-[#23301F] border border-[#3F5B63] text-left hover:border-[#E0A83C] transition"
              >
                <Palette className="w-5 h-5 text-[#30D158] mb-1" />
                <div className="text-xs font-bold text-white">剖面填滿樣式</div>
                <div className="text-[10px] text-[#DDD7CE]">HATCH 幾何對縫</div>
              </button>

              <button
                onClick={() => {
                  setIsToolDrawerOpen(false);
                  onOpenCompliance();
                }}
                className="p-3.5 rounded-2xl bg-[#23301F] border border-[#3F5B63] text-left hover:border-[#E0A83C] transition"
              >
                <ShieldCheck className="w-5 h-5 text-[#B4503A] mb-1" />
                <div className="text-xs font-bold text-white">5倍數規範檢核</div>
                <div className="text-[10px] text-[#DDD7CE]">265/230/215 檢查</div>
              </button>

              <button
                onClick={() => {
                  setIsToolDrawerOpen(false);
                  onOpenQuotation();
                }}
                className="p-3.5 rounded-2xl bg-[#23301F] border border-[#3F5B63] text-left hover:border-[#E0A83C] transition"
              >
                <FileText className="w-5 h-5 text-[#0A84FF] mb-1" />
                <div className="text-xs font-bold text-white">工程預算概算</div>
                <div className="text-[10px] text-[#DDD7CE]">坪數與單價報表</div>
              </button>
            </div>

            {/* Device Switcher Card */}
            <div className="p-4 rounded-2xl bg-[#2C2C2E] border border-[#38383A] mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#E0A83C]" />
                  切換至其他設備模組
                </div>
                <button
                  onClick={() => {
                    setIsToolDrawerOpen(false);
                    onOpenDeviceSwitcher();
                  }}
                  className="text-xs font-bold text-[#E0A83C] hover:underline"
                >
                  設定與比例調整 ➜
                </button>
              </div>
              <p className="text-[11px] text-[#8E8E93]">
                若您在平板上測試，可隨時切回「iPad 模組」以獲得大螢幕 4:3 視野！
              </p>
            </div>

            <button
              onClick={() => setIsToolDrawerOpen(false)}
              className="w-full py-3 bg-[#3F5B63] hover:bg-[#2c4046] text-white rounded-2xl text-xs font-bold transition"
            >
              收起工具箱
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
