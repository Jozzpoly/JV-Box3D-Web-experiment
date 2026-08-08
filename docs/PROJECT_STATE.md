# JV Web — current project state

Updated: 2026-08-08
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / R1 ACTIVE / CAMPAIGN SCOPE CORRECTED`
Owner: Jozz

## 1. Current campaign authority

For the current campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = active private JV-Web core

Jozzpoly/JV-Box3D-Web-Public
  = demonstrator artifact / GitHub Pages surface

Jozzpoly/Box3d_FunProject
  = native JV maintained by another agent; frozen for this campaign
```

Native JV may be inspected only as a source of already-existing mechanisms/knowledge needed by JV-Web (notably `b3Wheel`). Do not advance native JV unless Jozz explicitly changes scope.

Canonical conversation handoff and adaptive R1 plan:

[`handoff/JV_WEB_HANDOFF_2026-08-08.md`](handoff/JV_WEB_HANDOFF_2026-08-08.md)

## 2. Exact closed R0 baseline

Private source:

```text
commit: 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree:   08314a0182a38bbcd106e984dde73e737a1a13e7
```

Validated public candidate ZIP SHA-256:

```text
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2
```

Public:

```text
repo:       Jozzpoly/JV-Box3D-Web-Public
main:       401068f5734c841d43907b71484bc03a2396c604
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree:       f1c5c9a971208d89da05143f10913891a58b3b70
```

Pages:

```text
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source: release/r0 /(root)
status: built
HTTPS: enforced
```

R0 classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

R0 is a rollback/regression baseline. Do not rewrite its public bytes in place.

Canonical proof record:

[`repair/R0_PUBLISHED_BASELINE_2026-08-07.md`](repair/R0_PUBLISHED_BASELINE_2026-08-07.md)

## 3. Active R1 line

```text
development/jv-web-r1
```

Always resolve its exact current tip before work.

The previous R1-F0 audit remains useful technical evidence:

[`r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`](r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md)

But its old conclusion that the immediate project sequence is strictly `tiny GLB -> owner untextured -> textures` is no longer the whole campaign plan. Tiny GLB is now considered an internal diagnostic step on the shortest path toward owner-visible vehicle progress.

## 4. Desired campaign outcome

Before the JV-Web experiment is considered complete, Jozz wants a public friend-demo containing most of the following, with order adjusted by live feel and discoveries:

- Jozz's own polished vehicle model;
- racing-game-style chase camera;
- desktop orbit/zoom and phone pinch zoom;
- simple usable JSPREV2 scan path;
- world-location teleportation;
- vehicle presets;
- browser-native vehicle settings panel;
- FWD / RWD / AWD;
- a properly defined drivetrain/shaft locking function;
- useful QoL;
- UI rebuilt for Web/mobile use;
- port of the newer smooth native `b3Wheel` / "prawdziwy kolider koła" into the Web Box3D runtime if the feasibility spike confirms a sane path.

Social-media polish is not a current blocker. Immediate product value for Jozz and friends has priority.

## 5. Current vehicle/runtime facts

### Current live visuals

The running vehicle is still procedural:

```text
main.ts
→ M6DebugRenderer
→ M6ProductRenderer
→ M6WorldRenderer
→ box chassis + cylinder wheels + diagnostic rig primitives
```

### Existing dormant GLB foundation

Present in active source:

```text
M6TraceFrame.visualFrame                    PRESENT
18-part + 8-segment current visual frame    PRESENT
M6_FULL_RIG_V1 package/bindings             PRESENT
GLB hash/policy/CPU decoder                 PRESENT
GPU geometry upload                         PRESENT
binding→world transform resolver            PRESENT
deterministic tiny full-rig fixture         PRESENT
live GLB draw integration                   MISSING
runtime pixel-texture draw path             MISSING
```

`M6_FULL_RIG_V1` is useful current proof topology, not guaranteed future ABI.

### Physics/runtime identity

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Browser Box3D runtime:

```text
box3d.js@0.0.2
binding: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
variant: inline-single-threaded
```

Current boundary does not expose native JV `b3Wheel`, so the desired true wheel collider requires an engine/binding Web port, not merely a UI setting.

### Drivetrain

Current config uses `allWheelDrive: boolean`:

```text
false -> rear two wheels driven
true  -> all four wheels driven
```

A clean FWD/RWD/AWD extension looks bounded but remains implementation work.

The requested drivetrain/shaft locking semantics are not yet defined. Do not guess.

## 6. Preserved salvage sources

### Scan

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

Important integration/hardening checkpoint:

```text
106312083875b5aa94cf1f9fc986ac3c26888aa5
```

This historical line already demonstrated a common world containing vehicle + E2R/offroad + private JSPREV2 render/collision on desktop. The tip repaired scan UV/filter/view behavior.

Phone scan behavior is not a finished proven property. Recover desktop behavior first, then measure phone bottlenecks before optimizing.

### Owner vehicle tooling

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Salvage selectively:

- Blockbench/glTF inspection;
- chassis/wheel calibration;
- deterministic package generation;
- embedded PNG pixel textures;
- NEAREST / CLAMP_TO_EDGE;
- OPAQUE/MASK alpha handling.

Do not wholesale merge. Its live renderer remained procedural and texture authoring outran runtime draw support.

The actual authoritative owner source model files have not yet been proven by this audit to be safely versioned in the repo; locate/revalidate them before owner-model integration.

## 7. Adaptive working plan

Current broad direction:

```text
R1-A  short handoff/reconciliation + owner/scan/b3Wheel risk checks
R1-B  real car + materially better chase camera
R1-C  recover scan + world teleport + phone measurement
R1-D  vehicle config model + presets + FWD/RWD/AWD + defined lock semantics
R1-E  true b3Wheel Web runtime
R1-F  rebuild UI around actual product capabilities
R1-G  QoL / friend-demo polish / campaign closure
```

This order may change. Jozz's live feel is an explicit scheduling input.

Principle:

> Every major slice should leave JV-Web materially more enjoyable or useful to run, while preserving a clean rollback and truthful evidence.

Do not let release engineering become the main project again.

## 8. Immediate next-session rule

A fresh conversation should revalidate before coding:

1. exact refs and Pages;
2. this file + handoff + R0 baseline + R1-F0 audit;
3. active renderer/visual/input/camera/config code;
4. exact scan and owner-candidate salvage surface;
5. `b3Wheel` Web-build feasibility only far enough to bound risk;
6. unknowns/contradictions;
7. smallest next owner-visible implementation slice.

The likely first implementation remains the live visual path toward Jozz's real car, with a very early bounded `b3Wheel` feasibility check, but this must be revalidated rather than inherited blindly.
