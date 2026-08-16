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

test("owner-facing mobile product uses the analog path instead of legacy binary pointer controls", async () => {
  const main = await source("src/main.ts");

  assert.match(main, /analogDriveControls,/);
  assert.match(main, /steeringJoystick,/);
  assert.doesNotMatch(main, /\bpointerControls\s*:/);
  assert.doesNotMatch(main, /\bdata-pointer-control=/);
});

test("brake remains the left-to-right semantic peer before throttle", async () => {
  const main = await source("src/main.ts");
  const brake = main.indexOf('data-analog-pedal="BRAKE"');
  const throttle = main.indexOf('data-analog-pedal="THROTTLE"');

  assert.ok(brake >= 0, "BRAKE pedal target is missing");
  assert.ok(throttle > brake, "BRAKE must precede THROTTLE in product DOM order");
});

test("restart invalidates old presentation before disposing the old host", async () => {
  const main = await source("src/main.ts");
  const start = main.indexOf("async function startHost(): Promise<void>");
  const begin = main.indexOf("mobileDrivingUi.beginGeneration(generation);", start);
  const dispose = main.indexOf("host?.dispose();", start);

  assert.ok(start >= 0, "startHost is missing");
  assert.ok(begin > start, "new presentation generation must start inside startHost");
  assert.ok(dispose > begin, "old host must be disposed only after presentation invalidation");
});
