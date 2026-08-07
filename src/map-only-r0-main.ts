import { installProductControls } from "./product-controls.js";
import {
  getJvProductViewSettings,
  replaceJvProductViewSettings,
} from "./render/jv-product-view-settings.js";
import {
  configureProductWorldLoader,
  createProductWorld,
  type ProductWorldLoader,
} from "./scene/product-world.js";

const loadMapOnlyR0World: ProductWorldLoader = async () =>
  createProductWorld();

function selectedGridVisible(): boolean {
  return new URL(window.location.href).searchParams.get("jvGrid") === "1";
}

configureProductWorldLoader(loadMapOnlyR0World);

const initialSettings = {
  textureFilter: "nearest",
  gridVisible: selectedGridVisible(),
} as const;
replaceJvProductViewSettings(initialSettings);

await import("./main.js");

installProductControls({
  capabilities: {
    textureFilter: false,
    grid: true,
  },
});

const activeSettings = getJvProductViewSettings();
if (
  activeSettings.textureFilter !== initialSettings.textureFilter ||
  activeSettings.gridVisible !== initialSettings.gridVisible
) {
  throw new Error("JV MAP_ONLY_R0 view settings changed during startup.");
}
