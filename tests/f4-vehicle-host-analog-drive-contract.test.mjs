import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("F4VehicleHost passes analog-drive controls through without owning input semantics", async () => {
  const text = await source("src/app/f4-vehicle-host.ts");

  assert.match(text, /readonly analogDriveControls\?: PointerAnalogDriveControls;/);
  assert.match(text, /readonly onAnalogPedalStateChange\?: \(/);
  assert.match(text, /pedal: AnalogDrivePedal,/);
  assert.match(text, /readonly onDriveDirectionChange\?: \(/);
  assert.match(text, /direction: PointerDriveDirection,/);
  assert.match(
    text,
    /analogDriveControls: options\.analogDriveControls/,
  );
  assert.match(
    text,
    /onAnalogPedalStateChange:[\s\S]*options\.onAnalogPedalStateChange/,
  );
  assert.match(
    text,
    /onDriveDirectionChange:[\s\S]*options\.onDriveDirectionChange/,
  );
});
