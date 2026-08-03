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
const EXPECTED_RUNTIME_FIELDS = ["filterGroupIndex"] as const;
const FIELD_TYPES = new Set<NativeFieldType>(["float", "int", "bool", "vec3", "string"]);
const FORBIDDEN_SERIALIZED_FIELDS = new Set([
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

function asRecord(value: unknown, label: string): JsonRecord {
  if (!isRecord(value)) {
    reject(`${label} must be an object`);
  }
  return value;
}

function asArray(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    reject(`${label} must be an array`);
  }
  return value;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    reject(`${label} must be a string`);
  }
  return value;
}

function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    reject(`${label} must be a boolean`);
  }
  return value;
}

function asFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    reject(`${label} must be a finite number`);
  }
  return value;
}

function asInteger(value: unknown, label: string): number {
  const number = asFiniteNumber(value, label);
  if (!Number.isInteger(number)) {
    reject(`${label} must be an integer`);
  }
  return number;
}

function asStringArray(value: unknown, label: string): readonly string[] {
  return asArray(value, label).map((entry, index) => asString(entry, `${label}[${index}]`));
}

function exactKeys(value: JsonRecord, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    reject(`${label} keys differ: expected ${wanted.join(", ")}; received ${actual.join(", ")}`);
  }
}

function exactStringList(value: unknown, expected: readonly string[], label: string): void {
  const actual = asStringArray(value, label);
  if (actual.length !== expected.length || actual.some((entry, index) => entry !== expected[index])) {
    reject(`${label} differs from the supported contract`);
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      reject("non-finite number cannot be canonicalized");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  reject(`unsupported canonical JSON value: ${typeof value}`);
}

function deepJsonEqual(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function collectLeafPaths(value: unknown, prefix = ""): string[] {
  if (!isRecord(value)) {
    if (prefix.length === 0) {
      reject("factoryConfig root must be an object");
    }
    return [prefix];
  }
  const paths: string[] = [];
  for (const key of Object.keys(value)) {
    const path = prefix.length === 0 ? key : `${prefix}.${key}`;
    const child = value[key];
    if (isRecord(child)) {
      paths.push(...collectLeafPaths(child, path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

function pathValue(root: JsonRecord, path: string): unknown {
  let current: unknown = root;
  for (const segment of path.split(".")) {
    if (!isRecord(current) || !(segment in current)) {
      reject(`missing serialized field: ${path}`);
    }
    current = current[segment];
  }
  return current;
}

function parseFieldSchema(value: unknown): readonly NativeFieldSchemaRow[] {
  const rows = asArray(value, "fieldSchema").map((entry, index): NativeFieldSchemaRow => {
    const row = asRecord(entry, `fieldSchema[${index}]`);
    exactKeys(row, ["path", "source", "type"], `fieldSchema[${index}]`);
    const path = asString(row["path"], `fieldSchema[${index}].path`);
    const source = asString(row["source"], `fieldSchema[${index}].source`);
    const type = asString(row["type"], `fieldSchema[${index}].type`);
    if (!FIELD_TYPES.has(type as NativeFieldType)) {
      reject(`fieldSchema[${index}].type is unsupported: ${type}`);
    }
    if (!source.startsWith("native-JozzFieldDesc:")) {
      reject(`fieldSchema[${index}].source is not a native descriptor`);
    }
    if (FORBIDDEN_SERIALIZED_FIELDS.has(path)) {
      reject(`derived/runtime-only field leaked into serialized schema: ${path}`);
    }
    return { path, source, type: type as NativeFieldType };
  });
  if (rows.length !== 76) {
    reject(`expected 76 serialized fields, received ${rows.length}`);
  }
  const paths = rows.map((row) => row.path);
  if (new Set(paths).size !== paths.length) {
    reject("serialized field paths are not unique");
  }
  return rows;
}

function validateFieldValue(value: unknown, type: NativeFieldType, path: string): void {
  switch (type) {
    case "float":
      asFiniteNumber(value, path);
      return;
    case "int":
      asInteger(value, path);
      return;
    case "bool":
      asBoolean(value, path);
      return;
    case "string":
      asString(value, path);
      return;
    case "vec3": {
      const vector = asArray(value, path);
      if (vector.length !== 3) {
        reject(`${path} must contain exactly three numbers`);
      }
      vector.forEach((entry, index) => asFiniteNumber(entry, `${path}[${index}]`));
      return;
    }
  }
}

function ownerFor(path: string): EffectiveFieldOwner {
  if (path === "frontRigType" || path === "rearRigType") {
    return "topology";
  }
  if (path.startsWith("wheelEnvelope.") || path.startsWith("wheel")) {
    return "legacy-wheel-backend";
  }
  if (
    path === "rackCenteringHertz" ||
    path === "uprightAssist" ||
    path === "uprightHertz" ||
    path === "uprightDampingRatio"
  ) {
    return "optional-assist";
  }
  if (
    path.startsWith("rack") ||
    path.startsWith("steer") ||
    path.startsWith("maxSteering") ||
    path.startsWith("frontToe") ||
    path.startsWith("rearToe") ||
    path === "ackermannGeometry"
  ) {
    return "steering";
  }
  if (
    path.startsWith("wishbone.") ||
    path.startsWith("trailingArm.") ||
    path.startsWith("suspension") ||
    path.startsWith("rebound") ||
    path.startsWith("compression") ||
    path.startsWith("arb") ||
    path === "knuckleMass" ||
    path === "armMass" ||
    path === "restDrop"
  ) {
    return "suspension";
  }
  if (path.startsWith("bodyVisual") || path.startsWith("frontSuspensionVisual")) {
    return "visual";
  }
  if (
    path.startsWith("maxDrive") ||
    path.startsWith("drive") ||
    path.startsWith("brake") ||
    path.startsWith("coast") ||
    path === "allWheelDrive" ||
    path === "aeroDragArea"
  ) {
    return "drive";
  }
  return "chassis";
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digestHex(algorithm: "SHA-1" | "SHA-256", bytes: Uint8Array): Promise<string> {
  return bytesToHex(await crypto.subtle.digest(algorithm, bytes));
}

export async function gitBlobSha1(text: string): Promise<string> {
  const content = new TextEncoder().encode(text);
  const header = new TextEncoder().encode(`blob ${content.byteLength}\0`);
  const bytes = new Uint8Array(header.byteLength + content.byteLength);
  bytes.set(header, 0);
  bytes.set(content, header.byteLength);
  return digestHex("SHA-1", bytes);
}

export async function canonicalSha256(value: unknown): Promise<string> {
  return digestHex("SHA-256", new TextEncoder().encode(canonicalJson(value)));
}

function requireLiteral<T extends string | number | boolean>(
  value: unknown,
  expected: T,
  label: string,
): T {
  if (value !== expected) {
    reject(`${label} must equal ${String(expected)}`);
  }
  return expected;
}

function requireClose(actual: number, expected: number, label: string, tolerance = 1e-9): void {
  if (Math.abs(actual - expected) > tolerance) {
    reject(`${label} differs: ${actual} vs ${expected}`);
  }
}

export async function validateNativeFactoryReceipt(value: unknown): Promise<NativeFactorySnapshot> {
  const receipt = asRecord(value, "receipt");
  exactKeys(receipt, TOP_LEVEL_KEYS, "receipt");
  requireLiteral(receipt["format"], "jv-web-factory-receipt", "receipt.format");
  requireLiteral(receipt["schemaVersion"], 1, "receipt.schemaVersion");
  requireLiteral(receipt["serializedFieldCount"], 76, "receipt.serializedFieldCount");
  exactStringList(receipt["derivedFields"], EXPECTED_DERIVED_FIELDS, "derivedFields");
  exactStringList(receipt["runtimeOnlyFields"], EXPECTED_RUNTIME_FIELDS, "runtimeOnlyFields");

  const source = asRecord(receipt["source"], "source");
  requireLiteral(source["repository"], "Jozzpoly/Box3d_FunProject", "source.repository");
  requireLiteral(source["branch"], "agent/web-factory-receipt", "source.branch");
  requireLiteral(source["commit"], PINNED_NATIVE_FACTORY_SOURCE_COMMIT, "source.commit");
  requireLiteral(source["dirty"], false, "source.dirty");
  const sourceFiles = asArray(source["files"], "source.files");
  if (sourceFiles.length !== 10) {
    reject(`source.files must contain 10 provenance entries, received ${sourceFiles.length}`);
  }
  sourceFiles.forEach((entry, index) => {
    const file = asRecord(entry, `source.files[${index}]`);
    exactKeys(file, ["bytes", "gitBlob", "path", "sha256"], `source.files[${index}]`);
    if (asInteger(file["bytes"], `source.files[${index}].bytes`) <= 0) {
      reject(`source.files[${index}].bytes must be positive`);
    }
    if (!/^[0-9a-f]{40}$/.test(asString(file["gitBlob"], `source.files[${index}].gitBlob`))) {
      reject(`source.files[${index}].gitBlob must be a SHA-1`);
    }
    if (!/^[0-9a-f]{64}$/.test(asString(file["sha256"], `source.files[${index}].sha256`))) {
      reject(`source.files[${index}].sha256 must be a SHA-256`);
    }
    asString(file["path"], `source.files[${index}].path`);
  });

  const schema = parseFieldSchema(receipt["fieldSchema"]);
  const payload = asRecord(receipt["payload"], "payload");
  exactKeys(payload, PAYLOAD_KEYS, "payload");
  requireLiteral(payload["format"], "jv-web-factory-payload", "payload.format");
  requireLiteral(payload["schemaVersion"], 1, "payload.schemaVersion");
  requireLiteral(
    payload["fieldSource"],
    "SaveJozzVehicleM6Config/JozzFieldDesc",
    "payload.fieldSource",
  );
  requireLiteral(payload["sanitizerChanged"], false, "payload.sanitizerChanged");

  const config = asRecord(payload["factoryConfig"], "payload.factoryConfig");
  const sanitizedConfig = asRecord(payload["sanitizedConfig"], "payload.sanitizedConfig");
  if (!deepJsonEqual(config, sanitizedConfig)) {
    reject("factoryConfig differs from sanitizedConfig");
  }
  const schemaPaths = schema.map((row) => row.path).sort();
  const leafPaths = collectLeafPaths(config).sort();
  if (
    schemaPaths.length !== leafPaths.length ||
    schemaPaths.some((path, index) => path !== leafPaths[index])
  ) {
    reject("factoryConfig leaves do not exactly match fieldSchema");
  }

  const effectiveFields = schema.map((row): EffectiveFieldRow => {
    const fieldValue = pathValue(config, row.path);
    validateFieldValue(fieldValue, row.type, row.path);
    const owner = ownerFor(row.path);
    return {
      ...row,
      owner,
      value: fieldValue,
      status: owner === "optional-assist" ? "SUPPORTED_INACTIVE" : "SUPPORTED_ACTIVE",
    };
  });

  const features = asRecord(payload["features"], "payload.features");
  requireLiteral(features["activeFrontRigType"], 1, "features.activeFrontRigType");
  requireLiteral(features["activeRearRigType"], 1, "features.activeRearRigType");
  requireLiteral(features["activeWheelEnvelopeMode"], 3, "features.activeWheelEnvelopeMode");
  requireLiteral(
    features["rackCenteringAssistEnabled"],
    false,
    "features.rackCenteringAssistEnabled",
  );
  requireLiteral(features["uprightAssistEnabled"], false, "features.uprightAssistEnabled");
  requireLiteral(pathValue(config, "frontRigType"), 1, "factoryConfig.frontRigType");
  requireLiteral(pathValue(config, "rearRigType"), 1, "factoryConfig.rearRigType");
  requireLiteral(pathValue(config, "wheelEnvelope.mode"), 3, "factoryConfig.wheelEnvelope.mode");
  requireLiteral(pathValue(config, "rackCenteringHertz"), 0, "factoryConfig.rackCenteringHertz");
  requireLiteral(pathValue(config, "uprightAssist"), false, "factoryConfig.uprightAssist");

  const derived = asRecord(payload["derived"], "payload.derived");
  const rackTravel = asFiniteNumber(derived["rackTravel"], "derived.rackTravel");
  const steeringDeadPointDegrees = asFiniteNumber(
    derived["steeringDeadPointDegrees"],
    "derived.steeringDeadPointDegrees",
  );
  const wheelRadius = asFiniteNumber(derived["wheelRadius"], "derived.wheelRadius");
  const wheelWidth = asFiniteNumber(derived["wheelWidth"], "derived.wheelWidth");
  const minimumTorusSegments = asInteger(
    derived["minimumTorusSegments"],
    "derived.minimumTorusSegments",
  );
  requireLiteral(derived["terrainCategoryBitsHex"], "0x2", "derived.terrainCategoryBitsHex");
  if (rackTravel <= 0 || wheelRadius <= 0 || wheelWidth <= 0 || steeringDeadPointDegrees <= 0) {
    reject("derived dimensions must be positive");
  }
  if (
    asFiniteNumber(pathValue(config, "maxSteeringAngleDegrees"), "maxSteeringAngleDegrees") >=
    steeringDeadPointDegrees
  ) {
    reject("max steering angle reaches or passes the native dead point");
  }

  const runtimeOnly = asRecord(payload["runtimeOnly"], "payload.runtimeOnly");
  const filterGroupIndex = asInteger(runtimeOnly["filterGroupIndex"], "runtimeOnly.filterGroupIndex");
  if (filterGroupIndex >= 0) {
    reject("runtime filterGroupIndex must be negative");
  }

  const solver = asRecord(payload["solverProfile"], "payload.solverProfile");
  const gravity = asArray(solver["gravity"], "solver.gravity");
  if (gravity.length !== 3 || gravity[0] !== 0 || gravity[1] !== -10 || gravity[2] !== 0) {
    reject("solver.gravity must equal [0, -10, 0]");
  }
  const fixedDt = asFiniteNumber(solver["fixedDt"], "solver.fixedDt");
  requireClose(fixedDt, 1 / 60, "solver.fixedDt", 1e-15);
  requireLiteral(solver["substeps"], 4, "solver.substeps");
  requireLiteral(solver["contactHertz"], 30, "solver.contactHertz");
  requireLiteral(solver["contactDampingRatio"], 10, "solver.contactDampingRatio");
  requireLiteral(solver["contactSpeed"], 3, "solver.contactSpeed");
  requireLiteral(solver["enableContinuous"], false, "solver.enableContinuous");
  requireLiteral(solver["workerCount"], 0, "solver.workerCount");

  const assets = asRecord(payload["assetResolution"], "payload.assetResolution");
  requireLiteral(
    assets["metadataLoadedFromRuntimeReport"],
    true,
    "assets.metadataLoadedFromRuntimeReport",
  );
  requireLiteral(assets["wheelDimensionsFallbackUsed"], false, "assets.wheelDimensionsFallbackUsed");
  requireLiteral(assets["travelHintFallbackUsed"], false, "assets.travelHintFallbackUsed");
  requireLiteral(assets["trailingArmContractLoaded"], true, "assets.trailingArmContractLoaded");
  requireLiteral(assets["trailingArmFallbackUsed"], false, "assets.trailingArmFallbackUsed");
  requireClose(
    asFiniteNumber(assets["wheelRadius"], "assets.wheelRadius"),
    wheelRadius,
    "wheel radius provenance",
  );
  requireClose(
    asFiniteNumber(assets["wheelWidth"], "assets.wheelWidth"),
    wheelWidth,
    "wheel width provenance",
  );

  const payloadReceipt = asRecord(receipt["payloadReceipt"], "payloadReceipt");
  const expectedCanonicalSha = asString(
    payloadReceipt["canonicalSha256"],
    "payloadReceipt.canonicalSha256",
  );
  if (!/^[0-9a-f]{64}$/.test(expectedCanonicalSha)) {
    reject("payloadReceipt.canonicalSha256 must be a SHA-256");
  }
  const actualCanonicalSha = await canonicalSha256(payload);
  if (actualCanonicalSha !== expectedCanonicalSha) {
    reject(`canonical payload SHA-256 mismatch: ${actualCanonicalSha}`);
  }

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
      metadataSourcePath: asString(assets["metadataSourcePath"], "assets.metadataSourcePath"),
      metadataStatus: asString(assets["metadataStatus"], "assets.metadataStatus"),
      trailingArmStatus: asString(assets["trailingArmStatus"], "assets.trailingArmStatus"),
      fallbackUsed: false,
    },
    effectiveFields,
    canonicalPayloadSha256: actualCanonicalSha,
    raw: receipt,
  };
}

export async function validatePinnedNativeFactoryReceiptText(
  text: string,
): Promise<NativeFactorySnapshot> {
  const blobSha = await gitBlobSha1(text);
  if (blobSha !== PINNED_NATIVE_FACTORY_ARTIFACT_BLOB) {
    reject(`receipt Git blob mismatch: ${blobSha}`);
  }
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
  if (!response.ok) {
    throw new Error(`Native factory receipt request failed with HTTP ${response.status}.`);
  }
  return validatePinnedNativeFactoryReceiptText(await response.text());
}
