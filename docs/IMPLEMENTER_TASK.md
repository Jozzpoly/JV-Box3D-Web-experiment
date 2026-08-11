# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-AXIS — audit current steering axis against authored source authority**
Mode: **ROOT-CAUSE / OWNER-VALIDATION-FIRST / NO PRODUCT PATCH**

## Why this task changed again

Owner clarified a critical authority mistake in the previous reconstruction.

For this mechanism, the authored source asset is the geometry authority. `OneSided_Steering_Suspension_Rig.gltf` already contains the two nodes intended by the owner to define the exact steering-axis placement:

```text
Axis_SuspensionTravel_Top
Axis_SuspensionTravel_Bottom
```

Direct inspection of the exact integrated GLTF gives local authored translations:

```text
Axis_SuspensionTravel_Top    = [-0.1875, -0.3125,  0.0625]
Axis_SuspensionTravel_Bottom = [-0.1875, -2.3125,  0.0625]
Socket_WheelCenter           = [-0.1875, -1.3125,  0.0625]
```

`Socket_WheelCenter` lies exactly on the Top↔Bottom line and exactly halfway between those markers. After the authored root translation, the line also agrees with the owner's latest hand-drawn green correction.

The previous S2-R reconstruction instead placed the axis using inferred/physical M6 references (`upperBall↔lowerBall`, caster/KPI and an inferred lower point). Owner reports that this class of interpretation has repeatedly reintroduced a visibly wrong steering axis in past iterations.

This is now treated as a **probable recurring root-cause regression pattern**.

## Authority order for this bounded problem

Use this hierarchy deliberately:

1. **OWNER + exact authored source geometry** — authoritative for the intended steering-axis placement and visual mechanism.
2. **Current integrated product code/runtime** — implementation to audit against the authored source.
3. **Native/core JV** — read-only implementation/mechanism reference; useful for topology and engineering patterns, but it does not override the authored axis geometry for this asset.
4. **Project docs / JSON contracts / historical calibration prose** — potentially stale or corrupted in this area. They are evidence only. If they conflict with owner + exact source, they lose.

Do not attempt to reconcile contradictory documentation by averaging or preserving both interpretations.

## Protected owner truth

Treat these as hard constraints unless direct source geometry itself proves an inconsistency:

- yellow and red are separate rigid visual members;
- yellow = suspension-side/non-steering member;
- red = steerable member rotating relative to yellow;
- wheel spin is a separate DOF;
- `Axis_SuspensionTravel_Top` + `Axis_SuspensionTravel_Bottom` define the intended steering-axis placement in the authored source rig;
- `Socket_WheelCenter` lies on that authored axis;
- the previous one-knuckle visual interpretation is rejected;
- the previous displaced blue axis is rejected;
- S1 FL-upper accepted semantics remain protected unless a specific contradiction is demonstrated.

The marker names contain `SuspensionTravel`, but owner intent and their source geometry are the authority for their steering-axis use here. Do not downgrade them because an old contract labels them only as `physics_hint` or `physicsAuthority:false`.

## One bounded question

> Where and why does current JV-Web/native-derived steering geometry deviate from the authored `Axis_SuspensionTravel_Top↔Bottom` axis, and what is the smallest correct future repair that makes the yellow/red steering mechanism and wheel steering motion obey the authored axis without regressing the already accepted suspension work?

This is no longer a question of mapping two equal truths. The authored axis is the target; current physics/visual logic must be audited against it.

## Product / write boundary

```text
JV-Web integrated product base:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Remote/product write authority: **NONE**.

Do not patch product code in this task. First reconstruct the root cause and prepare an owner-verifiable repair design.

## Implementer freedom

Own the technical investigation. Inspect whatever current JV-Web and native/core JV files are genuinely required. Use disposable scripts, local probes, diagrams, rendered comparisons or kinematic prototypes as useful.

Do not spend time re-proving repository identity already established; a light continuity check is enough.

Do not wait for the orchestrator to prescribe exact implementation files or formulas. Find the real path yourself.

## Required investigation

### A. Prove the authored axis exactly

From the exact source GLTF:

- compute the composed/world authored positions of `Axis_SuspensionTravel_Top`, `Axis_SuspensionTravel_Bottom`, `Socket_WheelCenter`, yellow member and red member;
- prove the Top↔Bottom line and WheelCenter relationship numerically;
- show it in the same projections used by the owner;
- treat this as the target geometry, not a hint to be adjusted toward current physics.

### B. Trace every current source of steering-axis geometry

Find all current JV-Web and relevant native-derived paths that can influence:

- upper/lower steering pivots / ball points;
- kingpin direction;
- caster;
- KPI;
- knuckle transform origin;
- wheel-center steering transform;
- steering-link outboard geometry;
- any calibration or hardpoint generation that can move the steering axis.

For each path classify:

```text
SOURCE-DERIVED / AUTHORED-CONSISTENT
HISTORICAL / STALE
PHYSICS-DERIVED BUT SOURCE-CONFLICTING
UNKNOWN
```

The goal is to identify the actual mechanism that repeatedly pulls the axis away from the authored placement.

### C. Quantify current deviation from authored authority

Put the authored Top↔Bottom axis and the current live/product steering axis in one common frame.

Measure separately:

- axis-position offset;
- angular difference;
- WheelCenter distance from each axis;
- which coordinates/DOFs differ;
- whether current caster/KPI or generated physical hardpoints are the direct cause.

Do not preserve caster/KPI values merely because they exist in native/current code. If they conflict with the authored source, classify them as suspect implementation/calibration until proven compatible.

### D. Audit the two-member + wheel kinematics

With authored axis as authority, determine the correct live relationship:

```text
yellow suspension-side member
    -> follows suspension articulation, no steering twist
red steerable member
    -> rotates relative to yellow about authored steering axis
wheel
    -> follows steerable member for steering and retains independent spin
```

Determine whether the current M6 physical topology can express this correctly after hardpoint/transform correction, or whether a deeper physics topology repair is truly required.

Do not add a physics body just to mimic an authored visual split if existing physics can represent the correct DOFs.

### E. Root-cause / anti-regression design

Recommend the smallest future repair and, critically, how to prevent another agent from regenerating the rejected axis later.

The repair design should prefer direct derivation from the authored markers or an explicit persisted transform whose provenance is those markers.

Identify stale docs/contracts/calibrations/tests that would need correction or retirement so they cannot later override the source authority.

Do not implement the repair yet.

## Owner-facing gate

Prepare one concise falsifiable owner board/prototype.

Mandatory:

- actual authored source geometry;
- yellow and red members;
- **authoritative authored Top↔Bottom axis** prominently shown;
- WheelCenter shown on the authored axis;
- current/rejected runtime axis shown separately only as a diagnostic comparison;
- numeric position/angular deviation summarized without clutter;
- orthogonal view confirming the coordinate that owner previously said was already correct.

If a disposable motion prototype is useful, make the red member rotate about the authored axis and show independent wheel spin. Label it `DIAGNOSTIC PROTOTYPE — NOT PRODUCT RUNTIME`.

The owner is validating the authored-axis interpretation and proposed correction, not final steering feel, lower wishbone, cardan, damper or whole-car geometry.

## Decision states

`OWNER_GATE_READY` — authored axis is proven, current regression source is identified strongly enough, and the proposed repair architecture can be visually validated by Jozz.

`REPLAN` — exact source geometry reveals that the current yellow/red decomposition is still materially wrong, or more than one implementation root cause remains plausible and requires discrimination.

`BLOCKED` — an exact current/native artifact required to trace the regression cannot be accessed. Ask early for that exact artifact.

No product patch, work branch, S3 or downstream geometry task is allowed before owner verdict.

## Return

Respond compactly in Polish. Prioritize root cause and proposed repair over process narration:

```text
TASK: S2-AXIS
RESULT: OWNER_GATE_READY | REPLAN | BLOCKED
CONTROL TIP:
PRODUCT BYTES CHANGED: NO
REMOTE WRITES: NONE

AUTHORED AXIS AUTHORITY:
CURRENT AXIS / DEVIATION:
ROOT CAUSE(S):
CASTER/KPI/HARDPOINT VERDICT:
YELLOW/RED/WHEEL KINEMATICS:
STALE/CORRUPTED EVIDENCE FOUND:
SMALLEST FUTURE REPAIR:
ANTI-REGRESSION PLAN:
UNCERTAINTIES / FALSIFIERS:
OWNER MATERIAL:
```

If `OWNER_GATE_READY`, ask only:

> **Czy teraz oś jest zrozumiana poprawnie: `Axis_SuspensionTravel_Top/Bottom` wyznaczają właściwą oś source i proponowana naprawa sprawi, że czerwony człon oraz koło będą skręcały dokładnie wokół niej względem żółtego członu? Jeśli nie, wskaż co nadal jest źle.**
