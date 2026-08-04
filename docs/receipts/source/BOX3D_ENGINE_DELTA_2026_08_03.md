# Box3D engine delta receipt — upstream npm engine ↔ JV fork

Status: `SOURCE_DELTA_CLASSIFIED / RUNTIME_EQUIVALENCE_NOT_PROVEN`

Evidence workflow:

```text
workflow: audit-box3d-engine-delta
run:      30816456724
job:      91695321339
artifact: 8856934838
```

## Compared source identities

```text
upstream repository: https://github.com/erincatto/box3d.git
upstream commit:     8441b4a06d6d09dcfb0b0f704df4d847d1437b92
upstream tag:        v0.1.0

JV repository:       https://github.com/Jozzpoly/Box3d_FunProject.git
JV commit:           959aefb78587ce60cf2b8eb03ff82797a4165142

merge base:          8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

The JV repository is a direct descendant of the exact Box3D engine commit compiled into `box3d.js@0.0.2`.

## Core engine tree delta

Paths classified as core engine input:

```text
src/
include/
CMakeLists.txt
cmake/
```

Changed core files:

```text
M src/recording_replay.c
M src/solver.c
```

Diff size:

```text
src/recording_replay.c | 4 lines changed
src/solver.c           | 4 lines added
2 files, 6 insertions, 2 deletions
```

Full engine patch SHA-256:

```text
982800430dc4d7430f01eee12ae99b98a90cf7cf58b64e9eb40b51da20a488c5
```

Audit tree hashes:

```text
upstream engine tree:
408fe0db6cf4fbd0a22e841e84561c9891737cd44bf0a62734e91146750d78f8

JV engine tree:
9996c4d37b805f020c296083b16992b84dea25cd500f7157d4a1a5f43c702ad0
```

## Engine commit responsible for the delta

```text
commit: 1c5ac42c376eb216734df1f35d14bf33c29bb6e7
date:   2026-07-01T23:19:23-07:00
subject: Fixes 01 (#26)
```

## `src/recording_replay.c`

Upstream contains an erroneous expression assigning a comparison result to a color variable in the mover replay draw path. JV changes it to the intended constant:

```text
b3_colorLightSkyBlue
```

Classification:

```text
DEBUG/REPLAY VISUAL FIX
NO PHYSICS STATE EFFECT
```

It affects recorded-query rendering only.

## `src/solver.c`

JV adds, after a CCD time-of-impact pose advances a fast body:

```text
b3BodyMoveEvent* event = b3Array_Get(world->bodyMoveEvents, bodySimIndex);
event->transform = fastBodySim->transform;
```

The body had already been advanced in both source trees. The JV patch corrects the previously emitted move event so its reported transform matches the impact pose.

Classification:

```text
CCD EVENT REPORTING FIX
BODY SOLVER STATE ALREADY ADVANCED IN BOTH TREES
NO CHANGE TO CONTACT/JOINT EQUATIONS IN THIS PATCH
```

The patch may affect consumers of body move events when CCD advances a body. It does not add or modify the physical TOI pose itself.

## Relevance to the current M6 fixture

Pinned native M6 lab and contaminated web PoC both set:

```text
enableContinuous = false
```

In the engine, a body is added to the fast/continuous path only when the condition includes:

```text
body is dynamic
AND enableContinuous
AND motion exceeds the threshold
```

Therefore the added CCD move-event correction is inactive for the current continuous-disabled M6 fixture.

Status for this narrow fixture:

```text
SOURCE-LEVEL CORE PHYSICS DELTA: NO ACTIVE DIFFERENCE IDENTIFIED
```

This statement is intentionally narrower than `runtime parity`.

## What remains different despite the tiny engine patch

The native and web executables still differ in:

- compiler and target architecture;
- native C build versus Emscripten/WASM;
- Release flags/toolchain versions;
- embind wrapper functions and struct conversion;
- available exports and local compatibility shims;
- JS number/BigInt boundary;
- browser scheduling and fixed-step host;
- single-threaded WASM runtime versus native task scheduling configuration;
- old PoC gravity and configuration differences;
- any non-core JV sample/vehicle code manually ported to TypeScript.

No source-tree result can prove these runtime boundaries automatically.

## Consequence for engine strategy

The audit no longer has evidence that the JV fork contains broad custom solver laws missing from `box3d.js@0.0.2`. For the current continuous-disabled M6 fixture, Route B — pinned upstream WASM plus an explicit delta contract — may be technically honest.

It remains conditional on:

1. exact binding/API audit;
2. deterministic native/web fixture receipts;
3. struct/default-value tests;
4. body mass/inertia and joint-frame comparisons;
5. controller trace comparison;
6. contact/material scenario comparison;
7. explicit exclusion or adaptation of CCD move-event consumers.

Building WASM from the JV fork remains the stronger long-term single-source route, especially if future work enables CCD or consumes move events. Choosing between routes is an architectural decision, not a conclusion of this source diff alone.