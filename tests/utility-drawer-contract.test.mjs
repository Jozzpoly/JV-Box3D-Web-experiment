import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("P1.3 installs utility drawer only after existing product controls", async () => {
  const productMain = await read("src/product-main.ts");

  assert.match(productMain, /import "\.\/utility-drawer\.css";/);
  assert.match(
    productMain,
    /import \{ installUtilityDrawer \} from "\.\/utility-drawer\.js";/,
  );

  const controlsIndex = productMain.indexOf("installProductControls({");
  const drawerIndex = productMain.indexOf("installUtilityDrawer();");
  assert.ok(controlsIndex >= 0, "product controls installation must remain present");
  assert.ok(drawerIndex > controlsIndex, "drawer must install after product controls");
});

test("P1.3 drawer is compact-only, closed by default and keyboard recoverable", async () => {
  const drawer = await read("src/utility-drawer.ts");

  assert.match(
    drawer,
    /\(hover: none\) and \(pointer: coarse\), \(max-width: 620px\)/,
  );
  assert.match(drawer, /aria-expanded", "false"/);
  assert.match(drawer, /setOpen\(false\);/);
  assert.match(drawer, /event\.code === "Escape"/);
  assert.match(drawer, /fullscreenchange/);
  assert.match(drawer, /toggleAttribute\("inert", !open\)/);
});

test("P1.3 drawer overlays chrome and removes persistent compact header", async () => {
  const css = await read("src/utility-drawer.css");

  assert.match(css, /\.scene-header\s*\{\s*display:\s*none;/);
  assert.match(
    css,
    /\.product-toolbar\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?pointer-events:\s*none;/,
  );
  assert.match(
    css,
    /\[data-utility-drawer-open\]\s+\.product-toolbar\s*\{[\s\S]*?pointer-events:\s*auto;/,
  );
  assert.match(css, /\.product-control-label\s*\{\s*display:\s*none;/);
  assert.doesNotMatch(css, /!important\b/);
});

test("P1.3 drawer restores the complete product control surface on compact UI", async () => {
  const css = await read("src/utility-drawer.css");

  assert.match(
    css,
    /\.product-toolbar\[data-utility-drawer\]\s+\.product-control-group\s*\{\s*display:\s*grid;/,
  );
});

test("P1.3.1 gives the transient drawer viewport width and an inner scroll rail", async () => {
  const drawer = await read("src/utility-drawer.ts");
  const css = await read("src/utility-drawer.css");

  assert.match(drawer, /data-utility-drawer-scroll/);
  assert.match(drawer, /data-utility-scroll-left/);
  assert.match(drawer, /data-utility-scroll-right/);
  assert.match(drawer, /ResizeObserver/);

  assert.match(
    css,
    /\.product-toolbar\s*\{[\s\S]*?left:\s*var\(--mobile-hud-safe-left\);[\s\S]*?right:\s*var\(--mobile-hud-safe-right\);[\s\S]*?overflow:\s*hidden;/,
  );
  assert.match(
    css,
    /\.utility-drawer-scroll\s*\{[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*inline proximity;/,
  );
  assert.match(
    css,
    /\.product-toolbar\[data-utility-scroll-left\]::before,[\s\S]*?data-utility-scroll-right/,
  );
  assert.doesNotMatch(css, /clamp\(96px,\s*26vw,\s*124px\)/);
});

test("P1.3.1 keeps the drawer shell visually stable while its content scrolls", async () => {
  const css = await read("src/utility-drawer.css");

  assert.match(
    css,
    /\.product-toolbar\s*\{[\s\S]*?border-radius:\s*14px;[\s\S]*?background:\s*#080d14;/,
  );
  assert.match(
    css,
    /\.product-controls\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
  );
  assert.match(
    css,
    /\.product-control-group \+ \.product-control-group\s*\{[\s\S]*?border-inline-start:/,
  );
});

test("P1.3 preserves P1.2 steering, pedal and D-R presentation ownership", async () => {
  const drawer = await read("src/utility-drawer.ts");
  const css = await read("src/utility-drawer.css");

  assert.doesNotMatch(
    drawer,
    /data-steering-joystick|data-analog-pedal|data-drive-direction/,
  );
  assert.doesNotMatch(
    css,
    /\.mobile-steering-joystick|\.mobile-pedal|\.mobile-direction-selector/,
  );
  assert.match(
    css,
    /grid-template-rows:\s*0 0 minmax\(0, 1fr\);[\s\S]*?"readouts world actions"/,
  );
});
