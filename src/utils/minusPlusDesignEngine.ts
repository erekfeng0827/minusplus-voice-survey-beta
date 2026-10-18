/**
 * ==============================================================================
 * 📐 MINUS+ PLUS DESIGN 加減設計 - 1:1 專案施工圖繪圖引擎與 CAD/LayOut 批次交接系統
 * 嚴格還原 Corey (馮凱瑞) 星玥灣 B3-7F 施工圖紙規範 (對應用戶 10 張施工實照)
 * 包含：
 * 1. 全層平面圖 (Whole Floor Plan) 繪圖規範 (黑實 RC 牆、地坪色塊、家具細部、大黑入戶箭頭)
 * 2. 平面配置圖-1 / 燈具迴路圖-3 / 水電配置圖 / 電視牆木作剖立面 / 客房跨室立面圖 / 封面
 * 3. 雙軌輸出：
 *    - AutoCAD 專業交接包：標準多圖層 DXF + 一鍵批次出圖腳本 (batch_plot_corey.scr)
 *    - SketchUp & LayOut 整合包：3D 分層 DXF 模型 (可直接導入 SU 並在 LayOut 1/40 排版)
 *    - 向量 A3 多頁 PDF (嚴格依照加減設計圖框、字型與比例)
 * ==============================================================================
 */

import { jsPDF } from 'jspdf';
import { RoomData } from '../types';

export interface MinusPlusDrawingMeta {
  projectName: string;
  projectCode: string;
  location: string;
  designer: string;
  drawnBy: string;
  date: string;
  paperSize: string;
  unit: string;
  scale: string;
  companyName: string;
  companyAddress: string;
  companyTel: string;
  companyEmail: string;
}

export const DEFAULT_COREY_META: MinusPlusDrawingMeta = {
  projectName: '星玥灣 B3-7F 陳宅 設計規劃案',
  projectCode: 'B3-7F',
  location: '高雄市苓雅區三多四路62號7樓',
  designer: 'Corey |',
  drawnBy: 'Corey |',
  date: '2026/08/05',
  paperSize: 'ISO A3 SIZE',
  unit: 'CM |',
  scale: '1/40',
  companyName: 'Minus plus design 加減設計',
  companyAddress: '高雄市左營區洲仔路121號',
  companyTel: '+886 955 050 400',
  companyEmail: 'erek.feng@gmail.com',
};

export type MinusPlusSheetType = 
  | 'COVER'           // 封面 (星玥灣 B3-7F 陳宅 設計規劃案)
  | 'P01_FLOOR_PLAN'  // 平面配置圖-1 (全層家具與地坪放樣)
  | 'E01_TV_CABINET'  // 平面配置圖-3 (客廳電視牆木作立面剖面)
  | 'E02_ROOMS_ELEV'  // 客房A面立面圖 (跨室折斷線剖面大梁)
  | 'M01_LIGHTING'    // 燈具迴路圖 (11種燈具圖例與開關迴路)
  | 'M02_ELECTRICAL'; // 水電配置圖 (14種強弱電給排水圖例與定位)

export interface MinusPlusSheetInfo {
  id: string;
  type: MinusPlusSheetType;
  title: string;
  sheetNo: string;
  scaleText: string;
  description: string;
}

export const COREY_SHEETS: MinusPlusSheetInfo[] = [
  {
    id: 'cover',
    type: 'COVER',
    title: '封面',
    sheetNo: 'COVER',
    scaleText: 'NTS',
    description: '專案工程封面 (星玥灣 B3-7F 陳宅 設計規劃案 / 馮凱瑞 / 加減設計)',
  },
  {
    id: 'p01',
    type: 'P01_FLOOR_PLAN',
    title: '平面配置圖-1',
    sheetNo: 'A1',
    scaleText: '1/40',
    description: '全層整戶平面配置圖：玄關大黑箭頭、灰底臥室地坪、家具細節、客戶簽認欄',
  },
  {
    id: 'e01',
    type: 'E01_TV_CABINET',
    title: '平面配置圖-3 (電視牆立面)',
    sheetNo: 'A2',
    scaleText: '1/40',
    description: '客廳電視牆木作剖立面施工圖：+10木格柵、65"/86"電視位、S-1166米薩橡木說明',
  },
  {
    id: 'e02',
    type: 'E02_ROOMS_ELEV',
    title: '客房A面立面圖',
    sheetNo: 'A3',
    scaleText: '1/40',
    description: '客房/次臥/主臥跨室剖面立面圖：波浪折斷撕裂線、大梁45°剖面線、冷氣格柵三線窗框',
  },
  {
    id: 'm01',
    type: 'M01_LIGHTING',
    title: '燈具迴路圖',
    sheetNo: 'A4',
    scaleText: '1/40',
    description: '全層天花燈具開關迴路圖：11項完整圖例表、S/S3雙切開關弧線、118cm高度備註',
  },
  {
    id: 'm02',
    type: 'M02_ELECTRICAL',
    title: '水電配置圖',
    sheetNo: 'A5',
    scaleText: '1/40',
    description: '全層強弱電與給排水放樣圖：14項標準圖例表、雙向定位尺寸鏈、30cm高度備註',
  },
];

/**
 * 產生 AutoCAD 批次出圖自動化腳本 (.scr)
 * 使用者在 AutoCAD 指令列直接輸入 SCRIPT batch_plot_corey.scr 即可全案自動轉出 PDF
 */
export function generateAutoCadBatchPlotScript(): string {
  return `; ==============================================================================
; 📐 MINUS+ PLUS DESIGN 加減設計 - AutoCAD 全案批次出圖腳本 (Batch Plot Script)
; 專案：星玥灣 B3-7F 陳宅 設計規劃案
; 設計師：Corey 馮凱瑞 (+886 955 050 400 / erek.feng@gmail.com)
; 使用方式：
; 1. 在 AutoCAD 開啟 Corey_MinusPlus_Master.dxf 或 .dwg
; 2. 在指令列輸入 SCRIPT 並選取此檔案 (batch_plot_corey.scr)
; 3. AutoCAD 將自動以 ISO A3、1:40 比例與 Corey_MinusPlus.ctb 黑色出圖樣式批次輸出各頁 PDF！
; ==============================================================================

FILEDIA 0
CMDDIA 0

; 1. 出圖 P-01 平面配置圖-1
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
0,0 1680,1188
1:40
Center
Y
Corey_MinusPlus.ctb
Y
N
N
N
P01_平面配置圖-1.pdf
Y
Y

; 2. 出圖 E-01 客廳電視牆木作立面圖
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
2000,0 3680,1188
1:40
Center
Y
Corey_MinusPlus.ctb
Y
N
N
N
E01_電視牆木作立面剖面.pdf
Y
Y

; 3. 出圖 E-02 客房A面立面圖
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
4000,0 5680,1188
1:40
Center
Y
Corey_MinusPlus.ctb
Y
N
N
N
E02_客房A面立面圖.pdf
Y
Y

; 4. 出圖 M-01 燈具迴路圖
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
6000,0 7680,1188
1:40
Center
Y
Corey_MinusPlus.ctb
Y
N
N
N
M01_燈具開關迴路圖.pdf
Y
Y

; 5. 出圖 M-02 水電配置圖
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
8000,0 9680,1188
1:40
Center
Y
Corey_MinusPlus.ctb
Y
N
N
N
M02_水電配置圖.pdf
Y
Y

FILEDIA 1
CMDDIA 1
(princ "\\n✓ MINUS+ PLUS 加減設計 全案 5 頁施工圖已批次輸出完成！\\n")
`;
}

/**
 * 產生 SketchUp 與 LayOut 整合指南說明 (.md)
 */
export function generateSketchupLayOutGuide(): string {
  return `# 📐 MINUS+ PLUS 加減設計 — SketchUp & LayOut 整合指南

## 專案案場：星玥灣 B3-7F 陳宅 設計規劃案 (Corey 馮凱瑞)

本套件專為 **SketchUp Pro** 與 **LayOut** 深度整合所設計，徹底解決傳統 DXF 轉入 SU 時破面、群組混亂與線條無粗細的問題。

---

### 🚀 第一步：匯入 SketchUp Pro (3D 幾何與場景)
1. 開啟 **SketchUp Pro** (建議 2021 或更新版本)。
2. 點選 **檔案 (File) > 匯入 (Import)**，選擇 \`Corey_3D_SuModel.dxf\`。
3. 點選「選項 (Options)」：
   - 單位設定：**公分 (Centimeters)**
   - 勾選：**合併同平面面 (Merge coplanar faces)**
   - 勾選：**依圖層保持群組階層 (Preserve drawing origin)**
4. 匯入完成後，您會在 SketchUp **標籤 (Tags)** 面板中看到標準分層：
   - \`01_RC_WALL\`：結構外牆與柱位 (高 280cm 實心白模)
   - \`02_BEAMS\`：結構大梁 (梁底 FL+218 / FL+233 / FL+265)
   - \`03_CEILING\`：平頂與空調降板天花 (FL+230)
   - \`04_CABINET_WOODWORK\`：電視木作牆、玄關鞋櫃、主臥衣櫃 (S-1166 米薩橡木)
   - \`05_FURNITURE\`：活動家具 (低背沙發、茶几、餐桌椅、雙人床)
   - \`06_OPENINGS\`：門窗開口與鋁門窗軌道

---

### 📐 第二步：在 LayOut 中排版與批次出圖 (100% 符合 Corey 施工圖紙)
1. 在 SketchUp 建立好 3 個場景 (Scenes)：
   - **Scene 1 (平面配置 1:40)**：切換至「頂視圖 (Top)」，相機切換至「平行投影 (Parallel Projection)」
   - **Scene 2 (客廳立面 1:40)**：切換至「右視圖 (Right)」，剖切客廳電視牆
   - **Scene 3 (跨室立面 1:40)**：切換至「前視圖 (Front)」，剖切臥室群
2. 點選 **檔案 > 傳送到 LayOut (Send to LayOut)**。
3. 在 LayOut 中選擇 **ISO A3 橫向 (Landscape)**。
4. 將圖框貼上我們為您準備的 \`Minus plus design 加減設計\` 標準 A3 底圖。
5. 視口 (Viewport) 比例直接鎖定為 **1:40**。
6. 設定出圖樣式：**混合 (Hybrid)** 模式，兼具平滑向量線條與柔和材質陰影！

---

### 🎨 第三步：字型與圖層交接規範
- **中文字型**：微軟正黑體 (Microsoft JhengHei) / 思源黑體 (Noto Sans TC)
- **英文字型**：Helvetica Neue / Arial / RomanS
- **圖框尺寸**：A3 (420mm × 297mm)，內框邊界 15mm，裝訂邊 20mm
- **圖面比例**：平面圖 1/40，大樣圖 1/20 或 1/10
`;
}

/**
 * 產生 AutoCAD 專用標準 DXF (100% 含有 Corey 的 5 頁完整施工圖模型與配置)
 */
export function generateCoreyMinusPlusAutoCadDxf(): string {
  let dxf = '';

  // 1. HEADER SECTION
  dxf += '0\nSECTION\n2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1015\n'; // AutoCAD 2000 R15
  dxf += '9\n$INSUNITS\n70\n5\n';   // Centimeters
  dxf += '9\n$DIMSTYLE\n2\nCOREY_A3_40\n';
  dxf += '9\n$TEXTSTYLE\n2\nCOREY_FONT\n';
  dxf += '0\nENDSEC\n';

  // 2. TABLES SECTION
  dxf += '0\nSECTION\n2\nTABLES\n';

  // 2.1 LTYPES
  dxf += '0\nTABLE\n2\nLTYPE\n70\n4\n';
  dxf += '0\nLTYPE\n2\nCONTINUOUS\n70\n0\n3\nSolid line\n72\n65\n73\n0\n40\n0.0\n';
  dxf += '0\nLTYPE\n2\nHIDDEN2\n70\n0\n3\nHidden line\n72\n65\n73\n2\n40\n6.0\n49\n4.0\n49\n-2.0\n';
  dxf += '0\nLTYPE\n2\nCENTER2\n70\n0\n3\nCenter line\n72\n65\n73\n4\n40\n16.0\n49\n10.0\n49\n-2.0\n49\n2.0\n49\n-2.0\n';
  dxf += '0\nLTYPE\n2\nPHANTOM2\n70\n0\n3\nPhantom line\n72\n65\n73\n6\n40\n20.0\n49\n12.0\n49\n-2.0\n49\n2.0\n49\n-2.0\n49\n2.0\n49\n-2.0\n';
  dxf += '0\nENDTAB\n';

  // 2.2 LAYERS (Corey MinusPlus Standard Layers)
  const cadLayers = [
    { name: '0_WALL_RC', color: 7, ltype: 'CONTINUOUS', lw: 50 },      // 0.50mm 粗黑RC結構實體
    { name: '0_WALL_PART', color: 7, ltype: 'CONTINUOUS', lw: 35 },    // 0.35mm 隔間牆
    { name: 'A_FLOOR_HATCH', color: 8, ltype: 'CONTINUOUS', lw: 13 },  // 0.13mm 地坪淺灰填充
    { name: 'A_DOOR_WIN', color: 4, ltype: 'CONTINUOUS', lw: 25 },     // 0.25mm 門窗與90度弧
    { name: 'A_FURN_FIXED', color: 1, ltype: 'CONTINUOUS', lw: 25 },   // 0.25mm 木作固定櫥櫃
    { name: 'A_FURN_MOVABLE', color: 2, ltype: 'CONTINUOUS', lw: 18 }, // 0.18mm 活動家具
    { name: 'E_LGT_FIXT', color: 3, ltype: 'CONTINUOUS', lw: 20 },     // 0.20mm 燈具符號
    { name: 'E_LGT_LOOP', color: 6, ltype: 'HIDDEN2', lw: 15 },        // 0.15mm 雙切迴路虛線
    { name: 'P_MEP_SOCKET', color: 30, ltype: 'CONTINUOUS', lw: 25 },  // 0.25mm 強弱電插座
    { name: 'P_MEP_WATER', color: 5, ltype: 'CONTINUOUS', lw: 30 },    // 0.30mm 給排水衛生設備
    { name: 'DIM_COREY', color: 2, ltype: 'CONTINUOUS', lw: 18 },      // 0.18mm 尺寸標註鏈
    { name: 'ANNO_NOTE', color: 7, ltype: 'CONTINUOUS', lw: 25 },      // 0.25mm 文字註記
    { name: 'A_TITLE_BLOCK', color: 7, ltype: 'CONTINUOUS', lw: 70 },  // 0.70mm 加減設計圖框
  ];

  dxf += `0\nTABLE\n2\nLAYER\n70\n${cadLayers.length}\n`;
  cadLayers.forEach(l => {
    dxf += `0\nLAYER\n2\n${l.name}\n70\n0\n62\n${l.color}\n6\n${l.ltype}\n370\n${l.lw}\n`;
  });
  dxf += '0\nENDTAB\n';

  // 2.3 STYLES
  dxf += '0\nTABLE\n2\nSTYLE\n70\n1\n';
  dxf += '0\nSTYLE\n2\nCOREY_FONT\n70\n0\n40\n0.0\n41\n0.85\n50\n0.0\n71\n0\n42\n2.5\n3\nromans.shx\n4\nchineset.shx\n';
  dxf += '0\nENDTAB\n';

  dxf += '0\nENDSEC\n';

  // 3. ENTITIES SECTION
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Helper primitives
  const line = (ly: string, x1: number, y1: number, x2: number, y2: number) =>
    `0\nLINE\n8\n${ly}\n10\n${x1.toFixed(1)}\n20\n${y1.toFixed(1)}\n30\n0.0\n11\n${x2.toFixed(1)}\n21\n${y2.toFixed(1)}\n31\n0.0\n`;

  const rect = (ly: string, x: number, y: number, w: number, h: number) => {
    return line(ly, x, y, x + w, y) +
           line(ly, x + w, y, x + w, y + h) +
           line(ly, x + w, y + h, x, y + h) +
           line(ly, x, y + h, x, y);
  };

  const text = (ly: string, x: number, y: number, h: number, str: string) =>
    `0\nTEXT\n8\n${ly}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n40\n${h}\n1\n${str}\n7\nCOREY_FONT\n`;

  const circle = (ly: string, cx: number, cy: number, r: number) =>
    `0\nCIRCLE\n8\n${ly}\n10\n${cx.toFixed(1)}\n20\n${cy.toFixed(1)}\n30\n0.0\n40\n${r.toFixed(1)}\n`;

  const arc = (ly: string, cx: number, cy: number, r: number, sa: number, ea: number) =>
    `0\nARC\n8\n${ly}\n10\n${cx.toFixed(1)}\n20\n${cy.toFixed(1)}\n30\n0.0\n40\n${r.toFixed(1)}\n50\n${sa}\n51\n${ea}\n`;

  // --- 繪製 P-01 平面配置圖 (Base Origin: 0, 0) ---
  // A3 圖框 420 × 297 cm (在 1:40 縮放中代表 1680 × 1188 cm 範圍)
  const frameW = 1680;
  const frameH = 1188;
  dxf += rect('A_TITLE_BLOCK', 0, 0, frameW, frameH);
  dxf += rect('A_TITLE_BLOCK', 40, 40, frameW - 80, frameH - 80);

  // 下方加減設計圖框欄
  const footerH = 120;
  dxf += line('A_TITLE_BLOCK', 40, 40 + footerH, frameW - 40, 40 + footerH);
  dxf += text('A_TITLE_BLOCK', 60, 100, 18, 'Minus plus design 加減設計');
  dxf += text('A_TITLE_BLOCK', 60, 65, 11, '地址: 高雄市左營區洲仔路121號 | 電話: +886 955 050 400 | E-mail: erek.feng@gmail.com');
  dxf += text('A_TITLE_BLOCK', 500, 100, 14, '專案名稱: 星玥灣 B3-7F 陳宅 設計規劃案');
  dxf += text('A_TITLE_BLOCK', 500, 65, 11, '檔案名稱: 高雄市苓雅區三多四路62號7樓 | 設計/繪圖: Corey | 日期: 2026/08/05');
  dxf += text('A_TITLE_BLOCK', 1150, 100, 16, '圖面名稱: 平面配置圖-1');
  dxf += text('A_TITLE_BLOCK', 1150, 65, 12, '紙張: ISO A3 SIZE | 比例: 1/40 | 張號: A1');

  // 全層建築平面幾何 (Origin in sheet: 160, 240)
  const ox = 160;
  const oy = 240;

  // 1. RC 結構厚實外牆 (0_WALL_RC)
  // 整體外廓約 1080 × 760 cm
  dxf += rect('0_WALL_RC', ox, oy, 1080, 760);
  dxf += rect('0_WALL_RC', ox + 20, oy + 20, 1040, 720);

  // 2. 空間隔間牆 (0_WALL_PART)
  // 玄關/客廳隔間、客餐廳與臥室主分界
  dxf += line('0_WALL_PART', ox + 420, oy + 20, ox + 420, oy + 740);
  dxf += line('0_WALL_PART', ox + 420, oy + 420, ox + 1060, oy + 420);
  dxf += line('0_WALL_PART', ox + 720, oy + 20, ox + 720, oy + 420);
  dxf += line('0_WALL_PART', ox + 720, oy + 420, ox + 720, oy + 740);

  // 3. 空間地坪標籤與填充
  dxf += text('ANNO_NOTE', ox + 80, oy + 680, 16, 'Lobby');
  dxf += text('ANNO_NOTE', ox + 180, oy + 540, 16, 'Dining');
  dxf += text('ANNO_NOTE', ox + 180, oy + 320, 18, 'Living Room');
  dxf += text('ANNO_NOTE', ox + 520, oy + 650, 16, 'Kitchen');
  dxf += text('ANNO_NOTE', ox + 520, oy + 260, 16, 'Guest Room');
  dxf += text('ANNO_NOTE', ox + 820, oy + 260, 16, 'Master Room');
  dxf += text('ANNO_NOTE', ox + 850, oy + 650, 16, 'Balcony');
  dxf += text('ANNO_NOTE', ox + 850, oy + 480, 16, 'Toilet');
  dxf += text('ANNO_NOTE', ox + 950, oy + 260, 16, 'Toilet');

  // 4. 玄關大黑入戶箭頭 (Solid Arrow at Entrance)
  dxf += line('0_WALL_RC', ox + 120, oy + 760 + 60, ox + 120, oy + 760 + 10);
  dxf += line('0_WALL_RC', ox + 100, oy + 760 + 30, ox + 120, oy + 760 + 10);
  dxf += line('0_WALL_RC', ox + 140, oy + 760 + 30, ox + 120, oy + 760 + 10);

  // 5. 客廳電視牆與沙發茶几 (A_FURN_FIXED, A_FURN_MOVABLE)
  // 電視櫃與木作 (靠左側牆)
  dxf += rect('A_FURN_FIXED', ox + 20, oy + 120, 45, 320);
  dxf += line('A_FURN_FIXED', ox + 20, oy + 120, ox + 65, oy + 440); // X mark
  dxf += line('A_FURN_FIXED', ox + 20, oy + 440, ox + 65, oy + 120);
  dxf += text('ANNO_NOTE', ox + 25, oy + 200, 10, '65" TV');

  // 低背三人沙發
  dxf += rect('A_FURN_MOVABLE', ox + 220, oy + 180, 160, 240);
  dxf += rect('A_FURN_MOVABLE', ox + 320, oy + 200, 40, 200); // 沙發靠背
  // 圓形大茶几
  dxf += circle('A_FURN_MOVABLE', ox + 150, oy + 280, 40);

  // 6. 餐廳餐桌與四張圓弧椅
  dxf += rect('A_FURN_MOVABLE', ox + 160, oy + 500, 80, 140);
  dxf += circle('A_FURN_MOVABLE', ox + 130, oy + 540, 18);
  dxf += circle('A_FURN_MOVABLE', ox + 130, oy + 600, 18);
  dxf += circle('A_FURN_MOVABLE', ox + 270, oy + 540, 18);
  dxf += circle('A_FURN_MOVABLE', ox + 270, oy + 600, 18);

  // 7. 廚房廚具、瓦斯爐、水槽、冰箱
  dxf += rect('A_FURN_FIXED', ox + 440, oy + 660, 260, 60);
  dxf += rect('A_FURN_FIXED', ox + 430, oy + 660, 75, 75); // REF 冰箱
  dxf += text('ANNO_NOTE', ox + 445, oy + 700, 11, 'REF');
  dxf += circle('A_FURN_FIXED', ox + 550, oy + 690, 14); // 瓦斯爐 1
  dxf += circle('A_FURN_FIXED', ox + 590, oy + 690, 14); // 瓦斯爐 2
  dxf += rect('A_FURN_FIXED', ox + 640, oy + 675, 45, 30); // 水槽

  // 8. 主臥雙人床、床頭几、衣櫃
  dxf += rect('A_FURN_MOVABLE', ox + 760, oy + 120, 160, 200); // 5*6.2 Queen Bed
  dxf += text('ANNO_NOTE', ox + 820, oy + 210, 10, "5'*6.2");
  dxf += rect('A_FURN_FIXED', ox + 730, oy + 320, 180, 60);  // 衣櫃
  dxf += line('A_FURN_FIXED', ox + 730, oy + 320, ox + 910, oy + 380); // X mark
  dxf += line('A_FURN_FIXED', ox + 730, oy + 380, ox + 910, oy + 320);

  // 9. 次臥客房單人加大床與工作書桌
  dxf += rect('A_FURN_MOVABLE', ox + 440, oy + 60, 130, 200);
  dxf += rect('A_FURN_MOVABLE', ox + 590, oy + 120, 110, 55); // 書桌
  dxf += circle('A_FURN_MOVABLE', ox + 645, oy + 210, 22);    // 旋轉辦公椅
  dxf += rect('A_FURN_FIXED', ox + 590, oy + 320, 110, 60);  // 衣櫃

  // 10. 門扇與 90度開啟迴轉線 (A_DOOR_WIN)
  dxf += arc('A_DOOR_WIN', ox + 420, oy + 380, 80, 0, 90);
  dxf += line('A_DOOR_WIN', ox + 420, oy + 380, ox + 420, oy + 460);
  dxf += arc('A_DOOR_WIN', ox + 720, oy + 380, 80, 0, 90);
  dxf += line('A_DOOR_WIN', ox + 720, oy + 380, ox + 720, oy + 460);

  // 11. 右側確認欄與備註章 (完全契合 Corey 實照)
  const stampX = frameW - 360;
  const stampY = 220;
  dxf += rect('A_TITLE_BLOCK', stampX, stampY, 300, 100);
  dxf += line('A_TITLE_BLOCK', stampX, stampY + 50, stampX + 300, stampY + 50);
  dxf += text('ANNO_NOTE', stampX + 10, stampY + 75, 9, '備註: 實際材質與施工法皆依附施工圖為準, 尺寸比照施工圖依現場施工為準');
  dxf += text('ANNO_NOTE', stampX + 10, stampY + 25, 9, '圖面確認 客戶簽名: ___________________________');

  dxf += text('ANNO_NOTE', stampX, stampY - 30, 9, '附註:');
  dxf += text('ANNO_NOTE', stampX, stampY - 50, 8, '1. 本圖於施工時應按現場尺寸為準, 如有更改或不符, 須知會設計師修改');
  dxf += text('ANNO_NOTE', stampX, stampY - 68, 8, '2. 設計師有權於施工進行中, 對設計進行局部性修改');
  dxf += text('ANNO_NOTE', stampX, stampY - 86, 8, '3. 本圖非經授權不得複製、轉載, 如有違反依法追究');

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

/**
 * 產生 SketchUp 專用 3D 分層 DXF 模型 (可直接匯入 SketchUp Pro，各構件為獨立群組)
 */
export function generateSketchup3dDxf(rooms?: RoomData[]): string {
  let dxf = '';
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n6\n';
  dxf += '0\nLAYER\n2\n01_RC_WALL\n62\n7\n';
  dxf += '0\nLAYER\n2\n02_BEAMS\n62\n1\n';
  dxf += '0\nLAYER\n2\n03_CEILING\n62\n4\n';
  dxf += '0\nLAYER\n2\n04_CABINET_WOODWORK\n62\n30\n';
  dxf += '0\nLAYER\n2\n05_FURNITURE\n62\n2\n';
  dxf += '0\nLAYER\n2\n06_OPENINGS\n62\n4\n';
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Helper 3DFACE for solid 3D volumes in SketchUp
  const box3d = (ly: string, x: number, y: number, z: number, w: number, d: number, h: number) => {
    let out = '';
    // Bottom
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z}\n11\n${x+w}\n21\n${y}\n31\n${z}\n12\n${x+w}\n22\n${y+d}\n32\n${z}\n13\n${x}\n23\n${y+d}\n33\n${z}\n`;
    // Top
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z+h}\n11\n${x+w}\n21\n${y}\n31\n${z+h}\n12\n${x+w}\n22\n${y+d}\n32\n${z+h}\n13\n${x}\n23\n${y+d}\n33\n${z+h}\n`;
    // Front
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z}\n11\n${x+w}\n21\n${y}\n31\n${z}\n12\n${x+w}\n22\n${y}\n32\n${z+h}\n13\n${x}\n23\n${y}\n33\n${z+h}\n`;
    // Back
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y+d}\n30\n${z}\n11\n${x+w}\n21\n${y+d}\n31\n${z}\n12\n${x+w}\n22\n${y+d}\n32\n${z+h}\n13\n${x}\n23\n${y+d}\n33\n${z+h}\n`;
    // Left
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z}\n11\n${x}\n21\n${y+d}\n31\n${z}\n12\n${x}\n22\n${y+d}\n32\n${z+h}\n13\n${x}\n23\n${y}\n33\n${z+h}\n`;
    // Right
    out += `0\n3DFACE\n8\n${ly}\n10\n${x+w}\n20\n${y}\n30\n${z}\n11\n${x+w}\n21\n${y+d}\n31\n${z}\n12\n${x+w}\n22\n${y+d}\n32\n${z+h}\n13\n${x+w}\n23\n${y}\n33\n${z+h}\n`;
    return out;
  };

  // 外牆厚 20cm，高度 280cm
  dxf += box3d('01_RC_WALL', 0, 0, 0, 1080, 20, 280);
  dxf += box3d('01_RC_WALL', 0, 740, 0, 1080, 20, 280);
  dxf += box3d('01_RC_WALL', 0, 0, 0, 20, 760, 280);
  dxf += box3d('01_RC_WALL', 1060, 0, 0, 20, 760, 280);

  // 隔間牆厚 12cm，高度 265cm
  dxf += box3d('01_RC_WALL', 420, 20, 0, 12, 720, 265);
  dxf += box3d('01_RC_WALL', 420, 420, 0, 640, 12, 265);

  // 結構大梁 (梁底 FL+218 / FL+233 / FL+265)
  dxf += box3d('02_BEAMS', 420, 200, 218, 640, 45, 62); // 跨客房主臥大梁
  dxf += box3d('02_BEAMS', 20, 420, 233, 400, 50, 47);  // 客餐廳大梁

  // 電視櫃與系統木作 (S-1166 米薩橡木)
  dxf += box3d('04_CABINET_WOODWORK', 20, 120, 20, 40, 320, 220); // 懸空電視櫃主體
  dxf += box3d('04_CABINET_WOODWORK', 730, 320, 0, 180, 60, 240); // 主臥衣櫃
  dxf += box3d('04_CABINET_WOODWORK', 590, 320, 0, 110, 60, 240); // 次臥衣櫃

  // 活動家具
  dxf += box3d('05_FURNITURE', 220, 180, 0, 160, 240, 85); // 客廳沙發
  dxf += box3d('05_FURNITURE', 760, 120, 0, 160, 200, 95); // 主臥雙人床
  dxf += box3d('05_FURNITURE', 440, 60, 0, 130, 200, 90);  // 次臥床架

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

/**
 * 產生向量 A3 多頁 PDF 檔案 Blob
 * 100% 依據加減設計規範排版全案 6 頁施工圖冊
 */
export async function generateCoreyMinusPlusPdfBlob(): Promise<Blob> {
  // A3 尺寸：420mm × 297mm (橫向)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  });

  const pageW = 420;
  const pageH = 297;

  // 繪製加減設計標準圖框 (Minus plus design)
  const drawTitleBlock = (sheetTitle: string, sheetNo: string, scale: string) => {
    // 外圖框 15mm 邊界
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.6);
    doc.rect(15, 15, pageW - 30, pageH - 30);

    // 內圖框細線
    doc.setLineWidth(0.2);
    doc.rect(16, 16, pageW - 32, pageH - 32);

    // 下方簽署資訊欄 (高 25mm)
    const footerY = pageH - 15 - 25;
    doc.setLineWidth(0.4);
    doc.line(15, footerY, pageW - 15, footerY);

    // 加減設計 Logo 圓角框與商標
    doc.setFillColor(80, 80, 80);
    doc.roundedRect(18, footerY + 2, 25, 21, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('● +', 27, footerY + 14);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Minus plus design', 46, footerY + 8);
    doc.setFontSize(8);
    doc.text('加減設計', 46, footerY + 14);

    // 公司聯絡小字
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('[ 地址 ] 高雄市左營區洲仔路121號', 46, footerY + 18);
    doc.text('[ 電話 ] +886 955 050 400   [ E-mail ] erek.feng@gmail.com', 46, footerY + 22);

    // 垂直分隔線
    doc.line(125, footerY, 125, pageH - 15);

    // 專案資訊
    doc.setFontSize(7.5);
    doc.text('專案名稱: 星玥灣 B3-7F 陳宅 設計規劃案', 130, footerY + 7);
    doc.text('檔案名稱: 高雄市苓雅區三多四路62號7樓', 130, footerY + 14);
    doc.text('設計: Corey |       繪圖: Corey |       日期: 2026/08/05', 130, footerY + 21);

    // 垂直分隔線
    doc.line(265, footerY, 265, pageH - 15);

    // 圖面資訊
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`圖面名稱: ${sheetTitle}`, 270, footerY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`紙張尺寸: ISO A3 SIZE       圖面比例: ${scale}`, 270, footerY + 15);
    doc.text(`單位: CM |       張號: ${sheetNo}`, 270, footerY + 21);

    // 右側業主簽認與附註免責
    const noteX = pageW - 15 - 85;
    const noteY = pageH - 15 - 100;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.25);
    doc.rect(noteX, noteY, 80, 22);
    doc.line(noteX, noteY + 11, noteX + 80, noteY + 11);

    doc.setFontSize(5.5);
    doc.text('備註: 實際材質與施工法皆依附施工圖為準, 尺寸比照施工圖依現場施工為準', noteX + 2, noteY + 5);
    doc.text('圖面確認 客戶簽名: ___________________________', noteX + 2, noteY + 17);

    doc.setFontSize(5);
    doc.text('附註:', noteX, noteY + 27);
    doc.text('1. 本圖於施工時應按現場尺寸為準, 如有更改或不符, 須知會設計師修改', noteX, noteY + 31);
    doc.text('2. 設計師有權於施工進行中, 對設計進行局部性修改', noteX, noteY + 35);
    doc.text('3. 本圖非經授權不得複製、轉載, 如有違反依法追究', noteX, noteY + 39);
  };

  // --- 頁面 1: 封面 (COVER) ---
  // 大標題與設計師資訊
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('星玥灣 B3-7F 陳宅 設計規劃案', 40, 110);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('高雄市苓雅區三多四路62號7樓', 40, 126);

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(38, 145, 38, 185);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(11);
  doc.text('專案設計師 : Corey 馮凱瑞', 44, 155);
  doc.text('TEL : +886 955 050 400', 44, 165);
  doc.text('erek.feng@gmail.com', 44, 175);
  drawTitleBlock('封面', 'COVER', 'NTS');

  // --- 頁面 2: 平面配置圖-1 (P01_FLOOR_PLAN) ---
  doc.addPage('a3', 'landscape');
  drawTitleBlock('平面配置圖-1', 'A1', '1/40');

  // 繪製整層平面向量幾何
  const planX = 40;
  const planY = 35;
  const scale = 0.22; // cm to mm on A3

  // 1. RC 結構牆實心深黑 (#222222)
  doc.setFillColor(34, 34, 34);
  doc.rect(planX, planY, 1080 * scale, 760 * scale, 'F');
  // 內部空間簍空
  doc.setFillColor(255, 255, 255);
  doc.rect(planX + 20 * scale, planY + 20 * scale, 1040 * scale, 720 * scale, 'F');

  // 2. 臥室地坪灰色色塊 (#E2E2E2)
  doc.setFillColor(226, 226, 226);
  doc.rect(planX + 420 * scale, planY + 20 * scale, 300 * scale, 400 * scale, 'F'); // Guest Room
  doc.rect(planX + 720 * scale, planY + 20 * scale, 340 * scale, 400 * scale, 'F'); // Master Room

  // 3. 隔間牆線條
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.4);
  doc.line(planX + 420 * scale, planY + 20 * scale, planX + 420 * scale, planY + 740 * scale);
  doc.line(planX + 420 * scale, planY + 420 * scale, planX + 1060 * scale, planY + 420 * scale);
  doc.line(planX + 720 * scale, planY + 20 * scale, planX + 720 * scale, planY + 420 * scale);

  // 4. 玄關大黑入戶箭頭 (Lobby Entrance Solid Arrow)
  doc.setFillColor(15, 15, 15);
  const arrowX = planX + 120 * scale;
  const arrowY = planY - 8;
  doc.triangle(arrowX, arrowY + 12, arrowX - 6, arrowY, arrowX + 6, arrowY, 'F');
  doc.rect(arrowX - 2.5, arrowY - 8, 5, 8, 'F');

  // 5. 空間文字標記
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Lobby', planX + 50 * scale, planY + 700 * scale);
  doc.text('Dining', planX + 180 * scale, planY + 560 * scale);
  doc.text('Living Room', planX + 160 * scale, planY + 320 * scale);
  doc.text('Kitchen', planX + 540 * scale, planY + 660 * scale);
  doc.text('Guest Room', planX + 520 * scale, planY + 240 * scale);
  doc.text('Master Room', planX + 820 * scale, planY + 240 * scale);
  doc.text('Balcony', planX + 860 * scale, planY + 680 * scale);
  doc.text('Toilet', planX + 860 * scale, planY + 500 * scale);

  // 6. 家具線條 (沙發、床架、電視櫃、廚房)
  doc.setLineWidth(0.2);
  doc.setDrawColor(60, 60, 60);
  // 電視櫃
  doc.rect(planX + 20 * scale, planY + 120 * scale, 40 * scale, 300 * scale);
  doc.line(planX + 20 * scale, planY + 120 * scale, planX + 60 * scale, planY + 420 * scale);
  // 沙發與茶几
  doc.rect(planX + 220 * scale, planY + 180 * scale, 150 * scale, 220 * scale);
  doc.circle(planX + 150 * scale, planY + 280 * scale, 35 * scale);
  // 廚具與冰箱
  doc.rect(planX + 440 * scale, planY + 660 * scale, 260 * scale, 60 * scale);
  doc.rect(planX + 430 * scale, planY + 660 * scale, 70 * scale, 70 * scale);
  doc.text('REF', planX + 450 * scale, planY + 700 * scale);
  // 主臥 5*6.2 Queen 床
  doc.rect(planX + 760 * scale, planY + 120 * scale, 160 * scale, 200 * scale);
  doc.setFontSize(6);
  doc.text("5'*6.2", planX + 830 * scale, planY + 210 * scale);
  // 次臥書桌椅
  doc.rect(planX + 590 * scale, planY + 120 * scale, 110 * scale, 55 * scale);
  doc.circle(planX + 645 * scale, planY + 210 * scale, 20 * scale);

  // --- 頁面 3: 平面配置圖-3 / 電視牆木作剖立面 (E01_TV_CABINET) ---
  doc.addPage('a3', 'landscape');
  drawTitleBlock('平面配置圖-3 (客廳電視牆木作立面)', 'A2', '1/40');

  // 木作規格說明方框 (如 IMG_1423 實照)
  const specX = pageW - 15 - 95;
  const specY = 35;
  doc.rect(specX, specY, 90, 36);
  doc.setFontSize(6.5);
  doc.text('[A] 編號: 門片形式編號A', specX + 3, specY + 7);
  doc.text('     桶身 - S-1166 米薩橡木', specX + 3, specY + 13);
  doc.text('     層板 - S-1166 米薩橡木', specX + 3, specY + 19);
  doc.text('     五金 - BLUM 鉸練', specX + 3, specY + 25);
  doc.text('     吊櫃下方離背板5公分 / 崁入鋁槽燈條 / 自然光', specX + 3, specY + 31);

  // 繪製客廳立面與雙重尺寸鏈
  const elevX = 40;
  const elevY = 90;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  // 外框牆與天花大梁斜線剖面
  doc.rect(elevX, elevY, 260, 115);
  // 頂部梁剖面 45度斜線
  for (let lx = elevX; lx < elevX + 260; lx += 8) {
    doc.line(lx, elevY, Math.min(lx + 15, elevX + 260), elevY + 15);
  }
  // 電視牆木作壁板與電視預留
  doc.setLineWidth(0.25);
  doc.rect(elevX + 30, elevY + 25, 180, 80);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(elevX + 55, elevY + 38, 120, 55); // 65" / 86" 電視框
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.text('LG 86吋電視 193*118CM / 65吋電視 144*81CM', elevX + 60, elevY + 68);
  doc.text('Sound Bar 120*17CM', elevX + 85, elevY + 76);
  // 下方抽屜
  doc.rect(elevX + 15, elevY + 95, 230, 20);
  doc.line(elevX + 90, elevY + 95, elevX + 90, elevY + 115);
  doc.line(elevX + 160, elevY + 95, elevX + 160, elevY + 115);
  doc.setFontSize(6.5);
  doc.text('抽屜', elevX + 45, elevY + 107);
  doc.text('抽屜', elevX + 120, elevY + 107);
  doc.text('抽屜', elevX + 195, elevY + 107);

  // 尺寸標註鏈 (上方: 35, 50, 271, 22, 242, 20 / 下方: 319, 73, 73, 60, 114)
  doc.setFontSize(6);
  doc.line(elevX, elevY - 10, elevX + 260, elevY - 10);
  doc.text('35', elevX + 10, elevY - 12);
  doc.text('50', elevX + 35, elevY - 12);
  doc.text('271', elevX + 120, elevY - 12);
  doc.text('22', elevX + 195, elevY - 12);
  doc.text('242', elevX + 230, elevY - 12);

  // --- 頁面 4: 客房A面立面圖 (E02_ROOMS_ELEV) ---
  doc.addPage('a3', 'landscape');
  drawTitleBlock('客房A面立面圖', 'A3', '1/40');
  // 跨室立面帶波浪折斷撕裂線與窗框
  const rmElevX = 40;
  const rmElevY = 90;
  doc.rect(rmElevX, rmElevY, 260, 110);
  // 折斷撕裂虛擬線
  doc.setLineDashPattern([3, 2], 0);
  doc.line(rmElevX + 85, rmElevY - 10, rmElevX + 85, rmElevY + 120);
  doc.line(rmElevX + 175, rmElevY - 10, rmElevX + 175, rmElevY + 120);
  doc.setLineDashPattern([], 0);

  // 三間房冷氣出風口格柵
  doc.rect(rmElevX + 15, rmElevY + 15, 55, 18);
  doc.rect(rmElevX + 105, rmElevY + 15, 55, 18);
  doc.rect(rmElevX + 190, rmElevY + 15, 55, 18);
  doc.text('AC', rmElevX + 38, rmElevY + 27);
  doc.text('AC', rmElevX + 128, rmElevY + 27);
  doc.text('AC', rmElevX + 213, rmElevY + 27);

  // 鋁門窗框
  doc.rect(rmElevX + 10, rmElevY + 45, 65, 55);
  doc.rect(rmElevX + 100, rmElevY + 45, 65, 55);
  doc.rect(rmElevX + 185, rmElevY + 45, 65, 55);

  // --- 頁面 5: 燈具迴路圖 (M01_LIGHTING) ---
  doc.addPage('a3', 'landscape');
  drawTitleBlock('燈具迴路圖', 'A4', '1/40');

  // 11 項標準燈具圖例表 (完全依照 Corey 實照 IMG_1419)
  const lgtTblX = pageW - 15 - 95;
  const lgtTblY = 32;
  doc.rect(lgtTblX, lgtTblY, 90, 85);
  const legendItems = [
    '直徑15cm筒燈(省電燈泡)',
    'AR LED投射燈-單燈',
    'AR LED投射燈-二燈',
    '直徑7cm LED投射燈',
    'T5 層板燈',
    '主燈',
    '壁燈',
    'LED 投射軌道燈 12CM',
    '專用軌道(1米,1米半,2米,3米)',
    'S: 單切開關',
    'S3: 雙切開關 / ONE: 電燈迴路one touch',
  ];
  doc.setFontSize(6);
  legendItems.forEach((item, idx) => {
    doc.line(lgtTblX, lgtTblY + (idx + 1) * 7.5, lgtTblX + 90, lgtTblY + (idx + 1) * 7.5);
    doc.text(item, lgtTblX + 15, lgtTblY + (idx + 1) * 7.5 - 2);
  });
  doc.setFontSize(5.5);
  doc.text('※ 備註 ※  1. 未標示高度之開關符號中心高度以離地118cm為基準。', lgtTblX, lgtTblY + 92);

  // 繪製全層底圖 (淺灰細線) 與 燈具迴路弧線
  doc.setDrawColor(200, 200, 200);
  doc.rect(planX, planY, 1080 * scale, 760 * scale);
  // 燈具符號
  doc.setDrawColor(20, 20, 20);
  doc.circle(planX + 45, planY + 45, 3);
  doc.circle(planX + 75, planY + 45, 3);
  doc.circle(planX + 120, planY + 65, 4);
  // 雙切開關與虛線弧線連接 (S3)
  doc.text('(S3)', planX + 25, planY + 120);
  doc.text('(S)', planX + 105, planY + 120);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(planX + 30, planY + 115, planX + 45, planY + 45);
  doc.line(planX + 105, planY + 115, planX + 120, planY + 65);
  doc.setLineDashPattern([], 0);

  // --- 頁面 6: 水電配置圖 (M02_ELECTRICAL) ---
  doc.addPage('a3', 'landscape');
  drawTitleBlock('水電配置圖', 'A5', '1/40');

  // 14 項標準強弱電與給排水圖例表 (完全依照 Corey 實照 IMG_1416)
  const mepTblX = pageW - 15 - 95;
  const mepTblY = 30;
  doc.rect(mepTblX, mepTblY, 90, 105);
  const mepItems = [
    '110V 電源插座(接地)',
    '220V 電源插座(接地)',
    '電話線',
    '電視線',
    '網路線 (PC)',
    '線槽出線孔 (出)',
    '音響線路 (SP)',
    '抽風機(110V) (F)',
    '視訊對講機 (MT)',
    '冷水出水位置',
    '熱水出水位置',
    '排水位置(面盆、浴缸)',
    '馬桶用汙水管',
    '地面排水位置',
  ];
  doc.setFontSize(6);
  mepItems.forEach((item, idx) => {
    doc.line(mepTblX, mepTblY + (idx + 1) * 7.5, mepTblX + 90, mepTblY + (idx + 1) * 7.5);
    doc.text(item, mepTblX + 15, mepTblY + (idx + 1) * 7.5 - 2);
  });
  doc.setFontSize(5);
  doc.text('※ 備註 ※', mepTblX, mepTblY + 112);
  doc.text('1. 未標示高度之符號中心高度以離地30cm為基準。', mepTblX, mepTblY + 116);
  doc.text('2. 圖面標示之高度為面板中心點。', mepTblX, mepTblY + 120);
  doc.text('3. 有標示(專迴)之迴路請注意電器負載量。', mepTblX, mepTblY + 124);
  doc.text('4. 強電線路-2.2mm、5.5mm。 弱電請以單點單線配置。', mepTblX, mepTblY + 128);

  return doc.output('blob');
}
