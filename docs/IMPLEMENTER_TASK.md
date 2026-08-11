# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-PORT — rebuild FL front corner from the owner-accepted golden/source contract**
Mode: **PRODUCTION REBUILD / FRESH IMPLEMENTER / OWNER-GATED**

## 0. Fresh-context bootstrap

This task is intentionally designed for a **new implementer conversation**.

Do **not** import, reconstruct or summarize the previous implementer chat as authority. That conversation contained long-lived stale assumptions from corrupted/mis-scoped contracts, receipts and derived M6 hardpoints. Its durable valid conclusions have already been compacted into current Git.

Under `AGENTS.md` §5, this task **explicitly authorizes** the following fresh bootstrap set and no broader documentation preload:

1. current `AGENTS.md`;
2. current `AI_PROJECT_MEMORY.md`;
3. current `docs/OWNER_CHECKPOINTS.md`;
4. this current `docs/IMPLEMENTER_TASK.md`.

`AI_PROJECT_MEMORY.md` and `OWNER_CHECKPOINTS.md` are intentionally authorized exceptions to the bounded-implementer default because this is a context reset after an authority-corruption discovery.

Do not read `PROJECT_STATE`, campaign/history docs, old task packets or old chats unless a concrete technical question later requires them.

## 1. Authority order

For this transaction:

1. **direct owner acceptance + exact authored source asset**;
2. **exact working native/core JV behavior where it agrees with owner/source**;
3. candidate runtime evidence;
4. current JV-Web implementation as a repair target;
5. docs / JSON contracts / factory receipts / historical calibration/tests as secondary evidence only.

If a secondary artifact contradicts owner/source/golden working behavior, correct or retire the secondary artifact. Do not average the interpretations.

The old copied steering-suspension JSON contract is known to contain stale semantics and is **not bootstrap authority**.

## 2. Exact transaction references

The orchestrator supplies the exact current CONTROL TIP and work-branch STARTING TIP in the opening message. They must be equal at handoff and independently verified before writes.

Write authority:

```text
work/front-corner-golden-rebuild-r2
```

Create **no additional remote branch**. `docs/BRANCH_ROLES.md` contains the current cleanup/budget situation if branch lifecycle itself becomes relevant, but do not preload it otherwise.

Accepted/integrated private product checkpoint carrying S1:

```text
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Golden native reference:

```text
repository: Jozzpoly/Box3d_FunProject
commit: 959aefb78587ce60cf2b8eb03ff82797a4165142
tree: 3e2cfe05bed1bf64bda644e0337d82ad14eedfc7
mode: READ ONLY
```

## 3. High-value starting files — not an exhaustive prescription

Use these as efficient entry points, then own the investigation/implementation yourself.

### Exact authored source

JV-Web target copy:

```text
assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf
```

Golden native source:

```text
assets/source/OneSided_Steering_Suspension_Rig.gltf
blob at golden native ref: 06d5c66f6d13fb64863ab15a660f060358872291
```

### Golden native working behavior

Primary starting point:

```text
samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp
blob: 606e289fd17213a9b241a0dd504e35d35994568b
```

Useful semantic cross-check:

```text
samples/jozz_vehicle_m9_steering_rig_bench.cpp
blob: 51fb91e45b0165c9b52c9f848dd60aa9fe27234c
```

Generic native geometry / physics layers are **secondary where they conflict with owner/source/golden working behavior**:

```text
samples/jozz_vehicle_m6_geometry.cpp
blob: 33dd14dace49decaa78362d0c2e27b9d99641b33

samples/jozz_vehicle_m6_suspension_rig.cpp
blob: a414ed155063211e2a3772b3879a1ad4f19c885b
```

Known stale historical contract evidence — inspect only when tracing/removing regression:

```text
assets/contracts/one_sided_steering_suspension.asset.json
blob: 49f88f034ae4d8570b2d1b2df571522716838642
```

Do not assume these are the only files required. They exist to prevent pointless archaeology, not to constrain your design freedom.

## 4. Owner-accepted golden FL contract

Implement this behavior:

```text
#6 Socket_ChassisMount_b
= suspension-side / non-steering structural member
= follows suspension / wishbone articulation
= must NOT inherit relative steering rotation

#8 Socket_WheelCenter
= separate steerable structural member
= steers relative to #6
= must NOT wheel-spin

wheel
= follows the steerable member for steering
= has a separate wheel-spin DOF

#7 Socket_SteeringRod outboard
= follows the steerable member
```

The exact authored source contains:

```text
Axis_SuspensionTravel_Top
Axis_SuspensionTravel_Bottom
Socket_WheelCenter
```

and `Socket_WheelCenter` lies exactly on the authored marker line and exactly at its midpoint.

### Steering-center constraint

The **steering center / axis position is owner accepted and protected**.

The rebuilt steering axis must pass through the accepted source-derived WheelCenter steering center. Do not reintroduce the old displaced kingpin produced by treating generic `kingpinOffset/caster/KPI` receipt values as geometry authority.

### Axis-direction freedom

The final runtime axis does **not** have to remain perfectly vertical.

A modest technically justified tilt/caster/KPI-like direction is allowed when it improves physically sensible wheel behavior, provided:

- the line still passes through the accepted steering center;
- tilt is introduced **about that center**, not by translating the entire axis;
- provenance and kinematic effect are explicit;
- final owner evidence shows the actual line in at least two useful projections.

Do not hardcode the old `5° caster / 7° KPI / 140 mm kingpinOffset` merely because they exist in native/config history. Reuse a direction only if independently justified after the center is corrected.

## 5. Protected S1 truth

The integrated FL-upper mechanism is owner accepted:

- accepted chassis-side inboard semantics;
- `PART_PAIR_ROLL_PINNED_STRETCH` mechanism;
- static FRONT + TOP acceptance;
- real neutral suspension live-articulation acceptance.

Preserve those semantics unless the golden rebuild exposes a direct contradiction.

If a correct wheel-side/physical rebuild legitimately moves the upper wheel-side joint, do **not** preserve a stale coordinate only to keep an old hardpoint. Re-derive the endpoint, rerun focused S1 static/live regression and show any owner-visible change in the final gate.

## 6. One objective

> Rebuild the front-left corner so current JV-Web expresses the owner-accepted authored/golden mechanism directly and coherently, rather than layering another calibration on top of the collapsed R2/R3 model.

This is a **production rebuild**, not another parity audit and not a cosmetic axis correction.

Prefer the simplest architecture that makes the accepted mechanism executable and hard to regress.

## 7. Implementer freedom

Own the technical solution.

You may, within this bounded FL transaction:

- change visual/binding topology;
- replace or retire stale source-role contracts;
- change source-derived steering-axis/reference logic;
- change the minimum physical steering-axis/hardpoint logic genuinely required for correct runtime behavior;
- replace R2/R3 calibration stages that encode the rejected model;
- update/remove tests that lock stale assumptions and add parity/kinematic tests that challenge the real mechanism;
- use disposable scripts, probes, source extraction and focused renders.

Do not preserve current architecture merely because it exists.

Equally, do not invent an extra physics body merely to mirror an authored visual split if the existing native/Web body graph can express the correct DOFs. The working native M6 path is strong evidence that existing bodies/frames may suffice.

## 8. Required candidate behavior

### Rest / source registration

- #6 and #8 are separate rigid roles even where geometry coincides/overlaps in rest;
- accepted steering center is preserved;
- source-derived provenance is explicit;
- no old ~140 mm displaced-axis authority silently survives.

### Suspension articulation

With steering neutral:

- #6 and #8 follow the corner/suspension coherently;
- there is no unintended relative steering between them;
- accepted FL upper remains coherent.

### Steering

- #8 rotates relative to #6;
- #6 does not inherit steering rotation;
- rotation line passes through the accepted steering center;
- any chosen tilt is technically justified and rotates about that center;
- wheel follows #8 steering orientation.

### Wheel spin

- wheel spin is independent of structural steering;
- #8 does not wheel-spin;
- suspension-side #6 does not wheel-spin.

### Steering link

- outboard follows the steerable member;
- inboard uses the actual rack/reference appropriate to the golden mechanism;
- do not knowingly preserve the prior ~0.222 m authored/current steering-arm mismatch as a success condition.

### Physics / visual parity

Do not declare success if visuals rotate about the accepted center while actual physics still rotates the wheel/knuckle about a materially displaced line, unless you can prove the apparent discrepancy is only representational and the real wheel kinematics are correct.

## 9. Known stale/regression locks to hunt and remove or reclassify

Do not mechanically preserve tests/constants that encode any of the following rejected assumptions:

- `Socket_ChassisMount_b` and `Socket_WheelCenter` both resolve to the same steering frame;
- authored Top↔Bottom axis position is reduced to a direction vector only;
- `authoredKingpinOffset ≈ 0.1421875 m` or receipt `0.14 m` is mandatory source truth;
- zero error to the old generated M6 upper/lower ball target is considered proof of correct authored parity;
- R3 affine/shear calibration is allowed to deform source geometry until generic hardpoints win.

Replace self-consistency locks with source/golden parity and real-DOF invariants.

## 10. Protected scope

Primary repair scope: **front-left owner-vehicle corner**.

FR may be read as a comparison/control but is not owner-accepted by this transaction and should not be broadly rewritten unless a shared implementation primitive must be changed. If a shared primitive necessarily affects FR, report the exact blast radius and keep owner acceptance FL-only.

Still out unless a direct dependency forces `REPLAN`:

- rear corners;
- dampers/springs as a new geometry campaign;
- cardan mating campaign;
- stance;
- handling/stability/steering feel tuning;
- native repo writes;
- public repo/R1 publication.

## 11. Write safety

Before the first remote write verify:

```text
main == orchestrator-supplied CONTROL TIP
work/front-corner-golden-rebuild-r2 == orchestrator-supplied STARTING TIP
```

All production writes go only to `work/front-corner-golden-rebuild-r2`.

Do not create another branch, do not force-update refs, do not modify native/core JV, and do not promote to `main`.

If the branch or `main` moved unexpectedly, stop and return `REPLAN` before writing.

## 12. Execution artifacts / dependencies

A fresh chat does not inherit the previous implementer's local runtime environment.

Use Git/current source as authority. If exact local execution cannot be established after a few direct checks, return `BLOCKED` early and name the exact artifact needed rather than spending a long cycle on network/toolchain workarounds.

Known likely runtime dependency if local `node_modules` is absent:

```text
box3d.js@0.0.2
```

A user-supplied whole-package packet may be used as execution support; dependency bytes do not become geometry authority.

Any owner-evidence handoff pack supplied by the orchestrator is **visual/context evidence only**. Git/source + current owner checkpoint remain authoritative.

## 13. Required validation

Choose the exact focused test set yourself, but the final candidate must demonstrate at least:

1. compile/type correctness for changed surfaces;
2. source/golden role/axis invariants;
3. real candidate runtime through representative suspension motion;
4. real candidate steering showing relative #8 vs #6 rotation about the accepted center;
5. independent wheel spin;
6. focused S1 static/live regression if any S1-dependent physical/reference input changed;
7. candidate bytes tested == candidate bytes returned;
8. no unrelated subsystem drift.

Do not use an old green test as evidence if the test encodes the rejected model.

## 14. Owner gate

Do not promote to `main`.

When technically ready, prepare focused owner material from the **actual candidate runtime**, not only a schematic/prototype.

At minimum show separately:

- suspension articulation with #6 and #8 identifiable;
- steering with #6 visually stable against steering and #8 rotating relative to it;
- the actual steering axis/center in at least two useful projections, including any chosen tilt;
- independent wheel spin;
- FL upper as a protected control if its wheel-side endpoint/reference changed.

Reduce wheel/chassis clutter if it blocks attribution.

Owner question must be narrow: does this candidate now implement the accepted front-left mechanism correctly? Do not ask for whole-car handling/stance acceptance.

## 15. Return states

### `OWNER_GATE_READY`
A production candidate exists on the work branch, technical/runtime evidence is coherent, and owner material is ready. No main promotion.

### `REVIEW_READY`
Candidate exists and is technically reviewable, but owner gate is not yet justified; explain exactly what remains.

### `REPLAN`
The smallest correct repair requires a materially different scope/topology or accepted owner/source contract is contradicted by direct evidence. Stop before broadening.

### `BLOCKED`
Exact execution/source/dependency needed for the bounded task is unavailable. Ask early for the exact artifact.

## 16. Return contract

Respond in Polish and prioritize implemented behavior/evidence over process narration:

```text
TASK: S2-PORT
RESULT: OWNER_GATE_READY | REVIEW_READY | REPLAN | BLOCKED

CONTROL TIP:
WORK BRANCH START:
FINAL CANDIDATE TIP:
FINAL CANDIDATE TREE:
COMMITS CREATED:
FILES CHANGED:

GOLDEN/SOURCE CONTRACT IMPLEMENTED:
STEERING CENTER RESULT:
AXIS DIRECTION / TILT RESULT:
#6 NON-STEERING RESULT:
#8 RELATIVE STEERING RESULT:
WHEEL-SPIN RESULT:
STEERING-LINK RESULT:
SUSPENSION/LIVE RESULT:
S1 REGRESSION RESULT:
STALE REGRESSION LOCKS REMOVED/CORRECTED:
TESTS / TOOLCHAIN:
CANDIDATE BYTES == TESTED BYTES:
PROTECTED SCOPE CONFIRMED:
UNCERTAINTIES / FALSIFIERS:
OWNER MATERIAL:
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not continue into FR/downstream vehicle work after returning this transaction.
