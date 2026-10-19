import { strict as assert } from 'node:assert';
import { createParametricCabinetPlacement, createParametricStairBlock, parsePerimeterCommand } from './PerimeterSurveyGuide';
import { RoomData } from '../types';

const room = { id: 'r1', roomName: '入口空间', width: 500, length: 900, height: 280 } as unknown as RoomData;

const door = parsePerimeterCommand('南牆有玄關大門，離左牆角30，寬120，高225');
assert.equal(door.draft?.kind, 'door');
assert.equal(door.draft?.wall, 'bottom');
assert.equal(door.draft?.offset, 30);

const windowItem = parsePerimeterCommand('北牆有一扇氣密窗，離左牆角80，寬180，高150，台度45');
assert.equal(windowItem.draft?.kind, 'window');
assert.equal(windowItem.draft?.wall, 'top');

const stair = parsePerimeterCommand('右牆有樓梯，離起點100，離後牆20，寬90，總長320，共18階，踏階28');
assert.equal(stair.draft?.kind, 'stair');
assert.equal(stair.draft?.wall, 'right');
assert.equal(stair.draft?.kind === 'stair' ? stair.draft.stairType : '', 'straight');

const lStair = parsePerimeterCommand('左牆有L型梯，離起點40，離後牆25，寬95，總長360，第一跑8階，踏階28，轉台90，第二跑10階，右轉');
assert.equal(lStair.draft?.kind === 'stair' ? lStair.draft.stairType : '', 'l_shape');
assert.equal(lStair.draft?.kind === 'stair' ? lStair.draft.flight2Risers : 0, 10);
assert.equal(lStair.missing.length, 0);

const missingTurn = parsePerimeterCommand('北牆有U型梯，離起點60，離後牆20，寬180，總長400，第一跑10階，踏階28，轉台100，第二跑10階');
assert.equal(missingTurn.draft, undefined);
assert.ok(missingTurn.missing.includes('轉向（左轉或右轉）'));

const spiral = parsePerimeterCommand('南牆有旋轉梯，離起點50，離後牆30，寬160，總長160，共16階，左轉');
assert.equal(spiral.draft?.kind === 'stair' ? spiral.draft.stairType : '', 'spiral');

const stairCommands = [
  '北牆有直梯，離起點40，離後牆20，寬90，總長320，共18階，踏階28',
  '左牆有L型梯，離起點40，離後牆25，寬95，總長360，第一跑8階，踏階28，轉台90，第二跑10階，右轉',
  '右牆有U型梯，離起點60，離後牆20，寬180，總長400，第一跑10階，踏階28，轉台100，第二跑10階，左轉',
  '南牆有旋轉梯，離起點50，離後牆30，寬160，總長160，共16階，左轉',
];
const expectedTypes = ['straight', 'l_shape', 'u_shape', 'spiral'];
stairCommands.forEach((command, index) => {
  const result = parsePerimeterCommand(command);
  assert.equal(result.missing.length, 0);
  assert.equal(result.draft?.kind, 'stair');
  if (result.draft?.kind !== 'stair') throw new Error('楼梯口令没有建立草稿');
  const block = createParametricStairBlock(result.draft, room, 1000 + index);
  assert.equal(block.subCategory, `stair:${expectedTypes[index]}`);
  assert.ok(block.tags?.includes(`stairType:${expectedTypes[index]}`));
  assert.ok(block.tags?.some((tag) => tag.startsWith('risers:')));
  assert.ok(block.tags?.includes('verification:APP_PARAMETRIC_ONLY'));
});

const column = parsePerimeterCommand('北牆有RC結構柱，離左牆角120，寬50，深45，高280');
assert.equal(column.draft?.kind, 'column');
assert.equal(column.draft?.kind === 'column' ? column.draft.depth : 0, 45);

const beam = parsePerimeterCommand('東牆有結構梁，離起點90，寬35，梁深55，梁下淨高265');
assert.equal(beam.draft?.kind, 'beam');
assert.equal(beam.draft?.kind === 'beam' ? beam.draft.clearHeight : 0, 265);

const cabinet = parsePerimeterCommand('左牆有玄關鞋櫃，離起點60，寬150，櫃深40，高220，懸空20');
assert.equal(cabinet.draft?.kind, 'cabinet');
assert.equal(cabinet.draft?.kind === 'cabinet' ? cabinet.draft.elevation : 0, 20);
assert.equal(cabinet.missing.length, 0);

const fullWallCabinet = parsePerimeterCommand('右牆衣櫃離起點20，從牆到牆做滿，深60，高240，分14格');
assert.equal(fullWallCabinet.draft?.kind === 'cabinet' ? fullWallCabinet.draft.fillWall : false, true);
assert.equal(fullWallCabinet.draft?.kind === 'cabinet' ? fullWallCabinet.draft.compartments : 0, 14);
if (fullWallCabinet.draft?.kind !== 'cabinet') throw new Error('柜体口令没有建立草稿');
const cabinetPlacement = createParametricCabinetPlacement(fullWallCabinet.draft, room, 2000);
assert.equal(cabinetPlacement.block.subCategory, 'cabinet:parametric');
assert.ok(cabinetPlacement.block.tags?.includes('compartments:14'));
assert.ok(cabinetPlacement.block.tags?.includes('verification:APP_PARAMETRIC_ONLY'));
assert.equal(cabinetPlacement.furniture.category, 'wardrobe');

const incomplete = parsePerimeterCommand('左牆有一扇窗');
assert.equal(incomplete.draft, undefined);
assert.ok(incomplete.missing.includes('離牆角距離'));

console.log('PerimeterSurveyGuide logic: PASS');
