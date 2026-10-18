import React from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Box,
  Layers,
  Ruler,
  DollarSign,
  HeartHandshake,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface DesignerTruthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSketchUpExport?: () => void;
}

export const DesignerTruthGuideModal: React.FC<DesignerTruthGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSketchUpExport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>設計師真心話與實戰解惑</span>
                <span className="text-[11px] font-normal text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                  顧問級診斷
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                面對面解答：仰角真相、畫面變綠、不再被外包 AI 忽悠、直接對接 SketchUp 渲染
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* 1. 給辛苦 3 個月與花費的你：真誠的止血診斷 */}
          <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/40 rounded-xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>【給這 3 個月花錢受挫的你】為什麼做出來的都跟你想的不一樣？</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              你辛苦了。看著你寫下「一直在失望中給自己振奮精神、但做出來好像都跟我想的不太一樣、花了很多錢到底該怎麼辦」，任何真正懂工程與設計的人都會為你心疼。
            </p>
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-red-900/40 space-y-1.5 text-xs text-slate-200">
              <div className="font-bold text-amber-300">💡 過去 3 個月外包團隊踩坑的兩大根本病因：</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong className="text-white">病因一：工程師不懂室內設計，拿「生圖型 AI」忽悠你</strong>。AI 生圖（如 Midjourney、Stable Diffusion）每次都在憑空猜測，它根本不懂 280 梁底、230 降板、更不懂你精心計算的櫃體模數，每次都會畫出奇奇怪怪的假家具與錯誤尺寸！
                </li>
                <li>
                  <strong className="text-white">病因二：你需要的是「幾何直切 (Section Slicing)」，而不是「重新生成」</strong>。設計師自己畫好的平面或 3D，絕對不能交給 AI 重新畫！正確做法是像手術刀一樣，直接剖開原圖取出 2D 向量線，這才是真實的工務圖面！
                </li>
              </ul>
            </div>
          </div>

          {/* 2. 什麼是仰角？為什麼要仰角？是真正的拍嗎？ */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-cyan-500/40 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Compass className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span>一、什麼是「仰角」？為什麼要仰角？是真正的拍嗎？</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">白話解釋：</strong>「仰角 (Pitch Angle)」就是你拿著 iPad 時，<span className="text-cyan-300 font-bold">鏡頭是朝上仰看天花板、還是朝下俯看地板</span>的傾斜角度。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-amber-400 font-bold mb-1">❌ 為什麼鏡頭有仰角會壞事？</div>
                <p className="text-slate-400">
                  如果你拿 iPad 向上仰拍或低頭拍，垂直的牆壁在畫面上會變成「上寬下窄」或「下寬上窄」的梯形（透視變形）。這就是為什麼很多軟體算出來的尺寸全部漂移！
                </p>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/40">
                <div className="text-emerald-300 font-bold mb-1">✅ 本系統怎麼幫你解決？</div>
                <p className="text-slate-300">
                  <strong className="text-white">你完全不需要記任何角度！</strong> 只要像「端著一盤水」一樣將 iPad 平舉在胸口（約 FL+140cm），看著畫面中央的綠色圓點亮起，仰角就自動為 0°，垂直牆面 100% 筆直無變形！
                </p>
              </div>
            </div>
          </div>

          {/* 3. 為什麼人家的畫面會變綠色？我們的掃描是不是真的？ */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-emerald-500/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>二、為什麼人家的畫面會變綠色？我們的掃描有沒有依據？</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              像 Apple iPad LiDAR（Polycam、Canvas、RoomPlan）在掃描時，鏡頭移過去的地方會亮起一層綠色的三角形網格（Mesh）：
            </p>
            <div className="bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-600/40 space-y-2 text-xs">
              <div className="text-emerald-300 font-bold">🟢 螢幕畫面變綠色的真實意義：</div>
              <p className="text-slate-200">
                它在告訴你：<strong className="text-emerald-300">「這一塊牆面的空間點雲幾何，已經被電腦成功吃進資料庫了，你不用再重複對著它拍！」</strong>
              </p>
              <p className="text-slate-300">
                我們系統現已全面實裝此功能：當你拿相機對準牆面時，<span className="text-emerald-400 font-bold">綠色網格會從 0% 鋪滿至 100%</span>，鋪滿時發出「嗶」一聲自動鎖定，讓你一目了然知道這面牆已經確實被收錄！
              </p>
            </div>
          </div>

          {/* 4. 為什麼會出現沙發跟電視牆？現場如果不是客廳怎麼辦？ */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-indigo-500/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Layers className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>三、為什麼畫面會出現沙發跟電視牆？空屋或毛胚怎麼辦？</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              很多工程師為了做範例，硬塞了「電視牆」、「沙發背牆」，但設計師去現場往往是空屋或毛胚，現場只有水泥和梁柱，看到沙發兩個字當然滿頭問號！
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-cyan-300">👉 本系統已更新為【毛胚空屋 (自由量測)】預設模式：</div>
              <p className="text-slate-300">
                四面牆純粹就是：<strong className="text-white">第 1 面牆 (0° 起點正面)</strong> ➜ <strong className="text-white">第 2 面牆 (90° 右側牆)</strong> ➜ <strong className="text-white">第 3 面牆 (180° 後方背牆)</strong> ➜ <strong className="text-white">第 4 面牆 (270° 左側隔間牆)</strong>。完全不預設立場，任何空屋、臥室、浴室都能無腦對照！
              </p>
            </div>
          </div>

          {/* 5. 輔助線太多變成負擔？ */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-teal-500/40 space-y-2.5">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
              <Ruler className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <span>四、輔助線太多多到變成負擔？</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              我們在相機頂部第一顆按鈕放上了 <strong className="text-emerald-400">【🌿 極簡實測模式 (隱藏雜線)】</strong>，並為你預設開啟！
              關閉所有複雜度數規、十字標尺、高程文字，只保留乾淨的實境鏡頭、綠色點雲覆蓋進度，以及畫面中央那個告訴你手有沒有端平的綠色水平圓點！
            </p>
          </div>

          {/* 6. 它能直接套用到 SketchUp (schedule up) 裡面去做 3D 渲染嗎？ */}
          <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 p-4 sm:p-5 rounded-xl border border-purple-400/50 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Box className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>五、它能直接套用到 SketchUp 裡面去做 3D 渲染嗎？</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-semibold">
              <span className="text-emerald-400 font-black text-base">答案是：100% 可以！而且非常簡單！</span>
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                我們系統產出的 DXF 是標準 AutoCAD/SketchUp 向量幾何（單位是公分），不需要任何外部插件：
              </p>
              <div className="bg-slate-950 p-3.5 rounded-lg border border-purple-800/50 space-y-2">
                <div className="font-bold text-purple-200">🛠️ 3 步驟導入 SketchUp 立即起模：</div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                  <li>
                    點擊下方【<strong className="text-cyan-300">匯出 SketchUp DXF 放樣檔</strong>】，下載 1:1 放樣切圖檔。
                  </li>
                  <li>
                    打開 SketchUp，點擊 <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">檔案 (File) ➜ 匯入 (Import)</code>，選擇此 DXF 檔，在匯入選項中<strong className="text-emerald-400">單位務必勾選「公分 (Centimeters)」</strong>。
                  </li>
                  <li>
                    平面底圖與 4 面立面外框會原寸出現在世界座標原點！拿起 SketchUp 內建的<strong className="text-cyan-300">「推拉 (Push/Pull)」工具</strong>往上推拉 280cm，1 秒鐘長出牆體，直接套材質與進 Enscape/V-Ray 渲染！
                  </li>
                </ol>
              </div>
            </div>
            {onOpenSketchUpExport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSketchUpExport();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-purple-400/40"
              >
                <Box className="w-4 h-4" />
                <span>立即查看並下載 SketchUp 專用 1:1 DXF 檔 ➜</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            室內設計全室實測契約 · 讓技術回歸工務真實場景
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition"
          >
            我完全看懂了，回實測畫面
          </button>
        </div>
      </div>
    </div>
  );
};
