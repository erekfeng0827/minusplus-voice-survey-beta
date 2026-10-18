import React, { useState, useEffect, useRef } from 'react';
import { RoomData, Column } from '../types';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CornerDownLeft,
  Volume2,
  Building,
  Ruler
} from 'lucide-react';

interface VoiceQuickMeasureBarProps {
  room: RoomData;
  onUpdateRoom: (room: RoomData) => void;
  onNotify: (msg: string) => void;
}

export const VoiceQuickMeasureBar: React.FC<VoiceQuickMeasureBarProps> = ({
  room,
  onUpdateRoom,
  onNotify,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [lastParsedFeedback, setLastParsedFeedback] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // 初始化 Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'zh-TW';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
          if (event.results[0].isFinal) {
            parseAndApplyVoiceText(currentText);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Speech recognition init error:', e);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      onNotify('您的瀏覽器不支援直接麥克風口述，您可在右側文字框輸入或點選範例！');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  /**
   * 智慧語音指令解析核心：長度、寬度、淨高、空間名稱、四角放柱
   */
  const parseAndApplyVoiceText = (textInput: string) => {
    const raw = textInput.trim();
    if (!raw) return;

    let text = raw
      .replace(/[，,。、；;！!？?]/g, ' ')
      .replace(/\s+/g, ' ');

    let newWidth = room.width;
    let newLength = room.length;
    let newHeight = room.height;
    let newName = room.roomName;
    let updatedColumns = [...(room.columns || [])];
    const parsedLogs: string[] = [];

    // 1. 長度 / 進深 / 總長
    // 支援："長 420"、"總長 500"、"長 5米"、"長 4.5米"、"長 3米8"
    const lengthMatch = text.match(/(?:總長|進深|深度|長度|長)\s*(?:為|是|約)?\s*(\d+(?:\.\d+)?)\s*(?:米|公尺|m|cm|公分)?/i);
    if (lengthMatch) {
      let val = parseFloat(lengthMatch[1]);
      if (text.includes(`${lengthMatch[1]}米`) || text.includes(`${lengthMatch[1]}公尺`) || text.includes(`${lengthMatch[1]}m`)) {
        val = Math.round(val * 100);
      } else if (val < 20) {
        // 口述例如 "長 5 寬 4" 小於 20 視為公尺
        val = Math.round(val * 100);
      }
      newLength = Math.max(30, Math.round(val));
      parsedLogs.push(`總長(進深) ${newLength}cm`);
    }

    // 2. 寬度 / 面寬 / 總寬
    const widthMatch = text.match(/(?:總寬|面寬|開間|寬度|寬)\s*(?:為|是|約)?\s*(\d+(?:\.\d+)?)\s*(?:米|公尺|m|cm|公分)?/i);
    if (widthMatch) {
      let val = parseFloat(widthMatch[1]);
      if (text.includes(`${widthMatch[1]}米`) || text.includes(`${widthMatch[1]}公尺`) || text.includes(`${widthMatch[1]}m`)) {
        val = Math.round(val * 100);
      } else if (val < 20) {
        val = Math.round(val * 100);
      }
      newWidth = Math.max(30, Math.round(val));
      parsedLogs.push(`總寬(面寬) ${newWidth}cm`);
    }

    // 3. 高度 / RC淨高
    const heightMatch = text.match(/(?:RC|樓高|淨高|高度|高)\s*(?:為|是|約)?\s*(\d+(?:\.\d+)?)\s*(?:米|公尺|m|cm|公分)?/i);
    if (heightMatch) {
      let val = parseFloat(heightMatch[1]);
      if (val < 10) val = Math.round(val * 100);
      newHeight = Math.max(100, Math.round(val));
      parsedLogs.push(`淨高 ${newHeight}cm`);
    }

    // 4. 空間名稱識別
    const roomNames = ['客廳', '主臥房', '主臥', '次臥', '臥室', '玄關', '書房', '餐廳', '廚房', '陽台', '更衣室', '衛浴'];
    for (const rName of roomNames) {
      if (text.includes(rName)) {
        newName = rName === '主臥' ? '主臥房' : rName;
        parsedLogs.push(`空間名稱【${newName}】`);
        break;
      }
    }

    // 5. 語音插柱指令 (例如："左上角柱子 50"、"右上角放柱"、"四角放柱")
    if (text.includes('四角') || text.includes('四個角')) {
      const corners: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[] = [
        'top-left', 'top-right', 'bottom-left', 'bottom-right'
      ];
      const cNames = ['左上', '右上', '左下', '右下'];
      corners.forEach((c, i) => {
        if (!updatedColumns.find((col) => col.corner === c)) {
          updatedColumns.push({
            id: `col_${Date.now()}_${c}`,
            name: `C${updatedColumns.length + 1} ${cNames[i]}角柱`,
            width: 50, depth: 50, positionType: 'corner', corner: c,
            wall: c.startsWith('top') ? 'north' : 'south', offset: 0,
            x: c.endsWith('left') ? 0 : Math.max(0, newWidth - 50),
            y: c.startsWith('top') ? 0 : Math.max(0, newLength - 50),
          });
        }
      });
      parsedLogs.push('一鍵四角置柱');
    } else {
      const cornerMap: { [key: string]: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' } = {
        '左上': 'top-left', '西北': 'top-left',
        '右上': 'top-right', '東北': 'top-right',
        '左下': 'bottom-left', '西南': 'bottom-left',
        '右下': 'bottom-right', '東南': 'bottom-right',
      };
      for (const [key, cId] of Object.entries(cornerMap)) {
        if (text.includes(key) && (text.includes('柱') || text.includes('柱子'))) {
          // 抓取柱寬
          const colSizeMatch = text.match(new RegExp(`${key}[^0-9]*(\\d{2})`));
          const size = colSizeMatch ? parseInt(colSizeMatch[1], 10) : 50;
          if (!updatedColumns.find((col) => col.corner === cId)) {
            updatedColumns.push({
              id: `col_${Date.now()}_${cId}`,
              name: `C${updatedColumns.length + 1} ${key}柱`,
              width: size, depth: size, positionType: 'corner', corner: cId,
              wall: cId.startsWith('top') ? 'north' : 'south', offset: 0,
              x: cId.endsWith('left') ? 0 : Math.max(0, newWidth - size),
              y: cId.startsWith('top') ? 0 : Math.max(0, newLength - size),
            });
            parsedLogs.push(`${key}角柱 ${size}×${size}cm`);
          }
        }
      }
    }

    if (parsedLogs.length > 0) {
      onUpdateRoom({
        ...room,
        roomName: newName,
        width: newWidth,
        length: newLength,
        height: newHeight,
        columns: updatedColumns,
      });

      const feedback = `🎉 已依口述更新：${parsedLogs.join(' · ')}`;
      setLastParsedFeedback(feedback);
      onNotify(feedback);
    } else {
      onNotify(`收到「${raw}」，請嘗試說出關鍵字如：「長 450 寬 380」或「客廳 總長 5米 寬 4米」`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    parseAndApplyVoiceText(manualText);
    setManualText('');
  };

  return (
    <div className="bg-gradient-to-r from-[#172216] via-[#15231c] to-[#121c16] border-2 border-emerald-500/50 rounded-2xl p-4 md:p-5 shadow-2xl space-y-3">
      {/* 頂部標題與狀態 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-emerald-300">
                🎙️ 語音極速丈量 (用嘴巴直接報尺寸)
              </span>
              <span className="text-[10px] bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                現場丈量零負擔
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              直接點擊麥克風說話，說出空間長度與寬度，系統即時自動放樣！
            </p>
          </div>
        </div>

        {/* 聆聽狀態指示 */}
        {isListening && (
          <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/60 px-3 py-1.5 rounded-full text-xs text-red-200 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold">正在聆聽中... 請說話</span>
          </div>
        )}
      </div>

      {/* 核心語音大按鈕與輸入列 */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        {/* 大麥克風啟動按鈕 */}
        <button
          onClick={toggleListening}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer shadow-lg ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 ring-4 ring-red-500/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-bounce" />
              <span>點擊結束口述</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-emerald-100" />
              <span>點擊說話 (例如「長 420 寬 360」)</span>
            </>
          )}
        </button>

        {/* 文字輸入備用框 (方便手動輸入或貼上) */}
        <form onSubmit={handleManualSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={isListening ? transcript : manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={isListening ? '辨識中...' : '或在此輸入口述文字，如：長 420 寬 360、右上角柱子 50'}
              className="w-full bg-[#0d140e] border border-emerald-500/40 rounded-xl px-3.5 py-3 text-xs text-emerald-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-400 pr-16"
            />
            {manualText && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                辨識
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 常用範例快速點擊按鈕 (一秒代入口述指令) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="text-neutral-400 text-[11px] font-medium">常見口述快速點測：</span>
        {[
          { label: '「總長 420 總寬 360」', val: '總長 420 總寬 360' },
          { label: '「客廳 長 5米 寬 4米 高 280」', val: '客廳 長 5米 寬 4米 高 280' },
          { label: '「主臥房 長 480 寬 380」', val: '主臥房 長 480 寬 380' },
          { label: '「四角放柱」', val: '四角放柱' },
          { label: '「右上角柱子 50」', val: '右上角柱子 50' },
        ].map((chip) => (
          <button
            key={chip.val}
            onClick={() => parseAndApplyVoiceText(chip.val)}
            className="px-2.5 py-1 rounded-lg bg-[#142016] hover:bg-emerald-950 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-mono transition active:scale-95 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 辨識成功即時反饋條 */}
      {lastParsedFeedback && (
        <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl flex items-center gap-2 text-xs text-emerald-200 animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastParsedFeedback}</span>
        </div>
      )}
    </div>
  );
};
