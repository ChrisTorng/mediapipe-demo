import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_PATH = "/assets/sun_glasses_fbx_346kb.glb";
const DEFAULT_VIEW_HEIGHT = 2.4;
type GLTFResult = Awaited<ReturnType<GLTFLoader["loadAsync"]>>;

export interface GlassesOverlayProps {
  className?: string;
  "data-testid"?: string;
}

export const GlassesOverlay = forwardRef<HTMLDivElement, GlassesOverlayProps>((props, forwardedRef) => {
  const { className, "data-testid": dataTestId } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const cameraRef = useRef<OrthographicCamera | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const modelRef = useRef<Object3D | null>(null);
  const baseDimensionsRef = useRef<Vector3 | null>(null);

  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = SRGBColorSpace;
    rendererRef.current = renderer;

    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const scene = new Scene();
    sceneRef.current = scene;

    const ambient = new AmbientLight(0xffffff, 0.9);
    const directional = new DirectionalLight(0xffffff, 0.85);
    directional.position.set(1.2, 1.5, 2.4);
    scene.add(ambient);
    scene.add(directional);

    let disposed = false;

    const renderScene = () => {
      if (disposed || !rendererRef.current || !cameraRef.current || !sceneRef.current) {
        return;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    const updateViewport = () => {
      if (disposed) {
        return;
      }

      const element = containerRef.current;
      const cameraInstance = cameraRef.current;
      const rendererInstance = rendererRef.current;
      if (!element || !cameraInstance || !rendererInstance) {
        return;
      }

      const width = Math.max(element.clientWidth, 1);
      const height = Math.max(element.clientHeight, Math.round(width * 0.42));

      rendererInstance.setPixelRatio(window.devicePixelRatio || 1);
      rendererInstance.setSize(width, height, false);

      const aspect = width / height;
      cameraInstance.left = (-DEFAULT_VIEW_HEIGHT * aspect) / 2;
      cameraInstance.right = (DEFAULT_VIEW_HEIGHT * aspect) / 2;
      cameraInstance.top = DEFAULT_VIEW_HEIGHT / 2;
      cameraInstance.bottom = -DEFAULT_VIEW_HEIGHT / 2;
      cameraInstance.updateProjectionMatrix();

      const model = modelRef.current;
      const baseDimensions = baseDimensionsRef.current;

      if (model && baseDimensions) {
        const targetWidth = (cameraInstance.right - cameraInstance.left) * 0.78;
        const referenceWidth = baseDimensions.x || Math.max(baseDimensions.y, baseDimensions.z) || 1;
        const uniformScale = targetWidth / referenceWidth;
        model.scale.setScalar(uniformScale);
      }

      renderScene();
    };

    const normalizeModel = (object: Object3D) => {
      const boundingBox = new Box3().setFromObject(object);
      const size = boundingBox.getSize(new Vector3());
      const center = boundingBox.getCenter(new Vector3());

      object.position.sub(center);
      baseDimensionsRef.current = size;

      updateViewport();
    };

    const loader = new GLTFLoader();
    loader.load(
      MODEL_PATH,
      (gltf: GLTFResult) => {
        if (disposed) {
          return;
        }

        const root = gltf.scene;
        root.traverse((child: Object3D) => {
          if ((child as Mesh).isMesh) {
            const mesh = child as Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });

        modelRef.current = root;
        scene.add(root);
        normalizeModel(root);
        renderScene();
      },
      undefined,
      (error: unknown) => {
        if (!disposed) {
          console.error("眼鏡模型載入失敗", error);
        }
      }
    );

    const resizeObserver = new ResizeObserver(() => updateViewport());
    resizeObserver.observe(container);
    updateViewport();

    return () => {
      disposed = true;
      resizeObserver.disconnect();

      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current.traverse((child: Object3D) => {
          if ((child as Mesh).isMesh) {
            const mesh = child as Mesh;
            mesh.geometry.dispose();
            const material = mesh.material;
            if (Array.isArray(material)) {
              material.forEach((entry: Material) => {
                entry.dispose();
              });
            } else if (material) {
              (material as Material).dispose();
            }
          }
        });
        modelRef.current = null;
      }

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      data-testid={dataTestId}
      aria-hidden="true"
      role="presentation"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
});

GlassesOverlay.displayName = "GlassesOverlay";
