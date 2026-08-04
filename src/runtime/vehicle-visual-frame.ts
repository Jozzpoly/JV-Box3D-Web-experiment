export const VEHICLE_VISUAL_FRAME_CONTRACT_VERSION = 1 as const;

export interface VehicleVisualVector3V1 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface VehicleVisualRotationV1 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface VehicleVisualTransformV1 {
  readonly position: VehicleVisualVector3V1;
  readonly rotation: VehicleVisualRotationV1;
}

export interface VehicleVisualPartTransformV1 {
  readonly partId: string;
  readonly transform: VehicleVisualTransformV1;
}

export interface VehicleVisualSegmentV1 {
  readonly segmentId: string;
  readonly start: VehicleVisualVector3V1;
  readonly end: VehicleVisualVector3V1;
  readonly lengthMeters: number;
}

export interface VehicleVisualFrameV1 {
  readonly contractVersion: typeof VEHICLE_VISUAL_FRAME_CONTRACT_VERSION;
  readonly generation: number;
  readonly stepIndex: number;
  readonly parts: readonly VehicleVisualPartTransformV1[];
  readonly segments: readonly VehicleVisualSegmentV1[];
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`);
  }
}

function assertIdentifier(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(value)) {
    throw new Error(
      `${label} must be a lowercase stable identifier using '.', '_' or '-' separators.`,
    );
  }
}

function assertVector(
  value: VehicleVisualVector3V1,
  label: string,
): void {
  assertFinite(value.x, `${label}.x`);
  assertFinite(value.y, `${label}.y`);
  assertFinite(value.z, `${label}.z`);
}

function assertRotation(
  value: VehicleVisualRotationV1,
  label: string,
): void {
  assertFinite(value.x, `${label}.x`);
  assertFinite(value.y, `${label}.y`);
  assertFinite(value.z, `${label}.z`);
  assertFinite(value.w, `${label}.w`);
  const magnitude = Math.hypot(value.x, value.y, value.z, value.w);
  if (Math.abs(magnitude - 1) > 1e-4) {
    throw new Error(`${label} must be a normalized quaternion.`);
  }
}

function distance(
  start: VehicleVisualVector3V1,
  end: VehicleVisualVector3V1,
): number {
  return Math.hypot(
    end.x - start.x,
    end.y - start.y,
    end.z - start.z,
  );
}

function immutableReadonlyMap<K, V>(
  entries: Iterable<readonly [K, V]>,
): ReadonlyMap<K, V> {
  const owned = new Map<K, V>(entries);
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
    forEach(
      callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ): void {
      owned.forEach((value, key) => {
        callback.call(thisArg, value, key, view);
      });
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
    [Symbol.iterator](): MapIterator<[K, V]> {
      return owned[Symbol.iterator]();
    },
  });
  return view;
}

export function assertVehicleVisualFrameV1(
  frame: VehicleVisualFrameV1,
): void {
  if (frame.contractVersion !== VEHICLE_VISUAL_FRAME_CONTRACT_VERSION) {
    throw new Error(
      `Unsupported vehicle visual frame contract version: ${frame.contractVersion}`,
    );
  }
  if (!Number.isInteger(frame.generation) || frame.generation < 1) {
    throw new Error("Vehicle visual frame generation must be a positive integer.");
  }
  if (!Number.isInteger(frame.stepIndex) || frame.stepIndex < 0) {
    throw new Error("Vehicle visual frame stepIndex must be a non-negative integer.");
  }

  const partIds = new Set<string>();
  for (const [index, part] of frame.parts.entries()) {
    assertIdentifier(part.partId, `parts[${index}].partId`);
    if (partIds.has(part.partId)) {
      throw new Error(`Duplicate vehicle visual partId: ${part.partId}`);
    }
    partIds.add(part.partId);
    assertVector(part.transform.position, `parts[${index}].transform.position`);
    assertRotation(part.transform.rotation, `parts[${index}].transform.rotation`);
  }

  const segmentIds = new Set<string>();
  for (const [index, segment] of frame.segments.entries()) {
    assertIdentifier(segment.segmentId, `segments[${index}].segmentId`);
    if (segmentIds.has(segment.segmentId)) {
      throw new Error(`Duplicate vehicle visual segmentId: ${segment.segmentId}`);
    }
    segmentIds.add(segment.segmentId);
    assertVector(segment.start, `segments[${index}].start`);
    assertVector(segment.end, `segments[${index}].end`);
    assertFinite(segment.lengthMeters, `segments[${index}].lengthMeters`);
    if (!(segment.lengthMeters > 1e-8)) {
      throw new Error(`${segment.segmentId} must have positive visual length.`);
    }
    const measured = distance(segment.start, segment.end);
    if (Math.abs(measured - segment.lengthMeters) > 1e-5) {
      throw new Error(
        `${segment.segmentId} length does not match its world endpoints.`,
      );
    }
  }
}

export function indexVehicleVisualFrameV1(
  frame: VehicleVisualFrameV1,
): Readonly<{
  parts: ReadonlyMap<string, VehicleVisualPartTransformV1>;
  segments: ReadonlyMap<string, VehicleVisualSegmentV1>;
}> {
  assertVehicleVisualFrameV1(frame);
  return Object.freeze({
    parts: immutableReadonlyMap(
      frame.parts.map((part) => [part.partId, part] as const),
    ),
    segments: immutableReadonlyMap(
      frame.segments.map((segment) => [segment.segmentId, segment] as const),
    ),
  });
}
