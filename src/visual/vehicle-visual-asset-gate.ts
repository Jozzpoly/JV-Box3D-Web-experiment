import {
  portableDigestHex,
  type SubtleDigestProvider,
} from "../core/portable-digest.js";
import { inspectGlbV2, type GlbInspectionV1 } from "./glb-container.js";
import { assertGlbMaterialPolicyV1 } from "./glb-material-policy-v1.js";
import {
  assertGlbRigidTexturePolicyV1,
  type GlbRigidTexturePolicyReceiptV1,
} from "./glb-rigid-texture-decoder.js";
import {
  assertGlbRuntimePolicyV1,
  type GlbRuntimePolicyReceiptV1,
} from "./glb-runtime-policy-v1.js";
import { assertVehicleVisualBindingPolicyV1 } from "./vehicle-visual-binding-policy.js";
import type { VehicleVisualPackageV1 } from "./vehicle-visual-package.js";

export interface VehicleVisualAssetReceiptV1 {
  readonly packageId: string;
  readonly url: string;
  readonly byteLength: number;
  readonly sha256: string;
  readonly glb: GlbInspectionV1;
  readonly runtimePolicy: GlbRuntimePolicyReceiptV1;
  readonly texturePolicy: GlbRigidTexturePolicyReceiptV1;
  readonly boundNodeCount: number;
}

function reject(message: string): never {
  throw new Error(`Vehicle visual asset rejected: ${message}`);
}

export async function validateVehicleVisualAssetV1(
  visual: VehicleVisualPackageV1,
  bytes: Uint8Array,
  subtle?: SubtleDigestProvider | null,
): Promise<VehicleVisualAssetReceiptV1> {
  assertVehicleVisualBindingPolicyV1(visual);
  if (bytes.byteLength !== visual.asset.byteLength) {
    reject(
      `byteLength ${bytes.byteLength} does not match manifest ${visual.asset.byteLength}`,
    );
  }
  const digest =
    subtle === undefined
      ? await portableDigestHex("SHA-256", bytes)
      : await portableDigestHex("SHA-256", bytes, subtle);
  if (digest !== visual.asset.sha256) {
    reject(`SHA-256 ${digest} does not match the package manifest`);
  }

  const glb = inspectGlbV2(bytes);
  if (
    glb.binaryChunkLength === 0 ||
    glb.meshCount === 0 ||
    glb.primitiveCount === 0
  ) {
    reject("V1 requires a GLB with BIN data and renderable mesh primitives");
  }
  if (glb.trianglePrimitiveCount !== glb.primitiveCount) {
    reject("V1 supports TRIANGLES primitives only");
  }
  if (glb.sparseAccessorCount > 0) {
    reject("sparse accessors are outside the rigid-mesh V1 contract");
  }
  if (glb.duplicateNodeNames.length > 0) {
    reject(`duplicate GLB node names: ${glb.duplicateNodeNames.join(", ")}`);
  }
  if (glb.externalUris.length > 0) {
    reject(`external GLB resources are forbidden: ${glb.externalUris.join(", ")}`);
  }
  if (glb.animationCount > 0) {
    reject("animations are outside the rigid-part V1 contract");
  }
  if (glb.skinCount > 0) {
    reject("skins are outside the rigid-part V1 contract");
  }
  if (glb.morphTargetPrimitiveCount > 0) {
    reject("morph targets are outside the rigid-part V1 contract");
  }
  if (glb.extensionsUsed.length > 0 || glb.extensionsRequired.length > 0) {
    reject(
      `GLB extensions are unsupported in V1: ${[
        ...new Set([...glb.extensionsUsed, ...glb.extensionsRequired]),
      ].join(", ")}`,
    );
  }
  if (glb.nonPositiveScaleNodes.length > 0) {
    reject(
      `GLB nodes contain zero/negative scale: ${glb.nonPositiveScaleNodes.join(", ")}`,
    );
  }

  const boundNodeNames = visual.bindings.map((binding) => binding.nodeName);
  const nodeNames = new Set(glb.nodeNames);
  const missingNodes = boundNodeNames.filter((name) => !nodeNames.has(name));
  if (missingNodes.length > 0) {
    reject(`bound GLB nodes are missing: ${missingNodes.join(", ")}`);
  }

  const runtimePolicy = assertGlbRuntimePolicyV1(bytes, boundNodeNames);
  assertGlbMaterialPolicyV1(bytes);
  const texturePolicy = assertGlbRigidTexturePolicyV1(bytes);
  if (
    texturePolicy.imageCount !== glb.imageCount ||
    texturePolicy.textureCount !== glb.textureCount
  ) {
    reject("texture policy counts differ from the GLB container inspection");
  }

  return Object.freeze({
    packageId: visual.id,
    url: visual.asset.url,
    byteLength: bytes.byteLength,
    sha256: digest,
    glb,
    runtimePolicy,
    texturePolicy,
    boundNodeCount: visual.bindings.length,
  });
}
