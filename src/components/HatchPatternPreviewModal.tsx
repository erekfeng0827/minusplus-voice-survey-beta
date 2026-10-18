import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCw,
  Maximize2,
  Sliders,
  Eye,
  Info,
  Brush,
  Grid,
} from 'lucide-react';
import { RoomData } from '../types';

export interface HatchPatternItem {
  id: string;
  name: string;
  englishName: string;
  category: 'structural' | 'flooring' | 'walls' | 'ceiling';
  autocadPattern: string;
  defaultScale: number;
  defaultAngle: number;
  defaultColor: string;
  description: string;
  renderType:
    | 'solid'
    | 'diagonal'
    | 'cross_diagonal'
    | 'grid'
    | 'staggered'
    | 'herringbone'
    | 'wood_plank'
    | 'hex'
    | 'terrazzo'
    | 'dots'
    | 'marble';
}

export const HATCH_PATTERNS: HatchPatternItem[] = [
  // 1. 結構剖面
  {
    id: 'solid_rc',
    name: 'SOLID 實心填滿 (RC 結構牆/柱)',
    englishName: 'SOLID',
    category: 'structural',
    autocadPattern: 'SOLID',
    defaultScale: 1.0,
    defaultAngle: 0,
    defaultColor: '#f59e0b',
    description: '剪力牆、承重柱、RC 地基樑剖面實心黑底/彩填',
    renderType: 'solid',
  },
  {
    id: 'ansi31_brick',
    name: 'ANSI31 單向 45° 斜線 (紅磚/輕隔間)',
    englishName: 'ANSI31',
    category: 'structural',
    autocadPattern: 'ANSI31',
    defaultScale: 1.0,
    defaultAngle: 45,
    defaultColor: '#ec4899',
    description: '12cm 砌紅磚牆、輕質矽酸鈣板隔間剖面標準線',
    renderType: 'diagonal',
  },
  {
    id: 'ansi32_steel',
    name: 'ANSI32 交叉菱形斜線 (型鋼/構件補強)',
    englishName: 'ANSI32',
    category: 'structural',
    autocadPattern: 'ANSI32',
    defaultScale: 1.2,
    defaultAngle: 45,
    defaultColor: '#60a5fa',
    description: 'H型鋼、C型鋼立柱與抗震金屬構件斷面',
    renderType: 'cross_diagonal',
  },
  {
    id: 'ar_conc',
    name: 'AR-CONC 混凝土顆粒 (結構樓板/地梁)',
    englishName: 'AR-CONC',
    category: 'structural',
    autocadPattern: 'AR-CONC',
    defaultScale: 0.8,
    defaultAngle: 0,
    defaultColor: '#94a3b8',
    description: '混擬土骨材、砂礫與水泥混合體斷面圖元',
    renderType: 'dots',
  },

  // 2. 地坪鋪貼
  {
    id: 'grid_tile_60',
    name: 'NET 60×60cm 正交網格 (拋光石英磚)',
    englishName: 'NET (60x60)',
    category: 'flooring',
    autocadPattern: 'NET',
    defaultScale: 1.5,
    defaultAngle: 0,
    defaultColor: '#38bdf8',
    description: '公領域地坪拋光磚、石英磚起鋪點對縫定位',
    renderType: 'grid',
  },
  {
    id: 'stagger_tile_3060',
    name: 'BRICK 30×60cm 錯位交丁 (仿清水模/壁磚)',
    englishName: 'BRICK (30x60)',
    category: 'flooring',
    autocadPattern: 'BRICK',
    defaultScale: 1.2,
    defaultAngle: 0,
    defaultColor: '#2dd4bf',
    description: '衛浴防滑地磚、廚房耐油污壁磚二分之一交錯貼',
    renderType: 'staggered',
  },
  {
    id: 'herringbone_wood',
    name: 'AR-PARQ1 魚骨/人字拼 (海島型實木地板)',
    englishName: 'AR-PARQ1',
    category: 'flooring',
    autocadPattern: 'AR-PARQ1',
    defaultScale: 1.0,
    defaultAngle: 45,
    defaultColor: '#fb923c',
    description: '法式復古人字拼、倒角木地板頂級地坪質感',
    renderType: 'herringbone',
  },
  {
    id: 'wood_plank_running',
    name: 'WOOD-RUN 超耐磨木地板 (平鋪交丁線)',
    englishName: 'WOOD_RUN',
    category: 'flooring',
    autocadPattern: 'WOOD_RUN',
    defaultScale: 1.2,
    defaultAngle: 0,
    defaultColor: '#d97706',
    description: '標準 19×120cm 卡扣超耐磨木地板步步高升排法',
    renderType: 'wood_plank',
  },
  {
    id: 'hex_tile',
    name: 'HEXAGON 六角蜂巢磚 (落塵區玄關鋪貼)',
    englishName: 'HEXAGON',
    category: 'flooring',
    autocadPattern: 'HEXAGON',
    defaultScale: 1.0,
    defaultAngle: 0,
    defaultColor: '#a78bfa',
    description: '玄關入口花磚異材質銜接、圓融落塵分區',
    renderType: 'hex',
  },

  // 3. 石材與壁面
  {
    id: 'terrazzo_grain',
    name: 'TERRAZZO 復古水磨石斑點 (中島檯面/地坪)',
    englishName: 'TERRAZZO',
    category: 'walls',
    autocadPattern: 'TERRAZZO',
    defaultScale: 0.9,
    defaultAngle: 0,
    defaultColor: '#34d399',
    description: '義大利水磨石顆粒、無縫地坪耐磨面材',
    renderType: 'terrazzo',
  },
  {
    id: 'marble_vein',
    name: 'MARBLE 天然大理石紋理 (電視主牆/衛浴)',
    englishName: 'MARBLE',
    category: 'walls',
    autocadPattern: 'MARBLE',
    defaultScale: 1.5,
    defaultAngle: 30,
    defaultColor: '#cbd5e1',
    description: '雕刻白、銀狐天然石材連紋剖面標記',
    renderType: 'marble',
  },

  // 4. 天花與保溫
  {
    id: 'ar_sand_ceiling',
    name: 'AR-SAND 矽酸鈣板微孔 (平釘/降板天花)',
    englishName: 'AR-SAND',
    category: 'ceiling',
    autocadPattern: 'AR-SAND',
    defaultScale: 0.6,
    defaultAngle: 0,
    defaultColor: '#10b981',
    description: '梁下 265 / 降板 230 / 廚衛 215 天花表面塗料底層',
    renderType: 'dots',
  },
];

interface HatchPatternPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomData;
  onApplyHatchToRoom?: (pattern: HatchPatternItem, scale: number, angle: number, color: string) => void;
  onNotify?: (message: string) => void;
}

export const HatchPatternPreviewModal: React.FC<HatchPatternPreviewModalProps> = ({
  isOpen,
  onClose,
  room,
  onApplyHatchToRoom,
  onNotify,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<HatchPatternItem>(HATCH_PATTERNS[0]);
  const [scale, setScale] = useState<number>(selectedPattern.defaultScale);
  const [angle, setAngle] = useState<number>(selectedPattern.defaultAngle);
  const [color, setColor] = useState<string>(selectedPattern.defaultColor);
  const [backgroundColor, setBackgroundColor] = useState<string>('#0d111a');
  const [opacity, setOpacity] = useState<number>(0.9);
  const [lineWidth, setLineWidth] = useState<number>(1.5);
  const [previewShape, setPreviewShape] = useState<'wall' | 'floor' | 'corner' | 'pier'>('wall');
  const [activeCategory, setActiveCategory] = useState<'all' | 'structural' | 'flooring' | 'walls' | 'ceiling'>('all');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update parameters when selected pattern changes
  const handleSelectPattern = (item: HatchPatternItem) => {
    setSelectedPattern(item);
    setScale(item.defaultScale);
    setAngle(item.defaultAngle);
    setColor(item.defaultColor);
  };

  // Render Pattern on Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw Shape Geometry Boundary
    ctx.save();
    ctx.beginPath();

    if (previewShape === 'wall') {
      // Wall cross-section with cut lines
      const padding = 35;
      ctx.rect(padding, padding, width - padding * 2, height - padding * 2);
    } else if (previewShape === 'corner') {
      // L-shaped wall
      const p = 35;
      const t = 110; // wall thickness
      ctx.moveTo(p, p);
      ctx.lineTo(width - p, p);
      ctx.lineTo(width - p, p + t);
      ctx.lineTo(p + t, p + t);
      ctx.lineTo(p + t, height - p);
      ctx.lineTo(p, height - p);
      ctx.closePath();
    } else if (previewShape === 'pier') {
      // Column pier with structural chamfers
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height) * 0.38;
      ctx.rect(cx - size, cy - size, size * 2, size * 2);
    } else {
      // Floor area with perimeter
      const p = 30;
      ctx.rect(p, p, width - p * 2, height - p * 2);
    }

    ctx.clip(); // Clip pattern within boundary

    // Render Pattern Primitives
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity;

    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const baseSpacing = 24 * Math.max(0.2, scale);

    if (selectedPattern.renderType === 'solid') {
      ctx.fillRect(0, 0, width, height);
    } else if (selectedPattern.renderType === 'diagonal') {
      // 45° single diagonal
      const step = baseSpacing;
      const diag = Math.sqrt(width * width + height * height);
      for (let d = -diag; d <= diag * 2; d += step) {
        ctx.beginPath();
        const x1 = d * cos - (-diag) * sin;
        const y1 = d * sin + (-diag) * cos;
        const x2 = d * cos - diag * sin;
        const y2 = d * sin + diag * cos;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else if (selectedPattern.renderType === 'cross_diagonal') {
      // Cross diagonal
      const step = baseSpacing * 1.2;
      const diag = Math.sqrt(width * width + height * height);
      // Direction 1
      for (let d = -diag; d <= diag * 2; d += step) {
        ctx.beginPath();
        ctx.moveTo(d * cos - (-diag) * sin, d * sin + (-diag) * cos);
        ctx.lineTo(d * cos - diag * sin, d * sin + diag * cos);
        ctx.stroke();
      }
      // Direction 2 (-angle)
      const rad2 = ((-angle) * Math.PI) / 180;
      const cos2 = Math.cos(rad2);
      const sin2 = Math.sin(rad2);
      for (let d = -diag; d <= diag * 2; d += step) {
        ctx.beginPath();
        ctx.moveTo(d * cos2 - (-diag) * sin2, d * sin2 + (-diag) * cos2);
        ctx.lineTo(d * cos2 - diag * sin2, d * sin2 + diag * cos2);
        ctx.stroke();
      }
    } else if (selectedPattern.renderType === 'grid') {
      // Square Tile Grid
      const step = baseSpacing * 1.5;
      for (let x = 0; x <= width + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height + step; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (selectedPattern.renderType === 'staggered') {
      // Staggered brick
      const brickH = baseSpacing;
      const brickW = baseSpacing * 2.2;
      let row = 0;
      for (let y = 0; y <= height + brickH; y += brickH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        const offset = (row % 2) * (brickW / 2);
        for (let x = -brickW; x <= width + brickW; x += brickW) {
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset, y + brickH);
          ctx.stroke();
        }
        row++;
      }
    } else if (selectedPattern.renderType === 'herringbone') {
      // Herringbone pattern
      const pW = baseSpacing * 0.8;
      const pH = baseSpacing * 2.8;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(rad);
      ctx.translate(-width / 2, -height / 2);

      const span = Math.max(width, height) * 1.5;
      for (let y = -span; y <= span * 2; y += pW * 2) {
        for (let x = -span; x <= span * 2; x += pH) {
          ctx.strokeRect(x, y, pH, pW);
          ctx.strokeRect(x + pH - pW, y + pW, pW, pH);
        }
      }
      ctx.restore();
    } else if (selectedPattern.renderType === 'wood_plank') {
      // Running wood plank
      const plankH = baseSpacing * 0.9;
      const plankW = baseSpacing * 4.2;
      let row = 0;
      for (let y = 0; y <= height + plankH; y += plankH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        const offset = ((row * 47) % plankW);
        for (let x = -plankW; x <= width + plankW; x += plankW) {
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset, y + plankH);
          ctx.stroke();
        }
        row++;
      }
    } else if (selectedPattern.renderType === 'hex') {
      // Hexagon tile
      const r = baseSpacing * 0.85;
      const h = r * Math.sqrt(3);
      for (let y = -r; y <= height + r * 2; y += h) {
        for (let x = -r; x <= width + r * 2; x += r * 3) {
          drawHex(ctx, x, y, r);
          drawHex(ctx, x + r * 1.5, y + h / 2, r);
        }
      }
    } else if (selectedPattern.renderType === 'dots') {
      // Dots & Aggregate
      const step = baseSpacing * 0.7;
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          const jitterX = ((x * 17) % 9) - 4;
          const jitterY = ((y * 23) % 9) - 4;
          ctx.beginPath();
          ctx.arc(x + jitterX, y + jitterY, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // occasional small aggregate triangle
          if ((x + y) % 3 === 0) {
            ctx.beginPath();
            ctx.moveTo(x + jitterX - 3, y + jitterY - 3);
            ctx.lineTo(x + jitterX + 3, y + jitterY - 2);
            ctx.lineTo(x + jitterX, y + jitterY + 4);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    } else if (selectedPattern.renderType === 'terrazzo') {
      // Terrazzo colorful/organic chips
      const step = baseSpacing * 0.9;
      for (let x = 10; x < width; x += step) {
        for (let y = 10; y < height; y += step) {
          const jX = ((x * 13) % 15) - 7;
          const jY = ((y * 19) % 15) - 7;
          ctx.beginPath();
          const r = 2.5 + ((x * y) % 4);
          ctx.arc(x + jX, y + jY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (selectedPattern.renderType === 'marble') {
      // Marble soft flowing lines
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const startY = (height / 5) * i + 20;
        ctx.moveTo(0, startY);
        ctx.bezierCurveTo(width * 0.3, startY - 40, width * 0.6, startY + 40, width, startY - 10);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Draw Outer Outline Boundary of Shape
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(35, 35, width - 70, height - 70);
    ctx.restore();
  }, [selectedPattern, scale, angle, color, backgroundColor, opacity, lineWidth, previewShape, isOpen]);

  // Helper for drawing hexagon
  const drawHex = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const filteredPatterns = HATCH_PATTERNS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const getAutoCadCommand = () => {
    return `-HATCH P ${selectedPattern.autocadPattern} ${scale.toFixed(2)} ${angle} S L`;
  };

  const handleCopyCmd = () => {
    const cmd = getAutoCadCommand();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
    onNotify?.(`已複製 AutoCAD HATCH 指令：${cmd}`);
  };

  const handleDownloadDxfSnippet = () => {
    const dxfText = `999\nAutoCAD DXF Hatch Block Definition\n0\nSECTION\n2\nENTITIES\n0\nHATCH\n8\n03_天花降板\n62\n7\n10\n0.0\n20\n0.0\n30\n0.0\n210\n0.0\n220\n0.0\n230\n1.0\n2\n${selectedPattern.autocadPattern}\n70\n1\n71\n0\n91\n1\n92\n1\n93\n4\n10\n0.0\n20\n0.0\n10\n100.0\n20\n0.0\n10\n100.0\n20\n100.0\n10\n0.0\n20\n100.0\n52\n${angle}\n41\n${scale}\n0\nENDSEC\n0\nEOF\n`;
    const blob = new Blob([dxfText], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hatch_${selectedPattern.autocadPattern}_s${scale}_a${angle}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`已下載 DXF HATCH 範本：${selectedPattern.name}`);
  };

  const handleApplyToCurrentRoom = () => {
    onApplyHatchToRoom?.(selectedPattern, scale, angle, color);
    onNotify?.(`已套用「${selectedPattern.name}」填滿樣式至當前空間放樣圖`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#11141c] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER: Matches exact User Screenshot card design */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Brush className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg tracking-wide">填滿樣式預覽</h3>
                <span className="px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800/70 text-slate-300 text-xs font-semibold">
                  設計
                </span>
                <span className="text-xs text-slate-400 font-mono">AutoCAD HATCH Engine</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                即時幾何剖面線渲染、5 倍數高程降板剖斷面、材質地坪對縫預覽與 DXF 實體匯出
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY: Split into Pattern Selector & Live Interactive Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT 5 COLS: PATTERN SELECTOR & PRESETS */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#171a26] border border-slate-800 rounded-xl text-xs overflow-x-auto">
              {[
                { id: 'all', label: '全部樣式' },
                { id: 'structural', label: '結構RC/磚' },
                { id: 'flooring', label: '地坪鋪貼' },
                { id: 'walls', label: '壁面石材' },
                { id: 'ceiling', label: '天花降板' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Patterns List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredPatterns.map((pat) => {
                const isSelected = selectedPattern.id === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={() => handleSelectPattern(pat)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-[#182030] border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-[#151822] hover:bg-[#1a1f2e] border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5 shadow-inner"
                      style={{
                        backgroundColor: pat.defaultColor + '15',
                        borderColor: pat.defaultColor + '50',
                        color: pat.defaultColor,
                      }}
                    >
                      <Grid className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-cyan-200' : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {pat.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {pat.autocadPattern}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{pat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick AutoCad Command Snip */}
            <div className="bg-[#151824] border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">AutoCAD 指令</span>
                <code className="text-xs text-amber-300 font-mono font-bold truncate block">{getAutoCadCommand()}</code>
              </div>
              <button
                onClick={handleCopyCmd}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors whitespace-nowrap"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? '已複製' : '複製指令'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT 7 COLS: INTERACTIVE CANVAS & CONTROLS */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            {/* Canvas Preview Container */}
            <div className="relative bg-[#0d1017] border border-slate-800 rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                width={520}
                height={340}
                className="w-full h-[280px] sm:h-[320px] rounded-2xl object-contain shadow-md"
              />

              {/* Watermark in Canvas corner */}
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px] font-mono px-3 py-1 rounded-full backdrop-blur-sm shadow flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{selectedPattern.autocadPattern}</span>
                <span className="text-slate-500">|</span>
                <span>縮放: {scale.toFixed(1)}x</span>
                <span className="text-slate-500">|</span>
                <span>旋轉: {angle}°</span>
              </div>

              {/* Shape Switcher Pills at bottom of canvas */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-1 rounded-2xl backdrop-blur-sm">
                {[
                  { id: 'wall', label: '牆體剖斷面' },
                  { id: 'corner', label: 'L型轉角' },
                  { id: 'pier', label: '結構柱心' },
                  { id: 'floor', label: '室內地坪' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPreviewShape(s.id as any)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                      previewShape === s.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTROLS BAR: Scale, Angle, Color, Opacity */}
            <div className="bg-[#141724] border border-slate-800/90 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>剖面線縮放比例 (Scale)</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Angle Slider & Quick Angle Snaps */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>旋轉角度 (Rotation Angle)</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                    <span>{angle}°</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  {/* Quick Angle Snaps */}
                  <div className="flex gap-1">
                    {[0, 45, 90].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setAngle(deg)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          angle === deg
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  <span>AutoCAD 標準索引顏色</span>
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#f59e0b', name: 'Color 2 (Yellow - 牆體)' },
                    { color: '#ec4899', name: 'Color 6 (Magenta - 門窗)' },
                    { color: '#38bdf8', name: 'Color 4 (Cyan - 地坪)' },
                    { color: '#10b981', name: 'Color 3 (Green - 天花)' },
                    { color: '#a78bfa', name: 'Color 5 (Blue - 系統櫃)' },
                    { color: '#e2e8f0', name: 'Color 7 (White - 剖面)' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        color === c.color ? 'scale-125 border-white ring-2 ring-cyan-400/50' : 'border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                    title="自訂色碼"
                  />
                </div>
              </div>

              {/* Opacity & Lineweight */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>透明度與筆刷線寬</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{Math.round(opacity * 100)}% / {lineWidth}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-1/2 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    {[1, 1.5, 2.5].map((w) => (
                      <button
                        key={w}
                        onClick={() => setLineWidth(w)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          lineWidth === w
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800/80 bg-[#141722]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              已符合幾何契約 5 倍數原則：天花降板 265/230/215cm 剖面線與地坪石英磚自動對齊
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDxfSnippet}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>匯出 DXF HATCH 代碼</span>
            </button>

            <button
              onClick={handleApplyToCurrentRoom}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>套用填滿至當前空間</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
