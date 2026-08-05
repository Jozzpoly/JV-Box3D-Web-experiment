import test from "node:test";
import assert from "node:assert/strict";
import {
  loadLocalJsprev2Scan,
} from "../.test-dist/scene/jsprev2-scan.js";

function minimalTile(magic = "JSPREV2\0") {
  const vertexCount = 3;
  const indexCount = 3;
  const buffer = new ArrayBuffer(
    20 + 8 + vertexCount * 32 + indexCount * 4,
  );
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = magic.charCodeAt(index) || 0;
  }
  const view = new DataView(buffer);
  view.setUint32(8, 2, true);
  view.setUint32(12, 7, true);
  view.setUint32(16, 1, true);
  view.setUint32(20, vertexCount, true);
  view.setUint32(24, indexCount, true);

  let offset = 28;
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
  return buffer;
}

function indexResponse() {
  return new Response(
    JSON.stringify({
      available: true,
      packId: "fixture-jsprev2",
      tiles: [
        {
          binaryUrl: "/__jv_scan__/asset/1",
          groups: [{ textureUrl: null }],
        },
      ],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

test("JSPREV2 loader keeps render geometry and collision bound to one pack", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/index.json")) {
      return indexResponse();
    }
    if (url.endsWith("/asset/1")) {
      return new Response(minimalTile(), { status: 200 });
    }
    return new Response(null, { status: 404 });
  };

  try {
    const scan = await loadLocalJsprev2Scan();
    assert.ok(scan !== null);
    assert.equal(scan.source, "JSPREV2");
    assert.equal(scan.packId, "fixture-jsprev2");
    assert.equal(scan.groups.length, 1);
    assert.equal(scan.textureCount, 0);
    assert.equal(scan.triangleCount, 1);
    assert.equal(scan.collision.positions.length, 9);
    assert.deepEqual(scan.origin, { x: 0, y: -2, z: 317 });
    assert.deepEqual(scan.worldBounds, {
      minimum: { x: -1, y: 0, z: 320 },
      maximum: { x: 1, y: 2, z: 322 },
    });
    assert.deepEqual([...scan.collision.indices], [0, 1, 2]);
    assert.deepEqual(
      [...scan.groups[0].uvs],
      [0, 0, 1, 0, 0.5, 1],
    );
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
    await assert.rejects(
      loadLocalJsprev2Scan(),
      /not JSPREV2/,
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("missing private pack keeps the car and E2R map available", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(null, { status: 404 });
  try {
    assert.equal(await loadLocalJsprev2Scan(), null);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
