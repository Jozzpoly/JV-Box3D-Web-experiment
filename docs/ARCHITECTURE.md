# JV Web architecture

## Goal

JV Web is a browser host for vehicle research, visualization and eventually the same native JV physics used outside the browser.

The architecture deliberately separates device/UI concerns from product physics.

## Current layers

```text
keyboard / future touch / gamepad
              ↓
timestamped semantic input timelines
              ↓
fixed-step browser host
              ↓
legacy_ts_m6 reference vehicle
              ↓
immutable trace values
              ↓
WebGL observer and UI
```

### Input

Device adapters produce semantic commands rather than manipulating a vehicle directly.

```text
SteeringCommand = RELEASE | POSITION | RATE
LongitudinalCommand = throttle + brake
```

Events are integrated over fixed-step intervals, preserving sub-frame taps and deterministic ordering across different render cadences.

### Fixed-step ownership

The browser host owns:

- frame scheduling;
- fixed-step accumulation;
- dropped-time policy;
- lifecycle release;
- startup rollback and disposal;
- ordering of input, actuators, physics and observation.

Renderer cadence never becomes physics cadence.

### Physics boundary

Direct Box3D calls are isolated behind a typed boundary. Vehicle bodies, joints and runtime handles remain inside the physics layer.

Renderer-facing data is copied into immutable plain values. Rendering code receives no mutable Box3D object or body handle.

### Reference vehicle

`legacy_ts_m6` contains the current browser M6 topology and is intentionally frozen as a reference fixture. It is valid for:

- input and lifecycle testing;
- browser rendering;
- mechanism observation;
- known-failure reproduction;
- comparison against the future native backend.

It is not authoritative product physics.

## Steering behavior

`RELEASE` means hands off in the first fixed step after input ends. The host must not create return-to-centre, centre hold or hidden stabilization.

Physical rack movement after release may come from contact, geometry, linkage forces, friction and inertia.

The detailed command contract is in `contracts/STEERING_COMMAND_CONTRACT_PL.md`.

## Target product architecture

```text
Box3D source
+ portable native JV Core
+ thin stable C ABI
          ↓
one WebAssembly module and memory space
          ↓
immutable, unit-explicit runtime snapshots
          ↓
TypeScript browser host, renderer and UI
```

One module avoids trying to share Box3D world memory and runtime handles across two unrelated WASM modules.

Stable authoring identity such as `partId` must remain separate from transient `b3BodyId` and `b3JointId` handles.

## Native parity

The native executable and WASM build must run the same scenario corpus. Initial comparisons should cover settle, coast, throttle, reverse, brake, steering, release, wheel impact and combined stress.

A passing browser fixture test proves only that the fixture agrees with its own contract. Native parity requires comparable trajectories and mechanism telemetry from the same native core.

## Portable build

The generated static package is a normal multi-file site:

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Paths are relative so the same package can run from localhost, a LAN address or a repository subpath. The build does not publish itself.

## Future extensions

- native JV Core + Box3D WASM backend;
- explicit mobile input adapters using the same semantic timelines;
- scene packages separating render mesh from collision mesh;
- a replaceable native wheel/contact backend;
- final art and instrumentation.

These should be implemented when active work reaches them, not pre-expanded into speculative frameworks.
