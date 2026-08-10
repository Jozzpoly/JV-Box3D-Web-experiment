# JV Web — owner vehicle visual recovery campaign

Updated: 2026-08-10
Status: **PREPARATION / EXECUTION CONTRACT — PRODUCT CORRECTION NOT STARTED**

This document defines how to finish the owner-vehicle visual implementation after V0 exposed a reproducible but visually incorrect rig. It is not the current-state authority: `docs/PROJECT_STATE.md` remains current-state authority and `docs/HANDOFF.md` remains the rolling continuation note.

The campaign exists to prevent the previous failure mode: changing/calibrating many assets at once, proving internal consistency against the same model that generated them, then discovering through owner observation that the integrated geometry is still wrong.

## 1. Boundary

Primary goal: make the browser owner vehicle mechanically readable and visually coherent, one interface at a time, with attributable owner validation.

In scope: chassis/suspension attachment relationships; corner-rig placement/body-role mapping; wishbones; upright/hub/wheel packaging; dampers/springs; steering rods; cardans; final stance; whole-rig visual integration.

Deferred until visual closure: driving feel, suspension stability tuning, steering feel/rate, tire/contact tuning, drivetrain redesign, unrelated camera/UI polish, scan/world work and public Pages promotion.

Native JV is read-only evidence.

## 2. V0 starting truth

Exact reproducible artifact:

```text
id: m6-owner-full-rig-r3
GLB bytes: 829944
real bindings: 59
SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

V0 canonical Windows execution completed with exact Node 24.16.0 / npm 11.13.0, typecheck, deterministic generation, 13 focused tests and production build. V0 owner observation still found the rig broadly visually incorrect. The current artifact is therefore a **comparison baseline, not accepted geometry**.

Durable rule:

```text
CONSISTENCY PASS
!= CROSS-ASSET GEOMETRY TRUTH
!= OWNER ACCEPTANCE
!= GOOD VEHICLE FEEL
```

## 3. Evidence layers

Use explicit evidence layers during recovery:

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance (later campaign)
```

E1 means a source marker/mesh maps to the target chosen by the algorithm; it can still validate a wrong target. E2 independently asks whether two systems actually meet where intended. New hard thresholds should normally be frozen only after the corresponding interface reaches E4 owner acceptance.

## 4. Dependency model

The work unit is an **interface**, not the 59-binding package and not an entire asset.

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

Do not tune a downstream mechanism to compensate for an unresolved upstream interface.

## 5. Planning evidence already established

The new measurement-only interface audit compares authored whole-rig placement, current physical M6 targets and nearest rendered chassis surface. It deliberately defines no visual-acceptance thresholds.

On the exact V0 geometry, representative authored-placement to current-target deltas are symmetric:

```text
front upper hinge ~0.216 m
front lower hinge ~0.155 m
front damper upper ~0.529 m
rear upper hinge ~0.216 m
rear lower hinge ~0.155 m
rear damper upper ~0.529 m
front authored steering socket -> current steering arm ~0.222 m
```

Nearest-surface measurements also put several current chassis-side targets farther from rendered chassis geometry than the authored whole-rig placement, particularly damper upper points. This supports investigating attachment authority first; it does not prove the authored position is final.

The current cardan audit reports authored placed `Socket_CardanDrive` / `Socket_CardanHub` equal the R3 pair endpoints, while V0 still shows a visible differential-side miss. Cardan recovery therefore must inspect actual rendered end-piece mating/pivot/orientation, not only endpoint coordinates.

## 6. Native selective salvage before invention

Before inventing a new mapping for a mechanism, inspect current native JV if a corresponding implementation exists. Reuse demonstrated intent selectively; do not wholesale port native code and do not infer native parity.

Relevant prior art already found:

- native and Web use the same base chassis visual transform;
- native lands the authored suspension `WheelCenter` on the wheel's inboard `Socket_WheelMount` plane before splitting visual roles;
- native splits the authored suspension into chassis/lower-arm/knuckle visual roles;
- native wishbones are drawn between live endpoints;
- native steering visual deliberately uses the real rack center because rack-end placement produced a short stub;
- native diagnostics already visualize hardpoints, kingpin, coilover and rack/steering relationships.

These are evidence/candidate algorithms, not automatic implementation requirements.

## 7. Execution stages

Stages are dependency checkpoints, not a mandatory list of code changes. Skip any stage proven already correct.

### P0 — preparation and measurement

Prepare neutral tools, dependency contract and owner-validation workflow. No product correction. Exit when the baseline can be measured without blessing its current values.

### S1 — chassis <-> suspension attachment authority

First question: where should one chassis-side upper/lower suspension interface actually be relative to the rendered chassis and authored corner rig?

Before editing, compare Web hardpoints, authored placement, actual chassis mesh and native prior art. Decide whether physical targets, visual mapping, or both are wrong. Declare exact allowed bindings/mechanisms.

Prefer one front pilot relationship before mirroring the proven rule. Do not adjust upright, damper, cardan, stance or handling here.

Owner validation asks only whether the selected wishbone chassis attachment now sits correctly relative to the frame.

### S2 — corner landing and kinematic body-role mapping

Validate authored `WheelCenter` -> wheel `Socket_WheelMount`, chassis-riding pieces, lower-arm-riding pieces, knuckle-riding pieces, handed transforms and source pivot assumptions.

Owner validation asks whether the mechanical package between frame and wheel is now in a readable/plausible location before local polish.

### S3 — wishbones

Split upper/lower and front/rear further whenever attribution benefits. Validate inboard attachment, outboard/ball attachment, fore/aft spread, local orientation and live articulation. Freeze accepted relationships before opening downstream mechanisms.

### S4 — upright / hub / wheel

Only after wishbone endpoints are readable. Validate upper/lower ball relationship, upright geometry/kingpin region, hub face/wheel mount plane, wheel spin center vs authored mount plane and clearance. Only here can wheel placement be judged reliably.

If steering pivot remains wrong after the static package is correct, run live kingpin/anchor/incremental-axis diagnostics then; do not pre-emptively rewrite physics.

### S5 — dampers / springs

Front and rear are separate checkpoints; rear twin dampers are separate from front single dampers. Validate both endpoints, the live body for each endpoint, end-piece pivots/orientation, stretch axis/reference length, spring deformation, travel and clearance.

A correct abstract segment line is not sufficient: rendered pieces must mate correctly.

### S6 — steering rods

Separate from upright correction. Validate actual rack-side point, knuckle steering-arm point, local rod axis/pivot, stretch length and full lock-to-lock behavior. Native rack-center logic is strong prior art but must be measured before reuse.

### S7 — cardans

Validate rendered differential mating face, cardan drive-end pivot/mating face, hub-side mating, center stretch/axis and articulation. Do not treat the current endpoint-consistency test as E2 mating proof.

### S8 — stance

Only after local geometry is coherent and wheels are visually judgeable. Adjust ride height and, only if still necessary, track/visual width. Never use stance to hide local rigging errors.

### S9 — whole-rig visual integration

No redesign. Validate all accepted interfaces together, all corners, neutral/steer/travel views and regression of frozen owner checkpoints.

### D0 — handling/stability recovery — later

Open only by explicit owner decision after visual closure. Begin from fresh runtime/owner-feel evidence rather than assumptions made during visual recovery.

## 8. Tooling road

### T0 — interface audit — AVAILABLE

Run:

```text
npm run inspect:owner-rig-interfaces
```

It reports authored/current target relations, nearest chassis-surface distances, selected endpoint deltas and groups all 59 real bindings. Classification is `MEASUREMENT_ONLY_NOT_ACCEPTANCE`; current bad distances are not regression thresholds.

### T1 — visual isolation/masking — implement only when first needed

Debug/query-only show/hide categories (`chassis`, `wheels`, `arms`, `knuckles`, `brackets`, `dampers`, `steering`, `cardans`) and optionally one corner. Default product rendering must remain unchanged. This removes clutter from owner validation.

### T2 — physical/reference diagnostic overlay — implement only when needed

Opt-in overlay for chassis hinges, ball points, kingpin, wheel center/mount reference, coilover endpoints and rack/steering link. Existing Web visual-frame data and native diagnostics provide prior art. Overlay must not affect physics.

### T3 — reproducible camera/view matrix — implement when owner comparisons begin

Use fixed side, front/rear, three-quarter, above and underbody views, plus only the dynamic state required by the active mechanism. This makes screenshot comparisons meaningful across iterations.

### T4 — reusable owner-candidate launcher — formalize from V0 proof of concept

Reuse the successful self-contained Windows pattern for product checkpoints. Each candidate should identify source SHA/tree, changed slice, expected artifact identity, checks run, one owner question and what is intentionally not being evaluated.

### T5 — accepted-interface regression gates — add gradually

After owner acceptance, encode durable geometric/kinematic truth as the smallest independent regression possible. Never create a threshold merely because the current implementation produces a number.

## 9. Owner-validation protocol

Normal visual iteration:

```text
agent: exact source + focused evidence + stable candidate
owner: launch -> inspect requested state -> answer one visual question
agent: ACCEPT / PARTIAL / REJECT -> record/freeze -> next question
```

Jozz should not be asked to perform technical debugging the agent can automate.

`ACCEPTED`: freeze interface and add regression where useful.

`PARTIAL`: preserve accepted subparts and reopen only the unresolved sub-question.

`REJECTED`: replace/revert the approach and record the durable lesson, not another permanent branch.

## 10. Branch/commit discipline

`main` remains authority. Use `work/<bounded-topic>` only when isolation materially helps experimentation/owner comparison. Never create branches per agent/conversation.

One product checkpoint should normally contain one causal visual change. Tooling/docs stay separate from product correction. Never bundle stance, steering, dampers and cardans under one `vehicle polish` commit.

Before every write resolve current tip/tree; stop on unexpected movement; no force-push recovery.

## 11. Predicted failure modes

**Wrong authority selected:** a marker maps exactly to a point that is not the correct visible mating location. Mitigation: require E2 cross-asset evidence and inspect native prior art.

**Mesh pivot/axis mistaken for endpoint error:** numeric endpoints are right but rendered end pieces float/rotate/penetrate. Mitigation: inspect actual mating face and local pivot/orientation, especially dampers/cardans.

**Downstream compensation:** stance/wheel is moved to hide a bad upstream interface. Mitigation: preserve dependency order and freeze upstream acceptance.

**Green-test trap:** a test validates the same assumption used by the generator. Mitigation: label evidence layer and use independent cross-asset/runtime/owner evidence.

**Blast-radius creep:** a narrow fix starts altering multiple axles/subsystems/physics. Mitigation: binding groups, declared allowed scope, pilot-then-mirror and post-diff audit.

**Context drift:** later agent replays branches or stale plans. Mitigation: current Git + short memory/handoff + this stable execution contract; archived branches only for a named salvage question.

**Validation fatigue:** owner repeatedly inspects the whole car or performs setup/debug. Mitigation: reusable launcher, visual isolation, fixed views and one owner question.

**Tooling becomes the project:** diagnostics grow faster than product value. Mitigation: implement T1-T5 lazily. T0 is the only tool required before S1 investigation.

## 12. Definition of visual-campaign completion

Visual recovery closes when Jozz can inspect the complete car without major geometry hiding other mechanisms and accepts that wishbones mate plausibly, upright/hub/wheel relationships are readable, dampers/springs connect and articulate correctly, steering rods connect/articulate correctly, cardans mate at both ends, stance is acceptable and earlier accepted interfaces remain stable in integrated views.

This does not imply good handling. The dynamic/feel campaign begins only after this visual closure checkpoint.

## 13. Immediate next decision after preparation

Do **not** start by patching an asset.

When Jozz explicitly opens implementation, start under S1 with the smallest evidence-producing investigation: establish authority and actual spatial relationship for one chassis-to-wishbone attachment interface. Use T0 measurements and native selective evidence; choose a product correction only after the cause is discriminated.
