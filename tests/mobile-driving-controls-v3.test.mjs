import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("Mobile Driving V3 is layered after the accepted V2 control CSS", async () => {
  const html = await read("index.html");
  const v2 = html.indexOf('/src/mobile-driving-controls-v2.css');
  const v3 = html.indexOf('/src/mobile-driving-controls-v3.css');
  assert.ok(v2 >= 0, "V2 control layer must remain present");
  assert.ok(v3 > v2, "V3 control layer must load after V2");
});

test("pedal hitboxes remain fixed while only internal surfaces animate", async () => {
  const css = await read("src/mobile-driving-controls-v3.css");

  assert.match(
    css,
    /\.mobile-pedal\s*\{[\s\S]*?width:\s*clamp\(54px,\s*14vw,\s*66px\);[\s\S]*?height:\s*clamp\(104px,\s*27vw,\s*136px\);[\s\S]*?transform:\s*none;[\s\S]*?transition:\s*none;/,
  );
  assert.match(
    css,
    /\.mobile-pedal\.mobile-control\[data-active\][\s\S]*?\{[\s\S]*?transform:\s*none;/,
  );
  assert.match(
    css,
    /\.mobile-pedal\[data-active\] \.mobile-pedal-surface\s*\{[\s\S]*?transform:\s*translateY\(-4px\) scale\(1\.07,\s*1\.045\);/,
  );
  assert.match(
    css,
    /\.mobile-pedal\[data-peer-active\] \.mobile-pedal-surface\s*\{[\s\S]*?transform:\s*scale\(\.92\);/,
  );
});

test("panoramic steering keeps a fixed outer control and rotates the internal wheel", async () => {
  const css = await read("src/mobile-driving-controls-v3.css");

  assert.match(
    css,
    /\.mobile-steering-joystick\s*\{[\s\S]*?width:\s*clamp\(154px,\s*39vw,\s*204px\);[\s\S]*?height:\s*clamp\(68px,\s*18vw,\s*82px\);[\s\S]*?transform:\s*none;/,
  );
  assert.match(
    css,
    /\.mobile-steering-thumb\s*\{[\s\S]*?transform:\s*rotate\(var\(--steering-angle\)\);/,
  );
  assert.match(
    css,
    /\.mobile-steering-joystick\[data-active\]\s*\{[\s\S]*?transform:\s*none;/,
  );
  assert.match(
    css,
    /\.mobile-steering-joystick\[data-active\] \.mobile-steering-axis\s*\{[\s\S]*?scale\(1\.055\)/,
  );
});

test("minimum portrait controls fit inside the 320px product floor", async () => {
  const css = await read("src/mobile-driving-controls-v3.css");
  const steering = css.match(
    /\.mobile-steering-joystick\s*\{[\s\S]*?width:\s*clamp\((\d+)px,/,
  );
  const pedal = css.match(
    /\.mobile-pedal\s*\{[\s\S]*?width:\s*clamp\((\d+)px,/,
  );
  const gap = css.match(/--pedal-gap:\s*(\d+)px/);
  assert.ok(steering && pedal && gap);

  const contentWidth =
    Number(steering[1]) +
    2 * Number(pedal[1]) +
    Number(gap[1]) +
    18;
  const viewportFloor = 320 - 2 * 14;
  assert.ok(
    contentWidth <= viewportFloor,
    `minimum V3 controls require ${contentWidth}px inside ${viewportFloor}px`,
  );
});

test("D/R selector is stateful presentation rather than a momentary reverse pedal", async () => {
  const [css, ui] = await Promise.all([
    read("src/mobile-driving-controls-v3.css"),
    read("src/mobile-driving-v3-ui.ts"),
  ]);

  assert.match(css, /\.mobile-direction-selector\s*\{/);
  assert.match(css, /\[data-direction="D"\] \[data-direction-option="D"\]/);
  assert.match(css, /\[data-direction="R"\] \[data-direction-option="R"\]/);
  assert.match(ui, /setAttribute\("data-direction", direction\)/);
  assert.match(ui, /Tap to switch D\/R/);
});

test("V3 UI integration consumes analog pedal values without changing semantic DOM targets", async () => {
  const [main, ui] = await Promise.all([
    read("src/main.ts"),
    read("src/mobile-driving-v3-ui.ts"),
  ]);

  assert.match(main, /import \{ MobileDrivingV3Ui \} from "\.\/mobile-driving-v3-ui\.js";/);
  assert.match(main, /const mobileDrivingV3Ui = new MobileDrivingV3Ui\(/);
  assert.match(main, /throttle:\s*pointerControlButtons\.FORWARD/);
  assert.match(main, /brake:\s*pointerControlButtons\.BRAKE/);
  assert.match(main, /direction:\s*pointerControlButtons\.REVERSE/);
  assert.match(
    main,
    /function setPointerControlState\([\s\S]*?value\?: number,[\s\S]*?mobileDrivingV3Ui\.setPointerControlState\(control, active, value\);/,
  );
  assert.match(
    main,
    /function setSteeringJoystickState\(value: number, active: boolean\)[\s\S]*?mobileDrivingV3Ui\.setSteeringJoystickState\(value, active\);/,
  );
  assert.match(ui, /--pedal-value/);
  assert.match(ui, /--steering-angle/);
});
