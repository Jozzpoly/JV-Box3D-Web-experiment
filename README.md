# JV Box3D Web Experiment

A focused proof of concept for running a real slice of **Jozz Vehicle** directly in a browser with Box3D compiled to WebAssembly.

## Current target

- the current M6/M7 multi-body vehicle foundation, not historical M5;
- current factory tuning from native JV;
- the Central Test Campus contract;
- the real `rama_rurowa` body asset;
- a separate photogrammetry visual mesh and reduced collision mesh.

This remains a proof of concept. Browser infrastructure and startup are tested; native/web driving behavior still needs direct comparison.

## Implemented parity pass

- four double-wishbone corners;
- physical control-arm bodies, knuckles, ball joints and coilovers;
- physical steering rack and rigid tie rods;
- exact current rack-stroke geometry;
- load-dependent rack friction from transverse tie-rod forces;
- current torque-based drive, brake, coast, ARB and aero defaults;
- split rolling-sphere / true-width sidewall wheel envelope;
- live hardpoint-driven suspension visualization;
- current 400×400 m plate and Central Test Campus bumper/rock contracts;
- current scan-island north-edge placement contract.

See [`docs/PORTING_NOTES.md`](docs/PORTING_NOTES.md) for deliberate remaining differences.

## Run

```bash
npm install
npm run dev
```

`npm run dev` first:

1. synchronizes the self-contained `Nadwozie.gltf` from the authoritative JV repository;
2. instantiates the real Box3D WASM module;
3. checks every `b3.*` call used by the source against actual `box3d.js` exports;
4. executes a small physics smoke simulation;
5. starts Vite only after those checks pass.

Refresh synchronized JV assets explicitly in PowerShell:

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

The browser smoke test fails on a visible error panel, uncaught exception, missing Box3D status, invalid canvas or inactive simulation telemetry. GitHub Actions requires all of these gates to pass.

## Controls

- `W` / `S` — drive forward / reverse
- `A` / `D` — steer
- `Space` — brake
- `R` — restart the experiment

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
- `jozz_vehicle_central_test_campus.cpp`;
- `jozz_vehicle_central_test_campus_builder.cpp`;
- `jozz_vehicle_obstacle_kit.cpp`;
- `jozz_vehicle_body_registry.cpp`.

Box3D, `box3d.js` and this experiment use MIT-compatible source code.
