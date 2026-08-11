# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S1-INTEGRATE — clean curated FL-upper integration**
Mode: **PRODUCTION PATCH / CURATED INTEGRATION**

This task exists because S1-D static placement and S1-LIVE real suspension articulation are now OWNER ACCEPTED on the exact frozen candidate, but the accepted result still lives outside `main`.

The task is **not** to solve S1 again and is **not** permission to continue S1 into another corner/subsystem.

## 0. One technical objective

Transfer/reproduce the **minimal reviewed FL upper semantics and the mechanism required to support them** from the exact frozen reference onto a fresh current-main descendant, then prove that the integration candidate preserves the accepted static + live result without importing unrelated S1 history.

Success means an orchestrator-reviewable candidate that can be promoted cleanly to `main`.

## 1. Authority and exact identities

### CONTROL TIP / integration parent

The orchestrator will supply the exact current `main` tip that contains this ACTIVE packet and the post-S1-LIVE semantic checkpoint.

At execution start verify:

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
main tip:   EXACT CONTROL TIP supplied by orchestrator
work branch parent: must equal that exact CONTROL TIP
```

Do not infer a control tip from this file's own future commit SHA.

### Work branch — only write authority

```text
branch: work/owner-rig-s1-clean-integration
role:   fresh clean-integration transaction
writes: ALLOWED only here
```

The orchestrator creates this branch from the exact CONTROL TIP. If its parent/tip does not match the supplied handoff state, STOP.

### Frozen reviewed reference — read only

```text
branch: work/owner-rig-s1-attachment-authority
commit: 393ef4600be5c83ef42bced4a8a451446e372c32
tree:   92c896a8b0579a66b3c5381b777baf853a469908
state:  FROZEN / READ-ONLY TECHNICAL REFERENCE
```

Do not write, merge, rebase or force-update this branch.

Do **not** merge frozen S1 and do **not** cherry-pick its commits. Use exact frozen files/diffs only as reviewed technical reference for a curated port.

## 2. Accepted semantics that must survive

The exact accepted FL upper result is:

```text
bindingId:
  owner.fl.upper-arm

INBOARD X:
  midpoint(current physical upperFront + upperRear).x

INBOARD Y/Z:
  S1-C semantic-main-chassis calibration components

FINAL INBOARD:
  constraint-composed visual attachment
  literal chassis-mesh contact claim: NONE

OUTBOARD XYZ:
  existing physical upper ball

BINDING MECHANISM:
  PART_PAIR_ROLL_PINNED_STRETCH
  startPartId = m6.chassis
  endPartId   = m6.fl.upper-arm

STATIC:
  OWNER ACCEPTED FRONT + TOP at current precision

LIVE:
  OWNER ACCEPTED through real neutral M6 extension/compression/rebound/rest
```

The exact frozen implementation is the reviewed technical reference. Port/reproduce its minimal final semantics; do not invent a new mechanism from memory.

## 3. Integration scope

### Primary allowed product files

The expected minimal product surface is:

```text
src/visual/vehicle-visual-package.ts
src/visual/vehicle-visual-transform.ts
tools/owner-vehicle/owner-m6-front-upper-chassis-mate-r3.mjs
tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs
```

Expected focused regression surface:

```text
tests/vehicle-visual-package.test.mjs
tests/vehicle-visual-transform.test.mjs
tests/owner-vehicle-front-upper-semantic-mate-r3.test.mjs
tests/owner-vehicle-full-rig-r3-front-reference.test.mjs
```

The frozen branch also differs in broader interface/whole-car tests. **Do not port those diffs by default.** Change another tracked file only if the clean candidate cannot be made internally correct/testable without it, and report the exact reason.

Historical S1 governance files are never integration input.

### Mechanism scope

Current `main` lacks `PART_PAIR_ROLL_PINNED_STRETCH`; the frozen reviewed result requires it.

Curated integration may therefore add the minimal schema/parser/runtime transform support required for that source kind, using the exact frozen implementation as reference.

Do not generalize/refactor beyond what is required to reproduce the reviewed mechanism safely.

### Calibration/generator scope

Port the exact reviewed FL upper semantic path:

- semantic-main-chassis Y/Z derivation used by S1-C;
- S1-D split-axis X authority from the physical upper hinge-axis midpoint;
- existing physical upper ball as outboard;
- roll-pinned reference-frame data and binding replacement for **FL upper only**;
- provenance/report fields necessary to prove the accepted semantics.

Do not mirror this to FR.

## 4. Explicit protected scope

Do not change or retune:

- frozen branch/history;
- FR upper;
- FL lower arm;
- physical suspension hardpoints or physics;
- upright / hub / wheel geometry or placement;
- dampers / springs;
- steering geometry or acceptance scope;
- cardans;
- stance / ride height;
- wishbone mesh geometry/proportion/scale beyond whatever unchanged scaling behavior is inherent in the reviewed roll-pinned mechanism;
- handling, suspension stability, tire/contact, drivetrain or steering feel;
- native JV;
- public R0/R1;
- unrelated governance/current-state docs.

If a correct integration requires changing one of these, return `REPLAN` rather than broadening the task.

## 5. Execution mirror / environment

Prefer an exact checkout/source mirror of the work-branch parent.

If a direct exact current-main checkout is unavailable, it is acceptable to reconstruct a disposable execution mirror from already available exact source material **only if the resulting full Git tree is independently reconstructed and equals the exact work-branch parent tree before the production patch is applied**.

Do not substitute another JV-Web/JV/Box3D folder.

For canonical automated evidence prefer:

```text
Node: 24.16.0
npm:  11.13.0
```

If unavailable, clearly classify substitute execution as supplemental. The already supplied `box3d.js@0.0.2` dependency packet may be reused in a disposable mirror; do not modify tracked source merely to satisfy the sandbox.

Do not spend a long cycle fighting network/toolchain access. After a small number of direct checks, request the exact missing packet or return `BLOCKED` with the smallest named blocker.

## 6. Required implementation discipline

1. Verify exact CONTROL TIP, work-branch tip/parent and frozen reference before writes.
2. Inspect current-main versions and exact frozen versions of only the expected integration files/tests.
3. Build a **curated diff**; do not replay S1 commits.
4. Every production write goes only to `work/owner-rig-s1-clean-integration`.
5. Verify candidate bytes == tested bytes before claiming tests.
6. Keep commits small enough that the orchestrator can review the actual semantic delta.
7. Stop if the branch moves unexpectedly.

## 7. Required invariants

The clean candidate must prove all of the following.

### Identity / scope

- branch is a clean descendant of exact current-main CONTROL TIP;
- frozen reference remains exactly `393ef460... / 92c896a8...`;
- no merge commit and no cherry-picked S1 history;
- candidate diff contains only files justified by this task.

### FL upper semantics

- `owner.fl.upper-arm` uses `PART_PAIR_ROLL_PINNED_STRETCH`;
- `startPartId = m6.chassis`;
- `endPartId = m6.fl.upper-arm`;
- split-axis inboard authority matches the reviewed frozen semantics;
- no literal contact claim is introduced;
- outboard remains the existing physical upper ball;
- FR binding/source remains unchanged from current-main baseline.

### Product invariants

Unless the curated port reveals a source-level contradiction, preserve:

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
physics: unchanged
```

A changed GLB hash/length is a stop-and-explain condition, not something to normalize silently.

## 8. Required validation

### A. Curated-diff audit

Compare:

1. current-main parent → integration candidate;
2. exact frozen reference → integration candidate for the accepted FL-upper mechanism/calibration surface.

Explain which frozen hunks were intentionally ported and which were intentionally excluded.

### B. Focused static/mechanism regressions

Run at least the smallest relevant tests covering:

- visual package parsing/validation for `PART_PAIR_ROLL_PINNED_STRETCH`;
- generic roll-pinned endpoint/frame transform behavior;
- S1-C/S1-D FL upper semantic/split-axis calibration;
- generated R3 FL upper reference/binding semantics;
- deterministic owner package identity.

Run broader existing checks only where they provide useful regression value; do not modify unrelated tests merely to make the suite green.

### C. Real M6 live regression on the integration candidate

Do **not** rely only on the previous frozen-branch S1-LIVE result.

Run the existing real-M6 owner full-rig runtime path against the **integration candidate**.

Also reuse the disposable S1-LIVE observation method, without committing it, to confirm candidate FL upper behavior through a natural neutral extension/compression/rebound/rest sequence:

- endpoint attachment remains within justified numerical precision;
- roll/frame remains continuous;
- no flip/twist/discontinuity/singularity appears.

The purpose is candidate regression, not a new owner acceptance experiment.

### D. No owner gate by default

Do **not** ask Jozz to re-accept the same geometry/motion if the integration candidate is proven semantically equivalent to the exact reviewed frozen result and no visible output changed.

If exact semantic equivalence cannot be demonstrated, return `REPLAN` rather than silently creating a new owner question.

## 9. Decision states

### `REVIEW_READY`

Return this only when:

- the branch is cleanly based on the supplied CONTROL TIP;
- the curated diff is bounded and justified;
- accepted FL upper semantics are reproduced;
- required focused/static/live candidate validation passes or any supplemental limitation is explicit;
- protected scope is unchanged;
- no new owner decision is required.

### `REPLAN`

Return without broadening the patch if:

- exact accepted semantics cannot be reproduced cleanly on current-main lineage;
- a protected subsystem must change;
- the minimal mechanism requires materially different behavior from the reviewed frozen reference;
- candidate visual/product identity changes in a way that invalidates equivalence.

### `BLOCKED`

Return if exact source identity, required dependency bytes or executable candidate identity cannot be established.

## 10. Return contract

Return compactly in Polish:

```text
TASK: S1-INTEGRATE — clean curated FL-upper integration
RESULT: REVIEW_READY | REPLAN | BLOCKED

CONTROL TIP:
WORK BRANCH:
STARTING WORK TIP/PARENT:
FINAL CANDIDATE TIP:
FINAL CANDIDATE TREE:
FROZEN REFERENCE VERIFIED:

COMMITS CREATED:
FILES CHANGED:
CURATED FROZEN HUNKS PORTED:
FROZEN/UNRELATED HUNKS EXCLUDED:
ADDITIONAL FILES OUTSIDE EXPECTED LIST: NONE | explain

FL UPPER SOURCE SEMANTICS:
SPLIT-AXIS CALIBRATION RESULT:
FR UNCHANGED:
PHYSICS UNCHANGED:
GLB BYTE LENGTH / SHA-256:
REAL BINDING COUNT:

FOCUSED TESTS:
REAL M6 CANDIDATE RUNTIME:
LIVE ENDPOINT RESULT:
LIVE FRAME-CONTINUITY RESULT:
TOOLCHAIN CLASSIFICATION: canonical | supplemental
CANDIDATE BYTES == TESTED BYTES:

PROTECTED SCOPE CONFIRMED:
WHAT WAS NOT TESTED:
OWNER GATE REQUIRED: NO expected | explain if not
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not merge/promote to `main` yourself. Return the exact candidate to the orchestrator for independent review.
