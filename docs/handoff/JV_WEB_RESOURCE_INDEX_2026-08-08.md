# JV Web — resource index for fresh-agent handoff

Date: 2026-08-08
Status: **DRAFT V2.1 / RESOURCE MAP**
Owner: Jozz

Purpose: let a fresh agent reach relevant source/evidence in a few targeted reads instead of rediscovering the project.

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
JV-Box3D-Web-experiment(1).zip
SHA-256:
1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f

contains:
source + .git + local branches/reflogs + ignored build output

snapshot HEAD:
agent/jv-refoundation-control-plane@fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

### Native JV source snapshot

```text
box3d.zip
SHA-256:
b22043332ce0cf84d787312aebf8f76dc19bd6431f9a046399dfa7c2300c48f1

snapshot:
jozz-scan-terrain-f0@241fe10a9056836332c21d9614471d32d749ce3d

main inside snapshot:
959aefb78587ce60cf2b8eb03ff82797a4165142

recovery/jv-reconstruction inside snapshot:
b756f09134c3a9b38f99954ada8cc11d18377bf3
```

Use for recovery/history, not as current native-JV authority.

## 3. Scan recovery — exact product lineage

Preserved product branch:

```text
product/jv-web-car-map-scan
```

Recovered local refs:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Useful progression:

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
1063120  hard exact JSPREV2 + E2R integration gate
c8e0bf2  restore native scan UV and view controls
```

## 4. Scan evidence anchors

Canonical detailed summary:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

### `106312...` pre-fix green anchor

```text
commit:
106312083875b5aa94cf1f9fc986ac3c26888aa5

Node/npm:
24.16.0 / 11.17.0

foundation gate log SHA-256:
094be78abac3dad32ed7f4de3064dc0e9be65b5673032ed773db035a3a4980c7

scan:
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
```

Use when attributing regressions around the later UV/filter/view delta.

### `c8e0bf...` strongest preserved desktop scan baseline

```text
commit:
c8e0bf24748b0a790a1c0039b1be801eef266580

tree:
3e241761784edd2a2fb6ab18095c25ea0e737185

Node/npm:
24.16.0 / 11.17.0

full foundation/build/portable gate:
PASS

source/package/asset gate:
PASS

foundation gate log SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b

scan:
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
```

Direct owner feedback tied to this exact run:

```text
scan displayed correctly
pixel smoothing OFF by default and toggleable
grid OFF by default and toggleable
vehicle collision correct
```

Also observed:

```text
location/map-scan teleport rebuilt the whole world
wait roughly one to several seconds
```

This is historical `OWNER OBSERVED` behavior, not current-R1 or public-R0 proof.

## 5. Exact c8e0 scan code surface

Start from the historical commit, not broad branch archaeology.

Core paths:

```text
src/scene/jsprev2-scan.ts
src/scene/product-world.ts
src/scene/product-spawn.ts
src/scene/product-scene-package.ts
src/product-main.ts
src/render/jv-world-renderer.ts
src/render/jv-checked-webgl.ts
src/render/jv-scan-webgl-policy.ts
src/render/jv-product-view-settings.ts
```

Tooling:

```text
tools/product/jsprev2-pack-inspector.mjs
tools/product/find-jsprev2-pack.mjs
tools/product/final-jsprev2-vite-plugin.mjs
```

Focused tests include:

```text
tests/jsprev2-scan.test.mjs
tests/product-world.test.mjs
tests/product-spawn.test.mjs
tests/product-entry.test.mjs
tests/product-e2r-drive.test.mjs
tests/jv-checked-webgl.test.mjs
```

plus view/WebGL policy tests added in the c8e0 delta.

## 6. Historical full runtime scan pack

```text
pack id:
source-preview-aee5242a20848294

historical path:
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does NOT contain the full 7-tile textured pack.

Historical native document:

```text
docs/archive/map_scan_2026-07/PLAN_FUNDAMENT_TERENU_ZE_SKANU_2026_07_24_PL.md
```

Native record reports `1,770,391` triangles; exact Web gates report `1,775,775`. Keep the discrepancy explicit until the actual pack is remeasured.

## 7. Cooked native scan collision cache

Present in `box3d.zip`:

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

This is cooked collision state, not the original textured Web render asset.

## 8. Separate historical private P1B pipeline lead

Historical local path observed in older evidence:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\Box3d_FunProject_p1b_bundle\build\scan_pipeline
```

Observed contents:

```text
real-p1b\bundles\photogrammetry-primary-cc94c46ed4070411\COMPLETE.json
real-p1b\p1b_owner_gate_receipt.local.json
```

This is a possible private-source recovery lead only. Its relation to `source-preview-aee5242a20848294` is unproven. Do not substitute one for the other without inspecting manifests/receipts.

## 9. Jozz chassis/body asset

```text
repository:
Jozzpoly/Box3d_FunProject

path:
assets/source/Nadwozie.gltf

SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8

Git blob:
a25cb0ef61d342ce476c9ef26a3b24188bace047
```

Self-contained Blockbench 5.1.4 glTF with embedded binary + PNG.

Historical integration:

```text
a2759471d8641b9f3a3395d508f6c8116d60c81c
```

Known measured relation:

```text
model 3.28m x 2.73m x 1.23m
vehicle wheelbase 2.50m
track 2.10m
yaw -90 degrees
chassis-local position (0, -0.60, 0)
```

Historical docs say orientation/placement were visually inspected in live motion.

## 10. Jozz wheel asset

```text
path:
assets/source/Offroad_Big_Wheels.gltf

SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617

Git blob:
c13c77a8e5552175ee8266b2da33a54691f1dae9

tracked from:
6c7cb18a4a45655797bb1e24d771cad7a5d9d187
```

Embedded PNG and semantic nodes:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

## 11. Other authored native assets — only if later needed

```text
assets/source/One_Sided_wheel_mount.gltf
SHA-256 374e54eb420f0b3e31bba0d749fdf1cf942db2389361dde1313d7a6b29e77ec2

assets/source/OneSided_Steering_Suspension_Rig.gltf
SHA-256 57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750

assets/source/Cardan_shaft.gltf
SHA-256 16f4eab46d526c273f434e109331586df2cd7e3ab0792a4dfbd21d7ed4ef0860
```

Existence does not promote them into current scope.

## 12. Owner-vehicle tooling candidate

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful paths:

```text
tools/owner-vehicle/blockbench-gltf-core.mjs
tools/owner-vehicle/blockbench-gltf-inspector.mjs
tools/owner-vehicle/blockbench-gltf-skin.mjs
tools/owner-vehicle/blockbench-owner-m6-r1.mjs
tools/owner-vehicle/owner-m6-rigid-package-r1.mjs
tools/owner-vehicle/owner-m6-visual-calibration-r1.mjs
tools/owner-vehicle/write-owner-m6-r1.mjs
```

Selective salvage only. Do not wholesale merge.

## 13. Current active Web vehicle visual paths

Inspect first:

```text
src/render/m6-product-renderer.ts
src/render/m6-world-renderer.ts
src/render/rigid-mesh-gpu-asset.ts
src/render/vehicle-visual-render-resource.ts
src/vehicle/m6/m6-visual-contract.ts
src/vehicle/m6/m6-visual-frame-builder.ts
src/vehicle/m6/m6-vehicle-controller.ts
```

Then exact symbol search:

```text
VehicleVisualPackageV1
loadVehicleVisualRuntimeV1
createRigidMeshGpuAssetV1
resolveVehicleVisualBindingsV1
```

Tiny fixture is a seam test, not the target asset.

## 14. Current Web Box3D / drivetrain paths

```text
src/physics/box3d-runtime-contract.ts
src/physics/box3d-boundary.ts
src/vehicle/m6/m6-topology-config.ts
src/vehicle/m6/m6-runtime-builder.ts
src/vehicle/m6/m6-vehicle-controller.ts
src/vehicle/m6/legacy-split-wheel-backend.ts
```

Current runtime:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

Current drive:

```text
allWheelDrive=false -> RWD
allWheelDrive=true  -> AWD
```

No ready FWD or shaft-lock feature was found in the inspected native snapshot.

## 15. Native b3Wheel resources for future Web spike

Use current native repo, not only the old ZIP:

```text
src/wheel_shape.c
src/wheel_joint.c
test/test_wheel_shape.c
docs/KOLA_00_INDEX_PL.md
docs/KOLA_03_POLITYKA_BOX3D_PL.md
docs/JOZZ_CORE_PATCHES.json
tools/jozz_wheel_bench/
```

Spike goal:
- source delta/dependencies;
- Emscripten compile impact;
- C API/JS/TS exports;
- focused test surface;
- migration/rollback practicality.

No new native tire R&D in this campaign.

## 16. Native preset/config semantics useful to Web

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

Useful document:

```text
docs/SUBSYSTEM_UI_PRESETS_PL.md
```

Use for semantic separation of vehicle preset / tuning session / local view state / world spawn. Do not port native UI literally.

## 17. Fresh-agent retrieval strategy

### Vehicle
1. fetch exact `Nadwozie.gltf` and `Offroad_Big_Wheels.gltf` from native repo;
2. verify hashes if materialized locally;
3. read known mount/marker evidence;
4. inspect owner-tooling candidate only for useful conversion/calibration primitives;
5. inspect current live renderer seam.

### Scan
1. read recovered scan evidence;
2. treat `c8e0bf...` as strongest preserved desktop baseline;
3. use `106312...` only for causal comparison/fallback;
4. locate actual current private pack;
5. selectively reconcile c8e0 into current R1;
6. validate new integration on desktop, then phone.

### Presets/drivetrain
1. inspect current Web M6 config/controller;
2. read native preset-state semantics;
3. define Web config state independent of UI;
4. add FWD/RWD/AWD via clean driven-corner selection;
5. clarify shaft-lock meaning before implementing.

### b3Wheel
1. inspect current Web boundary;
2. inspect current native wheel source/patch manifest;
3. perform bounded build/binding feasibility spike;
4. do not modify native JV.

## 18. Resources deliberately not promoted to current authority

- uploaded ZIP working trees as a whole;
- old `agent/*` branches;
- closed draft PRs;
- `candidate/jv-web-owner-vehicle-visual-r1` as a whole;
- native `jozz-scan-terrain-f0@241fe10...` as current native research state;
- 73 MB `.b3mesh` as a Web scan render asset;
- P1B bundle as the later JSPREV2 runtime pack without proof;
- historical plan documents when raw execution evidence exists.
