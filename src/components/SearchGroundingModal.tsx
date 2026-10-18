import React, { useState } from 'react';
import {
  Globe,
  Search,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
  Check,
  Layers,
  ShieldCheck,
  Clock,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveSearchGroundingToFirestore } from '../lib/firebase';
import { RoomData } from '../types';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomData;
  onApplyAnnotation?: (note: string) => void;
  onNotify?: (msg: string) => void;
}

interface GroundingResult {
  query: string;
  answer: string;
  model: string;
  webSearchQueries: string[];
  sources: Array<{ title: string; url: string }>;
}

const PRESET_QUERIES = [
  '2026 內政部建築技術規則：室內裝修耐燃材料與防火門檢驗新規',
  '大樓吊隱式冷氣排水坡度、集風箱降板淨高與維修孔尺寸標準',
  '玄關落塵區大理石地坪與超耐磨木地板交接止水鋁壓條工法行情',
  '電視牆天然石材與大板陶板乾掛鐵件骨架防震安全施工規範',
  '衛浴降板 215cm 乾濕分離防溢水門檻與無障礙地排公差標準',
];

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  isOpen,
  onClose,
  room,
  onApplyAnnotation,
  onNotify,
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GroundingResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          context: room ? `當前空間：${room.roomName}，長寬 ${room.width}×${room.length}cm，樓高 ${room.height}cm` : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || '檢索失敗');
      }

      const resItem: GroundingResult = {
        query: data.query,
        answer: data.answer,
        model: data.model || 'gemini-3.6-flash',
        webSearchQueries: data.webSearchQueries || [],
        sources: data.sources || [],
      };

      setResult(resItem);
      setHistory((prev) => [resItem, ...prev.filter((h) => h.query !== resItem.query)].slice(0, 8));

      // Persist to Firestore if user is authenticated
      if (user) {
        try {
          await saveSearchGroundingToFirestore(user.uid, {
            id: `ground-${Date.now()}`,
            query: resItem.query,
            groundedAnswer: resItem.answer,
            webSearchQueries: resItem.webSearchQueries,
            sources: resItem.sources,
          });
        } catch (fsErr) {
          console.warn('Firestore search grounding log warning:', fsErr);
        }
      }

      onNotify?.(`🌐 已透過 Google 搜尋獲得最新即時數據！(模型: gemini-3.6-flash)`);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setError(err?.message || '搜尋發生錯誤，請檢查網路連線或 API 金鑰');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToNotes = (text: string) => {
    const summary = text.slice(0, 120).replace(/\n/g, ' ') + '... (依據 Google 實時法規搜尋)';
    onApplyAnnotation?.(summary);
    onNotify?.('📐 已將檢索依據加入目前圖面「06_施工註記」圖層！');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/30 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Google Search Grounding 實時法規與建材檢索
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded-full font-mono font-bold">
                  gemini-3.6-flash + Google Search
                </span>
                {user ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> Firestore 已連線
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    訪客模式
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                串接 Google 實時搜尋數據庫 · 取得 2026 最新室內裝修法規、材料檢驗標準與公差數據
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="輸入欲向 Google 實時查核的建材、高程、防火法規或施工行情..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition flex-shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Google 檢索中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>實時檢索</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Queries */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 scrollbar-none">
            <span className="text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-cyan-400" /> 常見法規快捷：
            </span>
            {PRESET_QUERIES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleSearch(p);
                }}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-lg whitespace-nowrap transition"
              >
                {p.slice(0, 18)}...
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-950">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {loading && !result && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">正在向 Google 實時網路發起檢索請求...</p>
                <p className="text-xs text-slate-400">
                  Gemini 2.5 Flash 正在綜合比對內政部法規公報、建材檢驗報告與最新市場價格
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fadeIn">
              {/* Web Search Queries Badge */}
              {result.webSearchQueries && result.webSearchQueries.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                    <Search className="w-3.5 h-3.5" /> Google 即時搜尋觸發詞：
                  </span>
                  {result.webSearchQueries.map((sq, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-950 border border-cyan-500/30 text-cyan-300 rounded text-[11px] font-mono"
                    >
                      "{sq}"
                    </span>
                  ))}
                </div>
              )}

              {/* Main Grounded Answer */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>實時查核與法規解答</span>
                  </h4>
                  <button
                    onClick={() => handleApplyToNotes(result.answer)}
                    className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>套用至圖面註記層 (06_施工註記)</span>
                  </button>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {result.answer}
                </div>
              </div>

              {/* Sources & Citations */}
              {result.sources && result.sources.length > 0 && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>權威來源與參考連結 (Google Search Grounding)：</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white transition group"
                      >
                        <span className="truncate pr-2">{s.title || s.url}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="py-12 text-center space-y-3 text-slate-400">
              <Globe className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-xs">
                請在上方輸入想查詢的室內設計規格、高程標準或耐震防火要求，或點擊上方快捷建議。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
