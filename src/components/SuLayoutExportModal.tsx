import React, { useState } from 'react';
import {
  X,
  Layout,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Layers,
  Box,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import { RoomData, SuLayoutExportConfig } from '../types';
import {
  generateSketchupRubyBuilderScript,
  generateLayOutScrapbookDxf,
  generateLayOutCompleteGuide,
} from '../utils/suLayoutEngine';
import { generateSketchup3dDxf, generateCoreyMinusPlusPdfBlob } from '../utils/minusPlusDesignEngine';

interface SuLayoutExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomData[];
  projectName: string;
  onNotify: (msg: string) => void;
}

export const SuLayoutExportModal: React.FC<SuLayoutExportModalProps> = ({
  isOpen,
  onClose,
  rooms,
  projectName,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ruby_script' | 'scrapbook' | 'guide'>('overview');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const config: SuLayoutExportConfig = {
    projectName: projectName || '星玥灣 B3-7F 陳宅 設計規劃案',
    roomIds: rooms.map((r) => r.id),
    exportRubyScenesScript: true,
    exportLayOutScrapbook: true,
    exportSketchup3dDxf: true,
    exportLayOutA3Pdf: true,
    targetLayOutScale: '1/40',
    includeCeilingBeams: true,
    includeFurnitureLayers: true,
    includeMepLightingCircuit: true,
  };

  const rubyScript = generateSketchupRubyBuilderScript(config, rooms);
  const scrapbookDxf = generateLayOutScrapbookDxf();
  const guideMarkdown = generateLayOutCompleteGuide();

  // 1. 下載 Ruby 腳本
  const handleDownloadRuby = () => {
    const blob = new Blob([rubyScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minusplus_su_scenes_builder.rb';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 SketchUp 自動化 Ruby 腳本 (.rb)！');
  };

  // 2. 下載 LayOut 剪貼簿圖例庫 DXF
  const handleDownloadScrapbook = () => {
    const blob = new Blob([scrapbookDxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MinusPlus_LayOut_Scrapbook_Symbols.dxf';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 LayOut 專用剪貼簿 (Scrapbook) 圖例庫！');
  };

  // 3. 下載 3D DXF 模型
  const handleDownload3dDxf = () => {
    const dxf = generateSketchup3dDxf(rooms);
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Corey_MinusPlus_Master_3D.dxf';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載分層 3D CAD 模型 (.dxf)！');
  };

  // 4. 下載 LayOut 1:40 向量 PDF
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pdfBlob = await generateCoreyMinusPlusPdfBlob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MinusPlus_LayOut_FullSet_A3.pdf';
      a.click();
      URL.revokeObjectURL(url);
      onNotify('✓ 已下載 LayOut 1:40 向量 A3 完整施工圖冊！');
    } catch (e) {
      console.error(e);
      onNotify('PDF 產出失敗，請稍後重試。');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 5. 下載 LayOut 排版整合指南
  const handleDownloadGuide = () => {
    const blob = new Blob([guideMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MinusPlus_LayOut_Workflow_Guide.md';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('✓ 已下載 SketchUp + LayOut 排版教學指南！');
  };

  // 一鍵下載整套
  const handleDownloadBundle = () => {
    handleDownloadRuby();
    setTimeout(() => handleDownloadScrapbook(), 200);
    setTimeout(() => handleDownload3dDxf(), 400);
    setTimeout(() => handleDownloadGuide(), 600);
    handleDownloadPdf();
    onNotify('🚀 SketchUp & LayOut 全套交付包 (.rb + Scrapbook + 3D DXF + PDF + 指南) 已觸發下載！');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
    onNotify('✓ 程式碼已複製至剪貼簿！');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#121810] border border-[#3F5B63]/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#DDD7CE]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3F5B63]/40 flex items-center justify-between bg-[#141d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#F8F8F6]">SU LayOut 輸出引擎 (SketchUp &amp; LayOut Export)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  LayOut 1/40 向量排版
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                支援一鍵建立 3D 結構與 5 大施工圖連動場景、匯出 LayOut 剪貼簿 (Scrapbook) 圖例庫與 1:40 向量施工圖冊
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#F8F8F6] hover:bg-[#23301F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#3F5B63]/30 bg-[#0e1610] flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>核心交付資產概覽</span>
          </button>
          <button
            onClick={() => setActiveTab('ruby_script')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ruby_script'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Ruby 5大場景建構腳本 (.rb)</span>
          </button>
          <button
            onClick={() => setActiveTab('scrapbook')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'scrapbook'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>LayOut 剪貼簿 (Scrapbook) 圖例包</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-[#8E8E93] hover:text-[#DDD7CE]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SU+LayOut 四步極速出圖教學</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Asset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Ruby Scene Builder */}
                <div className="bg-[#141d16] border border-[#3F5B63]/50 hover:border-purple-500/60 rounded-xl p-4 space-y-3 transition group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      SketchUp 延伸模組
                    </span>
                    <span className="text-xs text-[#8E8E93] font-mono">.rb 腳本</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8F8F6] group-hover:text-purple-300 transition">
                    1. 3D 結構與 5 大 LayOut 連動場景腳本
                  </h3>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    在 SketchUp Ruby 控制台貼上執行，自動生成實心 RC 牆、大梁、天花降板、門窗洞口，並自動建立「平面配置 1/40」、「天花燈具 1/40」、「水電定位」、「電視牆 1/20」與「跨室立面 1/30」場景。
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-[#23301F]">
                    <button
                      onClick={handleDownloadRuby}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載 minusplus_su_scenes_builder.rb</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('ruby_script')}
                      className="text-xs text-[#8E8E93] hover:text-[#DDD7CE] flex items-center gap-1"
                    >
                      <span>檢視代碼</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. LayOut Scrapbook Library */}
                <div className="bg-[#141d16] border border-[#3F5B63]/50 hover:border-purple-500/60 rounded-xl p-4 space-y-3 transition group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LayOut 專用剪貼簿
                    </span>
                    <span className="text-xs text-[#8E8E93] font-mono">.dxf 圖例庫</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8F8F6] group-hover:text-amber-300 transition">
                    2. 加減設計 LayOut 剪貼簿 (Scrapbook)
                  </h3>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    專為 LayOut 設計之拖拉式圖例庫！包含加減設計 11 種燈具圖塊 (筒燈/投射燈/LED踢腳)、14 種水電開關插座符號、立面圖號引線泡泡、指北針與 1:1 簽章圖框。
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-[#23301F]">
                    <button
                      onClick={handleDownloadScrapbook}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載 MinusPlus_LayOut_Scrapbook.dxf</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('scrapbook')}
                      className="text-xs text-[#8E8E93] hover:text-[#DDD7CE] flex items-center gap-1"
                    >
                      <span>檢視圖例說明</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 3. 3D Model DXF */}
                <div className="bg-[#141d16] border border-[#3F5B63]/50 hover:border-purple-500/60 rounded-xl p-4 space-y-3 transition group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      3D 分層實體模型
                    </span>
                    <span className="text-xs text-[#8E8E93] font-mono">3D DXF</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8F8F6] group-hover:text-cyan-300 transition">
                    3. 全案實體 3D 模型 (Corey_MinusPlus_Master_3D.dxf)
                  </h3>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    分層 3D 幾何物件：RC 結構外牆 (A-WALL-RC)、天花平頂 (A-CEILING-DROP)、大梁 (A-BEAM-STRUCT)、固定木作與門窗，可直接在 SketchUp 或 3ds Max / Blender 導入。
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-[#23301F]">
                    <button
                      onClick={handleDownload3dDxf}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載分層 3D DXF</span>
                    </button>
                  </div>
                </div>

                {/* 4. LayOut Vector PDF */}
                <div className="bg-[#141d16] border border-[#3F5B63]/50 hover:border-purple-500/60 rounded-xl p-4 space-y-3 transition group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LayOut 1/40 出圖排版
                    </span>
                    <span className="text-xs text-[#8E8E93] font-mono">向量 PDF</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8F8F6] group-hover:text-emerald-300 transition">
                    4. 全套 ISO A3 向量施工圖冊 (MinusPlus_FullSet_A3.pdf)
                  </h3>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    嚴格按照 Corey 星玥灣施工標準生成之 5 大圖冊：封面、平面配置圖-1、電視牆剖立面、客房跨室立面、燈具迴路與水電配置放樣圖。
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-[#23301F]">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExportingPdf ? '正在產生向量 PDF...' : '下載 A3 向量施工圖冊'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Workflow Flowchart Callout */}
              <div className="bg-[#141d16] border border-[#3F5B63]/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SketchUp &amp; LayOut 極速整合四步工作流</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    查看詳細排版教學
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F] space-y-1">
                    <span className="text-purple-400 font-bold font-mono">STEP 01</span>
                    <div className="font-bold text-[#F8F8F6]">貼上 Ruby 腳本</div>
                    <div className="text-[11px] text-[#8E8E93]">在 SketchUp Ruby 控制台執行，自動產生 3D 結構與 5 大場景。</div>
                  </div>
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F] space-y-1">
                    <span className="text-purple-400 font-bold font-mono">STEP 02</span>
                    <div className="font-bold text-[#F8F8F6]">傳送到 LayOut</div>
                    <div className="text-[11px] text-[#8E8E93]">點選檔案「傳送到 LayOut...」，選擇 ISO A3 橫向排版紙張。</div>
                  </div>
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F] space-y-1">
                    <span className="text-purple-400 font-bold font-mono">STEP 03</span>
                    <div className="font-bold text-[#F8F8F6]">設定 1/40 向量</div>
                    <div className="text-[11px] text-[#8E8E93]">將視埠設為「平行投影 1:40」，轉譯切換為「向量 (Vector)」黑實線條。</div>
                  </div>
                  <div className="bg-[#0e1610] p-3 rounded-lg border border-[#23301F] space-y-1">
                    <span className="text-purple-400 font-bold font-mono">STEP 04</span>
                    <div className="font-bold text-[#F8F8F6]">拖拉剪貼簿圖例</div>
                    <div className="text-[11px] text-[#8E8E93]">載入加減設計 Scrapbook，拖拉 11 種燈具與 14 種水電圖例出圖！</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ruby_script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E93]">
                  SketchUp Ruby 控制台執行代碼 (自動建立 Tags/Layers 與 5 大 LayOut 場景)：
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(rubyScript, 'ruby')}
                    className="px-3 py-1 rounded-lg bg-[#23301F] hover:bg-[#2e4029] text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition active:scale-95"
                  >
                    {copiedType === 'ruby' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'ruby' ? '已複製代碼' : '複製 Ruby 腳本'}</span>
                  </button>
                  <button
                    onClick={handleDownloadRuby}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載 .rb 檔案</span>
                  </button>
                </div>
              </div>
              <pre className="bg-[#0a0f0b] border border-[#23301F] rounded-xl p-4 text-xs font-mono text-purple-300/90 overflow-x-auto max-h-96 leading-relaxed select-all">
                {rubyScript}
              </pre>
            </div>
          )}

          {activeTab === 'scrapbook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E93]">
                  LayOut 剪貼簿 (Scrapbook) 專用向量圖例庫 DXF：
                </div>
                <button
                  onClick={handleDownloadScrapbook}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下載 Scrapbook DXF 圖例包</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#141d16] border border-[#23301F] rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400">💡 11 種天花燈具圖例庫</h4>
                  <ul className="text-xs text-[#8E8E93] space-y-1 list-disc list-inside">
                    <li>LED 嵌入式圓形筒燈 (9.5cm 開孔 / 3000K)</li>
                    <li>嵌入式防眩盒燈 (二燈/三燈連座)</li>
                    <li>雙向黑烤漆軌道投射燈 (S)</li>
                    <li>長型懸吊式工作吊燈 (L=150cm)</li>
                    <li>天花隱藏式間接照明 LED 燈條 (T5/LED 2835)</li>
                    <li>懸空木作低位 LED 踢腳夜燈</li>
                    <li>單切 (S) / 雙切 (S3) / 三切 (S4) 開關迴路符號</li>
                  </ul>
                </div>

                <div className="bg-[#141d16] border border-[#23301F] rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400">⚡ 14 種強弱電與水電圖例庫</h4>
                  <ul className="text-xs text-[#8E8E93] space-y-1 list-disc list-inside">
                    <li>110V 雙連接地插座 (離地 30cm)</li>
                    <li>110V 檯面專用防濺插座 (離地 110cm)</li>
                    <li>220V 冷氣室外機 / 廚房 IH 爐專用迴路</li>
                    <li>Cat.6 高速資訊網路插座 (RJ-45)</li>
                    <li>電視同軸電纜訊號孔 (TV)</li>
                    <li>冷水出水口 / 熱水出水口 (H:55cm)</li>
                    <li>地板排水孔 / 總集水存水彎檢修孔</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E93]">
                  加減設計 LayOut 施工圖排版四步指南：
                </div>
                <button
                  onClick={handleDownloadGuide}
                  className="px-3 py-1 rounded-lg bg-[#23301F] hover:bg-[#2e4029] text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下載完整指南 (.md)</span>
                </button>
              </div>
              <div className="bg-[#0a0f0b] border border-[#23301F] rounded-xl p-5 text-xs text-[#DDD7CE] overflow-y-auto max-h-96 leading-relaxed whitespace-pre-wrap font-mono">
                {guideMarkdown}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#3F5B63]/40 bg-[#141d16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadRuby}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Ruby 場景腳本 (.rb)</span>
            </button>
            <button
              onClick={handleDownloadScrapbook}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>LayOut 剪貼簿 DXF</span>
            </button>
            <button
              onClick={handleDownload3dDxf}
              className="px-3 py-1.5 rounded-lg bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/50 text-xs text-[#DDD7CE] font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D 分層 DXF</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#23301F] hover:bg-[#2c3d27] text-[#DDD7CE] text-xs font-bold transition"
            >
              關閉
            </button>

            <button
              onClick={handleDownloadBundle}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <Download className="w-4 h-4 text-white" />
              <span>一鍵下載 SU &amp; LayOut 全套交付包</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
