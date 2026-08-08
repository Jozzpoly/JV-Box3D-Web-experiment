import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPortableFileRecords,
  PORTABLE_MANIFEST_NAME,
} from "./portable-build-lib.mjs";
import { selectRuntimeAssetsForPayload } from "./runtime-asset-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);

function git(...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

const dirtySource = git("status", "--porcelain", "--untracked-files=all");
if (dirtySource.length > 0) {
  throw new Error(
    "Portable build manifest refused a dirty source tree. Commit or remove source changes before packaging.",
  );
}

const complianceFiles = ["THIRD_PARTY_NOTICES.md"];
for (const path of complianceFiles) {
  await copyFile(resolve(root, path), resolve(dist, path));
}

const sourceCommit = git("rev-parse", "HEAD");
const sourceBranch = git("branch", "--show-current");
const sourceCommitDate = git("show", "-s", "--format=%cI", "HEAD");
const files = await buildPortableFileRecords(dist, {
  exclude: [PORTABLE_MANIFEST_NAME],
});
const runtimeAssets = selectRuntimeAssetsForPayload(
  new Set(files.map((record) => record.path)),
);

const manifest = {
  schemaVersion: 1,
  distribution: "portable_site",
  project: {
    id: "jv_web_demonstrator",
    version: packageJson.version,
  },
  source: {
    repository: "Jozzpoly/JV-Box3D-Web-experiment",
    ref:
      sourceBranch.length === 0
        ? { state: "DETACHED", fingerprint: null }
        : { state: "BRANCH", fingerprint: fingerprint(sourceBranch) },
    commit: sourceCommit,
    commitDate: sourceCommitDate,
    workingTreeClean: true,
  },
  runtimeBackend: {
    id: "legacy_ts_m6",
    role: "REFERENCE_BROWSER_FIXTURE",
    productPhysicsAuthority: false,
    nativeParity: "NOT_PROVEN",
  },
  runtimeAssets,
  complianceFiles,
  publication: {
    mode: "DORMANT",
    pathPortableCandidate: true,
    publicReady: false,
    pagesPublicationApproved: false,
    publishedByBuild: false,
  },
  files,
};

await writeFile(
  resolve(dist, PORTABLE_MANIFEST_NAME),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  `Portable build manifest written: ${files.length} payload file(s), ${runtimeAssets.length} runtime asset(s), source ${sourceCommit.slice(0, 12)}.`,
);
