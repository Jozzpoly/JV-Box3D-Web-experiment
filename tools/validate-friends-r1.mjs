import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256File } from "./portable-build-lib.mjs";
import { smokePortableBuildOverHttp } from "./portable-http-smoke-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_DIST = path.resolve(root, "dist");
const PAGES_PREFIX = "/JV-Box3D-Web-Public/";
const SCAN_ROOT = "__jv_scan__/";
const SCAN_INDEX = `${SCAN_ROOT}index.json`;
const SCAN_RECEIPT = "receipts/jv_friends_scan_receipt.json";
const OWNER_VISUAL = "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json";

const REQUIRED = Object.freeze([
  ".nojekyll",
  "index.html",
  "build-manifest.json",
  "THIRD_PARTY_NOTICES.md",
  "receipts/jv_m6_factory_receipt.json",
  "scenes/synthetic-flat-lab.scene.json",
  OWNER_VISUAL,
  "vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
  SCAN_INDEX,
  SCAN_RECEIPT,
]);

const PRODUCT_MARKERS = Object.freeze([
  "M6 Drive",
  "Plac E2R",
  "Offroad",
  "Skan JSPREV2",
  "Debug",
]);

const SCAN = Object.freeze({
  packageId: "scan/photogrammetry-primary",
  previewContentSha256:
    "aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146",
  completeJsonSha256:
    "a0f3bc792f0a273c18fb00117deafdec95959f8f7e9f2a0bb85af34c8c2e29fb",
  completeJsonBytes: 10_590,
  tileCount: 7,
  groupCount: 25,
  textureCount: 25,
  vertexCount: 1_409_687,
  indexCount: 5_327_325,
  triangleCount: 1_775_775,
  binaryBytes: 66_419_624,
  textureBytes: 44_858_270,
});

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameRecord(actual, expected) {
  return (
    isRecord(actual) &&
    isRecord(expected) &&
    actual.path === expected.path &&
    actual.bytes === expected.bytes &&
    actual.sha256 === expected.sha256
  );
}

function safeScanUrl(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.startsWith("/") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return false;
  }
  const segments = value.split("/");
  return segments.every(
    (segment) => segment.length > 0 && segment !== "." && segment !== "..",
  );
}

async function walk(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix.length === 0 ? entry.name : `${prefix}/${entry.name}`;
    const absolute = path.resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...await walk(absolute, relative));
    } else if (entry.isFile()) {
      result.push(relative);
    }
  }
  return result.sort();
}

async function jsonFile(dist, relativePath, errors) {
  try {
    return JSON.parse(await readFile(path.resolve(dist, relativePath), "utf8"));
  } catch (error) {
    errors.push(
      `${relativePath} could not be read as JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

function fileMap(manifest, errors) {
  if (!Array.isArray(manifest?.files)) {
    errors.push("build-manifest.json must contain a files array.");
    return new Map();
  }
  const result = new Map();
  for (const record of manifest.files) {
    if (
      !isRecord(record) ||
      typeof record.path !== "string" ||
      typeof record.bytes !== "number" ||
      typeof record.sha256 !== "string"
    ) {
      errors.push("build-manifest.json contains an invalid file record.");
      continue;
    }
    if (result.has(record.path)) {
      errors.push(`build-manifest.json repeats ${record.path}.`);
      continue;
    }
    result.set(record.path, record);
  }
  return result;
}

function checkPinnedScanReceipt(receipt, errors) {
  if (
    receipt?.schema !== "JV_WEB_FRIENDS_SCAN_RELEASE_V1" ||
    receipt?.schemaVersion !== 1 ||
    receipt?.releaseId !== "friends-r1" ||
    receipt?.publicationClass !== "FRIENDS_PUBLIC_INPUT" ||
    receipt?.sourceMetadataPreserved !== true
  ) {
    errors.push("Friends scan receipt identity is invalid.");
  }

  const source = receipt?.source;
  if (
    source?.packageId !== SCAN.packageId ||
    source?.previewContentSha256 !== SCAN.previewContentSha256 ||
    source?.completeJsonSha256 !== SCAN.completeJsonSha256 ||
    source?.completeJsonBytes !== SCAN.completeJsonBytes
  ) {
    errors.push("Friends scan receipt does not pin the approved source pack.");
  }
  if (
    source?.privacyClass !== "PRIVATE_LOCAL_ONLY" ||
    source?.purpose !== "SOURCE_VISUAL_PREVIEW_ONLY"
  ) {
    errors.push(
      "Friends scan receipt must preserve the historical source privacy/purpose metadata unchanged.",
    );
  }

  const runtime = receipt?.runtime;
  const checks = [
    ["root", runtime?.root, SCAN_ROOT],
    ["tileCount", runtime?.tileCount, SCAN.tileCount],
    ["groupCount", runtime?.groupCount, SCAN.groupCount],
    ["textureCount", runtime?.textureCount, SCAN.textureCount],
    ["vertexCount", runtime?.vertexCount, SCAN.vertexCount],
    ["indexCount", runtime?.indexCount, SCAN.indexCount],
    ["triangleCount", runtime?.triangleCount, SCAN.triangleCount],
    ["binaryBytes", runtime?.binaryBytes, SCAN.binaryBytes],
    ["textureBytes", runtime?.textureBytes, SCAN.textureBytes],
  ];
  for (const [label, actual, expected] of checks) {
    if (actual !== expected) {
      errors.push(`Friends scan receipt runtime ${label} ${String(actual)} != ${expected}.`);
    }
  }
}

function checkIndex(index, receiptFiles, errors) {
  if (
    index?.schema !== "JV_WEB_JSPREV2_INDEX_V2" ||
    index?.available !== true ||
    index?.packId !== SCAN.packageId
  ) {
    errors.push("Friends scan index identity is invalid.");
    return;
  }

  const checks = [
    ["tileCount", index.tileCount, SCAN.tileCount],
    ["groupCount", index.groupCount, SCAN.groupCount],
    ["textureCount", index.textureCount, SCAN.textureCount],
    ["vertexCount", index.vertexCount, SCAN.vertexCount],
    ["indexCount", index.indexCount, SCAN.indexCount],
    ["triangleCount", index.triangleCount, SCAN.triangleCount],
    ["binaryBytes", index.binaryBytes, SCAN.binaryBytes],
    ["textureBytes", index.textureBytes, SCAN.textureBytes],
  ];
  for (const [label, actual, expected] of checks) {
    if (actual !== expected) {
      errors.push(`Friends scan index ${label} ${String(actual)} != ${expected}.`);
    }
  }

  if (!Array.isArray(index.tiles) || index.tiles.length !== SCAN.tileCount) {
    errors.push("Friends scan index tile list is incomplete.");
    return;
  }

  const assetUrls = [];
  for (const [tileIndex, tile] of index.tiles.entries()) {
    assetUrls.push(tile?.binaryUrl);
    if (!Array.isArray(tile?.groups)) {
      errors.push(`Friends scan tile ${tileIndex} has no groups.`);
      continue;
    }
    for (const group of tile.groups) {
      assetUrls.push(group?.textureUrl);
    }
  }

  if (assetUrls.length !== SCAN.tileCount + SCAN.textureCount) {
    errors.push(
      `Friends scan index must reference ${SCAN.tileCount + SCAN.textureCount} runtime assets.`,
    );
  }
  const uniqueUrls = new Set();
  for (const url of assetUrls) {
    if (!safeScanUrl(url)) {
      errors.push(`Friends scan index contains unsafe asset URL: ${String(url)}.`);
      continue;
    }
    if (uniqueUrls.has(url)) {
      errors.push(`Friends scan index repeats asset URL: ${url}.`);
      continue;
    }
    uniqueUrls.add(url);
    const releasePath = `${SCAN_ROOT}${url}`;
    if (!receiptFiles.has(releasePath)) {
      errors.push(`Friends scan index asset is absent from the receipt: ${releasePath}.`);
    }
  }
}

export async function validateFriendsR1Candidate(
  distDirectory = DEFAULT_DIST,
  { httpSmoke = true } = {},
) {
  const dist = path.resolve(distDirectory);
  const errors = [];
  let files;
  try {
    files = await walk(dist);
  } catch (error) {
    return {
      errors: [
        `Friends R1 dist could not be read: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      fileCount: 0,
      pagesSmoke: null,
    };
  }

  const fileSet = new Set(files);
  for (const required of REQUIRED) {
    if (!fileSet.has(required)) {
      errors.push(`Friends R1 is missing required file: ${required}.`);
    }
  }
  for (const relativePath of files) {
    if (relativePath.endsWith(".map")) {
      errors.push(`Friends R1 contains a source map: ${relativePath}.`);
    }
    if (
      relativePath.includes("source-preview-aee5242a20848294") ||
      relativePath.endsWith("/COMPLETE.json") ||
      relativePath === "COMPLETE.json"
    ) {
      errors.push(
        `Friends R1 copied source-pack metadata/path instead of the release-layer payload: ${relativePath}.`,
      );
    }
  }

  const manifest = await jsonFile(dist, "build-manifest.json", errors);
  if (manifest?.publication?.publishedByBuild !== false) {
    errors.push("Friends R1 build must not claim it published itself.");
  }
  if (manifest?.source?.workingTreeClean !== true) {
    errors.push("Friends R1 requires a clean committed source tree.");
  }
  const manifestFiles = fileMap(manifest, errors);

  const receipt = await jsonFile(dist, SCAN_RECEIPT, errors);
  if (receipt !== null) {
    checkPinnedScanReceipt(receipt, errors);
  }

  const receiptFiles = new Map();
  if (!Array.isArray(receipt?.files) || receipt.files.length !== 33) {
    errors.push("Friends scan receipt must record exactly 33 runtime files.");
  } else {
    for (const record of receipt.files) {
      if (
        !isRecord(record) ||
        typeof record.path !== "string" ||
        typeof record.bytes !== "number" ||
        typeof record.sha256 !== "string" ||
        !record.path.startsWith(SCAN_ROOT)
      ) {
        errors.push("Friends scan receipt contains an invalid runtime file record.");
        continue;
      }
      if (receiptFiles.has(record.path)) {
        errors.push(`Friends scan receipt repeats ${record.path}.`);
        continue;
      }
      receiptFiles.set(record.path, record);
      if (!fileSet.has(record.path)) {
        errors.push(`Friends scan receipt records missing payload ${record.path}.`);
      }
      if (!sameRecord(manifestFiles.get(record.path), record)) {
        errors.push(
          `Friends scan receipt and build-manifest disagree for ${record.path}.`,
        );
      }
    }
  }

  if (!receiptFiles.has(SCAN_INDEX)) {
    errors.push("Friends scan receipt does not record __jv_scan__/index.json.");
  }
  const index = await jsonFile(dist, SCAN_INDEX, errors);
  if (index !== null) {
    checkIndex(index, receiptFiles, errors);
  }
  if (receipt?.runtime?.index && !sameRecord(receipt.runtime.index, receiptFiles.get(SCAN_INDEX))) {
    errors.push("Friends scan receipt runtime.index differs from its file table.");
  }

  if (fileSet.has(SCAN_RECEIPT)) {
    const receiptInfo = await stat(path.resolve(dist, SCAN_RECEIPT));
    const receiptRecord = {
      path: SCAN_RECEIPT,
      bytes: receiptInfo.size,
      sha256: await sha256File(path.resolve(dist, SCAN_RECEIPT)),
    };
    if (!sameRecord(manifestFiles.get(SCAN_RECEIPT), receiptRecord)) {
      errors.push("Friends scan receipt itself is not exactly recorded by build-manifest.json.");
    }
  }

  if (fileSet.has(OWNER_VISUAL)) {
    const owner = await jsonFile(dist, OWNER_VISUAL, errors);
    if (
      owner?.id !== "m6-owner-full-rig-r3" ||
      owner?.asset?.sha256 !==
        "1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc" ||
      owner?.asset?.byteLength !== 829936 ||
      !Array.isArray(owner?.bindings) ||
      owner.bindings.filter((binding) =>
        binding?.nodeName?.startsWith("JV_R3_Real_"),
      ).length !== 59
    ) {
      errors.push("Friends R1 owner full-rig identity drifted.");
    } else {
      const glb = path.resolve(path.dirname(path.resolve(dist, OWNER_VISUAL)), owner.asset.url);
      try {
        if ((await stat(glb)).size !== owner.asset.byteLength) {
          errors.push("Friends R1 owner GLB byte length differs from its visual package.");
        }
      } catch {
        errors.push("Friends R1 owner GLB is missing.");
      }
    }
  }

  const clientJavaScript = (
    await Promise.all(
      files
        .filter((relativePath) => relativePath.endsWith(".js"))
        .map((relativePath) => readFile(path.resolve(dist, relativePath), "utf8")),
    )
  ).join("\n");
  for (const marker of PRODUCT_MARKERS) {
    if (!clientJavaScript.includes(marker)) {
      errors.push(`Friends R1 client bundle is missing product marker: ${marker}.`);
    }
  }
  if (
    clientJavaScript.includes('"/__jv_scan__/index.json"') ||
    clientJavaScript.includes("'/__jv_scan__/index.json'")
  ) {
    errors.push("Friends R1 client bundle contains a root-absolute scan index URL.");
  }

  let pagesSmoke = null;
  if (errors.length === 0 && httpSmoke) {
    try {
      const smoke = await smokePortableBuildOverHttp(dist, [PAGES_PREFIX]);
      if (smoke.length !== 1 || smoke[0]?.entryPointVerified !== true) {
        errors.push("Friends R1 failed the exact GitHub Pages project-path smoke.");
      } else {
        pagesSmoke = smoke[0];
      }
    } catch (error) {
      errors.push(
        `Friends R1 project-path HTTP smoke failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return { errors, fileCount: files.length, pagesSmoke };
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = await validateFriendsR1Candidate(DEFAULT_DIST);
  if (result.errors.length > 0) {
    console.error(`Friends R1 validation failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log(
    `Friends R1 candidate passed: ${result.fileCount} static files; exact approved JSPREV2 receipt + owner car present; ${PAGES_PREFIX} HTTP smoke passed.`,
  );
}
