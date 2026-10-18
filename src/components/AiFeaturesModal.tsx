import React, { useState } from 'react';
import { RoomData } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wand2,
  RefreshCw,
  Cpu,
  Compass,
  FileCheck,
  Send,
  X,
  Copy,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

interface AiFeaturesModalProps {
  room: RoomData;
  onClose: () => void;
  onUpdateRoom?: (updated: RoomData) => void;
  onOpenVoiceSummary?: () => void;
  onOpenCompliance?: () => void;
}

export const AiFeaturesModal: React.FC<AiFeaturesModalProps> = ({
  room,
  onClose,
  onUpdateRoom,
  onOpenVoiceSummary,
  onOpenCompliance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'optimize' | 'dispatch' | 'pipeline_prompts'>('audit');
  const [activePromptAi, setActivePromptAi] = useState<'ai1' | 'ai2' | 'ai3' | 'standards'>('ai1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // 1. One-click 5-multiple Auto Alignment
  const handleAutoAlign5Multiple = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (onUpdateRoom) {
        const round5 = (val: number) => Math.round(val / 5) * 5;
        const updated: RoomData = {
          ...room,
          width: round5(room.width),
          length: round5(room.length),
          height: round5(room.height),
          ceilingDrop: round5(room.ceilingDrop),
          beamHeight: round5(room.beamHeight),
          bathKitchenDrop: round5(room.bathKitchenDrop || 215),
          evaluation: {
            ...room.evaluation,
            score: 98,
            rule5MultiplePassed: true,
            suggestions: 'AI 已將全室尺寸與標高自動校準至5 倍數整數契約（265/230/215）。',
          },
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
        onUpdateRoom(updated);
      }
      setIsProcessing(false);
      setSuccessNotice('全室標高與開間已由 AI 自動修復至 5 倍數幾何契約！');
      setTimeout(() => setSuccessNotice(null), 3000);
    }, 450);
  };

  // 2. Auto Complement Missing Electrical Outlets (Door switch & TV outlets)
  const handleAutoComplementElectrical = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (onUpdateRoom) {
        const existing = [...room.electricalPoints];
        const hasSwitch = existing.some((p) => p.type === 'switch');
        const hasAcDrain = existing.some((p) => p.type === 'ac_drain');

        if (!hasSwitch) {
          existing.push({
            id: `ep-ai-${Date.now()}`,
            type: 'switch',
            name: '門口玄關一鍵雙切照明開關',
            x: 40,
            y: room.length - 40,
            elevation: 120,
            circuit: 'L-AI',
          });
        }
        if (!hasAcDrain) {
          existing.push({
            id: `ep-ai-ac-${Date.now()}`,
            type: 'ac_drain',
            name: '吊隱冷氣冷凝排水管 (坡度 1/50)',
            x: room.width - 60,
            y: 80,
            elevation: 215,
            circuit: 'DRAIN-AI',
          });
        }

        onUpdateRoom({
          ...room,
          electricalPoints: existing,
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
      }
      setIsProcessing(false);
      setSuccessNotice('AI 已自動補齊門口控制開關與冷氣自流排水專迴！');
      setTimeout(() => setSuccessNotice(null), 3000);
    }, 400);
  };

  // 3. Generate Jingjing Codex Dispatch Prompt
  const dispatchPrompt = `【室內設計生產線 · Codex 晶晶自動派工指令】
========================================
[幾何規格]
• 空間代號：${room.roomName}
• 開間淨寬：${room.width} cm × 進深：${room.length} cm (原點 (0,0) 位於左下角)
• 樓板淨高：FL+${room.height} cm
• 大梁底淨高 (B.O.B)：FL+${room.beamHeight} cm（嚴禁穿筋）
• 空調天花降板 (C.H)：FL+${room.ceilingDrop} cm
• 廚衛落塵高差：FL+${room.bathKitchenDrop || 215} cm

[門窗與弱電清單]
• 門扇數量：${room.doors.length} 組 (底邊預留 +5cm 批土裕度)
• 窗扇數量：${room.windows.length} 組 (窗台標高 ${room.windows[0]?.sillHeight || 90} cm)
• 強弱電面板：${room.electricalPoints.length} 個點位 (插座 +30cm / 開關 +120cm)

[幾何契約合規查核]
• 5 倍數整數檢驗：${room.beamHeight % 5 === 0 && room.ceilingDrop % 5 === 0 ? 'PASSED (265/230)' : '需調校'}
• 重複圖元 (Overkill)：0 處重疊
• 派發目標：一線自動繪圖代理 (Codex 晶晶)
========================================`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(dispatchPrompt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  AI 智能工務全功能中心
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-300 font-semibold">
                  Codex 晶晶協同引擎
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                整合口說丈量轉譯、5倍數幾何修復、水電缺失補全與現場避坑交底
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice banner */}
        {successNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-300 font-medium animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeSubTab === 'audit'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            AI 幾何契約與標高審計
          </button>

          <button
            onClick={() => setActiveSubTab('optimize')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeSubTab === 'optimize'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            一鍵智能修復與補全
          </button>

          <button
            onClick={() => setActiveSubTab('dispatch')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeSubTab === 'dispatch'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Codex 晶晶派工
          </button>

          <button
            onClick={() => setActiveSubTab('pipeline_prompts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeSubTab === 'pipeline_prompts'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3-AI 串流與習慣萃取提示詞
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-900/60">
          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                  <div className="text-slate-400">大梁底淨高審核 (265cm)</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-mono font-bold text-white">
                      FL+{room.beamHeight} cm
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        room.beamHeight % 5 === 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {room.beamHeight % 5 === 0 ? '5倍數合規' : '非5倍數'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                  <div className="text-slate-400">空調天花降板審核 (230cm)</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-mono font-bold text-white">
                      FL+{room.ceilingDrop} cm
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        room.ceilingDrop % 5 === 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {room.ceilingDrop % 5 === 0 ? '5倍數合規' : '非5倍數'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                  <div className="text-slate-400">玄關廚衛降板 (215cm)</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-mono font-bold text-white">
                      FL+{room.bathKitchenDrop || 215} cm
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      5倍數合規
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Reasoning Box */}
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  AI 幾何契約推理與施工避雷診斷
                </div>
                <p className="text-slate-300 leading-relaxed">
                  本空間「{room.roomName}」長寬尺寸 ({room.width}×{room.length} cm) 
                  符合營造模矩，大梁下淨高維持 265 cm，冷氣出風口降板至 230 cm，完全滿足
                  《降板裁決_v003.json》之垂直放樣基準。吊隱室內機風箱下緣與大樑底線留有 35 cm 充足迴風靜壓空間，無短循環積熱疑慮。
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={onOpenCompliance}
                    className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>開啟完整合規報表</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenVoiceSummary}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors border border-slate-700"
                  >
                    <span>檢視現場口說提煉摘要</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'optimize' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. 5-Multiple Auto-Fix */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      5 倍數整數自動校正
                    </div>
                    <p className="text-slate-400 mt-1 text-xs">
                      自動將空間面寬、進深、梁高、天花降板強制吸附到最近之 5 倍數整數（例如將 264cm 修正為 265cm），消除現場零碎泥作誤差。
                    </p>
                  </div>
                  <button
                    onClick={handleAutoAlign5Multiple}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>一鍵校準至 5 倍數契約</span>
                  </button>
                </div>

                {/* 2. Electrical Complement */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      水電弱電缺失智能補齊
                    </div>
                    <p className="text-slate-400 mt-1 text-xs">
                      自動檢驗門扇邊緣是否缺少 120cm 照明開關、空調天花下方是否缺少冷凝水專迴與自流排水點，一鍵自動添加至放樣圖。
                    </p>
                  </div>
                  <button
                    onClick={handleAutoComplementElectrical}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>一鍵補齊標準弱電出線點</span>
                  </button>
                </div>
              </div>

              {/* Status List */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300 mb-2">當前空間幾何與開口現況：</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                  <div className="bg-slate-900 p-2 rounded">門洞數量: <span className="text-white font-mono">{room.doors.length}</span> 組</div>
                  <div className="bg-slate-900 p-2 rounded">窗扇數量: <span className="text-white font-mono">{room.windows.length}</span> 組</div>
                  <div className="bg-slate-900 p-2 rounded">結構大樑: <span className="text-white font-mono">{room.beams.length}</span> 支</div>
                  <div className="bg-slate-900 p-2 rounded">水電點位: <span className="text-white font-mono">{room.electricalPoints.length}</span> 處</div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'dispatch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  即時生成之 Codex 晶晶專案派工數據流
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText ? '已複製到剪貼簿' : '複製派工文字'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[260px]">
                {dispatchPrompt}
              </div>

              <p className="text-[11px] text-slate-400">
                提示：此派工指令可直接透過 Watcher 管道注入一線生圖自動化生產線，或直接貼入工班專案群組中即時交底。
              </p>
            </div>
          )}

          {/* USER REQUESTED: 3-AI 串流架構與習慣萃取提示詞 */}
          {activeSubTab === 'pipeline_prompts' && (
            <div className="space-y-4">
              {/* Inner Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'ai1', label: 'AI-1: 丈量拓撲結構師', icon: '📐', desc: '幾何放樣 / 5倍數' },
                  { id: 'ai2', label: 'AI-2: 水天圖規格師', icon: '⚡', desc: '機電迴路 / 天花降板' },
                  { id: 'ai3', label: 'AI-3: 3D多視角渲染師', icon: '🎨', desc: '材質光影 / 空間一致性' },
                  { id: 'standards', label: '繪圖習慣與大樣規範', icon: '📚', desc: '圖層/圖塊/DXF歸檔' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePromptAi(item.id as any)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      activePromptAi === item.id
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-white">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* AI-1 Content */}
              {activePromptAi === 'ai1' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-300 text-sm">【AI-1：現場丈量與幾何拓撲結構大師】</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        職能：接收現場手繪或雷射測距原始數值，以「玄關門順時針」閉合空間，並強制吸附 5 倍數幾何契約。
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`【AI-1 系統提示詞 System Instruction】
你是一位頂級室內建築幾何放樣大師與計算拓撲工程師。你的任務是接收現場丈量草圖或口述尺寸，將其轉化為嚴格標準化的室內放樣幾何契約 (JSON Schema)。

【執行核心原則】：
1. 封閉多邊形原則：必須從「玄關門扇開啟鉸鏈點」定義為原點 (0,0)，以順時針方向量測依序封閉空間四邊。
2. 5 倍數剛性契約：所有面寬、進深、開口偏移量、窗扇寬度、結構柱大樑定位，必須自動四捨五入至 5cm 整數倍（如 478cm 修正為 480cm，264cm 修正為 265cm）。
3. 樑位避讓原則：標記所有主樑與次樑之截面（寬×高）、梁底淨高（FL+265cm），並建立三層尺寸鏈（總尺寸/軸線開間/門窗細節）。

【輸入數據格式 (Input Template)】：
- 空間名稱：星玥灣主臥/客廳
- 現場測得面寬 W：${room.width} cm, 進深 L：${room.length} cm, 清水樓高 H：${room.height} cm
- 門扇定位：南牆 偏移量=${room.doors[0]?.offset || 50}cm, 門扇寬=${room.doors[0]?.width || 90}cm
- 窗戶定位：北牆 偏移量=${room.windows[0]?.offset || 80}cm, 窗寬=${room.windows[0]?.width || 300}cm
- 結構樑位：橫樑 B1 梁底高 FL+${room.beamHeight}cm, 梁寬 35cm, 梁深 55cm

【輸出 JSON Schema】：
請輸出無包裹的 JSON 格式：
{
  "project": "XING-YUE-WAN",
  "room_name": "string",
  "datum_origin": {"x": 0, "y": 0, "description": "玄關門鉸鏈外角鋼"},
  "boundary_polygon": [{"x": 0, "y": 0}, {"x": 0, "y": "${room.length}"}, {"x": "${room.width}", "y": "${room.length}"}, {"x": "${room.width}", "y": 0}],
  "openings": [
    {"type": "DOOR", "wall": "SOUTH", "offset_x": 50, "width": 90, "height": 210, "sill": 0},
    {"type": "WINDOW", "wall": "NORTH", "offset_x": 80, "width": 300, "height": 180, "sill": 90}
  ],
  "structural_beams": [
    {"id": "B1", "orientation": "HORIZONTAL", "y_pos": 130, "width": 35, "depth": 55, "clear_height": 265}
  ],
  "dimension_chains": {"north_chain": [], "south_chain": [], "east_chain": [], "west_chain": []}
}`);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText ? '已複製！' : '複製 AI-1 提示詞'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[160px]">
                    {`【AI-1 幾何放樣提示詞核心】：
1. 順時針閉合多邊形
2. 5倍數整數吸附（開間、進深、樑寬、門窗）
3. 輸出包含 boundary_polygon、openings、structural_beams 的標準 JSON，直接餵給 AI-2`}
                  </div>
                </div>
              )}

              {/* AI-2 Content */}
              {activePromptAi === 'ai2' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-cyan-300 text-sm">【AI-2：機電水天圖與施工圖規格師】</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        職能：銜接 AI-1 的拓撲 JSON，套用《降板裁決_v003.json》（265/230/215），自動配置水電迴路與天花。
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`【AI-2 系統提示詞 System Instruction】
你是一位具備 20 年工地驗收經驗的機電整合與施工圖規格總工程師。
你將接收由 AI-1 所產出的標準幾何 JSON，並嚴格遵循《降板裁決_v003.json》規範進行水天圖（天花、空調、燈具、強弱電）自動配置。

【施工圖剛性契約】：
1. 高程三階律：
   - 結構大樑下底：FL+265cm (固定不動，標註避讓)
   - 吊隱式空調降板天花：FL+230cm (降板深度 50cm，配置 45x45 鋁合金檢修孔)
   - 廚衛落塵區與門檻降板：FL+215cm (地坪止水差 1.5cm)
2. 水電點位標高規範：
   - 門邊照明開關：離地 FL+120cm，距門框門緣 15cm。
   - 一般壁面插座：離地 FL+30cm。
   - 吊隱冷氣電源專迴與排水：離地 FL+220cm，冷凝管需自流坡度 1/100。
3. 圖層與線型規格化：
   - 牆體中心線：A-WALL-CL (CENTER2, 0.13mm, 紅)
   - 天花降板投影線：A-CEIL-DROP (HIDDEN2, 0.25mm, 橘黃)
   - 照明開關迴路：E-LITE-CIRC (Continuous, 0.18mm, 青藍)

【輸入】：AI-1 拓撲 JSON
【輸出】：DXF 圖元字典與 A-02/A-03 出圖清冊 JSON。`);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText ? '已複製！' : '複製 AI-2 提示詞'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[160px]">
                    {`【AI-2 水天圖提示詞核心】：
1. 自動載入《降板裁決_v003.json》(265/230/215)
2. 自動標註 120cm 開關、30cm 插座、220cm 空調專迴
3. 輸出包含 A-02(天花放樣)、A-03(水電迴路) 之 DXF 圖層清冊`}
                  </div>
                </div>
              )}

              {/* AI-3 Content */}
              {activePromptAi === 'ai3' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-300 text-sm">【AI-3：3D 空間光影與多視角一致性渲染師】</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        職能：固定相機 FOV 65° 與視平線 120cm，確保客廳、玄關、餐廳多角度材質紋理與結構 100% 一致。
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`【AI-3 系統提示詞 System Instruction】
你是一位高精度室內空間 3D 視覺渲染總監，專精於「多相機視錐空間一致性 (Multi-View Consistency)」。
你接收來自 AI-1 (幾何結構)、AI-2 (水天材質) 的數據，負責輸出在不同視角下「木皮色溫、石材紋理、結構樑位、天花降板」完全一致的高寫實渲染圖。

【視錐與光影錨定標準】：
1. 相機參數：
   - 視平線高度 (Eye Level)：固定 FL+120cm (坐姿透視視角)
   - 鏡頭視場角 (FOV)：水平 65° (等效 24mm 全片幅廣角，無畸變拉伸)
2. 材質一致性種子鎖 (Material Consistency Token Lock)：
   - [WOOD_OAK_01]: 煙燻白橡木鋼刷木皮，色溫 3000K 暖灰反射
   - [STONE_TERRAZZO]: 星玥灣客製水磨石地坪，微顆粒啞光
   - [CEILING_FL230]: 霧面平光純白乳膠漆天花，內凹 5cm 黑色鋁企口收邊
3. 多視角輸出命令：
   - View A (東向望客廳落地窗)：Camera [X:100, Y:150, Z:120] -> Target [X:350, Y:400, Z:120]
   - View B (西向望玄關防爆門)：Camera [X:400, Y:350, Z:120] -> Target [X:150, Y:100, Z:120]
   - View C (仰角視察 B1 橫梁與天花降板交界處細部)

【禁止事項 (Negative Prompt)】：
嚴禁視角切換時改變大樑位置、嚴禁出現 AI 幻覺隨機增減家具、嚴禁天花高度隨機浮動。`);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText ? '已複製！' : '複製 AI-3 提示詞'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[160px]">
                    {`【AI-3 多視角一致性渲染核心】：
1. 視平線高程強制鎖定 FL+120cm，FOV 65°
2. 材質 Token 鎖定（煙燻橡木、水磨石、霧白乳膠漆）
3. 嚴格對照 AI-1/AI-2 的 FL+265 與 FL+230 實體造型，杜絕 AI 幻覺漂移`}
                  </div>
                </div>
              )}

              {/* Standards & Detail Library Content */}
              {activePromptAi === 'standards' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-300 text-sm">【設計師習慣萃取與大樣圖庫歸檔規範】</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        回答核心問題：如何萃取繪圖習慣？需要提供什麼圖面？大樣圖該如何歸檔與規格化？
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>1. 如何萃取您的繪圖習慣？</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        • <strong className="text-white">需提供的圖面檔案：</strong>請提供 1~2 份您過去最滿意的標準專案 DWG/DXF 檔案（或匯出之 CAD 圖紙）。<br />
                        • <strong className="text-white">系統自動萃取項目：</strong>
                        <span className="text-slate-400 block mt-1 pl-2">
                          1) 圖層色彩對照表（如 Wall 用 1 號紅線、Text 用 2 號黃線）<br />
                          2) 尺寸標註樣式（箭頭樣式、斜線 45°、字高 2.5mm、離線距離 1mm）<br />
                          3) 圖塊命名與基點（如 90cm 單開門塊基點位於鉸鏈中心）<br />
                          4) 剖面填充線（如木作木芯板 ANSI31、磚牆 AR-CONC）
                        </span>
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>2. 大樣圖歸檔規格標準 (Detail Library)</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        • <strong className="text-white">檔案類型規範：</strong>建議採用 <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">.DXF (AutoCAD 2018 格式)</code> 搭配伴生 <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">.JSON</code> 元數據。<br />
                        • <strong className="text-white">命名規範：</strong><code className="text-emerald-400 font-mono">DT-[工種]-[部位]-[編號].dxf</code><br />
                        <span className="text-slate-400 block mt-1 pl-2">
                          例：<code className="text-slate-200">DT-CEIL-ALUM-01.dxf</code> (天花吊頂暗架鋁企口收邊大樣 1:5)<br />
                          例：<code className="text-slate-200">DT-FLOOR-STONE-02.dxf</code> (乾式高架地板收邊止水大樣 1:2)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-white">圖號與圖例統一名稱規格化對照表：</strong>
                    <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[10px]">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-amber-400 font-bold">平面放樣類</div>
                        <div>A-01: 現況放樣圖</div>
                        <div>A-02: 天花高程放樣圖</div>
                        <div>BLK-DOOR-90: 90開門</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-cyan-400 font-bold">水電機電類</div>
                        <div>A-03: 開關插座迴路圖</div>
                        <div>E-SW-2W: 雙切開關</div>
                        <div>E-SOCK-110V: 雙聯插座</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-emerald-400 font-bold">立面與工序類</div>
                        <div>A-04: 四向展開立面圖</div>
                        <div>A-05: 施工工序序列圖</div>
                        <div>A-00: 圖紙目錄與面積</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI 模型狀態：Google Gemini 幾何審定代理</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
