#!/usr/bin/env bash
# ==============================================================================
# 🚀 MINUS+ 加減設計 (MinusPlus Design) - 本機一鍵安裝與 AI 橋接環境建置腳本
# 規範標準：Bun, Vite, React, Tailwind CSS, Google Gemini API
# 支援環境：macOS (Darwin) / Linux / Windows WSL
# ==============================================================================

set -e

echo ""
echo "===================================================================="
echo "  📐 加減設計 (MinusPlus Design) - 本機一鍵自動化建置程序"
echo "  目標：配置 Bun 執行環境、初始化依賴、生成 .env 與 CORS 橋接配置"
echo "===================================================================="
echo ""

# 1. 檢驗並自動安裝 Bun 環境
echo "🔍 [1/5] 檢查 Bun 執行環境..."
if ! command -v bun &> /dev/null; then
    echo "⚠️ 未檢測到 Bun，即將啟動自動安裝 (curl -fsSL https://bun.sh/install)..."
    curl -fsSL https://bun.sh/install | bash
    
    # 載入 Bun PATH
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    if ! command -v bun &> /dev/null; then
        echo "❌ Bun 自動安裝後未能加入 PATH，請手動執行: source ~/.bashrc 或 source ~/.zshrc"
        exit 1
    fi
fi

BUN_VERSION=$(bun --version)
echo "✅ Bun 環境就緒！當前版本: v${BUN_VERSION}"

# 2. 自動建立規範目錄結構
echo ""
echo "📁 [2/5] 檢查並建立專案目錄結構..."
mkdir -p src/components
mkdir -p src/utils
mkdir -p src/types
mkdir -p public
mkdir -p pipeline/orders/new
mkdir -p pipeline/orders/in_progress
mkdir -p pipeline/orders/archive
mkdir -p pipeline/orders/dlq
echo "✅ 專案目錄結構建立完成 (含流水線工單池 pipeline/orders/)"

# 3. 自動生成 .env 檔案模板
echo ""
echo "🔑 [3/5] 檢查 .env 環境變數檔案..."
if [ ! -f .env ]; then
    echo "📄 生成預設 .env 檔案..."
    cat << 'EOF' > .env
# ==============================================================================
# 📐 MINUS+ 加減設計 - 本機與雲端環境變數
# ==============================================================================

# Google Gemini API 金鑰 (請至 https://aistudio.google.com/ 取得)
GEMINI_API_KEY=""
VITE_GEMINI_API_KEY=""

# Firebase 專案設定
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_PROJECT_ID="ai-studio-cad3d-d4ad7ce7-bbba-416f-81a5-036f57d69368"

# 伺服器通訊埠
PORT=3000

# 🌟 允許跨域存取來源 (CORS Whitelist)
# 確保 Cloud Run 雲端前端可以存取本機端 API
ALLOWED_ORIGINS="https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app,https://ais-pre-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
EOF
    echo "✅ 已生成 .env 檔案模板！請記得填入您的 GEMINI_API_KEY"
else
    echo "ℹ️ .env 已存在，保留現有配置。"
fi

# 4. 安裝依賴套件
echo ""
echo "📦 [4/5] 執行 bun install 安裝所有依賴套件..."
bun install

# 5. 完成提示與啟動指南
echo ""
echo "🎉 [5/5] 本機建置完成！"
echo "===================================================================="
echo "  🚀 啟動方式："
echo "  1. 啟動完整前後端整合伺服器 (包含 CORS 穿透與 Vite 熱更新):"
echo "     $ bun run dev"
echo ""
echo "  2. 或僅啟動本機極簡 AI 跨域橋接端點 (Bridge API):"
echo "     $ bun run bridge-server.ts"
echo ""
echo "  🌐 雲端前端已部署在:"
echo "     https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app/"
echo "===================================================================="
echo ""
