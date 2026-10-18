import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Copy,
  Check,
  Send,
  Download,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileText,
  Play,
  Server,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { RoomData } from '../types';

interface ApiIntegrationDocsPanelProps {
  currentRoom?: RoomData;
  onNotify?: (msg: string) => void;
  onSwitchToDispatcher?: () => void;
}

type DocSection = 'overview' | 'endpoints' | 'cad_engine' | 'code_examples' | 'troubleshooting';

export const ApiIntegrationDocsPanel: React.FC<ApiIntegrationDocsPanelProps> = ({
  currentRoom,
  onNotify,
  onSwitchToDispatcher,
}) => {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('dispatch');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Tester States
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const copyToClipboard = (text: string, key: string, label: string = '代碼') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onNotify?.(`📋 已複製 ${label} 至剪貼簿！`);
  };

  // Run live test against real Express backend
  const handleRunLiveTest = async (endpointKey: string) => {
    setTestingEndpoint(endpointKey);
    setTestStatus('LOADING');
    setTestResponse(null);

    try {
      if (endpointKey === 'status') {
        const res = await fetch('/api/abi/status');
        const data = await res.json();
        setTestResponse(data);
        setTestStatus('SUCCESS');
        onNotify?.('✓ 成功連線 /api/abi/status 取得系統即時狀態！');
      } else if (endpointKey === 'dispatch') {
        const payload = {
          taskId: `TEST-${Date.now().toString().slice(-4)}`,
          sender: 'Dev_Tester_CLI',
          clientName: '星玥灣示範案',
          roomData: {
            roomName: currentRoom?.roomName || '主放樣空間',
            width: currentRoom?.width || 480,
            length: currentRoom?.length || 550,
            height: currentRoom?.height || 280,
            beamHeight: 265,
            ceilingDrop: 230,
            bathDrop: 215,
          },
          targetSheet: 'A-01',
        };
        const res = await fetch('/api/abi/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setTestResponse(data);
        setTestStatus('SUCCESS');
        onNotify?.('✓ 成功拋轉測量數據至 /api/abi/dispatch，已完成幾何契約審查！');
      } else if (endpointKey === 'generateDxf') {
        const payload = {
          projectName: '星玥灣A1放樣圖',
          roomData: {
            roomName: currentRoom?.roomName || '客廳放樣',
            width: currentRoom?.width || 480,
            length: currentRoom?.length || 550,
            height: currentRoom?.height || 280,
            beamHeight: 265,
            ceilingDrop: 230,
            bathDrop: 215,
          },
        };
        const res = await fetch('/api/drawings/generate-dxf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setTestResponse(data);
        setTestStatus('SUCCESS');
        onNotify?.('✓ 成功調用 /api/drawings/generate-dxf，即時生成 DXF 與 LISP 腳本！');
      } else if (endpointKey === 'webhook') {
        const payload = {
          event: 'HEARTBEAT',
          sender: 'Live_Docs_Runner',
          data: { ping: 'keep-alive', timestamp: new Date().toISOString() },
        };
        const res = await fetch('/api/abi/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setTestResponse(data);
        setTestStatus('SUCCESS');
        onNotify?.('✓ 成功送出心跳保活事件至 /api/abi/webhook！');
      }
    } catch (err: any) {
      setTestResponse({ error: err.message || '連線失敗' });
      setTestStatus('ERROR');
      onNotify?.(`⚠️ 測試呼叫失敗：${err.message}`);
    }
  };

  const sampleCurlDispatch = `curl -X POST http://localhost:3000/api/abi/dispatch \\
  -H "Content-Type: application/json" \\
  -d '{
    "taskId": "ORD-MEASURE-2026",
    "sender": "YenJun_ABI_Device_01",
    "clientName": "星玥灣 A1 實品屋",
    "targetSheet": "A-01",
    "roomData": {
      "roomName": "客廳放樣空間",
      "width": 480,
      "length": 550,
      "height": 280,
      "beamHeight": 265,
      "ceilingDrop": 230,
      "bathDrop": 215,
      "doors": [{ "name": "玄關大門", "width": 100, "height": 210, "offset": 40, "wall": "bottom" }],
      "windows": [{ "name": "景觀落地窗", "width": 300, "height": 240, "offset": 80, "wall": "top" }]
    }
  }'`;

  const sampleCurlGenerateDxf = `curl -X POST http://localhost:3000/api/drawings/generate-dxf \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectName": "星玥灣A1客廳施工圖",
    "roomData": {
      "roomName": "客廳",
      "width": 480,
      "length": 550,
      "height": 280,
      "beamHeight": 265,
      "ceilingDrop": 230,
      "bathDrop": 215
    },
    "format": "json"
  }'`;

  const sampleCurlWebhook = `curl -X POST http://localhost:3000/api/abi/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "HEARTBEAT",
    "sender": "Local_Watcher_Daemon",
    "data": { "status": "ONLINE", "diskFreeMb": 42000 }
  }'`;

  const sampleNodeClientCode = `/**
 * 室內測量與自動化出圖管線 Node.js / TypeScript 客戶端
 * 具備：(1) 三段式原子落盤 (2) 5 倍數幾何前置校驗 (3) 定時保活心跳
 */
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000';

interface RoomMeasurementPayload {
  roomName: string;
  width: number;       // 開間面寬 (cm)
  length: number;      // 進深長度 (cm)
  height: number;      // 樓板淨高 (cm) - 建議 280
  beamHeight: number;  // 梁下淨高 (cm) - 剛性 265
  ceilingDrop: number; // 天花降板 (cm) - 剛性 230
  bathDrop: number;    // 廚衛地坪 (cm) - 剛性 215
}

// 1. 三段式原子落盤寫入 (杜絕 0-byte 死鎖)
export function saveMeasurementAtomically(dir: string, filename: string, data: any) {
  const finalPath = path.join(dir, filename);
  const tmpPath = path.join(dir, \`\${filename}.\${Date.now()}.tmp\`);
  
  // 步驟一：先寫入 .tmp 臨時檔案
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  // 步驟二：調用 OS 原語完成原子更名
  fs.renameSync(tmpPath, finalPath);
  console.log(\`[Watcher] 原子落盤完成: \${finalPath}\`);
}

// 2. 拋轉測量數據並觸發自動化出圖
export async function dispatchMeasurement(room: RoomMeasurementPayload) {
  // 前置 5 倍數檢查
  const isRule5 = [room.beamHeight, room.ceilingDrop, room.bathDrop, room.height]
    .every(val => val % 5 === 0);
  
  if (!isRule5) {
    console.warn('⚠️ 警告：高程包含非 5 倍數尺寸，將觸發後端審計警示！');
  }

  const response = await fetch(\`\${API_BASE}/api/abi/dispatch\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId: \`TASK-\${Date.now()}\`,
      sender: 'Field_Tablet_App',
      clientName: '星玥灣建案',
      targetSheet: 'A-01',
      roomData: room
    })
  });

  const result = await response.json();
  console.log('✓ 派工結果:', result);
  return result;
}

// 3. 常駐保活心跳守護程序 (每 15 秒同步一次，修復 69 小時斷鏈紅燈)
export function startHeartbeatKeeper(intervalMs = 15000) {
  setInterval(async () => {
    try {
      await fetch(\`\${API_BASE}/api/abi/webhook\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'HEARTBEAT',
          sender: 'Field_Tablet_Daemon',
          data: { uptimeSec: process.uptime() }
        })
      });
      // console.log('✓ 心跳已同步 (Watcher Status: GREEN_HEALTHY)');
    } catch (err) {
      console.error('心跳發送失敗:', err);
    }
  }, intervalMs);
}`;

  const samplePythonClientCode = `import requests
import json
import time

API_BASE = "http://localhost:3000"

def send_measurement(room_name, width, length, beam_h=265, drop_h=230, bath_h=215):
    """
    發送測量數據並直接驅動出圖管線
    """
    payload = {
        "taskId": f"PY-{int(time.time())}",
        "sender": "Laser_Meter_RaspberryPi",
        "clientName": "星玥灣專案",
        "targetSheet": "A-01",
        "roomData": {
            "roomName": room_name,
            "width": width,
            "length": length,
            "height": 280,
            "beamHeight": beam_h,
            "ceilingDrop": drop_h,
            "bathDrop": bath_h
        }
    }
    
    # 呼叫 Express 派工端點
    res = requests.post(f"{API_BASE}/api/abi/dispatch", json=payload)
    data = res.json()
    print("API 回應狀態:", data.get("status"))
    print("幾何契約通過率:", data.get("contractAudit", {}).get("complianceRate"), "%")
    print("直派工程師:", data.get("dispatchedToWorker"))
    return data

# 立即測試派發
if __name__ == "__main__":
    send_measurement("客廳放樣", 480, 550)
`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e17] text-slate-200 overflow-hidden font-sans">
      {/* Top Docs Navigation Bar */}
      <div className="bg-[#101524] border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            說明書章節：
          </span>

          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'overview'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-[#161f33] text-slate-300 hover:text-white hover:bg-[#1f2b47]'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>一、全盤架構與剛性原則</span>
          </button>

          <button
            onClick={() => setActiveSection('endpoints')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'endpoints'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-[#161f33] text-slate-300 hover:text-white hover:bg-[#1f2b47]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>二、Express API 端點規格手冊</span>
          </button>

          <button
            onClick={() => setActiveSection('cad_engine')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'cad_engine'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-[#161f33] text-slate-300 hover:text-white hover:bg-[#1f2b47]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>三、自動化圖面產生引擎 (CAD/LISP)</span>
          </button>

          <button
            onClick={() => setActiveSection('code_examples')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'code_examples'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-[#161f33] text-slate-300 hover:text-white hover:bg-[#1f2b47]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>四、開發者調用代碼範例</span>
          </button>

          <button
            onClick={() => setActiveSection('troubleshooting')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'troubleshooting'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-[#161f33] text-slate-300 hover:text-white hover:bg-[#1f2b47]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>五、常見問題與除錯指南</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToDispatcher && (
            <button
              onClick={onSwitchToDispatcher}
              className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/50 text-indigo-300 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>返回任務直派終端</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
        {/* SECTION 1: OVERVIEW & ARCHITECTURE PRINCIPLES */}
        {activeSection === 'overview' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-gradient-to-r from-[#12192b] via-[#16223a] to-[#101726] border border-cyan-500/30 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📐</span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  「室內設計、測量、圖面繪製系統」開發者對接標準總綱
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                本系統為手持測距設備、現場測繪平板 App、外部協同程式（如彥君 ABI）提供統一的標準化 HTTP RESTful 與 Webhook 接口。
                透過標準化 JSON 封裝，外部系統可在 <strong>&lt; 50ms</strong> 內將測量長度與垂直標高安全落盤，由後端服務即時進行幾何剛性契約校驗，
                並自動轉譯生成 AutoCAD 標準 DXF 向量圖面與 AutoLISP 指令集，無縫直派 <strong>Codex 晶晶</strong> 自動化出圖生產線。
              </p>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Workflow className="w-4 h-4 text-cyan-400" />
                全流程自動化管線數據流向 (Pipeline Flowchart)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#141b2e] border border-slate-700/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-mono text-cyan-400 font-bold block text-[11px]">STEP 01 · 現場採集</span>
                  <div className="font-bold text-white text-xs">外部測量設備 / ABI</div>
                  <p className="text-[11px] text-slate-400">雷射測距儀或語音測繪採集長度、寬度、大梁高與降板高。</p>
                  <span className="inline-block text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                    三段式原子寫入 .tmp
                  </span>
                </div>

                <div className="bg-[#141b2e] border border-slate-700/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-mono text-indigo-400 font-bold block text-[11px]">STEP 02 · 服務端接收</span>
                  <div className="font-bold text-white text-xs">Express 後端 API 代理</div>
                  <p className="text-[11px] text-slate-400">
                    <code className="text-cyan-300">POST /api/abi/dispatch</code> 接收 Payload，更新即時心跳。
                  </p>
                  <span className="inline-block text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                    Heartbeat Keep-Alive
                  </span>
                </div>

                <div className="bg-[#141b2e] border border-slate-700/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-mono text-emerald-400 font-bold block text-[11px]">STEP 03 · 契約剛性審計</span>
                  <div className="font-bold text-white text-xs">幾何剛性契約合規引擎</div>
                  <p className="text-[11px] text-slate-400">
                    《降板裁決_v003》<strong>5 倍數原則</strong> (265 / 230 / 215) 嚴格判定，V-01~10 校核。
                  </p>
                  <span className="inline-block text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                    5 倍數鎖定 / 自動除錯
                  </span>
                </div>

                <div className="bg-[#141b2e] border border-slate-700/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-mono text-amber-400 font-bold block text-[11px]">STEP 04 · 向量繪圖派發</span>
                  <div className="font-bold text-white text-xs">Codex 晶晶繪圖管線</div>
                  <p className="text-[11px] text-slate-400">
                    自動生成 ACI 7 大圖層 ASCII DXF、AutoLISP 指令與 1:50 A3 施工圖。
                  </p>
                  <span className="inline-block text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                    1.8s 自動放樣完成
                  </span>
                </div>
              </div>
            </div>

            {/* Three Core Implementation Rules */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                外部對接必須遵守的三大剛性規則 (Mandatory Rules)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Rule 1 */}
                <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-mono font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span className="font-bold text-white text-xs">三段式原子落盤協議 (Atomic Write)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    凡在本機或共用資料夾產生 JSON 測量工單時，<strong>嚴禁直接向目標路徑串流寫檔</strong>。必須先寫入 <code className="text-amber-300 font-mono">filename.tmp</code>，待寫入完整並驗證無誤後調用作業系統原語 <code className="text-cyan-300 font-mono">rename</code>。
                  </p>
                  <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-emerald-300 border border-slate-800">
                    ✓ 杜絕中斷產生 0-byte 死鎖檔 (ORD-FAIL-01 根治解方)
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-900/60 border border-indigo-500 text-indigo-300 font-mono font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span className="font-bold text-white text-xs">垂直標高剛性 5 倍數契約 ($h \pmod 5 = 0$)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    所有傳入之垂直標高必須嚴格遵守 5 的整數倍數原則：
                    大梁下淨高 <strong>265 cm</strong>、吊頂降板 <strong>230 cm</strong>、廚衛與玄關地坪 <strong>215 cm</strong>、立面固定檯面 <strong>80 cm</strong>。
                  </p>
                  <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-cyan-300 border border-slate-800">
                    ✓ 避免現場泥作木作 3~8mm 畸零裁切公差
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-500 text-emerald-300 font-mono font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span className="font-bold text-white text-xs">常態保活心跳廣播 (Heartbeat Keeper)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    客戶端或 Watcher 守護進程應每隔 15~30 秒向 <code className="text-cyan-300 font-mono">POST /api/abi/webhook</code> 發送保活心跳包。維持服務端健康指標為綠燈。
                  </p>
                  <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-amber-300 border border-slate-800">
                    ✓ 終結 69 小時失聯紅燈與 Codex 晶晶防錯鎖定
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ENDPOINTS SPECIFICATION */}
        {activeSection === 'endpoints' && (
          <div className="space-y-5 max-w-5xl">
            {/* Endpoints Directory Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setSelectedEndpoint('dispatch')}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  selectedEndpoint === 'dispatch'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    POST
                  </span>
                  <div className="font-mono font-semibold text-xs mt-1 text-cyan-200">/api/abi/dispatch</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">拋轉測量數據並審計出圖</p>
              </button>

              <button
                onClick={() => setSelectedEndpoint('generateDxf')}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  selectedEndpoint === 'generateDxf'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    POST
                  </span>
                  <div className="font-mono font-semibold text-xs mt-1 text-cyan-200">/api/drawings/generate-dxf</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">產出 DXF 向量與 AutoLISP 指令</p>
              </button>

              <button
                onClick={() => setSelectedEndpoint('webhook')}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  selectedEndpoint === 'webhook'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    POST
                  </span>
                  <div className="font-mono font-semibold text-xs mt-1 text-cyan-200">/api/abi/webhook</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">接收心跳事件與回呼廣播</p>
              </button>

              <button
                onClick={() => setSelectedEndpoint('status')}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  selectedEndpoint === 'status'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">
                    GET
                  </span>
                  <div className="font-mono font-semibold text-xs mt-1 text-cyan-200">/api/abi/status</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">系統連線健康度與佇列監控</p>
              </button>
            </div>

            {/* Selected Endpoint Detailed View */}
            {selectedEndpoint === 'dispatch' && (
              <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono font-bold text-xs rounded border border-emerald-700">
                        POST
                      </span>
                      <span className="font-mono font-bold text-white text-sm">/api/abi/dispatch</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      接收手持設備或現場平板測量數據，強制執行剛性幾何契約審查，直接將工單注入 A 堆並派發至 Codex 晶晶出圖流水線。
                    </p>
                  </div>

                  <button
                    onClick={() => handleRunLiveTest('dispatch')}
                    disabled={testingEndpoint === 'dispatch' && testStatus === 'LOADING'}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                  >
                    {testingEndpoint === 'dispatch' && testStatus === 'LOADING' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>線上發送測試 (Live Dispatch)</span>
                  </button>
                </div>

                {/* Request Specification */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300">Request Headers:</span>
                  <div className="bg-[#121829] p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800">
                    Content-Type: application/json
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Request Body Schema (JSON)：</span>
                    <button
                      onClick={() => copyToClipboard(sampleCurlDispatch, 'curl-dispatch', 'cURL 指令')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'curl-dispatch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>複製 cURL 指令</span>
                    </button>
                  </div>
                  <pre className="bg-[#080c14] p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto">
{`{
  "taskId": "ABI-TASK-10029",           // [選填] 唯一工單號，預設自動生成
  "sender": "YenJun_ABI_Device",        // [選填] 發送端名稱/設備 ID
  "clientName": "星玥灣 A1 實品屋",       // [選填] 專案客戶標題
  "targetSheet": "A-01",                // [選填] 目標施工圖紙編號
  "roomData": {                         // [必填] 測量核心空間幾何對象
    "roomName": "客廳放樣空間",          // 空間名稱
    "width": 480,                       // 開間面寬 (cm)
    "length": 550,                      // 進深長度 (cm)
    "height": 280,                      // 結構樓板頂高基準面 (cm) - 建議 280
    "beamHeight": 265,                  // 大梁下淨高 (cm) - 剛性 265
    "ceilingDrop": 230,                 // 吊頂空調降板 (cm) - 剛性 230
    "bathDrop": 215,                    // 廚衛或落塵降板 (cm) - 剛性 215
    "doors": [                          // [選填] 門洞清單
      { "name": "玄關大門", "width": 100, "height": 210, "offset": 40, "wall": "bottom" }
    ],
    "windows": [                        // [選填] 窗洞清單
      { "name": "落地窗", "width": 300, "height": 240, "offset": 80, "wall": "top" }
    ]
  }
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300">成功返回 Response (200 OK)：</span>
                  <pre className="bg-[#080c14] p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto">
{`{
  "success": true,
  "taskId": "ABI-TASK-10029",
  "status": "COMPLETED",
  "contractAudit": {
    "compliant": true,
    "complianceRate": 100,
    "items": [
      { "name": "大梁下淨高 (Beam Clearance)", "value": 265, "target": 265, "pass": true },
      { "name": "空調天花降板 (Ceiling Drop)", "value": 230, "target": 230, "pass": true },
      { "name": "廚衛地坪降板 (Bathroom Drop)", "value": 215, "target": 215, "pass": true },
      { "name": "結構樓板淨高 (Slab Height)", "value": 280, "target": 280, "pass": true }
    ],
    "standardNotice": "《降板裁決_v003》5 倍數高程契約 (265 / 230 / 215)"
  },
  "resultDxfSummary": {
    "layers": ["WALLS", "DOORS", "WINDOWS", "BEAMS", "DROPS", "DIMS", "ELEC"],
    "outerBounding": "480cm x 550cm",
    "scale": "1:50",
    "dxfReady": true
  },
  "dispatchedToWorker": "Codex 晶晶自動繪圖管線 (1:50 施工圖與 DXF 向量已鎖定)",
  "ackTimestamp": "2026-09-21T16:50:00.000Z",
  "message": "彥君 ABI 派工接收成功，幾何契約審計通過，已注入自動化生產線！"
}`}
                  </pre>
                </div>
              </div>
            )}

            {selectedEndpoint === 'generateDxf' && (
              <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono font-bold text-xs rounded border border-emerald-700">
                        POST
                      </span>
                      <span className="font-mono font-bold text-white text-sm">/api/drawings/generate-dxf</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      自動化圖面產生引擎核心端點。將傳入的測量空間幾何即時編譯為 AutoCAD R12/2000 AC1009 ASCII DXF 向量結構與 AutoLISP 批次腳本。
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunLiveTest('generateDxf')}
                      disabled={testingEndpoint === 'generateDxf' && testStatus === 'LOADING'}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                    >
                      {testingEndpoint === 'generateDxf' && testStatus === 'LOADING' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>線上生成圖面 (Generate DXF)</span>
                    </button>
                    <a
                      href="/api/drawings/generate-dxf?download=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>直接下載 DXF 檔案</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Request Body 與參數控制：</span>
                    <button
                      onClick={() => copyToClipboard(sampleCurlGenerateDxf, 'curl-gen-dxf', 'cURL 指令')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'curl-gen-dxf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>複製 cURL 指令</span>
                    </button>
                  </div>
                  <pre className="bg-[#080c14] p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto">
{`{
  "projectName": "星玥灣A1客廳放樣",       // 專案名稱 (出圖圖名)
  "format": "json",                      // 'json' | 'dxf' | 'lisp'
  "download": false,                     // 若為 true 則以附件直接下載 .dxf
  "roomData": {
    "roomName": "星玥灣客廳",
    "width": 480,
    "length": 550,
    "height": 280,
    "beamHeight": 265,
    "ceilingDrop": 230,
    "bathDrop": 215
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {selectedEndpoint === 'webhook' && (
              <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono font-bold text-xs rounded border border-emerald-700">
                        POST
                      </span>
                      <span className="font-mono font-bold text-white text-sm">/api/abi/webhook</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      設備狀態回呼與保活心跳端點。定時發送可維護服務端綠燈健康度，避免 69.4 小時失聯告警。
                    </p>
                  </div>

                  <button
                    onClick={() => handleRunLiveTest('webhook')}
                    disabled={testingEndpoint === 'webhook' && testStatus === 'LOADING'}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                  >
                    {testingEndpoint === 'webhook' && testStatus === 'LOADING' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>送出心跳保活測試 (Send Heartbeat)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300">支援事件類型 (Event Types)：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#121829] p-2.5 rounded border border-slate-800">
                      <code className="text-emerald-300 font-mono font-bold">HEARTBEAT</code>
                      <p className="text-[11px] text-slate-400 mt-0.5">定時保活心跳，重設 lastHeartbeatHoursAgo 為 0.01h (即時綠燈)。</p>
                    </div>
                    <div className="bg-[#121829] p-2.5 rounded border border-slate-800">
                      <code className="text-cyan-300 font-mono font-bold">SYNC_READY</code>
                      <p className="text-[11px] text-slate-400 mt-0.5">通知服務端現場測量已就緒，可開始全自動接收放樣單。</p>
                    </div>
                    <div className="bg-[#121829] p-2.5 rounded border border-slate-800">
                      <code className="text-indigo-300 font-mono font-bold">DRAWING_COMPLETED</code>
                      <p className="text-[11px] text-slate-400 mt-0.5">Codex 晶晶繪製完成廣播，回傳圖面驗收指紋與下載路徑。</p>
                    </div>
                    <div className="bg-[#121829] p-2.5 rounded border border-slate-800">
                      <code className="text-amber-300 font-mono font-bold">MEASUREMENT_ERROR</code>
                      <p className="text-[11px] text-slate-400 mt-0.5">設備端故障或紅外線反光盲區報警，自動記錄至 Webhook Logs。</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Request Body 範例：</span>
                    <button
                      onClick={() => copyToClipboard(sampleCurlWebhook, 'curl-webhook', 'cURL 指令')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'curl-webhook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>複製 cURL 指令</span>
                    </button>
                  </div>
                  <pre className="bg-[#080c14] p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto">
{`{
  "event": "HEARTBEAT",
  "sender": "YenJun_ABI_Watcher",
  "data": {
    "status": "GREEN_HEALTHY",
    "pendingQueueCount": 0,
    "timestamp": "${new Date().toISOString()}"
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {selectedEndpoint === 'status' && (
              <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-mono font-bold text-xs rounded border border-blue-700">
                        GET
                      </span>
                      <span className="font-mono font-bold text-white text-sm">/api/abi/status</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      查詢系統連線健康度、本機 Watcher 心跳燈號、佇列工單累積數量與最新 Webhook 接收日誌。
                    </p>
                  </div>

                  <button
                    onClick={() => handleRunLiveTest('status')}
                    disabled={testingEndpoint === 'status' && testStatus === 'LOADING'}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                  >
                    {testingEndpoint === 'status' && testStatus === 'LOADING' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>線上查詢連線狀態 (Check Status)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300">返回結構對照：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#121829] p-3 rounded border border-slate-800 font-mono">
                      <span className="text-slate-400 block text-[10px]">watcherStatus.heartbeatState</span>
                      <span className="text-emerald-400 font-bold">"GREEN_HEALTHY"</span> | <span className="text-rose-400 font-bold">"RED_ALERT"</span>
                    </div>
                    <div className="bg-[#121829] p-3 rounded border border-slate-800 font-mono">
                      <span className="text-slate-400 block text-[10px]">watcherStatus.pendingStuckDays</span>
                      <span className="text-amber-400 font-bold">19.8 天</span> (解塞後歸零)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Test Response Inspector */}
            {testResponse && (
              <div className="bg-[#080c14] border border-cyan-500/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    即時連線測試返回結果 (Live Test Response)：
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      testStatus === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {testStatus}
                  </span>
                </div>
                <pre className="bg-[#05080e] p-3 rounded text-xs font-mono text-slate-200 overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: AUTOMATED CAD DRAWING ENGINE */}
        {activeSection === 'cad_engine' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                自動化圖面產生引擎驅動架構 (CAD & AutoLISP Engine)
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                當 Express 後端接收到合格測量數據後，圖面引擎啟動三階向量渲染與腳本裝配流水線，
                將純文字數字轉換為直接可供雷射雕刻、AutoCAD 批次施工、以及 SketchUp 3D 拉伸的實體圖元。
              </p>

              {/* 7 Standard ACI Layers Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  AutoCAD 標準 7 大 ACI 施工圖層定義規範
                </span>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#141b2b] text-slate-300 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">圖層名稱 (Layer)</th>
                        <th className="py-2.5 px-3">ACI 色碼</th>
                        <th className="py-2.5 px-3">出圖線寬 (Lineweight)</th>
                        <th className="py-2.5 px-3">工程語意與圖元對象</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300 bg-[#0c101c]">
                      <tr>
                        <td className="py-2 px-3 font-bold text-white">WALL</td>
                        <td className="py-2 px-3 text-slate-300">7 (White)</td>
                        <td className="py-2 px-3 text-cyan-400">0.50 mm</td>
                        <td className="py-2 px-3 font-sans">外牆與隔間 RC / 輕隔間封閉牆體輪廓線</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-rose-400">BEAM</td>
                        <td className="py-2 px-3 text-rose-400">1 (Red)</td>
                        <td className="py-2 px-3 text-cyan-400">0.35 mm</td>
                        <td className="py-2 px-3 font-sans">結構主梁、次梁位置與穿梁套管標高</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-cyan-400">CEILING_STEP</td>
                        <td className="py-2 px-3 text-cyan-400">4 (Cyan)</td>
                        <td className="py-2 px-3 text-cyan-400">0.25 mm</td>
                        <td className="py-2 px-3 font-sans">吊隱式空調降板 230、廚衛落塵降板 215 階梯線</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-emerald-400">DIMENSION</td>
                        <td className="py-2 px-3 text-emerald-400">3 (Green)</td>
                        <td className="py-2 px-3 text-cyan-400">0.18 mm</td>
                        <td className="py-2 px-3 font-sans">開間進深尺寸線、標高引線與 5 倍數檢驗章</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-amber-400">ELECTRICAL</td>
                        <td className="py-2 px-3 text-amber-400">2 (Yellow)</td>
                        <td className="py-2 px-3 text-cyan-400">0.25 mm</td>
                        <td className="py-2 px-3 font-sans">開關 FL+120、插座 FL+30、強弱電分流管線</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-blue-400">OPENING</td>
                        <td className="py-2 px-3 text-blue-400">5 (Blue)</td>
                        <td className="py-2 px-3 text-cyan-400">0.25 mm</td>
                        <td className="py-2 px-3 font-sans">門窗洞口、開向弧線與窗台高度 (FL+90)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-purple-400">VOICE_TAGS</td>
                        <td className="py-2 px-3 text-purple-400">6 (Magenta)</td>
                        <td className="py-2 px-3 text-cyan-400">0.18 mm</td>
                        <td className="py-2 px-3 font-sans">現場口述丈量備忘、穿梁套管障礙物虛擬標記</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LISP Engine Generator Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  Codex 晶晶 AutoLISP 批次執行範本
                </span>
                <p className="text-slate-400 text-xs">
                  呼叫 <code className="text-cyan-300">/api/drawings/generate-dxf</code> 會同步產出下列純 LISP 代碼，可直接存為 <code className="text-amber-300">auto_draw.lsp</code> 並於 AutoCAD 中以 <code className="text-white">(load "auto_draw")</code> 自動批次出圖：
                </p>
                <pre className="bg-[#080c14] p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
{`(defun c:DRAW_ROOM ()
  (setvar "CMDECHO" 0)
  (setvar "OSMODE" 0)
  ;; 1. 建立標準 7 大 ACI 圖層
  (command "-LAYER" "M" "WALL" "C" "7" "" "LW" "0.50" "" "")
  (command "-LAYER" "M" "BEAM" "C" "1" "" "LW" "0.35" "" "")
  (command "-LAYER" "M" "CEILING_STEP" "C" "4" "" "LW" "0.25" "" "")
  (command "-LAYER" "M" "DIMENSION" "C" "3" "" "LW" "0.18" "" "")
  
  ;; 2. 繪製外牆閉合矩形
  (command "-LAYER" "S" "WALL" "")
  (command "RECTANG" (list 0 0) (list 480 550))
  
  ;; 3. 繪製結構梁 (梁下 265) 與空調降板 (230)
  (command "-LAYER" "S" "BEAM" "")
  (command "LINE" (list 0 220) (list 480 220) "")
  (command "-LAYER" "S" "CEILING_STEP" "")
  (command "LINE" (list 0 193) (list 480 193) "")
  
  ;; 4. 插入尺寸引線與 1:50 A3 驗收章
  (command "-LAYER" "S" "DIMENSION" "")
  (command "DIMLINEAR" (list 0 0) (list 480 0) (list 240 -25))
  (command "TEXT" (list 0 565) 7 0 "CERTIFIED: V-01~10 PASSED | 5X: 265/230/215")
  (setvar "CMDECHO" 1)
  (princ "\\n✓ 晶晶自動繪圖完成！比例尺 1:50")
  (princ)
)`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CODE EXAMPLES */}
        {activeSection === 'code_examples' && (
          <div className="space-y-6 max-w-5xl">
            {/* Node.js / TypeScript Example */}
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-950 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-700">
                    TS
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Node.js / TypeScript 生產級客戶端範例 (含原子寫檔與保活心跳)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(sampleNodeClientCode, 'node-sdk', 'TypeScript 代碼')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition"
                >
                  {copiedKey === 'node-sdk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>複製程式碼</span>
                </button>
              </div>

              <p className="text-slate-400 text-xs">
                適合安裝在現場平板、手持測繪端 Daemon 或現場中繼伺服器，自動監聽藍牙測距儀並拋轉出圖：
              </p>

              <pre className="bg-[#080c14] p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96">
                {sampleNodeClientCode}
              </pre>
            </div>

            {/* Python Example */}
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-950 text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-700">
                    PY
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Python (Requests) 極簡拋轉範例
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(samplePythonClientCode, 'py-sdk', 'Python 代碼')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition"
                >
                  {copiedKey === 'py-sdk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>複製程式碼</span>
                </button>
              </div>

              <pre className="bg-[#080c14] p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {samplePythonClientCode}
              </pre>
            </div>
          </div>
        )}

        {/* SECTION 5: TROUBLESHOOTING & FAQ */}
        {activeSection === 'troubleshooting' && (
          <div className="space-y-4 max-w-5xl">
            <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                常見對接故障排除與審計檢核手冊 (FAQ)
              </h3>

              <div className="space-y-3">
                {/* Q1 */}
                <div className="bg-[#121829] border border-slate-800 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Q1: 為什麼監控面板會出現「開工心跳紅燈 (失聯 69.4 小時)」？如何立即解除？</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    <strong>根因</strong>：外部監控程式 (Watcher) 長時間未向後端發送保活握手，後端進入保護鎖定（Safe-Lock）。<br />
                    <strong>解方</strong>：呼叫 <code className="text-cyan-300 font-mono">POST /api/pipeline/triage-action</code>，Payload 為 <code className="text-emerald-300 font-mono">&#123; "action": "RESTORE_WATCHER_HEARTBEAT" &#125;</code>，或直接向 <code className="text-cyan-300 font-mono">POST /api/abi/webhook</code> 發送一筆 <code className="text-emerald-300 font-mono">&#123; "event": "HEARTBEAT" &#125;</code>，系統狀態即刻切換為 <strong>GREEN_HEALTHY</strong>。
                  </p>
                </div>

                {/* Q2 */}
                <div className="bg-[#121829] border border-slate-800 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Q2: 現場實測大梁為 268cm 或 228cm 時，系統會如何處理？</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    <strong>剛性契約拒絕或警告</strong>：依據《降板裁決_v003.json》，標高必須遵守 5 倍數整數原則。非 5 倍數數值在現場會導致木作泥作畸零裁切公差。後端審查模組會自動將其判定為 <code className="text-rose-400 font-mono">NON_COMPLIANT</code>，並建議就近吸附至 <strong>265 cm</strong> 或 <strong>230 cm</strong> 契約標竿線。
                  </p>
                </div>

                {/* Q3 */}
                <div className="bg-[#121829] border border-slate-800 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Q3: 如何預防 CAD 驗收中的 V-03 重複圖元疊圖 與 V-04 視埠遮擋問題？</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    <strong>V-03 去重</strong>：後端圖面引擎已內建 Overkill 演算法，在生成多段線時會自動合併重疊線段，避免雷射機重複雕刻；<br />
                    <strong>V-04 視埠邊界</strong>：所有圖紙佈局強制採用自動預留邊距（Padding ≥ 35mm），保證電視牆立面等尺寸引線 100% 完整顯示於 A3 圖框內。
                  </p>
                </div>

                {/* Q4 */}
                <div className="bg-[#121829] border border-slate-800 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Q4: 外部系統可否直接取得圖面輸出而不依賴前端瀏覽器？</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    可以！直接呼叫 <code className="text-cyan-300 font-mono">POST /api/drawings/generate-dxf</code>，帶上 <code className="text-emerald-300 font-mono">format: "dxf"</code> 或 <code className="text-emerald-300 font-mono">download: true</code>，伺服器將直接以原始 ASCII DXF 文件串流回傳，可直接寫入硬碟或傳送至數控設備。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Status Footer */}
      <div className="bg-[#0d121c] border-t border-slate-800/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Express 後端對接端點正常在線 · 連接埠: 3000 · 跨域 CORS 已開放</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunLiveTest('status')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>檢查連線健康度</span>
          </button>
        </div>
      </div>
    </div>
  );
};
