import { RoomData } from '../types';

export type ElevationWall = 'north' | 'east' | 'south' | 'west';
const wallAliases: Record<ElevationWall, string[]> = { north:['north','top'], east:['east','right'], south:['south','bottom'], west:['west','left'] };

function line(layer:string,x1:number,y1:number,x2:number,y2:number):string { return `0\nLINE\n8\n${layer}\n10\n${x1*10}\n20\n${y1*10}\n30\n0\n11\n${x2*10}\n21\n${y2*10}\n31\n0\n`; }
function text(layer:string,x:number,y:number,height:number,value:string):string { return `0\nTEXT\n8\n${layer}\n10\n${x*10}\n20\n${y*10}\n30\n0\n40\n${height*10}\n1\n${value.replace(/[\r\n]/g,' ')}\n`; }
function rect(layer:string,x:number,y:number,w:number,h:number):string { return line(layer,x,y,x+w,y)+line(layer,x+w,y,x+w,y+h)+line(layer,x+w,y+h,x,y+h)+line(layer,x,y+h,x,y); }

export function generateVerifiedElevationDxf(room:RoomData, wall:ElevationWall):string {
  const span = wall === 'north' || wall === 'south' ? room.width : room.length;
  const layers = [['A-WALL',7],['A-DOOR',5],['A-GLAZ',4],['A-ANNO',3]] as const;
  let dxf='0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n4\n';
  layers.forEach(([name,color])=>{dxf+=`0\nLAYER\n2\n${name}\n70\n0\n62\n${color}\n6\nCONTINUOUS\n`;});
  dxf+='0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
  dxf+=rect('A-WALL',0,0,span,room.height);
  (room.doors||[]).filter(item=>wallAliases[wall].includes(item.wall)).forEach(item=>{dxf+=rect('A-DOOR',item.offset,0,item.width,item.height);dxf+=text('A-ANNO',item.offset,item.height+8,5,`${item.name} ${item.width}x${item.height}cm`);});
  (room.windows||[]).filter(item=>wallAliases[wall].includes(item.wall)).forEach(item=>{dxf+=rect('A-GLAZ',item.offset,item.sillHeight,item.width,item.height);dxf+=text('A-ANNO',item.offset,item.sillHeight+item.height+8,5,`${item.name} ${item.width}x${item.height}cm SILL+${item.sillHeight}`);});
  dxf+=line('A-ANNO',0,-20,span,-20)+text('A-ANNO',span/2-20,-14,6,`${span}cm`);
  dxf+=text('A-ANNO',0,room.height+20,7,`${room.roomName} ${wall.toUpperCase()} ELEVATION | GENERATED FROM CURRENT DATA | CAD REVIEW REQUIRED`);
  return dxf+'0\nENDSEC\n0\nEOF\n';
}

export function downloadVerifiedElevationDxf(room:RoomData,wall:ElevationWall):void {
  const blob=new Blob([generateVerifiedElevationDxf(room,wall)],{type:'application/dxf;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`MINUSPLUS_${room.roomName}_${wall}_立面_mm.dxf`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

export function downloadVerifiedLayerStandard():void {
  const data={status:'EVIDENCE_READY_NOT_VALIDATED',units:'millimeters',layers:[
    {name:'A-WALL',purpose:'wall geometry'},{name:'A-DOOR',purpose:'door openings'},{name:'A-GLAZ',purpose:'window glazing'},{name:'A-ANNO',purpose:'dimensions and notes'},
    {name:'S-COL',purpose:'structural columns'},{name:'S-BEAM',purpose:'structural beams'},{name:'A-FURN',purpose:'furniture and cabinets'},{name:'A-STAIR',purpose:'stairs'}]};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='MINUSPLUS_CAD_layer_standard.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
