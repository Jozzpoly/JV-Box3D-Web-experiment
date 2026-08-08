const GLB_JSON_CHUNK = 0x4e4f534a;

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`GLB material policy V1 rejected: ${message}`);
}

function object(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    reject(`${label} must be an object`);
  }
  return value as JsonRecord;
}

function optionalArray(value: unknown, label: string): unknown[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    reject(`${label} must be an array`);
  }
  return value;
}

function exactKnownKeys(
  value: JsonRecord,
  allowed: readonly string[],
  label: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    reject(`${label} contains unsupported keys: ${unknown.join(", ")}`);
  }
}

function unitNumber(value: unknown, label: string): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    reject(`${label} must be a finite number in [0,1]`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    reject(`${label} must be a non-negative integer`);
  }
  return value;
}

function decodeRoot(bytes: Uint8Array): JsonRecord {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== GLB_JSON_CHUNK) {
    reject("first chunk must be JSON");
  }
  const jsonBytes = bytes.subarray(20, 20 + jsonLength);
  let end = jsonBytes.byteLength;
  while (
    end > 0 &&
    (jsonBytes[end - 1] === 0x20 || jsonBytes[end - 1] === 0x00)
  ) {
    end -= 1;
  }
  try {
    return object(
      JSON.parse(new TextDecoder().decode(jsonBytes.subarray(0, end))),
      "glTF root",
    );
  } catch (error: unknown) {
    throw new Error("GLB material policy V1 rejected: JSON is invalid.", {
      cause: error,
    });
  }
}

export function assertGlbMaterialPolicyV1(bytes: Uint8Array): void {
  const root = decodeRoot(bytes);
  optionalArray(root["materials"], "glTF materials").forEach(
    (value, index) => {
      const label = `glTF materials[${index}]`;
      const material = object(value, label);
      exactKnownKeys(
        material,
        [
          "name",
          "pbrMetallicRoughness",
          "doubleSided",
          "alphaMode",
          "alphaCutoff",
        ],
        label,
      );
      if (
        material["name"] !== undefined &&
        (typeof material["name"] !== "string" || material["name"].length === 0)
      ) {
        reject(`${label}.name must be a non-empty string`);
      }
      if (
        material["doubleSided"] !== undefined &&
        typeof material["doubleSided"] !== "boolean"
      ) {
        reject(`${label}.doubleSided must be boolean`);
      }

      const alphaMode = material["alphaMode"] ?? "OPAQUE";
      if (alphaMode !== "OPAQUE" && alphaMode !== "MASK") {
        reject(`${label}.alphaMode must be OPAQUE or MASK`);
      }
      if (alphaMode === "MASK") {
        if (material["alphaCutoff"] !== 0.05) {
          reject(`${label}.alphaCutoff must be exactly 0.05 for MASK`);
        }
      } else if (material["alphaCutoff"] !== undefined) {
        reject(`${label}.alphaCutoff is only supported with MASK`);
      }

      if (material["pbrMetallicRoughness"] === undefined) {
        if (alphaMode === "MASK") {
          reject(`${label}.alphaMode MASK requires pbrMetallicRoughness`);
        }
        return;
      }
      const pbr = object(
        material["pbrMetallicRoughness"],
        `${label}.pbrMetallicRoughness`,
      );
      exactKnownKeys(
        pbr,
        [
          "baseColorFactor",
          "baseColorTexture",
          "metallicFactor",
          "roughnessFactor",
        ],
        `${label}.pbrMetallicRoughness`,
      );
      if (pbr["baseColorFactor"] !== undefined) {
        const factor = optionalArray(
          pbr["baseColorFactor"],
          `${label}.pbrMetallicRoughness.baseColorFactor`,
        );
        if (factor.length !== 4) {
          reject(`${label}.pbrMetallicRoughness.baseColorFactor must contain 4 values`);
        }
        factor.forEach((entry, component) =>
          unitNumber(
            entry,
            `${label}.pbrMetallicRoughness.baseColorFactor[${component}]`,
          ),
        );
      }
      const usesOwnerPixelSubset =
        alphaMode === "MASK" ||
        pbr["baseColorTexture"] !== undefined ||
        pbr["metallicFactor"] !== undefined ||
        pbr["roughnessFactor"] !== undefined;
      if (usesOwnerPixelSubset && pbr["metallicFactor"] !== 0) {
        reject(
          `${label}.pbrMetallicRoughness.metallicFactor must be exactly 0`,
        );
      }
      if (usesOwnerPixelSubset && pbr["roughnessFactor"] !== 1) {
        reject(
          `${label}.pbrMetallicRoughness.roughnessFactor must be exactly 1`,
        );
      }
      if (pbr["baseColorTexture"] !== undefined) {
        const texture = object(
          pbr["baseColorTexture"],
          `${label}.pbrMetallicRoughness.baseColorTexture`,
        );
        exactKnownKeys(
          texture,
          ["index", "texCoord"],
          `${label}.pbrMetallicRoughness.baseColorTexture`,
        );
        nonNegativeInteger(
          texture["index"],
          `${label}.pbrMetallicRoughness.baseColorTexture.index`,
        );
        if (texture["texCoord"] !== undefined && texture["texCoord"] !== 0) {
          reject(`${label}.pbrMetallicRoughness.baseColorTexture.texCoord must be 0`);
        }
      }
    },
  );
}
