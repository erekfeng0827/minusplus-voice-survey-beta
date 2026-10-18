import React, { useState } from 'react';
import { Box, Download, FileText, Layers, X } from 'lucide-react';
import { RoomData } from '../types';
import { downloadDxfFile } from '../utils/dxfExporter';
import { downloadStructuralWhiteModelDxf } from '../utils/structuralWhiteModelDxf';
import { downloadVerifiedElevationDxf, downloadVerifiedLayerStandard, ElevationWall } from '../utils/verifiedElevationDxf';

interface Props { isOpen:boolean; onClose:()=>void; rooms:RoomData[]; projectName:string; onNotify?:(message:string)=>void }
const walls: Array<{id:ElevationWall;label:string}>=[{id:'north',label:'北向'},{id:'east',label:'东向'},{id:'south',label:'南向'},{id:'west',label:'西向'}];

export const BatchConstructionSheetAssemblerModal:React.FC<Props>=({isOpen,onClose,rooms,projectName,onNotify})=>{
  const [roomId,setRoomId]=useState(rooms[0]?.id||''); if(!isOpen)return null;
  const room=rooms.find(item=>item.id===roomId)||rooms[0]; if(!room)return null;
  const report=(message:string)=>onNotify?.(message);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"><div className="survey-card flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl">
    <header className="flex items-center justify-between border-b border-[#3F5B63]/30 p-5"><div><h2 className="survey-text text-lg font-bold">可验证 CAD 交付中心</h2><p className="survey-muted text-xs">{projectName} · 只输出当前数据能证明的内容</p></div><button onClick={onClose} className="rounded-xl p-2 survey-muted hover:bg-black/5"><X className="h-5 w-5"/></button></header>
    <main className="space-y-5 overflow-y-auto p-5">
      <label className="block text-xs font-bold survey-text">输出空间<select value={room.id} onChange={event=>setRoomId(event.target.value)} className="survey-review mt-2 w-full rounded-xl border px-3 py-2 survey-text">{rooms.map(item=><option key={item.id} value={item.id}>{item.roomName} · {item.width}×{item.length}cm</option>)}</select></label>
      <section className="grid gap-3 sm:grid-cols-2">
        <button onClick={()=>{downloadDxfFile(room,`${projectName}_${room.roomName}_平面`);report('已下载当前空间平面 DXF。');}} className="survey-review flex items-center gap-3 rounded-2xl border p-4 text-left hover:border-[#B4503A]"><FileText className="h-5 w-5 text-[#B4503A]"/><div><div className="survey-text font-bold">平面放样 DXF</div><div className="survey-muted text-xs">墙线、门窗、梁柱、家具／楼梯</div></div></button>
        <button onClick={()=>{downloadStructuralWhiteModelDxf(room);report('已下载当前空间结构白模 DXF。');}} className="survey-review flex items-center gap-3 rounded-2xl border p-4 text-left hover:border-[#B4503A]"><Box className="h-5 w-5 text-[#3F5B63]"/><div><div className="survey-text font-bold">3D 结构白模 DXF</div><div className="survey-muted text-xs">实体墙与开洞、梁柱、配置体块</div></div></button>
      </section>
      <section className="rounded-2xl border border-[#3F5B63]/30 p-4"><div className="mb-3 flex items-center gap-2 survey-text font-bold"><Download className="h-4 w-4 text-[#B4503A]"/>四向立面 DXF</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{walls.map(wall=><button key={wall.id} onClick={()=>{downloadVerifiedElevationDxf(room,wall.id);report(`已下载${wall.label}立面 DXF。`);}} className="rounded-xl border border-[#3F5B63]/30 px-3 py-2 text-xs font-bold survey-text hover:bg-[#B4503A] hover:text-white">{wall.label}</button>)}</div></section>
      <button onClick={()=>{downloadVerifiedLayerStandard();report('已下载 CAD 图层标准 JSON。');}} className="survey-review flex w-full items-center gap-3 rounded-2xl border p-4 text-left hover:border-[#B4503A]"><Layers className="h-5 w-5 text-[#E0A83C]"/><div><div className="survey-text font-bold">图层标准 JSON</div><div className="survey-muted text-xs">图层名称、用途与毫米单位；状态为待 CAD 验收</div></div></button>
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-700"><strong>尚未完成：</strong>原生 DWG 动态图块、签章图框、材料详图、MEP 综合图及工班施工版。这里下载的文件都是当前数据生成的候选档，必须经过 CAD 回读与验收，不能直接宣称正式施工图。</section>
    </main>
  </div></div>;
};
