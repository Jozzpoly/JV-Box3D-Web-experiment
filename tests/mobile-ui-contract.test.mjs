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

  assert.match(main, /data-debug-toggle aria-expanded="false"/);
  assert.match(main, /data-debug-panel aria-hidden="true"/);
  assert.match(main, /setDebugPanelOpen\(false\)/);
  assert.match(main, /data-debug-toggle/);
});
