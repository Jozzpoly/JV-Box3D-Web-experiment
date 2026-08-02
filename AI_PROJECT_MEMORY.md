# AI project memory — JV Box3D Web Experiment

Updated: 2026-08-03

## Goal

Proof of concept: run a real, current JV vehicle rig in a browser on the JV board and a 3D-scan terrain. The project has passed the first viability gate: the user ran the browser build successfully and drove the bootstrap vehicle.

## Critical owner correction

Do **not** copy M5 as the vehicle. M5 is an old, simple rig. The authoritative vehicle starts at M6 and includes later M7+ updates. The web runtime must preserve the multi-body/hardpoint architecture, physical rack/tie rods, real-force drive and subsequent wheel-envelope work.

## Current source of truth

Use the current `main` branch of `Jozzpoly/Box3d_FunProject`, not the historical `jozz-scan-terrain-f0` pointer recorded during repository initialization.

Important native sources:

- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_suspension_rig.cpp`
- `samples/jozz_vehicle_central_test_campus.cpp`
- `samples/jozz_vehicle_central_test_campus_builder.cpp`
- `samples/jozz_vehicle_obstacle_kit.cpp`
- `samples/jozz_vehicle_body_registry.cpp`

## Serious parity pass completed on agent/bootstrap-web-poc

- Replaced guessed bootstrap tuning with the exact current M6 factory defaults.
- Fixed the web rack-stroke error that doubled the Ackermann track term.
- Added the native load-dependent hands-off rack friction model, including the 1.4 stiction ratio and transverse front tie-rod load.
- Restored current drive/brake/coast, servo, ARB, aero, filter-group and visual identity defaults.
- Added telemetry for rack friction and transverse tie-rod load.
- Added live hardpoint-driven rendering for wishbone links, kingpins, coilovers and steering/toe links.
- Added automatic synchronization and rendering of the real `assets/source/Nadwozie.gltf` tube frame with the native 0.35 scale, -90 degree yaw and `(0,-0.60,0)` base pose.
- Replaced the temporary 132 m board with the current 400x400 m plate.
- Ported the exact Central Test Campus bumper-bank specifications and deterministic E1/E2/E3 rock-island generation.
- Updated the scan-island placement to the native north-island contract (`south edge z=320`, lowest point y=0).

The real body asset is intentionally synchronized at dev/build time and ignored by Git; it remains sourced from JV rather than becoming a drifting copy.

## Validation

- The user confirmed the original browser bootstrap runs.
- The parity controller and real-body/live-rig renderer passed strict TypeScript and production Vite build in GitHub Actions.
- The Central Test Campus commit must also remain green before calling this pass complete.

Compilation is not physics parity. The next explicit gate is a user runtime test and native/web driving comparison.

## Next validation order

1. User runs `git pull` then `npm run dev` and reports startup/runtime behavior.
2. Compare static pose, rack travel, body/joint/contact counts and basic straight-line response against native M6 Rig Lab.
3. Correct any browser-only runtime/API differences revealed by the first serious test.
4. Synchronize the actual wheel and front steering-rig visual contracts.
5. Add the user's cleaned scan visual/collision pair and inspect wheel contacts.
6. Decide whether to fork `box3d.js` for mesh `identifyEdges=true`.
7. Replace the remaining TypeScript mirror with generated native config/contract exports once the topology is validated.

## Known binding risk

`box3d.js@0.0.2` exposes mesh creation, but its simple wrapper does not enable Box3D mesh edge identification. Vehicle testing on the scan may require a small binding fork with `identifyEdges=true`.
