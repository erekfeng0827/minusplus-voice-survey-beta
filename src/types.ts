export interface Beam {
  id: string;
  wallId?: string; // 新增：梁所屬之牆面 ID
  name: string;
  width: number; // cm
  depth: number; // cm
  extension?: number; // cm 從牆面突出距離
  clearHeight: number; // cm (e.g. 265)
  orientation: 'horizontal' | 'vertical';
  y: number; // cm from top wall
  x?: number; // cm from left wall
  photoUrl?: string; // 照片行政留存 / 現場梁位照片
  photoNote?: string;
  verifiedByPhoto?: boolean;
  sourceHandle?: string;
  sourceCoordinates?: { x1: number; y1: number; x2: number; y2: number };
  sourceEntity?: { type: string; layer: string; handle?: string; text?: string };
}

export interface Door {
  id: string;
  name: string;
  type?: 'balcony' | 'entryway' | 'kitchen_fire' | 'room' | 'bathroom';
  width: number;
  height: number;
  wall: 'top' | 'bottom' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';
  offset: number;
  offsetReference?: 'left' | 'right' | 'center'; // 邊距基準：離該牆左側、離右側或居中 (預設 left 離左側邊距)
  anchorTag?: string; // 門洞拓撲錨點代號，如 "A", "B", "C", "D" (同一個門洞兩側標註相同字母)
  pairedRoomId?: string; // 配對相鄰之房間 ID
  pairedDoorId?: string; // 配對之門洞 ID
  swingDirection?: 'inward_left' | 'inward_right' | 'outward_left' | 'outward_right' | 'sliding';
  isPassage?: boolean;
  sourceHandle?: string;
  sourceCoordinates?: { x1: number; y1: number; x2: number; y2: number };
  sourceEntity?: { type: string; layer: string; handle?: string; text?: string };
}

export interface StitchedRoomPlacement {
  roomId: string;
  roomName: string;
  x: number; // 全局 X 坐標 (cm)
  y: number; // 全局 Y 坐標 (cm)
  rotation: 0 | 90 | 180 | 270; // 剛體旋轉角度
  width: number; // 原始寬度
  length: number; // 原始長度
  effectiveWidth: number; // 旋轉後寬度
  effectiveLength: number; // 旋轉後長度
  color: string;
  isBaseRoom: boolean;
  connectedViaDoorTag?: string;
  connectedToRoomId?: string;
  collisionStatus?: 'passed_zero_collision' | 'boundary_docked';
  coincidentOverlapTotal?: number;
  coincidentSegments?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    edge: string;
    lengthCm: number;
    targetRoomName: string;
  }[];
  sharedWalls: {
    wall: 'top' | 'bottom' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';
    targetRoomId: string;
    targetRoomName: string;
    overlapLength: number;
  }[];
}

export interface StitchedFloorPlanResult {
  placements: StitchedRoomPlacement[];
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    totalWidth: number;
    totalLength: number;
  };
  totalAreaM2: number;
  totalAreaPing: number;
  pairedDoorsCount: number;
  unpairedDoorsCount: number;
  sharedWallCount: number;
  auditNotes: string[];
  stitchMethod?: 'door_anchored' | 'rigid_body_collision';
  zeroCollisionVerified?: boolean;
  totalCoincidentWallLength?: number;
}

export interface ShellPoint { x: number; y: number; }

export interface ProjectShellSegment {
  id: string;
  layer: string;
  entityType: 'LINE' | 'LWPOLYLINE';
  points: ShellPoint[];
  closed: boolean;
}

export interface RoomZone {
  id: string;
  name: string;
  polygon: ShellPoint[];
  sourceLayer: string;
}

export interface ProjectShell {
  id: string;
  sourceFileName: string;
  sourceFormat: 'DXF' | 'MANUAL' | 'PDF' | 'IMAGE';
  underlay?: {
    storageKey: string;
    mimeType: string;
    opacity: number;
  };
  unitName: string;
  scaleToCm: number;
  width: number;
  length: number;
  segments: ProjectShellSegment[];
  zones: RoomZone[];
  importedAt: string;
}

export interface WindowOpening {
  id: string;
  name: string;
  width: number;
  height: number;
  sillHeight: number;
  wall: 'top' | 'bottom' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';
  offset: number;
  offsetReference?: 'left' | 'right' | 'center'; // 邊距基準：離該牆左側、離右側或居中 (預設 left 離左側邊距)
  sourceHandle?: string;
  sourceCoordinates?: { x1: number; y1: number; x2: number; y2: number };
  sourceEntity?: { type: string; layer: string; handle?: string; text?: string };
}

export interface Column {
  id: string;
  name: string; // 如 "C1 結構柱"
  width: number; // cm 柱寬 (如 50, 60)
  depth: number; // cm 柱深 (如 50, 60)
  positionType: 'corner' | 'wall' | 'free'; // 角柱 / 靠牆柱 / 獨立柱
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // 西北(左上)、東北(右上)、西南(左下)、東南(右下)
  wall?: 'top' | 'bottom' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west'; // 貼靠之牆面
  offset?: number; // 離牆角距離 (cm)
  offsetReference?: 'left' | 'right' | 'center'; // 邊距基準
  x?: number; // 獨立柱全局座標 (cm)
  y?: number; // 獨立柱全局座標 (cm)
  height?: number; // 柱高 (cm)
  material?: 'rc' | 'steel' | 'encased';
}

export interface WallSideConfig {
  type: 'interior' | 'exterior' | 'brick' | 'custom'; // 內牆 (10cm) | 外牆 (15cm) | 紅磚牆 (12cm) | 自訂
  thickness: number; // cm (預設內牆 10cm, 外牆 15cm)
  isExterior?: boolean;
}

export interface WallConfigs {
  north?: WallSideConfig;
  south?: WallSideConfig;
  east?: WallSideConfig;
  west?: WallSideConfig;
}

export type Window = WindowOpening;

export interface VoiceMemo {
  id: string;
  text: string;
  timestamp: string;
  x: number; // coordinate in space (cm)
  y: number;
  type: 'info' | 'warning' | 'dimension' | 'electrical';
  audioDurationSec?: number;
  audioSimulated?: boolean;
}

export interface ElectricalPoint {
  id: string;
  type: 'socket_110v' | 'socket_220v' | 'switch' | 'network' | 'ac_drain' | 'water_supply';
  name: string;
  x: number;
  y: number;
  elevation: number; // cm from floor (e.g. 30, 120)
  circuit: string;
}

export interface LightingPoint {
  id: string;
  type: 'downlight' | 'spotlight' | 'cove_strip' | 'pendant' | 'linear_diffuser';
  name: string;
  x: number;
  y: number;
  elevation: number; // cm from floor (e.g. 265, 230)
  colorTemp?: string; // '3000K'
  circuit?: string; // 'L1', 'L2'
}

export interface VirtualAnnotationPoint {
  id: string;
  label: string; // e.g. "大樑下淨高 FL+265", "空調降板 FL+230", "開間面寬 480cm"
  dimensionType: 'length' | 'height' | 'elevation' | 'clearance' | 'opening' | 'mep' | 'obstacle';
  dimensionValue: number; // in cm
  unit: 'cm' | 'mm';
  x: number; // coordinate in space (cm)
  y: number; // coordinate in space (cm)
  elevation?: number; // FL+... (cm)
  referenceWall?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  targetEntity?: string; // e.g. "結構大樑 B1", "冷氣吊頂", "開關底盒"
  description: string;
  extractedFromText: string;
  confidence: number; // e.g. 0.96
  rule5MultipleCompliant: boolean;
  isVirtualAiGenerated: boolean;
  leaderLine?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface VoiceEvaluation {
  score?: number; // 0-100
  clarity?: string;
  missingElements?: string[];
  rule5MultiplePassed?: boolean;
  suggestions?: string;
}

export interface RoomData {
  id: string;
  roomName: string;
  width: number; // cm (e.g. 480)
  length: number; // cm (e.g. 380)
  height: number; // cm floor to slab (RC樓板原結構淨高，如 280)
  ceilingDrop: number; // cm ceiling drop (天花板降板造型高度，如 230)
  beamHeight: number; // cm beam bottom clearance (大梁底離地淨高，如 265)
  bathKitchenDrop?: number; // cm (衛浴/廚房降板高度，如 215)
  sprinklerHeight?: number; // cm 消防灑水下緣
  acDrainHeight?: number; // cm 冷氣排水下緣
  refrigerantHoleHeight?: number; // cm 冷媒孔洞下緣
  recessedCutouts?: { // 凹凸空間/穿插內縮衛浴/畸角扣除定義
    id: string;
    name: string; // 如 "置入式客用衛浴凹損"、"更衣間開口缺角"
    wall: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'left' | 'right';
    offset: number; // 離牆角距離 (cm)
    width: number;  // 缺口寬度 (cm)
    depth: number;  // 凹陷進深 (cm)
    targetRoomName?: string; // 穿插相鄰空間名稱，如 "客用衛浴"
  }[];
  wallThickness: number; // cm (丈量統一預設 10cm，外牆預設 15cm)
  datumOrigin?: { // 現場丈量基準原點，預設取玄關大門鉸鏈側牆角
    x: number;
    y: number;
    wall: 'top' | 'bottom' | 'left' | 'right';
    sourceDoorId: string;
    description: string;
  };
  wallConfigs?: WallConfigs; // 個別牆面外牆/內牆設定 (北/南/東/西)
  columns?: Column[]; // 結構柱體 (角柱、牆柱、獨立柱)
  evaluation?: VoiceEvaluation;
  beams: Beam[];
  doors: Door[];
  windows: WindowOpening[];
  voiceMemos: VoiceMemo[];
  electricalPoints: ElectricalPoint[];
  lightingPoints?: LightingPoint[];
  virtualAnnotations?: VirtualAnnotationPoint[];
  lastUpdated: string;
  materials?: RoomMaterials;
  sunlight?: SunlightConfig;
  notes?: string[];
  placedBlocks?: PlacedBlockItem[];
  furniture?: FurnitureItem[];
  sourceProvenance?: {
    sourceHandle?: string;
    sourceCoordinates?: { minX: number; maxX: number; minY: number; maxY: number };
    textEntities?: string[];
    clusterId?: string;
    fileFingerprint?: string;
    parsedEntityCount?: number;
  };
}

export interface MaterialItem {
  id: string;
  name: string;
  category: 'floor' | 'wall' | 'ceiling' | 'beam';
  hexColor: string;
  roughness: number;
  metalness: number;
  texturePattern?: string;
  unitPrice?: string;
  specCode: string;
  description: string;
}

export interface RoomMaterials {
  floorId: string;
  wallId: string;
  ceilingId: string;
  beamId: string;
}

export interface SunlightConfig {
  hour: number; // 6 to 22 (e.g. 14.5 for 14:30)
  season: 'summer' | 'equinox' | 'winter';
  windowOrientation: 'south' | 'southeast' | 'southwest' | 'east' | 'west' | 'north';
  sunIntensity: number; // 0 to 2
  indoorLightEnabled: boolean;
  indoorLightColor: string; // hex
  ambientLux: number;
}

export interface DxfLayerConfigItem {
  key: string;
  defaultName: string;
  customName: string;
  colorNumber: number; // AutoCAD color index 1-255
  colorHex: string;
  lineType: 'CONTINUOUS' | 'DASHED' | 'CENTER' | 'HIDDEN' | 'PHANTOM2';
  lineweight?: number; // DXF group 370, 1/100 mm; -3 = drawing default
  enabled: boolean;
  description: string;
}

export interface ComplianceIssue {
  id: string;
  category: 'CONTRACT_5_MULTIPLE' | 'BUILDING_CODE' | 'CAD_STANDARDS' | 'SITE_SAFETY';
  title: string;
  targetValue: string;
  actualValue: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  clause: string;
  recommendation: string;
}

export interface ComplianceReportData {
  reportNumber: string;
  roomName: string;
  date: string;
  auditor: string;
  score: number;
  rule5MultipleOverall: boolean;
  buildingCodeOverall: boolean;
  cadQualityOverall: boolean;
  issues: ComplianceIssue[];
  signOff: {
    architect: string;
    siteEngineer: string;
    aiInspector: string;
  };
}

export interface VRuleCheck {
  id: string; // V-01 to V-10
  name: string;
  category: string;
  description: string;
  passed: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  detectedIssue?: string;
  autoFixAvailable: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  status: 'NEW' | 'IN_PROGRESS' | 'FAILED' | 'DISPATCHED_TO_JINGJING' | 'ARCHIVED_NOTION';
  category: 'A' | 'B' | 'C'; // A: 立即派發晶晶, B: 排程/Notion備份, C: 無效/重複/垃圾
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  sizeKb: number;
  desc: string;
}

export interface WatcherStatus {
  heartbeatState: 'RED_ALERT' | 'GREEN_HEALTHY';
  lastHeartbeatHoursAgo: number;
  watcherActive: boolean;
  pendingStuckDays: number;
  stuckOrderCount: number;
  dispatchChannel: string;
}

// 3D Furniture & Collision Warning System Types
export interface FurnitureItem {
  id: string;
  name: string;
  category: 'wardrobe' | 'cabinet' | 'ac_indoor_unit' | 'lighting' | 'desk_table' | 'bed' | 'door_swing_test';
  x: number; // coordinate in space from left wall (cm)
  y: number; // coordinate in space from top wall (cm)
  width: number; // cm (X dimension)
  depth: number; // cm (Y dimension)
  height: number; // cm (Z dimension / vertical height)
  elevation: number; // cm from floor (FL+0 for floor furniture, FL+... for suspended fixtures)
  rotationY?: number; // degrees
  colorHex?: string;
  specNote?: string;
}

export interface CollisionOptimizationSolution {
  id: string;
  title: string;
  description: string;
  actionType: 'REDUCE_HEIGHT' | 'SHIFT_POSITION' | 'ALIGN_5_MULTIPLE' | 'RELOCATE_AWAY_FROM_DOOR' | 'ADJUST_ELEVATION';
  newValues: {
    height?: number;
    elevation?: number;
    x?: number;
    y?: number;
  };
}

export interface CollisionWarningIssue {
  id: string;
  furnitureId: string;
  furnitureName: string;
  collisionType: 'CEILING_DROP_PENETRATION' | 'BEAM_CLEARANCE_CLASH' | 'DOOR_SWING_BLOCKAGE' | 'RULE_5_MULTIPLE_VIOLATION' | 'HEADROOM_INADEQUATE';
  collidingWithTitle: string;
  severity: 'CRITICAL' | 'WARNING';
  contractRuleClause: string; // e.g. "《降板裁決_v003》第 4 條：空調降板天花 230cm 避讓", "幾何契約 5 倍數原則"
  issueDescription: string;
  currentHeightOrElev: number;
  contractConstraintElev: number;
  penetrationCm: number; // cm difference / overlap
  solutions: CollisionOptimizationSolution[];
}

export interface IpadApplicationData {
  applicantName: string;
  email: string;
  organization: string;
  deviceModel: string;
  serialOrUdid: string;
  useCase: 'SITE_MEASUREMENT' | 'CONSTRUCTION_AUDIT' | 'CLIENT_3D_PRESENTATION';
  status: 'SUBMITTED' | 'APPROVED' | 'ACTIVE';
  submittedAt: string;
  licenseKey: string;
}

// Quotation Estimator Types
export interface QuotationLineItem {
  id: string;
  category: 'CEILING' | 'HVAC_DROP' | 'MEP_CIRCUIT' | 'LIGHTING' | 'STAKING_LABOR' | 'DISCOUNT_TAX';
  name: string;
  specification: string;
  unit: '坪' | 'm' | '組' | '盞' | '式';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string;
  ruleReference?: string;
}

// Batch DXF Layer Optimizer Types
export interface DxfOptimizationFileItem {
  id: string;
  fileName: string;
  roomName: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  layerCountOriginal: number;
  layerCountOptimized: number;
  purgedEntitiesCount: number;
  normalizedLayersCount: number;
  status: 'PENDING' | 'ANALYZING' | 'OPTIMIZED' | 'FAILED';
  issuesResolved: string[];
}

// Batch Compliance Audit Types for Xingyuewan 5-Multiple Contract
export type TriagePriority = 'P0_CRITICAL' | 'P1_WARNING' | 'P2_COMPLIANT';

export interface RoomCheckItem {
  id: string;
  category: 'CORE_ELEVATION' | 'BOUNDARY' | 'INTERNAL_BEAM' | 'OPENING' | 'MEP';
  name: string;
  actualValue: number;
  contractTarget: string;
  is5Multiple: boolean;
  deviationCm: number;
  passed: boolean;
  remark: string;
}

export interface RoomAuditResult {
  roomId: string;
  roomName: string;
  complianceScore: number; // 0-100
  passRate5Multiple: number; // percentage
  priority: TriagePriority;
  priorityLabel: string; // 'P0 緊急解塞' | 'P1 次要優化' | 'P2 合規放行'
  defectCount: number;
  checkItems: RoomCheckItem[];
  elevationAudit: {
    beamHeight: { value: number; passed: boolean; is5Multiple: boolean };
    ceilingDrop: { value: number; passed: boolean; is5Multiple: boolean };
    bathKitchenDrop: { value: number; passed: boolean; is5Multiple: boolean };
    floorHeight: { value: number; passed: boolean; is5Multiple: boolean };
  };
  dimensionAudit: {
    width: { value: number; passed: boolean };
    length: { value: number; passed: boolean };
  };
  suggestedFixSummary: string;
}

export interface BatchAuditSummary {
  totalRooms: number;
  auditedAt: string;
  averageScore: number;
  overallPassRate: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  totalDefects: number;
  pipelineStatus: 'BLOCKED' | 'WARNING' | 'CLEAR_TO_DISPATCH';
}

// CAD Custom Profile, Block Library, Lineweight Mapping, and Hatch Pattern Types
export interface CADBlockLibraryItem {
  id: string;
  blockName: string;
  category: 'elevation_tag' | 'section_callout' | 'cabinet_handle' | 'title_block' | 'level_marker';
  label: string;
  symbolShape: 'triangle_down' | 'circle_split' | 'rect_box' | 'bubble_callout' | 'bar_line';
  prefix: string; // e.g. '▼ FL+', '⮜ A-A\' ⮞', 'DET-'
  scale: number;
  layerName: string;
  colorIndex: number; // AutoCAD Color 1-7
  colorHex: string;
  description: string;
}

export interface LineweightMappingItem {
  id: string;
  key: 'cut_structural' | 'profile_outline' | 'cabinet_division' | 'hidden_projection' | 'dimension_leader' | 'elevation_datum';
  label: string;
  layerName: string;
  colorIndex: number; // AutoCAD Color 1-7
  colorHex: string;
  lineWeightMm: number; // in mm: 0.50, 0.25, 0.15, 0.13, 0.18, 0.35
  lineType: 'CONTINUOUS' | 'DASHED' | 'DOT' | 'CENTER';
  description: string;
}

export interface HatchPatternConfigItem {
  id: string;
  targetMaterial: 'wood_joinery' | 'rc_concrete' | 'stone_countertop' | 'glass_panel' | 'ceiling_drop';
  label: string;
  patternName: 'ANSI31' | 'ANSI32' | 'AR-CONC' | 'CROSS_HATCH' | 'DOTS' | 'SOLID';
  angleDeg: number; // e.g. 45
  spacingMm: number; // e.g. 2.0
  lineWeightMm: number;
  layerName: string;
  colorIndex: number;
  colorHex: string;
  description: string;
}

export interface CADCustomProfile {
  profileId: string;
  profileName: string;
  author: string;
  version: string;
  description: string;
  updatedAt: string;
  lineweights: LineweightMappingItem[];
  hatchSettings: HatchPatternConfigItem[];
  blockLibrary: CADBlockLibraryItem[];
  sheetConfig: {
    paperSize: 'A3' | 'A2' | 'A1';
    orientation: 'LANDSCAPE' | 'PORTRAIT';
    projectTitle: string;
    drawingTitle: string;
    drawingCode: string;
    drawingScale: string;
    companyName: string;
    designerName: string;
  };
}

// Company Title Block & Logo Configuration
export interface CompanyTitleBlockSettings {
  companyName: string;
  companyEnName: string;
  registrationNumber: string; // 室內裝修業登記證號
  taxId: string; // 統一編號
  address: string;
  phone: string;
  websiteOrEmail: string;
  logoUrl?: string; // base64 or SVG data url
  logoWidthMm: number; // e.g. 35mm
  logoHeightMm: number; // e.g. 15mm
  layoutPosition: 'right_column' | 'bottom_bar';
  paperSize: 'A3' | 'A2' | 'A1';
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  projectName: string;
  projectCode: string;
  clientName: string;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  sealStampText: string; // 專業技師簽證章
  disclaimerText: string; // 施工通則免責聲明
  revisionHistory: { rev: string; date: string; desc: string; by: string }[];
}

// DWG Batch Habit Learning & Personal Specification Sheet
export interface DwgLearnedHabitProfile {
  id: string;
  profileName: string;
  author: string;
  analyzedFileCount: number;
  sourceFileNames: string[];
  generatedAt: string;
  overallStyleTag: string; // e.g. '高端精細木作風 (星玥灣規範)'
  confidenceScore: number; // e.g. 98%
  layerRules: {
    rawLayer: string;
    standardLayer: string;
    colorIndex: number;
    lineWeightMm: number;
    usageCount: number;
    detectedType: string;
  }[];
  hatchRules: {
    material: string;
    pattern: string;
    angleDeg: number;
    spacingMm: number;
    lineWeightMm: number;
    colorIndex: number;
  }[];
  detailRules: {
    id: string;
    name: string;
    standardSize: string;
    keyDimensionCm: number;
    habitNotes: string;
    category: 'woodwork' | 'ceiling' | 'skirting' | 'countertop' | 'mep';
  }[];
  dimRules: {
    fontStyle: string;
    textHeightMm: number;
    arrowStyle: 'architectural_tick' | 'closed_filled' | 'dot';
    dimScale: number;
    unit: string;
    tolerance: string;
  };
}

// Custom Hatch Pattern Definition Data (.pat & DWG blocks)
export interface CustomHatchPatternData {
  patName: string;
  patDefinition?: string; // Standard AutoCAD .pat format (e.g. *ANSI31, Iron\n45, 0,0, 0,.125)
  angleDeg: number;
  spacingMm: number;
  lineWeightMm: number;
  colorIndex: number;
  associatedMaterial: string; // e.g. "木作合板與實木角料剖面"
  patternType: 'standard_pat' | 'dwg_hatch_block' | 'custom_pat_code';
  strokeDash?: string;
}

// Local Personal Custom Detail & Block Library Item
export interface PersonalDetailBlockItem {
  id: string;
  name: string;
  category: 'furniture' | 'detail_joint' | 'title_symbol' | 'mep_symbol' | 'hatch_pattern';
  subCategory: string; // e.g. '沙發', '木作收邊', '天花剖面', 'A3圖框', '剖面填充'
  widthCm: number;
  depthCm: number;
  heightCm: number;
  elevationCm: number;
  cadLayer: string;
  colorIndex: number;
  svgIconPath?: string;
  dxfEntityTemplate?: string;
  notes: string;
  isCustomUploaded: boolean;
  uploadedAt: string;
  hatchData?: CustomHatchPatternData;
  tags?: string[];
  scaleCalibrated?: boolean;
  calibrationNote?: string;
}

// Placed Block on 2D Staking Canvas & 3D Synchronization
export interface PlacedBlockItem {
  id: string;
  furnitureId?: string; // stable link to the editable 3D/furniture record
  blockId: string;
  name: string;
  category: 'furniture' | 'detail_joint' | 'title_symbol' | 'mep_symbol' | 'hatch_pattern';
  subCategory: string;
  x: number; // coordinate in space from left wall (cm)
  y: number; // coordinate in space from top wall (cm)
  widthCm: number;
  depthCm: number;
  heightCm?: number;
  elevationCm?: number;
  cadLayer: string;
  colorIndex?: number;
  rotationDeg?: number;
  snapTarget?: string; // e.g. "北向結構牆面", "結構樑 B1 軸線", "5 倍數工程模數基準線"
  snappedTo?: string;
  hatchData?: CustomHatchPatternData;
  tags?: string[];
  placedAt?: string;
}

// Project Cloud Backup & Snapshot
export interface ProjectCloudBackup {
  id: string;
  projectName: string;
  versionTag: string; // e.g. 'REV 03 (星玥灣降板完工版)'
  backupDate: string;
  roomsCount: number;
  fileSizeKb: number;
  storageProvider: 'Firebase' | 'Google Drive' | 'LocalEncrypted';
  notes: string;
  snapshotDataJson: string; // Complete serialized snapshot
}

// Device Adaptive Modes & Scaling Configuration
export type DeviceAdaptiveMode = 'auto' | 'iphone' | 'ipad' | 'desktop';

export interface DeviceAdaptiveConfig {
  mode: DeviceAdaptiveMode; // 'auto' | 'iphone' | 'ipad' | 'desktop'
  zoomScale: number; // e.g. 0.85, 0.90, 1.0, 1.10, 1.20
  simulateDeviceFrame: boolean; // whether to show physical device bezel on desktop preview
  orientation: 'portrait' | 'landscape'; // portrait or landscape
}

// ==============================================================================
// 📐 個人規格自動套用 (Designer Specification Profiles)
// ==============================================================================
export interface DesignerSpecProfile {
  id: string;
  name: string;
  badge: string;
  author: string;
  companyName: string;
  companyTel: string;
  companyEmail: string;
  description: string;
  isDefault?: boolean;
  isCustom?: boolean;

  // 契約工程模數
  modularGridCm: number; // e.g. 5 (加減設計 5 倍數契約規範), 10, 15, 30 (日式尺模數)
  enforceModularRounding: boolean; // 是否強制將房間長寬、門窗離壁偏移量進位對齊模數

  // 結構與隔間規範
  rcWallThickness: number; // e.g. 15cm (標準RC牆), 20cm
  partitionWallThickness: number; // e.g. 10cm (輕隔間), 12cm, 15cm
  defaultClearHeight: number; // e.g. 280cm (樓層原始淨高)
  defaultBeamHeight: number; // e.g. 265cm (梁底淨高)
  defaultBeamDepth: number; // e.g. 55cm
  defaultCeilingDrop: number; // e.g. 230cm (客廳平頂天花降板)
  defaultBathKitchenDrop: number; // e.g. 215cm (衛浴廚房設備降板)
  
  // 全局專案標高規範 (Project Global Standards)
  globalRcSlabHeight?: number; // e.g. 290cm
  globalSprinklerHeight?: number; // e.g. 255cm
  globalAcDrainHeight?: number; // e.g. 210cm
  globalRefrigerantHoleHeight?: number; // e.g. 240cm

  // 門窗開口規範
  doorStandardWidth: number; // e.g. 90cm
  doorStandardHeight: number; // e.g. 210cm / 240cm (頂天門)
  doorCornerOffset: number; // e.g. 15cm (門框離轉角預留門套厚度)
  windowSillHeight: number; // e.g. 90cm
  windowStandardHeight: number; // e.g. 150cm

  // 水電強弱電高度規範 (cm 離地)
  outletHeightLow: number; // e.g. 30cm (一般插座)
  outletHeightCounter: number; // e.g. 110cm (檯面/書桌插座)
  switchHeight: number; // e.g. 120cm (開關面板)
  acDrainHeight: number; // e.g. 215cm (冷氣排水高度)

  // 製圖與圖框出圖規範
  paperSize: 'A3' | 'A2' | 'A1';
  floorPlanScale: '1/40' | '1/50' | '1/30';
  elevationScale: '1/20' | '1/30' | '1/40';
  drawingUnit: 'CM' | 'MM';
  titleBlockStyle: 'minusplus_corey' | 'cns_standard' | 'minimalist_japanese';
  ctbFileName: string;
}

// 規格自動套用之稽核變更項目
export interface SpecAuditChange {
  roomId: string;
  roomName: string;
  category: 'dimension' | 'wall' | 'ceiling' | 'beam' | 'door' | 'electrical';
  item: string;
  before: string | number;
  after: string | number;
  reason: string;
}

// ==============================================================================
// 📐 CAD 批次輸出引擎 (CAD Batch Output Engine)
// ==============================================================================
export interface CadBatchSheetSelection {
  sheetId: string;
  sheetNo: string;
  title: string;
  category: 'architecture' | 'elevation' | 'mep' | 'cover';
  scale: string;
  selected: boolean;
}

export interface CadBatchExportConfig {
  projectName: string;
  projectCode: string;
  designer: string;
  date: string;
  sheets: CadBatchSheetSelection[];
  exportFormats: {
    singleAllInOneDxf: boolean; // 一份 DXF 包含所有 A3 排版 (間距 2000mm)
    individualDxfs: boolean; // 獨立拆開每張圖號 DXF
    autoCadScriptScr: boolean; // .scr 批次自動出圖腳本
    batchPlotBat: boolean; // .bat Windows 一鍵出圖執行檔
    ctbStyleGuide: boolean; // CTB 出圖樣式筆寬說明檔
  };
  outputScale: '1/40' | '1/50' | '1/30';
  paperSize: 'A3' | 'A2';
}

// ==============================================================================
// 🏛️ SU LayOut 導出引擎 (SketchUp & LayOut Export Engine)
// ==============================================================================
export interface SuLayoutExportConfig {
  projectName: string;
  roomIds: string[]; // 匯出之空間清單 (可全選或特定空間)
  exportRubyScenesScript: boolean; // minusplus_su_scenes_builder.rb (自動生成 SU 標記與 5 大場景)
  exportLayOutScrapbook: boolean; // LayOut 專用剪貼簿圖例包 (.dxf / SVG 符號庫)
  exportSketchup3dDxf: boolean; // 3D 分層實體模型 DXF (牆體/天花/開口/家具)
  exportLayOutA3Pdf: boolean; // LayOut 1:40 標準排版 PDF
  targetLayOutScale: '1/40' | '1/30' | '1/50';
  includeCeilingBeams: boolean;
  includeFurnitureLayers: boolean;
  includeMepLightingCircuit: boolean;
}
