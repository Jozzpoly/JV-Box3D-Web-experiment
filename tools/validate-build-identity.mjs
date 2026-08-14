import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_DIST = path.resolve(root, "dist");
const FULL_GIT_SHA = /^[0-9a-f]{40}$/i;

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function validateBuildIdentity(distDirectory = DEFAULT_DIST) {
  const dist = path.resolve(distDirectory);
  const errors = [];
  let manifest;
  try {
    manifest = JSON.parse(
      await readFile(path.resolve(dist, "build-manifest.json"), "utf8"),
    );
  } catch (error) {
    return {
      errors: [
        `build-manifest.json could not be read: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      sourceCommit: null,
    };
  }

  const sourceCommit = manifest?.source?.commit;
  if (typeof sourceCommit !== "string" || !FULL_GIT_SHA.test(sourceCommit)) {
    errors.push("Build identity requires an exact source commit in build-manifest.json.");
    return { errors, sourceCommit: null };
  }

  const records = Array.isArray(manifest?.files) ? manifest.files : [];
  const javaScriptPaths = records
    .filter(
      (record) => isRecord(record) &&
        typeof record.path === "string" &&
        record.path.endsWith(".js"),
    )
    .map((record) => record.path);

  if (javaScriptPaths.length === 0) {
    errors.push("Build identity could not find JavaScript payloads in build-manifest.json.");
    return { errors, sourceCommit };
  }

  const marker = `JV_BUILD_SOURCE:${sourceCommit.toLowerCase()}`;
  let clientJavaScript = "";
  try {
    clientJavaScript = (
      await Promise.all(
        javaScriptPaths.map((relativePath) =>
          readFile(path.resolve(dist, relativePath), "utf8"),
        ),
      )
    ).join("\n");
  } catch (error) {
    errors.push(
      `Build identity could not read JavaScript payloads: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { errors, sourceCommit };
  }

  if (!clientJavaScript.includes(marker)) {
    errors.push(
      `Client bundle does not carry the manifest source identity marker ${marker}.`,
    );
  }

  return { errors, sourceCommit };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await validateBuildIdentity();
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exit(1);
  }
  console.log(
    `Build identity passed: ${result.sourceCommit.slice(0, 12)} is embedded in the client bundle.`,
  );
}
