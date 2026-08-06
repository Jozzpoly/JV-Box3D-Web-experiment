#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  assertCleanStatus,
  assertDetachedBranch,
  assertDisposableOutputsAbsent,
  assertExactHexSha,
  assertExactVersion,
  assertReceiptDirectoryOutsideRepository,
  assertRepositoryOrigin,
  collectFileTable,
  createInitialReceipt,
  createReceiptId,
  hashFile,
  markGatePass,
  markPreflightPass,
  markReceiptFailure,
  parseCliArguments,
  sha256Bytes,
  summarizeCommand,
} from "./r0b-toolchain-gate-lib.mjs";

function run(command, args, { cwd, receipt, evidenceDirectory, label, allowFailure = false }) {
  const startedAt = new Date();
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, CI: "true", NO_COLOR: "1" },
  });
  const finishedAt = new Date();
  const status = result.status ?? 1;
  const stem = `${String(receipt.commands.length + 1).padStart(2, "0")}-${label}`;
  const stdoutPath = resolve(evidenceDirectory, `${stem}.stdout.log`);
  const stderrPath = resolve(evidenceDirectory, `${stem}.stderr.log`);
  return Promise.all([
    writeFile(stdoutPath, result.stdout ?? "", "utf8"),
    writeFile(stderrPath, result.stderr ?? "", "utf8"),
  ]).then(() => {
    receipt.commands.push({
      ...summarizeCommand(command, args, status, startedAt, finishedAt),
      stdout: stdoutPath,
      stderr: stderrPath,
      stdoutSha256: sha256Bytes(result.stdout ?? ""),
      stderrSha256: sha256Bytes(result.stderr ?? ""),
    });
    if (result.error) throw result.error;
    if (!allowFailure && status !== 0) {
      throw new Error(`${label} failed with exit code ${status}.`);
    }
    return { status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  });
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function git(root, ...args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function detectBundledNpmCli() {
  const executableDirectory = dirname(process.execPath);
  const candidates = process.platform === "win32"
    ? [
        resolve(executableDirectory, "node_modules/npm/bin/npm-cli.js"),
        resolve(executableDirectory, "../node_modules/npm/bin/npm-cli.js"),
      ]
    : [
        resolve(executableDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
        resolve(executableDirectory, "../node_modules/npm/bin/npm-cli.js"),
      ];
  return candidates;
}

async function resolveNpmCli(explicit) {
  const candidates = explicit === null ? detectBundledNpmCli() : [explicit];
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error(
    `Unable to locate npm CLI. Checked: ${candidates.join(", ")}. Pass --npm-cli explicitly.`,
  );
}

const options = parseCliArguments(process.argv.slice(2));
assertReceiptDirectoryOutsideRepository(options.repositoryRoot, options.receiptRoot);
await mkdir(options.receiptRoot, { recursive: true });
const resolvedRepositoryRoot = await realpath(options.repositoryRoot);
const resolvedReceiptRoot = await realpath(options.receiptRoot);
assertReceiptDirectoryOutsideRepository(resolvedRepositoryRoot, resolvedReceiptRoot);
const receiptDirectory = resolve(resolvedReceiptRoot, createReceiptId());
await mkdir(receiptDirectory, { recursive: false });
const receiptPath = resolve(receiptDirectory, "receipt.json");
const receipt = createInitialReceipt(options);

async function save() {
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

try {
  receipt.phase = "IDENTITY";
  const repositoryRoot = git(options.repositoryRoot, "rev-parse", "--show-toplevel");
  if (resolve(repositoryRoot) !== resolve(options.repositoryRoot)) {
    throw new Error(`Repository root mismatch: ${repositoryRoot}.`);
  }
  const origin = git(options.repositoryRoot, "remote", "get-url", "origin");
  const normalizedRepository = assertRepositoryOrigin(origin, options.expectedRepository);
  const branch = git(options.repositoryRoot, "branch", "--show-current");
  assertDetachedBranch(branch);
  const commit = git(options.repositoryRoot, "rev-parse", "HEAD");
  const tree = git(options.repositoryRoot, "rev-parse", "HEAD^{tree}");
  assertExactHexSha("Source commit", commit, options.expectedCommit);
  assertExactHexSha("Source tree", tree, options.expectedTree);
  const statusBefore = git(options.repositoryRoot, "status", "--porcelain", "--untracked-files=all");
  assertCleanStatus(statusBefore);
  const generatedPaths = [
    "node_modules",
    "dist",
    ".test-dist",
    "public/vehicles/tiny/vehicle.visual.json",
    "public/vehicles/tiny/models/m6-rig-proof.glb",
  ];
  const existingGeneratedPaths = [];
  for (const path of generatedPaths) {
    if (await exists(resolve(options.repositoryRoot, path))) existingGeneratedPaths.push(path);
  }
  assertDisposableOutputsAbsent(existingGeneratedPaths);
  receipt.identity = {
    repository: normalizedRepository,
    origin,
    root: repositoryRoot,
    branchState: "DETACHED",
    commit,
    tree,
    statusBefore,
  };

  receipt.phase = "TOOLCHAIN_PREFLIGHT";
  assertExactVersion("Node", process.version, options.expectedNode);
  const npmCli = await resolveNpmCli(options.npmCli);
  const npmVersionResult = await run(process.execPath, [npmCli, "--version"], {
    cwd: options.repositoryRoot,
    receipt,
    evidenceDirectory: receiptDirectory,
    label: "npm-version",
  });
  const npmVersion = assertExactVersion("npm", npmVersionResult.stdout, options.expectedNpm);
  receipt.environment.nodeExecutableSha256 = await hashFile(process.execPath);
  receipt.environment.npmCli = npmCli;
  receipt.environment.npmCliSha256 = await hashFile(npmCli);
  receipt.environment.npm = npmVersion;

  const packageLockPath = resolve(options.repositoryRoot, "package-lock.json");
  const packageJsonPath = resolve(options.repositoryRoot, "package.json");
  const lockBefore = await hashFile(packageLockPath);
  const packageBefore = await hashFile(packageJsonPath);
  receipt.lock = { beforeSha256: lockBefore, afterSha256: null };
  receipt.packageJsonSha256 = packageBefore;

  if (options.preflightOnly) {
    markPreflightPass(receipt);
    await save();
    console.log(`R0-B preflight-only receipt: ${receiptPath}`);
    process.exit(0);
  }

  receipt.phase = "NPM_CI";
  await run(process.execPath, [npmCli, "ci"], {
    cwd: options.repositoryRoot,
    receipt,
    evidenceDirectory: receiptDirectory,
    label: "npm-ci",
  });

  const lockAfterInstall = await hashFile(packageLockPath);
  if (lockAfterInstall !== lockBefore) {
    throw new Error("package-lock.json changed during npm ci.");
  }
  const packageAfterInstall = await hashFile(packageJsonPath);
  if (packageAfterInstall !== packageBefore) {
    throw new Error("package.json changed during npm ci.");
  }
  assertCleanStatus(git(options.repositoryRoot, "status", "--porcelain", "--untracked-files=all"));

  receipt.phase = "INSTALLED_TOOLCHAIN";
  const installedTypeScript = JSON.parse(
    await readFile(resolve(options.repositoryRoot, "node_modules/typescript/package.json"), "utf8"),
  ).version;
  const installedVite = JSON.parse(
    await readFile(resolve(options.repositoryRoot, "node_modules/vite/package.json"), "utf8"),
  ).version;
  assertExactVersion("TypeScript", installedTypeScript, options.expectedTypeScript);
  assertExactVersion("Vite", installedVite, options.expectedVite);
  receipt.environment.typescript = installedTypeScript;
  receipt.environment.vite = installedVite;

  receipt.phase = "SOURCE_GATE";
  await run(process.execPath, [npmCli, "run", "check"], {
    cwd: options.repositoryRoot,
    receipt,
    evidenceDirectory: receiptDirectory,
    label: "source-check",
  });
  assertCleanStatus(git(options.repositoryRoot, "status", "--porcelain", "--untracked-files=all"));

  receipt.phase = "PORTABLE_BUILD";
  await run(process.execPath, [npmCli, "run", "build:portable"], {
    cwd: options.repositoryRoot,
    receipt,
    evidenceDirectory: receiptDirectory,
    label: "portable-build",
  });

  const statusAfter = git(options.repositoryRoot, "status", "--porcelain", "--untracked-files=all");
  assertCleanStatus(statusAfter);
  const finalCommit = git(options.repositoryRoot, "rev-parse", "HEAD");
  const finalTree = git(options.repositoryRoot, "rev-parse", "HEAD^{tree}");
  assertExactHexSha("Final source commit", finalCommit, options.expectedCommit);
  assertExactHexSha("Final source tree", finalTree, options.expectedTree);
  const lockAfter = await hashFile(packageLockPath);
  if (lockAfter !== lockBefore) throw new Error("package-lock.json changed during the gate.");
  receipt.lock.afterSha256 = lockAfter;
  receipt.identity.statusAfter = statusAfter;

  receipt.phase = "ARTIFACT_RECEIPT";
  const dist = resolve(options.repositoryRoot, "dist");
  const distStat = await stat(dist);
  if (!distStat.isDirectory()) throw new Error("Portable build did not create dist directory.");
  const files = await collectFileTable(dist);
  const manifestPath = resolve(dist, "build-manifest.json");
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (manifest?.source?.commit !== options.expectedCommit) {
    throw new Error("Portable manifest source commit does not match expected commit.");
  }
  if (manifest?.source?.workingTreeClean !== true) {
    throw new Error("Portable manifest does not record a clean source tree.");
  }
  receipt.artifact = {
    directory: dist,
    manifestSha256: sha256Bytes(manifestBytes),
    files,
  };

  markGatePass(receipt);
  await save();
  console.log(`R0-B canonical gate receipt: ${receiptPath}`);
} catch (error) {
  markReceiptFailure(receipt, receipt.phase, error, "BLOCKED");
  await save();
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`R0-B blocked receipt: ${receiptPath}`);
  process.exitCode = 1;
}
