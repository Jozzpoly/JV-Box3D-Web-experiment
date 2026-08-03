# AI project memory — JV Box3D Web Experiment

Updated: 2026-08-03

## Goal

Build a serious browser proof of concept containing a real current JV vehicle, the JV test environment and later a 3D-scan terrain. The project passed the viability gate: the owner has repeatedly run and driven the browser build locally.

## Critical owner constraints

- Do **not** use historical M5 as the vehicle. The authoritative architecture begins with M6 and includes later M7+ work.
- Native JV remains the source of truth for physics, sessions, model registry data and authored asset contracts.
- Git Diff Patcher Bridge is categorically forbidden for this project and every other owner project. Use GitHub and ordinary Git only.

## Authoritative repositories and local layout

Native source: current `main` of `Jozzpoly/Box3d_FunProject`.

Owner workspace:

```text
Box3d_FunProject/
├─ box3d/                                  # native JV/Box3D working tree
└─ JV-Box3D-Web-experiment/
   └─ JV-Box3D-Web-experiment/             # browser repository
```

The synchronizer detects this sibling layout structurally. Absolute local paths are not committed.

Important native sources include:

- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_suspension_rig.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_rig_lab_mount_visual.cpp`
- `samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp`
- `samples/jozz_vehicle_central_test_campus*.cpp`
- `samples/jozz_vehicle_body_registry.cpp`

## Current branch and PR

- Branch: `agent/bootstrap-web-poc`
- Draft PR: #1
- Latest validated head at this update: `6da99769`

Keep the PR as draft until the owner validates the current local-session build, wheel orientation/rotation, remaining suspension visuals and scan behaviour.

## Physics and driving state

Implemented:

- four-corner double-wishbone multi-body topology;
- physical rack, tie rods, static-toe rest lengths and caster self-alignment;
- current drive/brake/coast, AWD, ARB and aero behaviour;
- local `build/jozz_vehicle_m6_session.json` import with factory/`uliczny` fallback;
- deterministic straight-line and native-P1-style steering-impact probes;
- explicit finite-rate keyboard driver input model.

The owner confirmed that the finite-rate keyboard model significantly improved steering and unexpectedly resolved a very old digital-input technical debt. It limits the commanded steering rate only; it does not read yaw, slip, wheel force or vehicle state and does not secretly stabilize the car.

Latest committed factory probe results:

- straight: `dx=32.33 m`, `dz=0.04 m`, lateral ratio `0.001`, chassis tilt `1.0°`;
- impact recovery: final rack fraction `0.002`, final yaw `-0.003 rad/s`;
- keyboard tap: peak rack `0.578`, final rack `0.003`, final yaw `-0.008 rad/s`.

## Runtime boundary hardening

A real owner-found startup failure (`b3MulQuat is not a function`) established that successful TypeScript compilation is insufficient.

Current mandatory gates:

- explicit `src/physics/box3d-runtime.ts` native/WASM boundary;
- one named `b3MulQuat` compatibility shim using the exact Box3D formula;
- scan of all current `b3.*` calls against an instantiated `box3d.js/inline` module;
- Node/WASM physics smoke simulation;
- production Vite build;
- real headless Chrome startup and DOM/error/telemetry checks;
- deterministic physics probes;
- visual wheel contract checks.

Currently 60 distinct Box3D calls are checked against real exports.

## Wheel visual failure and resolution

The owner found that one visual `Offroad_Big_Wheels.gltf` instance was enormous and detached from the car, apparently attached to the world, while the remaining wheel visuals were missing/wrong.

Root causes:

1. The wheel is a skinned glTF. Repeated `Object3D.clone(true)` copies shared/aliased skeleton state.
2. The model was centred from generic scene bounds instead of its authored socket and dimension markers.

The asset contains the authoritative nodes:

- `Socket_WheelMount`
- `Marker_TireRadiusOuter`
- `Marker_TireWidthLeft`
- `Marker_TireWidthRight`
- `Axis_WheelSpin_A/B`

Implemented in `src/render/wheel-asset-contract.ts`:

- marker-derived axle/radius/width basis;
- socket-to-body-origin transform;
- independent radial and axial scale;
- `SkeletonUtils.clone` for an independent hierarchy per wheel;
- four clone/skeleton validation;
- visual-root versus corresponding Box3D wheel-body position validation;
- primitive fallback when any contract fails.

Headless Chrome validation proved:

```text
clones=4
skeletons=4
authored radius=1.46875
authored width=1.25000
radial scale=0.35000
axial scale=0.35000
root/body binding error=0.00 m
```

The owner must still visually confirm tread orientation, left/right mirroring and rotation in the local current asset/session build.

## Asset bridge foundation

`tools/sync-jv-assets.mjs` treats the local native working tree as authoritative and synchronizes body, wheel, front rig, rear mount and damper assets.

It now validates required wheel markers and generates:

```text
public/assets/jv-asset-manifest.json
```

The manifest records bridge version, native source/ref, SHA-256, byte count, mesh/skin/node counts and socket/marker/axis names. This is the foundation for converting additional vehicle parts through explicit contracts instead of manual visual guessing.

Architecture and invariants are documented in:

```text
docs/WEB_CONVERSION_FOUNDATION.md
```

## Current visual state

Implemented:

- real `rama_rurowa` body with registry/session offset;
- real marker-bound four-wheel glTF instances;
- live hardpoint diagnostic wishbones, kingpins, coilovers, rack and links;
- orbit/zoom camera;
- Central Test Campus procedural contracts.

Synchronized but not fully bound:

- `OneSided_Steering_Suspension_Rig.gltf`;
- `One_Sided_wheel_mount.gltf`;
- `Asset_Dumper.gltf`.

Do not attach the whole front rig to one body. Native JV splits its ownership across chassis, lower arm and knuckle. The next visual work must reproduce that per-bone/socket ownership.

## Next development order

1. Owner pulls and visually validates the four corrected wheel instances, orientation and rotation.
2. Port front suspension visual bone/socket ownership exactly from native JV.
3. Port rear mount and telescoping damper binding.
4. Generate the web config schema/field mapping from the native C++ field table to remove duplicate hand-maintained lists.
5. Replace remaining Box3D `any` IDs/module calls with branded ID types and a typed runtime facade.
6. Convert real board/yard visuals without changing procedural physics contracts.
7. Add cleaned scan visual/collision assets and explicit wheel-contact/internal-edge diagnostics.
8. Decide whether the mesh binding needs `identifyEdges=true` support.

## Known scan risk

`box3d.js@0.0.2` exposes mesh creation but its simple wrapper does not expose mesh internal-edge identification. Vehicle testing on the scan may require a small, explicit binding extension for `identifyEdges=true`.
