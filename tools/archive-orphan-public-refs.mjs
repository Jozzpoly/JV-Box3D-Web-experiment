import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createOrphanRefArchive } from "./orphan-ref-archive-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundlePath = resolve(
  root,
  ".local-audit",
  "jv-web-orphan-public-refs-2026-08-04.bundle",
);
const receiptPath = resolve(
  root,
  ".local-audit",
  "orphan-public-refs-archive.json",
);
const refs = [
  "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03",
  "refs/remotes/origin/agent/terrain-scan-integration",
];

await mkdir(dirname(bundlePath), { recursive: true });
const receipt = await createOrphanRefArchive({ root, bundlePath, refs });
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

console.log(`Private Git bundle: ${relative(root, bundlePath)}`);
console.log(`Archive receipt:    ${relative(root, receiptPath)}`);
console.log(`Bytes:              ${receipt.bytes}`);
console.log(`SHA-256:            ${receipt.sha256}`);
for (const entry of receipt.refs) {
  console.log(`Archived ref:       ${entry.ref} @ ${entry.commit}`);
}
console.log("Verification:        PASS");
console.log("Remote refs changed: NO");
console.log(
  "Next step requires explicit Jozz review. This command did not delete, move, publish or change visibility of any ref.",
);
