import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { copyFile, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const isWindows = process.platform === "win32";
const expectedRepository = "Jozzpoly/JV-Box3D-Web-experiment";
const factoryReceiptPath = "public/receipts/jv_m6_factory_receipt.json";
const bundleForbiddenMarkers = [
  "jv-neutral-mechanism/v1",
  "jv-neutral-geometry-receipt/v1",
  "m6.front-left.double-wishbone.legacy-procedural",
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: options.env ?? process.env,
    encoding: options.encoding ?? "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (options.expectFailure === true) {
    if (result.status === 0) {
      throw new Error(`${command} ${args.join(" ")} unexpectedly succeeded.`);
    }
    return result;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status ?? "unknown"}.`);
  }
  return result;
}

function runNpm(args, options = {}) {
  if (!isWindows) {
    return run("npm", args, options);
  }

  const commandShell = process.env.ComSpec ?? "cmd.exe";
  return run(commandShell, ["/d", "/s", "/c", "npm.cmd", ...args], options);
}

function gitText(args, env = process.env) {
  return run("git", args, { capture: true, env }).stdout.trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function requireCanonicalOrigin() {
  const origin = gitText(["config", "--get", "remote.origin.url"]).replace(/\.git$/i, "");
  const accepted = new Set([
    `https://github.com/${expectedRepository}`,
    `git@github.com:${expectedRepository}`,
    `ssh://git@github.com/${expectedRepository}`,
  ]);
  assert(accepted.has(origin), `Gate requires canonical origin ${expectedRepository}; found ${JSON.stringify(origin)}.`);
}

function requireCleanRepository(label) {
  const status = gitText(["status", "--porcelain"]);
  assert(status.length === 0, `${label}: repository is not clean:\n${status}`);
}

function exporterResult(env = process.env, expectFailure = false) {
  return run(process.execPath, ["tools/write-jure-neutral-geometry-receipt.mjs"], {
    capture: true,
    env,
    expectFailure,
  });
}

function validateReceipt(text, head) {
  const receipt = JSON.parse(text);
  assert(receipt.format === "jv-neutral-geometry-receipt/v1", "Unexpected neutral receipt format.");
  assert(receipt.source?.producer?.repository === expectedRepository, "Receipt repository provenance mismatch.");
  assert(receipt.source?.producer?.commit === head, "Receipt producer commit does not equal HEAD.");
  assert(receipt.source?.configReceipt?.path === factoryReceiptPath, "Receipt factory path mismatch.");

  const expectedBlob = gitText(["rev-parse", `HEAD:${factoryReceiptPath}`]);
  assert(receipt.source.configReceipt.gitBlob === expectedBlob, "Receipt factory Git blob mismatch.");

  const factoryBytes = run("git", ["cat-file", "blob", expectedBlob], {
    capture: true,
    encoding: null,
  }).stdout;
  const expectedSha256 = createHash("sha256").update(factoryBytes).digest("hex");
  assert(receipt.source.configReceipt.sha256 === expectedSha256, "Receipt factory SHA-256 mismatch.");

  assert(receipt.mechanism?.coordinateSpace?.id === "jv-rig-space/v1", "Receipt rig-space id mismatch.");
  assert(receipt.mechanism.coordinateSpace.units === "metres", "Receipt units mismatch.");
  assert(receipt.mechanism.coordinateSpace.handedness === "right", "Receipt handedness mismatch.");
  assert(receipt.mechanism.coordinateSpace.forwardAxis === "+X", "Receipt forward axis mismatch.");
  assert(receipt.mechanism.coordinateSpace.upAxis === "+Y", "Receipt up axis mismatch.");
  assert(receipt.mechanism.coordinateSpace.rightAxis === "+Z", "Receipt right axis mismatch.");

  return createHash("sha256").update(text).digest("hex");
}

async function requireBundleExcludesNeutralSeam() {
  const dist = join(root, "dist");
  const pending = [dist];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(path);
        continue;
      }
      if (!/\.(?:html|js|css)$/i.test(entry.name)) {
        continue;
      }
      const text = await readFile(path, "utf8");
      for (const marker of bundleForbiddenMarkers) {
        assert(!text.includes(marker), `Production bundle leaked neutral-rig marker ${JSON.stringify(marker)} in ${relative(root, path)}.`);
      }
    }
  }
}

async function falsifyWrongOriginGuard() {
  const env = {
    ...process.env,
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "remote.origin.url",
    GIT_CONFIG_VALUE_0: "https://github.com/Jozzpoly/not-jv-web",
  };
  const result = exporterResult(env, true);
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  assert(output.includes("does not identify Jozzpoly/JV-Box3D-Web-experiment"), "Wrong-origin falsifier failed for the wrong reason.");
}

async function falsifyDirtyTrackedSourceGuard() {
  const temp = await mkdtemp(join(tmpdir(), "jv-neutral-rig-gate-"));
  try {
    const sourceIndex = gitText(["rev-parse", "--git-path", "index"]);
    const sourceIndexPath = isAbsolute(sourceIndex) ? sourceIndex : join(root, sourceIndex);
    const tempIndex = join(temp, "index");
    await copyFile(sourceIndexPath, tempIndex);
    const env = { ...process.env, GIT_INDEX_FILE: tempIndex };
    run("git", ["update-index", "--force-remove", "README.md"], { env });
    const result = exporterResult(env, true);
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    assert(output.includes("tracked worktree differs from HEAD"), "Dirty-source falsifier failed for the wrong reason.");
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function main() {
  gitText(["rev-parse", "--show-toplevel"]);
  requireCanonicalOrigin();
  requireCleanRepository("initial gate");

  const head = gitText(["rev-parse", "HEAD"]);
  console.log(`JV neutral-rig foundation gate: ${head}`);

  console.log("[1/9] Installing exact lockfile dependencies...");
  runNpm(["ci"]);

  console.log("[2/9] Strict TypeScript check...");
  runNpm(["run", "typecheck"]);

  console.log("[3/9] Focused neutral-rig geometry/provenance tests...");
  runNpm(["test", "--", "tests/jure-neutral-geometry.test.mjs"]);

  console.log("[4/9] Deterministic receipt + exact provenance...");
  const first = exporterResult().stdout;
  const second = exporterResult().stdout;
  assert(first === second, "Neutral receipt exporter is not deterministic across consecutive runs.");
  const receiptSha256 = validateReceipt(first, head);

  console.log("[5/9] Wrong-origin fail-closed falsifier...");
  await falsifyWrongOriginGuard();

  console.log("[6/9] Dirty tracked-source fail-closed falsifier...");
  await falsifyDirtyTrackedSourceGuard();

  console.log("[7/9] Full repository check...");
  runNpm(["run", "check"]);

  console.log("[8/9] Production bundle + neutral-seam leak scan...");
  runNpm(["run", "build:bundle"]);
  await requireBundleExcludesNeutralSeam();

  console.log("[9/9] Final repository cleanliness...");
  requireCleanRepository("final gate");

  console.log(`PASS: JV neutral-rig foundation ${head}`);
  console.log(`receipt sha256: ${receiptSha256}`);
}

await main();
