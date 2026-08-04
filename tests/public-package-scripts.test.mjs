import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function readPackage() {
  return JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
}

test("package exposes strict, report-only, review and integration audits", async () => {
  const packageJson = await readPackage();
  assert.equal(packageJson.private, true);
  assert.equal(
    packageJson.scripts["audit:public"],
    "node tools/audit-public-readiness.mjs",
  );
  assert.equal(
    packageJson.scripts["audit:public:report"],
    "node tools/audit-public-readiness.mjs --report-only",
  );
  assert.equal(
    packageJson.scripts["audit:public:review-template"],
    "node tools/write-public-review-ledger.mjs",
  );
  assert.equal(
    packageJson.scripts["audit:public:review-check"],
    "node tools/validate-public-review-ledger.mjs",
  );
  assert.equal(
    packageJson.scripts["audit:integration"],
    "node tools/audit-source-public-integration.mjs",
  );
  assert.equal(
    packageJson.scripts["audit:integration:report"],
    "node tools/audit-source-public-integration.mjs --report-only",
  );
  assert.equal(
    packageJson.scripts["audit:licenses"],
    "node tools/audit-reachable-licenses.mjs",
  );
  assert.equal(
    packageJson.scripts["audit:licenses:report"],
    "node tools/audit-reachable-licenses.mjs --report-only",
  );
});

test("package has no publish, deploy or Pages script", async () => {
  const packageJson = await readPackage();
  const forbiddenNames = Object.keys(packageJson.scripts).filter((name) =>
    /(?:^|:)(?:publish|deploy|pages)(?:$|:)/i.test(name),
  );
  assert.deepEqual(forbiddenNames, []);

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    assert.equal(
      /\b(?:gh-pages|npm\s+publish|wrangler|vercel|netlify|firebase\s+deploy)\b/i.test(
        command,
      ),
      false,
      `publishing command hidden in ${name}`,
    );
  }
});
