import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("V3 presentation cannot read or redefine input geometry", async () => {
  const ui = await source("src/mobile-driving-v3-ui.ts");
  assert.doesNotMatch(ui, /getBoundingClientRect/);
  assert.match(ui, /--steering-angle/);
  assert.match(ui, /--pedal-fill/);
  assert.match(ui, /--pedal-face-shift/);
  assert.match(ui, /data-peer-active/);
});

test("V3 active feedback transforms only inner mechanical layers", async () => {
  const css = await source("src/mobile-driving-controls-v3.css");

  const steeringOuter = css.match(
    /\.mobile-steering-joystick\[data-active\]\s*\{([^}]*)\}/,
  );
  assert.ok(steeringOuter);
  assert.match(steeringOuter[1], /transform:\s*none/);

  const pedalOuter = css.match(
    /\.mobile-pedal\.mobile-control\[data-active\],[\s\S]*?\{([^}]*)\}/,
  );
  assert.ok(pedalOuter);
  assert.match(pedalOuter[1], /transform:\s*none/);

  assert.match(
    css,
    /\.mobile-steering-joystick\[data-active\] \.mobile-steering-wheel-stage\s*\{[\s\S]*?transform:\s*scale\(1\.045\)/,
  );
  assert.match(
    css,
    /\.mobile-pedal\[data-active\] \.mobile-pedal-mechanism\s*\{[\s\S]*?scale\(1\.075, 1\.045\)/,
  );
  assert.match(
    css,
    /\.mobile-pedal\[data-peer-active\] \.mobile-pedal-mechanism\s*\{[\s\S]*?scale\(\.92\)/,
  );
});

test("V3 owns portrait, landscape and short-landscape spacing", async () => {
  const css = await source("src/mobile-driving-controls-v3.css");
  assert.match(css, /orientation:\s*portrait/);
  assert.match(css, /orientation:\s*landscape/);
  assert.match(css, /max-height:\s*520px/);
  assert.match(css, /safe-area-inset-bottom/);
});
