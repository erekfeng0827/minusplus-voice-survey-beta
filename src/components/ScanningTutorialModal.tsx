import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Play,
  RotateCw,
  Ruler,
  Maximize,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ScanningTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScan?: () => void;
  onNotify?: (msg: string) => void;
}

export const ScanningTutorialModal: React.FC<ScanningTutorialModalProps> = ({
  isOpen,
  onClose,
  onStartScan,
  onNotify,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '① 起點站位：玄關入戶門中軸線 (0° 定錨)',
      tag: '起步定位',
      desc: '測量人員站在房間「入戶門口中軸線」，背部微靠房門，正視室內前方。',
      points: [
        '雙腳站在入戶門中間基準線上，此處為全室 360° 座標原點 (0, 0)。',
        '雙手在胸前平舉 iPad，相機高度維持在 FL+140 cm（視線水平線）。',
        '鏡頭平直正對正前方「第 1 站：主採光窗面」，相機俯仰角歸零 0.0°。',
      ],
      tip: '請勿隨意前後移動腳步，所有測量均以門口原點為基準定錨。',
    },
    {
      step: 2,
      title: '② 標準持機姿勢與水平儀校準',
      tag: '防手震與水平',
      desc: '雙手握穩 iPad 左右兩側，手肘微夾維持三腳架穩定狀態。',
      points: [
        '開啟「攝影輔助格線」與「自動校準視角」，確保中央水平儀呈現綠色 0.0°。',
        '保持超廣角 0.5x 視角，將房間頂面天花與地面踢腳線同時納入視野。',
        '若環境光線不足，可開啟輔助補光，確保邊緣角線對比清晰。',
      ],
      tip: '相機仰角過高會導致開間算大，俯角過低會導致進深算短，請保持 0.0° 平水。',
    },
    {
      step: 3,
      title: '③ 旋轉平移節奏：順時針勻速 15°/秒',
      tag: '旋轉節奏',
      desc: '原地順時針（向右）旋轉身體與 iPad，切勿逆時針倒退或走動。',
      points: [
        '旋轉角速度維持在每秒約 15 度，繞行一整圈 360 度約需 24 秒。',
        '四大黃金站位：0°(主採光面) ➜ 90°(電視主牆) ➜ 180°(回望門洞) ➜ 270°(沙發背牆)。',
        '每到達一面牆，系統會語音播報提示，並停留 4 秒進行深度特徵捕捉與自動拍照。',
      ],
      tip: '平移過程如遇系統提示「平移速度過快」，請放慢節奏，避免影像殘影。',
    },
    {
      step: 4,
      title: '④ 自動識別結構特徵與垂直標高',
      tag: 'AI 幾何識別',
      desc: '系統邊緣計算自動萃取空間關鍵建築元素，無須手動拉尺。',
      points: [
        '自動捕捉梁底淨高（預設大梁淨高線 FL+265 cm，預防壓頭危險）。',
        '自動辨識天花吊隱式冷氣集風箱降板位（預設 FL+230 cm）。',
        '自動鎖定弱電插座孔底盒（FL+30 cm）與門口開關面板（FL+120 cm）。',
        '自動抓取門洞淨空寬度（90×210 cm）與窗台高度（90 cm）。',
      ],
      tip: '所有辨識尺寸皆經過「5 倍數整數契約」自動對齊，消除公差小數點。',
    },
    {
      step: 5,
      title: '⑤ 360° 閉環校核與一鍵套用至模組',
      tag: '契約閉合驗收',
      desc: '順時針轉滿 360 度回到入戶門原點，系統自動計算全室幾何閉合差。',
      points: [
        '比對第 1 站與第 3 站之開間面寬（±0 cm 零誤差）。',
        '比對第 2 站與第 4 站之進深長度（±0 cm 零誤差）。',
        '四面牆角直角率達到 90.0°，幾何契約 100% 合規。',
        '點擊「直接套用至模組」，尺寸即時寫入 2D/3D CAD 放樣施工圖面！',
      ],
      tip: '完成後可立即匯出標準 AutoCAD DXF 圖層與 PDF 施工圖送審。',
    },
  ];

  const handleVoiceDemo = (stepIdx: number) => {
    const text = steps[stepIdx].desc + '。' + steps[stepIdx].points[0];
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'zh-TW';
      utt.rate = 1.05;
      window.speechSynthesis.speak(utt);
    }
    onNotify?.(`🔊 正在語音播放：${steps[stepIdx].title}`);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  iPad 360° 空間攝影丈量教學指南
                </h3>
                <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/40 font-semibold">
                  工務必讀 SOP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                標準 5 步現場作業規範，確保 5 倍數幾何契約零誤差閉合
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-950/80">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`py-2.5 px-1 sm:px-3 text-center transition flex flex-col items-center gap-1 border-b-2 text-xs ${
                activeStep === idx
                  ? 'border-amber-400 bg-amber-950/30 text-amber-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold bg-slate-800 border border-slate-700">
                {st.step}
              </span>
              <span className="text-[10px] truncate max-w-full hidden sm:inline">
                {st.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Step Detail Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                  步驟 0{steps[activeStep].step}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {steps[activeStep].title}
                </h4>
              </div>

              <button
                onClick={() => handleVoiceDemo(activeStep)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>語音播報解說</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {steps[activeStep].desc}
            </p>

            {/* Checkpoint bullet points */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                執行細節與注意事項：
              </div>
              <ul className="space-y-2">
                {steps[activeStep].points.map((pt, pIdx) => (
                  <li
                    key={pIdx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Tip Box */}
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">工務前線竅門：</span>
                <span>{steps[activeStep].tip}</span>
              </div>
            </div>
          </div>

          {/* Do's and Don'ts comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>正確規範 (Recommended)</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                <li>人站在門口中軸線上，原地順時針向右自轉。</li>
                <li>手持高度 FL+140 cm，水平儀指針穩定在 0.0°。</li>
                <li>使用 0.5x 超廣角鏡頭，讓梁底與踢腳線完全入鏡。</li>
                <li>每面牆自動停頓 4 秒讓 AI 進行特徵對齊鎖定。</li>
              </ul>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 space-y-2">
              <div className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>常見錯誤 (Avoid)</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                <li>一邊錄影一邊在房間內前後隨意走動（會破壞原點基準）。</li>
                <li>鏡頭忽上忽下傾斜超過 10 度（會產生透視梯形畸變）。</li>
                <li>逆時針旋轉或左右反覆切換（會造成動線重複混亂）。</li>
                <li>旋轉過快（每秒大於 30 度容易模糊導致計算失準）。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
            >
              上一步
            </button>
            <button
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
            >
              下一步
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-full transition"
            >
              關閉教學
            </button>
            <button
              onClick={() => {
                onClose();
                onStartScan?.();
              }}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>我知道了，立即開始 360° 掃描</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
