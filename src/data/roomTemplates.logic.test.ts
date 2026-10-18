import { strict as assert } from 'node:assert';
import { createCleanRoomFromTemplate, ROOM_TEMPLATES } from './roomTemplates';

for (const id of ['tpl-townhouse-longitudinal', 'tpl-townhouse-transverse']) {
  const template = ROOM_TEMPLATES.find((item) => item.id === id);
  assert.ok(template, `${id} must exist`);
  const room = createCleanRoomFromTemplate(template!);
  assert.equal(room.width, 450);
  assert.equal(room.length, 1400);
  assert.equal(room.doors[0]?.type, 'entryway');
  assert.equal(room.placedBlocks?.length, 1);
  assert.ok(room.placedBlocks?.[0].subCategory.startsWith('stair:'));
  assert.ok(room.placedBlocks?.[0].tags?.includes('verification:APP_PARAMETRIC_ONLY'));
}

console.log('Townhouse room templates: PASS');
