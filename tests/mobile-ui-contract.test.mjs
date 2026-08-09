import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("mobile UI exposes each semantic vehicle control exactly once", async () => {
  const source = await read("src/main.ts");
  const controls = [
    "STEER_LEFT",
    "STEER_RIGHT",
    "FORWARD",
    "REVERSE",
    "BRAKE",
  ];

  for (const control of controls) {
    const openingButtons = source.match(
      new RegExp(
        `<button\\b[^>]*\\bdata-pointer-control=\\"${control}\\"[^>]*>`,
        "g",
      ),
    );
    assert.equal(
      openingButtons?.length,
      1,
      `${control} must have one DOM target`,
    );
  }
});

test("mobile viewport and controls preserve safe areas and local gesture ownership", async () => {
  const [html, css] = await Promise.all([
    read("index.html"),
    read("src/style.css"),
  ]);

  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable\s*=\s*no/i);
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /env\(safe-area-inset-right\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /\.mobile-control\s*\{[^}]*touch-action:\s*none;/s);
  assert.match(css, /\.scene-panel\s*\{[^}]*height:\s*100svh;/s);
  assert.match(css, /\.mobile-controls\s*\{[^}]*bottom:\s*max\(14px,\s*env\(safe-area-inset-bottom\)\)/s);
});

test("narrow mobile layout retains two non-overlapping control clusters", async () => {
  const css = await read("src/style.css");
  const size = css.match(
    /\.mobile-control\s*\{[^}]*width:\s*clamp\((\d+)px,\s*(\d+)vw,\s*(\d+)px\)/s,
  );
  assert.ok(size, "mobile control width clamp is required");

  const minimum = Number(size[1]);
  const clusterGap = 9;
  const interClusterGap = 18;
  const horizontalInsets = 32;
  const requiredWidth =
    4 * minimum + 2 * clusterGap + interClusterGap + horizontalInsets;
  assert.ok(
    requiredWidth <= 320,
    `minimum mobile layout requires ${requiredWidth}px, exceeding 320px`,
  );
});
