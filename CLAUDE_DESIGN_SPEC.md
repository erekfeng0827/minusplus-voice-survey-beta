# CLAUDE_DESIGN_SPEC.md
# 克勞的 Design · 介面設計規範與系統 Token 指南
**專案名稱**：幾何契約與現場放樣自動化系統 (Staking CAD System)  
**設計語言系統**：Claude Staking Precision Design System (v1.0)  
**版本對象**：Claude (克勞的 Design) UI/UX 深度調優與前端重構

---

## 1. 核心設計哲學 (Core Philosophy)
1. **極致防呆與 5 倍數幾何視覺化**：
   - 任何尺寸與高程只要符合 5 倍數（265、230、215），給予高可信度的綠色語意 (`#10B981`)。
   - 任何非 5 倍數或避梁淨空不足 260cm 者，給予琥珀黃預警 (`#F59E0B`) 或紅色標記 (`#EF4444`)。
2. **圓角膠囊按鈕 (Pill Controls)**：
   - 所有頂部與次級功能操作均採用 `rounded-full` 膠囊設計。
   - 嚴格維持水平內距為垂直內距之 2 倍（`px-4 py-1.5` 或 `px-3.5 py-1.5`），文字禁止換行。
3. **低對比微冷色調畫布**：
   - 主畫布背景：`#121622`（深邃藍灰），比純黑更護眼、比純灰更具專業工程軟體質感。
   - 表面卡片：`#1e2534`，邊框使用 `rgba(51, 65, 85, 0.8)`。

---

## 2. 8 大擴充功能定義 (The 8 Extension Features)

### 1. 新增專案範本 (Project Templates)
- **視覺呈現**：卡片式預覽，內含戶型面寬、進深、梁高、天花降板。
- **預設範本**：
   - 標準豪邸標竿範本 (480×550，梁 265，降板 230，落塵 215)。
  - 當代夾層 / 高坪效複層套房 (360×420，挑高 360，夾層 210)。
  - 商辦精品展廳開放式天花 (650×780，裸頂 320，軌道燈 265)。
  - 景觀透天別墅衛廚重水區 (520×600，梁 275，浴缸 230)。

### 2. 施工現場打卡 (Site Check-in)
- **功能定位**：工務主任與放樣師於現場打卡，自動綁定 GPS 經緯度、時間戳記與心跳監控。
- **資料欄位**：`timestamp`, `location`, `inspector`, `room_id`, `beam_elevation_verified`.

### 3. 離線數據同步 (Offline Data Sync)
- **適用情境**：地下室或鋼構遮蔽無 4G/5G 網路環境。
- **快取機制**：瀏覽器 IndexedDB + LocalStorage 原子儲存，連線後自動上傳。
- **解塞機制**：原子更名（Atomic Rename），杜絕 19.8 天工單滯留與心跳紅燈。

### 4. 互動尺寸標註 (Interactive Dimension Studio)
- **功能定位**：允許現場人員即時自訂高程點位、水電出線盒標高、開口尺寸。
- **約束規則**：提供「5x 強制取整」按鈕，快速就近對齊 5 倍數。

### 5. 跨版本 CAD 比對 (CAD Visual Diff)
- **功能定位**：紅綠雙色視覺化顯影初測版與竣工版幾何差異。
- **差異報告**：自動計算面寬 Δ、梁高 Δ 與降板 Δ。

### 6. 現場放樣 QR 貼紙 (Site QR Sticker Generator)
- **功能定位**：一鍵產生可黏貼於大梁與柱體之放樣查驗二維碼貼紙。
- **掃描效果**：木工或水電手機掃描即可啟動 3D 視錐透視圖。

### 7. 今日工務放樣日誌 (Daily Site Construction Log)
- **自動摘要**：每日自動結算氣象、溫濕度、出工班次、合格率與避梁通過狀態。
- **輸出格式**：一鍵複製純文字簡訊或 Markdown 報表。

### 8. 克勞的 Design 規範手冊與 Token (Claude UI Design Spec)
- **提供資源**：包含完整 CSS/Tailwind Token、元件半徑、文字層級與色彩變數。

---

## 3. 設計 Token (Design Tokens)

```css
:root {
  /* 基礎背景與表面色 */
  --bg-app: #0c0f17;
  --bg-canvas: #121622;
  --bg-surface: #1a2232;
  --bg-surface-elevated: #222c40;
  --border-subtle: rgba(71, 85, 105, 0.4);
  --border-focus: rgba(6, 182, 212, 0.8);

  /* 幾何語意色彩 (Semantic Colors) */
  --color-contract-5x: #10b981;    /* 5倍數合格綠 */
  --color-contract-5x-bg: rgba(16, 185, 129, 0.15);
  --color-beam-warning: #f59e0b;   /* 避梁淨空預警黃 */
  --color-laser-cyan: #06b6d4;     /* 雷射引線青色 */
  --color-ai-purple: #8b5cf6;      /* AI 智算紫色 */

  /* 圓角規則 */
  --radius-pill: 9999px;           /* 頂部操作按鈕一律滿圓角 */
  --radius-card: 16px;             /* 彈窗與卡片 */
  --radius-inner: 10px;            /* 內部巢狀容器 */

  /* 字體族系 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```
