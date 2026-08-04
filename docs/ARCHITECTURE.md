# JV Web architecture

## Goal

JV Web is a browser host for deterministic vehicle research, mobile interaction, scene integration and eventually the same native JV physics used outside the browser.

The architecture separates device/UI concerns, scene resources and product physics.

## Current execution path

```text
keyboard + Pointer Events
          ↓
source-aware timestamped semantic timelines
          ↓
fixed-step browser host
          ↓
VehicleRuntimeBackend descriptor/seam
          ↓
legacy_ts_m6 reference vehicle
          ↓
immutable trace values
          ↓
WebGL observer and telemetry UI
```

Before physics starts:

```text
browser capability report
scene package fetch + strict validation
backend scene-support gate
native receipt integrity validation
Box3D boundary load
```

## Input

Device adapters produce semantic commands rather than manipulating a vehicle directly.

```text
SteeringCommand = RELEASE | POSITION | RATE
LongitudinalCommand = throttle + brake
```

Events are integrated over fixed-step intervals, preserving sub-frame taps and deterministic ordering across render cadences.

State is source-aware. Keyboard, touch and future gamepad sources cannot release one another accidentally.

Pointer controls use one pointer ID per semantic owner and release on pointer up, cancel, lost capture, blur, hidden page, pagehide and disposal.

## Fixed-step ownership

The browser host owns:

- frame scheduling;
- fixed-step accumulation;
- dropped-time policy;
- lifecycle release;
- startup rollback and disposal;
- ordering of input, actuators, physics and observation.

Renderer cadence never becomes physics cadence.

## Browser environment boundary

The runtime reports transport and capability information without allocating diagnostic GPU resources:

- secure context, loopback HTTP, LAN HTTP or other transport;
- Web Crypto digest availability;
- software SHA fallback availability;
- WebGL API and Pointer Events presence;
- touch/coarse-pointer and viewport information.

Receipt integrity remains fail-closed on ordinary LAN HTTP through the local SHA-1/SHA-256 fallback.

## Scene boundary

`ScenePackageV1` declares:

```text
identity
meters
+X forward / +Y up / +Z right
spawn position + yaw
render source
collision source
```

The default synthetic scene is loaded before physics and supplies the vehicle spawn position.

The current backend accepts only no render asset and a built-in ground plane at `y=0`. GLB and triangle-mesh sources are valid schema variants but fail backend support until their loaders exist.

See [`contracts/SCENE_PACKAGE_V1.md`](contracts/SCENE_PACKAGE_V1.md).

## Physics boundary

Direct Box3D calls are isolated behind a typed boundary. Vehicle bodies, joints and transient runtime handles remain inside the physics layer.

Renderer-facing data is copied into immutable plain values. Rendering code receives no mutable Box3D object or body handle.

## Runtime backend identity

Every vehicle runtime exposes a descriptor:

```text
id
productPhysicsAuthority
nativeParity
commandContractVersion
traceContractVersion
```

Current value:

```text
id: legacy_ts_m6
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
commandContractVersion: 1
traceContractVersion: 1
```

The legacy descriptor is validated at startup and cannot claim product authority or proven native parity.

## Reference vehicle

`legacy_ts_m6` is intentionally a browser reference fixture. It is valid for:

- input and lifecycle testing;
- browser and mobile rendering;
- scene-host development;
- mechanism observation;
- known-failure reproduction;
- comparison against the future native backend.

It is not authoritative product physics.

## Steering behavior

`RELEASE` means hands off in the first fixed step after input ends. The host must not create return-to-centre, centre hold or hidden stabilization.

Physical rack movement after release may come from contact, geometry, linkage forces, friction and inertia.

See [`contracts/STEERING_COMMAND_CONTRACT_PL.md`](contracts/STEERING_COMMAND_CONTRACT_PL.md).

## Portable build

The generated static package contains normal site files plus explicit runtime assets:

```text
index.html
assets/
receipts/
scenes/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Paths are relative so the same package can run from localhost, an ordinary LAN address or a repository subpath. The build does not publish itself.

The required runtime-asset contract currently contains:

```text
receipts/jv_m6_factory_receipt.json
scenes/synthetic-flat-lab.scene.json
```

## Target product architecture

```text
Box3D source
+ portable native JV Core
+ thin stable C ABI
          ↓
one WebAssembly module and memory space
          ↓
VehicleRuntimeBackend: native_jv_wasm
          ↓
immutable, unit-explicit runtime snapshots
          ↓
TypeScript browser host, renderer, UI and scene system
```

One module avoids trying to share Box3D world memory and runtime handles across unrelated WASM modules.

Stable authoring identity such as `partId` must remain separate from transient `b3BodyId` and `b3JointId` handles.

## Native parity

Native executable and WASM builds must run the same scenario corpus. Initial comparisons should cover settle, coast, throttle, reverse, brake, steering, release, wheel impact and combined stress.

A passing browser fixture test proves only that the fixture agrees with its own contract. Native parity requires comparable trajectories and mechanism telemetry from the same native core.

## Next structural change

After the current scene hardening slice is green, extract DOM construction and telemetry binding from `main.ts` without changing runtime behavior.

Do not combine that refactor with GLB decoding, collision-mesh implementation or native WASM work.
