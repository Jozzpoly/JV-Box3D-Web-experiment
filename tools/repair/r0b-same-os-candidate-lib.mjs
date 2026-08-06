import { createHash } from "node:crypto";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

export const SAME_OS_RECEIPT_SCHEMA = "JV_WEB_R0B_SAME_OS_RECEIPT_V1";

export function sha256Text(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function isPathInside(parent, child) {
  const rel = relative(resolve(parent), resolve(child));
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

export function assertExternalAbsolutePath(repositoryRoot, target, label) {
  if (!isAbsolute(target)) {
    throw new Error(`${label} must be an absolute path.`);
  }
  if (isPathInside(repositoryRoot, target)) {
    throw new Error(`${label} must be outside the repository checkout.`);
  }
}

export function parseSameOsArguments(argv) {
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

function expectObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function expectString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function expectSha256(value, label) {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256.`);
  }
  return value;
}

function normalizeNativePackages(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  const records = value.map((record, index) => {
    expectObject(record, `${label}[${index}]`);
    return {
      name: expectString(record.name, `${label}[${index}].name`),
      version: expectString(record.version, `${label}[${index}].version`),
      dependencyPath: expectString(
        record.dependencyPath,
        `${label}[${index}].dependencyPath`,
      ),
    };
  });
  records.sort((a, b) =>
    a.name.localeCompare(b.name) ||
    a.version.localeCompare(b.version) ||
    a.dependencyPath.localeCompare(b.dependencyPath),
  );
  return records;
}

function normalizeDependencyEvidence(value, label) {
  const dependencies = expectObject(value, label);
  return {
    logicalTreeSha256: expectSha256(
      dependencies.logicalTreeSha256,
      `${label}.logicalTreeSha256`,
    ),
    nativePackages: normalizeNativePackages(
      dependencies.nativePackages,
      `${label}.nativePackages`,
    ),
  };
}

export function normalizeArtifactFileTable(files, label = "artifact files") {
  if (!Array.isArray(files)) throw new Error(`${label} must be an array.`);
  const seen = new Set();
  const normalized = files.map((record, index) => {
    expectObject(record, `${label}[${index}]`);
    const path = expectString(record.path, `${label}[${index}].path`);
    if (seen.has(path)) throw new Error(`${label} contains duplicate path ${path}.`);
    seen.add(path);
    if (!Number.isSafeInteger(record.bytes) || record.bytes < 0) {
      throw new Error(`${label}[${index}].bytes must be a non-negative integer.`);
    }
    if (typeof record.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(record.sha256)) {
      throw new Error(`${label}[${index}].sha256 must be a lowercase SHA-256.`);
    }
    return { path, bytes: record.bytes, sha256: record.sha256 };
  });
  normalized.sort((a, b) => a.path.localeCompare(b.path));
  return normalized;
}

function extractSharedIdentity(receipt, label) {
  expectObject(receipt, label);
  if (receipt.schema !== "JV_WEB_R0B_TOOLCHAIN_RECEIPT_V1") {
    throw new Error(`${label} has unsupported schema ${receipt.schema}.`);
  }
  const expectations = expectObject(receipt.expectations, `${label}.expectations`);
  const identity = expectObject(receipt.identity, `${label}.identity`);
  const lock = expectObject(receipt.lock, `${label}.lock`);
  const environment = expectObject(receipt.environment, `${label}.environment`);
  return {
    repository: expectString(expectations.repository, `${label}.expectations.repository`),
    commit: expectString(identity.commit, `${label}.identity.commit`),
    tree: expectString(identity.tree, `${label}.identity.tree`),
    expectedNode: expectString(expectations.node, `${label}.expectations.node`),
    expectedNpm: expectString(expectations.npm, `${label}.expectations.npm`),
    expectedTypeScript: expectString(
      expectations.typescript,
      `${label}.expectations.typescript`,
    ),
    expectedVite: expectString(expectations.vite, `${label}.expectations.vite`),
    actualNode: expectString(environment.node, `${label}.environment.node`),
    actualNpm: expectString(environment.npm, `${label}.environment.npm`),
    actualTypeScript:
      receipt.result === "PASS"
        ? expectString(environment.typescript, `${label}.environment.typescript`)
        : null,
    actualVite:
      receipt.result === "PASS"
        ? expectString(environment.vite, `${label}.environment.vite`)
        : null,
    nodeExecutableSha256: expectSha256(
      environment.nodeExecutableSha256,
      `${label}.environment.nodeExecutableSha256`,
    ),
    npmCliSha256: expectSha256(
      environment.npmCliSha256,
      `${label}.environment.npmCliSha256`,
    ),
    lockBeforeSha256: expectSha256(lock.beforeSha256, `${label}.lock.beforeSha256`),
    lockAfterSha256:
      receipt.result === "PASS"
        ? expectSha256(lock.afterSha256, `${label}.lock.afterSha256`)
        : null,
    packageJsonSha256: expectSha256(
      receipt.packageJsonSha256,
      `${label}.packageJsonSha256`,
    ),
    dependencies:
      receipt.result === "PASS"
        ? normalizeDependencyEvidence(receipt.dependencies, `${label}.dependencies`)
        : null,
  };
}

function compareJsonValues(a, b, label, differences) {
  if (JSON.stringify(a) !== JSON.stringify(b)) differences.push(label);
}

export function compareToolchainReceipts(receiptA, receiptB, { preflightOnly = false } = {}) {
  const differences = [];
  const expectedResult = preflightOnly ? "PREFLIGHT_ONLY_PASS" : "PASS";
  const expectedCanonical = !preflightOnly;

  for (const [label, receipt] of [["runA", receiptA], ["runB", receiptB]]) {
    if (receipt?.result !== expectedResult) {
      differences.push(`${label}.result`);
    }
    if (receipt?.canonical !== expectedCanonical) {
      differences.push(`${label}.canonical`);
    }
  }

  const identityA = extractSharedIdentity(receiptA, "runA");
  const identityB = extractSharedIdentity(receiptB, "runB");
  compareJsonValues(identityA, identityB, "shared identity/toolchain/lock", differences);

  let artifact = null;
  if (!preflightOnly) {
    const artifactA = expectObject(receiptA.artifact, "runA.artifact");
    const artifactB = expectObject(receiptB.artifact, "runB.artifact");
    const filesA = normalizeArtifactFileTable(artifactA.files, "runA.artifact.files");
    const filesB = normalizeArtifactFileTable(artifactB.files, "runB.artifact.files");
    compareJsonValues(filesA, filesB, "artifact file table", differences);
    const manifestSha256A = expectSha256(
      artifactA.manifestSha256,
      "runA.artifact.manifestSha256",
    );
    const manifestSha256B = expectSha256(
      artifactB.manifestSha256,
      "runB.artifact.manifestSha256",
    );
    compareJsonValues(
      manifestSha256A,
      manifestSha256B,
      "artifact manifest SHA-256",
      differences,
    );
    artifact = {
      fileCountA: filesA.length,
      fileCountB: filesB.length,
      manifestSha256A,
      manifestSha256B,
      tableSha256A: sha256Text(JSON.stringify(filesA)),
      tableSha256B: sha256Text(JSON.stringify(filesB)),
    };
  }

  return {
    identical: differences.length === 0,
    differences,
    mode: preflightOnly ? "PREFLIGHT_ONLY" : "FULL_GATE",
    identity: identityA,
    artifact,
  };
}

export function createSameOsReceipt(options, now = new Date()) {
  return {
    schema: SAME_OS_RECEIPT_SCHEMA,
    createdAtUtc: now.toISOString(),
    result: "RUNNING",
    canonical: false,
    phase: "INITIALIZE",
    mode: options.preflightOnly ? "PREFLIGHT_ONLY" : "FULL_GATE",
    expectations: {
      repository: options.expectedRepository,
      commit: options.expectedCommit,
      tree: options.expectedTree,
      node: options.expectedNode,
      npm: options.expectedNpm,
      typescript: options.expectedTypeScript,
      vite: options.expectedVite,
    },
    sourceRepository: options.repositoryRoot,
    receiptRoot: options.receiptRoot,
    runs: [],
    comparison: null,
    cleanup: [],
    failure: null,
  };
}

export function markSameOsFailure(receipt, phase, error) {
  receipt.result = "BLOCKED";
  receipt.canonical = false;
  receipt.phase = phase;
  receipt.failure = {
    name: error instanceof Error ? error.name : "Error",
    message: error instanceof Error ? error.message : String(error),
  };
  return receipt;
}

export function markSameOsPass(receipt, comparison) {
  receipt.result = receipt.mode === "PREFLIGHT_ONLY" ? "PREFLIGHT_ONLY_PASS" : "PASS";
  receipt.canonical = receipt.mode === "FULL_GATE";
  receipt.phase = "COMPLETE";
  receipt.comparison = comparison;
  return receipt;
}
