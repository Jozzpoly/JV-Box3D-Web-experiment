import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const cssPath = resolve(root, "src/mobile-driving-controls-v3.css");

test("V3 short-landscape explicitly supersedes legacy three-button !important geometry", async () => {
  const css = await readFile(cssPath, "utf8");
  const shortLandscape = css.match(
    /@media \(orientation: landscape\) and \(max-height: 520px\) and \(max-width: 980px\) \{([\s\S]*)\}\s*$/,
  );
  assert.ok(shortLandscape, "missing V3 short-landscape authority layer");
  const block = shortLandscape[1];

  assert.match(
    block,
    /\.mobile-drive-controls\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(50px, 60px\)\) !important;[\s\S]*?grid-template-rows:\s*auto auto !important;/,
  );
  assert.match(
    block,
    /\.mobile-pedal\.mobile-control\s*\{[\s\S]*?width:\s*clamp\(50px, 7\.4vw, 60px\) !important;[\s\S]*?height:\s*clamp\(86px, 22vh, 108px\) !important;/,
  );
  assert.match(
    block,
    /data-pointer-control="FORWARD"\][\s\S]*?grid-area:\s*throttle !important;/,
  );
  assert.match(
    block,
    /\.mobile-pedal-brake\.mobile-control\s*\{[\s\S]*?grid-area:\s*brake !important;/,
  );
  assert.match(
    block,
    /data-pointer-control="REVERSE"\][\s\S]*?grid-area:\s*direction !important;[\s\S]*?height:\s*32px !important;/,
  );
});
