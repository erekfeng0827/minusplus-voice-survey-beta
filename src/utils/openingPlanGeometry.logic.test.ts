import { strict as assert } from 'node:assert';
import { Door } from '../types';
import { canonicalWall, doorLeafGeometry, openingTransform } from './openingPlanGeometry';

assert.equal(canonicalWall('north'), 'top');
assert.equal(canonicalWall('south'), 'bottom');
assert.equal(canonicalWall('west'), 'left');
assert.equal(canonicalWall('east'), 'right');
assert.equal(openingTransform('top', 30, 400, 500), 'translate(30, 0)');
assert.equal(openingTransform('bottom', 30, 400, 500), 'translate(30, 500) scale(1, -1)');
assert.equal(openingTransform('left', 30, 400, 500), 'translate(0, 30) rotate(90) scale(1, -1)');
assert.equal(openingTransform('right', 30, 400, 500), 'translate(400, 30) rotate(90)');
const door: Door = { id: 'd', name: '门', width: 90, height: 210, wall: 'top', offset: 30, swingDirection: 'inward_right' };
assert.match(doorLeafGeometry(door).leaf, /M 90 0/);
assert.equal(doorLeafGeometry({ ...door, swingDirection: 'sliding' }).sliding, true);
console.log('four-wall opening plan geometry test passed');
