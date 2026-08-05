import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

function reject(message) {
  throw new Error(`Generated public staging rejected: ${message}`);
}

function resolveOwnedDirectory(destinationDirectory, value) {
  if (typeof value !== "string" || value.length === 0) {
    reject("owned directory paths must be non-empty strings");
  }
  if (isAbsolute(value)) {
    reject(`owned directory must be relative: ${value}`);
  }
  const absolute = resolve(destinationDirectory, value);
  const relativePath = relative(destinationDirectory, absolute);
  if (
    relativePath.length === 0 ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    reject(`owned directory escapes or replaces the staging root: ${value}`);
  }
  return Object.freeze({
    input: value,
    absolute,
    normalized: relativePath.split(sep).join("/"),
  });
}

function validateOwnedDirectories(destinationDirectory, values) {
  if (!Array.isArray(values) || values.length === 0) {
    reject("at least one owned directory is required");
  }
  const records = values.map((value) =>
    resolveOwnedDirectory(destinationDirectory, value),
  );
  const normalized = new Set();
  for (const record of records) {
    if (normalized.has(record.normalized)) {
      reject(`owned directory is duplicated: ${record.input}`);
    }
    normalized.add(record.normalized);
  }
  for (let leftIndex = 0; leftIndex < records.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < records.length;
      rightIndex += 1
    ) {
      const left = records[leftIndex];
      const right = records[rightIndex];
      if (
        right.normalized.startsWith(`${left.normalized}/`) ||
        left.normalized.startsWith(`${right.normalized}/`)
      ) {
        reject(
          `owned directories overlap: ${left.input} and ${right.input}`,
        );
      }
    }
  }
  return records;
}

export async function prepareGeneratedPublicStagingV1({
  sourceDirectory,
  destinationDirectory,
  ownedDirectories,
}) {
  const source = resolve(sourceDirectory);
  const destination = resolve(destinationDirectory);
  if (source === destination) {
    reject("source and destination directories must differ");
  }
  const owned = validateOwnedDirectories(destination, ownedDirectories);

  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
  for (const record of owned) {
    await rm(record.absolute, { recursive: true, force: true });
  }

  return Object.freeze({
    sourceDirectory: source,
    destinationDirectory: destination,
    ownedDirectories: Object.freeze(
      owned.map((record) => record.normalized),
    ),
  });
}
