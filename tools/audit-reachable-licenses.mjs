import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inventoryReachableLicenses } from "./license-inventory-lib.mjs";

const reportOnly = process.argv.includes("--report-only");
const root = fileURLToPath(new URL("../", import.meta.url));
const outputPath = resolve(root, ".local-audit", "license-inventory.json");
const report = inventoryReachableLicenses({ root });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`License inventory: ${relative(root, outputPath)}`);
console.log(
  `Current root project licenses: ${report.currentProjectLicensePaths.length}`,
);
console.log(
  `Current third-party notices:   ${report.currentThirdPartyNoticePaths.length}`,
);
console.log(
  `Current nested vendor licenses: ${report.currentThirdPartyLicensePaths.length}`,
);
console.log(`Reachable license/notice blobs:  ${report.records.length}`);
console.log(
  `Detected root project licenses: ${report.detectedProjectLicenses.join(", ") || "none"}`,
);
for (const finding of report.findings) {
  const writer = finding.severity === "BLOCKER" ? console.error : console.warn;
  writer(`${finding.severity}: ${finding.id} · ${finding.message}`);
}

const blocked = report.findings.some(
  (finding) => finding.severity === "BLOCKER",
);
if (blocked) {
  console.error("PROJECT LICENSE INVENTORY: BLOCKED");
  if (!reportOnly) {
    process.exit(1);
  }
  console.log(
    "Report-only mode: findings were preserved for owner classification without treating the completed inventory as a process crash.",
  );
} else if (report.findings.length > 0) {
  console.warn("PROJECT LICENSE INVENTORY: REVIEW REQUIRED");
} else {
  console.log("PROJECT LICENSE INVENTORY: PASS");
}
