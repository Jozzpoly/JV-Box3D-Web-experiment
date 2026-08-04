import { createHash } from "node:crypto";
import { access, lstat, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";

export const PORTABLE_MANIFEST_NAME = "build-manifest.json";

function toPosix(path) {
  return path.split(sep).join("/");
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafePortablePath(path) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path.includes("?") ||
    path.includes("#")
  ) {
    return false;
  }
  const segments = path.split("/");
  return segments.every(
    (segment) => segment.length > 0 && segment !== "." && segment !== "..",
  );
}

export async function collectPortableFiles(root) {
  const files = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else {
        files.push(absolutePath);
      }
    }
  }

  await visit(root);
  return files.sort((left, right) => left.localeCompare(right));
}

export async function sha256File(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
}

export async function buildPortableFileRecords(root, options = {}) {
  const excluded = new Set(options.exclude ?? []);
  const records = [];

  for (const absolutePath of await collectPortableFiles(root)) {
    const path = toPosix(relative(root, absolutePath));
    if (excluded.has(path)) {
      continue;
    }

    const stat = await lstat(absolutePath);
    if (!stat.isFile()) {
      throw new Error(`Portable output contains a non-file entry: ${path}`);
    }

    records.push({
      path,
      bytes: stat.size,
      sha256: await sha256File(absolutePath),
    });
  }

  return records;
}

function classifyReference(rawReference) {
  const reference = rawReference.trim().replace(/^['"]|['"]$/g, "");
  if (
    reference.length === 0 ||
    reference.startsWith("#") ||
    reference.startsWith("data:") ||
    reference.startsWith("blob:") ||
    reference.startsWith("mailto:") ||
    reference.startsWith("tel:") ||
    reference.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(reference)
  ) {
    return { kind: "external", reference };
  }
  if (reference.startsWith("/")) {
    return { kind: "root-absolute", reference };
  }
  return { kind: "local", reference };
}

function stripQueryAndFragment(reference) {
  return reference.split("#", 1)[0].split("?", 1)[0];
}

async function validateLocalReference({
  root,
  sourceAbsolutePath,
  sourcePath,
  rawReference,
  errors,
}) {
  const classified = classifyReference(rawReference);
  if (classified.kind === "external") {
    return;
  }
  if (classified.kind === "root-absolute") {
    errors.push(
      `${sourcePath} uses a root-absolute URL that will break under a repository subpath: ${classified.reference}`,
    );
    return;
  }

  const pathPart = stripQueryAndFragment(classified.reference);
  if (pathPart.length === 0) {
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathPart);
  } catch {
    errors.push(`${sourcePath} contains invalid percent encoding: ${pathPart}`);
    return;
  }

  const absoluteTarget = resolve(dirname(sourceAbsolutePath), decodedPath);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (absoluteTarget !== root && !absoluteTarget.startsWith(rootPrefix)) {
    errors.push(`${sourcePath} reference escapes the portable root: ${pathPart}`);
    return;
  }
  if (!(await exists(absoluteTarget))) {
    errors.push(`${sourcePath} references a missing build artifact: ${pathPart}`);
  }
}

async function validateHtml(root, errors) {
  const indexPath = resolve(root, "index.html");
  if (!(await exists(indexPath))) {
    errors.push("Portable output is missing index.html at its root.");
    return;
  }

  const html = await readFile(indexPath, "utf8");
  const referencePattern = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = referencePattern.exec(html)) !== null) {
    await validateLocalReference({
      root,
      sourceAbsolutePath: indexPath,
      sourcePath: "index.html",
      rawReference: match[1],
      errors,
    });
  }
}

async function validateCss(root, files, errors) {
  const urlPattern = /url\(([^)]+)\)/gi;
  for (const absolutePath of files) {
    if (extname(absolutePath).toLowerCase() !== ".css") {
      continue;
    }
    const sourcePath = toPosix(relative(root, absolutePath));
    const css = await readFile(absolutePath, "utf8");
    let match;
    while ((match = urlPattern.exec(css)) !== null) {
      await validateLocalReference({
        root,
        sourceAbsolutePath: absolutePath,
        sourcePath,
        rawReference: match[1],
        errors,
      });
    }
  }
}

async function validateKnownRuntimePaths(root, files, errors) {
  const rootPathPattern = /["'`](\/(?:assets|runtime|scenes|receipts)\/[^"'`?#]*)/g;
  const textExtensions = new Set([".html", ".js", ".css", ".json"]);
  for (const absolutePath of files) {
    const extension = extname(absolutePath).toLowerCase();
    if (!textExtensions.has(extension)) {
      continue;
    }
    const sourcePath = toPosix(relative(root, absolutePath));
    const text = await readFile(absolutePath, "utf8");
    let match;
    while ((match = rootPathPattern.exec(text)) !== null) {
      errors.push(
        `${sourcePath} embeds a root-absolute runtime path: ${match[1]}`,
      );
    }
  }
}

async function validateManifest(root, errors) {
  const manifestPath = resolve(root, PORTABLE_MANIFEST_NAME);
  if (!(await exists(manifestPath))) {
    errors.push(`Portable output is missing ${PORTABLE_MANIFEST_NAME}.`);
    return null;
  }

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }

  if (!isRecord(manifest)) {
    errors.push(`${PORTABLE_MANIFEST_NAME} must contain an object.`);
    return null;
  }
  if (manifest.schemaVersion !== 1) {
    errors.push(`${PORTABLE_MANIFEST_NAME} must use schemaVersion 1.`);
  }
  if (manifest.distribution !== "portable_site") {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must declare distribution portable_site.`,
    );
  }
  if (manifest.project?.id !== "jv_web_demonstrator") {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must identify project jv_web_demonstrator.`,
    );
  }
  if (
    manifest.source?.repository !== "Jozzpoly/JV-Box3D-Web-experiment" ||
    typeof manifest.source?.commit !== "string" ||
    !/^[0-9a-f]{40}$/.test(manifest.source.commit) ||
    manifest.source?.workingTreeClean !== true
  ) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must record the exact repository commit and a clean source tree.`,
    );
  }
  if (
    manifest.runtimeBackend?.id !== "legacy_ts_m6" ||
    manifest.runtimeBackend?.role !== "REFERENCE_BROWSER_FIXTURE" ||
    manifest.runtimeBackend?.productPhysicsAuthority !== false ||
    manifest.runtimeBackend?.nativeParity !== "NOT_PROVEN"
  ) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must preserve the non-authoritative legacy_ts_m6 backend identity.`,
    );
  }
  if (
    manifest.publication?.mode !== "DORMANT" ||
    manifest.publication?.pathPortableCandidate !== true
  ) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must describe a dormant path-portable candidate.`,
    );
  }
  if (manifest.publication?.publishedByBuild !== false) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must prove that the local build did not publish anything.`,
    );
  }
  if (manifest.publication?.publicReady !== false) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must remain publicReady=false until an owner-approved release receipt exists.`,
    );
  }
  if (manifest.publication?.pagesPublicationApproved !== false) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must remain pagesPublicationApproved=false before the publication gate.`,
    );
  }
  if (!Array.isArray(manifest.files)) {
    errors.push(`${PORTABLE_MANIFEST_NAME} must contain a files array.`);
    return manifest;
  }

  const actualRecords = await buildPortableFileRecords(root, {
    exclude: [PORTABLE_MANIFEST_NAME],
  });
  const actualByPath = new Map(actualRecords.map((record) => [record.path, record]));
  const recordedPaths = new Set();

  for (const record of manifest.files) {
    if (
      record === null ||
      typeof record !== "object" ||
      typeof record.path !== "string" ||
      typeof record.bytes !== "number" ||
      typeof record.sha256 !== "string"
    ) {
      errors.push(`${PORTABLE_MANIFEST_NAME} contains an invalid file record.`);
      continue;
    }
    if (!isSafePortablePath(record.path) && record.path !== ".nojekyll") {
      errors.push(`${PORTABLE_MANIFEST_NAME} contains unsafe file path ${record.path}.`);
      continue;
    }
    if (recordedPaths.has(record.path)) {
      errors.push(`${PORTABLE_MANIFEST_NAME} repeats ${record.path}.`);
      continue;
    }
    recordedPaths.add(record.path);
    const actual = actualByPath.get(record.path);
    if (!actual) {
      errors.push(`${PORTABLE_MANIFEST_NAME} records missing file ${record.path}.`);
      continue;
    }
    if (actual.bytes !== record.bytes || actual.sha256 !== record.sha256) {
      errors.push(`${record.path} does not match its recorded bytes/SHA-256.`);
    }
  }

  for (const actual of actualRecords) {
    if (!recordedPaths.has(actual.path)) {
      errors.push(`${actual.path} is absent from ${PORTABLE_MANIFEST_NAME}.`);
    }
  }

  if (!Array.isArray(manifest.runtimeAssets) || manifest.runtimeAssets.length === 0) {
    errors.push(`${PORTABLE_MANIFEST_NAME} must contain runtimeAssets.`);
  } else {
    const runtimeAssets = new Set();
    for (const assetPath of manifest.runtimeAssets) {
      if (!isSafePortablePath(assetPath)) {
        errors.push(`${PORTABLE_MANIFEST_NAME} contains unsafe runtime asset path ${String(assetPath)}.`);
        continue;
      }
      if (runtimeAssets.has(assetPath)) {
        errors.push(`${PORTABLE_MANIFEST_NAME} repeats runtime asset ${assetPath}.`);
        continue;
      }
      runtimeAssets.add(assetPath);
      if (!actualByPath.has(assetPath) || !recordedPaths.has(assetPath)) {
        errors.push(
          `${PORTABLE_MANIFEST_NAME} runtime asset is missing from the payload table: ${assetPath}.`,
        );
      }
    }
    if (!runtimeAssets.has("receipts/jv_m6_factory_receipt.json")) {
      errors.push(
        `${PORTABLE_MANIFEST_NAME} must declare the pinned native receipt as a runtime asset.`,
      );
    }
  }

  return manifest;
}

export async function validatePortableBuild(root) {
  const errors = [];
  const warnings = [];

  if (!(await exists(root))) {
    return {
      errors: [`Portable output directory does not exist: ${root}`],
      warnings,
      stats: null,
      manifest: null,
    };
  }

  const files = await collectPortableFiles(root);
  const relativeFiles = files.map((path) => toPosix(relative(root, path)));

  if (!relativeFiles.includes(".nojekyll")) {
    errors.push("Portable output is missing .nojekyll.");
  }
  for (const path of relativeFiles) {
    if (path.endsWith(".map")) {
      errors.push(`Portable output contains a source map: ${path}`);
    }
  }

  await validateHtml(root, errors);
  await validateCss(root, files, errors);
  await validateKnownRuntimePaths(root, files, errors);
  const manifest = await validateManifest(root, errors);

  const records = await buildPortableFileRecords(root);
  const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
  const largestFile = [...records].sort((left, right) => right.bytes - left.bytes)[0] ?? null;

  if (largestFile && largestFile.bytes > 1024 * 1024) {
    warnings.push(
      `Largest file exceeds 1 MiB: ${largestFile.path} (${largestFile.bytes} bytes).`,
    );
  }
  if (totalBytes > 25 * 1024 * 1024) {
    warnings.push(`Portable package exceeds 25 MiB: ${totalBytes} bytes.`);
  }

  return {
    errors,
    warnings,
    manifest,
    stats: {
      fileCount: records.length,
      totalBytes,
      largestFile,
    },
  };
}