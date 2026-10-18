import React, { useState } from 'react';
import { VoiceMemo } from '../types';
import {
  Mic,
  Volume2,
  X,
  MapPin,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Info,
  Sliders,
  Check,
} from 'lucide-react';

interface VoiceMemoModalProps {
  memo: VoiceMemo | null;
  onClose: () => void;
  onUpdateMemo: (updated: VoiceMemo) => void;
}

export const VoiceMemoModal: React.FC<VoiceMemoModalProps> = ({
  memo,
  onClose,
  onUpdateMemo,
}) => {
  if (!memo) return null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [text, setText] = useState<string>(memo.text);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate audio play duration
      setTimeout(() => {
        setIsPlaying(false);
      }, (memo.audioDurationSec || 4) * 1000);
    }
  };

  const handleSave = () => {
    onUpdateMemo({
      ...memo,
      text,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">口說備忘錄錨點檢驗</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  座標: ({memo.x}, {memo.y}) cm
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {memo.timestamp}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
            <div>
              <div className="text-xs font-semibold text-white">
                {isPlaying ? '現場錄音回放中...' : '現場口說錄音備忘'}
              </div>
              <div className="text-[10px] text-slate-400">
                音訊長度：{memo.audioDurationSec || 5.2} 秒 · 採樣率 44.1kHz
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-pink-400">
            <Volume2 className="w-4 h-4" />
            <span className="font-mono text-xs">{isPlaying ? 'PLAY' : 'READY'}</span>
          </div>
        </div>

        {/* Transcript text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">口說文字紀錄與施工備忘備註：</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 transition-all resize-none"
          />
        </div>

        {/* Type Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">屬性類別：</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              memo.type === 'warning'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}
          >
            {memo.type === 'warning' ? '結構與管線避讓警告' : '放樣尺寸與工料註記'}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-md flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            儲存並更新錨點
          </button>
        </div>
      </div>
    </div>
  );
};
