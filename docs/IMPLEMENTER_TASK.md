# JV Web — implementer task

Updated: 2026-08-12
Status: **ACTIVE**
Task: **R1-DRIVE-BRIDGE-01 — owner in-game gate for temporary coherent front**
Mode: **DISPOSABLE PRODUCT CANDIDATE / NO FINAL STEERING CLAIM**

## Write scope

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
active branch: work/front-corner-golden-rebuild-r2
control main: 97055331a2eef8bdbf8411db243417591731e664
S2 mechanics/source base: a4468042550265d10c2fa4b13b926d9227040d89
public R0: immutable
native JV: READ ONLY
```

Resolve refs before every write. Do not commit the temporary bridge until owner in-game evidence exists.

## Why this task exists

R1-DRIVE-01 proved that the product candidate mixes two different front steering mechanisms and this causes the dominant left/right driving asymmetry.

A coherent physical linkage remains promising but cannot be honestly promoted yet: its spatial tie-rod/rack geometry depends on provisional suspension/rack hardpoints and currently produces several degrees of bump-steer. Do not tune those anchors around the deferred old rig.

## Candidate under test

`TEMPORARY_SYMMETRIC_KINEMATIC_FRONT`:

- preserve accepted FL S2-K mechanism/source behavior;
- remove only FR historical physical tie-rod joint;
- use the same provisional rack→angle command on FR through its existing twist DOFs;
- do not add a carrier/body/hardpoint or visual offset;
- no physical contact→rack back-drive claim;
- no self-align claim;
- no FR-axis/hardpoint acceptance;
- deferred wishbone↔knuckle rig debt remains untouched.

## Automated gate already achieved in supplemental lane

- TypeScript compile: PASS;
- full suite after correcting stale boundary assertions: 326/326 PASS;
- straight 0.30-throttle probe: ~-0.76° final yaw, 4 contacts;
- mirrored active probe: ~-41.34° / +41.44° final yaw, nearly equal peak speed;
- owner GLB remains byte-identical to S2-K: 829936 B / `1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc`.

## Owner question

Drive normal Offroad. Judge whether left/right steering response now feels coherent enough for an R1 intermediate.

Do **not** ask whether final steering physics, self-align, back-drive or rig geometry is correct. RATE steering `RELEASE` still means stop moving the rack; no hidden centering assist is added.

## Return states

`BRIDGE_OWNER_ACCEPTED` — temporary coherent steering is worth integrating as an explicitly provisional R1 product step.

`BRIDGE_OWNER_REJECTED` — do not commit; return to mechanism/product planning with the owner observation.

`RIG/PHYSICS_REPLAN` — owner evidence shows that even the temporary bridge cannot provide meaningful product progress without confronting the deferred rig/physical-steering problem directly.
