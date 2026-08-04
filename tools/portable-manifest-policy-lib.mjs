import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PORTABLE_MANIFEST_NAME } from "./portable-build-lib.mjs";

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value, expected, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${PORTABLE_MANIFEST_NAME} ${label} must be an object.`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    const unknown = actual.filter((key) => !wanted.includes(key));
    const missing = wanted.filter((key) => !actual.includes(key));
    errors.push(
      `${PORTABLE_MANIFEST_NAME} ${label} keys differ` +
        `${unknown.length ? `; unknown: ${unknown.join(", ")}` : ""}` +
        `${missing.length ? `; missing: ${missing.join(", ")}` : ""}.`,
    );
    return false;
  }
  return true;
}

export async function validatePortableManifestPolicy(root) {
  const errors = [];
  let manifest;
  try {
    manifest = JSON.parse(
      await readFile(resolve(root, PORTABLE_MANIFEST_NAME), "utf8"),
    );
  } catch (error) {
    return [
      `Unable to read ${PORTABLE_MANIFEST_NAME} for privacy policy validation: ${
        error instanceof Error ? error.message : String(error)
      }`,
    ];
  }

  if (!isRecord(manifest)) {
    return [`${PORTABLE_MANIFEST_NAME} must contain an object.`];
  }

  exactKeys(
    manifest,
    [
      "schemaVersion",
      "distribution",
      "project",
      "source",
      "runtimeBackend",
      "runtimeAssets",
      "complianceFiles",
      "publication",
      "files",
    ],
    "root",
    errors,
  );
  exactKeys(manifest.project, ["id", "version"], "project", errors);
  exactKeys(
    manifest.source,
    ["repository", "ref", "commit", "commitDate", "workingTreeClean"],
    "source",
    errors,
  );
  exactKeys(manifest.source?.ref, ["state", "fingerprint"], "source.ref", errors);
  exactKeys(
    manifest.runtimeBackend,
    ["id", "role", "productPhysicsAuthority", "nativeParity"],
    "runtimeBackend",
    errors,
  );
  exactKeys(
    manifest.publication,
    [
      "mode",
      "pathPortableCandidate",
      "publicReady",
      "pagesPublicationApproved",
      "publishedByBuild",
    ],
    "publication",
    errors,
  );

  if (Array.isArray(manifest.files)) {
    manifest.files.forEach((record, index) => {
      exactKeys(record, ["path", "bytes", "sha256"], `files[${index}]`, errors);
    });
  }

  if (Object.hasOwn(manifest.source ?? {}, "branch")) {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} must not expose the source branch name.`,
    );
  }
  if (!isRecord(manifest.source?.ref)) {
    errors.push(`${PORTABLE_MANIFEST_NAME} must contain source.ref.`);
    return errors;
  }

  const state = manifest.source.ref.state;
  const fingerprint = manifest.source.ref.fingerprint;
  if (state === "BRANCH") {
    if (typeof fingerprint !== "string" || !/^[0-9a-f]{12}$/.test(fingerprint)) {
      errors.push(
        `${PORTABLE_MANIFEST_NAME} BRANCH source.ref requires a 12-character fingerprint.`,
      );
    }
  } else if (state === "DETACHED") {
    if (fingerprint !== null) {
      errors.push(
        `${PORTABLE_MANIFEST_NAME} DETACHED source.ref requires fingerprint=null.`,
      );
    }
  } else {
    errors.push(
      `${PORTABLE_MANIFEST_NAME} source.ref.state must be BRANCH or DETACHED.`,
    );
  }

  return errors;
}