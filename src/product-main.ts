import "./style.css";
import "./mobile-driving-controls.css";
import "./mobile-driving-polish.css";
import "./direct-rotation-steering.css";
import "./utility-drawer.css";
import "./spawn-calibration-ui.css";

import { configureScenePackageTransform } from "./scene/scene-package.js";
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
  parseCustomScanSpawn,
  parseProductSpawnTarget,
  type JvProductSpawnTarget,
} from "./scene/product-spawn.js";
import {
  getJvProductViewSettings,
  replaceJvProductViewSettings,
  subscribeJvProductViewSettings,
  type JvTextureFilterMode,
} from "./render/jv-product-view-settings.js";
import {
  getJvProductSteeringSettings,
  initializeJvProductSteeringSettings,
  setJvSteeringWheelRangeDegrees,
} from "./product-steering-settings.js";
import { installJvBuildIdentity } from "./runtime/build-identity.js";
import { installJvPerformanceObserver } from "./runtime/performance-observer.js";
import { publishJvStartupPerformance } from "./runtime/startup-performance.js";
import { installProductControls } from "./product-controls.js";
import {
  formatJvMultiplier,
  getJvProductVehicleSettings,
  initializeJvProductVehicleSettings,
  JV_BRAKE_CHOICES,
  JV_POWER_CHOICES,
  setJvVehicleBrake,
  setJvVehiclePower,
  type JvBrakeChoice,
  type JvPowerChoice,
} from "./product-vehicle-settings.js";
import { installUtilityDrawer } from "./utility-drawer.js";
import { installSpawnLandmarkCapture } from "./spawn-landmark-capture.js";

function targetUrl(target: JvProductSpawnTarget): string {
  const url = new URL(window.location.href);
  url.searchParams.set("jvSpawn", target);
  url.searchParams.delete("jvSpawnX");
  url.searchParams.delete("jvSpawnZ");
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

function selectedSteeringPlateVisible(): boolean {
  return new URL(window.location.href).searchParams.get("jvSteeringPlate") === "1";
}

const spawnTarget = parseProductSpawnTarget(window.location.search);
const customScanSpawn = parseCustomScanSpawn(window.location.search);
const scanCalibrationTarget =
  spawnTarget === "scan-cal-a" ||
  spawnTarget === "scan-cal-b" ||
  spawnTarget === "scan-cal-c";
const scanBackedSpawnTarget =
  spawnTarget === "scan" ||
  spawnTarget === "scan-custom" ||
  scanCalibrationTarget;

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
    scanBackedSpawnTarget
      ? loadLocalFullProductWorld
      : loadMapOnlyProductWorld,
  ),
);

const initialSettings = {
  textureFilter: selectedTextureFilter(),
  gridVisible: selectedGridVisible(),
  steeringPlateVisible: selectedSteeringPlateVisible(),
} as const;
replaceJvProductViewSettings(initialSettings);

try {
  initializeJvProductSteeringSettings(window.sessionStorage);
} catch {
  initializeJvProductSteeringSettings(null);
}
try {
  initializeJvProductVehicleSettings(window.sessionStorage);
} catch {
  initializeJvProductVehicleSettings(null);
}

if (spawnTarget !== "map") {
  configureScenePackageTransform(async (scene) =>
    applyProductSpawnToScene(
      scene,
      await loadProductWorld(),
      spawnTarget,
      customScanSpawn,
    ),
  );
}

const productRuntime = await import("./main.js");

// The scan world is large; say what the wait is for while it loads.
const sceneLoading = document.querySelector<HTMLElement>("[data-scene-loading]");
if (scanBackedSpawnTarget && sceneLoading !== null && !sceneLoading.hidden) {
  const scanLoadingMessage = "Ładowanie skanu terenu (ok. 100 MB)…";
  const loadingText = sceneLoading.querySelector<HTMLElement>("[data-scene-loading-text]");
  if (loadingText !== null) loadingText.textContent = scanLoadingMessage;
  const pill = document.querySelector<HTMLElement>("[data-scene-state]");
  if (pill !== null) pill.textContent = scanLoadingMessage;
}

const scenePanel = document.querySelector<HTMLElement>(".scene-panel");
if (scenePanel === null) {
  throw new Error("JV product requires .scene-panel after runtime startup.");
}
const unsubscribeViewPresentation = subscribeJvProductViewSettings((settings) => {
  scenePanel.toggleAttribute(
    "data-steering-plate-hidden",
    !settings.steeringPlateVisible,
  );
});
window.addEventListener("pagehide", unsubscribeViewPresentation, { once: true });

const scanAvailabilityProbeUrl = new URL(
  "__jv_scan__/index.json",
  document.baseURI,
).href;
const scanUnavailableMessage =
  "Skan JSPREV2 jest niedostępny w tej publikacji. Mapa i Offroad działają niezależnie.";

installJvBuildIdentity();
installJvPerformanceObserver();
installProductControls({
  capabilities: {
    locationChoices: [
      {
        label: "Plac",
        href: targetUrl("map"),
        active: spawnTarget === "map",
      },
      {
        label: "Offroad",
        href: targetUrl("offroad"),
        active: spawnTarget === "offroad",
      },
      {
        label: "Skan",
        href: targetUrl("scan-cal-b"),
        active: spawnTarget === "scan-cal-b" || spawnTarget === "scan-custom",
        availabilityProbeUrl: scanAvailabilityProbeUrl,
        unavailableMessage: scanUnavailableMessage,
      },
    ],
    textureFilter: true,
    grid: true,
    steeringPlate: true,
    fullscreen: true,
  },
  steeringInteraction: {
    get: productRuntime.getProductSteeringInteraction,
    set: productRuntime.setProductSteeringInteraction,
  },
  steeringSettings: {
    getRangeDegrees: () =>
      getJvProductSteeringSettings().wheelRangeDegrees,
    setRangeDegrees: setJvSteeringWheelRangeDegrees,
  },
  vehicleSettings: [
    {
      label: "Moc",
      choices: JV_POWER_CHOICES,
      format: formatJvMultiplier,
      get: () => getJvProductVehicleSettings().power,
      set: (value) => setJvVehiclePower(value as JvPowerChoice),
    },
    {
      label: "Hamulec",
      choices: JV_BRAKE_CHOICES,
      format: formatJvMultiplier,
      get: () => getJvProductVehicleSettings().brake,
      set: (value) => setJvVehicleBrake(value as JvBrakeChoice),
    },
  ],
});
installSpawnLandmarkCapture(scanBackedSpawnTarget);
installUtilityDrawer();

const activeSettings = getJvProductViewSettings();
if (
  activeSettings.textureFilter !== initialSettings.textureFilter ||
  activeSettings.gridVisible !== initialSettings.gridVisible ||
  activeSettings.steeringPlateVisible !== initialSettings.steeringPlateVisible
) {
  throw new Error("JV product view settings changed during startup.");
}
