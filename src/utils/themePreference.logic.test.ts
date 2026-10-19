import assert from 'node:assert/strict';
import { nextThemePreference, resolveTheme } from './themePreference';

assert.equal(resolveTheme('auto', new Date('2026-10-19T01:00:00Z')), 'light', 'Taipei 09:00 should use day mode');
assert.equal(resolveTheme('auto', new Date('2026-10-19T12:00:00Z')), 'dark', 'Taipei 20:00 should use night mode');
assert.equal(resolveTheme('dark', new Date('2026-10-19T01:00:00Z')), 'dark', 'manual override must win');
assert.deepEqual(['auto', 'light', 'dark', 'auto'], ['auto', nextThemePreference('auto'), nextThemePreference('light'), nextThemePreference('dark')]);
console.log('global theme preference: PASS');
