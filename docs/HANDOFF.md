# JV Web — current orchestrator handoff

Updated: 2026-08-10
Status: **IMPLEMENTATION FROZEN / CONTROLLED ORCHESTRATOR HANDOFF**
Purpose: rolling semantic checkpoint. Replace stale content instead of appending chronological chat history.

## 1. Exact boundary

```text
Private accepted product authority:
Jozzpoly/JV-Box3D-Web-experiment
main
pre-handoff-doc base: 6142a5116fd8a74d3f868c4a1447d32e158607a1
(resolve the live main tip; documentation stabilization may be newer)

Frozen S1 experiment:
work/owner-rig-s1-attachment-authority
tip:  393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908

Public R0:
Jozzpoly/JV-Box3D-Web-Public
release/r0
tip: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

Native:
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

The frozen S1 code is **not integrated into `main`**. This is intentional. Static owner acceptance is narrower than full product acceptance; live articulation and downstream wheel-side packaging remain open.

## 2. Current owner truth

### S1-D — OWNER ACCEPTED STATIC, NARROW

Jozz inspected the exact reviewed S1-D candidate in FRONT, TOP and wheel-side views.

Owner verdict:

- FRONT: FL upper wishbone chassis-side placement is good enough at current precision;
- TOP: the previous longitudinal yaw is removed; plan-view placement is good enough at current precision;
- wheel-side: the wishbone reaches very near the tire and the intermediary upright/hub/suspension package remains buried in the wheel;
- mesh appears stretched/lengthened, but owner explicitly defers changing that unless correct rigging later requires it.

Interpretation:

**S1-D solves the selected static FL upper-wishbone inboard placement question well enough to freeze that static constraint. It does not close the whole wishbone, corner or suspension stage.**

Do not silently promote this to:

- live-motion acceptance;
- FR acceptance;
- wheel/upright/hub acceptance;
- final mesh scale/proportion;
- final physical suspension authority.

## 3. Constraint ledger — FL upper wishbone

```text
INBOARD LONGITUDINAL X
source in S1-D:
  midpoint(physical upperFront, physical upperRear).x
status:
  OWNER ACCEPTED — STATIC / CURRENT PRECISION

INBOARD VERTICAL + LATERAL (Y/Z)
source in S1-D:
  S1-C semantic-main-chassis calibration components
status:
  OWNER ACCEPTED — STATIC / CURRENT PRECISION

FINAL INBOARD POINT
type:
  constraint-composed visual attachment
contact claim:
  NONE — do not claim it literally lies on group5 after X substitution

OUTBOARD XYZ
source:
  existing physical upper ball
status:
  PRESERVED THROUGH S1 / NOT YET FINAL WHEEL-SIDE ACCEPTANCE

ORIENTATION MECHANISM
PART_PAIR_ROLL_PINNED_STRETCH
status:
  STATIC RESULT SUPPORTED
  LIVE MOTION NOT EVALUATED

MESH LENGTH / SCALE
status:
  visibly stretched
  DEFERRED BY OWNER unless later rigging requires change

FR MIRROR
status:
  NOT OPEN / NOT OWNER ACCEPTED

LIVE SUSPENSION MOTION
status:
  UNKNOWN / NOT EVALUATED
```

## 4. Durable S1 technical result

S1-A through S1-D should not be replayed as a roadmap. Their durable result is:

- wide wishbone visual placement needs a deterministic full-frame/two-end mechanism rather than shortest-arc roll ambiguity;
- attachment authority may be **split by constraint/axis** rather than one source owning XYZ wholesale;
- owner screenshots are projection evidence, not pixel-to-meter calibration:
  - FRONT constrains Y/Z well;
  - TOP constrains X/Z well;
  - SIDE constrains X/Y well;
- change the smallest independent degree of freedom when possible;
- separate `MECHANISM`, `CALIBRATION`, `ASSET GEOMETRY`, and `LIVE BEHAVIOR`.

## 5. Negative memory — do not revive without new evidence

The following hypotheses/approaches were specifically disproven or insufficient during S1:

1. `E1/local-consistency PASS` proves visible cross-asset correctness — false.
2. `physicsAuthority:false` alone proves a physical point is unsuitable for visual placement — false.
3. existing shortest-arc `PART_PAIR_STRETCH` is sufficient to control a wide wishbone's roll — insufficient.
4. literal authored `Chassis_Top` is the final FL upper inboard attachment — owner rejected.
5. unrestricted nearest surface across chassis pieces is a valid mating authority — false; it can select `Diferential_F`.
6. full-XYZ `nearest(group5)` is the final attachment authority — owner rejected; it introduced ~0.156 m longitudinal mismatch/top-view yaw.
7. owner screenshot pixels should be converted directly to world offsets — do not do this.

These are negative constraints, not a ban on revisiting a question if genuinely new evidence appears.

## 6. Remaining visible recovery state

Still current from V0 / latest owner observation:

- chassis/body is a usable visual reference;
- wheel-side upright/hub/suspension geometry remains buried in wheels;
- damper/spring rig remains wrong and intersects the wheel region;
- cardans still need proper visible mating, especially differential side;
- final stance likely needs to sit slightly higher;
- driving feel/stability/steering feel remain strongly regressed and deliberately deferred;
- scan work remains outside the active vehicle lane.

Do not use S1 static acceptance to erase these unresolved states.

## 7. Implementation freeze

There is **no active implementer task**.

Do not:
- continue S1 on the frozen work branch;
- mirror FR;
- open live motion;
- fix wheel/upright/hub packaging;
- change mesh scale;
- tune dynamics;
- publish R1.

until the new orchestrator has completed takeover validation and Jozz explicitly authorizes continuation.

## 8. New orchestrator takeover gates

### O1 — state reconstruction

No writes.

The new orchestrator must independently resolve live refs and report:

1. accepted `main` state;
2. frozen S1 work state;
3. public R0 boundary;
4. OWNER ACCEPTED constraints;
5. OWNER REJECTED / negative-memory constraints;
6. provisional/unknown/deferred items;
7. why `393ef...` is not automatically merged;
8. the next unresolved dependency without opening implementation.

Jozz + previous orchestrator review this reconstruction.

### O2 — continuation reasoning

Still no product write.

The new orchestrator proposes the next bounded direction from current dependency/evidence state. It must preserve S1 accepted static constraints and avoid reopening deferred dynamics.

### O3 — first implementer packet

Before a new implementer is started, the new orchestrator prepares the next `docs/IMPLEMENTER_TASK.md`. The previous orchestrator audits that packet for scope, identity, evidence and context hygiene.

Only after O1-O3 pass is orchestrator handoff COMPLETE.

## 9. Minimum read set for takeover

Required:
- `AGENTS.md`
- `AI_PROJECT_MEMORY.md`
- this file

Then, as needed:
- `docs/OWNER_CHECKPOINTS.md`
- `docs/PROJECT_STATE.md`
- `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`
- `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md`

Cold evidence is Git history, exact candidate SHAs and tests. Old conversations and archived branches are not bootstrap material.
