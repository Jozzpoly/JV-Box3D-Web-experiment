# AI project memory — JV Web

Updated: 2026-08-13
Status: `R1 ACTIVE / S2-K PROTECTED / R1-DRIVE-BRIDGE-01 OWNER ACCEPTED AS TEMPORARY INTERMEDIATE / RIG MATING DEFERRED / FINAL STEERING OPEN`
Owner: Jozz

Current Git, exact authored source, reproducible execution evidence and direct owner observation outrank documentation, historical M5/M6 rigs and legacy naming.

## Transaction boundary

```text
private main control: 97055331a2eef8bdbf8411db243417591731e664
active work branch: work/front-corner-golden-rebuild-r2
pre-bridge-integration work tip: 4ad9de6fd0ff3b6b9193fa2fb17b7f77e0a67785
S2 mechanics/source base beneath the temporary bridge: a4468042550265d10c2fa4b13b926d9227040d89
public R0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44 — immutable
native JV: READ ONLY research/evidence source, never whole-rig golden authority
```

Do not infer product authority from the historical `golden` wording in the work-branch name or retained compatibility identifiers.

## Owner-accepted evidence — narrow and durable

Preserve only what the owner actually validated:

- S1 FL upper static placement and live articulation;
- #6 `Socket_ChassisMount_b` = suspension-side / non-steering source role;
- #8 `Socket_WheelCenter` = distinct steerable source role relative to #6;
- steering center remains at the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin remain separate from structural #8 spin;
- S2-GAME-01 broad Offroad checkpoint;
- S2-K direct in-game confirmation of #6/#8 relative motion around the expected WheelCenter-centered axis;
- R1-DRIVE-BRIDGE-01 owner verdict: as a **temporary R1 intermediate**, the car now drives straight and steers much more coherently left/right; the previous two-mechanism front-axle defect is roughly resolved enough to continue.

The bridge acceptance does **not** accept final steering physics, the current rack->angle map, self-align/back-drive, carrier/body topology, FR legacy axis/hardpoints, caster/KPI/trail, tie-rod geometry, mass split or handling.

Residual asymmetry and imperfections remain owner-observed.

## Temporary bridge — current implementation status

`R1-DRIVE-BRIDGE-01` is intentionally provisional:

- no new body/carrier/hardpoint/visual offset;
- historical FR physical steering distance joint removed;
- both front wheels receive the same provisional rack->angle command using existing coordinates;
- no physical `contact -> steering -> rack` back-drive;
- RATE `RELEASE` stops rack input; it does not self-center;
- visual package remains the owner-accepted S2-K geometry: 59 real bindings / 829936 B / SHA-256 `1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc`.

This is a product bridge, not a steering architecture.

## Deferred rig/workbench debt

Owner-observed and still deferred:

- FL lower wishbone placement is wrong;
- current wishbone<->knuckle visuals lack trustworthy mating frames through articulation and can separate in motion;
- do not mask this with offsets;
- do not tune rack/tie-rod hardpoints to the old rig merely to make bump-steer or visual mating look better.

Future rig/workbench authoring should establish real owner-authored mating points/frames.

## Physical-steering research — reproduced findings, not product truth

Keep these as research evidence with their scope:

- mixed FL one-way steering + FR physical linkage was causal for the large left/right asymmetry;
- a coherent symmetric physical front can recover active left/right symmetry, so bilateral linkage itself is not falsified;
- a weakly restoring bilateral graph at product 4 substeps showed severe solver-order sensitivity; reversing only FL/FR constraint construction reversed the runaway direction;
- inherited constant `rackFrictionBase = 40 N` blocked useful return in that physical experiment; this is context-specific evidence, not a universal new value;
- steering-joint angle is not chassis-relative toe/heading;
- apparent scrub centering was contaminated by toe preload and is rejected as a solution;
- with near-neutral actual toe, positive longitudinal mechanical trail through WheelCenter produced plausible speed-dependent return in the provisional physical experiment; no tested trail/caster value is accepted;
- the same physical spatial-link experiment still produced several degrees of bump-steer across representative suspension travel because rack/suspension hardpoints remain provisional.

Therefore no physical-steering experiment is currently promotable. Historical M5/M6 or latest native values may be used only as mechanism-specific evidence/falsifiers after direct revalidation.

## Authority cleanup completed with bridge candidate

Active code/tests/contracts must distinguish source facts from implementation hypotheses:

- canonical runtime names use `SourceRegistered` / `ProvisionalSteering...`; retained `Golden` exports are compatibility aliases only;
- the front semantic contract v3 records #6 as `suspensionSide`, #8/#7-outboard as `steerableMember`, and rack-side #7 as not authored/open;
- legacy R3 visual calibration is explicitly labeled as deferred-rig/historical current-Web mapping, not steering authority;
- S2 tests protect source registration, #6/#8 separation, center, signed motion and independent wheel spin; they do not certify the provisional rack law as owner truth;
- topology-count tests use the declared current topology contract rather than magic historical `29` assertions.

## Current limiting question

The temporary bridge makes active left/right driving coherent enough to continue, but it deliberately removes physical steering feedback. Disposable post-bridge probes show the rack moves less than ~0.2 mm after `RELEASE` at lock while the car keeps turning, which is expected for the bridge and is now the clearest remaining steering/feel limitation.

A physical spatial tie rod cannot be honestly tuned further against the deferred rig. The next bounded research question is therefore whether an energy-consistent **bilateral rack-translation <-> steering-coordinate coupling** can be implemented without guessed spatial mating hardpoints or hidden centering. This is a hypothesis to falsify, not the next architecture.

If that cannot be done cleanly with the pinned Box3D/Web boundary, classify final physical steering as rig-authoring blocked and move R1 product work forward without disguising the limitation.
