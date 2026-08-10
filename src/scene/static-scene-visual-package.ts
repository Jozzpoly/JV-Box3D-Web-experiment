import {
  requireCleanSiteRelativeUrl,
  requireNonEmptyString,
  requirePositiveInteger,
  requireSha256Hex,
  requireStableIdentifier,
} from "../assets/asset-contract.js";

export const STATIC_SCENE_VISUAL_PACKAGE_SCHEMA_VERSION = 1 as const;

export interface StaticSceneVisualPackageV1 {
  readonly format: "jv-web-static-scene-visual-package";
  readonly schemaVersion: typeof STATIC_SCENE_VISUAL_PACKAGE_SCHEMA_VERSION;
  readonly id: string;
  readonly displayName: string;
  readonly purpose: "SYNTHETIC" | "PHOTOGRAMMETRY_SCAN";
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
  readonly worldFromAsset: Readonly<{
    position: readonly [number, number, number];
    rotation: readonly [number, number, number, number];
  }>;
  readonly originPolicy: Readonly<{
    mode: "SCENE_LOCAL_ORIGIN";
    maxRadiusMeters: number;
  }>;
  readonly budgets: Readonly<{
    maxNodes: number;
    maxTriangles: number;
    maxMaterials: number;
  }>;
}

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`Static scene visual package rejected: ${message}`);
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

function positiveFinite(value: unknown, label: string): number {
  const result = finite(value, label);
  if (!(result > 0)) {
    reject(`${label} must be greater than zero`);
  }
  return result;
}

function tuple(
  value: unknown,
  length: number,
  label: string,
): readonly number[] {
  if (!Array.isArray(value) || value.length !== length) {
    reject(`${label} must contain exactly ${length} values`);
  }
  return Object.freeze(
    value.map((entry, index) => finite(entry, `${label}[${index}]`)),
  );
}

function rotation(value: unknown, label: string): readonly [number, number, number, number] {
  const result = tuple(value, 4, label);
  if (Math.abs(Math.hypot(...result) - 1) > 1e-4) {
    reject(`${label} must be a normalized quaternion`);
  }
  return result as readonly [number, number, number, number];
}

export function validateStaticSceneVisualPackageV1(
  value: unknown,
): StaticSceneVisualPackageV1 {
  const visual = object(value, "visual");
  exactKeys(
    visual,
    [
      "asset",
      "axes",
      "budgets",
      "displayName",
      "format",
      "id",
      "originPolicy",
      "purpose",
      "schemaVersion",
      "units",
      "worldFromAsset",
    ],
    "visual",
  );
  literal(
    visual["format"],
    "jv-web-static-scene-visual-package",
    "visual.format",
  );
  literal(
    visual["schemaVersion"],
    STATIC_SCENE_VISUAL_PACKAGE_SCHEMA_VERSION,
    "visual.schemaVersion",
  );
  const purpose = visual["purpose"];
  if (purpose !== "SYNTHETIC" && purpose !== "PHOTOGRAMMETRY_SCAN") {
    reject("visual.purpose must equal SYNTHETIC or PHOTOGRAMMETRY_SCAN");
  }
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

  const worldFromAsset = object(
    visual["worldFromAsset"],
    "visual.worldFromAsset",
  );
  exactKeys(
    worldFromAsset,
    ["position", "rotation"],
    "visual.worldFromAsset",
  );

  const originPolicy = object(
    visual["originPolicy"],
    "visual.originPolicy",
  );
  exactKeys(
    originPolicy,
    ["maxRadiusMeters", "mode"],
    "visual.originPolicy",
  );
  literal(
    originPolicy["mode"],
    "SCENE_LOCAL_ORIGIN",
    "visual.originPolicy.mode",
  );

  const budgets = object(visual["budgets"], "visual.budgets");
  exactKeys(
    budgets,
    ["maxMaterials", "maxNodes", "maxTriangles"],
    "visual.budgets",
  );

  return Object.freeze({
    format: "jv-web-static-scene-visual-package",
    schemaVersion: STATIC_SCENE_VISUAL_PACKAGE_SCHEMA_VERSION,
    id: requireStableIdentifier(visual["id"], "visual.id"),
    displayName: requireNonEmptyString(
      visual["displayName"],
      "visual.displayName",
    ),
    purpose,
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
    worldFromAsset: Object.freeze({
      position: tuple(
        worldFromAsset["position"],
        3,
        "visual.worldFromAsset.position",
      ) as readonly [number, number, number],
      rotation: rotation(
        worldFromAsset["rotation"],
        "visual.worldFromAsset.rotation",
      ),
    }),
    originPolicy: Object.freeze({
      mode: "SCENE_LOCAL_ORIGIN",
      maxRadiusMeters: positiveFinite(
        originPolicy["maxRadiusMeters"],
        "visual.originPolicy.maxRadiusMeters",
      ),
    }),
    budgets: Object.freeze({
      maxNodes: requirePositiveInteger(
        budgets["maxNodes"],
        "visual.budgets.maxNodes",
      ),
      maxTriangles: requirePositiveInteger(
        budgets["maxTriangles"],
        "visual.budgets.maxTriangles",
      ),
      maxMaterials: requirePositiveInteger(
        budgets["maxMaterials"],
        "visual.budgets.maxMaterials",
      ),
    }),
  });
}

export function assertStaticSceneCpuBudgetV1(
  visual: StaticSceneVisualPackageV1,
  asset: Readonly<{
    nodes: readonly unknown[];
    triangleCount: number;
    materials: readonly unknown[];
  }>,
): void {
  if (asset.nodes.length > visual.budgets.maxNodes) {
    reject(
      `node count ${asset.nodes.length} exceeds ${visual.budgets.maxNodes}`,
    );
  }
  if (asset.triangleCount > visual.budgets.maxTriangles) {
    reject(
      `triangle count ${asset.triangleCount} exceeds ${visual.budgets.maxTriangles}`,
    );
  }
  if (asset.materials.length > visual.budgets.maxMaterials) {
    reject(
      `material count ${asset.materials.length} exceeds ${visual.budgets.maxMaterials}`,
    );
  }
}
