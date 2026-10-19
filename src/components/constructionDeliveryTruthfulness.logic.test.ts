import { readFileSync } from 'node:fs';

const construction = readFileSync(new URL('./ConstructionSheetSet.tsx', import.meta.url), 'utf8');
const layers = readFileSync(new URL('./CadLayerStandardModal.tsx', import.meta.url), 'utf8');
const forbidden = ['Codex 晶晶驗收通過', 'V-01~10 PASSED', '驗收合格！', 'DXF / DWG 100% 相容', '100% 合規'];
for (const claim of forbidden) {
  if (`${construction}\n${layers}`.includes(claim)) throw new Error(`未验证的施工图声明仍存在：${claim}`);
}
if (!construction.includes('待 CAD 回讀') || !layers.includes('待 AutoCAD 回讀')) {
  throw new Error('施工图与图层标准缺少明确的回读边界');
}
console.log('construction delivery truthfulness: PASS');
