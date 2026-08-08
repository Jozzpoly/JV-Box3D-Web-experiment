# JV Web — resource index for controlled handoff

Updated: 2026-08-08
Status: **DRAFT V4 DEEP RESOURCE MAP / NOT COLD-START READING**
Purpose: exact retrieval/navigation; do not use as a roadmap.

Fresh-agent minimum authority is current refs + `AGENTS.md` + `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`. Use this index only when a specific task needs exact historical/current resources.

## 1. Current project anchors

```text
private active repo:
Jozzpoly/JV-Box3D-Web-experiment
branch development/jv-web-r1
(resolve current tip/tree before use)

public repo:
Jozzpoly/JV-Box3D-Web-Public
release/r0 c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
public tree f1c5c9a971208d89da05143f10913891a58b3b70
rollback/main 401068f5734c841d43907b71484bc03a2396c604
Pages https://jozzpoly.github.io/JV-Box3D-Web-Public/

native JV:
Jozzpoly/Box3d_FunProject
READ-ONLY in this campaign
```

Embedded active-private SHAs in any handoff package are provenance only. Refetch before writes.

## 2. Document authority map

### Minimum cold-start authority

```text
AGENTS.md
docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md
```

If the handoff resource pack is attached, initially add only:

```text
00_START_HERE.md
02_RESOURCE_MAP.md
09_COLD_AGENT_TAKEOVER_CHECKLIST.md
```

### Deeper current references — on demand

```text
AI_PROJECT_MEMORY.md
docs/PROJECT_STATE.md
docs/ARCHITECTURE.md
docs/DEVELOPMENT.md
docs/handoff/JV_WEB_HANDOFF_2026-08-08.md
docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md
```

### Exact historical/evidence references — targeted only

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md
docs/r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
docs/product/CAR_MAP_SCAN_2026-08-05.md
```

`R1_F0` preserves technical visual-foundation findings; its old sequence is superseded.

`ADR-0003` preserves the accepted long-term native/WASM authority direction; full migration is deferred in the current friend-demo campaign.

`CAR_MAP_SCAN_2026-08-05.md` is a historical pre-c8e0 plan whose old pending-status claims are superseded by later c8e0 evidence/current R1 state.

## 3. User-supplied recovery archives

### Old JV-Web source snapshot

```text
filename:
JV-Box3D-Web-experiment(1).zip

SHA-256:
1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f

snapshot working HEAD:
agent/jv-refoundation-control-plane
fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

Includes `.git`, local refs/reflogs and historical car/map/scan lineage.

### Native JV source snapshot

```text
filename:
box3d.zip

SHA-256:
b22043332ce0cf84d787312aebf8f76dc19bd6431f9a046399dfa7c2300c48f1

snapshot branch/HEAD:
jozz-scan-terrain-f0
241fe10a9056836332c21d9614471d32d749ce3d

main in snapshot:
959aefb78587ce60cf2b8eb03ff82797a4165142

recovery ref in snapshot:
b756f09134c3a9b38f99954ada8cc11d18377bf3
```

Recovery archives are evidence/resource sources, not automatically current authority. The selective handoff pack should cover foreseeable first work; keep these large archives as fallback archaeology only.

## 4. Friend-demo handoff resource pack

The selective resource pack physically includes:

- exact authored vehicle glTFs + generated audits/contracts/presets;
- exact c8e0 scan executable closure + relevant tests/tools/evidence/diff;
- exact recovered `b3Wheel` patch surface;
- scan-cache metadata, not the 73 MB cache itself;
- navigation maps for current R1.

It intentionally does not contain `.git`, full repositories or the missing textured JSPREV2 runtime pack.

Use the newest attached pack version's own manifest/sidecar rather than an older SHA embedded in chat history.

## 5. Current first-slice hypothesis and vehicle visual seam

Current cold-takeover hypothesis is **REAL CAR V1**:

```text
exact Nadwozie chassis
+ four exact owner wheel visual channels
+ minimum required authored pixel materials/textures
+ live authored-GLB draw bridge
+ current physics/world/camera unchanged
```

This is a revalidatable scheduling hypothesis, not a roadmap contract.

Current R1 source seam to inspect first:

```text
src/render/m6-product-renderer.ts
src/render/m6-world-renderer.ts
src/render/rigid-mesh-gpu-asset.ts
src/render/vehicle-visual-render-resource.ts

src/vehicle/m6/m6-visual-contract.ts
src/vehicle/m6/m6-visual-frame-builder.ts
src/vehicle/m6/m6-vehicle-controller.ts

src/visual/glb-container.ts
src/visual/glb-material-policy-v1.ts
src/visual/glb-rigid-mesh-decoder.ts
src/visual/glb-runtime-policy-v1.ts
src/visual/rigid-mesh-draw-plan.ts
src/visual/vehicle-visual-package.ts
src/visual/vehicle-visual-runtime-loader.ts
src/visual/vehicle-visual-transform.ts
```

Known current gap:

```text
authored GLB package/decode/GPU/bindings   PRESENT
live authored GLB draw bridge               MISSING
production pixel texture/material runtime   MISSING
```

Current camera also lives in `src/render/m6-world-renderer.ts`, but under the current hypothesis camera remains unchanged during REAL CAR V1 and becomes a separate owner-feel slice.

The deterministic tiny full-rig fixture is a **diagnostic fallback only** if direct real-owner-asset integration leaves an ambiguous package/import-vs-live-draw failure.

## 6. Exact owner-authored vehicle assets

Repository:

```text
Jozzpoly/Box3d_FunProject
```

### Chassis/body

```text
path:
assets/source/Nadwozie.gltf

SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8

Git blob:
a25cb0ef61d342ce476c9ef26a3b24188bace047

historical integration commit:
a2759471d8641b9f3a3395d508f6c8116d60c81c
```

Historical measured start:

```text
model approx. 3.28m length × 2.73m width × 1.23m height
vehicle wheelbase 2.50m
track 2.10m
yaw -90°
chassis-local position (0,-0.60,0)
```

### Wheel

```text
path:
assets/source/Offroad_Big_Wheels.gltf

SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617

Git blob:
c13c77a8e5552175ee8266b2da33a54691f1dae9
```

Semantic nodes include:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

The exact authored files also provide the real material/texture requirements. Do not broaden the immediate visual scope merely because other native asset files exist.

## 7. Native preset/state-semantic references

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json

docs/SUBSYSTEM_UI_PRESETS_PL.md
```

Use for semantics such as vehicle preset vs tuning/session state vs view/debug vs world spawn. Do not port native UI/layout literally.

## 8. Frozen owner-vehicle tooling candidate

```text
branch:
candidate/jv-web-owner-vehicle-visual-r1

tip:
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful exact paths/blobs:

```text
tools/owner-vehicle/blockbench-gltf-core.mjs
  4ebf2161f0ccab36c36635d0ffc6ab2a409ecd72

tools/owner-vehicle/blockbench-gltf-inspector.mjs
  9502ac0630b0df1fcae70684fe09718c9c556bf3

tools/owner-vehicle/blockbench-gltf-skin.mjs
  0f76470f79c8aa17ff96c823ef8ed187720db1c4

tools/owner-vehicle/blockbench-owner-m6-r1.mjs
  30b4070bc94f4109762a9483bc58989f7d0f2668

tools/owner-vehicle/owner-m6-rigid-package-r1.mjs
  8263eb117f1182f761efe4bf073e0789e6a92152

tools/owner-vehicle/owner-m6-visual-calibration-r1.mjs
  940ee1e4c36901c01e8b739ef86c99ce92c312f4

tools/owner-vehicle/write-owner-m6-r1.mjs
  6a194a756b8e29af773d3c5d0fea79c1c6e7cb52
```

Selective salvage only. Candidate's live renderer remained procedural; its asset/material tooling was ahead of current live draw support.

## 9. Historical scan lineage/evidence

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Pre-fix causal baseline:

```text
106312083875b5aa94cf1f9fc986ac3c26888aa5
```

Strongest preserved historical desktop baseline:

```text
c8e0bf24748b0a790a1c0039b1be801eef266580
tree 3e241761784edd2a2fb6ab18095c25ea0e737185
```

Exact automated PASS plus owner-observed corrected scan/filter/grid/collision.

Foundation log SHA-256:

```text
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

Canonical evidence:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

The resource pack contains the c8e0 executable closure and exact `106312→c8e0` diff.

## 10. Current R1 scan/world entry paths

Inspect current code before historical salvage:

```text
index.html
vite.config.ts
src/product-main.ts
src/product-controls.ts
src/scene/product-world.ts
src/scene/local-full-product-world.ts
src/scene/product-spawn.ts
src/scene/jsprev2-scan.ts
src/render/jv-product-view-settings.ts
src/render/jv-scan-webgl-policy.ts
tools/product/final-jsprev2-vite-plugin.mjs
tools/product/find-jsprev2-pack.mjs
tools/product/jsprev2-pack-inspector.mjs
```

Important continuity:

```text
current src/scene/jsprev2-scan.ts              == c8e0 blob 2485d30d...
current src/render/jv-product-view-settings.ts == c8e0 blob 05279c38...
current src/render/jv-scan-webgl-policy.ts     == c8e0 blob 7f7582a7...
```

Current `product-main.ts` still configures LOCAL_FULL and location choices still use page links/query params.

Thus first scan action is current-R1 revalidation with the real pack, not wholesale recovery.

## 11. Full scan asset and recovery leads

Exact historical runtime pack:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

Not present in the supplied handoff assets as a full textured pack.

Native recovery ZIP contains cooked collision cache only:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
bytes 73,156,192
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

Separate historical P1B lead:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\Box3d_FunProject_p1b_bundle\build\scan_pipeline
real-p1b\bundles\photogrammetry-primary-cc94c46ed4070411\COMPLETE.json
real-p1b\p1b_owner_gate_receipt.local.json
```

Relation to the later JSPREV2 runtime preview pack is unproven.

Historical triangle discrepancy:

```text
native document 1,770,391
exact Web gate 1,775,775
```

Remeasure the actual recovered pack.

## 12. Public scan publication boundary

Current dev scan plugin:

```text
apply: serve
source: JOZZ_SCAN_PREVIEW_PACK local filesystem
runtime paths: /__jv_scan__/...
```

This cannot be assumed to deploy to GitHub Pages.

Before a public friend-demo includes scan, decide from the actual recovered pack:

- which render assets become public artifact inputs;
- packaged vs separately hosted delivery;
- size/cache/startup strategy;
- phone memory/performance implications;
- public privacy/content boundary.

Do not solve this by changing R0 or leaking local/private paths.

## 13. `b3Wheel` / true-wheel resources

The resource pack includes exact recovered source surface from:

```text
b756f09134c3a9b38f99954ada8cc11d18377bf3
```

Registry:

```text
docs/JOZZ_CORE_PATCHES.json
```

Important patch families:

```text
B3X-WHEEL-001
  wheel collider/shape + contact integration

B3X-WHEEL-SOFT-002
  wheel-only normal softness
```

Representative source/test paths:

```text
include/box3d/box3d.h
include/box3d/collision.h
include/box3d/types.h
src/wheel_shape.c
src/shape.c
src/contact.c
src/mesh_contact.c
src/physics_world.c
src/contact_solver.c
src/contact_solver.h
test/test_wheel_shape.c
docs/KOLA_00_INDEX_PL.md
docs/KOLA_03_POLITYKA_BOX3D_PL.md
```

Before a real port, compare this frozen surface to then-current read-only native JV. Current Web seam:

```text
src/physics/box3d-boundary.ts
src/physics/box3d-runtime-contract.ts
src/vehicle/m6/legacy-split-wheel-backend.ts
```

Treat this as a secondary bounded feasibility/port track unless evidence makes it a blocker.

## 14. Camera/mobile entry paths

```text
src/render/m6-world-renderer.ts
src/input/pointer-vehicle-control-adapter.ts
src/main.ts
```

Current camera state/pointer orbit live in `M6WorldRenderer`; touch driving uses pointer controls. Under the current hypothesis camera follows REAL CAR V1 as a separate owner-feel slice.

## 15. Drivetrain/config entry paths

```text
src/vehicle/m6/m6-topology-config.ts
src/vehicle/m6/m6-vehicle-controller.ts
src/vehicle/m6/legacy-split-wheel-backend.ts
```

Known current semantics:

```text
allWheelDrive=false → RWD
allWheelDrive=true  → AWD
```

FWD is new bounded friend-demo work. Exact shaft-lock semantics remain unresolved until mechanically defined.

## 16. Historical documents/branches that must not override current scheduling

- old R0 work orders/gates: provenance only;
- original sequence in `R1_F0_VEHICLE_FOUNDATION_AUDIT.md`: technical decomposition only;
- full native→WASM migration notes/ADR follow-up: long-term direction, execution deferred;
- `CAR_MAP_SCAN_2026-08-05.md`: historical pre-c8e0 plan;
- frozen candidate branches: selective salvage only.

When a known resource is needed, use this index/resource pack before broad historical search. Current Git + current takeover authority still wins.