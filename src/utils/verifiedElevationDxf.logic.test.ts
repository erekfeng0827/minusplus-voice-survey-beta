import assert from 'node:assert/strict';import {RoomData} from '../types';import {generateVerifiedElevationDxf} from './verifiedElevationDxf';
const room:RoomData={id:'r',roomName:'客厅',width:450,length:700,height:280,ceilingDrop:230,beamHeight:265,bathKitchenDrop:215,wallThickness:15,evaluation:{score:0,clarity:'',missingElements:[],rule5MultiplePassed:true,suggestions:''},beams:[],doors:[{id:'d',name:'门',width:90,height:210,wall:'south',offset:30}],windows:[{id:'w',name:'东窗',width:160,height:120,sillHeight:90,wall:'east',offset:200}],voiceMemos:[],electricalPoints:[],lastUpdated:''};
const south=generateVerifiedElevationDxf(room,'south');assert.match(south,/\$INSUNITS\n70\n4/);assert.ok(south.includes('11\n4500'));
const east=generateVerifiedElevationDxf(room,'east');assert.ok(east.includes('东窗 160x120cm SILL+90'));assert.ok(!east.includes('门 90x210cm'));
console.log('verified elevation DXF test passed');
