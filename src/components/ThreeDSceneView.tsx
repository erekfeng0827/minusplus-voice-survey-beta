import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomData, FurnitureItem, CollisionOptimizationSolution } from '../types';
import { DEFAULT_MATERIALS } from '../data/materialsAndConfig';
import { checkCollisionAndContractCompliance } from '../utils/collisionWarningEngine';
import { CollisionWarningPanel } from './CollisionWarningPanel';
import {
  Box,
  Layers,
  Sun,
  Grid,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Sparkles,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Tablet,
  Camera,
  Upload,
} from 'lucide-react';
import { ThreeDRenderViewerModal } from './ThreeDRenderViewerModal';

interface ThreeDSceneViewProps {
  room: RoomData;
  onUpdateRoom: (room: RoomData) => void;
  onNotify?: (msg: string) => void;
  onOpenCustomBlocks?: () => void;
}

export const ThreeDSceneView: React.FC<ThreeDSceneViewProps> = ({
  room,
  onUpdateRoom,
  onNotify,
  onOpenCustomBlocks,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<'iso' | 'top' | 'front' | 'side'>('iso');
  const [elevationCut, setElevationCut] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<'studio' | 'daylight'>('studio');
  const [enableAO, setEnableAO] = useState<boolean>(true); // 光影即時渲染開關 (AO 環境光遮蔽與接觸陰影)

  // Collision Warning System State
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>(room.furniture || []);
  const [collisionWarningEnabled, setCollisionWarningEnabled] = useState<boolean>(true);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  // 3D Render Snapshot Modal State
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setFurnitureList(room.furniture || []);
  }, [room.id, room.furniture]);

  const persistFurniture = (next: FurnitureItem[], message?: string) => {
    setFurnitureList(next);
    onUpdateRoom({ ...room, furniture: next, lastUpdated: new Date().toISOString() });
    if (message) onNotify?.(message);
  };

  const handleCaptureRender = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    // Force a render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    try {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      setCapturedImageDataUrl(dataUrl);
      setIsRenderModalOpen(true);
      onNotify?.('✓ 3D 空間視角渲染快照成功！');
    } catch (e) {
      console.error('Failed to capture 3D render', e);
      setIsRenderModalOpen(true);
    }
  };

  // Compute collision issues in real time
  const collisionIssues = useMemo(() => {
    return checkCollisionAndContractCompliance(room, furnitureList);
  }, [room, furnitureList]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 850, theta: Math.PI / 4, phi: Math.PI / 3 });

  // iPad touch state
  const touchStartDistRef = useRef<number>(0);
  const touchStartRadiusRef = useRef<number>(850);
  const previousTouchPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Build 3D Geometry including Furniture and Collision Bounding Boxes
    rebuild3DModel(
      scene,
      room,
      wireframe,
      elevationCut,
      lightingMode,
      enableAO,
      furnitureList,
      collisionWarningEnabled,
      collisionIssues,
      selectedFurnitureId
    );

    // Render loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Mouse drag handlers for Orbit
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.008;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.008));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(250, Math.min(2200, sphericalRef.current.radius + e.deltaY * 0.6));
      updateCameraPosition();
    };

    // iPad / iOS Touch Event Listeners for silky-smooth gestures
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        previousTouchPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDistRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartRadiusRef.current = sphericalRef.current.radius;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent page scrolling during 3D inspection
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousTouchPositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousTouchPositionRef.current.y;
        sphericalRef.current.theta -= deltaX * 0.008;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.008));
        previousTouchPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCameraPosition();
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDistRef.current > 0) {
          const factor = touchStartDistRef.current / currentDist;
          sphericalRef.current.radius = Math.max(250, Math.min(2200, touchStartRadiusRef.current * factor));
          updateCameraPosition();
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Touch events on canvas
    dom.addEventListener('touchstart', onTouchStart, { passive: false });
    dom.addEventListener('touchmove', onTouchMove, { passive: false });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    room,
    wireframe,
    elevationCut,
    lightingMode,
    enableAO,
    furnitureList,
    collisionWarningEnabled,
    collisionIssues,
    selectedFurnitureId,
  ]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, room.height * 0.45, 0);
  };

  const setViewPreset = (view: 'iso' | 'top' | 'front' | 'side') => {
    setCameraView(view);
    if (view === 'iso') {
      sphericalRef.current = { radius: 950, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (view === 'top') {
      sphericalRef.current = { radius: 1000, theta: 0, phi: 0.05 };
    } else if (view === 'front') {
      sphericalRef.current = { radius: 900, theta: 0, phi: Math.PI / 2.05 };
    } else if (view === 'side') {
      sphericalRef.current = { radius: 900, theta: Math.PI / 2, phi: Math.PI / 2.05 };
    }
    updateCameraPosition();
  };

  // Focus camera on a specific colliding furniture item
  const focusOnFurniture = (id: string | null) => {
    setSelectedFurnitureId(id);
    if (!id) return;
    const item = furnitureList.find((f) => f.id === id);
    if (!item) return;

    const halfW = room.width / 2;
    const halfL = room.length / 2;
    const itemCenterX = item.x - halfW + item.width / 2;
    const itemCenterZ = item.y - halfL + item.depth / 2;
    const itemCenterY = item.elevation + item.height / 2;

    sphericalRef.current.radius = 480;
    sphericalRef.current.theta = Math.atan2(itemCenterX, itemCenterZ) + 0.3;
    sphericalRef.current.phi = Math.PI / 3.5;
    updateCameraPosition();

    if (cameraRef.current) {
      cameraRef.current.lookAt(itemCenterX, itemCenterY, itemCenterZ);
    }
  };

  // Apply single solution
  const handleApplySolution = (furnitureId: string, solution: CollisionOptimizationSolution) => {
    const next = furnitureList.map((f) => f.id === furnitureId ? { ...f, ...solution.newValues } : f);
    persistFurniture(next, `已套用「${solution.title}」，并同步写回平面配置。`);
  };

  // Apply all optimizations
  const handleApplyAllOptimizations = () => {
    const next = collisionIssues.reduce((items, issue) => {
      const solution = issue.solutions[0];
      if (!solution) return items;
      return items.map((item) => item.id === issue.furnitureId ? { ...item, ...solution.newValues } : item);
    }, furnitureList);
    persistFurniture(next, '已套用目前可计算的避让建议并同步写回；仍需重新检查剩余冲突。');
  };

  function rebuild3DModel(
    scene: THREE.Scene,
    r: RoomData,
    isWireframe: boolean,
    isElevationCut: boolean,
    lightMode: string,
    isAOEnabled: boolean,
    furnitures: FurnitureItem[],
    showWarnings: boolean,
    issues: ReturnType<typeof checkCollisionAndContractCompliance>,
    selectedId: string | null
  ) {
    // Clear old meshes
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Lights
    const ambient = new THREE.AmbientLight(
      0xffffff,
      lightMode === 'daylight' ? (isAOEnabled ? 0.65 : 0.95) : (isAOEnabled ? 0.45 : 0.65)
    );
    scene.add(ambient);

    if (isAOEnabled) {
      // Hemisphere Light provides soft sky-to-ground ambient contrast (natural ambient occlusion)
      const hemiLight = new THREE.HemisphereLight(
        lightMode === 'daylight' ? 0xfffbeb : 0xf8fafc,
        0x1e293b,
        0.55
      );
      scene.add(hemiLight);
    }

    const dirLight = new THREE.DirectionalLight(
      0xfffaed,
      lightMode === 'daylight' ? (isAOEnabled ? 1.6 : 1.4) : (isAOEnabled ? 1.25 : 0.9)
    );
    dirLight.position.set(400, 600, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = isAOEnabled ? 2048 : 1024;
    dirLight.shadow.mapSize.height = isAOEnabled ? 2048 : 1024;
    dirLight.shadow.bias = -0.0005;
    if (isAOEnabled) {
      dirLight.shadow.radius = 4; // Soft PCF shadow edges
    }
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x38bdf8, isAOEnabled ? 0.35 : 0.45, 1500);
    fillLight.position.set(-300, 200, -200);
    scene.add(fillLight);

    // Coordinate center shift
    const halfW = r.width / 2;
    const halfL = r.length / 2;
    const wallThick = r.wallThickness || 15;

    // Materials lookup
    const findMat = (id?: string) => DEFAULT_MATERIALS.find((m) => m.id === id);
    const selFloor = findMat(r.materials?.floorId);
    const selWall = findMat(r.materials?.wallId);
    const selCeil = findMat(r.materials?.ceilingId);
    const selBeam = findMat(r.materials?.beamId);

    const floorMat = new THREE.MeshStandardMaterial({
      color: selFloor ? new THREE.Color(selFloor.hexColor) : new THREE.Color(0xd4b38a),
      roughness: selFloor ? selFloor.roughness : 0.4,
      metalness: 0.1,
      wireframe: isWireframe,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: selWall ? new THREE.Color(selWall.hexColor) : new THREE.Color(0xf1f5f9),
      roughness: selWall ? selWall.roughness : 0.7,
      wireframe: isWireframe,
    });

    const ceilingDropMat = new THREE.MeshStandardMaterial({
      color: selCeil ? new THREE.Color(selCeil.hexColor) : new THREE.Color(0xf59e0b),
      roughness: selCeil ? selCeil.roughness : 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      wireframe: isWireframe,
    });

    const beamMat = new THREE.MeshStandardMaterial({
      color: selBeam ? new THREE.Color(selBeam.hexColor) : new THREE.Color(0xef4444),
      roughness: selBeam ? selBeam.roughness : 0.6,
      wireframe: isWireframe,
    });

    const specialBeamMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0x4c0519,
      emissiveIntensity: 0.4,
      wireframe: isWireframe,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });

    // 1. Floor Slab
    const floorGeo = new THREE.BoxGeometry(r.width, 10, r.length);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -5, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Floor Baseboard accent line
    const gridHelper = new THREE.GridHelper(Math.max(r.width, r.length) * 1.5, 20, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -5.1;
    scene.add(gridHelper);

    // 2. Walls (Back, Left, Right, Front)
    const backWallGeo = new THREE.BoxGeometry(r.width + wallThick * 2, r.height, wallThick);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, r.height / 2, -halfL - wallThick / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWallGeo = new THREE.BoxGeometry(wallThick, r.height, r.length);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-halfW - wallThick / 2, r.height / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWallGeo = new THREE.BoxGeometry(wallThick, r.height, r.length);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(halfW + wallThick / 2, r.height / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    if (!isElevationCut) {
      const frontWallGeo = new THREE.BoxGeometry(r.width + wallThick * 2, r.height, wallThick);
      const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
      frontWall.position.set(0, r.height / 2, halfL + wallThick / 2);
      frontWall.receiveShadow = true;
      scene.add(frontWall);
    }

    // 3. Beams
    r.beams.forEach((b) => {
      const isSpecial =
        b.id.includes('spec') ||
        b.name.includes('特殊') ||
        b.orientation === 'vertical' ||
        (b.depth !== undefined && b.depth < r.width);
      const mat = isSpecial ? specialBeamMat : beamMat;
      const bHeight = Math.max(12, r.height - b.clearHeight);

      let sizeX = r.width;
      let sizeZ = b.width;
      let posX = 0;
      let posZ = b.y - halfL + b.width / 2;

      if (b.orientation === 'vertical') {
        sizeX = b.width;
        sizeZ = b.depth || r.length;
        posX = (b.x !== undefined ? b.x : halfW - b.width / 2) - halfW + sizeX / 2;
        posZ = (b.y !== undefined ? b.y : 0) - halfL + sizeZ / 2;
      } else {
        if (b.depth && b.depth < r.width && b.x !== undefined) {
          sizeX = b.depth;
          sizeZ = b.width;
          posX = b.x - halfW + sizeX / 2;
          posZ = b.y - halfL + sizeZ / 2;
        } else {
          sizeX = r.width;
          sizeZ = b.width;
          posX = 0;
          posZ = b.y - halfL + b.width / 2;
        }
      }

      const beamGeo = new THREE.BoxGeometry(sizeX, bHeight, sizeZ);
      const beamMesh = new THREE.Mesh(beamGeo, mat);
      beamMesh.position.set(posX, r.height - bHeight / 2, posZ);
      beamMesh.castShadow = true;
      beamMesh.receiveShadow = true;
      scene.add(beamMesh);

      if (isSpecial) {
        const wireframeEdges = new THREE.EdgesGeometry(beamGeo);
        const wireframeLine = new THREE.LineSegments(
          wireframeEdges,
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
        );
        wireframeLine.position.copy(beamMesh.position);
        scene.add(wireframeLine);
      }
    });

    // 4. Ceiling Drop Zone (空調/衛浴降板: 230 cm / 215 cm)
    const dropDepth = Math.round(r.length * 0.35);
    const dropThickness = r.height - r.ceilingDrop;
    const dropGeo = new THREE.BoxGeometry(r.width, dropThickness, dropDepth);
    const dropMesh = new THREE.Mesh(dropGeo, ceilingDropMat);
    dropMesh.position.set(0, r.height - dropThickness / 2, -halfL + dropDepth / 2);
    dropMesh.castShadow = true;
    dropMesh.receiveShadow = true;
    scene.add(dropMesh);

    // Ceiling Drop Elevation reference edge
    const dropEdges = new THREE.EdgesGeometry(dropGeo);
    const dropEdgeLines = new THREE.LineSegments(
      dropEdges,
      new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 })
    );
    dropEdgeLines.position.copy(dropMesh.position);
    scene.add(dropEdgeLines);

    // AO Contact Shadow Plane beneath Ceiling Drop Soffit
    if (isAOEnabled) {
      const aoDropGeo = new THREE.PlaneGeometry(r.width - 4, 28);
      const aoDropMat = new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      });
      const aoDropMesh = new THREE.Mesh(aoDropGeo, aoDropMat);
      aoDropMesh.rotation.x = Math.PI / 2;
      aoDropMesh.position.set(0, r.ceilingDrop - 0.2, -halfL + dropDepth + 14);
      scene.add(aoDropMesh);
    }

    // 5. Windows
    r.windows.forEach((w) => {
      const winGeo = new THREE.BoxGeometry(w.width, w.height, 4);
      const winMesh = new THREE.Mesh(winGeo, glassMat);
      winMesh.position.set(w.offset - halfW + w.width / 2, w.sillHeight + w.height / 2, -halfL);
      scene.add(winMesh);
    });

    // 6. Doors & Swing Arc in 3D
    r.doors.forEach((d) => {
      // Door frame opening
      if (d.wall === 'bottom') {
        const doorOpeningGeo = new THREE.BoxGeometry(d.width, d.height, wallThick + 2);
        const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
        const doorOpening = new THREE.Mesh(doorOpeningGeo, doorFrameMat);
        doorOpening.position.set(d.offset - halfW + d.width / 2, d.height / 2, halfL);
        scene.add(doorOpening);

        // Door leaf (in partially open position)
        const doorLeafGeo = new THREE.BoxGeometry(d.width, d.height, 4);
        const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
        const doorLeaf = new THREE.Mesh(doorLeafGeo, doorLeafMat);
        doorLeaf.position.set(d.offset - halfW + d.width / 2, d.height / 2, halfL - 10);
        scene.add(doorLeaf);

        // 3D Door Swing Radius Guide Arc on Floor
        const curve = new THREE.EllipseCurve(
          d.offset - halfW,
          halfL, // ax, aY
          d.width,
          d.width, // xRadius, yRadius
          0,
          Math.PI / 2, // aStartAngle, aEndAngle
          false,
          0
        );
        const points = curve.getPoints(24);
        const swingGeo = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, 0.5, p.y))
        );
        const swingLine = new THREE.Line(
          swingGeo,
          new THREE.LineDashedMaterial({ color: 0xec4899, dashSize: 4, gapSize: 3 })
        );
        swingLine.computeLineDistances();
        scene.add(swingLine);
      }
    });

    // 7. Furniture Items & 3D COLLISION WARNING BOUNDING BOXES
    furnitures.forEach((item) => {
      const itemIssues = issues.filter((iss) => iss.furnitureId === item.id);
      const isColliding = itemIssues.length > 0;
      const isSelected = selectedId === item.id;

      const posX = item.x - halfW + item.width / 2;
      const posZ = item.y - halfL + item.depth / 2;
      const posY = item.elevation + item.height / 2;

      // Create Furniture Mesh depending on category
      const itemGroup = new THREE.Group();
      itemGroup.position.set(posX, posY, posZ);

      // Base furniture materials
      const mainMat = new THREE.MeshStandardMaterial({
        color: item.colorHex ? new THREE.Color(item.colorHex) : new THREE.Color(0x818cf8),
        roughness: 0.4,
        metalness: 0.1,
      });

      if (item.category === 'wardrobe') {
        // High wardrobe with realistic vertical panels
        const wardGeo = new THREE.BoxGeometry(item.width, item.height, item.depth);
        const wardMesh = new THREE.Mesh(wardGeo, mainMat);
        wardMesh.castShadow = true;
        wardMesh.receiveShadow = true;
        itemGroup.add(wardMesh);

        // Vertical divider groove
        const grooveGeo = new THREE.BoxGeometry(1, item.height * 0.92, item.depth + 1);
        const grooveMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });
        const groove = new THREE.Mesh(grooveGeo, grooveMat);
        itemGroup.add(groove);
      } else if (item.category === 'ac_indoor_unit') {
        // Suspended AC indoor unit plenum box
        const acGeo = new THREE.BoxGeometry(item.width, item.height, item.depth);
        const acMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.3 });
        const acMesh = new THREE.Mesh(acGeo, acMat);
        acMesh.castShadow = true;
        itemGroup.add(acMesh);

        // Front air discharge louvers
        const louverGeo = new THREE.BoxGeometry(item.width * 0.85, 4, 2);
        const louverMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
        const louver = new THREE.Mesh(louverGeo, louverMat);
        louver.position.set(0, -item.height / 4, item.depth / 2 + 1);
        itemGroup.add(louver);
      } else if (item.category === 'lighting') {
        // Modern pendant lamp with cord
        const lampGeo = new THREE.CylinderGeometry(item.width / 4, item.width / 2, item.height, 16);
        const lampMesh = new THREE.Mesh(lampGeo, mainMat);
        lampMesh.castShadow = true;
        itemGroup.add(lampMesh);

        // Cord from ceiling
        const cordLength = Math.max(10, r.height - (item.elevation + item.height));
        const cordGeo = new THREE.CylinderGeometry(0.8, 0.8, cordLength, 6);
        const cordMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
        const cord = new THREE.Mesh(cordGeo, cordMat);
        cord.position.set(0, item.height / 2 + cordLength / 2, 0);
        itemGroup.add(cord);

        // Glowing bulb
        const bulbGeo = new THREE.SphereGeometry(6, 12, 12);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(0, -item.height / 4, 0);
        itemGroup.add(bulb);
      } else if (item.category === 'cabinet') {
        // Storage console cabinet
        const cabGeo = new THREE.BoxGeometry(item.width, item.height, item.depth);
        const cabMesh = new THREE.Mesh(cabGeo, mainMat);
        cabMesh.castShadow = true;
        itemGroup.add(cabMesh);
      } else {
        // Standard desk / table
        const topGeo = new THREE.BoxGeometry(item.width, 6, item.depth);
        const topMesh = new THREE.Mesh(topGeo, mainMat);
        topMesh.position.set(0, item.height / 2 - 3, 0);
        itemGroup.add(topMesh);

        // Legs
        const legGeo = new THREE.BoxGeometry(4, item.height - 6, 4);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const leg1 = new THREE.Mesh(legGeo, legMat);
        leg1.position.set(-item.width / 2 + 4, -3, -item.depth / 2 + 4);
        const leg2 = new THREE.Mesh(legGeo, legMat);
        leg2.position.set(item.width / 2 - 4, -3, -item.depth / 2 + 4);
        const leg3 = new THREE.Mesh(legGeo, legMat);
        leg3.position.set(-item.width / 2 + 4, -3, item.depth / 2 - 4);
        const leg4 = new THREE.Mesh(legGeo, legMat);
        leg4.position.set(item.width / 2 - 4, -3, item.depth / 2 - 4);
        itemGroup.add(leg1, leg2, leg3, leg4);
      }

      scene.add(itemGroup);

      // AO Ground Contact Shadow under furniture when AO is enabled
      if (isAOEnabled) {
        const aoFootGeo = new THREE.PlaneGeometry(item.width * 0.96, item.depth * 0.96);
        const aoFootMat = new THREE.MeshBasicMaterial({
          color: 0x020617,
          transparent: true,
          opacity: 0.46,
          side: THREE.DoubleSide,
        });
        const aoFootMesh = new THREE.Mesh(aoFootGeo, aoFootMat);
        aoFootMesh.rotation.x = -Math.PI / 2;
        aoFootMesh.position.set(posX, item.elevation + 0.3, posZ);
        scene.add(aoFootMesh);
      }

      // ========================================================
      // 3D COLLISION WARNING SYSTEM: RED BOUNDING BOX & BEACONS
      // ========================================================
      if (showWarnings) {
        if (isColliding) {
          // 1. Glowing RED Wireframe Bounding Box
          const boundMargin = 4;
          const boundGeo = new THREE.BoxGeometry(
            item.width + boundMargin,
            item.height + boundMargin,
            item.depth + boundMargin
          );

          // Red wireframe edges
          const boundEdges = new THREE.EdgesGeometry(boundGeo);
          const boundLineMat = new THREE.LineBasicMaterial({
            color: 0xff0033, // Vivid Red Warning
            linewidth: isSelected ? 4 : 2,
          });
          const boundWireframe = new THREE.LineSegments(boundEdges, boundLineMat);
          boundWireframe.position.set(posX, posY, posZ);
          scene.add(boundWireframe);

          // Red translucent collision warning volume envelope
          const redEnvelopeMat = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
          });
          const redEnvelope = new THREE.Mesh(boundGeo, redEnvelopeMat);
          redEnvelope.position.set(posX, posY, posZ);
          scene.add(redEnvelope);

          // 2. Vertical Red Warning Beacon Pole & Sphere above colliding item
          const beaconTop = posY + item.height / 2 + 25;
          const poleHeight = 25;
          const beaconPoleGeo = new THREE.CylinderGeometry(1.2, 1.2, poleHeight, 8);
          const beaconPoleMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
          const beaconPole = new THREE.Mesh(beaconPoleGeo, beaconPoleMat);
          beaconPole.position.set(posX, posY + item.height / 2 + poleHeight / 2, posZ);
          scene.add(beaconPole);

          // Glowing Red Warning Alert Sphere
          const alertSphereGeo = new THREE.SphereGeometry(6, 16, 16);
          const alertSphereMat = new THREE.MeshStandardMaterial({
            color: 0xff0033,
            emissive: 0x990011,
            emissiveIntensity: 0.8,
            roughness: 0.2,
          });
          const alertSphere = new THREE.Mesh(alertSphereGeo, alertSphereMat);
          alertSphere.position.set(posX, beaconTop, posZ);
          scene.add(alertSphere);

          // Pulsing collision ring indicator
          const ringGeo = new THREE.RingGeometry(8, 11, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(posX, beaconTop + 0.5, posZ);
          scene.add(ring);
        } else {
          // Compliant Item: Subtle Green Wireframe Box showing "✓ 契約合規"
          const boundGeo = new THREE.BoxGeometry(item.width + 2, item.height + 2, item.depth + 2);
          const boundEdges = new THREE.EdgesGeometry(boundGeo);
          const greenLineMat = new THREE.LineBasicMaterial({
            color: 0x10b981, // Emerald Green
            transparent: true,
            opacity: 0.45,
          });
          const greenWireframe = new THREE.LineSegments(boundEdges, greenLineMat);
          greenWireframe.position.set(posX, posY, posZ);
          scene.add(greenWireframe);
        }
      }
    });

    // 8. Voice Memo 3D Marker Pins
    r.voiceMemos.forEach((vm) => {
      const pinX = vm.x - halfW;
      const pinZ = vm.y - halfL;

      const poleGeo = new THREE.CylinderGeometry(1.5, 1.5, 40, 8);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pinX, 20, pinZ);
      scene.add(pole);

      const sphereGeo = new THREE.SphereGeometry(7, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: vm.type === 'warning' ? 0xef4444 : 0x8b5cf6,
        emissive: 0x3b0764,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(pinX, 42, pinZ);
      scene.add(sphere);
    });
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* 3D Viewport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 backdrop-blur-sm z-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Title Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-800/50 text-xs font-semibold text-indigo-300">
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span>3D 一致性場景模擬</span>
          </div>

          {/* Collision Warning Active Status Badge */}
          <div
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
              collisionIssues.length > 0
                ? 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
            }`}
            title="點擊切換碰撞預警檢視抽屜"
          >
            {collisionIssues.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>碰撞預警：{collisionIssues.length} 處幾何契約干涉</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>碰撞預警：100% 契約合規</span>
              </>
            )}
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewPreset('iso')}
              className={`px-2 py-1 rounded transition-all ${
                cameraView === 'iso' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              等角透視
            </button>
            <button
              onClick={() => setViewPreset('top')}
              className={`px-2 py-1 rounded transition-all ${
                cameraView === 'top' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              俯視平圖
            </button>
            <button
              onClick={() => setViewPreset('front')}
              className={`px-2 py-1 rounded transition-all ${
                cameraView === 'front' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              正立面剖切
            </button>
            <button
              onClick={() => setViewPreset('side')}
              className={`px-2 py-1 rounded transition-all ${
                cameraView === 'side' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              側立面剖切
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Elevation Cut Toggle */}
          <button
            onClick={() => setElevationCut(!elevationCut)}
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              elevationCut
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="移除前牆以檢視立面施工切面"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            {elevationCut ? '剖面模式 (開啟)' : '剖面切切'}
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              wireframe
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-purple-400" />
            {wireframe ? '實體材質' : '線框模式'}
          </button>

          {/* Lighting Mode */}
          <button
            onClick={() => setLightingMode(lightingMode === 'studio' ? 'daylight' : 'studio')}
            className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700"
            title="切換照明效果"
          >
            <Sun className="w-4 h-4 text-amber-300" />
          </button>

          {/* USER REQUESTED: 光影即時渲染開關 (AO 環境光遮蔽與接觸陰影) */}
          <button
            onClick={() => {
              const nextAO = !enableAO;
              setEnableAO(nextAO);
              onNotify?.(
                nextAO
                  ? '✓ 已啟動即時光影渲染與 AO 環境光遮蔽增強！梁底與降板立體感提升。'
                  : '已切換為標準基礎光照模式'
              );
            }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition text-xs ${
              enableAO
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="開啟環境光遮蔽 (AO) 與接觸陰影，大幅強化梁底 265、天花 230 與空間立體深度感，方便現場審核"
          >
            <Sparkles className={`w-3.5 h-3.5 ${enableAO ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>光影即時渲染</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                enableAO ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {enableAO ? 'AO: ON' : 'AO: OFF'}
            </span>
          </button>

          {/* 3D Render Snapshot Button */}
          <button
            onClick={handleCaptureRender}
            className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            title="跑一張 3D 空間高階完成渲染圖並預覽效果"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-200" />
            <span>拍照渲染效果圖</span>
          </button>

          {/* Import Custom CAD Block Button */}
          {onOpenCustomBlocks && (
            <button
              onClick={onOpenCustomBlocks}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-lg font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="上傳個人 CAD 圖塊檔案並套用"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>套用圖塊</span>
            </button>
          )}

          {/* Toggle Collision Drawer Button */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
              isPanelOpen
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isPanelOpen ? '收合預警清單' : '展開碰撞預警'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 3D Canvas + Collapsible Collision Warning Panel */}
      <div className="flex-1 flex overflow-hidden relative min-h-[460px]">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 relative w-full h-full bg-[#070b14] overflow-hidden">
          <div ref={containerRef} className="w-full h-full" />

          {/* Floating In-Scene Collision Legend Badge */}
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5 text-xs text-slate-300 shadow-xl space-y-1.5 pointer-events-none select-none">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              幾何契約 3D 碰撞標示
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/30"></span>
              <span className="text-red-300 font-medium">紅色外框：衝突違規 (穿透降板/梁/門)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded border-2 border-emerald-500 bg-emerald-500/20"></span>
              <span className="text-emerald-300 font-medium">綠色外框：完全合規 (5倍數已避讓)</span>
            </div>
          </div>

          {/* iPad Touch Helper Hint in Viewport */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 flex items-center gap-1.5 pointer-events-none">
            <Tablet className="w-3 h-3 text-cyan-400" />
            <span>iPad / 觸控支援：單指旋轉 · 雙指捏合縮放</span>
          </div>

          {/* Real-time AO Shading Active HUD Chip */}
          {enableAO && (
            <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 shadow-xl flex items-center gap-2 pointer-events-none select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <div>
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <span>光影即時渲染 (AO 深度感)</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    現場審核增強
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  梁底 265 / 降板 230 / 家具角接觸陰影開啟
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Right Collision Warning Panel */}
        {isPanelOpen && (
          <div className="w-80 md:w-96 flex-shrink-0 h-full overflow-hidden shadow-2xl border-l border-slate-800">
            <CollisionWarningPanel
              issues={collisionIssues}
              furnitureList={furnitureList}
              onApplySolution={handleApplySolution}
              onApplyAllOptimizations={handleApplyAllOptimizations}
              onResetToConflictPreset={() => {
                onNotify?.('正式案件不载入示范家具。');
              }}
              onResetToOptimizedPreset={() => {
                onNotify?.('正式案件只使用目前空间的真实家具资料。');
              }}
              selectedFurnitureId={selectedFurnitureId}
              onSelectFurniture={focusOnFurniture}
              collisionWarningEnabled={collisionWarningEnabled}
              onToggleWarning={(val) => setCollisionWarningEnabled(val)}
            />
          </div>
        )}
      </div>

      {/* Bottom 3D Geometry Spec Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">室內設計高層約束：</span>
          <span className="inline-flex items-center gap-1 text-red-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            梁下淨高 {room.beamHeight}cm
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            空調降板 {room.ceilingDrop}cm
          </span>
          <span className="inline-flex items-center gap-1 text-cyan-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            衛廚降板 {room.bathKitchenDrop || 215}cm
          </span>
          <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
            樓板淨高 {room.height}cm
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          即時幾何碰撞檢核 · 支援點選衝突物件即刻聚焦與一鍵優化修復
        </div>
      </div>

      {/* 3D Render Snapshot Modal */}
      {isRenderModalOpen && (
        <ThreeDRenderViewerModal
          isOpen={isRenderModalOpen}
          onClose={() => setIsRenderModalOpen(false)}
          room={room}
          capturedImageDataUrl={capturedImageDataUrl}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
