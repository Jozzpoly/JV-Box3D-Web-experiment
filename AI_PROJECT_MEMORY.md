# AI project memory — JV Web

Updated: 2026-08-08
Status: `R0 PUBLISHED / R1 ACTIVE / HANDOFF DRAFT V2 UNDER REVIEW`
Owner: Jozz

This file is a compact navigation map. It never overrides current Git refs, exact evidence, recovered source files, or direct owner observation.

## Campaign scope

```text
ACTIVE PRIVATE CORE:
  Jozzpoly/JV-Box3D-Web-experiment
  branch: development/jv-web-r1

PUBLIC DEMO:
  Jozzpoly/JV-Box3D-Web-Public
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
  tree f1c5c9a971208d89da05143f10913891a58b3b70
  Pages https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV:
  Jozzpoly/Box3d_FunProject
  maintained by another agent and intentionally frozen during this JV-Web campaign
```

Native JV is read-only for this campaign unless Jozz explicitly changes scope. It may be inspected as a source of existing assets, semantics and mechanisms to selectively port, especially `b3Wheel`.

## Evidence hierarchy

Use this order when sources disagree:

```text
1. current Git refs / current code / live runtime
2. exact validation evidence + direct owner observation
3. recovered source snapshots supplied by Jozz
4. historical documentation/plans
5. current interpretation / provisional roadmap
```

Do not silently promote a lower layer over a higher one.

## Closed public R0

Private R0 source:

```text
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7
```

Validated candidate ZIP SHA-256:

```text
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2
```

Public:

```text
release/r0 c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree       f1c5c9a971208d89da05143f10913891a58b3b70
rollback   401068f5734c841d43907b71484bc03a2396c604
```

R0 proved deterministic public build/promotion, live Pages, desktop Edge, zero public scan requests, and owner manual acceptance on desktop + real phone. Keep R0 frozen as rollback/regression reference.

## Owner campaign goal

Before the JV-Web experiment is considered complete, the friend-demo should contain most of:

- Jozz's own polished vehicle model;
- materially better racing-game-style chase camera;
- desktop orbit/zoom and phone pinch zoom;
- recovered simple JSPREV2 scan path, acceptable on phone if practical;
- teleportation between useful world locations;
- vehicle presets;
- browser-native vehicle settings;
- FWD / RWD / AWD;
- correctly defined drivetrain/shaft locking;
- QoL discovered through play;
- Web/mobile UI rebuilt around the real product;
- native JV's newer smooth `b3Wheel` / "prawdziwy kolider koła" ported to Web if the technical path is sane.

Order is adaptive. Jozz's live feel is a real scheduling signal. Social-media polish is later and must not slow the current friend-demo.

## Current active Web facts

Live vehicle rendering is still procedural:

```text
M6DebugRenderer -> M6ProductRenderer -> M6WorldRenderer
box chassis + cylinder wheels + diagnostic rig primitives
```

Dormant visual foundation already exists:

- `M6TraceFrame.visualFrame`;
- current 18 PART + 8 SEGMENT frame;
- `VehicleVisualPackageV1` / `M6_FULL_RIG_V1`;
- GLB fetch/hash/policy/CPU decode;
- GPU geometry ownership;
- binding-to-world transform resolution;
- deterministic tiny full-rig fixture.

Missing product bridge: live GLB draw integration and later production texture/material runtime.

`M6_FULL_RIG_V1` is useful current proof topology, not sacred future ABI.

Current backend:

```text
legacy_ts_m6
REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D runtime:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
inline-single-threaded
```

It does not expose native `b3Wheel`; true-wheel Web support requires an engine/binding port, not a UI toggle.

Current drivetrain has `allWheelDrive: boolean`: false=RWD, true=AWD. FWD/RWD/AWD is a plausible bounded extension. The exact requested "blokowanie wałów" semantics are still unresolved and must not be invented.

## Recovered source archives

Jozz supplied two source snapshots with `.git` history:

```text
JV-Box3D-Web-experiment(1).zip
SHA-256:
1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f

box3d.zip
SHA-256:
b22043332ce0cf84d787312aebf8f76dc19bd6431f9a046399dfa7c2300c48f1
```

These are recovery/evidence sources, not automatically newer authority than current Git.

## Recovered scan truth

Historical scan line:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Most important evidence boundary:

- `106312...` is the recovered **first full green integrated car + E2R + JSPREV2 product checkpoint**;
- archived local evidence records Node 24.16.0, npm 11.17.0, 251/251 tests, exact private pack validation, 7 tiles / 25 groups / 25 textures / 1,775,775 triangles, browser runtime, controllable car on E2R and scan, and working scan Box3D collision;
- owner-visible defects at that green checkpoint: scrambled texture atlases, forced LINEAR filtering, always-visible grid, primitive debug vehicle;
- `c8e0bf...` contains plausible UV/filter/view corrections (`UNPACK_FLIP_Y_WEBGL=0`, NEAREST default, view controls), but the recovered record does **not** establish a full exact Windows gate or owner visual acceptance for that tip.

Therefore recover the known-green `106312...` behavior first and treat `c8e0...` fixes as code to freshly validate, not inherited PASS.

Canonical preservation:
`docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`

## Recovered scan asset boundary

Historical full pack ID:

```text
source-preview-aee5242a20848294
```

The supplied `box3d.zip` does not contain the full 7-tile textured JSPREV2 pack.

It does contain native cooked collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
bytes: 73,156,192
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

This is native collision-cache evidence, not a portable Web render asset.

Native history records 1,770,391 triangles while recovered Web evidence reports 1,775,775. Do not silently reconcile; freshly measure the actual pack when recovered.

## Recovered authoritative owner assets

This is a major correction to the previous handoff. Source models are versioned in native JV.

Chassis:

```text
Jozzpoly/Box3d_FunProject
assets/source/Nadwozie.gltf
SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
Git blob:
a25cb0ef61d342ce476c9ef26a3b24188bace047
```

Historical integration:
`a2759471d8641b9f3a3395d508f6c8116d60c81c`

Previously measured placement:
- model 3.28 m x 2.73 m x 1.23 m;
- wheelbase 2.50 m, track 2.10 m;
- yaw -90 degrees;
- chassis-local position `(0, -0.60, 0)`;
- visually inspected in motion with correct orientation.

Wheel:

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
Git blob:
c13c77a8e5552175ee8266b2da33a54691f1dae9
```

It contains semantic wheel mount/radius/width markers and embedded PNG.

Use exact resource pointers in:
`docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`

Do not ask Jozz to re-find these assets unless current repository access actually fails.

## Other useful salvage

Owner-vehicle tooling candidate:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only: strict Blockbench/glTF inspection, calibration, deterministic package generation, embedded PNG, NEAREST/CLAMP_TO_EDGE, OPAQUE/MASK. Do not wholesale merge.

Native tracked presets:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

`docs/SUBSYSTEM_UI_PRESETS_PL.md` is useful for state/preset semantics. Do not port native UI literally.

## Adaptive working program

```text
A  fresh revalidation + exact resource/risk bounding
B  "this is my car": live owner model + materially better chase camera
C  "this is my world": recover scan + teleport + phone measurement
D  vehicle sandbox: config model + presets + FWD/RWD/AWD + defined lock semantics
E  true b3Wheel Web runtime
F  Web/mobile UI + QoL + friend-demo closure
```

This is provisional. Tiny GLB is an internal seam test only. Scan is first a recovery task, not a redesign. `b3Wheel` deserves an early bounded feasibility spike but full port need not block visible car/camera progress.

## Process constraints

- minimize Jozz's manual intervention;
- prefer isolated disposable Downloads workspaces for Windows operators;
- do not use/modify existing local JV-Web folders unless explicitly necessary;
- no GitHub Actions for this workflow;
- no force pushes;
- preserve exact public artifact provenance and rollback;
- distinguish product failure from harness failure;
- validate the stage that changed;
- never send Jozz through known-broken gates;
- do not let release engineering consume product development again;
- public releases correspond to owner-visible value.

## Read first in a fresh conversation

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
4. `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`
5. `docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`
6. `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`
7. `docs/r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`
8. only then exact code relevant to the first revalidated slice

The DRAFT V2 handoff is intentionally still under review. A fresh agent must revalidate; it must not execute this roadmap mechanically.
