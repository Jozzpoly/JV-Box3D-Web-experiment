import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

function count(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

test("mobile viewport preserves safe-area coverage without disabling browser zoom", async () => {
  const html = await read("index.html");

  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable\s*=\s*no/i);
  assert.doesNotMatch(html, /maximum-scale\s*=\s*1/i);
});

test("mobile scene can shrink below the historical desktop 420px floor", async () => {
  const mobileCss = await read("src/mobile-driving-controls.css");

  assert.match(
    mobileCss,
    /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 620px\) \{[\s\S]*?\.scene-panel\s*\{[\s\S]*?min-height:\s*0;/,
  );
});

test("mobile-only toolbar controls track the same responsive boundary as the mobile driving surface", async () => {
  const controls = await read("src/product-controls.ts");

  assert.match(
    controls,
    /window\.matchMedia\(\s*"\(hover: none\) and \(pointer: coarse\), \(max-width: 620px\)"\s*\)/,
  );
  assert.match(
    controls,
    /element\.hidden\s*=\s*!mobileDrivingSurface\.matches/,
  );
  assert.match(
    controls,
    /mobileDrivingSurface\.addEventListener\(\s*"change",\s*syncMobileDrivingOnlyControls\)/,
  );
  assert.match(
    controls,
    /mobileDrivingSurface\.removeEventListener\(\s*"change",\s*syncMobileDrivingOnlyControls\)/,
  );
});

test("hidden mobile-driving-only groups stay hidden despite their grid display rule", async () => {
  const css = await read("src/direct-rotation-steering.css");

  assert.match(
    css,
    /\[data-mobile-driving-only\]\[hidden\]\s*\{[^}]*display:\s*none;/,
  );
});

test("P1.2 mobile HUD uses scene-level named composition zones without shrinking the canvas", async () => {
  const mobileCss = await read("src/mobile-driving-controls.css");

  assert.match(
    mobileCss,
    /\.scene-panel\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:/,
  );
  assert.match(mobileCss, /"readouts world actions"/);
  assert.match(mobileCss, /"controls controls controls"/);
  assert.match(
    mobileCss,
    /\.scene-panel\s*>\s*\[data-scene\]\s*\{[^}]*position:\s*absolute;[^}]*width:\s*100%;[^}]*height:\s*100%;/,
  );
  assert.match(mobileCss, /\.scene-actions\s*\{[^}]*grid-area:\s*actions;/);
  assert.match(mobileCss, /\.scene-readouts\s*\{[^}]*grid-area:\s*readouts;/);
  assert.match(mobileCss, /\.mobile-controls\s*\{[^}]*grid-area:\s*controls;/);
  assert.doesNotMatch(mobileCss, /!important\b/);
});

test("P1.2 short coarse-pointer landscape overlays controls without a full bottom controls row", async () => {
  const mobileCss = await read("src/mobile-driving-controls.css");
  const shortLandscape =
    /@media \(hover: none\) and \(pointer: coarse\) and \(orientation: landscape\) and \(max-height: 520px\) and \(max-width: 980px\)/;

  assert.match(mobileCss, shortLandscape);
  assert.match(
    mobileCss,
    /@media \(hover: none\) and \(pointer: coarse\) and \(orientation: landscape\) and \(max-height: 520px\) and \(max-width: 980px\) \{[\s\S]*?\.scene-panel\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0, 1fr\);/,
  );
  assert.match(
    mobileCss,
    /@media \(hover: none\) and \(pointer: coarse\) and \(orientation: landscape\) and \(max-height: 520px\) and \(max-width: 980px\) \{[\s\S]*?\.mobile-controls\s*\{[^}]*grid-area:\s*2\s*\/\s*1\s*\/\s*4\s*\/\s*4;/,
  );
});

test("product DOM exposes one steering surface, two analog pedals, and one D-R selector", async () => {
  const main = await read("src/main.ts");

  assert.equal(
    count(main, /<div\b[^>]*\bdata-steering-joystick\b[^>]*>/g),
    1,
  );
  assert.equal(
    count(main, /<button\b[^>]*data-analog-pedal="BRAKE"[^>]*>/g),
    1,
  );
  assert.equal(
    count(main, /<button\b[^>]*data-analog-pedal="THROTTLE"[^>]*>/g),
    1,
  );
  assert.equal(
    count(main, /<button\b[^>]*data-drive-direction="D"[^>]*>/g),
    1,
  );

  assert.doesNotMatch(
    main,
    /<(?:button|div)\b[^>]*\bdata-pointer-control=/,
    "legacy binary pointer buttons must not be part of the owner-facing product DOM",
  );
});

test("analog owner controls expose slider semantics without encoding presentation geometry", async () => {
  const main = await read("src/main.ts");

  assert.match(
    main,
    /<div\b[^>]*data-steering-joystick\b[^>]*role="slider"[^>]*aria-valuemin="-100"[^>]*aria-valuemax="100"[^>]*>/,
  );
  assert.match(
    main,
    /<button\b[^>]*data-analog-pedal="BRAKE"[^>]*role="slider"[^>]*aria-valuemin="0"[^>]*aria-valuemax="100"[^>]*>/,
  );
  assert.match(
    main,
    /<button\b[^>]*data-analog-pedal="THROTTLE"[^>]*role="slider"[^>]*aria-valuemin="0"[^>]*aria-valuemax="100"[^>]*>/,
  );
  assert.match(
    main,
    /<button\b[^>]*data-drive-direction="D"[^>]*aria-label="[^"]*D\/R[^"]*"[^>]*>/,
  );
});

test("Friends debug surface starts closed and remains explicitly recoverable", async () => {
  const main = await read("src/main.ts");
  const mobileCss = await read("src/mobile-driving-controls.css");

  assert.match(main, /data-debug-toggle aria-expanded="false"/);
  assert.match(main, /data-debug-panel aria-hidden="true"/);
  assert.match(main, /setDebugPanelOpen\(false\)/);
  assert.match(main, /data-debug-toggle/);
  assert.match(mobileCss, /\.panel\[data-open\]\s*\{[\s\S]*?z-index:\s*18;/);
  assert.match(mobileCss, /\.scene-actions\s*\{[\s\S]*?z-index:\s*22;/);
});
