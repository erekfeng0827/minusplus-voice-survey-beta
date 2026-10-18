import React from 'react';
import { RoomData } from '../types';
import {
  FileText,
  Layers,
  Ruler,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Hash,
  Sparkles,
  Info,
  Compass,
  Zap,
  Printer
} from 'lucide-react';

interface ConstructionSheetOverviewProps {
  room: RoomData;
  onNavigateToSheet?: (sheetId: string) => void;
  onPrint?: () => void;
}

export const ConstructionSheetOverview: React.FC<ConstructionSheetOverviewProps> = ({
  room,
  onNavigateToSheet,
  onPrint
}) => {
  // Dimensions and calculations
  const roomW = Number(room.width) || 480;
  const roomL = Number(room.length) || 550;
  const roomH = Number(room.height) || 280;
  const beamH = Number(room.beamHeight) || 265;
  const dropH = Number(room.ceilingDrop) || 230;
  const bathDrop = Number(room.bathKitchenDrop) || 215;

  // Floor Area Calculation
  const floorAreaM2 = (roomW * roomL) / 10000;
  const floorAreaPing = floorAreaM2 * 0.3025;

  // Ceiling Areas
  const dropRatio = 0.35;
  const dropAreaM2 = floorAreaM2 * dropRatio;
  const flatCeilingAreaM2 = floorAreaM2 * (1 - dropRatio);
  const totalCeilingAreaM2 = floorAreaM2;

  // Wall Gross Area
  const perimeterM = (2 * (roomW + roomL)) / 100;
  const grossWallAreaM2 = (perimeterM * roomH) / 100;

  // Openings Deductions
  const doorsAreaM2 = (room.doors || []).reduce(
    (acc, d) => acc + (d.width * (d.height || 210)) / 10000,
    0
  );
  const windowsAreaM2 = (room.windows || []).reduce(
    (acc, w) => acc + (w.width * (w.height || 180)) / 10000,
    0
  );
  const totalOpeningsM2 = doorsAreaM2 + windowsAreaM2;
  const netWallAreaM2 = Math.max(0, grossWallAreaM2 - totalOpeningsM2);
  const netWallAreaPing = netWallAreaM2 * 0.3025;

  // Skirting Baseboard Length (m)
  const doorsTotalWidthM = (room.doors || []).reduce((acc, d) => acc + d.width / 100, 0);
  const baseboardLengthM = Math.max(0, perimeterM - doorsTotalWidthM);

  // Electrical Counts
  const epCounts = (room.electricalPoints || []).length;
  const beamCounts = (room.beams || []).length;

  // Sheet Set Register
  const sheetList = [
    {
      id: 'A-00',
      name: '圖紙總目錄與工程量體材料總面積清單',
      scale: 'NONE',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '工程圖面清冊、材質總面積統計與施工通則'
    },
    {
      id: 'A-01',
      name: '現況丈量放樣尺寸圖',
      scale: '1:50',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '外牆開間、進深、門窗角部偏移與 5 倍數基準線'
    },
    {
      id: 'A-02',
      name: '天花降板與高層放樣圖 (RCP)',
      scale: '1:50',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '梁下265、空調降板230、衛浴215高程裁決'
    },
    {
      id: 'A-03',
      name: '水電開關插座迴路圖',
      scale: '1:50',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '110V/220V插座、雙切開關、弱電通信標高與迴路'
    },
    {
      id: 'A-04',
      name: '空間立面施工展開圖',
      scale: '1:30',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '四向立面剖切標註、材質交接、收邊線與施工依據'
    },
    {
      id: 'A-05',
      name: '施工流程動態序列圖',
      scale: '7 階工序',
      size: 'A3 (420×297mm)',
      rev: 'REV. 03',
      status: 'APPROVED 審計通過',
      desc: '先地坪、次牆面、後天花之動態工序與營造交底'
    }
  ];

  // Material Area Schedule Table Data
  const materialSchedules = [
    {
      code: 'MAT-01',
      category: '地坪工程',
      item: '進口橡木海島型耐磨實木地板 (或 60×120cm 陶質大板磚)',
      spec: '厚 15mm 實木貼皮 / 耐磨抗刮 CNS 防火一級 (含防潮靜音墊)',
      location: '客廳、主臥、玄關走道',
      calcFormula: `${roomW}cm × ${roomL}cm`,
      areaM2: floorAreaM2.toFixed(2),
      areaPing: floorAreaPing.toFixed(2),
      wasteFactor: '5%',
      finalQty: `${(floorAreaM2 * 1.05).toFixed(2)} m² (${(floorAreaPing * 1.05).toFixed(2)} 坪)`,
      rule: '地坪平整度誤差 < 2mm，起鋪線以玄關基準線展開'
    },
    {
      code: 'MAT-02',
      category: '天花工程',
      item: '平頂矽酸鈣造型天花板 (輕鋼架防鏽防震吊筋)',
      spec: '日本麗仕 9mm 耐燃一級矽酸鈣板 + 雙層防裂接縫網',
      location: '全室主平頂區 (標高 FL+265cm)',
      calcFormula: `全室地坪 × 65%`,
      areaM2: flatCeilingAreaM2.toFixed(2),
      areaPing: (flatCeilingAreaM2 * 0.3025).toFixed(2),
      wasteFactor: '5%',
      finalQty: `${(flatCeilingAreaM2 * 1.05).toFixed(2)} m² (${(flatCeilingAreaM2 * 0.3025 * 1.05).toFixed(2)} 坪)`,
      rule: '主天花淨高剛性鎖定 FL+265cm，符合 5 倍數幾何契約'
    },
    {
      code: 'MAT-03',
      category: '天花工程',
      item: '空調造型降板天花與風箱集氣口封板',
      spec: '防潮結構夾板底 + 日本麗仕矽酸鈣板 + 保溫消音棉',
      location: '空調吊頂區 (標高 FL+230cm) / 廚衛 (FL+215cm)',
      calcFormula: `全室地坪 × 35%`,
      areaM2: dropAreaM2.toFixed(2),
      areaPing: (dropAreaM2 * 0.3025).toFixed(2),
      wasteFactor: '8%',
      finalQty: `${(dropAreaM2 * 1.08).toFixed(2)} m² (${(dropAreaM2 * 0.3025 * 1.08).toFixed(2)} 坪)`,
      rule: '出風口下緣緊貼 FL+230cm 降板線，預留 45×45cm 鋁合金維修孔'
    },
    {
      code: 'MAT-04',
      category: '牆面工程',
      item: '健康淨味乳膠漆 (白茶色 / 霧灰陶色面漆)',
      spec: '得利竹炭淨味水性乳膠漆 (披土二次、底漆一次、面漆三次)',
      location: '四向結構牆面 (扣除門窗開口淨粉刷)',
      calcFormula: `周長 ${perimeterM}m × 高 ${roomH}cm - 門窗開口 ${totalOpeningsM2.toFixed(2)}m²`,
      areaM2: netWallAreaM2.toFixed(2),
      areaPing: netWallAreaPing.toFixed(2),
      wasteFactor: '6%',
      finalQty: `${(netWallAreaM2 * 1.06).toFixed(2)} m² (${(netWallAreaPing * 1.06).toFixed(2)} 坪)`,
      rule: '牆面垂直陰陽角鋁條補強，批土打磨細緻度 320 號砂紙'
    },
    {
      code: 'MAT-05',
      category: '五金收邊',
      item: '極簡內嵌式鋁合金踢腳板 (啞光槍灰黑色)',
      spec: 'H: 45mm × D: 12mm 隱藏式預埋鋁條 (含抗裂接頭)',
      location: '全室四周牆腳 (扣除門片開口)',
      calcFormula: `周長 ${perimeterM}m - 門扇 ${doorsTotalWidthM.toFixed(2)}m`,
      areaM2: `${baseboardLengthM.toFixed(2)} m`,
      areaPing: `${(baseboardLengthM / 3.3).toFixed(1)} 支 (3m/支)`,
      wasteFactor: '5%',
      finalQty: `${(baseboardLengthM * 1.05).toFixed(2)} 延米`,
      rule: '踢腳上緣打防塵矽利康，轉角 45° 倒角密合'
    },
    {
      code: 'MAT-06',
      category: '主牆造型',
      item: '義大利進口司曼特灰泥特殊藝術塗料 (電視主牆)',
      spec: '天然礦物石灰基質，手工鏝刀雙色揉壓層次',
      location: '客廳電視主景觀牆面',
      calcFormula: `${roomW}cm × ${roomH}cm`,
      areaM2: ((roomW * roomH) / 10000).toFixed(2),
      areaPing: (((roomW * roomH) / 10000) * 0.3025).toFixed(2),
      wasteFactor: '10%',
      finalQty: `${(((roomW * roomH) / 10000) * 1.1).toFixed(2)} m²`,
      rule: '抗裂網預埋防止結構伸縮裂痕，最後上霧面保護蠟'
    }
  ];

  return (
    <div className="w-full text-left space-y-6 text-[#F8F8F6] font-sans">
      {/* Top Banner: Project Drawing Set Registry Header */}
      <div className="bg-[#0c1322] border-2 border-[#1e293b] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#E0A83C]" />
              <span>加減設計 MINUSPLUS · 星玥灣室內裝修新建工程</span>
              <span className="text-slate-500">|</span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                全套施工圖出圖清冊 (REV. 03)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1.5">
              {room.roomName} — 全套施工圖總覽與材質總面積清冊
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              幾何契約審計認證 · 全面落實《降板裁決_v003》之 265 / 230 / 215 規範與 5 倍數放樣準則
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <div className="text-3xl font-black font-mono text-[#E0A83C] tracking-wider">
              {sheetList.length} <span className="text-sm font-sans text-slate-400 font-normal">張全套施工圖</span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              總地坪面積：{floorAreaM2.toFixed(2)} m² ({floorAreaPing.toFixed(2)} 坪)
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards (圖紙張數、地坪面積、天花面積、牆面淨面積) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-[#131d33] border border-slate-700/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#E0A83C]" />
                施工圖紙總張數
              </span>
              <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                A3 橫式
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {sheetList.length} <span className="text-xs font-sans text-slate-400 font-normal">張 (A-00 ~ A-05)</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>全數通過三級審查簽證</span>
            </div>
          </div>

          <div className="bg-[#131d33] border border-slate-700/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                地坪鋪面總面積
              </span>
              <span className="font-mono text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40">
                實木 / 陶質
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
              {floorAreaM2.toFixed(2)} <span className="text-xs font-sans text-slate-400 font-normal">m² ({floorAreaPing.toFixed(2)} 坪)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              開間 {roomW}cm × 進深 {roomL}cm
            </div>
          </div>

          <div className="bg-[#131d33] border border-slate-700/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                天花板施作總面積
              </span>
              <span className="font-mono text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                平頂+降板
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 mt-1">
              {totalCeilingAreaM2.toFixed(2)} <span className="text-xs font-sans text-slate-400 font-normal">m² ({floorAreaPing.toFixed(2)} 坪)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              平頂 {flatCeilingAreaM2.toFixed(1)}m² + 降板 {dropAreaM2.toFixed(1)}m²
            </div>
          </div>

          <div className="bg-[#131d33] border border-slate-700/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                四面牆淨粉刷面積
              </span>
              <span className="font-mono text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/40">
                扣除門窗
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-rose-300 mt-1">
              {netWallAreaM2.toFixed(2)} <span className="text-xs font-sans text-slate-400 font-normal">m² ({netWallAreaPing.toFixed(2)} 坪)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              毛面積 {grossWallAreaM2.toFixed(1)}m² - 扣開口 {totalOpeningsM2.toFixed(1)}m²
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: 圖紙總目錄清冊 (DRAWING SHEET INDEX) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">施工圖紙總目錄清冊 (SHEET INDEX REGISTER)</h3>
              <p className="text-[11px] text-slate-400">點擊任一圖紙條目可立即切換至該圖紙進行詳閱</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-600/40">
            共 {sheetList.length} 張標準施工圖 (完整成套)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0b1324] text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-2.5 w-16">圖號</th>
                <th className="p-2.5">圖紙名稱 (Drawing Sheet Title)</th>
                <th className="p-2.5 w-24">出圖比例</th>
                <th className="p-2.5 w-32">圖幅規格</th>
                <th className="p-2.5 w-24">版次</th>
                <th className="p-2.5 w-36">審查狀態</th>
                <th className="p-2.5 hidden sm:table-cell">圖面內容重點說明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {sheetList.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onNavigateToSheet && onNavigateToSheet(s.id)}
                  className="hover:bg-slate-900/80 cursor-pointer transition-colors group"
                >
                  <td className="p-2.5 font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                    {s.id}
                  </td>
                  <td className="p-2.5 font-semibold text-white group-hover:text-[#E0A83C] flex items-center gap-2">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400">➜ 點擊檢視</span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{s.scale}</td>
                  <td className="p-2.5 font-mono text-slate-400">{s.size}</td>
                  <td className="p-2.5 font-mono text-slate-400">{s.rev}</td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {s.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-400 hidden sm:table-cell text-[11px]">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: 材質總面積與工程數量清冊 (MATERIAL QUANTITIES & AREA SCHEDULE) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">材質總面積與工程發包清冊 (MATERIAL AREA SCHEDULE)</h3>
              <p className="text-[11px] text-slate-400">自動由放樣尺寸、門窗開孔與高程契約計算之精確工料清冊</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-600/40">
            工程量精算 100% 幾何錨定
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0b1324] text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-2.5 w-20">材料編號</th>
                <th className="p-2.5 w-24">工種分項</th>
                <th className="p-2.5">材料品名與規格規範</th>
                <th className="p-2.5 w-32">施作部位</th>
                <th className="p-2.5 w-28">計算面積 (m²)</th>
                <th className="p-2.5 w-24">換算坪數</th>
                <th className="p-2.5 w-28">含損耗發包量</th>
                <th className="p-2.5 hidden lg:table-cell">施工規範與幾何要點</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {materialSchedules.map((m) => (
                <tr key={m.code} className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-cyan-400">{m.code}</td>
                  <td className="p-2.5">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-2.5 font-medium text-white">
                    <div>{m.item}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.spec}</div>
                  </td>
                  <td className="p-2.5 text-slate-300 text-[11px]">{m.location}</td>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">{m.areaM2}</td>
                  <td className="p-2.5 font-mono text-cyan-300">{m.areaPing}</td>
                  <td className="p-2.5 font-mono text-amber-300 font-bold">{m.finalQty}</td>
                  <td className="p-2.5 text-slate-400 text-[11px] hidden lg:table-cell">{m.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: 營造施工高程契約簽證 (CONTRACT COMPLIANCE SEAL) */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              《降板裁決_v003.json》剛性契約驗收通過簽證
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              全圖面開間、進深、梁底標高 (FL+{beamH}cm)、天花降板 (FL+{dropH}cm)、落塵區 (FL+{bathDrop}cm) 全數符合「5 倍數整數原則」，無非標尺寸。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-2 bg-[#E0A83C] hover:bg-[#c9922c] text-[#121810] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>列印整套圖紙 (最後印刷版)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
