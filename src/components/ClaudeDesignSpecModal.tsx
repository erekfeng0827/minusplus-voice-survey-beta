import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  Palette,
  Code2,
  Sparkles,
  Layers,
  Sliders,
} from 'lucide-react';

interface ClaudeDesignSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export const ClaudeDesignSpecModal: React.FC<ClaudeDesignSpecModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawMarkdown = `# CLAUDE_DESIGN_SPEC.md
# 克勞的 Design · 介面設計規範與系統 Token 指南
**專案名稱**：幾何契約與現場放樣自動化系統 (Xingyuebay Staking CAD System)  
**設計語言系統**：Claude Staking Precision Design System (v1.0)  
**版本對象**：Claude (克勞的 Design) UI/UX 深度調優與前端重構

---

## 1. 核心設計哲學 (Core Philosophy)
1. **極致防呆與 5 倍數幾何視覺化**：
   - 任何尺寸與高程只要符合 5 倍數（265、230、215），給予高可信度的綠色語意 (\`#10B981\`)。
   - 任何非 5 倍數或避梁淨空不足 260cm 者，給予琥珀黃預警 (\`#F59E0B\`) 或紅色標記 (\`#EF4444\`)。
2. **圓角膠囊按鈕 (Pill Controls)**：
   - 所有頂部與次級功能操作均採用 \`rounded-full\` 膠囊設計。
   - 嚴格維持水平內距為垂直內距之 2 倍（\`px-4 py-1.5\` 或 \`px-3.5 py-1.5\`），文字禁止換行。
3. **低對比微冷色調畫布**：
   - 主畫布背景：\`#121622\`（深邃藍灰），比純黑更護眼、比純灰更具專業工程軟體質感。
   - 表面卡片：\`#1e2534\`，邊框使用 \`rgba(51, 65, 85, 0.8)\`。

---

## 2. 8 大擴充功能定義 (The 8 Extension Features)
1. **新增專案範本 (Project Templates)**：內建室內設計豪邸標竿 (480×550 / 梁265 / 降板230 / 落塵215)
2. **施工現場打卡 (Site Check-in)**：GPS 定位與心跳留痕
3. **離線數據同步 (Offline Data Sync)**：原子更名架構杜絕工單滯留
4. **互動尺寸標註 (Interactive Dimension Studio)**：5x 強制取整與視錐連動
5. **跨版本 CAD 比對 (CAD Visual Diff)**：紅綠雙色面寬、梁高、降板 Δ 比對
6. **現場放樣 QR 貼紙 (Site QR Sticker Generator)**：手機掃描即開 3D 視錐透視
7. **今日工務放樣日誌 (Daily Site Construction Log)**：一鍵統整並複製 Markdown
8. **克勞的 Design 規範手冊與 Token (Claude UI Design Spec)**

---

## 3. 設計 Token (Design Tokens)
\`\`\`css
:root {
  --bg-app: #0c0f17;
  --bg-canvas: #121622;
  --bg-surface: #1a2232;
  --bg-surface-elevated: #222c40;
  --border-subtle: rgba(71, 85, 105, 0.4);
  --border-focus: rgba(6, 182, 212, 0.8);
  --color-contract-5x: #10b981;
  --color-contract-5x-bg: rgba(16, 185, 129, 0.15);
  --color-beam-warning: #f59e0b;
  --color-laser-cyan: #06b6d4;
  --color-ai-purple: #8b5cf6;
  --radius-pill: 9999px;
  --radius-card: 16px;
  --radius-inner: 10px;
}
\`\`\``;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    if (onNotify) onNotify('已成功複製內容至剪貼簿！可直接貼給 Claude！');
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CLAUDE_DESIGN_SPEC.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onNotify) onNotify('已成功下載 CLAUDE_DESIGN_SPEC.md 設計規範檔案！');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#121622] border border-purple-500/50 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  克勞的 Design · 介面設計規範檔案下載與複製專區
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-400/50 text-purple-200">
                  CLAUDE_DESIGN_SPEC.md
                </span>
              </div>
              <p className="text-xs text-slate-400">
                您要提供給 Claude 的完整答案就是這份規範檔案！可一鍵直接下載或一鍵複製純文字。
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

        {/* Action Bar */}
        <div className="px-6 py-3 bg-[#0d111b] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>已就緒：專案根目錄實體檔案 <code>/CLAUDE_DESIGN_SPEC.md</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(rawMarkdown, 'all')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition active:scale-95"
            >
              {copiedSection === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已複製全文！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>一鍵複製全文給 Claude</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition active:scale-95 border border-purple-400/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>直接下載 .md 檔案</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#0a0e17] text-xs font-mono">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed overflow-x-auto">
            <pre className="whitespace-pre-wrap">{rawMarkdown}</pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            提示：您也可以將此檔案上傳至 Claude 對話框，它將完全依循此規格進行介面優化與元件聯動。
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
