import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildIdentityVitePlugin } from "../tools/product/build-identity-vite-plugin.mjs";
import { validateBuildIdentity } from "../tools/validate-build-identity.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const SOURCE = "0123456789abcdef0123456789abcdef01234567";
const MARKER = `JV_BUILD_SOURCE:${SOURCE}`;

test("Vite injects one exact deterministic build source commit and literal marker", () => {
  const plugin = buildIdentityVitePlugin({ sourceCommit: SOURCE });
  const config = plugin.config();
  assert.equal(
    JSON.parse(config.define.__JV_BUILD_SOURCE_COMMIT__),
    SOURCE,
  );
  assert.equal(
    JSON.parse(config.define.__JV_BUILD_SOURCE_MARKER__),
    MARKER,
  );
  assert.throws(
    () => buildIdentityVitePlugin({ sourceCommit: "not-a-sha" }),
    /exact 40-character Git SHA/,
  );
});

test("product entry installs a concise Debug build identity", async () => {
  const [entry, runtime] = await Promise.all([
    readFile(path.resolve(root, "src/product-main.ts"), "utf8"),
    readFile(path.resolve(root, "src/runtime/build-identity.ts"), "utf8"),
  ]);

  assert.match(entry, /installJvBuildIdentity\(\)/);
  assert.match(runtime, /Build source/);
  assert.match(runtime, /__JV_BUILD_SOURCE_MARKER__/);
  assert.match(runtime, /dataset\["jvBuildSource"\]/);
  assert.match(runtime, /slice\(0, 12\)/);
});

test("release build identity must match build-manifest source commit", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "jv-build-id-"));
  try {
    await mkdir(path.join(temporary, "assets"), { recursive: true });
    await writeFile(
      path.join(temporary, "build-manifest.json"),
      JSON.stringify({
        source: { commit: SOURCE },
        files: [{ path: "assets/main.js", bytes: 1, sha256: "unused" }],
      }),
    );
    await writeFile(
      path.join(temporary, "assets/main.js"),
      `console.log("${MARKER}");`,
    );

    assert.deepEqual(
      (await validateBuildIdentity(temporary)).errors,
      [],
    );

    await writeFile(
      path.join(temporary, "assets/main.js"),
      "console.log('stale build');",
    );
    assert.match(
      (await validateBuildIdentity(temporary)).errors.join("\n"),
      /does not carry the manifest source identity marker/,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
