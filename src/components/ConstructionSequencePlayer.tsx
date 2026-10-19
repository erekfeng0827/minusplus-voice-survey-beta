import React, { useState, useEffect, useRef } from 'react';
import { RoomData } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wrench,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  Sliders,
  Printer,
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ConstructionSequencePlayerProps {
  room: RoomData;
}

export interface ConstructionStage {
  id: number;
  stageCode: string;
  name: string;
  shortPhase: string;
  category: 'SURVEY' | 'FLOOR' | 'WALL' | 'BEAM' | 'CEILING' | 'FINISH' | 'SIGNOFF';
  leadTrade: string;
  durationDays: number;
  elevationFocus: string;
  targetTolerance: string;
  headline: string;
  coreRule: string;
  preRequisites: string[];
  tasks: string[];
  redFlags: string[];
  activeLayers: {
    floor: boolean;
    walls: boolean;
    electrical: boolean;
    beam: boolean;
    ceiling: boolean;
    finishes: boolean;
    fixtures: boolean;
  };
}

export const ConstructionSequencePlayer: React.FC<ConstructionSequencePlayerProps> = ({ room }) => {
  // Current playing step (0 to 6)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2500); // ms per step
  const [viewMode, setViewMode] = useState<'plan' | 'section' | 'tradeTable'>('plan');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stages: ConstructionStage[] = [
    {
      id: 0,
      stageCode: 'STEP-01',
      name: '現場放樣與雷射基準線確立',
      shortPhase: '基準放樣',
      category: 'SURVEY',
      leadTrade: '工程測量放樣組 / 工務所主任',
      durationDays: 1,
      elevationFocus: 'FL ±0.00 / 基準點 (0, 0)',
      targetTolerance: '全室矩形對角線公差 ≤ ±2 mm',
      headline: '原點定位 · 十字墨線彈射 · 結構體垂直度與空鼓檢核',
      coreRule: '以房間西南角鋼為 (0,0) 原點，紅外線水平儀投射 FL+100cm 基準線，核對面寬與進深。',
      preRequisites: [
        '現場毛胚面垃圾清理完畢，地面無積水砂石',
        '室內設計建築圖面與《降板裁決_v003.json》幾何契約已交付',
      ],
      tasks: [
        `彈射進深 ${room.length} cm、面寬 ${room.width} cm 之四周外廓牆基墨線`,
        '於四角標註激光測距驗收點，標註開口門扇 (W: 95cm) 放樣底線',
        '使用雙軸水平儀確認 RC 結構牆體傾斜度與大梁底標高 (原梁檢測)',
      ],
      redFlags: [
        '禁止直接依賴肉眼或捲尺丈量，必須以綠光 12 線紅外線水平儀閉合校準',
        '若發現結構體對角線誤差 > 5mm，必須立即通報結構監造，嚴禁強行施工',
      ],
      activeLayers: {
        floor: false,
        walls: true,
        electrical: false,
        beam: false,
        ceiling: false,
        finishes: false,
        fixtures: false,
      },
    },
    {
      id: 1,
      stageCode: 'STEP-02',
      name: '先地坪：管線預埋、落塵降板與防潮層',
      shortPhase: '地坪工程',
      category: 'FLOOR',
      leadTrade: '泥水工程組 / 給排水水電組',
      durationDays: 3,
      elevationFocus: 'FL -1.5cm 至 FL ±0.00',
      targetTolerance: '落塵降板落差 15 mm (±1 mm)，排水坡度 1:100',
      headline: '落塵區高低差放樣 · 冷水/熱水主管配管 · 給水管持壓 10kg/cm²',
      coreRule: '落塵區降板 1.5 cm 預留防潮隔音墊與地磚厚度；濕區洩水坡度嚴格抓 1/100，無積水死角。',
      preRequisites: [
        '步驟一放樣墨線已獲監造工程師覆核簽證',
        '水電開關插座與穿地暗管規格書審查完畢',
      ],
      tasks: [
        '施作給排水幹管預埋、空調冷凝排水管穿地預留接頭',
        '玄關落塵區降板 15mm 鋁合金收邊條定位打件',
        '冷熱給水管充水試壓 10 kg/cm² 持壓 24 小時無掉壓簽證',
        '全室地坪滾塗水性防潮底漆，鋪設橡膠隔音制振墊',
      ],
      redFlags: [
        '給水管未經試壓前嚴禁灌注水泥砂漿掩埋！',
        '冷凝水排水管必須保持向落水頭方向 1/100 順坡，嚴防反坡逆流泡水',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: false,
        beam: false,
        ceiling: false,
        finishes: false,
        fixtures: false,
      },
    },
    {
      id: 2,
      stageCode: 'STEP-03',
      name: '次牆面：輕鋼隔間立柱與水電配管穿線',
      shortPhase: '牆體水電',
      category: 'WALL',
      leadTrade: '輕鋼架隔間組 / 甲種室內配線電匠',
      durationDays: 3,
      elevationFocus: 'FL +30cm (插座) / FL +120cm (開關)',
      targetTolerance: '底盒水平平整度公差 ≤ 1 mm',
      headline: '隔間立柱 C 型鋼 (間距 40cm) · EMT/PVC 管穿線 · 底盒水平定位',
      coreRule: '所有弱電插座標高 FL+30cm，電燈壁切開關標高 FL+120cm，強弱電管槽間距維持 ≥ 20cm。',
      preRequisites: [
        '步驟二地坪管線已拍照建檔存證',
        '電氣迴路圖 A-03 已簽核，確認各專用迴路容量 (20A NFB)',
      ],
      tasks: [
        `依開間放樣豎立 C 型鋼立柱（75mm×45mm，立柱間距 400mm 錯縫）`,
        '依圖面定位 110V/220V 鐵製底盒，加焊水平連接加強橫桿',
        '穿引 2.0mm / 5.5mm² 太平洋單芯銅線，迴路打標記線號套管',
        '弱電 CAT6A 網路線與 HDMI 影音穿線，單獨配置金屬屏障軟管',
      ],
      redFlags: [
        '嚴禁強電（110V/220V）與弱電（網路/電視）共用同一配線管槽！',
        '底盒必須使用水平尺雙向校準，若高低不一將導致日後面板歪斜退件',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: true,
        beam: false,
        ceiling: false,
        finishes: false,
        fixtures: false,
      },
    },
    {
      id: 3,
      stageCode: 'STEP-04',
      name: '大梁防護：結構梁避讓淨高 FL+265 與空調冷媒',
      shortPhase: '大梁冷媒',
      category: 'BEAM',
      leadTrade: '空調冷凍配管組 / 結構防護技師',
      durationDays: 2,
      elevationFocus: 'FL +265 cm (梁下底淨高契約)',
      targetTolerance: '大梁下淨空間絕對不得低於 2650 mm',
      headline: '結構大梁避讓 · 吊隱冷氣主機吊掛 · 銅管與保溫棉被覆',
      coreRule: '嚴格恪遵大梁下淨高 265 cm 幾何契約！嚴禁在結構梁主筋受拉區開孔，冷媒配管採側向下繞。',
      preRequisites: [
        '牆面輕鋼骨架垂直固定驗收完成',
        '吊隱式冷氣主機型號、集風箱尺寸與重量吊點已覆核',
      ],
      tasks: [
        `於結構大梁下測量並劃定 FL+${room.beamHeight} cm 絕對安全避讓紅線`,
        '以 3/8" 全牙鍍鋅吊桿打入膨脹螺絲，安裝減振橡膠墊吊掛吊隱室內機',
        '施作 0.8mm 厚脫氧無氧冷媒銅管焊接，包覆 10mm 難燃級黑色橡膠保溫管',
        '安裝冷凝水提升泵浦（如需要）或自然洩水管，充氮 35kg/cm² 持壓測漏',
      ],
      redFlags: [
        '【嚴重紅燈】嚴禁鑽孔穿透大梁混凝土主筋！任何管線穿梁必須走既有套管',
        '冷媒管彎折必須使用專用彎管器，嚴禁死折導致冷媒流通截面積縮減',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: true,
        beam: true,
        ceiling: false,
        finishes: false,
        fixtures: false,
      },
    },
    {
      id: 4,
      stageCode: 'STEP-05',
      name: '後天花：天花降板骨架與高程放樣 (230/215)',
      shortPhase: '天花骨架',
      category: 'CEILING',
      leadTrade: '木作天花輕鋼骨架組 / 集風箱風管組',
      durationDays: 4,
      elevationFocus: 'FL +230 cm (空調降板) / FL +215 cm (廚衛降板)',
      targetTolerance: '天花水平面平整度 3米靠尺誤差 ≤ 2 mm',
      headline: '《降板裁決_v003》高程實現 · 450×450mm 雙層百葉維修孔定位',
      coreRule: '空調出風風箱平頂降至 FL+230 cm，廚衛降至 FL+215 cm，天花主骨間距 90cm，副骨間距 30cm。',
      preRequisites: [
        '空調冷媒管、排水管與電氣天花線路試運轉無滲漏',
        '大梁防護與天花吊筋拉拔力測試（單點拉力 ≥ 50kg）通過',
      ],
      tasks: [
        `雷射投射 FL+${room.ceilingDrop} cm 水平基準，安裝輕鋼天花沿邊 L 型邊龍骨`,
        `安裝 38 主龍骨與 50 副龍骨，遇室內機出風口預留 1200×150mm 出風箱孔`,
        '於室內機電控盒正下方預留 450×450mm 鋁合金下掀式雙層維修孔骨架',
        `廚衛及玄關降板區垂直下折轉折處封閉式加強骨，標高鎖定在 FL+${room.bathKitchenDrop || 215} cm`,
      ],
      redFlags: [
        '出風口下緣若未嚴格貼合 230cm 降板面，將產生冷熱氣流短路與天花結露！',
        '維修孔骨架若未加固獨立吊筋，日後技師推頂檢修可能導致天花板開裂變形',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: true,
        beam: true,
        ceiling: true,
        finishes: false,
        fixtures: false,
      },
    },
    {
      id: 5,
      stageCode: 'STEP-06',
      name: '面飾封板：矽酸鈣防火封板與飾面工程',
      shortPhase: '封板飾面',
      category: 'FINISH',
      leadTrade: '室內裝修木作組 / 油漆噴塗飾面組',
      durationDays: 5,
      elevationFocus: '立面與天花完成面 (Finished Surface)',
      targetTolerance: '板縫平整度 ≤ 0.5 mm，無透底、無毛刺',
      headline: '9mm 日本麗仕矽酸鈣防潮板 · 錯縫釘結 · AB膠玻璃纖維網防裂批土',
      coreRule: '天花與牆面一律採 9mm 防火一級矽酸鈣板錯縫封板，自攻螺絲間距 ≤ 15cm，表面批土 3 度磨平。',
      preRequisites: [
        '天花內水電線管、冷媒管、風箱接頭五方聯合拍照隱蔽工程驗收',
        '隔音棉填充密度 48kg/m³ 鋪設平整，無滑落隙縫',
      ],
      tasks: [
        '全室天花以 9mm 矽酸鈣板封底，板與板之間預留 3mm 伸縮微縫',
        '接縫處填補專用雙液型 AB 膠，黏貼防裂玻璃纖維網帶，批土三度細磨',
        '地坪鋪設選定之高級海島型實木地板或微水泥自流平無縫地坪',
        '牆面滾塗選定之環保低甲醛乳膠漆（三底兩面）或特殊礦物珪藻土',
      ],
      redFlags: [
        '矽酸鈣板嚴禁通縫拼貼！必須 T 字錯縫，十字通縫 100% 造成日後震動開裂',
        '地坪四周必須保留 8~10mm 伸縮縫，並以踢腳板或矽利康軟質收邊',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: true,
        beam: true,
        ceiling: true,
        finishes: true,
        fixtures: false,
      },
    },
    {
      id: 6,
      stageCode: 'STEP-07',
      name: '設備終端安裝與五方完工查驗',
      shortPhase: '設備驗收',
      category: 'SIGNOFF',
      leadTrade: '電氣儀控組 / 營造工務所 / 設計師 / 業主五方',
      durationDays: 1,
      elevationFocus: '全室高程與終端設備全面通電',
      targetTolerance: 'V-01 ~ V-10 幾何與電氣逐項實測後簽發',
      headline: '燈具開關面板 · 雙層線性百葉固定 · 絕緣阻抗測試 · 交付驗收',
      coreRule: '完成 Panasonic 霧黑面板安裝、嵌入式 Ra95 筒燈通電、空調試運轉 2hr、簽署 V-01~10 結案簽證。',
      preRequisites: [
        '油漆塗裝已全乾，全室現場完成細部清潔吸塵',
        '總配電箱 NFB 與漏電斷路器迴路標記清晰',
      ],
      tasks: [
        '安裝全室嵌入式防眩筒燈、磁吸軌道燈與天花間接照明燈條',
        '裝設開關面板與 110V/220V 插座面板，實施接地導通與迴路相位檢測',
        '安裝空調出風口雙層活動百葉，測試冷房出風口風速 ≥ 2.5 m/s',
        '五方代表實地拿測距儀複測 265 / 230 / 215 高程，簽署數位驗收合格書',
      ],
      redFlags: [
        '插座地線嚴禁空接！必須以相位測試儀實測中性線與火線極性',
        '驗收若發現任何標高非 5 的倍數，即刻列入改善清單於 24 小時內修正',
      ],
      activeLayers: {
        floor: true,
        walls: true,
        electrical: true,
        beam: true,
        ceiling: true,
        finishes: true,
        fixtures: true,
      },
    },
  ];

  const currentStage = stages[currentStep];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev >= stages.length - 1 ? 0 : prev + 1));
      }, playSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed, stages.length]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(stages.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-100">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Title and Flow Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                {currentStage.stageCode} / 07
              </span>
              <h3 className="text-base font-bold text-white tracking-wide">
                施工流程動態序列圖：{currentStage.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              營造工序循序指引 · 先地坪、次牆面、後天花幾何邏輯驗收
            </p>
          </div>
        </div>

        {/* Dynamic Player Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 shadow-inner">
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="回到第 1 步 (放樣基準)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="上一步工序"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all shadow ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isPlaying ? '暫停播放' : '自動播放施工序列動畫'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>暫停</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>播放序列</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === stages.length - 1}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="下一步工序"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="border-l border-slate-700 pl-2 ml-1 flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">速率:</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs px-1.5 py-0.5 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value={3500}>1.0x 慢速</option>
              <option value={2500}>1.5x 標準</option>
              <option value={1500}>2.0x 快速</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('plan')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === 'plan'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D 平面層次圖
          </button>
          <button
            onClick={() => setViewMode('section')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === 'section'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            垂直高程工序剖面
          </button>
          <button
            onClick={() => setViewMode('tradeTable')}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'tradeTable'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3" />
            營造工種交底表
          </button>
        </div>
      </div>

      {/* Step Timeline Indicator */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
        <div className="grid grid-cols-7 gap-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(idx);
                }}
                className={`relative flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10 scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200 hover:bg-emerald-950/50'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isCurrent
                        ? 'text-amber-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-[11px] font-bold truncate w-full">{stage.shortPhase}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate w-full">
                  {stage.durationDays} 工日 · {stage.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center: Dynamic Plan or Section Graphic (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[420px]">
          {/* Header of Visual */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">
                {viewMode === 'plan' && '動態工序施工平面疊加視圖 (PLAN LAYER VIEW)'}
                {viewMode === 'section' && '高程立體剖切工序進展視圖 (VERTICAL ELEVATION VIEW)'}
                {viewMode === 'tradeTable' && '營造工種交底清單 (TRADE MATRIX)'}
              </span>
            </div>

            <div className="text-xs font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {currentStage.elevationFocus}
            </div>
          </div>

          {/* Canvas Rendering Area */}
          <div className="flex-1 flex items-center justify-center p-2">
            {viewMode === 'plan' && (
              <div className="w-full max-w-lg relative flex flex-col items-center">
                <svg viewBox="0 0 540 400" className="w-full h-auto max-h-[340px] drop-shadow-md">
                  {/* Grid background */}
                  <defs>
                    <pattern id="seqGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="540" height="400" fill="#060913" />
                  <rect x="30" y="30" width="480" height="340" fill="url(#seqGrid)" />

                  {/* STAGE 01+: Base Room Outline */}
                  <rect
                    x="50"
                    y="50"
                    width="440"
                    height="300"
                    fill={currentStage.activeLayers.floor ? '#0B1528' : 'none'}
                    stroke="#3B82F6"
                    strokeWidth={currentStep === 0 ? '3' : '2'}
                    className="transition-all duration-500"
                  />

                  {/* Laser Datum Lines (Step 01 Highlight) */}
                  {currentStep === 0 && (
                    <g>
                      {/* Laser crosslines */}
                      <line x1="50" y1="200" x2="490" y2="200" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 3" />
                      <line x1="270" y1="50" x2="270" y2="350" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 3" />
                      {/* Origin (0,0) point marker */}
                      <circle cx="50" cy="350" r="7" fill="#10B981" />
                      <circle cx="50" cy="350" r="14" fill="none" stroke="#10B981" strokeWidth="1.5" className="animate-ping" />
                      <text x="65" y="345" fill="#6EE7B7" fontSize="11" fontWeight="bold" fontFamily="monospace">
                        原點基準 (0,0)
                      </text>
                      {/* Staking dimensions */}
                      <text x="270" y="35" fill="#60A5FA" fontSize="12" textAnchor="middle" fontWeight="bold">
                        面寬開間：{room.width} cm
                      </text>
                      <text x="20" y="200" fill="#60A5FA" fontSize="12" textAnchor="middle" transform="rotate(-90 20 200)" fontWeight="bold">
                        進深長度：{room.length} cm
                      </text>
                    </g>
                  )}

                  {/* STAGE 02+: Floor Plumbing & Drop Layer */}
                  {currentStage.activeLayers.floor && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Dust drop entry area (e.g. at bottom near door) */}
                      <rect x="50" y="300" width="160" height="50" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 2" />
                      <text x="130" y="330" fill="#67E8F9" fontSize="10" textAnchor="middle" fontWeight="bold">
                        玄關落塵降板 (FL-1.5cm)
                      </text>

                      {/* Floor drains and plumbing lines */}
                      <line x1="120" y1="350" x2="120" y2="150" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="120" y1="150" x2="350" y2="150" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="350" cy="150" r="5" fill="#0284C7" />
                      <text x="360" y="145" fill="#38BDF8" fontSize="9">冷水/熱水幹管預埋 (持壓 10kg/cm²)</text>

                      {currentStep === 1 && (
                        <g>
                          <rect x="50" y="50" width="440" height="300" fill="#0EA5E9" fillOpacity="0.08" />
                          <text x="270" y="220" fill="#38BDF8" fontSize="13" textAnchor="middle" fontWeight="bold">
                            ✔ 地坪防潮底漆塗佈 &amp; 給水試壓 24hr 簽證
                          </text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* STAGE 03+: Wall Studs & Electrical Points */}
                  {currentStage.activeLayers.electrical && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Conduit paths along walls */}
                      <line x1="60" y1="60" x2="480" y2="60" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 3" />
                      <line x1="480" y1="60" x2="480" y2="340" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 3" />

                      {/* Electrical point nodes */}
                      {room.electricalPoints.map((ep, i) => {
                        const svgX = 50 + (ep.x / room.width) * 440;
                        const svgY = 50 + (ep.y / room.length) * 300;
                        return (
                          <g key={ep.id || i}>
                            <circle cx={svgX} cy={svgY} r={currentStep === 2 ? '6' : '4'} fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
                            {currentStep === 2 && (
                              <circle cx={svgX} cy={svgY} r="10" fill="none" stroke="#F59E0B" strokeWidth="1" className="animate-ping" />
                            )}
                            <text x={svgX + 8} y={svgY + 4} fill="#FDE047" fontSize="9" fontWeight="bold">
                              {ep.name} (FL+{ep.elevation})
                            </text>
                          </g>
                        );
                      })}
                      {currentStep === 2 && (
                        <text x="270" y="180" fill="#FBBF24" fontSize="12" textAnchor="middle" fontWeight="bold">
                          ⚡ 輕鋼隔間立柱 40cm 間距 · 專用迴路管線配置
                        </text>
                      )}
                    </g>
                  )}

                  {/* STAGE 04+: Beam Envelope & HVAC Piping */}
                  {currentStage.activeLayers.beam && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Beam rectangle */}
                      <rect
                        x="50"
                        y="180"
                        width="440"
                        height="40"
                        fill="#581C87"
                        fillOpacity="0.4"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeDasharray={currentStep === 3 ? 'none' : '4 2'}
                      />
                      <text x="270" y="205" fill="#E9D5FF" fontSize="11" textAnchor="middle" fontWeight="bold">
                        結構橫樑 (梁底淨高 FL+{room.beamHeight} cm · 嚴禁洗孔)
                      </text>

                      {/* AC Indoor Unit Position */}
                      <rect x="70" y="80" width="130" height="55" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
                      <text x="135" y="112" fill="#C7D2FE" fontSize="10" textAnchor="middle" fontWeight="bold">
                        吊隱室內機主機
                      </text>

                      {/* Refrigerant Copper Pipe */}
                      <path d="M 200 110 L 480 110" fill="none" stroke="#EC4899" strokeWidth="2.5" />
                      <text x="320" y="102" fill="#F472B6" fontSize="9">冷媒銅管 + 保溫被覆</text>
                    </g>
                  )}

                  {/* STAGE 05+: Ceiling Drop Framing */}
                  {currentStage.activeLayers.ceiling && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Ceiling drop area (e.g. left side 230cm) */}
                      <rect
                        x="50"
                        y="50"
                        width="200"
                        height="150"
                        fill="#78350F"
                        fillOpacity="0.35"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                      <text x="150" y="70" fill="#FDE68A" fontSize="11" textAnchor="middle" fontWeight="bold">
                        空調天花降板 (FL+{room.ceilingDrop} cm)
                      </text>

                      {/* 450x450 inspection hatch */}
                      <rect x="120" y="125" width="40" height="40" fill="#451A03" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="140" y="150" fill="#FEF3C7" fontSize="8" textAnchor="middle">
                        維修孔 45×45
                      </text>
                    </g>
                  )}

                  {/* STAGE 06+: Finishes Cladding */}
                  {currentStage.activeLayers.finishes && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Walls finished */}
                      <rect x="46" y="46" width="448" height="308" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                      {/* Floor finish tint */}
                      <rect x="52" y="52" width="436" height="296" fill="#F8FAFC" fillOpacity="0.04" />
                      {/* Board joints (cross layout) */}
                      <line x1="200" y1="50" x2="200" y2="350" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
                      <line x1="360" y1="50" x2="360" y2="350" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
                      <text x="400" y="320" fill="#94A3B8" fontSize="9">
                        9mm 矽酸鈣錯縫封板
                      </text>
                    </g>
                  )}

                  {/* STAGE 07: Final Inspection & Fixtures Lighting */}
                  {currentStage.activeLayers.fixtures && (
                    <g className="transition-all duration-500 animate-fadeIn">
                      {/* Downlights glowing */}
                      <circle cx="200" cy="120" r="15" fill="#FBBF24" fillOpacity="0.25" />
                      <circle cx="200" cy="120" r="4" fill="#F59E0B" />
                      <circle cx="380" cy="120" r="15" fill="#FBBF24" fillOpacity="0.25" />
                      <circle cx="380" cy="120" r="4" fill="#F59E0B" />
                      <circle cx="290" cy="270" r="15" fill="#FBBF24" fillOpacity="0.25" />
                      <circle cx="290" cy="270" r="4" fill="#F59E0B" />

                      {/* Passed Stamp */}
                      <g transform="translate(340, 240) rotate(-10)">
                        <rect x="0" y="0" width="130" height="42" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                        <text x="65" y="20" fill="#34D399" fontSize="12" textAnchor="middle" fontWeight="bold" letterSpacing="1">
                          EVIDENCE_READY · 待 CAD 回讀
                        </text>
                        <text x="65" y="34" fill="#6EE7B7" fontSize="9" textAnchor="middle">
                          五方驗收合格簽章
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Door Opening */}
                  <line x1="120" y1="350" x2="215" y2="350" stroke="#EF4444" strokeWidth="4" />
                  <text x="167" y="375" fill="#FCA5A5" fontSize="10" textAnchor="middle">
                    門扇開口 (W: 95cm)
                  </text>
                </svg>

                {/* Live Layer State Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-mono ${currentStage.activeLayers.floor ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-600'}`}>
                    1.地坪防潮
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className={`px-2 py-0.5 rounded font-mono ${currentStage.activeLayers.electrical ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-600'}`}>
                    2.牆體水電
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className={`px-2 py-0.5 rounded font-mono ${currentStage.activeLayers.beam ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-900 text-slate-600'}`}>
                    3.大梁冷媒
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className={`px-2 py-0.5 rounded font-mono ${currentStage.activeLayers.ceiling ? 'bg-orange-950 text-orange-300 border border-orange-800' : 'bg-slate-900 text-slate-600'}`}>
                    4.天花降板
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className={`px-2 py-0.5 rounded font-mono ${currentStage.activeLayers.finishes ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-600'}`}>
                    5.面飾封板
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'section' && (
              <div className="w-full max-w-lg flex flex-col items-center">
                <svg viewBox="0 0 540 320" className="w-full h-auto bg-slate-900/60 border border-slate-800 rounded p-2">
                  {/* Slab line (Top) */}
                  <line x1="30" y1="40" x2="510" y2="40" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="515" y="44" fill="#94A3B8" fontSize="10" fontFamily="monospace">CL +280 (結構樓板)</text>

                  {/* Floor line (Bottom) */}
                  <line x1="30" y1="270" x2="510" y2="270" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="515" y="274" fill="#94A3B8" fontSize="10" fontFamily="monospace">FL ±0.00 (完成面)</text>

                  {/* Step 2: Floor sub-layer */}
                  {currentStage.activeLayers.floor && (
                    <g>
                      <rect x="30" y="260" width="480" height="10" fill="#0284C7" fillOpacity="0.4" />
                      <line x1="30" y1="260" x2="510" y2="260" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 2" />
                      <text x="60" y="255" fill="#7DD3FC" fontSize="9">防潮隔音打底層</text>
                    </g>
                  )}

                  {/* Step 3: Wall Socket Elevation */}
                  {currentStage.activeLayers.electrical && (
                    <g>
                      {/* Socket at FL+30 */}
                      <line x1="30" y1="240" x2="510" y2="240" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />
                      <circle cx="200" cy="240" r="4" fill="#F59E0B" />
                      <text x="210" y="244" fill="#FCD34D" fontSize="9">FL +30 插座出線</text>

                      {/* Switch at FL+120 */}
                      <line x1="30" y1="170" x2="510" y2="170" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />
                      <circle cx="100" cy="170" r="4" fill="#F59E0B" />
                      <text x="110" y="174" fill="#FCD34D" fontSize="9">FL +120 壁切開關</text>
                    </g>
                  )}

                  {/* Step 4: Beam Clear 265 */}
                  {currentStage.activeLayers.beam && (
                    <g>
                      <rect x="220" y="40" width="160" height="30" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                      <line x1="30" y1="70" x2="510" y2="70" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 2" />
                      <text x="300" y="60" fill="#FECACA" fontSize="9" textAnchor="middle" fontWeight="bold">
                        梁下淨高 +265 cm (5倍數契約)
                      </text>
                    </g>
                  )}

                  {/* Step 5: Ceiling Drop 230 */}
                  {currentStage.activeLayers.ceiling && (
                    <g>
                      <rect x="50" y="40" width="150" height="70" fill="#78350F" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1.5" />
                      <line x1="30" y1="110" x2="510" y2="110" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />
                      <text x="125" y="95" fill="#FDE68A" fontSize="9" textAnchor="middle" fontWeight="bold">
                        空調降板 +230 cm (風箱出線)
                      </text>
                    </g>
                  )}

                  {/* Step 6: Finishes Boarding */}
                  {currentStage.activeLayers.finishes && (
                    <g>
                      <line x1="50" y1="115" x2="200" y2="115" stroke="#10B981" strokeWidth="3" />
                      <text x="125" y="130" fill="#6EE7B7" fontSize="9" textAnchor="middle">
                        9mm 矽酸鈣封板面
                      </text>
                    </g>
                  )}
                </svg>
                <div className="text-[11px] text-slate-400 mt-2">
                  垂直剖面清晰顯示由地坪（FL±0）往上逐層施工之高度節點，嚴格呼應「5 倍數」驗收規格。
                </div>
              </div>
            )}

            {viewMode === 'tradeTable' && (
              <div className="w-full h-full overflow-auto max-h-[340px]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-800 font-mono text-[11px]">
                    <tr>
                      <th className="p-2">階段序號</th>
                      <th className="p-2">工序名稱</th>
                      <th className="p-2">責任工種</th>
                      <th className="p-2">預估工日</th>
                      <th className="p-2">關鍵高程 / 驗收條件</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {stages.map((st, i) => (
                      <tr
                        key={st.id}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStep(i);
                        }}
                        className={`cursor-pointer transition-colors ${
                          i === currentStep
                            ? 'bg-amber-500/20 text-white font-semibold'
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="p-2 font-mono text-amber-400">{st.stageCode}</td>
                        <td className="p-2">{st.name}</td>
                        <td className="p-2 text-cyan-400">{st.leadTrade}</td>
                        <td className="p-2 font-mono text-purple-300">{st.durationDays} 天</td>
                        <td className="p-2 font-mono text-emerald-400">{st.targetTolerance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Caption */}
          <div className="border-t border-slate-800/80 pt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>現場工法原則：先基底水平、次隱蔽管線、後封板飾面</span>
            <span className="font-mono text-emerald-400">CODEX JINGJING AUTOMATED BLUEPRINT</span>
          </div>
        </div>

        {/* Right: Stage Deep-Dive Contractor Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Main Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    {currentStage.stageCode} · {currentStage.category}
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">{currentStage.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    {currentStage.durationDays} 工日
                  </div>
                </div>
              </div>

              {/* Trade Responsibility */}
              <div className="my-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <div className="text-[10px] text-slate-400">責任施工班組：</div>
                  <div className="font-semibold text-slate-200">{currentStage.leadTrade}</div>
                </div>
              </div>

              {/* Core Rule & Tolerance */}
              <div className="space-y-2 mb-3">
                <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-300 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    幾何契約與查驗公差：
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentStage.targetTolerance}
                  </p>
                  <p className="text-blue-200/90 text-[11px] mt-1 font-mono">
                    {currentStage.coreRule}
                  </p>
                </div>

                {/* Specific Tasks */}
                <div className="border border-slate-800/80 rounded-lg p-2.5 bg-slate-900/40">
                  <div className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    本階段標準施工作業項目：
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {currentStage.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-mono text-[10px] mt-0.5">▸</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Red Flags / Danger alerts */}
                <div className="border border-red-900/50 rounded-lg p-2.5 bg-red-950/20">
                  <div className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    營造防呆與現場避雷警戒 (RED FLAGS)：
                  </div>
                  <ul className="space-y-1 text-[11px] text-red-200/90">
                    {currentStage.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-mono text-[10px] mt-0.5">⚠</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Navigation Footer */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                ← 上一工序
              </button>
              <span className="text-slate-500 font-mono text-[11px]">
                {currentStep + 1} / {stages.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentStep === stages.length - 1}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                下一工序 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
