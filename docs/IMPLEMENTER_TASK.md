# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-AXIS — reconcile authored steering-axis markers with live M6 kingpin**
Mode: **RECONSTRUCTION / OWNER-VALIDATION-FIRST / NO PRODUCT PATCH**

## Why this task changed

The previous S2-R reconstruction recovered the important two-stage wheel-side split:

- suspension-side member (owner yellow / authored `Socket_ChassisMount_b` region);
- separate steerable member (owner red / authored `Socket_WheelCenter` region);
- wheel spin remains a separate DOF.

Owner review says this reconstruction is now **close**, but the steering-axis placement shown in the owner material is wrong in one projection.

The missing authored evidence is critical: `OneSided_Steering_Suspension_Rig.gltf` already contains two required marker nodes:

```text
Axis_SuspensionTravel_Top
Axis_SuspensionTravel_Bottom
```

Direct inspection of the exact integrated source GLTF gives local authored translations:

```text
Axis_SuspensionTravel_Top    = [-0.1875, -0.3125,  0.0625]
Axis_SuspensionTravel_Bottom = [-0.1875, -2.3125,  0.0625]
Socket_WheelCenter           = [-0.1875, -1.3125,  0.0625]
```

After the source root translation, the axis markers lie at authored X about `-1.1875`, matching the owner's latest hand-drawn green correction. `Socket_WheelCenter` lies exactly on the Top↔Bottom line and exactly halfway between them.

The current asset contract also explicitly lists these two markers as required `suspensionTravel` axis hints. Its old role naming / `physicsAuthority:false` classification must be treated as historical contract evidence, not as a reason to ignore direct owner correction or authored geometry.

## One bounded question

> What is the correct relationship between the authored Top↔Bottom axis in `OneSided_Steering_Suspension_Rig` and the live physical M6 kingpin, and how should that relationship define the steering pivot/frame for the yellow suspension-side member versus the red steerable member?

Do **not** reduce this to “shift the previous blue line until it looks right”. Determine the actual mapping of the two coordinate truths.

## Authority / protected truth

Product remains unchanged:

```text
JV-Web integrated product:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Remote/product write authority: **NONE**.

Hard owner truth for this task:

1. the wheel-side mechanism has separate suspension-side and steerable members;
2. the previous one-knuckle visual interpretation is rejected;
3. `Axis_SuspensionTravel_Top` + `Axis_SuspensionTravel_Bottom` are intentional authored markers that set the exact placement/reference of the axis in the source rig;
4. the owner's latest green line is consistent with those authored markers and falsifies the previous source-board blue-axis placement;
5. steering rotation and wheel spin remain separate DOFs;
6. S1 FL upper acceptance remains protected.

Important unresolved distinction:

- authored marker line may define source registration/rest-axis geometry;
- physical M6 upperBall↔lowerBall kingpin defines live physics steering geometry with caster/KPI;
- whether the final visual transform maps the authored axis onto the physical kingpin, uses one only for origin/registration, or requires another relationship is **for you to determine from evidence**.

Do not assume the raw authored `+Y` direction must equal the final physical 3D kingpin direction, and do not assume the physical kingpin alone is sufficient to place the authored visual member.

## Implementer freedom

Own the technical investigation. Inspect any current JV-Web/native JV files genuinely needed, and use disposable scripts, diagrams or local kinematic prototypes as useful.

Do not redo full repository archaeology or identity reconstruction if continuity is intact. A light CONTROL TIP / product-byte check is enough.

Native/core JV remains a mandatory READ-ONLY reference, but it is not allowed to overwrite direct owner-authored source semantics merely because the physics model uses different coordinates.

## Required evidence

Return enough evidence to resolve these points:

### A. Exact authored axis

- parse the exact composed transforms of `Axis_SuspensionTravel_Top`, `Axis_SuspensionTravel_Bottom`, `Socket_WheelCenter`, yellow #6 and red #8 from the source GLTF;
- prove geometrically what Top↔Bottom defines;
- explicitly reconcile the source node names with the owner's intended steering-axis meaning;
- explain why the previous S2-R source axis was displaced.

### B. Authored axis ↔ physical kingpin mapping

Compare the authored Top↔Bottom line against the native/current M6 physical kingpin (`upperBall↔lowerBall`) in a common, clearly defined frame.

Determine separately:

```text
axis origin / lateral-longitudinal registration
axis direction / caster-KPI orientation
member-local pivot frame
```

Do not conflate them.

If authored markers should be transported/mapped onto the live physical kingpin, derive that transform cleanly. If not, explain the alternative and falsifier.

### C. Two-member kinematics

Using the corrected axis interpretation, confirm or revise the current yellow/red decomposition:

- yellow member must follow suspension articulation but not inherit steering twist;
- red member must steer relative to yellow;
- wheel spin remains independent.

Reclassify only what the new axis evidence actually changes. Do not reopen unrelated S2 findings without cause.

### D. Future repair architecture

Recommend the smallest correct future product repair, but **do not implement it**.

State clearly whether the evidence supports:

- visual/binding-only repair on the existing M6 physics graph;
- physics topology change;
- or a still-unresolved choice.

Prefer the smallest architecture that preserves native M6 physics truth and authored visual truth simultaneously.

## Owner-facing gate

Prepare a corrected, uncluttered comparison using the actual authored source geometry.

Mandatory views:

1. authored source projection corresponding to the owner's latest green-line feedback;
2. the orthogonal view where the owner already considered the center placement correct;
3. corrected diagnostic prototype only if it materially clarifies relative yellow↔red rotation.

Show distinctly:

- **authored Top↔Bottom axis**;
- previous rejected axis if useful for comparison;
- proposed mapped/live steering axis if it differs from the raw authored line;
- yellow and red members.

Do not visually collapse multiple different axes into one blue line without labeling what each represents.

## Decision states

`OWNER_GATE_READY` — authored markers, physical kingpin and their mapping are reconciled strongly enough for one focused owner verdict.

`REPLAN` — evidence shows the previous yellow/red interpretation or assumed mapping is materially wrong, or multiple plausible mappings remain.

`BLOCKED` — exact source/native evidence required for the reconciliation is inaccessible. Ask early for the exact missing artifact.

No product implementation, work branch, S3 or downstream geometry work is allowed in this task.

## Return

Respond compactly in Polish and prioritize the technical discovery over process narration:

```text
TASK: S2-AXIS
RESULT: OWNER_GATE_READY | REPLAN | BLOCKED
CONTROL TIP:
PRODUCT BYTES CHANGED: NO
REMOTE WRITES: NONE

AUTHORED TOP/BOTTOM AXIS:
WHY PREVIOUS AXIS WAS WRONG:
PHYSICAL M6 KINGPIN:
AUTHORED↔PHYSICAL MAPPING:
YELLOW/RED KINEMATIC RESULT:
SMALLEST FUTURE REPAIR ARCHITECTURE:
UNCERTAINTIES / FALSIFIERS:
OWNER MATERIAL:
```

If `OWNER_GATE_READY`, ask only:

> **Czy teraz poprawnie rozumiemy położenie i rolę osi: authored `Axis_SuspensionTravel_Top/Bottom` wyznaczają właściwe zakotwiczenie osi w modelu, a pokazane mapowanie na live M6 daje poprawny ruch czerwonego członu względem żółtego? Jeśli nie, wskaż proszę dokładnie co nadal jest źle.**
