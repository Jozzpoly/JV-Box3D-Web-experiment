export interface JvVec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface JvQuat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface JvRigidPoseV1 {
  readonly position: JvVec3;
  readonly rotation: JvQuat;
}

/**
 * Canonical neutral vehicle-rig space used by JV consumer-side geometry.
 *
 * World spawn is deliberately outside this contract. A future authored
 * fragment must be placed into this space explicitly before runtime/world
 * placement is considered.
 */
export const JV_RIG_SPACE_V1 = Object.freeze({
  id: "jv-rig-space/v1",
  units: "metres",
  handedness: "right",
  forwardAxis: "+X",
  upAxis: "+Y",
  rightAxis: "+Z",
  root: "neutral-chassis-body-origin",
} as const);

export const JV_WEB_REPOSITORY = "Jozzpoly/JV-Box3D-Web-experiment" as const;
export const JV_M6_FACTORY_RECEIPT_PATH =
  "public/receipts/jv_m6_factory_receipt.json" as const;

export interface JvNeutralBodyV1 {
  readonly id: string;
  readonly neutralPose: JvRigidPoseV1;
}

export interface JvNeutralFrameV1 {
  readonly id: string;
  readonly ownerBody: string;
  readonly localPosition: JvVec3;
  /** Primary relation axis expressed in the owner body's local space. */
  readonly primaryAxisLocal?: JvVec3;
}

interface JvNeutralRelationBaseV1 {
  readonly id: string;
  readonly frameA: string;
  readonly frameB: string;
}

export interface JvNeutralRevoluteV1 extends JvNeutralRelationBaseV1 {
  readonly type: "revolute";
}

export interface JvNeutralSphericalV1 extends JvNeutralRelationBaseV1 {
  readonly type: "spherical";
}

export type JvNeutralRelationV1 =
  | JvNeutralRevoluteV1
  | JvNeutralSphericalV1;

/**
 * Small consumer-side lowering representation, not an authored rig format.
 * JURE remains the authority for generic authored mechanical truth.
 */
export interface JvNeutralMechanismV1 {
  readonly schema: "jv-neutral-mechanism/v1";
  readonly mechanismId: string;
  readonly coordinateSpace: typeof JV_RIG_SPACE_V1;
  readonly bodies: readonly JvNeutralBodyV1[];
  readonly frames: readonly JvNeutralFrameV1[];
  readonly relations: readonly JvNeutralRelationV1[];
}

/**
 * Exact identity of the JV source used to produce a cross-project diagnostic
 * receipt. Branch names are intentionally excluded: a moving branch is not
 * evidence. The config receipt is pinned both by Git blob identity and SHA-256
 * of the canonical blob bytes.
 */
export interface JvNeutralGeometrySourceV1 {
  readonly kind: "legacy-procedural-m6";
  readonly producer: Readonly<{
    repository: typeof JV_WEB_REPOSITORY;
    commit: string;
  }>;
  readonly configReceipt: Readonly<{
    path: typeof JV_M6_FACTORY_RECEIPT_PATH;
    gitBlob: string;
    sha256: string;
  }>;
}

export interface JvNeutralGeometryReceiptV1 {
  readonly format: "jv-neutral-geometry-receipt/v1";
  readonly source: JvNeutralGeometrySourceV1;
  readonly mechanism: JvNeutralMechanismV1;
}

/** Deterministic text form for exact-byte comparison and cross-project probes. */
export function serializeJvNeutralGeometryReceiptV1(
  receipt: JvNeutralGeometryReceiptV1,
): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}
