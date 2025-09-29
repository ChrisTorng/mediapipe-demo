import {
  FaceLandmarker,
  FilesetResolver,
  ImageSegmenter,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

import type { DemoAsset, DemoAssetId } from "@/models/demo-asset";
import type { PreviewMode } from "@/models/preview-state";

const WASM_BASE_PATH = "/mediapipe";
const FACE_LANDMARKER_MODEL_PATH = "/mediapipe/face_landmarker.task";
const SEGMENTER_MODEL_PATH = "/mediapipe/image_segmenter_deeplab_v3.tflite";
const POSE_LANDMARKER_MODEL_PATH = "/mediapipe/pose_landmarker_full.task";

const PROCESS_INTERVAL_MS = 33; // ~30 FPS processing cadence
const SMOOTHING_ALPHA = 0.35;
const MAX_MISSED_DETECTIONS = 6;

interface OverlayMeasurement {
  centerX: number;
  centerY: number;
  width: number;
  height?: number;
  rotationRad: number;
  visible: boolean;
}

interface PixelPoint {
  x: number;
  y: number;
}

function toPixels(landmark: NormalizedLandmark, width: number, height: number): PixelPoint {
  return {
    x: landmark.x * width,
    y: landmark.y * height,
  };
}

function distance(a: PixelPoint, b: PixelPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function lerp(previous: number, next: number, alpha: number): number {
  return previous + (next - previous) * alpha;
}

function blendAngle(previous: number, next: number, alpha: number): number {
  let delta = next - previous;

  if (delta > Math.PI) {
    delta -= 2 * Math.PI;
  } else if (delta < -Math.PI) {
    delta += 2 * Math.PI;
  }

  return previous + delta * alpha;
}

function landmarkAt(landmarks: NormalizedLandmark[] | undefined, index: number): NormalizedLandmark | null {
  if (!landmarks || index < 0 || index >= landmarks.length) {
    return null;
  }

  const landmark = landmarks[index];
  if (!landmark) {
    return null;
  }

  return landmark;
}

class TryOnProcessor {
  private readonly filesetPromise = FilesetResolver.forVisionTasks(WASM_BASE_PATH);

  private faceLandmarkerPromise: Promise<FaceLandmarker> | null = null;
  private faceLandmarker: FaceLandmarker | null = null;
  private faceLandmarkerReady = false;
  private faceLandmarkerRunningMode: "VIDEO" | "IMAGE" = "VIDEO";
  private faceLandmarkerModeTransition: Promise<void> | null = null;

  private segmenterPromise: Promise<ImageSegmenter> | null = null;
  private segmenter: ImageSegmenter | null = null;
  private segmenterReady = false;

  private poseLandmarkerPromise: Promise<PoseLandmarker> | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private poseLandmarkerReady = false;

  private overlayElement: HTMLImageElement | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private activeAssetId: DemoAssetId | null = null;
  private mode: PreviewMode = "live";

  private overlayEnabled = false;
  private lastProcessTimestamp = 0;
  private lastVideoTime = -1;
  private missedDetections = MAX_MISSED_DETECTIONS;

  private smoothedMeasurement: OverlayMeasurement | null = null;

  async setAsset(asset: DemoAsset): Promise<void> {
    if (this.activeAssetId !== asset.id) {
      this.resetOverlayState();
    }

    this.activeAssetId = asset.id;

    if (asset.id === "glasses" || asset.id === "makeup") {
      await this.loadFaceLandmarker();
      const desiredMode = this.mode === "photo-fallback" ? "IMAGE" : "VIDEO";
      await this.ensureFaceLandmarkerMode(desiredMode);
    }

    if (asset.id === "makeup") {
      await this.loadSegmenter();
    }

    if (asset.id === "shoes") {
      await this.loadPoseLandmarker();
    }
  }

  setMode(mode: PreviewMode) {
    this.mode = mode;

    if (this.activeAssetId === "glasses" || this.activeAssetId === "makeup") {
      const desiredMode = mode === "photo-fallback" ? "IMAGE" : "VIDEO";
      void this.ensureFaceLandmarkerMode(desiredMode);
    }
  }

  attach(video: HTMLVideoElement, overlay: HTMLImageElement) {
    this.videoElement = video;
    this.setOverlayElement(overlay);
  }

  detach() {
    this.videoElement = null;
    this.overlayElement = null;
  }

  setOverlayElement(element: HTMLImageElement | null) {
    this.overlayElement = element;

    if (!element) {
      this.smoothedMeasurement = null;
    }
  }

  setOverlayEnabled(enabled: boolean) {
    this.overlayEnabled = enabled;
    if (!enabled) {
      this.hideOverlay();
    }
  }

  processVideoFrame(timestamp: number) {
    if (!this.overlayEnabled) {
      return;
    }

    if (!this.videoElement || !this.overlayElement || !this.activeAssetId) {
      return;
    }

    if (this.mode !== "live") {
      return;
    }

    if (timestamp - this.lastProcessTimestamp < PROCESS_INTERVAL_MS) {
      return;
    }

    const video = this.videoElement;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0) {
      return;
    }

    if (video.currentTime === this.lastVideoTime) {
      return;
    }

    this.lastProcessTimestamp = timestamp;
    this.lastVideoTime = video.currentTime;

    switch (this.activeAssetId) {
      case "glasses":
        this.processGlassesFrame(timestamp);
        break;
      case "makeup":
        this.processMakeupFrame(timestamp);
        break;
      case "shoes":
        this.processShoesFrame(timestamp);
        break;
      default:
        break;
    }
  }

  async processImageFrame(image: HTMLImageElement | HTMLCanvasElement): Promise<void> {
    if (!this.overlayElement || !this.activeAssetId) {
      return;
    }

    if (this.mode !== "photo-fallback") {
      return;
    }

    switch (this.activeAssetId) {
      case "glasses":
      case "makeup":
        await this.ensureFaceLandmarkerMode("IMAGE");
        if (!this.faceLandmarkerReady || !this.faceLandmarker) {
          return;
        }
        this.applyFaceMeasurement(
          this.faceLandmarker.detect(image)?.faceLandmarks?.[0] ?? null,
          image.width,
          image.height,
          this.activeAssetId
        );
        break;
      case "shoes":
        // Pose landmarker does not operate on static images in this demo.
        break;
      default:
        break;
    }
  }

  dispose() {
    void this.faceLandmarker?.close();
    this.faceLandmarker = null;
    this.faceLandmarkerPromise = null;
    this.faceLandmarkerReady = false;
    this.faceLandmarkerRunningMode = "VIDEO";
    this.faceLandmarkerModeTransition = null;

    void this.segmenter?.close?.();
    this.segmenter = null;
    this.segmenterPromise = null;
    this.segmenterReady = false;

    void this.poseLandmarker?.close();
    this.poseLandmarker = null;
    this.poseLandmarkerPromise = null;
    this.poseLandmarkerReady = false;

    this.detach();
  }

  private async loadFaceLandmarker(): Promise<void> {
    if (this.faceLandmarkerReady && this.faceLandmarker) {
      return;
    }

    if (!this.faceLandmarkerPromise) {
      this.faceLandmarkerReady = false;
      this.faceLandmarkerPromise = (async () => {
        const fileset = await this.filesetPromise;
        const instance = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        this.faceLandmarker = instance;
        this.faceLandmarkerReady = true;
        this.faceLandmarkerRunningMode = "VIDEO";
        this.faceLandmarkerModeTransition = null;
        return instance;
      })();
    }

    await this.faceLandmarkerPromise;
  }

  private async loadSegmenter(): Promise<void> {
    if (this.segmenterReady && this.segmenter) {
      return;
    }

    if (!this.segmenterPromise) {
      this.segmenterReady = false;
      this.segmenterPromise = (async () => {
        const fileset = await this.filesetPromise;
        const instance = await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: SEGMENTER_MODEL_PATH,
          },
          runningMode: "VIDEO",
          outputCategoryMask: true,
        });
        this.segmenter = instance;
        this.segmenterReady = true;
        return instance;
      })();
    }

    await this.segmenterPromise;
  }

  private async loadPoseLandmarker(): Promise<void> {
    if (this.poseLandmarkerReady && this.poseLandmarker) {
      return;
    }

    if (!this.poseLandmarkerPromise) {
      this.poseLandmarkerReady = false;
      this.poseLandmarkerPromise = (async () => {
        const fileset = await this.filesetPromise;
        const instance = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: POSE_LANDMARKER_MODEL_PATH,
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        this.poseLandmarker = instance;
        this.poseLandmarkerReady = true;
        return instance;
      })();
    }

    await this.poseLandmarkerPromise;
  }

  private processGlassesFrame(timestamp: number) {
    if (!this.faceLandmarkerReady || !this.faceLandmarker || !this.videoElement) {
      return;
    }

    if (this.faceLandmarkerRunningMode !== "VIDEO") {
      void this.ensureFaceLandmarkerMode("VIDEO");
      return;
    }

    const result = this.faceLandmarker.detectForVideo(this.videoElement, timestamp);
    const faceLandmarks = result.faceLandmarks?.[0];

    this.applyFaceMeasurement(faceLandmarks ?? null, this.videoElement.videoWidth, this.videoElement.videoHeight, "glasses");
  }

  private processMakeupFrame(timestamp: number) {
    if (!this.faceLandmarkerReady || !this.faceLandmarker || !this.videoElement) {
      return;
    }

    if (this.faceLandmarkerRunningMode !== "VIDEO") {
      void this.ensureFaceLandmarkerMode("VIDEO");
      return;
    }

    const result = this.faceLandmarker.detectForVideo(this.videoElement, timestamp);
    const faceLandmarks = result.faceLandmarks?.[0];

    this.applyFaceMeasurement(faceLandmarks ?? null, this.videoElement.videoWidth, this.videoElement.videoHeight, "makeup");
  }

  private processShoesFrame(timestamp: number) {
    if (!this.poseLandmarkerReady || !this.poseLandmarker || !this.videoElement) {
      return;
    }

    const result = this.poseLandmarker.detectForVideo(this.videoElement, timestamp);
    const poseLandmarks = result.landmarks?.[0];

    if (!poseLandmarks) {
      this.registerMissedDetection();
      return;
    }

    const width = this.videoElement.videoWidth;
    const height = this.videoElement.videoHeight;

    const leftAnkle = landmarkAt(poseLandmarks, 27);
    const rightAnkle = landmarkAt(poseLandmarks, 28);
    const leftFoot = landmarkAt(poseLandmarks, 31);
    const rightFoot = landmarkAt(poseLandmarks, 32);

    if (!leftAnkle || !rightAnkle || !leftFoot || !rightFoot) {
      this.registerMissedDetection();
      return;
    }

    const left = toPixels(leftAnkle, width, height);
    const right = toPixels(rightAnkle, width, height);
    const leftToe = toPixels(leftFoot, width, height);
    const rightToe = toPixels(rightFoot, width, height);

    const ankleDistance = distance(left, right);

    if (ankleDistance <= 0) {
      this.registerMissedDetection();
      return;
    }

    const centerX = (left.x + right.x) / 2;
    const footBaseline = Math.max(leftToe.y, rightToe.y);
    const centerY = footBaseline - ankleDistance * 0.25;
    const overlayWidth = ankleDistance * 2.4;
    const overlayHeight = overlayWidth * 0.55;
    const rotationRad = Math.atan2(rightToe.y - leftToe.y, rightToe.x - leftToe.x);

    this.applyOverlay({
      centerX,
      centerY,
      width: overlayWidth,
      height: overlayHeight,
      rotationRad,
      visible: true,
    });
  }

  private applyFaceMeasurement(
    faceLandmarks: NormalizedLandmark[] | null,
    frameWidth: number,
    frameHeight: number,
    assetId: "glasses" | "makeup"
  ) {
    if (!faceLandmarks) {
      this.registerMissedDetection();
      return;
    }

    const leftOuterEye = landmarkAt(faceLandmarks, 33);
    const rightOuterEye = landmarkAt(faceLandmarks, 263);
    const forehead = landmarkAt(faceLandmarks, 10);
    const chin = landmarkAt(faceLandmarks, 152);
    const leftCheek = landmarkAt(faceLandmarks, 234);
    const rightCheek = landmarkAt(faceLandmarks, 454);

    if (!leftOuterEye || !rightOuterEye) {
      this.registerMissedDetection();
      return;
    }

    const leftEye = toPixels(leftOuterEye, frameWidth, frameHeight);
    const rightEye = toPixels(rightOuterEye, frameWidth, frameHeight);
    const eyeDistance = distance(leftEye, rightEye);

    if (eyeDistance <= 0) {
      this.registerMissedDetection();
      return;
    }

    const rotationRad = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    if (assetId === "glasses") {
      const centerX = (leftEye.x + rightEye.x) / 2;
      const centerY = (leftEye.y + rightEye.y) / 2 + eyeDistance * 0.05;
      const width = eyeDistance * 2.2;

      this.applyOverlay({
        centerX,
        centerY,
        width,
        rotationRad,
        visible: true,
      });
      return;
    }

    if (!chin || !forehead || !leftCheek || !rightCheek) {
      this.registerMissedDetection();
      return;
    }

    const cheekLeft = toPixels(leftCheek, frameWidth, frameHeight);
    const cheekRight = toPixels(rightCheek, frameWidth, frameHeight);
    const chinPoint = toPixels(chin, frameWidth, frameHeight);
    const foreheadPoint = toPixels(forehead, frameWidth, frameHeight);

    const faceWidth = distance(cheekLeft, cheekRight) * 1.45;
    const faceHeight = Math.max(chinPoint.y - foreheadPoint.y, eyeDistance * 1.2) * 1.2;
    const centerX = (cheekLeft.x + cheekRight.x) / 2;
    const centerY = foreheadPoint.y + faceHeight * 0.55;
    const cheekRotation = Math.atan2(cheekRight.y - cheekLeft.y, cheekRight.x - cheekLeft.x);

    this.applyOverlay({
      centerX,
      centerY,
      width: faceWidth,
      height: faceHeight,
      rotationRad: cheekRotation,
      visible: true,
    });
  }

  private applyOverlay(measurement: OverlayMeasurement) {
    const overlay = this.overlayElement;

    if (!overlay) {
      return;
    }

    if (!measurement.visible) {
      this.registerMissedDetection();
      return;
    }

    this.missedDetections = 0;

    const smoothed = this.smoothMeasurement(measurement);

    overlay.style.opacity = "";
    overlay.style.left = `${smoothed.centerX}px`;
    overlay.style.top = `${smoothed.centerY}px`;
    overlay.style.width = `${smoothed.width}px`;

    if (typeof smoothed.height === "number") {
      overlay.style.height = `${smoothed.height}px`;
    } else {
      overlay.style.removeProperty("height");
    }

    overlay.style.transformOrigin = "50% 50%";
    overlay.style.transform = `translate(-50%, -50%) rotate(${smoothed.rotationRad}rad)`;
  }

  private smoothMeasurement(next: OverlayMeasurement): OverlayMeasurement {
    if (!this.smoothedMeasurement) {
      this.smoothedMeasurement = { ...next };
      return this.smoothedMeasurement;
    }

    const previous = this.smoothedMeasurement;

    const height =
      typeof next.height === "number"
        ? lerp(previous.height ?? next.height, next.height, SMOOTHING_ALPHA)
        : undefined;

    this.smoothedMeasurement = {
      centerX: lerp(previous.centerX, next.centerX, SMOOTHING_ALPHA),
      centerY: lerp(previous.centerY, next.centerY, SMOOTHING_ALPHA),
      width: lerp(previous.width, next.width, SMOOTHING_ALPHA),
      height,
      rotationRad: blendAngle(previous.rotationRad, next.rotationRad, SMOOTHING_ALPHA),
      visible: true,
    };

    return this.smoothedMeasurement;
  }

  private hideOverlay() {
    if (!this.overlayElement) {
      return;
    }

    this.overlayElement.style.opacity = "0";
    this.smoothedMeasurement = null;
  }

  private registerMissedDetection() {
    this.missedDetections += 1;

    if (this.missedDetections >= MAX_MISSED_DETECTIONS) {
      this.hideOverlay();
    }
  }

  private resetOverlayState() {
    this.smoothedMeasurement = null;
    this.missedDetections = MAX_MISSED_DETECTIONS;
  }

  private async ensureFaceLandmarkerMode(mode: "VIDEO" | "IMAGE"): Promise<void> {
    if (!this.faceLandmarkerPromise) {
      return;
    }

    if (!this.faceLandmarkerReady || !this.faceLandmarker) {
      try {
        await this.faceLandmarkerPromise;
      } catch (error) {
        console.error("面部關鍵點模型載入失敗", error);
        return;
      }
    }

    const faceLandmarker = this.faceLandmarker;

    if (!faceLandmarker || this.faceLandmarkerRunningMode === mode) {
      return;
    }

    if (this.faceLandmarkerModeTransition) {
      try {
        await this.faceLandmarkerModeTransition;
      } catch (error) {
        console.error("切換面部關鍵點模式時發生錯誤", error);
      }
    }

    if (this.faceLandmarkerRunningMode === mode || !this.faceLandmarker) {
      return;
    }

    const transition = faceLandmarker.setOptions({ runningMode: mode });
    this.faceLandmarkerModeTransition = transition;

    try {
      await transition;
      this.faceLandmarkerRunningMode = mode;
    } catch (error) {
      console.error("設定面部關鍵點模式失敗", error);
    } finally {
      this.faceLandmarkerModeTransition = null;
    }
  }
}

export function useTryOnProcessor() {
  const processorRef = useRef<TryOnProcessor>();

  if (!processorRef.current) {
    processorRef.current = new TryOnProcessor();
  }

  useEffect(() => {
    const processor = processorRef.current;

    return () => {
      processor?.dispose();
    };
  }, []);

  return processorRef.current!;
}
