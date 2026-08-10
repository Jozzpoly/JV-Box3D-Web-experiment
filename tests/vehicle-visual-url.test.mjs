import test from "node:test";
import assert from "node:assert/strict";
import { resolveVehicleVisualAssetUrl } from "../.test-dist/visual/vehicle-visual-url.js";

test("vehicle GLB resolves relative to its manifest at root", () => {
  assert.equal(
    resolveVehicleVisualAssetUrl(
      "https://example.test/",
      "vehicles/m6/vehicle.visual.json",
      "models/m6.glb",
    ),
    "https://example.test/vehicles/m6/models/m6.glb",
  );
});

test("vehicle GLB remains portable under the repository subpath", () => {
  assert.equal(
    resolveVehicleVisualAssetUrl(
      "https://example.test/JV-Box3D-Web-experiment/",
      "vehicles/m6/vehicle.visual.json",
      "models/m6.glb",
    ),
    "https://example.test/JV-Box3D-Web-experiment/vehicles/m6/models/m6.glb",
  );
});

test("vehicle visual resolution rejects escaping and non-web URLs", () => {
  assert.throws(
    () =>
      resolveVehicleVisualAssetUrl(
        "file:///tmp/index.html",
        "vehicles/m6/vehicle.visual.json",
        "models/m6.glb",
      ),
    /HTTP or HTTPS/,
  );
  assert.throws(
    () =>
      resolveVehicleVisualAssetUrl(
        "https://example.test/",
        "../vehicle.visual.json",
        "models/m6.glb",
      ),
    /inside its asset package/,
  );
  assert.throws(
    () =>
      resolveVehicleVisualAssetUrl(
        "https://example.test/",
        "vehicles/m6/vehicle.visual.json",
        "../m6.glb",
      ),
    /inside its asset package/,
  );
});
