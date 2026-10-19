import React, { useState } from 'react';
import { Box, CheckCircle2, Download, Ruler, X } from 'lucide-react';
import { RoomData, StitchedFloorPlanResult } from '../types';
import { downloadFullProjectStructuralWhiteModelDxf, downloadStructuralWhiteModelDxf } from '../utils/structuralWhiteModelDxf';

interface Props { isOpen: boolean; onClose: () => void; room: RoomData; rooms?: RoomData[]; stitchedPlan?: StitchedFloorPlanResult; projectName?: string; onNotify: (message: string) => void }

export const SketchUpExportModal: React.FC<Props> = ({ isOpen, onClose, room, rooms = [], stitchedPlan, projectName = 'MINUSPLUS室內設計', onNotify }) => {
  const [downloaded, setDownloaded] = useState(false);
  if (!isOpen) return null;
  const openings = (room.doors?.length || 0) + (room.windows?.length || 0);
  const blocks = room.placedBlocks?.length || 0;
  const handleExport = () => {
    const canExportWholeProject = rooms.length > 1 && stitchedPlan && stitchedPlan.placements.length > 1;
    if (canExportWholeProject) downloadFullProjectStructuralWhiteModelDxf(rooms, stitchedPlan, projectName);
    else downloadStructuralWhiteModelDxf(room);
    setDownloaded(true);
    onNotify(`已下載${canExportWholeProject ? '全案' : '目前空間'}毫米制 3D 結構白模 DXF；仍需在 SketchUp／CAD 回讀確認。`);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
    <div className="survey-card w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#3F5B63]/30 p-5">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-[#3F5B63]/15 p-2.5 text-[#3F5B63]"><Box className="h-6 w-6" /></div><div><h3 className="survey-text font-bold">结构白模输出</h3><p className="survey-muted text-xs">{rooms.length > 1 ? `全案 ${rooms.length} 空间` : '当前空间'}真实数据 · DXF 毫米制</p></div></div>
        <button onClick={onClose} className="rounded-xl p-2 survey-muted hover:bg-black/5"><X className="h-5 w-5" /></button>
      </header>
      <main className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[['空间', `${room.width}×${room.length}cm`],['净高', `${room.height}cm`],['门窗开洞', `${openings} 处`],['梁柱／图块', `${(room.beams?.length || 0)+(room.columns?.length || 0)}／${blocks}`]].map(([label,value]) => <div key={label} className="survey-review rounded-xl border p-3"><div className="survey-muted text-[10px]">{label}</div><div className="survey-text mt-1 font-mono text-sm font-bold">{value}</div></div>)}
        </div>
        <section className="rounded-2xl border border-[#3F5B63]/30 bg-[#3F5B63]/5 p-4">
          <div className="mb-3 flex items-center gap-2 font-bold survey-text"><Ruler className="h-4 w-4 text-[#B4503A]" />本次实际输出</div>
          <ul className="space-y-2 text-xs survey-muted">
            <li>• 四面墙实体，并按当前门窗宽、高、台度切割开洞。</li>
            <li>• 楼板、结构梁柱，以及当前已放置的柜体／家具／楼梯体块。</li>
            <li>• `$INSUNITS=4`，所有内部公分坐标以 ×10 写成毫米。</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-700">
          这是可导入的结构白模交换档，不是原生 SKP，也不代表施工图验收通过。请在 SketchUp 导入时选择毫米，并核对总宽、总深、墙厚及门窗洞口。
        </section>
      </main>
      <footer className="flex items-center justify-between border-t border-[#3F5B63]/30 p-5">
        <div className="survey-muted flex items-center gap-2 text-xs">{downloaded && <><CheckCircle2 className="h-4 w-4 text-emerald-500" />已触发下载</>}</div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl bg-[#B4503A] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#9b412f]"><Download className="h-4 w-4" />下载{rooms.length > 1 ? '全案' : ''}结构白模 DXF</button>
      </footer>
    </div>
  </div>;
};
