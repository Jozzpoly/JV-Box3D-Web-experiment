import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("browser boots through the explicit car map scan product entry", async () => {
  const [html, entry, main] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "src/product-main.ts"), "utf8"),
    readFile(resolve(root, "src/main.ts"), "utf8"),
  ]);

  assert.match(html, /src\/product-main\.ts/);
  assert.doesNotMatch(html, /src\/main\.ts/);
  assert.match(entry, /Mapa E2R/);
  assert.match(entry, /Skan JSPREV2/);
  assert.match(entry, /DEFAULT_SCENE_PACKAGE_URL/);
  assert.match(entry, /applyProductSpawnToScene/);
  assert.match(entry, /await import\("\.\/main\.js"\)/);
  assert.match(main, /loadScenePackageV1\(\)/);
});
