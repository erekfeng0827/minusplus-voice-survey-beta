@echo off
chcp 65001 >nul
:: ==============================================================================
:: 🚀 MINUS+ 加減設計 (MinusPlus Design) - Windows 本機一鍵安裝與建置腳本
:: 規範標準：Bun, Vite, React, Tailwind CSS, Google Gemini API
:: ==============================================================================

echo ====================================================================
echo   📐 加減設計 (MinusPlus Design) - Windows 本機一鍵自動化建置
echo   目標：配置 Bun 環境、初始化依賴、生成 .env 與 CORS 橋接配置
echo ====================================================================
echo.

:: 1. 檢查並安裝 Bun 環境
echo 🔍 [1/5] 檢查 Bun 執行環境...
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ 未檢測到 Bun，即將使用 PowerShell 自動下載安裝...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"
    set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
    where bun >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Bun 安裝後未能寫入環境變數，請手動重開 CMD/PowerShell 終端機或手動安裝 Bun。
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('bun --version') do set BUN_VER=%%i
echo ✅ Bun 環境就緒！當前版本: v%BUN_VER%
echo.

:: 2. 建立目錄結構
echo 📁 [2/5] 建立專案目錄結構...
if not exist "src\components" mkdir "src\components"
if not exist "src\utils" mkdir "src\utils"
if not exist "src\types" mkdir "src\types"
if not exist "public" mkdir "public"
if not exist "pipeline\orders\new" mkdir "pipeline\orders\new"
if not exist "pipeline\orders\in_progress" mkdir "pipeline\orders\in_progress"
if not exist "pipeline\orders\archive" mkdir "pipeline\orders\archive"
if not exist "pipeline\orders\dlq" mkdir "pipeline\orders\dlq"
echo ✅ 專案目錄結構建立完成。
echo.

:: 3. 生成 .env 檔案
echo 🔑 [3/5] 檢查 .env 環境變數檔案...
if not exist ".env" (
    echo 📄 生成預設 .env 檔案...
    (
        echo # ==============================================================================
        echo # 📐 MINUS+ 加減設計 - 本機與雲端環境變數
        echo # ==============================================================================
        echo.
        echo # Google Gemini API 金鑰 ^(請至 https://aistudio.google.com/ 取得^)
        echo GEMINI_API_KEY=""
        echo VITE_GEMINI_API_KEY=""
        echo.
        echo # Firebase 專案設定
        echo VITE_FIREBASE_API_KEY=""
        echo VITE_FIREBASE_PROJECT_ID="ai-studio-cad3d-d4ad7ce7-bbba-416f-81a5-036f57d69368"
        echo.
        echo # 伺服器通訊埠
        echo PORT=3000
        echo.
        echo # 🌟 允許跨域存取來源 ^(CORS Whitelist^)
        echo ALLOWED_ORIGINS="https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app,https://ais-pre-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
    ) > .env
    echo ✅ 已生成 .env 檔案！請以文字編輯器打開填入您的 GEMINI_API_KEY。
) else (
    echo ℹ️ .env 已存在，保留現有設定。
)
echo.

:: 4. 安裝依賴套件
echo 📦 [4/5] 執行 bun install 安裝專案依賴...
call bun install
echo.

:: 5. 啟動提示
echo 🎉 [5/5] 本機建置完成！
echo ====================================================================
echo   🚀 啟動方式：
echo   1. 啟動完整伺服器 ^(支援 CORS 穿透與 Vite 前端^):
echo      bun run dev
echo.
echo   2. 或僅啟動本機極簡 AI 跨域橋接端點:
echo      bun run bridge-server.ts
echo.
echo   🌐 雲端前端網址:
echo      https://ais-dev-xn5yyqe2mnugjmypbwhrdz-455452208051.asia-northeast1.run.app/
echo ====================================================================
echo.
pause
