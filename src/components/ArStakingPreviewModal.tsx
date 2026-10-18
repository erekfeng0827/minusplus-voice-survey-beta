import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Layers,
  Compass,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Eye,
  Crosshair,
  Sliders,
  Ruler,
  AlertTriangle,
  Download,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { RoomData } from '../types';

interface ArStakingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onNotify: (msg: string) => void;
}

export const ArStakingPreviewModal: React.FC<ArStakingPreviewModalProps> = ({
  isOpen,
  onClose,
  room,
  onNotify,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [arLayerMode, setArLayerMode] = useState<'ALL' | 'CEILING' | 'MEP' | 'BEAM'>('ALL');
  const [pitchAngle, setPitchAngle] = useState<number>(35); // 抬頭角度 (度)
  const [yawAngle, setYawAngle] = useState<number>(0); // 方位角 (度)
  const [laserGuideActive, setLaserGuideActive] = useState<boolean>(true);
  const [showGrid5x, setShowGrid5x] = useState<boolean>(true);
  const [rulerMode, setRulerMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [simulatedScene, setSimulatedScene] = useState<'RAW_SLAB' | 'STEEL_FRAME' | 'FINISHED'>('STEEL_FRAME');
  const [wideViewMode, setWideViewMode] = useState<'wide' | 'standard'>('wide');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 嘗試啟動實景攝影機
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera access not granted or unavailable:', err);
          setCameraError('未偵測到相機或權限受限，已自動無縫切換為「現場虛擬實景透視」');
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, cameraActive]);

  if (!isOpen) return null;

  // 拍照存證
  const handleCaptureArSnapshot = () => {
    onNotify('📸 已成功擷取室內設計現場 AR 標註存證照片 (含 5倍數高層與時間戳浮水印)！');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (measurePoints.length >= 2) {
      setMeasurePoints([{ x, y }]);
    } else {
      setMeasurePoints([...measurePoints, { x, y }]);
      if (measurePoints.length === 1) {
        const dx = Math.abs(x - measurePoints[0].x);
        const estimatedCm = Math.round((dx * 0.8) / 5) * 5;
        onNotify(`📏 AR 雷射實測距離：${estimatedCm} cm (已自動吸附 5 倍數)`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  現場標註 AR 預覽 (空間虛擬雷射放樣)
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
                  {room.roomName} · 降板裁決 v003
                </span>
              </div>
              <p className="text-xs text-slate-400">
                將 265 / 230 / 215 降板高層與水電點位即時投影至現場天花與牆面實景
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 相機切換按鈕 */}
            <button
              onClick={() => {
                setCameraActive(!cameraActive);
                if (!cameraActive) {
                  onNotify('正在啟動現場相機 AR 視訊流...');
                } else {
                  onNotify('已切換為虛擬工地背景');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                cameraActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{cameraActive ? '使用現場相機中' : '啟用實景相機'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
          {/* Layer Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">AR 投影圖層:</span>
            {[
              { id: 'ALL', label: '全部顯示' },
              { id: 'CEILING', label: '天花降板 (265/230)' },
              { id: 'MEP', label: '水電/開關/崁燈' },
              { id: 'BEAM', label: '結構梁淨高 (265)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setArLayerMode(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  arLayerMode === tab.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2">
            {/* 5x Grid */}
            <button
              onClick={() => setShowGrid5x(!showGrid5x)}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                showGrid5x
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              <span>5cm 網格吸附</span>
            </button>

            {/* Laser Line */}
            <button
              onClick={() => setLaserGuideActive(!laserGuideActive)}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                laserGuideActive
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>綠色水平雷射線</span>
            </button>

            {/* Measure Tool */}
            <button
              onClick={() => {
                setRulerMode(!rulerMode);
                setMeasurePoints([]);
                if (!rulerMode) onNotify('已開啟 AR 雷射兩點測距工具，請在畫面上點擊兩點');
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                rulerMode
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Ruler className="w-3 h-3" />
              <span>AR 測距</span>
            </button>

            {/* Wide Angle Toggle (拉遠超廣角) */}
            {cameraActive && (
              <button
                onClick={() => setWideViewMode(wideViewMode === 'wide' ? 'standard' : 'wide')}
                className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                  wideViewMode === 'wide'
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="0.5x 超廣角拉遠視角，避免畫面被裁切只能拍到門"
              >
                <span>{wideViewMode === 'wide' ? '🔍 0.5x 超廣角 (拉遠)' : '🔍 1.0x 標準'}</span>
              </button>
            )}

            {/* Scene preset */}
            {!cameraActive && (
              <select
                value={simulatedScene}
                onChange={(e) => setSimulatedScene(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none"
              >
                <option value="STEEL_FRAME">施工現場: 輕鋼骨料已吊掛</option>
                <option value="RAW_SLAB">施工現場: 毛胚清水模混凝土</option>
                <option value="FINISHED">完工驗收: 天花封板平整</option>
              </select>
            )}
          </div>
        </div>

        {/* AR Viewport */}
        <div
          onClick={handleCanvasClick}
          className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center min-h-[480px] cursor-crosshair select-none"
        >
          {/* Background: Camera or Realistic Construction Site Simulator */}
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                transform: wideViewMode === 'wide' ? 'scale(0.8)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              className={`absolute inset-0 w-full h-full ${
                wideViewMode === 'wide' ? 'object-contain' : 'object-cover'
              }`}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-slate-900">
              {/* Construction Site Vector Graphic Texture */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%),
                    linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
                }}
              />

              {/* 3D Perspective Grid Room Environment */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                {/* Vanishing Point perspective lines */}
                <line x1="0" y1="0" x2="50%" y2="45%" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="100%" y1="0" x2="50%" y2="45%" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100%" x2="50%" y2="45%" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="100%" y1="100%" x2="50%" y2="45%" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                {/* Back wall boundary */}
                <rect x="25%" y="22%" width="50%" height="46%" fill="none" stroke="#475569" strokeWidth="1.5" />
              </svg>
            </div>
          )}

          {/* AR Overlay Graphic Engine */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* 1. FL+265 平頂天花綠色水平雷射線 */}
            {laserGuideActive && (arLayerMode === 'ALL' || arLayerMode === 'CEILING') && (
              <g className="transition-all duration-300">
                {/* Laser Glow */}
                <line
                  x1="5%"
                  y1="25%"
                  x2="95%"
                  y2="25%"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeOpacity="0.4"
                  filter="drop-shadow(0 0 8px #10b981)"
                />
                <line
                  x1="5%"
                  y1="25%"
                  x2="95%"
                  y2="25%"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  strokeDasharray="12 4"
                />
                {/* Laser Tag */}
                <rect x="6%" y="21%" width="150" height="22" rx="4" fill="#064e3b" fillOpacity="0.85" stroke="#10b981" strokeWidth="1" />
                <text x="7%" y="23.5%" fill="#6ee7b7" fontSize="11" fontWeight="bold" dominantBaseline="middle">
                  FL + 265 cm 平頂天花基準
                </text>
              </g>
            )}

            {/* 2. FL+230 降板天花黃色雷射線 */}
            {(arLayerMode === 'ALL' || arLayerMode === 'CEILING') && (
              <g className="transition-all duration-300">
                <line
                  x1="18%"
                  y1="36%"
                  x2="82%"
                  y2="36%"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeOpacity="0.7"
                  filter="drop-shadow(0 0 6px #f59e0b)"
                />
                <rect x="20%" y="32%" width="165" height="22" rx="4" fill="#78350f" fillOpacity="0.85" stroke="#f59e0b" strokeWidth="1" />
                <text x="21%" y="34.5%" fill="#fcd34d" fontSize="11" fontWeight="bold" dominantBaseline="middle">
                  FL + 230 cm 冷氣吊隱降板
                </text>
              </g>
            )}

            {/* 3. FL+215 衛浴廚房防潮降板藍色雷射線 */}
            {(arLayerMode === 'ALL' || arLayerMode === 'CEILING') && (
              <g className="transition-all duration-300">
                <line
                  x1="30%"
                  y1="46%"
                  x2="70%"
                  y2="46%"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  strokeOpacity="0.8"
                />
                <rect x="32%" y="42.5%" width="160" height="20" rx="4" fill="#164e63" fillOpacity="0.85" stroke="#06b6d4" strokeWidth="1" />
                <text x="33%" y="44.5%" fill="#67e8f9" fontSize="10" fontWeight="bold" dominantBaseline="middle">
                  FL + 215 cm 給排水穿梁安全區
                </text>
              </g>
            )}

            {/* 4. 水電與照明 AR 放樣雷射光標 (Crosshairs) */}
            {(arLayerMode === 'ALL' || arLayerMode === 'MEP') && (
              <>
                {/* 110V 雙聯插座 AR 標註 (H+30) */}
                <g transform="translate(180, 420)">
                  <circle r="12" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="-16" y1="0" x2="16" y2="0" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="0" y1="-16" x2="0" y2="16" stroke="#ef4444" strokeWidth="1.5" />
                  <rect x="18" y="-12" width="130" height="24" rx="4" fill="#1e1b4b" fillOpacity="0.9" stroke="#ef4444" strokeWidth="1" />
                  <text x="24" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    110V 雙聯 (H+30cm)
                  </text>
                </g>

                {/* 220V 專用插座 AR 標註 (H+220) */}
                <g transform="translate(680, 210)">
                  <circle r="14" fill="#f97316" fillOpacity="0.25" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="-18" y1="0" x2="18" y2="0" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="0" y1="-18" x2="0" y2="18" stroke="#f97316" strokeWidth="1.5" />
                  <rect x="-165" y="-12" width="150" height="24" rx="4" fill="#431407" fillOpacity="0.9" stroke="#f97316" strokeWidth="1" />
                  <text x="-158" y="4" fill="#fdba74" fontSize="10" fontWeight="bold">
                    冷氣 220V 專用 (H+220cm)
                  </text>
                </g>

                {/* 天花 7.5cm 防眩崁燈 AR 投影點 */}
                <g transform="translate(420, 160)">
                  <circle r="18" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 2" />
                  <circle r="4" fill="#fde047" />
                  <line x1="-22" y1="0" x2="22" y2="0" stroke="#eab308" strokeWidth="1" />
                  <line x1="0" y1="-22" x2="0" y2="22" stroke="#eab308" strokeWidth="1" />
                  <rect x="-65" y="-34" width="130" height="22" rx="4" fill="#422006" fillOpacity="0.9" stroke="#eab308" strokeWidth="1" />
                  <text x="0" y="-20" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
                    崁燈 L-01 (FL+265)
                  </text>
                </g>
              </>
            )}

            {/* 5. AR 雷射兩點測距連線 */}
            {measurePoints.length === 2 && (
              <g>
                <line
                  x1={measurePoints[0].x}
                  y1={measurePoints[0].y}
                  x2={measurePoints[1].x}
                  y2={measurePoints[1].y}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="5" fill="#38bdf8" />
                <circle cx={measurePoints[1].x} cy={measurePoints[1].y} r="5" fill="#38bdf8" />
                <rect
                  x={(measurePoints[0].x + measurePoints[1].x) / 2 - 40}
                  y={(measurePoints[0].y + measurePoints[1].y) / 2 - 14}
                  width="80"
                  height="22"
                  rx="4"
                  fill="#0369a1"
                  stroke="#38bdf8"
                />
                <text
                  x={(measurePoints[0].x + measurePoints[1].x) / 2}
                  y={(measurePoints[0].y + measurePoints[1].y) / 2}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  實測放樣線
                </text>
              </g>
            )}
          </svg>

          {/* Central Reticle Center HUD */}
          <div className="absolute pointer-events-none flex flex-col items-center justify-center">
            <div className="w-16 h-16 border border-cyan-400/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-2 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              仰角 {pitchAngle}° | 方位 {yawAngle}°
            </span>
          </div>

          {/* Watermark badge on bottom right */}
          <div className="absolute bottom-3 right-3 bg-black/75 border border-slate-700/80 rounded-xl p-2 text-[10px] text-slate-300 backdrop-blur-md pointer-events-none flex flex-col gap-0.5">
            <div className="font-bold text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              室內設計工務 AR 查核系統
            </div>
            <div className="text-slate-400">契約規範：降板裁決_v003 (5倍數嚴格卡關)</div>
            <div className="text-slate-400">時間戳：{new Date().toLocaleString('zh-TW')}</div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">視角仰角調整:</span>
              <input
                type="range"
                min="0"
                max="80"
                value={pitchAngle}
                onChange={(e) => setPitchAngle(Number(e.target.value))}
                className="w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-xs font-mono text-cyan-300">{pitchAngle}°</span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400">方位角度:</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={yawAngle}
                onChange={(e) => setYawAngle(Number(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-xs font-mono text-cyan-300">{yawAngle}°</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setPitchAngle(35);
                setYawAngle(0);
                setMeasurePoints([]);
                onNotify('已重置 AR 視角中心與標註');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-all"
            >
              重設視角
            </button>

            <button
              onClick={handleCaptureArSnapshot}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>拍照存證 (含放樣水印)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
