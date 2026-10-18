export interface ConstructionDetailItem {
  id: string;
  category: 'ceiling' | 'cabinet' | 'mep' | 'door_window' | 'gotchas';
  categoryLabel: string;
  name: string;
  code: string; // e.g. "CD-CEIL-01"
  standardDimension: string; // e.g. "FL+230 cm"
  toleranceRange: string; // e.g. "±5 cm (強制5倍數)"
  description: string;
  cadLayer: string; // e.g. "CEILING_DETAIL"
  rule5MultipleCompatible: boolean;
  keySpecs: { label: string; value: string }[];
  criticalGotchas: string[]; // 特別注意事項
  svgDiagramType: 'ceiling_drop' | 'curtain_box' | 'cove_lighting' | 'shoe_cabinet' | 'kitchen_counter' | 'tv_cabinet' | 'wardrobe' | 'mep_elevation' | 'door_opening' | 'pipe_beam_penetration';
  recommendedActions?: {
    label: string;
    applyType: 'apply_height' | 'add_annotation' | 'add_mep' | 'copy_specs';
    params?: Record<string, any>;
  };
}

export const CONSTRUCTION_DETAILS_DATABASE: ConstructionDetailItem[] = [
  // 1. 天花工程大樣與吊頂公規
  {
    id: 'cd-ceil-01',
    category: 'ceiling',
    categoryLabel: '天花吊頂大樣',
    name: '吊隱式空調降板與回風箱大樣',
    code: 'CD-CEIL-01',
    standardDimension: '降板標高 FL+230 cm (大樑淨高 FL+265 cm)',
    toleranceRange: '降板深度 ≥30~35 cm (滿足室內機與風箱高度)',
    description: '標準客變吊隱空調降板大樣。天花降板完成面為 230cm，上方保留 35cm 穿風管、冷媒管保溫層與排水坡度。',
    cadLayer: 'CEILING_STEP_230',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '天花完成面標高', value: 'FL+230 cm' },
      { label: '空調檢修孔規格', value: '400 × 600 mm (鋁合金隱形框)' },
      { label: '出風/迴風口間距', value: '≥120 cm (防短循環)' },
      { label: '吊筋間距', value: '主龍骨 ≤90 cm，副龍骨 ≤35 cm' },
      { label: '封板規格', value: '日本麗仕矽酸鈣板 9mm 雙層錯縫' },
    ],
    criticalGotchas: [
      '穿梁套管需距梁底與梁頂各 1/3 梁高以上，嚴禁洗孔切斷大梁受拉主筋。',
      '冷媒銅管轉彎半徑 R ≥ 10cm，嚴禁直角硬折造成壓折節流。',
      '冷凝水排水管必須保持 1/100 洩水坡度，並落實通水測試 30 分鐘防溢流。',
    ],
    svgDiagramType: 'ceiling_drop',
    recommendedActions: {
      label: '套用降板高程 FL+230 cm 至當前空間',
      applyType: 'apply_height',
      params: { ceilingDrop: 230, beamHeight: 265 },
    },
  },
  {
    id: 'cd-ceil-02',
    category: 'ceiling',
    categoryLabel: '天花吊頂大樣',
    name: '客廳/臥室間接照明反光燈槽大樣',
    code: 'CD-CEIL-02',
    standardDimension: '燈槽開口寬 12~15 cm，擋光立板高 8~10 cm',
    toleranceRange: '進光角度 45°~60°',
    description: '洗牆式柔光間接反光燈槽大樣，搭配 LED 雙色溫軟燈條，上方預留粉刷防塵凹槽與清潔口。',
    cadLayer: 'CEILING_COVE_LIGHT',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '出光開口寬度', value: '150 mm' },
      { label: '前擋光板高度', value: '80 mm' },
      { label: '燈帶安裝基面', value: '反光白色斜切夾板 45°' },
      { label: '燈槽距頂淨空', value: '≥15 cm (光線擴散均勻)' },
      { label: '變壓器安置位置', value: '空調檢修孔上方或獨立通風電箱' },
    ],
    criticalGotchas: [
      '擋光板內側必須批土刷純白平光漆，不可露底漆以免造成出光斑駁暗影。',
      '變壓器切勿直接悶在無散熱空間之封閉燈槽內，以免過熱斷電或閃爍。',
    ],
    svgDiagramType: 'cove_lighting',
    recommendedActions: {
      label: '加入反光燈槽虛擬標註點',
      applyType: 'add_annotation',
      params: { label: '間接照明反光燈槽 (開口15cm/擋板8cm)', elevation: 230 },
    },
  },
  {
    id: 'cd-ceil-03',
    category: 'ceiling',
    categoryLabel: '天花吊頂大樣',
    name: '雙層防漏光窗簾盒大樣 (雙軌蛇行簾)',
    code: 'CD-CEIL-03',
    standardDimension: '淨深 20~25 cm，淨高 15~20 cm',
    toleranceRange: '離窗框邊緣 ≥5 cm',
    description: '滿足布簾＋紗簾（蛇形簾）波浪弧度所需進深，預留電動窗簾插座 FL+230cm 與電源出線孔。',
    cadLayer: 'CEILING_CURTAIN_BOX',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '單軌窗簾盒淨深', value: '150 mm' },
      { label: '雙軌蛇行簾淨深', value: '220 ~ 250 mm' },
      { label: '窗簾盒下垂高度', value: '150 mm (遮掩軌道與吊鉤)' },
      { label: '電動窗簾電源', value: '110V 專用插座（左右任選一側離牆 10cm）' },
    ],
    criticalGotchas: [
      '若選用蛇行簾，深度未達 20cm 將導致前後布簾摩擦擠壓無法順暢滑動。',
      '窗簾盒頂部受力板材必須使用 6 分厚芯夾板，嚴禁直接鎖在石膏板上。',
    ],
    svgDiagramType: 'curtain_box',
    recommendedActions: {
      label: '加入窗簾盒放樣標註',
      applyType: 'add_annotation',
      params: { label: '雙軌蛇行簾盒 (深22cm/高15cm)', elevation: 230 },
    },
  },

  // 2. 櫥櫃與人體工學公規
  {
    id: 'cd-cab-01',
    category: 'cabinet',
    categoryLabel: '櫥櫃人體工學',
    name: '玄關多功能鞋櫃與懸空掃地機槽大樣',
    code: 'CD-CAB-01',
    standardDimension: '總深度 35~40 cm，懸空高度 FL+18~20 cm',
    toleranceRange: '層板間距 15~20 cm (靴位 35~45 cm)',
    description: '玄關標準人體工學鞋櫃，下層懸空內嵌感應夜燈與掃地機器人基座插座，中段留白置物檯面 FL+80~100cm。',
    cadLayer: 'CABINET_SHOE_RACK',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '鞋櫃外部總進深', value: '380 mm (淨內深 350 mm)' },
      { label: '下層懸空離地高度', value: '180 ~ 200 mm' },
      { label: '中段置物端景高度', value: 'FL+800 ~ 1100 mm (檯面寬 300 mm)' },
      { label: '活動層板間隔', value: '160 mm (打排孔可自由微調)' },
      { label: '通風孔配置', value: '頂板或踢腳板後方預留 Ø50mm 透氣網' },
    ],
    criticalGotchas: [
      '男鞋大尺碼（US 11/12）淨長達 31cm，鞋櫃淨內深若小於 33cm 門扇將無法闔上。',
      '掃地機器人若具自動上下水功能，櫃體後方需預留給水管（4分）與排水管（1.2吋）。',
    ],
    svgDiagramType: 'shoe_cabinet',
    recommendedActions: {
      label: '套用核心立面基準 FL+80 cm',
      applyType: 'apply_height',
      params: { datum80: 80 },
    },
  },
  {
    id: 'cd-cab-02',
    category: 'cabinet',
    categoryLabel: '櫥櫃人體工學',
    name: '廚房流理台與中島人體工學檯面',
    code: 'CD-CAB-02',
    standardDimension: '檯面標高 FL+85~90 cm (高度 = 身高/2 + 5cm)',
    toleranceRange: '檯面進深 60 cm，吊櫃底高 FL+155 cm',
    description: '符合黃金人體工學防腰酸操作檯面。水槽區建議 FL+88cm，瓦斯爐熱炒區建議 FL+82cm（高低檯面設計）。',
    cadLayer: 'CABINET_KITCHEN',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '標準流理台高度', value: 'FL+850 ~ 900 mm' },
      { label: '檯面工作進深', value: '600 mm' },
      { label: '吊櫃進深', value: '350 mm (防碰頭)' },
      { label: '吊櫃與檯面淨距', value: '650 ~ 700 mm' },
      { label: '排油煙機進風距爐面', value: '650 ~ 700 mm (電磁爐可降至 600 mm)' },
    ],
    criticalGotchas: [
      '高低差銜接處人造石或賽麗石需作 45° 倒角或立面一體無縫拼接，嚴禁漏打防水填縫膠。',
      '廚房水槽排水口標高須在 FL+40cm 以下，避免洗碗機/排水管逆流倒灌。',
    ],
    svgDiagramType: 'kitchen_counter',
    recommendedActions: {
      label: '加入廚房檯面標高 (FL+85cm)',
      applyType: 'add_annotation',
      params: { label: '廚房料理檯面人體工學 (FL+85cm)', elevation: 85 },
    },
  },
  {
    id: 'cd-cab-03',
    category: 'cabinet',
    categoryLabel: '櫥櫃人體工學',
    name: '客廳電視懸空矮櫃與壁掛視聽管線',
    code: 'CD-CAB-03',
    standardDimension: '矮櫃檯面標高 FL+40~45 cm，進深 40~45 cm',
    toleranceRange: '電視中心線 FL+105~110 cm',
    description: '電視壁掛影音通道大樣，內埋 Ø50mm PVC 預埋管，確保 HDMI、電源線與光纖全部隱藏不露線。',
    cadLayer: 'CABINET_TV_WALL',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '電視矮櫃高度', value: 'FL+400 ~ 450 mm (坐姿平視無壓迫)' },
      { label: '電視中心離地高', value: 'FL+1050 ~ 1100 mm (人坐沙發視線落點)' },
      { label: '入牆穿線管管徑', value: 'Ø50 mm 斜角埋設 (兩端附護線蓋)' },
      { label: '視聽專用電源', value: '4 組獨立迴路 110V 降噪插座' },
    ],
    criticalGotchas: [
      '電視牆若為輕鋼架隔間，壁掛架受力區域必須加裝 6 分多層板或加封防震鐵板。',
      'Ø50 走線管嚴禁直角 90° 彎折，必須使用兩個 45° 彎頭或喇叭口，否則 HDMI 線頭無法穿過。',
    ],
    svgDiagramType: 'tv_cabinet',
    recommendedActions: {
      label: '加入電視矮櫃立面基準標註',
      applyType: 'add_annotation',
      params: { label: '電視懸空矮櫃 (高45cm/電視中心FL+105cm)', elevation: 45 },
    },
  },
  {
    id: 'cd-cab-04',
    category: 'cabinet',
    categoryLabel: '櫥櫃人體工學',
    name: '主臥室衣櫃與內部收納分區大樣',
    code: 'CD-CAB-04',
    standardDimension: '衣櫃淨深 60 cm (含門 65 cm)',
    toleranceRange: '頂部與梁底收邊 ≥10 cm',
    description: '主臥全高衣櫃收納大樣。長大衣區、短襯衫雙層區、抽屜斗櫃與頂層換季棉被收納分區標準。',
    cadLayer: 'CABINET_WARDROBE',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '對開門衣櫃淨深', value: '600 mm' },
      { label: '推拉滑門衣櫃淨深', value: '650 mm (滑軌佔 80 mm)' },
      { label: '長大衣吊掛淨高', value: '1400 ~ 1500 mm' },
      { label: '短襯衫吊掛淨高', value: '900 ~ 1000 mm (上下雙層)' },
      { label: '最高吊衣桿標高', value: 'FL+1850 ~ 1900 mm (單手平舉可及)' },
    ],
    criticalGotchas: [
      '深度若小於 55cm，西裝衣架斜放會卡住門片，造成門板變形或無法順暢閉合。',
      '上方若遇大梁（梁下 265cm），衣櫃頂部封板需留維修收縮縫 10mm 防止地震沉陷擠壓。',
    ],
    svgDiagramType: 'wardrobe',
    recommendedActions: {
      label: '加入衣櫃深度 60cm 放樣標註',
      applyType: 'add_annotation',
      params: { label: '標準主臥全高衣櫃 (淨深60cm/高265cm)', elevation: 265 },
    },
  },

  // 3. 水電弱電標準標高與安全間隙 (MEP Standards)
  {
    id: 'cd-mep-01',
    category: 'mep',
    categoryLabel: '水電弱電公規',
    name: '全室開關、插座與弱電出口公規標高表',
    code: 'CD-MEP-01',
    standardDimension: '一般插座 FL+30 cm、照明開關 FL+120 cm',
    toleranceRange: '廚房檯面插座 FL+105 cm、床頭插座 FL+65 cm',
    description: '全室建築電氣標準標高體系。嚴格依照人體工學手勢落點與家具高度聯動設計。',
    cadLayer: 'MEP_ELEVATION_SPECS',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '室內一般插座', value: 'FL+300 mm (踢腳板上方)' },
      { label: '照明開關面板', value: 'FL+1200 mm (離門框邊 150 mm)' },
      { label: '廚房料理檯面插座', value: 'FL+1050 mm (高於檯面 150 mm)' },
      { label: '床頭兩側便利插座', value: 'FL+650 ~ 700 mm (高於床頭櫃 100 mm)' },
      { label: '冷氣室內機出線孔', value: 'FL+2100 ~ 2200 mm' },
      { label: '壁掛電視後方插座', value: 'FL+1050 ~ 1100 mm (隱藏於電視後)' },
      { label: '衛浴防濺插座', value: 'FL+1300 mm (防水蓋附漏電斷路保護)' },
    ],
    criticalGotchas: [
      '強電（110V/220V）與弱電（Cat6網路/電視同軸）插座底盒間距嚴禁小於 15cm，平行配管間距 ≥30cm。',
      '開關位置絕不可藏在門扇後方，開門方向與開關需在同一側。',
      '廚房與衛浴插座必須配置獨立迴路漏電斷路器 (RCBO 30mA 0.1秒)。',
    ],
    svgDiagramType: 'mep_elevation',
    recommendedActions: {
      label: '加入標準開關 (FL+120cm) 與插座 (FL+30cm)',
      applyType: 'add_mep',
      params: { switchElevation: 120, socketElevation: 30 },
    },
  },

  // 4. 門窗與開口尺度大樣
  {
    id: 'cd-door-01',
    category: 'door_window',
    categoryLabel: '門窗開口公規',
    name: '標準室內門、衛浴門與開口結構門斗大樣',
    code: 'CD-DOOR-01',
    standardDimension: '室內門洞 90 × 210 cm、衛浴門洞 75 × 200 cm',
    toleranceRange: '門套厚度 10~15 cm，梁底淨空 ≥15 cm',
    description: '標準工程門洞預留尺寸與門斗木作收邊大樣。上方預留過梁或木作加強支撐，確保關門震動不震裂牆體。',
    cadLayer: 'DOOR_WINDOW_DETAILS',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '臥室房間門洞規格', value: '900 × 2100 mm (扇寬 820 mm)' },
      { label: '衛浴廁所門洞規格', value: '750 × 2000 mm (扇寬 670 mm)' },
      { label: '玄關子母大門規格', value: '1100 × 2200 mm' },
      { label: '乾濕分離門檻高度', value: 'FL+20 ~ 30 mm (止水墩人造石)' },
      { label: '門頂離梁底預留', value: '≥150 mm (供門斗固定與天花包覆)' },
    ],
    criticalGotchas: [
      '地磚貼完後的完成面高度需提前抓準，若地坪增高 3cm 會導致門扇卡地刮傷。',
      '衛浴門檻下方必須先施作一體式「止水墩 (Water Dam)」，再做防水塗層，嚴禁水氣沿地磚夾層滲出走道。',
    ],
    svgDiagramType: 'door_opening',
    recommendedActions: {
      label: '檢查門洞尺寸與梁底間距',
      applyType: 'add_annotation',
      params: { label: '標準門洞 (90×210cm / 梁下間距≥15cm)', elevation: 215 },
    },
  },

  // 5. 施工特別注意事項與現場避坑秘笈
  {
    id: 'cd-gotcha-01',
    category: 'gotchas',
    categoryLabel: '結構避坑守則',
    name: '結構梁體穿孔洗管與水電套管禁忌守則',
    code: 'CD-GOTCHA-01',
    standardDimension: '洗孔位置限定在梁中段 1/3，兩端 1/3 絕對禁洗',
    toleranceRange: '孔徑 ≤ 梁高 1/3，相鄰孔距 ≥ 3倍孔徑',
    description: '結構工程驗收極高風險點！大梁兩端剪力最大，嚴禁洗孔切斷箍筋與拉力筋，違者影響全棟抗震安全。',
    cadLayer: 'STRUCTURAL_BEAM_CODE',
    rule5MultipleCompatible: true,
    keySpecs: [
      { label: '大梁禁洗區域', value: '支座兩端各 1/3 梁長範圍內 (剪力最大)' },
      { label: '允許可洗區域', value: '梁中間 1/3 範圍內，且在梁高中心線上' },
      { label: '最大允許孔徑', value: '≤ 梁深度 1/3 (例如 60cm 大梁最大開 Ø18cm)' },
      { label: '套管補強工法', value: '加焊 #4 斜向 45° 菱形補強鋼筋 4 支' },
    ],
    criticalGotchas: [
      '水電師傅洗孔前必須使用牆體雷達掃描主筋位置，嚴禁盲洗切斷結構主鋼筋！',
      '冷氣冷媒管與排水管盡量利用「假樑降板」走管，非必要絕對不洗結構大梁。',
    ],
    svgDiagramType: 'pipe_beam_penetration',
    recommendedActions: {
      label: '標示大梁剪力禁洗區',
      applyType: 'add_annotation',
      params: { label: '大梁兩端 1/3 剪力區嚴禁洗孔！', elevation: 265 },
    },
  },
];
