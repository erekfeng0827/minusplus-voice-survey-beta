import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Terminal,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  RefreshCw,
  Cpu,
  Layers,
  Settings,
  ShieldCheck,
  Code2,
  FileJson,
  Zap,
  Clock,
  ArrowRight,
  Database,
  X,
  Play,
  Sliders,
  CheckSquare,
  Bot,
  BookOpen,
} from 'lucide-react';
import { RoomData } from '../types';
import { ApiIntegrationDocsPanel } from './ApiIntegrationDocsPanel';
import { CadAnalyzerPrecheckPanel } from './CadAnalyzerPrecheckPanel';

interface GoogleApiIdeDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom?: (updatedRoom: RoomData) => void;
  onNotify?: (msg: string) => void;
}

export type PresetTaskType =
  | 'geometry_contract_audit'
  | 'cad_analyzer_precheck'
  | 'dispatch_to_jingjing'
  | 'work_order_triage'
  | 'viewport_collision_check'
  | 'custom_prompt';

interface DispatchHistoryItem {
  id: string;
  taskType: PresetTaskType;
  taskTitle: string;
  timestamp: string;
  durationMs: number;
  tokensEstimate: number;
  engine: string;
  status: 'SUCCESS' | 'FAILED';
  output: string;
}

export const GoogleApiIdeDispatcherModal: React.FC<GoogleApiIdeDispatcherModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
}) => {
  // Navigation View Tab: Dispatcher vs Developer Docs vs CAD_Analyzer Precheck
  const [activeModalTab, setActiveModalTab] = useState<'dispatcher' | 'cad_precheck' | 'docs'>('dispatcher');

  // Model & Request Config
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-flash-latest' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [responseFormat, setResponseFormat] = useState<'json' | 'text'>('json');
  const [includeRoomContext, setIncludeRoomContext] = useState<boolean>(true);
  const [taskType, setTaskType] = useState<PresetTaskType>('geometry_contract_audit');

  // Prompts & System Instruction
  const [systemInstruction, setSystemInstruction] = useState<string>(
    '你是一位嚴謹的室內建築自動化測繪與幾何契約工程師。請依據《降板裁決_v003.json》規範（梁下265、空調降板230、廚衛215、立面固定80cm檯面），嚴格檢驗高程5倍數原則並給出執行決策。'
  );
  const [userPrompt, setUserPrompt] = useState<string>(
    '請審查當前放樣客廳空間的放樣幾何，確認梁下淨高 265cm、吊隱式天花降板 230cm 與立面 80cm 檯面契約是否合規，並列出驗收報告。'
  );

  // Execution & Response State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [parsedJsonResult, setParsedJsonResult] = useState<any | null>(null);
  const [executionMeta, setExecutionMeta] = useState<{
    durationMs: number;
    tokensEstimate: number;
    engine: string;
    modelUsed: string;
    timestamp: string;
  } | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'structured' | 'raw_code'>('structured');
  const [copied, setCopied] = useState<boolean>(false);

  // History Stack
  const [history, setHistory] = useState<DispatchHistoryItem[]>([]);

  // Task Template Presets
  const PRESET_TEMPLATES: Record<
    PresetTaskType,
    { title: string; prompt: string; system: string; desc: string; icon: string }
  > = {
    geometry_contract_audit: {
      title: '幾何契約與 5 倍數高程審核',
      prompt: `請審核當前空間「${room.roomName}」：
- 開間面寬：${room.width} cm、進深：${room.length} cm
- 原天花板樓高：${room.height} cm
- 結構大梁淨高：${room.beamHeight} cm
- 天花降板高程：${room.ceilingDrop} cm
- 檯面固定高程：80 cm (契約鎖定)

請檢驗所有垂直高程是否全面符合 5 倍數原則 (265, 230, 215, 80)，並回傳結構化 JSON 審查結論。`,
      system: '你是一位室內建築自動化測繪專家，專門負責工程專案幾何契約驗收。垂直高程必須遵守 5 倍數整數原則。',
      desc: '檢核梁下 265、天花 230、廚衛 215 與立面 80cm 是否合規',
      icon: '📐',
    },
    cad_analyzer_precheck: {
      title: 'CAD_Analyzer 施工圖預檢與規範修正',
      prompt: `請針對當前空間「${room.roomName}」產出的 DXF 施工圖進行 CAD_Analyzer 嚴格門禁預檢：
1. 圖層白名單過濾：檢查是否有非標準圖層 (如 WALL, BEAM, CEILING_STEP, DIMENSION, VOICE_TAGS)，轉換至 Corey ACI 標準圖層 (A-WALL-FULL, S-BEAM-PRIM, A-CLNG-LEVL, A-ANNO-DIMS, A-ANNO-NOTE, A-DOOR, G-ANNO-TTLB)。
2. DIMENSION 原生實體重構：將手繪直線標註替換為 AutoCAD 原生關聯式 DIMENSION 實體與 COREY_STYLE 字型。
3. 匯入 corey-a3 標準圖框：配置 A3 1:50 圖框、星玥灣 8F 標題欄與工程審查簽證。
請輸出 CAD_Analyzer 檢驗評分與自動修復後的 DXF 結構摘要。`,
      system: '你是 CAD_Analyzer 施工圖質檢合規官。專精於圖層白名單過濾、corey-a3 圖框匯入、原生 DIMENSION 實體與 COREY_STYLE 字型規範，確保符合正式工程提交標準。',
      desc: '檢測並修復非白名單圖層、偽 DIMENSION 與缺失 corey-a3 圖框，生成正式合規 DXF',
      icon: '🛡️',
    },
    dispatch_to_jingjing: {
      title: 'Codex 晶晶繪圖任務直派',
      prompt: `請將當前空間「${room.roomName}」之開間尺寸 (面寬 ${room.width}cm × 進深 ${room.length}cm) 與固定 80cm 檯面契約，生成直接可交給一線 Codex 晶晶繪製的 AutoCAD LISP 腳本與繪圖指令。需包含 WALL、BEAM、CEILING_STEP 圖層配置。`,
      system: '你是一位精通 AutoCAD AutoLISP 與施工圖放樣的資深繪圖專家，請輸出可由 Codex 晶晶自動執行的 CAD 指令與任務包裹。',
      desc: '自動轉譯為 AutoCAD 腳本與圖層指令，派發給晶晶出圖',
      icon: '🎨',
    },
    work_order_triage: {
      title: '工單池自動分診與解塞裁決',
      prompt: `現場工單池目前有 23 個 NEW 檔案、8 個 IN_PROGRESS 檔案（滯留 19.8 天）、1 個 FAILED 崩潰檔。
請進行分診裁決：
1. A 堆（立即派發晶晶繪圖）
2. B 堆（排程維護/Notion 備份）
3. C 堆（無效/過期/重複清除）
並給出 Watcher 解塞行動方案。`,
      system: '你是一位專案架構審計師與自動化生產線總顧問，負責工單池純化與分流分診。',
      desc: '解決 19 張單滯留 19.8 天，自動分類 A/B/C 堆',
      icon: '📑',
    },
    viewport_collision_check: {
      title: 'V-01~V-10 施工圖驗收檢驗',
      prompt: `請針對「${room.roomName}」施工圖進行 V-01～V-10 驗收條件檢查：
重點檢驗：
- V-01: 視埠遮擋與圖框邊界溢出
- V-07: 重複圖元疊圖衝突
- V-10: 尺寸標註引線重疊與文字遮擋
請輸出結構化驗收評分與修正指引。`,
      system: '你是 CAD 施工圖品管檢驗專家，嚴格執行 V-01 至 V-10 驗收條件規範。',
      desc: '檢查視埠邊界遮擋、重複圖元與尺寸文字引線碰撞',
      icon: '🛡️',
    },
    custom_prompt: {
      title: '自訂自由 API 任務派發',
      prompt: `請根據當前空間放樣數據，分析水電開關插座迴路位置，並提供最佳管線配置建議。`,
      system: '你是一位具備資深室內裝修與機電放樣經驗的 AI 顧問工程師。',
      desc: '自由輸入任何提示詞，直接調用 Google Gemini API 執行任務',
      icon: '⚡',
    },
  };

  // Switch Preset Task
  const handleSelectPreset = (key: PresetTaskType) => {
    setTaskType(key);
    const template = PRESET_TEMPLATES[key];
    setUserPrompt(template.prompt);
    setSystemInstruction(template.system);
  };

  // Keyboard shortcut: Ctrl+Enter to Dispatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen && !isExecuting) {
        e.preventDefault();
        handleDispatchTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExecuting, userPrompt, systemInstruction, selectedModel, temperature, responseFormat, includeRoomContext]);

  // Execute Dispatch Task
  const handleDispatchTask = async () => {
    if (!userPrompt.trim()) {
      onNotify?.('⚠️ 請輸入任務提示詞 Prompt！');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setParsedJsonResult(null);

    const contextPayload = includeRoomContext
      ? {
          roomName: room.roomName,
          width: room.width,
          length: room.length,
          height: room.height,
          beamHeight: room.beamHeight,
          ceilingDrop: room.ceilingDrop,
          bathKitchenDrop: room.bathKitchenDrop || 215,
          fixedCabinetHeight: 80,
          rule5MultiplePassed: room.evaluation?.rule5MultiplePassed ?? true,
        }
      : null;

    try {
      const response = await fetch('/api/gemini/dispatch-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          prompt: userPrompt,
          systemInstruction,
          model: selectedModel,
          temperature,
          responseFormat,
          contextData: contextPayload,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const text = data.output || '';
        setExecutionResult(text);
        setExecutionMeta({
          durationMs: data.durationMs || 320,
          tokensEstimate: data.tokensEstimate || 150,
          engine: data.engine || 'google-gemini-api',
          modelUsed: data.modelUsed || selectedModel,
          timestamp: new Date().toLocaleTimeString(),
        });

        // Try parse as JSON
        try {
          const parsed = JSON.parse(text);
          setParsedJsonResult(parsed);
          setActiveOutputTab('structured');
        } catch {
          setParsedJsonResult(null);
          setActiveOutputTab('raw_code');
        }

        // Add to history
        const newHistoryItem: DispatchHistoryItem = {
          id: `hist-${Date.now()}`,
          taskType,
          taskTitle: PRESET_TEMPLATES[taskType].title,
          timestamp: new Date().toLocaleTimeString(),
          durationMs: data.durationMs || 320,
          tokensEstimate: data.tokensEstimate || 150,
          engine: data.engine || 'google-gemini-api',
          status: 'SUCCESS',
          output: text,
        };
        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);

        onNotify?.(`✨ 任務「${PRESET_TEMPLATES[taskType].title}」已成功由 Google API 執行完成！`);
      } else {
        throw new Error(data.error || '派發失敗');
      }
    } catch (err: any) {
      console.error('Task dispatch error:', err);
      setExecutionResult(`【執行錯誤】: ${err.message || '無法連線至 API 代理伺服器'}`);
      onNotify?.(`⚠️ API 派發執行失敗：${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(executionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.('📋 已複製 API 執行成果至剪貼簿！');
  };

  // Apply parsed geometry back to active room
  const handleApplyToRoom = () => {
    if (!parsedJsonResult || !onUpdateRoom) return;

    let updated = { ...room };
    // Check if result has room parameters
    if (parsedJsonResult.inspectedEntities && Array.isArray(parsedJsonResult.inspectedEntities)) {
      parsedJsonResult.inspectedEntities.forEach((ent: any) => {
        if (ent.element?.includes('梁') && ent.unitCm) updated.beamHeight = ent.unitCm;
        if (ent.element?.includes('天花') && ent.unitCm) updated.ceilingDrop = ent.unitCm;
      });
    }

    if (parsedJsonResult.overallCompliance) {
      updated.evaluation = {
        ...updated.evaluation,
        score: parsedJsonResult.auditScore || 100,
        clarity: '極佳 (Google API 深度核准)',
        rule5MultiplePassed: true,
        suggestions: `Google API 任務派發核准：${parsedJsonResult.actionVerdict || '高程契約全面通過'}`,
      };
    }

    onUpdateRoom(updated);
    onNotify?.(`🎯 已成功將 Google API 審查數據套用至「${room.roomName}」！`);
  };

  // Download Output JSON
  const handleDownloadOutput = () => {
    if (!executionResult) return;
    const blob = new Blob([executionResult], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Google_API_Task_${taskType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('💾 已下載任務結果 JSON 檔案！');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#0f141f] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Top Header - Google AI Studio & Cloud IDE Visual Style */}
        <div className="bg-gradient-to-r from-[#141b2d] via-[#1a233a] to-[#121727] border-b border-cyan-500/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  Google IDE · API 任務直派工作台
                </h3>
                <span className="text-[11px] font-mono bg-blue-950/80 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <Bot className="w-3 h-3 text-cyan-400" />
                  Google Gemini Direct Dispatcher
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API 代理在線 (Server-Side Proxy)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                直接對 Google Gemini API 進行專業任務派發：幾何契約審核、Codex 晶晶繪圖指令、工單池純化與自由 Prompt 執行
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-[#0c101c] p-1 border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveModalTab('dispatcher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeModalTab === 'dispatcher'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>任務直派終端</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('cad_precheck')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeModalTab === 'cad_precheck'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>CAD_Analyzer 圖檔預檢</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-mono">
                  Gate 修正
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('docs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeModalTab === 'docs'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                <span>開發者 API 對接說明書</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800 font-mono">
                  REST + CAD
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="關閉工作台"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeModalTab === 'docs' ? (
          <ApiIntegrationDocsPanel
            currentRoom={room}
            onNotify={onNotify}
            onSwitchToDispatcher={() => setActiveModalTab('dispatcher')}
          />
        ) : activeModalTab === 'cad_precheck' ? (
          <CadAnalyzerPrecheckPanel
            room={room}
            onNotify={onNotify}
            onUpdateRoom={onUpdateRoom}
            onSendPromptToDispatcher={(prompt, system) => {
              setUserPrompt(prompt);
              setSystemInstruction(system);
              setTaskType('cad_analyzer_precheck');
              setResponseFormat('json');
            }}
            onSwitchToDispatcher={() => setActiveModalTab('dispatcher')}
          />
        ) : (
          <>
            {/* Sub-Header: Global Model & API Parameter Controls */}
        <div className="bg-[#121829] border-b border-slate-800/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">模型 (Model):</span>
              <select
                value={selectedModel}
                onChange={(e: any) => setSelectedModel(e.target.value)}
                className="bg-[#1a233a] border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (標準·極速推薦)</option>
                <option value="gemini-flash-latest">gemini-flash-latest (最新穩定版)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (超輕量輕裝)</option>
              </select>
            </div>

            {/* Response Format */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">輸出格式:</span>
              <div className="inline-flex rounded-lg bg-[#1a233a] p-0.5 border border-slate-700">
                <button
                  onClick={() => setResponseFormat('json')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    responseFormat === 'json' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JSON (Schema)
                </button>
                <button
                  onClick={() => setResponseFormat('text')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    responseFormat === 'text' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Markdown 文字
                </button>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">溫度 (Temp):</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 accent-cyan-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-400 text-[11px] w-7">{temperature.toFixed(2)}</span>
            </div>

            {/* Context Include Checkbox */}
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeRoomContext}
                onChange={(e) => setIncludeRoomContext(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>注入當前「{room.roomName}」放樣尺寸</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">快捷鍵：Ctrl + Enter 立即派發</span>
          </div>
        </div>

        {/* Preset Task Buttons Bar */}
        <div className="bg-[#0d121c] border-b border-slate-800 px-5 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            預設任務範本：
          </span>
          {(Object.keys(PRESET_TEMPLATES) as PresetTaskType[]).map((key) => {
            const item = PRESET_TEMPLATES[key];
            const isSelected = taskType === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-3 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/80 font-bold shadow-sm'
                    : 'bg-[#141b2b] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
                title={item.desc}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Work Area: Split Layout (Left: Prompt & Config, Right: Terminal & Output) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column (5 Cols): Prompt Editor & Dispatch Controls */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4 bg-[#0f141f]">
            <div className="space-y-4">
              {/* Task Title & Description */}
              <div className="bg-[#141c2c] border border-cyan-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="text-sm">{PRESET_TEMPLATES[taskType].icon}</span>
                    <span>當前任務：{PRESET_TEMPLATES[taskType].title}</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                    {taskType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{PRESET_TEMPLATES[taskType].desc}</p>
              </div>

              {/* Special Banner for CAD_Analyzer Precheck */}
              {taskType === 'cad_analyzer_precheck' && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-fadeIn">
                  <div className="space-y-0.5 max-w-[280px]">
                    <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>CAD_Analyzer 視覺化預檢與一鍵修復</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      欲查看 4 大門禁對照表、一鍵生成白名單圖層、原生標註與 corey-a3 圖框？
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('cad_precheck')}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs whitespace-nowrap transition shadow flex items-center gap-1 active:scale-95"
                  >
                    <span>開啟預檢工坊</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* System Instruction Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    系統提示詞 (System Instruction)
                  </label>
                  <span className="text-[10px] text-slate-500">角色與契約約束</span>
                </div>
                <textarea
                  rows={3}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="設定 AI 的角色定位與約束規則..."
                />
              </div>

              {/* Main User Prompt Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    任務指令內容 (User Prompt)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    字數：{userPrompt.length} · 預估 Tokens: ~{Math.round(userPrompt.length / 3.5)}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full bg-[#121724] border border-slate-700/80 rounded-lg p-3 text-xs text-cyan-100 font-mono leading-relaxed focus:outline-none focus:border-cyan-400 shadow-inner"
                  placeholder="請在此輸入要直接派發給 API 的任務指令..."
                />
              </div>

              {/* Context Summary Tag */}
              {includeRoomContext && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    已自動綁定專案放樣幾何：
                  </span>
                  <div className="font-mono text-emerald-300/90 flex flex-wrap gap-2 text-[10px]">
                    <span>空間: {room.roomName}</span>
                    <span>面寬: {room.width}cm</span>
                    <span>進深: {room.length}cm</span>
                    <span>梁下淨高: FL+{room.beamHeight}</span>
                    <span>降板: FL+{room.ceilingDrop}</span>
                    <span>檯面契約: FL+80</span>
                  </div>
                </div>
              )}

              {/* Developer API Docs Callout Banner */}
              <div className="bg-[#101726] border border-cyan-500/25 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-xs flex items-center gap-1.5">
                      <span>開發者 API 對接說明書</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                        REST / DXF / LISP
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      說明外部手持測量儀如何拋轉數據至後端，並自動驅動 CAD 向量出圖與保活心跳
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('docs')}
                  className="px-2.5 py-1.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-600/60 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 flex-shrink-0 shadow-sm"
                >
                  <span>查閱說明書</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Execute Button Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-3">
              <button
                onClick={handleDispatchTask}
                disabled={isExecuting}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isExecuting
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/30 active:scale-98'
                }`}
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Google API 執行中... (調用 {selectedModel})</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-200" />
                    <span>🚀 立即派發任務至 Google API (Ctrl+Enter)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): Execution Inspector & Output View */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-3 bg-[#0b0e17]">
            <div className="space-y-3">
              {/* Terminal Title & Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">即時執行終端與結果檢查器</span>
                  {executionMeta && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {executionMeta.durationMs} ms
                    </span>
                  )}
                </div>

                {/* View Mode Toggle: Structured vs Raw Code */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg bg-[#141b2b] p-0.5 border border-slate-800">
                    <button
                      onClick={() => setActiveOutputTab('structured')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                        activeOutputTab === 'structured'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileJson className="w-3 h-3" />
                      <span>結構化視圖</span>
                    </button>
                    <button
                      onClick={() => setActiveOutputTab('raw_code')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                        activeOutputTab === 'raw_code'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3 h-3" />
                      <span>原始代碼</span>
                    </button>
                  </div>

                  {executionResult && (
                    <>
                      <button
                        onClick={handleCopyResult}
                        className="p-1.5 bg-[#141b2b] hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition flex items-center gap-1"
                        title="複製結果"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleDownloadOutput}
                        className="p-1.5 bg-[#141b2b] hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition flex items-center gap-1"
                        title="下載 JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Execution Output Canvas */}
              {isExecuting ? (
                <div className="h-80 flex flex-col items-center justify-center space-y-3 bg-[#0d121c] border border-slate-800 rounded-xl p-6 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-400/50 flex items-center justify-center animate-pulse">
                      <Cpu className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Google Gemini API 正在解析並執行任務...</p>
                    <p className="text-xs text-slate-400 font-mono">
                      模型: {selectedModel} · 任務類型: {taskType}
                    </p>
                  </div>
                </div>
              ) : executionResult ? (
                <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[460px] font-mono text-xs text-slate-200">
                  {/* Structured Tab */}
                  {activeOutputTab === 'structured' && parsedJsonResult ? (
                    <div className="space-y-4">
                      {/* Overall Status Banner */}
                      <div className="bg-[#141e30] border border-emerald-500/40 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            任務執行成功！已完成結構化契約驗收
                          </span>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {parsedJsonResult.actionVerdict || parsedJsonResult.summary || parsedJsonResult.triageSummary || '資料結構已完成驗證'}
                          </p>
                        </div>
                        {parsedJsonResult.auditScore && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400">合規評分</span>
                            <div className="text-lg font-bold text-emerald-400 font-mono">
                              {parsedJsonResult.auditScore} / 100
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inspected Entities Table if Geometry Audit */}
                      {parsedJsonResult.inspectedEntities && Array.isArray(parsedJsonResult.inspectedEntities) && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            高程契約檢核清單 (5 倍數原則)：
                          </span>
                          <div className="space-y-1.5">
                            {parsedJsonResult.inspectedEntities.map((ent: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-[#121826] border border-slate-800 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-white">{ent.element}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{ent.verificationNote}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                                    FL+{ent.unitCm} cm
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      ent.status === 'PASSED'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                                    }`}
                                  >
                                    {ent.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LISP / CAD Commands if JingJing Task */}
                      {parsedJsonResult.commandsScheduled && Array.isArray(parsedJsonResult.commandsScheduled) && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5" />
                            Codex 晶晶繪圖腳本 (AutoCAD LISP / Script)：
                          </span>
                          <div className="bg-[#121826] border border-slate-800 p-3 rounded-lg text-amber-200/90 text-xs font-mono space-y-1 overflow-x-auto">
                            {parsedJsonResult.commandsScheduled.map((cmd: string, idx: number) => (
                              <div key={idx} className="leading-relaxed">
                                {cmd}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Triage Stacks if Work Order Task */}
                      {parsedJsonResult.poolStats && (
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-[#14231b] border border-emerald-500/40 p-2.5 rounded-lg">
                            <span className="text-[10px] text-emerald-400 block font-bold">A 堆：立即派發晶晶</span>
                            <span className="text-base font-bold text-emerald-300 font-mono">
                              {parsedJsonResult.poolStats.stackA_Immediate} 件
                            </span>
                          </div>
                          <div className="bg-[#1e1e12] border border-amber-500/40 p-2.5 rounded-lg">
                            <span className="text-[10px] text-amber-400 block font-bold">B 堆：排程維護備份</span>
                            <span className="text-base font-bold text-amber-300 font-mono">
                              {parsedJsonResult.poolStats.stackB_Schedule} 件
                            </span>
                          </div>
                          <div className="bg-[#241315] border border-rose-500/40 p-2.5 rounded-lg">
                            <span className="text-[10px] text-rose-400 block font-bold">C 堆：無效/重複清除</span>
                            <span className="text-base font-bold text-rose-300 font-mono">
                              {parsedJsonResult.poolStats.stackC_PurgeTrash} 件
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Raw Code Tab */
                    <pre className="whitespace-pre-wrap break-words leading-relaxed text-slate-300 selection:bg-cyan-800">
                      {executionResult}
                    </pre>
                  )}
                </div>
              ) : (
                /* Empty Placeholder State */
                <div className="h-80 flex flex-col items-center justify-center space-y-2 bg-[#0d121c] border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500">
                  <Terminal className="w-10 h-10 text-slate-600 mb-1" />
                  <p className="text-xs font-semibold text-slate-300">等待派發任務指令</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    點擊左上方「預設任務範本」或於左側輸入 Prompt，按下<strong>「立即派發任務至 Google API」</strong>即可在此檢視即時返回結果。
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Output Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>呼叫引擎：</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {executionMeta ? executionMeta.engine : 'Google Cloud Run Express Proxy'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {parsedJsonResult && (
                  <button
                    onClick={handleApplyToRoom}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition shadow flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>套用幾何至「{room.roomName}」</span>
                  </button>
                )}
                <button
                  onClick={handleCopyResult}
                  disabled={!executionResult}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製結果</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom History Drawer (Recent Dispatches) */}
        {history.length > 0 && (
          <div className="bg-[#0b0e17] border-t border-slate-800/80 px-5 py-2 flex items-center gap-3 overflow-x-auto text-xs">
            <span className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
              <Clock className="w-3 h-3" />
              最近派發歷史：
            </span>
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setExecutionResult(item.output);
                  try {
                    setParsedJsonResult(JSON.parse(item.output));
                  } catch {
                    setParsedJsonResult(null);
                  }
                  onNotify?.(`已載入歷史任務「${item.taskTitle}」執行記錄`);
                }}
                className="bg-[#121829] hover:bg-[#1a233a] border border-slate-800 rounded px-2.5 py-1 text-slate-300 font-mono text-[11px] whitespace-nowrap flex items-center gap-1.5 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{item.taskTitle}</span>
                <span className="text-slate-500">({item.timestamp})</span>
              </button>
            ))}
          </div>
        )}
        </>
      )}
      </div>
    </div>
  );
};
