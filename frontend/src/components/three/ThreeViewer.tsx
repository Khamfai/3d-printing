"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface ThreeViewerProps {
  modelUrl?: string;
  format?: string;
  materialColor?: string;
  showDimensions?: boolean;
  className?: string;
  onLoad?: (dimensions: { x: number; y: number; z: number }) => void;
}

export function ThreeViewer({
  modelUrl,
  format = "stl",
  materialColor = "#6B7280",
  showDimensions = true,
  className,
  onLoad,
}: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(100, 100, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-50, -50, -50);
    scene.add(backLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0xe2e8f0, 0xf1f5f9);
    scene.add(gridHelper);

    // Animation loop
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      camera.aspect = w / (h || 400);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h || 400);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load model
  useEffect(() => {
    if (!modelUrl || !sceneRef.current || !cameraRef.current) return;

    setIsLoading(true);
    setError(null);

    // Remove previous model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const scene = sceneRef.current;
    const camera = cameraRef.current;

    const formatLower = format.toLowerCase();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialColor),
      metalness: 0.1,
      roughness: 0.6,
    });

    const onModelLoaded = (object: THREE.Object3D) => {
      // Auto-center and auto-scale
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      object.position.sub(center);
      object.position.y += size.y / 2;

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 80 / maxDim;
      object.scale.setScalar(scale);

      scene.add(object);
      modelRef.current = object;

      // Update camera
      const scaledSize = size.clone().multiplyScalar(scale);
      const dist = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 2;
      camera.position.set(dist, dist * 0.8, dist);
      camera.lookAt(0, scaledSize.y / 2, 0);
      controlsRef.current?.target.set(0, scaledSize.y / 2, 0);

      // Report dimensions
      const dims = {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.y * 10) / 10,
        z: Math.round(size.z * 10) / 10,
      };
      setDimensions(dims);
      onLoad?.(dims);
      setIsLoading(false);
    };

    const onError = (err: unknown) => {
      setError("Failed to load 3D model");
      setIsLoading(false);
      console.error("Model load error:", err);
    };

    try {
      if (formatLower === "stl") {
        new STLLoader().load(
          modelUrl,
          (geometry) => {
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            onModelLoaded(mesh);
          },
          undefined,
          onError
        );
      } else if (formatLower === "obj") {
        new OBJLoader().load(
          modelUrl,
          (object) => {
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
                child.castShadow = true;
              }
            });
            onModelLoaded(object);
          },
          undefined,
          onError
        );
      } else if (formatLower === "gltf" || formatLower === "glb") {
        new GLTFLoader().load(
          modelUrl,
          (gltf) => onModelLoaded(gltf.scene),
          undefined,
          onError
        );
      } else {
        setError(`Unsupported format: ${format}`);
        setIsLoading(false);
      }
    } catch (err) {
      onError(err);
    }
  }, [modelUrl, format, materialColor, onLoad]);

  // Update material color
  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.color.set(materialColor);
        }
      }
    });
  }, [materialColor]);

  return (
    <div className={cn("relative w-full rounded-xl overflow-hidden bg-slate-50 border border-gray-200", className)}>
      <div ref={containerRef} className="w-full h-[400px] lg:h-[500px]" aria-label="3D model viewer" />

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Loading 3D model...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="text-center text-red-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {showDimensions && dimensions && !isLoading && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs font-mono shadow-xs">
          <span className="text-gray-500">Dimensions:</span>{" "}
          <span className="text-gray-900">{dimensions.x} x {dimensions.y} x {dimensions.z} mm</span>
        </div>
      )}

      {/* Controls hint */}
      {!isLoading && !error && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-gray-500 shadow-xs">
          Drag to rotate &middot; Scroll to zoom
        </div>
      )}
    </div>
  );
}
