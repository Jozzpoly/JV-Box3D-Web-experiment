# JV Web — current project state

Updated: 2026-08-08
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / R1 ACTIVE / HANDOFF DRAFT V2.1`
Owner: Jozz

## 1. Current authority

```text
Private active core:
Jozzpoly/JV-Box3D-Web-experiment
development/jv-web-r1

Public demonstrator:
Jozzpoly/JV-Box3D-Web-Public
release/r0

Native JV:
Jozzpoly/Box3d_FunProject
read-only for this campaign
```

Resolve current refs before every operation.

Detailed handoff:
[`handoff/JV_WEB_HANDOFF_2026-08-08.md`](handoff/JV_WEB_HANDOFF_2026-08-08.md)

Exact resource map:
[`handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`](handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md)

## 2. Published R0 baseline

```text
private R0 source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604

Pages:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

Classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

R0 is closed and should remain a rollback/regression reference.

## 3. Current campaign target

JV-Web is currently being developed as a motivating friend-demo. Desired campaign outcome includes most of:

- Jozz's own vehicle model;
- better racing-game chase camera;
- phone pinch zoom;
- recovered private JSPREV2 scan and phone assessment;
- faster location teleportation;
- presets and browser-native settings;
- FWD/RWD/AWD;
- defined drivetrain/shaft locking;
- QoL;
- rebuilt Web/mobile UI;
- Web port of native `b3Wheel` if feasible.

Order is adaptive and may change after actual play.

## 4. Current runtime

### Vehicle presentation

Live path remains procedural:

```text
M6DebugRenderer
-> M6ProductRenderer
-> M6WorldRenderer
-> box chassis + cylinder wheels + diagnostic primitives
```

Already present but not connected to live product draw:

```text
M6TraceFrame.visualFrame                    PRESENT
18-part + 8-segment current visual frame    PRESENT
M6_FULL_RIG_V1 package/bindings             PRESENT
GLB hash/policy/CPU decode                  PRESENT
GPU geometry upload                         PRESENT
binding->world transforms                   PRESENT
tiny full-rig fixture                       PRESENT
live GLB draw integration                   MISSING
production texture/material runtime         MISSING
```

`M6_FULL_RIG_V1` is current proof topology, not guaranteed future ABI.

### Physics/runtime

```text
legacy_ts_m6
REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Web Box3D:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
inline-single-threaded
```

Current binding has no native `b3Wheel` API.

### Drivetrain

```text
allWheelDrive=false -> RWD
allWheelDrive=true  -> AWD
```

FWD not yet implemented. Shaft-lock semantics unresolved.

## 5. Recovered authoritative owner assets

### Chassis

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

Known mount/relationship:

```text
model 3.28m x 2.73m x 1.23m
wheelbase 2.50m
track 2.10m
yaw -90 degrees
chassis-local position (0, -0.60, 0)
```

Historical native record says orientation/placement were visually inspected in motion.

### Wheel

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256:
1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
Git blob:
c13c77a8e5552175ee8266b2da33a54691f1dae9
```

Contains embedded PNG plus semantic mount/spin/radius/width markers.

Do not ask Jozz to rediscover these resources before using the indexed repository paths.

## 6. Strongest preserved desktop scan baseline

```text
product/jv-web-car-map-scan
c8e0bf24748b0a790a1c0039b1be801eef266580
tree 3e241761784edd2a2fb6ab18095c25ea0e737185
```

Exact historical Windows evidence:

```text
Node 24.16.0
npm 11.17.0
full foundation/build/portable gate PASS
source/package/asset gate PASS
scan 7 tiles / 25 groups / 25 textures / 1,775,775 triangles
foundation gate SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

Direct historical owner observation tied to that run:

- scan displayed correctly;
- pixel smoothing OFF by default and toggleable;
- grid OFF by default and toggleable;
- vehicle collision correct.

Known UX debt from the same observation:

- map/scan teleport rebuilt the whole world;
- roughly one to several seconds wait.

`106312083875b5aa94cf1f9fc986ac3c26888aa5` remains the pre-fix causal baseline with known texture/grid defects.

Detailed evidence:
[`handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`](handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md)

## 7. Scan asset availability

Historical runtime pack:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does not contain the full textured runtime pack.

It does contain native cooked collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
73,156,192 bytes
SHA-256:
7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

Do not treat the `.b3mesh` as Web render data.

Historical triangle counts disagree (`1,770,391` native document vs `1,775,775` exact Web gate); remeasure actual pack when recovered.

A separate historical P1B bundle exists as a recovery lead, but is not proven identical to the JSPREV2 runtime preview. See resource index.

## 8. Useful salvage/reference sources

Owner tooling candidate:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only.

Native preset semantics:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
docs/SUBSYSTEM_UI_PRESETS_PL.md
```

Read-only semantic reference.

## 9. Provisional work framework

```text
A  short fresh revalidation + resource/risk bounding
B  real car + materially better camera
C  selectively recover c8e0 scan + faster teleport + phone measurement
D  config model + presets + FWD/RWD/AWD + defined lock semantics
E  true b3Wheel Web runtime if feasibility is sane
F  final Web/mobile UI + QoL + friend-demo closure
```

Do not execute mechanically. Owner feel and new evidence may reorder work.

## 10. Current unknowns

- current accessible location of full textured JSPREV2 pack;
- native-vs-Web historical triangle count discrepancy;
- relation of old P1B private bundle to later JSPREV2 runtime preview;
- exact shaft-lock semantics;
- exact b3Wheel Web/Emscripten/binding cost;
- final camera/UI behavior after playtesting.

## 11. Handoff status

Current handoff is **DRAFT V2.1**, deliberately not final.

Fresh-agent read order:

1. `AGENTS.md`
2. this state file
3. handoff CORE
4. RESOURCE INDEX
5. RECOVERED SCAN EVIDENCE
6. R0 baseline
7. R1-F0 audit
8. exact code relevant to the first revalidated question
