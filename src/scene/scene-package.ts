export const DEFAULT_SCENE_PACKAGE_URL =
  "./scenes/synthetic-flat-lab.scene.json" as const;

export interface SceneSpawnV1 {
  readonly position: readonly [number, number, number];
  readonly yawRadians: number;
}

export type SceneRenderSourceV1 =
  | Readonly<{ kind: "NONE" }>
  | Readonly<{
      kind: "GLB";
      url: string;
      sha256: string;
    }>;

export type SceneCollisionSourceV1 =
  | Readonly<{
      kind: "BUILTIN_GROUND_PLANE";
      heightMeters: number;
    }>
  | Readonly<{
      kind: "TRIANGLE_MESH";
      url: string;
      sha256: string;
    }>;

export interface ScenePackageV1 {
  readonly format: "jv-web-scene-package";
  readonly schemaVersion: 1;
  readonly id: string;
  readonly displayName: string;
  readonly units: "meter";
  readonly axes: Readonly<{
    forward: "+X";
    up: "+Y";
    right: "+Z";
  }>;
  readonly spawn: SceneSpawnV1;
  readonly render: SceneRenderSourceV1;
  readonly collision: SceneCollisionSourceV1;
}

export interface ScenePackageFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

export type ScenePackageFetcher = (
  url: string,
) => Promise<ScenePackageFetchResponse>;

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`Scene package rejected: ${message}`);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function object(value: unknown, label: string): JsonRecord {
  if (!isRecord(value)) {
    reject(`${label} must be an object`);
  }
  return value;
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

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    reject(`${label} must be a non-empty string`);
  }
  return value;
}

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    reject(`${label} must be finite`);
  }
  return value;
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

function sha256(value: unknown, label: string): string {
  const hash = string(value, label);
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    reject(`${label} must be a lowercase SHA-256 hex string`);
  }
  return hash;
}

function siteRelativeUrl(value: unknown, label: string): string {
  const url = string(value, label);
  if (
    url.startsWith("/") ||
    url.startsWith("\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  ) {
    reject(`${label} must be site-relative`);
  }
  const segments = url.replaceAll("\\", "/").split("/");
  if (segments.some((segment) => segment === "..")) {
    reject(`${label} cannot escape its scene package`);
  }
  return url;
}

function parseSpawn(value: unknown): SceneSpawnV1 {
  const spawn = object(value, "spawn");
  exactKeys(spawn, ["position", "yawRadians"], "spawn");
  if (!Array.isArray(spawn["position"]) || spawn["position"].length !== 3) {
    reject("spawn.position must contain exactly three numbers");
  }
  const position = spawn["position"].map((entry, index) =>
    finite(entry, `spawn.position[${index}]`),
  ) as [number, number, number];
  return Object.freeze({
    position: Object.freeze(position),
    yawRadians: finite(spawn["yawRadians"], "spawn.yawRadians"),
  });
}

function parseRender(value: unknown): SceneRenderSourceV1 {
  const render = object(value, "render");
  const kind = string(render["kind"], "render.kind");
  if (kind === "NONE") {
    exactKeys(render, ["kind"], "render");
    return Object.freeze({ kind: "NONE" });
  }
  if (kind === "GLB") {
    exactKeys(render, ["kind", "sha256", "url"], "render");
    return Object.freeze({
      kind: "GLB",
      url: siteRelativeUrl(render["url"], "render.url"),
      sha256: sha256(render["sha256"], "render.sha256"),
    });
  }
  reject(`unsupported render.kind: ${kind}`);
}

function parseCollision(value: unknown): SceneCollisionSourceV1 {
  const collision = object(value, "collision");
  const kind = string(collision["kind"], "collision.kind");
  if (kind === "BUILTIN_GROUND_PLANE") {
    exactKeys(
      collision,
      ["heightMeters", "kind"],
      "collision",
    );
    return Object.freeze({
      kind: "BUILTIN_GROUND_PLANE",
      heightMeters: finite(
        collision["heightMeters"],
        "collision.heightMeters",
      ),
    });
  }
  if (kind === "TRIANGLE_MESH") {
    exactKeys(collision, ["kind", "sha256", "url"], "collision");
    return Object.freeze({
      kind: "TRIANGLE_MESH",
      url: siteRelativeUrl(collision["url"], "collision.url"),
      sha256: sha256(collision["sha256"], "collision.sha256"),
    });
  }
  reject(`unsupported collision.kind: ${kind}`);
}

export function validateScenePackageV1(value: unknown): ScenePackageV1 {
  const scene = object(value, "scene");
  exactKeys(
    scene,
    [
      "axes",
      "collision",
      "displayName",
      "format",
      "id",
      "render",
      "schemaVersion",
      "spawn",
      "units",
    ],
    "scene",
  );
  literal(scene["format"], "jv-web-scene-package", "scene.format");
  literal(scene["schemaVersion"], 1, "scene.schemaVersion");
  literal(scene["units"], "meter", "scene.units");

  const axes = object(scene["axes"], "scene.axes");
  exactKeys(axes, ["forward", "right", "up"], "scene.axes");
  literal(axes["forward"], "+X", "scene.axes.forward");
  literal(axes["up"], "+Y", "scene.axes.up");
  literal(axes["right"], "+Z", "scene.axes.right");

  return Object.freeze({
    format: "jv-web-scene-package",
    schemaVersion: 1,
    id: string(scene["id"], "scene.id"),
    displayName: string(scene["displayName"], "scene.displayName"),
    units: "meter",
    axes: Object.freeze({
      forward: "+X",
      up: "+Y",
      right: "+Z",
    }),
    spawn: parseSpawn(scene["spawn"]),
    render: parseRender(scene["render"]),
    collision: parseCollision(scene["collision"]),
  });
}

export async function loadScenePackageV1(
  fetcher: ScenePackageFetcher = (url) => fetch(url),
  url = DEFAULT_SCENE_PACKAGE_URL,
): Promise<ScenePackageV1> {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(
      `Scene package request failed with HTTP ${response.status}.`,
    );
  }
  return validateScenePackageV1(await response.json());
}

export function assertLegacyM6SceneSupport(
  scene: ScenePackageV1,
): void {
  if (scene.render.kind !== "NONE") {
    throw new Error(
      `legacy_ts_m6 does not yet support scene render source ${scene.render.kind}.`,
    );
  }
  if (scene.collision.kind !== "BUILTIN_GROUND_PLANE") {
    throw new Error(
      `legacy_ts_m6 does not yet support collision source ${scene.collision.kind}.`,
    );
  }
  if (Math.abs(scene.collision.heightMeters) > 1e-9) {
    throw new Error(
      "legacy_ts_m6 currently requires the built-in ground plane at y=0.",
    );
  }
}
