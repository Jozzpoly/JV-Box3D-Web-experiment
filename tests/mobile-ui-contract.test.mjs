import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

test("mobile UI exposes each semantic vehicle control exactly once", async () => {
  const source = await read("src/main.ts");
  const controls = [
    "STEER_LEFT",
    "STEER_RIGHT",
    "FORWARD",
    "REVERSE",
    "BRAKE",
  ];

  for (const control of controls) {
    const openingButtons = source.match(
      new RegExp(
        `<button\\b[^>]*\\bdata-pointer-control=\\"${control}\\"[^>]*>`,
        "g",
      ),
    );
    assert.equal(
      openingButtons?.length,
      1,
      `${control} must have one DOM target`,
    );
  }
});

test("mobile steering exposes one analog joystick while legacy binary targets stay hidden", async () => {
  const [main, css] = await Promise.all([
    read("src/main.ts"),
    read("src/style.css"),
  ]);

  assert.match(
    main,
    /<div class="mobile-steering-joystick" data-steering-joystick\b/,
  );
  assert.match(
    main,
    /<button hidden aria-hidden="true" tabindex="-1"[^>]*data-pointer-control="STEER_LEFT"/,
  );
  assert.match(
    main,
    /<button hidden aria-hidden="true" tabindex="-1"[^>]*data-pointer-control="STEER_RIGHT"/,
  );
  assert.match(
    main,
    /steeringJoystick,\s*onSteeringJoystickStateChange:\s*setSteeringJoystickState/,
  );
  assert.match(
    css,
    /\.mobile-steering-joystick\s*\{[^}]*touch-action:\s*none;/s,
  );
  assert.match(css, /\.mobile-steering-thumb\s*\{/);
});

test("mobile viewport and controls preserve safe areas and local gesture ownership", async () => {
  const [html, css] = await Promise.all([
    read("index.html"),
    read("src/style.css"),
  ]);

  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable\s*=\s*no/i);
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /env\(safe-area-inset-right\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /\.mobile-control\s*\{[^}]*touch-action:\s*none;/s);
  assert.match(css, /\.scene-panel\s*\{[^}]*height:\s*100svh;/s);
  assert.match(css, /\.mobile-controls\s*\{[^}]*bottom:\s*max\(14px,\s*env\(safe-area-inset-bottom\)\)/s);
});

test("narrow mobile layout fits joystick and drive cluster without overlap", async () => {
  const css = await read("src/style.css");
  const controlSize = css.match(
    /\.mobile-control\s*\{[^}]*width:\s*clamp\((\d+)px,\s*(\d+)vw,\s*(\d+)px\)/s,
  );
  const joystickSize = css.match(
    /\.mobile-steering-joystick\s*\{[^}]*width:\s*clamp\((\d+)px,\s*(\d+)vw,\s*(\d+)px\)/s,
  );
  assert.ok(controlSize, "mobile control width clamp is required");
  assert.ok(joystickSize, "mobile joystick width clamp is required");

  const controlMinimum = Number(controlSize[1]);
  const joystickMinimum = Number(joystickSize[1]);
  const driveClusterGap = 8;
  const interClusterGap = 18;
  const horizontalInsets = 32;
  const requiredWidth =
    joystickMinimum +
    2 * controlMinimum +
    driveClusterGap +
    interClusterGap +
    horizontalInsets;
  assert.ok(
    requiredWidth <= 320,
    `minimum mobile layout requires ${requiredWidth}px, exceeding 320px`,
  );
});

test("Friends UI keeps debug closed, concise, and mobile chrome focused on locations", async () => {
  const [main, css] = await Promise.all([
    read("src/main.ts"),
    read("src/style.css"),
  ]);

  assert.match(main, /data-debug-toggle aria-expanded="false"/);
  assert.match(main, /data-debug-panel aria-hidden="true"/);
  assert.match(main, /setDebugPanelOpen\(false\)/);

  assert.match(css, /\.panel-heading > div,[\s\S]*?\.profile-control,[\s\S]*?\.panel details,[\s\S]*?\.panel \.hint \{ display: none; \}/);
  assert.match(css, /\.primary-metrics > div:nth-child\(1\)/);
  assert.match(css, /\.primary-metrics > div:nth-child\(2\)/);
  assert.match(css, /\.primary-metrics > div:nth-child\(3\)/);
  assert.match(css, /\.primary-metrics > div:nth-child\(5\)/);
  assert.match(
    css,
    /@media \(hover: none\)[\s\S]*?\.product-control-group:not\(:first-child\) \{ display: none; \}/,
  );
});

test("mobile UI avoids live backdrop compositing over the WebGL canvas", async () => {
  const css = await read("src/style.css");

  assert.match(
    css,
    /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 620px\)[\s\S]*?\.brand-lockup,[\s\S]*?\.mobile-control \{[\s\S]*?-webkit-backdrop-filter:\s*none;[\s\S]*?backdrop-filter:\s*none;/,
  );
  assert.match(
    css,
    /\.product-controls,[\s\S]*?\.panel,[\s\S]*?\.mobile-control \{ box-shadow:\s*none; \}/,
  );
  assert.match(css, /\.mobile-steering-joystick \{ box-shadow:\s*none; \}/);
});
