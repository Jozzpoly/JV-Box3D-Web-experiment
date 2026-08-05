function fixtureRecord(value) {
  return Object.freeze({ ...value });
}

export const TINY_VEHICLE_VISUAL_FIXTURE = fixtureRecord({
  id: "m6-tiny-rig-proof-v1",
  packageDirectory: "vehicles/tiny",
  packagePath: "vehicles/tiny/vehicle.visual.json",
  modelFileName: "m6-rig-proof.glb",
  assetPath: "vehicles/tiny/models/m6-rig-proof.glb",
  capabilityId: "UNLIT_POSITION_BASE_COLOR_V1",
});

export const LIT_NORMAL_VEHICLE_VISUAL_FIXTURE = fixtureRecord({
  id: "m6-lit-normal-rig-proof-v1",
  packageDirectory: "vehicles/lit-normal",
  packagePath: "vehicles/lit-normal/vehicle.visual.json",
  modelFileName: "m6-lit-normal-proof.glb",
  assetPath: "vehicles/lit-normal/models/m6-lit-normal-proof.glb",
  capabilityId: "LIT_NORMAL_BASE_COLOR_V1",
});

export const GENERATED_VEHICLE_VISUAL_FIXTURES = Object.freeze([
  TINY_VEHICLE_VISUAL_FIXTURE,
  LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
]);

export const GENERATED_VEHICLE_VISUAL_RUNTIME_ASSETS = Object.freeze(
  GENERATED_VEHICLE_VISUAL_FIXTURES.flatMap((fixture) => [
    fixture.packagePath,
    fixture.assetPath,
  ]),
);
