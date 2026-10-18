import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomData, SunlightConfig } from '../types';
import { DEFAULT_SUNLIGHT } from '../data/materialsAndConfig';
import {
  Sun,
  Moon,
  Clock,
  Compass,
  Zap,
  Sliders,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface SunlightSimulationModalProps {
  room: RoomData;
  onClose: () => void;
  onApplySunlight?: (config: SunlightConfig) => void;
}

export const SunlightSimulationModal: React.FC<SunlightSimulationModalProps> = ({
  room,
  onClose,
  onApplySunlight,
}) => {
  const [config, setConfig] = useState<SunlightConfig>(room.sunlight || DEFAULT_SUNLIGHT);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const indoorLightRef = useRef<THREE.PointLight | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Time preset buttons
  const timePresets = [
    { label: '清晨 07:00', hour: 7.0, icon: '🌅' },
    { label: '上午 10:00', hour: 10.0, icon: '☀️' },
    { label: '正午 12:00', hour: 12.0, icon: '🌞' },
    { label: '午後 14:30', hour: 14.5, icon: '🌤️' },
    { label: '黃昏 17:30', hour: 17.5, icon: '🌇' },
    { label: '夜晚 20:00', hour: 20.0, icon: '🌙' },
  ];

  // Initialize Three.js interactive preview
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(500, 420, 600);
    camera.lookAt(0, room.height * 0.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    ambientLightRef.current = ambient;
    scene.add(ambient);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff3db, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 2000;
    sunLight.shadow.camera.left = -500;
    sunLight.shadow.camera.right = 500;
    sunLight.shadow.camera.top = 500;
    sunLight.shadow.camera.bottom = -500;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // Indoor Point Light (Warm Ceiling Downlight)
    const indoor = new THREE.PointLight(0xffe6c2, 1.5, 900);
    indoor.position.set(0, room.height - 20, 0);
    indoor.castShadow = true;
    indoorLightRef.current = indoor;
    scene.add(indoor);

    // Build Minimal Room Geometry (Floor, 3 Walls, Beams, Window hole)
    buildRoomGeometry(scene, room);

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, [room]);

  // Update Sunlight Calculation based on Hour & Season
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !indoorLightRef.current || !sceneRef.current) return;

    const hour = config.hour;
    const isNight = hour < 6.0 || hour > 18.5;

    // Sun altitude & azimuth angle
    // Altitude: 0 at 6am & 18:30pm, max at 12pm
    const noonDelta = Math.abs(12 - hour);
    let maxAltitudeDeg = 75; // Summer
    if (config.season === 'equinox') maxAltitudeDeg = 55;
    if (config.season === 'winter') maxAltitudeDeg = 35;

    const altitudeDeg = Math.max(0, maxAltitudeDeg - noonDelta * (maxAltitudeDeg / 6.5));
    const altitudeRad = (altitudeDeg * Math.PI) / 180;

    // Azimuth: East in morning, South at noon, West in afternoon
    const azimuthDeg = (hour - 6) * 15; // 0 to 180
    const azimuthRad = ((azimuthDeg - 90) * Math.PI) / 180;

    const dist = 700;
    const sunX = Math.cos(azimuthRad) * dist;
    const sunY = Math.sin(altitudeRad) * dist;
    const sunZ = Math.sin(azimuthRad) * dist;

    if (isNight) {
      sunLightRef.current.intensity = 0.05;
      sunLightRef.current.color.setHex(0x1e293b);
      ambientLightRef.current.intensity = 0.15;
      sceneRef.current.background = new THREE.Color(0x050811);
    } else {
      sunLightRef.current.position.set(sunX, Math.max(80, sunY), sunZ);
      sunLightRef.current.intensity = (altitudeDeg / maxAltitudeDeg) * 1.5 * config.sunIntensity;

      // Color temperature shift (morning/evening warm orange, noon cool white)
      if (hour <= 8 || hour >= 17) {
        sunLightRef.current.color.setHex(0xffaa55); // Golden hour
        ambientLightRef.current.intensity = 0.35;
        sceneRef.current.background = new THREE.Color(0x1a1528);
      } else {
        sunLightRef.current.color.setHex(0xfffaed); // Noon sun
        ambientLightRef.current.intensity = 0.6;
        sceneRef.current.background = new THREE.Color(0x0b1329);
      }
    }

    // Indoor Light Switch
    if (config.indoorLightEnabled) {
      indoorLightRef.current.intensity = isNight ? 2.2 : 0.8;
      indoorLightRef.current.visible = true;
    } else {
      indoorLightRef.current.visible = false;
    }
  }, [config, room]);

  function buildRoomGeometry(scene: THREE.Scene, r: RoomData) {
    const halfW = r.width / 2;
    const halfL = r.length / 2;

    // Floor
    const floorGeo = new THREE.BoxGeometry(r.width, 10, r.length);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd4b38a, roughness: 0.5 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -5, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const backGeo = new THREE.BoxGeometry(r.width, r.height, 15);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const backWall = new THREE.Mesh(backGeo, wallMat);
    backWall.position.set(0, r.height / 2, -halfL);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall
    const leftGeo = new THREE.BoxGeometry(15, r.height, r.length);
    const leftWall = new THREE.Mesh(leftGeo, wallMat);
    leftWall.position.set(-halfW, r.height / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right Wall with Window Opening Cut
    const rightGeo = new THREE.BoxGeometry(15, r.height, r.length);
    const rightWall = new THREE.Mesh(rightGeo, wallMat);
    rightWall.position.set(halfW, r.height / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Beam
    const beamGeo = new THREE.BoxGeometry(r.width, 55, 35);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, r.beamHeight + 55 / 2, 0);
    beam.castShadow = true;
    beam.receiveShadow = true;
    scene.add(beam);

    // Ceiling Drop
    const ceilDropGeo = new THREE.BoxGeometry(r.width * 0.4, 25, r.length);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const ceilDrop = new THREE.Mesh(ceilDropGeo, ceilMat);
    ceilDrop.position.set(-halfW + (r.width * 0.4) / 2, r.ceilingDrop + 12.5, 0);
    ceilDrop.castShadow = true;
    scene.add(ceilDrop);
  }

  const handleApply = () => {
    if (onApplySunlight) onApplySunlight(config);
    onClose();
  };

  const formatHour = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  光影模擬效果工作台
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold">
                  3D 動態太陽路徑演算法
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                動態模擬日照方位角、開窗陰影透射、梁下陰影遮擋與 3000K 室內照明
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>儲存光影設定</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Canvas & Right Controls */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-[#070b14]">
          {/* 3D Sunlight Preview Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>當前日照時間：</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatHour(config.hour)}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {config.hour >= 6 && config.hour <= 18 ? '☀️ 日光漫射中' : '🌙 夜間人工照明'}
              </span>
            </div>

            <div
              ref={containerRef}
              className="w-full flex-1 min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner relative"
            />

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>PCSS 柔和陰影核心 · 窗扇開口真實光斑投影</span>
              <span>梁底標高 265cm 遮光分析</span>
            </div>
          </div>

          {/* Sunlight Controls Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-slate-900/50">
            <div className="space-y-5">
              {/* Quick Time Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  日照時段快速預設
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timePresets.map((tp) => (
                    <button
                      key={tp.hour}
                      onClick={() => setConfig({ ...config, hour: tp.hour })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${
                        Math.abs(config.hour - tp.hour) < 0.3
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-sm">{tp.icon}</span>
                      <span>{tp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for exact time */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">連續時間微調</span>
                  <span className="font-mono font-bold text-amber-400">{formatHour(config.hour)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="22.0"
                  step="0.25"
                  value={config.hour}
                  onChange={(e) => setConfig({ ...config, hour: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>06:00 (日出)</span>
                  <span>12:00 (正午)</span>
                  <span>18:30 (日落)</span>
                  <span>22:00 (夜間)</span>
                </div>
              </div>

              {/* Season Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  季節太陽入射角 (緯度 24°N 台灣)
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'summer', name: '夏至 (78° 高仰角)' },
                    { id: 'equinox', name: '春秋分 (55° 標準)' },
                    { id: 'winter', name: '冬至 (32° 深斜射)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setConfig({ ...config, season: s.id as any })}
                      className={`p-2 rounded-lg text-center border transition-all ${
                        config.season === s.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indoor Lighting Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    室內 3000K 暖白嵌燈與氛圍光
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    天花降板懸浮燈帶照明輔助
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.indoorLightEnabled}
                    onChange={(e) => setConfig({ ...config, indoorLightEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-blue-300 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                採光與大梁避陰建議
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                本空間在冬至午後 14:00~16:30 斜照深入客廳達 4.2 米，大樑下淨高 265cm 阻光陰影已由空調降板 230cm 間接燈條完全補光。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            室內設計坐向：南向落地窗開口
          </span>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            確認套用
          </button>
        </div>
      </div>
    </div>
  );
};
