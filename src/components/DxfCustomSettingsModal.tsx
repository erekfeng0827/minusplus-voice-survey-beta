import React, { useState } from 'react';
import { RoomData, DxfLayerConfigItem } from '../types';
import { DEFAULT_DXF_LAYERS } from '../data/materialsAndConfig';
import { downloadDxfWithCustomLayers } from '../utils/customDxfExporter';
import {
  Sliders,
  Check,
  X,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';

interface DxfCustomSettingsModalProps {
  room: RoomData;
  onClose: () => void;
}

export const DxfCustomSettingsModal: React.FC<DxfCustomSettingsModalProps> = ({
  room,
  onClose,
}) => {
  const [layers, setLayers] = useState<DxfLayerConfigItem[]>(DEFAULT_DXF_LAYERS);
  const [activePreset, setActivePreset] = useState<string>('cns');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // AutoCAD Color Mapping Options
  const acadColors = [
    { num: 9, name: 'ACI 9（原圖牆線）', hex: '#c0c0c0' },
    { num: 11, name: 'ACI 11（原圖門）', hex: '#ff7f7f' },
    { num: 103, name: 'ACI 103（原圖水電）', hex: '#6d8f78' },
    { num: 125, name: 'ACI 125（原圖標示）', hex: '#7d789b' },
    { num: 147, name: 'ACI 147（原圖樑）', hex: '#9b6b88' },
    { num: 167, name: 'ACI 167（原圖潛色底）', hex: '#7f9b8f' },
    { num: 245, name: 'ACI 245（原圖文字）', hex: '#777777' },
    { num: 1, name: 'Red (紅)', hex: '#ef4444' },
    { num: 2, name: 'Yellow (黃)', hex: '#eab308' },
    { num: 3, name: 'Green (綠)', hex: '#22c55e' },
    { num: 4, name: 'Cyan (青)', hex: '#06b6d4' },
    { num: 5, name: 'Blue (藍)', hex: '#3b82f6' },
    { num: 6, name: 'Magenta (洋紅)', hex: '#d946ef' },
    { num: 7, name: 'White/Black (白/黑)', hex: '#ffffff' },
  ];

  // Presets
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'cns') {
      // Taiwan CNS Standard
      setLayers([
        { key: 'WALL', defaultName: 'WALL', customName: 'A-WALL', colorNumber: 7, colorHex: '#ffffff', lineType: 'CONTINUOUS', enabled: true, description: '結構外牆與柱位' },
        { key: 'BEAM', defaultName: 'BEAM', customName: 'S-BEAM', colorNumber: 1, colorHex: '#ef4444', lineType: 'CONTINUOUS', enabled: true, description: '大樑與結構穿心樑 (265cm)' },
        { key: 'CEILING_STEP', defaultName: 'CEILING_STEP', customName: 'A-CLNG', colorNumber: 4, colorHex: '#06b6d4', lineType: 'DASHED', enabled: true, description: '天花降板邊緣線 (230cm)' },
        { key: 'DIMENSION', defaultName: 'DIMENSION', customName: 'A-DIMS', colorNumber: 3, colorHex: '#22c55e', lineType: 'CONTINUOUS', enabled: true, description: '放樣尺寸標註鏈' },
        { key: 'ELECTRICAL', defaultName: 'ELECTRICAL', customName: 'E-POWR', colorNumber: 2, colorHex: '#eab308', lineType: 'CONTINUOUS', enabled: true, description: '強弱電插座開關面板' },
        { key: 'OPENING', defaultName: 'OPENING', customName: 'A-DOOR', colorNumber: 5, colorHex: '#3b82f6', lineType: 'CONTINUOUS', enabled: true, description: '門扇窗洞與開啟弧線' },
        { key: 'VOICE_TAGS', defaultName: 'VOICE_TAGS', customName: 'TXT-NOTE', colorNumber: 6, colorHex: '#d946ef', lineType: 'CONTINUOUS', enabled: true, description: '現場口說標高文字' },
      ]);
    } else if (presetKey === 'aia') {
      // AIA International CAD Layer Standard
      setLayers([
        { key: 'WALL', defaultName: 'WALL', customName: 'A-WALL-FULL', colorNumber: 7, colorHex: '#ffffff', lineType: 'CONTINUOUS', enabled: true, description: 'Full Height Walls' },
        { key: 'BEAM', defaultName: 'BEAM', customName: 'S-BEAM-MAIN', colorNumber: 1, colorHex: '#ef4444', lineType: 'CONTINUOUS', enabled: true, description: 'Structural Beams (CL:265)' },
        { key: 'CEILING_STEP', defaultName: 'CEILING_STEP', customName: 'A-CLNG-SOFF', colorNumber: 4, colorHex: '#06b6d4', lineType: 'DASHED', enabled: true, description: 'Ceiling Drops & Soffits' },
        { key: 'DIMENSION', defaultName: 'DIMENSION', customName: 'A-ANNO-DIMS', colorNumber: 3, colorHex: '#22c55e', lineType: 'CONTINUOUS', enabled: true, description: 'Staking Dimensions' },
        { key: 'ELECTRICAL', defaultName: 'ELECTRICAL', customName: 'E-POWR-PLAN', colorNumber: 2, colorHex: '#eab308', lineType: 'CONTINUOUS', enabled: true, description: 'Power Receptacles' },
        { key: 'OPENING', defaultName: 'OPENING', customName: 'A-DOOR-SWNG', colorNumber: 5, colorHex: '#3b82f6', lineType: 'CONTINUOUS', enabled: true, description: 'Doors and Openings' },
        { key: 'VOICE_TAGS', defaultName: 'VOICE_TAGS', customName: 'A-ANNO-TEXT', colorNumber: 6, colorHex: '#d946ef', lineType: 'CONTINUOUS', enabled: true, description: 'AI Field Audio Tags' },
      ]);
    } else if (presetKey === 'pure_structure') {
      // Structure Only (turn off texts & electrical)
      setLayers((prev) =>
        prev.map((l) => ({
          ...l,
          enabled: l.key === 'WALL' || l.key === 'BEAM' || l.key === 'CEILING_STEP' || l.key === 'DIMENSION',
        }))
      );
    }
  };

  const handleUpdateLayerName = (key: string, name: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.key === key ? { ...l, customName: name } : l))
    );
  };

  const handleUpdateLayerColor = (key: string, colorNum: number) => {
    const found = acadColors.find((c) => c.num === colorNum);
    setLayers((prev) =>
      prev.map((l) =>
        l.key === key
          ? { ...l, colorNumber: colorNum, colorHex: found?.hex || '#ffffff' }
          : l
      )
    );
  };

  const handleUpdateLineType = (key: string, lineType: any) => {
    setLayers((prev) =>
      prev.map((l) => (l.key === key ? { ...l, lineType } : l))
    );
  };

  const handleToggleLayer = (key: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.key === key ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const handleExportCustomDxf = () => {
    downloadDxfWithCustomLayers(room, layers, `室內設計_自訂圖層_${room.roomName}`);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  DXF 圖層自訂設定工作台
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                  AutoCAD Release 12 / 2000 相容
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                自訂圖層名稱、AutoCAD 索引色、線型與導出開關，無縫接軌各事務所出圖規範
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCustomDxf}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>已匯出自訂 DXF！</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>以自訂圖層匯出 DXF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector Ribbon */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold">規範快速預設：</span>
            <button
              onClick={() => applyPreset('cns')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activePreset === 'cns'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              台灣 CNS 建築製圖規範
            </button>
            <button
              onClick={() => applyPreset('aia')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activePreset === 'aia'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              AIA 國際 CAD 標準 (美標)
            </button>
            <button
              onClick={() => applyPreset('pure_structure')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activePreset === 'pure_structure'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              結構放樣純淨版 (關閉文字弱電)
            </button>
          </div>

          <button
            onClick={() => setLayers(DEFAULT_DXF_LAYERS)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重設室內設計預設</span>
          </button>
        </div>

        {/* Layers Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">匯出</th>
                  <th className="p-3">內部圖元類型</th>
                  <th className="p-3">自訂 AutoCAD 圖層名</th>
                  <th className="p-3">AutoCAD 索引色</th>
                  <th className="p-3">線型 (LineType)</th>
                  <th className="p-3">圖元定義描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                {layers.map((ly) => (
                  <tr
                    key={ly.key}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      !ly.enabled ? 'opacity-45 bg-slate-950/40' : ''
                    }`}
                  >
                    {/* Toggle Export Checkbox */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleLayer(ly.key)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          ly.enabled
                            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            : 'bg-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                        title={ly.enabled ? '此圖層包含於 DXF 內' : '排除此圖層'}
                      >
                        {ly.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Default Key */}
                    <td className="p-3 font-semibold text-slate-300">
                      {ly.defaultName}
                    </td>

                    {/* Custom Layer Name Input */}
                    <td className="p-3">
                      <input
                        type="text"
                        value={ly.customName}
                        onChange={(e) => handleUpdateLayerName(ly.key, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs w-44 focus:border-cyan-500 focus:outline-none"
                      />
                    </td>

                    {/* AutoCAD Color Selector */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: ly.colorHex }}
                        />
                        <select
                          value={ly.colorNumber}
                          onChange={(e) => handleUpdateLayerColor(ly.key, parseInt(e.target.value, 10))}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none font-sans"
                        >
                          {acadColors.map((c) => (
                            <option key={c.num} value={c.num}>
                              {c.num} - {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* LineType Selector */}
                    <td className="p-3">
                      <select
                        value={ly.lineType}
                        onChange={(e) => handleUpdateLineType(ly.key, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="CONTINUOUS">CONTINUOUS (實線)</option>
                        <option value="DASHED">DASHED (虛線)</option>
                        <option value="CENTER">CENTER (中心軸線)</option>
                        <option value="HIDDEN">HIDDEN (隱藏線)</option>
                        <option value="PHANTOM2">PHANTOM2 (原圖樑線／標示)</option>
                      </select>
                    </td>

                    {/* Description */}
                    <td className="p-3 font-sans text-slate-400 text-[11px]">
                      {ly.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>
                DXF 格式規格：AutoCAD R12 ASCII Standard，相容 AutoCAD 2000~2026、SketchUp、Revit 與 DWG TrueView。
              </span>
            </div>
            <span className="font-mono text-cyan-300 font-semibold">
              單位：公分 (Centimeters, INSUNITS 4)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            啟用中圖層：<span className="text-white font-mono">{layers.filter((l) => l.enabled).length}</span> / {layers.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCustomDxf}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出自訂 DXF 檔案</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
