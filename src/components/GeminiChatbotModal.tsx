import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle,
  X,
  Compass,
  MessageSquare,
  ChevronDown,
  Info,
} from 'lucide-react';
import { RoomData } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  durationMs?: number;
}

export type ChatRole = 'consultant' | 'auditor' | 'contract_specialist' | 'site_assistant';
export type GeminiModelChoice = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview' | 'gemini-flash-latest';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomData;
  onNotify?: (msg: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    role: 'model',
    content: `您好！我是 **雙子審計輔助工具（單次請求技術預覽）**（尚未具備伺服器端 Session 與狀態儲存，不得標示為已正式上線）。

我可以協助您比對與查詢：
- **系統更新後是否需要重新安裝（正式公告規範）**
- **星玥灣 8F 實測數據審計**（浴室 218cm 與大樑 297cm 的 \`AS_BUILT_MEASURED\` 現況保留原則）
- **CAD_Analyzer 阻擋解除路徑**（Corey A3 圖框、圖層白名單、原生 DIMENSION 實體）
- **幾何契約《降板裁決_v003.json》**（265/230/215 與 V-01~V-10 質檢標準）

【正式上線判定提醒】：必須同時具備**正式網址、部署版本與時間、線上 API 實測、產物 SHA-256、CAD 原生回讀結果及獨立驗收者結論**，才能判定為已上線。`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: 'gemini-3.5-flash',
  },
];

const PRESET_QUESTIONS = [
  {
    label: '更新後要重新下載安裝嗎？還是會同步？',
    query: '請問你更新完之後，我要重新下載請他安裝嗎？還是他們那邊會同步？',
  },
  {
    label: '星玥灣 8F 現況 218/297 審計狀態？',
    query: '星玥灣 8F 的實測值 218 與 297 cm 目前在幾何契約審計中是如何被處理的？',
  },
  {
    label: 'CAD_Analyzer 阻擋項目如何解除？',
    query: 'CAD_Analyzer 目前阻擋驗收的圖層白名單與 Corey A3 圖框警告有哪些？工程端修復路徑是什麼？',
  },
  {
    label: '工程工單 MP-20260922-827 進度？',
    query: '請說明正式工程工單 MP-20260922-827 的當前狀態、Relay PID 314212 與 PARTIAL 誠信判定。',
  },
];

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  room,
  onNotify,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('gemini_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('consultant');
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Persist messages in localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gemini_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history payload (last 10 turns to conserve tokens)
      const historyPayload = newMessages.slice(-10, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = room
        ? {
            roomName: room.roomName,
            width: room.width,
            length: room.length,
            height: room.height,
            beamHeight: room.beamHeight,
            ceilingDrop: room.ceilingDrop,
            bathKitchenDrop: room.bathKitchenDrop,
            evaluation: room.evaluation,
          }
        : null;

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: historyPayload,
          role: selectedRole,
          model: selectedModel,
          contextData,
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          durationMs: data.durationMs,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || '無法取得回應');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `【服務連線提示】通訊暫時無法連達，已啟動系統安全協議。請稍候重試或確認 Settings 中的 API 密鑰設置。\n錯誤細節：${err?.message || '網路逾時'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('確定要清空對話紀錄並重置嗎？')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('gemini_chat_history');
      if (onNotify) onNotify('已清空對話紀錄');
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onNotify) onNotify('已複製文字內容至剪貼簿');
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map(
        (m) =>
          `### [${m.role === 'user' ? '發問者 (User)' : 'Gemini 顧問 (Model)'}] - ${m.timestamp}${
            m.modelUsed ? ` (${m.modelUsed})` : ''
          }\n\n${m.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gemini_Audit_Transcript_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (onNotify) onNotify('已匯出對話逐字稿 Markdown 檔案');
  };

  const roleLabels: Record<ChatRole, { title: string; desc: string; icon: any }> = {
    consultant: {
      title: '專案架構審計總顧問',
      desc: '解答自動化生產線、工程同步、派工與全域架構問題',
      icon: ShieldCheck,
    },
    auditor: {
      title: 'CAD_Analyzer 質檢合規官',
      desc: '把關圖層白名單、Corey A3 圖框、關聯標註與文字型式',
      icon: Cpu,
    },
    contract_specialist: {
      title: '幾何契約審核員',
      desc: '審查 265/230/215 規範與 8F 現況測量 218/297 並存機制',
      icon: Layers,
    },
    site_assistant: {
      title: '現場丈量結構化助理',
      desc: '將工地口述語意轉化為結構化空間參數與避讓標記',
      icon: Compass,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[860px] bg-[#111520] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161c2c] border-b border-slate-700/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  雙子審計輔助工具
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40">
                    單次請求技術預覽 · 非正式上線
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                星玥灣 8F 現況比對與規範檢驗 · 待具備完整要件後始行正式部署
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export transcript */}
            <button
              onClick={handleExportTranscript}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="匯出對話逐字稿 (Markdown)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">匯出逐字稿</span>
            </button>

            {/* Clear conversation */}
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 text-slate-400 transition-all text-xs flex items-center gap-1.5"
              title="清空對話紀錄"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">清空</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header: Role & Model Selector */}
        <div className="px-5 py-2.5 bg-[#141926] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          {/* Role selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-slate-400 font-medium whitespace-nowrap">角色定位:</span>
            {(Object.keys(roleLabels) as ChatRole[]).map((r) => {
              const info = roleLabels[r];
              const Icon = info.icon;
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40 border border-blue-400/50'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={info.desc}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{info.title}</span>
                </button>
              );
            })}
          </div>

          {/* Model selection */}
          <div className="flex items-center gap-1 bg-[#0d111a] p-1 rounded-full border border-slate-800">
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.5-flash: 適合一般通用任務與設計諮詢 (預設)"
            >
              3.5-Flash (通用)
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.1-flash-lite: 極速任務與即時標註"
            >
              Flash-Lite (極速)
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.1-pro-preview: 複雜深度推理與結構化代碼分析"
            >
              3.1-Pro (深度推理)
            </button>
            <button
              onClick={() => setSelectedModel('gemini-flash-latest')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-flash-latest'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-flash-latest: 最新模型版本"
            >
              Latest
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0e121c]/70">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                      : 'bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all ${
                    isUser
                      ? 'bg-blue-600/90 text-white border-blue-500/50 shadow-md shadow-blue-600/20'
                      : 'bg-[#181f2f] text-slate-200 border-slate-700/70 shadow-lg shadow-black/30'
                  }`}
                >
                  {/* Content (Render Markdown-like paragraphs and bolding) */}
                  <div className="space-y-2 whitespace-pre-wrap select-text font-sans">
                    {m.content}
                  </div>

                  {/* Metadata and action footer */}
                  <div className="mt-2 pt-1.5 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400 gap-3">
                    <div className="flex items-center gap-2">
                      <span>{m.timestamp}</span>
                      {m.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {m.modelUsed}
                        </span>
                      )}
                      {m.durationMs && <span>{(m.durationMs / 1000).toFixed(2)}s</span>}
                    </div>

                    <button
                      onClick={() => handleCopyMessage(m.id, m.content)}
                      className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-300"
                      title="複製此訊息"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>複製</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#181f2f] border border-slate-700/70 rounded-2xl px-4 py-3 text-xs text-cyan-300 flex items-center gap-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Gemini 正在深入分析專案幾何契約與審計數據...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Quick Inquiries Bar */}
        <div className="px-4 py-2 bg-[#121623] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            熱門提問:
          </span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap transition-all active:scale-95 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-[#161c2c] border-t border-slate-700/80 flex-shrink-0">
          <div className="relative flex items-end gap-2 bg-[#0e121c] border border-slate-700/80 rounded-2xl p-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入您的問題（如：更新完需要重新下載嗎？星玥灣 8F 現況值如何審計？按 Enter 送出，Shift+Enter 換行）..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none px-2 py-1 max-h-32"
              disabled={isLoading}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              title="送出訊息"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                模型：<strong className="text-slate-300">{selectedModel}</strong> · 角色：
                <strong className="text-slate-300">{roleLabels[selectedRole].title}</strong>
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400">
              按 <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Enter</kbd> 送出
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
