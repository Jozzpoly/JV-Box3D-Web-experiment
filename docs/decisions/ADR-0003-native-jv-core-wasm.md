# ADR-0003 — Native JV Core and Box3D in one WebAssembly module

Date: 2026-08-04
Status: `ACCEPTED LONG-TERM DIRECTION / FULL MIGRATION DEFERRED IN CURRENT FRIEND-DEMO CAMPAIGN`
Decision owner: Jozz

## Current campaign scope note — 2026-08-08

The architectural decision below remains accepted: final product-physics authority should converge on native JV Core + Box3D in one WASM authority boundary rather than grow a second independent TypeScript mechanics product.

Its **execution schedule has changed**.

For the current JV-Web friend-demo campaign:

- native JV is maintained by another agent and is READ-ONLY;
- full native-core extraction, ABI program, native/WASM parity campaign and browser-backend replacement are deferred unless Jozz explicitly changes priority;
- `legacy_ts_m6` remains a non-authoritative browser reference fixture and may support bounded Web-local demo/configuration semantics whose status is explicit;
- rendering, real authored assets, camera/mobile UX, world/scan presentation, settings state and QoL may advance independently;
- a bounded port of an already-existing selected native `b3Wheel` mechanism through a controlled Web Box3D/Emscripten/binding path is allowed and does **not** activate the full migration program.

The historical "Immediate follow-up" list at the end is therefore preserved as deferred migration work, not the current sprint order. Current scheduling authority is `AGENTS.md` + `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`.

## Context

The clean browser line successfully rebuilt a deterministic host, timestamped input, typed Box3D boundary, current M6 topology, physical rack steering, a visual observer and minimal drive.

The implementation consumed a native-generated factory receipt containing values such as:

```text
maxDriveSpeed = 40
maxDriveTorque = 320
wheelRadius = 0.514062464
```

The receipt preserved value provenance, but it did not encode complete behavioral semantics or units.

Native JV defines `maxDriveSpeed` as the wheel motor rev limit in **rad/s**. Native throttle keeps the motor target at that rev limit and scales available torque. The TypeScript backend interpreted the same value as a chassis-linear target in **m/s**, then divided it by wheel radius and also used chassis speed for torque taper.

Both implementations can drive forward, reverse, brake and replay deterministically. Therefore the existing web tests can pass while the vehicle behavior is semantically different from native JV.

This proves that a configuration receipt cannot serve as a complete executable specification of vehicle mechanics.

## Decision

The product physics authority for JV Web will be:

```text
Box3D engine source
+ portable native JV Core
+ stable C ABI
+ one WebAssembly module and memory space
```

TypeScript remains responsible for:

- browser lifecycle;
- fixed-step scheduling;
- timestamped device input;
- input adapters for keyboard, pointer, touch and gamepad;
- renderer and camera;
- UI and experiment orchestration;
- persistence of sessions, observations and comparison metadata;
- immutable consumption of runtime snapshots.

Native JV Core becomes responsible for:

- blueprint compilation;
- vehicle bodies and joints;
- wheel/contact backend selection;
- rack actuation and release mechanics;
- drive, brake, coast and torque taper;
- anti-roll bars and aero;
- physical telemetry;
- stable part-role mapping;
- native/WASM scenario traces.

## Why one WASM module

A separate prebuilt `box3d.js` module and a second JV WASM module would not naturally share:

- Box3D world memory;
- `b3BodyId`/`b3JointId` runtime handles;
- allocator ownership;
- native structures;
- lifecycle and error state.

Compiling Box3D and JV Core together keeps all solver-facing code and runtime IDs inside one authority boundary.

## Runtime identity

Authoring identity must never depend on a Box3D runtime handle.

Required separation:

```text
stable partId / semantic role
        ↓ compile
transient b3BodyId / b3JointId
```

The pattern is inherited from the native `spike/kernel_v0` experiment: durable blueprint IDs are mapped to runtime handles only inside a compiled machine.

## Minimum ABI direction

The exact ABI remains an implementation detail of the spike, but it must provide equivalents of:

```c
JvRuntime* jvCreateRuntime(const JvRuntimeConfig*);
void jvDestroyRuntime(JvRuntime*);
void jvSetControlFrame(JvRuntime*, const JvControlFrame*);
void jvStep(JvRuntime*, double fixedDt);
const JvWorldSnapshot* jvGetSnapshot(const JvRuntime*);
void jvResetRuntime(JvRuntime*);
const JvRuntimeInfo* jvGetRuntimeInfo(void);
```

Every exported numeric field must define:

```text
name
type
unit
coordinate frame
range/domain
semantic meaning
source authority
```

## Snapshot requirements

The renderer-facing snapshot must contain copied, immutable values and stable semantic identity:

- runtime generation and fixed-step index;
- core/engine/build identity;
- stable `partId` and part role;
- body position and quaternion;
- linear/angular velocity where required;
- rack state;
- wheel state;
- suspension travel/load;
- steering angle;
- slip and camber when supported;
- contact observations;
- active backend and config hashes.

No persistent browser state may be keyed by `b3BodyId`.

## Legacy TypeScript backend

The current TypeScript M6 implementation is not deleted. It is reclassified as:

```text
backend id: legacy_ts_m6
role: reference implementation / browser research fixture
parity status: not proven
product authority: false
```

It remains valuable for:

- input/lifecycle tests;
- renderer development;
- A/B comparison;
- known failure reproduction;
- browser integration while the native spike is incomplete.

It must not receive new authoritative product physics such as:

- final drivetrain behavior;
- anti-roll parity work;
- future tire physics;
- new suspension mechanisms;
- silent fixes intended to imitate native behavior without a parity trace.

A small correction or bounded friend-demo mechanism may be made when its non-authoritative status is explicit and it is needed for useful Web experimentation. Such work does not restore product authority or prove native parity.

## Parity gate

Before native WASM replaces the reference backend, the same scenario corpus must run in:

1. a native executable linked against the same JV Core and Box3D source;
2. the browser/WASM build.

Initial scenarios:

- settle;
- coast;
- forward throttle;
- reverse;
- brake;
- native POSITION left/right;
- RATE engage and reversal;
- RELEASE;
- stationary full-lock;
- rolling release;
- wheel impact;
- throttle + lock + brake stress.

Comparison must include more than final direction and liveness. It must include quantized trajectories and mechanism-specific telemetry.

## Wheel consequence

`legacy_m6_split_sphere_sidewall` remains a regression baseline only.

The future authoritative Wheel Scope backend will enter JV Core through a replaceable native wheel/contact seam. It will not be invented as another TypeScript-only physics path.

The current friend-demo may nevertheless port an already-existing selected native `b3Wheel`/contact mechanism into a controlled Web Box3D build for practical demonstration, provided its provenance/build identity and non-parity status are explicit until a future parity program establishes more.

## Consequences

### Positive

- one long-term mechanics authority;
- no repeated manual port of native algorithms as the final product strategy;
- units and semantics become explicit;
- browser and desktop can ultimately share the same vehicle core;
- Wheel Scope can feed one authoritative product path;
- parity becomes measurable rather than rhetorical;
- TypeScript host remains independently testable.

### Cost

- requires a custom Emscripten/WASM build instead of relying only on the published `box3d.js` package;
- requires a stable ABI and snapshot memory contract;
- requires native core extraction from the current samples-oriented layout;
- introduces a migration phase with two named backends;
- build identity and deployment size need renewed investigation.

## Rejected alternatives

### Continue porting M6/M7 algorithms to TypeScript as final product authority

Rejected because the first implemented drive path already demonstrated semantic drift despite correct values and green internal tests.

### Treat the receipt as an executable specification

Rejected because values, field types and provenance do not encode units, update order, control law or coupling with runtime telemetry.

### Run a second JV WASM beside the prebuilt Box3D WASM

Rejected as the default architecture because the two modules would not naturally share Box3D runtime memory and handles.

### Freeze on the current TypeScript backend permanently

Rejected because it would split JV and JV Web into two authoritative mechanics products and make future Wheel Scope adoption twice as expensive and less trustworthy.

## Deferred migration follow-up — historical order, not current sprint

When the full migration program is explicitly reactivated:

1. keep/document current backend as `legacy_ts_m6` without promoting its mechanics to product authority;
2. retain unit-semantic regressions exposing known native/reference mismatches;
3. define the smallest native core source set for a headless WASM spike;
4. define versioned ABI structs with explicit units;
5. produce native/WASM settle-and-drive parity receipts;
6. only then begin authoritative backend replacement in the browser host.

Do not execute this list mechanically during the current friend-demo unless Jozz explicitly reactivates the full migration program.