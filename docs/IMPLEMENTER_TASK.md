# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-PORT — rebuild FL front corner from the owner-accepted golden/source contract**
Mode: **PRODUCTION REBUILD / FRESH IMPLEMENTER / OWNER-GATED**

## 0. Fresh-context rule

This task is intentionally designed for a **new implementer conversation**.

Do not import the previous implementer chat as authority. It contained a long-lived, now-rejected hierarchy where stale contracts / receipts / derived M6 hardpoints repeatedly overrode the mechanism that was supposed to be copied.

Bootstrap from current Git only:

1. current `AGENTS.md`;
2. current `AI_PROJECT_MEMORY.md`;
3. current `docs/OWNER_CHECKPOINTS.md`;
4. this file.

Then inspect only the exact source/native/Web files required to execute the rebuild.

Old chats, old S2 reports and historical docs may be used only as archaeology if a specific question requires them.

## 1. Authority order

For this transaction:

1. **direct owner acceptance + exact authored source asset**;
2. **exact working native/core JV behavior where it agrees with owner/source**;
3. candidate runtime evidence;
4. current JV-Web implementation as a repair target;
5. docs / JSON contracts / factory receipts / historical calibration/tests as secondary evidence only.

If a secondary artifact contradicts owner/source/golden working behavior, correct or retire the secondary artifact. Do not average the interpretations.

## 2. Exact references

Integrated private product checkpoint carrying accepted S1:

```text
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

The orchestrator will supply the exact current docs-only CONTROL TIP and work-branch tip for this transaction.

Golden native reference:

```text
Jozzpoly/Box3d_FunProject
959aefb78587ce60cf2b8eb03ff82797a4165142
READ ONLY
```

Working native front-corner visual behavior is stronger evidence than generic native hardpoint/config helpers when those layers disagree.

## 3. Owner-accepted golden FL contract

Treat this as the required behavior to implement:

```text
#6 Socket_ChassisMount_b
= suspension-side / non-steering structural member
= follows suspension / wishbone articulation
= must NOT inherit steering rotation

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

and WheelCenter lies exactly on the authored marker line and at its midpoint.

### Steering-axis constraint

The **steering center / axis position is protected owner truth**.

The rebuilt steering axis must pass through the accepted source-derived WheelCenter steering center. Do not reintroduce the old displaced kingpin created from generic `kingpinOffset/caster/KPI` authority.

However, the final runtime axis direction is **not required to stay perfectly vertical**. A modest physically justified tilt/caster/KPI-like direction is allowed if it improves correct wheel behavior, provided:

- the line still passes through the accepted steering center;
- the tilt is introduced about that center rather than translating the whole axis;
- its provenance and effect are explicit;
- it is shown in the final owner gate.

Do not hardcode old `5° caster / 7° KPI / 140 mm kingpinOffset` merely because those values exist. Reuse a direction only if it is technically justified after the center is corrected.

## 4. Protected S1 truth

The integrated FL upper mechanism is owner accepted:

- chassis-side inboard semantics from S1;
- `PART_PAIR_ROLL_PINNED_STRETCH` mechanism;
- static FRONT+TOP acceptance;
- real neutral live articulation acceptance.

Preserve those semantics unless the golden rebuild exposes a direct contradiction.

If rebuilding the correct physical wheel-side mechanism legitimately moves the upper wheel-side joint, do **not** preserve a stale physical coordinate simply to keep an old hardpoint. Re-derive the endpoint, run focused S1 static/live regression, and include any visible change in the owner material.

## 5. One objective

> Build one clean FL front-corner candidate that copies the accepted source/golden mechanism instead of repairing the existing collapsed R2/R3 model piece by piece.

The candidate must demonstrate the correct ordering of DOFs in real runtime:

```text
suspension articulation
-> #6 and #8 travel with the corner

steering
-> #8 rotates relative to #6 about the accepted steering center

wheel spin
-> wheel spins independently after structural steering
```

This is a rebuild of the front-left mechanism, not another documentation audit.

## 6. Implementer freedom

Own the technical design and implementation.

You may change the minimum coherent FL front-corner surface required by evidence, including:

- source-derived role/axis contract;
- visual/binding topology;
- front steering-axis / hardpoint generation;
- runtime/reference transforms;
- stale R2/R3 calibration paths;
- focused tests and owner diagnostics;
- the minimum necessary physics/reference logic if visual-only repair cannot express the golden behavior.

Do **not** add a dedicated carrier physics body merely because the authored model has two visual members. Working native M6 already demonstrates that existing live frames may be sufficient. Add/change physical topology only if real evidence requires it.

Prefer a clean source-derived mechanism over another layer of corrective offsets/shears on top of the stale pipeline.

## 7. Required implementation properties

The final candidate must make these facts executable and testable:

### Roles

- #6 and #8 cannot resolve to the same steering frame;
- #6 remains non-steering through steering motion;
- #8 follows the steering frame;
- wheel steering follows #8;
- wheel spin changes the wheel without rolling #8.

### Axis position

- source marker geometry is read directly from the exact asset;
- accepted steering center is derived from the source marker/WheelCenter relationship;
- live steering axis passes through that center within justified numerical tolerance;
- no hidden ~140 mm lateral/longitudinal displaced kingpin can reappear from receipt defaults.

### Axis direction

- vertical source direction is an allowed baseline, not a mandatory final physics direction;
- any non-zero tilt is explicit, justified and pivoted about the accepted center;
- no tilt may silently translate the axis.

### Native parity

- preserve the working native semantic split: non-steering arm/carrier-side frame vs steering knuckle frame;
- use real rack semantics where relevant rather than stale visual calibration if the working native path provides a clearer correct reference;
- wheel spin remains a separate body/DOF.

## 8. Stale authority cleanup

The repair is incomplete if the old regression machinery remains able to reassert itself silently.

Audit and correct/retire the minimum stale artifacts necessary so future agents/tests cannot re-create the rejected model, including where applicable:

- stale `one_sided_steering_suspension.asset.json` role semantics;
- R2/R3 grouping of #6 + #8 as knuckle pieces;
- R3 use of authored Top↔Bottom only as a direction while discarding line position;
- tests that require the old ~142 mm so-called authored kingpin offset or only certify mapping to generated hardpoints;
- docs/comments that present generic receipt hardpoints as source-rig authority.

Do not perform broad unrelated documentation cleanup.

## 9. Scope boundary

This transaction is **FL front corner only**.

Do not:

- mirror to FR;
- polish the entire lower wishbone beyond what the correct mechanism requires;
- solve final damper/cardans/stance;
- tune handling/steering feel;
- modify public R0;
- modify native JV;
- start a broad native/WASM parity program.

If the smallest correct FL rebuild requires a wider product change than this boundary, return `REPLAN` before widening scope.

## 10. Validation

Use the strongest practical environment available. Canonical pinned toolchain is preferred; substitute execution must be labelled supplemental.

At minimum validate:

1. exact candidate lineage and changed-file audit;
2. source role/axis invariants;
3. negative test: #6 and #8 cannot share the steering frame;
4. suspension-only motion: #6/#8 move coherently without steering twist;
5. steering-only / steering-dominant motion: #8 changes orientation relative to #6 around the accepted center;
6. wheel-spin discrimination: wheel rolls while #8 does not;
7. live steering-axis center residual;
8. real `M6TopologyWorld` path, not hand-edited `VehicleVisualFrame`;
9. focused S1 upper regression if any relevant hardpoint/reference changes;
10. candidate bytes == tested bytes.

Do not turn current Web self-consistency into the acceptance oracle. Tests must challenge the candidate against owner/source/golden semantics.

## 11. Owner-facing gate — mandatory

Do not promote to `main` without Jozz's visual verdict.

Prepare one concise, uncluttered real-runtime owner package showing FL only as needed:

- suspension articulation with steering neutral;
- steering motion clearly showing #8 rotating relative to #6;
- wheel spin separately attributable;
- accepted steering center/axis overlay;
- any chosen axis tilt visible in at least two useful projections;
- accepted FL upper present as context/control but not buried in line clutter.

Prefer fixed views and ghost/hide irrelevant geometry.

The owner question should ask whether the rebuilt FL mechanism now behaves correctly, especially the #6/#8 split and steering about the accepted center. Do not ask for whole-car acceptance.

## 12. Write authority

The orchestrator will provide one dedicated work branch created from the exact current CONTROL TIP.

Writes are allowed only on that branch.

Do not update `main`, frozen S1 refs, native JV or public repo.

Keep commits attributable and reasonably bounded. A clean redesign may replace stale front-corner machinery; do not preserve obsolete layers merely to minimize line count.

## 13. Return states

### `OWNER_GATE_READY`

A coherent candidate exists, focused technical validation passes, candidate bytes are fixed, and owner material is ready.

### `REPLAN`

The accepted contract cannot be implemented coherently inside the FL boundary, or new evidence falsifies an owner-protected assumption.

### `BLOCKED`

An exact artifact/dependency required for implementation or real runtime cannot be accessed. Ask early for the specific missing item rather than spending a long cycle on low-probability workarounds.

## 14. Return contract

Return compactly in Polish:

```text
TASK: S2-PORT — FL golden front-corner rebuild
RESULT: OWNER_GATE_READY | REPLAN | BLOCKED

CONTROL TIP:
WORK BRANCH / START TIP:
FINAL CANDIDATE TIP / TREE:
NATIVE GOLDEN REF:
PRODUCT FILES CHANGED:
STALE AUTHORITY FILES CORRECTED/RETIRED:

IMPLEMENTED MECHANISM:
#6 NON-STEERING RESULT:
#8 STEERING RESULT:
STEERING CENTER RESULT:
AXIS DIRECTION / TILT RESULT:
WHEEL-SPIN RESULT:
STEERING-LINK RESULT:
S1 CONTROL RESULT:
REAL M6 RUNTIME RESULT:
TEST SUMMARY:
CANDIDATE BYTES == TESTED BYTES:

KNOWN UNKNOWNS / DEFERRED:
PROTECTED SCOPE CONFIRMED:
OWNER MATERIAL:
OWNER GATE REQUIRED: YES
```

Do not continue into FR or downstream S3 after returning. The orchestrator reviews the exact candidate and Jozz decides the visual gate.
