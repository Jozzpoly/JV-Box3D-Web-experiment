import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditOrphanRefHistories } from "./orphan-ref-history-audit-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputPath = resolve(root, ".local-audit", "orphan-ref-history.json");
const reportOnly = process.argv.includes("--report-only");
const orphanRefs = [
  "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03",
  "refs/remotes/origin/agent/terrain-scan-integration",
];
const report = auditOrphanRefHistories({
  root,
  orphanRefs,
  baselineRef:
    "refs/remotes/origin/agent/jv-web-demonstrator-foundation",
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Orphan-history report: ${relative(root, outputPath)}`);
console.log(`Source commit:         ${report.sourceCommit}`);
console.log(`Baseline ref:          ${report.baselineRef}`);
console.log(`Secret blockers:       ${report.blockerCount}`);
console.log(`Review records:        ${report.reviewCount}`);
for (const result of report.results) {
  console.log(`\nRef:                   ${result.orphanRef}`);
  console.log(`Unique commits:        ${result.uniqueCommitCount}`);
  console.log(`Unique objects:        ${result.uniqueObjectCount}`);
  console.log(`Unique blobs:          ${result.uniqueBlobCount}`);
  console.log(`Changed path records:  ${result.changedPathRecordCount}`);
  console.log(`Asset candidates:      ${result.assetCandidates.length}`);
  console.log(`Workflow candidates:   ${result.workflowCandidates.length}`);
  console.log(`Session/receipt paths: ${result.sessionAndReceiptCandidates.length}`);
  console.log(`Local bridge markers:  ${result.localBridgeFindings.length}`);
  console.log(`Privacy/binary review: ${result.reviewFindings.length}`);
  console.log(`Secret blockers:       ${result.blockers.length}`);
  console.log(`Status:                ${result.status}`);
}

if (report.blockerCount > 0) {
  console.error("ORPHAN UNIQUE-HISTORY AUDIT: BLOCKED");
  if (!reportOnly) {
    process.exit(1);
  }
  console.log(
    "Report-only mode: secret findings were recorded as fingerprints; no ref was moved or deleted.",
  );
} else if (report.reviewCount > 0) {
  console.warn("ORPHAN UNIQUE-HISTORY AUDIT: REVIEW REQUIRED");
} else {
  console.log("ORPHAN UNIQUE-HISTORY AUDIT: NO FINDINGS");
}

console.log("Ref mutation:           NOT PERFORMED");
console.log("Visibility/publication: NOT PERFORMED");
