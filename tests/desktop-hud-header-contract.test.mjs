import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("wide fine-pointer desktop removes the redundant first HUD row and reuses it for controls", async () => {
  const css = await read("src/style.css");
  const desktopHud =
    /@media \(min-width: 901px\) and \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}/;

  assert.match(css, desktopHud);
  assert.match(
    css,
    /@media \(min-width: 901px\) and \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.scene-header\s*\{[^}]*display:\s*none;/,
  );
  assert.match(
    css,
    /@media \(min-width: 901px\) and \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.product-toolbar\s*\{[^}]*top:\s*16px;/,
  );
  assert.match(
    css,
    /@media \(min-width: 901px\) and \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.scene-actions\s*\{[^}]*top:\s*16px;/,
  );
});

test("mobile and medium-width layout contracts remain explicitly present", async () => {
  const css = await read("src/style.css");

  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(
    css,
    /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 620px\)/,
  );
  assert.match(
    css,
    /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 620px\) \{[\s\S]*?\.scene-header\s*\{[^}]*top:\s*max\(10px, env\(safe-area-inset-top\)\)/,
  );
});
