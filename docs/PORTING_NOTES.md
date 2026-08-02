# JV → browser porting notes

## Authoritative source

The physics source of truth is `Jozzpoly/Box3d_FunProject`, branch `jozz-scan-terrain-f0`, current M6/M7 suspension runtime:

- `samples/jozz_vehicle_m6_suspension_rig.{h,cpp}`
- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`

M5 is historical context only. It must not be used as the web vehicle snapshot.

## Mechanisms already represented in this repository

- four double-wishbone corners;
- shapeless knuckle/control-arm helper bodies with explicit mass;
- hinged control arms with anti-fold angle limits;
- spherical ball joints with cone/twist fences;
- coilover distance joints with preload and travel limits;
- physical rack body on a prismatic joint;
- rigid front tie rods and rear toe links;
- wheel spin on revolute joints;
- torque-based drive with rev-limit taper;
- anti-roll force couples;
- quadratic aero drag;
- split rolling-sphere / true-width sidewall collision envelope;
- continuous collision disabled for the vehicle world, matching the current JV lab decision.

## Deliberate first-pass differences

- Config values live in an isolated TypeScript snapshot. Replace it with a generated export from the current JV factory/session/preset after the runtime topology is validated.
- Hands-off rack friction currently uses the base friction only. The JV load-dependent transverse tie-rod term is the next parity item.
- Static toe and visual rig contracts are not yet imported.
- The procedural board is only a recognizable test surface; the actual JV board assets remain to be copied.
- The npm `box3d.js` mesh wrapper welds vertices but does not expose `identifyEdges`. Scan-wheel ghost-contact testing must decide whether to fork the binding.

## Scan contract

Render and collision geometry are separate. The collision GLB must be substantially reduced, cleaned and free of photogrammetry micro-noise. Both files use metres, +Y up and an identical origin.
