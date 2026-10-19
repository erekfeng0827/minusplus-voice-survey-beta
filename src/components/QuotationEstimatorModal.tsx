import React, { useEffect, useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Coins,
  X,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { RoomData, QuotationLineItem } from '../types';

interface QuotationEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  allRooms: RoomData[];
  onNotify: (msg: string) => void;
}

export function calculateQuotationMetrics(rooms: RoomData[]) {
  const blocks = rooms.flatMap((item) => item.placedBlocks || []);
  const cabinetBlocks = blocks.filter((item) => item.subCategory.includes('cabinet') || item.subCategory.includes('wardrobe') || /櫃|柜|衣櫥|衣橱/.test(item.name));
  const stairBlocks = blocks.filter((item) => item.subCategory.startsWith('stair:') || /樓梯|楼梯|直梯|旋轉梯|旋转梯/.test(item.name));
  return {
    cabinetRunMeters: Number((cabinetBlocks.reduce((sum, item) => sum + item.widthCm, 0) / 100).toFixed(2)),
    cabinetBlockCount: cabinetBlocks.length,
    stairSetCount: stairBlocks.length,
    openingCount: rooms.reduce((sum, item) => sum + (item.doors?.length || 0) + (item.windows?.length || 0), 0),
  };
}

export const QuotationEstimatorModal: React.FC<QuotationEstimatorModalProps> = ({
  isOpen,
  onClose,
  room,
  allRooms,
  onNotify,
}) => {
  const [scope, setScope] = useState<'CURRENT_ROOM' | 'WHOLE_HOUSE'>('CURRENT_ROOM');
  const [markupPercent, setMarkupPercent] = useState<number>(10); // 利潤與管理費 10%
  const [taxPercent, setTaxPercent] = useState<number>(5); // 營業稅 5%

  // 根據空間計算天花坪數與構件數量
  const activeRooms = scope === 'CURRENT_ROOM' ? [room] : allRooms;

  // 計算幾何指標
  const totalFloorPing = useMemo(() => {
    return activeRooms.reduce((acc, r) => acc + (r.width * r.length) / 10000 * 0.3025, 0);
  }, [activeRooms]);

  const totalMepPointsCount = useMemo(() => {
    return activeRooms.reduce((acc, r) => acc + (r.electricalPoints?.length || 0), 0);
  }, [activeRooms]);

  const totalLightingPointsCount = useMemo(() => {
    return activeRooms.reduce((acc, r) => acc + (r.lightingPoints?.length || 0), 0);
  }, [activeRooms]);
  const quotationMetrics = useMemo(() => calculateQuotationMetrics(scope === 'CURRENT_ROOM' ? [room] : allRooms), [scope, room, allRooms]);

  // 初始工項資料
  const [items, setItems] = useState<QuotationLineItem[]>([
    {
      id: 'Q-01',
      category: 'CEILING',
      name: '平頂矽酸鈣天花板 (H+265cm)',
      specification: '日本麗仕 6mm 防火防潮矽酸鈣板 + 鍍鋅防鏽輕鋼骨料 @30cm',
      unit: '坪',
      quantity: 0,
      unitPrice: 4200,
      subtotal: 0,
      notes: '待天花分區面積完成後輸入；不得用地坪面積直接推定',
      ruleReference: '降板裁決_v003 第2條',
    },
    {
      id: 'Q-02',
      category: 'HVAC_DROP',
      name: '冷氣吊隱箱跌級降板造型天花 (H+230cm)',
      specification: '配合吊隱風箱下沉 50cm，雙層下垂工法含 45° 倒角防裂',
      unit: '坪',
      quantity: 0,
      unitPrice: 5800,
      subtotal: 0,
      notes: '待降板邊界或天花圖確認後輸入',
      ruleReference: '降板裁決_v003 第4條',
    },
    {
      id: 'Q-03',
      category: 'CEILING',
      name: '窗簾盒暨 LED 間接反光燈槽',
      specification: '深 20cm × 降 15cm，夾板結構底層加強，含雙色溫鋁擠燈條槽',
      unit: 'm',
      quantity: 0,
      unitPrice: 1200,
      subtotal: 0,
      notes: '待窗簾盒實測長度確認後輸入',
      ruleReference: '大樣圖庫 D-02',
    },
    {
      id: 'Q-04',
      category: 'CEILING',
      name: '結構大梁天花假梁包覆工程',
      specification: '寬 45cm × 高 140cm 包覆大梁穿越區，雙層石膏板隔音',
      unit: 'm',
      quantity: 0,
      unitPrice: 1600,
      subtotal: 0,
      notes: '待梁體包覆範圍確認後輸入',
      ruleReference: '大樣圖庫 D-06',
    },
    {
      id: 'Q-05',
      category: 'MEP_CIRCUIT',
      name: '110V 雙聯接地插座專用迴路',
      specification: '太平洋 2.0mm 單芯線 + CD 阻燃導管，全室迴路獨立無共用',
      unit: '組',
      quantity: totalMepPointsCount,
      unitPrice: 1800,
      subtotal: 0,
      notes: '符合現場放樣 H+30cm / H+120cm 規範',
      ruleReference: '室內設計水電規範',
    },
    {
      id: 'Q-06',
      category: 'MEP_CIRCUIT',
      name: '220V 吊隱冷氣機與大功率專用迴路',
      specification: '太平洋 3.5mm² 絞線 + 漏電斷路器 20A 專用箱體接點',
      unit: '組',
      quantity: 0,
      unitPrice: 3200,
      subtotal: 0,
      notes: '待空調設備表確認後輸入',
      ruleReference: '水電規範 E-POWR-220V',
    },
    {
      id: 'Q-07',
      category: 'LIGHTING',
      name: '7.5cm 深杯防眩 LED 崁燈 (含洗孔與配線)',
      specification: 'OSRAM 9W 晶片，Ra>92，UGR<19 防眩光深杯，色溫 3000K',
      unit: '盞',
      quantity: totalLightingPointsCount,
      unitPrice: 1250,
      subtotal: 0,
      notes: '天花高層 FL+265 開孔放樣，距牆安全距離 80cm',
      ruleReference: '燈具迴路規範 L-FIXT-DOWN',
    },
    {
      id: 'Q-08',
      category: 'STAKING_LABOR',
      name: '現場紅外線雷射放樣與幾何契約 5 倍數校正工資',
      specification: '全室高精度綠光雷射儀器對位，放樣墨線彈標與複測驗收',
      unit: '式',
      quantity: 1,
      unitPrice: 8500,
      subtotal: 0,
      notes: '專業甲級室內裝修技術士現場親校，出具 V-01~10 簽證',
      ruleReference: '降板裁決_v003 驗收章節',
    },
    {
      id: 'Q-09', category: 'CARPENTRY', name: '已配置櫃體／衣櫃延米', specification: '依平面配置圖塊實際寬度合計；深度、高度、板材及五金仍需設計師確認', unit: 'm', quantity: 0, unitPrice: 0, subtotal: 0,
      notes: '數量由已放置櫃體圖塊帶入；單價保持 0，避免未詢價即產生假報價', ruleReference: '全案配置資料接口',
    },
    {
      id: 'Q-10', category: 'STAIR', name: '已配置樓梯系統', specification: '直梯／L 型梯／U 型梯／旋轉梯依配置圖塊計數；結構、材質與法規另審', unit: '組', quantity: 0, unitPrice: 0, subtotal: 0,
      notes: '只帶入已建檔樓梯數量；正式估價須確認踏階、轉台、結構與扶手', ruleReference: '樓梯參數化圖塊',
    },
    {
      id: 'Q-11', category: 'OPENING', name: '已丈量門窗開口', specification: '依現場丈量已建檔門片與窗戶總數帶入', unit: '組', quantity: 0, unitPrice: 0, subtotal: 0,
      notes: '僅為資料完整性接口；材質、窗型、五金與施工方式尚待核價', ruleReference: '門窗丈量資料',
    },
  ]);

  useEffect(() => {
    setItems((previous) => previous.map((item) => {
      if (item.id === 'Q-05') return { ...item, quantity: totalMepPointsCount };
      if (item.id === 'Q-07') return { ...item, quantity: totalLightingPointsCount };
      if (item.id === 'Q-09') return { ...item, quantity: quotationMetrics.cabinetRunMeters };
      if (item.id === 'Q-10') return { ...item, quantity: quotationMetrics.stairSetCount };
      if (item.id === 'Q-11') return { ...item, quantity: quotationMetrics.openingCount };
      return item;
    }));
  }, [totalMepPointsCount, totalLightingPointsCount, quotationMetrics]);

  // 動態計算小計
  const calculatedItems = useMemo(() => {
    return items.map((it) => ({
      ...it,
      subtotal: Math.round(it.quantity * it.unitPrice),
    }));
  }, [items]);

  // 計算總計
  const rawSubtotal = useMemo(() => {
    return calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
  }, [calculatedItems]);

  const managementFee = useMemo(() => {
    return Math.round(rawSubtotal * (markupPercent / 100));
  }, [rawSubtotal, markupPercent]);

  const taxAmount = useMemo(() => {
    return Math.round((rawSubtotal + managementFee) * (taxPercent / 100));
  }, [rawSubtotal, managementFee, taxPercent]);

  const grandTotal = useMemo(() => {
    return rawSubtotal + managementFee + taxAmount;
  }, [rawSubtotal, managementFee, taxAmount]);

  if (!isOpen) return null;

  // 修改單價
  const handleUpdateUnitPrice = (id: string, newPrice: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unitPrice: Math.max(0, newPrice) } : it))
    );
  };

  // 修改數量
  const handleUpdateQuantity = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(0, newQty) } : it))
    );
  };

  // 匯出 CSV
  const handleExportCsv = () => {
    let csv = '\uFEFF項次,工項類別,工項名稱,規格材料說明,單位,數量,單價(NTD),複價(NTD),規範依據,備註\n';
    calculatedItems.forEach((it, idx) => {
      csv += `"${idx + 1}","${it.category}","${it.name}","${it.specification}","${it.unit}","${it.quantity}","${it.unitPrice}","${it.subtotal}","${it.ruleReference || ''}","${it.notes}"\n`;
    });
    csv += `,,,,,,工程未稅小計,"${rawSubtotal}",,\n`;
    csv += `,,,,,,工程管理與利潤費 (${markupPercent}%),"${managementFee}",,\n`;
    csv += `,,,,,,營業稅 (${taxPercent}%),"${taxAmount}",,\n`;
    csv += `,,,,,,工程含稅總估算額,"${grandTotal}",,\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `室內設計_${room.roomName}_工程報價概算單_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('📊 報價概算單 CSV 檔案已成功下載！');
  };

  // 列印預覽
  const handlePrint = () => {
    window.print();
    onNotify('🖨️ 已喚起系統列印 / 另存 PDF 視窗');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  工程數量與報價資料接口
                </h3>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                  實測數量優先
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                只自動帶入已存在的空間與點位資料；缺少的數量保持 0，單價需人工確認
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all border border-slate-700"
              title="列印 / 另存為 PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scope & Parameter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-900/60 border-b border-slate-800 text-xs">
          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">概算範圍:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setScope('CURRENT_ROOM')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  scope === 'CURRENT_ROOM'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                當前空間 ({room.roomName})
              </button>
              <button
                onClick={() => setScope('WHOLE_HOUSE')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  scope === 'WHOLE_HOUSE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                室內設計全室整合 (全空間)
              </button>
            </div>

            <span className="text-slate-500 ml-2">
              總地坪: <b className="text-amber-400">{totalFloorPing.toFixed(1)} 坪</b> | 
              已建檔水電: <b className="text-amber-400">{totalMepPointsCount}</b> | 已建檔燈具: <b className="text-amber-400">{totalLightingPointsCount}</b> | 櫃體: <b className="text-amber-400">{quotationMetrics.cabinetRunMeters}m</b> | 樓梯: <b className="text-amber-400">{quotationMetrics.stairSetCount}</b>
            </span>
          </div>

          {/* Tax & Markup */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">管理利潤:</span>
              <input
                type="number"
                min="0"
                max="25"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono outline-none"
              />
              <span className="text-slate-400">%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">營業稅:</span>
              <input
                type="number"
                min="0"
                max="10"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono outline-none"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3 w-12 text-center">項次</th>
                  <th className="py-2.5 px-3 w-48">工項名稱</th>
                  <th className="py-2.5 px-3">材料規格與規範對齊</th>
                  <th className="py-2.5 px-2 w-16 text-center">單位</th>
                  <th className="py-2.5 px-2 w-20 text-center">數量</th>
                  <th className="py-2.5 px-2 w-24 text-right">單價 (NT$)</th>
                  <th className="py-2.5 px-3 w-28 text-right">複價 (NT$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {calculatedItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                      <div>{item.name}</div>
                      {item.ruleReference && (
                        <span className="text-[10px] text-amber-400/90 font-mono">
                          [{item.ruleReference}]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      <div>{item.specification}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{item.notes}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300 font-sans">{item.unit}</td>
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                        className="w-16 bg-slate-900 border border-slate-700/80 rounded px-1 py-0.5 text-center text-amber-300 outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        step="50"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateUnitPrice(item.id, Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700/80 rounded px-1 py-0.5 text-right text-emerald-300 outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ${item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Note */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                資料品質與使用限制
              </div>
              <p className="leading-relaxed">
                數量 0 代表目前圖面或設備資料不足，不代表不施作。畫面單價僅為可編輯參考值；正式報價前仍須由設計師核對數量、材料、工法與供應商價格。
              </p>
            </div>

            {/* Right Totals */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>工料直接成本小計:</span>
                <span className="font-bold">${rawSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>現場品管與工程利潤 ({markupPercent}%):</span>
                <span>+${managementFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>法定營業稅 ({taxPercent}%):</span>
                <span>+${taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm sm:text-base font-bold text-amber-400">
                <span>工程含稅總估算額:</span>
                <span>NT$ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            工期尚未由工程條件與工班排程核定，不在此介面自動推估。
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>匯出 Excel (CSV) 報表</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 產出正式報價單</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
