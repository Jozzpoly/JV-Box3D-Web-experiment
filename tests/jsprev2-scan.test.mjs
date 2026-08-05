import test from "node:test";
import assert from "node:assert/strict";
import {
  loadLocalJsprev2Scan,
} from "../.test-dist/scene/jsprev2-scan.js";

const GROUP_COUNT = 25;
const VERTEX_COUNT = GROUP_COUNT * 3;
const INDEX_COUNT = GROUP_COUNT * 3;
const TRIANGLE_COUNT = GROUP_COUNT;

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
        binaryUrl: "/__jv_scan__/asset/1",
        binaryBytes,
        vertexCount: VERTEX_COUNT,
        indexCount: INDEX_COUNT,
        triangleCount: TRIANGLE_COUNT,
        groups: Array.from({ length: GROUP_COUNT }, (_, index) => ({
          textureUrl: `/__jv_scan__/asset/${index + 2}`,
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

test("JSPREV2 loader keeps exact render/collision metrics and canonical origin", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
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
