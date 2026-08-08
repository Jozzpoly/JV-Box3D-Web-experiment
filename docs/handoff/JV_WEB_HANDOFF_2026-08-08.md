# JV Web — controlled conversation handoff

Date: 2026-08-08
Status: **DRAFT V2 — CORE REBUILT FROM CURRENT REPOS + USER-SUPPLIED SOURCE ARCHIVES**
Owner: Jozz

This document is intentionally provisional. It is the current handoff core for review before moving the project to a fresh conversation.

## 0. Purpose

The next conversation must start fresh without losing project authority, owner intent, hard evidence, recovered resources or the reasons behind current priorities.

Do not treat this file as a frozen roadmap. A fresh agent must revalidate the current refs, code and owner priorities before implementation.

Evidence hierarchy:

```text
1. current Git refs / current code / live runtime
2. exact validation evidence + direct owner observation
3. recovered source snapshots supplied by Jozz
4. historical docs and plans
5. current interpretation / proposed plan
```

Lower levels must not silently override higher levels.

## 1. Current campaign scope

For the current campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = ACTIVE PRIVATE CORE / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC DEMONSTRATOR / GitHub Pages release surface

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY SOURCE FOR THIS CAMPAIGN
```

Native JV is maintained by another agent and intentionally frozen until the current JV-Web demonstrator campaign is sufficiently complete. This agent must not advance, reorganize or tune native JV unless Jozz explicitly changes scope.

Native JV may be inspected as a source of already-existing assets, semantics and mechanisms to selectively port to Web, especially `b3Wheel`.

JV-Web is allowed to move ahead of native JV in presentation, browser UX, camera, configuration, QoL and demo polish. The long-term aspiration remains easy future native->Web transfer, but that aspiration must not stall the current demonstrator.

## 2. Owner intent — what this campaign is actually for

The immediate goal is not social-media packaging and not proof that Web equals final native JV physics.

Jozz wants a browser version that increasingly feels like a real piece of his own game: something he wants to launch, drive, tune and show friends. The visible demonstrator is also intended to rebuild confidence and motivation before returning to the much longer native JV program.

Before Jozz considers the JV-Web experiment complete, the public friend-demo should contain most of the following, subject to live feel and discoveries during implementation:

- Jozz's own vehicle model, integrated and polished as well as practical;
- a substantially better racing-game-style chase camera;
- desktop orbit/zoom and mobile two-finger pinch zoom;
- a simple usable JSPREV2 scan path, recovered from the already-working desktop implementation and made acceptable on phone if practical;
- teleportation between useful fragments/locations of the world;
- vehicle presets;
- a browser-native vehicle settings model/panel;
- selectable FWD / RWD / AWD;
- a mechanically meaningful drivetrain/shaft lock once its exact semantics are defined;
- useful QoL discovered while actually playing;
- UI rebuilt around the Web/mobile experience rather than the current diagnostic layout;
- native JV's newer smooth `b3Wheel` / "prawdziwy kolider koła" ported into the Web Box3D runtime before campaign closure if the technical path is sane.

Order is intentionally adaptive. Jozz's actual play/feel is a legitimate scheduling signal, not noise that must be ignored in favor of a prewritten roadmap.

Social-media readiness is a later benefit, not a current design constraint.

## 3. Current hard anchors

### 3.1 Active private branch

```text
repo: Jozzpoly/JV-Box3D-Web-experiment
branch: development/jv-web-r1
```

A fresh agent must resolve its exact current tip before work. Do not trust the SHA embedded in this draft after time has passed.

### 3.2 Closed public R0

Private R0 source:

```text
commit: 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree:   08314a0182a38bbcd106e984dde73e737a1a13e7
```

Validated public candidate ZIP SHA-256:

```text
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2
```

Public release:

```text
repo:       Jozzpoly/JV-Box3D-Web-Public
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree:       f1c5c9a971208d89da05143f10913891a58b3b70
rollback:   401068f5734c841d43907b71484bc03a2396c604
```

Pages:

```text
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source: release/r0 /(root)
HTTPS: enforced
```

R0 proved deterministic Windows source/build behavior, two byte-identical public builds, exact promotion, live Pages, zero public scan requests and direct owner use on desktop + real phone. It is a regression/rollback reference, not the branch to keep editing.

## 4. Current Web product/runtime facts

Live vehicle visuals are still procedural:

```text
M6DebugRenderer
-> M6ProductRenderer
-> M6WorldRenderer
-> box chassis + cylinder wheels + diagnostic rig primitives
```

The active source nevertheless contains a substantial dormant vehicle-visual stack:

- `M6TraceFrame.visualFrame` / `VehicleVisualFrameV1` produced from live mechanics;
- current 18 PART + 8 SEGMENT visual frame;
- `VehicleVisualPackageV1` / `M6_FULL_RIG_V1` binding contract;
- GLB fetch/hash/policy/CPU decode;
- GPU geometry-buffer ownership;
- binding-to-world transform resolution;
- deterministic tiny full-rig fixture.

The missing product bridge is live GLB draw integration plus later production texture/material runtime.

`M6_FULL_RIG_V1` is a useful current proof topology, not sacred future ABI.

Current physics/runtime identity:

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D:

```text
box3d.js@0.0.2
binding commit: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine commit:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
variant: inline-single-threaded
```

The active binding/boundary does not expose native JV's `b3Wheel` API. The desired true-wheel feature is therefore an engine/binding port problem, not a UI toggle.

Current drivetrain uses `allWheelDrive: boolean`:

```text
false -> rear two corners driven
true  -> all four corners driven
```

A clean FWD/RWD/AWD enum is plausible bounded work. The exact meaning of Jozz's requested "blokowanie wałów" is not yet established and must not be guessed.

## 5. Recovered source snapshots supplied by Jozz

Two ZIPs supplied during handoff preparation materially improved the project context.

### Old JV-Web snapshot

```text
uploaded filename:
  JV-Box3D-Web-experiment(1).zip

SHA-256:
  1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f

contains:
  source tree + .git + local branches/reflogs + ignored build output

snapshot working HEAD:
  agent/jv-refoundation-control-plane
  fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

This ZIP recovered local Git refs and an important modified local scan-validation record that was not preserved in the same form on the historical GitHub branch.

### Native JV snapshot

```text
uploaded filename:
  box3d.zip

SHA-256:
  b22043332ce0cf84d787312aebf8f76dc19bd6431f9a046399dfa7c2300c48f1

snapshot branch:
  jozz-scan-terrain-f0
snapshot HEAD:
  241fe10a9056836332c21d9614471d32d749ce3d

main inside snapshot:
  959aefb78587ce60cf2b8eb03ff82797a4165142

recovery/jv-reconstruction inside snapshot:
  b756f09134c3a9b38f99954ada8cc11d18377bf3
```

This is an asset/source recovery snapshot. It is not the authority for the current native-JV research line and must not cause this Web agent to resume native development.

## 6. Recovered scan truth — important correction to older handoff

The old Web ZIP contains the local product-scan history that led from the accepted playable car to the integrated scan product.

Key lineage:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Most important evidence boundary:

### `106312...` — first full green integrated product

Recovered local record states that exact Windows validation reached:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
tests 251/251 PASS
docs/notices/portable package PASS
private JSPREV2 exact validation PASS
```

Recovered product metrics:

```text
7 tiles
25 groups
25 textures
1,775,775 triangles
```

Owner/runtime observations recorded for this checkpoint:

- one browser world contained the accepted Web vehicle + E2R/offroad + private JSPREV2;
- car was visible and controllable on E2R and scan;
- rocks / bumper banks / offroad content were present;
- scan geometry rendered;
- Box3D scan collision worked;
- map/scan switching worked.

The same green checkpoint also had visible defects:

1. scan texture atlases were visibly scrambled;
2. filtering was forced LINEAR;
3. observer grid was always drawn;
4. primitive/debug vehicle remained visible.

### `c8e0bf...` — later visual-fix candidate, not inherited PASS

The later branch tip contains code/policy changes including:

- `UNPACK_FLIP_Y_WEBGL = 0`;
- default NEAREST filtering;
- live Pixels/Smoothing view controls;
- grid OFF by default + toggle;
- preserving view settings across map/scan.

But the recovered local record does **not** establish a complete exact Windows gate or owner visual acceptance for `c8e0bf...`.

Therefore future scan work should:

1. recover the known-green functional behavior of `106312...` into current R1;
2. selectively reuse the `c8e0...` visual correction only with fresh validation;
3. restore desktop behavior before designing new scan architecture;
4. then run the real scan on phone and optimize only observed bottlenecks.

The recovered historical evidence is preserved separately in:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

## 7. Recovered scan asset state

Historical full pack identity:

```text
source-preview-aee5242a20848294
```

Historical native debug path recorded:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does **not** contain the full 7-tile textured JSPREV2 pack.

It does contain a cooked native collision cache for that pack:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
bytes: 73,156,192
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

This `.b3mesh` is native cooked collision-cache evidence, not a portable Web render asset and not a substitute for the missing textures/tiles.

Historical native documentation reports `1,770,391` triangles while recovered Web validation reports `1,775,775`. Do not silently reconcile this discrepancy. It may be a different metric/subset; the real pack should be freshly measured if recovered.

## 8. Recovered vehicle asset truth — important correction

The earlier handoff said the authoritative source model files had not been proven. The supplied native JV snapshot establishes that they are versioned in native JV.

### Chassis/body

```text
repo:
  Jozzpoly/Box3d_FunProject

path:
  assets/source/Nadwozie.gltf

SHA-256:
  45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8

Git blob:
  a25cb0ef61d342ce476c9ef26a3b24188bace047
```

It is a self-contained Blockbench 5.1.4 glTF export with embedded binary data and embedded PNG texture.

Native integration commit:

```text
a2759471d8641b9f3a3395d508f6c8116d60c81c
Body: attach Jozz's chassis frame (Nadwozie) as a rigid skin on the chassis
```

Historical measured placement/relationship:

```text
model size:
  3.28 m length
  2.73 m width
  1.23 m height

vehicle:
  2.50 m wheelbase
  2.10 m track

visual mount:
  yaw = -90 deg
  chassis-local position = (0, -0.60, 0)
```

Historical records say the render was visually inspected in motion and orientation/placement were correct. Do not throw this evidence away and recalibrate from zero unless current Web integration proves a different convention requires it.

### Wheel

```text
path:
  assets/source/Offroad_Big_Wheels.gltf

SHA-256:
  1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617

Git blob:
  c13c77a8e5552175ee8266b2da33a54691f1dae9
```

Tracked from commit:

```text
6c7cb18a4a45655797bb1e24d771cad7a5d9d187
```

It is also self-contained with embedded PNG and includes semantic markers such as:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

These assets are not currently present in active JV-Web. A fresh agent should fetch/copy them deliberately using the exact native repo/ref/path identity instead of asking Jozz to rediscover them or guessing from arbitrary local files.

Exact resource pointers are collected in:

```text
docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md
```

## 9. Native JV resources worth reading — without resuming native development

### Presets

Tracked native presets exist:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

They are useful semantic references for future Web presets; they are not automatically Web preset schema.

### State separation

`docs/SUBSYSTEM_UI_PRESETS_PL.md` contains a useful conceptual separation between:

- last tuning session;
- named vehicle presets;
- local debug/view session;
- persistent world spawns.

This can prevent future Web UI from mixing persistent vehicle configuration with camera/debug/world state.

### UI semantics

Native UI includes domains such as:

```text
Zawieszenie
Nadwozie
Napęd
Kierownica
Świat
Mapa
Debug
```

Use this only as a feature-semantic inventory. Do not port native ImGui/layout literally; the Web UI should be browser/mobile-native.

### b3Wheel

Current Web binding does not contain `b3Wheel`.

An early feasibility spike should inspect current native resources such as:

```text
src/wheel_shape.c
src/wheel_joint.c
test/test_wheel_shape.c
docs/KOLA_00_INDEX_PL.md
docs/KOLA_03_POLITYKA_BOX3D_PL.md
docs/JOZZ_CORE_PATCHES.json
tools/jozz_wheel_bench/
```

The spike should answer build/binding/port-surface questions only. It must not reopen native tire R&D or modify native JV.

## 10. Critical re-evaluation of the previous plan

The earlier handoff was materially incomplete because it lacked the source archives and therefore understated what was already known.

### 10.1 Real vehicle work can start from stronger evidence

Old assumption:

```text
we may have tooling, but authoritative owner model assets may need to be found again
```

Recovered truth:

```text
Nadwozie.gltf and Offroad_Big_Wheels.gltf are exact versioned source assets
with hashes, historical integration, placement evidence and wheel markers
```

Therefore owner-model integration should not start with generic asset discovery or eyeballed calibration. A small tiny-GLB seam test may still be useful internally, but it is not the product milestone.

### 10.2 Scan is a recovery task before it is a new architecture task

The first target should be functional equivalence with the known-green `106312...` desktop path, not a fresh scan architecture.

The later `c8e0...` visual fixes are likely useful but require fresh validation.

Only after desktop recovery should phone behavior decide whether work is needed in rendering, textures, collision, loading or memory.

### 10.3 b3Wheel risk must be bounded early but need not block visible work

Because current Web Box3D lacks the API, perform an early bounded Emscripten/binding feasibility spike.

Do not make the full wheel port the first campaign milestone unless the spike reveals that delaying it would make current vehicle work disposable.

### 10.4 Config semantics should precede final settings UI

Before building a polished panel, define the product state model and update semantics such as:

```text
LIVE
REBUILD_VEHICLE
REBUILD_WORLD
```

Presets should be snapshots of vehicle state, not remembered button positions.

### 10.5 Public releases should reflect visible value

Do not recreate the R0 ceremony for every private slice.

Likely useful public checkpoints are large owner-visible jumps, for example:

- real vehicle + new camera;
- scan/teleport recovery;
- sufficiently complete friend-demo.

Exact release provenance/rollback remains required, but release work must stay proportional to the value being published.

## 11. Provisional adaptive work program

This is not an ordered contract. It is a current decision framework.

### Phase A — revalidation + risk bounding

Short only.

- verify current refs/R0/Pages;
- verify exact owner source assets from native repo;
- map the minimum code surface needed to activate live GLB drawing;
- map exact `106312...` scan recovery surface and the selected `c8e0...` visual fixes;
- perform a bounded `b3Wheel` Web build/binding feasibility analysis;
- define the smallest first owner-visible implementation slice.

If Phase A expands into another foundation campaign, stop and reduce scope.

### Phase B — "this is my car"

Probable internal sequence:

```text
tiny/full-rig live draw seam proof
-> exact Nadwozie.gltf + Offroad_Big_Wheels.gltf integration
-> geometry/pose correction using recovered evidence
-> pixel texture/material support
-> materially better chase camera
```

Tiny GLB is diagnostic infrastructure only. The meaningful owner gate is whether the real car + camera materially changes the experience.

Camera should be developed near vehicle visuals, not deferred as polish. Desired capabilities include smooth chase, tunable distance/height/look-ahead, desktop orbit/zoom and phone pinch zoom. Exact behavior should be tuned by play, not copied blindly from one game.

### Phase C — "this is my world"

- recover `106312...` scan/E2R integration into current R1;
- freshly validate selected `c8e0...` view/UV/filter fixes;
- make map/offroad/scan locations explicit product destinations;
- implement teleport/location switching without unnecessary full-page restart if current architecture supports it cleanly;
- run real phone scan observation;
- optimize only measured bottlenecks.

### Phase D — vehicle sandbox

First define a Web vehicle config model independent of UI layout.

Then incrementally add:

- presets;
- FWD / RWD / AWD;
- exact drivetrain/shaft lock semantics after clarification;
- selected suspension/steering/drive/brake parameters useful to Jozz;
- local save of useful user state if justified.

Use native presets/state separation as semantic reference, not as a UI port.

### Phase E — true wheel

If the early spike confirms a sane path:

- build a controlled Web Box3D/Emscripten variant containing the selected existing `b3Wheel` delta;
- expose the minimum JS/TS binding surface;
- pin engine/binding identity;
- port the proven mechanism rather than doing new tire R&D in JV-Web;
- keep rollback to the legacy split-wheel backend until new Web behavior is established.

### Phase F — UI/QoL/friend-demo closure

Only after the real capability set is clearer:

- rebuild UI around Web/mobile needs;
- separate driving HUD/quick actions from settings;
- provide appropriate mobile drawer/sheet behavior;
- add QoL that actual play demonstrates is valuable;
- perform targeted desktop/phone polish;
- publish major owner-visible checkpoints rather than every implementation step.

## 12. Process constraints

- minimize Jozz's manual technical intervention;
- prefer assistant-led code/repo work;
- when Windows execution is unavoidable, prefer isolated disposable workspaces under Downloads;
- do not use or modify existing local JV-Web project folders unless explicitly necessary;
- no GitHub Actions for this workflow;
- no force push;
- preserve public R0 as rollback/regression baseline;
- distinguish product failure from harness/operator failure;
- validate the stage that actually changed;
- do not send Jozz through a gate already known to be broken;
- use small attributable implementation slices;
- do not let release engineering consume product development again;
- do not hide failed assumptions by redefining success after the fact;
- owner visual/feel evidence matters when the question is experience, not just code correctness.

## 13. Known unknowns that must remain explicit

1. The full textured JSPREV2 pack `source-preview-aee5242a20848294` is not contained in the supplied `box3d.zip`; its present accessible location still has to be established before real scan recovery can run.
2. The native-vs-Web scan triangle-count discrepancy (`1,770,391` vs `1,775,775`) is unresolved and should be remeasured rather than guessed.
3. Exact mechanical semantics of "blokowanie wałów" are unresolved.
4. FWD has not been implemented in the current M6 drivetrain.
5. `c8e0bf...` visual fixes are not owner-accepted simply because the code exists.
6. Exact Web build/binding cost of current native `b3Wheel` has not yet been proven.
7. Final camera behavior and final UI hierarchy should be tuned against actual play, not frozen in this handoff.
8. `M6_FULL_RIG_V1` may be sufficient for the current car proof but is not guaranteed to be the future general vehicle ABI.

## 14. Fresh-conversation protocol

A new agent should not begin by implementing the first item in Section 11.

Recommended first session:

1. resolve current Git refs for private/public repos and verify Pages;
2. read `AGENTS.md`, `docs/PROJECT_STATE.md`, this handoff, the resource index, recovered scan evidence, R0 baseline and R1-F0 audit;
3. inspect only the exact active code paths needed to test the handoff claims;
4. verify the exact native source assets and historical scan commits using the resource index instead of broad repo searches;
5. classify what is CURRENT FACT, HISTORICAL PROOF, RECOVERED EVIDENCE, HYPOTHESIS, UNKNOWN;
6. challenge the provisional work program against current code and Jozz's current priorities;
7. propose the smallest high-value implementation slice;
8. only then implement.

Do not spend the first conversation rediscovering resources already indexed here.

Do not treat this handoff as an instruction to blindly preserve the previous agent's architecture.

## 15. Handoff status

```text
DRAFT V2
core rebuilt from current repos + supplied source archives
NOT FINAL
```

Further review is expected before moving to the fresh conversation.

In particular, future review should ask:

- Is the handoff too prescriptive about car->scan->config->wheel order?
- Does it preserve enough exact resource identity while still staying readable?
- Are any historical observations being promoted above their evidence class?
- Is any important private asset/resource still only present in the uploaded ZIPs and not indexed by stable repository identity?
- Does the first-session protocol save context, or does it ask the new agent to repeat work that this handoff already settled?
