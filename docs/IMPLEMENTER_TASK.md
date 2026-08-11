# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-R — reconstruct FL two-stage wheel-side steering mechanism**
Mode: **RECONSTRUCTION / OWNER-VALIDATION-FIRST / NO PRODUCT PATCH**

## Why this task exists

The previous S2 owner map is **OWNER REJECTED** in one fundamental point: it collapsed the wheel-side mechanism into one `knuckle/upright-side` member.

Owner correction:

- the knuckle mechanism contains **two separately rigged members**;
- one member is suspension-side / effectively static with respect to steering and is tied to the wishbones;
- a second member is steerable/rotating relative to the first and connects toward the wheel;
- there is a distinct steering rotation axis/DOF between those two members;
- the owner annotated the suspension-side member in **yellow**, the steerable member in **red**, and showed the steering-axis position/center with **blue lines** in two projections;
- native/core JV already implements this conceptual split and is a mandatory read-only technical reference.

Do not proceed to FL lower geometry or any downstream repair until this mechanism is reconstructed and owner-validated.

## One bounded question

> What is the exact two-stage FL wheel-side topology represented by the authored source rig and native JV: which real meshes/nodes belong to the suspension-side carrier, which belong to the steerable carrier, what additional wheel/spin member(s) exist, and what is the exact relative steering axis/joint between them?

The answer must be strong enough for Jozz to visually confirm or correct our understanding **before product implementation**.

## Authority / protected truth

Product base remains:

```text
JV-Web integrated product:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

Native reference:
Jozzpoly/Box3d_FunProject
READ ONLY — resolve the relevant current ref/content independently
```

Remote/product write authority: **NONE**.

Hard owner truth to preserve:

1. the previous single wheel-side `knuckle/upright` interpretation is false;
2. suspension-side carrier and steerable carrier are distinct and must be rigged separately;
3. their relative steering DOF/axis is real and must be reconstructed;
4. steering rotation and wheel spin are separate mechanical DOFs — do not conflate them;
5. S1 FL upper static+live acceptance remains protected unless this investigation directly falsifies a specific S1 assumption.

Do **not** assume yet that JV-Web needs exactly two new physics bodies. Determine whether the required repair is visual topology, physics topology, or both.

## Implementer freedom

Choose the investigation method yourself. Inspect whatever current files in JV-Web and core JV are genuinely needed. Use disposable scripts, renders, diagrams or local prototypes when useful.

Do not repeat a full repository reconstruction if continuity from the already verified product mirror is intact; a light identity check is enough. Do not spend time proving process facts already proven unless a contradiction appears.

The owner screenshots supplied with this task are evidence, not pixel-perfect world-coordinate measurements.

## Required result

### Native JV topology extraction

Resolve and cite the exact native ref/SHA and source files/classes actually implementing the relevant front wheel-side mechanism. Explain the real bodies/members/joints and how native JV separates suspension articulation, steering rotation and wheel spin. If native JV uses more than the owner's two knuckle members, report the full topology rather than forcing it into a two-body simplification.

### Authored source decomposition

On the actual `OneSided_Steering_Suspension_Rig` geometry, classify the real meshes/nodes into suspension-side carrier, steerable carrier, wheel/spin-side member if separate, wishbones/spanning parts, and unknown/ambiguous. Prove membership from geometry/hierarchy/pivots and cross-check it with native JV. Node names alone are not authority.

The old S2 role ledger may be reused only where it does not depend on the rejected one-knuckle assumption.

### Steering axis reconstruction

Derive the actual 3D steering axis / relative joint between suspension-side and steerable members from the strongest available evidence. Do not assume it is globally vertical because one owner projection looked vertical. Show its projection in the same useful planes as the owner's blue annotations and explain whether/how it matches them.

### Current JV-Web mismatch and repair design

Identify precisely where current Web semantics/topology collapse or mis-rig the two members. Reclassify the affected old S2 nodes/bindings (`Socket_ChassisMount_b`, `Socket_WheelCenter`, `Socket_SteeringRod`, `Socket_CardanHub`, inferred lower outboard and any others) under the reconstructed topology.

Then recommend the **smallest correct future production repair surface**, including whether physics topology must change or only visual/binding topology. Do not implement it in this task.

Known evidence to preserve but not confuse with this gate:

- authored steering socket vs current physical steering arm mismatch ~0.222 m;
- interface-audit cardan endpoint path is stale relative to R3;
- previous real-M6 lower-ball shared-joint residual peaked around 6.263 mm;
- lower outboard `#12` in the rejected owner map was inferred, not an authored named socket.

### Owner-facing semantic gate

Prepare a clean visual reconstruction for Jozz, not a persuasive demo.

Mandatory:

- actual authored source geometry;
- **yellow** = suspension-side carrier corresponding to the owner's yellow annotation;
- **red** = steerable/rotating carrier corresponding to the owner's red annotation;
- wheel and unrelated geometry ghosted when needed;
- steering axis clearly drawn in at least the two projections needed to compare with the owner's blue lines;
- ambiguous/inferred pieces visibly marked as uncertain rather than silently assigned.

Strongly useful if it clarifies the model: a short disposable kinematic prototype showing the red member rotating relative to the yellow member about the reconstructed axis. Label it **DIAGNOSTIC PROTOTYPE**, not product evidence.

Do not ask the owner to validate final lower-arm, steering, cardan, hub/wheel placement or handling in this gate.

## Decision states

`OWNER_GATE_READY` — exact source/core topology reconciled, current Web mismatch understood, and clear owner material prepared.

`REPLAN` — owner/source/core evidence materially conflict or more than one plausible topology remains; return the competing interpretations and the discriminating evidence needed.

`BLOCKED` — exact authored/native evidence needed to reconstruct the mechanism cannot be accessed. Ask early for the exact missing file/artifact instead of attempting long workarounds.

No `PASS` or production implementation is allowed before owner verdict.

## Return

Return compactly in Polish. Prioritize discoveries over process narration:

```text
TASK: S2-R
RESULT: OWNER_GATE_READY | REPLAN | BLOCKED
CONTROL TIP:
PRODUCT BYTES CHANGED: NO
REMOTE WRITES: NONE

NATIVE JV TOPOLOGY:
AUTHORED SOURCE DECOMPOSITION:
STEERING AXIS / JOINT:
CURRENT WEB MISMATCH:
SMALLEST FUTURE REPAIR SURFACE:
UNCERTAINTIES / FALSIFIERS:
OWNER MATERIAL:
```

If `OWNER_GATE_READY`, finish with one question:

> **Czy teraz poprawnie rozumiemy ten mechanizm: żółta część jest członem związanym z wahaczami/zawieszeniem, czerwona jest osobnym członem skrętnym połączonym dalej z kołem, a pokazana oś jest ich osią względnego obrotu? Jeśli nie, wskaż co nadal interpretujemy źle.**

Do not patch product, create a work branch, or continue into implementation/S3.
