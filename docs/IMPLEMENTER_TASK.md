# JV Web — active implementer task

Updated: 2026-08-10
Task: **S1-D — FL upper longitudinal-axis authority correction**
Status: **RECOVERY READY**

Work branch:

```text
work/owner-rig-s1-attachment-authority
```

## 0. Identity model — do not self-reference this document

This task packet intentionally does **not** contain its own expected branch-tip SHA. Any commit that edits this file would make such a value stale by construction.

Use two separate identities:

- **CONTROL TIP** — exact current work-branch SHA supplied by the orchestrator in the handoff message. Verify the remote branch equals that SHA before any write.
- **EXECUTABLE PRODUCT BASE** — the last product/source candidate on which S1-D starts:

```text
56ce515d95766616b3f723e8195732292adba430
```

Docs-only control commits may exist above that product base. They do not change executable source. The handoff CONTROL TIP is the write base.

If the remote branch differs from the handoff CONTROL TIP, STOP.

## 1. Recovery state

A previous S1-D attempt reached a locally tested candidate but the execution workspace disappeared before exact candidate bytes could be committed. No remote candidate was created and the work branch remained untouched by that attempt.

That attempt produced useful **provisional evidence**, but its lost file bytes are not authority and must not be reconstructed from transcript text or memory.

The recovery implementation must:

1. start from an exact execution snapshot supplied for the current CONTROL TIP;
2. independently re-derive the S1-D rule from current source;
3. reapply the smallest justified patch;
4. rerun focused gates;
5. prove candidate GitHub bytes equal tested local bytes before moving the branch.

Do not reopen broad investigation unless current source contradicts the provisional diagnosis.

## 2. Owner evidence and bounded purpose

S1-C is **OWNER REJECTED as a complete static 3D placement**, but it gave useful partial evidence:

- front view: FL upper chassis-side height/lateral projection is approximately plausible;
- top view: FL upper has clearly wrong longitudinal yaw;
- owner wants the visibly stretched mesh/length left alone for now unless correct rigging later proves geometry must change.

S1-D must isolate and correct only the longitudinal attachment authority if current geometry supports it.

Do not reopen the whole chassis mate, roll-pinned transform, mesh scale, live motion or other suspension parts.

## 3. Current diagnosis to verify, not blindly assume

Current rest data:

```text
S1-C start:
  [1.0785810947418215, -0.2828125, -0.21965118050575239]

physical upper hinge center:
  [1.2342520405653337, -0.27889727457341834, -0.5478987790374772]

physical upper ball:
  [1.2342520405653337, -0.37000000000000005, -0.8878987790374773]
```

Provisional evidence from the interrupted attempt indicated:

```text
upperFront.x = 1.4742520405653337
upperRear.x  = 0.9942520405653337
midpoint.x   = 1.2342520405653337
upperHinge.x = 1.2342520405653337
upperBall.x  = 1.2342520405653337
```

Therefore S1-C appears to have introduced about `0.155671 m` of longitudinal start→outboard mismatch by letting unrestricted 3D nearest-on-group5 replace X as well as Y/Z.

Verify all of this again from the supplied exact source. Do not treat the numbers above as patch constants.

## 4. Required technical question

Answer exactly this:

> Can FL upper preserve the current S1-C Y/Z chassis-side projection while deriving only longitudinal X from the physical upper hinge-axis midpoint, thereby removing the top-view yaw error without changing S1-B transform semantics, protected outboard, mesh geometry or any other subsystem?

If supported, use explicit split authority:

```text
LONGITUDINAL X
  <- midpoint of current physical upperFront + upperRear hinge-axis geometry

VERTICAL Y + LATERAL Z
  <- exact S1-C semantic chassis-mate candidate, preserved for this experiment

OUTBOARD XYZ
  <- existing protected physical upper ball

ORIENTATION MECHANISM
  <- existing PART_PAIR_ROLL_PINNED_STRETCH unchanged
```

Do not promote the full physical upper hinge to visual authority. S1-D tests only its longitudinal component.

## 5. Honest provenance

After replacing X, the final S1-D visual start may no longer lie literally on the S1-C `group5` triangle.

Therefore:

- preserve the raw S1-C nearest-`group5` result and triangle provenance as **Y/Z evidence**;
- report the final S1-D start as a **constraint-composed / split-authority visual attachment**;
- keep unrestricted `Diferential_F` nearest evidence diagnostic-only;
- do not claim literal mesh contact unless independently proven.

## 6. Context + execution firewall

Before coding:

1. verify remote branch equals the handoff CONTROL TIP;
2. use the attached exact execution snapshot for that tip;
3. reread `AGENTS.md` and this file from that snapshot;
4. inspect only source/tests directly required by S1-D.

Do not use `personal_context`, project memory, old chats, archived branches, broad native archaeology or historical handoffs as evidence.

If the execution snapshot is missing or cannot be verified, stop immediately and ask for it. Do not spend time on clone/DNS/`gh` workarounds.

## 7. Allowed change surface

Prefer changes limited to:

- `tools/owner-vehicle/owner-m6-front-upper-chassis-mate-r3.mjs` or an equivalently narrow calibration helper;
- `tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs` only as needed to consume/report split authority;
- focused S1-C/S1-D tests;
- an existing focused R3 reference test only if its report semantics must be renamed honestly.

Do not change `src/visual/vehicle-visual-transform.ts` or the `PART_PAIR_ROLL_PINNED_STRETCH` schema/algorithm unless current evidence shows the transform itself causes the static top-view error. If so, STOP/REPLAN instead of broadening S1-D.

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
- upper-arm mesh geometry/scale;
- native JV;
- public R0;
- `main`.

## 9. Required evidence before REVIEW_READY

Prove at minimum:

1. candidate is one bounded descendant of the handoff CONTROL TIP;
2. upperFront/upperRear and their midpoint are independently derived from current source geometry;
3. selected longitudinal X follows that midpoint by derivation, not a hardcoded value;
4. S1-C Y and Z are preserved exactly;
5. only start X changes relative to S1-C for `owner.fl.upper-arm`;
6. protected physical outboard is exact;
7. rest top-plan longitudinal residual start→upper-ball is reported before/after;
8. FR and every other binding remain baseline;
9. `PART_PAIR_ROLL_PINNED_STRETCH` implementation/schema are byte-unchanged;
10. generated GLB bytes/hash remain unchanged unless the task must stop/replan;
11. focused tests run on the exact local candidate where environment permits;
12. final GitHub candidate blobs are byte-identical to the tested local candidate before ref update.

Do not convert owner screenshot pixels into meters.

## 10. Decision conditions

Return `NO_PATCH_JUSTIFIED` or `BLOCKED` instead of broadening if:

- the top-view error cannot be isolated to longitudinal start authority;
- preserving S1-C Y/Z while correcting X contradicts current source/kinematic geometry;
- the real fault is shared roll-pinned transform semantics;
- correct static placement requires mesh geometry, physical hardpoints, outboard, lower arm or another protected subsystem;
- exact execution/candidate bytes cannot be proven.

## 11. Owner gate boundary

Do **not** evaluate live motion in S1-D.

The orchestrator owner gate is static and two-view:

- **top:** did FL upper move from the rejected red diagonal toward the owner's approximately transverse yellow relationship?
- **front:** did the provisionally acceptable S1-C height/lateral projection remain effectively unchanged?

Mesh stretching is explicitly not the acceptance target here.

## 12. Return contract

```text
TASK: S1-D
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
CONTROL TIP / BASE SHA:
EXECUTABLE PRODUCT BASE:
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

Do not open live-motion validation, FR mirror, lower wishbone or later stages. Return control after S1-D.
