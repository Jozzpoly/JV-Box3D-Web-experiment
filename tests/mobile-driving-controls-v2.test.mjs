import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("Steering Control V2 is loaded as a separate owner-facing style layer", async () => {
  const html = await read("index.html");
  assert.match(
    html,
    /<link rel="stylesheet" href="\/src\/mobile-driving-controls-v2\.css" \/>/,
  );
});

test("legacy binary steering targets cannot be resurrected by author CSS", async () => {
  const css = await read("src/mobile-driving-controls-v2.css");
  assert.match(
    css,
    /\.mobile-control\[hidden\]\s*\{\s*display:\s*none\s*!important;/s,
  );
});

test("Steering Control V2 communicates a one-dimensional rack rather than a circular joystick", async () => {
  const css = await read("src/mobile-driving-controls-v2.css");

  assert.match(
    css,
    /\.mobile-steering-joystick\s*\{[\s\S]*?width:\s*clamp\(144px,\s*40vw,\s*194px\);[\s\S]*?height:\s*clamp\(66px,\s*18vw,\s*82px\);/,
  );
  assert.match(css, /border-radius:\s*18px;/);
  assert.match(
    css,
    /\.mobile-steering-thumb\s*\{[\s\S]*?width:\s*27%;[\s\S]*?height:\s*38px;[\s\S]*?border-radius:\s*10px;/,
  );
  assert.doesNotMatch(
    css,
    /\.mobile-steering-joystick\s*\{[^}]*border-radius:\s*50%/s,
  );
});

test("rack control has extra owner ergonomics inset beyond the safe-area floor", async () => {
  const css = await read("src/mobile-driving-controls-v2.css");
  assert.match(
    css,
    /\.mobile-steering-controls\s*\{[\s\S]*?margin-left:\s*clamp\(8px,[\s\S]*?margin-bottom:\s*clamp\(12px,/,
  );
});

test("mobile Debug remains reachable above its modal panel in portrait and landscape", async () => {
  const css = await read("src/mobile-driving-controls-v2.css");
  assert.match(css, /\.panel\[data-open\]\s*\{\s*z-index:\s*18;/s);
  assert.match(css, /\.scene-actions\s*\{\s*z-index:\s*22;/s);
  assert.match(
    css,
    /@media \(hover: none\)[\s\S]*?\.scene-actions\s*\{[\s\S]*?top:\s*calc\(max\(10px,\s*env\(safe-area-inset-top\)\) \+ 98px\);[\s\S]*?bottom:\s*auto;/,
  );
  assert.match(
    css,
    /orientation:\s*landscape[\s\S]*?\.scene-actions\s*\{[\s\S]*?top:\s*calc\(max\(8px,\s*env\(safe-area-inset-top\)\) \+ 72px\);/,
  );
});
