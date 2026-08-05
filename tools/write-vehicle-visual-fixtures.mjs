import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import {
  LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
  TINY_VEHICLE_VISUAL_FIXTURE,
} from "./generated-vehicle-visual-fixture-catalog.mjs";
import { buildLitNormalVehicleVisualFixture } from "./lit-normal-vehicle-visual-fixture-lib.mjs";
import { buildTinyVehicleVisualFixture } from "./tiny-vehicle-visual-fixture-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePublicDirectory = resolve(root, "public");
const generatedPublicDirectory = resolve(root, ".local-assets/public");
const EXPECTED_TINY_BYTE_LENGTH = 2628;
const EXPECTED_TINY_SHA256 =
  "b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281";

function assertCatalogMatch(record, fixture) {
  if (fixture.visualPackage.id !== record.id) {
    throw new Error(
      `Generated fixture id ${fixture.visualPackage.id} differs from catalog id ${record.id}.`,
    );
  }
  if (fixture.visualPackage.asset.url !== `models/${record.modelFileName}`) {
    throw new Error(
      `Generated fixture ${record.id} asset URL ${fixture.visualPackage.asset.url} differs from catalog model ${record.modelFileName}.`,
    );
  }
  if (fixture.visualPackage.asset.byteLength !== fixture.glb.byteLength) {
    throw new Error(
      `Generated fixture ${record.id} manifest byte length differs from its GLB bytes.`,
    );
  }
}

async function writeFixture(record, fixture) {
  const packageDirectory = resolve(
    generatedPublicDirectory,
    record.packageDirectory,
  );
  const modelDirectory = resolve(packageDirectory, "models");
  await mkdir(modelDirectory, { recursive: true });
  await writeFile(resolve(modelDirectory, record.modelFileName), fixture.glb);
  await writeFile(
    resolve(packageDirectory, "vehicle.visual.json"),
    fixture.manifestText,
    "utf8",
  );
}

const buildOptions = {
  partIds: M6_VISUAL_PART_IDS,
  segmentIds: M6_VISUAL_SEGMENT_IDS,
};
const tiny = buildTinyVehicleVisualFixture(buildOptions);
const litNormal = buildLitNormalVehicleVisualFixture(buildOptions);

assertCatalogMatch(TINY_VEHICLE_VISUAL_FIXTURE, tiny);
assertCatalogMatch(LIT_NORMAL_VEHICLE_VISUAL_FIXTURE, litNormal);
if (
  tiny.glb.byteLength !== EXPECTED_TINY_BYTE_LENGTH ||
  tiny.visualPackage.asset.sha256 !== EXPECTED_TINY_SHA256
) {
  throw new Error(
    `Tiny fixture identity drifted before staging: ${tiny.glb.byteLength} bytes · ${tiny.visualPackage.asset.sha256}.`,
  );
}

await rm(generatedPublicDirectory, { recursive: true, force: true });
await mkdir(resolve(root, ".local-assets"), { recursive: true });
await cp(sourcePublicDirectory, generatedPublicDirectory, { recursive: true });
await rm(resolve(generatedPublicDirectory, "vehicles"), {
  recursive: true,
  force: true,
});
await writeFixture(TINY_VEHICLE_VISUAL_FIXTURE, tiny);
await writeFixture(LIT_NORMAL_VEHICLE_VISUAL_FIXTURE, litNormal);

console.log(
  `Generated public staging prepared at ${generatedPublicDirectory}.`,
);
console.log(
  `Tiny vehicle visual fixture written: ${tiny.glb.byteLength} bytes · ${tiny.visualPackage.asset.sha256}.`,
);
console.log(
  `Lit-normal vehicle visual fixture written: ${litNormal.glb.byteLength} bytes · ${litNormal.visualPackage.asset.sha256}.`,
);
