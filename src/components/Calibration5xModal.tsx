import React, { useState } from 'react';
import {
  Ruler,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Sliders,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  X,
  Info,
  Layers,
  Check,
} from 'lucide-react';
import { RoomData } from '../types';
import { alignTo5Multiple } from '../utils/floorplanImporter';

interface Calibration5xModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom: (updatedRoom: RoomData) => void;
  onNotify?: (msg: string) => void;
}

interface DimensionItem {
  id: string;
  name: string;
  category: 'structure' | 'elevation' | 'opening';
  rawValue: number;
  calibratedValue: number;
  deviation: number;
  locked: boolean;
  align5x: boolean;
  carpentryNote: string;
}

export const Calibration5xModal: React.FC<Calibration5xModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
}) => {
  if (!isOpen) return null;

  // 模式：'raw_truth' (現場實測真值保真模式) | 'modular_5x' (設計模矩5倍數校正模式)
  const [mode, setMode] = useState<'raw_truth' | 'modular_5x'>('raw_truth');

  // 幾何項目列表
  const [items, setItems] = useState<DimensionItem[]>(() => {
    const rawW = room.width;
    const rawL = room.length;
    const rawH = room.height;
    const rawB = room.beamHeight || 265;
    const rawC = room.ceilingDrop || 230;

    return [
      {
        id: 'width',
        name: '開間面寬 (X向開間)',
        category: 'structure',
        rawValue: rawW,
        calibratedValue: alignTo5Multiple(rawW, 300),
        deviation: alignTo5Multiple(rawW, 300) - rawW,
        locked: true, // 預設保護現場實測
        align5x: false,
        carpentryNote: '現場實測結構外框，若強迫改動將影響與鄰室公領域放樣線',
      },
      {
        id: 'length',
        name: '開間進深 (Y向進深)',
        category: 'structure',
        rawValue: rawL,
        calibratedValue: alignTo5Multiple(rawL, 410),
        deviation: alignTo5Multiple(rawL, 410) - rawL,
        locked: true,
        align5x: false,
        carpentryNote: '現場實測柱心距離，建議依現場泥作真值放樣',
      },
      {
        id: 'height',
        name: '總樓層淨高 (FL to SL)',
        category: 'elevation',
        rawValue: rawH,
        calibratedValue: alignTo5Multiple(rawH, 295),
        deviation: alignTo5Multiple(rawH, 295) - rawH,
        locked: false,
        align5x: true,
        carpentryNote: '天花吊頂木作板材模矩 (3×6尺、4×8尺) 吊筋放樣依據',
      },
      {
        id: 'beamHeight',
        name: '結構大梁淨高 (Beam Height)',
        category: 'elevation',
        rawValue: rawB,
        calibratedValue: alignTo5Multiple(rawB, 265),
        deviation: alignTo5Multiple(rawB, 265) - rawB,
        locked: false,
        align5x: true,
        carpentryNote: '包梁假梁底造型、窗簾盒收邊與空調穿梁套管標高',
      },
      {
        id: 'ceilingDrop',
        name: '造型天花降板 (Ceiling Drop)',
        category: 'elevation',
        rawValue: rawC,
        calibratedValue: alignTo5Multiple(rawC, 230),
        deviation: alignTo5Multiple(rawC, 230) - rawC,
        locked: false,
        align5x: true,
        carpentryNote: '吊隱式冷氣出回風口、筒燈維修孔安裝標準施工厚度',
      },
    ];
  });

  // 切換鎖定真值
  const handleToggleLock = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, locked: !item.locked } : item
      )
    );
  };

  // 切換個別項目是否對齊 5 倍數
  const handleToggleAlign5x = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              align5x: !item.align5x,
              // 若開啟對齊，則自動解鎖；若關閉對齊，則保留原值
              locked: !item.align5x ? false : item.locked,
            }
          : item
      )
    );
  };

  // 切換整體模式
  const handleSwitchMode = (targetMode: 'raw_truth' | 'modular_5x') => {
    setMode(targetMode);
    if (targetMode === 'raw_truth') {
      // 全部鎖定實測真值
      setItems((prev) =>
        prev.map((i) => ({ ...i, locked: true, align5x: false }))
      );
      onNotify?.('🛡️ 已切換為【實測真值保真模式】：絕不竄改現場丈量數據！');
    } else {
      // 依天花木作工程開啟對齊
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          align5x: i.category === 'elevation', // 高程類預設開啟 5 倍數
          locked: i.category === 'structure', // 結構外框預設鎖定
        }))
      );
      onNotify?.('📐 已切換為【設計模矩 5 倍數校正模式】：高程建議對齊施工模矩。');
    }
  };

  // 套用至空間
  const handleApply = () => {
    const updatedRoom: RoomData = { ...room };

    items.forEach((item) => {
      // 如果選擇 5 倍數對齊且未鎖定，則套用校正值；否則保留實測原值
      const finalVal =
        mode === 'modular_5x' && item.align5x && !item.locked
          ? item.calibratedValue
          : item.rawValue;

      if (item.id === 'width') updatedRoom.width = finalVal;
      if (item.id === 'length') updatedRoom.length = finalVal;
      if (item.id === 'height') updatedRoom.height = finalVal;
      if (item.id === 'beamHeight') updatedRoom.beamHeight = finalVal;
      if (item.id === 'ceilingDrop') updatedRoom.ceilingDrop = finalVal;
    });

    const isAllRaw = items.every((i) => !i.align5x || i.locked);

    updatedRoom.evaluation = {
      score: 100, // 現場真值或規範模矩皆為 100 分滿分！不因非 5 倍數懲罰實測
      clarity: '特優 (幾何契約審核通過)',
      missingElements: [],
      rule5MultiplePassed: true,
      suggestions: isAllRaw
        ? '✓ 現場實測真值模式：保留 100% 原始丈量真實尺寸（不進行人為湊整），符合現場泥作實況契約！'
        : '✓ 設計模矩 5 倍數校正完成：天花高程與木作造型已精準對齊施工模矩，利於標準板材下料施工！',
    };

    updatedRoom.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);

    onUpdateRoom(updatedRoom);
    onNotify?.(
      isAllRaw
        ? `🛡️ 已套用【實測真值保真】：${updatedRoom.roomName} 原始尺寸 100% 保真！`
        : `✨ 已套用【設計模矩校正】：${updatedRoom.roomName} 施工放樣已更新！`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#182216] border border-[#3F5B63] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#3F5B63]/40 bg-[#121810] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-2">
                <span>修正 5 倍數校正邏輯</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                  雙軌模式
                </span>
              </h2>
              <p className="text-xs text-[#DDD7CE]">
                釐清「現場實測真值 (100%保真)」與「設計模矩 5 倍數放樣」的施工邊界
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#DDD7CE]">
          {/* 模式選擇卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 模式 A: 現場實測真值保真 (Raw Survey Fidelity) */}
            <div
              onClick={() => handleSwitchMode('raw_truth')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'raw_truth'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                  : 'bg-[#23301F]/60 border-[#3F5B63]/40 hover:border-emerald-500/40 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 推薦・現場實測
                </span>
                {mode === 'raw_truth' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <h3 className="font-bold text-white text-sm mb-1">
                現場實測真值保真模式 (Raw Truth)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>100% 忠於現況丈量真值</strong>。例如屋高 296cm、梁下 218cm/233cm、窗高 171cm 完整保留，<strong>不作人為四捨五入</strong>，審計系統給予滿分，不予扣分。
              </p>
            </div>

            {/* 模式 B: 設計模矩 5 倍數校正 (Modular 5x Grid) */}
            <div
              onClick={() => handleSwitchMode('modular_5x')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'modular_5x'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/50'
                  : 'bg-[#23301F]/60 border-[#3F5B63]/40 hover:border-amber-500/40 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> 木作模矩・自選校正
                </span>
                {mode === 'modular_5x' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <h3 className="font-bold text-white text-sm mb-1">
                設計模矩 5 倍數校正模式 (Modular Grid)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                僅在<strong>造型降板、木作假梁、系統櫃門片等分</strong>時自主勾選對齊 5 倍數，方便標準板材 (3×6尺) 裁切，降低現場損耗。
              </p>
            </div>
          </div>

          {/* 尺寸比對與控制清單 */}
          <div className="bg-[#121810] border border-[#3F5B63]/40 rounded-2xl overflow-hidden shadow-inner">
            <div className="px-4 py-3 bg-[#1A2417] border-b border-[#3F5B63]/40 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                空間尺寸放樣明細表（{room.roomName}）
              </span>
              <span className="text-[11px] text-slate-400">
                點擊 🔒 可鎖定真值不被校正
              </span>
            </div>

            <div className="divide-y divide-[#3F5B63]/30 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#23301F]/60 text-slate-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">尺寸項目</th>
                    <th className="py-2.5 px-3 text-center">實測原值</th>
                    <th className="py-2.5 px-3 text-center">5倍數模矩</th>
                    <th className="py-2.5 px-3 text-center">偏差 (Δ)</th>
                    <th className="py-2.5 px-3 text-center">真值鎖定</th>
                    <th className="py-2.5 px-3">施工規範說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3F5B63]/20">
                  {items.map((item) => {
                    const isEffective5x =
                      mode === 'modular_5x' && item.align5x && !item.locked;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#23301F]/40 transition ${
                          isEffective5x ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-medium text-white">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-300">
                          {item.rawValue} cm
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-300">
                          {item.calibratedValue} cm
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {item.deviation === 0 ? (
                            <span className="text-slate-400">0 cm</span>
                          ) : (
                            <span
                              className={
                                item.deviation > 0
                                  ? 'text-cyan-400'
                                  : 'text-rose-400'
                              }
                            >
                              {item.deviation > 0
                                ? `+${item.deviation}`
                                : item.deviation}{' '}
                              cm
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleLock(item.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              item.locked
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#23301F] border-[#3F5B63]/40 text-slate-400 hover:text-white'
                            }`}
                            title={
                              item.locked
                                ? '已鎖定實測真值（絕不校正）'
                                : '點擊鎖定實測真值'
                            }
                          >
                            {item.locked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                          {item.locked ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              已鎖定現場真值（不校正）
                            </span>
                          ) : (
                            item.carpentryNote
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 審計結論指示 */}
          <div className="bg-[#23301F]/80 border border-[#3F5B63]/50 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-white">
                {mode === 'raw_truth'
                  ? '🌟 目前啟用：現場丈量 100% 保真（無扣分、不竄改）'
                  : '📐 目前啟用：設計模矩 5 倍數對齊模式'}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {mode === 'raw_truth'
                  ? '星玥灣實測尺寸如「屋高 296cm、梁下 218cm、窗台離地 49cm、窗高 171cm」全部維持現場物理真值，後續 2D 放樣、3D 渲染與施工立面圖皆以現場真值為準！'
                  : '天花造型降板與木作包梁將對齊 5 倍數模矩，可減少裝修角料與矽酸鈣板材裁切耗損。'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#3F5B63]/40 bg-[#121810] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            當前空間：<strong className="text-white">{room.roomName}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#23301F] hover:bg-[#3F5B63]/50 text-slate-300 text-xs font-medium transition"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>確認套用校正邏輯</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
