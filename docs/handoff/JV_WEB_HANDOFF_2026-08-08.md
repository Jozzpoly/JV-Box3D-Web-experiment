# JV Web — controlled conversation handoff

Date: 2026-08-08
Status: **DRAFT V3 — COLD-AGENT REBUILT / NOT FINAL**
Owner: Jozz

## 0. What this handoff is for

The next conversation should begin with a fresh context, but it must not waste that context rediscovering project identity, proven baselines, recovered assets or known historical evidence.

The purpose of this handoff is to transfer:

- project authority and scope;
- Jozz's intent for the friend-demo;
- current code/runtime facts;
- exact resources and historical evidence that matter now;
- unresolved questions that must remain unresolved until tested/clarified;
- a decision framework for choosing the next implementation slice.

It is deliberately **not** a frozen roadmap and not an instruction to preserve the previous agent's architecture or scheduling.

A fresh agent must revalidate current refs/code before implementation and should challenge every provisional priority against the actual running product and Jozz's current feel.

## 1. Evidence and authority hierarchy

When sources disagree, use this order:

```text
1. current Git refs / current code / current live runtime
2. raw exact execution evidence + direct owner observation tied to a named run
3. exact recovered files/resource pack supplied by Jozz
4. historical documentation/plans/agent reports
5. current interpretation/provisional scheduling
```

Examples:

- a later raw PASS overrides an earlier plan saying the gate was pending;
- owner observation of a named exact run is stronger than a generic summary;
- a historical branch proves what existed there, not what current R1 does;
- a convenient plan must yield when current code shows the feature is already present.

Keep evidence classes separate:

```text
SOURCE-PRESENT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED / OWNER ACCEPTED
PUBLISHED
```

## 2. Campaign scope

For this campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = ACTIVE PRIVATE CORE / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC FRIEND-DEMO / GitHub Pages release surface

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY SOURCE FOR THIS CAMPAIGN
```

Native JV is maintained by another agent and intentionally frozen while the JV-Web demonstrator is completed. Do not advance, reorganize or tune native JV unless Jozz explicitly changes scope.

Native JV may be read to obtain exact authored assets, state semantics and already-existing mechanisms, especially `b3Wheel`.

JV-Web is allowed to move ahead of native JV in camera, browser/mobile UX, settings, QoL, presentation and demo polish. Long-term easy native→Web transfer is desirable, but it must not stall the current campaign.

## 3. Owner intent — the reason for this campaign

The immediate target is not social-media production and not proof that the TypeScript fixture equals final native JV physics.

Jozz wants a browser version that feels increasingly like a real piece of his own game: something he wants to launch, drive, tune and show friends. A strong visible result is also meant to restore motivation/confidence before returning to the much longer native JV program.

Before this experiment is considered complete, the public friend-demo should contain most of the following, subject to discoveries and actual play/feel:

- Jozz's real vehicle model, integrated and polished as practical;
- substantially better racing-game-style chase camera;
- desktop orbit/zoom and mobile two-finger pinch zoom;
- usable JSPREV2 scan and acceptable phone behavior if practical;
- teleport/location switching without unnecessary full page/world rebuilds;
- vehicle presets;
- a Web-native vehicle settings model and later panel;
- FWD / RWD / AWD;
- a mechanically meaningful drivetrain/shaft lock after its semantics are established;
- useful QoL discovered through play;
- interface rebuilt around Web/mobile use rather than the diagnostic lab layout;
- selected newer native `b3Wheel` port before closure if the technical path proves sane.

Social-media readiness is a later benefit, not a current design constraint.

**Scheduling principle:** Jozz's actual experience while driving/looking is legitimate evidence about what should be done next.

## 4. Hard anchors

### Private R1

```text
repo: Jozzpoly/JV-Box3D-Web-experiment
branch: development/jv-web-r1
```

Always resolve its exact current tip before work. Handoff preparation itself uses docs-only commits, so embedded transient R1 SHAs age quickly.

### Closed public R0

```text
private source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public repo:
Jozzpoly/JV-Box3D-Web-Public

release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604

Pages:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source release/r0 /(root)
```

R0 has exact source/artifact/publication proof plus owner desktop and real-phone use. It is closed and must remain a regression/rollback reference.

Do not restart R0 release engineering during ordinary R1 work.

## 5. Current private product architecture — key facts

### 5.1 Mechanics/backend

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D is pinned to `box3d.js@0.0.2`; the active boundary does not expose native `b3Wheel`.

### 5.2 Private entry/world

Current private root:

```text
index.html
→ /src/product-main.ts
```

`product-main.ts` still configures:

```text
loadLocalFullProductWorld
→ loadLocalJsprev2Scan()
→ createProductWorld(scan)
```

`createProductWorld()` supplies E2R/offroad and optional scan data.

### 5.3 Private scan delivery

Current `vite.config.ts` still installs `finalJsprev2VitePlugin()`.

The plugin is development-server-only and selects an exact local pack through:

```text
JOZZ_SCAN_PREVIEW_PACK
```

It serves private endpoints under `/__jv_scan__/`.

If the environment variable is absent, the private product can run car + E2R without scan.

This is crucial: current R1 did **not** lose the whole scan architecture during R0 refoundation.

### 5.4 Current location switching

`product-controls.ts` still renders map/scan choices as links with changed `jvSpawn` query parameters.

That produces page navigation/full startup rather than an in-app teleport. Historical owner observation of a one-to-several-second switch cost is therefore consistent with current architecture.

## 6. Scan evidence and what current work actually means

### Historical lineage

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

### `106312...`

First full green integrated car + E2R + JSPREV2 checkpoint. Exact Windows evidence passed with 7 tiles / 25 groups / 25 textures / 1,775,775 triangles. Owner/runtime observation confirmed working geometry/collision but visible atlas/filter/grid defects.

Use this as the pre-fix causal baseline when attribution is needed.

### `c8e0bf...`

Strongest preserved desktop baseline.

Exact evidence:

```text
full repository/build/portable gate PASS
JV WEB FOUNDATION GATE PASS
SOURCE/PACKAGE/ASSET GATE PASS
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
foundation log SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

Direct owner observation tied to the exact run states:

- scan displayed correctly;
- pixel smoothing OFF by default and toggleable;
- grid OFF by default and toggleable;
- vehicle collision worked correctly.

### Current continuity — important correction to old plans

Current R1 still contains the private scan loader/product wiring. Several critical c8e0 scan/view-policy files also survive byte-for-byte.

Therefore the next scan task is **not**:

```text
recover/port the old scan branch wholesale
```

It is closer to:

```text
locate the exact pack
→ run current LOCAL_FULL path
→ compare current behavior with c8e0 proof
→ reconcile only real regressions/missing links
→ replace link/page reload with in-app location switching if safe
→ measure real phone
→ optimize measured bottlenecks only
```

Do not rerun old c8e0 gates merely to prove history again.

## 7. Missing scan asset and public-scan boundary

Historical exact pack:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The user-supplied native ZIP does not contain this full textured pack. It contains a 73 MB cooked native `.b3mesh` collision cache, which is **not** the Web render asset.

A separate old P1B bundle is only a recovery lead; relation to the runtime preview pack is unproven.

Historical triangle counts disagree (`1,770,391` native doc vs `1,775,775` exact Web gate). Remeasure the recovered actual pack instead of choosing one old number.

### Public scan is a separate delivery problem

The current private Vite plugin is `apply: "serve"` and reads files from a local path. GitHub Pages cannot use that mechanism directly.

Therefore:

```text
current LOCAL_FULL scan works/has historical proof
≠
future Pages scan asset publication solved
```

Do not accidentally publish private bytes. Do not design public scan hosting before the real pack is available and measured. But keep this boundary visible so a future agent does not reach the end of the campaign and only then discover that local filesystem streaming cannot be deployed to Pages.

## 8. Vehicle visuals — current seam and recovered assets

### Current live renderer

```text
M6DebugRenderer
→ M6ProductRenderer
→ M6WorldRenderer
→ procedural box chassis + cylinder wheels + diagnostics
```

### Current dormant visual stack

Source already contains:

- `M6TraceFrame.visualFrame` / `VehicleVisualFrameV1`;
- current 18 PART + 8 SEGMENT proof topology;
- `VehicleVisualPackageV1 / M6_FULL_RIG_V1`;
- GLB URL/hash/policy validation;
- rigid CPU mesh decode;
- CPU ownership/budgets;
- GPU geometry upload;
- binding→world transform resolution;
- deterministic tiny full-rig fixture.

Missing core:

```text
live authored-GLB draw bridge
production pixel texture/material runtime
```

Tiny fixture is a useful diagnostic when isolating the live draw seam. It is not an owner-visible milestone and should not become a foundation campaign.

### Exact owner assets

Chassis:

```text
Nadwozie.gltf
SHA-256 45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
```

Historical start point:

```text
model 3.28m × 2.73m × 1.23m
wheelbase 2.50m
track 2.10m
yaw -90°
chassis-local (0,-0.60,0)
```

Wheel:

```text
Offroad_Big_Wheels.gltf
SHA-256 1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
```

It contains semantic mount/spin/radius/width markers.

These assets and generated audits are physically included in the handoff resource pack. A fresh agent should not ask Jozz to rediscover them.

### Frozen tooling candidate

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Salvage useful Blockbench inspection/calibration/package-generation ideas only. Do not merge the branch wholesale.

## 9. Camera and mobile interaction

Current camera is embedded in `src/render/m6-world-renderer.ts` and already owns yaw/pitch/distance and pointer camera controls.

A future chase-camera system should evolve/separate this existing path rather than begin as an unrelated parallel implementation.

Desired experience:

- smooth racing-game chase;
- tunable distance/height/look-ahead;
- desktop orbit/zoom;
- phone two-finger pinch zoom;
- camera gestures that coexist with existing touch driving ownership.

Exact smoothing/constants must be tuned through actual play. Do not freeze them in the handoff.

## 10. Vehicle config / presets / drivetrain

Current fixture uses:

```text
allWheelDrive=false → RWD
allWheelDrive=true  → AWD
```

FWD is not implemented but is likely a bounded semantic extension.

Native JV provides useful tracked presets (`uliczny`, `drift`, `offroad`) and a useful distinction between vehicle preset, session/tuning state, view/debug state and persistent world spawn. Use these as semantic reference only; do not port native UI literally.

A Web vehicle-config model should be defined before a polished settings panel. Useful update classes may include concepts such as:

```text
LIVE
REBUILD_VEHICLE
REBUILD_WORLD
```

Exact requested drivetrain/shaft lock semantics remain unresolved. Do not guess them from the label.

## 11. `b3Wheel` / true-wheel boundary

Current Web binding does not expose the native true wheel.

The handoff resource pack contains exact recovered native source surfaces for:

```text
B3X-WHEEL-001      wheel collider/contact integration
B3X-WHEEL-SOFT-002 wheel-only normal softness
```

Use them to bound a Web/Emscripten/binding feasibility spike.

Before a real port, compare the frozen recovered source with the then-current read-only native JV state to make sure the intended newest accepted wheel variant is selected.

Current campaign rule:

```text
port existing selected mechanism
!=
restart tire/contact R&D in JV-Web
```

Keep the legacy split-wheel backend available as rollback until the new Web path is established.

## 12. Process model — what changed after R0

R0 proved that exact provenance/reproducibility/rollback are possible, but the release campaign also demonstrated how validation machinery can consume development.

Current private R1 therefore uses validation tiers:

### Ordinary private slice

Exact ref + focused tests/checks + smallest relevant browser smoke. No user action by default.

### Owner feel/visual checkpoint

Use only when the product question requires Jozz to drive/look/feel or use a real phone. Agent performs all automatable work first.

### Public release candidate

Return to full source/artifact/reproducibility/promotion/rollback/live-HTTPS discipline only for a meaningful public checkpoint.

Always distinguish product failure from harness/operator failure.

## 13. Adaptive work model — opportunity lanes, not phases

The previous `A→B→C→D→E→F` sequence is superseded as a scheduling model.

Current opportunity lanes are:

### CAR / CAMERA

Owner-visible objective: exact Jozz chassis + wheels in live play, with substantially better chase camera. Use tiny GLB only as much as needed to isolate the draw seam. Add the minimum pixel-material support required by the real assets rather than treating untextured proof as a long-lived milestone.

### WORLD / SCAN / TELEPORT

Locate exact pack and revalidate **current** LOCAL_FULL. Then remove unnecessary page/world rebuild from location switching where architecture permits and measure a real phone before optimizing.

### VEHICLE CONFIG / PRESETS / DRIVETRAIN

Build semantic state before final UI. Add presets, FWD/RWD/AWD and selected useful tuning. Clarify shaft-lock mechanics before implementation.

### TRUE WHEEL

Run a bounded feasibility spike early enough to prevent future waste. It may run as a short secondary investigation while owner-visible work continues, unless its findings prove current car work would become disposable.

### UI / QoL / FRIEND-DEMO PUBLICATION

Rebuild UI around the capability set that actually exists. Add QoL from real play. Publish owner-visible jumps, not every internal slice.

### Scheduling rule

At any moment choose:

```text
1 main owner-visible slice
+
at most 1 short risk-reduction spike
```

Reorder when current code, runtime evidence or Jozz's feel justifies it. The plan serves the demo; the demo does not serve the plan.

## 14. Known unknowns — preserve rather than guess

1. Current accessible location of the full textured `source-preview-aee5242a20848294` pack.
2. Actual scan pack size/count after recovery and real phone performance.
3. Public Pages scan packaging/hosting strategy.
4. Historical scan triangle-count discrepancy.
5. Relation of old P1B bundle to later JSPREV2 preview pack.
6. Exact semantics of "blokowanie wałów".
7. FWD implementation details in current fixture.
8. Exact Web/Emscripten/binding cost of selected `b3Wheel`.
9. Which exact current native wheel revision should become the Web target at port time.
10. Final chase-camera feel.
11. Final UI hierarchy.
12. Whether real authored-asset integration reveals a reason to revise any current visual binding contract.

## 15. Fresh-conversation takeover protocol

The first session should **not** begin by implementing a roadmap item.

1. Resolve current private `development/jv-web-r1`, public `release/r0` and live Pages.
2. Read `AGENTS.md`, `AI_PROJECT_MEMORY.md`, `docs/PROJECT_STATE.md` and this CORE.
3. If the resource pack is attached, read its `00_START_HERE`, intent/resource/unknown maps and active-R1 entry paths.
4. Classify each important statement as CURRENT FACT / HISTORICAL EXACT PROOF / OWNER OBSERVED / RECOVERED SOURCE / HYPOTHESIS / UNKNOWN.
5. Revalidate only the exact current code seams that matter to the proposed first task.
6. Do **not** broadly rediscover car assets, c8e0 evidence, scan lineage or `b3Wheel` source surfaces; they are indexed/attached.
7. Challenge current scheduling against the code and owner goal.
8. Propose the smallest high-value implementation slice and the minimum evidence needed for it.
9. Only then implement.

A useful takeover self-test is: can the fresh agent explain the current scan wiring, owner asset location, live vehicle-render gap, camera location, `b3Wheel` boundary, public-scan boundary and remaining owner decisions without relying on the old conversation?

If not, treat that as a handoff defect.

## 16. What the next agent should deliberately NOT carry

Do not spend active context on:

- detailed C0/C1/C2 release chronology;
- every old Windows gate variant;
- the PowerShell stderr wrapper failure;
- synthetic keyboard harness history;
- every abandoned candidate branch;
- previous agent arguments merely because they were long.

Those remain in Git/history. Carry their lessons, not their full narrative.

## 17. Handoff status

```text
DRAFT V3
cold-agent simulation performed
current scan continuity and workflow tiers reconciled
NOT FINAL
```

Further iteration should test this document and the resource pack as if the old conversation were unavailable. If a fresh takeover still needs old-chat archaeology for a foreseeable first task, the handoff is not finished.