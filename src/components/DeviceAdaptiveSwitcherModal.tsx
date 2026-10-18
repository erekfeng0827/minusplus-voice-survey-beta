import React from 'react';
import { DeviceAdaptiveConfig, DeviceAdaptiveMode } from '../types';
import { Smartphone, Tablet, Monitor, Sparkles, X, Check, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

interface DeviceAdaptiveSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceAdaptiveConfig;
  onChangeConfig: (newConfig: DeviceAdaptiveConfig) => void;
  currentDetectedMode: 'iphone' | 'ipad' | 'desktop';
  windowWidth: number;
}

export const DeviceAdaptiveSwitcherModal: React.FC<DeviceAdaptiveSwitcherModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  currentDetectedMode,
  windowWidth,
}) => {
  if (!isOpen) return null;

  const modes: {
    id: DeviceAdaptiveMode;
    title: string;
    sub: string;
    icon: React.ReactNode;
    desc: string;
    tag: string;
    color: string;
  }[] = [
    {
      id: 'auto',
      title: '自動感應 (Auto)',
      sub: `目前偵測為：${currentDetectedMode === 'iphone' ? '📱 iPhone 手機' : currentDetectedMode === 'ipad' ? '📟 iPad 平板' : '💻 桌面工作站'} (${windowWidth}px)`,
      icon: <Sparkles className="w-5 h-5 text-[#E0A83C]" />,
      desc: '根據當前瀏覽器視窗寬度與觸控特性，自動無縫切換最佳介面',
      tag: '智慧自適應',
      color: 'border-[#E0A83C]/50 bg-[#E0A83C]/10 text-[#E0A83C]',
    },
    {
      id: 'iphone',
      title: 'iPhone 模組 (手機直式單手版)',
      sub: 'iOS 靈動島 · 底部拇指選單 · 滿版觸控放樣',
      icon: <Smartphone className="w-5 h-5 text-[#30D158]" />,
      desc: '針對 390~430px 直立螢幕最佳化，單手好操作，包含底部大圓語音鍵與專屬工具抽屜',
      tag: '手機首選',
      color: 'border-[#30D158]/50 bg-[#30D158]/10 text-[#30D158]',
    },
    {
      id: 'ipad',
      title: 'iPad 模組 (平板全景觸控版)',
      sub: '4:3 沉浸式比例 · 支援 Apple Pencil · 四向抽屜',
      icon: <Tablet className="w-5 h-5 text-[#0A84FF]" />,
      desc: '專為 iPad / 平板橫向與直向螢幕打造，畫布最大化，四邊可呼叫隱藏選單與多點觸控',
      tag: '現場丈量必備',
      color: 'border-[#0A84FF]/50 bg-[#0A84FF]/10 text-[#0A84FF]',
    },
    {
      id: 'desktop',
      title: '桌面工作站 (全功能專業版)',
      sub: '多欄位 · 即時審計儀表板 · 寬螢幕多工排版',
      icon: <Monitor className="w-5 h-5 text-[#BF5AF2]" />,
      desc: '適合 Mac / PC 大螢幕電腦，展示完整工作流分頁、詳細圖層面板與審計解塞數據',
      tag: '事務所大螢幕',
      color: 'border-[#BF5AF2]/50 bg-[#BF5AF2]/10 text-[#BF5AF2]',
    },
  ];

  const scalePresets = [
    { label: '85% (緊湊)', value: 0.85 },
    { label: '90%', value: 0.90 },
    { label: '100% (標準)', value: 1.0 },
    { label: '110%', value: 1.10 },
    { label: '120% (舒適放大)', value: 1.20 },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[28px] w-full max-w-xl overflow-hidden shadow-2xl text-[#EBEBF5]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#38383A] flex items-center justify-between bg-[#23301F]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0A83C] text-[#23301F] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                設備自適應與比例調整
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3F5B63] text-[#F8F8F6]">iPad / iPhone 雙模切換</span>
              </h2>
              <p className="text-xs text-[#DDD7CE]">彈性適應任何手機、平板或電腦，文字與圖元無失真縮放</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2C2C2E] hover:bg-[#38383A] flex items-center justify-center text-[#8E8E93] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. 選擇設備模組 */}
          <div>
            <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider block mb-3">
              1. 選擇設備專屬模組 (Device Layout Mode)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modes.map((m) => {
                const isSelected = config.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onChangeConfig({ ...config, mode: m.id })}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E0A83C] bg-[#23301F] shadow-lg shadow-[#E0A83C]/10'
                        : 'border-[#38383A] bg-[#2C2C2E]/60 hover:bg-[#2C2C2E] hover:border-[#3F5B63]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#1C1C1E] border border-[#38383A]">
                          {m.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            {m.title}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${m.color}`}>
                            {m.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#E0A83C] text-[#23301F] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#DDD7CE] line-clamp-2 mt-1">{m.desc}</p>
                    <p className="text-[11px] text-[#8E8E93] mt-2 font-mono">{m.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 顯示比例縮放大小 */}
          <div className="p-4 rounded-2xl bg-[#2C2C2E]/50 border border-[#38383A]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-[#0A84FF]" />
                2. 畫面自適應比例大小 (Display Scale)
              </label>
              <span className="text-sm font-mono font-bold text-[#E0A83C] bg-[#1C1C1E] px-3 py-1 rounded-lg border border-[#38383A]">
                {Math.round(config.zoomScale * 100)}%
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {scalePresets.map((preset) => {
                const isActive = Math.abs(config.zoomScale - preset.value) < 0.01;
                return (
                  <button
                    key={preset.value}
                    onClick={() => onChangeConfig({ ...config, zoomScale: preset.value })}
                    className={`py-2 px-1 rounded-xl text-xs font-medium text-center transition-all ${
                      isActive
                        ? 'bg-[#E0A83C] text-[#23301F] font-bold shadow-md'
                        : 'bg-[#1C1C1E] text-[#DDD7CE] hover:text-white hover:bg-[#38383A]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 mt-2">
              <ZoomOut className="w-4 h-4 text-[#8E8E93]" />
              <input
                type="range"
                min="0.75"
                max="1.30"
                step="0.05"
                value={config.zoomScale}
                onChange={(e) =>
                  onChangeConfig({ ...config, zoomScale: parseFloat(e.target.value) })
                }
                className="w-full accent-[#E0A83C] cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-[#8E8E93]" />
              <button
                onClick={() => onChangeConfig({ ...config, zoomScale: 1.0 })}
                title="重設為 100%"
                className="p-1.5 rounded-lg bg-[#1C1C1E] hover:bg-[#38383A] text-[#8E8E93] hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-2">
              💡 提示：在小尺寸手機（如 iPhone SE / mini）可調為 85%~90% 獲得更廣放樣視野；在 iPad Pro 上可調為 110%~120% 獲得超清晰大按鈕！
            </p>
          </div>

          {/* 3. 模擬外框開關 (桌面預覽專用) */}
          <div className="p-4 rounded-2xl bg-[#2C2C2E]/50 border border-[#38383A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1C1C1E] text-[#3F5B63]">
                <Eye className="w-4 h-4 text-[#DDD7CE]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">在大螢幕顯示 iPhone / iPad 模擬外框</div>
                <div className="text-xs text-[#8E8E93]">在電腦桌面測試時，渲染逼真的手機或平板機身外框與靈動島</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.simulateDeviceFrame}
                onChange={(e) =>
                  onChangeConfig({ ...config, simulateDeviceFrame: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#E0A83C]"></div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#38383A] bg-[#151A14] flex items-center justify-between">
          <div className="text-xs text-[#DDD7CE]">
            目前解析度：<span className="font-mono text-[#E0A83C]">{windowWidth} × {window.innerHeight} px</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#E0A83C] hover:bg-[#c9922c] text-[#23301F] rounded-xl text-sm font-bold shadow-lg transition active:scale-95"
          >
            完成設定並套用
          </button>
        </div>

      </div>
    </div>
  );
};
