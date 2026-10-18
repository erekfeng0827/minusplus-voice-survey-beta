import React, { useState } from 'react';
import { RoomData, FurnitureItem } from '../types';
import {
  LayoutGrid,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
  ArrowRight,
  Maximize2,
  Box,
  Layers,
  X,
  AlertCircle,
  RefreshCw,
  Ruler
} from 'lucide-react';
import { FURNITURE_TEMPLATES, LayoutStyle, RoomKind, STYLE_RULES } from '../data/furnitureTemplates';

interface AutoSpaceLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  rooms: RoomData[];
  onApplyOptimizedLayout: (roomId: string, newFurniture: FurnitureItem[]) => void;
  onNotify?: (msg: string) => void;
}

export const AutoSpaceLayoutModal: React.FC<AutoSpaceLayoutModalProps> = ({
  isOpen,
  onClose,
  room,
  rooms,
  onApplyOptimizedLayout,
  onNotify,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<LayoutStyle>('ergonomic');
  const [snapTo5xMultiples, setSnapTo5xMultiples] = useState<boolean>(true);
  const [reserveBeamClearance, setReserveBeamClearance] = useState<boolean>(true);
  const [minWalkwayWidth, setMinWalkwayWidth] = useState<number>(90); // 90cm
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate automated layout solutions based on room characteristics
  const generateRecommendedFurniture = (): FurnitureItem[] => {
    const isLiving = room.id.includes('living') || room.roomName.includes('客廳');
    const isMaster = room.id.includes('master') || room.roomName.includes('主臥');
    const snap = (v: number) => (snapTo5xMultiples ? Math.round(v / 5) * 5 : v);
    const kind: RoomKind = isLiving ? 'living' : isMaster ? 'master' : 'bedroom';
    const rule = STYLE_RULES[selectedStyle];
    return FURNITURE_TEMPLATES[kind].map((template, index) => {
      const width = snap(template.width * (template.category === 'wardrobe' ? rule.sizeFactor : 1));
      const depth = snap(template.depth);
      const edge = snap(rule.edge);
      const positions = {
        top: { x: edge, y: edge }, bottom: { x: edge, y: room.length - depth - edge },
        left: { x: edge, y: edge + index * (depth + minWalkwayWidth) },
        right: { x: room.width - width - edge, y: edge },
        center: { x: (room.width - width) / 2, y: (room.length - depth) / 2 },
      };
      const pos = positions[template.wall];
      const beamLimitedHeight = reserveBeamClearance && template.height >= room.beamHeight
        ? Math.max(0, room.beamHeight - 5 - (template.elevation ?? 0)) : template.height;
      return {
        id: `auto_${room.id}_${template.key}`, name: template.name, category: template.category,
        width, depth, height: snap(beamLimitedHeight), elevation: template.elevation ?? 0,
        x: snap(pos.x), y: snap(pos.y), colorHex: template.colorHex,
        specNote: `${template.note}；策略：${rule.label}${reserveBeamClearance ? '；已套用梁下 5cm 預留' : ''}`,
      };
    });
  };

  const previewItems = generateRecommendedFurniture();
  const geometryIssues: string[] = [];
  previewItems.forEach((item) => {
    if (item.x < 0 || item.y < 0 || item.x + item.width > room.width || item.y + item.depth > room.length) {
      geometryIssues.push(`${item.name} 超出房間邊界`);
    }
    if (reserveBeamClearance && item.elevation + item.height > room.beamHeight - 5) {
      geometryIssues.push(`${item.name} 未達梁下 5cm 預留`);
    }
  });
  for (let i = 0; i < previewItems.length; i += 1) {
    for (let j = i + 1; j < previewItems.length; j += 1) {
      const a = previewItems[i]; const b = previewItems[j];
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.depth, b.y + b.depth) - Math.max(a.y, b.y);
      if (overlapX > 0 && overlapY > 0) geometryIssues.push(`${a.name} 與 ${b.name} 矩形碰撞`);
      else {
        const gapX = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width), 0);
        const gapY = Math.max(b.y - (a.y + a.depth), a.y - (b.y + b.depth), 0);
        const clearance = overlapX > 0 ? gapY : overlapY > 0 ? gapX : Math.hypot(gapX, gapY);
        if (clearance > 0 && clearance < minWalkwayWidth) geometryIssues.push(`${a.name} 與 ${b.name} 間距 ${Math.round(clearance)}cm，小於 ${minWalkwayWidth}cm`);
      }
    }
  }
  const reviewRequired = geometryIssues.length > 0;

  const handleApplyLayout = () => {
    onApplyOptimizedLayout(room.id, previewItems);
    setAppliedSuccess(true);
    onNotify?.(`已套用「${room.roomName}」配置候選；請由設計師複核後再用於後續設計。`);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#121810] border border-[#3F5B63]/60 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1A2417] border-b border-[#3F5B63]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 text-emerald-300">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F8F8F6]">自動排版配置功能 (Auto Layout)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-400/40 text-amber-300 font-mono">
                  人因工學 · 5 倍數吸附
                </span>
              </div>
              <p className="text-xs text-[#DDD7CE]/70">
                依據目前房間長寬 ({room.width}×{room.length}cm) 與梁高 (FL+{room.beamHeight})，產生可調整的配置候選
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23301F] text-[#DDD7CE] hover:text-white hover:bg-rose-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 排版策略選擇 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'ergonomic',
                title: '人因動線優先 (標準)',
                desc: '走道淨寬 ≥90cm，床兩側留 60cm，空調出風口避開床頭',
                tag: '推薦',
              },
              {
                id: 'spacious',
                title: '視野開闊通透',
                desc: '低矮家具置中，視線穿透無阻，窗邊不阻擋採光面',
                tag: '景觀好',
              },
              {
                id: 'storage_max',
                title: '極致收納配置',
                desc: '梁下做滿頂天高櫃，動線維持緊湊 80cm 契約標準',
                tag: '坪效高',
              },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedStyle === st.id
                    ? 'bg-[#23301F] border-[#E0A83C] shadow-lg shadow-amber-950/40 ring-1 ring-[#E0A83C]'
                    : 'bg-[#161F13] border-[#3F5B63]/40 text-[#DDD7CE] hover:border-[#3F5B63]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-[#F8F8F6]">{st.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E0A83C]/20 text-[#E0A83C] font-mono">
                    {st.tag}
                  </span>
                </div>
                <p className="text-[11px] text-[#DDD7CE]/70 leading-relaxed">{st.desc}</p>
              </button>
            ))}
          </div>

          {/* 自動約束條件開關 */}
          <div className="bg-[#1A2417] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
            <h4 className="text-xs font-bold text-[#E0A83C] flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>自動排版約束準則 (Geometric Constraints)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121810] border border-[#3F5B63]/40 text-xs text-[#DDD7CE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={snapTo5xMultiples}
                  onChange={(e) => setSnapTo5xMultiples(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-[#F8F8F6]">5 倍數模矩強制吸附</div>
                  <div className="text-[10px] text-[#DDD7CE]/60">寬度、進深、座標整數化</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121810] border border-[#3F5B63]/40 text-xs text-[#DDD7CE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={reserveBeamClearance}
                  onChange={(e) => setReserveBeamClearance(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-[#F8F8F6]">大梁壓頂自動避讓</div>
                  <div className="text-[10px] text-[#DDD7CE]/60">床頭不設於梁底 FL+{room.beamHeight} 下</div>
                </div>
              </label>

              <div className="p-2.5 rounded-xl bg-[#121810] border border-[#3F5B63]/40 text-xs text-[#DDD7CE] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8F8F6]">最低走道淨寬</span>
                  <span className="text-amber-400 font-mono font-bold">{minWalkwayWidth} cm</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="120"
                  step="5"
                  value={minWalkwayWidth}
                  onChange={(e) => setMinWalkwayWidth(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#23301F] rounded-lg cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* 自動產生的配置清單 */}
          <div className="bg-[#161F13] p-4 rounded-2xl border border-[#3F5B63]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F8F8F6] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>自動生成之家具與空間組態預覽（共 {previewItems.length} 件圖元）：</span>
              </span>
                <span className={`text-[10px] font-mono flex items-center gap-1 ${reviewRequired ? 'text-amber-300' : 'text-emerald-400'}`}>
                {reviewRequired ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {reviewRequired ? `需設計師複核 · ${geometryIssues.length} 項` : '配置候選 · 未檢出矩形衝突'}
              </span>
            </div>
            <div className="text-[10px] text-[#DDD7CE]/70">
              {reviewRequired ? geometryIssues.map((issue) => <div key={issue}>• {issue}</div>) : `候選依 ${selectedStyle} 策略、最低通道 ${minWalkwayWidth}cm 與梁避讓設定產生；仍需設計師確認門窗、使用情境及現場條件。`}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {previewItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#121810] border border-[#3F5B63]/40 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#F8F8F6] flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-[10px]">#{idx + 1}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] text-[#DDD7CE]/60 font-mono mt-0.5">
                      尺寸: {item.width} × {item.depth} × {item.height} cm
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#23301F] text-amber-300 font-mono border border-amber-500/20">
                      坐標 [X:{item.x}, Y:{item.y}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1A2417] border-t border-[#3F5B63]/40 flex items-center justify-between">
          <div className="text-xs text-[#DDD7CE]/70">
            目標空間：<strong className="text-amber-300">{room.roomName}</strong> ({room.width}×{room.length}cm)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#23301F] text-[#DDD7CE] text-xs font-medium hover:bg-[#3F5B63]/50 transition"
            >
              取消
            </button>
            <button
              onClick={handleApplyLayout}
              disabled={appliedSuccess}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition active:scale-95 ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#121810] shadow-emerald-950/40'
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>已成功套用至畫布！</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>套用配置候選（非施工圖）</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
