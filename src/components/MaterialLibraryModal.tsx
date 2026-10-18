import React, { useState } from 'react';
import { RoomData, MaterialItem, RoomMaterials } from '../types';
import { DEFAULT_MATERIALS } from '../data/materialsAndConfig';
import {
  Palette,
  Check,
  X,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface MaterialLibraryModalProps {
  room: RoomData;
  onClose: () => void;
  onApplyMaterials: (materials: RoomMaterials) => void;
}

export const MaterialLibraryModal: React.FC<MaterialLibraryModalProps> = ({
  room,
  onClose,
  onApplyMaterials,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'floor' | 'wall' | 'ceiling' | 'beam'>('all');
  
  // Current active selections (defaulting to first items if not set)
  const currentMaterials: RoomMaterials = room.materials || {
    floorId: 'mat-floor-oak',
    wallId: 'mat-wall-white',
    ceilingId: 'mat-ceil-silicate',
    beamId: 'mat-beam-curved',
  };

  const [activeSelections, setActiveSelections] = useState<RoomMaterials>(currentMaterials);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const categories = [
    { id: 'all', name: '全部材質 (14款)' },
    { id: 'floor', name: '地面地板 (Floor)' },
    { id: 'wall', name: '牆面漆作 (Wall)' },
    { id: 'ceiling', name: '天花降板 (Ceiling)' },
    { id: 'beam', name: '大梁收邊 (Beam)' },
  ];

  const filteredMaterials = selectedCategory === 'all'
    ? DEFAULT_MATERIALS
    : DEFAULT_MATERIALS.filter((m) => m.category === selectedCategory);

  const handleSelectMaterial = (item: MaterialItem) => {
    const updated = { ...activeSelections };
    if (item.category === 'floor') updated.floorId = item.id;
    if (item.category === 'wall') updated.wallId = item.id;
    if (item.category === 'ceiling') updated.ceilingId = item.id;
    if (item.category === 'beam') updated.beamId = item.id;
    setActiveSelections(updated);
  };

  const handleSaveAndApply = () => {
    onApplyMaterials(activeSelections);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 700);
  };

  // Find material by id
  const getMaterial = (id: string) => DEFAULT_MATERIALS.find((m) => m.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  新增材質庫選配中心
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold">
                  3D / 施工圖即時連動
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                為「{room.roomName}」配置地面、牆面、天花降板與大梁外觀材質規格
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{savedToast ? '已套用至 3D 視圖！' : '套用材質設定'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Summary Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">地面：</span>
            <span className="font-semibold text-amber-300 truncate">
              {getMaterial(activeSelections.floorId)?.name.split('（')[0] || '白橡木地板'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">牆面：</span>
            <span className="font-semibold text-blue-300 truncate">
              {getMaterial(activeSelections.wallId)?.name.split('（')[0] || '無甲醛乳膠漆'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">天花：</span>
            <span className="font-semibold text-emerald-300 truncate">
              {getMaterial(activeSelections.ceilingId)?.name.split('（')[0] || '防潮矽酸鈣平頂'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">大梁：</span>
            <span className="font-semibold text-purple-300 truncate">
              {getMaterial(activeSelections.beamId)?.name.split('（')[0] || '弧形防壓梁圓角'}
            </span>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2 bg-slate-900 border-b border-slate-800 text-xs overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Material Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const isSelected =
                (mat.category === 'floor' && activeSelections.floorId === mat.id) ||
                (mat.category === 'wall' && activeSelections.wallId === mat.id) ||
                (mat.category === 'ceiling' && activeSelections.ceilingId === mat.id) ||
                (mat.category === 'beam' && activeSelections.beamId === mat.id);

              return (
                <div
                  key={mat.id}
                  onClick={() => handleSelectMaterial(mat)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    {/* Color Swatch & Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg border border-white/20 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: mat.hexColor }}
                        />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          {mat.specCode}
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                          <Check className="w-3 h-3" />
                          已選用
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                          點擊選配
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                      {mat.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  {/* Pricing and spec tags */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {mat.unitPrice || '專案定價'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      粗糙度: {(mat.roughness * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>材質設定會即時反映於 3D 模擬視圖與工程工料預算報表</span>
          </div>
          <button
            onClick={handleSaveAndApply}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            完成並儲存選配
          </button>
        </div>
      </div>
    </div>
  );
};
