import {
  Assets,
  extensions,
  ExtensionType,
  resolveTextureUrl,
  settings,
} from "pixi.js";

import manifest from "./manifest.json";

export const resolveJsonUrl = {
  extension: ExtensionType.ResolveParser,
  test: (value) =>
    settings.RETINA_PREFIX.test(value) && value.endsWith(".json"),
  parse: resolveTextureUrl.parse,
};

extensions.add(resolveJsonUrl);

export async function initAssets() {
  await Assets.init({ manifest });
  const bundleList = ["game", "fonts"];

  const assets = await Assets.loadBundle(bundleList);

  const gameBundles = manifest.bundles.map((item) => item.name);

  Assets.backgroundLoadBundle(gameBundles);

  return assets.default ? assets.default : assets;
}

export function isBundleLoaded(bundle) {
  const bundleManifest = manifest.bundles.find((b) => b.name === bundle);

  if (!bundleManifest) {
    return false;
  }

  for (const asset of bundleManifest.assets) {
    if (!Assets.cache.has(asset.name)) {
      return false;
    }
  }

  return true;
}

export function areBundlesLoaded(bundles) {
  for (const name of bundles) {
    if (!isBundleLoaded(name)) {
      return false;
    }
  }

  return true;
}
