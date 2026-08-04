import test from "node:test";
import assert from "node:assert/strict";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";

function sourceAsset() {
  return {
    nodes: [],
    rootNodeIndices: [],
    nodeIndexByName: new Map([["JV_Chassis", 0]]),
    meshes: [],
    materials: [],
    primitiveCount: 0,
    triangleCount: 0,
  };
}

test("sealed CPU index exposes no mutators, including through forEach", () => {
  const source = sourceAsset();
  const sealed = sealGlbRigidCpuAssetV1(source);

  assert.equal("set" in sealed.nodeIndexByName, false);
  assert.equal("delete" in sealed.nodeIndexByName, false);
  assert.equal("clear" in sealed.nodeIndexByName, false);
  assert.equal(Object.isFrozen(sealed), true);
  assert.equal(Object.isFrozen(sealed.nodes), true);

  let callbackMap;
  sealed.nodeIndexByName.forEach((_value, _key, map) => {
    callbackMap = map;
  });
  assert.equal(callbackMap, sealed.nodeIndexByName);
  assert.equal("set" in callbackMap, false);

  source.nodeIndexByName.set("JV_ExternalMutation", 1);
  assert.equal(sealed.nodeIndexByName.has("JV_ExternalMutation"), false);
});
