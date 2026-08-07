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
import { applyProductSpawnToScene } from "./scene/product-scene-package.js";
import {
  parseProductSpawnTarget,
  type JvProductSpawnTarget,
} from "./scene/product-spawn.js";
import {
  getJvProductViewSettings,
  replaceJvProductViewSettings,
  setJvGridVisible,
  setJvTextureFilter,
  subscribeJvProductViewSettings,
  type JvTextureFilterMode,
} from "./render/jv-product-view-settings.js";

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

function rememberTextureFilter(mode: JvTextureFilterMode): void {
  const url = new URL(window.location.href);
  if (mode === "nearest") {
    url.searchParams.delete("jvTextureFilter");
  } else {
    url.searchParams.set("jvTextureFilter", mode);
  }
  window.history.replaceState(null, "", url.href);
}

function rememberGridVisible(visible: boolean): void {
  const url = new URL(window.location.href);
  if (visible) {
    url.searchParams.set("jvGrid", "1");
  } else {
    url.searchParams.delete("jvGrid");
  }
  window.history.replaceState(null, "", url.href);
}

function choiceStyle(active: boolean): string {
  return [
    "display:block",
    "padding:7px 9px",
    "border:0",
    "border-radius:7px",
    "color:#f4f6fa",
    `background:${active ? "#375f9c" : "rgba(255,255,255,0.08)"}`,
    "font:600 11px/1.2 system-ui,sans-serif",
    "text-decoration:none",
    "white-space:nowrap",
    "cursor:pointer",
  ].join(";");
}

function controlGroup(label: string): HTMLDivElement {
  const group = document.createElement("div");
  group.style.cssText = "display:grid;gap:4px";
  const heading = document.createElement("span");
  heading.textContent = label;
  heading.style.cssText = [
    "color:#8fa1bb",
    "font:700 9px/1.1 system-ui,sans-serif",
    "letter-spacing:.08em",
    "text-transform:uppercase",
  ].join(";");
  group.append(heading);
  return group;
}

function installProductControls(
  activeTarget: JvProductSpawnTarget,
): void {
  const panel = document.querySelector<HTMLElement>(".panel");
  if (panel === null) {
    throw new Error("JV product controls require the mechanics panel.");
  }

  const controls = document.createElement("section");
  controls.setAttribute("aria-label", "JV product view controls");
  controls.style.cssText = [
    "display:flex",
    "flex-wrap:wrap",
    "gap:8px",
    "padding:8px",
    "margin-bottom:10px",
    "border:1px solid rgba(255,255,255,0.12)",
    "border-radius:10px",
    "background:rgba(10,12,16,0.62)",
  ].join(";");

  const locationGroup = controlGroup("Miejsce startu");
  const locationChoices = document.createElement("div");
  locationChoices.style.cssText = "display:flex;gap:4px";
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
    link.style.cssText = choiceStyle(active);
    if (active) {
      link.setAttribute("aria-current", "page");
    }
    locationChoices.append(link);
  }
  locationGroup.append(locationChoices);
  controls.append(locationGroup);

  const textureGroup = controlGroup("Filtrowanie tekstur");
  const textureChoices = document.createElement("div");
  textureChoices.style.cssText = "display:flex;gap:4px";
  const textureButtons = new Map<
    JvTextureFilterMode,
    HTMLButtonElement
  >();
  const filters: readonly Readonly<{
    id: JvTextureFilterMode;
    label: string;
  }>[] = [
    { id: "nearest", label: "Piksele" },
    { id: "linear", label: "Wygładzanie" },
  ];
  for (const filter of filters) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = filter.label;
    button.addEventListener("click", () => {
      setJvTextureFilter(filter.id);
      rememberTextureFilter(filter.id);
    });
    textureButtons.set(filter.id, button);
    textureChoices.append(button);
  }
  textureGroup.append(textureChoices);
  controls.append(textureGroup);

  const viewGroup = controlGroup("Widok diagnostyczny");
  const gridButton = document.createElement("button");
  gridButton.type = "button";
  gridButton.addEventListener("click", () => {
    const visible = !getJvProductViewSettings().gridVisible;
    setJvGridVisible(visible);
    rememberGridVisible(visible);
  });
  viewGroup.append(gridButton);
  controls.append(viewGroup);

  const unsubscribe = subscribeJvProductViewSettings((settings) => {
    for (const [mode, button] of textureButtons) {
      const active = mode === settings.textureFilter;
      button.style.cssText = choiceStyle(active);
      button.setAttribute("aria-pressed", String(active));
    }
    gridButton.textContent = settings.gridVisible
      ? "Grid: włączony"
      : "Grid: wyłączony";
    gridButton.style.cssText = choiceStyle(settings.gridVisible);
    gridButton.setAttribute(
      "aria-pressed",
      String(settings.gridVisible),
    );
  });
  window.addEventListener("pagehide", unsubscribe, { once: true });
  panel.prepend(controls);
}

configureProductWorldLoader(loadLocalFullProductWorld);

const initialSettings = {
  textureFilter: selectedTextureFilter(),
  gridVisible: selectedGridVisible(),
} as const;
replaceJvProductViewSettings(initialSettings);
const spawnTarget = parseProductSpawnTarget(window.location.search);

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
installProductControls(spawnTarget);

const activeSettings = getJvProductViewSettings();
if (
  activeSettings.textureFilter !== initialSettings.textureFilter ||
  activeSettings.gridVisible !== initialSettings.gridVisible
) {
  throw new Error("JV product view settings changed during startup.");
}
