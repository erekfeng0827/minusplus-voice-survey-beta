export interface CadLayerSpec {
  name: string;
  category: string;
  drawingType: string;
  colorAci: number;
  colorHex: string;
  linetype: string;
  lineweightMm: number;
  description: string;
  starMoonBayRule: string;
}

export interface SheetStandardCategory {
  id: string;
  sheetCode: string;
  sheetTitle: string;
  purpose: string;
  drawingHabitRules: string[];
  layers: CadLayerSpec[];
}

export const CAD_SHEET_STANDARDS: SheetStandardCategory[] = [
  // 1. 水電圖 (MEP Power & Plumbing)
  {
    id: 'mep_plan',
    sheetCode: 'E-01 / P-01',
    sheetTitle: '水電配置與插座給排水圖',
    purpose: '標註全室強電插座、專用迴路、弱電網路、冷熱水管出牆位置與地板排水孔',
    drawingHabitRules: [
      '強電插座文字標註符號統一標明離地淨高 (例如: H+30, H+110, H+220)。',
      '220V 專用迴路以雙圈加粗紅色標示，與一般 110V 插座明確區隔。',
      '給水出水口標註冷水(藍)與熱水(紅)，間距嚴格遵守 15cm (符合 5 倍數)。',
      '地排水管直徑以 Ø 標示 (例如: Ø2", Ø3")，附洩水坡度 1/100 箭頭。',
    ],
    layers: [
      {
        name: 'E-POWR-SOCKET',
        category: '電氣強電',
        drawingType: '水電圖',
        colorAci: 1, // Red
        colorHex: '#ef4444',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '一般 110V 插座、防濺插座圖元符號',
        starMoonBayRule: '離地 30cm/110cm，符合 5 倍數標註',
      },
      {
        name: 'E-POWR-SPEC220',
        category: '電氣強電',
        drawingType: '水電圖',
        colorAci: 30, // Orange
        colorHex: '#f97316',
        linetype: 'Continuous',
        lineweightMm: 0.5,
        description: '220V 專用迴路 (廚房IH爐、冷氣室外機、瞬熱熱水器)',
        starMoonBayRule: '線徑 5.5mm²，獨立無熔絲開關標記',
      },
      {
        name: 'E-COMM-DATA',
        category: '電氣弱電',
        drawingType: '水電圖',
        colorAci: 5, // Blue
        colorHex: '#3b82f6',
        linetype: 'Continuous',
        lineweightMm: 0.3,
        description: 'Cat6 網路插座、光纖管位、電視同軸電纜',
        starMoonBayRule: '與強電管路維持 ≥30cm 防電磁干擾間距',
      },
      {
        name: 'P-WATR-SUPPLY',
        category: '給水管道',
        drawingType: '水電圖',
        colorAci: 4, // Cyan
        colorHex: '#06b6d4',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '冷熱水出水口、三角凡爾閥門出牆位',
        starMoonBayRule: '離地高程符合衛廚 FL+215cm 降板基準',
      },
      {
        name: 'P-WATR-DRAIN',
        category: '排水管道',
        drawingType: '水電圖',
        colorAci: 6, // Magenta
        colorHex: '#ec4899',
        linetype: 'DASHED2',
        lineweightMm: 0.35,
        description: '地板排水孔、存水彎、糞管 Ø4" 軸心定位',
        starMoonBayRule: '距結構牆體維持 20cm/25cm 標準放樣模數',
      },
    ],
  },

  // 2. 索引圖 (Key / Index Plan)
  {
    id: 'index_plan',
    sheetCode: 'G-01',
    sheetTitle: '平面索引與圖紙目錄圖',
    purpose: '標註空間房間代號、立面圖切面索引符號 (A~D)、施工大樣索引標籤及軸網',
    drawingHabitRules: [
      '立面剖面指標箭頭以 45° 正交等角三角形標註，內含圖號與張號 (例: 01/A-03)。',
      '建物軸網編號橫向為 1, 2, 3...，縱向為 A, B, C...，圈直徑 10mm。',
      '圖紙比例尺標準為 1:50 或 1:30，字高尺寸依 A3 出圖比例如實設定。',
    ],
    layers: [
      {
        name: 'G-ANNO-TITL',
        category: '圖面註記',
        drawingType: '索引圖',
        colorAci: 7, // White
        colorHex: '#ffffff',
        linetype: 'Continuous',
        lineweightMm: 0.5,
        description: '圖框、圖名、北向針、比例尺文字',
        starMoonBayRule: '專案統一標籤字型規範',
      },
      {
        name: 'G-ANNO-SECT',
        category: '圖面索引',
        drawingType: '索引圖',
        colorAci: 2, // Yellow
        colorHex: '#eab308',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '立面剖面索引標記符號 (視角引線與圈號)',
        starMoonBayRule: '四面立面完整索引，絕無遺漏視埠',
      },
      {
        name: 'G-GRID-AXIS',
        category: '建築軸網',
        drawingType: '索引圖',
        colorAci: 8, // Gray
        colorHex: '#64748b',
        linetype: 'CENTER2',
        lineweightMm: 0.18,
        description: '建築柱心與結構牆體中心定位軸線',
        starMoonBayRule: '鎖定結構原點 (0,0,0)',
      },
    ],
  },

  // 3. 燈具回路圖 (Lighting & Switch Circuit Plan)
  {
    id: 'lighting_plan',
    sheetCode: 'L-01',
    sheetTitle: '燈具配置與開關回路控制圖',
    purpose: '標註燈具種類、色溫、開關迴路控制線路 (單切/雙切) 及情境控制器',
    drawingHabitRules: [
      '開關控制線以雙點劃弧線或細虛線連接開關至對應燈具群組。',
      '開關面板標註 a, b, c... 字母代號對應各燈具組回路編號。',
      '崁燈開孔尺寸標明 Ø7.5cm / Ø9.5cm，與梁邊保持 ≥25cm 距離避讓投影陰影。',
      '雙切開關特別標示 3-Way 符號，門口與床頭連動聯控。',
    ],
    layers: [
      {
        name: 'L-LITE-FIXT',
        category: '燈具本體',
        drawingType: '燈具回路圖',
        colorAci: 2, // Yellow
        colorHex: '#facc15',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '崁燈、投射射燈、吸頂主燈、吊燈符號圖塊',
        starMoonBayRule: '間距以 5 倍數排列，對齊天花板分割縫',
      },
      {
        name: 'L-LITE-CIRC',
        category: '控制回路',
        drawingType: '燈具回路圖',
        colorAci: 3, // Green
        colorHex: '#22c55e',
        linetype: 'HIDDEN2',
        lineweightMm: 0.18,
        description: '開關至燈具回路虛擬連接線',
        starMoonBayRule: '迴路不得跨越防爆防火門區分區',
      },
      {
        name: 'L-LITE-SWCH',
        category: '控制開關',
        drawingType: '燈具回路圖',
        colorAci: 1, // Red
        colorHex: '#ef4444',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '單切、雙切、調光開關面板符號 (離地 H+120cm)',
        starMoonBayRule: '位於門把手開啟側距門框 15cm (符合 5 倍數)',
      },
      {
        name: 'L-LITE-COVE',
        category: '間接燈帶',
        drawingType: '燈具回路圖',
        colorAci: 40, // Amber
        colorHex: '#fbbf24',
        linetype: 'Continuous',
        lineweightMm: 0.3,
        description: '反光燈槽 LED 燈條連續線',
        starMoonBayRule: '位於 FL+230cm 降板邊緣，無眩光遮光',
      },
    ],
  },

  // 4. 空調配置圖 (HVAC Layout Plan)
  {
    id: 'hvac_plan',
    sheetCode: 'M-01',
    sheetTitle: '空調冷熱通風配置計畫圖',
    purpose: '標註吊隱式/壁掛式冷氣主機、保溫軟風管、線型出回風口、冷媒排水管及穿梁套管',
    drawingHabitRules: [
      '室內機以雙對角斜線方塊標示，標記冷房能力 (例: 5.0kW / 4500kcal)。',
      '冷媒管走梁底需嚴格遵守梁下淨高 265cm 避讓原則，不鑽孔破壞主梁鋼筋。',
      '冷凝水排水管以洋紅色點劃線標示，坡度 ≥ 1/100 連接至鄰近排水立管。',
      '線控開關配置於視線等高處 FL+130cm。',
    ],
    layers: [
      {
        name: 'M-HVAC-EQUP',
        category: '空調設備',
        drawingType: '空調配置圖',
        colorAci: 4, // Cyan
        colorHex: '#06b6d4',
        linetype: 'Continuous',
        lineweightMm: 0.5,
        description: '吊隱室內機、壁掛室內機、全熱交換器輪廓',
        starMoonBayRule: '頂高避開原樓板 280cm，懸吊高程在 255cm',
      },
      {
        name: 'M-HVAC-DUCT',
        category: '保溫風管',
        drawingType: '空調配置圖',
        colorAci: 5, // Blue
        colorHex: '#3b82f6',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '出風回風保溫鋁箔軟管、消音風箱',
        starMoonBayRule: '管徑符合風速 ≤ 3m/s 低噪標準',
      },
      {
        name: 'M-HVAC-DIFF',
        category: '風口散流器',
        drawingType: '空調配置圖',
        colorAci: 2, // Yellow
        colorHex: '#eab308',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '線型散流出風口、格柵回風口 (長度 120cm)',
        starMoonBayRule: '設置於 FL+230cm 降板面，避開衣櫃直射',
      },
      {
        name: 'M-HVAC-PIPE',
        category: '冷媒排水管',
        drawingType: '空調配置圖',
        colorAci: 6, // Magenta
        colorHex: '#d946ef',
        linetype: 'DASHDOT',
        lineweightMm: 0.25,
        description: '保溫銅管組與 PVC 冷凝水排水管',
        starMoonBayRule: '坡度 1/100，無局部凹陷防溢水',
      },
    ],
  },

  // 5. 拆除圖 (Demolition Plan)
  {
    id: 'demo_plan',
    sheetCode: 'D-01',
    sheetTitle: '原有隔間牆體與門窗拆除計畫圖',
    purpose: '標註敲除牆體、保留結構梁柱、舊有門窗清運及管線盲封點',
    drawingHabitRules: [
      '所有欲敲除之牆體以紅色粗虛線加 45° 斜剖面線填滿標註。',
      '嚴禁拆除任何 RC 結構剪力牆與承重柱，圖面加註「★ 結構承重嚴禁敲除」。',
      '原有水電管路切除後以水泥高壓灌漿盲封，並標明清運廢棄物噸數估算。',
    ],
    layers: [
      {
        name: 'D-WALL-DEMO',
        category: '拆除項目',
        drawingType: '拆除圖',
        colorAci: 1, // Red
        colorHex: '#dc2626',
        linetype: 'DASHED2',
        lineweightMm: 0.5,
        description: '拆除磚牆、輕隔間紅虛線邊界與斜陰影填充',
        starMoonBayRule: '確認非結構剪力牆，無損抗震性能',
      },
      {
        name: 'D-DOOR-DEMO',
        category: '拆除項目',
        drawingType: '拆除圖',
        colorAci: 10, // Bright Red
        colorHex: '#f87171',
        linetype: 'DASHED',
        lineweightMm: 0.35,
        description: '原有木門、舊鋁門窗框剔除清運',
        starMoonBayRule: '門洞若擴大需補強門楣過梁',
      },
      {
        name: 'D-WALL-KEEP',
        category: '保留結構',
        drawingType: '拆除圖',
        colorAci: 8, // Gray
        colorHex: '#475569',
        linetype: 'Continuous',
        lineweightMm: 0.25,
        description: '保留不拆之主結構柱、外牆與分戶牆',
        starMoonBayRule: '維持原始建築基底',
      },
    ],
  },

  // 6. 地板計畫圖 (Flooring Finish Plan)
  {
    id: 'floor_plan',
    sheetCode: 'F-01',
    sheetTitle: '地坪鋪面材質與分割起鋪計畫圖',
    purpose: '標註木地板方向、磁磚分割起鋪點 (Base Point)、門檻石收邊及地坪高程差',
    drawingHabitRules: [
      '明確繪出地磚起鋪點箭頭「⌖ 起鋪點」，避免門口或玄關出現小於 5cm 碎磚。',
      '不同地坪材質交接處標註起步條收邊型號 (例: 黑色鋁質一字壓條)。',
      '各區域標記完成面高程 (例: 玄關 FL±0，室內客廳 FL+1.5cm，衛浴 FL-2.0cm 降板)。',
    ],
    layers: [
      {
        name: 'F-FLOR-PATT',
        category: '地坪面材',
        drawingType: '地板計畫圖',
        colorAci: 8, // Gray
        colorHex: '#94a3b8',
        linetype: 'Continuous',
        lineweightMm: 0.18,
        description: '超耐磨木地板拼花線、大板磚 60×120 分割網格',
        starMoonBayRule: '符合人行順向視覺動線',
      },
      {
        name: 'F-FLOR-TRAN',
        category: '過渡收口',
        drawingType: '地板計畫圖',
        colorAci: 3, // Green
        colorHex: '#16a34a',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '門檻石、人字拼過渡收邊條、不鏽鋼分隔條',
        starMoonBayRule: '位於門扇厚度中心點下，閉門時完全隱形',
      },
      {
        name: 'F-FLOR-LEVL',
        category: '高程標註',
        drawingType: '地板計畫圖',
        colorAci: 7, // White
        colorHex: '#ffffff',
        linetype: 'Continuous',
        lineweightMm: 0.3,
        description: '地坪高程標高符號 (▼ FL±0.0, ▼ FL-1.5)',
        starMoonBayRule: '衛浴洩水防溢流，符合乾濕分離規範',
      },
    ],
  },

  // 7. 天花板計畫圖 (Reflected Ceiling Plan - RCP)
  {
    id: 'ceiling_plan',
    sheetCode: 'C-01',
    sheetTitle: '反射天花板高程與造型計畫圖',
    purpose: '標註各區天花淨高 (CH)、降板高程、間接照明反光槽、維修孔位及窗簾盒',
    drawingHabitRules: [
      '每個天花板獨立區塊必須標註淨高圈記 (例: ⊚ CH: 265, ⊚ CH: 230)。',
      '降板交界處以粗實線標明斷面高差，並引線備註「高差 35cm 間接燈槽」。',
      '檢修孔位預留 60×60cm，標註於最隱蔽視角但維修人員可及處。',
    ],
    layers: [
      {
        name: 'C-CEIL-STEP',
        category: '天花造型',
        drawingType: '天花板計畫圖',
        colorAci: 30, // Orange
        colorHex: '#f59e0b',
        linetype: 'Continuous',
        lineweightMm: 0.5,
        description: '空調/衛浴降板輪廓線 (FL+230 / FL+215cm)',
        starMoonBayRule: '全面符合《降板裁決_v003》規範高程',
      },
      {
        name: 'C-CEIL-GRID',
        category: '平釘骨架',
        drawingType: '天花板計畫圖',
        colorAci: 9, // Light Gray
        colorHex: '#cbd5e1',
        linetype: 'Continuous',
        lineweightMm: 0.25,
        description: '主天花平釘區 (FL+265cm 梁下淨高平齊)',
        starMoonBayRule: '骨架吊筋間距 @90cm，抗震防晃',
      },
      {
        name: 'C-CEIL-INSP',
        category: '維修檢修',
        drawingType: '天花板計畫圖',
        colorAci: 6, // Magenta
        colorHex: '#c026d3',
        linetype: 'DASHED',
        lineweightMm: 0.35,
        description: '600×600mm 鋁合金天花檢修孔',
        starMoonBayRule: '對齊冷氣濾網與吊隱排水閥',
      },
      {
        name: 'C-CEIL-CURT',
        category: '窗簾盒',
        drawingType: '天花板計畫圖',
        colorAci: 4, // Cyan
        colorHex: '#0891b2',
        linetype: 'Continuous',
        lineweightMm: 0.35,
        description: '窗簾盒深度 220mm 雙軌造型區',
        starMoonBayRule: '預留 110V 智能窗簾電源插座',
      },
    ],
  },
];
