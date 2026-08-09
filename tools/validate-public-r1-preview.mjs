import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { smokePortableBuildOverHttp } from "./portable-http-smoke-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const REQUIRED = Object.freeze([
  ".nojekyll",
  "index.html",
  "build-manifest.json",
  "receipts/jv_m6_factory_receipt.json",
  "scenes/synthetic-flat-lab.scene.json",
  "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json",
  "vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
]);

const EXPECTED_PRODUCT_MARKERS = Object.freeze([
  "M6 Drive",
  "Offroad",
  "Skan JSPREV2",
  "C · Kamera",
  "R · Reset",
]);
const FORBIDDEN_PATH_PARTS = Object.freeze([
  "__jv_scan__",
  "source-preview-aee5242a20848294",
  "JSPREV2_PACK",
  "vehicles/m6-owner-r1",
]);

async function walk(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix.length === 0 ? entry.name : `${prefix}/${entry.name}`;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute, relative));
    else if (entry.isFile()) result.push(relative);
  }
  return result.sort();
}

const files = await walk(dist);
const fileSet = new Set(files);
for (const required of REQUIRED) {
  if (!fileSet.has(required)) {
    throw new Error(`Public R1 preview is missing required product asset: ${required}`);
  }
}
for (const path of files) {
  if (FORBIDDEN_PATH_PARTS.some((needle) => path.includes(needle))) {
    throw new Error(`Public R1 preview contains private/local scan path: ${path}`);
  }
  if (path.endsWith(".map")) {
    throw new Error(`Public R1 preview contains a source map: ${path}`);
  }
}
const manifest = JSON.parse(await readFile(resolve(dist, "build-manifest.json"), "utf8"));
if (manifest?.publication?.publishedByBuild !== false) {
  throw new Error("Public R1 preview build must not claim it published itself.");
}
if (manifest?.source?.workingTreeClean !== true) {
  throw new Error("Public R1 preview requires a clean committed source tree.");
}
const owner = JSON.parse(await readFile(resolve(dist, "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json"), "utf8"));
if (
  owner.id !== "m6-owner-full-rig-r3" ||
  owner.asset?.sha256 !== "27ca3c041ec160b3718a7840f092aabdec5d069f287a260c0b9de1ff16100540" ||
  owner.asset?.byteLength !== 829088 ||
  !Array.isArray(owner.bindings) ||
  owner.bindings.filter((binding) => binding?.nodeName?.startsWith("JV_R3_Real_")).length !== 53
) {
  throw new Error("Public R1 preview owner full-rig identity drifted.");
}
const glb = resolve(dist, "vehicles/m6-owner-r3", owner.asset.url);
if ((await stat(glb)).size !== owner.asset.byteLength) {
  throw new Error("Public R1 preview owner GLB byte length differs from its visual package.");
}

const clientJavaScript = (
  await Promise.all(
    files
      .filter((path) => path.endsWith(".js"))
      .map((path) => readFile(resolve(dist, path), "utf8")),
  )
).join("\n");
for (const marker of EXPECTED_PRODUCT_MARKERS) {
  if (!clientJavaScript.includes(marker)) {
    throw new Error(`Public R1 preview client bundle is missing product marker: ${marker}`);
  }
}
if (clientJavaScript.includes('"/__jv_scan__/index.json"')) {
  throw new Error("Public R1 preview contains a root-absolute scan probe; the optional boundary must stay site-relative.");
}

const pagesSmoke = await smokePortableBuildOverHttp(
  dist,
  ["/JV-Box3D-Web-Public/"],
);
if (pagesSmoke.length !== 1 || pagesSmoke[0]?.entryPointVerified !== true) {
  throw new Error("Public R1 preview failed the exact GitHub Pages project-path smoke.");
}

console.log(
  `Public R1 preview candidate passed: ${files.length} static files; owner car + playable R1 markers present; exact /JV-Box3D-Web-Public/ path smoke passed; no private JSPREV2 payload.`,
);
