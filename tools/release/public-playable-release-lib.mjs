import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

export const PUBLIC_RELEASE_LIMITS = Object.freeze({
  maximumFileBytes: 100 * 1024 * 1024,
  maximumSiteBytes: 1024 * 1024 * 1024,
});

const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".map", ".txt"]);
const PRIVATE_PATH_PATTERNS = [
  /[A-Za-z]:\\/u,
  /\/Users\//u,
  /\/home\//u,
  /JOZZ_SCAN_PREVIEW_PACK/u,
  /JV-Web-Products/u,
];

async function collectFiles(root, directory = root) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...await collectFiles(root, path));
    } else if (entry.isFile()) {
      const info = await stat(path);
      result.push(Object.freeze({
        path,
        relativePath: relative(root, path).replaceAll("\\", "/"),
        bytes: info.size,
      }));
    }
  }
  return result;
}

function assertRelativeHtmlReferences(html) {
  const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gu)]
    .map((match) => match[1]);
  for (const reference of references) {
    if (
      reference.startsWith("/") ||
      reference.startsWith("http://") ||
      reference.startsWith("https://")
    ) {
      throw new Error(`Public release contains a non-relative HTML reference: ${reference}`);
    }
  }
}

export async function validatePublicPlayableArtifact(root) {
  const files = await collectFiles(root);
  const byPath = new Map(files.map((file) => [file.relativePath, file]));
  for (const required of ["index.html", ".nojekyll", "release-manifest.json"]) {
    if (!byPath.has(required)) {
      throw new Error(`Public release is missing required file ${required}.`);
    }
  }

  let totalBytes = 0;
  for (const file of files) {
    totalBytes += file.bytes;
    if (file.bytes > PUBLIC_RELEASE_LIMITS.maximumFileBytes) {
      throw new Error(`Public release file ${file.relativePath} exceeds 100 MiB.`);
    }
    if (!TEXT_EXTENSIONS.has(extname(file.relativePath).toLowerCase())) {
      continue;
    }
    const text = await readFile(file.path, "utf8");
    for (const pattern of PRIVATE_PATH_PATTERNS) {
      if (pattern.test(text)) {
        throw new Error(`Public release file ${file.relativePath} exposes private/local data.`);
      }
    }
    if (file.relativePath === "index.html") {
      assertRelativeHtmlReferences(text);
    }
  }
  if (totalBytes > PUBLIC_RELEASE_LIMITS.maximumSiteBytes) {
    throw new Error("Public release exceeds the 1 GiB GitHub Pages site boundary.");
  }

  const manifest = JSON.parse(await readFile(join(root, "release-manifest.json"), "utf8"));
  if (
    manifest.schema !== "JV_WEB_PUBLIC_PLAYABLE_RELEASE_V1" ||
    manifest.mode !== "MAP_ONLY_PUBLIC_R0" ||
    manifest.privateScanIncluded !== false
  ) {
    throw new Error("Public release manifest does not describe the fail-closed map-only release.");
  }

  return Object.freeze({
    schema: "JV_WEB_PUBLIC_PLAYABLE_AUDIT_V1",
    fileCount: files.length,
    totalBytes,
    mode: manifest.mode,
    privateScanIncluded: manifest.privateScanIncluded,
  });
}
