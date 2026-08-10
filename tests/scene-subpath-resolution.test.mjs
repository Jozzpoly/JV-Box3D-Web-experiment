import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SCENE_PACKAGE_URL } from "../.test-dist/scene/scene-package.js";

test("default scene URL remains portable at root and repository subpath", () => {
  assert.equal(
    new URL(DEFAULT_SCENE_PACKAGE_URL, "https://example.test/").pathname,
    "/scenes/synthetic-flat-lab.scene.json",
  );
  assert.equal(
    new URL(
      DEFAULT_SCENE_PACKAGE_URL,
      "https://example.test/JV-Box3D-Web-experiment/",
    ).pathname,
    "/JV-Box3D-Web-experiment/scenes/synthetic-flat-lab.scene.json",
  );
});
