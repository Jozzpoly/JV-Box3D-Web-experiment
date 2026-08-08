# JV Web — resource index for fresh-agent handoff

Date: 2026-08-08
Status: **DRAFT / RESOURCE MAP**
Owner: Jozz

Purpose: let a fresh agent reach the relevant source/evidence in a few targeted reads instead of rediscovering the project.

## 1. Active repositories

### Private JV-Web core

```text
Jozzpoly/JV-Box3D-Web-experiment
active branch: development/jv-web-r1
```

Always resolve the current tip.

### Public demo

```text
Jozzpoly/JV-Box3D-Web-Public
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree: f1c5c9a971208d89da05143f10913891a58b3b70
main/rollback: 401068f5734c841d43907b71484bc03a2396c604
Pages: https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

### Native JV — read-only source for this campaign

```text
Jozzpoly/Box3d_FunProject
```

Do not advance it in this campaign.

## 2. User-supplied recovery archives

### Old JV-Web source snapshot

```text
uploaded filename:
  JV-Box3D-Web-experiment(1).zip

SHA-256:
  1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f

contains:
  source tree
  .git
  local branches/reflogs
  ignored build output

snapshot HEAD:
  agent/jv-refoundation-control-plane
  fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

This archive recovered local branch history and an uncommitted scan validation record not preserved identically in GitHub.

### Native JV source snapshot

```text
uploaded filename:
  box3d.zip

SHA-256:
  b22043332ce0cf84d787312aebf8f76dc19bd6431f9a046399dfa7c2300c48f1

snapshot branch:
  jozz-scan-terrain-f0
snapshot HEAD:
  241fe10a9056836332c21d9614471d32d749ce3d

snapshot main:
  959aefb78587ce60cf2b8eb03ff82797a4165142

snapshot recovery/jv-reconstruction:
  b756f09134c3a9b38f99954ada8cc11d18377bf3
```

Use for asset/source/history recovery, not as current native-JV authority.

## 3. Scan recovery — exact lineage

Preserved local/GitHub product line:

```text
product/jv-web-car-map-scan
```

Important local refs recovered from archive:

```text
local/jv-web-car-map-scan
  04713ab33ba8788d3ee404f2165484366b7a717b

local/jv-web-car-map-scan-2
  84910b9c84edd33db5e1f09baf456f978f8368ca

local/jv-web-car-map-scan-3
  106312083875b5aa94cf1f9fc986ac3c26888aa5

local/jv-web-car-map-scan-4
  c8e0bf24748b0a790a1c0039b1be801eef266580
```

Useful progression before the first full green:

```text
7e191e4  shared car/map/scan product contract
f52d822  port E2R into Web product
cf14fd0  load authoritative JSPREV2 textured pack
3629da4  install E2R + scan into Box3D
18be57b  draw E2R + textured JSPREV2 beside live car
3c18454  one E2R/scan camera
3a408df  mobile-safe mesh batching
116b88d  explicit map/scan product entry
f3ed685  boot integrated product entry
04713ab  document mobile renderer + scan spawn
84910b9  group typed-array fix
1063120  harden exact JSPREV2 + E2R integration gate
c8e0bf2  restore native scan UV and view controls
```

Do not infer validation status from this sequence alone; use the recovered evidence record below.

## 4. Recovered exact scan evidence

Preserved canonical summary:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

Key exact identities:

```text
accepted Web car baseline:
  d6aa218064c2653f918cf7956d2fcd20a940caf3

first full green integrated product:
  106312083875b5aa94cf1f9fc986ac3c26888aa5

later visual-fix candidate:
  c8e0bf24748b0a790a1c0039b1be801eef266580

native E2R/scan authority used historically:
  Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142
```

`106312...` is the strongest known green desktop scan-integration anchor.

`c8e0...` is code to freshly validate, not inherited PASS.

Important historical scan source paths at `106312...`:

```text
src/scene/jsprev2-scan.ts
src/scene/product-world.ts
src/scene/product-spawn.ts
src/scene/product-scene-package.ts
src/product-main.ts
src/render/jv-world-renderer.ts
src/render/jv-checked-webgl.ts
```

Tooling:

```text
tools/product/jsprev2-pack-inspector.mjs
tools/product/find-jsprev2-pack.mjs
tools/product/final-jsprev2-vite-plugin.mjs
```

Tests:

```text
tests/jsprev2-scan.test.mjs
tests/product-world.test.mjs
tests/product-spawn.test.mjs
tests/product-entry.test.mjs
tests/product-e2r-drive.test.mjs
tests/jv-checked-webgl.test.mjs
```

Later `c8e0...` visual-policy additions:

```text
src/render/jv-scan-webgl-policy.ts
src/render/jv-product-view-settings.ts
```

plus their focused tests.

## 5. Historical full scan pack identity

```text
pack id:
  source-preview-aee5242a20848294

historical native debug path:
  C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does NOT contain the full 7-tile textured pack.

Historical native document:

```text
docs/archive/map_scan_2026-07/PLAN_FUNDAMENT_TERENU_ZE_SKANU_2026_07_24_PL.md
```

Native record reports:

```text
7 tiles
1,770,391 triangles
```

Recovered Web exact-green record reports:

```text
7 tiles
25 groups
25 textures
1,775,775 triangles
```

Keep the triangle-count discrepancy explicit until the actual pack is recovered and remeasured.

## 6. Cooked native scan collision cache

Present in supplied `box3d.zip`:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
size: 73,156,192 bytes
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

Relevant native source:

```text
samples/jozz_vehicle_scan_import.cpp
samples/jozz_vehicle_scan_import.h
```

This cache is cooked native `b3MeshData` collision state. It is not a textured scan, not the original JSPREV2 pack and not automatically usable as a Web rendering asset.

Useful native scan commits in historical repo include:

```text
53a629e...  scan contract/reader
4977e735... scan terrain/world integration
eea5ca21... BVH/cache loading optimization
4fbb80c...  textured scan renderer
64a8bf2...  scan spawns
959aefb...  recovered E2R + scan regressions to main
```

Resolve full SHAs from Git before using these as exact sources.

## 7. Jozz vehicle body asset

Canonical source asset:

```text
repository:
  Jozzpoly/Box3d_FunProject

path:
  assets/source/Nadwozie.gltf

SHA-256:
  45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8

Git blob:
  a25cb0ef61d342ce476c9ef26a3b24188bace047

generator:
  Blockbench 5.1.4 glTF exporter
```

Asset is self-contained with embedded binary payload and embedded PNG texture.

Historical native integration:

```text
a2759471d8641b9f3a3395d508f6c8116d60c81c
Body: attach Jozz's chassis frame (Nadwozie) as a rigid skin on the chassis
```

Later default-skin/rig commit:

```text
1e9a3fbcc2f5a45c4f05a73ce4a1bd2d46b608dd
```

Historical measured relationship:

```text
model:
  length 3.28 m
  width  2.73 m
  height 1.23 m

vehicle:
  wheelbase 2.50 m
  track     2.10 m

visual mount:
  yaw -90 degrees
  chassis-local position (0, -0.60, 0)
```

Historical references:

```text
docs/archive/ledgers/CHECKPOINTS_2026-07_PL.md
docs/archive/ledgers/CURRENT_STATE_LEGACY_2026-07_PL.md
```

Do not recalibrate from zero without first checking whether current Web coordinate conventions invalidate the known mount.

## 8. Jozz wheel asset

Canonical source:

```text
repository:
  Jozzpoly/Box3d_FunProject

path:
  assets/source/Offroad_Big_Wheels.gltf

SHA-256:
  1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617

Git blob:
  c13c77a8e5552175ee8266b2da33a54691f1dae9

tracked from commit:
  6c7cb18a4a45655797bb1e24d771cad7a5d9d187
```

Self-contained with embedded PNG.

Semantic nodes include:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

The previous native asset-dimension/calibration tooling already used these markers; preserve that advantage.

## 9. Other authored native assets available if needed later

```text
assets/source/One_Sided_wheel_mount.gltf
SHA-256:
374e54eb420f0b3e31bba0d749fdf1cf942db2389361dde1313d7a6b29e77ec2

assets/source/OneSided_Steering_Suspension_Rig.gltf
SHA-256:
57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750

assets/source/Cardan_shaft.gltf
SHA-256:
16f4eab46d526c273f434e109331586df2cd7e3ab0792a4dfbd21d7ed4ef0860
```

Do not promote these into current scope merely because they exist.

## 10. Owner-vehicle tooling candidate

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful tooling:

```text
tools/owner-vehicle/blockbench-gltf-core.mjs
tools/owner-vehicle/blockbench-gltf-inspector.mjs
tools/owner-vehicle/blockbench-gltf-skin.mjs
tools/owner-vehicle/blockbench-owner-m6-r1.mjs
tools/owner-vehicle/owner-m6-rigid-package-r1.mjs
tools/owner-vehicle/owner-m6-visual-calibration-r1.mjs
tools/owner-vehicle/write-owner-m6-r1.mjs
```

Useful ideas:

- strict Blockbench/glTF source inspection;
- deterministic package generation;
- chassis/wheel calibration;
- embedded PNG textures;
- `NEAREST` / `CLAMP_TO_EDGE`;
- OPAQUE/MASK alpha handling.

Do not wholesale merge this candidate. Its live renderer remained procedural and its texture-producing tooling outran the active runtime draw path.

## 11. Current active Web visual paths

Start focused inspection from:

```text
src/render/m6-product-renderer.ts
src/render/m6-world-renderer.ts
src/render/rigid-mesh-gpu-asset.ts
src/render/vehicle-visual-render-resource.ts
src/vehicle/m6/m6-visual-contract.ts
src/vehicle/m6/m6-visual-frame-builder.ts
src/vehicle/m6/m6-vehicle-controller.ts
```

Then locate current vehicle package loader/decoder/binding resolver by exact symbol search:

```text
VehicleVisualPackageV1
loadVehicleVisualRuntimeV1
createRigidMeshGpuAssetV1
resolveVehicleVisualBindingsV1
```

Tiny fixture is a seam test only; do not confuse it with the target vehicle asset.

## 12. Current Web Box3D / drivetrain paths

```text
src/physics/box3d-runtime-contract.ts
src/physics/box3d-boundary.ts
src/vehicle/m6/m6-topology-config.ts
src/vehicle/m6/m6-runtime-builder.ts
src/vehicle/m6/m6-vehicle-controller.ts
src/vehicle/m6/legacy-split-wheel-backend.ts
```

Current runtime identity:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

Current drive semantics:

```text
allWheelDrive=false -> rear 2
allWheelDrive=true  -> all 4
```

No ready native FWD or shaft-lock feature was found in the inspected historical snapshot.

## 13. Native b3Wheel resources for future Web spike

Use current native repo, not only the old ZIP.

Likely starting points:

```text
src/wheel_shape.c
src/wheel_joint.c
test/test_wheel_shape.c
docs/KOLA_00_INDEX_PL.md
docs/KOLA_03_POLITYKA_BOX3D_PL.md
docs/JOZZ_CORE_PATCHES.json
tools/jozz_wheel_bench/
```

Goal of early spike:

- identify source delta/dependencies;
- identify Emscripten compile impact;
- identify C API/JS/TS exports needed;
- identify test surface;
- determine whether a dual legacy/true-wheel backend migration is practical.

Do not do new wheel/tire physics research in this campaign.

## 14. Native presets/config references useful to Web

Tracked presets:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

Useful semantic document:

```text
docs/SUBSYSTEM_UI_PRESETS_PL.md
```

It distinguishes:

- last tuning session;
- named vehicle presets;
- local debug/view session;
- persistent world spawns.

Native panel domains such as `Zawieszenie`, `Nadwozie`, `Napęd`, `Kierownica`, `Świat`, `Mapa`, `Debug` are feature-semantic references only. Do not port the UI literally.

## 15. Retrieval strategy for a fresh agent

### Vehicle model

Do NOT broadly search old branches first.

1. fetch exact `assets/source/Nadwozie.gltf` from native repo;
2. verify SHA-256 if bytes are materialized locally;
3. read historical mount evidence;
4. inspect owner-tooling candidate only for conversion/calibration primitives;
5. inspect current live renderer bridge.

### Scan

1. read recovered scan evidence;
2. inspect exact `106312...` code paths;
3. inspect only selected `c8e0...` visual-policy delta;
4. establish where the real current pack lives;
5. recover desktop equivalence before phone optimization.

### Presets/drivetrain

1. inspect current Web M6 config/controller;
2. read native preset-state semantics;
3. design Web config state independent of UI;
4. add FWD/RWD/AWD only after defining clean corner selection;
5. ask Jozz to clarify shaft-lock meaning before implementation if code/history cannot resolve it.

### b3Wheel

1. inspect current Web binding boundary;
2. inspect current native wheel source/patch manifest;
3. perform a bounded build/binding feasibility spike;
4. do not modify native JV.

## 16. Resources deliberately not promoted to current authority

- uploaded ZIP working trees as a whole;
- old `agent/*` branches;
- closed draft PRs;
- `candidate/jv-web-owner-vehicle-visual-r1` as a whole;
- `c8e0bf...` validation status;
- native `jozz-scan-terrain-f0@241fe10...` as current native research state;
- the 73 MB `.b3mesh` cache as a Web scan render asset;
- historical plan documents as evidence of current runtime behavior.

Use them only for the exact bounded facts/resources described above.
