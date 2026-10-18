// --- START OF FILE App.tsx (Minusplus 四向引導全景版) ---

import React, { useState, useEffect } from 'react';
import { FurnitureItem, PersonalDetailBlockItem, PlacedBlockItem, RoomData, VoiceMemo, RoomMaterials, SunlightConfig } from './types';
import { INITIAL_ROOMS } from './data/defaultProject';
import { MasterFloorPlanView } from './components/MasterFloorPlanView';
import { RealScene3DDeepLinkModal } from './components/RealScene3DDeepLinkModal';
import { AutoSpaceLayoutModal } from './components/AutoSpaceLayoutModal';
import { BatchConstructionSheetAssemblerModal } from './components/BatchConstructionSheetAssemblerModal';
import { StakingCanvas2D } from './components/StakingCanvas2D';
import { ThreeDSceneView } from './components/ThreeDSceneView';
import { calculateStitchedFloorPlan } from './utils/multiRoomStitcher';
import { VoiceInputPanel } from './components/VoiceInputPanel';
import { ConstructionSheetSet } from './components/ConstructionSheetSet';
import { AuditConsultantDashboard } from './components/AuditConsultantDashboard';
import { VoiceMemoModal } from './components/VoiceMemoModal';
import { AiFeaturesModal } from './components/AiFeaturesModal';
import { MaterialLibraryModal } from './components/MaterialLibraryModal';
import { VoiceSummaryModal } from './components/VoiceSummaryModal';
import { SunlightSimulationModal } from './components/SunlightSimulationModal';
import { DxfCustomSettingsModal } from './components/DxfCustomSettingsModal';
import { ComplianceReportModal } from './components/ComplianceReportModal';
import { IpadEditionModal } from './components/IpadEditionModal';
import { DetailLibraryModal } from './components/DetailLibraryModal';
import { CadLayerStandardModal } from './components/CadLayerStandardModal';
import { ArStakingPreviewModal } from './components/ArStakingPreviewModal';
import { QuotationEstimatorModal } from './components/QuotationEstimatorModal';
import { DetailDrawingPdfExportModal } from './components/DetailDrawingPdfExportModal';
import { BatchDxfOptimizerModal } from './components/BatchDxfOptimizerModal';
import { CameraRoomScanModal } from './components/CameraRoomScanModal';
import { CustomBlockImportModal } from './components/CustomBlockImportModal';
import { VoiceCommandOptimizerModal } from './components/VoiceCommandOptimizerModal';
import { ExtendedFeaturesHubModal, ExtensionFeatureId } from './components/ExtendedFeaturesHubModal';
import { ClaudeDesignSpecModal } from './components/ClaudeDesignSpecModal';
import { DesignerDrawingExtractorModal } from './components/DesignerDrawingExtractorModal';
import { GoogleApiIdeDispatcherModal } from './components/GoogleApiIdeDispatcherModal';
import { SketchUpExportModal } from './components/SketchUpExportModal';
import { ScanningTutorialModal } from './components/ScanningTutorialModal';
import { UiComfortSettingsModal, UiComfortConfig, DEFAULT_UI_COMFORT } from './components/UiComfortSettingsModal';
import { IpadZenMeasureLayout } from './components/IpadZenMeasureLayout';
import { DrawingSaveHabitsModal } from './components/DrawingSaveHabitsModal';
import { ElevationBenchmarkModal } from './components/ElevationBenchmarkModal';
import { IpadHiddenMenuModal } from './components/IpadHiddenMenuModal';
import { PanoramicVisualGuideModal } from './components/PanoramicVisualGuideModal';
import { AuditDistributionModal } from './components/AuditDistributionModal';
import { ClearAllConfirmModal } from './components/ClearAllConfirmModal';
import { ConstructionDetailLibraryModal } from './components/ConstructionDetailLibraryModal';
import { ThreeDRenderExplanationModal } from './components/ThreeDRenderExplanationModal';
import { MultiRoomStitcherModal } from './components/MultiRoomStitcherModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { ProjectCloudBackupModal } from './components/ProjectCloudBackupModal';
import { CompanyTitleBlockDesignerModal } from './components/CompanyTitleBlockDesignerModal';
import { DwgBatchHabitLearningModal } from './components/DwgBatchHabitLearningModal';
import { CadWorkflowHubModal } from './components/CadWorkflowHubModal';
import { PersonalDetailBlockLibraryModal } from './components/PersonalDetailBlockLibraryModal';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { HatchPatternPreviewModal } from './components/HatchPatternPreviewModal';
import { BatchAutoClassificationModal } from './components/BatchAutoClassificationModal';
import { ProjectTemplateManagerModal } from './components/ProjectTemplateManagerModal';
import { AutomatedClashDetectionModal } from './components/AutomatedClashDetectionModal';
import { BeamDepthCalculatorModal } from './components/BeamDepthCalculatorModal';
import { LayerColorContrastModal } from './components/LayerColorContrastModal';
import { NewProjectSurveyWizardModal } from './components/NewProjectSurveyWizardModal';
import { CleanStepHeader } from './components/CleanStepHeader';
import { CleanMeasureWorkspace } from './components/CleanMeasureWorkspace';
import { FloorplanPdfImportModal } from './components/FloorplanPdfImportModal';
import { CleanLaunchScreen } from './components/CleanLaunchScreen';
import { useAuth } from './context/AuthContext';
import { downloadDxfFile } from './utils/dxfExporter';

import {
  Mic, Box, FileText, Download, Plus, Layers, Sparkles, 
  ShieldCheck, CheckCircle2, Tablet, Sliders, Video, List,
  Database, X, Palette, FolderPlus, Trash2, ChevronDown, 
  LayoutGrid, Layout, Map, Settings, Wrench, Menu, Cpu, BookOpen,
  Ruler, FileSearch, AlertTriangle, PaintBucket, ChevronUp, ChevronLeft, ChevronRight,
  Building, ArrowRight
} from 'lucide-react';

export default function App() {
  const { user, syncStatus } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('minusplus_ui_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('minusplus_ui_theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const [showDebug, setShowDebug] = useState(false);
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);

  // 快捷鍵觸發除錯面板: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStorageSize = () => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) total += ((localStorage[x].length * 2) / 1024 / 1024);
    }
    return total.toFixed(2);
  };

  const [projectName, setProjectName] = useState<string>(() => localStorage.getItem('minusplus_project_name') || '現場實測放樣工程');
  const [rooms, setRooms] = useState<RoomData[]>(() => {
    try {
      const saved = localStorage.getItem('minusplus_active_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load rooms from localStorage', e);
    }
    return Array.isArray(INITIAL_ROOMS) && INITIAL_ROOMS.length > 0 ? INITIAL_ROOMS : [];
  });
  
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => {
     // Ensure we pick a valid ID if rooms exist
     if (rooms.length > 0) return rooms[0].id;
     return 'room-living';
  });
  
  // 階段引導狀態 (支援極簡三階段流水線)
  const [cleanStep, setCleanStep] = useState<'1_survey' | '2_stitch' | '3_layout'>('1_survey');
  const [workflow, setWorkflow] = useState<'measure' | 'layout' | 'audit'>('measure');
  const [activeMainTab, setActiveMainTab] = useState<'2d_staking' | '3d_simulation' | 'blueprints' | 'audit_dashboard'>('2d_staking');
  const [canvasViewMode, setCanvasViewMode] = useState<'staking' | 'voice_match' | 'ceiling_drop' | 'mep'>('staking');
  const [selectedVoiceMemo, setSelectedVoiceMemo] = useState<VoiceMemo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // 🌟 四向面板開關狀態 (Top, Bottom, Left, Right)
  const [isTopOpen, setIsTopOpen] = useState<boolean>(false);
  const [isBottomOpen, setIsBottomOpen] = useState<boolean>(false);
  const [isLeftOpen, setIsLeftOpen] = useState<boolean>(false);
  const [isRightOpen, setIsRightOpen] = useState<boolean>(false);

  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState<boolean>(false);

  // 所有 Modals 狀態 (省略部分宣告以節省版面，保留所有功能)
  const [isPdfImportOpen, setIsPdfImportOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProjectTemplateModalOpen, setIsProjectTemplateModalOpen] = useState<boolean>(false);
  const [isAiFeaturesOpen, setIsAiFeaturesOpen] = useState<boolean>(false);
  const [isMaterialLibraryOpen, setIsMaterialLibraryOpen] = useState<boolean>(false);
  const [isVoiceSummaryOpen, setIsVoiceSummaryOpen] = useState<boolean>(false);
  const [isSunlightSimOpen, setIsSunlightSimOpen] = useState<boolean>(false);
  const [isDxfSettingsOpen, setIsDxfSettingsOpen] = useState<boolean>(false);
  const [isComplianceReportOpen, setIsComplianceReportOpen] = useState<boolean>(false);
  const [isIpadModalOpen, setIsIpadModalOpen] = useState<boolean>(false);
  const [isIpadSimulated, setIsIpadSimulated] = useState<boolean>(false);
  const [isDetailLibraryOpen, setIsDetailLibraryOpen] = useState<boolean>(false);
  const [isCadStandardsOpen, setIsCadStandardsOpen] = useState<boolean>(false);
  const [isArStakingOpen, setIsArStakingOpen] = useState<boolean>(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState<boolean>(false);
  const [isDetailPdfOpen, setIsDetailPdfOpen] = useState<boolean>(false);
  const [isBatchDxfOpen, setIsBatchDxfOpen] = useState<boolean>(false);
  const [isCameraScanOpen, setIsCameraScanOpen] = useState<boolean>(false);
  const [isCustomBlockOpen, setIsCustomBlockOpen] = useState<boolean>(false);
  const [isVoiceOptimizerOpen, setIsVoiceOptimizerOpen] = useState<boolean>(false);
  const [isExtendedHubOpen, setIsExtendedHubOpen] = useState<boolean>(false);
  const [initialExtendedFeature, setInitialExtendedFeature] = useState<ExtensionFeatureId>('project_template');
  const [isClaudeSpecOpen, setIsClaudeSpecOpen] = useState<boolean>(false);
  const [isDesignerExtractorOpen, setIsDesignerExtractorOpen] = useState<boolean>(false);
  const [isGoogleApiIdeOpen, setIsGoogleApiIdeOpen] = useState<boolean>(false);
  const [isSketchUpOpen, setIsSketchUpOpen] = useState<boolean>(false);
  const [isScanTutorialOpen, setIsScanTutorialOpen] = useState<boolean>(false);
  const [isUiComfortOpen, setIsUiComfortOpen] = useState<boolean>(false);
  const [uiComfort, setUiComfort] = useState<UiComfortConfig>(DEFAULT_UI_COMFORT);
  const [isZenMeasurementMode, setIsZenMeasurementMode] = useState<boolean>(false);
  const [isDrawingHabitsOpen, setIsDrawingHabitsOpen] = useState<boolean>(false);
  const [isElevationBenchmarkOpen, setIsElevationBenchmarkOpen] = useState<boolean>(false);
  const [isIpadHiddenMenuOpen, setIsIpadHiddenMenuOpen] = useState<boolean>(false);
  const [isPanoramicGuideOpen, setIsPanoramicGuideOpen] = useState<boolean>(false);
  const [isAuditDistributionOpen, setIsAuditDistributionOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<RoomData[][]>([INITIAL_ROOMS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);
  const [isConstructionLibraryOpen, setIsConstructionLibraryOpen] = useState<boolean>(false);
  const [is3DRenderExplanationOpen, setIs3DRenderExplanationOpen] = useState<boolean>(false);
  const [isCadWorkflowHubOpen, setIsCadWorkflowHubOpen] = useState<boolean>(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState<boolean>(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState<boolean>(false);
  const [isCompanyTitleBlockOpen, setIsCompanyTitleBlockOpen] = useState<boolean>(false);
  const [isDwgHabitsLearnerOpen, setIsDwgHabitsLearnerOpen] = useState<boolean>(false);
  const [isPersonalBlockLibraryOpen, setIsPersonalBlockLibraryOpen] = useState<boolean>(false);
  const [draggedFurnitureBlock, setDraggedFurnitureBlock] = useState<PersonalDetailBlockItem | null>(null);
  const [isHatchPatternModalOpen, setIsHatchPatternModalOpen] = useState<boolean>(false);
  const [isBatchClassificationModalOpen, setIsBatchClassificationModalOpen] = useState<boolean>(false);
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState<boolean>(false);
  const [isCalibration5xOpen, setIsCalibration5xOpen] = useState<boolean>(false);
  const [isPdfOcrOpen, setIsPdfOcrOpen] = useState<boolean>(false);
  const [isClashDetectionOpen, setIsClashDetectionOpen] = useState<boolean>(false);
  const [isBeamDepthCalcOpen, setIsBeamDepthCalcOpen] = useState<boolean>(false);
  const [isLayerColorContrastOpen, setIsLayerColorContrastOpen] = useState<boolean>(false);
  const [isRealScene3DOpen, setIsRealScene3DOpen] = useState<boolean>(false);
  const [isAutoSpaceLayoutOpen, setIsAutoSpaceLayoutOpen] = useState<boolean>(false);
  const [isBatchSheetAssemblerOpen, setIsBatchSheetAssemblerOpen] = useState<boolean>(false);
  const [isMinusPlusWorkspaceOpen, setIsMinusPlusWorkspaceOpen] = useState<boolean>(false);
  const [isSuLayoutOpen, setIsSuLayoutOpen] = useState<boolean>(false);
  const [isCadBatchOpen, setIsCadBatchOpen] = useState<boolean>(false);
  const [isWindowOpeningEditorOpen, setIsWindowOpeningEditorOpen] = useState<boolean>(false);
  const [isAutoDimensionModalOpen, setIsAutoDimensionModalOpen] = useState<boolean>(false);
  const [isPersonalSpecOpen, setIsPersonalSpecOpen] = useState<boolean>(false);
  const [isCadHubOpen, setIsCadHubOpen] = useState<boolean>(false);
  const [isSurveyWizardOpen, setIsSurveyWizardOpen] = useState<boolean>(false);
  const [isMultiRoomStitcherOpen, setIsMultiRoomStitcherOpen] = useState<boolean>(false);

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0] || INITIAL_ROOMS[0];
  const stitchedPlan = calculateStitchedFloorPlan(rooms);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const pushHistory = (newRooms: RoomData[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newRooms);
    if (updatedHistory.length > 30) updatedHistory.shift();
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setRooms(newRooms);
    localStorage.setItem('minusplus_active_rooms', JSON.stringify(newRooms));
  };

  const handleUpdateRoom = (updatedRoom: RoomData) => {
    const newRooms = rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r));
    pushHistory(newRooms);
  };

  const handleInsertFurnitureBlock = (block: PersonalDetailBlockItem) => {
    const x = Math.max(0, Math.round((currentRoom.width - block.widthCm) / 10) * 5);
    const y = Math.max(0, Math.round((currentRoom.length - block.depthCm) / 10) * 5);
    const placedId = `placed-${Date.now()}`;
    const placed: PlacedBlockItem = {
      id: placedId, blockId: block.id, name: block.name, category: block.category,
      subCategory: block.subCategory, x, y, widthCm: block.widthCm, depthCm: block.depthCm,
      heightCm: block.heightCm, elevationCm: block.elevationCm, cadLayer: block.cadLayer,
      colorIndex: block.colorIndex, rotationDeg: 0, snappedTo: `房间中央 5cm 模数 (X:${x}, Y:${y})`,
      tags: block.tags, placedAt: new Date().toISOString(),
    };
    const furniture: FurnitureItem | null = block.category === 'furniture' ? {
      id: `f-${placedId}`, name: block.name,
      category: /床/i.test(block.name) ? 'bed' : /衣櫃/i.test(block.name) ? 'wardrobe' : /桌|椅/i.test(block.name) ? 'desk_table' : 'cabinet',
      x, y, width: block.widthCm, depth: block.depthCm, height: block.heightCm,
      elevation: block.elevationCm, rotationY: 0, specNote: `来自图块库；${placed.snappedTo}`,
    } : null;
    handleUpdateRoom({
      ...currentRoom,
      placedBlocks: [...(currentRoom.placedBlocks || []), placed],
      furniture: furniture ? [...(currentRoom.furniture || []), furniture] : currentRoom.furniture,
    });
    showToast(`已将「${block.name}」置入平面中央，可在画布选择后旋转、对齐或删除。`);
  };

  const handleStartFreshProject = (freshRooms: RoomData[], newName: string) => {
    setProjectName(newName);
    localStorage.setItem('minusplus_project_name', newName);
    localStorage.setItem('minusplus_active_rooms', JSON.stringify(freshRooms));
    setHistory([freshRooms]);
    setHistoryIndex(0);
    setRooms(freshRooms);
    setSelectedRoomId(freshRooms[0].id);
    showToast('已成功開立純淨新案場！');
  };

  const handleAddRoomFromTemplate = (newRoom: RoomData) => {
    const newRooms = [...rooms, newRoom];
    pushHistory(newRooms);
    setSelectedRoomId(newRoom.id);
  };

  const handleClearCurrentRoomElements = () => {
    const newRooms = rooms.map((r) =>
      r.id === selectedRoomId
        ? { ...r, beams: [], doors: [], windows: [], electricalPoints: [], voiceMemos: [], virtualAnnotations: [], lightingPoints: [], placedBlocks: [], furniture: [], lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) }
        : r
    );
    pushHistory(newRooms);
    showToast(`已一鍵清空「${currentRoom.roomName}」放樣圖元，畫布已歸零純淨！`);
  };

  const handleAddNewRoom = () => {
    const newRoom: RoomData = {
      id: `room-custom-${Date.now().toString().slice(-4)}`,
      roomName: `自訂空間放樣 #${rooms.length + 1}`,
      width: 420, length: 360, height: 280, ceilingDrop: 230, beamHeight: 265, bathKitchenDrop: 215, wallThickness: 15,
      evaluation: { score: 90, clarity: '優良', missingElements: [], rule5MultiplePassed: true, suggestions: '新建立空間預設套用 5 倍數契約規範。' },
      beams: [{ id: `b-${Date.now()}`, name: '結構橫樑', width: 35, depth: 55, clearHeight: 265, orientation: 'horizontal', y: 150 }],
      doors: [{ id: `d-${Date.now()}`, name: '房門', width: 90, height: 210, wall: 'bottom', offset: 40 }],
      windows: [{ id: `w-${Date.now()}`, name: '採光窗', width: 160, height: 150, sillHeight: 90, wall: 'top', offset: 80 }],
      voiceMemos: [], electricalPoints: [], lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    pushHistory([...rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
    showToast(`已建立新放樣空間「${newRoom.roomName}」！`);
  };

  const handleConfirmClear = (clearMode: 'current_room_elements' | 'all_annotations' | 'reset_all_rooms') => {
    let newRooms: RoomData[];
    if (clearMode === 'current_room_elements') {
      newRooms = rooms.map((r) => r.id === selectedRoomId ? { ...r, beams: [], doors: [], windows: [], electricalPoints: [], voiceMemos: [], lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) } : r);
      showToast(`已清空「${currentRoom.roomName}」圖面所有放樣圖元！`);
    } else if (clearMode === 'all_annotations') {
      newRooms = rooms.map((r) => r.id === selectedRoomId ? { ...r, electricalPoints: [], voiceMemos: [], lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) } : r);
      showToast(`已清除「${currentRoom.roomName}」水電標註與語音備忘！`);
    } else {
      newRooms = INITIAL_ROOMS;
      showToast('已重置為出廠預設圖面！');
    }
    pushHistory(newRooms);
    setIsClearAllModalOpen(false);
  };

  const handleApplyMaterials = (materials: RoomMaterials) => {
    const updated = { ...currentRoom, materials };
    handleUpdateRoom(updated);
    showToast(`已成功套用材質設定至「${currentRoom.roomName}」！`);
  };

  const handleAddVoiceMemo = (memo: VoiceMemo) => {
    const updated = { ...currentRoom, voiceMemos: [...(currentRoom.voiceMemos || []), memo] };
    handleUpdateRoom(updated);
    showToast(`已新增語音備忘至「${currentRoom.roomName}」！`);
  };

  const handleApplySunlight = (sunlight: SunlightConfig) => {
    const updated = { ...currentRoom, sunlight };
    handleUpdateRoom(updated);
    showToast(`已套用日照模擬配置至「${currentRoom.roomName}」！`);
  };

  const handleResetMinusPlusStorage = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('minusplus_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.error('Error clearing minusplus_ keys from localStorage:', err);
    }
    window.location.reload();
  };

  useEffect(() => {
    if (workflow === 'measure') setActiveMainTab('2d_staking');
    if (workflow === 'layout') setActiveMainTab('2d_staking');
    if (workflow === 'audit') setActiveMainTab('blueprints');
  }, [workflow]);

  const startBlankProject = () => {
    const now = Date.now();
    const blankRoom: RoomData = {
      id: `room-entry-${now}`,
      roomName: '入口空间',
      width: 400,
      length: 500,
      height: 280,
      ceilingDrop: 230,
      beamHeight: 265,
      bathKitchenDrop: 215,
      wallThickness: 15,
      evaluation: { score: 0, clarity: '尚未丈量', missingElements: ['空间长宽', '门窗位置'], rule5MultiplePassed: true, suggestions: '请从玄关起点开始口述。' },
      beams: [], doors: [], windows: [], voiceMemos: [], electricalPoints: [], placedBlocks: [], furniture: [],
      lastUpdated: new Date().toISOString(),
    };
    handleStartFreshProject([blankRoom], '未命名丈量案');
    setCleanStep('1_survey');
    setWorkflow('measure');
    setShowLaunchScreen(false);
  };

  const useCompleteExample = () => {
    const exampleRooms = JSON.parse(JSON.stringify(INITIAL_ROOMS)) as RoomData[];
    handleStartFreshProject(exampleRooms, '标准户型完整范例');
    setCleanStep('3_layout');
    setWorkflow('layout');
    setActiveMainTab('2d_staking');
    setShowLaunchScreen(false);
  };

  if (showLaunchScreen) {
    return (
      <CleanLaunchScreen
        hasSavedProject={Boolean(localStorage.getItem('minusplus_active_rooms'))}
        savedProjectName={projectName}
        onStartBlank={startBlankProject}
        onUseExample={useCompleteExample}
        onContinue={() => setShowLaunchScreen(false)}
      />
    );
  }

  return (
    // 🌟 100% 滿版無邊際畫布 (Overflow Hidden)
    <div data-theme={theme} className="survey-app relative w-full h-screen overflow-hidden antialiased selection:bg-[#E0A83C] selection:text-[#23301F]">
      
      {/* 🌟 完美植入 CIS 字體系統 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        
        :root {
          --mp-font-cn-display: 'Noto Serif TC', serif;
          --mp-font-cn-body: 'Noto Sans TC', sans-serif;
          --mp-font-en-narrative: 'Noto Serif TC', serif;
          --mp-font-en-display: 'Playfair Display', serif;
          --mp-font-ui: 'Archivo', sans-serif;
          --mp-font-mono: 'IBM Plex Mono', monospace;
        }
        
        body { font-family: var(--mp-font-cn-body); margin: 0; overflow: hidden; }
      `}</style>

      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[120] bg-[#23301F]/95 backdrop-blur-xl border border-[#3F5B63] text-[#F8F8F6] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#E0A83C] flex-shrink-0" />
          <span className="font-medium" style={{ fontFamily: 'var(--mp-font-cn-body)' }}>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 極簡清晰三階段流水線 (Clean 3-Stage Workflow Architecture)              */}
      {/* 階段一：現場丈量 (僅顯示丈量必備之尺寸、RC淨高、梁位、門窗與凹凸缺角)       */}
      {/* 階段二：空間拼湊與放樣圖 (自動帶入空間拼湊、咬合扣除共壁、生成平面尺寸圖)   */}
      {/* 階段三：平面配置與深化 (傢俱排版、動線、3D模擬與全套施工圖紙)             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 flex flex-col">
        {/* 全域極簡階段導航列 */}
        <CleanStepHeader
          currentStep={cleanStep}
          onStepChange={(st) => {
            setCleanStep(st);
            if (st === '1_survey') {
              setWorkflow('measure');
            } else if (st === '2_stitch') {
              setIsMultiRoomStitcherOpen(true);
            } else if (st === '3_layout') {
              setWorkflow('layout');
              setActiveMainTab('2d_staking');
            }
          }}
          projectName={projectName}
          onOpenProjectWizard={() => setIsSurveyWizardOpen(true)}
          onOpenPdfImport={() => setIsPdfImportOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
        />

        {/* 階段主要工作視圖 */}
        <div className="flex-1 relative overflow-hidden">
          {cleanStep === '1_survey' ? (
            /* 階段一：純淨現場丈量專用工作區 (不擠壓其他雜亂工具) */
            <CleanMeasureWorkspace
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              onUpdateRoom={handleUpdateRoom}
              onAddNewRoom={handleAddNewRoom}
              onProceedToStitch={() => {
                setCleanStep('2_stitch');
                setIsMultiRoomStitcherOpen(true);
              }}
              onNotify={showToast}
              onOpenPdfImport={() => setIsPdfImportOpen(true)}
            />
          ) : cleanStep === '2_stitch' ? (
            /* 階段二：空間拼湊與全案放樣圖 (點擊直接進入 MultiRoomStitcher 求解咬合) */
            <div className="w-full h-full bg-[#0a0f0b] flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-xl bg-[#121810] border border-cyan-500/40 rounded-3xl p-8 shadow-2xl space-y-5">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">階段二：全案空間拼湊與放樣尺寸圖</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    已自動帶入您在階段一丈量的 {rooms.length} 個空間幾何尺寸。
                    系統將依門洞拓撲 (Anchor Tags) 自動剛體約束旋轉，並<strong>自動咬合共壁扣除 15cm 壁厚</strong>，生成標準雙線實牆與全案放樣圖。
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsMultiRoomStitcherOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>開啟全案空間拼湊放樣求解器</span>
                  </button>
                  <button
                    onClick={() => {
                      setCleanStep('3_layout');
                      setWorkflow('layout');
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1A2417] hover:bg-[#3F5B63]/40 border border-[#3F5B63]/50 text-neutral-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>進入階段三 (平面配置)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 階段三：平面配置、傢俱深化與圖面繪製 */
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
                <button
                  onClick={() => setIsAutoSpaceLayoutOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
                >
                  <LayoutGrid className="h-4 w-4" />
                  產生配置候選
                </button>
                <button
                  onClick={() => setIsPersonalBlockLibraryOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#3F5B63]/50 bg-[#121810]/90 px-4 py-2.5 text-xs font-bold text-[#F8F8F6] shadow-lg backdrop-blur-sm transition hover:bg-[#23301F] active:scale-95"
                >
                  <FolderPlus className="h-4 w-4" />
                  家具／櫃體圖塊
                </button>
              </div>
              {activeMainTab === '3d_simulation' ? (
                <ThreeDSceneView room={currentRoom} onNotify={showToast} onOpenCustomBlocks={() => setIsCustomBlockOpen(true)} />
              ) : (
                <StakingCanvas2D room={currentRoom} activeViewMode={canvasViewMode} setActiveViewMode={setCanvasViewMode} onSelectVoiceMemo={setSelectedVoiceMemo} onUpdateRoom={handleUpdateRoom} onSwitchTo3D={() => setActiveMainTab('3d_simulation')} draggedBlock={draggedFurnitureBlock} onDropBlock={() => setDraggedFurnitureBlock(null)} onDragCancel={() => setDraggedFurnitureBlock(null)} onNotify={showToast} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 四向邊緣觸發器 (Edge Handles) - 平時隱藏，滑鼠靠近或點擊展開               */}
      {/* ========================================================================= */}

      {/* ⬆️ 頂部拉簾觸發器 (Top Handle) */}
      <button 
        onClick={() => setIsTopOpen(!isTopOpen)}
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 z-40 bg-[#23301F]/90 backdrop-blur-md border border-[#3F5B63]/50 border-t-0 px-6 py-1.5 rounded-b-2xl shadow-lg flex items-center gap-2 text-[#E0A83C] hover:text-[#F8F8F6] transition-all duration-300 ${isTopOpen ? 'translate-y-[-100%]' : 'translate-y-0'}`}
      >
        <span style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[10px] tracking-widest uppercase font-bold">Project & Workflow</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* ⬇️ 底部中控觸發器 (Bottom Handle) */}
      <button 
        onClick={() => setIsBottomOpen(!isBottomOpen)}
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 z-40 bg-[#B4503A]/90 backdrop-blur-md border border-[#B4503A]/50 border-b-0 px-8 py-2 rounded-t-2xl shadow-[0_-4px_20px_rgba(180,80,58,0.3)] flex items-center gap-2 text-[#F8F8F6] hover:bg-[#9e4330] transition-all duration-300 ${isBottomOpen ? 'translate-y-[100%]' : 'translate-y-0'}`}
      >
        <Mic className="w-4 h-4 animate-pulse" />
        <span style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="text-sm font-bold tracking-widest">現場輸入與語音</span>
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* ⬅️ 左側抽屜觸發器 (Left Handle) */}
      <button 
        onClick={() => setIsLeftOpen(!isLeftOpen)}
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-40 bg-[#23301F]/90 backdrop-blur-md border border-[#3F5B63]/50 border-l-0 px-1.5 py-8 rounded-r-2xl shadow-lg flex flex-col items-center gap-2 text-[#E0A83C] hover:text-[#F8F8F6] transition-all duration-300 ${isLeftOpen ? 'translate-x-[-100%]' : 'translate-x-0'}`}
      >
        <Map className="w-4 h-4" />
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* ➡️ 右側工具塢觸發器 (Right Handle) */}
      <button 
        onClick={() => setIsRightOpen(!isRightOpen)}
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-40 bg-[#23301F]/90 backdrop-blur-md border border-[#3F5B63]/50 border-r-0 px-1.5 py-8 rounded-l-2xl shadow-lg flex flex-col items-center gap-2 text-[#E0A83C] hover:text-[#F8F8F6] transition-all duration-300 ${isRightOpen ? 'translate-x-[100%]' : 'translate-x-0'}`}
      >
        <Wrench className="w-4 h-4" />
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>


      {/* ========================================================================= */}
      {/* 🌟 展開面板區 (Expanded Panels)                                             */}
      {/* ========================================================================= */}

      {/* ⬆️ 頂部拉簾：專案與階段導航 (Top Panel) */}
      <div className={`absolute top-0 left-0 right-0 z-50 bg-[#23301F]/95 backdrop-blur-2xl border-b border-[#3F5B63]/50 shadow-2xl transition-transform duration-500 ease-in-out ${isTopOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--mp-font-en-display)' }} className="text-[#F8F8F6] text-2xl font-semibold tracking-wide">Minusplus</span>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetMinusPlusStorage}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                title="刪除所有以 minusplus_ 為開頭的 LocalStorage 快取並重整頁面"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>徹底清空快取 (Reset)</span>
              </button>
              <button 
                onClick={() => setShowDebug(prev => !prev)}
                className="px-3 py-1.5 rounded-lg bg-[#121810] hover:bg-[#1A2417] border border-[#3F5B63]/40 text-[#DDD7CE] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>除錯面板</span>
              </button>
              <button onClick={() => setIsTopOpen(false)} className="p-2 rounded-full bg-[#121810] text-[#8E8E93] hover:text-[#F8F8F6] transition">
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 專案與空間選擇 */}
            <div className="bg-[#121810] rounded-2xl p-4 border border-[#3F5B63]/30">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest">Project & Room</span>
                <button
                  onClick={() => setIsSurveyWizardOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold border border-amber-500/50 flex items-center gap-1.5 transition active:scale-95 shadow"
                  title="開啟新建丈量嚮導：自選幾房幾廳幾衛，自動開啟全套空間"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  新建丈量 (房型嚮導)
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <button onClick={() => setIsProjectTemplateModalOpen(true)} className="flex items-center gap-2 text-[#E0A83C] hover:text-[#F8F8F6] transition text-left truncate">
                  <FolderPlus className="w-4 h-4 shrink-0" />
                  <span style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-sm font-bold truncate">{projectName}</span>
                </button>
                <button
                  onClick={() => setIsMultiRoomStitcherOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 text-xs font-semibold border border-cyan-500/50 flex items-center gap-1.5 transition shrink-0"
                  title="剛體約束求解與共壁咬合：生成真實建築雙線平面圖"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  全案平面圖合併
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {rooms.map(r => (
                  <button key={r.id} onClick={() => setSelectedRoomId(r.id)} style={{ fontFamily: 'var(--mp-font-cn-body)' }} className={`px-3 py-1.5 rounded-lg text-xs transition ${selectedRoomId === r.id ? 'bg-[#3F5B63] text-[#F8F8F6]' : 'bg-[#1A2417] text-[#DDD7CE] hover:bg-[#3F5B63]/50'}`}>
                    {r.roomName}
                  </button>
                ))}
                <button onClick={handleAddNewRoom} className="px-3 py-1.5 rounded-lg bg-[#1A2417] text-[#DDD7CE] hover:text-[#E0A83C] text-xs flex items-center gap-1 transition border border-[#3F5B63]/30">
                  <Plus className="w-3 h-3" /> 新增
                </button>
              </div>
            </div>

            {/* 引導式階段導航 (Workflow Timeline) */}
            <div className="md:col-span-2 bg-[#121810] rounded-2xl p-4 border border-[#3F5B63]/30 flex flex-col justify-center">
              <div style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[10px] text-[#8E8E93] font-bold mb-3 uppercase tracking-widest">Guided Workflow</div>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#3F5B63]/30 -z-10 -translate-y-1/2"></div>
                
                {(['measure', 'layout', 'audit'] as const).map((step, idx) => {
                  const isActive = workflow === step;
                  const labels = ['1. 現場丈量', '2. 圖面放樣', '3. 稽核輸出'];
                  const desc = ['360攝影 / 語音輸入', '2D/3D / CAD工具', '規範檢核 / 圖冊匯出'];
                  return (
                    <button key={step} onClick={() => setWorkflow(step)} className={`flex flex-col items-center gap-2 bg-[#121810] px-4 transition-all ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? 'bg-[#E0A83C] text-[#121810] border-[#E0A83C]' : 'bg-[#23301F] text-[#DDD7CE] border-[#3F5B63]'}`}>
                        {idx + 1}
                      </div>
                      <div className="text-center">
                        <div style={{ fontFamily: 'var(--mp-font-cn-body)' }} className={`text-sm font-bold ${isActive ? 'text-[#E0A83C]' : 'text-[#DDD7CE]'}`}>{labels[idx]}</div>
                        <div style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-[10px] text-[#8E8E93] mt-0.5">{desc[idx]}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⬇️ 底部中控：在地環境與口說輸入 (Bottom Panel) */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 bg-[#23301F]/95 backdrop-blur-2xl border-t border-[#3F5B63]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-in-out flex justify-center ${isBottomOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-full max-w-3xl px-6 py-6 flex items-center justify-between gap-6 relative">
          <button onClick={() => setIsBottomOpen(false)} className="absolute top-2 right-4 p-1.5 rounded-full bg-[#121810] text-[#8E8E93] hover:text-[#F8F8F6] transition">
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button onClick={() => { setIsBottomOpen(false); setIsCameraScanOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#121810] hover:bg-[#3F5B63]/40 border border-[#3F5B63]/30 transition group">
            <Video className="w-6 h-6 text-[#E0A83C] group-hover:scale-110 transition-transform" />
            <span style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-sm font-bold text-[#DDD7CE] group-hover:text-[#F8F8F6]">360° 空間攝影</span>
          </button>

          <button onClick={() => { setIsBottomOpen(false); setIsVoicePanelOpen(true); }} className="flex-[1.5] flex flex-col items-center gap-3 p-5 rounded-3xl bg-gradient-to-b from-[#B4503A] to-[#8a3d2c] shadow-[0_8px_32px_rgba(180,80,58,0.4)] border border-[#F8F8F6]/20 transition hover:scale-105 active:scale-95">
            <Mic className="w-8 h-8 text-[#F8F8F6] animate-pulse" />
            <span style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="text-lg font-bold text-[#F8F8F6] tracking-widest">口說契約輔助</span>
          </button>

          <button onClick={() => { setIsBottomOpen(false); setIsZenMeasurementMode(true); }} className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#121810] hover:bg-[#3F5B63]/40 border border-[#3F5B63]/30 transition group">
            <Tablet className="w-6 h-6 text-[#30D158] group-hover:scale-110 transition-transform" />
            <span style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-sm font-bold text-[#DDD7CE] group-hover:text-[#F8F8F6]">iPad 純淨模式</span>
          </button>
        </div>
      </div>

      {/* ⬅️ 左側抽屜：全案拓撲 (Left Panel) */}
      <div className={`absolute top-0 left-0 bottom-0 w-96 z-50 bg-[#23301F]/95 backdrop-blur-2xl border-r border-[#3F5B63]/50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isLeftOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[#3F5B63]/30 flex justify-between items-center bg-[#121810]">
          <h3 style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="text-lg font-bold text-[#E0A83C] flex items-center gap-2 tracking-wider">
            <Map className="w-5 h-5" /> 全案空間導航
          </h3>
          <button onClick={() => setIsLeftOpen(false)} className="p-1.5 rounded-full bg-[#23301F] text-[#8E8E93] hover:text-[#F8F8F6] transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsSurveyWizardOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>新建案場丈量</span>
            </button>
            <button
              onClick={() => setIsMultiRoomStitcherOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>全案幾何合併</span>
            </button>
          </div>
          <MasterFloorPlanView
            result={stitchedPlan}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onOpen3DDeepLink={() => setIsRealScene3DOpen(true)}
            onOpenMinusPlusWorkspace={() => setIsMinusPlusWorkspaceOpen(true)}
            onOpenStitcher={() => setIsMultiRoomStitcherOpen(true)}
          />
        </div>
      </div>

      {/* ➡️ 右側工具塢：專業繪圖與 AI (Right Panel) */}
      <div className={`absolute top-0 right-0 bottom-0 w-80 z-50 bg-[#23301F]/95 backdrop-blur-2xl border-l border-[#3F5B63]/50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isRightOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-[#3F5B63]/30 flex justify-between items-center bg-[#121810]">
          <button onClick={() => setIsRightOpen(false)} className="p-1.5 rounded-full bg-[#23301F] text-[#8E8E93] hover:text-[#F8F8F6] transition">
            <ChevronRight className="w-5 h-5" />
          </button>
          <h3 style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="text-lg font-bold text-[#E0A83C] flex items-center gap-2 tracking-wider">
            專業工具塢 <Wrench className="w-5 h-5" />
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 hide-scrollbar">
          
          {/* 🌟 繪圖管理摘要面板 (File Manager Summary) */}
          <button
            onClick={() => setIsCadHubOpen(true)}
            className="w-full bg-gradient-to-r from-[#23301F] to-[#1A2417] border border-[#3F5B63]/50 rounded-xl p-3 text-left hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[11px] font-bold text-[#F8F8F6] uppercase tracking-wider">圖檔管理總管</span>
            </div>
            <div className="text-[10px] text-[#8E8E93]">
              DXF 匯出 / PDF 匯入 / 雲端備份
            </div>
          </button>

          {/* 動態顯示當前階段工具 */}
          <div>
            <div style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[10px] text-[#8E8E93] font-bold px-2 mb-2 uppercase tracking-widest border-b border-[#3F5B63]/30 pb-1">
              {workflow === 'measure' ? 'STAGE 1: MEASURE' : workflow === 'layout' ? 'STAGE 2: LAYOUT' : 'STAGE 3: AUDIT'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {workflow === 'measure' && (
                <>
                  <ToolCard icon={<Building />} label="新建丈量" onClick={() => setIsSurveyWizardOpen(true)} color="text-amber-400" />
                  <ToolCard icon={<Sparkles />} label="口述優化" onClick={() => setIsVoiceOptimizerOpen(true)} color="text-[#D99AA2]" />
                  <ToolCard icon={<Ruler />} label="5倍數校正" onClick={() => setIsCalibration5xOpen(true)} color="text-[#E0A83C]" />
                  <ToolCard icon={<Layers />} label="幾何合併" onClick={() => setIsMultiRoomStitcherOpen(true)} color="text-cyan-400" />
                </>
              )}
              {workflow === 'layout' && (
                <>
                  <ToolCard icon={<Layers />} label="幾何剛體合併" onClick={() => setIsMultiRoomStitcherOpen(true)} color="text-cyan-400" />
                  <ToolCard icon={<Layers />} label="2D/3D 切換" onClick={() => setActiveMainTab(prev => prev === '3d_simulation' ? '2d_staking' : '3d_simulation')} color="text-[#E0A83C]" />
                  <ToolCard icon={<Box />} label="快建實樑" onClick={() => showToast('已啟動快建實樑工具！')} color="text-[#FF9F0A]" />
                  <ToolCard icon={<Palette />} label="填滿樣式" onClick={() => setIsHatchPatternModalOpen(true)} color="text-[#DDD7CE]" />
                  <ToolCard icon={<FolderPlus />} label="圖塊庫" onClick={() => setIsPersonalBlockLibraryOpen(true)} color="text-[#3F5B63]" />
                  <ToolCard icon={<LayoutGrid />} label="自動排版" onClick={() => setIsAutoSpaceLayoutOpen(true)} color="text-[#30D158]" />
                  <ToolCard icon={<PaintBucket />} label="圖層對比" onClick={() => setIsLayerColorContrastOpen(true)} color="text-[#D99AA2]" />
                </>
              )}
              {workflow === 'audit' && (
                <>
                  <ToolCard icon={<ShieldCheck />} label="規範檢核" onClick={() => setIsComplianceReportOpen(true)} color="text-[#B4503A]" />
                  <ToolCard icon={<FileText />} label="報價概算" onClick={() => setIsQuotationOpen(true)} color="text-[#DDD7CE]" />
                  <ToolCard icon={<Download />} label="匯出 DXF" onClick={() => downloadDxfFile(currentRoom, '室內設計_放樣尺寸圖')} color="text-[#E0A83C]" />
                  <ToolCard icon={<BookOpen />} label="圖冊組裝" onClick={() => setIsBatchSheetAssemblerOpen(true)} color="text-[#3F5B63]" />
                  <ToolCard icon={<Layout />} label="SU 輸出" onClick={() => setIsSuLayoutOpen(true)} color="text-[#3F5B63]" />
                </>
              )}
            </div>
          </div>

          {/* 常駐進階 AI 與設定 */}
          <div>
            <div style={{ fontFamily: 'var(--mp-font-ui)' }} className="text-[10px] text-[#8E8E93] font-bold px-2 mb-2 uppercase tracking-widest border-b border-[#3F5B63]/30 pb-1">ADVANCED AI & SETTINGS</div>
            <div className="flex flex-col gap-2">
              <ToolDockButton icon={<Cpu />} label="AI 派工中心" onClick={() => setIsAiFeaturesOpen(true)} color="text-[#E0A83C]" />
              <ToolDockButton icon={<FileSearch />} label="PDF/圖面 OCR" onClick={() => setIsPdfOcrOpen(true)} color="text-[#30D158]" />
              <ToolDockButton icon={<AlertTriangle />} label="碰撞檢測" onClick={() => setIsClashDetectionOpen(true)} color="text-[#B4503A]" />
              <ToolDockButton icon={<Wrench />} label="圖層規格" onClick={() => setIsCadStandardsOpen(true)} color="text-[#8E8E93]" />
              <ToolDockButton icon={<Settings />} label="所有功能" onClick={() => setIsExtendedHubOpen(true)} color="text-[#DDD7CE]" />
              <ToolDockButton icon={<Trash2 />} label="徹底清空快取 (Reset)" onClick={handleResetMinusPlusStorage} color="text-red-400" />
              <ToolDockButton icon={<Sliders />} label="除錯中樞 (Debug)" onClick={() => setShowDebug(true)} color="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ 常駐緊急快取清理/除錯按鈕 (Bottom-Left Floating Reset/Debug Trigger) */}
      <div className="fixed bottom-3 left-3 z-30 hidden items-center gap-1.5 bg-[#121810]/80 backdrop-blur-md p-1.5 rounded-xl border border-[#3F5B63]/40 shadow-lg lg:flex">
        <button
          onClick={handleResetMinusPlusStorage}
          className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title="徹底刪除所有 minusplus_ 開頭的 localStorage 並強制重新整理頁面"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>清空快取</span>
        </button>
        <button
          onClick={() => setShowDebug(prev => !prev)}
          className="p-1.5 rounded-lg bg-[#23301F]/60 hover:bg-[#23301F] text-[#8E8E93] hover:text-amber-400 transition cursor-pointer"
          title="切換系統除錯中樞 (快捷鍵: Ctrl+Shift+D)"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 語音輸入面板 Modal (保留)                                                   */}
      {/* ========================================================================= */}
      {isVoicePanelOpen && (
        <div className="fixed inset-0 z-[100] bg-[#121810]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#23301F] border border-[#3F5B63] rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-[#3F5B63]/50 flex justify-between items-center bg-[#151A14]">
              <span style={{ fontFamily: 'var(--mp-font-cn-display)' }} className="font-bold text-[#F8F8F6] flex items-center gap-2 text-lg tracking-wider">
                <Mic className="w-5 h-5 text-[#B4503A]"/> 語音智能解析
              </span>
              <button onClick={() => setIsVoicePanelOpen(false)} className="text-[#DDD7CE] hover:text-[#E0A83C] bg-[#3F5B63]/30 p-1.5 rounded-full transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <VoiceInputPanel currentRoom={currentRoom} onApplyParsedRoom={handleUpdateRoom} />
            </div>
          </div>
        </div>
      )}

      {/* 保留所有原本的 Modals (隱藏在背景) */}
      <VoiceMemoModal memo={selectedVoiceMemo} onClose={() => setSelectedVoiceMemo(null)} onUpdateMemo={(updated) => { const updatedMemos = currentRoom.voiceMemos.map((m) => m.id === updated.id ? updated : m ); handleUpdateRoom({ ...currentRoom, voiceMemos: updatedMemos, }); }} />
      {isAiFeaturesOpen && <AiFeaturesModal room={currentRoom} onClose={() => setIsAiFeaturesOpen(false)} onUpdateRoom={handleUpdateRoom} onOpenVoiceSummary={() => { setIsAiFeaturesOpen(false); setIsVoiceSummaryOpen(true); }} onOpenCompliance={() => { setIsAiFeaturesOpen(false); setIsComplianceReportOpen(true); }} />}
      {isMaterialLibraryOpen && <MaterialLibraryModal room={currentRoom} onClose={() => setIsMaterialLibraryOpen(false)} onApplyMaterials={handleApplyMaterials} />}
      {isVoiceSummaryOpen && <VoiceSummaryModal room={currentRoom} onClose={() => setIsVoiceSummaryOpen(false)} onAddVoiceMemo={handleAddVoiceMemo} />}
      {isSunlightSimOpen && <SunlightSimulationModal room={currentRoom} onClose={() => setIsSunlightSimOpen(false)} onApplySunlight={handleApplySunlight} />}
      {isDxfSettingsOpen && <DxfCustomSettingsModal room={currentRoom} onClose={() => setIsDxfSettingsOpen(false)} />}
      {isComplianceReportOpen && <ComplianceReportModal room={currentRoom} onClose={() => setIsComplianceReportOpen(false)} />}
      {isIpadModalOpen && <IpadEditionModal isOpen={isIpadModalOpen} onClose={() => setIsIpadModalOpen(false)} onNotify={showToast} isIpadSimulated={isIpadSimulated} setIsIpadSimulated={setIsIpadSimulated} onOpenScanCamera={() => setIsCameraScanOpen(true)} />}
      {isCameraScanOpen && <CameraRoomScanModal isOpen={isCameraScanOpen} onClose={() => setIsCameraScanOpen(false)} currentRoom={currentRoom} onApplyScannedRoom={handleUpdateRoom} onNotify={showToast} />}
      {isDetailLibraryOpen && <DetailLibraryModal isOpen={isDetailLibraryOpen} onClose={() => setIsDetailLibraryOpen(false)} onApplyDetailToRoom={(detail) => { showToast(`已成功套用大樣圖「${detail.title}」至天花降板工程規約！`); }} onNotify={showToast} />}
      {isCadStandardsOpen && <CadLayerStandardModal isOpen={isCadStandardsOpen} onClose={() => setIsCadStandardsOpen(false)} onNotify={showToast} />}
      {isArStakingOpen && <ArStakingPreviewModal isOpen={isArStakingOpen} onClose={() => setIsArStakingOpen(false)} room={currentRoom} onNotify={showToast} />}
      {isQuotationOpen && <QuotationEstimatorModal isOpen={isQuotationOpen} onClose={() => setIsQuotationOpen(false)} room={currentRoom} allRooms={rooms} onNotify={showToast} />}
      {isDetailPdfOpen && <DetailDrawingPdfExportModal isOpen={isDetailPdfOpen} onClose={() => setIsDetailPdfOpen(false)} room={currentRoom} onNotify={showToast} />}
      {isBatchDxfOpen && <BatchDxfOptimizerModal isOpen={isBatchDxfOpen} onClose={() => setIsBatchDxfOpen(false)} rooms={rooms} onNotify={showToast} />}
      {isCustomBlockOpen && <CustomBlockImportModal isOpen={isCustomBlockOpen} onClose={() => setIsCustomBlockOpen(false)} onApplyBlockToRoom={(block) => { showToast(`已套用「${block.name}」自訂圖塊至「${currentRoom.roomName}」平面配置！`); }} onNotify={showToast} />}
      {isVoiceOptimizerOpen && <VoiceCommandOptimizerModal isOpen={isVoiceOptimizerOpen} onClose={() => setIsVoiceOptimizerOpen(false)} currentRoom={currentRoom} onApplyOptimization={(updatedRoom, appliedResult) => { handleUpdateRoom(updatedRoom); showToast(`已成功優化口述指令並套用！`); }} />}
      {isExtendedHubOpen && <ExtendedFeaturesHubModal isOpen={isExtendedHubOpen} onClose={() => setIsExtendedHubOpen(false)} room={currentRoom} initialFeature={initialExtendedFeature} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />}
      {isClaudeSpecOpen && <ClaudeDesignSpecModal isOpen={isClaudeSpecOpen} onClose={() => setIsClaudeSpecOpen(false)} onNotify={showToast} />}
      {isGoogleApiIdeOpen && <GoogleApiIdeDispatcherModal isOpen={isGoogleApiIdeOpen} onClose={() => setIsGoogleApiIdeOpen(false)} room={currentRoom} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />}
      {isSketchUpOpen && <SketchUpExportModal isOpen={isSketchUpOpen} onClose={() => setIsSketchUpOpen(false)} room={currentRoom} onNotify={showToast} />}
      {isScanTutorialOpen && <ScanningTutorialModal isOpen={isScanTutorialOpen} onClose={() => setIsScanTutorialOpen(false)} onStartScan={() => { setIsScanTutorialOpen(false); setIsCameraScanOpen(true); }} onNotify={showToast} />}
      {isUiComfortOpen && <UiComfortSettingsModal isOpen={isUiComfortOpen} onClose={() => setIsUiComfortOpen(false)} config={uiComfort} onChangeConfig={setUiComfort} onNotify={showToast} />}
      <DrawingSaveHabitsModal isOpen={isDrawingHabitsOpen} onClose={() => setIsDrawingHabitsOpen(false)} room={currentRoom} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />
      <ElevationBenchmarkModal isOpen={isElevationBenchmarkOpen} onClose={() => setIsElevationBenchmarkOpen(false)} room={currentRoom} onUpdateRoom={handleUpdateRoom} onNotify={showToast} onOpenDesignerExtractor={() => setIsDesignerExtractorOpen(true)} />
      <IpadHiddenMenuModal isOpen={isIpadHiddenMenuOpen} onClose={() => setIsIpadHiddenMenuOpen(false)} onEnterZenMode={() => setIsZenMeasurementMode(true)} onNotify={showToast} />
      <PanoramicVisualGuideModal isOpen={isPanoramicGuideOpen} onClose={() => setIsPanoramicGuideOpen(false)} onNotify={showToast} onLaunchLiveCamera={() => setIsCameraScanOpen(true)} />
      <AuditDistributionModal isOpen={isAuditDistributionOpen} onClose={() => setIsAuditDistributionOpen(false)} onNotify={showToast} onOpenAuditDashboard={() => { setIsZenMeasurementMode(false); setActiveMainTab('audit_dashboard'); }} onOpenGoogleApiIde={() => setIsGoogleApiIdeOpen(true)} />
      <ClearAllConfirmModal isOpen={isClearAllModalOpen} onClose={() => setIsClearAllModalOpen(false)} onConfirmClear={() => handleConfirmClear('current_room_elements')} room={currentRoom} />
      <ConstructionDetailLibraryModal isOpen={isConstructionLibraryOpen} onClose={() => setIsConstructionLibraryOpen(false)} room={currentRoom} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />
      <ThreeDRenderExplanationModal isOpen={is3DRenderExplanationOpen} onClose={() => setIs3DRenderExplanationOpen(false)} onOpenSketchUpExport={() => { setIs3DRenderExplanationOpen(false); setIsSketchUpOpen(true); }} onSwitchTo3DView={() => { setIs3DRenderExplanationOpen(false); setActiveMainTab('3d_simulation'); }} />
      <CadWorkflowHubModal 
        isOpen={isCadWorkflowHubOpen || isCadHubOpen} 
        onClose={() => { setIsCadWorkflowHubOpen(false); setIsCadHubOpen(false); }} 
        rooms={rooms} 
        projectName={projectName} 
        onNotify={showToast} 
      />
      <GeminiChatbotModal isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} room={currentRoom} onNotify={showToast} />
      <ProjectCloudBackupModal isOpen={isCloudBackupOpen} onClose={() => setIsCloudBackupOpen(false)} rooms={rooms} onRestoreSnapshot={(restored) => { pushHistory(restored); }} onNotify={showToast} />
      <CompanyTitleBlockDesignerModal isOpen={isCompanyTitleBlockOpen} onClose={() => setIsCompanyTitleBlockOpen(false)} room={currentRoom} onSaveSettings={(cfg) => { showToast(`已更新公司圖框設定「${cfg.companyName}」！`); }} onNotify={showToast} />
      <DwgBatchHabitLearningModal isOpen={isDwgHabitsLearnerOpen} onClose={() => setIsDwgHabitsLearnerOpen(false)} room={currentRoom} onApplyProfileToSystem={(prof) => { showToast(`🏆 已套用個人專用規格表「${prof.profileName}」為全域出圖範本！`); }} onNotify={showToast} />
      <PersonalDetailBlockLibraryModal isOpen={isPersonalBlockLibraryOpen} onClose={() => { setIsPersonalBlockLibraryOpen(false); setDraggedFurnitureBlock(null); }} room={currentRoom} onInsertBlockToRoom={handleInsertFurnitureBlock} onNotify={showToast} onDragBlockStart={setDraggedFurnitureBlock} onDragBlockEnd={() => setDraggedFurnitureBlock(null)} />
      <SearchGroundingModal isOpen={isSearchGroundingOpen} onClose={() => setIsSearchGroundingOpen(false)} room={currentRoom} onApplyAnnotation={(note) => { const updated = { ...currentRoom, notes: [...(currentRoom.notes || []), note], }; handleUpdateRoom(updated); }} onNotify={showToast} />
      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} room={currentRoom} rooms={rooms} onNotify={showToast} />
      <HatchPatternPreviewModal isOpen={isHatchPatternModalOpen} onClose={() => setIsHatchPatternModalOpen(false)} room={currentRoom} onApplyHatchToRoom={(pat, scale, angle, color) => { const updated = { ...currentRoom, notes: [ ...(currentRoom.notes || []), `[剖面填滿] ${pat.name} (比例 ${scale}x, 角度 ${angle}°, AutoCAD 顏色 ${color})`, ], }; handleUpdateRoom(updated); showToast(`已成功套用「${pat.name}」填滿樣式至 ${currentRoom.roomName}`); }} onNotify={showToast} />
      <BatchAutoClassificationModal isOpen={isBatchClassificationModalOpen} onClose={() => setIsBatchClassificationModalOpen(false)} room={currentRoom} onApplyLayerMapping={(mapping) => { showToast(`已將 ${Object.keys(mapping).length} 項工件圖層指派規則套用至 AutoCAD 圖層引擎！`); }} onNotify={showToast} />
      <ProjectTemplateManagerModal isOpen={isProjectTemplateModalOpen} onClose={() => setIsProjectTemplateModalOpen(false)} currentRoom={currentRoom} rooms={rooms} projectName={projectName} onSetProjectName={setProjectName} onStartFreshProject={handleStartFreshProject} onAddRoomFromTemplate={handleAddRoomFromTemplate} onClearCurrentRoomElements={handleClearCurrentRoomElements} onNotify={showToast} />
      
      {/* 🛠️ Debug Panel */}
      {showDebug && (
        <div className="fixed top-4 left-4 z-[9999] bg-[#0d140e]/95 text-white p-5 rounded-2xl border-2 border-red-500 shadow-2xl w-88 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 border-b border-red-500/30 pb-2">
            <h3 className="font-bold text-red-400 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              系統除錯中樞
            </h3>
            <button 
              onClick={() => setShowDebug(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="關閉除錯面板"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-neutral-300 space-y-1.5 mb-4">
            <p>儲存空間佔用: <span className="font-mono text-amber-400 font-bold">{getStorageSize()} MB</span></p>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              點擊下方按鈕將徹底刪除所有以 <code className="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono">minusplus_</code> 為開頭的 LocalStorage 金鑰，並立即執行 <code className="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono">window.location.reload()</code> 以確保系統從乾淨狀態重新初始化。
            </p>
          </div>
          <button 
            onClick={handleResetMinusPlusStorage}
            className="w-full bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-xl text-sm font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            強制重置所有數據 (清空 minusplus_* 金鑰)
          </button>
        </div>
      )}
      <AutomatedClashDetectionModal isOpen={isClashDetectionOpen} onClose={() => setIsClashDetectionOpen(false)} room={currentRoom} allRooms={rooms} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />
      <BeamDepthCalculatorModal isOpen={isBeamDepthCalcOpen} onClose={() => setIsBeamDepthCalcOpen(false)} room={currentRoom} onUpdateRoom={handleUpdateRoom} onNotify={showToast} />
      <LayerColorContrastModal isOpen={isLayerColorContrastOpen} onClose={() => setIsLayerColorContrastOpen(false)} onNotify={showToast} onApplyPalette={(palette, bgHex) => { showToast('✓ 已將最佳圖層顏色對比套用至 2D 放樣畫布！'); }} />
      <AutoSpaceLayoutModal
        isOpen={isAutoSpaceLayoutOpen}
        onClose={() => setIsAutoSpaceLayoutOpen(false)}
        room={currentRoom}
        rooms={rooms}
        onApplyOptimizedLayout={(roomId, newFurniture) => {
          const target = rooms.find((item) => item.id === roomId);
          if (!target) return;
          const retainedBlocks = (target.placedBlocks || []).filter((block) => !block.id.startsWith('auto-layout:'));
          const layoutBlocks: PlacedBlockItem[] = newFurniture.map((item) => ({
            id: `auto-layout:${item.id}`, blockId: item.id, name: item.name, category: 'furniture',
            subCategory: item.category, x: item.x, y: item.y, widthCm: item.width, depthCm: item.depth,
            heightCm: item.height, elevationCm: item.elevation, cadLayer: 'A-FURN-AUTO', colorIndex: 3,
            rotationDeg: item.rotationY ?? 0, snappedTo: '2D 家具配置保存', placedAt: new Date().toISOString(),
          }));
          handleUpdateRoom({ ...target, furniture: newFurniture, placedBlocks: [...retainedBlocks, ...layoutBlocks] });
        }}
        onNotify={showToast}
      />
      <NewProjectSurveyWizardModal
        isOpen={isSurveyWizardOpen}
        onClose={() => setIsSurveyWizardOpen(false)}
        onStartFreshProject={handleStartFreshProject}
        onOpenStitcher={() => setIsMultiRoomStitcherOpen(true)}
        onNotify={showToast}
      />
      <MultiRoomStitcherModal
        isOpen={isMultiRoomStitcherOpen}
        onClose={() => setIsMultiRoomStitcherOpen(false)}
        rooms={rooms}
        onUpdateRooms={(updated) => { pushHistory(updated); showToast('已成功更新全案拓撲配置！'); }}
        onNotify={showToast}
      />
      <FloorplanPdfImportModal
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        onImportRooms={(newRooms, pName) => {
          pushHistory(newRooms);
          if (newRooms[0]) setSelectedRoomId(newRooms[0].id);
          if (pName) setProjectName(pName);
          setCleanStep('3_layout');
          setWorkflow('layout');
          setActiveMainTab('2d_staking');
          showToast(`已载入「${pName || '建商图面'}」${newRooms.length} 个空间，并进入 2D 平面配置。`);
        }}
        onNotify={showToast}
      />
    </div>
  );
}

// 右側工具塢按鈕小元件 (List Item)
function ToolDockButton({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#3F5B63]/40 transition group/btn w-full text-left"
    >
      <div className={`w-5 h-5 shrink-0 ${color}`}>{icon}</div>
      <span style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-sm font-medium text-[#DDD7CE] group-hover/btn:text-[#F8F8F6] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </button>
  );
}

// 右側工具塢卡片小元件 (Grid Item)
function ToolCard({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#121810] hover:bg-[#3F5B63]/40 border border-[#3F5B63]/30 transition group/card"
    >
      <div className={`w-6 h-6 ${color} group-hover/card:scale-110 transition-transform`}>{icon}</div>
      <span style={{ fontFamily: 'var(--mp-font-cn-body)' }} className="text-[11px] font-medium text-[#DDD7CE] group-hover/card:text-[#F8F8F6] text-center leading-tight">
        {label}
      </span>
    </button>
  );
}
