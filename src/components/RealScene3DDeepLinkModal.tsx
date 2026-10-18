import React, { useState } from 'react';
import { RoomData, StitchedFloorPlanResult } from '../types';
import {
  ExternalLink,
  Copy,
  Check,
  Camera,
  Layers,
  Sparkles,
  Download,
  Share2,
  Box,
  Compass,
  Eye,
  Maximize2,
  Sliders,
  CheckCircle2,
  X,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { generateSketchupDxfString } from '../utils/sketchupExporter';

interface RealScene3DDeepLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: RoomData;
  rooms: RoomData[];
  onSelectRoom: (roomId: string) => void;
  onEnter3DScene: (roomId: string, viewMode?: 'iso' | 'eye_level' | 'top') => void;
  onNotify?: (msg: string) => void;
}

export const RealScene3DDeepLinkModal: React.FC<RealScene3DDeepLinkModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  rooms,
  onSelectRoom,
  onEnter3DScene,
  onNotify,
}) => {
  const [selectedTargetRoomId, setSelectedTargetRoomId] = useState<string>(currentRoom.id);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'eye_level' | 'top'>('iso');
  const [lightingPreset, setLightingPreset] = useState<'2700k' | '5500k' | 'clay'>('2700k');
  const [enablePbrTextures, setEnablePbrTextures] = useState<boolean>(true);
  const [enableAoShadows, setEnableAoShadows] = useState<boolean>(true);

  if (!isOpen) return null;

  const targetRoom = rooms.find((r) => r.id === selectedTargetRoomId) || currentRoom;

  // Generate deep link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-corey8f.app';
  const deepLinkUrl = `${origin}?view=3d&room=${targetRoom.id}&cam=${cameraPreset}&light=${lightingPreset}&ao=${enableAoShadows ? '1' : '0'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLinkUrl);
    setCopiedLink(true);
    onNotify?.('✓ 實景 3D 深度連結已複製至剪貼簿！可直接傳給業主或工地領班預覽');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportSkpDxf = () => {
    const dxfContent = generateSketchupDxfString(rooms, '星玥灣 8F 全層 3D 放樣模型');
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星玥灣8F_SketchUp實景3D相容模型_${targetRoom.roomName}.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.(`✓ 已匯出「${targetRoom.roomName}」SketchUp (SU) 專用 3D 幾何 DXF 模型！`);
  };

  const handleLaunch3D = () => {
    onSelectRoom(targetRoom.id);
    onEnter3DScene(targetRoom.id, cameraPreset);
    onClose();
    onNotify?.(`🚀 已深度直通「${targetRoom.roomName}」真實 3D 實景視界！`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#121810] border border-[#3F5B63]/60 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1A2417] border-b border-[#3F5B63]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/30 border border-amber-400/40 text-amber-300">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F8F8F6]">實景 3D 深度連結</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 font-mono">
                  WebGL 2.0 · PBR 光影直通
                </span>
              </div>
              <p className="text-xs text-[#DDD7CE]/70">
                直通現場真實高程、真實大梁避讓 (FL+218~265) 與門窗真實淨空之 3D 空間導航
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23301F] text-[#DDD7CE] hover:text-white hover:bg-rose-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 空間快速選擇 */}
          <div>
            <label className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider block mb-2">
              1. 選擇深度錨定空間 (Select Target Space)：
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {rooms.map((r) => {
                const isSelected = r.id === targetRoom.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedTargetRoomId(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#23301F] border-[#E0A83C] shadow-md shadow-amber-950/40 ring-1 ring-[#E0A83C]'
                        : 'bg-[#161F13] border-[#3F5B63]/40 text-[#DDD7CE] hover:border-[#3F5B63]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#F8F8F6]">{r.roomName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#E0A83C]" />}
                    </div>
                    <div className="text-[10px] text-[#DDD7CE]/60 font-mono">
                      {r.width} × {r.length} cm
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                      梁下 FL+{r.beamHeight} | 降板 FL+{r.ceilingDrop}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 視角與渲染參數設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 視角預設 */}
            <div className="bg-[#1A2417] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
              <label className="text-xs font-bold text-[#F8F8F6] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>初始相機視角 (Camera View Preset)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'iso', label: '等角鳥瞰', desc: '全景透視' },
                  { id: 'eye_level', label: '視平線 150cm', desc: '真人沉浸視角' },
                  { id: 'top', label: '正俯瞰圖', desc: '平面幾何對位' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraPreset(cam.id as any)}
                    className={`p-2 rounded-xl text-center border text-xs transition ${
                      cameraPreset === cam.id
                        ? 'bg-[#E0A83C] text-[#121810] font-black border-[#E0A83C]'
                        : 'bg-[#121810] text-[#DDD7CE] border-[#3F5B63]/40 hover:bg-[#23301F]'
                    }`}
                  >
                    <div>{cam.label}</div>
                    <div className="text-[9px] opacity-70">{cam.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 光影與材質環境 */}
            <div className="bg-[#1A2417] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
              <label className="text-xs font-bold text-[#F8F8F6] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>光影氛圍濾鏡 (Lighting & Shading)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2700k', label: '2700K 溫馨暖光', color: 'from-amber-500/20 to-orange-500/20' },
                  { id: '5500k', label: '5500K 自然採光', color: 'from-sky-500/20 to-cyan-500/20' },
                  { id: 'clay', label: '幾何素模白模', color: 'from-slate-500/20 to-zinc-500/20' },
                ].map((light) => (
                  <button
                    key={light.id}
                    onClick={() => setLightingPreset(light.id as any)}
                    className={`p-2 rounded-xl text-center border text-xs transition ${
                      lightingPreset === light.id
                        ? 'bg-[#E0A83C] text-[#121810] font-black border-[#E0A83C]'
                        : 'bg-[#121810] text-[#DDD7CE] border-[#3F5B63]/40 hover:bg-[#23301F]'
                    }`}
                  >
                    <div>{light.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#DDD7CE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAoShadows}
                    onChange={(e) => setEnableAoShadows(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>開啟 AO 環境光遮蔽與接觸陰影 (Soft Shadows)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. 實景 3D 深度連結網址生成區 */}
          <div className="bg-[#161F13] p-4 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E0A83C] flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                <span>專屬實景 3D 深度直通連結 (Deep Link URL)：</span>
              </span>
              <span className="text-[10px] text-[#DDD7CE]/70">免安裝 App · 瀏覽器秒開</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={deepLinkUrl}
                className="flex-1 bg-[#121810] border border-[#3F5B63]/60 rounded-xl px-3 py-2 text-xs text-amber-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E0A83C] hover:bg-[#c9922c] text-[#121810]'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '已複製！' : '複製連結'}</span>
              </button>
            </div>
          </div>

          {/* 4. 規格與 SketchUp 互通說明 */}
          <div className="p-4 rounded-2xl bg-[#1A2417] border border-[#3F5B63]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F8F8F6]">
                <Box className="w-4 h-4 text-emerald-400" />
                <span>SketchUp (SU) 施工實體相容格式</span>
              </div>
              <p className="text-[11px] text-[#DDD7CE]/70">
                可將真實開間面寬、進深、真實大梁位置直接匯出為 SketchUp 幾何群組 (含 SKP_WALL、SKP_BEAM、SKP_OPENING 圖層)。
              </p>
            </div>
            <button
              onClick={handleExportSkpDxf}
              className="px-4 py-2 rounded-xl bg-[#23301F] hover:bg-[#3F5B63]/60 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出 SU 專用 3D DXF</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1A2417] border-t border-[#3F5B63]/40 flex items-center justify-between">
          <div className="text-xs text-[#DDD7CE]/60">
            目前錨定：<strong className="text-amber-300">{targetRoom.roomName}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#23301F] text-[#DDD7CE] text-xs font-medium hover:bg-[#3F5B63]/50 transition"
            >
              關閉
            </button>
            <button
              onClick={handleLaunch3D}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#121810] text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-950/40 transition active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>立即進入「{targetRoom.roomName}」實景 3D 視界</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
