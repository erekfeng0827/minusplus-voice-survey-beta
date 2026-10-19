export type UnitlessMeasurementMode = 'centimeters' | 'legacy-meters-under-20';

export const SPOKEN_LENGTH_UNIT_PATTERN = '米|公尺|m|cm|公分|台尺|尺';

export function measurementToCentimeters(
  value: string | number,
  unit?: string,
  unitlessMode: UnitlessMeasurementMode = 'centimeters',
): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return Number.NaN;
  const normalizedUnit = (unit || '').trim().toLowerCase();
  if (/^(米|公尺|m)$/.test(normalizedUnit)) return Math.round(parsed * 100);
  if (/^(台尺|尺)$/.test(normalizedUnit)) return Math.round(parsed * 30.3);
  if (/^(cm|公分)$/.test(normalizedUnit)) return Math.round(parsed);
  return unitlessMode === 'legacy-meters-under-20' && parsed < 20 ? Math.round(parsed * 100) : Math.round(parsed);
}
