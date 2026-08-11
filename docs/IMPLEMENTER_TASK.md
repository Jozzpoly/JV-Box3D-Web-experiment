# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-FL-ROLES — front-left corner landing / kinematic body-role validation**
Mode: **VALIDATION-FIRST / READ-ONLY / NO PRODUCTION PATCH**

This task exists because the accepted FL upper mechanism is now integrated into `main`, while downstream geometry is still visually incoherent. Before changing another mesh/attachment, establish whether the current FL front-corner authored pieces/endpoints are associated with the correct M6 kinematic bodies/shared pivots.

Do not fix geometry in this task. A discovered role/pivot mismatch returns `REPLAN` with exact evidence.

## 0. One technical question

Answer exactly this:

> Does the current integrated FL front-corner visual rig preserve the intended authored **kinematic roles and shared pivots** — chassis-side, lower-arm-side and knuckle-side — through representative real M6 motion, without relying on misleading node names or accidental static coincidence?

This is a body-role / landing gate, not a wishbone-shape, upright packaging, damper, steering-geometry, cardan-mating or dynamics gate.

## 1. Authority and exact product base

The orchestrator will supply the exact current `main` CONTROL TIP carrying this ACTIVE task packet.

The product bytes being validated must descend docs-only from this integrated product checkpoint:

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
integrated product base: 67d66ed412342fee5445b2901d85a663a084bf4e
product tree: f2e1836800719cc9cc7007631568c41e45471450
role: accepted/integrated private product
```

At execution start:

1. verify current `main` equals the orchestrator-supplied CONTROL TIP;
2. prove CONTROL TIP is a docs-only descendant of `67d66ed...` with unchanged product bytes;
3. verify the integrated product tree/source mirror used for execution corresponds exactly to `f2e1836800719cc9cc7007631568c41e45471450` before disposable diagnostics.

### Remote write authority

```text
NONE
```

Do not create a work branch and do not change any remote ref/file.

The old frozen S1 branch is **not needed by default** for S2. Do not preload it or old S1 chats. The accepted FL upper semantics now live on `main`.

## 2. Bootstrap / execution mirror

Read only:

1. current `AGENTS.md`;
2. this current `docs/IMPLEMENTER_TASK.md`.

Then inspect only current files needed to answer the S2 question.

The already verified local integration-candidate mirror may be reused **only if** its full reconstructed Git tree equals:

`f2e1836800719cc9cc7007631568c41e45471450`

The already supplied `box3d.js@0.0.2` dependency packet may be reused in a disposable environment.

Canonical toolchain is preferred:

```text
Node 24.16.0
npm 11.13.0
```

If unavailable, substitute execution may be used but must remain explicitly `supplemental`. Do not spend a long cycle fighting network/toolchain access.

## 3. Current source-role hypotheses to validate

Use the current source asset hierarchy/contract as hypotheses, then independently check them against generated binding semantics and real runtime behavior.

### Chassis-side authored endpoints

```text
Socket_ChassisMount_a
Socket_SingleDamper_Mount
Socket_SingleDamperUpper
Socket_CardanDrive
```

Expected role: chassis-side / world point derived from chassis ownership.

### Lower-arm-side authored endpoint

```text
Socket_SingleDamperLower
```

Expected role: lower-arm-side. Current contract states it is a child of `Chassis_Bottom`; do not silently attach it to the knuckle merely because it is near wheel-side geometry.

### Knuckle-side authored endpoints

```text
Socket_ChassisMount_b
Socket_WheelCenter
Socket_SteeringRod
Socket_CardanHub
```

Expected role: knuckle-side. `Socket_ChassisMount_b` is deliberately named misleadingly; node name is not authority.

### Wishbone visual parts

```text
Chassis_Top
Chassis_Bottom
```

These are spanning wishbone parts, not simple endpoint labels.

`Chassis_Top` / `owner.fl.upper-arm` is already accepted and integrated. Treat it as a protected control, not a new acceptance question.

Do not solve FL lower wishbone geometry in S2. Its detailed inboard/outboard/orientation question belongs to S3 if S2 closes cleanly.

## 4. Shared-joint rule — avoid a false failure

Do **not** require `contract ridesBody == binding partId` mechanically.

At a real joint, the same world-space pivot may be represented in local coordinates of either participating body. Example: a knuckle-side upper-ball reference can be evaluated from the upper-arm local frame if runtime proves it remains exactly/coherently coincident with the shared knuckle joint point.

Validate:

```text
semantic role
+ source hierarchy/provenance
+ current generated endpoint semantics
+ world-space shared-pivot coincidence through motion
```

rather than string equality between labels.

## 5. Required evidence

### A. Exact FL role ledger

Produce one compact table/ledger for every named FL endpoint/part above containing at least:

```text
authored node
source parent/hierarchy evidence
contract role / ridesBody
current generator/calibration provenance
current binding/source kind and participating part IDs
expected kinematic role
observed runtime result
classification: SUPPORTED | CONTRADICTED | AMBIGUOUS
```

Do not promote contract prose to proof if current source/runtime contradicts it.

### B. Source pivots / handed placement

Confirm current source composed transforms/pivots are read consistently and that FL placement/mirroring conventions do not silently invert the intended role/frame.

FR may be inspected only as a cheap handedness/mirror **control** if it helps falsify FL mapping. This does not open FR owner acceptance or authorize FR changes.

### C. Existing interface audit

Run/reuse `buildOwnerM6InterfaceAudit` / its focused test as measurement evidence.

Keep its classification explicit:

`MEASUREMENT_ONLY_NOT_ACCEPTANCE`

Use it to locate discrepancies; do not turn current distances into acceptance thresholds without independent justification.

### D. Real M6 body-role discrimination

Use actual `M6TopologyWorld` / normal visual-frame path.

At minimum observe:

- settled/rest state;
- natural suspension motion sufficient to move lower-arm/knuckle relative to chassis;
- a continuous sequence rather than only two snapshots.

For each role, track the relevant derived authored/generated world point relative to its expected body frame and at least one plausible wrong body frame. The intended ownership/shared-joint relationship should remain invariant/coincident as the bodies move differentially.

A small steering control state is allowed **only as technical discrimination for knuckle-side ownership** if neutral suspension motion does not sufficiently separate knuckle/chassis frames. It is not a steering-geometry gate and must not become an owner question.

Do not hand-edit `VehicleVisualFrame` and call that live evidence.

### E. Protected integrated FL upper

Confirm S2 diagnostics do not reopen or alter:

- accepted FL upper inboard X/Y/Z relation;
- accepted outboard physical upper ball;
- `PART_PAIR_ROLL_PINNED_STRETCH` behavior;
- integrated package identity.

No new FL upper owner gate is required.

## 6. Protected scope

Do not change:

- any product source or test;
- any remote ref;
- FL upper mechanism/calibration;
- FL lower geometry/calibration;
- FR geometry;
- physical hardpoints/physics;
- upright/hub/wheel placement;
- damper/spring geometry;
- steering geometry/tuning;
- cardan mating/calibration;
- mesh proportion/scale;
- stance;
- handling/dynamics/feel;
- native JV;
- public R0/R1.

Disposable local diagnostics are allowed if they do not alter candidate/product bytes.

If the smallest correct next action requires a production change, stop and return `REPLAN` with the exact violated role/pivot and smallest justified repair surface.

## 7. Decision states

### `REVIEW_READY`

Return this when current FL role/pivot mapping is supported strongly enough to close S2 without a production patch:

- exact identity proven;
- role ledger complete;
- source/contract/generator semantics reconciled;
- real M6 differential motion supports the intended body/shared-pivot roles;
- no material contradiction or ambiguity remains for the bounded FL question;
- protected FL upper/product identity unchanged.

No owner gate is expected for a purely technical role-mapping PASS.

### `REPLAN`

Return without patching when any named FL role/pivot is contradicted or materially ambiguous, including:

- an endpoint follows the wrong body through motion;
- a supposed shared joint separates under real motion;
- source hierarchy and current generator semantics encode incompatible roles;
- handed placement/mirroring invalidates the FL role interpretation;
- a fix would require entering a protected subsystem.

State the smallest repair hypothesis, but do not implement it.

### `BLOCKED`

Return if exact integrated source identity or a usable real-M6 execution path cannot be established.

## 8. Owner-facing tooling

Do not implement persistent T1/T3 tooling in S2 merely because the previous owner gate was visually cluttered.

If a disposable isolated view helps technical attribution, use it locally. Preserve the lesson for the next owner-sensitive geometry task: focused masking/fixed projection views are now justified when they reduce ambiguity.

## 9. What this task does not decide

S2 does not decide:

- final FL lower wishbone placement;
- upright/hub/wheel correctness;
- damper endpoints/shape;
- steering rod geometry;
- cardan mating;
- FR acceptance;
- stance;
- dynamics/feel;
- public R1 readiness.

If S2 passes, the orchestrator should use its role ledger to frame S3 wishbone work, likely FL lower first while preserving integrated FL upper.

## 10. Return contract

Return compactly in Polish:

```text
TASK: S2-FL-ROLES — front-left corner landing / kinematic body-role validation
RESULT: REVIEW_READY | REPLAN | BLOCKED

CONTROL TIP:
INTEGRATED PRODUCT BASE: 67d66ed412342fee5445b2901d85a663a084bf4e
INTEGRATED PRODUCT TREE: f2e1836800719cc9cc7007631568c41e45471450
EXECUTION MIRROR / TOOLCHAIN:
PRODUCT BYTES VERIFIED:
REMOTE FILES CHANGED: NONE expected
REMOTE REFS CHANGED: NONE expected

FL ROLE LEDGER:
SOURCE/HIERARCHY RESULT:
HANDEDNESS / PIVOT RESULT:
INTERFACE AUDIT RESULT:
REAL M6 MOTION PATH:
CHASSIS-SIDE ROLE RESULT:
LOWER-ARM-SIDE ROLE RESULT:
KNUCKLE-SIDE ROLE RESULT:
SHARED-JOINT COINCIDENCE RESULT:
STEERING CONTROL USED: NO by default | YES with technical justification
INTEGRATED FL UPPER CONTROL:

CONTRADICTIONS / AMBIGUITIES:
PROTECTED SCOPE CONFIRMED:
WHAT WAS NOT TESTED:
OWNER GATE REQUIRED: NO expected | explain if otherwise
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not create a branch, patch product code, update governance or continue into S3. Return control to the orchestrator.
