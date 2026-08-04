import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertLegacyM6SceneSupport,
  DEFAULT_SCENE_PACKAGE_URL,
  loadScenePackageV1,
  validateScenePackageV1,
} from "../.test-dist/scene/scene-package.js";

const root = fileURLToPath(new URL("../", import.meta.url));

async function defaultSceneJson() {
  return JSON.parse(
    await readFile(
      resolve(root, "public/scenes/synthetic-flat-lab.scene.json"),
      "utf8",
    ),
  );
}

function glbScene(url) {
  return {
    kind: "GLB",
    url,
    sha256: "a".repeat(64),
  };
}

test("canonical synthetic scene is strict, frozen and supported by legacy M6", async () => {
  const scene = validateScenePackageV1(await defaultSceneJson());
  assert.equal(Object.isFrozen(scene), true);
  assert.equal(scene.id, "synthetic-flat-lab");
  assert.deepEqual(scene.axes, {
    forward: "+X",
    up: "+Y",
    right: "+Z",
  });
  assert.deepEqual(scene.spawn, {
    position: [0, 1.2, 0],
    yawRadians: 0,
  });
  assert.deepEqual(scene.render, { kind: "NONE" });
  assert.deepEqual(scene.collision, {
    kind: "BUILTIN_GROUND_PLANE",
    heightMeters: 0,
  });
  assert.doesNotThrow(() => assertLegacyM6SceneSupport(scene));
});

test("scene loader uses a site-relative default URL", async () => {
  let requested = null;
  const fixture = await defaultSceneJson();
  const scene = await loadScenePackageV1(async (url) => {
    requested = url;
    return {
      ok: true,
      status: 200,
      async json() {
        return fixture;
      },
    };
  });
  assert.equal(DEFAULT_SCENE_PACKAGE_URL.startsWith("/"), false);
  assert.equal(requested, DEFAULT_SCENE_PACKAGE_URL);
  assert.equal(scene.id, "synthetic-flat-lab");
});

test("unknown scene fields, identifiers and coordinate conventions fail closed", async () => {
  const extra = await defaultSceneJson();
  extra.hiddenScale = 0.01;
  assert.throws(() => validateScenePackageV1(extra), /scene keys differ/);

  const invalidId = await defaultSceneJson();
  invalidId.id = "Synthetic Flat Lab";
  assert.throws(
    () => validateScenePackageV1(invalidId),
    /lowercase kebab-case/,
  );

  const wrongAxes = await defaultSceneJson();
  wrongAxes.axes.forward = "+Z";
  assert.throws(
    () => validateScenePackageV1(wrongAxes),
    /scene.axes.forward/,
  );
});

test("scene asset URLs remain clean, site-relative and inside the package", async () => {
  const rejectedUrls = [
    "https://example.test/scan.glb",
    "/assets/scan.glb",
    "../collision.glb",
    "assets/%2e%2e/collision.glb",
    "assets\\scan.glb",
    "assets//scan.glb",
    "assets/./scan.glb",
    "assets/scan.glb?version=1",
    "assets/scan.glb#mesh",
  ];

  for (const url of rejectedUrls) {
    const fixture = await defaultSceneJson();
    fixture.render = glbScene(url);
    assert.throws(
      () => validateScenePackageV1(fixture),
      /site-relative|inside its scene package/,
      url,
    );
  }

  const valid = await defaultSceneJson();
  valid.render = glbScene("assets/scan.glb");
  assert.equal(validateScenePackageV1(valid).render.kind, "GLB");
});

test("legacy M6 rejects scene features it cannot execute yet", async () => {
  const glb = await defaultSceneJson();
  glb.render = glbScene("assets/scan.glb");
  assert.throws(
    () => assertLegacyM6SceneSupport(validateScenePackageV1(glb)),
    /render source GLB/,
  );

  const mesh = await defaultSceneJson();
  mesh.collision = {
    kind: "TRIANGLE_MESH",
    url: "assets/collision.glb",
    sha256: "b".repeat(64),
  };
  assert.throws(
    () => assertLegacyM6SceneSupport(validateScenePackageV1(mesh)),
    /collision source TRIANGLE_MESH/,
  );

  const raisedGround = await defaultSceneJson();
  raisedGround.collision.heightMeters = 1;
  assert.throws(
    () => assertLegacyM6SceneSupport(validateScenePackageV1(raisedGround)),
    /ground plane at y=0/,
  );

  const rotatedSpawn = await defaultSceneJson();
  rotatedSpawn.spawn.yawRadians = Math.PI;
  assert.throws(
    () => assertLegacyM6SceneSupport(validateScenePackageV1(rotatedSpawn)),
    /yawRadians = 0/,
  );
});

test("application and portable manifest consume the scene contract explicitly", async () => {
  const [mainSource, manifestWriter] = await Promise.all([
    readFile(resolve(root, "src/main.ts"), "utf8"),
    readFile(resolve(root, "tools/write-portable-build-manifest.mjs"), "utf8"),
  ]);
  assert.match(mainSource, /loadScenePackageV1\(\)/);
  assert.match(mainSource, /scene\.spawn\.position/);
  assert.doesNotMatch(mainSource, /spawn:\s*\{\s*x:\s*0,\s*y:\s*1\.2/);
  assert.match(
    manifestWriter,
    /scenes\/synthetic-flat-lab\.scene\.json/,
  );
});
