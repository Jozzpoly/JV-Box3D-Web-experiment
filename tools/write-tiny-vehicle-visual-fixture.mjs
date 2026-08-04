import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildTinyVehicleVisualFixture } from "./tiny-vehicle-visual-fixture-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageDirectory = resolve(root, "public/vehicles/tiny");
const modelDirectory = resolve(packageDirectory, "models");
const fixture = buildTinyVehicleVisualFixture({
  partIds: M6_VISUAL_PART_IDS,
  segmentIds: M6_VISUAL_SEGMENT_IDS,
});

await mkdir(modelDirectory, { recursive: true });
await writeFile(
  resolve(modelDirectory, "m6-rig-proof.glb"),
  fixture.glb,
);
await writeFile(
  resolve(packageDirectory, "vehicle.visual.json"),
  fixture.manifestText,
  "utf8",
);

console.log(
  `Tiny vehicle visual fixture written: ${fixture.glb.byteLength} bytes · ${fixture.visualPackage.asset.sha256}.`,
);
