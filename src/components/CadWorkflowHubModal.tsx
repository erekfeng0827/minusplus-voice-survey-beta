import React, { useState } from 'react';
import { X, Settings, Upload, Download, FileText, Layers, Palette, Mic } from 'lucide-react';
import { RoomData } from '../types';

interface CadWorkflowHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomData[];
  projectName: string;
  onNotify: (msg: string) => void;
}

export const CadWorkflowHubModal: React.FC<CadWorkflowHubModalProps> = ({
  isOpen,
  onClose,
  rooms,
  projectName,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'mapping' | 'templates' | 'preview' | 'voice'>('mapping');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#121810]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#23301F] border border-[#3F5B63] rounded-3xl w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-64 bg-[#181b25] border-r border-[#3F5B63]/50 p-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#F8F8F6] mb-4 px-2">CAD 工作中樞</h2>
          
          <TabButton active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} icon={<Settings />} label="規格對應" />
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<FileText />} label="模板與圖框" />
          <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} icon={<Palette />} label="立面預覽" />
          <TabButton active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} icon={<Mic />} label="口述建模" />
          
          <div className="mt-auto pt-4 border-t border-[#3F5B63]/50">
            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#3F5B63]/20 hover:bg-[#B4503A]/20 text-[#F8F8F6]">
              <X className="w-5 h-5" /> 關閉中樞
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto text-[#DDD7CE]">
          {activeTab === 'mapping' && <MappingTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'preview' && <PreviewTab projectName={projectName} rooms={rooms} />}
          {activeTab === 'voice' && <VoiceTab />}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
      active ? 'bg-[#E0A83C] text-[#121810]' : 'text-[#DDD7CE] hover:bg-[#3F5B63]/40'
    }`}
  >
    {icon} {label}
  </button>
);

const MappingTab = () => {
  const [config, setConfig] = useState({ layerName: 'Wall', lineType: 'Solid' });

  const handleSaveMapping = () => {
    localStorage.setItem('cad_layer_mapping_config', JSON.stringify(config));
    alert('規格已存檔至本地快取');
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-[#F8F8F6]">CAD 圖層規格對應</h3>
      <div className="bg-[#181b25] p-4 rounded-xl border border-[#3F5B63]/30">
        <label className="block text-sm mb-2">圖層對應 (示範)</label>
        <input value={config.layerName} onChange={(e) => setConfig({...config, layerName: e.target.value})} className="w-full bg-[#23301F] p-2 rounded" />
      </div>
      <button onClick={handleSaveMapping} className="bg-[#3F5B63] hover:bg-[#4e727c] text-[#F8F8F6] p-3 rounded-xl">
        儲存規格配置
      </button>
    </div>
  );
};

const TemplatesTab = () => {
  const [scalePlan, setScalePlan] = useState('1:50');
  const [isTemplateRegistered, setIsTemplateRegistered] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-[#F8F8F6]">模板與圖框中心</h3>
      
      <div className="bg-[#181b25] p-6 rounded-2xl border border-[#3F5B63]/30 flex flex-col gap-4">
        <h4 className="font-bold text-[#DDD7CE]">A3 出圖規格設定</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1 text-[#8E8E93]">立面施工圖比例</label>
            <div className="bg-[#23301F] p-2 rounded border border-[#3F5B63]">1:30 (固定)</div>
          </div>
          <div>
            <label className="block text-xs mb-1 text-[#8E8E93]">平面圖比例</label>
            <select value={scalePlan} onChange={(e) => setScalePlan(e.target.value)} className="w-full bg-[#23301F] p-2 rounded border border-[#3F5B63]">
              <option>1:40</option>
              <option>1:50</option>
              <option>1:60</option>
              <option>1:80</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#181b25] p-6 rounded-2xl border border-[#3F5B63]/30">
        <h4 className="font-bold text-[#DDD7CE] mb-4">檔案模板機制 (Prototype)</h4>
        <button 
          onClick={() => { alert('請上傳您的標準 DWG/DXF 圖面，系統將自動萃取圖框、圖層與機電圖塊設定。'); setIsTemplateRegistered(true); }}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#3F5B63] p-6 rounded-xl hover:border-[#E0A83C] text-[#DDD7CE] transition"
        >
          <Upload className="w-6 h-6" />
          {isTemplateRegistered ? '模板已註冊 (AutoCAD 原生範本)' : '註冊新模板 (上傳標準圖檔)'}
        </button>
      </div>
    </div>
  );
};

const PreviewTab = ({ projectName, rooms }: { projectName: string, rooms: RoomData[] }) => {
  const [thickness, setThickness] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [currentElevationIndex, setCurrentElevationIndex] = useState(0);
  const [planScale, setPlanScale] = useState('1:50');

  // 模擬 20 個立面 (5 個空間 * 4 面)
  const totalElevations = rooms.length * 4;

  const handleExport = () => {
    alert(`正在產出全套施工圖，共 ${totalElevations} 面，立面 1:30，平面 ${planScale}，規格：${thickness}mm, 不透明度 ${opacity}%`);
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-[#F8F8F6]">全套施工圖批次預覽器</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#181b25] p-3 rounded-xl border border-[#3F5B63]/30">
          <label className="block text-[10px] uppercase text-[#8E8E93] mb-1">線條粗細</label>
          <input type="range" min="0.1" max="5" step="0.1" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div className="bg-[#181b25] p-3 rounded-xl border border-[#3F5B63]/30">
          <label className="block text-[10px] uppercase text-[#8E8E93] mb-1">線條深淺</label>
          <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full" />
        </div>
        <div className="bg-[#181b25] p-3 rounded-xl border border-[#3F5B63]/30">
          <label className="block text-[10px] uppercase text-[#8E8E93] mb-1">平面縮放比例</label>
          <select value={planScale} onChange={(e) => setPlanScale(e.target.value)} className="w-full bg-transparent text-sm">
            <option>1:40</option>
            <option>1:50</option>
            <option>1:60</option>
            <option>1:80</option>
          </select>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-2xl border-2 border-[#3F5B63]/30 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-white" style={{ opacity: opacity / 100, strokeWidth: thickness }}>
          顯示第 {currentElevationIndex + 1} / {totalElevations} 面立面預覽 (比例 1:30)
        </div>
        <div className="flex justify-between p-4 bg-[#181b25]">
          <button disabled={currentElevationIndex === 0} onClick={() => setCurrentElevationIndex(i => i - 1)} className="text-[#E0A83C] text-sm font-bold">上一面</button>
          <span className="text-[#8E8E93] text-sm">瀏覽施工圖</span>
          <button disabled={currentElevationIndex === totalElevations - 1} onClick={() => setCurrentElevationIndex(i => i + 1)} className="text-[#E0A83C] text-sm font-bold">下一面</button>
        </div>
      </div>

      <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#E0A83C] text-[#121810] p-4 rounded-xl font-bold hover:bg-[#c9952f] transition">
        <Download className="w-5 h-5" /> 產出全套 {projectName} 施工圖冊 (PDF)
      </button>
    </div>
  );
};

const VoiceTab = () => (
  <div>
    <h3 className="text-xl font-bold text-[#F8F8F6] mb-4">AI 口述建模</h3>
    <p>語音輸入：「在北牆新增一個寬 300 高 210 的窗戶...」</p>
    {/* Implementation to follow */}
  </div>
);
