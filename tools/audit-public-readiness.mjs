import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPublicReadiness } from "./public-readiness-report.mjs";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  const value = process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

const reportOnly = process.argv.includes("--report-only");
const root = resolve(argument("--root") ?? defaultRoot);
const outputPath = resolve(
  argument("--output") ?? resolve(root, ".local-audit", "public-readiness.json"),
);
const repository =
  argument("--repository") ?? "Jozzpoly/JV-Box3D-Web-experiment";

const report = await auditPublicReadiness({ root, repository });
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Public-readiness report: ${relative(root, outputPath)}`);
console.log(`Reachable refs:           ${report.metrics.reachableRefs}`);
console.log(`Reachable blobs:          ${report.metrics.reachableBlobs}`);
console.log(`Metadata objects:         ${report.metrics.reachableMetadataObjects}`);
console.log(
  `Public contracts:        ${report.metrics.presentPublicContracts}/${report.metrics.requiredPublicContracts}`,
);
console.log(`Reviewed remote branches: ${report.metrics.reviewedRemoteBranches}`);
console.log(`Blocked orphan branches:  ${report.metrics.blockedOrphanBranches}`);
console.log(`Unknown remote branches:  ${report.metrics.unknownRemoteBranches}`);
console.log(`Unclassified tags:        ${report.metrics.unclassifiedTags}`);
console.log(`Ref-policy status:        ${report.publicRefPolicy.status}`);
console.log(`Local HEAD:               ${report.publicRefPolicy.headCommit}`);
console.log(
  `origin candidate:         ${report.publicRefPolicy.remoteCandidateCommit ?? "unresolved"}`,
);
console.log(`Blockers:                 ${report.blockers.length}`);
console.log(`Review findings:          ${report.reviewFindings.length}`);

for (const missingPath of report.publicContracts.missing) {
  console.error(`MISSING PUBLIC CONTRACT: ${missingPath}`);
}
for (const orphan of report.publicRefPolicy.blockedOrphans) {
  console.error(`BLOCKED ORPHAN REF: ${orphan.ref} @ ${orphan.commit ?? "unresolved"}`);
}
for (const unknown of report.publicRefPolicy.unknown) {
  console.error(`UNCLASSIFIED REMOTE REF: ${unknown.ref} @ ${unknown.commit ?? "unresolved"}`);
}
for (const tag of report.publicRefPolicy.tags) {
  console.error(`UNCLASSIFIED TAG: ${tag.ref} @ ${tag.commit ?? "unresolved"}`);
}
for (const blocker of report.blockers) {
  console.error(
    `BLOCKER: ${blocker.signature} · ${blocker.scope} · ${blocker.path}${blocker.line ? `:${blocker.line}` : ""}${blocker.objectSha ? ` · ${blocker.objectSha.slice(0, 12)}` : ""}`,
  );
}
for (const finding of report.reviewFindings.slice(0, 20)) {
  console.warn(
    `REVIEW: ${finding.signature} · ${finding.scope} · ${finding.path}${finding.line ? `:${finding.line}` : ""}${finding.objectSha ? ` · ${finding.objectSha.slice(0, 12)}` : ""}`,
  );
}
if (report.reviewFindings.length > 20) {
  console.warn(
    `REVIEW: ${report.reviewFindings.length - 20} additional finding(s) are recorded in the JSON report.`,
  );
}

if (report.blockers.length > 0) {
  console.error("SOURCE-PUBLIC-READY AUDIT: FAIL");
  if (!reportOnly) {
    process.exit(1);
  }
  console.log(
    "Report-only mode: blocker findings were preserved without treating the completed scan as a process crash.",
  );
} else {
  console.log(
    "SOURCE-PUBLIC-READY AUDIT: PASS (review ledger, GitHub cloud/settings and owner approval still remain separate)",
  );
}
