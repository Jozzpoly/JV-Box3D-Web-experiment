import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  buildLegacyM6FrontLeftNeutralGeometryReceipt,
} from "../.test-dist/vehicle/m6/m6-neutral-geometry.js";
import {
  JV_M6_FACTORY_RECEIPT_PATH,
  JV_WEB_REPOSITORY,
  serializeJvNeutralGeometryReceiptV1,
} from "../.test-dist/vehicle/neutral-mechanism.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

function gitText(args, label) {
  const value = execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  if (value.length === 0) {
    throw new Error(`${label} resolved to an empty value.`);
  }
  return value.toLowerCase();
}

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-f]{${length}}$`);
  if (!pattern.test(value)) {
    throw new Error(`${label} must be exactly ${length} lowercase hex characters.`);
  }
}

function requireTrackedWorktreeClean() {
  try {
    execFileSync("git", ["diff", "--quiet", "HEAD", "--"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
  } catch {
    throw new Error(
      "Refusing to export JURE neutral geometry receipt: tracked worktree differs from HEAD.",
    );
  }
}

requireTrackedWorktreeClean();
const producerCommit = gitText(["rev-parse", "HEAD"], "producer commit");
const configReceiptGitBlob = gitText(
  ["rev-parse", `HEAD:${JV_M6_FACTORY_RECEIPT_PATH}`],
  "factory receipt Git blob",
);
requireHex(producerCommit, 40, "producer commit");
requireHex(configReceiptGitBlob, 40, "factory receipt Git blob");

const configReceiptBytes = execFileSync(
  "git",
  ["cat-file", "blob", configReceiptGitBlob],
  { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] },
);
const configReceiptSha256 = createHash("sha256")
  .update(configReceiptBytes)
  .digest("hex");
requireHex(configReceiptSha256, 64, "factory receipt SHA-256");

const snapshot = await validatePinnedNativeFactoryReceiptText(
  configReceiptBytes.toString("utf8"),
);
const config = m6TopologyConfigFromReceipt(snapshot);
const receipt = buildLegacyM6FrontLeftNeutralGeometryReceipt(config, {
  kind: "legacy-procedural-m6",
  producer: { repository: JV_WEB_REPOSITORY, commit: producerCommit },
  configReceipt: {
    path: JV_M6_FACTORY_RECEIPT_PATH,
    gitBlob: configReceiptGitBlob,
    sha256: configReceiptSha256,
  },
});

process.stdout.write(serializeJvNeutralGeometryReceiptV1(receipt));
