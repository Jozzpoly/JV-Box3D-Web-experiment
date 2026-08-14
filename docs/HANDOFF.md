# JV Web — active transaction handoff

Updated: 2026-08-13
Status: **R1-DRIVE-BRIDGE-01 OWNER ACCEPTED AS TEMPORARY INTERMEDIATE / CONSISTENCY AUDIT CLEAN / FINAL STEERING + RIG OPEN**

## Exact boundary

```text
private repo: Jozzpoly/JV-Box3D-Web-experiment
main control: 97055331a2eef8bdbf8411db243417591731e664
active branch: work/front-corner-golden-rebuild-r2
pre-integration branch tip: 4ad9de6fd0ff3b6b9193fa2fb17b7f77e0a67785
S2 mechanics/source base: a4468042550265d10c2fa4b13b926d9227040d89
public R0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44 — immutable
native JV: READ ONLY
```

Resolve live refs immediately before writes. The branch name is historical workflow naming; it does not establish a `golden` architecture.

## Protected owner evidence

Owner acceptance is limited to:

- S1 FL upper static/live behavior;
- FL #6 suspension-side/non-steering role;
- FL #8 separate steerable role relative to #6;
- WheelCenter-centered steering position;
- independent wheel spin/orientation;
- S2-GAME-01 normal Offroad regression checkpoint;
- S2-K direct in-game #6/#8 confirmation;
- R1-DRIVE-BRIDGE-01 as a **temporary** R1 driving checkpoint: straight behavior and left/right steering are materially more coherent, enough to continue development.

Do not expand that verdict into final steering physics or topology.

## Bridge implementation

The accepted temporary bridge changes only steering behavior needed to remove the mixed front mechanism:

- keeps existing bodies/hardpoints/visuals;
- removes the historical FR physical steering distance joint;
- commands FR with the same provisional rack->angle map used by FL;
- intentionally has no physical back-drive/self-align claim;
- normal owner GLB stays byte-identical at 829936 B / `1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc`.

Automated supplemental gate after the authority/test cleanup: 326/326 PASS. This remains supplemental unless the exact canonical Node/npm/TS lane is separately demonstrated.

## Deferred rig debt

Wishbone<->knuckle mating and FL lower placement remain `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`.

Do not patch with offsets and do not calibrate future physical rack/tie-rod geometry to the current visual separation.

## Consistency audit corrections

The bridge must not carry the old S2/M6 authority inversion. Current candidate corrections include:

- secondary front contract v3: #6 `suspensionSide`, #8/#7-outboard `steerableMember`, rack-side endpoint open/not authored;
- active runtime canonical terminology changed from `Golden` to `SourceRegistered` / `ProvisionalSteering`; legacy exported names remain only as compatibility aliases;
- R3 visual-calibration report strings now state that current suspension/knuckle hardpoints are deferred-rig/legacy references;
- false provenance `REAL_M6_RACK_CENTER_OWNER_ACCEPTED...` removed;
- S2 tests no longer certify the exact provisional rack-law equation;
- old R3 tests that compared source offsets to M6 config are demoted to historical visual-calibration regression rather than current steering authority;
- current state/architecture/branch docs supersede the 2026-08-11 `golden native` narrative.

## Reproduced physical research — keep as evidence, not configuration

- mixed FL/FR steering caused the large asymmetry;
- coherent bilateral physical linkage can recover active symmetry;
- weak restoring physical linkage at 4 substeps had construction-order-sensitive runaway;
- constant 40 N rack stiction was harmful in that experimental graph;
- toe-preloaded scrub result was a confounded false lead;
- positive longitudinal trail around WheelCenter produced plausible speed-dependent restoring behavior in a near-neutral-toe provisional setup;
- spatial tie-rod bump-steer remained several degrees because rack/suspension geometry is unresolved.

No numeric trail/scrub/caster/KPI/rack anchor is accepted.

## Post-bridge driving evidence

Compact headless probes on the clean bridge show:

- straight driving keeps four contacts and stays within a few degrees over long runs across tested throttle values;
- mirrored active turns are close but not perfectly symmetric, especially at higher speed;
- braking remains broadly mirrored with residual asymmetry;
- the clearest intentional limitation is steering release: after RATE input is released at lock, rack translation changes by less than ~0.2 mm and the vehicle continues the turn because the bridge has no contact->rack feedback.

## Next bounded slice

`R1-STEER-COUPLING-01` is a **feasibility/falsification** slice, not an implementation commitment.

Question: can the pinned Web/Box3D boundary support an energy-consistent bilateral coupling between rack translation and the front steering coordinate, preserving contact->rack back-drive without guessed spatial tie-rod hardpoints, hidden centering or old-rig geometry?

Stop quickly if it requires arbitrary force mapping, unstable solver hacks or effectively reimplements servo-to-zero. If infeasible, mark final physical steering `RIG_AUTHORING_BLOCKED` and keep the owner-accepted temporary bridge while moving R1 product work elsewhere.
