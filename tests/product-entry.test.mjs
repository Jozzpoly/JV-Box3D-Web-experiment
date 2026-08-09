import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("browser boots through the explicit car map scan product entry", async () => {
  const [
    html,
    entry,
    localFullProvider,
    controls,
    main,
    settings,
    policy,
    worldRenderer,
    observerRenderer,
  ] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "src/product-main.ts"), "utf8"),
    readFile(resolve(root, "src/scene/local-full-product-world.ts"), "utf8"),
    readFile(resolve(root, "src/product-controls.ts"), "utf8"),
    readFile(resolve(root, "src/main.ts"), "utf8"),
    readFile(
      resolve(root, "src/render/jv-product-view-settings.ts"),
      "utf8",
    ),
    readFile(
      resolve(root, "src/render/jv-scan-webgl-policy.ts"),
      "utf8",
    ),
    readFile(
      resolve(root, "src/render/jv-world-renderer.ts"),
      "utf8",
    ),
    readFile(
      resolve(root, "src/render/m6-world-renderer.ts"),
      "utf8",
    ),
  ]);

  assert.match(html, /src\/product-main\.ts/);
  assert.doesNotMatch(html, /src\/main\.ts/);
  assert.match(entry, /DEFAULT_SCENE_PACKAGE_URL/);
  assert.match(entry, /applyProductSpawnToScene/);
  assert.match(entry, /await import\("\.\/main\.js"\)/);
  assert.match(entry, /spawnTarget === "scan"/);
  assert.match(entry, /loadMapOnlyProductWorld/);
  assert.match(entry, /textureFilter: true/);
  assert.match(entry, /grid: true/);
  assert.match(entry, /Plac E2R/);
  assert.match(entry, /Offroad/);
  assert.match(entry, /Skan JSPREV2/);
  assert.match(entry, /targetUrl\("scan"\)/);
  assert.match(entry, /new URL\(\s*"__jv_scan__\/index\.json",\s*document\.baseURI,?\s*\)\.href/s);
  assert.doesNotMatch(entry, /"\/__jv_scan__\/index\.json"/);
  assert.match(controls, /Pixel/);
  assert.match(controls, /Smooth/);
  assert.match(controls, /Grid ON/);
  assert.match(controls, /Grid OFF/);
  assert.match(controls, /setJvTextureFilter/);
  assert.match(controls, /setJvGridVisible/);
  assert.match(localFullProvider, /jsprev2-scan\.js/);
  assert.match(main, /loadScenePackageV1\(\)/);
  assert.match(main, /M6ProductRenderer/);
  assert.match(main, /data-camera-reset/);
  assert.match(observerRenderer, /resetCamera\(\)/);
  assert.match(observerRenderer, /setDiagnosticsVisible\(visible: boolean\)/);
  assert.match(main, /setDiagnosticsVisible\(open\)/);

  assert.match(settings, /textureFilter: "nearest"/);
  assert.match(settings, /gridVisible: false/);
  assert.match(policy, /UNPACK_FLIP_Y_WEBGL \? 0/);
  assert.match(policy, /mode === "nearest" \? gl\.NEAREST : gl\.LINEAR/);
  assert.match(worldRenderer, /createJvScanWebGlPolicy/);
  assert.match(worldRenderer, /subscribeJvProductViewSettings/);
  assert.match(observerRenderer, /getJvProductViewSettings/);
  assert.match(
    observerRenderer,
    /getJvProductViewSettings\(\)\.gridVisible/,
  );
});
