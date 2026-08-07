import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("public R0 build profile is MAP_ONLY_R0 and copies only an explicit runtime allowlist", async () => {
  const [packageJsonText, config, finalizer, mapOnlyHtml] = await Promise.all([
    readFile(resolve(root, "package.json"), "utf8"),
    readFile(resolve(root, "vite.public-r0.config.ts"), "utf8"),
    readFile(resolve(root, "tools/finalize-public-r0-build.mjs"), "utf8"),
    readFile(resolve(root, "map-only-r0.html"), "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonText);
  const script = packageJson.scripts?.["build:public-r0"] ?? "";

  assert.match(script, /generate:vehicle-fixture/);
  assert.match(script, /vite build --config vite\.public-r0\.config\.ts/);
  assert.match(script, /finalize-public-r0-build\.mjs/);
  assert.match(script, /write-portable-build-manifest\.mjs/);
  assert.match(script, /check:portable/);

  assert.match(config, /base:\s*"\.\/"/);
  assert.match(config, /publicDir:\s*false/);
  assert.match(config, /outDir:\s*"dist"/);
  assert.match(config, /map-only-r0\.html/);
  assert.match(config, /sourcemap:\s*false/);
  assert.doesNotMatch(config, /finalJsprev2VitePlugin|jsprev2|JOZZ_SCAN_PREVIEW_PACK/i);

  assert.match(mapOnlyHtml, /src\/map-only-r0-main\.ts/);
  assert.doesNotMatch(mapOnlyHtml, /src\/product-main\.ts/);

  for (const required of [
    ".nojekyll",
    "receipts/jv_m6_factory_receipt.json",
    "scenes/synthetic-flat-lab.scene.json",
    "vehicles/tiny/vehicle.visual.json",
    "vehicles/tiny/models/m6-rig-proof.glb",
  ]) {
    assert.match(finalizer, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(finalizer, /rename\(sourceHtml, publicIndex\)/);
  assert.match(finalizer, /map-only-r0\.html/);
  assert.match(finalizer, /index\.html/);
  assert.match(finalizer, /\/__jv_scan__\//);
  assert.match(finalizer, /jvSpawn=scan/);
  assert.match(finalizer, /Skan JSPREV2/);
  assert.match(finalizer, /loadLocalJsprev2Scan/);
  assert.doesNotMatch(finalizer, /copy.*jsprev2|scan.*asset/i);
});
