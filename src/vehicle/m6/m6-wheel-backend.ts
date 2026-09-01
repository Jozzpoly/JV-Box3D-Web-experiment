import type {
  Box3DModule,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import {
  createLegacySplitWheel,
  LEGACY_SPLIT_WHEEL_BACKEND_ID,
  type LegacySplitWheelReceipt,
} from "./legacy-split-wheel-backend.js";
import {
  createMode5Wheel,
  MODE5_WHEEL_BACKEND_ID,
  type Mode5WheelReceipt,
} from "./mode5-wheel-backend.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";

export const LEGACY_M6_WHEEL_SELECTION = "legacy-mode3" as const;
export const MODE5_M6_WHEEL_SELECTION = "mode5-experiment" as const;

export type M6WheelBackendSelection =
  | typeof LEGACY_M6_WHEEL_SELECTION
  | typeof MODE5_M6_WHEEL_SELECTION;

export type M6WheelBackendId =
  | typeof LEGACY_SPLIT_WHEEL_BACKEND_ID
  | typeof MODE5_WHEEL_BACKEND_ID;

export type M6WheelReceipt =
  | LegacySplitWheelReceipt
  | Mode5WheelReceipt;

export function m6WheelBackendId(
  selection: M6WheelBackendSelection,
): M6WheelBackendId {
  return selection === MODE5_M6_WHEEL_SELECTION
    ? MODE5_WHEEL_BACKEND_ID
    : LEGACY_SPLIT_WHEEL_BACKEND_ID;
}

export function createM6Wheel(
  selection: M6WheelBackendSelection,
  b3: Box3DModule,
  worldId: b3WorldId,
  config: M6TopologyConfig,
  position: b3Vec3,
  collisionGroupIndex: number,
): M6WheelReceipt {
  return selection === MODE5_M6_WHEEL_SELECTION
    ? createMode5Wheel(
        b3,
        worldId,
        config,
        position,
        collisionGroupIndex,
      )
    : createLegacySplitWheel(
        b3,
        worldId,
        config,
        position,
        collisionGroupIndex,
      );
}
