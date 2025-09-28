import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../../public/mediapipe");

const assets: Array<{ name: string; url: string }> = [
  {
    name: "face_landmarker.task",
    url: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
  },
  {
    name: "image_segmenter_deeplab_v3.tflite",
    url: "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/latest/deeplab_v3.tflite",
  },
  {
    name: "pose_landmarker_full.task",
    url: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
  },
  {
    name: "vision_wasm_internal.js",
    url: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm/vision_wasm_internal.js",
  },
  {
    name: "vision_wasm_internal.wasm",
    url: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm/vision_wasm_internal.wasm",
  },
];

async function downloadAsset(name: string, url: string) {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`下載 ${name} 失敗：${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(outputDir, name), buffer);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  for (const { name, url } of assets) {
    process.stdout.write(`Fetching ${name}... `);

    try {
      await downloadAsset(name, url);
      process.stdout.write("完成\n");
    } catch (error) {
      process.stdout.write("失敗\n");
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw error;
    }
  }
}

main().catch((error) => {
  console.error("模型下載流程失敗", error);
  process.exit(1);
});
