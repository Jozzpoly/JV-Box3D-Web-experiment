import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("product entry owns ordered current mobile presentation layers", async () => {
  const productMain = await source("src/product-main.ts");
  const index = await source("index.html");
  const base = productMain.indexOf('import "./style.css";');
  const current = productMain.indexOf('import "./mobile-driving-controls.css";');
  const polish = productMain.indexOf('import "./mobile-driving-polish.css";');
  const directRotation = productMain.indexOf(
    'import "./direct-rotation-steering.css";',
  );

  assert.ok(base >= 0, "product entry must own base CSS");
  assert.ok(current > base, "current mobile-driving CSS must follow base CSS");
  assert.ok(polish > current, "mobile polish must follow control foundation CSS");
  assert.ok(
    directRotation > polish,
    "direct-rotation presentation correction must override active wheel motion",
  );
  assert.doesNotMatch(productMain, /mobile-driving-controls-v2\.css/);
  await assert.rejects(
    () => access(resolve(root, "src/mobile-driving-controls-v2.css")),
    { code: "ENOENT" },
    "superseded V2 presentation stylesheet must not remain in active source",
  );
  assert.doesNotMatch(index, /mobile-driving-controls(?:-v2)?\.css/);
  assert.doesNotMatch(index, /<link[^>]+rel=["']stylesheet["']/i);
});

test("product main exposes stable direct-wheel geometry inside steering acquisition target", async () => {
  const main = await source("src/main.ts");
  const target = main.indexOf('data-steering-joystick');
  const tilt = main.indexOf('mobile-steering-wheel-tilt', target);
  const rotor = main.indexOf('mobile-steering-wheel-rotor', tilt);

  assert.ok(target >= 0, "steering acquisition target is missing");
  assert.ok(tilt > target, "projected wheel geometry must live inside steering target");
  assert.ok(rotor > tilt, "rotating artwork must remain inside stable projected geometry");
});

test("direct rotation can acquire the visible projected wheel without expanding the layout box", async () => {
  const directRotationCss = await source("src/direct-rotation-steering.css");

  assert.match(directRotationCss, /\.mobile-steering-wheel-tilt::after\s*\{/);
  assert.match(directRotationCss, /position:\s*absolute/);
  assert.match(directRotationCss, /inset:\s*0/);
  assert.match(directRotationCss, /border-radius:\s*50%/);
  assert.match(directRotationCss, /pointer-events:\s*auto/);
});

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
