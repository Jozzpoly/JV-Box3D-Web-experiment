import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function freshProductWorldModule(label) {
  const url = new URL("../.test-dist/scene/product-world.js", import.meta.url);
  url.searchParams.set("c1", label);
  return import(url.href);
}

test("product-world fails closed until one profile loader is configured", async () => {
  const unconfigured = await freshProductWorldModule("unconfigured");
  await assert.rejects(
    unconfigured.loadProductWorld(),
    /Product world loader is not configured/,
  );

  const configured = await freshProductWorldModule("single-profile");
  const loader = async () => configured.createProductWorld();
  configured.configureProductWorldLoader(loader);
  configured.configureProductWorldLoader(loader);
  assert.throws(
    () => configured.configureProductWorldLoader(async () => configured.createProductWorld()),
    /another profile/,
  );
  assert.equal((await configured.loadProductWorld()).scan, null);
});

test("LOCAL_FULL shares one load promise, one index request and exact published world identity", async () => {
  const previousFetch = globalThis.fetch;
  const previousDocument = globalThis.document;
  globalThis.document = { baseURI: "https://example.test/jv/" };
  const requests = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return new Response(null, { status: 404 });
  };

  try {
    const {
      configureProductWorldLoader,
      loadProductWorld,
      subscribeProductWorld,
    } = await freshProductWorldModule("local-full-lifecycle");
    const { loadLocalFullProductWorld } = await import(
      "../.test-dist/scene/local-full-product-world.js"
    );
    configureProductWorldLoader(loadLocalFullProductWorld);

    const first = loadProductWorld();
    const second = loadProductWorld();
    assert.equal(second, first, "concurrent callers must share one in-flight promise");

    const earlyObserved = [];
    const unsubscribeEarly = subscribeProductWorld((world) => {
      earlyObserved.push(world);
    });

    const world = await first;
    assert.deepEqual(earlyObserved, [world]);
    assert.equal(world.scan, null);
    assert.equal(
      requests.filter((url) => url.endsWith("/__jv_scan__/index.json")).length,
      1,
      "one successful LOCAL_FULL singleton lifecycle may request the local scan index at most once",
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
    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }
});

test("scan dependency is owned only by the LOCAL_FULL provider while host and renderer stay on product-world", async () => {
  const [
    productMain,
    main,
    host,
    renderer,
    debugRenderer,
    productWorld,
    localFullProvider,
  ] = await Promise.all([
    readFile(resolve(root, "src/product-main.ts"), "utf8"),
    readFile(resolve(root, "src/main.ts"), "utf8"),
    readFile(resolve(root, "src/app/f4-vehicle-host.ts"), "utf8"),
    readFile(resolve(root, "src/render/m6-product-renderer.ts"), "utf8"),
    readFile(resolve(root, "src/render/m6-debug-renderer.ts"), "utf8"),
    readFile(resolve(root, "src/scene/product-world.ts"), "utf8"),
    readFile(resolve(root, "src/scene/local-full-product-world.ts"), "utf8"),
  ]);

  assert.doesNotMatch(productWorld, /jsprev2-scan|loadLocalJsprev2Scan/);
  assert.match(productWorld, /configureProductWorldLoader/);
  assert.match(productWorld, /let configuredWorldLoader: ProductWorldLoader \| null = null;/);
  assert.doesNotMatch(productWorld, /export\s+(?:function|const|let|var)\s+reset/i);

  assert.match(localFullProvider, /jsprev2-scan\.js/);
  assert.match(localFullProvider, /loadLocalJsprev2Scan/);
  assert.match(localFullProvider, /createProductWorld\(await loadLocalJsprev2Scan\(\)\)/);

  assert.match(productMain, /function timedProductWorldLoader/);
  assert.match(productMain, /publishJvStartupPerformance/);
  assert.match(
    productMain,
    /configureProductWorldLoader\(\s*timedProductWorldLoader\(\s*spawnTarget === "scan"\s*\? loadLocalFullProductWorld\s*:\s*loadMapOnlyProductWorld,?\s*\),?\s*\);/s,
  );
  assert.match(productMain, /spawnTarget !== "map"/);
  assert.match(productMain, /await import\("\.\/main\.js"\)/);

  assert.match(main, /restartButton\.addEventListener\("click",\s*\(\) => \{\s*void startHost\(\);\s*\}\);/s);
  assert.match(main, /host\?\.dispose\(\);\s*host = null;/s);
  assert.doesNotMatch(main, /loadProductWorld|loadWorld/);

  assert.match(host, /loadWorld: \(\) => loadProductWorld\(\)/);
  assert.doesNotMatch(host, /jsprev2-scan|loadLocalJsprev2Scan/);
  assert.match(renderer, /subscribeProductWorld/);
  assert.match(renderer, /worldGpuSetupMs/);
  assert.doesNotMatch(renderer, /jsprev2-scan|loadLocalJsprev2Scan/);
  assert.match(debugRenderer, /M6ProductRenderer as M6DebugRenderer/);
});
