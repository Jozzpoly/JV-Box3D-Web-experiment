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

test("selectable steering keeps Direct and Relative-X as explicit product alternatives", async () => {
  const adapter = await source("src/input/pointer-steering-joystick-adapter.ts");
  const main = await source("src/main.ts");
  const productMain = await source("src/product-main.ts");
  const controls = await source("src/product-controls.ts");

  assert.match(adapter, /"DIRECT_ROTATION"[\s\S]*"RELATIVE_X"/);
  assert.match(main, /selectedSteeringInteraction:[\s\S]*"DIRECT_ROTATION"/);
  assert.match(main, /getSteeringInteraction:\s*\(\)\s*=>\s*selectedSteeringInteraction/);
  assert.match(productMain, /const productRuntime = await import\("\.\/main\.js"\)/);
  assert.match(productMain, /get:\s*productRuntime\.getProductSteeringInteraction/);
  assert.match(productMain, /set:\s*productRuntime\.setProductSteeringInteraction/);
  assert.match(controls, /controlGroup\("Kierownica"\)/);
  assert.match(controls, /DIRECT_ROTATION[\s\S]*Obrót/);
  assert.match(controls, /RELATIVE_X[\s\S]*Przeciąganie/);
});

test("steering interaction selection stays runtime-session scoped instead of polluting URL state", async () => {
  const controls = await source("src/product-controls.ts");
  const viewSettings = await source("src/render/jv-product-view-settings.ts");
  const productMain = await source("src/product-main.ts");

  assert.doesNotMatch(viewSettings, /steeringInteraction|RELATIVE_X|DIRECT_ROTATION/);
  assert.doesNotMatch(controls, /jvSteeringInteraction|rememberSteeringInteraction/);
  assert.doesNotMatch(productMain, /jvSteeringInteraction/);
});

test("F4 and clean browser host forward steering providers without owning product settings", async () => {
  const f4 = await source("src/app/f4-vehicle-host.ts");
  const clean = await source("src/app/clean-browser-host.ts");

  for (const sourceText of [f4, clean]) {
    assert.match(sourceText, /getSteeringInteraction\?:\s*\(\)\s*=>\s*PointerSteeringInteraction/);
    assert.match(sourceText, /getSteeringWheelLockRadians\?:\s*\(\)\s*=>\s*number/);
    assert.match(sourceText, /getSteeringCenteringAssist\?:\s*\(\)\s*=>\s*boolean/);
    assert.match(sourceText, /getSteeringRestingPosition\?:\s*\(\)\s*=>\s*number/);
    assert.doesNotMatch(sourceText, /sessionStorage/);
  }
  assert.match(f4, /getSteeringRestingPosition:\s*options\.getSteeringRestingPosition/);
  assert.match(clean, /getRestingPosition:\s*options\.getSteeringRestingPosition/);
});

test("steering interaction selection survives host restart within the same product runtime", async () => {
  const main = await source("src/main.ts");
  const selection = main.indexOf("let selectedSteeringInteraction");
  const startHost = main.indexOf("async function startHost(): Promise<void>");
  const provider = main.indexOf(
    "getSteeringInteraction: () => selectedSteeringInteraction",
    startHost,
  );

  assert.ok(selection >= 0, "runtime steering selection is missing");
  assert.ok(selection < startHost, "steering selection must outlive individual host starts");
  assert.ok(provider > startHost, "every host start must receive the live selection provider");
});

test("hands-off steering presentation and re-grab use the physical rack as truth", async () => {
  const main = await source("src/main.ts");

  assert.match(
    main,
    /trace\.rackTranslation\s*\/\s*activeRackTravel/,
    "hands-off presentation must normalize the live physical rack",
  );
  assert.match(
    main,
    /if \(!steeringPointerActive\)[\s\S]*mobileDrivingUi\.setSteering\([\s\S]*latestPhysicalSteeringPosition,[\s\S]*false/,
    "hands-off UI must follow physical rack without pretending the pointer is active",
  );
  assert.match(
    main,
    /getSteeringRestingPosition:\s*\(\)\s*=>\s*latestPhysicalSteeringPosition/,
    "new grabs must re-anchor to physical steering state",
  );
  assert.match(
    main,
    /activeRackTravel\s*=\s*nativeReceipt\.derived\.rackTravel/,
    "rack normalization must use the validated receipt-derived rack travel",
  );
});

test("range and artificial centering settings restore before runtime startup and stay out of URL state", async () => {
  const productMain = await source("src/product-main.ts");
  const controls = await source("src/product-controls.ts");
  const settings = await source("src/product-steering-settings.ts");

  const restore = productMain.indexOf("initializeJvProductSteeringSettings");
  const runtimeImport = productMain.indexOf('await import("./main.js")');
  assert.ok(restore >= 0, "steering session restoration is missing");
  assert.ok(runtimeImport > restore, "steering settings must restore before runtime startup");
  assert.match(productMain, /window\.sessionStorage/);
  assert.doesNotMatch(productMain, /jvSteeringRange|jvSteeringAssist/);
  assert.match(settings, /wheelRangeDegrees:\s*900/);
  assert.match(settings, /centeringAssist:\s*false/);
  assert.match(controls, /360°[\s\S]*540°[\s\S]*720°[\s\S]*900°[\s\S]*1080°/);
  assert.match(controls, /Asysta ON[\s\S]*Asysta OFF|Asysta OFF[\s\S]*Asysta ON/);
});
