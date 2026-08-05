import {
  DEFAULT_SCENE_PACKAGE_URL,
  validateScenePackageV1,
} from "./scene/scene-package.js";
import { loadProductWorld } from "./scene/product-world.js";
import { applyProductSpawnToScene } from "./scene/product-scene-package.js";
import {
  parseProductSpawnTarget,
  type JvProductSpawnTarget,
} from "./scene/product-spawn.js";

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

function installSpawnNavigation(
  activeTarget: JvProductSpawnTarget,
): void {
  const navigation = document.createElement("nav");
  navigation.setAttribute("aria-label", "JV product spawn target");
  navigation.style.cssText = [
    "position:fixed",
    "top:calc(env(safe-area-inset-top, 0px) + 12px)",
    "right:calc(env(safe-area-inset-right, 0px) + 12px)",
    "z-index:1000",
    "display:flex",
    "gap:6px",
    "padding:6px",
    "border:1px solid rgba(255,255,255,0.18)",
    "border-radius:10px",
    "background:rgba(10,12,16,0.88)",
    "backdrop-filter:blur(8px)",
    "font:600 12px/1.2 system-ui,sans-serif",
  ].join(";");

  const targets: readonly Readonly<{
    id: JvProductSpawnTarget;
    label: string;
  }>[] = [
    { id: "map", label: "Mapa E2R" },
    { id: "scan", label: "Skan JSPREV2" },
  ];
  for (const target of targets) {
    const link = document.createElement("a");
    const active = target.id === activeTarget;
    link.href = targetUrl(target.id);
    link.textContent = target.label;
    link.style.cssText = [
      "display:block",
      "padding:8px 10px",
      "border-radius:7px",
      "color:#f4f6fa",
      `background:${active ? "#375f9c" : "rgba(255,255,255,0.08)"}`,
      "text-decoration:none",
      "white-space:nowrap",
    ].join(";");
    if (active) {
      link.setAttribute("aria-current", "page");
    }
    navigation.append(link);
  }
  document.body.append(navigation);
}

const spawnTarget = parseProductSpawnTarget(window.location.search);
installSpawnNavigation(spawnTarget);

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
