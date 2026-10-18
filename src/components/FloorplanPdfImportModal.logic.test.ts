import assert from 'node:assert/strict';
import { createManualTraceRoom, validateFloorplanFile } from './FloorplanPdfImportModal';

assert.equal(validateFloorplanFile({ name: 'site-plan.pdf', size: 1024 }), null);
assert.match(validateFloorplanFile({ name: 'fake.exe', size: 1024 }) || '', /格式不支援/);
assert.match(validateFloorplanFile({ name: 'empty.pdf', size: 0 }) || '', /空的/);

const room = createManualTraceRoom('主臥', 480, 360, 280);
assert.equal(room.roomName, '主臥');
assert.equal(room.width, 480);
assert.equal(room.length, 360);
assert.match(room.notes?.[0] || '', /無自動解析後端/);

console.log('FloorplanPdfImportModal logic readback: PASS');
