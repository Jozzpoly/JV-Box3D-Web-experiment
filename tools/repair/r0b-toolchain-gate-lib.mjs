import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { delimiter, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { endianness, release as osRelease, version as osVersion } from "node:os";

export const RECEIPT_SCHEMA = "JV_WEB_R0B_TOOLCHAIN_RECEIPT_V1";

export function buildPinnedNodeEnvironment(environment, nodeExecutable) {
  const source = { ...environment };
  const pathKey = Object.keys(source).find((key) => key.toLowerCase() === "path") ?? "PATH";
  const currentPath = String(source[pathKey] ?? "");
  const nodeDirectory = dirname(resolve(nodeExecutable));
  source[pathKey] = currentPath.length === 0
    ? nodeDirectory
    : `${nodeDirectory}${delimiter}${currentPath}`;
  source.NODE = resolve(nodeExecutable);
  source.npm_node_execpath = resolve(nodeExecutable);
  source.CI = "true";
  source.NO_COLOR = "1";
  return source;
}

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function normalizeGitHubRepositoryUrl(value) {
  const input = String(value ?? "").trim().replace(/\\/g, "/");
  const patterns = [
    /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/i,
    /^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/i,
    /^ssh:\/\/git@github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/i,
    /^git:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/i,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

export function assertRepositoryOrigin(origin, expectedRepository) {
  const normalized = normalizeGitHubRepositoryUrl(origin);
  const expected = String(expectedRepository).trim().toLowerCase();
  if (normalized !== expected) {
    throw new Error(
      `Repository origin mismatch: expected ${expectedRepository}, received ${origin}.`,
    );
  }
  return normalized;
}

export function assertExactHexSha(label, actual, expected) {
  const pattern = /^[0-9a-f]{40}$/;
  if (!pattern.test(String(expected))) {
    throw new Error(`${label} expected value is not a full 40-character SHA.`);
  }
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected ${expected}, received ${actual}.`);
  }
}

export function assertExactVersion(label, actual, expected) {
  const normalizedActual = String(actual).trim().replace(/^v/, "");
  const normalizedExpected = String(expected).trim().replace(/^v/, "");
  if (normalizedActual !== normalizedExpected) {
    throw new Error(
      `${label} version mismatch: expected ${normalizedExpected}, received ${normalizedActual}.`,
    );
  }
  return normalizedActual;
}

export function assertCleanStatus(status) {
  if (String(status).length !== 0) {
    throw new Error(`Source tree is not clean:\n${status}`);
  }
}

export function assertDetachedBranch(branch) {
  if (String(branch).trim().length !== 0) {
    throw new Error(
      `Disposable R0-B checkout must use detached HEAD; received branch ${branch}.`,
    );
  }
}

export function isPathInside(parent, child) {
  const rel = relative(resolve(parent), resolve(child));
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

export function assertReceiptDirectoryOutsideRepository(repositoryRoot, receiptRoot) {
  if (!isAbsolute(receiptRoot)) {
    throw new Error("Receipt directory must be an absolute path.");
  }
  if (isPathInside(repositoryRoot, receiptRoot)) {
    throw new Error("Receipt directory must be outside the repository checkout.");
  }
}

export function assertDisposableOutputsAbsent(existingPaths) {
  if (existingPaths.length > 0) {
    throw new Error(
      `Disposable checkout already contains generated/install state: ${existingPaths.join(", ")}.`,
    );
  }
}

export function parseCliArguments(argv) {
  const values = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${token}`);
    }
    if (token === "--preflight-only") {
      flags.add(token);
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${token}.`);
    }
    if (values.has(token)) throw new Error(`Duplicate argument: ${token}.`);
    values.set(token, value);
    index += 1;
  }

  const required = [
    "--repo",
    "--expected-repository",
    "--expected-commit",
    "--expected-tree",
    "--expected-node",
    "--expected-npm",
    "--expected-typescript",
    "--expected-vite",
    "--receipt-root",
  ];
  for (const key of required) {
    if (!values.has(key)) throw new Error(`Missing required argument ${key}.`);
  }

  return {
    repositoryRoot: resolve(values.get("--repo")),
    expectedRepository: values.get("--expected-repository"),
    expectedCommit: values.get("--expected-commit"),
    expectedTree: values.get("--expected-tree"),
    expectedNode: values.get("--expected-node"),
    expectedNpm: values.get("--expected-npm"),
    expectedTypeScript: values.get("--expected-typescript"),
    expectedVite: values.get("--expected-vite"),
    receiptRoot: resolve(values.get("--receipt-root")),
    npmCli: values.has("--npm-cli") ? resolve(values.get("--npm-cli")) : null,
    preflightOnly: flags.has("--preflight-only"),
  };
}

export function createReceiptId(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function createInitialReceipt(options, now = new Date()) {
  return {
    schema: RECEIPT_SCHEMA,
    createdAtUtc: now.toISOString(),
    result: "RUNNING",
    phase: "INITIALIZE",
    canonical: false,
    expectations: {
      repository: options.expectedRepository,
      commit: options.expectedCommit,
      tree: options.expectedTree,
      node: options.expectedNode,
      npm: options.expectedNpm,
      typescript: options.expectedTypeScript,
      vite: options.expectedVite,
      detachedHeadRequired: true,
      cleanDisposableCheckoutRequired: true,
    },
    environment: {
      platform: process.platform,
      arch: process.arch,
      osRelease: osRelease(),
      osVersion: osVersion(),
      endianness: endianness(),
      nodeExecutable: process.execPath,
      node: process.version.replace(/^v/, ""),
    },
    identity: null,
    lock: null,
    commands: [],
    artifact: null,
    failure: null,
  };
}

export function markReceiptFailure(receipt, phase, error, result = "BLOCKED") {
  receipt.result = result;
  receipt.phase = phase;
  receipt.canonical = false;
  receipt.failure = {
    name: error instanceof Error ? error.name : "Error",
    message: error instanceof Error ? error.message : String(error),
  };
  return receipt;
}

export function markPreflightPass(receipt) {
  receipt.result = "PREFLIGHT_ONLY_PASS";
  receipt.phase = "PREFLIGHT_COMPLETE";
  receipt.canonical = false;
  return receipt;
}

export function markGatePass(receipt) {
  receipt.result = "PASS";
  receipt.phase = "COMPLETE";
  receipt.canonical = true;
  return receipt;
}

export async function hashFile(path) {
  return sha256Bytes(await readFile(path));
}

export async function collectFileTable(root) {
  const records = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = resolve(directory, entry.name);
      const rel = relative(root, absolute).replaceAll(sep, "/");
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        const stat = await lstat(absolute);
        records.push({ path: rel, bytes: stat.size, sha256: await hashFile(absolute) });
      } else {
        throw new Error(`Unsupported artifact entry type: ${rel}.`);
      }
    }
  }
  await visit(await realpath(root));
  return records;
}


function expectDependencyNode(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

export function normalizeNpmDependencyTree(tree, label = "npm dependency tree") {
  const node = expectDependencyNode(tree, label);
  const normalized = {};
  if (typeof node.name === "string" && node.name.length > 0) normalized.name = node.name;
  if (typeof node.version === "string" && node.version.length > 0) {
    normalized.version = node.version;
  }
  const dependencies = node.dependencies;
  if (dependencies !== undefined) {
    const dependencyObject = expectDependencyNode(
      dependencies,
      `${label}.dependencies`,
    );
    const names = Object.keys(dependencyObject).sort((a, b) => a.localeCompare(b));
    normalized.dependencies = {};
    for (const name of names) {
      const child = normalizeNpmDependencyTree(
        dependencyObject[name],
        `${label}.dependencies.${name}`,
      );
      if (child.name === undefined) child.name = name;
      normalized.dependencies[name] = child;
    }
  }
  return normalized;
}

export function collectNativeDependencyRecords(tree) {
  const records = [];
  function visit(node, path = []) {
    const dependencies = node?.dependencies;
    if (dependencies === null || typeof dependencies !== "object" || Array.isArray(dependencies)) {
      return;
    }
    for (const name of Object.keys(dependencies).sort((a, b) => a.localeCompare(b))) {
      const child = dependencies[name];
      const nextPath = [...path, name];
      if (
        (name.startsWith("@typescript/typescript-") ||
          name.startsWith("@rolldown/binding-")) &&
        typeof child?.version === "string" &&
        child.version.length > 0
      ) {
        records.push({
          name,
          version: child.version,
          dependencyPath: nextPath.join(" > "),
        });
      }
      visit(child, nextPath);
    }
  }
  visit(tree);
  return records;
}

export function assertNativeDependencySelection(records, platform, arch) {
  if (!Array.isArray(records)) throw new Error("Native dependency records must be an array.");
  if (arch !== "x64" || (platform !== "linux" && platform !== "win32")) {
    throw new Error(`R0-B native dependency selection does not support ${platform}/${arch}.`);
  }

  const expectedTypeScript = `@typescript/typescript-${platform}-x64`;
  const expectedRolldownPrefix = `@rolldown/binding-${platform}-x64`;
  const typeScript = records.filter((record) => record.name.startsWith("@typescript/typescript-"));
  const rolldown = records.filter((record) => record.name.startsWith("@rolldown/binding-"));

  if (typeScript.length === 0 || !typeScript.every((record) => record.name === expectedTypeScript)) {
    throw new Error(
      `Installed TypeScript native package does not match ${expectedTypeScript}: ${typeScript.map((record) => record.name).join(", ") || "none"}.`,
    );
  }
  if (
    rolldown.length === 0 ||
    !rolldown.every((record) => record.name.startsWith(expectedRolldownPrefix))
  ) {
    throw new Error(
      `Installed Rolldown native package does not match ${expectedRolldownPrefix}*: ${rolldown.map((record) => record.name).join(", ") || "none"}.`,
    );
  }
  return { typeScript, rolldown };
}

export function summarizeCommand(command, args, status, startedAt, finishedAt) {
  return {
    command,
    args,
    status,
    startedAtUtc: startedAt.toISOString(),
    finishedAtUtc: finishedAt.toISOString(),
  };
}
