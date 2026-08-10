# JV Web — active implementer task

Updated: 2026-08-10
Task: **S1-B — front upper wishbone roll-pinned two-end visual pilot**
Status: **READY AFTER ORCHESTRATOR HANDOFF + SOURCE ZIP**

Work branch:

```text
work/owner-rig-s1-attachment-authority
```

The orchestrator handoff supplies the exact expected starting SHA. Verify the remote branch before any write.

## EXECUTION MODE

```text
SOURCE_ZIP_REQUIRED
```

Before broad technical work, confirm that Jozz attached a GitHub **Download ZIP of this exact work branch after the orchestrator declared the task ready**.

The remote GitHub SHA is source/write identity. The ZIP is only the local execution/read mirror and contains no `.git` identity.

If the ZIP is missing, stop immediately after remote SHA verification and ask Jozz for it. Do not attempt private clone/`gh`/DNS/archive workarounds.

## 1. Objective

Create the smallest technically sound **visual-only pilot** answering this question:

> Can the front upper wishbone visually span a chassis-side authored attachment and the existing physical outboard/ball endpoint while keeping a deterministic, believable roll/orientation through live motion — without changing suspension physics or existing `PART_PAIR_STRETCH` semantics?

The purpose is to obtain a candidate that can later answer one owner-visible question about the upper wishbone chassis attachment. Do not fix the rest of the suspension.

## 2. Accepted S1-A input evidence

Treat these as current starting evidence, not owner acceptance:

- R3 intentionally maps the authored front upper wishbone chassis endpoint to the physical M6 upper hinge; the ~0.216 m authored-to-current difference is therefore policy/calibration, not a random transform failure.
- Current measurement puts the authored whole-rig upper endpoint materially closer to rendered chassis geometry than the current physical hinge. This supports it as a **pilot visual attachment candidate**, not a final accepted threshold.
- Current physical upper ball/outboard endpoint has not been independently disproven and remains protected in S1-B.
- Existing Web `PART_PAIR_STRETCH` derives orientation from endpoint direction via shortest-arc and does not observe body roll about an unchanged pair axis.
- Current native read-only evidence uses `JozzVehicleComputeArmPlacement()` / `DrawPartBetween()` and explicitly pins roll with a full frame because minimal shortest-arc produced unequal mirrored twisting.

Do **not** infer from `physicsAuthority:false` that a physical point is visually wrong. That flag only limits authored asset authority over physics.

## 3. S1-A diagnostic commit in the branch

The starting branch contains S1-A diagnostic commit `6bc5d6334075a4e044b51593964605fe9058009d` plus the orchestrator's later task/control commit.

One S1-A assertion pins the current bad ~0.216 m discrepancy. **That assertion is diagnostic, not a durable acceptance gate.** Before `REVIEW_READY`, remove or rewrite any test that would make future correction fail merely because the known-bad discrepancy changed.

The roll-limitation probe is conceptually useful, but you may relocate/rewrite it into a more appropriate focused transform test if the S1-B implementation makes that clearer.

## 4. Required bootstrap / context limit

Read only:

1. `AGENTS.md`
2. this file
3. source/tests directly required by S1-B

Do **not** preload the orchestration protocol unless this task is ambiguous.

Start technical inspection with the smallest useful set around:

- `src/visual/vehicle-visual-transform.ts`
- current visual binding/schema/types directly required by that transform
- `tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs`
- R3 generator code that emits the selected front upper wishbone binding
- focused transform/owner-rig tests protecting those paths
- T0 audit only as measurement evidence, not acceptance truth

Allowed native read-only evidence is limited to the current implementations of:

- `samples/jozz_vehicle_visual_mesh_draw.cpp` (`JozzVehicleComputeArmPlacement` / `DrawPartBetween`)
- `samples/jozz_vehicle_m6_rig_lab_steering_visual.cpp` only where needed to understand front wishbone endpoint/body-role intent

Do not perform broad native archaeology.

Do not use `personal_context`, chat/history recovery, project memory, archived branches or File Library history.

## 5. Technical freedom

You may choose the smallest sound visual architecture.

An **additive** new visual transform/binding capability is allowed if necessary to express a roll-pinned two-end relationship. Existing `PART_PAIR_STRETCH` behavior must remain unchanged for all existing consumers.

You do not have to copy native implementation literally. Native provides evidence about required semantics, not mandatory source code.

A valid solution must distinguish:

- authored local pair axis / authored orientation;
- live endpoint direction;
- a deterministic roll/up reference so mirrored/front motion does not twist arbitrarily;
- exact mapping of the two selected visual endpoints.

Do not solve orientation by a neutral-frame hardcoded quaternion that only looks correct at rest unless you can prove it remains coherent through representative live arm motion.

## 6. Pilot scope

Prefer the **front-left upper wishbone** as the owner-visible pilot when practical, leaving the opposite side as baseline comparison.

A deterministic FL/FR mirror of the same rule is allowed only if the implementation architecture would otherwise require a one-off hack and focused evidence proves the mirror behavior. Do not expand to lower arms or rear.

Selected pilot intent:

```text
visual chassis-side endpoint:
  authored whole-rig front-upper chassis endpoint candidate

visual outboard endpoint:
  existing current physical upper ball/outboard endpoint

physics:
  unchanged
```

The authored chassis endpoint is still a hypothesis to be owner-validated; do not convert its current coordinates into a permanent acceptance threshold.

## 7. Allowed change surface

Allowed only as required for S1-B:

- additive visual transform/binding schema/runtime support needed for the roll-pinned two-end relationship;
- R3 owner-vehicle calibration/generator path for the selected front upper wishbone pilot;
- focused tests for the new semantics/pilot;
- removal/rewrite of temporary S1-A diagnostic assertions that would freeze known-bad geometry.

Keep changes causal and small.

## 8. Protected scope

Do not change:

- `src/vehicle/m6/m6-runtime-builder.ts` or any physical hardpoint/body/joint/topology;
- current physical upper ball/outboard target unless new independent evidence forces a stop/replan;
- wheel center / `Socket_WheelMount` contract;
- lower wishbone;
- upright/knuckle/hub;
- dampers/springs;
- steering rods;
- cardans;
- stance / ride height / track width;
- handling, steering feel, tire/contact or drivetrain;
- chassis/body placement;
- source asset bytes;
- native JV;
- public repo/R0;
- camera/UI/world/scan;
- unrelated cleanup/refactoring.

Do not write `main`.

## 9. Required evidence before REVIEW_READY

At minimum:

1. exact base/candidate identity and ancestry;
2. full changed-file list;
3. proof existing `PART_PAIR_STRETCH` semantics/consumers are unchanged;
4. focused transform tests showing both selected endpoints map exactly;
5. focused orientation evidence showing roll is deterministic under representative endpoint directions/motion and does not produce mirrored asymmetric twist;
6. blast-radius evidence showing only intended upper-wishbone pilot binding(s) changed in generated owner rig;
7. generated package/binding identity and explicit statement of which artifact bytes changed or stayed identical;
8. typecheck/focused tests against the exact candidate bytes when the environment permits;
9. confirmation all protected scope remained untouched.

If exact Node 24.16.0/npm 11.13.0 or pinned dependencies are unavailable in the implementer environment, use available supplemental execution only if useful and label it correctly. Do not spend long repairing the environment. The orchestrator can perform/prepare the canonical owner gate after source review.

Before claiming any local test for the candidate, verify final changed files fetched from GitHub match the locally tested contents.

## 10. Stop / decision conditions

Return `NO_PATCH_JUSTIFIED` or `BLOCKED` rather than broadening if:

- a sound roll-pinned visual mapping requires physical hardpoint/topology changes;
- the outboard endpoint itself becomes materially disputed;
- correct orientation requires changing existing `PART_PAIR_STRETCH` behavior for other consumers rather than an isolated/additive path;
- solving the upper arm necessarily opens lower arm/upright/damper/stance at the same time;
- source semantics are too ambiguous to produce a reversible owner pilot.

## 11. Eventual owner question

Do not classify it yourself. The orchestrator decides OWNER_READY.

The eventual question should remain approximately:

> Looking only at the selected front upper wishbone: does its chassis-side end now appear to originate/mate with the correct place on the frame, and does the arm itself keep a natural orientation as the suspension moves? Ignore lower arm, damper, upright, cardan, stance and handling.

## 12. Return contract

```text
TASK: S1-B
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
BASE SHA:
CANDIDATE SHA:
FILES CHANGED:
ROOT CAUSE / DESIGN DECISION:
WHAT CHANGED AND WHY:
EXISTING PART_PAIR_STRETCH COMPATIBILITY:
EVIDENCE / TESTS RUN:
LOCAL EXECUTION SOURCE / ENVIRONMENT:
CANDIDATE-BYTES == TESTED-BYTES CHECK:
KEY ENDPOINT / ORIENTATION MEASUREMENTS:
GENERATED BINDING / ARTIFACT DELTA:
ASSUMPTIONS / UNKNOWNS:
PROTECTED SCOPE CONFIRMATION:
WHAT WAS NOT TESTED:
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not plan S1-C/S2 or later stages. Return control after this pilot question.
