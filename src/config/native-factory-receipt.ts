export const PINNED_NATIVE_FACTORY_SOURCE_COMMIT =
  "a740dec74f4243679c71a17eb59723ee0b42f8bb" as const;
export const PINNED_NATIVE_FACTORY_ARTIFACT_COMMIT =
  "78b0be923c52408495c4c7625f9b10ff7ae58db7" as const;
export const PINNED_NATIVE_FACTORY_ARTIFACT_BLOB =
  "6a5cb337a7d4707946835e83e036365130c52459" as const;

export type NativeFieldType = "float" | "int" | "bool" | "vec3" | "string";
export type EffectiveFieldOwner =
  | "topology"
  | "chassis"
  | "suspension"
  | "steering"
  | "legacy-wheel-backend"
  | "drive"
  | "optional-assist"
  | "visual";

export interface NativeFieldSchemaRow {
  readonly path: string;
  readonly type: NativeFieldType;
  readonly source: string;
}

export interface EffectiveFieldRow extends NativeFieldSchemaRow {
  readonly owner: EffectiveFieldOwner;
  readonly value: unknown;
  readonly status: "SUPPORTED_ACTIVE" | "SUPPORTED_INACTIVE";
}

type JsonRecord = { readonly [key: string]: unknown };

export interface NativeFactorySnapshot {
  readonly source: Readonly<{
    repository: "Jozzpoly/Box3d_FunProject";
    branch: "agent/web-factory-receipt";
    commit: typeof PINNED_NATIVE_FACTORY_SOURCE_COMMIT;
  }>;
  readonly serializedFieldCount: 76;
  readonly config: Readonly<JsonRecord>;
  readonly derived: Readonly<{
    rackTravel: number;
    steeringDeadPointDegrees: number;
    wheelRadius: number;
    wheelWidth: number;
    terrainCategoryBitsHex: "0x2";
    minimumTorusSegments: number;
  }>;
  readonly solver: Readonly<{
    gravity: readonly [0, -10, 0];
    fixedDt: number;
    substeps: 4;
    contactHertz: 30;
    contactDampingRatio: 10;
    contactSpeed: 3;
    enableContinuous: false;
    workerCount: 0;
  }>;
  readonly activeFeatures: Readonly<{
    frontRigType: 1;
    rearRigType: 1;
    wheelEnvelopeMode: 3;
    rackCenteringAssistEnabled: false;
    uprightAssistEnabled: false;
  }>;
  readonly assetResolution: Readonly<{
    metadataSourcePath: string;
    metadataStatus: string;
    trailingArmStatus: string;
    fallbackUsed: false;
  }>;
  readonly effectiveFields: readonly EffectiveFieldRow[];
  readonly canonicalPayloadSha256: string;
  readonly raw: Readonly<JsonRecord>;
}

export interface ReceiptFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}

export type ReceiptFetcher = (url: string) => Promise<ReceiptFetchResponse>;

const TOP_LEVEL_KEYS = [
  "derivedFields",
  "fieldSchema",
  "format",
  "payload",
  "payloadReceipt",
  "runtimeOnlyFields",
  "schemaVersion",
  "serializedFieldCount",
  "source",
] as const;
const PAYLOAD_KEYS = [
  "assetResolution",
  "derived",
  "factoryComposition",
  "factoryConfig",
  "features",
  "fieldSource",
  "format",
  "runtimeOnly",
  "sanitizedConfig",
  "sanitizerChanged",
  "schemaVersion",
  "solverProfile",
] as const;
const EXPECTED_DERIVED_FIELDS = [
  "rackTravel",
  "steeringDeadPointDegrees",
  "wheelRadius",
  "wheelWidth",
  "terrainCategoryBitsHex",
  "minimumTorusSegments",
] as const;
const FIELD_TYPES = new Set<NativeFieldType>(["float", "int", "bool", "vec3", "string"]);
const FORBIDDEN_SCHEMA_FIELDS = new Set([
  "rackTravel",
  "filterGroupIndex",
  "wheelEnvelope.radius",
  "wheelEnvelope.width",
  "wheelEnvelope.terrainCategoryBits",
]);

function reject(message: string): never {
  throw new Error(`Native factory receipt rejected: ${message}`);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function object(value: unknown, label: string): JsonRecord {
  if (!isRecord(value)) reject(`${label} must be an object`);
  return value;
}

function list(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) reject(`${label} must be an array`);
  return value;
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string") reject(`${label} must be a string`);
  return value;
}

function number(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    reject(`${label} must be a finite number`);
  }
  return value;
}

function integer(value: unknown, label: string): number {
  const result = number(value, label);
  if (!Number.isInteger(result)) reject(`${label} must be an integer`);
  return result;
}

function literal<T extends string | number | boolean>(value: unknown, expected: T, label: string): T {
  if (value !== expected) reject(`${label} must equal ${String(expected)}`);
  return expected;
}

function exactKeys(value: JsonRecord, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    reject(`${label} keys differ`);
  }
}

function exactStrings(value: unknown, expected: readonly string[], label: string): void {
  const actual = list(value, label).map((entry, index) => string(entry, `${label}[${index}]`));
  if (actual.length !== expected.length || actual.some((entry, index) => entry !== expected[index])) {
    reject(`${label} differs from the supported contract`);
  }
}

function stableJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) reject("non-finite number cannot be canonicalized");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  reject(`unsupported canonical JSON value: ${typeof value}`);
}

function bytesToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digestHex(algorithm: "SHA-1" | "SHA-256", bytes: Uint8Array): Promise<string> {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return bytesToHex(await crypto.subtle.digest(algorithm, buffer));
}

export async function gitBlobSha1(text: string): Promise<string> {
  const content = new TextEncoder().encode(text);
  const header = new TextEncoder().encode(`blob ${content.byteLength}\0`);
  const bytes = new Uint8Array(header.byteLength + content.byteLength);
  bytes.set(header);
  bytes.set(content, header.byteLength);
  return digestHex("SHA-1", bytes);
}

export async function canonicalSha256(value: unknown): Promise<string> {
  return digestHex("SHA-256", new TextEncoder().encode(stableJson(value)));
}

function leaves(value: unknown, prefix = ""): string[] {
  if (!isRecord(value)) return prefix.length > 0 ? [prefix] : reject("factoryConfig must be an object");
  return Object.keys(value).flatMap((key) => {
    const path = prefix.length > 0 ? `${prefix}.${key}` : key;
    return isRecord(value[key]) ? leaves(value[key], path) : [path];
  });
}

function at(root: JsonRecord, path: string): unknown {
  let current: unknown = root;
  for (const part of path.split(".")) {
    if (!isRecord(current) || !(part in current)) reject(`missing serialized field: ${path}`);
    current = current[part];
  }
  return current;
}

function parseSchema(value: unknown): readonly NativeFieldSchemaRow[] {
  const rows = list(value, "fieldSchema").map((entry, index): NativeFieldSchemaRow => {
    const row = object(entry, `fieldSchema[${index}]`);
    exactKeys(row, ["path", "source", "type"], `fieldSchema[${index}]`);
    const path = string(row["path"], `fieldSchema[${index}].path`);
    const source = string(row["source"], `fieldSchema[${index}].source`);
    const type = string(row["type"], `fieldSchema[${index}].type`) as NativeFieldType;
    if (!FIELD_TYPES.has(type)) reject(`fieldSchema[${index}].type is unsupported`);
    if (!source.startsWith("native-JozzFieldDesc:")) reject(`fieldSchema[${index}] is not native`);
    if (FORBIDDEN_SCHEMA_FIELDS.has(path)) reject(`derived/runtime field leaked into schema: ${path}`);
    return { path, source, type };
  });
  if (rows.length !== 76) reject(`expected 76 serialized fields, received ${rows.length}`);
  if (new Set(rows.map((row) => row.path)).size !== rows.length) reject("schema paths are not unique");
  return rows;
}

function validateTypedValue(value: unknown, type: NativeFieldType, path: string): void {
  if (type === "float") return void number(value, path);
  if (type === "int") return void integer(value, path);
  if (type === "bool") {
    if (typeof value !== "boolean") reject(`${path} must be a boolean`);
    return;
  }
  if (type === "string") return void string(value, path);
  const vector = list(value, path);
  if (vector.length !== 3) reject(`${path} must contain exactly three numbers`);
  vector.forEach((entry, index) => number(entry, `${path}[${index}]`));
}

function owner(path: string): EffectiveFieldOwner {
  if (path === "frontRigType" || path === "rearRigType") return "topology";
  if (path.startsWith("wheelEnvelope.") || path.startsWith("wheel")) return "legacy-wheel-backend";
  if (["rackCenteringHertz", "uprightAssist", "uprightHertz", "uprightDampingRatio"].includes(path)) {
    return "optional-assist";
  }
  if (
    path.startsWith("rack") ||
    path.startsWith("steer") ||
    path.startsWith("maxSteering") ||
    path.startsWith("frontToe") ||
    path.startsWith("rearToe") ||
    path === "ackermannGeometry"
  ) return "steering";
  if (
    path.startsWith("wishbone.") ||
    path.startsWith("trailingArm.") ||
    path.startsWith("suspension") ||
    path.startsWith("rebound") ||
    path.startsWith("compression") ||
    path.startsWith("arb") ||
    ["knuckleMass", "armMass", "restDrop"].includes(path)
  ) return "suspension";
  if (path.startsWith("bodyVisual") || path.startsWith("frontSuspensionVisual")) return "visual";
  if (
    path.startsWith("maxDrive") ||
    path.startsWith("drive") ||
    path.startsWith("brake") ||
    path.startsWith("coast") ||
    path === "allWheelDrive" ||
    path === "aeroDragArea"
  ) return "drive";
  return "chassis";
}

function close(actual: number, expected: number, label: string, tolerance = 1e-9): void {
  if (Math.abs(actual - expected) > tolerance) reject(`${label} differs`);
}

export async function validateNativeFactoryReceipt(value: unknown): Promise<NativeFactorySnapshot> {
  const receipt = object(value, "receipt");
  exactKeys(receipt, TOP_LEVEL_KEYS, "receipt");
  literal(receipt["format"], "jv-web-factory-receipt", "receipt.format");
  literal(receipt["schemaVersion"], 1, "receipt.schemaVersion");
  literal(receipt["serializedFieldCount"], 76, "receipt.serializedFieldCount");
  exactStrings(receipt["derivedFields"], EXPECTED_DERIVED_FIELDS, "derivedFields");
  exactStrings(receipt["runtimeOnlyFields"], ["filterGroupIndex"], "runtimeOnlyFields");

  const source = object(receipt["source"], "source");
  literal(source["repository"], "Jozzpoly/Box3d_FunProject", "source.repository");
  literal(source["branch"], "agent/web-factory-receipt", "source.branch");
  literal(source["commit"], PINNED_NATIVE_FACTORY_SOURCE_COMMIT, "source.commit");
  literal(source["dirty"], false, "source.dirty");
  const sourceFiles = list(source["files"], "source.files");
  if (sourceFiles.length !== 10) reject("source.files must contain 10 entries");
  sourceFiles.forEach((entry, index) => {
    const file = object(entry, `source.files[${index}]`);
    exactKeys(file, ["bytes", "gitBlob", "path", "sha256"], `source.files[${index}]`);
    if (integer(file["bytes"], `source.files[${index}].bytes`) <= 0) reject("source byte count");
    if (!/^[0-9a-f]{40}$/.test(string(file["gitBlob"], "source gitBlob"))) reject("source gitBlob");
    if (!/^[0-9a-f]{64}$/.test(string(file["sha256"], "source sha256"))) reject("source sha256");
    string(file["path"], "source path");
  });

  const schema = parseSchema(receipt["fieldSchema"]);
  const payload = object(receipt["payload"], "payload");
  exactKeys(payload, PAYLOAD_KEYS, "payload");
  literal(payload["format"], "jv-web-factory-payload", "payload.format");
  literal(payload["schemaVersion"], 1, "payload.schemaVersion");
  literal(payload["fieldSource"], "SaveJozzVehicleM6Config/JozzFieldDesc", "payload.fieldSource");
  literal(payload["sanitizerChanged"], false, "payload.sanitizerChanged");

  const config = object(payload["factoryConfig"], "factoryConfig");
  const sanitized = object(payload["sanitizedConfig"], "sanitizedConfig");
  if (stableJson(config) !== stableJson(sanitized)) reject("factoryConfig differs from sanitizedConfig");
  const schemaPaths = schema.map((row) => row.path).sort();
  const leafPaths = leaves(config).sort();
  if (schemaPaths.length !== leafPaths.length || schemaPaths.some((path, index) => path !== leafPaths[index])) {
    reject("factoryConfig leaves do not exactly match fieldSchema");
  }

  const effectiveFields = schema.map((row): EffectiveFieldRow => {
    const valueAtPath = at(config, row.path);
    validateTypedValue(valueAtPath, row.type, row.path);
    const fieldOwner = owner(row.path);
    return {
      ...row,
      owner: fieldOwner,
      value: valueAtPath,
      status: fieldOwner === "optional-assist" ? "SUPPORTED_INACTIVE" : "SUPPORTED_ACTIVE",
    };
  });

  const features = object(payload["features"], "features");
  literal(features["activeFrontRigType"], 1, "features.activeFrontRigType");
  literal(features["activeRearRigType"], 1, "features.activeRearRigType");
  literal(features["activeWheelEnvelopeMode"], 3, "features.activeWheelEnvelopeMode");
  literal(features["rackCenteringAssistEnabled"], false, "features.rackCenteringAssistEnabled");
  literal(features["uprightAssistEnabled"], false, "features.uprightAssistEnabled");
  literal(at(config, "frontRigType"), 1, "factoryConfig.frontRigType");
  literal(at(config, "rearRigType"), 1, "factoryConfig.rearRigType");
  literal(at(config, "wheelEnvelope.mode"), 3, "factoryConfig.wheelEnvelope.mode");
  literal(at(config, "rackCenteringHertz"), 0, "factoryConfig.rackCenteringHertz");
  literal(at(config, "uprightAssist"), false, "factoryConfig.uprightAssist");

  const derived = object(payload["derived"], "derived");
  const rackTravel = number(derived["rackTravel"], "derived.rackTravel");
  const steeringDeadPointDegrees = number(derived["steeringDeadPointDegrees"], "derived.steeringDeadPointDegrees");
  const wheelRadius = number(derived["wheelRadius"], "derived.wheelRadius");
  const wheelWidth = number(derived["wheelWidth"], "derived.wheelWidth");
  const minimumTorusSegments = integer(derived["minimumTorusSegments"], "derived.minimumTorusSegments");
  literal(derived["terrainCategoryBitsHex"], "0x2", "derived.terrainCategoryBitsHex");
  if ([rackTravel, steeringDeadPointDegrees, wheelRadius, wheelWidth].some((entry) => entry <= 0)) {
    reject("derived dimensions must be positive");
  }
  if (number(at(config, "maxSteeringAngleDegrees"), "maxSteeringAngleDegrees") >= steeringDeadPointDegrees) {
    reject("max steering angle reaches native dead point");
  }

  const runtimeOnly = object(payload["runtimeOnly"], "runtimeOnly");
  if (integer(runtimeOnly["filterGroupIndex"], "runtimeOnly.filterGroupIndex") >= 0) {
    reject("runtime filterGroupIndex must be negative");
  }

  const solver = object(payload["solverProfile"], "solverProfile");
  const gravity = list(solver["gravity"], "solver.gravity");
  if (gravity.length !== 3 || gravity[0] !== 0 || gravity[1] !== -10 || gravity[2] !== 0) {
    reject("solver.gravity must equal [0, -10, 0]");
  }
  const fixedDt = number(solver["fixedDt"], "solver.fixedDt");
  close(fixedDt, 1 / 60, "solver.fixedDt", 1e-15);
  literal(solver["substeps"], 4, "solver.substeps");
  literal(solver["contactHertz"], 30, "solver.contactHertz");
  literal(solver["contactDampingRatio"], 10, "solver.contactDampingRatio");
  literal(solver["contactSpeed"], 3, "solver.contactSpeed");
  literal(solver["enableContinuous"], false, "solver.enableContinuous");
  literal(solver["workerCount"], 0, "solver.workerCount");

  const assets = object(payload["assetResolution"], "assetResolution");
  literal(assets["metadataLoadedFromRuntimeReport"], true, "assets.metadataLoadedFromRuntimeReport");
  literal(assets["wheelDimensionsFallbackUsed"], false, "assets.wheelDimensionsFallbackUsed");
  literal(assets["travelHintFallbackUsed"], false, "assets.travelHintFallbackUsed");
  literal(assets["trailingArmContractLoaded"], true, "assets.trailingArmContractLoaded");
  literal(assets["trailingArmFallbackUsed"], false, "assets.trailingArmFallbackUsed");
  close(number(assets["wheelRadius"], "assets.wheelRadius"), wheelRadius, "wheel radius provenance");
  close(number(assets["wheelWidth"], "assets.wheelWidth"), wheelWidth, "wheel width provenance");

  const payloadReceipt = object(receipt["payloadReceipt"], "payloadReceipt");
  const expectedHash = string(payloadReceipt["canonicalSha256"], "payloadReceipt.canonicalSha256");
  if (!/^[0-9a-f]{64}$/.test(expectedHash)) reject("canonical payload hash format");
  const actualHash = await canonicalSha256(payload);
  if (actualHash !== expectedHash) reject(`canonical payload SHA-256 mismatch: ${actualHash}`);

  return {
    source: {
      repository: "Jozzpoly/Box3d_FunProject",
      branch: "agent/web-factory-receipt",
      commit: PINNED_NATIVE_FACTORY_SOURCE_COMMIT,
    },
    serializedFieldCount: 76,
    config,
    derived: {
      rackTravel,
      steeringDeadPointDegrees,
      wheelRadius,
      wheelWidth,
      terrainCategoryBitsHex: "0x2",
      minimumTorusSegments,
    },
    solver: {
      gravity: [0, -10, 0],
      fixedDt,
      substeps: 4,
      contactHertz: 30,
      contactDampingRatio: 10,
      contactSpeed: 3,
      enableContinuous: false,
      workerCount: 0,
    },
    activeFeatures: {
      frontRigType: 1,
      rearRigType: 1,
      wheelEnvelopeMode: 3,
      rackCenteringAssistEnabled: false,
      uprightAssistEnabled: false,
    },
    assetResolution: {
      metadataSourcePath: string(assets["metadataSourcePath"], "assets.metadataSourcePath"),
      metadataStatus: string(assets["metadataStatus"], "assets.metadataStatus"),
      trailingArmStatus: string(assets["trailingArmStatus"], "assets.trailingArmStatus"),
      fallbackUsed: false,
    },
    effectiveFields,
    canonicalPayloadSha256: actualHash,
    raw: receipt,
  };
}

export async function validatePinnedNativeFactoryReceiptText(text: string): Promise<NativeFactorySnapshot> {
  const blobSha = await gitBlobSha1(text);
  if (blobSha !== PINNED_NATIVE_FACTORY_ARTIFACT_BLOB) reject(`receipt Git blob mismatch: ${blobSha}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (error: unknown) {
    throw new Error("Native factory receipt rejected: invalid JSON", { cause: error });
  }
  return validateNativeFactoryReceipt(parsed);
}

export async function loadPinnedNativeFactoryReceipt(
  fetcher: ReceiptFetcher = (url) => fetch(url),
  url = "/receipts/jv_m6_factory_receipt.json",
): Promise<NativeFactorySnapshot> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Native factory receipt request failed with HTTP ${response.status}.`);
  return validatePinnedNativeFactoryReceiptText(await response.text());
}
