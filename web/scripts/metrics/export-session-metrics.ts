import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface CliOptions {
  output: string;
  metrics?: {
    rollingFps: number;
    latencyMs: number;
    sampleCount?: number;
  };
}

function parseArgs(): CliOptions {
  const output = path.resolve(process.cwd(), "docs/demos/perf/session-metrics.json");
  const metricsArgIndex = process.argv.findIndex((arg) => arg === "--metrics");

  if (metricsArgIndex !== -1) {
    const payload = process.argv[metricsArgIndex + 1];

    if (payload) {
      try {
        const metrics = JSON.parse(payload);
        return { output, metrics };
      } catch (error) {
        throw new Error(`無法解析 metrics 參數：${error}`);
      }
    }
  }

  if (process.env.XR_METRICS) {
    try {
      return {
        output,
        metrics: JSON.parse(process.env.XR_METRICS),
      };
    } catch (error) {
      throw new Error(`XR_METRICS 環境變數格式錯誤：${error}`);
    }
  }

  return {
    output,
    metrics: undefined,
  };
}

async function main() {
  const { output, metrics } = parseArgs();
  const resolvedMetrics = metrics ?? {
    rollingFps: 45,
    latencyMs: 180,
    sampleCount: 0,
  };

  const payload = {
    ...resolvedMetrics,
    generatedAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(payload, null, 2), "utf-8");
  process.stdout.write(`已輸出性能指標至 ${output}\n`);
}

main().catch((error) => {
  console.error("匯出性能指標失敗", error);
  process.exitCode = 1;
});
