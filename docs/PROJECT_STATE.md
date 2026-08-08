# JV Web — current project state

Updated: 2026-08-08
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / R1 ACTIVE / HANDOFF DRAFT V2`
Owner: Jozz

## 1. Current campaign authority

```text
Jozzpoly/JV-Box3D-Web-experiment
  = active private JV-Web core

Jozzpoly/JV-Box3D-Web-Public
  = demonstrator artifact / GitHub Pages surface

Jozzpoly/Box3d_FunProject
  = native JV maintained by another agent; frozen for this campaign
```

Native JV may be read for existing assets, semantics and mechanisms needed by JV-Web, especially `b3Wheel`. Do not advance native JV unless Jozz explicitly changes scope.

Current handoff core:
[`handoff/JV_WEB_HANDOFF_2026-08-08.md`](handoff/JV_WEB_HANDOFF_2026-08-08.md)

Resource map:
[`handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`](handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md)

## 2. Closed R0 baseline

Private R0 source:

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
Pages:      https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R0 classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

R0 is the current rollback/regression reference. Do not rewrite its public bytes in place.

Canonical proof:
[`repair/R0_PUBLISHED_BASELINE_2026-08-07.md`](repair/R0_PUBLISHED_BASELINE_2026-08-07.md)

## 3. Active R1 line

```text
development/jv-web-r1
```

Always resolve its current exact tip before work.

The earlier R1-F0 visual audit remains useful technical evidence:
[`r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`](r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md)

Its old strict implementation sequence is no longer the whole campaign plan. Tiny GLB is an internal seam test on the shortest path toward owner-visible value, not a product milestone.

## 4. Current campaign outcome

The friend-demo should eventually contain most of:

- Jozz's own polished vehicle;
- materially better chase camera;
- desktop orbit/zoom + phone pinch zoom;
- recovered simple JSPREV2 scan path;
- world teleportation;
- vehicle presets;
- browser-native settings;
- FWD / RWD / AWD;
- properly defined drivetrain/shaft locking;
- useful QoL;
- Web/mobile UI rebuilt around the actual feature set;
- newer smooth native `b3Wheel` ported to Web if the technical path is sane.

Order is deliberately adaptive and may change based on live play/feel and discovered risk.

## 5. Current runtime facts

### Vehicle visuals

Live vehicle rendering remains procedural:

```text
M6DebugRenderer
-> M6ProductRenderer
-> M6WorldRenderer
-> box chassis + cylinder wheels + diagnostic primitives
```

Dormant source already contains:

```text
M6TraceFrame.visualFrame                    PRESENT
18-part + 8-segment current visual frame    PRESENT
M6_FULL_RIG_V1 package/bindings             PRESENT
GLB hash/policy/CPU decode                  PRESENT
GPU geometry upload                         PRESENT
binding->world transform resolver           PRESENT
deterministic tiny full-rig fixture         PRESENT
live GLB draw integration                   MISSING
runtime production texture draw             MISSING
```

`M6_FULL_RIG_V1` is current proof topology, not guaranteed future ABI.

### Physics/runtime

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Browser Box3D:

```text
box3d.js@0.0.2
binding: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
variant: inline-single-threaded
```

The current boundary does not expose native `b3Wheel`.

### Drivetrain

Current `allWheelDrive` means:

```text
false -> rear two corners driven
true  -> all four corners driven
```

FWD/RWD/AWD is plausible bounded work. Exact shaft/drivetrain lock semantics remain unresolved; do not guess.

## 6. Recovered scan history — stronger evidence than previous state document

User-supplied old JV-Web source archive recovered local Git history and a modified local validation record.

Important scan lineage:

```text
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580
```

Evidence boundary:

- `106312...` = recovered first full green integrated product: car + E2R/offroad + private JSPREV2 render/collision, exact Windows gate, 251/251 tests and owner runtime observation;
- the green checkpoint had visible texture/filter/grid/debug-vehicle defects;
- `c8e0bf...` contains plausible fixes for UV/filter/view behavior, but the recovered evidence does not establish a full exact gate or owner acceptance for that tip.

Preserved evidence:
[`handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`](handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md)

Future scan work should recover known-green behavior first, then freshly validate selected `c8e0...` fixes.

## 7. Recovered scan asset boundary

Historical full pack:

```text
source-preview-aee5242a20848294
```

The supplied native `box3d.zip` does **not** contain the full textured 7-tile pack.

It contains the native cooked collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
bytes: 73,156,192
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

Do not treat that cache as a Web render asset.

A historical native record reports 1,770,391 triangles while recovered Web evidence reports 1,775,775. Keep this discrepancy explicit until the actual pack is recovered and remeasured.

## 8. Recovered authoritative owner assets — corrected

The previous state document incorrectly left the source-model location unresolved.

Authoritative chassis is versioned in native JV:

```text
assets/source/Nadwozie.gltf
SHA-256:
45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
Git blob:
a25cb0ef61d342ce476c9ef26a3b24188bace047
```

Historical native integration commit:
`a2759471d8641b9f3a3395d508f6c8116d60c81c`

Historical measured placement:
- model 3.28 m x 2.73 m x 1.23 m;
- vehicle wheelbase 2.50 m;
- track 2.10 m;
- yaw -90 degrees;
- chassis-local position `(0, -0.60, 0)`;
- visually inspected in live native movement.

Authoritative wheel asset:

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
Git blob:
c13c77a8e5552175ee8266b2da33a54691f1dae9
```

It includes embedded PNG and semantic mount/radius/width markers.

Exact resource pointers and other authored assets are in the resource index. Do not ask Jozz to rediscover these files unless repository access actually fails.

## 9. Useful existing semantics

Native tracked presets:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
```

`docs/SUBSYSTEM_UI_PRESETS_PL.md` is useful as semantic input for the future Web config/preset model. Do not port native UI literally.

Owner visual tooling remains salvage-only from:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

## 10. Adaptive working program

```text
A  fresh revalidation + exact risk/resource bounding
B  real owner vehicle + materially better chase camera
C  recover scan + teleport + measure phone
D  config model + presets + FWD/RWD/AWD + defined lock semantics
E  true b3Wheel Web runtime
F  Web/mobile UI + QoL + friend-demo closure
```

This is provisional.

Important scheduling rules:
- tiny GLB = internal seam proof only;
- scan = recovery before redesign;
- b3Wheel = early bounded feasibility, full port when justified;
- config semantics before final settings UI;
- public release only when owner-visible value warrants it.

## 11. Fresh-conversation start

Read in this order:

1. `AGENTS.md`
2. this file
3. `handoff/JV_WEB_HANDOFF_2026-08-08.md`
4. `handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`
5. `handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`
6. R0 baseline
7. R1-F0 audit
8. exact code only for the first revalidated implementation question

The DRAFT V2 handoff is deliberately not final yet. Challenge facts against refs/evidence and challenge the provisional plan against Jozz's current feel before implementation.
