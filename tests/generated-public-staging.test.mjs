import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { prepareGeneratedPublicStagingV1 } from "../tools/generated-public-staging.mjs";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeText(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, "utf8");
}

test("public staging replaces only generator-owned directories and preserves unrelated assets", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "jv-public-staging-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, "source-public");
  const destination = join(root, "generated-public");

  await writeText(join(source, "scenes", "lab.json"), "scene");
  await writeText(join(source, "vehicles", "tiny", "stale.glb"), "stale");
  await writeText(
    join(source, "vehicles", "lit-normal", "stale.glb"),
    "stale",
  );
  await writeText(
    join(source, "vehicles", "owner-car", "production.glb"),
    "owner",
  );
  await writeText(join(destination, "orphan.txt"), "orphan");

  const receipt = await prepareGeneratedPublicStagingV1({
    sourceDirectory: source,
    destinationDirectory: destination,
    ownedDirectories: ["vehicles/tiny", "vehicles/lit-normal"],
  });

  assert.deepEqual(receipt.ownedDirectories, [
    "vehicles/tiny",
    "vehicles/lit-normal",
  ]);
  assert.equal(
    await readFile(join(destination, "scenes", "lab.json"), "utf8"),
    "scene",
  );
  assert.equal(
    await readFile(
      join(destination, "vehicles", "owner-car", "production.glb"),
      "utf8",
    ),
    "owner",
  );
  assert.equal(await exists(join(destination, "vehicles", "tiny")), false);
  assert.equal(
    await exists(join(destination, "vehicles", "lit-normal")),
    false,
  );
  assert.equal(await exists(join(destination, "orphan.txt")), false);
});

test("invalid ownership paths fail before an existing destination is changed", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "jv-public-staging-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, "source-public");
  const destination = join(root, "generated-public");
  const marker = join(destination, "marker.txt");
  await writeText(join(source, "static.txt"), "source");
  await writeText(marker, "preserve");

  for (const ownedDirectories of [
    ["../escape"],
    ["vehicles\\tiny"],
    ["vehicles/tiny", "vehicles/tiny"],
    ["vehicles", "vehicles/tiny"],
  ]) {
    await assert.rejects(
      prepareGeneratedPublicStagingV1({
        sourceDirectory: source,
        destinationDirectory: destination,
        ownedDirectories,
      }),
      /Generated public staging rejected/,
    );
    assert.equal(await readFile(marker, "utf8"), "preserve");
  }
});

test("source and destination trees must be disjoint before any copy or removal", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "jv-public-staging-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, "public");
  const nestedDestination = join(source, "generated");
  await writeText(join(source, "static.txt"), "source");

  await assert.rejects(
    prepareGeneratedPublicStagingV1({
      sourceDirectory: source,
      destinationDirectory: nestedDestination,
      ownedDirectories: ["vehicles/tiny"],
    }),
    /directory trees must be disjoint/,
  );
  assert.equal(await readFile(join(source, "static.txt"), "utf8"), "source");

  const outerDestination = join(root, "outer-generated");
  const nestedSource = join(outerDestination, "source-public");
  await writeText(join(nestedSource, "static.txt"), "nested-source");
  await assert.rejects(
    prepareGeneratedPublicStagingV1({
      sourceDirectory: nestedSource,
      destinationDirectory: outerDestination,
      ownedDirectories: ["vehicles/tiny"],
    }),
    /directory trees must be disjoint/,
  );
  assert.equal(
    await readFile(join(nestedSource, "static.txt"), "utf8"),
    "nested-source",
  );
});
