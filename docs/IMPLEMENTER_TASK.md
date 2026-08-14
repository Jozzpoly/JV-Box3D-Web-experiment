# JV Web — implementer task

Updated: 2026-08-13
Status: **ACTIVE**
Task: **R1-STEER-COUPLING-01 — bounded bilateral coordinate-coupling feasibility**
Mode: **DISPOSABLE CAUSAL RESEARCH / TEMPORARY BRIDGE PROTECTED**

## Transaction boundary

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
active branch: work/front-corner-golden-rebuild-r2
main control: 97055331a2eef8bdbf8411db243417591731e664
bridge integration parent: 4ad9de6fd0ff3b6b9193fa2fb17b7f77e0a67785
public R0: immutable
native JV: READ ONLY evidence/research
```

The owner accepted `R1-DRIVE-BRIDGE-01` only as a temporary R1 intermediate. Preserve it as the product baseline while this task runs in disposable workspaces.

## Why this task exists

The bridge fixed the dominant two-mechanism front-axle asymmetry well enough for R1, but intentionally removes physical rack back-drive. Post-bridge probes confirm that after RATE `RELEASE` at steering lock the rack stays effectively fixed while the car continues turning.

The strongest spatial physical-link experiment is not promotable because its bump-steer depends on provisional rack/suspension hardpoints that belong to deferred rig/workbench debt. Do not tune those points.

## One question

Can an energy-consistent bilateral relation between rack translation and steering rotation be expressed with the exact pinned Web/Box3D API **without**:

- guessed spatial tie-rod/rack mating points;
- hidden centering target or servo-to-zero;
- one-way mapped forces pretending to be a constraint;
- dependency on the deferred wishbone<->knuckle visual rig;
- importing M5/M6/latest-native geometry as authority?

This is mechanism feasibility, not selection of a future architecture.

## Protected controls

Every experiment must preserve:

- owner-accepted WheelCenter steering center;
- #6 suspension-side / #8 steerable separation on FL;
- independent wheel spin;
- S1 FL upper accepted behavior;
- current temporary bridge as rollback/control;
- no lower-arm/mating offset fix;
- mirrored left/right test cases and product 4-substep baseline.

## Required evidence

Before writing any candidate physics to the branch:

1. identify the exact Box3D.js 0.0.2 primitives/API available for bilateral coordinate coupling;
2. distinguish solver-native constraint possibilities from external force/impulse approximations;
3. if a candidate exists, prove forward path `rack -> steering` and reverse path `contact/steering -> rack`;
4. test construction-order sensitivity at product substeps;
5. confirm no artificial zero-angle/rack target is required;
6. compare suspension travel behavior without tuning spatial hardpoints;
7. reject any candidate whose good result depends on stale M5/M6 numeric geometry.

## Fast stop conditions

Return `RIG_AUTHORING_BLOCKED` instead of extending the experiment if:

- the pinned binding exposes no suitable solver constraint and a faithful custom constraint would require engine/binding work beyond a bounded slice;
- external force mapping remains soft/order-sensitive/unstable or cannot conserve the intended bidirectional relation;
- credible behavior requires hidden centering or hand-tuned compensation;
- the only remaining path is a spatial linkage whose geometry must come from future owner rig/workbench authoring.

If stopped, do not treat that as project failure: preserve the accepted temporary bridge and choose the next R1 product slice from the clean driving baseline.
