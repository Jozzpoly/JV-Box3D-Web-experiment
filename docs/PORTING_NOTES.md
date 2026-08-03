# JV → browser porting notes

## Authoritative source

The native source of truth is the current `main` branch of `Jozzpoly/Box3d_FunProject`, especially:

- `samples/jozz_vehicle_m6_suspension_rig.{h,cpp}`
- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_central_test_campus.cpp`
- `samples/jozz_vehicle_central_test_campus_builder.cpp`
- `samples/jozz_vehicle_obstacle_kit.cpp`

M5 is historical context only. It must not be used as the web vehicle snapshot.

## Mechanisms represented

- four double-wishbone corners;
- shapeless knuckle/control-arm helper bodies with explicit mass;
- hinged control arms with anti-fold angle limits;
- spherical ball joints with cone/twist fences;
- coilover distance joints with preload and travel limits;
- physical rack body on a prismatic joint;
- rigid front tie rods and rear toe links;
- torque-based wheel drive with rev-limit taper;
- load-dependent hands-off rack friction;
- anti-roll force couples;
- quadratic aero drag;
- split rolling-sphere / true-width sidewall collision envelope;
- continuous collision disabled for the vehicle world, matching the current JV lab decision;
- current Central Test Campus bumper-bank and deterministic rock-island contracts.

## Native Box3D versus box3d.js boundary

Native inline helpers are not guaranteed to be exported by Emscripten. The first serious browser run exposed exactly this problem: native JV used `b3MulQuat`, while `box3d.js@0.0.2` did not export it.

The project now has an explicit compatibility boundary:

- `src/physics/box3d-runtime.ts` validates critical exports before world creation;
- it provides the exact native Box3D quaternion multiplication formula as the explicit `b3MulQuat` shim;
- `tools/check-box3d-runtime.mjs` instantiates the real WASM module, scans every `b3.*` call in `src`, checks all exports and executes a small physics simulation;
- `tools/smoke-browser.mjs` starts the production build in real headless Chrome and verifies status, error panel, canvas and live telemetry;
- both runtime verification and browser smoke testing are mandatory CI gates.

Do not copy a native Box3D function call into the web project without passing these gates.

## Deliberate remaining differences

- Config values still live in a TypeScript mirror. Replace it with a generated export from the current JV factory/session/preset after runtime topology validation.
- Static toe and complete visual rig contracts are not fully synchronized yet.
- The real body asset is synchronized automatically; wheel and steering-rig visual contracts remain pending.
- The npm `box3d.js` mesh wrapper welds vertices but does not expose `identifyEdges`. Scan-wheel ghost-contact testing must decide whether to fork the binding.

## Scan contract

Render and collision geometry are separate. The collision GLB must be substantially reduced, cleaned and free of photogrammetry micro-noise. Both files use metres, +Y up and an identical origin. The scan island follows the current native placement contract: its south edge is at world `z=320` and its lowest point is at `y=0`.
