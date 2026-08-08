# JV Web — fresh-agent takeover brief

Date: 2026-08-08
Status: **DRAFT V4 ORCHESTRATION LAYER — NOT A FROZEN ROADMAP**
Owner: Jozz

This is the minimum cold-start layer for a fresh agent. It exists so the next conversation does not need to load the full project history before it can reason correctly.

Current Git and live evidence always outrank this brief. If a current ref, source file, runtime observation or Jozz's actual feel contradicts a scheduling hypothesis below, re-evaluate it rather than preserving the hypothesis.

## 1. Start here

Before implementation:

1. resolve the current tip/tree of `Jozzpoly/JV-Box3D-Web-experiment:development/jv-web-r1`;
2. verify public `Jozzpoly/JV-Box3D-Web-Public:release/r0` and live Pages still exist;
3. read `AGENTS.md`;
4. read this brief;
5. if the handoff resource pack is attached, read only its `00_START_HERE.md`, `02_RESOURCE_MAP.md` and `09_COLD_AGENT_TAKEOVER_CHECKLIST.md` first;
6. inspect only the current source/evidence needed to challenge the proposed first task.

Do **not** automatically preload `AI_PROJECT_MEMORY.md`, full `PROJECT_STATE`, the full handoff CORE and every evidence document. They are deeper references for questions that require them.

## 2. Campaign identity

```text
ACTIVE PRIVATE CORE
Jozzpoly/JV-Box3D-Web-experiment
development/jv-web-r1

PUBLIC CLOSED BASELINE
Jozzpoly/JV-Box3D-Web-Public
release/r0
https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV
Jozzpoly/Box3d_FunProject
READ-ONLY for this campaign; maintained by another agent
```

Public R0 is an immutable rollback/regression baseline. Do not modify it in place.

The current Web backend is `legacy_ts_m6`, a deterministic browser reference fixture. It is not native parity and not final product-physics authority. That does not prevent bounded friend-demo configuration or presentation work; it prevents silently presenting new TypeScript physics as authoritative native behavior.

## 3. Owner objective

Finish a motivating browser friend-demo that increasingly feels like Jozz's own game and is worth launching, driving, tuning and showing friends.

Important desired capabilities include the real authored vehicle, better chase camera/mobile view interaction, usable JSPREV2, fast location switching, vehicle presets/settings, FWD/RWD/AWD, a precisely defined drivetrain lock, useful QoL, rebuilt Web/mobile UI and — if technically sane — a selected newer native `b3Wheel` port.

Order is adaptive. Product feel may legitimately change scheduling.

## 4. Current first-slice hypothesis — `REAL CAR V1`

After a cold-agent/adversarial review of current R1, the strongest **current hypothesis** for the first main owner-visible slice is:

> render Jozz's exact real chassis and four exact real wheels in the existing current physics/world/camera, with the minimum real pixel-texture/material support needed by those assets.

This is deliberately **not** `CAR + CAMERA` in one slice. Keeping the current camera unchanged isolates visual-import/render defects from camera-feel defects and gives Jozz one clear visual question to judge.

Challenge this choice if current Git/resources have materially changed.

### Why this currently wins

- exact owner assets are already recovered and physically present in the handoff resource pack;
- historical calibration/marker evidence exists;
- current R1 already has semantic visual frames, GLB validation/decode, GPU geometry ownership and binding transforms;
- the live renderer is still procedural, making the result immediately owner-visible;
- the frozen owner-vehicle candidate contains deterministic real-asset conversion/calibration/material work that can be selectively salvaged;
- scan cannot yet perform its decisive current-R1 runtime test without the missing exact textured pack;
- `b3Wheel` is a deeper Box3D/Emscripten/binding risk and is better treated as a bounded secondary spike.

## 5. Exact resources for `REAL CAR V1`

### Chassis

```text
Nadwozie.gltf
SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8

historical integration start:
yaw = -90°
chassis-local position = (0, -0.60, 0)
model approx. 3.28m × 2.73m × 1.23m
```

### Wheel

```text
Offroad_Big_Wheels.gltf
SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
```

Useful semantic markers include:

```text
Socket_WheelMount
Axis_WheelSpin_A
Axis_WheelSpin_B
Marker_TireRadiusOuter
Marker_TireWidthLeft
Marker_TireWidthRight
```

### Frozen selective-salvage candidate

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Important candidate resources include `docs/vehicle-visual/OWNER_VEHICLE_R1.md` and `tools/owner-vehicle/owner-m6-rigid-package-r1.mjs`.

The candidate already demonstrates deterministic source→rigid-GLB packaging ideas and the real authored material requirements. Do not merge the branch wholesale.

## 6. Current R1 visual gap to inspect first

Recommended first 30–60 minute source pass:

```text
src/render/m6-world-renderer.ts
src/render/m6-product-renderer.ts
src/render/vehicle-visual-render-resource.ts
src/render/rigid-mesh-gpu-asset.ts
src/visual/glb-material-policy-v1.ts
src/visual/glb-rigid-mesh-decoder.ts
src/visual/rigid-mesh-draw-plan.ts
src/visual/vehicle-visual-runtime-loader.ts
```

Current known facts:

```text
semantic visual frame                 PRESENT
GLB fetch/hash/decode                 PRESENT
GPU geometry buffers                  PRESENT
binding→world transforms              PRESENT
live authored-GLB draw bridge         MISSING
production textured material path     MISSING
```

The real owner assets require at least the relevant subset of:

```text
baseColorTexture
embedded PNG
MASK alpha mode / cutoff 0.05
doubleSided
NEAREST sampling
CLAMP_TO_EDGE wrapping
```

Do not generalize the renderer beyond what the real assets and near-term product path justify.

## 7. `REAL CAR V1` scope guard

Keep unchanged unless current evidence proves it must move:

- current physics/backend;
- current world/location behavior;
- current camera behavior;
- public R0;
- unrelated suspension/rack diagnostic visuals.

The first owner-visible target may use real authored channels for:

```text
m6.chassis
wheel FL
wheel FR
wheel RL
wheel RR
```

while other diagnostic rig geometry remains procedural.

The deterministic tiny full-rig GLB is **not** a required milestone. Use it only as a diagnostic fallback if a direct real-owner-asset failure cannot be localized between package/import code and the live draw bridge.

Expected evidence before asking Jozz to judge the result:

- exact branch/source identity;
- focused package/material/renderer tests;
- relevant TypeScript/build checks;
- browser smoke showing the live vehicle renders and moves without new runtime errors;
- exact candidate identity.

Then use Tier 2 owner observation for proportions, placement, texture appearance and whether the result genuinely reads as Jozz's car.

No public release is implied by this slice.

## 8. Why the other lanes are not the first main slice today

### SCAN / TELEPORT

Current R1 already retains LOCAL_FULL scan wiring and important c8e0 scan/view-policy code. The first real question is revalidation of **current R1** with exact pack:

```text
source-preview-aee5242a20848294
```

That full textured pack is not currently present in the handoff resources. Until it is recovered, scan can be inspected but cannot complete the decisive runtime proof. Do not reconstruct the old branch merely to stay busy.

Once the pack is available, this lane may become a very fast high-value task.

### `b3Wheel`

The resource pack contains exact recovered source surfaces for `B3X-WHEEL-001` and `B3X-WHEEL-SOFT-002`, but current Web uses the published `box3d.js@0.0.2` boundary and has no existing custom Emscripten build pipeline for that wheel API.

Treat this as at most one short secondary feasibility spike while the main owner-visible slice continues. Answer source delta, build, export/binding and focused-test questions. Do not reopen tire/contact R&D.

### CAMERA / MOBILE VIEW

Current camera already lives in `M6WorldRenderer` and touch driving already owns pointer interactions. Camera is high-value, but it should follow the first real-car visual checkpoint so visual and camera feedback are attributable separately.

## 9. Deeper references — load only when needed

```text
AI_PROJECT_MEMORY.md
  short broader navigation memory

docs/PROJECT_STATE.md
  detailed current state/evidence inventory

docs/handoff/JV_WEB_HANDOFF_2026-08-08.md
  full controlled handoff CORE and reasoning

docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md
  exact resource retrieval map

docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md
  historical scan proof

docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md
  public R0 closure/provenance

docs/r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md
  technical visual-foundation findings; old scheduling superseded

docs/decisions/ADR-0003-native-jv-core-wasm.md
  long-term product-physics direction; full migration deferred in current campaign
```

Historical/candidate documents do not override current Git or this campaign scope.

## 10. Known blockers / unknowns that must remain explicit

- current accessible location of the full textured JSPREV2 pack;
- actual phone cost of that pack;
- public Pages scan delivery design;
- exact requested shaft-lock mechanics;
- exact Web build/binding cost of selected `b3Wheel`;
- which then-current native wheel revision should become the Web port target;
- final chase-camera feel and final UI hierarchy.

Do not guess these to make the roadmap look complete.

## 11. Cold-takeover success condition

Before implementation, a fresh agent should be able to explain — without old-chat archaeology:

- project/repository scope and immutable R0 boundary;
- why `REAL CAR V1` is the current first-slice hypothesis rather than a mandate;
- exact owner asset identity and current live-render/material gap;
- why camera is deliberately separated from the first car slice;
- why scan is currently resource-blocked rather than code-lost;
- why `b3Wheel` is a secondary risk spike;
- where to retrieve deeper evidence only when needed.

If it cannot, treat the problem as a handoff defect before starting product implementation.