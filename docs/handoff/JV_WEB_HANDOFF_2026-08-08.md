# JV Web — controlled conversation handoff

Date: 2026-08-08
Status: **DRAFT V4 — DEEP REFERENCE / MINIMAL TAKEOVER LAYER ACTIVE / NOT FINAL**
Owner: Jozz

This CORE is a deeper evidence/reasoning reference. It is **not** the mandatory cold-start document.

Fresh-agent cold start is:

```text
current refs + live Pages
→ AGENTS.md
→ docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md
→ resource pack 00_START_HERE / 02_RESOURCE_MAP / 09_COLD_AGENT_TAKEOVER_CHECKLIST
→ exact current source/evidence required to challenge the first task
```

Load this CORE only when broader reasoning/evidence is needed. The takeover brief contains the current first-slice hypothesis but does not freeze a roadmap.

## 0. Purpose and authority

The next conversation must start fresh without losing project authority, owner intent, hard evidence, recovered resources or the reasons behind current boundaries.

This file transfers deeper context. It does not instruct a fresh agent to preserve the previous agent's architecture or scheduling blindly.

When sources disagree, use this hierarchy:

```text
1. current Git refs / current code / current live runtime
2. raw exact execution evidence + direct owner observation tied to a named run
3. exact recovered files/resource pack supplied by Jozz
4. historical documentation/plans/agent reports
5. current interpretation/provisional scheduling
```

Keep evidence classes separate:

```text
SOURCE-PRESENT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED / OWNER ACCEPTED
PUBLISHED
```

A historical branch proves what existed there, not what current R1 does. A later raw execution result outranks an earlier plan that said the execution was pending.

## 1. Campaign scope

```text
Jozzpoly/JV-Box3D-Web-experiment
  = ACTIVE PRIVATE CORE / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC FRIEND-DEMO / GitHub Pages release surface

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY SOURCE FOR THIS CAMPAIGN
```

Native JV is maintained by another agent and intentionally frozen while the JV-Web friend-demo is completed. Do not advance, reorganize or tune native JV unless Jozz explicitly changes scope.

Native JV may be read to obtain exact authored assets, state semantics and already-existing mechanisms, especially `b3Wheel`.

JV-Web may move ahead of native JV in browser/mobile presentation, camera, configuration, QoL and demo polish. Long-term easy native→Web transfer remains desirable but must not stall the current campaign.

## 2. Owner intent

The immediate target is not social-media production and not proof that the TypeScript reference fixture equals final native JV physics.

Jozz wants a browser version that increasingly feels like a real piece of his own game: something worth launching, driving, tuning and showing friends. A strong visible result is also meant to restore motivation/confidence before returning to the much longer native JV program.

Desired friend-demo closure includes most of:

- Jozz's real vehicle model, integrated and polished as practical;
- substantially better racing-game chase camera;
- desktop orbit/zoom and mobile pinch zoom;
- usable JSPREV2 scan and real-phone assessment;
- location/teleport switching without unnecessary page/world rebuilds;
- vehicle presets and a Web-native settings model/panel;
- FWD / RWD / AWD;
- mechanically meaningful drivetrain/shaft locking after semantics are established;
- useful QoL discovered through play;
- rebuilt Web/mobile UI;
- selected newer native `b3Wheel` port if the technical path proves sane.

Social-media readiness is a later benefit. Jozz's real driving/visual feel is a legitimate scheduling signal.

## 3. Hard anchors

### Active private line

```text
repo:   Jozzpoly/JV-Box3D-Web-experiment
branch: development/jv-web-r1
```

Always resolve its exact current tip/tree before work. Embedded handoff SHAs are provenance only.

### Closed public R0

```text
private source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated public candidate ZIP SHA-256:
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

R0 has exact source/artifact/publication proof plus owner desktop and real-phone use. It is immutable regression/rollback evidence, not the branch to keep editing.

## 4. Current private runtime facts

### Mechanics/backend

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D is pinned to `box3d.js@0.0.2`; the active boundary does not expose native JV's newer `b3Wheel` API.

Long-term authoritative mechanics convergence toward native JV Core + Box3D in one WASM boundary remains accepted, but the full migration/parity program is deferred in this friend-demo campaign. Bounded Web-local demo/config semantics are allowed when their non-authoritative status is explicit.

### Private product/world entry

```text
index.html
→ src/product-main.ts
→ loadLocalFullProductWorld()
→ loadLocalJsprev2Scan()
→ createProductWorld(scan)
```

E2R/offroad is part of the current product world. JSPREV2 is optional depending on exact local pack selection.

### Private scan delivery

Current `vite.config.ts` installs `finalJsprev2VitePlugin()`.

The plugin is dev-server-only and selects a local exact pack through:

```text
JOZZ_SCAN_PREVIEW_PACK
```

It exposes private runtime endpoints under `/__jv_scan__/`.

If no pack is selected, car + E2R can still run without scan.

### Current location switching

`product-controls.ts` still represents map/scan locations as links changing `jvSpawn`. That causes page/product startup rather than a lightweight in-app teleport. Historical one-to-several-second switching cost is therefore consistent with current architecture.

## 5. Scan evidence and recovery meaning

Historical local scan lineage:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

### `106312...` — pre-fix causal baseline

Exact Windows evidence established a full green integrated car + E2R + JSPREV2 checkpoint with:

```text
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
```

Owner/runtime observation confirmed working geometry/collision but visible atlas/filter/grid defects.

### `c8e0bf...` — strongest preserved desktop baseline

Exact historical evidence:

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

Canonical preserved evidence:

```text
docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
```

### Current-R1 continuity

Current R1 still contains LOCAL_FULL scan wiring. Several critical c8e0 scan/view-policy files survive byte-for-byte.

Therefore scan work is **not** a wholesale old-branch recovery task. Correct sequence when the asset is available:

```text
locate exact pack
→ run current LOCAL_FULL path
→ compare current behavior with c8e0 proof
→ reconcile only real gaps
→ replace page reload with in-app location switching if safe
→ measure real phone
→ optimize measured bottlenecks only
```

Do not rerun historical c8e0 gates merely to prove history again.

## 6. Missing scan asset and public boundary

Historical exact runtime pack:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied recovery archives/resource pack do not contain the full textured runtime pack.

The native recovery ZIP contains only a cooked collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
73,156,192 bytes
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

That `.b3mesh` is not a Web render asset.

A separate historical P1B bundle is only a recovery lead; relation to the later JSPREV2 preview pack is unproven.

Historical triangle counts disagree (`1,770,391` native documentation vs `1,775,775` exact Web gate). Remeasure the actual recovered pack rather than choosing one old number.

### Public scan is a separate delivery problem

Current private scan serving is `apply: "serve"` and reads local filesystem files. GitHub Pages cannot use that mechanism directly.

Therefore:

```text
LOCAL_FULL scan historically/currently available in private dev
≠
public Pages scan asset delivery solved
```

Do not accidentally publish private bytes. Decide public packaging/hosting/cache/phone-memory strategy only after the real pack is recovered and measured.

## 7. Vehicle visuals — current seam and exact assets

### Live renderer

```text
M6DebugRenderer
→ M6ProductRenderer
→ M6WorldRenderer
→ procedural box chassis + cylinder wheels + diagnostics
```

### Existing dormant stack

Current source already contains:

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

The deterministic tiny GLB is a diagnostic fallback, not an obligatory milestone.

### Exact owner chassis

```text
Nadwozie.gltf
SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
```

Historical start point:

```text
model approx. 3.28m × 2.73m × 1.23m
wheelbase 2.50m
track 2.10m
yaw -90°
chassis-local position (0,-0.60,0)
```

### Exact owner wheel

```text
Offroad_Big_Wheels.gltf
SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
```

Semantic source markers include mount, spin-axis, outer-radius and width markers.

### Frozen owner-tooling candidate

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only. It contains deterministic owner-source inspection/conversion/calibration ideas and exact authored material requirements. Its final live renderer was still procedural; never wholesale-merge the branch.

## 8. Current first-slice hypothesis — REAL CAR V1

Cold-agent/adversarial review currently favors one owner-visible slice:

```text
exact Nadwozie chassis
+ four exact owner wheel visual channels
+ minimum required pixel material/texture runtime
+ live authored-GLB draw bridge
+ current physics/world/camera unchanged
```

Why it currently wins:

- exact resources and provenance are already available;
- historical calibration exists;
- the live-render/material seam is bounded;
- the result is immediately owner-visible;
- scan's decisive current-R1 runtime proof is blocked by the missing exact textured pack;
- `b3Wheel` is a deeper engine/build/binding risk better treated as a short secondary spike.

This is a hypothesis to revalidate against current Git/resources, not a permanent roadmap item.

Use the tiny fixture only if direct real-owner-asset integration leaves an ambiguous importer-vs-draw-bridge failure.

## 9. Camera/mobile interaction

Current camera lives in `src/render/m6-world-renderer.ts` and already owns yaw/pitch/distance and pointer camera controls. Touch driving already uses pointer ownership.

Desired product behavior includes smooth chase, tunable distance/height/look-ahead, desktop orbit/zoom and phone pinch zoom.

Current recommendation is to treat camera/mobile view as a **separate owner-feel slice after REAL CAR V1** so visual placement/material defects and camera-feel defects stay attributable.

Do not freeze final smoothing/constants here; tune through actual play.

## 10. Vehicle config / presets / drivetrain

Current reference fixture uses:

```text
allWheelDrive=false → RWD
allWheelDrive=true  → AWD
```

FWD is not implemented. A bounded FWD/RWD/AWD semantic selection is legitimate friend-demo work as long as it is not misrepresented as native parity.

Native JV tracked presets (`uliczny`, `drift`, `offroad`) and its distinction between vehicle preset, tuning/session state, view/debug state and world spawn are useful semantic references. Do not port native UI literally.

A Web vehicle-config model should precede a polished settings panel. Useful update classes may include:

```text
LIVE
REBUILD_VEHICLE
REBUILD_WORLD
```

Exact requested drivetrain/shaft-lock semantics remain unresolved and must not be guessed from the label.

## 11. `b3Wheel` / true-wheel boundary

Current Web binding does not expose native JV's newer true-wheel API.

The resource pack preserves exact recovered source surfaces for:

```text
B3X-WHEEL-001      wheel collider/contact integration
B3X-WHEEL-SOFT-002 wheel-only normal softness
```

Before a real port, compare the recovered frozen surface with the then-current read-only native JV state to ensure the intended newest accepted wheel revision is selected.

Current campaign rule:

```text
port existing selected mechanism
!=
restart tire/contact R&D in JV-Web
```

Treat `b3Wheel` as a bounded secondary feasibility spike unless evidence shows it must block the main owner-visible work. Answer source-delta, Emscripten/build, export/binding and focused-test questions first. Keep the legacy split-wheel path as rollback until a new Web path is proven.

## 12. Validation/process model

R0 demonstrated exact provenance/reproducibility/rollback, but also how release machinery can consume product development.

Current private R1 uses three evidence weights:

### Tier 1 — ordinary private slice

Exact ref identity + focused tests/checks + smallest relevant browser smoke. No user action by default.

### Tier 2 — owner feel/visual/device checkpoint

Use only when the question requires Jozz to drive/look/feel or use a real phone. Perform all automatable validation first.

### Tier 3 — public release candidate

Return to full reproducible source/artifact/promotion/rollback/live-HTTPS discipline only for a meaningful public checkpoint.

Always distinguish product failure from harness/operator failure. Do not let validation infrastructure become the product.

## 13. Adaptive opportunity lanes

No rigid phase train is active.

### CAR VISUAL

Current first-slice hypothesis: REAL CAR V1. Current physics/world/camera unchanged; tiny GLB only as diagnostic fallback.

### CAMERA / MOBILE VIEW

Probable next owner-feel slice after the real-car checkpoint. Evolve current `M6WorldRenderer` path and preserve touch-driving ownership.

### WORLD / SCAN / TELEPORT

Code distance is small, but decisive runtime revalidation is resource-blocked until the exact textured pack is recovered. Then revalidate current LOCAL_FULL first and improve in-app location switching before optimizing.

### VEHICLE CONFIG / PRESETS / DRIVETRAIN

Build semantic state before polished UI. Add bounded friend-demo presets/FWD/RWD/AWD, then the lock mechanism only after exact mechanics are defined.

### TRUE WHEEL

Short secondary feasibility/port track unless evidence makes it a blocker.

### UI / QoL / FRIEND-DEMO PUBLICATION

Rebuild the interface around capabilities that actually exist, add QoL from real play and publish owner-visible jumps rather than every internal slice.

Scheduling rule:

```text
1 main owner-visible slice
+
at most 1 short risk-reduction spike
```

Reorder when current code, runtime evidence or Jozz's feel justifies it.

## 14. Known unknowns — preserve rather than guess

1. Current accessible location of the full textured `source-preview-aee5242a20848294` pack.
2. Actual scan pack size/count after recovery and real-phone performance.
3. Public Pages scan packaging/hosting strategy.
4. Historical scan triangle-count discrepancy.
5. Relation of old P1B bundle to later JSPREV2 preview pack.
6. Exact semantics of "blokowanie wałów".
7. Exact Web/Emscripten/binding cost of selected `b3Wheel`.
8. Which exact then-current native wheel revision should become the Web target.
9. Final chase-camera feel.
10. Final UI hierarchy.
11. Whether real authored-asset integration reveals a reason to revise current visual contracts.

## 15. Fresh-conversation takeover protocol

The first session should **not** load this whole CORE as a prerequisite.

Use:

1. current private/public refs + live Pages;
2. `AGENTS.md`;
3. `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`;
4. resource-pack `00_START_HERE.md`, `02_RESOURCE_MAP.md`, `09_COLD_AGENT_TAKEOVER_CHECKLIST.md` if attached;
5. exact current source/evidence required to challenge the proposed first task.

Then load this CORE, `PROJECT_STATE`, resource index, recovered scan evidence or R0 closure **only when the question needs deeper context**.

Do not broadly rediscover owner assets, c8e0 evidence, scan lineage or `b3Wheel` surfaces; they are indexed/attached.

A takeover self-test is whether the agent can explain scope/R0, REAL CAR V1 as a hypothesis, exact owner resources, live visual gap, camera separation, scan resource blocker, `b3Wheel` secondary role and deeper-resource locations without old-chat archaeology.

## 16. Context deliberately not carried

Do not spend active context on:

- detailed C0/C1/C2 chronology;
- every old Windows gate variant;
- PowerShell wrapper failures;
- synthetic keyboard harness history;
- every abandoned candidate branch;
- previous-agent arguments merely because they were long.

Those remain in Git/history. Carry their engineering lessons, not their narrative bulk.

## 17. Handoff status

```text
DRAFT V4
minimal cold-start takeover layer active
adversarial first-slice review performed
REAL CAR V1 is a revalidatable hypothesis
resource pack V3 preserves exact attachments
NOT FINAL
```

Next quality gate before a final handoff candidate is an exact minimal fresh-chat simulation using only the documented cold-start layer. If that simulation needs old-chat archaeology or reveals conflicting current authority, repair the handoff before product implementation.