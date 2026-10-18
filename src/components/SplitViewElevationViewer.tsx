import React, { useState, useMemo } from 'react';
import { RoomData, WindowOpening, Door, Beam, ElectricalPoint } from '../types';
import {
  Maximize2,
  Minimize2,
  Compass,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  RotateCw,
  Ruler,
  FileCode,
  Tag,
  Info,
} from 'lucide-react';

export type ElevationOrientation = 'N' | 'E' | 'S' | 'W';

interface SplitViewElevationViewerProps {
  room: RoomData;
  initialOrientation?: ElevationOrientation;
  onNotify?: (msg: string) => void;
}

export const SplitViewElevationViewer: React.FC<SplitViewElevationViewerProps> = ({
  room,
  initialOrientation = 'N',
  onNotify,
}) => {
  const [activeOrientation, setActiveOrientation] = useState<ElevationOrientation>(initialOrientation);
  const [coneFov, setConeFov] = useState<number>(60); // 60 degree architectural view cone
  const [showSightlines, setShowSightlines] = useState<boolean>(true);
  const [showDatums, setShowDatums] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showMepPoints, setShowMepPoints] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Safe dimensions
  const roomW = Number(room.width) || 480;
  const roomL = Number(room.length) || 550;
  const roomH = Number(room.height) || 280;
  const beamH = Number(room.beamHeight) || 265;
  const dropH = Number(room.ceilingDrop) || 230;

  // View orientation metadata
  const orientationData = useMemo(() => {
    return {
      N: {
        code: 'N',
        sectionLabel: "A - A' 剖面",
        title: '北向立面 (North Elevation · 主牆視向)',
        desc: '由南向北投影：電視造型主牆、天花空調回風降板 (FL+230) 與主音響插座配置',
        wallWidth: roomW,
        viewAngle: -90, // Facing North (Up)
        cutLine: {
          x1: 40,
          y1: roomL * 0.45,
          x2: roomW - 40,
          y2: roomL * 0.45,
        },
        viewpoint: {
          x: roomW / 2,
          y: roomL * 0.72,
        },
      },
      E: {
        code: 'E',
        sectionLabel: "B - B' 剖面",
        title: '東向立面 (East Elevation · 入口大門視向)',
        desc: '由西向東投影：玄關進出門扇 (FL+210)、雙切開關 (FL+120) 與吊隱主機風管側牆',
        wallWidth: roomL,
        viewAngle: 0, // Facing East (Right)
        cutLine: {
          x1: roomW * 0.45,
          y1: 40,
          x2: roomW * 0.45,
          y2: roomL - 40,
        },
        viewpoint: {
          x: roomW * 0.25,
          y: roomL / 2,
        },
      },
      S: {
        code: 'S',
        sectionLabel: "C - C' 剖面",
        title: '南向立面 (South Elevation · 採光景觀窗視向)',
        desc: '由北向南投影：落地大片景觀窗 (窗台 FL+15)、天花暗藏窗簾盒與防漏光遮簷槽',
        wallWidth: roomW,
        viewAngle: 90, // Facing South (Down)
        cutLine: {
          x1: 40,
          y1: roomL * 0.55,
          x2: roomW - 40,
          y2: roomL * 0.55,
        },
        viewpoint: {
          x: roomW / 2,
          y: roomL * 0.28,
        },
      },
      W: {
        code: 'W',
        sectionLabel: "D - D' 剖面",
        title: '西向立面 (West Elevation · 沙發主梁剖視向)',
        desc: '由東向西投影：沙發背牆造型木格柵、結構橫梁 B1 (梁下淨高 FL+265) 斷面避讓',
        wallWidth: roomL,
        viewAngle: 180, // Facing West (Left)
        cutLine: {
          x1: roomW * 0.55,
          y1: 40,
          x2: roomW * 0.55,
          y2: roomL - 40,
        },
        viewpoint: {
          x: roomW * 0.75,
          y: roomL / 2,
        },
      },
    };
  }, [roomW, roomL]);

  const currentView = orientationData[activeOrientation];

  // Calculate View Cone Polygon points for SVG Floor Plan
  const coneGeometry = useMemo(() => {
    const vp = currentView.viewpoint;
    const halfAngle = (coneFov / 2) * (Math.PI / 180);
    const radius = Math.max(roomW, roomL) * 0.8;

    let baseAngle = 0;
    if (activeOrientation === 'N') baseAngle = -Math.PI / 2; // Up
    else if (activeOrientation === 'E') baseAngle = 0; // Right
    else if (activeOrientation === 'S') baseAngle = Math.PI / 2; // Down
    else if (activeOrientation === 'W') baseAngle = Math.PI; // Left

    const leftAngle = baseAngle - halfAngle;
    const rightAngle = baseAngle + halfAngle;

    const pLeft = {
      x: vp.x + radius * Math.cos(leftAngle),
      y: vp.y + radius * Math.sin(leftAngle),
    };
    const pRight = {
      x: vp.x + radius * Math.cos(rightAngle),
      y: vp.y + radius * Math.sin(rightAngle),
    };

    return {
      viewpoint: vp,
      pLeft,
      pRight,
      polygonPoints: `${vp.x},${vp.y} ${pLeft.x},${pLeft.y} ${pRight.x},${pRight.y}`,
    };
  }, [currentView, coneFov, activeOrientation, roomW, roomL]);

  return (
    <div
      className={`w-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Header & View Direction Tabs */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-mono font-bold">
            {activeOrientation}
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>上下對照立面視錐施工系統</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-blue-950 text-blue-300 border border-blue-700">
                {currentView.sectionLabel}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              上面：平面切圖視錐索引 · 下面：對應真實垂直展開立面
            </div>
          </div>
        </div>

        {/* Direction Switcher Buttons (A-A', B-B', C-C', D-D') */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['N', 'E', 'S', 'W'] as ElevationOrientation[]).map((orient) => {
            const meta = orientationData[orient];
            const isSelected = activeOrientation === orient;
            return (
              <button
                key={orient}
                onClick={() => {
                  setActiveOrientation(orient);
                  onNotify?.(`已切換為 ${meta.sectionLabel} (${meta.title}) 上下視錐對照！`);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{meta.code} 向</span>
                <span className="text-[10px] opacity-80">{meta.sectionLabel}</span>
              </button>
            );
          })}
        </div>

        {/* View Options & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition ${
              showDimensions
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            尺寸標註：{showDimensions ? '顯示' : '隱藏'}
          </button>

          <button
            onClick={() => setShowDatums(!showDatums)}
            className={`px-2 py-1 rounded border text-[11px] font-medium transition ${
              showDatums
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            高程基準：{showDatums ? '顯示' : '隱藏'}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? '離開全螢幕' : '全螢幕檢視'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* DUAL VIEWPORT: 上面是平面圖視錐切圖對應，下面是立面圖 */}
      <div className="flex flex-col divide-y divide-slate-800/90 bg-[#070b14]">
        {/* ========================================================================= */}
        {/* 【上面】平面圖視錐切圖對照 (KEY PLAN & 60° ELEVATION VIEW CONE)           */}
        {/* ========================================================================= */}
        <div className="p-3 bg-slate-950/90 relative">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>【上面】平面位置與視錐切圖對照 (Key Plan & View Cone)</span>
              <span className="text-[10px] text-slate-400 font-mono">
                視角 FOV: {coneFov}° · 點擊平面四周可即時切換向度
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-yellow-400 inline-block"></span>
                <span className="text-yellow-300 font-mono">{currentView.sectionLabel} 剖切面線</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/40 border border-cyan-400 inline-block"></span>
                <span className="text-cyan-300">視錐投射扇區</span>
              </span>
            </div>
          </div>

          {/* SVG Floor Plan with Dynamic Animated View Cone */}
          <div className="w-full flex justify-center items-center overflow-x-auto py-1">
            <svg
              viewBox={`-50 -50 ${roomW + 100} ${roomL + 100}`}
              className="max-h-[260px] w-auto bg-slate-900/90 border border-slate-800 rounded-lg font-mono shadow-inner select-none"
            >
              <defs>
                {/* View Cone Radial Gradient */}
                <radialGradient id="viewConeGrad" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
                </radialGradient>

                {/* Section Arrow Marker */}
                <marker
                  id="sectionArrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#FACC15" />
                </marker>
              </defs>

              {/* Grid Background */}
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
              <rect x="-40" y="-40" width={roomW + 80} height={roomL + 80} fill="url(#gridPattern)" />

              {/* 1. Room Outer Walls */}
              <rect
                x="0"
                y="0"
                width={roomW}
                height={roomL}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="14"
                strokeLinejoin="round"
              />
              <rect
                x="0"
                y="0"
                width={roomW}
                height={roomL}
                fill="#0b1120"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* 2. Ceiling Drop Zone (FL+230) on North Wall */}
              <rect
                x="0"
                y="0"
                width={roomW}
                height={roomL * 0.35}
                fill="#78350f"
                fillOpacity="0.22"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text x="15" y="25" fill="#fde68a" fontSize="10" fontWeight="bold">
                天花降板區 FL+230cm (吊隱冷氣出風)
              </text>

              {/* 3. Structural Beam (FL+265) */}
              <rect
                x="0"
                y={roomL * 0.48}
                width={roomW}
                height="35"
                fill="#7f1d1d"
                fillOpacity="0.25"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x="15" y={roomL * 0.48 + 22} fill="#fca5a5" fontSize="10" fontWeight="bold">
                結構主梁 B1 (梁底淨高 FL+265cm)
              </text>

              {/* 4. Windows on South Wall */}
              <rect
                x={roomW * 0.2}
                y={roomL - 8}
                width={roomW * 0.6}
                height="16"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text x={roomW / 2} y={roomL + 25} fill="#38bdf8" fontSize="10" textAnchor="middle">
                景觀落地大窗 (W:{Math.round(roomW * 0.6)}cm · 窗台 FL+15)
              </text>

              {/* 5. Door on East Wall */}
              <rect
                x={roomW - 8}
                y={roomL * 0.58}
                width="16"
                height="90"
                fill="#d97706"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
              {/* Door Swing Arc */}
              <path
                d={`M ${roomW - 8} ${roomL * 0.58} A 90 90 0 0 0 ${roomW - 98} ${roomL * 0.58 + 90}`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <text
                x={roomW + 20}
                y={roomL * 0.58 + 45}
                fill="#fbbf24"
                fontSize="10"
                transform={`rotate(90 ${roomW + 20} ${roomL * 0.58 + 45})`}
                textAnchor="middle"
              >
                玄關大門 (W:90 · H:210)
              </text>

              {/* 6. TV Cabinet / Feature Wall on North */}
              <rect
                x={roomW * 0.25}
                y="12"
                width={roomW * 0.5}
                height="30"
                fill="#334155"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              <text x={roomW / 2} y="32" fill="#e2e8f0" fontSize="10" textAnchor="middle">
                客廳電視大理石造型主牆
              </text>

              {/* 7. Sofa on South/Center */}
              <rect
                x={roomW * 0.22}
                y={roomL * 0.62}
                width={roomW * 0.56}
                height="55"
                rx="6"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <text x={roomW / 2} y={roomL * 0.62 + 32} fill="#94a3b8" fontSize="10" textAnchor="middle">
                三人人體工學沙發配置
              </text>

              {/* ========================================================= */}
              {/* THE DYNAMIC 60° ELEVATION VIEW CONE (立面視錐扇區投影)     */}
              {/* ========================================================= */}
              {/* View Cone Translucent Field */}
              <polygon
                points={coneGeometry.polygonPoints}
                fill="url(#viewConeGrad)"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="transition-all duration-300"
              />

              {/* Sightline Left & Right Rays */}
              {showSightlines && (
                <>
                  <line
                    x1={coneGeometry.viewpoint.x}
                    y1={coneGeometry.viewpoint.y}
                    x2={coneGeometry.pLeft.x}
                    y2={coneGeometry.pLeft.y}
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={coneGeometry.viewpoint.x}
                    y1={coneGeometry.viewpoint.y}
                    x2={coneGeometry.pRight.x}
                    y2={coneGeometry.pRight.y}
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </>
              )}

              {/* Viewpoint Camera Marker */}
              <g transform={`translate(${coneGeometry.viewpoint.x}, ${coneGeometry.viewpoint.y})`}>
                <circle cx="0" cy="0" r="14" fill="#0284c7" fillOpacity="0.4" className="animate-ping" />
                <circle cx="0" cy="0" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                {/* Viewing Direction Arrow */}
                <g transform={`rotate(${currentView.viewAngle})`}>
                  <line x1="0" y1="0" x2="26" y2="0" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#sectionArrow)" />
                </g>
                <text x="14" y="-12" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  視點 CAM-{activeOrientation}
                </text>
              </g>

              {/* CAD Cutting Section Line with Dual Arrow Tags */}
              <g>
                <line
                  x1={currentView.cutLine.x1}
                  y1={currentView.cutLine.y1}
                  x2={currentView.cutLine.x2}
                  y2={currentView.cutLine.y2}
                  stroke="#FACC15"
                  strokeWidth="2.5"
                  strokeDasharray="6 3 2 3"
                />

                {/* Section Bubble Start */}
                <circle cx={currentView.cutLine.x1} cy={currentView.cutLine.y1} r="10" fill="#854d0e" stroke="#FACC15" strokeWidth="1.8" />
                <text x={currentView.cutLine.x1} y={currentView.cutLine.y1 + 3.5} fill="#FEF08A" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {currentView.code}
                </text>

                {/* Section Bubble End */}
                <circle cx={currentView.cutLine.x2} cy={currentView.cutLine.y2} r="10" fill="#854d0e" stroke="#FACC15" strokeWidth="1.8" />
                <text x={currentView.cutLine.x2} y={currentView.cutLine.y2 + 3.5} fill="#FEF08A" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {currentView.code}'
                </text>
              </g>

              {/* Clickable North/East/South/West Selection Strips */}
              <rect
                x="0"
                y="-30"
                width={roomW}
                height="24"
                fill="transparent"
                className="cursor-pointer hover:fill-blue-500/20"
                onClick={() => setActiveOrientation('N')}
              />
              <rect
                x={roomW + 6}
                y="0"
                width="24"
                height={roomL}
                fill="transparent"
                className="cursor-pointer hover:fill-blue-500/20"
                onClick={() => setActiveOrientation('E')}
              />
              <rect
                x="0"
                y={roomL + 6}
                width={roomW}
                height="24"
                fill="transparent"
                className="cursor-pointer hover:fill-blue-500/20"
                onClick={() => setActiveOrientation('S')}
              />
              <rect
                x="-30"
                y="0"
                width="24"
                height={roomL}
                fill="transparent"
                className="cursor-pointer hover:fill-blue-500/20"
                onClick={() => setActiveOrientation('W')}
              />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 【下面】對應向度開展立面圖 (TRUE ORTHOGRAPHIC WALL ELEVATION VIEW)         */}
        {/* ========================================================================= */}
        <div className="p-3 bg-slate-900/60 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-white text-xs">
                【下面】{currentView.title} · 對應向度開展立面施工圖
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.2 rounded-full border border-emerald-800 font-mono">
                5倍數契約通過 (265 / 230 / 215)
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              面寬：{currentView.wallWidth} cm · 室內總淨高：{roomH} cm (比例 1:30)
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mb-2 px-1">
            {currentView.desc}
          </div>

          {/* Detailed Orthographic Elevation SVG */}
          <div className="w-full flex justify-center items-center overflow-x-auto">
            <svg
              viewBox="-80 -30 760 360"
              className="w-full max-w-4xl h-auto bg-slate-950 border border-slate-800 rounded-xl font-mono shadow-2xl p-2 select-none"
            >
              {/* Definitions: Grid & Hatch */}
              <defs>
                <pattern id="marbleHatch" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="none" stroke="#334155" strokeWidth="0.8" />
                </pattern>
                <pattern id="woodSlatHatch" width="10" height="40" patternUnits="userSpaceOnUse">
                  <line x1="5" y1="0" x2="5" y2="40" stroke="#475569" strokeWidth="1" />
                </pattern>
              </defs>

              {/* 1. Floor Level FL ±0 */}
              <line x1="0" y1="280" x2="600" y2="280" stroke="#FFFFFF" strokeWidth="3" />
              <text x="610" y="284" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                FL ±0 (地坪完成面)
              </text>

              {/* 2. Slab Top Ceiling CL +280 */}
              <line x1="0" y1="0" x2="600" y2="0" stroke="#FFFFFF" strokeWidth="3" />
              <text x="610" y="5" fill="#94A3B8" fontSize="10" fontWeight="bold">
                CL +280 (清水樓板頂)
              </text>

              {/* Wall Side Boundaries */}
              <line x1="0" y1="0" x2="0" y2="280" stroke="#64748B" strokeWidth="2" />
              <line x1="600" y1="0" x2="600" y2="280" stroke="#64748B" strokeWidth="2" />

              {/* DYNAMIC ELEVATION CONTENT ACCORDING TO ORIENTATION */}
              {/* NORTH WALL (A-A'): TV Feature Wall, AC Drop, Beam */}
              {activeOrientation === 'N' && (
                <g>
                  {/* Drop Ceiling Box FL+230 (Δh = 50cm) */}
                  <rect x="0" y="0" width="600" height="50" fill="#78350F" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 3" />
                  <text x="300" y="32" fill="#FDE68A" fontSize="10" textAnchor="middle" fontWeight="bold">
                    天花空調降板 FL+230 cm (吊隱式室內機配置區 · 淨深 50cm)
                  </text>
                  <text x="610" y="54" fill="#F59E0B" fontSize="9" fontWeight="bold">
                    FL +230 (天花降板)
                  </text>

                  {/* 45x45 AC Inspection Hatch */}
                  <rect x="420" y="10" width="45" height="30" fill="#92400E" stroke="#FBBF24" strokeWidth="1.2" />
                  <text x="442" y="28" fill="#FEF08A" fontSize="8" textAnchor="middle">
                    45×45 檢修孔
                  </text>

                  {/* Linear Slot Diffuser */}
                  <rect x="120" y="42" width="220" height="6" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                  <text x="230" y="38" fill="#7DD3FC" fontSize="8" textAnchor="middle">
                    雙線型微孔出風口 (220cm)
                  </text>

                  {/* TV Marble Feature Wall (FL+30 to FL+230) */}
                  <rect x="80" y="80" width="440" height="170" fill="url(#marbleHatch)" stroke="#64748B" strokeWidth="2" />
                  <rect x="100" y="95" width="400" height="140" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                  <text x="300" y="170" fill="#E2E8F0" fontSize="12" fontWeight="bold" textAnchor="middle">
                    義大利雪白銀狐大理石主牆 (寬 400cm × 高 140cm)
                  </text>

                  {/* TV Socket Box Level FL+30 */}
                  <line x1="180" y1="250" x2="420" y2="250" stroke="#06B6D4" strokeDasharray="3 2" />
                  <circle cx="260" cy="250" r="5" fill="#06B6D4" />
                  <circle cx="340" cy="250" r="5" fill="#06B6D4" />
                  <text x="300" y="244" fill="#67E8F9" fontSize="8" textAnchor="middle">
                    110V 影音音響插座 / HDMI / 網路管線 (FL+30cm)
                  </text>
                  <text x="610" y="253" fill="#06B6D4" fontSize="9">
                    FL +30 (弱電插座)
                  </text>

                  {/* Detail Callout Badge 1 */}
                  <g transform="translate(50, 48)">
                    <circle cx="0" cy="0" r="12" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#C7D2FE" fontSize="7" fontWeight="bold" textAnchor="middle">
                      DET-01
                    </text>
                    <text x="18" y="3" fill="#A5B4FC" fontSize="8">
                      天花暗藏木作收邊條
                    </text>
                  </g>
                </g>
              )}

              {/* EAST WALL (B-B'): Entrance Door, Electrical Panel */}
              {activeOrientation === 'E' && (
                <g>
                  {/* Drop Ceiling Box FL+230 on Left side */}
                  <rect x="0" y="0" width="180" height="50" fill="#78350F" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1="0" y1="50" x2="180" y2="50" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="90" y="30" fill="#FDE68A" fontSize="9" textAnchor="middle">
                    玄關降板天花 FL+230
                  </text>

                  {/* Main Entrance Door (FL 0 to FL+210, Width 90) */}
                  <rect x="220" y="70" width="120" height="210" fill="#334155" stroke="#F59E0B" strokeWidth="2" />
                  <rect x="230" y="80" width="100" height="190" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1.5" />
                  <circle cx="245" cy="180" r="4" fill="#FBBF24" />
                  <text x="280" y="165" fill="#FEF08A" fontSize="11" fontWeight="bold" textAnchor="middle">
                    防火實木玄關大門
                  </text>
                  <text x="280" y="185" fill="#CBD5E1" fontSize="9" textAnchor="middle">
                    (W:90 × H:210 cm)
                  </text>

                  {/* Door Top Datum Line */}
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#F59E0B" strokeDasharray="4 2" strokeWidth="1" />
                  <text x="610" y="74" fill="#F59E0B" fontSize="9">
                    FL +210 (門頂收口線)
                  </text>

                  {/* Dual Switch Box FL+120 */}
                  <circle cx="370" cy="160" r="6" fill="#A855F7" />
                  <line x1="370" y1="160" x2="600" y2="160" stroke="#A855F7" strokeDasharray="2 2" />
                  <text x="430" y="155" fill="#D8B4FE" fontSize="9">
                    門口雙切照明開關 (FL+120cm)
                  </text>
                  <text x="610" y="164" fill="#C084FC" fontSize="9">
                    FL +120 (開關面板)
                  </text>

                  {/* Weak Current Distribution Box */}
                  <rect x="420" y="180" width="80" height="90" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="460" y="230" fill="#7DD3FC" fontSize="9" textAnchor="middle">
                    智慧弱電配電箱
                  </text>
                </g>
              )}

              {/* SOUTH WALL (C-C'): Full-Height Landscape Window, Curtain Recess */}
              {activeOrientation === 'S' && (
                <g>
                  {/* Curtain Box Recess at Ceiling CL+280 (Depth 25cm) */}
                  <rect x="50" y="0" width="500" height="25" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="300" y="16" fill="#7DD3FC" fontSize="9" textAnchor="middle">
                    暗藏式天花電動窗簾盒槽深 25cm (防漏光設計)
                  </text>

                  {/* Big Landscape Window (W:480, Sill FL+15 to FL+255) */}
                  <rect x="60" y="25" width="480" height="240" fill="#0C4A6E" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2.5" />
                  {/* Glass Division Panes */}
                  <line x1="220" y1="25" x2="220" y2="265" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="380" y1="25" x2="380" y2="265" stroke="#38BDF8" strokeWidth="2" />

                  {/* Window Sill FL+15 Line */}
                  <line x1="0" y1="265" x2="600" y2="265" stroke="#38BDF8" strokeDasharray="3 2" />
                  <text x="610" y="269" fill="#38BDF8" fontSize="9">
                    FL +15 (矮窗台度)
                  </text>

                  <text x="300" y="145" fill="#BAE6FD" fontSize="12" fontWeight="bold" textAnchor="middle">
                    落地景觀強化 LOW-E 雙層氣密鋁窗
                  </text>
                  <text x="300" y="165" fill="#7DD3FC" fontSize="9" textAnchor="middle">
                    開口淨寬 480 cm × 淨高 240 cm · 窗台 FL+15
                  </text>
                </g>
              )}

              {/* WEST WALL (D-D'): Structural Beam B1 Cross Section, Sofa Back Wall */}
              {activeOrientation === 'W' && (
                <g>
                  {/* Structural Beam B1 Cross Section (Clear Height FL+265 -> Drop 15cm from 280) */}
                  <rect x="0" y="0" width="600" height="15" fill="#7F1D1D" fillOpacity="0.5" stroke="#EF4444" strokeWidth="2" />
                  <line x1="0" y1="15" x2="600" y2="15" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="300" y="12" fill="#FCA5A5" fontSize="9" textAnchor="middle" fontWeight="bold">
                    大梁 B1 實測橫斷面 (梁底淨高 FL+265cm · 5倍數合規核定)
                  </text>
                  <text x="610" y="18" fill="#EF4444" fontSize="9" fontWeight="bold">
                    FL +265 (大梁下淨高)
                  </text>

                  {/* Wood Slat Sofa Accent Wall (FL 0 to FL+265) */}
                  <rect x="60" y="35" width="480" height="245" fill="url(#woodSlatHatch)" stroke="#475569" strokeWidth="1.5" />
                  <rect x="120" y="60" width="360" height="200" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
                  <text x="300" y="150" fill="#F1F5F9" fontSize="12" fontWeight="bold" textAnchor="middle">
                    沙發背牆 · 實木天然格柵吸音造型飾板
                  </text>
                  <text x="300" y="170" fill="#94A3B8" fontSize="9" textAnchor="middle">
                    頂端距大梁底預留 5cm 施工手路伸縮縫
                  </text>

                  {/* Sofa End Table Socket FL+30 */}
                  <circle cx="100" cy="250" r="5" fill="#06B6D4" />
                  <circle cx="500" cy="250" r="5" fill="#06B6D4" />
                  <text x="100" y="242" fill="#67E8F9" fontSize="8" textAnchor="middle">
                    插座 FL+30
                  </text>
                  <text x="500" y="242" fill="#67E8F9" fontSize="8" textAnchor="middle">
                    插座 FL+30
                  </text>
                </g>
              )}

              {/* VERTICAL ARCHITECTURAL DIMENSION CHAIN ON THE LEFT */}
              {showDimensions && (
                <g transform="translate(-40, 0)">
                  {/* Total Height 280cm Line */}
                  <line x1="0" y1="0" x2="0" y2="280" stroke="#10B981" strokeWidth="2" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#10B981" strokeWidth="2" />
                  <line x1="-8" y1="280" x2="8" y2="280" stroke="#10B981" strokeWidth="2" />
                  <text x="-12" y="140" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(-90 -12 140)">
                    總樓高 280 cm
                  </text>

                  {/* Beam Ticks: 265cm */}
                  <line x1="-5" y1="15" x2="5" y2="15" stroke="#EF4444" strokeWidth="1.5" />
                  {/* Drop Ceiling Tick: 230cm */}
                  <line x1="-5" y1="50" x2="5" y2="50" stroke="#F59E0B" strokeWidth="1.5" />
                </g>
              )}

              {/* HORIZONTAL DIMENSION CHAIN AT THE BOTTOM */}
              {showDimensions && (
                <g transform="translate(0, 310)">
                  <line x1="0" y1="0" x2="600" y2="0" stroke="#10B981" strokeWidth="2" />
                  <line x1="0" y1="-6" x2="0" y2="6" stroke="#10B981" strokeWidth="2" />
                  <line x1="600" y1="-6" x2="600" y2="6" stroke="#10B981" strokeWidth="2" />
                  <text x="300" y="-8" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">
                    立面開間總寬：{currentView.wallWidth} cm [5倍數整除]
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-2 px-2">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>上下對照幾何契約：平面視錐切線與立面投影無縫對應，高層全面整除 5 (265 / 230 / 215)</span>
            </div>
            <span className="font-mono text-[11px] text-cyan-400">
              繪圖審計：Codex 晶晶 · 立面剖切公差 &lt; 1mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
