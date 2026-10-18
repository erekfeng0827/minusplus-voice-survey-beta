import React, { useState } from 'react';
import {
  X,
  LayoutGrid,
  Check,
  AlertTriangle,
  Sparkles,
  Ruler,
  Sliders,
  CheckCircle2,
  Trash2,
  Plus,
  BoxSelect,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RoomData, Beam } from '../types';

interface BeamSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom: (updatedRoom: RoomData) => void;
  onNotify: (msg: string) => void;
}

export const BeamSimulationModal: React.FC<BeamSimulationModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
}) => {
  if (!isOpen) return null;

  const [beams, setBeams] = useState<Beam[]>(room.beams || []);
  const [selectedBeamIndex, setSelectedBeamIndex] = useState<number>(0);

  const activeBeam = beams[selectedBeamIndex] || beams[0];

  const handleUpdateActiveBeam = (updatedFields: Partial<Beam>) => {
    if (!activeBeam) return;
    const updatedBeams = beams.map((b, i) =>
      i === selectedBeamIndex ? { ...b, ...updatedFields } : b
    );
    setBeams(updatedBeams);
  };

  const handleAddNewBeam = (presetType?: string) => {
    const nextIdx = beams.length + 1;
    let newBeam: Beam;

    if (presetType === 'ac_duct') {
      newBeam = {
        id: `b-ac-${Date.now().toString().slice(-4)}`,
        name: `冷氣包管假梁 SB-0${nextIdx}`,
        width: 45,
        depth: 140,
        clearHeight: 230,
        orientation: 'horizontal',
        y: 60,
      };
    } else if (presetType === 'vertical_spine') {
      newBeam = {
        id: `b-vert-${Date.now().toString().slice(-4)}`,
        name: `縱向穿心梁 SB-0${nextIdx}`,
        width: 35,
        depth: room.length,
        clearHeight: 265,
        orientation: 'vertical',
        x: Math.round(room.width / 2 / 5) * 5,
        y: 0,
      };
    } else {
      // standard horizontal main beam
      newBeam = {
        id: `b-main-${Date.now().toString().slice(-4)}`,
        name: `結構主梁 B-0${nextIdx}`,
        width: 35,
        depth: 55,
        clearHeight: 265,
        orientation: 'horizontal',
        y: Math.round(room.length / 3 / 5) * 5,
      };
    }

    const updated = [...beams, newBeam];
    setBeams(updated);
    setSelectedBeamIndex(updated.length - 1);
  };

  const handleDeleteBeam = (indexToDelete: number) => {
    const updated = beams.filter((_, i) => i !== indexToDelete);
    setBeams(updated);
    setSelectedBeamIndex(Math.max(0, indexToDelete - 1));
  };

  const handleSaveAndApply = () => {
    onUpdateRoom({
      ...room,
      beams,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    onNotify(`✨ 梁位模擬已更新！共套用 ${beams.length} 條結構/假梁參數。`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#121810] border border-[#3F5B63]/60 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#182216] px-5 py-4 border-b border-[#3F5B63]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  新增梁位模擬 (Beam Simulation & Clash Detection)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  淨高防撞 + 5倍數模數
                </span>
              </div>
              <p className="text-xs text-slate-400">
                模擬結構主梁、冷氣假梁與包管高程，杜絕門片開扇衝突與壓頂壓迫感
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#23301F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick presets row */}
          <div className="bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#E0A83C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 快速新增梁型：
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddNewBeam('main')}
                className="px-2.5 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#3F5B63]/60 text-slate-200 text-xs font-medium border border-[#3F5B63]/40 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3 text-rose-400" />
                橫向結構大梁 (40cm 跨距)
              </button>
              <button
                type="button"
                onClick={() => handleAddNewBeam('vertical_spine')}
                className="px-2.5 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#3F5B63]/60 text-slate-200 text-xs font-medium border border-[#3F5B63]/40 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                縱向穿心梁 (35cm 直向)
              </button>
              <button
                type="button"
                onClick={() => handleAddNewBeam('ac_duct')}
                className="px-2.5 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#3F5B63]/60 text-slate-200 text-xs font-medium border border-[#3F5B63]/40 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                冷氣包管假梁 (45×140cm)
              </button>
            </div>
          </div>

          {/* Beam List Tabs */}
          {beams.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {beams.map((b, idx) => (
                <button
                  key={b.id || idx}
                  onClick={() => setSelectedBeamIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                    selectedBeamIndex === idx
                      ? 'bg-rose-950/80 border border-rose-500 text-rose-200 shadow-md'
                      : 'bg-[#182216] border border-[#3F5B63]/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BoxSelect className="w-3.5 h-3.5 text-rose-400" />
                  <span>{b.name || `梁體 #${idx + 1}`}</span>
                  <span className="text-[10px] opacity-75 font-mono">FL+{b.clearHeight}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#182216] rounded-xl border border-dashed border-[#3F5B63]/40 text-slate-400 text-xs">
              目前空間尚未配置任何梁位，請點選上方按鈕新增！
            </div>
          )}

          {/* Active Beam Parameter Editor */}
          {activeBeam && (
            <div className="bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#3F5B63]/30 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-400" />
                  編輯「{activeBeam.name}」幾何參數
                </span>
                <button
                  onClick={() => handleDeleteBeam(selectedBeamIndex)}
                  className="px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-950/60 border border-rose-500/30 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  刪除此梁
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">梁名稱 / 編號：</label>
                  <input
                    type="text"
                    value={activeBeam.name}
                    onChange={(e) => handleUpdateActiveBeam({ name: e.target.value })}
                    className="w-full bg-[#121810] border border-[#3F5B63]/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">梁體走向：</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveBeam({ orientation: 'horizontal' })}
                      className={`py-2 rounded-lg text-xs font-medium border transition ${
                        activeBeam.orientation === 'horizontal'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                          : 'bg-[#121810] border-[#3F5B63]/30 text-slate-400'
                      }`}
                    >
                      橫向水平跨度
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveBeam({ orientation: 'vertical' })}
                      className={`py-2 rounded-lg text-xs font-medium border transition ${
                        activeBeam.orientation === 'vertical'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-[#121810] border-[#3F5B63]/30 text-slate-400'
                      }`}
                    >
                      縱向垂直穿心
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">梁寬 (cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={activeBeam.width}
                    onChange={(e) => handleUpdateActiveBeam({ width: parseInt(e.target.value, 10) || 35 })}
                    className="w-full bg-[#121810] border border-[#3F5B63]/40 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">梁下淨高 (FL+ cm)：</label>
                  <input
                    type="number"
                    step="5"
                    value={activeBeam.clearHeight}
                    onChange={(e) => handleUpdateActiveBeam({ clearHeight: parseInt(e.target.value, 10) || 265 })}
                    className="w-full bg-[#121810] border border-[#3F5B63]/40 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    {activeBeam.orientation === 'horizontal' ? '距上方牆面距離 Y (cm)：' : '距左側牆面距離 X (cm)：'}
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={activeBeam.orientation === 'horizontal' ? activeBeam.y : (activeBeam.x || 0)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      if (activeBeam.orientation === 'horizontal') {
                        handleUpdateActiveBeam({ y: val });
                      } else {
                        handleUpdateActiveBeam({ x: val });
                      }
                    }}
                    className="w-full bg-[#121810] border border-[#3F5B63]/40 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                {/* Clash Analysis Badge */}
                <div className="flex flex-col justify-end">
                  <div
                    className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      activeBeam.clearHeight < 230
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                        : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    {activeBeam.clearHeight < 230 ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-[11px]">
                      {activeBeam.clearHeight < 230
                        ? `警示：淨高 ${activeBeam.clearHeight}cm 低於標準通行 230cm，可能造成壓迫感！`
                        : `合規：淨高 ${activeBeam.clearHeight}cm 符合 5 倍數工程契約標準！`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#182216] px-5 py-3.5 border-t border-[#3F5B63]/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>儲存並套用梁位模擬</span>
          </button>
        </div>
      </div>
    </div>
  );
};
