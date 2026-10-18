import { RoomData, VirtualAnnotationPoint, VoiceEvaluation } from '../types';

export interface VoiceOptimizationResult {
  rawText: string;
  normalizedText: string;
  confidenceScore: number;
  extractedParameters: {
    roomName?: string;
    width?: number;
    length?: number;
    height?: number;
    beamHeight?: number;
    ceilingDrop?: number;
    bathKitchenDrop?: number;
  };
  correctionsApplied: Array<{
    target: string;
    original: number | string;
    corrected: number | string;
    reason: string;
    contractRule: string;
  }>;
  commandActions: Array<{
    type: 'UPDATE_DIMENSION' | 'ADD_BEAM' | 'ADD_OPENING' | 'ADD_ANNOTATION' | 'SWITCH_VIEW' | 'AUTO_SNAP_5X';
    label: string;
    detail: string;
    executable: boolean;
  }>;
  suggestedAnnotations: VirtualAnnotationPoint[];
  acousticClarityScore: number; // 0-100
  completenessCheck: {
    hasWidth: boolean;
    hasLength: boolean;
    hasBeamClearance: boolean;
    hasCeilingDrop: boolean;
    hasStructuralHeight: boolean;
    passed5xContract: boolean;
  };
}

/**
 * 台灣工地常見語音口語模糊音、諧音、閩南語術語標準化詞典
 */
const ACOUSTIC_HOMOPHONE_MAP: Array<{ regex: RegExp; replaceWith: string; reason: string }> = [
  // 梁位與高度諧音
  { regex: /(?:涼下|涼高|量下|量高|良下|兩下|連下)/gi, replaceWith: '梁下', reason: '口音矯正：梁下' },
  { regex: /(?:大涼|主涼|次涼|小涼)/gi, replaceWith: '大梁', reason: '口音矯正：大梁' },
  { regex: /(?:敬告|靜高|進高|鏡高)/gi, replaceWith: '淨高', reason: '口音矯正：淨高' },
  { regex: /(?:將板|降半|降版|降班)/gi, replaceWith: '降板', reason: '口音矯正：降板' },
  { regex: /(?:聽話|天華|天發|天花板)/gi, replaceWith: '天花', reason: '口音矯正：天花' },
  
  // 開間面寬諧音
  { regex: /(?:棉寬|免寬|勉寬|面冠|寬度)/gi, replaceWith: '面寬', reason: '口音矯正：面寬' },
  { regex: /(?:金身|近身|精深|淨深|進身|深長)/gi, replaceWith: '進深', reason: '口音矯正：進深' },
  { regex: /(?:開兼|開尖|開堅)/gi, replaceWith: '開間', reason: '口音矯正：開間' },
  
  // 空調水電設備
  { regex: /(?:掉引|吊影|吊隱式|調引)/gi, replaceWith: '吊隱', reason: '設備標準化：吊隱冷氣' },
  { regex: /(?:穿涼|川涼|穿量)/gi, replaceWith: '穿梁', reason: '弱電工法：穿梁套管' },
  { regex: /(?:落成|落成區|落塵)/gi, replaceWith: '落塵區', reason: '空間標準化：玄關落塵區' },
  { regex: /(?:台度|抬度|抬頭)/gi, replaceWith: '窗台度', reason: '建築術語：窗台度' },
  { regex: /(?:差作|插頭|便當盒)/gi, replaceWith: '插座', reason: '水電術語：插座底盒' },
  { regex: /(?:雙切|單切|切開關)/gi, replaceWith: '開關', reason: '水電術語：開關底盒' },

  // 台語慣用音轉譯
  { regex: /(?:西八|細八)/gi, replaceWith: '480', reason: '台語數字轉譯：四百八' },
  { regex: /(?:高砸|勾雜)/gi, replaceWith: '90', reason: '台語數字轉譯：九十' },
  { regex: /(?:哩八|兩百八)/gi, replaceWith: '280', reason: '台語數字轉譯：二百八' },
];

/**
 * 數值就近對齊 5 倍數契約規範
 */
export function snapToContract5x(val: number): { value: number; wasAdjusted: boolean; delta: number } {
  const remainder = val % 5;
  if (remainder === 0) {
    return { value: val, wasAdjusted: false, delta: 0 };
  }
  const snapped = Math.round(val / 5) * 5;
  return { value: snapped, wasAdjusted: true, delta: snapped - val };
}

/**
 * 核心引擎：深度口述指令優化器
 * 將粗糙、含工地雜訊口語的語音逐字稿，精煉為結構化 CAD/放樣可直接執行的指令群
 */
export function optimizeVoiceMeasurementCommand(
  rawTranscript: string,
  roomContext: RoomData
): VoiceOptimizationResult {
  if (!rawTranscript || !rawTranscript.trim()) {
    return {
      rawText: '',
      normalizedText: '',
      confidenceScore: 0,
      extractedParameters: {},
      correctionsApplied: [],
      commandActions: [],
      suggestedAnnotations: [],
      acousticClarityScore: 0,
      completenessCheck: {
        hasWidth: false,
        hasLength: false,
        hasBeamClearance: false,
        hasCeilingDrop: false,
        hasStructuralHeight: false,
        passed5xContract: false,
      },
    };
  }

  let text = rawTranscript.trim();
  const corrections: VoiceOptimizationResult['correctionsApplied'] = [];

  // 1. 聲學校正與雜訊降噪
  ACOUSTIC_HOMOPHONE_MAP.forEach(({ regex, replaceWith, reason }) => {
    if (regex.test(text)) {
      text = text.replace(regex, replaceWith);
      corrections.push({
        target: '語音諧音矯正',
        original: rawTranscript,
        corrected: replaceWith,
        reason,
        contractRule: '工地環境聲學校準術語庫',
      });
    }
  });

  // 中文全形半形與常見連接詞精簡
  text = text
    .replace(/[，,。、；;！!？?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. 幾何實體與數值抓取
  const extracted: VoiceOptimizationResult['extractedParameters'] = {};
  const commandActions: VoiceOptimizationResult['commandActions'] = [];

  // A. 面寬 (Width)
  const widthRegex = /(?:面寬|開間|X向|寬)\s*(?:為|是|約)?\s*(\d{2,4})/i;
  const wMatch = text.match(widthRegex);
  if (wMatch) {
    const rawVal = parseInt(wMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.width = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '開間面寬 (X)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測 ${rawVal}cm 非 5 倍數，自動就近校正為 ${snap.value}cm`,
        contractRule: 'V-01 開間軸線 5 倍數契約',
      });
    }
    commandActions.push({
      type: 'UPDATE_DIMENSION',
      label: `設置面寬: ${snap.value} cm`,
      detail: `更新 X 軸向總開間至 ${snap.value} cm (原測: ${rawVal}cm)`,
      executable: true,
    });
  }

  // B. 進深 (Length)
  const lengthRegex = /(?:進深|長度|深度|Y向|長)\s*(?:為|是|約)?\s*(\d{2,4})/i;
  const lMatch = text.match(lengthRegex);
  if (lMatch) {
    const rawVal = parseInt(lMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.length = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '開間進深 (Y)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測 ${rawVal}cm 非 5 倍數，自動校正為 ${snap.value}cm`,
        contractRule: 'V-01 進深軸線 5 倍數契約',
      });
    }
    commandActions.push({
      type: 'UPDATE_DIMENSION',
      label: `設置進深: ${snap.value} cm`,
      detail: `更新 Y 軸向總開間至 ${snap.value} cm`,
      executable: true,
    });
  }

  // C. 大梁下淨高 (Beam Height) - 契約標竿 265
  const beamRegex = /(?:梁下|樑下|主梁|大梁|大樑|梁底)\s*(?:淨高|高度|高|為|是|約)?\s*(\d{2,4})/i;
  const bMatch = text.match(beamRegex);
  if (bMatch) {
    const rawVal = parseInt(bMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.beamHeight = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '主梁下淨高 (FL+)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測梁底 ${rawVal}cm 非 5 倍數，自動依合約標準錨定至 ${snap.value}cm`,
        contractRule: '《降板裁決_v003》第 1 條：大梁下淨高 FL+265',
      });
    }
    commandActions.push({
      type: 'ADD_BEAM',
      label: `梁下淨高鎖定: FL+${snap.value} cm`,
      detail: `設定結構主梁過梁淨空高程至 FL+${snap.value} cm`,
      executable: true,
    });
  }

  // D. 空調天花降板 (Ceiling Drop) - 契約標竿 230
  const dropRegex = /(?:天花降板|降板|空調降|吊頂降|吊隱降板|吊隱)\s*(?:高度|高|為|是|約)?\s*(\d{2,4})/i;
  const dMatch = text.match(dropRegex);
  if (dMatch) {
    const rawVal = parseInt(dMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.ceilingDrop = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '空調天花降板 (FL+)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測降板 ${rawVal}cm，依 v003 標準自動裁決校正為 ${snap.value}cm (Δh=50cm)`,
        contractRule: '《降板裁決_v003》第 2 條：空調吊頂 FL+230',
      });
    }
    commandActions.push({
      type: 'UPDATE_DIMENSION',
      label: `空調降板設定: FL+${snap.value} cm`,
      detail: `天花降板高程鎖定至 FL+${snap.value} cm，預留集風箱 50cm 施作間距`,
      executable: true,
    });
  }

  // E. 玄關/衛廚落塵降板 (Bath Kitchen Drop) - 契約標竿 215
  const bathDropRegex = /(?:落塵|落塵區|玄關降|衛浴降|浴室降)\s*(?:降板|高度|高|為|是|約)?\s*(\d{2,4})/i;
  const bdMatch = text.match(bathDropRegex);
  if (bdMatch) {
    const rawVal = parseInt(bdMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.bathKitchenDrop = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '落塵/衛浴降板 (FL+)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測 ${rawVal}cm，依落塵地坪差裁決校正至 ${snap.value}cm`,
        contractRule: '《降板裁決_v003》第 3 條：落塵區降板 FL+215',
      });
    }
    commandActions.push({
      type: 'UPDATE_DIMENSION',
      label: `落塵降板鎖定: FL+${snap.value} cm`,
      detail: `玄關/衛廚落塵完成面天花降板至 FL+${snap.value} cm`,
      executable: true,
    });
  }

  // F. 樓板原結構淨高 (Slab Height) - 契約標竿 280
  const heightRegex = /(?:結構淨高|樓高|樓板高|清水模|原頂高)\s*(?:高度|高|為|是|約)?\s*(\d{2,4})/i;
  const hMatch = text.match(heightRegex);
  if (hMatch) {
    const rawVal = parseInt(hMatch[1], 10);
    const snap = snapToContract5x(rawVal);
    extracted.height = snap.value;
    if (snap.wasAdjusted) {
      corrections.push({
        target: '清水樓板頂高 (CL+)',
        original: rawVal,
        corrected: snap.value,
        reason: `實測頂板 ${rawVal}cm，依結構圖校正為 ${snap.value}cm`,
        contractRule: '結構建築圖 RC 樓板淨高 280cm',
      });
    }
    commandActions.push({
      type: 'UPDATE_DIMENSION',
      label: `結構樓板淨高: CL+${snap.value} cm`,
      detail: `原結構樓板垂直完成面淨高鎖定至 CL+${snap.value} cm`,
      executable: true,
    });
  }

  // 3. 虛擬放樣標註點 (Virtual Annotations) 自動推導生成
  const suggestedAnnotations: VirtualAnnotationPoint[] = [];
  const currentW = extracted.width || roomContext.width || 480;
  const currentL = extracted.length || roomContext.length || 550;

  if (extracted.beamHeight) {
    suggestedAnnotations.push({
      id: `anno-beam-${Date.now()}`,
      label: `大梁下淨高 FL+${extracted.beamHeight}`,
      dimensionType: 'clearance',
      dimensionValue: extracted.beamHeight,
      unit: 'cm',
      x: Math.round(currentW * 0.5),
      y: Math.round(currentL * 0.35),
      elevation: extracted.beamHeight,
      referenceWall: 'center',
      targetEntity: '結構主梁 B1',
      description: `語音自動推導：大梁下淨高 FL+${extracted.beamHeight}，符合 5 倍數契約`,
      extractedFromText: rawTranscript.slice(0, 50),
      confidence: 0.98,
      rule5MultipleCompliant: extracted.beamHeight % 5 === 0,
      isVirtualAiGenerated: true,
    });
  }

  if (extracted.ceilingDrop) {
    suggestedAnnotations.push({
      id: `anno-drop-${Date.now()}`,
      label: `空調降板天花 FL+${extracted.ceilingDrop}`,
      dimensionType: 'height',
      dimensionValue: extracted.ceilingDrop,
      unit: 'cm',
      x: Math.round(currentW * 0.3),
      y: Math.round(currentL * 0.2),
      elevation: extracted.ceilingDrop,
      referenceWall: 'top',
      targetEntity: '空調吊隱天花板',
      description: `語音自動推導：空調降板天花 FL+${extracted.ceilingDrop} (Δh=50cm)`,
      extractedFromText: rawTranscript.slice(0, 50),
      confidence: 0.95,
      rule5MultipleCompliant: extracted.ceilingDrop % 5 === 0,
      isVirtualAiGenerated: true,
    });
  }

  // 4. 口述完整度與評分計算
  const hasWidth = Boolean(extracted.width || wMatch);
  const hasLength = Boolean(extracted.length || lMatch);
  const hasBeamClearance = Boolean(extracted.beamHeight || bMatch);
  const hasCeilingDrop = Boolean(extracted.ceilingDrop || dMatch);
  const hasStructuralHeight = Boolean(extracted.height || hMatch);

  const matchedCount = [hasWidth, hasLength, hasBeamClearance, hasCeilingDrop, hasStructuralHeight].filter(Boolean).length;
  const clarityBase = Math.min(100, 55 + matchedCount * 9);
  const penalty = corrections.length > 0 ? 0 : 5; // 獎勵自動校準
  const acousticClarityScore = Math.min(100, clarityBase + penalty);

  const passed5xContract = corrections.every(c => typeof c.corrected === 'number' ? (c.corrected as number) % 5 === 0 : true);

  return {
    rawText: rawTranscript,
    normalizedText: text,
    confidenceScore: matchedCount >= 3 ? 0.96 : matchedCount >= 1 ? 0.82 : 0.45,
    extractedParameters: extracted,
    correctionsApplied: corrections,
    commandActions,
    suggestedAnnotations,
    acousticClarityScore,
    completenessCheck: {
      hasWidth,
      hasLength,
      hasBeamClearance,
      hasCeilingDrop,
      hasStructuralHeight,
      passed5xContract,
    },
  };
}
