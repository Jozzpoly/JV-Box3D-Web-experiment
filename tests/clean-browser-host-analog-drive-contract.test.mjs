import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("CleanBrowserHost owns the typed analog-drive adapter on the shared longitudinal timeline", async () => {
  const text = await source("src/app/clean-browser-host.ts");

  assert.match(
    text,
    /PointerAnalogDriveAdapter,[\s\S]*PointerAnalogDriveControls,[\s\S]*PointerDriveDirection/,
  );
  assert.match(text, /readonly analogDriveControls\?: PointerAnalogDriveControls;/);
  assert.match(text, /readonly onAnalogPedalStateChange\?: \(/);
  assert.match(text, /readonly onDriveDirectionChange\?: \(/);
  assert.match(
    text,
    /const analogDrive = new PointerAnalogDriveAdapter\(\{[\s\S]*timeline: longitudinalTimeline,[\s\S]*controls: options\.analogDriveControls/,
  );
  assert.match(
    text,
    /resources\.defer\([\s\S]*"pointer analog drive adapter"[\s\S]*analogDrive\.dispose\(\)/,
  );
});

test("legacy pointer controls remain an optional compatibility path", async () => {
  const text = await source("src/app/clean-browser-host.ts");
  assert.match(text, /readonly pointerControls\?: PointerVehicleControlTargets;/);
  assert.match(text, /if \(options\.pointerControls !== undefined\)/);
});
