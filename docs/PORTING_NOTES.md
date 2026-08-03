# JV → browser porting notes

## Authoritative source

The physics and authored-asset source of truth is current `main` of `Jozzpoly/Box3d_FunProject`, especially:

- `samples/jozz_vehicle_m6_suspension_rig.{h,cpp}`
- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_rig_lab.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_m6_rig_lab_mount_visual.cpp`
- `samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp`

M5 is historical context only. The broader architecture is documented in [`WEB_CONVERSION_FOUNDATION.md`](WEB_CONVERSION_FOUNDATION.md).

## Mechanisms represented

- four double-wishbone corners;
- explicit control-arm, knuckle and wheel bodies;
- ball-joint and suspension travel fences;
- physical rack and rigid front tie rods;
- native static-toe turnbuckle rest lengths;
- torque-based drive, brake and coast behavior;
- load-dependent rack friction;
- anti-roll force couples and quadratic aero drag;
- split rolling-sphere / true-width sidewall wheel envelope;
- fixed `1/60 s` simulation step with explicit substeps;
- web keyboard-driver behavior isolated from the raw physical mechanism.

## Local-session contract

Native Rig Lab restores `build/jozz_vehicle_m6_session.json`. The browser project therefore prefers that local session when the native checkout is detected. Factory/`uliczny` is the explicit standalone and CI fallback.

Unsupported rig types or wheel-envelope modes are reported instead of silently reinterpreted.

## Native Box3D versus box3d.js

Native inline helpers are not guaranteed to be Emscripten exports. The owner-found `b3MulQuat is not a function` startup failure established this boundary.

The repository now requires:

- `src/physics/box3d-runtime.ts` export validation;
- one explicit native-formula `b3MulQuat` shim;
- a scan of every source `b3.*` call against instantiated WASM;
- a Node/WASM simulation smoke test;
- a production Chrome runtime test.

Do not copy a native Box3D call into the browser project without passing these gates.

## Wheel visual contract

`Offroad_Big_Wheels.gltf` is a skinned asset. Its important authored nodes include:

- `Socket_WheelMount` — inboard hub mounting face;
- `Marker_TireRadiusOuter`;
- `Marker_TireWidthLeft`;
- `Marker_TireWidthRight`;
- `Axis_WheelSpin_A/B`.

Two separate owner-found failures shaped the current adapter:

1. repeated `Object3D.clone(true)` shared skinned hierarchy state, producing missing/detached/giant wheel visuals;
2. aligning the mount socket to the wheel-body origin shifted the tyre by `0.13125 m`, producing opposite-looking left/right offsets.

The correct adapter:

1. derives the authored axle from the width markers;
2. derives the physical tyre centre from their midpoint;
3. derives radius perpendicular to that axle;
4. maps the physical centre—not the mount socket—to the Box3D wheel-body origin;
5. preserves `Socket_WheelMount` as a separate hub-face offset;
6. scales radial and axial dimensions independently;
7. uses `SkeletonUtils.clone` for independent wheel skeletons;
8. validates root position, physical centre, mount axis and dimensions.

Validated committed values:

```text
authored radius = 1.46875
authored width  = 1.25000
radial scale    = 0.35000
axial scale     = 0.35000
mount offset    = 0.13125 m
clone count     = 4
unique skeletons= 4
root/body error = 0.00 m
centre error    = 0.00 m
```

## Keyboard steering versus rack physics

The keyboard host and physical steering mechanism are separate layers.

The first finite-rate model improved ordinary driving, but a second low-speed probe found that rack stiction could catch the mechanism before centre:

```text
servo reached both locks and crossed centre
servo stall = only 1 frame
final rack after release ≈ full lock
```

The cause was mode switching, not inadequate servo force: once filtered steer entered the deadzone, the controller inferred “hands off,” disabled assisted return and enabled static rack friction.

`DriveInput` now carries explicit `steeringEngaged` state. The keyboard driver remains engaged while returning to zero and for a fixed `0.35 s` centre hold. It reads no vehicle state.

Current factory Chrome results:

```text
stationary: capture=0.008, final=0.014, stall=1 frame
creep:      capture=0.006, final=0.326, stall=1 frame
```

`capture` is rack fraction at the exact servo-release frame. Later hands-off displacement during creep is measured separately and remains physical behavior rather than an input jam.

## Front steering/suspension asset contract

The synchronizer now imports both:

- `OneSided_Steering_Suspension_Rig.gltf`;
- `assets/contracts/one_sided_steering_suspension.asset.json`.

Thirteen required sockets, axes and visual-part nodes are validated before startup. Chrome also checks asset id, contract version, node uniqueness and skin presence.

There is a known ownership drift:

- the original isolated M9 JSON says `Socket_ChassisMount_b` rides the knuckle;
- later M9 work separated it from `WheelCenter` into a non-steering carrier;
- current M6 lacks a carrier and maps that role to `lowerArm`.

The browser uses `nonSteeringCarrier` as a topology-neutral role and resolves it to the current M6 lower arm. Current native M6 runtime integration is authoritative for ownership; the JSON remains authoritative for authored identities and socket data.

The actual skinned front-rig rendering is still pending. The whole model must never be attached to one body.

## Asset bridge

`tools/sync-jv-assets.mjs` prefers the local native working tree and otherwise uses JV `main`. It validates asset-specific contracts and generates `public/assets/jv-asset-manifest.json` with source identity, SHA-256, byte size and structural metadata.

## Deliberate remaining differences

- front-rig live skinned-part ownership and stretching are pending;
- rear mount and telescoping damper binding are pending;
- body calibration is not yet a general marker-based contract;
- TypeScript config fields are hand-maintained rather than generated from the native field table;
- several Box3D IDs and module calls still cross `any` boundaries;
- complete native board/yard visuals are not yet converted.

## Scan contract

Render and collision geometry are separate. The collision GLB must be reduced, cleaned and free of photogrammetry micro-noise. Both files use metres, +Y up and an identical origin. The scan island follows the native placement contract: south edge at world `z=320`, lowest point at `y=0`.

The npm mesh wrapper does not expose Box3D internal-edge identification. Scan-wheel testing must decide whether to add an explicit `identifyEdges=true` binding extension.
