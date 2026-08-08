# JV Web — controlled conversation handoff

Date: 2026-08-08
Status: **DRAFT V2.1 — CORE REBUILT AND EVIDENCE-RECONCILED**
Owner: Jozz

This document is intentionally provisional. Several further review passes are expected before moving the project to a fresh conversation.

## 0. Purpose and evidence discipline

The next conversation must start fresh without losing project authority, owner intent, hard evidence, recovered resources or the reasons behind current priorities.

This file is not a frozen roadmap. A fresh agent must revalidate current refs/code and challenge the proposed ordering before implementation.

Use this evidence hierarchy when sources disagree:

```text
1. current Git refs / current code / live runtime
2. raw exact validation evidence + direct owner observation
3. recovered source snapshots supplied by Jozz
4. historical documentation / plans / agent summaries
5. current interpretation / provisional roadmap
```

A later raw execution log outranks an earlier plan that said the execution was still pending. A direct owner observation tied to a named run outranks a generic historical summary.

## 1. Current campaign scope

For this campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = ACTIVE PRIVATE CORE / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC FRIEND-DEMO / GitHub Pages release surface

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY SOURCE FOR THIS CAMPAIGN
```

Native JV is maintained by another agent and intentionally frozen until the JV-Web demonstrator is sufficiently complete. This agent must not advance, reorganize or tune native JV unless Jozz explicitly changes scope.

Native JV may be inspected as a source of already-existing assets, configuration semantics and mechanisms to selectively port to Web, especially `b3Wheel`.

JV-Web may temporarily move ahead of native JV in presentation, browser/mobile UX, camera, configuration, QoL and demo polish. Long-term easy native->Web transfer remains desirable, but must not stall the current demonstrator.

## 2. Owner intent — why this campaign exists

The immediate target is not social-media production and not proof that the current Web fixture equals final native JV physics.

Jozz wants a browser version that increasingly feels like a real piece of his own game: something he wants to launch, drive, tune and show friends. The visible result is also intended to restore confidence and motivation before returning to the much longer native JV program.

Before Jozz considers this JV-Web experiment complete, the public friend-demo should contain most of the following, subject to discoveries and live feel:

- Jozz's own vehicle model, integrated and visually polished as well as practical;
- a substantially better racing-game-style chase camera;
- desktop orbit/zoom and mobile two-finger pinch zoom;
- a simple usable JSPREV2 scan path, recovered from the already-working desktop implementation and made acceptable on phone if practical;
- teleportation between useful world fragments/locations without unnecessary expensive world rebuilds;
- vehicle presets;
- a browser-native vehicle settings state/model and later panel;
- selectable FWD / RWD / AWD;
- a mechanically meaningful drivetrain/shaft lock after its exact semantics are established;
- useful QoL discovered by actually playing;
- UI rebuilt around the Web/mobile experience rather than the current diagnostic layout;
- native JV's newer smooth `b3Wheel` / "prawdziwy kolider koła" ported to the Web Box3D runtime before campaign closure if the technical path proves sane.

Order is deliberately adaptive. Jozz's actual play/feel is a legitimate scheduling signal.

Social-media readiness is a later benefit, not a current design constraint.

## 3. Hard anchors

### 3.1 Active private line

```text
repo:   Jozzpoly/JV-Box3D-Web-experiment
branch: development/jv-web-r1
```

Always resolve its exact current tip before work. The handoff itself is being revised through docs-only commits, so embedded draft SHAs age quickly.

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

## 4. Current Web runtime facts

### 4.1 Vehicle visual path

Live vehicle visuals remain procedural:

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

Missing product bridge: live GLB draw integration plus production texture/material runtime.

`M6_FULL_RIG_V1` is useful current proof topology, not sacred future ABI.

### 4.2 Physics/runtime identity

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

The active boundary does not expose native JV's `b3Wheel` API. The desired true-wheel feature is an engine/binding port problem, not a UI toggle.

### 4.3 Drivetrain

Current M6 config uses `allWheelDrive: boolean`:

```text
false -> rear two corners driven
true  -> all four corners driven
```

A clean FWD/RWD/AWD enum is plausible bounded work. The exact meaning of Jozz's requested "blokowanie wałów" remains unresolved and must not be guessed.

## 5. Recovered source snapshots supplied by Jozz

Two user-supplied ZIPs materially improved the project context.

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

These archives are recovery/evidence sources. They are not automatically newer authority than current Git.

## 6. Recovered scan truth — reconciled evidence

Historical local scan lineage recovered from old JV-Web:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

### 6.1 `106312...` — first full green integrated checkpoint

Raw Windows evidence establishes:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
tests 251/251 PASS
docs/notices/portable package PASS
exact private JSPREV2 selection + deep validation PASS
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
```

Owner/runtime observations from that stage established working car + E2R/offroad + scan geometry/collision but also visible defects: scrambled/misaligned scan atlas appearance, LINEAR filtering, grid always on, primitive/debug vehicle.

`106312...` is therefore the important pre-fix causal baseline.

### 6.2 `c8e0bf...` — strongest recovered desktop scan baseline

A later raw Windows execution log supersedes earlier planning notes that still described its gate as pending.

Exact target:

```text
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Exact automated evidence:

```text
Node: 24.16.0
npm:  11.17.0
full repository/build/portable gate: PASS
JV WEB FOUNDATION GATE: PASS
JV WEB CAR + MAP + SCAN: SOURCE/PACKAGE/ASSET GATE PASS
scan: 7 tiles / 25 groups / 25 textures / 1,775,775 triangles
foundation gate log SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

The integrated product was then started at localhost:5175 from that exact worktree.

Direct owner feedback tied to this run states:

- scan displayed correctly;
- pixel smoothing was OFF by default and could be enabled;
- grid was OFF by default and could be enabled;
- vehicle collision worked correctly.

This is historical `OWNER OBSERVED` evidence for those exact behaviors on the c8e0 product line. It is not the same thing as current-R1 or public-R0 acceptance, but it is strong enough that c8e0 should no longer be described as an unvalidated visual candidate.

### 6.3 Recovered teleport UX debt

The same owner feedback identifies a concrete product problem:

- map/scan teleport rebuilt the whole world;
- each teleport could cost roughly one to several seconds;
- owner explicitly questioned why a position change should require rebuilding the whole world.

Future teleport/location work should therefore preserve the proven location semantics while attempting to decouple repositioning from full world reconstruction when architecturally safe.

### 6.4 Scan recovery implication

The best preserved desktop recovery source is now:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

Use `106312...` as the pre-fix causal baseline/fallback when attributing regressions, not as the default feature target.

Future scan work should:

1. selectively reconcile the known-good c8e0 world/render/collision/view behavior into current R1 rather than wholesale-merging the branch;
2. keep `106312...` available to isolate whether any regression comes from the small visual-fix delta;
3. re-establish the actual private pack location;
4. confirm recovered desktop behavior in current R1;
5. then test a real phone and optimize only observed bottlenecks;
6. redesign scan architecture only if recovery/measurement demonstrates a real need.

Canonical historical evidence preservation:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

## 7. Scan asset boundary

Historical full runtime pack:

```text
source-preview-aee5242a20848294
```

Historical runtime path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does **not** contain the full 7-tile textured JSPREV2 pack.

It does contain a cooked native collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
bytes: 73,156,192
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

This `.b3mesh` is native cooked collision-cache evidence, not a portable Web render asset and not a substitute for the missing textures/tiles.

Historical native documentation reports `1,770,391` triangles while exact Web validation reports `1,775,775`. Preserve the discrepancy and freshly measure the real recovered pack rather than guessing which old metric should win.

A separate historical private P1B pipeline was also observed at:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\Box3d_FunProject_p1b_bundle\build\scan_pipeline
```

with one bundle `photogrammetry-primary-cc94c46ed4070411` and an owner-gate receipt. This is a potentially useful recovery lead, but it is not proven to be the exact JSPREV2 runtime preview pack above. Do not conflate them.

## 8. Recovered authoritative owner assets

The earlier handoff uncertainty about the real model files is resolved: the source models are versioned in native JV.

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

Self-contained Blockbench 5.1.4 glTF export with embedded binary data and PNG texture.

Historical native integration:

```text
a2759471d8641b9f3a3395d508f6c8116d60c81c
Body: attach Jozz's chassis frame (Nadwozie) as a rigid skin on the chassis
```

Historical measured relationship:

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

Historical records state that orientation/placement were visually inspected in live motion. Do not throw this away and restart with eyeballed calibration unless current Web coordinate conventions prove it invalid.

### Wheel

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

Self-contained with embedded PNG and semantic markers including:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

Exact pointers and additional authored assets are collected in:

```text
docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md
```

A fresh agent should fetch/copy these deliberately using exact repo/ref/path identity instead of asking Jozz to rediscover them.

## 9. Useful native JV resources — without resuming native development

### Presets/state semantics

Tracked native presets:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

`docs/SUBSYSTEM_UI_PRESETS_PL.md` contains useful separation between last tuning session, named vehicle presets, local view/debug state and persistent world spawns.

Native UI domains such as `Zawieszenie`, `Nadwozie`, `Napęd`, `Kierownica`, `Świat`, `Mapa`, `Debug` are semantic inventory only. Do not port native ImGui/layout literally.

### b3Wheel

Current Web binding does not contain `b3Wheel`.

An early bounded feasibility spike should inspect current native resources such as:

```text
src/wheel_shape.c
src/wheel_joint.c
test/test_wheel_shape.c
docs/KOLA_00_INDEX_PL.md
docs/KOLA_03_POLITYKA_BOX3D_PL.md
docs/JOZZ_CORE_PATCHES.json
tools/jozz_wheel_bench/
```

The spike should answer source-delta/dependency, Emscripten, binding-export and test-surface questions only. It must not reopen native tire R&D or modify native JV.

## 10. Owner-vehicle candidate — salvage only

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful tooling includes strict Blockbench/glTF inspection, deterministic package generation, chassis/wheel calibration, embedded PNG preservation, NEAREST/CLAMP_TO_EDGE and OPAQUE/MASK rules.

Do not wholesale merge this candidate. Its final live renderer remained procedural and its texture-producing tooling outran the active runtime draw path.

## 11. Critical re-evaluation of the previous plan

### 11.1 Owner-model integration starts from stronger evidence than previously assumed

We have exact source assets, hashes, historical mount measurements and wheel markers. Do not spend the next conversation broadly searching for a model or recalibrating from zero.

A tiny/full-rig seam proof may still be a useful internal implementation step, but it is not the product milestone. The owner-visible milestone is the real chassis + real wheels behaving correctly in the running game.

### 11.2 Scan is primarily selective recovery, not new architecture

Because c8e0 now has both exact automated PASS and direct owner-observed correct scan/filter/grid/collision behavior, it is the strongest preserved desktop scan baseline.

Do not force the project to recreate 106312 first. Use 106312 as attribution fallback if the c8e0 delta causes trouble.

### 11.3 Teleport is already a known QoL/performance debt

The old product solved location switching functionally, but rebuilt the whole world. The desired new location system should preserve reliable spawn/target behavior while avoiding unnecessary reconstruction.

### 11.4 b3Wheel risk must be bounded early but need not block visible work

Perform a bounded Web build/binding feasibility spike early. Do not automatically make the full port the first implementation milestone unless the spike proves delaying it would make current vehicle work disposable.

### 11.5 Config semantics should precede polished settings UI

Before building a final panel, define a Web vehicle config model and update semantics such as:

```text
LIVE
REBUILD_VEHICLE
REBUILD_WORLD
```

Presets should be snapshots of vehicle state, not remembered button positions.

### 11.6 Public release cadence should follow visible value

Do not recreate the R0 ceremony for every private slice. Exact provenance and rollback remain required, but public checkpoints should correspond to meaningful owner-visible jumps.

## 12. Provisional adaptive work program

This is a decision framework, not an ordered contract.

### Phase A — fresh revalidation + bounded risk mapping

Short only.

- verify current private/public refs and Pages;
- verify exact owner source assets through indexed pointers;
- inspect the minimal current code surface required for live GLB draw integration;
- inspect `c8e0bf...` only where needed to map selective scan recovery;
- perform bounded `b3Wheel` Web/Emscripten/binding feasibility analysis;
- identify where the real private JSPREV2 pack is currently accessible;
- choose the smallest first owner-visible implementation slice.

Do not rerun historical c8e0 gates merely to rediscover that they already passed. Fresh validation belongs to the **new integration into current R1**, not to proving old evidence again.

If Phase A turns into another foundation campaign, reduce scope.

### Phase B — "this is my car"

Probable internal sequence:

```text
minimal live GLB seam proof
-> exact Nadwozie.gltf + Offroad_Big_Wheels.gltf integration
-> pose/scale correction using recovered evidence
-> pixel texture/material support
-> materially better chase camera
```

Camera belongs near vehicle visuals, not at the end as polish. Desired capabilities include smooth chase, tunable distance/height/look-ahead, desktop orbit/zoom and phone pinch zoom. Tune through actual play rather than copying one game's constants.

### Phase C — "this is my world"

- selectively recover c8e0 scan/E2R behavior into current R1;
- preserve map/offroad/scan as explicit locations;
- replace full-world teleport rebuild with lightweight repositioning if current ownership/lifecycle rules permit it safely;
- run real desktop recovery evidence;
- run real phone scan observation;
- optimize only measured bottlenecks in loading, rendering, textures, collision or memory.

### Phase D — vehicle sandbox

First define a Web vehicle config model independent of UI layout.

Then incrementally add:

- presets;
- FWD / RWD / AWD;
- exact drivetrain/shaft lock semantics after clarification;
- selected suspension/steering/drive/brake parameters useful to Jozz;
- local persistence only when useful.

Use native preset/state semantics as reference, not literal UI port.

### Phase E — true wheel

If the early spike confirms a sane path:

- build a controlled Web Box3D/Emscripten variant containing the selected existing `b3Wheel` delta;
- expose only required JS/TS binding surface;
- pin engine/binding identity;
- port existing mechanism rather than perform new tire R&D in JV-Web;
- retain legacy split-wheel rollback until the new Web backend is established.

### Phase F — UI/QoL/friend-demo closure

Once the real capability set is clearer:

- rebuild UI around Web/mobile needs;
- separate driving HUD/quick actions from settings;
- use appropriate mobile drawer/sheet behavior;
- add QoL demonstrated by actual play;
- perform targeted desktop/phone polish;
- publish major owner-visible checkpoints rather than every implementation step.

## 13. Process constraints

- minimize Jozz's manual technical intervention;
- prefer assistant-led code/repo work;
- when Windows execution is unavoidable, prefer isolated disposable workspaces under Downloads;
- do not use or modify existing local JV-Web project folders unless explicitly necessary;
- no GitHub Actions for this workflow;
- no force push;
- preserve public R0 as rollback/regression baseline;
- distinguish product failure from harness/operator failure;
- validate the stage that actually changed;
- do not send Jozz through a gate already known to be broken or redundant;
- use small attributable implementation slices;
- do not let release engineering consume product development again;
- do not hide failed assumptions by redefining success after the fact;
- owner visual/feel evidence matters when the question is experience.

## 14. Known unknowns

1. The full textured JSPREV2 runtime pack `source-preview-aee5242a20848294` is not contained in the supplied `box3d.zip`; its current accessible location still must be established before scan recovery can execute.
2. The native-vs-Web scan triangle-count discrepancy (`1,770,391` vs `1,775,775`) is unresolved and should be freshly measured.
3. The relation between the historical P1B private bundle `photogrammetry-primary-cc94c46ed4070411` and the later JSPREV2 runtime preview pack is not established.
4. Exact mechanical semantics of "blokowanie wałów" remain unresolved.
5. FWD has not been implemented in the current Web M6 drivetrain.
6. Exact Web build/binding cost of current native `b3Wheel` remains unproven.
7. Final camera behavior and final UI hierarchy should be tuned against actual play, not frozen here.
8. `M6_FULL_RIG_V1` is not guaranteed future general vehicle ABI.

## 15. Fresh-conversation protocol

A new agent should not begin by mechanically implementing the first phase above.

Recommended first session:

1. resolve current refs for private/public repos and verify Pages;
2. read `AGENTS.md`, `docs/PROJECT_STATE.md`, this CORE, the RESOURCE INDEX, RECOVERED SCAN EVIDENCE, R0 baseline and R1-F0 audit;
3. classify statements as CURRENT FACT / HISTORICAL EXACT PROOF / OWNER OBSERVED / RECOVERED SOURCE / HYPOTHESIS / UNKNOWN;
4. use the resource index instead of broad repo searches for known car/scan assets and historical commits;
5. inspect only the exact current code paths needed to test the handoff's architectural claims;
6. challenge the provisional ordering against current code and Jozz's current feel;
7. propose the smallest high-value implementation slice;
8. only then implement.

Do not spend the first conversation rediscovering c8e0 validation, the owner model paths, wheel markers, or R0 publication history. Those resources are already indexed.

Do not treat this handoff as an instruction to preserve the previous agent's architecture blindly.

## 16. Handoff status

```text
DRAFT V2.1
core rebuilt from current repos + supplied source archives + recovered raw historical evidence
NOT FINAL
```

Further review is expected. Future passes should explicitly ask:

- Is the handoff still too prescriptive about car / scan / config / wheel ordering?
- Are exact resources indexed sufficiently to eliminate broad rediscovery?
- Is any historical observation accidentally promoted beyond its evidence class?
- Is enough context duplicated across AI memory / project state / core to waste the new agent's context?
- Can the first-session protocol be shortened further without increasing hallucination risk?
