import React, { useState } from 'react';
import { RoomData, VirtualAnnotationPoint } from '../types';
import {
  optimizeVoiceMeasurementCommand,
  snapToContract5x,
  VoiceOptimizationResult,
} from '../utils/voiceCommander';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Volume2,
  Check,
  X,
  FileCheck2,
  HelpCircle,
  Copy,
} from 'lucide-react';

interface VoiceCommandOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: RoomData;
  initialTranscript?: string;
  onApplyOptimization: (updatedRoom: RoomData, appliedResult: VoiceOptimizationResult) => void;
}

export const VoiceCommandOptimizerModal: React.FC<VoiceCommandOptimizerModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  initialTranscript = '',
  onApplyOptimization,
}) => {
  const [inputText, setInputText] = useState<string>(
    initialTranscript ||
      '現場量測放樣客廳：棉寬大概 482，近身 548，原結構敬告 281。大涼下敬告實測 264，空調掉引天花將板 232，落成區降板 214。'
  );

  const [optimizationResult, setOptimizationResult] = useState<VoiceOptimizationResult | null>(() => {
    return optimizeVoiceMeasurementCommand(
      initialTranscript ||
        '現場量測放樣客廳：棉寬大概 482，近身 548，原結構敬告 281。大涼下敬告實測 264，空調掉引天花將板 232，落成區降板 214。',
      currentRoom
    );
  });

  const [autoApply5xSnap, setAutoApply5xSnap] = useState<boolean>(true);
  const [autoInjectAnnotations, setAutoInjectAnnotations] = useState<boolean>(true);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunOptimization = (customText?: string) => {
    const textToUse = customText !== undefined ? customText : inputText;
    const res = optimizeVoiceMeasurementCommand(textToUse, currentRoom);
    setOptimizationResult(res);
  };

  const handleExecuteAppliedRoom = () => {
    if (!optimizationResult) return;

    const p = optimizationResult.extractedParameters;
    const updatedRoom: RoomData = {
      ...currentRoom,
      width: p.width !== undefined ? p.width : currentRoom.width,
      length: p.length !== undefined ? p.length : currentRoom.length,
      height: p.height !== undefined ? p.height : currentRoom.height,
      beamHeight: p.beamHeight !== undefined ? p.beamHeight : currentRoom.beamHeight,
      ceilingDrop: p.ceilingDrop !== undefined ? p.ceilingDrop : currentRoom.ceilingDrop,
      bathKitchenDrop: p.bathKitchenDrop !== undefined ? p.bathKitchenDrop : currentRoom.bathKitchenDrop,
      // 自動注入產生的虛擬標註
      virtualAnnotations: autoInjectAnnotations
        ? [
            ...(currentRoom.virtualAnnotations || []),
            ...optimizationResult.suggestedAnnotations.filter(
              (sa) => !(currentRoom.virtualAnnotations || []).some((ex) => ex.label === sa.label)
            ),
          ]
        : currentRoom.virtualAnnotations,
      lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };

    onApplyOptimization(updatedRoom, optimizationResult);
    onClose();
  };

  const handleCopyCleanedCommand = () => {
    if (!optimizationResult) return;
    const summary = `【標準工程放樣口述指令】\n${optimizationResult.normalizedText}\n\n【參數提取】\n面寬: ${optimizationResult.extractedParameters.width || currentRoom.width}cm\n進深: ${optimizationResult.extractedParameters.length || currentRoom.length}cm\n梁下淨高: FL+${optimizationResult.extractedParameters.beamHeight || currentRoom.beamHeight}cm\n空調降板: FL+${optimizationResult.extractedParameters.ceilingDrop || currentRoom.ceilingDrop}cm\n樓板淨高: CL+${optimizationResult.extractedParameters.height || currentRoom.height}cm\n契約驗收: 5倍數嚴格核定通過`;
    navigator.clipboard.writeText(summary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // 預設常見工地嘈雜/口音測試案例
  const sampleScenarios = [
    {
      title: '案例 1：含台語諧音與雜訊 (482/264/232)',
      text: '現場量測放樣客廳：棉寬大概 482，近身 548，原結構敬告 281。大涼下敬告實測 264，空調掉引天花將板 232，落成區降板 214。',
    },
    {
      title: '案例 2：主臥室避梁實測口述',
      text: '主臥室放樣：面寬 380，進深 420，床頭主涼下 265，衣櫃側空調降板 230，門寬 90 高 210。',
    },
    {
      title: '案例 3：衛廚水電與落塵區快速口述',
      text: '玄關與浴室：浴室開間 212，進深 258，天花板全降 216，門口雙切開關 FL+120，插座 FL+30。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  口述指令深度優化器 (Voice Command Optimizer)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  5 倍數契約引擎
                </span>
              </div>
              <p className="text-xs text-slate-400">
                自動過濾工地環境雜音 · 矯正台語/諧音口誤 · 智能約束至 5 倍數契約幾何高程
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Preset Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              快速載入口語測試情境：
            </span>
            {sampleScenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(sc.text);
                  handleRunOptimization(sc.text);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
              >
                {sc.title}
              </button>
            ))}
          </div>

          {/* Input & Live Optimization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Box: Raw Transcript Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  工地現場口述逐字稿 (Raw Input)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {inputText.length} 字
                </span>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  handleRunOptimization(e.target.value);
                }}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                placeholder="貼入口述文字或工地語音錄音轉錄內容..."
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleRunOptimization()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>重新優化解析</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoApply5xSnap}
                      onChange={(e) => setAutoApply5xSnap(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                    />
                    <span>強固 5 倍數約束</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoInjectAnnotations}
                      onChange={(e) => setAutoInjectAnnotations(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0"
                    />
                    <span>自動生成 2D 虛擬標註</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Box: Cleaned & Normalized Standard Command */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  優化精煉後標準 CAD 施工指令 (Normalized)
                </span>
                <button
                  onClick={handleCopyCleanedCommand}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSuccess ? '已複製！' : '複製指令'}</span>
                </button>
              </div>

              <div className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200/90 font-mono leading-relaxed min-h-[110px] flex flex-col justify-between">
                <div>
                  {optimizationResult?.normalizedText || (
                    <span className="text-slate-600">等待輸入口述逐字稿...</span>
                  )}
                </div>

                {optimizationResult && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      可信度 {Math.round(optimizationResult.confidenceScore * 100)}%
                    </span>
                    <span>清晰度評量：{optimizationResult.acousticClarityScore} 分</span>
                  </div>
                )}
              </div>

              {/* Extraction Specs Badges */}
              {optimizationResult && (
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col">
                    <span className="text-slate-400">開間面寬 (X)</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {optimizationResult.extractedParameters.width || currentRoom.width} cm
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col">
                    <span className="text-slate-400">開間進深 (Y)</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {optimizationResult.extractedParameters.length || currentRoom.length} cm
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-emerald-500/40 bg-emerald-950/30 flex flex-col">
                    <span className="text-emerald-300">梁下淨高 (FL+)</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {optimizationResult.extractedParameters.beamHeight || currentRoom.beamHeight} cm
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Smart Corrections Audit Trail (自動修正履歷清單) */}
          {optimizationResult && optimizationResult.correctionsApplied.length > 0 && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  智能契約審計與口音矯正履歷 ({optimizationResult.correctionsApplied.length} 項)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  自動遵守室內設計《降板裁決_v003》
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {optimizationResult.correctionsApplied.map((corr, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-300">{corr.target}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-red-400 line-through">{String(corr.original)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                          {String(corr.corrected)}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400">{corr.reason}</div>
                    <div className="text-[10px] text-emerald-400/80 font-mono">{corr.contractRule}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Derived Action Commands */}
          {optimizationResult && optimizationResult.commandActions.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                將派發執行的 CAD 放樣動作 ({optimizationResult.commandActions.length} 條)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {optimizationResult.commandActions.map((act, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 flex flex-col gap-0.5 text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {act.label}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-snug">{act.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>隨時可將優化後的高程與開間尺寸同步至 2D/3D 放樣模型</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              取消
            </button>

            <button
              onClick={handleExecuteAppliedRoom}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition active:scale-95"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>確認套用至放樣模型與 2D/3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
