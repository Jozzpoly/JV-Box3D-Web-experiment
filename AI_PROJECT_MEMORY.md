# AI project memory — JV Box3D Web Experiment

Updated: 2026-08-03

## Goal

Build a serious browser proof of concept containing a real current JV vehicle, the JV test environment and later a 3D-scan terrain. The owner has repeatedly run and driven the browser build locally, so the basic WebAssembly/browser viability gate is passed.

## Critical owner constraints

- Do **not** use historical M5 as the vehicle. The authoritative architecture begins with M6 and includes later M7+ work.
- Native JV remains the source of truth for physics, sessions, model registry data and authored asset contracts.
- Git Diff Patcher Bridge is categorically forbidden. Use GitHub and ordinary Git only.

## Repositories and local layout

Native source: current `main` of `Jozzpoly/Box3d_FunProject`.

Owner workspace:

```text
Box3d_FunProject/
├─ box3d/                                  # native JV/Box3D working tree
└─ JV-Box3D-Web-experiment/
   └─ JV-Box3D-Web-experiment/             # browser repository
```

The synchronizer detects this sibling layout structurally. Absolute local paths are never committed.

Important native sources:

- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_suspension_rig.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_rig_lab_mount_visual.cpp`
- `samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp`
- `samples/jozz_vehicle_central_test_campus*.cpp`
- `samples/jozz_vehicle_body_registry.cpp`

## Branch and PR

- Branch: `agent/bootstrap-web-poc`
- Draft PR: #1
- Keep the PR as draft until the owner validates the local-session wheel placement, low-speed steering behavior, live front-rig visuals and scan behavior.

## Physics and driving state

Implemented:

- four-corner double-wishbone multi-body topology;
- physical rack, tie rods, static-toe rest lengths and caster self-alignment;
- current drive/brake/coast, AWD, ARB and aero behavior;
- local `build/jozz_vehicle_m6_session.json` import with factory/`uliczny` fallback;
- deterministic straight-line and native-P1-style steering-impact probes;
- finite-rate keyboard driver input isolated from the raw mechanism.

The owner confirmed the finite-rate keyboard model significantly improved steering and resolved a very old digital-input debt.

Raw committed factory probes remain:

- straight: `dx=32.33 m`, `dz=0.04 m`, ratio `0.001`, tilt `1.0°`;
- impact recovery: final rack `0.002`, final yaw `-0.003 rad/s`;
- keyboard tap: peak rack `0.578`, final rack `0.003`, final yaw approximately `-0.005 rad/s`.

## Low-speed steering jam finding

The owner reported intermittent strange steering behavior at standstill and very low speed.

A deterministic cycle probe was added:

```text
left command → direct right reversal → release
```

It runs once stationary and once under a small creep command. A non-invasive watchdog measures target, error, rack speed and servo stall frames.

Before the fix:

```text
stationary final rack ≈ 0.991
creep final rack      ≈ 1.019
servo stall           = 1 frame
```

The servo was not mechanically jammed: it reached both sides and crossed centre. The problem was mode switching. When filtered steer entered `steerInputDeadzone`, the controller inferred hands-off, disabled servo return and enabled 1.4× static rack friction before the rack reached centre.

Fix:

- `DriveInput` now carries optional explicit `steeringEngaged` state;
- `KeyboardDriverInputModel` stays engaged through return-to-zero and a fixed `0.35 s` centre hold;
- the hold reads no speed, yaw, slip, rack position, tyre force or vehicle state;
- controller and watchdog use the same explicit engagement state.

Final committed Chrome result:

```text
stationary: left=0.988 right=0.999 capture=0.008 final=0.014 stall=1 frame
creep:      left=0.987 right=1.000 capture=0.006 final=0.326 stall=1 frame
```

`capture` is rack fraction at the exact servo-release frame. The later creep displacement happens after hands-off and is therefore separated from input jamming.

Keyboard tap and low-speed centre capture are mandatory web-host CI gates; raw physical parity remains separately tested.

## Runtime boundary hardening

The owner-found `b3MulQuat is not a function` startup failure proved TypeScript compilation alone is insufficient.

Mandatory gates include:

- explicit native/WASM boundary in `src/physics/box3d-runtime.ts`;
- exact `b3MulQuat` compatibility shim;
- all source `b3.*` calls checked against instantiated `box3d.js/inline`;
- Node/WASM physics smoke;
- production Vite build;
- real headless Chrome startup, DOM, error and telemetry checks;
- raw physics probes;
- keyboard-host probes;
- wheel and front-rig visual-contract preflights.

Currently 60 distinct Box3D calls are checked against real exports.

## Wheel visual failures and final contract

The owner first found one enormous wheel detached from the vehicle while other wheel visuals were missing. Causes:

1. `Offroad_Big_Wheels.gltf` is skinned; repeated `Object3D.clone(true)` instances shared skeleton state.
2. The asset was centered from generic scene bounds.

This was fixed using `SkeletonUtils.clone` and authored markers. The owner then found a second issue: all four wheels followed physics, but left/right lateral offsets differed and the socket did not align with the knuckle.

Marker geometry established:

```text
Marker_TireWidthLeft  = -1.00 BU
Marker_TireWidthRight = +0.25 BU
physical tyre centre  = -0.375 BU
Socket_WheelMount     =  0.00 BU
```

At `0.35 m/BU`, the socket is `0.13125 m` from the tyre centre. It is the inboard hub face, not the physical wheel centre. Aligning it to the wheel-body origin shifted both visuals in the same world direction, producing opposite-looking left/right offsets.

Current `src/render/wheel-asset-contract.ts`:

- derives axle and width from the width markers;
- derives physical tyre centre from their midpoint;
- derives radius perpendicular to the axle;
- maps physical tyre centre to the Box3D wheel body;
- preserves mount socket as a separate offset;
- uses independent radial and axial scale;
- clones independent skeletons;
- validates root, centre, mount axis and dimensions.

Latest Chrome result:

```text
clones=4
skeletons=4
authored radius=1.46875
authored width=1.25000
radial/axial scale=0.35000/0.35000
root/body error=0.00 m
physical-centre error=0.00 m
mount offset=0.13125 m
```

The owner must still visually confirm corrected left/right symmetry and the relation to the placeholder knuckle after pulling the latest branch.

## Asset bridge

`tools/sync-jv-assets.mjs` treats the local native working tree as authoritative and synchronizes:

- body;
- wheel;
- front steering/suspension rig;
- rear mount;
- damper;
- native front-rig JSON contract.

It validates asset-specific required nodes and generates:

```text
public/assets/jv-asset-manifest.json
```

Manifest bridge version is 2 and records source/ref, SHA-256, bytes and structural metadata.

## Front steering/suspension preflight

Actual live skinned front-rig rendering is not implemented yet, but its bridge is now explicit and CI-gated.

Synchronized inputs:

- `OneSided_Steering_Suspension_Rig.gltf`;
- `assets/contracts/one_sided_steering_suspension.asset.json`.

Thirteen required nodes are validated before Vite starts. Browser preflight checks asset id, contract version, node uniqueness, skin and skeleton.

Known native semantic drift:

1. original isolated M9 JSON says `Socket_ChassisMount_b.ridesBody = knuckle`;
2. later M9 work separated it from `WheelCenter` into a non-steering carrier;
3. current M6 has no carrier body and maps that role to `lowerArm` in `jozz_vehicle_m6_rig_lab_steering_visual.cpp`.

Web role map uses topology-neutral `nonSteeringCarrier`, currently resolved to M6 `lowerArm`. Current M6 runtime code is authoritative for body ownership; JSON remains authoritative for authored identities and socket positions.

Latest Chrome preflight:

```text
nodes=13/13
skin=1/1
M6 carrier=lowerArm
native JSON=knuckle
knownDrift=true
```

Do not attach the whole front rig to one body.

## Current visual state

Implemented:

- real `rama_rurowa` body;
- corrected four-wheel skinned GLTF adapter;
- live diagnostic cylinder wishbones, kingpins, coilovers, rack and links;
- orbit/zoom camera;
- Central Test Campus procedural contracts.

Preflight complete, live binding pending:

- front steering/suspension rig.

Synchronized but not fully bound:

- rear mount;
- telescoping damper.

## Documentation

Primary architecture:

```text
docs/WEB_CONVERSION_FOUNDATION.md
```

Additional details:

```text
docs/PORTING_NOTES.md
```

## Next development order

1. Owner pulls and validates:
   - wheel lateral symmetry;
   - wheel relation to the current placeholder knuckle;
   - A/D release at standstill and very low speed.
2. Implement live front-rig adapter in this order:
   - chassis-owned rigid parts;
   - `nonSteeringCarrier` parts on M6 lower arm;
   - knuckle-owned parts;
   - stretched wishbone arms;
   - rack-centre to knuckle steering rod;
   - chassis to lower-arm telescoping damper.
3. Add visual binding diagnostics for every role/body pair.
4. Port rear mount and damper.
5. Generate web config schema/field mapping from native C++ field tables.
6. Replace remaining Box3D `any` IDs/module calls with branded types and a typed facade.
7. Convert real board/yard visuals.
8. Add cleaned scan visual/collision assets and contact/internal-edge diagnostics.
9. Decide whether `identifyEdges=true` needs an explicit binding extension.

## Known scan risk

`box3d.js@0.0.2` exposes mesh creation but not mesh internal-edge identification. Scan-wheel testing may require a small explicit binding extension for `identifyEdges=true`.
