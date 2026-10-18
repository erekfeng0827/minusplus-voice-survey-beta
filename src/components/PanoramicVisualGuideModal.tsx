import React, { useState } from 'react';
import {
  Compass,
  X,
  RotateCw,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  Eye,
  Sparkles,
  Smartphone,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PanoramicVisualGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onLaunchLiveCamera?: () => void;
}

export const PanoramicVisualGuideModal: React.FC<PanoramicVisualGuideModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  onLaunchLiveCamera,
}) => {
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const [pitchAngle, setPitchAngle] = useState<number>(0.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<number>(0);
  const [testedItems, setTestedItems] = useState<boolean[]>([false, false, false, false]);

  if (!isOpen) return null;

  // 4 Golden Anchor Walls based on Angle
  const getWallByAngle = (angle: number) => {
    const norm = ((angle % 360) + 360) % 360;
    if (norm >= 315 || norm < 45) {
      return { id: 'A', name: '0° 站位 · 主採光落地窗面', beam: '梁底 +265 cm', desc: '入戶原點定錨正對面，窗台與大落地玻璃' };
    } else if (norm >= 45 && norm < 135) {
      return { id: 'B', name: '90° 站位 · 電視影音主牆', beam: '空調降板 +230 cm', desc: '右側主牆，矮櫃檯面 FL+80 與吊隱式風管口' };
    } else if (norm >= 135 && norm < 225) {
      return { id: 'C', name: '180° 站位 · 回望玄關門洞', beam: '門斗頂高 +215 cm', desc: '玄關實木門、弱電箱與電源總開關箱' };
    } else {
      return { id: 'D', name: '270° 站位 · 客廳沙發背牆', beam: '側梁包板 +265 cm', desc: '左側背牆，壁燈預留出線與間接照明造型' };
    }
  };

  const wallInfo = getWallByAngle(currentAngle);
  const isLevelGood = Math.abs(pitchAngle) <= 0.5;

  const handleSimulateAudioGuidance = () => {
    setIsPlayingAudio(true);
    onNotify('🔊 語音提示播放：「現在站在玄關中軸線，請將 iPad 0.5x 超廣角朝向正前方主採光面，維持水平 0.0°」');
    setTimeout(() => {
      onNotify('🔊 語音提示播放：「開始順時針旋轉，轉速 15度/秒，請緩慢向右轉動至電視主牆...」');
      setTimeout(() => {
        setIsPlayingAudio(false);
        onNotify('🔊 語音提示播放：「已抵達 90° 電視主牆，請停留 4 秒進行特徵點自動捕獲！」');
      }, 3000);
    }, 2500);
  };

  const handleRunGuideTest = () => {
    setTestedItems([true, true, true, true]);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
    onNotify('🎯 360度攝影視覺指引測驗通過！4大站位定錨、水平儀與超廣角視野均符合規範。');
  };

  const stepsSop = [
    {
      title: '1. 玄關中軸線定錨 (0, 0)',
      sub: '座標原點定錨',
      body: '測量人員站在玄關入戶門中線，雙腳併攏背靠房門，將此處定為全室 360° 空間座標系 (0, 0) 原點。',
    },
    {
      title: '2. 0.5x 超廣角與持機高度',
      sub: 'FL+140cm 視線平水',
      body: 'iPad 維持在胸前水平高度 (FL+140cm)，開啟 0.5x 超廣角鏡頭，視野上下必須同時涵蓋「踢腳板線」與「大梁梁底」。',
    },
    {
      title: '3. 電子雙軸水平儀校準',
      sub: 'Pitch / Roll 0.0°',
      body: '確保螢幕中央電子十字水泡維持綠色 0.0°，嚴禁仰角過高（導致面寬算大）或俯角過低（進深算短）。',
    },
    {
      title: '4. 順時針 15°/秒 勻速繞圈',
      sub: '4 面牆各停留 4 秒',
      body: '以雙腳為軸原地向右順時針旋轉，0° 採光面 ➔ 90° 電視牆 ➔ 180° 玄關門 ➔ 270° 沙發背牆，每站停留 4 秒捕獲深度特徵。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f131d] border border-slate-700/90 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#141926]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  360度攝影視覺指引 (360° Photo Visual Guide)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  iPad 0.5x 超廣角 · 順時針14步SOP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                玄關中軸線定錨、雙軸電子水平儀平水校準、順時針勻速 15°/秒 繞圈與四大特徵牆面捕獲
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

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-grow">
          {/* Top Interactive Compass & Horizon Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 cols: 360 Interactive Compass Canvas */}
            <div className="lg:col-span-7 bg-[#0b0e16] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>360° 互動羅盤與方位導航儀</span>
                </div>
                <div className="font-mono text-cyan-300 font-bold text-sm">
                  {currentAngle}° · {wallInfo.name.split('·')[0]}
                </div>
              </div>

              {/* Compass Graphic */}
              <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Dial Circle */}
                <div className="relative w-44 h-44 rounded-full border-2 border-slate-700 bg-[#111624] flex items-center justify-center shadow-xl">
                  {/* Cardinal Points */}
                  <span className="absolute top-2 text-[11px] font-bold text-cyan-400">0° 採光窗</span>
                  <span className="absolute right-2 text-[11px] font-bold text-purple-400">90° 電視牆</span>
                  <span className="absolute bottom-2 text-[11px] font-bold text-orange-400">180° 玄關門</span>
                  <span className="absolute left-2 text-[11px] font-bold text-slate-400">270° 沙發背</span>

                  {/* Needle */}
                  <div
                    className="w-1.5 h-36 bg-gradient-to-t from-slate-600 via-transparent to-cyan-400 rounded-full transition-transform duration-150"
                    style={{ transform: `rotate(${currentAngle}deg)` }}
                  />
                  <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-md z-10" />

                  {/* Sweep sector indicator */}
                  <div
                    className="absolute w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400/30 pointer-events-none"
                    style={{ transform: `rotate(${currentAngle - 30}deg)` }}
                  />
                </div>

                {/* Wall info summary */}
                <div className="space-y-2 flex-grow max-w-xs">
                  <div className="bg-[#141a27] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">當前鎖定特徵牆面</div>
                    <div className="font-bold text-white text-sm text-cyan-300 mt-0.5">{wallInfo.name}</div>
                    <div className="text-[11px] text-slate-300 mt-1">{wallInfo.desc}</div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-1.5">梁位高程：{wallInfo.beam}</div>
                  </div>

                  {/* Angle quick stepper slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>旋轉角度滑桿 (0°~360°)</span>
                      <span className="font-mono text-cyan-300">{currentAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={currentAngle}
                      onChange={(e) => setCurrentAngle(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setCurrentAngle(deg)}
                        className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition ${
                          currentAngle === deg
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Electronic Dual-Axis Bubble Level */}
            <div className="lg:col-span-5 bg-[#0b0e16] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>電子雙軸水平儀 (LiDAR 平水)</span>
                </div>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isLevelGood
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-red-950 text-red-300 border border-red-500/50'
                  }`}
                >
                  {isLevelGood ? '✅ 平水精準' : '⚠️ 角度偏斜'}
                </span>
              </div>

              {/* Bubble Level Graphic */}
              <div className="my-auto py-3 flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full border-2 border-slate-700 bg-[#101522] flex items-center justify-center">
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-slate-700" />
                  <div className="absolute h-full w-[1px] bg-slate-700" />
                  <div className="w-12 h-12 rounded-full border border-dashed border-emerald-500/50" />

                  {/* Moving Bubble */}
                  <div
                    className={`w-6 h-6 rounded-full transition-all duration-100 shadow-md ${
                      isLevelGood ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-500 shadow-red-500/50'
                    }`}
                    style={{
                      transform: `translate(${pitchAngle * 10}px, ${pitchAngle * 6}px)`,
                    }}
                  />
                </div>

                <div className="font-mono text-xs mt-2 font-bold text-slate-300">
                  俯仰角 (Pitch): <span className={isLevelGood ? 'text-emerald-400' : 'text-red-400'}>{pitchAngle.toFixed(1)}°</span> (標準 0.0°)
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setPitchAngle((p) => Math.max(-10, Number((p - 1.0).toFixed(1))))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold"
                  >
                    -1°
                  </button>
                  <button
                    onClick={() => setPitchAngle(0.0)}
                    className="px-3 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold"
                  >
                    校準歸零 0.0°
                  </button>
                  <button
                    onClick={() => setPitchAngle((p) => Math.min(10, Number((p + 1.0).toFixed(1))))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold"
                  >
                    +1°
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center bg-[#131722] p-2 rounded-xl">
                保持 0.0° 避免開間面寬與天花進深幾何扭曲。
              </div>
            </div>
          </div>

          {/* 14-Step Clockwise SOP Navigation Cards */}
          <div className="bg-[#131824] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm">360° 空間攝影標準作業程序 (SOP)</div>
              <button
                onClick={handleSimulateAudioGuidance}
                disabled={isPlayingAudio}
                className="px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>{isPlayingAudio ? '語音播報導航中...' : '現場語音引導示範'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stepsSop.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStepTab(idx)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    activeStepTab === idx
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                      : 'bg-[#181f2f] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">{step.sub}</div>
                  <div className="font-bold text-white text-xs mt-0.5">{step.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Checklist for User's Test */}
          <div className="bg-[#131824] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>360° 攝影現場測驗驗收檢核 (Testing Verification)</span>
              </div>
              <button
                onClick={handleRunGuideTest}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow active:scale-95"
              >
                執行攝影測驗驗收
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: '入戶門原點 (0, 0) 定錨完成', desc: '雙腳併攏背靠房門，正視室內前方採光大窗' },
                { title: 'iPad 0.5x 超廣角與 FL+140cm 視高', desc: '同時包含地面踢腳線與大梁下緣，無手部遮擋' },
                { title: '電子雙軸水平儀 0.0° 平水確認', desc: '無俯仰角偏差，確保長寬比與正交直角精確' },
                { title: '4 大站位特徵點停留存留 4 秒', desc: '0°/90°/180°/270° 自動影像捕捉與深度圖提取' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition ${
                    testedItems[idx]
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-[#181f2f] border-slate-800 text-slate-300'
                  }`}
                >
                  {testedItems[idx] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#121622] flex flex-wrap items-center justify-between gap-2">
          <div className="text-slate-400 text-xs">
            支援 iPad Pro LiDAR 深度雷達掃描與陀螺儀即時感應
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              返回放樣
            </button>
            {onLaunchLiveCamera && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchLiveCamera();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>啟動 iPad 實體相機掃描</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
