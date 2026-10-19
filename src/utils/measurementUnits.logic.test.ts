import assert from 'node:assert/strict';
import { measurementToCentimeters } from './measurementUnits';

assert.equal(measurementToCentimeters('3.2', '尺'), 97);
assert.equal(measurementToCentimeters('4.25', '台尺'), 129);
assert.equal(measurementToCentimeters('0.916', '尺'), 28);
assert.equal(measurementToCentimeters('8', '公分'), 8);
assert.equal(measurementToCentimeters('1.38', '米'), 138);
assert.equal(measurementToCentimeters('3.2', undefined, 'legacy-meters-under-20'), 320);
assert.equal(measurementToCentimeters('12', undefined), 12);
console.log('measurement units including 30.3cm Taiwan foot: PASS');
