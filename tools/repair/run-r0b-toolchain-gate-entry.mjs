#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function buildCanonicalLauncherEnvironment(
  environment,
  nodeExecutable,
  platform = process.platform,
) {
  const result = { ...environment };
  const pathKeys = Object.keys(result).filter(
    (key) => key.toLowerCase() === "path",
  );
  const inheritedPath =
    pathKeys
      .map((key) => String(result[key] ?? ""))
      .find((value) => value.length > 0) ?? "";
  for (const key of pathKeys) delete result[key];

  const exactNode = resolve(nodeExecutable);
  const nodeDirectory = dirname(exactNode);
  const pathKey = platform === "win32" ? "Path" : "PATH";
  const pathDelimiter = platform === "win32" ? ";" : ":";
  result[pathKey] =
    inheritedPath.length === 0
      ? nodeDirectory
      : `${nodeDirectory}${pathDelimiter}${inheritedPath}`;
  result.NODE = exactNode;
  result.npm_node_execpath = exactNode;
  return result;
}

export function applyCanonicalLauncherEnvironment(
  target = process.env,
  nodeExecutable = process.execPath,
  platform = process.platform,
) {
  const normalized = buildCanonicalLauncherEnvironment(
    target,
    nodeExecutable,
    platform,
  );
  for (const key of Object.keys(target)) {
    if (key.toLowerCase() === "path") delete target[key];
  }
  Object.assign(target, normalized);
  return normalized;
}

function isDirectExecution() {
  const entry = process.argv[1];
  return entry !== undefined && pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isDirectExecution()) {
  applyCanonicalLauncherEnvironment();
  await import("./run-r0b-toolchain-gate.mjs");
}
