export type Theme = 'light' | 'dark';
export type ThemePreference = 'auto' | Theme;

export const GLOBAL_THEME_MODE_KEY = 'minusplus_global_theme_mode_v1';
export const GLOBAL_THEME_VALUE_KEY = 'minusplus_ui_theme';

export function taipeiHour(now = new Date()): number {
  const value = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  }).format(now);
  return Number(value) % 24;
}

export function resolveTheme(preference: ThemePreference, now = new Date()): Theme {
  if (preference !== 'auto') return preference;
  const hour = taipeiHour(now);
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export function nextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === 'auto') return 'light';
  if (preference === 'light') return 'dark';
  return 'auto';
}
