import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("product main uses only the new analog mobile driving path", async () => {
  const main = await source("src/main.ts");

  assert.match(main, /MobileDrivingV3Ui/);
  assert.match(main, /PointerAnalogDriveControls/);
  assert.match(main, /data-analog-pedal="THROTTLE"/);
  assert.match(main, /data-analog-pedal="BRAKE"/);
  assert.match(main, /data-drive-direction="D"/);
  assert.match(main, /mobile-steering-wheel-rotor/);
  assert.match(main, /const analogDriveControls: PointerAnalogDriveControls/);
  assert.match(main, /onAnalogPedalStateChange: setAnalogPedalState/);
  assert.match(main, /onDriveDirectionChange: setDriveDirection/);
  assert.match(main, /onSteeringJoystickStateChange: setSteeringJoystickState/);
  assert.doesNotMatch(main, /data-pointer-control=/);
  assert.doesNotMatch(main, /\bpointerControls\b/);
});

test("vehicle reset returns touch drive selector to D while keeping debug and camera controls", async () => {
  const main = await source("src/main.ts");
  assert.match(
    main,
    /function resetDisplay\(\): void \{[\s\S]*mobileDrivingV3Ui\.resetTransientState\(\);[\s\S]*mobileDrivingV3Ui\.setDirection\("D"\);/,
  );
  assert.match(main, /data-camera-reset/);
  assert.match(main, /data-debug-toggle/);
  assert.match(main, /setDebugPanelOpen\(!debugPanel\.hasAttribute\("data-open"\)\)/);
});

test("V3 CSS is loaded after the accepted V2 steering foundation", async () => {
  const html = await source("index.html");
  const v2 = html.indexOf('/src/mobile-driving-controls-v2.css');
  const v3 = html.indexOf('/src/mobile-driving-controls-v3.css');
  assert.ok(v2 >= 0, "missing V2 steering foundation stylesheet");
  assert.ok(v3 > v2, "V3 stylesheet must load after V2");
});
