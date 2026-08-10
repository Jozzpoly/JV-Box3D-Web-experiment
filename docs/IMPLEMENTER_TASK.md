# JV Web — active implementer task

Updated: 2026-08-10
Task: **S1-D — FL upper longitudinal-axis authority correction**
Status: **READY**

Work branch:

```text
work/owner-rig-s1-attachment-authority
```

Expected starting SHA:

```text
56ce515d95766616b3f723e8195732292adba430
```

Verify the remote branch before any write. If it is not exactly this SHA, STOP and report the mismatch.

## 1. Purpose

S1-C is **OWNER REJECTED as a complete static 3D placement**, but it produced useful partial evidence:

- front view: FL upper chassis-side height/lateral projection looks approximately plausible;
- top view: FL upper has clearly wrong longitudinal yaw/rotation;
- owner explicitly prefers leaving the current stretched mesh/length alone for now unless correct rigging later proves geometry must change.

S1-D must isolate the top-view failure and correct **only longitudinal attachment authority** if the evidence supports it.

Do not reopen the whole chassis mate, roll-pinned transform, mesh scale, live motion, or other suspension parts.

## 2. Current causal diagnosis to verify, not blindly assume

Current exact rest data for FL:

```text
S1-C start:
  [1.0785810947418215, -0.2828125, -0.21965118050575239]

physical upper hinge center:
  [1.2342520405653337, -0.27889727457341834, -0.5478987790374772]

physical upper ball:
  [1.2342520405653337, -0.37000000000000005, -0.8878987790374773]
```

The current physical M6 geometry therefore gives:

```text
upper hinge center X == upper ball X
```

while S1-C changed the chassis-side start X to `1.078581...`, creating about `0.155671 m` of longitudinal start→outboard mismatch.

This matches the owner-observed top-view error direction: the S1-C red arm is strongly diagonal in plan view while the desired yellow relationship is approximately transverse.

The orchestrator's current hypothesis is therefore:

> S1-C incorrectly allowed an unrestricted 3D nearest-surface solve to take authority over longitudinal X. The upper wishbone should use a split authority model: longitudinal placement from the live/physical upper hinge-axis center, while the S1-C front-projection candidate supplies only the provisional lateral/vertical relationship.

This is a **hypothesis to verify from current source geometry**, not a numeric patch instruction.

## 3. Required technical question

Answer exactly this:

> Can FL upper preserve the current S1-C Y/Z chassis-side projection while deriving only longitudinal X from the physical upper hinge-axis center, thereby removing the top-view yaw error without changing S1-B transform semantics, protected outboard, mesh geometry, or any other subsystem?

A likely rest candidate, if the hypothesis is correct, is approximately:

```text
[physicalUpperHinge.x, S1C.y, S1C.z]
≈ [1.2342520406, -0.2828125, -0.2196511805]
```

Do **not** hardcode these numbers as authority. Derive each component from its declared source.

## 4. Authority model to test

Prefer an explicit report/provenance model such as:

```text
LONGITUDINAL X:
  physical upper hinge-axis center / midpoint of the physical upper front+rear hinge axis

VERTICAL Y + LATERAL Z:
  current S1-C semantic chassis-mate candidate, preserved exactly for this experiment

OUTBOARD XYZ:
  existing protected physical upper ball

ORIENTATION MECHANISM:
  existing S1-B PART_PAIR_ROLL_PINNED_STRETCH, unchanged
```

Verify that the physical hinge-axis midpoint is the correct current kinematic longitudinal reference; do not simply copy `upperHinge[0]` without checking its relation to `upperFront`, `upperRear`, and upper ball.

S1-D does **not** promote the full physical upper hinge to visual authority. It tests only its longitudinal component.

## 5. Important interpretation of S1-C

Do not preserve the claim that the final visual start itself lies on `group5` after an X-only correction. If X is replaced, the resulting hybrid point may no longer lie on the selected S1-C triangle.

Therefore:

- retain S1-C nearest-`group5` result as provenance for the provisional Y/Z evidence;
- report the final S1-D point honestly as a **constraint-composed / split-authority visual attachment**, not as a literal nearest point on `group5`;
- keep unrestricted `Diferential_F` nearest evidence diagnostic-only;
- do not invent a new claim of physical contact with a mesh unless independently proven.

## 6. Bootstrap / context firewall

The existing implementer conversation may continue.

Before coding:

1. verify remote SHA exactly;
2. reread `AGENTS.md` and this file;
3. inspect only source/tests directly needed for S1-D.

Do not use `personal_context`, project memory, old chats as evidence, archived branches, broad native archaeology, or historical handoffs.

No new execution ZIP is required **if your existing local S1-C workspace is byte-identical to candidate `56ce515d...` for every file you will execute/test**. Verify this. If you no longer have an exact executable S1-C workspace, stop early and ask Jozz for the smallest required exact source snapshot instead of attempting clone/DNS/gh workarounds.

## 7. Allowed change surface

Prefer changes limited to:

- `tools/owner-vehicle/owner-m6-front-upper-chassis-mate-r3.mjs` or a comparably narrow S1-D calibration helper;
- R3 generator/report plumbing only as necessary to consume the split-authority point;
- focused S1-C/S1-D tests.

Do not change `src/visual/vehicle-visual-transform.ts` or the `PART_PAIR_ROLL_PINNED_STRETCH` schema/algorithm unless you discover evidence that the transform itself causes the **static top-view** error. If that happens, STOP/REPLAN instead of silently broadening S1-D.

## 8. Protected scope

Do not change:

- runtime suspension physics, hardpoints, bodies, joints or topology;
- physical upper ball/outboard;
- FL lower arm;
- FR upper arm baseline;
- upright/knuckle/hub;
- dampers/springs;
- steering rods;
- cardans;
- stance/ride height/track;
- handling/tire/drivetrain;
- chassis placement;
- source GLB/GLTF bytes;
- upper-arm mesh geometry/scale as a separate cleanup;
- native JV;
- public R0;
- `main`.

## 9. Required S1-D evidence

Before `REVIEW_READY`, prove at minimum:

1. candidate is exactly one bounded descendant of the declared base;
2. the physical upper hinge-axis midpoint/source of longitudinal authority is explicitly derived and reported;
3. S1-C Y and Z are preserved exactly unless evidence forces `NO_PATCH_JUSTIFIED`;
4. only start X changes relative to S1-C for `owner.fl.upper-arm`;
5. candidate start X matches the selected longitudinal authority by derivation, not hardcoded pixels;
6. protected physical outboard remains exact;
7. rest top-plan longitudinal residual start→upper-ball is reported before/after;
8. FR and every other binding remain baseline;
9. `PART_PAIR_ROLL_PINNED_STRETCH` implementation/schema remains byte-unchanged;
10. generated GLB bytes/hash remain unchanged unless the task must stop/replan;
11. focused tests run on exact candidate bytes where environment permits;
12. final GitHub candidate bytes match locally tested bytes.

Do not convert owner annotations into pixel-to-meter calibration.

## 10. Decision conditions

Return `NO_PATCH_JUSTIFIED` or `BLOCKED` instead of broadening if:

- the top-view error cannot be isolated to longitudinal start authority;
- preserving S1-C Y/Z while correcting X produces a contradiction with current source/kinematic geometry;
- the error is actually caused by shared roll-pinned transform semantics;
- correct static placement requires changing mesh geometry, physical hardpoints, outboard, lower arm, or another protected subsystem;
- the local workspace cannot be proven to represent the declared base.

## 11. Owner gate boundary

Do **not** evaluate live motion in S1-D.

The orchestrator's eventual owner gate is static and deliberately two-view:

- **top view:** is FL upper now oriented approximately like the owner's yellow plan-view relationship rather than the S1-C red diagonal?
- **front view:** did the approximately plausible S1-C height/lateral projection stay effectively unchanged?

The stretched/lengthened mesh is explicitly not the acceptance target in this task.

## 12. Return contract

```text
TASK: S1-D
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
BASE SHA:
CANDIDATE SHA:
FILES CHANGED:
ROOT CAUSE / DISCRIMINATION:
AXIS-AUTHORITY RULE:
WHAT CHANGED AND WHY:
S1-C Y/Z PRESERVATION:
LONGITUDINAL BEFORE/AFTER MEASUREMENTS:
PROTECTED OUTBOARD CHECK:
GENERATED BINDING / ARTIFACT DELTA:
TESTS RUN:
LOCAL EXECUTION SOURCE / ENVIRONMENT:
CANDIDATE-BYTES == TESTED-BYTES CHECK:
PROTECTED SCOPE CONFIRMATION:
ASSUMPTIONS / UNKNOWNS:
WHAT WAS NOT TESTED:
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not open live-motion validation, FR mirror, lower wishbone, or later stages. Return control after S1-D.
