/**
 * 3D 解剖模型查看器
 * 支持加载 GLB/GLTF 格式的专业 3D 模型
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  ErrorOutline,
  RotateLeft,
  Mouse,
  ZoomIn,
  OpenWith
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

interface Anatomy3DProps {
  modelUrl: string; // GLB 模型的 URL
  title?: string;
}

const Anatomy3D: React.FC<Anatomy3DProps> = ({ modelUrl, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  
  // Three.js Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return;

    // 通过后端代理加载模型，避免 CORS 问题
    const proxyUrl = `http://localhost:3007/api/tripo3d/model?url=${encodeURIComponent(modelUrl)}`;
    console.log('[Anatomy3D] Loading model via proxy:', proxyUrl);
    
    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 清理旧的渲染器
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
    container.innerHTML = '';

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // 深色背景
    sceneRef.current = scene;

    // 添加雾效果
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights - 专业医学照明
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // 主光源（模拟手术灯）
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);

    // 填充光
    const fillLight = new THREE.DirectionalLight(0x8ecae6, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // 背光（轮廓光）
    const backLight = new THREE.DirectionalLight(0xffd166, 0.3);
    backLight.position.set(0, -5, -10);
    scene.add(backLight);

    // 点光源（高光）
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 6. 加载 GLB 模型
    const loader = new GLTFLoader();
    
    // 配置 DRACO 解压器（用于压缩模型）
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    // 添加认证头
    const authToken = localStorage.getItem('auth_token') || '';
    loader.setRequestHeader({ 'Authorization': `Bearer ${authToken}` });

    loader.load(
      proxyUrl,
      (gltf) => {
        console.log('[Anatomy3D] Model loaded successfully');
        const model = gltf.scene;
        
        // 计算模型边界框并居中
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // 将模型移到原点
        model.position.sub(center);
        
        // 根据模型大小调整相机位置
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // 留一些边距
        
        camera.position.set(cameraZ * 0.5, cameraZ * 0.3, cameraZ);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        // 启用阴影
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 增强材质
            if (child.material) {
              const mat = child.material as THREE.MeshStandardMaterial;
              if (mat.isMeshStandardMaterial) {
                mat.envMapIntensity = 0.5;
                mat.needsUpdate = true;
              }
            }
          }
        });

        // 添加到场景
        scene.add(model);
        modelRef.current = model;

        // 播放动画（如果有）
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          
          // 在动画循环中更新
          const clock = new THREE.Clock();
          const animateWithMixer = () => {
            const delta = clock.getDelta();
            mixer.update(delta);
          };
          // 存储 mixer 更新函数
          (model as any).mixerUpdate = animateWithMixer;
        }

        setIsLoading(false);
        console.log('[Anatomy3D] Model setup complete');
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setLoadProgress(percent);
          console.log(`[Anatomy3D] Loading: ${percent}%`);
        }
      },
      (err) => {
        console.error('[Anatomy3D] Load error:', err);
        setError('模型加载失败，请检查网络连接或重试');
        setIsLoading(false);
      }
    );

    // 7. 地面（可选）
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 8. Animation Loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // 更新动画混合器
      if (modelRef.current && (modelRef.current as any).mixerUpdate) {
        (modelRef.current as any).mixerUpdate();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('[Anatomy3D] Cleanup');
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      // 清理场景资源
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      modelRef.current = null;
    };
  }, [modelUrl]);

  // 清理和格式化部件名称
  const formatPartName = (name: string): string => {
    if (!name) return '未命名部位';
    
    // 尝试解码 URI 编码的名称
    try {
      name = decodeURIComponent(name);
    } catch (e) {
      // 忽略解码错误
    }
    
    // 移除常见的技术前缀/后缀
    name = name
      .replace(/^(mesh|node|object|group|scene)_?/i, '')
      .replace(/_?(mesh|node|object|group|geometry|material)$/i, '')
      .replace(/^\d+_/, '')
      .replace(/_\d+$/, '')
      .replace(/_/g, ' ')
      .trim();
    
    // 如果名称为空或只有数字，返回默认值
    if (!name || /^\d+$/.test(name)) {
      return '模型部件';
    }
    
    return name || '模型部件';
  };

  // 点击检测
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !modelRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObject(modelRef.current, true);
    
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const rawName = obj.name || obj.parent?.name || '';
      const displayName = formatPartName(rawName);
      console.log('[Anatomy3D] Clicked:', rawName, '->', displayName);
      setSelectedPart(displayName);
    } else {
      setSelectedPart(null);
    }
  };

  // 控制按钮
  const handleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    }
  };

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* 3D 容器 */}
      <div 
        ref={containerRef} 
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 加载中 */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur">
          <CircularProgress className="w-12 h-12 text-blue-400 mb-4" />
          <p className="text-white font-bold text-lg mb-2">3D 模型生成中...</p>
          <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">{loadProgress}%</p>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95">
          <ErrorOutline className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-white font-bold text-lg mb-2">加载失败</p>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            重新加载
          </button>
        </div>
      )}

      {/* 标题 */}
      {title && !isLoading && (
        <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg">
          <h3 className="text-white font-bold">{title}</h3>
        </div>
      )}

      {/* 选中部位 */}
      {selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-5 py-2.5 rounded-full shadow-xl backdrop-blur z-30 flex items-center">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block mr-2.5 animate-pulse"></span>
          <span className="font-bold text-sm">{selectedPart}</span>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleAutoRotate}
          className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg backdrop-blur transition-colors"
          title="自动旋转"
        >
          <RotateLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg backdrop-blur transition-colors"
          title="重置视角"
        >
          <OpenWith className="w-5 h-5" />
        </button>
      </div>
      
      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300 flex items-center backdrop-blur">
          <RotateLeft className="w-3 h-3 mr-1.5"/> 拖拽旋转
        </span>
        <span className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300 flex items-center backdrop-blur">
          <ZoomIn className="w-3 h-3 mr-1.5"/> 滚轮缩放
        </span>
        <span className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300 flex items-center backdrop-blur">
          <Mouse className="w-3 h-3 mr-1.5"/> 点击识别
        </span>
      </div>
    </div>
  );
};

export default Anatomy3D;
