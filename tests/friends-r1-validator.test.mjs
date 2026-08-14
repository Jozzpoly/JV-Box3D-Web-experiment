import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildPortableFileRecords,
  sha256File,
} from "../tools/portable-build-lib.mjs";
import { validateFriendsR1Candidate } from "../tools/validate-friends-r1.mjs";

const PREVIEW_SHA =
  "aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146";
const COMPLETE_SHA =
  "a0f3bc792f0a273c18fb00117deafdec95959f8f7e9f2a0bb85af34c8c2e29fb";

async function put(root, relative, bytes = "x") {
  const absolute = path.resolve(root, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return absolute;
}

async function record(root, relative) {
  const absolute = path.resolve(root, relative);
  const info = await stat(absolute);
  return {
    path: relative,
    bytes: info.size,
    sha256: await sha256File(absolute),
  };
}

async function makeCandidate() {
  const dist = await mkdtemp(path.join(os.tmpdir(), "jv-friends-validator-"));
  await put(dist, ".nojekyll", "");
  await put(dist, "index.html", '<script type="module" src="./assets/app.js"></script>');
  await put(
    dist,
    "assets/app.js",
    'console.log("M6 Drive", "Plac E2R", "Offroad", "Skan JSPREV2", "Debug");',
  );
  await put(dist, "THIRD_PARTY_NOTICES.md", "fixture\n");
  await put(dist, "receipts/jv_m6_factory_receipt.json", "{}\n");
  await put(dist, "scenes/synthetic-flat-lab.scene.json", "{}\n");

  const ownerPath = "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json";
  await put(
    dist,
    ownerPath,
    `${JSON.stringify({
      id: "m6-owner-full-rig-r3",
      asset: {
        url: "models/m6-owner-full-rig-r3.glb",
        sha256:
          "1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc",
        byteLength: 829936,
      },
      bindings: Array.from({ length: 59 }, (_, index) => ({
        nodeName: `JV_R3_Real_${index}`,
      })),
    })}\n`,
  );
  await put(
    dist,
    "vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
    Buffer.alloc(829936),
  );

  const tiles = [];
  for (let tile = 0; tile < 7; tile += 1) {
    const binaryUrl = `tiles/tile_${String(tile).padStart(3, "0")}.bin`;
    await put(dist, `__jv_scan__/${binaryUrl}`, Buffer.from([tile, 1, 2, 3]));
    tiles.push({
      tileId: tile,
      binaryUrl,
      binaryBytes: tile === 0 ? 66419624 : 1,
      vertexCount: tile === 0 ? 1409687 : 0,
      indexCount: tile === 0 ? 5327325 : 0,
      triangleCount: tile === 0 ? 1775775 : 0,
      groups: [],
    });
  }
  for (let group = 0; group < 25; group += 1) {
    const textureUrl = `textures/tile_000_group_${String(group).padStart(3, "0")}.png`;
    await put(dist, `__jv_scan__/${textureUrl}`, Buffer.from([0x89, 0x50, group]));
    tiles[0].groups.push({
      textureUrl,
      textureBytes: group === 0 ? 44858270 : 1,
      vertexCount: group === 0 ? 1409687 : 0,
      indexCount: group === 0 ? 5327325 : 0,
      triangleCount: group === 0 ? 1775775 : 0,
    });
  }

  const index = {
    schema: "JV_WEB_JSPREV2_INDEX_V2",
    available: true,
    packId: "scan/photogrammetry-primary",
    tileCount: 7,
    groupCount: 25,
    textureCount: 25,
    vertexCount: 1409687,
    indexCount: 5327325,
    triangleCount: 1775775,
    manifestBytes: 10590,
    binaryBytes: 66419624,
    textureBytes: 44858270,
    totalBytes: 111288484,
    estimatedCpuGeometryBytes: 0,
    estimatedGpuGeometryBytes: 0,
    tiles,
  };
  await put(dist, "__jv_scan__/index.json", `${JSON.stringify(index)}\n`);

  const scanFiles = [];
  for (const relative of [
    "__jv_scan__/index.json",
    ...tiles.map((tile) => `__jv_scan__/${tile.binaryUrl}`),
    ...tiles.flatMap((tile) =>
      tile.groups.map((group) => `__jv_scan__/${group.textureUrl}`),
    ),
  ]) {
    scanFiles.push(await record(dist, relative));
  }
  const indexRecord = scanFiles.find((entry) => entry.path === "__jv_scan__/index.json");
  const receipt = {
    schema: "JV_WEB_FRIENDS_SCAN_RELEASE_V1",
    schemaVersion: 1,
    releaseId: "friends-r1",
    publicationClass: "FRIENDS_PUBLIC_INPUT",
    sourceMetadataPreserved: true,
    source: {
      packageId: "scan/photogrammetry-primary",
      previewContentSha256: PREVIEW_SHA,
      completeJsonSha256: COMPLETE_SHA,
      completeJsonBytes: 10590,
      privacyClass: "PRIVATE_LOCAL_ONLY",
      purpose: "SOURCE_VISUAL_PREVIEW_ONLY",
    },
    runtime: {
      root: "__jv_scan__/",
      index: indexRecord,
      tileCount: 7,
      groupCount: 25,
      textureCount: 25,
      vertexCount: 1409687,
      indexCount: 5327325,
      triangleCount: 1775775,
      binaryBytes: 66419624,
      textureBytes: 44858270,
    },
    files: scanFiles,
  };
  await put(
    dist,
    "receipts/jv_friends_scan_receipt.json",
    `${JSON.stringify(receipt)}\n`,
  );

  const files = await buildPortableFileRecords(dist);
  const manifest = {
    schemaVersion: 1,
    distribution: "portable_site",
    project: { id: "jv_web_demonstrator", version: "0.1.0" },
    source: {
      repository: "Jozzpoly/JV-Box3D-Web-experiment",
      ref: { state: "BRANCH", fingerprint: "123456789abc" },
      commit: "1".repeat(40),
      commitDate: "2026-08-14T00:00:00Z",
      workingTreeClean: true,
    },
    runtimeBackend: {
      id: "legacy_ts_m6",
      role: "REFERENCE_BROWSER_FIXTURE",
      productPhysicsAuthority: false,
      nativeParity: "NOT_PROVEN",
    },
    runtimeAssets: ["receipts/jv_m6_factory_receipt.json"],
    complianceFiles: ["THIRD_PARTY_NOTICES.md"],
    publication: {
      mode: "DORMANT",
      pathPortableCandidate: true,
      publicReady: false,
      pagesPublicationApproved: false,
      publishedByBuild: false,
    },
    files,
  };
  await put(dist, "build-manifest.json", `${JSON.stringify(manifest)}\n`);
  return dist;
}

test("Friends R1 validator accepts the pinned scan and exact public project path", async () => {
  const dist = await makeCandidate();
  try {
    const result = await validateFriendsR1Candidate(dist);
    assert.deepEqual(result.errors, []);
    assert.equal(result.pagesSmoke?.prefix, "/JV-Box3D-Web-Public/");
    assert.equal(result.pagesSmoke?.entryPointVerified, true);
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});

test("Friends R1 validator rejects a release receipt for a different scan", async () => {
  const dist = await makeCandidate();
  try {
    const receiptPath = path.resolve(dist, "receipts/jv_friends_scan_receipt.json");
    const receipt = JSON.parse(await (await import("node:fs/promises")).readFile(receiptPath, "utf8"));
    receipt.source.previewContentSha256 = "f".repeat(64);
    await writeFile(receiptPath, `${JSON.stringify(receipt)}\n`);
    const result = await validateFriendsR1Candidate(dist, { httpSmoke: false });
    assert.ok(
      result.errors.some((error) => error.includes("does not pin the approved source pack")),
    );
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});
