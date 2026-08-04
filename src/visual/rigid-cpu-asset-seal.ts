import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";

function immutableReadonlyMap<K, V>(
  source: ReadonlyMap<K, V>,
): ReadonlyMap<K, V> {
  const owned = new Map(source);
  let view: ReadonlyMap<K, V>;
  view = Object.freeze({
    get size(): number {
      return owned.size;
    },
    get(key: K): V | undefined {
      return owned.get(key);
    },
    has(key: K): boolean {
      return owned.has(key);
    },
    entries(): MapIterator<[K, V]> {
      return owned.entries();
    },
    keys(): MapIterator<K> {
      return owned.keys();
    },
    values(): MapIterator<V> {
      return owned.values();
    },
    forEach(
      callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ): void {
      owned.forEach((value, key) => callback.call(thisArg, value, key, view));
    },
    [Symbol.iterator](): MapIterator<[K, V]> {
      return owned[Symbol.iterator]();
    },
  });
  return view;
}

export function sealGlbRigidCpuAssetV1(
  asset: GlbRigidCpuAssetV1,
): GlbRigidCpuAssetV1 {
  return Object.freeze({
    nodes: Object.freeze([...asset.nodes]),
    rootNodeIndices: Object.freeze([...asset.rootNodeIndices]),
    nodeIndexByName: immutableReadonlyMap(asset.nodeIndexByName),
    meshes: Object.freeze([...asset.meshes]),
    materials: Object.freeze([...asset.materials]),
    primitiveCount: asset.primitiveCount,
    triangleCount: asset.triangleCount,
  });
}
