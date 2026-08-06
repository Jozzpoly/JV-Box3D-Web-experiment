import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const RECEIPT_SCHEMA = "JV_WEB_R0B_TOOLCHAIN_RECEIPT_V1";

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

export function summarizeCommand(command, args, status, startedAt, finishedAt) {
  return {
    command,
    args,
    status,
    startedAtUtc: startedAt.toISOString(),
    finishedAtUtc: finishedAt.toISOString(),
  };
}
