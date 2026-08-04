import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inventoryReachableLicenses } from "./license-inventory-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputPath = resolve(root, ".local-audit", "license-inventory.json");
const report = inventoryReachableLicenses({ root });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`License inventory: ${relative(root, outputPath)}`);
console.log(
  `Current project licenses: ${report.currentProjectLicensePaths.length}`,
);
console.log(
  `Current third-party notices: ${report.currentThirdPartyNoticePaths.length}`,
);
console.log(`Reachable license/notice blobs: ${report.records.length}`);
console.log(
  `Detected project license classes: ${report.detectedProjectLicenses.join(", ") || "none"}`,
);
for (const finding of report.findings) {
  const writer = finding.severity === "BLOCKER" ? console.error : console.warn;
  writer(`${finding.severity}: ${finding.id} · ${finding.message}`);
}

if (report.findings.some((finding) => finding.severity === "BLOCKER")) {
  process.exit(1);
}