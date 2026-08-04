# Native JV Core → WebAssembly notes

## Why a native port is required

The current browser fixture consumes values from a native-generated receipt but does not execute the same vehicle algorithms. The confirmed drive-unit mismatch proves that configuration parity alone is insufficient.

```text
native JV: maxDriveSpeed = wheel motor limit in rad/s
legacy TS: historically interpreted as chassis-linear target
```

The browser can move correctly and pass deterministic tests while still behaving differently from native JV.

## First objective

Do not begin with a large native refactor. First compile an unchanged, behavior-preserving slice and establish one native-versus-WASM scenario.

Initial source direction:

```text
Box3D source
jozz_vehicle_m5_vehicle.{h,cpp}        temporary helper dependency
jozz_vehicle_m6_geometry.{h,cpp}
jozz_vehicle_m6_suspension_rig.{h,cpp}
new thin runtime/C-ABI adapter
```

The M5 dependency is architectural debt, but removing it before the first parity trace would mix refactoring with port validation.

## Minimum runtime seam

The native module should own:

- Box3D world and allocations;
- vehicle blueprint/config compilation;
- bodies and joints;
- steering, drive, brake and coast mechanisms;
- wheel/contact backend selection;
- fixed-step update order;
- physical telemetry and stable part-role mapping.

The browser should provide semantic controls and consume copied snapshots.

Every ABI field needs an explicit type, unit, coordinate frame and lifetime. Stable `partId` values must not be replaced by transient Box3D handles.

## Initial scenario order

```text
1 create/destroy/reset
2 settle on flat ground
3 POSITION left/right and RELEASE
4 coast
5 forward and reverse throttle
6 brake
7 RATE engage and reversal
8 wheel impact
9 throttle + lock + brake stress
```

Run the same scenarios in a native executable and the WASM build. Compare quantized trajectories and mechanism telemetry, not only final direction or whether the vehicle moved.

## Refactor only after parity

After the first comparable trace:

- extract shared native data structures;
- remove the temporary M5 helper dependency;
- replace printf diagnostics with structured errors;
- define versioned snapshot layouts;
- move RATE into the shared native controller;
- introduce the future wheel/contact seam;
- investigate bundle size and build reproducibility.

## Explicit non-goals for the TypeScript fixture

Do not implement final:

- drivetrain and differential behavior;
- anti-roll bars;
- aero;
- tire/contact physics;
- suspension mechanisms;
- hidden corrections intended to imitate native behavior.

The fixture remains useful for browser input, lifecycle, rendering and A/B comparison until the native backend replaces it.
