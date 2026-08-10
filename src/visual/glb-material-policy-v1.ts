const GLB_JSON_CHUNK = 0x4e4f534a;
const GLTF_NEAREST = 9728;
const GLTF_CLAMP_TO_EDGE = 33071;

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

function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    reject(`${label} must be an integer >= 0`);
  }
  return value;
}

function optionalName(value: unknown, label: string): void {
  if (
    value !== undefined &&
    (typeof value !== "string" || value.length === 0)
  ) {
    reject(`${label} must be a non-empty string`);
  }
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
  const images = optionalArray(root["images"], "glTF images");
  const samplers = optionalArray(root["samplers"], "glTF samplers");
  const textures = optionalArray(root["textures"], "glTF textures");

  images.forEach((value, index) => {
    const label = `glTF images[${index}]`;
    const image = object(value, label);
    exactKnownKeys(image, ["name", "bufferView", "mimeType"], label);
    optionalName(image["name"], `${label}.name`);
    integer(image["bufferView"], `${label}.bufferView`);
    if (image["mimeType"] !== "image/png") {
      reject(`${label}.mimeType must equal image/png`);
    }
  });

  samplers.forEach((value, index) => {
    const label = `glTF samplers[${index}]`;
    const sampler = object(value, label);
    exactKnownKeys(
      sampler,
      ["name", "magFilter", "minFilter", "wrapS", "wrapT"],
      label,
    );
    optionalName(sampler["name"], `${label}.name`);
    if (
      integer(sampler["magFilter"], `${label}.magFilter`) !== GLTF_NEAREST ||
      integer(sampler["minFilter"], `${label}.minFilter`) !== GLTF_NEAREST
    ) {
      reject(`${label} must use NEAREST filtering`);
    }
    if (
      integer(sampler["wrapS"], `${label}.wrapS`) !== GLTF_CLAMP_TO_EDGE ||
      integer(sampler["wrapT"], `${label}.wrapT`) !== GLTF_CLAMP_TO_EDGE
    ) {
      reject(`${label} must use CLAMP_TO_EDGE wrapping`);
    }
  });

  textures.forEach((value, index) => {
    const label = `glTF textures[${index}]`;
    const texture = object(value, label);
    exactKnownKeys(texture, ["name", "sampler", "source"], label);
    optionalName(texture["name"], `${label}.name`);
    const source = integer(texture["source"], `${label}.source`);
    const sampler = integer(texture["sampler"], `${label}.sampler`);
    if (images[source] === undefined) {
      reject(`${label}.source references missing image ${source}`);
    }
    if (samplers[sampler] === undefined) {
      reject(`${label}.sampler references missing sampler ${sampler}`);
    }
  });

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
      optionalName(material["name"], `${label}.name`);
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
        const cutoff = material["alphaCutoff"] ?? 0.5;
        unitNumber(cutoff, `${label}.alphaCutoff`);
      } else if (material["alphaCutoff"] !== undefined) {
        reject(`${label}.alphaCutoff is only supported for MASK materials`);
      }

      if (material["pbrMetallicRoughness"] === undefined) {
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
      if (
        pbr["metallicFactor"] !== undefined &&
        unitNumber(
          pbr["metallicFactor"],
          `${label}.pbrMetallicRoughness.metallicFactor`,
        ) !== 0
      ) {
        reject(`${label}.pbrMetallicRoughness.metallicFactor must equal 0`);
      }
      if (
        pbr["roughnessFactor"] !== undefined &&
        unitNumber(
          pbr["roughnessFactor"],
          `${label}.pbrMetallicRoughness.roughnessFactor`,
        ) !== 1
      ) {
        reject(`${label}.pbrMetallicRoughness.roughnessFactor must equal 1`);
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
        const textureIndex = integer(
          texture["index"],
          `${label}.pbrMetallicRoughness.baseColorTexture.index`,
        );
        if (textures[textureIndex] === undefined) {
          reject(
            `${label}.pbrMetallicRoughness.baseColorTexture.index references missing texture ${textureIndex}`,
          );
        }
        if (
          texture["texCoord"] !== undefined &&
          integer(
            texture["texCoord"],
            `${label}.pbrMetallicRoughness.baseColorTexture.texCoord`,
          ) !== 0
        ) {
          reject(`${label}.pbrMetallicRoughness.baseColorTexture.texCoord must equal 0`);
        }
      }
    },
  );
}
