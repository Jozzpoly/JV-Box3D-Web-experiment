import test from "node:test";
import assert from "node:assert/strict";
import {
  selectOwnerM6RealBindingNodesV1,
} from "../.test-dist/render/owner-m6-visual-renderer.js";

const REAL = [
  "m6.chassis",
  "m6.fl.wheel",
  "m6.fr.wheel",
  "m6.rl.wheel",
  "m6.rr.wheel",
];

function resource({ omit = null, childOn = null } = {}) {
  const bindings = [];
  const nodes = [];
  const nodeIndexByName = new Map();
  const rootNodeIndices = [];
  const sources = [
    ...REAL.filter((id) => id !== omit),
    "m6.rack",
    "m6.fl.knuckle",
    "m6.fr.knuckle",
  ];
  for (const partId of sources) {
    const nodeName = `node:${partId}`;
    const nodeIndex = nodes.length;
    nodes.push({
      name: nodeName,
      meshIndex: 0,
      children: partId === childOn ? [99] : [],
    });
    nodeIndexByName.set(nodeName, nodeIndex);
    rootNodeIndices.push(nodeIndex);
    bindings.push({
      bindingId: `binding:${partId}`,
      nodeName,
      source: { kind: "PART", partId },
    });
  }
  return {
    runtime: {
      visualPackage: { bindings },
      cpuAsset: { nodes, nodeIndexByName, rootNodeIndices },
    },
  };
}

test("owner renderer selects exactly chassis and four wheel roots", () => {
  const selected = selectOwnerM6RealBindingNodesV1(resource());
  assert.equal(selected.length, 5);
  assert.deepEqual(
    selected.map(({ bindingIndex }) =>
      resource().runtime.visualPackage.bindings[bindingIndex].source.partId
    ),
    REAL,
  );
});

test("missing real channel fails closed instead of silently drawing a partial car", () => {
  assert.throws(
    () => selectOwnerM6RealBindingNodesV1(resource({ omit: "m6.rr.wheel" })),
    /requires 5 real roots; found 4/,
  );
});

test("real owner roots must remain direct renderable roots", () => {
  assert.throws(
    () => selectOwnerM6RealBindingNodesV1(resource({ childOn: "m6.chassis" })),
    /must be a direct renderable root/,
  );
});
