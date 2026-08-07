import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function freshProductWorldModule(label) {
  const url = new URL("../.test-dist/scene/product-world.js", import.meta.url);
  url.searchParams.set("c0-char", label);
  return import(url.href);
}

test("product-world singleton shares one load promise, one index request and exact published world identity", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return new Response(null, { status: 404 });
  };

  try {
    const {
      loadProductWorld,
      subscribeProductWorld,
    } = await freshProductWorldModule("singleton-lifecycle");

    const first = loadProductWorld();
    const second = loadProductWorld();
    assert.equal(second, first, "concurrent callers must share one in-flight promise");

    const earlyObserved = [];
    const unsubscribeEarly = subscribeProductWorld((world) => {
      earlyObserved.push(world);
    });

    const world = await first;
    assert.deepEqual(earlyObserved, [world]);
    assert.equal(
      requests.filter((url) => url.endsWith("/__jv_scan__/index.json")).length,
      1,
      "one successful map-world lifecycle may request the local scan index at most once",
    );

    const resolved = loadProductWorld();
    assert.equal(resolved, first, "resolved callers must keep the same shared promise");
    assert.equal(await resolved, world, "resolved callers must receive the exact world object");

    let lateObserved = null;
    const unsubscribeLate = subscribeProductWorld((published) => {
      lateObserved = published;
    });
    assert.equal(
      lateObserved,
      world,
      "late subscribers must synchronously receive the exact published world object",
    );

    unsubscribeLate();
    unsubscribeEarly();
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("restart, host and renderer remain wired to the same module-level product-world service", async () => {
  const [main, host, renderer, debugRenderer, productWorld] = await Promise.all([
    readFile(resolve(root, "src/main.ts"), "utf8"),
    readFile(resolve(root, "src/app/f4-vehicle-host.ts"), "utf8"),
    readFile(resolve(root, "src/render/m6-product-renderer.ts"), "utf8"),
    readFile(resolve(root, "src/render/m6-debug-renderer.ts"), "utf8"),
    readFile(resolve(root, "src/scene/product-world.ts"), "utf8"),
  ]);

  assert.match(main, /restartButton\.addEventListener\("click",\s*\(\) => \{\s*void startHost\(\);\s*\}\);/s);
  assert.match(main, /host\?\.dispose\(\);\s*host = null;/s);
  assert.match(main, /const nextHost = await F4VehicleHost\.start\(\{/);
  assert.doesNotMatch(main, /loadProductWorld|loadWorld/);

  assert.match(host, /loadWorld: \(\) => loadProductWorld\(\)/);
  assert.match(host, /readonly #worldData: JvWorldData;/);
  assert.match(host, /this\.#worldData = worldData;/);

  assert.match(renderer, /subscribeProductWorld/);
  assert.match(renderer, /this\.setWorld\(world\);/);
  assert.match(debugRenderer, /M6ProductRenderer as M6DebugRenderer/);

  assert.match(productWorld, /let sharedWorldPromise: Promise<JvWorldData> \| null = null;/);
  assert.match(productWorld, /let currentWorld: JvWorldData \| null = null;/);
  assert.doesNotMatch(productWorld, /export\s+(?:function|const|let|var)\s+reset/i);
});
