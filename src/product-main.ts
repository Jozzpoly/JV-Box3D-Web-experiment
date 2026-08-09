import {
  DEFAULT_SCENE_PACKAGE_URL,
  validateScenePackageV1,
} from "./scene/scene-package.js";
import {
  configureProductWorldLoader,
  loadProductWorld,
} from "./scene/product-world.js";
import {
  loadLocalFullProductWorld,
} from "./scene/local-full-product-world.js";
import {
  loadMapOnlyProductWorld,
} from "./scene/map-only-product-world.js";
import { applyProductSpawnToScene } from "./scene/product-scene-package.js";
import {
  parseProductSpawnTarget,
  type JvProductSpawnTarget,
} from "./scene/product-spawn.js";
import {
  getJvProductViewSettings,
  replaceJvProductViewSettings,
  type JvTextureFilterMode,
} from "./render/jv-product-view-settings.js";
import { installProductControls } from "./product-controls.js";

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function isDefaultSceneRequest(input: RequestInfo | URL): boolean {
  const requested = new URL(requestUrl(input), window.location.href);
  const expected = new URL(
    DEFAULT_SCENE_PACKAGE_URL,
    window.location.href,
  );
  return requested.origin === expected.origin &&
    requested.pathname === expected.pathname;
}

function targetUrl(target: JvProductSpawnTarget): string {
  const url = new URL(window.location.href);
  url.searchParams.set("jvSpawn", target);
  return url.href;
}

function selectedTextureFilter(): JvTextureFilterMode {
  return new URL(window.location.href).searchParams.get("jvTextureFilter") ===
      "linear"
    ? "linear"
    : "nearest";
}

function selectedGridVisible(): boolean {
  return new URL(window.location.href).searchParams.get("jvGrid") === "1";
}

const spawnTarget = parseProductSpawnTarget(window.location.search);
configureProductWorldLoader(
  spawnTarget === "scan"
    ? loadLocalFullProductWorld
    : loadMapOnlyProductWorld,
);

const initialSettings = {
  textureFilter: selectedTextureFilter(),
  gridVisible: selectedGridVisible(),
} as const;
replaceJvProductViewSettings(initialSettings);

if (spawnTarget === "scan") {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const productFetch: typeof fetch = async (input, init) => {
    const response = await nativeFetch(input, init);
    if (!isDefaultSceneRequest(input) || !response.ok) {
      return response;
    }

    const scene = validateScenePackageV1(await response.json());
    const world = await loadProductWorld();
    const rewritten = applyProductSpawnToScene(
      scene,
      world,
      spawnTarget,
    );
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("content-type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(rewritten), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
  globalThis.fetch = productFetch;
}

await import("./main.js");
installProductControls({
  capabilities: {
    locationChoices: [
      {
        label: "Mapa E2R",
        href: targetUrl("map"),
        active: spawnTarget === "map",
      },
      {
        label: "Skan JSPREV2",
        href: targetUrl("scan"),
        active: spawnTarget === "scan",
      },
    ],
    textureFilter: true,
    grid: true,
  },
});

const activeSettings = getJvProductViewSettings();
if (
  activeSettings.textureFilter !== initialSettings.textureFilter ||
  activeSettings.gridVisible !== initialSettings.gridVisible
) {
  throw new Error("JV product view settings changed during startup.");
}
