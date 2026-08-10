# JV Web — current handoff

Updated: 2026-08-10
Purpose: rolling continuation note. Replace stale content instead of appending history.

## Authority

```text
Private repo: Jozzpoly/JV-Box3D-Web-experiment
Active branch: main
(resolve live tip before every write)

Public repo: Jozzpoly/JV-Box3D-Web-Public
Frozen Pages branch: release/r0
```

The current owner-rig product lineage still reproduces the exact artifact:

```text
id: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

## V0 Owner Baseline Revalidation — COMPLETE

Jozz ran the unchanged owner-rig validation candidate on Windows on 2026-08-10.

Canonical execution evidence:

- Node 24.16.0 / npm 11.13.0;
- pinned dependency install completed;
- TypeScript typecheck completed;
- exact owner artifact regenerated and reverified before/after build;
- 13 focused owner-rig/steering tests passed;
- Vite 8.1.5 production build completed;
- local browser candidate launched and validation session closed normally.

Interpretation: this proves reproducibility and internal consistency of the current implementation. It does **not** prove visual correctness, good handling or owner acceptance.

## Fresh owner observation — current authority

The current rig is not ready to be treated as an accepted visual baseline.

OWNER OBSERVED:

- chassis/body is roughly where it should be;
- suspension/wishbones sit too far from the frame;
- damper/spring rigging is visibly wrong; springs/parts move incorrectly and substantial damper geometry sits inside wheels;
- cardans reach the wheel/hub region but their differential-side endpoint does not visually meet the differential in the right place;
- suspension/upright/hub geometry between wheel and arms is largely hidden/buried in the wheels;
- wheel placement cannot yet be judged reliably because the bad surrounding geometry obscures it;
- overall vehicle/wishbone angle is not hopeless, but ride height should eventually be slightly higher;
- driving feel, suspension stability and steering feel are strongly regressed;
- scan loading unexpectedly works in this candidate; record the observation but do not open the scan lane during car cleanup.

The previous R4 statement that wheel placement was excellent and suspension packaging almost excellent is now **HISTORICAL OWNER OBSERVED**, not current authority. The mismatch is unresolved because the historical session state (`owner_r4`, `Tire=0`) was not persisted as an exact preset. Do not silently reconcile the two observations.

## Critical interpretation of green tests

Current tests are useful but several are consistency tests against the same calibration model that generates the rig.

Examples:

- a cardan test can prove that the visual shaft hits the code-derived `differential output face` while the owner still sees that this derived point is not the correct visible mating point on the rendered differential;
- a wishbone/hardpoint test can prove exact mapping to current M6 hardpoints while the owner still sees that those hardpoints/visual relationships are too far from the actual chassis model;
- 59 live bindings can all remain attached to their source parts while individual asset transforms, local axes or endpoints are visually wrong.

Durable rule:

```text
CONSISTENCY TEST PASS
!= VISUAL GEOMETRY TRUTH
!= OWNER ACCEPTANCE
!= GOOD VEHICLE FEEL
```

## Current work boundary

Do not tune handling, suspension stability, steering feel or tire behavior now. Jozz explicitly wants visual/mechanical presentation made coherent first; the dynamic regression remains an OWNER OBSERVED deferred defect.

Do not attempt a whole-rig rewrite.

The next implementation campaign must be dependency-driven and owner-validated in very small slices:

```text
one visual relationship/mechanism
-> focused source/geometry evidence
-> smallest correction
-> exact playable candidate
-> one focused owner verdict
-> freeze accepted scope
-> next relationship
```

## Prepared dependency order — NOT yet implementation

Current screenshots suggest a root-to-leaf order rather than the earlier steering-first order:

1. establish the chassis <-> suspension/wishbone attachment skeleton and wheel-center relationship;
2. expose/correct the hub/upright package between the wishbones and wheel;
3. correct damper/spring rigging as its own slice;
4. correct cardan visual endpoints as its own slice;
5. correct remaining front/rear local pieces one mechanism at a time;
6. adjust stance/ride height only after the geometry is readable;
7. run a whole-rig visual integration check without redesign;
8. only then reopen handling/stability/steering-feel work.

This order is a dependency hypothesis derived from the current observation, not a mandatory roadmap. Before the first code change, inspect the exact transform chain for the selected first relationship and define the allowed blast radius.

## First future implementation rule

The first correction should not be `fix front suspension` or `fix all wishbones`.

Start with one measurable relationship — preferably one dependency root that can be mirrored deterministically after proof — and prepare an owner candidate where Jozz only needs to answer whether that relationship is now visually correct without evaluating unrelated mechanisms.

No product code change has been made as part of this V0 analysis/handoff update.
