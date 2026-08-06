import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validatePublicPlayableArtifact } from "../tools/release/public-playable-release-lib.mjs";

async function fixture(overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), "jv-public-release-"));
  await mkdir(join(root, "assets"));
  await writeFile(
    join(root, "index.html"),
    overrides.index ?? '<script type="module" src="./assets/app.js"></script>',
  );
  await writeFile(join(root, ".nojekyll"), "");
  await writeFile(join(root, "assets", "app.js"), overrides.js ?? "console.log('JV');");
  await writeFile(
    join(root, "release-manifest.json"),
    JSON.stringify(overrides.manifest ?? {
      schema: "JV_WEB_PUBLIC_PLAYABLE_RELEASE_V1",
      mode: "MAP_ONLY_PUBLIC_R0",
      privateScanIncluded: false,
    }),
  );
  return root;
}

test("map-only public artifact passes the release audit", async () => {
  const receipt = await validatePublicPlayableArtifact(await fixture());
  assert.equal(receipt.mode, "MAP_ONLY_PUBLIC_R0");
  assert.equal(receipt.privateScanIncluded, false);
});

test("absolute project-root references fail closed", async () => {
  await assert.rejects(
    validatePublicPlayableArtifact(await fixture({
      index: '<script type="module" src="/assets/app.js"></script>',
    })),
    /non-relative HTML reference/,
  );
});

test("private local paths fail closed", async () => {
  await assert.rejects(
    validatePublicPlayableArtifact(await fixture({
      js: 'const scan = "C:\\\\private\\\\scan";',
    })),
    /private\/local data/,
  );
});

test("release manifest cannot claim a private scan", async () => {
  await assert.rejects(
    validatePublicPlayableArtifact(await fixture({
      manifest: {
        schema: "JV_WEB_PUBLIC_PLAYABLE_RELEASE_V1",
        mode: "MAP_ONLY_PUBLIC_R0",
        privateScanIncluded: true,
      },
    })),
    /fail-closed map-only release/,
  );
});
