export interface DetailDrawing {
  id: string;
  category: 'CEILING' | 'HVAC' | 'JOINERY' | 'LIGHTING' | 'BATHROOM';
  title: string;
  subTitle: string;
  contractClause: string;
  targetElevation: number; // e.g. 230, 265, 215
  description: string;
  materials: string[];
  constructionNotes: string[];
  cadLayers: string[];
  svgDiagramType:
    | 'COVE_LIGHT'
    | 'SHADOW_GAP'
    | 'STEPPED_SLOT'
    | 'CURVED_BEAM'
    | 'AC_SIDE_DISCHARGE'
    | 'AC_INSPECTION_SLOT'
    | 'CURTAIN_AC_BOX'
    | 'MAGNETIC_TRACK'
    | 'GLASS_PARTITION'
    | 'BATH_DROP_WATERPROOF'
    | 'SUSPENDED_TV_WALL';
}

export const DETAIL_DRAWINGS_LIBRARY: DetailDrawing[] = [
  // CEILING DETAILS
  {
    id: 'DETAIL-CEIL-01',
    category: 'CEILING',
    title: '間接照明反光燈槽天花大樣',
    subTitle: '客廳降板區 FL+230cm 與主天花交界',
    contractClause: '《降板裁決_v003》第 4 條：空調降板 230cm 模數化反光收邊',
    targetElevation: 230,
    description: '木作防腐角材搭配 12mm 日本麗仕矽酸鈣板，內凹 120mm×100mm 反光燈槽，立面檔板高 50mm 形成 45° 完美防眩光斜切反光面。',
    materials: [
      '防腐木角材 1.2寸 × 1寸 (間距 @30cm)',
      '12mm 矽酸鈣板 (耐燃一級)',
      '高顯色 LED 軟條燈帶 (2700K~3000K, 12W/m)',
      '鋁擠型散熱凹槽與霧面擴散罩',
      '接縫處高抗裂玻璃纖維網抗裂批土',
    ],
    constructionNotes: [
      '燈槽出光面應維持平整，內側噴塗消光白漆以提升漫射均勻度。',
      'LED 變壓器預留在維修孔易檢修處，每 5 米配置一個獨立電源迴路。',
      '降板下緣與牆面交界處預留 5mm 伸縮微縫。',
    ],
    cadLayers: ['C-CEIL-STEP', 'C-CEIL-INDR', 'L-LITE-COVE', 'G-ANNO-DIMS'],
    svgDiagramType: 'COVE_LIGHT',
  },
  {
    id: 'DETAIL-CEIL-02',
    category: 'CEILING',
    title: '極簡 15mm 微邊陰角收邊天花大樣',
    subTitle: '梁底 FL+265cm 側貼平釘收邊',
    contractClause: '《降板裁決_v003》第 2 條：梁下 265cm 淨高過渡防裂節點',
    targetElevation: 265,
    description: '天花板與結構梁牆交接處採用 15×15mm 黑色陽極氧化鋁合金微邊陰角條，消弭因溫差熱脹冷縮引起的油漆交接面龜裂。',
    materials: [
      '輕鋼架 C型主副骨吊頂系統',
      '9mm 矽酸鈣板雙層錯縫鋪貼',
      '15×15mm 黑色消光鋁合金陰角收邊壓條',
      '防鏽膨脹螺栓與吊筋 (@90cm)',
    ],
    constructionNotes: [
      '鋁條固定前須以雷射墨線儀校正水平，允許誤差 ≤1mm。',
      '免打釘免膠水收邊，呈現極簡俐落懸浮陰影。',
    ],
    cadLayers: ['C-CEIL-GRID', 'C-CEIL-EDGE', 'G-ANNO-DIMS'],
    svgDiagramType: 'SHADOW_GAP',
  },
  {
    id: 'DETAIL-CEIL-03',
    category: 'CEILING',
    title: '雙層立體階梯天花造型大樣',
    subTitle: 'FL+250cm 過渡層至 FL+230cm 線型出風口',
    contractClause: '幾何契約 5 倍數原則 (280/265/250/230)',
    targetElevation: 230,
    description: '階梯狀雙層立體天花，第一層 FL+250cm，第二層 FL+230cm 內嵌無邊框超窄線型出風口 (Slot Diffuser)，拉高空間景深。',
    materials: [
      '雙層雙向鍍鋅鋼架主龍骨',
      '防潮矽酸鈣板 12mm',
      '無邊框鋁合金線型散流器 (長度 1200mm)',
      '靜音消音保溫棉 25mm',
    ],
    constructionNotes: [
      '兩階高差精確控制在 20cm (整除 5cm 模數)。',
      '出風口外框批土滿平，出風風向葉片預設向下 15° 導流。',
    ],
    cadLayers: ['C-CEIL-STEP', 'M-HVAC-DIFF', 'G-ANNO-DIMS'],
    svgDiagramType: 'STEPPED_SLOT',
  },
  {
    id: 'DETAIL-CEIL-04',
    category: 'CEILING',
    title: '弧形微彎過渡天花大樣 (梁下導圓角)',
    subTitle: '消弭客廳 FL+265cm 主梁壓迫視覺',
    contractClause: '建築室內人因工效學：梁柱曲面包覆與柔化照明',
    targetElevation: 265,
    description: '採用 R350mm 弧形彎曲高密度夾板打底，表面雙層 6mm 軟性曲面矽酸鈣板冷壓彎曲成形，使天花與大梁以優雅弧線一體過渡。',
    materials: [
      '雷射切割弧形木質定型肋骨 (R=350mm)',
      '雙層 6mm 彎曲矽酸鈣板',
      '彈性高延展抗裂原子灰',
      '微孔吸音減震墊',
    ],
    constructionNotes: [
      '肋骨間距不大於 20cm，確保曲率平滑無稜角斷層。',
      '表面批土須使用超微粒彈性抗裂膩子，防止弧頂微裂。',
    ],
    cadLayers: ['C-CEIL-CURV', 'S-BEAM-PROF', 'G-ANNO-DIMS'],
    svgDiagramType: 'CURVED_BEAM',
  },

  // HVAC DETAILS
  {
    id: 'DETAIL-HVAC-01',
    category: 'HVAC',
    title: '吊隱式冷氣「側吹側回」天花整合大樣',
    subTitle: '客廳降板 FL+230cm 線型出風與側回風',
    contractClause: '《降板裁決_v003》第 4 條：空調設備高度與吊筋減震規範',
    targetElevation: 230,
    description: '吊隱室內機頂部距原樓板留設 50mm 散熱維修空間，側向出風搭配雙層百葉線型出風口，回風箱設於底部側面，兼顧風量與極簡美觀。',
    materials: [
      '吊隱式變頻冷暖室內機 (厚度 200mm)',
      '四點防震彈簧減震吊架 (防震效率 ≥85%)',
      '阻燃玻璃棉保溫軟管 (Ø200mm, 鋁箔面包覆)',
      '線型無邊框雙層出風口 (1200mm × 150mm)',
      '可拆式可水洗尼龍初效防塵濾網',
    ],
    constructionNotes: [
      '冷媒管與排水管須具備 1/100 洩水坡度，嚴禁倒坡積水。',
      '出風軟管彎折半徑不小於風管直徑的 1.5 倍，避免風阻共振鳴響。',
    ],
    cadLayers: ['M-HVAC-EQUP', 'M-HVAC-DUCT', 'M-HVAC-DIFF', 'G-ANNO-DIMS'],
    svgDiagramType: 'AC_SIDE_DISCHARGE',
  },
  {
    id: 'DETAIL-HVAC-02',
    category: 'HVAC',
    title: '吊隱冷氣無邊框隱藏式檢修孔兼回風口大樣',
    subTitle: '600×600mm 磁吸式快拆複合面板',
    contractClause: '維護合約：天花隱蔽空間可檢修性 100% 達標',
    targetElevation: 230,
    description: '將冷氣回風濾網與檢修孔整合為單一面板，採用磁吸按壓式自彈開關，天花板表面無任何螺絲外露，保持極致平整度。',
    materials: [
      '高強度航空鋁合金無邊框副框',
      '內嵌 12mm 矽酸鈣面板 (與天花同批土同乳膠漆)',
      '釹鐵硼強磁吸附按壓彈簧閉鎖器 ×4',
      '不鏽鋼防墜安全鋼索',
    ],
    constructionNotes: [
      '檢修孔中心對齊室內機電控盒與濾網抽拉軸向。',
      '開口周圍天花角材須進行雙拼補強，避免開口下垂。',
    ],
    cadLayers: ['M-HVAC-INSP', 'C-CEIL-STEP', 'G-ANNO-DIMS'],
    svgDiagramType: 'AC_INSPECTION_SLOT',
  },
  {
    id: 'DETAIL-HVAC-03',
    category: 'HVAC',
    title: '窗簾盒結合冷氣降板出風口整合大樣',
    subTitle: '深度 220mm 雙軌電動窗簾盒 + FL+230cm 側出風',
    contractClause: '建築窗邊冷熱橋阻絕與幾何整合規範',
    targetElevation: 230,
    description: '窗邊整體下壓至 FL+230cm，外側留設 220mm 雙軌電動窗簾盒 (內含 110V 窗簾電機插座)，內側作為吊隱冷氣側吹出風口，視覺一體無死角。',
    materials: [
      '6分防潮實木多層夾板窗簾盒底板',
      '阻燃矽酸鈣立板 12mm',
      '預埋電動窗簾專用插座 (單聯 110V, 距頂 10cm)',
      '間接柔光洗簾燈帶 (2700K)',
    ],
    constructionNotes: [
      '窗簾盒深度不得小於 200mm，確保蛇形簾與布紗雙層滑動順暢。',
      '冷氣冷風吹出方向不得直吹窗簾布料，避免風吹晃動及冷凝水露滴。',
    ],
    cadLayers: ['C-CEIL-STEP', 'M-HVAC-DIFF', 'E-POWR-SOCKET', 'G-ANNO-DIMS'],
    svgDiagramType: 'CURTAIN_AC_BOX',
  },

  // LIGHTING DETAILS (NEW POPULAR EXPANSION)
  {
    id: 'DETAIL-LITE-01',
    category: 'LIGHTING',
    title: '極簡內嵌式磁吸軌道燈槽天花大樣',
    subTitle: '客餐廳主天花 FL+265cm 內嵌無邊框雙線軌道',
    contractClause: '現代豪宅無主燈設計：模組化 48V 安全低壓磁吸燈具規範',
    targetElevation: 265,
    description: '在矽酸鈣天花內預埋 35mm×55mm 黑色消光鋁合金無邊框預埋軌道，批土平齊天花表面。支援泛光條、折疊格柵燈與磁吸射燈自由滑移組合。',
    materials: [
      '預埋無邊框 48V 直流磁吸軌道 (寬 35mm, 深 55mm)',
      '超薄 100W 內置/外置恒壓開關電源 (藏於維修孔)',
      '雙層 9mm 矽酸鈣開槽抗裂收口',
      '低壓紫銅導電排條 (DC 48V 安全防觸電)',
    ],
    constructionNotes: [
      '天花開槽處必須以輕鋼副龍骨或角材雙側加固，嚴防長期使用開裂。',
      '變壓器至軌道最遠距離不超過 8 米，避免低壓直流壓降造成燈具頻閃。',
    ],
    cadLayers: ['L-LITE-TRAK', 'C-CEIL-GRID', 'E-POWR-TRANS', 'G-ANNO-DIMS'],
    svgDiagramType: 'MAGNETIC_TRACK',
  },

  // JOINERY / PARTITION DETAILS (NEW POPULAR EXPANSION)
  {
    id: 'DETAIL-JOIN-01',
    category: 'JOINERY',
    title: '極窄鋁框長虹玻璃推拉門天花預埋吊軌大樣',
    subTitle: '廚房與餐廳交界 FL+230cm / FL+265cm 梁下隱藏吊軌',
    contractClause: '空間通透與油煙阻絕：地坪無軌道全平懸吊系統',
    targetElevation: 230,
    description: '天花內部加固 100×50mm 鍍鋅方鋼管，底面預埋重型重載靜音吊軌與雙向油壓緩衝阻尼器，地面零軌道，掃地機器人暢行無阻。',
    materials: [
      '100×50×3.0mm 鍍鋅方鋼管主承重結構梁',
      '重型鋁合金隱藏式吊軌 (載重 ≥120kg)',
      '雙向油壓阻尼緩衝器 (雙向輕柔自動閉合)',
      '16mm 極窄消光黑鋁合金框 + 8mm 雙層夾膠長虹超白玻璃',
    ],
    constructionNotes: [
      '方鋼管兩端必須使用膨脹螺栓牢固錨固於兩側 RC 柱或剪力牆。',
      '門下緣與地磚完成面預留 8mm 縫隙，暗藏隱形導向地定位輪。',
    ],
    cadLayers: ['A-DOOR-SLID', 'S-STEL-BEAM', 'A-GLAS-PART', 'G-ANNO-DIMS'],
    svgDiagramType: 'GLASS_PARTITION',
  },

  // BATHROOM DETAILS (NEW POPULAR EXPANSION)
  {
    id: 'DETAIL-BATH-01',
    category: 'BATHROOM',
    title: '衛浴防潮鋁扣板降板與管線防水檢修大樣',
    subTitle: '廚衛降板 FL+215cm 配合上方污廢水管防結露',
    contractClause: '《降板裁決_v003》第 5 條：廚衛降板 215cm 防潮與存水彎維護',
    targetElevation: 215,
    description: '上方樓板吊管（Ø110mm 污廢管與存水彎）包覆隔音橡膠阻尼片，天花吊頂維持 FL+215cm，配置全封閉防潮抗氧化鋁扣板與多功能暖風機整合口。',
    materials: [
      '高平整度抗油污陽極氧化鋁扣板 300×300mm (厚度 0.8mm)',
      '全輕鋼三角龍骨與主骨系統',
      'Ø110mm PVC 排水管外覆阻尼丁基膠隔音氈 + 鋁箔防結露保溫棉',
      '四合一暖風乾燥機 (專用排風逆止閥與 110V/220V 專迴)',
    ],
    constructionNotes: [
      '天花完成面離地必須精確維持 FL+215cm，滿足乾濕分離玻璃拉門安裝高度。',
      '暖風機排風軟管長度控制在 1.5 米以內並做 1/50 外傾排水坡度，防止雨水倒灌。',
    ],
    cadLayers: ['C-CEIL-ALUM', 'P-PLUM-PIPE', 'M-HVAC-VENT', 'G-ANNO-DIMS'],
    svgDiagramType: 'BATH_DROP_WATERPROOF',
  },

  // LIVING ROOM JOINERY (NEW POPULAR EXPANSION)
  {
    id: 'DETAIL-JOIN-02',
    category: 'JOINERY',
    title: '客廳懸空電視大理石/薄板矮櫃與底光大樣',
    subTitle: '距地 FL+20cm 懸空安裝 + 內藏插座走線槽',
    contractClause: '現代簡約影音管線零外露與離地懸浮視覺規範',
    targetElevation: 0,
    description: '木作雙層夾板結構固定於後方 RC 牆，檯面覆貼 12mm 義大利雪山白岩板，櫃體底部懸空 20cm 內嵌 3000K 漫射底光，內部預設 Ø50mm 穿線管直通壁掛電視。',
    materials: [
      '6分柳安防潮多層夾板主櫃體',
      '12mm 霧面高抗污超薄岩板檯面',
      '高承載化學膨脹螺栓懸挑角鐵支撐 (承重 ≥200kg)',
      'Ø50mm PVC 影音穿線預埋蛇管 (穿 HDMI/光纖/電源線)',
      '底面 45° 斜切反光 LED 燈條槽 (3000K)',
    ],
    constructionNotes: [
      '懸空櫃後壁必須採用化學錨栓固定於承重牆體，不得直接固定於隔音輕隔間。',
      '所有強弱電插座內置於抽屜或翻門後方，外部視角無任何線路雜亂。',
    ],
    cadLayers: ['A-FURN-CABN', 'E-POWR-SOCK', 'L-LITE-STRIP', 'G-ANNO-DIMS'],
    svgDiagramType: 'SUSPENDED_TV_WALL',
  },
];

