import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("Friends product enables fullscreen as an explicit view capability", async () => {
  const source = await read("src/product-main.ts");
  assert.match(source, /fullscreen:\s*true/);
});

test("fullscreen control uses the standard API and follows external fullscreen changes", async () => {
  const source = await read("src/product-controls.ts");
  assert.match(source, /document\.fullscreenEnabled\s*===\s*true/);
  assert.match(source, /document\.documentElement\.requestFullscreen\(\)/);
  assert.match(source, /document\.exitFullscreen\(\)/);
  assert.match(source, /document\.addEventListener\("fullscreenchange",\s*syncFullscreenButton\)/);
  assert.match(source, /document\.fullscreenElement\s*!==\s*null/);
  assert.match(source, /Przełącz pełny ekran/);
  assert.match(source, /Wyjdź z pełnego/);
});

test("unsupported or rejected fullscreen does not create a dead mandatory control", async () => {
  const source = await read("src/product-controls.ts");
  assert.match(
    source,
    /capabilities\.fullscreen\s*===\s*true\s*&&\s*fullscreenAvailable\(\)/,
  );
  assert.match(
    source,
    /Pełny ekran jest niedostępny w tej przeglądarce lub kontekście\./,
  );
  assert.match(source, /notice\.hidden\s*=\s*false/);
});

test("fullscreen action remains outside mobile-hidden secondary control groups", async () => {
  const source = await read("src/product-controls.ts");
  const appendIndex = source.indexOf("controls.append(fullscreenButton)");
  const groupIndex = source.indexOf("const viewGroup = controlGroup(\"Widok\")");
  assert.ok(groupIndex >= 0);
  assert.ok(appendIndex > groupIndex);
  assert.doesNotMatch(
    source.slice(groupIndex, appendIndex),
    /viewGroup\.append\(fullscreenButton\)/,
  );
});
