const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const PNG_SIGNATURE = Object.freeze([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_IHDR = "IHDR";

const GLTF_NEAREST = 9728;
const GLTF_CLAMP_TO_EDGE = 33071;

export const VEHICLE_VISUAL_TEXTURE_LIMITS_V1 = Object.freeze({
  maxImages: 8,
  maxTextures: 8,
  maxImageDimension: 2048,
  maxCompressedImageBytes: 8 * 1024 * 1024,
  maxDecodedTextureBytes: 32 * 1024 * 1024,
});

type JsonRecord = Record<string, unknown>;

type BufferView = Readonly<{
  byteOffset: number;
  byteLength: number;
}>;

export interface GlbRigidImageV1 {
  readonly name: string | null;
  readonly mimeType: "image/png";
  readonly width: number;
  readonly height: number;
  readonly bytes: Uint8Array;
}

export interface GlbRigidSamplerV1 {
  readonly magFilter: 9728;
  readonly minFilter: 9728;
  readonly wrapS: 33071;
  readonly wrapT: 33071;
}

export interface GlbRigidTextureV1 {
  readonly name: string | null;
  readonly source: number;
  readonly sampler: number;
}

export interface GlbRigidTextureMaterialV1 {
  readonly baseColorTextureIndex: number | null;
  readonly alphaMode: "OPAQUE" | "MASK";
  readonly alphaCutoff: number;
}

export interface GlbRigidTextureAssetV1 {
  readonly images: readonly GlbRigidImageV1[];
  readonly samplers: readonly GlbRigidSamplerV1[];
  readonly textures: readonly GlbRigidTextureV1[];
  readonly materials: readonly GlbRigidTextureMaterialV1[];
  readonly compressedImageBytes: number;
  readonly decodedTextureBytes: number;
}

export interface GlbRigidTexturePolicyReceiptV1 {
  readonly imageCount: number;
  readonly textureCount: number;
  readonly compressedImageBytes: number;
  readonly decodedTextureBytes: number;
}

function reject(message: string): never {
  throw new Error(`Rigid GLB texture V1 rejected: ${message}`);
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

function integer(value: unknown, label: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
    reject(`${label} must be an integer >= ${minimum}`);
  }
  return value;
}

function exactKeys(value: JsonRecord, allowed: readonly string[], label: string): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    reject(`${label} contains unsupported keys: ${unknown.join(", ")}`);
  }
}

function name(value: unknown, label: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== "string" || value.length === 0) {
    reject(`${label} must be a non-empty string`);
  }
  return value;
}

function decodeDocument(bytes: Uint8Array): Readonly<{ root: JsonRecord; binary: Uint8Array }> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 28) {
    reject("GLB is truncated");
  }
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== GLB_JSON_CHUNK) {
    reject("first GLB chunk must be JSON");
  }
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonLength;
  if (jsonEnd + 8 > bytes.byteLength) {
    reject("GLB is missing its BIN chunk");
  }
  const binLength = view.getUint32(jsonEnd, true);
  if (
    view.getUint32(jsonEnd + 4, true) !== GLB_BIN_CHUNK ||
    jsonEnd + 8 + binLength !== bytes.byteLength
  ) {
    reject("GLB must contain exactly one complete BIN chunk after JSON");
  }
  const jsonBytes = bytes.subarray(jsonStart, jsonEnd);
  let end = jsonBytes.byteLength;
  while (end > 0 && (jsonBytes[end - 1] === 0x20 || jsonBytes[end - 1] === 0x00)) {
    end -= 1;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(jsonBytes.subarray(0, end)));
  } catch (error: unknown) {
    throw new Error("Rigid GLB texture V1 rejected: JSON is invalid.", { cause: error });
  }
  return {
    root: object(parsed, "glTF root"),
    binary: bytes.subarray(jsonEnd + 8, jsonEnd + 8 + binLength),
  };
}

function parseBufferViews(root: JsonRecord, binaryBytes: number): readonly BufferView[] {
  return optionalArray(root["bufferViews"], "glTF bufferViews").map((value, index) => {
    const label = `glTF bufferViews[${index}]`;
    const record = object(value, label);
    if (integer(record["buffer"], `${label}.buffer`) !== 0) {
      reject(`${label} must use embedded buffer 0`);
    }
    const byteOffset = record["byteOffset"] === undefined
      ? 0
      : integer(record["byteOffset"], `${label}.byteOffset`);
    const byteLength = integer(record["byteLength"], `${label}.byteLength`, 1);
    if (byteOffset + byteLength > binaryBytes) {
      reject(`${label} exceeds the embedded BIN chunk`);
    }
    return Object.freeze({ byteOffset, byteLength });
  });
}

function parsePngDimensions(bytes: Uint8Array, label: string): Readonly<{ width: number; height: number }> {
  if (bytes.byteLength < 24) {
    reject(`${label} PNG is truncated before IHDR dimensions`);
  }
  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (bytes[index] !== PNG_SIGNATURE[index]) {
      reject(`${label} has an invalid PNG signature`);
    }
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8, false) !== 13) {
    reject(`${label} PNG first chunk must be a 13-byte IHDR`);
  }
  const type = String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!);
  if (type !== PNG_IHDR) {
    reject(`${label} PNG first chunk must be IHDR`);
  }
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  const maximum = VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxImageDimension;
  if (width < 1 || height < 1 || width > maximum || height > maximum) {
    reject(`${label} dimensions ${width}x${height} exceed 1..${maximum}`);
  }
  return { width, height };
}

function parseImages(
  root: JsonRecord,
  views: readonly BufferView[],
  binary: Uint8Array,
): readonly GlbRigidImageV1[] {
  const raw = optionalArray(root["images"], "glTF images");
  if (raw.length > VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxImages) {
    reject(`image count ${raw.length} exceeds ${VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxImages}`);
  }
  return Object.freeze(raw.map((value, index) => {
    const label = `glTF images[${index}]`;
    const record = object(value, label);
    exactKeys(record, ["name", "bufferView", "mimeType"], label);
    if (record["mimeType"] !== "image/png") {
      reject(`${label}.mimeType must be image/png`);
    }
    const viewIndex = integer(record["bufferView"], `${label}.bufferView`);
    const bufferView = views[viewIndex];
    if (bufferView === undefined) {
      reject(`${label}.bufferView references missing view ${viewIndex}`);
    }
    const owned = new Uint8Array(
      binary.subarray(
        bufferView.byteOffset,
        bufferView.byteOffset + bufferView.byteLength,
      ),
    );
    const dimensions = parsePngDimensions(owned, label);
    return Object.freeze({
      name: name(record["name"], `${label}.name`),
      mimeType: "image/png" as const,
      width: dimensions.width,
      height: dimensions.height,
      bytes: owned,
    });
  }));
}

function parseSamplers(root: JsonRecord): readonly GlbRigidSamplerV1[] {
  return Object.freeze(optionalArray(root["samplers"], "glTF samplers").map((value, index) => {
    const label = `glTF samplers[${index}]`;
    const record = object(value, label);
    exactKeys(record, ["name", "magFilter", "minFilter", "wrapS", "wrapT"], label);
    if (record["name"] !== undefined) {
      name(record["name"], `${label}.name`);
    }
    const magFilter = integer(record["magFilter"], `${label}.magFilter`);
    const minFilter = integer(record["minFilter"], `${label}.minFilter`);
    const wrapS = integer(record["wrapS"], `${label}.wrapS`);
    const wrapT = integer(record["wrapT"], `${label}.wrapT`);
    if (magFilter !== GLTF_NEAREST || minFilter !== GLTF_NEAREST) {
      reject(`${label} must use NEAREST minification and magnification`);
    }
    if (wrapS !== GLTF_CLAMP_TO_EDGE || wrapT !== GLTF_CLAMP_TO_EDGE) {
      reject(`${label} must use CLAMP_TO_EDGE on S and T`);
    }
    return Object.freeze({
      magFilter: GLTF_NEAREST,
      minFilter: GLTF_NEAREST,
      wrapS: GLTF_CLAMP_TO_EDGE,
      wrapT: GLTF_CLAMP_TO_EDGE,
    });
  }));
}

function parseTextures(
  root: JsonRecord,
  images: readonly GlbRigidImageV1[],
  samplers: readonly GlbRigidSamplerV1[],
): readonly GlbRigidTextureV1[] {
  const raw = optionalArray(root["textures"], "glTF textures");
  if (raw.length > VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxTextures) {
    reject(`texture count ${raw.length} exceeds ${VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxTextures}`);
  }
  return Object.freeze(raw.map((value, index) => {
    const label = `glTF textures[${index}]`;
    const record = object(value, label);
    exactKeys(record, ["name", "sampler", "source"], label);
    const source = integer(record["source"], `${label}.source`);
    const sampler = integer(record["sampler"], `${label}.sampler`);
    if (images[source] === undefined) {
      reject(`${label}.source references missing image ${source}`);
    }
    if (samplers[sampler] === undefined) {
      reject(`${label}.sampler references missing sampler ${sampler}`);
    }
    return Object.freeze({
      name: name(record["name"], `${label}.name`),
      source,
      sampler,
    });
  }));
}

function parseMaterials(
  root: JsonRecord,
  textures: readonly GlbRigidTextureV1[],
): readonly GlbRigidTextureMaterialV1[] {
  return Object.freeze(optionalArray(root["materials"], "glTF materials").map((value, index) => {
    const label = `glTF materials[${index}]`;
    const material = object(value, label);
    const alphaModeRaw = material["alphaMode"];
    const alphaMode = alphaModeRaw === undefined ? "OPAQUE" : alphaModeRaw;
    if (alphaMode !== "OPAQUE" && alphaMode !== "MASK") {
      reject(`${label}.alphaMode must be OPAQUE or MASK`);
    }
    const alphaCutoff = alphaMode === "MASK" ? 0.05 : 0;
    if (alphaMode === "MASK" && material["alphaCutoff"] !== 0.05) {
      reject(`${label}.alphaCutoff must be exactly 0.05 for MASK`);
    }
    if (alphaMode === "OPAQUE" && material["alphaCutoff"] !== undefined) {
      reject(`${label}.alphaCutoff is only valid for MASK`);
    }

    const pbr = material["pbrMetallicRoughness"] === undefined
      ? null
      : object(material["pbrMetallicRoughness"], `${label}.pbrMetallicRoughness`);
    const rawTexture = pbr?.["baseColorTexture"];
    let baseColorTextureIndex: number | null = null;
    if (rawTexture !== undefined) {
      const textureInfo = object(rawTexture, `${label}.baseColorTexture`);
      exactKeys(textureInfo, ["index", "texCoord"], `${label}.baseColorTexture`);
      const textureIndex = integer(textureInfo["index"], `${label}.baseColorTexture.index`);
      if (textures[textureIndex] === undefined) {
        reject(`${label}.baseColorTexture references missing texture ${textureIndex}`);
      }
      if (textureInfo["texCoord"] !== undefined && textureInfo["texCoord"] !== 0) {
        reject(`${label}.baseColorTexture.texCoord must be 0`);
      }
      baseColorTextureIndex = textureIndex;
    }
    return Object.freeze({ baseColorTextureIndex, alphaMode, alphaCutoff });
  }));
}

function assertPrimitiveTextureBindings(
  root: JsonRecord,
  materials: readonly GlbRigidTextureMaterialV1[],
): void {
  optionalArray(root["meshes"], "glTF meshes").forEach((meshValue, meshIndex) => {
    const mesh = object(meshValue, `glTF meshes[${meshIndex}]`);
    optionalArray(mesh["primitives"], `glTF meshes[${meshIndex}].primitives`).forEach(
      (primitiveValue, primitiveIndex) => {
        const label = `glTF meshes[${meshIndex}].primitives[${primitiveIndex}]`;
        const primitive = object(primitiveValue, label);
        if (primitive["material"] === undefined) {
          return;
        }
        const materialIndex = integer(primitive["material"], `${label}.material`);
        const material = materials[materialIndex];
        if (material === undefined) {
          reject(`${label}.material references missing material ${materialIndex}`);
        }
        if (material.baseColorTextureIndex !== null) {
          const attributes = object(primitive["attributes"], `${label}.attributes`);
          if (attributes["TEXCOORD_0"] === undefined) {
            reject(`${label} uses a baseColorTexture without TEXCOORD_0`);
          }
        }
      },
    );
  });
}

export function decodeGlbRigidTextureAssetV1(bytes: Uint8Array): GlbRigidTextureAssetV1 {
  const { root, binary } = decodeDocument(bytes);
  const views = parseBufferViews(root, binary.byteLength);
  const images = parseImages(root, views, binary);
  const samplers = parseSamplers(root);
  const textures = parseTextures(root, images, samplers);
  const materials = parseMaterials(root, textures);
  assertPrimitiveTextureBindings(root, materials);

  if ((images.length === 0) !== (textures.length === 0)) {
    reject("images and textures must either both be absent or both be present");
  }
  const compressedImageBytes = images.reduce((total, image) => total + image.bytes.byteLength, 0);
  const decodedTextureBytes = textures.reduce((total, texture) => {
    const image = images[texture.source]!;
    return total + image.width * image.height * 4;
  }, 0);
  if (compressedImageBytes > VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxCompressedImageBytes) {
    reject(
      `compressed image bytes ${compressedImageBytes} exceed ${VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxCompressedImageBytes}`,
    );
  }
  if (decodedTextureBytes > VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxDecodedTextureBytes) {
    reject(
      `decoded texture bytes ${decodedTextureBytes} exceed ${VEHICLE_VISUAL_TEXTURE_LIMITS_V1.maxDecodedTextureBytes}`,
    );
  }
  return Object.freeze({
    images,
    samplers,
    textures,
    materials,
    compressedImageBytes,
    decodedTextureBytes,
  });
}

export function assertGlbRigidTexturePolicyV1(
  bytes: Uint8Array,
): GlbRigidTexturePolicyReceiptV1 {
  const asset = decodeGlbRigidTextureAssetV1(bytes);
  return Object.freeze({
    imageCount: asset.images.length,
    textureCount: asset.textures.length,
    compressedImageBytes: asset.compressedImageBytes,
    decodedTextureBytes: asset.decodedTextureBytes,
  });
}
