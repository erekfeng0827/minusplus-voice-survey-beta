import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Download,
  FileCode,
  SlidersHorizontal,
  CheckCircle2,
  Workflow,
  Eye,
  Layers,
} from 'lucide-react';
import { ExtensionFeatureId } from './ExtendedFeaturesHubModal';

interface SmartPillItem {
  id: string;
  label: string;
  category: 'core' | 'ai' | 'site' | 'cad';
  action: () => void;
  badge?: string;
  description: string;
  isAiLinked?: boolean;
}

interface SmartFeatureLinkageBarProps {
  // Direct Actions
  onOpenAutoDimensionCheck: () => void; // 自動標註檢查
  onOpenSmartConstructionFailSafe: () => void; // 智慧施工防呆
  onOpenAiMaterialOptimize: () => void; // AI 空間材質優化
  onOpenOfflineVoiceCache: () => void; // 離線語音緩存
  onOpenProjectTemplates: () => void; // 新增專案範本
  onOpenSiteCheckin: () => void; // 施工現場打卡
  onOpenInteractiveDimension: () => void; // 互動尺寸標註
  onOpenAiPipeline: () => void; // 智慧自動化串聯中心
  onDownloadClaudeSpec: () => void; // 下載克勞的 Design 規範
  onOpenMultiRoomStitcher?: () => void; // 門片對齊全室拼圖
}

export const SmartFeatureLinkageBar: React.FC<SmartFeatureLinkageBarProps> = ({
  onOpenAutoDimensionCheck,
  onOpenSmartConstructionFailSafe,
  onOpenAiMaterialOptimize,
  onOpenOfflineVoiceCache,
  onOpenProjectTemplates,
  onOpenSiteCheckin,
  onOpenInteractiveDimension,
  onOpenAiPipeline,
  onDownloadClaudeSpec,
  onOpenMultiRoomStitcher,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'site' | 'cad'>('all');
  const [isLinkageRunning, setIsLinkageRunning] = useState<boolean>(false);
  const [linkageStep, setLinkageStep] = useState<string | null>(null);

  // Pills matching user screenshot precisely
  const screenshotPills: SmartPillItem[] = [
    ...(onOpenMultiRoomStitcher
      ? [
          {
            id: 'multi-room-stitch',
            label: '門片對齊全室拼圖',
            category: 'cad' as const,
            badge: '免手稿',
            description: '各房間閉合丈量 ➜ 門片代號 (A↔A) 配對 ➜ 自動旋轉拼接全室平面圖',
            action: onOpenMultiRoomStitcher,
            isAiLinked: true,
          },
        ]
      : []),
    {
      id: 'auto-dim-check',
      label: '自動標註檢查',
      category: 'cad',
      badge: '5x檢核',
      description: '自動比對 265/230/215 幾何契約與圖元標註避讓',
      action: onOpenAutoDimensionCheck,
      isAiLinked: true,
    },
    {
      id: 'smart-construction-failsafe',
      label: '智慧施工防呆',
      category: 'site',
      badge: 'V-01~10',
      description: '檢查梁底淨空、門窗避梁與水電防回溢雙重鎖定',
      action: onOpenSmartConstructionFailSafe,
      isAiLinked: true,
    },
    {
      id: 'ai-material-optimize',
      label: 'AI 空間材質優化',
      category: 'ai',
      badge: '智配',
      description: '依據採光坐向與空間性質推薦木工塗料與抗震輕鋼架',
      action: onOpenAiMaterialOptimize,
      isAiLinked: true,
    },
    {
      id: 'offline-voice-cache',
      label: '離線語音緩存',
      category: 'site',
      badge: '無網續傳',
      description: '地下室無網環境現場錄音自動存證並待聯網即刻解析',
      action: onOpenOfflineVoiceCache,
      isAiLinked: true,
    },
    {
      id: 'project-templates',
      label: '新增專案範本',
      category: 'cad',
      description: '一鍵套用室內設計豪邸標竿戶型幾何標準',
      action: onOpenProjectTemplates,
    },
    {
      id: 'site-checkin',
      label: '施工現場打卡',
      category: 'site',
      description: 'GPS 定位 + 高程放樣查驗存證留痕',
      action: onOpenSiteCheckin,
    },
    {
      id: 'interactive-dim',
      label: '互動尺寸標註',
      category: 'cad',
      description: '現場點擊即時連動 2D 畫布與 3D 視錐空間標註',
      action: onOpenInteractiveDimension,
    },
  ];

  const filteredPills =
    activeCategory === 'all'
      ? screenshotPills
      : screenshotPills.filter((p) => p.category === activeCategory);

  // 智慧一鍵聯動流程 (Smart Linkage Runner)
  const handleTriggerSmartPipeline = () => {
    setIsLinkageRunning(true);
    setLinkageStep('1/4 執行「自動標註檢查」5倍數校準...');
    setTimeout(() => {
      setLinkageStep('2/4 啟動「智慧施工防呆」梁下265淨空檢核...');
      setTimeout(() => {
        setLinkageStep('3/4 運行「AI 空間材質優化」與空調配合...');
        setTimeout(() => {
          setLinkageStep('4/4 建立「離線語音緩存」與自動放樣存檔完成！');
          setTimeout(() => {
            setIsLinkageRunning(false);
            setLinkageStep(null);
            onOpenAutoDimensionCheck();
          }, 700);
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="w-full bg-[#141824] border-b border-slate-800/90 px-3 sm:px-4 py-2 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left Side: Screenshot Pill Bar with Horizontal Smooth Scroll */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
          {/* Smart Linkage Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 text-[11px] text-slate-300 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wide">智慧聯動膠囊</span>
          </div>

          {/* Screenshot-identical Pill Scroll Container */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 flex-grow">
            {filteredPills.map((pill) => (
              <button
                key={pill.id}
                onClick={pill.action}
                title={pill.description}
                className="group flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] active:bg-[#1a202c] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-400/50 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <span className="tracking-wide text-slate-100 group-hover:text-white">
                  {pill.label}
                </span>
                {pill.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-500/30">
                    {pill.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Quick Right Arrow as shown in screenshot */}
            <button
              onClick={onOpenAiPipeline}
              className="flex-shrink-0 p-1.5 rounded-full bg-[#222834] hover:bg-[#2e3748] text-slate-300 hover:text-white border border-slate-700/80 transition active:scale-95 flex items-center justify-center"
              title="展開更多功能聯動與 8 大擴充中心"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Smart Automation Linkage & Claude Spec Download */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
          {/* Smart Linkage Pipeline Status */}
          {isLinkageRunning ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/50 text-cyan-300 text-[11px] animate-pulse">
              <Workflow className="w-3.5 h-3.5 animate-spin" />
              <span>{linkageStep}</span>
            </div>
          ) : (
            <button
              onClick={handleTriggerSmartPipeline}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600/90 to-cyan-600/90 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all active:scale-95 border border-cyan-400/40"
              title="一鍵按順序自動聯動：標註檢查 ➔ 施工防呆 ➔ 材質優化 ➔ 離線緩存"
            >
              <Workflow className="w-3.5 h-3.5 text-cyan-200" />
              <span>一鍵智慧功能聯動</span>
            </button>
          )}

          {/* Claude's Design Spec Direct Download / View */}
          <button
            onClick={onDownloadClaudeSpec}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="查看或一鍵下載 CLAUDE_DESIGN_SPEC.md 設計規範與系統 Token"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden lg:inline">下載給克勞的規範</span>
            <span className="lg:hidden">克勞規範</span>
          </button>
        </div>
      </div>
    </div>
  );
};
