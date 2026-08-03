# JV Box3D Web Experiment

A focused proof of concept for running a real slice of **Jozz Vehicle** directly in a browser with Box3D compiled to WebAssembly.

## Current target

- the current M6/M7 multi-body vehicle foundation, not historical M5;
- the current local JV tuning session when a native checkout is available;
- the Central Test Campus contract;
- real JV body and wheel assets attached through explicit runtime contracts;
- a separate photogrammetry visual mesh and reduced collision mesh;
- deterministic browser probes that distinguish physics parity from keyboard handling.

This remains a proof of concept. Browser infrastructure, startup, isolated M6 steering parity and the wheel visual contract are tested. Direct owner driving and visual comparison remain the product gate.

## Implemented parity pass

- four double-wishbone corners;
- physical control-arm bodies, knuckles, ball joints and coilovers;
- physical steering rack and rigid tie rods;
- exact current rack-stroke geometry and static-toe turnbuckle lengths;
- load-dependent rack friction from transverse tie-rod forces;
- current torque-based drive, brake, coast, ARB and aero behavior;
- split rolling-sphere / true-width sidewall wheel envelope;
- live hardpoint-driven suspension visualization;
- real `rama_rurowa` body with native registry/session offset;
- four independent `Offroad_Big_Wheels.gltf` skinned instances;
- wheel scale, orientation and origin derived from authored socket/radius/width markers;
- wheel-root to Box3D-body attachment validation;
- current 400×400 m plate and Central Test Campus bumper/rock contracts;
- current scan-island north-edge placement contract;
- native-style straight-line and steering-impact recovery probes;
- a finite-rate keyboard driver model that limits hand/rack command speed without reading or stabilizing vehicle motion.

Architecture, invariants and the recommended conversion sequence are defined in [`docs/WEB_CONVERSION_FOUNDATION.md`](docs/WEB_CONVERSION_FOUNDATION.md). See also [`docs/PORTING_NOTES.md`](docs/PORTING_NOTES.md) for deliberate remaining differences.

## Local workspace detection

The synchronizer supports both:

1. a web repository nested inside the native JV repository;
2. the current Jozz workspace layout, where both projects are siblings under one workspace directory:

```text
Box3d_FunProject/
├─ box3d/                                  # authoritative native JV/Box3D
└─ JV-Box3D-Web-experiment/
   └─ JV-Box3D-Web-experiment/             # this web repository
```

At every ancestor level the script checks both that directory and its `box3d` child. A valid native root must contain:

```text
samples/jozz_vehicle_m6_geometry.cpp
samples/jozz_vehicle_m6_suspension_rig.cpp
```

An explicit override remains available:

```powershell
$env:JV_NATIVE_ROOT="C:\path\to\native\box3d"
```

Absolute local paths are never stored in the repository or production build.

## Run

```bash
npm install
npm run dev
```

`npm run dev` first:

1. finds the local native JV checkout when present;
2. synchronizes the current body, wheel, front-rig, rear-mount and damper glTF assets;
3. validates required authored socket/marker contracts;
4. generates `public/assets/jv-asset-manifest.json` with source, SHA-256 and structural metadata;
5. copies `build/jozz_vehicle_m6_session.json` into the ignored web runtime area when it exists;
6. falls back to committed JV `main` assets and the factory/`uliczny` config when no local source exists;
7. instantiates the real Box3D WASM module;
8. checks every `b3.*` call used by the source against actual `box3d.js` exports;
9. executes a small physics smoke simulation;
10. runs isolated M6 behavior probes in invisible Box3D worlds;
11. validates the loaded visual wheel contract before starting the visible simulation;
12. starts Vite only after the preflight checks pass.

When local JV is detected, asset contents are compared every start. Changed native assets replace the web cache automatically; unchanged files are left untouched.

Force a remote/cache refresh in PowerShell:

```powershell
$env:JV_REFRESH_ASSETS="1"
npm run sync-assets
```

## Validation commands

Check the real WASM surface and physics runtime:

```bash
npm run verify-runtime
```

Production build:

```bash
npm run build
npm run preview
```

After a production build, run the full startup test in an installed Chrome browser:

```bash
npm run smoke-browser
```

The browser smoke test fails on a visible error panel, uncaught exception, missing Box3D status, invalid canvas, inactive telemetry, failed parity probes or an invalid wheel visual contract. The wheel gate requires:

- four visual clones;
- independent skeletons for all four skinned meshes;
- authored marker dimensions matching the physical radius and width;
- each visual root occupying the corresponding Box3D wheel-body position.

GitHub Actions requires all gates to pass.

## Controls

- `W` / `S` — drive forward / reverse
- `A` / `D` — keyboard steering target; a finite-rate driver model moves toward it
- `Space` — brake
- `R` — restart the experiment
- left or right mouse drag — orbit the camera around the vehicle
- mouse wheel — zoom
- `C` — reset the orbit camera

The keyboard driver model only limits command rate. It does not read yaw, slip, rack force or wheel state, and it does not counter-steer or self-align the vehicle. Physical hands-off steering remains the caster/tie-rod/rack mechanism.

## Runtime status

The HUD identifies the active configuration source:

```text
factory/uliczny
```

or:

```text
lokalny jozz_vehicle_m6_session.json
```

It also exposes raw versus modeled steering input, rack translation, rack friction, tie-rod load, static toe, parity-probe status, keyboard-tap status, wheel clone/skeleton count and wheel-root binding error.

A healthy wheel contract reports approximately:

```text
koła GLTF: 4 · szkielety 4
binding kół: OK · 0.0e+0 m
```

## Scan assets

The app runs without scan files. To enable the scan island, add:

```text
public/assets/scan/terrain-visual.glb
public/assets/scan/terrain-collision.glb
```

The visual mesh may remain detailed and textured. The collision mesh must be cleaned and strongly reduced. Both must use metres, +Y up and the same origin.

## Source lineage

The authoritative native reference is the current `main` branch of `Jozzpoly/Box3d_FunProject`, especially:

- `jozz_vehicle_m6_geometry.cpp`;
- `jozz_vehicle_m6_suspension_rig.cpp`;
- `jozz_vehicle_m6_config_io.cpp`;
- `jozz_vehicle_m6_rig_lab.cpp`;
- `jozz_vehicle_m6_rig_lab_mount_visual.cpp`;
- `jozz_vehicle_m6_rig_lab_steering_visual.cpp`;
- `jozz_vehicle_central_test_campus.cpp`;
- `jozz_vehicle_central_test_campus_builder.cpp`;
- `jozz_vehicle_obstacle_kit.cpp`;
- `jozz_vehicle_body_registry.cpp`.

Box3D, `box3d.js` and this experiment use MIT-compatible source code.
