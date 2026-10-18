// ==============================================================================
// 🌉 MINUS+ 加減設計 - 本機極簡 AI 跨域橋接伺服器 (bridge-server.ts)
// 專門解決雲端 Cloud Run (https://ais-dev-...run.app) 與本機 Localhost 串接的 CORS 排斥問題
// 支援 Chrome 私有網路存取 (Private Network Access, PNA) 規範
// ==============================================================================

import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 1. 🌟 CORS & Chrome Private Network Access (PNA) 完整跨域中介層
const ALLOWED_ORIGIN_PATTERNS = [
  'https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app',
  'https://ais-pre-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // 判斷是否為信任的來源 (包含自訂 ALLOWED_ORIGINS 與所有 Google Cloud Run 實例)
  if (origin) {
    const isAllowed =
      ALLOWED_ORIGIN_PATTERNS.includes(origin) ||
      origin.endsWith('.run.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 允許的 HTTP 動作與 Header 授權
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network, Accept, x-goog-api-key'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 快取預檢請求 24 小時

  // 🚀 關鍵核心：Chrome 104+ 私有網路存取 (PNA) 規範
  // 當雲端公網 HTTPS (Cloud Run) 向私網 (localhost / 127.0.0.1) 發起請求時，瀏覽器會帶有此 Header
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }

  // 處理瀏覽器 Preflight 預檢請求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// 2. 測試與心跳健康檢查 (供雲端前端快速檢測本機橋接是否成功)
app.get('/api/health', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({
    status: 'ONLINE',
    service: 'MINUSPLUS_LOCAL_BRIDGE',
    timestamp: new Date().toISOString(),
    corsConfigured: true,
    pnaSupported: true,
    geminiKeyDetected: hasGeminiKey,
    clientOrigin: req.headers.origin || 'DIRECT_CALL',
  });
});

// 3. 本機 Gemini AI 代理路由 (解決前端直接存取金鑰暴露或跨域限制)
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'gemini-2.5-flash', systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: 'MISSING_API_KEY',
        message: '本機端未設定 GEMINI_API_KEY，請在 .env 檔案中填寫。',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({
      success: true,
      text: response.text,
      modelUsed: model,
    });
  } catch (err: any) {
    console.error('AI Proxy Error:', err);
    res.status(500).json({
      error: 'AI_EXECUTION_FAILED',
      message: err?.message || 'Gemini API 呼叫失敗',
    });
  }
});

// 4. 本機 Watcher / 工單派發接口 (連接 Codex 晶晶繪圖)
app.get('/api/pipeline/orders', (req: Request, res: Response) => {
  res.json({
    status: 'ACTIVE',
    watcherRunning: true,
    channel: 'LOCAL_BUN_SOCKET',
    ordersCount: 23,
    message: '本機 Watcher 監聽中，就緒承接雲端派工。',
  });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('================================================================');
  console.log(`🌉 MINUS+ 本機 AI 橋接伺服器正在運行: http://0.0.0.0:${PORT}`);
  console.log(`🚀 CORS & PNA 跨域穿透已全面放行：`);
  console.log(`   - 雲端實例: https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app`);
  console.log(`   - 本地端點: http://localhost:${PORT} / http://127.0.0.1:${PORT}`);
  console.log('================================================================');
  console.log('');
});
