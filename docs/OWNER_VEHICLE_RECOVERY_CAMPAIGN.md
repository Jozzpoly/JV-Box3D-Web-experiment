# JV Web — owner vehicle visual recovery campaign

Updated: 2026-08-10
Status: **ACTIVE RECOVERY CONTRACT / S1 STATIC SUBCHECKPOINT OWNER ACCEPTED / IMPLEMENTATION FROZEN FOR ORCHESTRATOR HANDOFF**

This document defines the durable method and dependency structure for owner-vehicle visual recovery. It is **not current-state authority**: use `docs/PROJECT_STATE.md` for accepted/current project boundary and `docs/HANDOFF.md` for the active/frozen transaction checkpoint.

## 1. Boundary

Goal: make the browser owner vehicle mechanically readable and visually coherent, one attributable interface/constraint at a time.

In scope:

- chassis/suspension attachment relationships;
- corner landing / kinematic body-role mapping;
- wishbones;
- upright/hub/wheel packaging;
- dampers/springs;
- steering rods;
- cardans;
- stance;
- whole-rig visual integration.

Deferred until visual closure:

- driving feel and suspension stability tuning;
- steering feel/rate;
- tire/contact tuning;
- drivetrain redesign;
- unrelated camera/UI polish;
- scan/world work;
- public R1 publication.

Native JV remains read-only evidence.

## 2. Reproducible baseline

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

V0 canonical Windows execution proved reproducibility/internal consistency but owner observation rejected most final visual geometry.

Durable rule:

```text
CONSISTENCY PASS
!= CROSS-ASSET MATING TRUTH
!= OWNER ACCEPTANCE
!= GOOD VEHICLE FEEL
```

## 3. Evidence layers

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance — later
```

Never promote E1 into E2/E4. Hard acceptance/regression constraints normally appear only after independent evidence/owner acceptance justifies them.

## 4. Work unit: interface + constraints

The work unit is an **interface**, not the 59-binding package and not an entire source asset.

For each selected interface separate at least:

```text
position X/Y/Z
orientation/frame
asset geometry/scale
live body ownership/articulation
```

A single source does not have to own all degrees of freedom. S1 demonstrated that authority may be split by axis/constraint when current source independently justifies it.

Distinguish:

```text
MECHANISM
CALIBRATION
ASSET GEOMETRY
LIVE BEHAVIOR
```

A defect in one category is not automatic evidence against the others.

## 5. Owner views are projection evidence

Screenshots guide geometry discrimination but are not pixel-to-meter calibration.

Use approximately:

```text
FRONT -> Y/Z constraints
TOP   -> X/Z constraints
SIDE  -> X/Y constraints
```

Prefer at least two independent views before accepting a 3D static relationship.

If FRONT is good and TOP is wrong, preserve supported FRONT constraints and investigate the unresolved plan-view degree of freedom rather than moving XYZ together.

## 6. Dependency model

```text
CHASSIS VISUAL FRAME
-> chassis <-> corner attachment skeleton
-> authored corner landing / kinematic body roles
-> wishbone inboard/outboard relationships
-> upright / hub / wheel package
   -> steering rod
   -> cardan hub end
-> damper endpoints / local rig
-> cardan differential end

local interfaces coherent
-> stance / ride height
-> whole-rig visual integration
-> separate handling/stability campaign
```

Do not tune downstream systems to hide unresolved upstream geometry.

## 7. Current S1 durable checkpoint

Frozen exact experiment:

```text
branch: work/owner-rig-s1-attachment-authority
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
```

Owner accepted **static FRONT + TOP FL upper-wishbone inboard placement at current precision**.

This is only a partial interface checkpoint.

Not yet accepted:

- live articulation;
- FR mirror;
- final outboard/wheel-side packaging;
- upright/hub/wheel;
- final wishbone mesh length/scale.

Latest owner wheel-side view still shows geometry very near the tire and the intermediary upright/hub/suspension package buried in the wheel.

The exact constraint ledger and negative memory live in `docs/HANDOFF.md` and `docs/OWNER_CHECKPOINTS.md`.

## 8. Execution stages

Stages are dependency checkpoints, not mandatory batches. Split further whenever attribution benefits; skip a stage only when independent evidence supports doing so.

### S1 — chassis <-> suspension attachment authority

Establish one chassis-side relation without changing downstream mechanisms.

Current state: one FL upper static sub-constraint reached E4. **S1 as a whole is not closed.**

### S2 — corner landing / kinematic body roles

Validate authored wheel/corner landing, chassis-riding pieces, arm-riding pieces, knuckle-riding pieces, handed transforms and source pivots.

### S3 — wishbones

Validate upper/lower and front/rear separately as needed: inboard relation, outboard/ball relation, fore/aft spread, local orientation, mesh proportion only when causally required, and live articulation.

### S4 — upright / hub / wheel

Validate upper/lower ball relationship, upright/kingpin region, hub face/wheel mount plane, wheel spin center vs authored mount plane and clearance. This is required before global wheel placement can be judged reliably.

### S5 — dampers / springs

Treat front single and rear twin dampers separately. Validate both endpoints, endpoint body ownership, local axes/pivots, reference length/stretch, spring deformation, travel and clearance.

### S6 — steering rods

Validate rack-side point, steering-arm point, local rod axis/pivot, length and lock-to-lock behavior. Native rack-center logic is prior art, not automatic authority.

### S7 — cardans

Validate actual rendered differential mating face, drive-end pivot, hub-side mating, shaft axis/stretch and articulation. Endpoint-consistency alone is not E2 proof.

### S8 — stance

Only after local geometry is coherent. Never use stance to hide local rigging errors.

### S9 — whole-rig integration

Validate accepted constraints together across corners and representative states. No redesign.

### D0 — handling/stability recovery

Open only by explicit owner decision after visual closure. Begin from fresh runtime/owner-feel evidence.

## 9. Tooling road

### T0 — interface audit — AVAILABLE

```text
npm run inspect:owner-rig-interfaces
```

Measurement only; it does not define acceptance thresholds.

### T1 — visual isolation/masking — lazy

Debug/query-only show/hide by category/corner. Use when clutter materially blocks owner judgment. Default product rendering must remain unchanged.

### T2 — physical/reference overlay — lazy

Opt-in hardpoint/reference diagnostics only when a selected question needs them. Never affect physics.

### T3 — reproducible view matrix — now strongly justified, still not implemented

Future owner-sensitive geometry work should prefer fixed FRONT/TOP/SIDE/three-quarter views so projection evidence is comparable across iterations.

Do not implement T3 merely as handoff work; open it only when the next selected slice benefits.

### T4 — reusable owner candidate launcher

Reuse the proven self-contained Windows pattern: exact source/tree, exact Node/npm, deterministic generation, focused/full gates as appropriate, artifact identity and one owner question.

### T5 — accepted-constraint regression gates

Add gradually after owner acceptance. Encode independent truth, not accidental current numbers.

## 10. Owner-validation protocol

```text
agent:
  exact source
  focused evidence
  stable reviewed candidate

owner:
  inspect requested state/views
  answer one visual question

orchestrator:
  ACCEPT / PARTIAL / REJECT
  record exact accepted/rejected constraint
  freeze it
```

`PARTIAL` is first-class: preserve accepted DOFs and reopen only unresolved ones.

Static acceptance does not imply live acceptance.

## 11. Predicted failure modes

**Wrong authority:** exact mapping to the wrong visible mating target. Require E2/E4.

**One-source-owns-XYZ assumption:** nearest/full-point solve can improve one projection while breaking another. Allow split authority when current source supports it.

**Roll/orientation ambiguity:** endpoint-only shortest-arc mapping can leave wide-part roll undefined. Validate a full frame when needed.

**Pivot/axis mistaken for endpoint error:** correct abstract line with wrong rendered pivot/orientation. Inspect mating face and local frame.

**Downstream compensation:** stance/wheel motion used to hide upstream attachment errors. Preserve dependency order.

**Green-test trap:** generator and test share the same wrong assumption. Classify evidence layer.

**Blast-radius creep:** one interface task expands into multiple subsystems/physics. Stop/replan.

**Context drift:** stale chat/branches compete with current truth. Use short router + semantic handoff + owner ledger + exact Git.

**Validation fatigue:** owner repeatedly judges the whole car. Use one question, isolation/fixed views only when useful.

**Tooling becomes the project:** T1-T5 remain lazy and must justify product value.

## 12. Visual-campaign completion

Visual recovery closes only when Jozz can inspect the complete car without major geometry hiding other mechanisms and accepts:

- wishbone mating;
- upright/hub/wheel readability;
- damper/spring connections/articulation;
- steering rod connections/articulation;
- cardan mating at both ends;
- stance;
- integrated regression of accepted constraints.

This does not imply good handling.

## 13. Current execution boundary

Implementation is intentionally **FROZEN for controlled orchestrator handoff**.

Do not open another S-stage from this document.

The next operation is O1 state reconstruction from `docs/HANDOFF.md`. A fresh orchestrator may resume product planning only after takeover validation.
