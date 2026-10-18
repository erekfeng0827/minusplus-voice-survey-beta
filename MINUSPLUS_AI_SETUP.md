# 📐 MINUS+ 加減設計 - 本機一鍵安裝與雲端-本地 AI 跨域橋接手冊

本指南專為解決 **雲端 Cloud Run 測試前端** ( `https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app` ) 與 **本機開發端 (Localhost / Codex 晶晶 / 本機 AI API)** 之間的「排斥中斷」與「跨域阻擋 (CORS)」問題而設計。

---

## 🛑 為什麼會發生「API 排斥無法串接」？

當雲端網頁 (`https://*.run.app`) 試圖呼叫你本機的 API (`http://localhost:3000`) 時，瀏覽器會進行兩道嚴格的安全審查：

1. **跨域資源共享 (CORS 阻擋)**：
   瀏覽器同源政策 (SOP) 預設嚴禁公網 HTTPS 網站讀取非同源網址的資料，除非本機 API 在 Header 中明確回傳 `Access-Control-Allow-Origin: https://ais-dev-...run.app`。
2. **Chrome 私有網路存取 (PNA - Private Network Access 阻擋)**：
   Chrome 104+ 規範：從**公網 (Public)** 呼叫**本地私網 (Private/Localhost)** 時，瀏覽器會在 Preflight 預檢請求中附加 `Access-Control-Request-Private-Network: true`。若本機 API 沒有回應 `Access-Control-Allow-Private-Network: true`，瀏覽器會直接顯示 `net::ERR_FAILED` 並強行中斷連線。

只要在本機 API 加入對應的 CORS + PNA 中介層，此排斥問題便可瞬間徹底解決！

---

## ⚡ 方式一：終端機一鍵自動化安裝 (One-Click Setup)

專案根目錄已為您內建全自動腳本：

### 🍎 macOS / Linux / Windows WSL：
在終端機執行以下指令：
```bash
# 賦予執行權限並啟動腳本
chmod +x setup.sh
./setup.sh
```

### 🪟 Windows (CMD / PowerShell)：
直接雙擊專案目錄下的 `setup.bat`，或在命令提示字元執行：
```cmd
setup.bat
```

> **腳本自動執行的 5 大動作**：
> 1. 自動檢查並安裝 `bun` (若本機未安裝會自動下載配置)。
> 2. 建立標準專案結構 (`pipeline/orders/new`, `pipeline/orders/in_progress` 等)。
> 3. 自動生成 `.env` 檔案模板並預填 CORS 白名單。
> 4. 自動執行 `bun install` 安裝所有必要套件。
> 5. 輸出本機啟動指令。

---

## 🛠️ 跨域請求 (CORS) 關鍵設定代碼

本專案已在 `server.ts` 與獨立橋接器 `bridge-server.ts` 中配置好標準中介層。若您要在自己的本機 API（Node.js / Bun / Express）中實作，請複製以下標準代碼：

### Node.js / Bun (Express / TypeScript)
```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();

// 🌟 核心 CORS & Chrome PNA 穿透中介層
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app',
    'https://ais-pre-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  // 1. 動態驗證來源 (支援精準比對與萬用 *.run.app 雲端實例)
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 2. 允許的 HTTP 操作方法與 Headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network, Accept, x-goog-api-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 快取預檢請求 24 小時

  // 3. 🚀 解決 Chrome PNA (Private Network Access) 阻擋之關鍵
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }

  // 4. 放行瀏覽器 Preflight 預檢請求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '50mb' }));
```

---

## 🚀 啟動本機端服務

安裝完成後，您有兩種啟動模式：

### 模式 A：啟動完整系統 (前後端 + Vite 熱重載)
```bash
bun run dev
```
此時本機會在 `http://localhost:3000` 運行，包含本機資料庫模擬、Vite 前端、3D 渲染與幾何審查。

### 模式 B：僅啟動極簡 AI 橋接器 (專門承接雲端 Cloud Run 派工)
```bash
bun run bridge-server.ts
```
此伺服器極為輕量，專門作為本機 Codex 晶晶繪圖引擎與 Cloud Run 網頁之間的資料中繼站！

---

## 🧪 驗證連線健康度

啟動本機端服務後，在瀏覽器打開以下網址：
👉 `http://localhost:3000/api/health`

若看到以下 JSON 回應，代表本機環境與跨域設定已 100% 就緒：
```json
{
  "status": "ONLINE",
  "service": "MINUSPLUS_LOCAL_BRIDGE",
  "corsConfigured": true,
  "pnaSupported": true,
  "geminiKeyDetected": true
}
```
此時再由雲端 Cloud Run 前端進行 API 調用，將不會再受到任何瀏覽器 CORS 或 PNA 的排斥阻擋！
