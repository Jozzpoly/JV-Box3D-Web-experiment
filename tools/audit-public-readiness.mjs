import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPublicReadiness } from "./public-readiness-lib.mjs";

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
console.log(`Reachable refs:          ${report.metrics.reachableRefs}`);
console.log(`Reachable blobs:         ${report.metrics.reachableBlobs}`);
console.log(`Metadata objects:        ${report.metrics.reachableMetadataObjects}`);
console.log(`Blockers:                ${report.blockers.length}`);
console.log(`Review findings:         ${report.reviewFindings.length}`);

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
  console.error("PUBLIC-READY AUDIT: FAIL");
  process.exit(1);
}

console.log("PUBLIC-READY AUDIT: PASS (human review still required)");