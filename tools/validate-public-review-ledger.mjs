import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePublicReviewLedger } from "./public-review-ledger-lib.mjs";

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

const report = await readJson(reportPath);
const ledger = await readJson(ledgerPath);
const result = validatePublicReviewLedger(report, ledger);

console.log(`Public report: ${relative(root, reportPath)}`);
console.log(`Review ledger: ${relative(root, ledgerPath)}`);
if (result.counts !== null) {
  console.log(`Expected findings: ${result.counts.expected}`);
  console.log(`Accepted:          ${result.counts.accepted}`);
  console.log(`Pending:           ${result.counts.pending}`);
  console.log(`Remediate:         ${result.counts.remediate}`);
}
for (const warning of result.warnings) {
  console.warn(`REVIEW WARNING: ${warning}`);
}
if (result.errors.length > 0) {
  console.error(
    `PUBLIC REVIEW CLASSIFICATION: FAIL (${result.errors.length} error(s))`,
  );
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("PUBLIC REVIEW CLASSIFICATION: PASS");
