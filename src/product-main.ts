import "./style.css";
import "./mobile-driving-controls.css";
import "./mobile-driving-polish.css";
import "./utility-drawer.css";

import {
  DEFAULT_SCENE_PACKAGE_URL,
  validateScenePackageV1,
} from "./scene/scene-package.js";
import {
  configureProductWorldLoader,
  loadProductWorld,
  type ProductWorldLoader,
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
import { installJvBuildIdentity } from "./runtime/build-identity.js";
import { installJvPerformanceObserver } from "./runtime/performance-observer.js";
import { publishJvStartupPerformance } from "./runtime/startup-performance.js";
import { installProductControls } from "./product-controls.js";
import { installUtilityDrawer } from "./utility-drawer.js";

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

function timedProductWorldLoader(loader: ProductWorldLoader): ProductWorldLoader {
  return async () => {
    const startedAt = performance.now();
    try {
      return await loader();
    } finally {
      publishJvStartupPerformance({
        productWorldLoadMs: Math.max(0, performance.now() - startedAt),
      });
    }
  };
}

configureProductWorldLoader(
  timedProductWorldLoader(
    spawnTarget === "scan"
      ? loadLocalFullProductWorld
      : loadMapOnlyProductWorld,
  ),
);

const initialSettings = {
  textureFilter: selectedTextureFilter(),
  gridVisible: selectedGridVisible(),
} as const;
replaceJvProductViewSettings(initialSettings);

if (spawnTarget !== "map") {
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
installJvBuildIdentity();
installJvPerformanceObserver();
installProductControls({
  capabilities: {
    locationChoices: [
      {
        label: "Plac E2R",
        href: targetUrl("map"),
        active: spawnTarget === "map",
      },
      {
        label: "Offroad",
        href: targetUrl("offroad"),
        active: spawnTarget === "offroad",
      },
      {
        label: "Skan JSPREV2",
        href: targetUrl("scan"),
        active: spawnTarget === "scan",
        availabilityProbeUrl: new URL(
          "__jv_scan__/index.json",
          document.baseURI,
        ).href,
        unavailableMessage:
          "Skan JSPREV2 jest niedostępny w tej publikacji. Mapa i Offroad działają niezależnie.",
      },
    ],
    textureFilter: true,
    grid: true,
    fullscreen: true,
  },
});
installUtilityDrawer();

const activeSettings = getJvProductViewSettings();
if (
  activeSettings.textureFilter !== initialSettings.textureFilter ||
  activeSettings.gridVisible !== initialSettings.gridVisible
) {
  throw new Error("JV product view settings changed during startup.");
}
