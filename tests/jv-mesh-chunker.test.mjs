import test from "node:test";
import assert from "node:assert/strict";
import { splitJvIndexedMeshForUint16 } from "../.test-dist/render/jv-mesh-chunker.js";

function meshFixture() {
  return {
    positions: new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      2, 0, 0,
      3, 0, 0,
      2, 1, 0,
    ]),
    normals: new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ]),
    uvs: new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 0,
      1, 0,
      0, 1,
    ]),
    indices: new Uint32Array([0, 1, 2, 3, 4, 5]),
    color: [1, 1, 1, 1],
  };
}

test("large indexed meshes split into deterministic Uint16 triangle chunks", () => {
  const chunks = splitJvIndexedMeshForUint16(meshFixture(), 4);
  assert.equal(chunks.length, 2);
  for (const chunk of chunks) {
    assert.equal(chunk.positions.length, 9);
    assert.equal(chunk.normals.length, 9);
    assert.equal(chunk.uvs.length, 6);
    assert.deepEqual([...chunk.indices], [0, 1, 2]);
    assert.ok([...chunk.indices].every((index) => index < 4));
  }
  assert.deepEqual([...chunks[0].positions], [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
  ]);
  assert.deepEqual([...chunks[1].positions], [
    2, 0, 0,
    3, 0, 0,
    2, 1, 0,
  ]);
});

test("small meshes reuse attribute streams and only narrow their indices", () => {
  const source = meshFixture();
  const chunks = splitJvIndexedMeshForUint16(source, 32);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].positions, source.positions);
  assert.equal(chunks[0].normals, source.normals);
  assert.equal(chunks[0].uvs, source.uvs);
  assert.deepEqual([...chunks[0].indices], [...source.indices]);
});

test("mesh chunking rejects indices outside the vertex stream", () => {
  const source = meshFixture();
  assert.throws(
    () => splitJvIndexedMeshForUint16({
      ...source,
      indices: new Uint32Array([0, 1, 99]),
    }),
    /outside its position stream/,
  );
});
