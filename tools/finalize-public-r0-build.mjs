import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
} from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const publicRoot = resolve(root, "public");

const PUBLIC_RUNTIME_ASSETS = Object.freeze([
  ".nojekyll",
  "receipts/jv_m6_factory_receipt.json",
  "scenes/synthetic-flat-lab.scene.json",
  "vehicles/tiny/vehicle.visual.json",
  "vehicles/tiny/models/m6-rig-proof.glb",
]);

const FORBIDDEN_PUBLIC_TEXT = Object.freeze([
  ["/__jv_scan__/", "private scan endpoint"],
  ["jvSpawn=scan", "scan spawn query"],
  ["Skan JSPREV2", "LOCAL_FULL scan control"],
  ["loadLocalJsprev2Scan", "local scan loader"],
]);

async function copyRuntimeAsset(relativePath) {
  const source = resolve(publicRoot, relativePath);
  const target = resolve(dist, relativePath);
  const sourceInfo = await stat(source);
  if (!sourceInfo.isFile()) {
    throw new Error(`Public R0 runtime asset is not a file: ${relativePath}`);
  }
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function walk(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix.length === 0
      ? entry.name
      : `${prefix}/${entry.name}`;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...await walk(absolutePath, relativePath));
    } else if (entry.isFile()) {
      result.push(relativePath);
    }
  }
  return result.sort();
}

const sourceHtml = resolve(dist, "map-only-r0.html");
const publicIndex = resolve(dist, "index.html");
await rename(sourceHtml, publicIndex);

for (const relativePath of PUBLIC_RUNTIME_ASSETS) {
  await copyRuntimeAsset(relativePath);
}

const files = await walk(dist);
if (files.includes("map-only-r0.html")) {
  throw new Error("Public R0 artifact retained the source-only map-only-r0.html name.");
}
if (!files.includes("index.html")) {
  throw new Error("Public R0 artifact is missing index.html.");
}
const sourceMaps = files.filter((path) => path.endsWith(".map"));
if (sourceMaps.length !== 0) {
  throw new Error(`Public R0 artifact contains source maps: ${sourceMaps.join(", ")}`);
}

for (const relativePath of files) {
  const extension = extname(relativePath).toLowerCase();
  if (![".html", ".js", ".css", ".json", ".txt", ".md"].includes(extension)) {
    continue;
  }
  const text = await readFile(resolve(dist, relativePath), "utf8");
  for (const [needle, label] of FORBIDDEN_PUBLIC_TEXT) {
    if (text.includes(needle)) {
      throw new Error(
        `Public R0 artifact contains ${label} in ${relativePath}: ${needle}`,
      );
    }
  }
}

console.log(
  `Public R0 artifact finalized: ${files.length} pre-manifest file(s), ` +
  `${PUBLIC_RUNTIME_ASSETS.length} explicit runtime asset(s).`,
);
