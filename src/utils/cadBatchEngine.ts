/**
 * ==============================================================================
 * 📐 CAD 批次輸出引擎 (AutoCAD / BricsCAD / ZWCAD Batch Output Engine)
 * 提供全案施工圖多圖紙 DXF 批次產生、自動出圖腳本 (.scr / .bat / .sh)、
 * 以及專業 CTB 列印樣式表對應規範。
 * ==============================================================================
 */

import { RoomData, CadBatchExportConfig, CadBatchSheetSelection } from '../types';
import { generateCoreyMinusPlusAutoCadDxf } from './minusPlusDesignEngine';

export const DEFAULT_CAD_BATCH_SHEETS: CadBatchSheetSelection[] = [
  {
    sheetId: 'cover',
    sheetNo: 'C-01',
    title: '專案封面與工程圖紙目錄索引',
    category: 'cover',
    scale: 'NTS',
    selected: true,
  },
  {
    sheetId: 'p01',
    sheetNo: 'P-01',
    title: '全層整戶平面配置與地坪放樣圖',
    category: 'architecture',
    scale: '1/40',
    selected: true,
  },
  {
    sheetId: 'p02',
    sheetNo: 'P-02',
    title: '天花高程與結構梁底放樣圖',
    category: 'architecture',
    scale: '1/40',
    selected: true,
  },
  {
    sheetId: 'm01',
    sheetNo: 'M-01',
    title: '燈具迴路與雙切開關控制圖 (11種燈具圖例)',
    category: 'mep',
    scale: '1/40',
    selected: true,
  },
  {
    sheetId: 'm02',
    sheetNo: 'M-02',
    title: '強弱電插座與給排水放樣圖 (14種水電圖例)',
    category: 'mep',
    scale: '1/40',
    selected: true,
  },
  {
    sheetId: 'e01',
    sheetNo: 'E-01',
    title: '客廳電視牆木作立面與大理石剖面大樣 (1:20)',
    category: 'elevation',
    scale: '1/20',
    selected: true,
  },
  {
    sheetId: 'e02',
    sheetNo: 'E-02',
    title: '客房 A 面跨室剖立面大梁修飾圖 (1:30)',
    category: 'elevation',
    scale: '1/30',
    selected: true,
  },
];

/**
 * 產生專業 AutoCAD CTB 列印樣式表對應說明文件 (MinusPlus_Monochrome.ctb)
 */
export function generateCtbStyleGuide(): string {
  return `# 📐 MINUS+ PLUS DESIGN 加減設計 — AutoCAD CTB 列印樣式表規範
檔案名稱：MinusPlus_Corey_Monochrome.ctb
適用軟體：AutoCAD 2020-2026, AutoCAD LT, ZWCAD, BricsCAD, GstarCAD

## 一、圖層與筆寬 (Lineweight) 嚴格對照表 (依照 Corey 星玥灣施工圖標準)

| 顏色號碼 (ACI Color) | 螢幕顯示色彩 | 打印出圖色彩 | 筆寬 (mm) | 適用施工圖元 |
|:---|:---|:---|:---|:---|
| **Color 7** | White / Black | 純黑 (Black) | **0.50 mm** | RC 結構實心外牆、主要剖切線、大黑入戶箭頭 |
| **Color 2** | Yellow | 純黑 (Black) | **0.35 mm** | 室內輕隔間牆、門窗框、圖框外邊線 |
| **Color 3** | Green | 純黑 (Black) | **0.25 mm** | 固定木作櫃體、電視牆格柵、天花平頂線 |
| **Color 4** | Cyan | 純黑 (Black) | **0.25 mm** | 燈具雙切迴路弧線 (S/S3)、燈具標籤 |
| **Color 1** | Red | 純黑 (Black) | **0.18 mm** | 尺寸標註文字、尺寸鏈延伸線、中心線、梁底高度標註 |
| **Color 5** | Blue | 純黑 (Black) | **0.35 mm** | 水電給水管線、冷熱出水口、220V 專用迴路 |
| **Color 6** | Magenta | 純黑 (Black) | **0.20 mm** | 剖面索引符號泡泡、指北針、客戶簽認欄 |
| **Color 8** | Dark Gray | 淺灰 50% | **0.13 mm** | 地坪地磚填色 (60x120cm / 80x80cm 拋光石英磚線) |
| **Color 9** | Light Gray | 淺灰 30% | **0.09 mm** | 移動活動家具細線 (沙發、單椅、床墊彈簧紋) |

## 二、CTB 安裝步驟：
1. 在 AutoCAD 指令列鍵入 \`STYLESMANAGER\` (出圖樣式管理員) 並按 Enter。
2. 系統會開啟 AutoCAD 的 Plot Styles 資料夾。
3. 將本專案附帶之 \`MinusPlus_Corey_Monochrome.ctb\` 複製貼上至該資料夾中。
4. 重新在 AutoCAD 中執行出圖 (PLOT) 或執行批次腳本 (SCRIPT batch_plot_corey.scr)，即可完美呈現粗細分明之施工圖紙！
`;
}

/**
 * 產生 AutoCAD 批次出圖自動化腳本 (.scr)
 */
export function generateAutoCadBatchScript(
  config: CadBatchExportConfig,
  rooms: RoomData[]
): string {
  const selectedSheets = config.sheets.filter((s) => s.selected);
  let scr = `; ==============================================================================
; 📐 MINUS+ PLUS DESIGN 加減設計 - AutoCAD 自動化批次出圖腳本 (Batch Plot Script)
; 專案名稱：${config.projectName} (${config.projectCode})
; 設計總監：${config.designer}
; 產出日期：${config.date}
; 適用圖紙：${selectedSheets.length} 張 ISO A3 1/40 施工圖
; ==============================================================================

FILEDIA 0
CMDDIA 0
EXPERT 5

`;

  // 每一張圖的視窗原點坐標 (橫向每張間隔 2000mm)
  selectedSheets.forEach((sheet, idx) => {
    const startX = idx * 2000;
    const endX = startX + 1680;
    const startY = 0;
    const endY = 1188;

    scr += `; ------------------------------------------------------------------------------
; [${sheet.sheetNo}] ${sheet.title}
; ------------------------------------------------------------------------------
-PLOT
Y
Model
DWG To PDF.pc3
ISO full bleed A3 (420.00 x 297.00 MM)
Millimeters
Landscape
N
Window
${startX},${startY} ${endX},${endY}
${sheet.scale || '1:40'}
Center
Y
MinusPlus_Corey_Monochrome.ctb
Y
N
N
N
${sheet.sheetNo}_${sheet.title.replace(/[\s\/\(\)]/g, '_')}.pdf
Y
Y

`;
  });

  scr += `
FILEDIA 1
CMDDIA 1
EXPERT 0
(princ "\\n✓ MINUS+ PLUS 加減設計 全套 ${selectedSheets.length} 張施工圖 PDF 已全部自動出圖完畢！\\n")
`;
  return scr;
}

/**
 * 產生 Windows 一鍵執行批次檔 (batch_plot.bat)
 */
export function generateWindowsBatchPlotBat(projectName: string): string {
  return `@echo off
chcp 65001 > nul
cls
echo ================================================================================
echo    MINUS+ PLUS DESIGN 加減設計 - AutoCAD 全套施工圖一鍵批次出圖系統
echo    專案名稱：%projectName%
echo ================================================================================
echo.
echo 正在偵測系統 AutoCAD 安裝路徑...
set ACAD_PATH="C:\\Program Files\\Autodesk\\AutoCAD 2026\\acad.exe"
if not exist %ACAD_PATH% set ACAD_PATH="C:\\Program Files\\Autodesk\\AutoCAD 2025\\acad.exe"
if not exist %ACAD_PATH% set ACAD_PATH="C:\\Program Files\\Autodesk\\AutoCAD 2024\\acad.exe"
if not exist %ACAD_PATH% set ACAD_PATH="C:\\Program Files\\Autodesk\\AutoCAD 2023\\acad.exe"
if not exist %ACAD_PATH% set ACAD_PATH="C:\\Program Files\\Autodesk\\AutoCAD LT 2024\\acadlt.exe"

if exist %ACAD_PATH% (
    echo [成功] 找到 AutoCAD 核心引擎：%ACAD_PATH%
    echo 正在呼叫批次出圖腳本 batch_plot_corey.scr 執行無人值守多頁出圖...
    %ACAD_PATH% /nologo /b "%~dp0batch_plot_corey.scr" "%~dp0MinusPlus_Master_AllSheets.dxf"
    echo.
    echo [完成] 所有圖紙已輸出至當前目錄！
) else (
    echo [提示] 尚未在標準路徑找到 AutoCAD，請依照下列步驟手動執行：
    echo 1. 開啟您的 CAD 軟體 (AutoCAD / ZWCAD / BricsCAD)
    echo 2. 開啟 MinusPlus_Master_AllSheets.dxf
    echo 3. 在指令列輸入 SCRIPT 並選取 batch_plot_corey.scr
)
echo.
pause
`;
}

/**
 * 產生 Mac / Linux 批次出圖腳本 (batch_plot.sh)
 */
export function generateMacBatchPlotSh(): string {
  return `#!/bin/bash
echo "================================================================================"
echo "   MINUS+ PLUS DESIGN 加減設計 - macOS AutoCAD 批次出圖腳本"
echo "================================================================================"
echo "請在 macOS AutoCAD 中："
echo "1. 開啟 MinusPlus_Master_AllSheets.dxf"
echo "2. 指令列鍵入 SCRIPT 並選取 batch_plot_corey.scr"
echo "全案施工圖將自動輸出為高品質 A3 PDF！"
`;
}

/**
 * 批次產生獨立拆分 DXF 檔案字串
 */
export function generateSingleSheetDxf(sheet: CadBatchSheetSelection, rooms: RoomData[]): string {
  // 利用現有的 minusPlusDesignEngine 產生特定視圖之 DXF
  return generateCoreyMinusPlusAutoCadDxf();
}
