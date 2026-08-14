# JV Web — owner vehicle recovery campaign

Updated: 2026-08-13
Status: **DURABLE CAMPAIGN CONTRACT — CURRENT STATE LIVES ELSEWHERE**

This document defines the long-horizon method and dependency structure for owner-vehicle recovery. It is deliberately **not current-state authority**.

For live project truth use, in order:

1. current Git/source/runtime;
2. `docs/PROJECT_STATE.md`;
3. `docs/OWNER_CHECKPOINTS.md`;
4. current `docs/IMPLEMENTER_TASK.md` for the active transaction.

Do not infer the active stage, branch, acceptance state or next operation from historical wording in this campaign document.

## 1. Product goal

Make JV-Web increasingly feel like a real browser expression of Jozz's own game: mechanically readable, worth launching/driving/tuning, and eventually suitable as a polished friend demo.

The current recovery lane repairs the owner vehicle one attributable interface/mechanism at a time.

Deferred until visual/mechanical closure:

- handling and suspension-stability tuning;
- steering feel/rate tuning;
- tire/contact tuning;
- drivetrain redesign;
- unrelated camera/UI polish;
- public R1 publication.

Native/core JV is read-only mechanism evidence. Historical M5/M6 or later native rigs are not whole-rig authority. When a specific native mechanism has been independently shown to embody the intended behavior, that mechanism-specific evidence may outrank stale secondary docs/configuration.

## 2. Evidence layers

```text
E0 identity / reproducibility
E1 local calibration consistency
E2 cross-asset / mechanism mating truth
E3 runtime kinematic coherence
E4 owner visual / semantic acceptance
E5 owner handling / feel acceptance — later
```

Durable rule:

```text
GREEN TEST / INTERNAL CONSISTENCY
!= HISTORICAL-RIG PARITY
!= OWNER TRUTH
!= GOOD VEHICLE FEEL
```

A generator and its tests can share the same wrong assumption. Tests must challenge accepted source/owner invariants and independently meaningful behavior, not only derived Web data or a historical rig.

## 3. Authority discipline for ports

For authored owner-vehicle geometry/mechanisms, establish authority **per claim** rather than for an entire rig:

```text
direct owner-accepted evidence
+ exact authored semantics/geometry for what the asset actually authors
+ reproducible candidate/runtime evidence
+ mechanism-specific native/recovery evidence after direct revalidation
+ secondary docs/contracts/receipts/calibration only after revalidation
```

There is no universal ordering that turns one complete M5/M6/latest-native rig into project truth. Secondary artifacts can be stale or scope-misused; correct or retire contradictions instead of averaging them. Historical native helpers/benches remain evidence only for the specific property they actually demonstrate.

## 4. Work unit: interface / mechanism + constraints

Do not treat the 59-binding package or an entire source asset as one acceptance unit.

For a selected interface separate as needed:

```text
position / steering center
axis direction / orientation
body/frame ownership
asset geometry / scale
suspension articulation
relative steering DOF
wheel-spin DOF
live behavior
```

A single source does not need to own every degree of freedom. Preserve owner-accepted constraints while reopening only the unresolved DOF.

Example lesson now made durable: **axis position/center and axis direction/tilt are different constraints**. A physically justified tilt must not silently translate an owner-accepted steering center.

## 5. Owner views are projection evidence

Screenshots and focused renders are strong semantic/falsification evidence but are not arbitrary pixel-to-meter calibration.

Use approximately:

```text
FRONT -> Y/Z constraints
TOP   -> X/Z constraints
SIDE  -> X/Y constraints
```

Prefer at least two independent views before accepting a 3D relationship. When one projection is already correct, preserve its supported DOF while investigating the unresolved projection.

For complex mechanisms, show the owner **what the agent believes each physical member/axis is**, not merely a polished animation. Owner-facing falsification is especially important where previous agents were confidently wrong.

## 6. Dependency model

The durable dependency direction is:

```text
CHASSIS / ATTACHMENT FRAME
-> correct front-corner kinematic contract
   -> suspension-side non-steering member
   -> steerable member + steering center/axis
   -> independent wheel spin
-> wishbone inboard/outboard relationships
-> upright / hub / wheel packaging
   -> steering rod
   -> cardan hub end
-> damper endpoints / local rig
-> cardan differential end
-> stance / ride height
-> whole-rig visual integration
-> separate handling/stability campaign
```

The exact current active point is defined by `PROJECT_STATE` and `IMPLEMENTER_TASK`, not by this list.

Do not tune downstream systems to conceal unresolved upstream topology/geometry.

## 7. Owner-validation protocol

```text
implementer:
  exact source + independently validated mechanism evidence
  bounded implementation/evidence
  stable candidate

orchestrator:
  independent technical review

owner:
  inspect one attributable semantic/visual question

orchestrator:
  ACCEPT / PARTIAL / REJECT
  record exact accepted/rejected constraints
  integrate / replan
```

`PARTIAL` is first-class. Static acceptance does not imply live acceptance. Technical self-consistency does not imply owner acceptance.

## 8. Recovery stages as dependency labels

These are conceptual labels, not mandatory batch tasks and not a current execution checklist.

- **S1 — chassis / suspension attachment:** establish trustworthy attachment relationships.
- **S2 — front-corner topology / steering contract:** establish correct non-steering vs steerable members, steering center/axis and wheel-spin separation.
- **S3 — wishbones:** inboard/outboard relation, orientation, mesh proportion only when causally required, live articulation.
- **S4 — upright / hub / wheel:** ball relationships, steering region, hub/wheel mount plane, spin center and clearance.
- **S5 — dampers / springs:** endpoints, ownership, axes, length/travel and clearance.
- **S6 — steering rods:** rack-side point, steering-member point, length and lock-to-lock behavior.
- **S7 — cardans:** differential-side and hub-side mating, shaft axis/stretch and articulation.
- **S8 — stance:** only after local geometry is coherent.
- **S9 — whole-rig integration:** accepted constraints together across representative states.
- **D0 — handling/stability recovery:** separate owner-opened campaign after visual/mechanical closure.

Never use a stage number as evidence that its assumptions are accepted.

## 9. Tooling principles

- Interface audit remains measurement evidence, not acceptance authority.
- Isolation/masking and fixed FRONT/TOP/SIDE views are justified when they reduce owner ambiguity.
- Physical/reference overlays are diagnostic only and must never alter physics.
- Accepted-constraint regressions should encode independent/source/owner truth, not accidental current numbers.
- Tooling must not become the project.

## 10. Predicted failure modes

**Authority inversion:** secondary receipts/contracts/calibration override the mechanism being ported. Recover the intended mechanism from current owner/source/reproducible evidence first.

**Green-test trap:** implementation and tests share the same wrong derived assumptions.

**One-body collapse:** distinct suspension-side, steerable and wheel-spin frames are collapsed because they coincide in rest state.

**Position/direction conflation:** a correct axis direction is used on a displaced line, or a desired tilt moves an accepted center.

**Downstream compensation:** stance/wheel offsets hide upstream rigging errors.

**Context/document drift:** old conversations or outdated docs compete with current Git/owner truth. Keep active routers short and mark historical material clearly.

**Blast-radius creep:** a bounded repair expands into unrelated subsystems. Replan rather than silently broaden.

**Validation fatigue:** owner repeatedly judges the whole car. Ask one attributable question with focused views.

## 11. Visual-campaign completion

Visual/mechanical recovery closes only when Jozz can inspect the complete vehicle without major geometry hiding other mechanisms and accepts the integrated result across representative live states.

At minimum this ultimately includes:

- wishbone mating/articulation;
- correct steering-member topology and steering center/axis behavior;
- upright/hub/wheel readability and independent wheel spin;
- damper/spring connections/articulation;
- steering rod connections/articulation;
- cardan mating at both ends;
- stance;
- regression of previously accepted constraints.

This does **not** imply good handling; handling/feel remains a later owner-gated campaign.

## 12. Current execution pointer

Do not open work from this document.

The only current execution authority is the exact `docs/IMPLEMENTER_TASK.md` at the orchestrator-supplied CONTROL TIP, together with current Git and owner checkpoints.
