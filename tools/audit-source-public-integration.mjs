import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateSourcePublicIntegration } from "./source-public-integration-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputPath = resolve(root, ".local-audit", "source-public-integration.json");
const reportOnly = process.argv.includes("--report-only");
const report = evaluateSourcePublicIntegration({
  root,
  baseRef: "origin/main",
  candidateRef: "HEAD",
  expectedCandidateBranch: "agent/jv-web-demonstrator-foundation",
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Integration proof: ${relative(root, outputPath)}`);
console.log(`Base:              ${report.baseRef} @ ${report.baseCommit ?? "unresolved"}`);
console.log(
  `Candidate:         ${report.candidateBranch} @ ${report.candidateCommit ?? "unresolved"}`,
);
console.log(`Merge base:         ${report.mergeBase ?? "unresolved"}`);
console.log(`Candidate behind:   ${report.candidateBehind ?? "unresolved"}`);
console.log(`Candidate ahead:    ${report.candidateAhead ?? "unresolved"}`);
console.log(`Working tree clean: ${report.workingTreeClean}`);
console.log(`Fast-forward:       ${report.fastForwardPossible}`);
for (const blocker of report.blockers) {
  console.error(`BLOCKER: ${blocker.id} · ${blocker.message}`);
}

if (!report.fastForwardPossible) {
  console.error("SOURCE-PUBLIC INTEGRATION PROOF: FAIL");
  if (!reportOnly) {
    process.exit(1);
  }
  console.log(
    "Report-only mode: the local Git relation was recorded without moving any ref.",
  );
} else {
  console.log("SOURCE-PUBLIC INTEGRATION PROOF: FAST-FORWARD CANDIDATE");
}
