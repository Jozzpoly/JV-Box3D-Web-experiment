import test from "node:test";
import assert from "node:assert/strict";
import {
  loadLocalJsprev2Scan,
} from "../.test-dist/scene/jsprev2-scan.js";
import {
  readJvJsprev2LoadingStats,
} from "../.test-dist/scene/jsprev2-loading-stats.js";

const GROUP_COUNT = 25;
const VERTEX_COUNT = GROUP_COUNT * 3;
const INDEX_COUNT = GROUP_COUNT * 3;
const TRIANGLE_COUNT = GROUP_COUNT;

const TEST_BASE_URI = "https://example.test/JV-Box3D-Web-Public/";
globalThis.document = { baseURI: TEST_BASE_URI };

function minimalTile(magic = "JSPREV2\0") {
  const descriptorBytes = GROUP_COUNT * 8;
  const groupPayloadBytes = 3 * 32 + 3 * 4;
  const buffer = new ArrayBuffer(
    20 + descriptorBytes + GROUP_COUNT * groupPayloadBytes,
  );
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = magic.charCodeAt(index) || 0;
  }
  const view = new DataView(buffer);
  view.setUint32(8, 2, true);
  view.setUint32(12, 7, true);
  view.setUint32(16, GROUP_COUNT, true);

  let offset = 20;
  for (let group = 0; group < GROUP_COUNT; group += 1) {
    view.setUint32(offset, 3, true);
    view.setUint32(offset + 4, 3, true);
    offset += 8;
  }
  for (let group = 0; group < GROUP_COUNT; group += 1) {
    const vertices = [
      [-1, 2, 3, 0, 1, 0, 0, 0],
      [1, 2, 3, 0, 1, 0, 1, 0],
      [0, 4, 5, 0, 1, 0, 0.5, 1],
    ];
    for (const vertex of vertices) {
      for (const value of vertex) {
        view.setFloat32(offset, value, true);
        offset += 4;
      }
    }
    for (const index of [0, 1, 2]) {
      view.setUint32(offset, index, true);
      offset += 4;
    }
  }
  return buffer;
}

function indexDocument(overrides = {}) {
  const binaryBytes = minimalTile().byteLength;
  const textureBytes = GROUP_COUNT;
  const manifestBytes = 100;
  return {
    schema: "JV_WEB_JSPREV2_INDEX_V2",
    available: true,
    packId: "fixture-jsprev2",
    tileCount: 1,
    groupCount: GROUP_COUNT,
    textureCount: GROUP_COUNT,
    vertexCount: VERTEX_COUNT,
    indexCount: INDEX_COUNT,
    triangleCount: TRIANGLE_COUNT,
    manifestBytes,
    binaryBytes,
    textureBytes,
    totalBytes: manifestBytes + binaryBytes + textureBytes,
    estimatedCpuGeometryBytes: VERTEX_COUNT * 44 + INDEX_COUNT * 8,
    estimatedGpuGeometryBytes: VERTEX_COUNT * 32 + INDEX_COUNT * 2,
    tiles: [
      {
        tileId: 7,
        binaryUrl: "asset/1",
        binaryBytes,
        vertexCount: VERTEX_COUNT,
        indexCount: INDEX_COUNT,
        triangleCount: TRIANGLE_COUNT,
        groups: Array.from({ length: GROUP_COUNT }, (_, index) => ({
          textureUrl: `asset/${index + 2}`,
          textureBytes: 1,
          vertexCount: 3,
          indexCount: 3,
          triangleCount: 1,
        })),
      },
    ],
    ...overrides,
  };
}

function indexResponse(overrides = {}) {
  return new Response(JSON.stringify(indexDocument(overrides)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test("JSPREV2 loader keeps exact render/collision metrics and resolves assets under the site base", async () => {
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith("/index.json")) {
      return indexResponse();
    }
    if (url.endsWith("/asset/1")) {
      const tile = minimalTile();
      return new Response(tile, {
        status: 200,
        headers: { "Content-Length": String(tile.byteLength) },
      });
    }
    return new Response(new Uint8Array([1]), { status: 200 });
  };

  try {
    const scan = await loadLocalJsprev2Scan();
    assert.ok(scan !== null);
    assert.equal(scan.source, "JSPREV2");
    assert.equal(scan.packId, "fixture-jsprev2");
    assert.equal(scan.groups.length, GROUP_COUNT);
    assert.equal(scan.textureCount, GROUP_COUNT);
    assert.equal(scan.triangleCount, TRIANGLE_COUNT);
    assert.equal(scan.vertexCount, VERTEX_COUNT);
    assert.equal(scan.indexCount, INDEX_COUNT);
    assert.equal(scan.collision.positions.length, VERTEX_COUNT * 3);
    assert.deepEqual(scan.origin, { x: 0, y: -2, z: 317 });
    assert.equal(Object.is(scan.origin.x, -0), false);
    assert.deepEqual([...scan.groups[0].uvs], [0, 0, 1, 0, 0.5, 1]);
    assert.deepEqual(scan.groups[0].bounds, {
      minimum: { x: -1, y: 2, z: 3 },
      maximum: { x: 1, y: 4, z: 5 },
    });
    assert.deepEqual(scan.collision.bounds, scan.groups[0].bounds);
    assert.deepEqual(scan.worldBounds, {
      minimum: { x: -1, y: 0, z: 320 },
      maximum: { x: 1, y: 2, z: 322 },
    });
    assert.equal(
      requests[0],
      `${TEST_BASE_URI}__jv_scan__/index.json`,
    );
    assert.ok(requests.includes(`${TEST_BASE_URI}__jv_scan__/asset/1`));
    assert.equal(
      scan.groups[0].textureUrl,
      `${TEST_BASE_URI}__jv_scan__/asset/2`,
    );
    const loadingStats = readJvJsprev2LoadingStats();
    assert.ok(loadingStats !== null);
    for (const value of [
      loadingStats.indexLoadMs,
      loadingStats.tilePipelineMs,
      loadingStats.tileParseCpuMs,
      loadingStats.collisionMergeMs,
    ]) {
      assert.equal(typeof value, "number");
      assert.ok(Number.isFinite(value) && value >= 0);
    }
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 loader validates decoded body bytes instead of transport Content-Length", async () => {
  const previousFetch = globalThis.fetch;
  const tile = minimalTile();
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/index.json")) {
      return indexResponse();
    }
    if (url.endsWith("/asset/1")) {
      return new Response(tile, {
        status: 200,
        headers: { "Content-Length": "1" },
      });
    }
    return new Response(new Uint8Array([1]), { status: 200 });
  };

  try {
    const scan = await loadLocalJsprev2Scan();
    assert.ok(scan !== null);
    assert.equal(scan.vertexCount, VERTEX_COUNT);
    assert.equal(scan.indexCount, INDEX_COUNT);
    assert.equal(scan.triangleCount, TRIANGLE_COUNT);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 loader rejects a stale JSPREV1-style binary", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    return url.endsWith("/index.json")
      ? indexResponse()
      : new Response(minimalTile("JSPREV1\0"), { status: 200 });
  };
  try {
    await assert.rejects(loadLocalJsprev2Scan(), /not JSPREV2/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 loader rejects index metric drift before publishing the world", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    indexResponse({ triangleCount: TRIANGLE_COUNT + 1 });
  try {
    await assert.rejects(loadLocalJsprev2Scan(), /triangleCount/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("missing private pack keeps the car and E2R map available", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 404 });
  try {
    assert.equal(await loadLocalJsprev2Scan(), null);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 loader rejects per-tile aggregate metric drift", async () => {
  const document = indexDocument();
  document.tiles[0].vertexCount += 1;
  document.vertexCount += 1;
  document.estimatedCpuGeometryBytes += 44;
  document.estimatedGpuGeometryBytes += 32;
  const tile = minimalTile();
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    return url.endsWith("/index.json")
      ? new Response(JSON.stringify(document), { status: 200 })
      : new Response(tile, { status: 200 });
  };
  try {
    await assert.rejects(
      loadLocalJsprev2Scan(),
      /aggregate metrics disagree/,
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 loader rejects asset references outside the site-relative scan root", async () => {
  const previousFetch = globalThis.fetch;
  try {
    for (const binaryUrl of [
      "/__jv_scan__/asset/1",
      "../escape.bin",
      "https://example.invalid/asset.bin",
    ]) {
      const document = indexDocument();
      document.tiles[0].binaryUrl = binaryUrl;
      globalThis.fetch = async () =>
        new Response(JSON.stringify(document), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      await assert.rejects(
        loadLocalJsprev2Scan(),
        /outside the scan asset boundary/,
      );
    }
  } finally {
    globalThis.fetch = previousFetch;
  }
});


function tileFixture(tileId, groupCount) {
  const descriptorBytes = groupCount * 8;
  const groupPayloadBytes = 3 * 32 + 3 * 4;
  const buffer = new ArrayBuffer(
    20 + descriptorBytes + groupCount * groupPayloadBytes,
  );
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = "JSPREV2\0".charCodeAt(index) || 0;
  }
  const view = new DataView(buffer);
  view.setUint32(8, 2, true);
  view.setUint32(12, tileId, true);
  view.setUint32(16, groupCount, true);
  let offset = 20;
  for (let group = 0; group < groupCount; group += 1) {
    view.setUint32(offset, 3, true);
    view.setUint32(offset + 4, 3, true);
    offset += 8;
  }
  for (let group = 0; group < groupCount; group += 1) {
    for (const vertex of [
      [-1, 2, 3, 0, 1, 0, 0, 0],
      [1, 2, 3, 0, 1, 0, 1, 0],
      [0, 4, 5, 0, 1, 0, 0.5, 1],
    ]) {
      for (const value of vertex) {
        view.setFloat32(offset, value, true);
        offset += 4;
      }
    }
    for (const index of [0, 1, 2]) {
      view.setUint32(offset, index, true);
      offset += 4;
    }
  }
  return buffer;
}

function multiTileIndexDocument() {
  const groupCounts = [9, 8, 8];
  const tiles = groupCounts.map((groupCount, tileId) => {
    const binary = tileFixture(tileId, groupCount);
    return {
      tileId,
      binaryUrl: `tile/${tileId}.bin`,
      binaryBytes: binary.byteLength,
      vertexCount: groupCount * 3,
      indexCount: groupCount * 3,
      triangleCount: groupCount,
      groups: Array.from({ length: groupCount }, (_, group) => ({
        textureUrl: `texture/${tileId}-${group}.png`,
        textureBytes: 1,
        vertexCount: 3,
        indexCount: 3,
        triangleCount: 1,
      })),
    };
  });
  const groupCount = groupCounts.reduce((sum, value) => sum + value, 0);
  const vertexCount = groupCount * 3;
  const indexCount = groupCount * 3;
  const manifestBytes = 100;
  const binaryBytes = tiles.reduce((sum, tile) => sum + tile.binaryBytes, 0);
  const textureBytes = groupCount;
  return {
    schema: "JV_WEB_JSPREV2_INDEX_V2",
    available: true,
    packId: "fixture-multi-tile",
    tileCount: tiles.length,
    groupCount,
    textureCount: groupCount,
    vertexCount,
    indexCount,
    triangleCount: groupCount,
    manifestBytes,
    binaryBytes,
    textureBytes,
    totalBytes: manifestBytes + binaryBytes + textureBytes,
    estimatedCpuGeometryBytes: vertexCount * 44 + indexCount * 8,
    estimatedGpuGeometryBytes: vertexCount * 32 + indexCount * 2,
    tiles,
  };
}

async function waitUntil(predicate) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("Timed out waiting for the synthetic fetch state.");
}

test("JSPREV2 loader limits tile fetches to two in flight and preserves index order", async () => {
  const previousFetch = globalThis.fetch;
  const index = multiTileIndexDocument();
  const pending = new Map();
  const requested = [];
  let active = 0;
  let maximumActive = 0;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/index.json")) {
      return new Response(JSON.stringify(index), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tile = index.tiles.find((candidate) =>
      url.endsWith(`/tile/${candidate.tileId}.bin`)
    );
    if (tile === undefined) {
      return new Response(new Uint8Array([1]), { status: 200 });
    }
    requested.push(tile.tileId);
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    return await new Promise((resolve) => {
      pending.set(tile.tileId, () => {
        pending.delete(tile.tileId);
        active -= 1;
        resolve(new Response(tileFixture(tile.tileId, tile.groups.length), {
          status: 200,
        }));
      });
    });
  };

  try {
    const loading = loadLocalJsprev2Scan();
    await waitUntil(() => pending.size === 2);
    assert.deepEqual(requested, [0, 1]);
    assert.equal(maximumActive, 2);

    pending.get(1)();
    await waitUntil(() => pending.has(2));
    assert.deepEqual(requested, [0, 1, 2]);
    assert.equal(active, 2);
    assert.equal(maximumActive, 2);

    pending.get(2)();
    pending.get(0)();
    const scan = await loading;
    assert.ok(scan !== null);
    assert.equal(scan.groups.length, 25);
    assert.ok(scan.groups[0].textureUrl.endsWith("/texture/0-0.png"));
    assert.ok(scan.groups[9].textureUrl.endsWith("/texture/1-0.png"));
    assert.ok(scan.groups[17].textureUrl.endsWith("/texture/2-0.png"));
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 parser rejects non-finite position, normal and UV payloads during the decode pass", async () => {
  const previousFetch = globalThis.fetch;
  const vertexStart = 20 + GROUP_COUNT * 8;
  try {
    for (const byteOffset of [vertexStart, vertexStart + 12, vertexStart + 24]) {
      const tile = minimalTile();
      new DataView(tile).setFloat32(byteOffset, Number.NaN, true);
      globalThis.fetch = async (input) => {
        const url = String(input);
        return url.endsWith("/index.json")
          ? indexResponse()
          : new Response(tile, { status: 200 });
      };
      await assert.rejects(loadLocalJsprev2Scan(), /non-finite value/);
    }
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("JSPREV2 parser rejects an index outside its declared vertex stream", async () => {
  const previousFetch = globalThis.fetch;
  const tile = minimalTile();
  const firstIndexOffset = 20 + GROUP_COUNT * 8 + 3 * 32;
  new DataView(tile).setUint32(firstIndexOffset, 3, true);
  globalThis.fetch = async (input) => {
    const url = String(input);
    return url.endsWith("/index.json")
      ? indexResponse()
      : new Response(tile, { status: 200 });
  };
  try {
    await assert.rejects(loadLocalJsprev2Scan(), /outside its vertex stream/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
