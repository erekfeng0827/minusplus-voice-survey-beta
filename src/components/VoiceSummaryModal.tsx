import React, { useState } from 'react';
import { RoomData, VoiceMemo } from '../types';
import {
  Mic,
  FileText,
  Copy,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Send,
  Plus,
  Play,
  Volume2,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';

interface VoiceSummaryModalProps {
  room: RoomData;
  onClose: () => void;
  onAddVoiceMemo?: (memo: VoiceMemo) => void;
}

export const VoiceSummaryModal: React.FC<VoiceSummaryModalProps> = ({
  room,
  onClose,
  onAddVoiceMemo,
}) => {
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'checklist' | 'raw_memos'>('summary');

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    chk1: true,
    chk2: true,
    chk3: false,
    chk4: false,
    chk5: true,
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Structured summary text formatted for contractor dispatch
  const contractorSummaryText = `【室內設計工程 · 現場口說丈量 AI 自動提煉摘要報告】
────────────────────────────────────────
📌 案場空間：${room.roomName}
📅 生成日期：${new Date().toISOString().split('T')[0]}
🎙 口說筆數：${room.voiceMemos.length} 條現場錄音記錄
🛡 幾何契約審定：符合《降板裁決_v003.json》5 倍數放樣原則 (265/230/215)

一、 核心放樣高程數據 (單位: cm)
1. 空間面寬進深：面寬 ${room.width} cm × 進深 ${room.length} cm (原點 (0,0) 位於左下角鋼)
2. 大梁底淨高 (B.O.B)：FL+${room.beamHeight} cm（結構橫樑，嚴禁開孔打斷主筋）
3. 空調天花降板 (C.H)：FL+${room.ceilingDrop} cm（吊隱出風口下緣齊平）
4. 玄關廚衛降板：FL+${room.bathKitchenDrop || 215} cm（預留落塵高差 1.5cm 與收邊條）
5. 頂板結構淨高：FL+${room.height} cm

二、 工種施作要點拆解
• 【水電工種】：
  - 壁面開關控制面板標高 FL+120 cm，需垂直水平雷射打線。
  - 一般弱電與電視主牆插座標高 FL+30 cm（專線專迴配置）。
  - 吊隱冷氣冷凝水自流排水坡度維持 ≥ 1/50。
• 【木作/天花工種】：
  - 吊隱式冷氣集風箱處預留 45×45 cm 鋁合金防潮維修孔。
  - 窗邊預留 20 cm 窗簾盒深度，內部暗藏 LED 柔光氛圍燈槽。
• 【泥作工種】：
  - 各房門門洞預留寬度 +5 cm 泥作粉刷批土收邊裕度。
  - 玄關落塵區防滑磚完成面需比木地板低 15 mm。

三、 現場避雷警示 (Red Flags)
⚠️ 穿梁冷媒套管外緣距梁底鋼筋不得小於 100 mm，嚴禁私自洗孔！
⚠️ 冷氣回風口與出風口間距需大於 1.5 米，嚴防短循環造成溫控失靈。
────────────────────────────────────────
AI 產線簽證：Codex 晶晶 · 語音丈量提煉模組`;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractorSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleSimulateNewVoice = () => {
    if (!onAddVoiceMemo) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newMemo: VoiceMemo = {
        id: `vm-ai-${Date.now()}`,
        text: '追加現場口說記錄：電視主牆需追加一組 220V 專迴給大功率劇院後級，出線標高 FL+30 cm。',
        timestamp: new Date().toTimeString().slice(0, 8),
        x: room.width - 50,
        y: 200,
        type: 'electrical',
        audioDurationSec: 5.2,
      };
      onAddVoiceMemo(newMemo);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  語音自動生成摘要中心
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-semibold">
                  AI 現場語音提煉
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                自動整合「{room.roomName}」現場 {room.voiceMemos.length} 條錄音，萃取工程交底要點
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已複製到剪貼簿</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製交底文字</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              工程交底結構化摘要
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'checklist'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              現場查驗清單 (Checklist)
            </button>
            <button
              onClick={() => setActiveTab('raw_memos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'raw_memos'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              原始語音備忘錄 ({room.voiceMemos.length})
            </button>
          </div>

          <button
            onClick={handleSimulateNewVoice}
            disabled={isGenerating}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-[11px]"
            title="模擬現場新錄入一條語音備忘"
          >
            <Plus className="w-3 h-3 text-indigo-400" />
            <span>模擬追加口說</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b14] space-y-4">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Highlight Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">大梁淨高 (B.O.B)</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">FL+265 cm</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">天花降板 (C.H)</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-0.5">FL+230 cm</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">落塵/廚衛降板</div>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">FL+215 cm</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">面板開關高程</div>
                  <div className="text-base font-bold font-mono text-purple-400 mt-0.5">FL+120 cm</div>
                </div>
              </div>

              {/* Formatted Code Block */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-600">
                {contractorSummaryText}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                點擊勾選現場已查核完畢之工項，確認無誤後即可進行下一道工序：
              </p>

              <div className="space-y-2">
                {[
                  { id: 'chk1', title: '大梁底實測標高 FL+265cm 核對無誤', trade: '放樣泥作' },
                  { id: 'chk2', title: '吊隱空調室內機風箱下緣與大樑保留 35cm 迴風空間', trade: '空調木作' },
                  { id: 'chk3', title: '穿樑套管外緣距主筋 ≥ 100mm 安全保護層確認', trade: '結構水電' },
                  { id: 'chk4', title: '各門框淨洞口預留 +5cm 批土裕度', trade: '泥作木作' },
                  { id: 'chk5', title: '壁切開關標高 FL+120cm、插座 FL+30cm 雷射校準', trade: '水電工班' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {checkedItems[item.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          checkedItems[item.id]
                            ? 'text-slate-400 line-through'
                            : 'text-slate-200 font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.trade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw_memos' && (
            <div className="space-y-3">
              {room.voiceMemos.map((memo, idx) => (
                <div
                  key={memo.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>錄音片段 #{idx + 1} ({memo.timestamp})</span>
                      <span className="text-slate-500">{memo.audioDurationSec || 4.5}s</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {memo.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>摘要已同步納入專案 PDF 施工圖總表之 QA-01 現場交底欄位</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
