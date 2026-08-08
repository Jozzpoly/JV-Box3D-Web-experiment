# AI project memory — JV Web

Updated: 2026-08-08
Status: `R0 PUBLISHED / R1 ACTIVE / HANDOFF DRAFT V2.1 UNDER REVIEW`
Owner: Jozz

This is a navigation map, not the detailed handoff. Current Git/evidence always wins.

## Scope

```text
ACTIVE CORE:
Jozzpoly/JV-Box3D-Web-experiment / development/jv-web-r1

PUBLIC DEMO:
Jozzpoly/JV-Box3D-Web-Public / release/r0
https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV:
Jozzpoly/Box3d_FunProject
read-only for this campaign; maintained by another agent
```

## Owner goal

Current campaign is to finish a motivating friend-demo, not social-media polish and not final native parity.

Target capabilities, adaptively ordered by real play/feel:

- real Jozz chassis + wheels;
- better racing-game chase camera + phone pinch zoom;
- recovered JSPREV2 scan;
- fast location teleportation;
- vehicle presets/settings;
- FWD/RWD/AWD;
- correctly defined drivetrain/shaft lock;
- useful QoL;
- redesigned Web/mobile UI;
- Web port of newer native `b3Wheel` if feasible.

## Closed R0

```text
private source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284

authorized public release:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70
rollback 401068f5734c841d43907b71484bc03a2396c604
```

R0 is proven/published/owner-accepted on desktop + real phone. Keep frozen as regression/rollback baseline.

## Current Web facts

- live vehicle visual is still procedural;
- dormant GLB/visual-frame/GPU/binding infrastructure already exists;
- missing bridge = live GLB draw + production texture/material runtime;
- backend `legacy_ts_m6` is `REFERENCE_BROWSER_FIXTURE`, not final physics authority;
- Web Box3D is `box3d.js@0.0.2`, binding `2617a0f...`, engine `8441b4a...`;
- current Web runtime does not expose native `b3Wheel`;
- current drivetrain: `allWheelDrive=false` => RWD, `true` => AWD;
- FWD not yet implemented;
- exact meaning of requested shaft locking remains unresolved.

## Exact owner source assets recovered

Chassis:

```text
Jozzpoly/Box3d_FunProject
assets/source/Nadwozie.gltf
SHA-256 45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
```

Known historical mount:

```text
yaw -90 degrees
chassis-local position (0, -0.60, 0)
model 3.28m x 2.73m x 1.23m
```

Wheel:

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256 1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
```

Contains wheel mount/radius/width semantic markers.

Do not ask Jozz to rediscover these before trying the indexed repo paths.

## Strongest historical scan baseline

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

Exact Windows automated gate: PASS.

```text
foundation gate SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
scan: 7 tiles / 25 groups / 25 textures / 1,775,775 triangles
```

Direct historical owner observation tied to c8e0:

- scan displayed correctly;
- pixel smoothing OFF by default and toggleable;
- grid OFF by default and toggleable;
- collision worked correctly.

Known UX debt:

- map/scan teleport rebuilt whole world;
- roughly one to several seconds wait.

`106312...` remains the useful pre-fix causal baseline, not the preferred final recovery target.

Full scan runtime pack ID:

```text
source-preview-aee5242a20848294
```

The user-supplied native ZIP does not contain the full textured pack; current accessible location still must be established.

## Salvage

Owner tooling:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only; no wholesale merge.

Native preset semantics:

```text
assets/vehicle_presets/uliczny.json
assets/vehicle_presets/drift.json
assets/vehicle_presets/offroad.json
docs/SUBSYSTEM_UI_PRESETS_PL.md
```

## Provisional direction

```text
A  short revalidation/resource/risk bounding
B  real car + much better camera
C  selectively recover c8e0 scan + improve teleport + phone measurement
D  config/presets/FWD-RWD-AWD/defined lock
E  b3Wheel Web port if spike says sane
F  final Web/mobile UI + QoL + friend-demo polish
```

Do not execute mechanically.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
3. `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`
4. `docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`
5. R0 baseline
6. R1-F0 audit
7. exact code for the first revalidated question
