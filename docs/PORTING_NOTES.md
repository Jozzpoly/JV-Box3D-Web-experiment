# JV → browser porting notes

## Authoritative source

The physics and authored-asset source of truth is current `main` of `Jozzpoly/Box3d_FunProject`, especially:

- `samples/jozz_vehicle_m6_suspension_rig.{h,cpp}`
- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_m6_rig_lab_mount_visual.cpp`
- `samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp`

M5 is historical context only. It must not be used as the web vehicle snapshot.

The broader conversion architecture and invariants are documented in [`WEB_CONVERSION_FOUNDATION.md`](WEB_CONVERSION_FOUNDATION.md).

## Mechanisms represented in this repository

- four double-wishbone corners;
- shapeless knuckle/control-arm helper bodies with explicit mass;
- hinged control arms with anti-fold angle limits;
- spherical ball joints with cone/twist fences;
- coilover distance joints with preload and travel limits;
- physical rack body on a prismatic joint;
- rigid front tie rods and rear toe links;
- native static-toe turnbuckle rest-length construction;
- wheel spin on revolute joints;
- torque-based drive with rev-limit taper;
- anti-roll force couples;
- quadratic aero drag;
- split rolling-sphere / true-width sidewall collision envelope;
- continuous collision disabled for the vehicle world, matching the current JV lab decision;
- finite-rate digital driver input isolated from the raw vehicle mechanism.

## Local-session contract

The native Rig Lab restores `build/jozz_vehicle_m6_session.json`. The web project therefore treats this local session as the preferred runtime configuration when a native checkout is detected. Factory/`uliczny` is the explicit standalone/CI fallback.

Unsupported rig types or wheel-envelope modes are reported rather than silently reinterpreted.

## Native Box3D versus box3d.js boundary

Native inline helpers are not guaranteed to be exported by Emscripten. The first serious browser run exposed exactly this problem: native JV used `b3MulQuat`, while `box3d.js@0.0.2` did not export it.

The project now has an explicit compatibility boundary:

- `src/physics/box3d-runtime.ts` validates critical exports before world creation;
- it provides the exact native Box3D quaternion multiplication formula as the explicit `b3MulQuat` shim;
- `tools/check-box3d-runtime.mjs` instantiates the real WASM module, scans every `b3.*` call in `src`, checks all exports and executes a small physics simulation;
- `tools/smoke-browser.mjs` starts the production build in real headless Chrome and verifies status, error panel, canvas, live telemetry, physics probes and visual contracts;
- both runtime verification and browser smoke testing are mandatory CI gates.

Do not copy a native Box3D function call into the web project without passing these gates.

## Wheel visual contract

The Blockbench wheel is a skinned glTF, not a plain static mesh. It contains authored contract nodes:

- `Socket_WheelMount`
- `Axis_WheelSpin_A`
- `Axis_WheelSpin_B`
- `Marker_TireRadiusOuter`
- `Marker_TireWidthLeft`
- `Marker_TireWidthRight`

The browser adapter:

1. derives the authored axle/radial basis from marker positions;
2. maps the authored axle to Box3D wheel-body local `+Y`;
3. maps the mount socket to local origin;
4. scales radius and width independently to the physical wheel dimensions;
5. clones repeated skinned wheels through `SkeletonUtils.clone`;
6. validates four independent skeletons;
7. validates every visual root against its corresponding Box3D body.

The owner found the failure that motivated this contract: a giant wheel detached from the car and apparently anchored to the world. Its causes were generic bounds-based centring plus repeated `Object3D.clone(true)` on a skinned hierarchy.

Validated committed-asset values:

```text
authored radius = 1.46875
authored width  = 1.25000
radial scale    = 0.35000
axial scale     = 0.35000
clone count     = 4
unique skeletons= 4
root/body error = 0.00 m
```

## Asset bridge

`tools/sync-jv-assets.mjs` uses the local native working tree when present and otherwise falls back to JV `main`. It generates `public/assets/jv-asset-manifest.json` containing source identity, SHA-256, byte size, mesh/skin/node counts and authored contract-node names.

A syntactically valid glTF is not sufficient. Asset-specific required marker/socket contracts are validated during synchronization.

## Deliberate remaining differences

- The front suspension visual asset is synchronized but not yet split across its native chassis/lower-arm/knuckle bone ownership.
- Rear mount and telescoping damper visual binding remain pending.
- Body visual calibration is registry/session driven but is not yet a general marker-based body contract.
- TypeScript config mirrors are still hand-maintained instead of generated from the native field table.
- Several Box3D IDs and calls still cross `any` boundaries.
- The procedural board reproduces test contracts, but complete native visual yard assets are not yet converted.

## Scan contract

Render and collision geometry are separate. The collision GLB must be substantially reduced, cleaned and free of photogrammetry micro-noise. Both files use metres, +Y up and an identical origin. The scan island follows the current native placement contract: its south edge is at world `z=320` and its lowest point is at `y=0`.

The npm `box3d.js` mesh wrapper welds vertices but does not expose Box3D internal-edge identification. Scan-wheel testing must decide whether to add a small explicit binding extension for `identifyEdges=true`.
