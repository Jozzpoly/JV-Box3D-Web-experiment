# Native JV Core → WebAssembly notes

Updated: 2026-08-08
Status: **LONG-TERM REFERENCE / FULL NATIVE PORT DEFERRED FOR CURRENT FRIEND-DEMO CAMPAIGN**

This document records why a future full native JV→WebAssembly backend is desirable. It is **not** the current R1 execution plan.

For the present campaign native JV is maintained by another agent and is read-only. JV-Web may inspect it and selectively port an already-existing mechanism, especially `b3Wheel`, but must not begin a broad native-core refactor or parity program unless Jozz explicitly changes scope.

## Why a future native port remains desirable

The current browser fixture consumes values from a native-generated receipt but does not execute the same vehicle algorithms. Configuration similarity is not behavior parity.

Known example:

```text
native JV: maxDriveSpeed = wheel motor limit in rad/s
legacy TS: historically interpreted as chassis-linear target
```

Therefore a browser fixture can move correctly and pass deterministic tests while still behaving differently from native JV.

Long-term target:

```text
Box3D + native JV core
        ↓
behavior-preserving WASM module
        ↓
stable semantic controls + copied snapshots
        ↓
JV-Web rendering / input / UI / assets
```

## Deferred full-port objective

When this work is reactivated, do not begin with a large native refactor. First compile an unchanged behavior-preserving slice and establish at least one comparable native-vs-WASM scenario.

Historical source direction included:

```text
Box3D source
jozz_vehicle_m5_vehicle.{h,cpp}        temporary helper dependency
jozz_vehicle_m6_geometry.{h,cpp}
jozz_vehicle_m6_suspension_rig.{h,cpp}
new thin runtime/C-ABI adapter
```

That direction is historical guidance, not an instruction for the current friend-demo.

## Stable seam principles worth preserving now

Even before a full native port, Web architecture should avoid making future convergence harder:

- transient Box3D handles stay behind the physics/backend boundary;
- browser input is semantic rather than direct physics manipulation;
- snapshots use stable semantic roles/IDs;
- units, coordinate frames and lifetimes are explicit;
- rendering consumes copied/read-only state;
- Web-only presentation/config UX should not become hidden physics authority.

These principles are current. The old exact source list/port order is not current.

## Current campaign exception: bounded `b3Wheel` port

Jozz wants the newer native true wheel collider in the Web friend-demo if the technical path is sane.

This is **not** equivalent to activating the full native→WASM program.

Use a bounded feasibility/port workflow:

1. inspect the exact accepted/frozen native wheel patch surface and current native read-only state;
2. identify the minimal Box3D source/dependency delta;
3. determine Emscripten/build changes;
4. determine required C/JS/TS exports;
5. preserve a pinned engine/binding identity;
6. add focused wheel/contact tests;
7. retain the current legacy split-wheel path as rollback until the new Web backend is proven;
8. do not invent new tire/contact physics inside JV-Web.

The handoff resource pack contains an exact recovered `b756f091...` patch surface for `B3X-WHEEL-001` and `B3X-WHEEL-SOFT-002`. Before a real port, compare that frozen evidence with the then-current read-only native JV state so an obsolete variant is not accidentally promoted as the intended newest wheel.

## Historical parity scenario ideas — deferred

When full native/WASM parity work eventually resumes, useful scenarios remain:

```text
create/destroy/reset
settle on flat ground
POSITION left/right and RELEASE
coast
forward/reverse throttle
brake
RATE engage/reversal
wheel impact
throttle + lock + brake stress
```

Compare trajectories and mechanism telemetry, not only final direction or whether the vehicle moved.

## Explicit current non-goals

Do not use this document as justification to start:

- full native JV WASM integration;
- native JV refactoring;
- native parity campaign;
- migration of all drivetrain/suspension/tire behavior into Web;
- new native tire R&D.

The current friend-demo is allowed to advance independently in rendering, camera, UI, mobile UX, world/scan presentation and configuration. Full native convergence is a later program unless Jozz changes the priority.