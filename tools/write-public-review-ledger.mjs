import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicReviewLedger } from "./public-review-ledger-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const reportPath = resolve(root, ".local-audit", "public-readiness.json");
const ledgerPath = resolve(
  root,
  ".local-audit",
  "public-review-classifications.json",
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

let previousLedger = null;
try {
  previousLedger = await readJson(ledgerPath);
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const report = await readJson(reportPath);
const ledger = createPublicReviewLedger(report, previousLedger);
await mkdir(dirname(ledgerPath), { recursive: true });
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

const pending = ledger.entries.filter(
  (entry) => entry.disposition === "PENDING",
).length;
const accepted = ledger.entries.filter(
  (entry) => entry.disposition === "ACCEPTED",
).length;
const remediate = ledger.entries.filter(
  (entry) => entry.disposition === "REMEDIATE",
).length;

console.log(`Review ledger: ${relative(root, ledgerPath)}`);
console.log(`Source commit: ${ledger.sourceCommit}`);
console.log(`Findings:      ${ledger.entries.length}`);
console.log(`Pending:       ${pending}`);
console.log(`Accepted:      ${accepted}`);
console.log(`Remediate:     ${remediate}`);
console.log(
  "The ledger is ignored local evidence. Fill only sanitized classifications; never paste raw secret or private identifiers.",
);
