import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("product main uses typed analog driving controls and generation-scoped presentation", async () => {
  const main = await source("src/main.ts");

  assert.match(main, /PointerAnalogDriveControls/);
  assert.match(main, /MobileDrivingUi/);
  assert.match(main, /data-analog-pedal="BRAKE"/);
  assert.match(main, /data-analog-pedal="THROTTLE"/);
  assert.match(main, /data-drive-direction="D"/);
  assert.match(main, /mobile-steering-wheel-rotor/);
  assert.match(main, /mobileDrivingUi\.beginGeneration\(generation\)/);
  assert.match(
    main,
    /onAnalogPedalStateChange:[\s\S]*mobileDrivingUi\.setPedal\(generation,/,
  );
  assert.match(
    main,
    /onDriveDirectionChange:[\s\S]*mobileDrivingUi\.setDirection\(generation,/,
  );
  assert.match(
    main,
    /onSteeringJoystickStateChange:[\s\S]*mobileDrivingUi\.setSteering\(generation,/,
  );
});

test("new mobile control stylesheet loads after the accepted V2 foundation", async () => {
  const html = await source("index.html");
  const v2 = html.indexOf('/src/mobile-driving-controls-v2.css');
  const current = html.indexOf('/src/mobile-driving-controls.css');
  assert.ok(v2 >= 0, "missing V2 steering foundation stylesheet");
  assert.ok(current > v2, "mobile driving stylesheet must load after V2");
});

test("mechanical HUD keeps outer touch geometry stable and brake left of throttle", async () => {
  const css = await source("src/mobile-driving-controls.css");

  assert.match(
    css,
    /grid-template-areas:\s*\n\s*"brake throttle"\s*\n\s*"direction direction"/,
  );
  assert.match(
    css,
    /\.mobile-steering-wheel-rotor\s*\{[\s\S]*?transform:\s*rotate\(var\(--steering-angle\)\)/,
  );
  assert.doesNotMatch(
    css,
    /\.mobile-steering-wheel-rotor\s*\{[^}]*transition:/,
  );
  assert.match(
    css,
    /\.mobile-steering-joystick\[data-active\] \.mobile-steering-wheel-stage\s*\{[\s\S]*?transform:/,
  );
  assert.match(
    css,
    /\.mobile-pedal\[data-active\] \.mobile-pedal-mechanism\s*\{[\s\S]*?transform:/,
  );
  assert.doesNotMatch(css, /filter:\s*(brightness|saturate|blur)\(/);
});

test("restart invalidates old presentation before disposing the old host", async () => {
  const main = await source("src/main.ts");
  const start = main.indexOf("async function startHost(): Promise<void>");
  const begin = main.indexOf("mobileDrivingUi.beginGeneration(generation);", start);
  const dispose = main.indexOf("host?.dispose();", start);
  assert.ok(start >= 0 && begin > start && dispose > begin);
});
