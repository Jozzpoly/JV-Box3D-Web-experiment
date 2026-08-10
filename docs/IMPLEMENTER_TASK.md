# JV Web — active implementer task

Updated: 2026-08-10
Task: **S1-A — front chassis-to-wishbone attachment authority**
Status: **READY FOR IMPLEMENTER**

Work branch:

```text
work/owner-rig-s1-attachment-authority
```

The orchestrator handoff message supplies the exact expected starting SHA. Before any write, resolve the branch tip and stop on mismatch.

## 1. Objective

Answer one bounded question:

> Why does the current front wishbone/suspension package sit too far from the rendered chassis, and what is the smallest justified correction for one chassis-side wishbone attachment relationship?

Discriminate among:

```text
A. current physical hardpoint is not the correct visual attachment authority
B. current physical hardpoint is reasonable but visual mapping/calibration is wrong
C. authored/source placement or local pivot/reference is wrong
D. mixed cause
```

A product patch is allowed only after the cause is discriminated sufficiently. `NO_PATCH_JUSTIFIED` is a valid result.

## 2. Owner-visible starting truth

Current V0 artifact is reproducible but not visually accepted. Jozz observes suspension/wishbones too far from the frame. Do not reinterpret older R4 visual observations as current authority.

Representative measurement-only V0 evidence already established:

```text
front upper hinge authored->current ~0.216 m
front lower hinge authored->current ~0.155 m
```

Several current chassis-side targets also sit materially farther from the rendered chassis surface than authored whole-rig placement. These measurements are clues, not acceptance thresholds.

## 3. Required bootstrap / context limit

Read only:

1. `AGENTS.md`
2. this file
3. `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md`
4. `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md` sections 3-7 only as needed for E0-E4/S1 meaning
5. current source/tests directly required by this task

Start technical inspection with:

- `tools/owner-vehicle/owner-m6-interface-audit.mjs`
- `tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs`
- the R3/R2 owner-rig calibration/generator path directly called by that file
- `assets/owner-vehicle/contracts/one_sided_steering_suspension.asset.json`
- `public/receipts/jv_m6_factory_receipt.json`
- focused owner-vehicle static/reference tests that currently protect front suspension placement

Native JV is read-only evidence. If useful, locate the current file implementing `SetupSteeringRig` / `DrawSteeringRig` and inspect only that implementation plus directly required helpers. Do not perform broad native archaeology.

Do **not** preload `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, archived branches or old chat history.

## 4. Technical freedom

You may independently choose the best method to discriminate the cause. You may add focused measurement/tests/diagnostics when they materially improve the answer.

You are encouraged to compare:

- actual rendered chassis geometry/surface;
- current Web M6 physical hardpoints;
- authored suspension placement/reference points;
- current R3 calibration transforms;
- relevant native placement intent.

Do not assume any one of these is automatically authoritative.

If the evidence supports a visual/calibration correction without changing physical suspension authority, implement the smallest coherent correction and its focused evidence.

If the evidence indicates the physical hardpoint/topology itself must change, **stop before changing runtime physics** and return `NO_PATCH_JUSTIFIED` or `BLOCKED` with the evidence and exact proposed next question. Physical suspension correction requires a new orchestrator task.

## 5. Allowed change surface

Allowed when justified by this S1-A question:

- owner-vehicle measurement/calibration/generator code directly responsible for the selected front chassis-to-wishbone visual relationship;
- focused tests for that relationship;
- narrowly scoped debug/measurement tooling required to distinguish the cause.

A deterministic left/right mirror of the same proven visual rule is allowed only when evidence shows the relationship is genuinely symmetric and doing so does not broaden into another mechanism.

## 6. Protected scope — do not change

Do not change in this task:

- `src/vehicle/m6/m6-runtime-builder.ts` or physical suspension topology/hardpoints;
- wheel center / `Socket_WheelMount` contract;
- upright/knuckle steering-pivot correction;
- dampers/springs;
- steering rods;
- cardans;
- ride height / stance / track width;
- handling, steering feel, tires or drivetrain;
- camera/UI/world/scan;
- source asset bytes unless the evidence demonstrates that the source asset itself is malformed — in that case stop and report before editing it;
- native JV;
- public repo / `release/r0`;
- unrelated cleanup/refactoring/documentation.

Do not integrate or write `main`.

## 7. Required evidence before REVIEW_READY

At minimum provide:

1. exact branch/base/candidate identity;
2. a clear explanation of which authority/mapping caused the visible offset, including uncertainty if mixed;
3. before/after measurements for the selected interface if a patch is made;
4. focused source/test evidence showing only intended bindings/mechanisms changed;
5. deterministic owner-rig generation identity or explicit explanation if the artifact identity is expected to change;
6. relevant focused tests run and their environment classification;
7. confirmation that protected mechanisms were not modified.

Do not define a new hard acceptance threshold from the current bad geometry merely because the generator produces it.

## 8. Decision / stop conditions

Return `NO_PATCH_JUSTIFIED` instead of forcing a patch if:

- physical hardpoint authority appears to be the root problem;
- source asset semantics are ambiguous enough that owner/authoring input is genuinely required;
- native and Web evidence conflict in a way that changes the task definition;
- the smallest correction would necessarily alter upright/damper/cardan/stance/physics simultaneously.

Return `BLOCKED` with the smallest exact missing file/environment/input if execution cannot proceed. Do not spend a long time on brittle access workarounds.

## 9. Owner candidate boundary

Do not decide OWNER ACCEPTED yourself.

If you produce a technically reviewable visual correction, the orchestrator will decide whether to prepare/approve an owner candidate.

The eventual owner question for this task should remain essentially:

> Does this selected front chassis-side wishbone attachment now appear to originate from / mate with the correct place on the chassis, without judging dampers, cardans, steering, stance or handling?

## 10. Return contract

When finished, return:

```text
TASK: S1-A
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
BASE SHA:
CANDIDATE SHA:
FILES CHANGED:
ROOT CAUSE / CURRENT BEST DISCRIMINATION:
WHAT CHANGED AND WHY:
EVIDENCE / TESTS RUN:
KEY BEFORE/AFTER MEASUREMENTS:
ASSUMPTIONS / UNKNOWNS:
PROTECTED SCOPE CONFIRMATION:
WHAT WAS NOT TESTED:
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not plan S2 or later recovery stages. Finish this question and return control to the orchestrator.
