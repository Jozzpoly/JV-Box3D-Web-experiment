#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  assertExactHexSha,
  assertExactVersion,
  assertRepositoryOrigin,
  createReceiptId,
} from "./r0b-toolchain-gate-lib.mjs";
import {
  assertExternalAbsolutePath,
  compareToolchainReceipts,
  createSameOsReceipt,
  markSameOsFailure,
  markSameOsPass,
  parseSameOsArguments,
  sha256Text,
} from "./r0b-same-os-candidate-lib.mjs";

function run(command, args, { cwd, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    maxBuffer: 128 * 1024 * 1024,
    env: process.env,
  });
  const status = result.status ?? 1;
  if (result.error) throw result.error;
  if (!allowFailure && status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${status}: ${result.stderr.trim()}`,
    );
  }
  return { status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function git(root, ...args) {
  return run("git", args, { cwd: root }).stdout.trim();
}

async function readSingleGateReceipt(receiptRoot) {
  const entries = (await readdir(receiptRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (entries.length !== 1) {
    throw new Error(
      `Expected exactly one gate receipt directory in ${receiptRoot}; found ${entries.length}.`,
    );
  }
  const path = resolve(receiptRoot, entries[0], "receipt.json");
  return { path, receipt: JSON.parse(await readFile(path, "utf8")) };
}

async function save(path, receipt) {
  await writeFile(path, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

const options = parseSameOsArguments(process.argv.slice(2));
assertExternalAbsolutePath(options.repositoryRoot, options.receiptRoot, "Receipt root");
await mkdir(options.receiptRoot, { recursive: true });
const repositoryRoot = await realpath(options.repositoryRoot);
const receiptRoot = await realpath(options.receiptRoot);
assertExternalAbsolutePath(repositoryRoot, receiptRoot, "Receipt root");

const runId = createReceiptId();
const campaignRoot = resolve(receiptRoot, `same-os-${runId}`);
const worktreeRoot = resolve(campaignRoot, "worktrees");
const evidenceRoot = resolve(campaignRoot, "gate-evidence");
await mkdir(campaignRoot, { recursive: false });
await mkdir(worktreeRoot, { recursive: false });
await mkdir(evidenceRoot, { recursive: false });
const receiptPath = resolve(campaignRoot, "same-os-receipt.json");
const receipt = createSameOsReceipt({ ...options, repositoryRoot, receiptRoot });
await save(receiptPath, receipt);

const createdWorktrees = [];

async function removeWorktree(path) {
  const result = run("git", ["worktree", "remove", path], {
    cwd: repositoryRoot,
    allowFailure: true,
  });
  receipt.cleanup.push({ path, status: result.status, stderr: result.stderr.trim() });
  if (result.status === 0) await rm(path, { recursive: true, force: false }).catch(() => {});
}

try {
  receipt.phase = "SOURCE_IDENTITY";
  const resolvedRoot = git(repositoryRoot, "rev-parse", "--show-toplevel");
  if (resolve(resolvedRoot) !== resolve(repositoryRoot)) {
    throw new Error(`Repository root mismatch: ${resolvedRoot}.`);
  }
  const origin = git(repositoryRoot, "remote", "get-url", "origin");
  assertRepositoryOrigin(origin, options.expectedRepository);
  const commit = git(repositoryRoot, "rev-parse", `${options.expectedCommit}^{commit}`);
  const tree = git(repositoryRoot, "rev-parse", `${options.expectedCommit}^{tree}`);
  assertExactHexSha("Candidate commit", commit, options.expectedCommit);
  assertExactHexSha("Candidate tree", tree, options.expectedTree);
  assertExactVersion("Node", process.version, options.expectedNode);

  for (const label of ["A", "B"]) {
    receipt.phase = `WORKTREE_${label}`;
    const checkout = resolve(worktreeRoot, label);
    const gateEvidence = resolve(evidenceRoot, label);
    await mkdir(gateEvidence, { recursive: true });
    run("git", ["worktree", "add", "--detach", checkout, options.expectedCommit], {
      cwd: repositoryRoot,
    });
    createdWorktrees.push(checkout);

    const checkoutCommit = git(checkout, "rev-parse", "HEAD");
    const checkoutTree = git(checkout, "rev-parse", "HEAD^{tree}");
    const checkoutStatus = git(checkout, "status", "--porcelain", "--untracked-files=all");
    assertExactHexSha(`${label} commit`, checkoutCommit, options.expectedCommit);
    assertExactHexSha(`${label} tree`, checkoutTree, options.expectedTree);
    if (checkoutStatus.length !== 0) {
      throw new Error(`Disposable worktree ${label} is not clean: ${checkoutStatus}`);
    }

    const gateArgs = [
      resolve(checkout, "tools/repair/run-r0b-toolchain-gate-entry.mjs"),
      "--repo", checkout,
      "--expected-repository", options.expectedRepository,
      "--expected-commit", options.expectedCommit,
      "--expected-tree", options.expectedTree,
      "--expected-node", options.expectedNode,
      "--expected-npm", options.expectedNpm,
      "--expected-typescript", options.expectedTypeScript,
      "--expected-vite", options.expectedVite,
      "--receipt-root", gateEvidence,
    ];
    if (options.npmCli !== null) gateArgs.push("--npm-cli", options.npmCli);
    if (options.preflightOnly) gateArgs.push("--preflight-only");

    const startedAt = new Date();
    const gateResult = run(process.execPath, gateArgs, {
      cwd: checkout,
      allowFailure: true,
    });
    const finishedAt = new Date();
    await writeFile(resolve(campaignRoot, `run-${label}.stdout.log`), gateResult.stdout, "utf8");
    await writeFile(resolve(campaignRoot, `run-${label}.stderr.log`), gateResult.stderr, "utf8");
    const loaded = await readSingleGateReceipt(gateEvidence);
    receipt.runs.push({
      label,
      checkout,
      receiptPath: loaded.path,
      exitCode: gateResult.status,
      startedAtUtc: startedAt.toISOString(),
      finishedAtUtc: finishedAt.toISOString(),
      stdoutSha256: sha256Text(gateResult.stdout),
      stderrSha256: sha256Text(gateResult.stderr),
      result: loaded.receipt.result,
      canonical: loaded.receipt.canonical,
    });
    await save(receiptPath, receipt);

    const requiredResult = options.preflightOnly ? "PREFLIGHT_ONLY_PASS" : "PASS";
    if (gateResult.status !== 0 || loaded.receipt.result !== requiredResult) {
      throw new Error(
        `R0-B run ${label} did not reach ${requiredResult}; exit ${gateResult.status}, result ${loaded.receipt.result}.`,
      );
    }
  }

  receipt.phase = "COMPARE";
  const loadedA = JSON.parse(await readFile(receipt.runs[0].receiptPath, "utf8"));
  const loadedB = JSON.parse(await readFile(receipt.runs[1].receiptPath, "utf8"));
  const comparison = compareToolchainReceipts(loadedA, loadedB, {
    preflightOnly: options.preflightOnly,
  });
  if (!comparison.identical) {
    throw new Error(`Same-OS receipts differ: ${comparison.differences.join(", ")}.`);
  }

  markSameOsPass(receipt, comparison);
  for (const path of [...createdWorktrees].reverse()) await removeWorktree(path);
  await save(receiptPath, receipt);
  console.log(`R0-B same-OS receipt: ${receiptPath}`);
} catch (error) {
  markSameOsFailure(receipt, receipt.phase, error);
  receipt.retainedWorktrees = createdWorktrees;
  await save(receiptPath, receipt);
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`R0-B same-OS blocked receipt: ${receiptPath}`);
  process.exitCode = 1;
}
