import React from 'react';
import { Trash2, AlertTriangle, RotateCcw, X, Check, ShieldCheck } from 'lucide-react';
import { RoomData } from '../types';

interface ClearAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  room: RoomData;
}

export const ClearAllConfirmModal: React.FC<ClearAllConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  room,
}) => {
  if (!isOpen) return null;

  const totalElements =
    (room.beams?.length || 0) +
    (room.doors?.length || 0) +
    (room.windows?.length || 0) +
    (room.voiceMemos?.length || 0) +
    (room.electricalPoints?.length || 0) +
    (room.lightingPoints?.length || 0) +
    (room.virtualAnnotations?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#121724] border border-rose-500/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">確認一鍵清空圖面？</h3>
              <p className="text-xs text-rose-300">空間：「{room.roomName}」</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-[#171d2b] p-3 rounded-xl border border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>即將清空的放樣圖元總數：</span>
              <span className="font-mono font-bold text-rose-400 text-sm">
                共 {totalElements} 個物件
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <div>• 結構梁位：{room.beams?.length || 0} 支</div>
              <div>• 門窗開口：{(room.doors?.length || 0) + (room.windows?.length || 0)} 處</div>
              <div>• 水電開關插座：{room.electricalPoints?.length || 0} 個</div>
              <div>• 現場口述錄音：{room.voiceMemos?.length || 0} 條</div>
              <div>• 尺寸與虛擬標註：{room.virtualAnnotations?.length || 0} 筆</div>
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>安全防呆保證：</strong>清空後系統會立即儲存歷史紀錄，若為誤按，您可隨時在工具列點擊<strong>「上一步 (復原)」</strong>或按鍵盤 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl+Z</kbd> 瞬間還原！
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#151c2a] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            取消保留
          </button>
          <button
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>確認一鍵清空</span>
          </button>
        </div>
      </div>
    </div>
  );
};
