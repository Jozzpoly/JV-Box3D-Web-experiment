# `box3d.js@0.0.2` binding semantics audit — pass 1

Status: `SOURCE_AUDIT / USED-SURFACE_ONLY / FULL_EXPORT_AUDIT_PENDING`

Binding source:

```text
isaac-mason/box3d.js
commit 2617a0ff763a60c9f17cee57c6ea72aab75a5077
file src/bindings.cpp
```

Engine source:

```text
erincatto/box3d
commit 8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

## 1. General binding model

The binding is hand-written embind, described by its own source as “flat & faithful”. The actual pattern is:

- C structs become embind `value_object`s;
- direct C functions are exported directly where possible;
- pointer-to-definition constructors are wrapped by lambdas accepting structs by value;
- dynamic arrays use JS→C++ vector conversion;
- callbacks require custom JS wrapper code;
- inline C helpers are only available if explicitly bound or recreated in JS/web code.

Therefore API-name presence does not prove semantic completeness.

## 2. Definitions used by the M6 slice

### World definition

The binding exposes numeric/value fields used by the old PoC:

```text
gravity
restitutionThreshold
hitEventThreshold
contactHertz
contactDampingRatio
contactSpeed
maximumLinearSpeed
enableSleep
enableContinuous
workerCount
capacity
internalValue
```

Pointer/callback/user-data fields are deliberately not registered and round-trip as null/default.

Consequence:

- old single-threaded M6 fixture can create its basic world;
- world callback semantics are not represented through `b3WorldDef`;
- future custom material/friction logic cannot be assumed available merely because native `b3WorldDef` supports callbacks.

### Body and shape definitions

The used body/shape fields are exposed, including:

```text
body type/pose/velocity/damping/gravity scale/motion locks/sleep/bullet/fast rotation
shape material/density/filter/events/updateBodyMass/internalValue
surface friction/restitution/rollingResistance/tangentVelocity/userMaterialId
filter categoryBits/maskBits/groupIndex
```

`b3MassData` exposes:

```text
mass
center
inertia
```

and `b3Body_SetMassData` is bound directly.

Status: `THIN_BINDING_CANDIDATE`, still requiring numeric round-trip tests.

## 3. Joint definitions

The binding exposes the fields used by the old double-wishbone builder for distance, revolute, prismatic and spherical joints, and wraps their create functions by value.

Examples verified in source:

- prismatic spring hertz/damping/target, translation limits and motor force/speed;
- distance spring hertz/damping, length range and motor fields;
- revolute limits and motor fields;
- spherical base/spring/target and limit fields;
- shared joint base frames, bodies and `collideConnected`.

Status: `SURFACE_PRESENT / FRAME_ROUND_TRIP_NOT_PROVEN`.

Required clean tests:

- construct each native definition with non-symmetric sentinel values;
- serialize the expected field values into a native receipt;
- construct through embind;
- query live joint state and verify axes, frames, limits, lengths and motor/spring parameters.

## 4. Hull wrappers

### `b3CreateHull(points)`

The wrapper:

1. copies JS numbers into `std::vector<float>`;
2. interprets every three floats as one `b3Vec3`;
3. passes `count` as both point count and hull capacity.

The wrapper returns a raw `b3HullData*`, requiring explicit `b3DestroyHull`.

Potential boundary conditions not guarded by the wrapper:

- array length not divisible by 3;
- zero/too few/degenerate points;
- silent float conversion from JS numbers;
- native hull failure/null handling.

The contaminated web builder’s `normalize(zero)->+Y` and best-effort geometry handling make these failures harder to diagnose.

### `b3CreateTransformedHullShape`

This is a thin by-value definition wrapper around the native call. It does not by itself introduce different transformed-hull semantics.

Status: `THIN_BINDING_CANDIDATE`.

## 5. Mesh wrapper — confirmed semantic reduction

The exported function is:

```text
b3CreateMesh(positions, indices)
```

It constructs a zero-initialized `b3MeshDef` and sets only:

```text
vertices
vertexCount
indices
triangleCount
weldVertices = true
```

Native `b3MeshDef` additionally includes at least:

```text
useMedianSplit
identifyEdges
```

Because the struct is zero-initialized, the binding forces:

```text
useMedianSplit = false
identifyEdges  = false
```

These settings cannot be selected by the JS caller.

Consequences:

- mesh creation always welds nearby vertices;
- grid-optimized median split cannot be requested;
- triangle adjacency/internal-edge identification cannot be requested;
- the old scan path cannot claim equivalent native mesh preparation;
- wheel-on-triangle-mesh ghost/internal-edge behavior remains an explicit blocker.

Status: `CONFIRMED_BINDING_LIMITATION`.

Clean policy:

- no serious scan collider enters vehicle validation through this simplified wrapper without an explicit experiment receipt;
- a future binding extension must expose a named options object matching native `b3MeshDef` semantics;
- default values must be explicit in the web schema, not hidden in a zero-initialized C++ local;
- engine/binding patch remains optional and isolated until measured.

## 6. Callbacks

The binding source omits callback pointers from `b3WorldDef`, but includes separate wrappers for at least:

- custom filter callback;
- pre-solve callback;
- enabling pre-solve/contact/sensor/hit events.

This means callback availability is mixed:

```text
native callback field
≠ automatically bound field
≠ necessarily unavailable
```

Each required callback must be audited individually.

Potential risks visible in source:

- JS callback holder allocation/lifetime must be reviewed;
- threaded build callback safety differs from single-threaded build;
- callback cost/crossing may be unsuitable for per-contact tire law;
- exception and re-entrancy behavior require tests;
- custom friction/restitution mixing was not found in the pass-1 used surface and remains `NOT_PROVEN`.

The current wheel research W3 cannot assume that native callback seams are product-ready in browser WASM.

## 7. Events and CCD

The binding packs body move/contact/sensor/joint events into WASM-backed buffers.

The published engine source predates the JV fix that corrects body move event pose after CCD. Therefore:

- with `enableContinuous=false`, current M6 fixture does not enter the affected path;
- with CCD enabled, browser move-event consumers would observe the upstream behavior unless the engine is rebuilt/patched;
- this difference concerns event reporting, not the body’s already-advanced TOI pose.

## 8. Inline helpers and shims

The old PoC found `b3MulQuat` absent at runtime despite native source use. This is expected for inline helpers not explicitly registered.

The local shim used the native formula and solved that single function, but the old architecture had weaknesses:

- module boundary typed as `any` in important places;
- source scanner detects spelling/presence, not signatures;
- shim formula duplicated between runtime and test script;
- no generated list of required native-inline adapters;
- no direct native-vs-WASM vector/quaternion golden tests.

Clean policy:

- one typed adapter module;
- one source for each shim;
- explicit naming `native_inline_compat`;
- test against native-generated golden inputs/outputs;
- no ad-hoc helper copied when an equivalent exported primitive exists.

## 9. `b3Default*Def()` importance

The binding registers `internalValue` fields so definitions returned by `b3Default*Def()` survive JS round-trip validation. This is valuable and should be retained.

However, setting JS object fields after default construction still needs tests for:

- BigInt filter/material values;
- nested value-object copy semantics;
- quaternion representation (`v` + `s` versus x/y/z/w helpers);
- `b3Pos` precision;
- enum values;
- omitted pointer fields;
- default values after bundling/minification.

## 10. Why the old “60 calls checked” gate is insufficient

It proves:

```text
property exists on instantiated module
and a small smoke world can step
```

It does not prove:

- exact source engine identity;
- wrapper options/defaults;
- struct completeness;
- callback availability;
- numeric round-trip;
- pointer ownership/lifetime;
- error handling;
- native/web behavioral equivalence.

The gate is worth keeping as `EXPORT_PRESENCE_SMOKE`, but not as a parity gate.

## 11. Clean binding validation levels

```text
B0 artifact identity
  npm/tarball/binding/engine SHA and hashes

B1 export presence
  required function and type names exist

B2 definition round-trip
  sentinel values survive JS→WASM construction

B3 ownership/lifetime
  hull/mesh/buffer/callback create-destroy behavior

B4 numeric primitive equivalence
  vectors/quaternions/hulls/mass data

B5 joint/body fixture equivalence
  live queried frames/limits/masses

B6 contact fixture equivalence
  materials, filters, manifolds, rolling resistance

B7 vehicle scenario equivalence
  native/web receipts using the same config and solver profile
```

Old PR #1 reached parts of B0/B1 and a web-only smoke. It did not reach B5–B7.

## 12. Current verdict

The binding is a credible early WebAssembly adapter, not a proven drop-in runtime for JV.

For the first clean, continuous-disabled M6 fixture, most used body/joint functions appear to be thin enough to justify further equivalence testing. Mesh creation and future advanced tire/contact work require explicit binding changes or sharply limited scope.

No product code should be rebuilt until B2–B5 receipts exist for the exact subset used by the clean topology/controller.