import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { RoomData } from '../src/types';
import { generateDxfString } from '../src/utils/dxfExporter';

const output = resolve(process.argv[2] || 'evidence/parametric_blocks_candidate.dxf');
const room: RoomData = {
  id:'block-evidence', roomName:'MINUSPLUS 参数图块验证', width:900, length:700, height:280, ceilingDrop:230, beamHeight:265, wallThickness:15,
  columns:[], beams:[], doors:[], windows:[], voiceMemos:[], electricalPoints:[], furniture:[], lastUpdated:new Date().toISOString(),
  placedBlocks:[
    {id:'s1',blockId:'stair-straight-parametric-v1',name:'直梯',category:'detail_joint',subCategory:'stair:straight',x:30,y:40,widthCm:90,depthCm:300,cadLayer:'A-STAIR',tags:['risers:16','verification:APP_PARAMETRIC_ONLY']},
    {id:'s2',blockId:'stair-l-parametric-v1',name:'L型梯',category:'detail_joint',subCategory:'stair:l_shape',x:160,y:40,widthCm:180,depthCm:300,cadLayer:'A-STAIR',tags:['risers:17','flight1Risers:9','landingDepth:95','flight2Risers:8','verification:APP_PARAMETRIC_ONLY']},
    {id:'s3',blockId:'stair-u-parametric-v1',name:'U型梯',category:'detail_joint',subCategory:'stair:u_shape',x:380,y:40,widthCm:190,depthCm:300,cadLayer:'A-STAIR',tags:['risers:18','flight1Risers:9','landingDepth:100','flight2Risers:9','verification:APP_PARAMETRIC_ONLY']},
    {id:'s4',blockId:'stair-spiral-parametric-v1',name:'旋转梯',category:'detail_joint',subCategory:'stair:spiral',x:620,y:40,widthCm:180,depthCm:180,cadLayer:'A-STAIR',tags:['risers:16','verification:APP_PARAMETRIC_ONLY']},
    {id:'c1',blockId:'wardrobe-parametric-v1',name:'衣柜',category:'furniture',subCategory:'cabinet:parametric',x:80,y:470,widthCm:240,depthCm:60,heightCm:240,cadLayer:'A-FURN',tags:['verification:APP_PARAMETRIC_ONLY']},
  ],
};
mkdirSync(dirname(output), { recursive:true });
writeFileSync(output, generateDxfString(room, 'MINUSPLUS_BLOCK_EVIDENCE'), 'utf8');
console.log(output);
