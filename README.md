# JV Box3D Web Experiment

A focused proof of concept for running a real slice of **Jozz Vehicle** directly in a browser with Box3D compiled to WebAssembly.

## Current target

- the current M6/M7 multi-body vehicle foundation, not historical M5;
- the current local JV tuning session when a native checkout is available;
- the Central Test Campus contract;
- real JV body and wheel assets attached through explicit runtime contracts;
- a contract-driven conversion path for the real front steering/suspension rig;
- a separate photogrammetry visual mesh and reduced collision mesh;
- deterministic browser probes that distinguish raw physics parity from web-host input behavior.

This remains a proof of concept. Browser infrastructure, startup, isolated M6 steering parity, keyboard behavior, wheel visuals and the front-rig asset preflight are tested. Direct owner driving and visual comparison remain the product gate.

## Implemented vertical slice

- four double-wishbone corners;
- physical control-arm bodies, knuckles, ball joints and coilovers;
- physical steering rack and rigid tie rods;
- current rack-stroke geometry and static-toe turnbuckle lengths;
- load-dependent rack friction from transverse tie-rod forces;
- current torque-based drive, brake, coast, ARB and aero behavior;
- split rolling-sphere / true-width sidewall wheel envelope;
- real `rama_rurowa` body with native registry/session offset;
- four independent `Offroad_Big_Wheels.gltf` skinned instances;
- wheel radius, width, axle and physical centre derived from authored markers;
- `Socket_WheelMount` preserved separately as the inboard hub-face offset;
- wheel-root, tyre-centre and mount-axis validation against Box3D bodies;
- orbit/zoom camera;
- current 400×400 m plate and Central Test Campus bumper/rock contracts;
- current scan-island placement contract;
- native-style straight-line and steering-impact recovery probes;
- finite-rate keyboard steering with explicit driver engagement and centre capture;
- stationary and creeping low-speed steering-cycle probes;
- synchronized GLTF + JSON preflight for the real front steering/suspension rig.

Architecture, invariants and the recommended conversion sequence are defined in [`docs/WEB_CONVERSION_FOUNDATION.md`](docs/WEB_CONVERSION_FOUNDATION.md). See also [`docs/PORTING_NOTES.md`](docs/PORTING_NOTES.md).

## Local workspace detection

The synchronizer supports both a nested native checkout and the current Jozz workspace layout:

```text
Box3d_FunProject/
├─ box3d/                                  # authoritative native JV/Box3D
└─ JV-Box3D-Web-experiment/
   └─ JV-Box3D-Web-experiment/             # this browser repository
```

At every ancestor level the script checks both that directory and its `box3d` child. An explicit override is also available:

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
2. synchronizes body, wheel, front-rig, rear-mount and damper glTF assets;
3. synchronizes the native front-rig JSON contract;
4. validates required authored sockets, markers, axes and visual-part nodes;
5. generates `public/assets/jv-asset-manifest.json` with source identity, SHA-256 and structural metadata;
6. imports `build/jozz_vehicle_m6_session.json` when available;
7. otherwise falls back explicitly to JV `main` assets plus factory/`uliczny`;
8. instantiates the real Box3D WASM module and checks every used `b3.*` call;
9. executes a Node/WASM physics smoke simulation;
10. runs isolated parity and web-input probes;
11. validates wheel and front-rig contracts in the production browser runtime;
12. starts the visible simulation only after preflight succeeds.

Changed local native assets replace the browser cache automatically.

Force a refresh:

```powershell
$env:JV_REFRESH_ASSETS="1"
npm run sync-assets
```

## Validation commands

```bash
npm run verify-runtime
npm run build
npm run smoke-browser
```

The Chrome gate checks:

- visible startup errors and uncaught exceptions;
- Box3D status, canvas and live telemetry;
- raw M6 straight-line and steering-impact parity;
- finite-rate keyboard tap behavior;
- stationary and creeping steering centre capture;
- four independent wheel skeletons;
- physical wheel dimensions and centre;
- wheel-root attachment to the matching Box3D bodies;
- the 13-node front-rig GLTF/JSON contract and recognized ownership lineage.

GitHub Actions requires these gates to pass.

## Steering model

`A` / `D` remains a binary input, but the browser host models finite steering-wheel movement. It does not read yaw, slip, rack force, wheel force or vehicle speed.

A near-zero steering scalar no longer automatically means “hands off.” After key release the driver remains explicitly engaged while returning to zero and for a fixed `0.35 s` centre hold. This prevents rack stiction from catching the mechanism before the commanded return is complete.

The raw physical mechanism remains independently tested without this host filter.

## Controls

- `W` / `S` — drive forward / reverse
- `A` / `D` — steering target
- `Space` — brake
- `R` — restart
- left or right mouse drag — orbit camera
- mouse wheel — zoom
- `C` — reset camera

## Healthy runtime status

The HUD identifies either:

```text
factory/uliczny
```

or:

```text
lokalny jozz_vehicle_m6_session.json
```

A healthy committed baseline reports approximately:

```text
sondy 2/2
klawiatura OK
low-speed OK
koła GLTF OK
front-rig 13/13

koła GLTF: 4 · szkielety 4
binding kół: OK · root 0.0e+0 m
środek opony: 0.0e+0 m · socket 0.1313 m
```

The local session may produce different diagnostic values; owner testing remains authoritative for feel and appearance.

## Front-rig ownership lineage

`OneSided_Steering_Suspension_Rig.gltf` and its native JSON contract are synchronized and validated, but the actual skinned parts are not rendered live yet.

There is a known historical semantic drift:

- the older M9 JSON labels `Socket_ChassisMount_b` as riding the knuckle;
- later native work separated it from `WheelCenter` into a non-steering carrier role;
- current M6 has no carrier body and maps that role to `lowerArm`.

The browser bridge therefore uses the topology-neutral role `nonSteeringCarrier`, currently resolved to the M6 lower arm. Attaching the whole rig to one body is forbidden.

## Scan assets

The app runs without scan files. To enable the scan island, add:

```text
public/assets/scan/terrain-visual.glb
public/assets/scan/terrain-collision.glb
```

The visual mesh may remain detailed and textured. The collision mesh must be cleaned and strongly reduced. Both must use metres, +Y up and the same origin.

## Source lineage

The authoritative native reference is current `main` of `Jozzpoly/Box3d_FunProject`, especially:

- `jozz_vehicle_m6_geometry.cpp`;
- `jozz_vehicle_m6_suspension_rig.cpp`;
- `jozz_vehicle_m6_config_io.cpp`;
- `jozz_vehicle_m6_rig_lab.cpp`;
- `jozz_vehicle_m6_rig_lab_mount_visual.cpp`;
- `jozz_vehicle_m6_rig_lab_steering_visual.cpp`;
- `jozz_vehicle_central_test_campus*.cpp`;
- `jozz_vehicle_obstacle_kit.cpp`;
- `jozz_vehicle_body_registry.cpp`.

Box3D, `box3d.js` and this experiment use MIT-compatible source code.
