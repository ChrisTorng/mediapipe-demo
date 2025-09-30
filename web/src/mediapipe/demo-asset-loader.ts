import { DemoAsset, DemoAssetId, listDemoAssets } from "@/models/demo-asset";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface DemoAssetLoaderOptions {
  assets?: DemoAsset[];
  fetcher?: Fetcher;
}

export interface DemoAssetLoader {
  preload(assetId: DemoAssetId): Promise<DemoAsset>;
  switchTo(assetId: DemoAssetId): Promise<DemoAsset>;
  getCached(assetId: DemoAssetId): DemoAsset | undefined;
  list(): DemoAsset[];
}

const DEFAULT_FETCHER: Fetcher = (input, init) => fetch(input, init);

async function fetchArtifact(fetcher: Fetcher, url: string): Promise<void> {
  const response = await fetcher(url);

  if (!response.ok) {
    throw new Error(`無法載入模型資產 ${url}：${response.status}`);
  }

  // 讀取至 ArrayBuffer 以確保快取
  await response.arrayBuffer();
}

export function createDemoAssetLoader(options: DemoAssetLoaderOptions = {}): DemoAssetLoader {
  const assets = options.assets ?? listDemoAssets();
  const fetcher = options.fetcher ?? DEFAULT_FETCHER;
  const assetMap = new Map<DemoAssetId, DemoAsset>(assets.map((asset) => [asset.id, asset]));
  const cache = new Map<DemoAssetId, DemoAsset>();

  function ensureAsset(assetId: DemoAssetId): DemoAsset {
    const asset = assetMap.get(assetId);

    if (!asset) {
      throw new Error(`找不到資產 ${assetId}`);
    }

    return asset;
  }

  async function hydrateAsset(asset: DemoAsset): Promise<DemoAsset> {
    if (cache.has(asset.id)) {
      return asset;
    }

    await Promise.all([
      fetchArtifact(fetcher, asset.modelConfig.taskAssetPath),
      fetchArtifact(fetcher, asset.modelConfig.wasm.binaryPath),
      fetchArtifact(fetcher, asset.modelConfig.wasm.workerPath),
    ]);

    cache.set(asset.id, asset);
    return asset;
  }

  return {
    async preload(assetId) {
      const asset = ensureAsset(assetId);
      return hydrateAsset(asset);
    },
    async switchTo(assetId) {
      const asset = ensureAsset(assetId);
      await hydrateAsset(asset);
      return asset;
    },
    getCached(assetId) {
      return cache.get(assetId);
    },
    list() {
      return assets;
    },
  };
}
