import {
  requireCleanSiteRelativeUrl,
  requireNonEmptyString,
  requirePositiveInteger,
  requireSha256Hex,
  requireStableIdentifier,
} from "../assets/asset-contract.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../vehicle/m6/m6-visual-contract.js";

export const VEHICLE_VISUAL_PACKAGE_SCHEMA_VERSION = 1 as const;

export type VehicleVisualAxisV1 =
  | "+X"
  | "-X"
  | "+Y"
  | "-Y"
  | "+Z"
  | "-Z";

export interface VehicleVisualLocalTransformV1 {
  readonly position: readonly [number, number, number];
  readonly rotation: readonly [number, number, number, number];
  readonly scale: readonly [number, number, number];
}

export type VehicleVisualBindingSourceV1 =
  | Readonly<{
      kind: "PART";
      partId: string;
    }>
  | Readonly<{
      kind: "SEGMENT_STRETCH";
      segmentId: string;
      axis: VehicleVisualAxisV1;
    }>
  | Readonly<{
      kind: "SEGMENT_ENDPOINT_AIM";
      segmentId: string;
      endpoint: "START" | "END";
      axis: VehicleVisualAxisV1;
    }>;

export interface VehicleVisualBindingV1 {
  readonly bindingId: string;
  readonly nodeName: string;
  readonly source: VehicleVisualBindingSourceV1;
  readonly localFromSource: VehicleVisualLocalTransformV1;
}

export interface VehicleVisualPackageV1 {
  readonly format: "jv-web-vehicle-visual-package";
  readonly schemaVersion: typeof VEHICLE_VISUAL_PACKAGE_SCHEMA_VERSION;
  readonly id: string;
  readonly displayName: string;
  readonly vehicleFamily: "M6";
  readonly rigProfile: "M6_FULL_RIG_V1";
  readonly units: "meter";
  readonly axes: Readonly<{
    forward: "+X";
    up: "+Y";
    right: "+Z";
  }>;
  readonly asset: Readonly<{
    kind: "GLB";
    url: string;
    sha256: string;
    byteLength: number;
  }>;
  readonly bindings: readonly VehicleVisualBindingV1[];
}

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`Vehicle visual package rejected: ${message}`);
}

function object(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    reject(`${label} must be an object`);
  }
  return value as JsonRecord;
}

function exactKeys(
  value: JsonRecord,
  expected: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    reject(`${label} keys differ`);
  }
}

function literal<T extends string | number>(
  value: unknown,
  expected: T,
  label: string,
): T {
  if (value !== expected) {
    reject(`${label} must equal ${String(expected)}`);
  }
  return expected;
}

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    reject(`${label} must be finite`);
  }
  return value;
}

function tuple3(value: unknown, label: string): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) {
    reject(`${label} must contain exactly three numbers`);
  }
  return value.map((entry, index) => finite(entry, `${label}[${index}]`)) as [
    number,
    number,
    number,
  ];
}

function rotation4(
  value: unknown,
  label: string,
): [number, number, number, number] {
  if (!Array.isArray(value) || value.length !== 4) {
    reject(`${label} must contain exactly four numbers`);
  }
  const rotation = value.map((entry, index) =>
    finite(entry, `${label}[${index}]`),
  ) as [number, number, number, number];
  const magnitude = Math.hypot(...rotation);
  if (Math.abs(magnitude - 1) > 1e-4) {
    reject(`${label} must be a normalized quaternion`);
  }
  return rotation;
}

function positiveScale(
  value: unknown,
  label: string,
): [number, number, number] {
  const scale = tuple3(value, label);
  if (scale.some((entry) => !(entry > 0))) {
    reject(`${label} must contain only positive values`);
  }
  return scale;
}

function nodeName(value: unknown, label: string): string {
  const name = requireNonEmptyString(value, label);
  if (name.length > 128 || /[\u0000-\u001f\u007f]/.test(name)) {
    reject(`${label} must be a printable node name up to 128 characters`);
  }
  return name;
}

function visualAxis(value: unknown, label: string): VehicleVisualAxisV1 {
  if (
    value !== "+X" &&
    value !== "-X" &&
    value !== "+Y" &&
    value !== "-Y" &&
    value !== "+Z" &&
    value !== "-Z"
  ) {
    reject(`${label} must be one of +X, -X, +Y, -Y, +Z or -Z`);
  }
  return value;
}

function parseLocalTransform(
  value: unknown,
  label: string,
): VehicleVisualLocalTransformV1 {
  const transform = object(value, label);
  exactKeys(transform, ["position", "rotation", "scale"], label);
  return Object.freeze({
    position: Object.freeze(tuple3(transform["position"], `${label}.position`)),
    rotation: Object.freeze(
      rotation4(transform["rotation"], `${label}.rotation`),
    ),
    scale: Object.freeze(positiveScale(transform["scale"], `${label}.scale`)),
  });
}

function parseSource(
  value: unknown,
  label: string,
): VehicleVisualBindingSourceV1 {
  const source = object(value, label);
  const kind = requireNonEmptyString(source["kind"], `${label}.kind`);
  if (kind === "PART") {
    exactKeys(source, ["kind", "partId"], label);
    return Object.freeze({
      kind,
      partId: requireStableIdentifier(source["partId"], `${label}.partId`),
    });
  }
  if (kind === "SEGMENT_STRETCH") {
    exactKeys(source, ["axis", "kind", "segmentId"], label);
    return Object.freeze({
      kind,
      segmentId: requireStableIdentifier(
        source["segmentId"],
        `${label}.segmentId`,
      ),
      axis: visualAxis(source["axis"], `${label}.axis`),
    });
  }
  if (kind === "SEGMENT_ENDPOINT_AIM") {
    exactKeys(source, ["axis", "endpoint", "kind", "segmentId"], label);
    const endpoint = source["endpoint"];
    if (endpoint !== "START" && endpoint !== "END") {
      reject(`${label}.endpoint must equal START or END`);
    }
    return Object.freeze({
      kind,
      segmentId: requireStableIdentifier(
        source["segmentId"],
        `${label}.segmentId`,
      ),
      endpoint,
      axis: visualAxis(source["axis"], `${label}.axis`),
    });
  }
  reject(`${label}.kind is unsupported: ${kind}`);
}

function parseBinding(value: unknown, index: number): VehicleVisualBindingV1 {
  const label = `bindings[${index}]`;
  const binding = object(value, label);
  exactKeys(
    binding,
    ["bindingId", "localFromSource", "nodeName", "source"],
    label,
  );
  return Object.freeze({
    bindingId: requireStableIdentifier(
      binding["bindingId"],
      `${label}.bindingId`,
    ),
    nodeName: nodeName(binding["nodeName"], `${label}.nodeName`),
    source: parseSource(binding["source"], `${label}.source`),
    localFromSource: parseLocalTransform(
      binding["localFromSource"],
      `${label}.localFromSource`,
    ),
  });
}

function assertUniqueBindings(bindings: readonly VehicleVisualBindingV1[]): void {
  const bindingIds = new Set<string>();
  const nodeNames = new Set<string>();
  for (const binding of bindings) {
    if (bindingIds.has(binding.bindingId)) {
      reject(`duplicate bindingId: ${binding.bindingId}`);
    }
    bindingIds.add(binding.bindingId);
    if (nodeNames.has(binding.nodeName)) {
      reject(`nodeName is bound more than once: ${binding.nodeName}`);
    }
    nodeNames.add(binding.nodeName);
  }
}

export function validateVehicleVisualPackageV1(
  value: unknown,
): VehicleVisualPackageV1 {
  const visual = object(value, "visual");
  exactKeys(
    visual,
    [
      "asset",
      "axes",
      "bindings",
      "displayName",
      "format",
      "id",
      "rigProfile",
      "schemaVersion",
      "units",
      "vehicleFamily",
    ],
    "visual",
  );
  literal(
    visual["format"],
    "jv-web-vehicle-visual-package",
    "visual.format",
  );
  literal(
    visual["schemaVersion"],
    VEHICLE_VISUAL_PACKAGE_SCHEMA_VERSION,
    "visual.schemaVersion",
  );
  literal(visual["vehicleFamily"], "M6", "visual.vehicleFamily");
  literal(visual["rigProfile"], "M6_FULL_RIG_V1", "visual.rigProfile");
  literal(visual["units"], "meter", "visual.units");

  const axes = object(visual["axes"], "visual.axes");
  exactKeys(axes, ["forward", "right", "up"], "visual.axes");
  literal(axes["forward"], "+X", "visual.axes.forward");
  literal(axes["up"], "+Y", "visual.axes.up");
  literal(axes["right"], "+Z", "visual.axes.right");

  const asset = object(visual["asset"], "visual.asset");
  exactKeys(asset, ["byteLength", "kind", "sha256", "url"], "visual.asset");
  literal(asset["kind"], "GLB", "visual.asset.kind");
  const assetUrl = requireCleanSiteRelativeUrl(
    asset["url"],
    "visual.asset.url",
  );
  if (!assetUrl.toLowerCase().endsWith(".glb")) {
    reject("visual.asset.url must reference a .glb file");
  }

  if (!Array.isArray(visual["bindings"]) || visual["bindings"].length === 0) {
    reject("visual.bindings must be a non-empty array");
  }
  const bindings = visual["bindings"].map(parseBinding);
  assertUniqueBindings(bindings);

  const result: VehicleVisualPackageV1 = Object.freeze({
    format: "jv-web-vehicle-visual-package",
    schemaVersion: VEHICLE_VISUAL_PACKAGE_SCHEMA_VERSION,
    id: requireStableIdentifier(visual["id"], "visual.id"),
    displayName: requireNonEmptyString(
      visual["displayName"],
      "visual.displayName",
    ),
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: Object.freeze({ forward: "+X", up: "+Y", right: "+Z" }),
    asset: Object.freeze({
      kind: "GLB",
      url: assetUrl,
      sha256: requireSha256Hex(asset["sha256"], "visual.asset.sha256"),
      byteLength: requirePositiveInteger(
        asset["byteLength"],
        "visual.asset.byteLength",
      ),
    }),
    bindings: Object.freeze(bindings),
  });

  assertM6FullRigVisualPackage(result);
  return result;
}

export function assertM6FullRigVisualPackage(
  visual: VehicleVisualPackageV1,
): void {
  const knownParts = new Set<string>(M6_VISUAL_PART_IDS);
  const knownSegments = new Set<string>(M6_VISUAL_SEGMENT_IDS);
  const coveredParts = new Set<string>();
  const coveredSegments = new Set<string>();

  for (const binding of visual.bindings) {
    if (binding.source.kind === "PART") {
      if (!knownParts.has(binding.source.partId)) {
        reject(`unknown M6 partId: ${binding.source.partId}`);
      }
      coveredParts.add(binding.source.partId);
    } else {
      if (!knownSegments.has(binding.source.segmentId)) {
        reject(`unknown M6 segmentId: ${binding.source.segmentId}`);
      }
      coveredSegments.add(binding.source.segmentId);
    }
  }

  const missingParts = M6_VISUAL_PART_IDS.filter((id) => !coveredParts.has(id));
  const missingSegments = M6_VISUAL_SEGMENT_IDS.filter(
    (id) => !coveredSegments.has(id),
  );
  if (missingParts.length > 0 || missingSegments.length > 0) {
    reject(
      `M6_FULL_RIG_V1 coverage is incomplete; missing parts=[${missingParts.join(", ")}], missing segments=[${missingSegments.join(", ")}].`,
    );
  }
}

export interface VehicleVisualPackageFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

export type VehicleVisualPackageFetcher = (
  url: string,
) => Promise<VehicleVisualPackageFetchResponse>;

export async function loadVehicleVisualPackageV1(
  url: string,
  fetcher: VehicleVisualPackageFetcher = (requestUrl) => fetch(requestUrl),
): Promise<VehicleVisualPackageV1> {
  const cleanUrl = requireCleanSiteRelativeUrl(url, "vehicle visual package URL");
  const response = await fetcher(cleanUrl);
  if (!response.ok) {
    throw new Error(
      `Vehicle visual package request failed with HTTP ${response.status}.`,
    );
  }
  return validateVehicleVisualPackageV1(await response.json());
}
