import React, { useState } from 'react';
import {
  Layers,
  Wind,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Lightbulb,
  DoorClosed,
  Droplet,
} from 'lucide-react';
import { DETAIL_DRAWINGS_LIBRARY, DetailDrawing } from '../data/detailDrawingsData';
import { RoomData } from '../types';

interface DetailLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDetailToRoom: (detail: DetailDrawing) => void;
  onNotify: (msg: string) => void;
}

export const DetailLibraryModal: React.FC<DetailLibraryModalProps> = ({
  isOpen,
  onClose,
  onApplyDetailToRoom,
  onNotify,
}) => {
  const [activeCategory, setActiveCategory] = useState<'CEILING' | 'HVAC' | 'LIGHTING' | 'JOINERY' | 'BATHROOM'>('CEILING');
  const [selectedDetailId, setSelectedDetailId] = useState<string>(DETAIL_DRAWINGS_LIBRARY[0].id);

  if (!isOpen) return null;

  const filteredDetails = DETAIL_DRAWINGS_LIBRARY.filter((d) => d.category === activeCategory);
  const currentDetail =
    DETAIL_DRAWINGS_LIBRARY.find((d) => d.id === selectedDetailId) || filteredDetails[0];

  const handleApply = () => {
    onApplyDetailToRoom(currentDetail);
    onNotify(`✓ 已成功將「${currentDetail.title}」之造型與降板高程 (FL+${currentDetail.targetElevation}cm) 套用至當前空間！`);
  };

  const handleExportDxf = () => {
    onNotify(`✓ 已成功生成並匯出「${currentDetail.title}」AutoCAD 標準大樣圖檔 (.DXF)！`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  常用施工大樣圖庫 · 天花板與空調造型選型中心
                </h3>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                  依據幾何契約模數化
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                間接照明反光槽 · 極簡陰角 · 雙層立體出風 · 吊隱側吹側回 · 窗簾盒下壓整合
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-3 text-xs overflow-x-auto">
          <button
            onClick={() => {
              setActiveCategory('CEILING');
              setSelectedDetailId('DETAIL-CEIL-01');
            }}
            className={`py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all flex-shrink-0 ${
              activeCategory === 'CEILING'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            天花造型 (4套)
          </button>

          <button
            onClick={() => {
              setActiveCategory('HVAC');
              setSelectedDetailId('DETAIL-HVAC-01');
            }}
            className={`py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all flex-shrink-0 ${
              activeCategory === 'HVAC'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            空調風箱/檢修孔 (3套)
          </button>

          <button
            onClick={() => {
              setActiveCategory('LIGHTING');
              setSelectedDetailId('DETAIL-LITE-01');
            }}
            className={`py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all flex-shrink-0 ${
              activeCategory === 'LIGHTING'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            磁吸軌道燈槽 (無主燈)
          </button>

          <button
            onClick={() => {
              setActiveCategory('JOINERY');
              setSelectedDetailId('DETAIL-JOIN-01');
            }}
            className={`py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all flex-shrink-0 ${
              activeCategory === 'JOINERY'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DoorClosed className="w-4 h-4" />
            極窄吊軌門/電視懸空
          </button>

          <button
            onClick={() => {
              setActiveCategory('BATHROOM');
              setSelectedDetailId('DETAIL-BATH-01');
            }}
            className={`py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-all flex-shrink-0 ${
              activeCategory === 'BATHROOM'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplet className="w-4 h-4" />
            廚衛 215cm 降板防水防潮
          </button>
        </div>

        {/* Main Content: Left List + Right Detail View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Cards List */}
          <div className="w-72 sm:w-80 bg-slate-950/60 border-r border-slate-800 p-3 space-y-2 overflow-y-auto">
            {filteredDetails.map((detail) => {
              const isSelected = detail.id === currentDetail.id;
              return (
                <button
                  key={detail.id}
                  onClick={() => setSelectedDetailId(detail.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-md text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-bold">
                      FL+{detail.targetElevation}cm
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{detail.id}</span>
                  </div>
                  <div className="font-bold text-xs text-white line-clamp-1">{detail.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{detail.subTitle}</div>
                </button>
              );
            })}
          </div>

          {/* Right Blueprint & Spec Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Header of Selected Detail */}
            <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{currentDetail.title}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                    基準高程：FL+{currentDetail.targetElevation}cm
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{currentDetail.subTitle}</p>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>契約依據：{currentDetail.contractClause}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDxf}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  匯出大樣 DXF
                </button>
                <button
                  onClick={handleApply}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  套用至當前天花參數
                </button>
              </div>
            </div>

            {/* Architectural Cross-Section Blueprint SVG */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2 border-b border-slate-800/80 pb-1.5">
                <span className="font-mono font-bold text-cyan-300">
                  【剖面大樣比例 1:10 SECTION DETAIL】
                </span>
                <span>圖層：{currentDetail.cadLayers.join(' · ')}</span>
              </div>

              {/* Dynamic SVG Schematic of the Detail */}
              <div className="w-full max-w-2xl h-56 flex items-center justify-center">
                <svg
                  viewBox="0 0 600 240"
                  className="w-full h-full text-slate-300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="4,4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="4,4" />
                  <line x1="0" y1="190" x2="600" y2="190" stroke="#1e293b" strokeDasharray="4,4" />

                  {/* RC Ceiling Slab Top FL+280 */}
                  <rect x="20" y="20" width="560" height="25" fill="#334155" stroke="#475569" />
                  {/* Concrete Hatch Lines */}
                  <line x1="40" y1="20" x2="65" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <line x1="120" y1="20" x2="145" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <line x1="200" y1="20" x2="225" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <line x1="280" y1="20" x2="305" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <line x1="360" y1="20" x2="385" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <line x1="440" y1="20" x2="465" y2="45" stroke="#1e293b" strokeWidth="2" />
                  <text x="30" y="36" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    原結構 RC 樓板 ▼ FL+280cm
                  </text>

                  {/* Ceiling Drop Specific Graphics based on svgDiagramType */}
                  {currentDetail.svgDiagramType === 'COVE_LIGHT' && (
                    <g>
                      {/* Suspended Hangers */}
                      <line x1="100" y1="45" x2="100" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="260" y1="45" x2="260" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="420" y1="45" x2="420" y2="150" stroke="#94a3b8" strokeWidth="1.5" />

                      {/* Ceiling Drop FL+230 */}
                      <rect x="50" y="100" width="250" height="12" fill="#d97706" stroke="#f59e0b" />
                      <text x="60" y="110" fill="#ffffff" fontSize="9" fontWeight="bold">
                        空調降板天花 ▼ FL+230cm (12mm 矽酸鈣板)
                      </text>

                      {/* Cove Light Pocket Step */}
                      <rect x="290" y="75" width="10" height="37" fill="#f59e0b" />
                      <rect x="290" y="65" width="55" height="10" fill="#f59e0b" />
                      {/* Baffle */}
                      <rect x="340" y="65" width="6" height="22" fill="#f59e0b" />

                      {/* Glowing LED Strip */}
                      <circle cx="318" cy="71" r="5" fill="#fde047" />
                      <path d="M 318 66 L 330 45" stroke="#fef08a" strokeWidth="1" strokeDasharray="2,2" />
                      <path d="M 322 71 L 380 45" stroke="#fef08a" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="325" y="60" fill="#fde047" fontSize="9" fontWeight="bold">
                        LED 反光燈帶 (2700K 暖光)
                      </text>

                      {/* Main High Ceiling FL+265 */}
                      <rect x="350" y="150" width="220" height="12" fill="#475569" stroke="#64748b" />
                      <text x="365" y="160" fill="#cbd5e1" fontSize="9">
                        主空間平釘天花 ▼ FL+265cm (梁下淨高平齊)
                      </text>

                      {/* Dimension lines */}
                      <line x1="300" y1="120" x2="350" y2="120" stroke="#06b6d4" strokeWidth="1" />
                      <text x="312" y="132" fill="#06b6d4" fontSize="9" fontFamily="monospace">
                        W: 120mm
                      </text>
                    </g>
                  )}

                  {currentDetail.svgDiagramType === 'SHADOW_GAP' && (
                    <g>
                      {/* Left Wall RC */}
                      <rect x="20" y="45" width="60" height="180" fill="#334155" stroke="#475569" />
                      <text x="25" y="140" fill="#94a3b8" fontSize="10">RC 主梁/側牆</text>

                      {/* 15x15mm Shadow Gap reveal */}
                      <rect x="80" y="140" width="15" height="15" fill="#090d16" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="80" y="132" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                        15×15 陰角鋁壓條
                      </text>

                      {/* Flat ceiling */}
                      <rect x="95" y="140" width="450" height="12" fill="#475569" stroke="#64748b" />
                      <text x="180" y="149" fill="#ffffff" fontSize="10">
                        9mm 矽酸鈣雙層板 (FL+265cm 梁底平齊)
                      </text>
                    </g>
                  )}

                  {currentDetail.svgDiagramType === 'AC_SIDE_DISCHARGE' && (
                    <g>
                      {/* Suspended AC Plenum Box */}
                      <rect x="80" y="60" width="240" height="70" fill="#0284c7" opacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="95" y="80" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        吊隱式冷氣主機 (H: 200mm)
                      </text>
                      <text x="95" y="98" fill="#94a3b8" fontSize="9">
                        吊筋防震彈簧阻尼器 · 洩水坡度 1/100
                      </text>

                      {/* Ceiling Drop FL+230 */}
                      <rect x="50" y="140" width="300" height="12" fill="#d97706" stroke="#f59e0b" />
                      <text x="60" y="150" fill="#ffffff" fontSize="9">
                        空調天花降板面 ▼ FL+230cm
                      </text>

                      {/* Linear Slot Diffuser */}
                      <rect x="310" y="138" width="40" height="16" fill="#0369a1" stroke="#38bdf8" />
                      <text x="360" y="148" fill="#38bdf8" fontSize="9" fontWeight="bold">
                        無邊框雙層線型出風口 (1200×150mm)
                      </text>

                      {/* Air flow arrows */}
                      <path d="M 330 145 L 420 160" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                      <text x="430" y="165" fill="#38bdf8" fontSize="9">出風氣流 (微向下 15°)</text>
                    </g>
                  )}

                  {currentDetail.svgDiagramType === 'MAGNETIC_TRACK' && (
                    <g>
                      <rect x="30" y="130" width="540" height="14" fill="#475569" stroke="#64748b" />
                      <text x="40" y="141" fill="#ffffff" fontSize="9">
                        平釘天花完成面 ▼ FL+265cm
                      </text>

                      <rect x="260" y="115" width="35" height="30" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
                      <rect x="264" y="125" width="27" height="18" fill="#1e293b" />
                      <circle cx="270" cy="130" r="2" fill="#ef4444" />
                      <circle cx="285" cy="130" r="2" fill="#3b82f6" />
                      <text x="235" y="105" fill="#eab308" fontSize="9" fontWeight="bold">
                        內嵌 35×55mm 無邊框磁吸軌道 (DC 48V)
                      </text>

                      <rect x="267" y="144" width="21" height="25" fill="#334155" stroke="#fef08a" />
                      <polygon points="265,169 290,169 310,210 245,210" fill="#fde047" opacity="0.25" />
                      <text x="305" y="180" fill="#fde047" fontSize="9">
                        磁吸聚光射燈 / 泛光條模組
                      </text>
                    </g>
                  )}

                  {currentDetail.svgDiagramType === 'GLASS_PARTITION' && (
                    <g>
                      <rect x="200" y="60" width="80" height="40" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                      <text x="210" y="85" fill="#e2e8f0" fontSize="9" fontWeight="bold">
                        100×50 鍍鋅方鋼
                      </text>

                      <rect x="220" y="100" width="40" height="25" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                      <circle cx="232" cy="112" r="5" fill="#c084fc" />
                      <circle cx="248" cy="112" r="5" fill="#c084fc" />
                      <text x="270" y="115" fill="#c084fc" fontSize="9" fontWeight="bold">
                        油壓緩衝重型吊軌 (載重120kg)
                      </text>

                      <rect x="236" y="125" width="8" height="95" fill="#38bdf8" opacity="0.7" stroke="#0284c7" />
                      <text x="250" y="170" fill="#38bdf8" fontSize="9">
                        16mm 極窄消光黑鋁框 + 長虹超白玻璃
                      </text>
                      <line x1="150" y1="225" x2="350" y2="225" stroke="#64748b" strokeWidth="2" />
                      <text x="260" y="235" fill="#94a3b8" fontSize="8">地坪零軌道 · 預留 8mm 導向間隙</text>
                    </g>
                  )}

                  {currentDetail.svgDiagramType === 'BATH_DROP_WATERPROOF' && (
                    <g>
                      <circle cx="150" cy="85" r="28" fill="#334155" stroke="#64748b" strokeWidth="2" />
                      <circle cx="150" cy="85" r="20" fill="#1e293b" />
                      <text x="185" y="80" fill="#38bdf8" fontSize="9">
                        Ø110 污廢水吊管 + 橡膠阻尼隔音氈
                      </text>

                      <line x1="50" y1="150" x2="550" y2="150" stroke="#10b981" strokeWidth="3" />
                      <rect x="180" y="145" width="120" height="25" fill="#065f46" stroke="#34d399" />
                      <text x="195" y="160" fill="#ecfdf5" fontSize="9" fontWeight="bold">
                        四合一暖風機整合孔
                      </text>
                      <text x="60" y="170" fill="#10b981" fontSize="9" fontWeight="bold">
                        衛浴防潮降板 ▼ FL+215cm (符合幾何契約)
                      </text>
                    </g>
                  )}

                  {/* Fallback default illustration for other details */}
                  {['STEPPED_SLOT', 'CURVED_BEAM', 'AC_INSPECTION_SLOT', 'CURTAIN_AC_BOX', 'SUSPENDED_TV_WALL'].includes(
                    currentDetail.svgDiagramType
                  ) && (
                    <g>
                      <rect x="60" y="65" width="220" height="60" fill="#0284c7" opacity="0.25" stroke="#38bdf8" />
                      <rect x="40" y="135" width="320" height="12" fill="#d97706" stroke="#f59e0b" />
                      <rect x="360" y="155" width="200" height="12" fill="#475569" stroke="#64748b" />
                      <text x="70" y="95" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        {currentDetail.title} 造型模組
                      </text>
                      <text x="60" y="145" fill="#ffffff" fontSize="9">
                        降板完成面 ▼ FL+{currentDetail.targetElevation}cm
                      </text>
                      <text x="380" y="165" fill="#cbd5e1" fontSize="9">
                        主空間完成面 ▼ FL+265cm
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              <div className="w-full text-center text-[10px] text-slate-500 mt-2">
                可直接導入 AutoCAD 圖面作為典型放樣大樣圖層（尺寸公差依室內設計合約 ≤2mm）
              </div>
            </div>

            {/* Materials & Construction Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Materials */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>指定材料與工料規格</span>
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {currentDetail.materials.map((mat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Construction Notes */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>施工驗收要點與合規防呆</span>
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {currentDetail.constructionNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            符合《降板裁決_v003》高層 265 / 230 / 215 規範
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
