# AI project memory — JV Box3D Web Experiment

Updated: 2026-08-03

## Goal

Proof of concept: run a real, current JV vehicle rig in a browser on the JV board and a 3D-scan terrain. The project passed the initial viability gate: the user ran and drove the first browser bootstrap.

## Critical owner correction

Do **not** copy M5 as the vehicle. M5 is an old, simple rig. The authoritative vehicle starts at M6 and includes later M7+ updates. The web runtime must preserve the multi-body/hardpoint architecture, physical rack/tie rods, real-force drive and subsequent wheel-envelope work.

## Current source of truth

Use the current `main` branch of `Jozzpoly/Box3d_FunProject`.

Important native sources:

- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_suspension_rig.cpp`
- `samples/jozz_vehicle_central_test_campus.cpp`
- `samples/jozz_vehicle_central_test_campus_builder.cpp`
- `samples/jozz_vehicle_obstacle_kit.cpp`
- `samples/jozz_vehicle_body_registry.cpp`

## Serious parity pass on agent/bootstrap-web-poc

- Replaced guessed bootstrap tuning with current M6 factory defaults.
- Fixed the web rack-stroke error that doubled the Ackermann track term.
- Added native load-dependent hands-off rack friction, including the 1.4 stiction ratio and transverse front tie-rod load.
- Restored current drive/brake/coast, servo, ARB, aero, filter-group and visual identity defaults.
- Added telemetry for rack friction and transverse tie-rod load.
- Added live hardpoint-driven rendering for wishbone links, kingpins, coilovers and steering/toe links.
- Added automatic synchronization and rendering of `assets/source/Nadwozie.gltf` with native scale/pose.
- Restored the current 400×400 m plate.
- Ported Central Test Campus bumper-bank specifications and deterministic E1/E2/E3 rock-island generation.
- Updated scan-island placement to the native north-island contract (`south edge z=320`, lowest point y=0).

## Runtime failure found by the owner

The first serious browser build failed at startup with:

```text
b3.b3MulQuat is not a function
```

Root cause: `b3MulQuat` is a native inline Box3D helper but is not exported by `box3d.js@0.0.2`. TypeScript did not catch it because several module boundaries still used `any`.

This was not a local setup problem.

## Runtime hardening completed

- Added `src/physics/box3d-runtime.ts` as the explicit native/WASM compatibility boundary.
- Added the exact Box3D `b3MulQuat` formula as one named compatibility shim.
- Critical exports are validated before any world is allocated.
- Added `tools/check-box3d-runtime.mjs`:
  - instantiates the real `box3d.js/inline` WASM module;
  - scans all source files for `b3.*` calls;
  - currently validates 58 distinct calls;
  - rejects any missing export not listed as an explicit shim;
  - executes a real world/body/hull/sphere/step smoke simulation.
- Added `tools/smoke-browser.mjs`:
  - starts the production Vite build;
  - launches real headless Chrome through CDP;
  - checks the visible error panel, Box3D status, canvas dimensions, uncaught exceptions and active telemetry.
- Both tests are mandatory GitHub Actions gates.

## Validation completed

At commit `512f644`:

- asset synchronization succeeds;
- strict TypeScript succeeds;
- 58 Box3D source calls pass runtime export verification;
- the Node/WASM physics smoke test succeeds;
- production Vite build succeeds;
- real headless Chrome starts the application successfully;
- browser state reported `Box3D 0.1.0 · JV M6 parity pass`, a valid canvas and active body/joint/contact telemetry;
- the complete GitHub Actions workflow is green.

Compilation is still not native/web physics parity. The next explicit gate is the owner's runtime driving test and comparison against native M6 Rig Lab.

## Next validation order

1. Owner pulls commit `512f644` or newer and runs `npm install`, then `npm run dev`.
2. Verify the original `b3MulQuat` startup failure is gone on Windows/Chrome.
3. Compare static pose, rack travel, body/joint/contact counts and straight-line response against native M6 Rig Lab.
4. Correct any behavioral differences revealed by the comparison.
5. Synchronize actual wheel and front steering-rig visual contracts.
6. Add the cleaned scan visual/collision pair and inspect wheel contacts.
7. Decide whether to fork `box3d.js` for mesh `identifyEdges=true`.
8. Replace remaining TypeScript mirrors and `any` module boundaries with generated/typed native contracts.

## Known binding risk

`box3d.js@0.0.2` exposes mesh creation, but its simple wrapper does not enable Box3D mesh edge identification. Vehicle testing on the scan may require a small binding fork with `identifyEdges=true`.
