export type StairType = 'straight' | 'l_shape' | 'u_shape' | 'spiral';

export interface StairBlockDefinition {
  type: StairType;
  blockId: string;
  label: string;
  requiredParameters: string[];
  verificationStatus: 'APP_PARAMETRIC_ONLY' | 'DWG_VERIFIED';
}

export const STAIR_BLOCK_CATALOG: Record<StairType, StairBlockDefinition> = {
  straight: { type: 'straight', blockId: 'stair-straight-parametric-v1', label: '直梯', requiredParameters: ['width', 'depth', 'risers'], verificationStatus: 'APP_PARAMETRIC_ONLY' },
  l_shape: { type: 'l_shape', blockId: 'stair-l-parametric-v1', label: 'L 型梯', requiredParameters: ['width', 'depth', 'risers', 'turnDirection'], verificationStatus: 'APP_PARAMETRIC_ONLY' },
  u_shape: { type: 'u_shape', blockId: 'stair-u-parametric-v1', label: 'U 型梯', requiredParameters: ['width', 'depth', 'risers', 'turnDirection'], verificationStatus: 'APP_PARAMETRIC_ONLY' },
  spiral: { type: 'spiral', blockId: 'stair-spiral-parametric-v1', label: '旋轉梯', requiredParameters: ['diameter', 'risers', 'turnDirection'], verificationStatus: 'APP_PARAMETRIC_ONLY' },
};

export const detectStairType = (text: string): StairType => {
  if (/旋轉梯|旋转梯|螺旋梯/.test(text)) return 'spiral';
  if (/U\s*型梯|U\s*梯|回字梯/i.test(text)) return 'u_shape';
  if (/L\s*型梯|L\s*梯|轉角梯|转角梯/i.test(text)) return 'l_shape';
  return 'straight';
};
