import assert from 'node:assert/strict';
import { RoomData } from '../types';
import { generateStructuralWhiteModelDxf } from './structuralWhiteModelDxf';

const room: RoomData = { id:'white', roomName:'白模測試', width:450, length:700, height:280, ceilingDrop:230, beamHeight:265, bathKitchenDrop:215, wallThickness:15, evaluation:{score:0,clarity:'',missingElements:[],rule5MultiplePassed:true,suggestions:''}, beams:[{id:'b',name:'B1',width:45,depth:300,clearHeight:235,orientation:'horizontal',x:20,y:200}], columns:[{id:'c',name:'C1',width:50,depth:50,height:280,positionType:'free',corner:'top-left',wall:'north',offset:0,x:30,y:40}], doors:[{id:'d',name:'大門',width:120,height:225,wall:'bottom',offset:80}], windows:[{id:'w',name:'窗',width:160,height:120,sillHeight:90,wall:'right',offset:200}], voiceMemos:[],electricalPoints:[],placedBlocks:[{id:'p',blockId:'cab',name:'衣櫃',category:'furniture',subCategory:'cabinet:parametric',x:200,y:300,widthCm:180,depthCm:60,heightCm:240,cadLayer:'A-FURN'}],lastUpdated:'' };
const dxf = generateStructuralWhiteModelDxf(room);
assert.match(dxf, /\$INSUNITS\n70\n4/);
for (const layer of ['A-SLAB','A-WALL','S-COL','S-BEAM','A-FURN']) assert.ok(dxf.includes(`2\n${layer}\n`), `${layer} missing`);
assert.ok((dxf.match(/0\n3DFACE\n/g) || []).length > 30, 'white model must contain actual 3D faces');
assert.ok(dxf.includes('11\n4500'), '450cm geometry must be written as 4500mm');
console.log('structural white model DXF test passed');
