import { strict as assert } from 'node:assert';
import { parsePerimeterCommand } from './PerimeterSurveyGuide';

const door = parsePerimeterCommand('南牆有玄關大門，離左牆角30，寬120，高225');
assert.equal(door.draft?.kind, 'door');
assert.equal(door.draft?.wall, 'bottom');
assert.equal(door.draft?.offset, 30);

const windowItem = parsePerimeterCommand('北牆有一扇氣密窗，離左牆角80，寬180，高150，台度45');
assert.equal(windowItem.draft?.kind, 'window');
assert.equal(windowItem.draft?.wall, 'top');

const stair = parsePerimeterCommand('右牆有樓梯，離起點100，寬90，總長320，共18階');
assert.equal(stair.draft?.kind, 'stair');
assert.equal(stair.draft?.wall, 'right');
assert.equal(stair.draft?.kind === 'stair' ? stair.draft.stairType : '', 'straight');

const lStair = parsePerimeterCommand('左牆有L型梯，離起點40，寬95，總長360，共18階，右轉');
assert.equal(lStair.draft?.kind === 'stair' ? lStair.draft.stairType : '', 'l_shape');
assert.equal(lStair.missing.length, 0);

const missingTurn = parsePerimeterCommand('北牆有U型梯，離起點60，寬180，總長400，共20階');
assert.equal(missingTurn.draft, undefined);
assert.ok(missingTurn.missing.includes('轉向（左轉或右轉）'));

const spiral = parsePerimeterCommand('南牆有旋轉梯，離起點50，寬160，總長160，共16階，左轉');
assert.equal(spiral.draft?.kind === 'stair' ? spiral.draft.stairType : '', 'spiral');

const incomplete = parsePerimeterCommand('左牆有一扇窗');
assert.equal(incomplete.draft, undefined);
assert.ok(incomplete.missing.includes('離牆角距離'));

console.log('PerimeterSurveyGuide logic: 4 cases passed');
