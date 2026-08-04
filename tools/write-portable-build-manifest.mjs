import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  buildPortableFileRecords,
  PORTABLE_MANIFEST_NAME,
} from "./portable-build-lib.mjs";

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

const sourceCommit = git("rev-parse", "HEAD");
const sourceBranch = git("branch", "--show-current");
const sourceCommitDate = git("show", "-s", "--format=%cI", "HEAD");
const files = await buildPortableFileRecords(dist, {
  exclude: [PORTABLE_MANIFEST_NAME],
});

const manifest = {
  schemaVersion: 1,
  distribution: "portable_site",
  project: {
    id: "jv_web_demonstrator",
    version: packageJson.version,
  },
  source: {
    repository: "Jozzpoly/JV-Box3D-Web-experiment",
    branch: sourceBranch,
    commit: sourceCommit,
    commitDate: sourceCommitDate,
  },
  runtimeBackend: {
    id: "legacy_ts_m6",
    role: "REFERENCE_BROWSER_FIXTURE",
    productPhysicsAuthority: false,
    nativeParity: "NOT_PROVEN",
  },
  publication: {
    pagesReady: true,
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
  `Portable build manifest written: ${files.length} payload file(s), source ${sourceCommit.slice(0, 12)}.`,
);
