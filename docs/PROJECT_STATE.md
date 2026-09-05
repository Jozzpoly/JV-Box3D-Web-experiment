# JV-Web — current project state

Updated: 2026-09-05  
Owner: Jozz

## 1. Product authority is unchanged

Accepted JV-Web source/product authority remains:

`Jozzpoly/JV-Box3D-Web-experiment/main`

at:

`5b28cc03d22264010680deb95a04abd04661bc22`

Owner Preview remains composition/publication infrastructure only and has not been moved by wheel-mode5 research.

Last current-best Owner hands-on:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Observed 2026-08-31, consolidated 2026-09-01.

Accepted scoped product behavior includes touch steering ownership/release/re-grab and configurable wheel range with 900° as current-best/default. Natural physical self-return, final steering/handling geometry, wheel/contact backend, drivetrain, suspension and final rig remain open.

No wheel-mode5 laboratory result is Owner acceptance or product promotion.

## 2. Active wheel-mode5 research lane

Research branch:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Human router:

`docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`

Machine-readable evidence:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

Audit/hardening rationale:

`docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`

Current milestone:

**RH0 Research Foundation Hardening — ACTIVE; RH0.1–RH0.4 PASS; RH0.5 NEXT.**

New donor-carrier physics is still blocked until RH0.5 establishes a physically justified next orientation challenge and apparatus-error budget.

## 3. Evidence model

Do not conflate:

### Annular Contact Semantics

Recovered full tire boundary plus future side/inner/bore contact normal, witness and manifold semantics.

Dynamic full-annular semantics remain unvalidated.

### Donor Outer-Carrier Dynamics

Recovered donor `b3Wheel` outer-P75 carrier used for bounded rolling/contact/traction/mount-feasibility research.

This lane does not validate full annular side/inner/bore behavior.

## 4. Current trusted bounded findings

### Recycler / E2a2

A bounded recycler/reprojection discrepancy is real and reprojection is a necessary amplifier in the studied difficult transition. Trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation discrepancy.

Recycler micro-forensics stay closed unless later representative material evidence makes them decision-relevant.

### RQ0

Aligned flat-road rolling qualified within scope:

- zero dropout/churn;
- point count `1..1`;
- microscopic slip;
- zero-spin positive control demonstrates real friction coupling.

The planar world-axis guide is not a representative tilted-wheel mount.

### RQ1 / Q1-A

A real `30 µrad` road-face transition produced one expected feature switch without material disturbance above matched flat control. Small signed cross-slope remained neutral while support-feature identity stayed unchanged.

Q1-A applies only to the tested **bounded laboratory rolling-transition envelope**.

### RQ2a / RQ2b

Bounded braking and drive both qualified in the aligned flat-road apparatus.

Retained regression sentinel:

- brake max slip ≈ `0.0488758 mm/s`;
- drive max slip ≈ `3.67820 mm/s`;
- drive/brake ratio ≈ `75.256x`;
- drive end-pulse mismatch ≈ `2.92418 mm/s`, then relaxes.

Do not erase this asymmetry through refactor unless evidence explains the change.

## 5. RQ2c0 before RH0

A local-axis `b3ParallelJoint` angular guide is a useful mount-feasibility direction because world-axis angular locks become invalid once wheel orientation changes.

Corrected 120 Hz result:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Max measured guide-axis tilt:

`148.785 µrad = 0.008525°`.

The historical `<100 µrad` gate failed, but that threshold was not derived from product geometry or from the next physical challenge.

The attempted 240 Hz follow-up never executed physics. Its composition failure is apparatus evidence, not a 240 Hz physical result.

## 6. RH0 hardening progress

### RH0.1 — evidence ledger — PASS

Canonical status/provenance is centralized and automatically validated.

### RH0.2 — evidence/replay invariants — PASS

Critical scope and non-drift invariants are machine-checked.

### RH0.3 — explicit active donor-carrier harness — PASS

Active apparatus:

- `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`
- `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`
- `tools/wheel-mode5/rh0/wheel-mode5-rh0-canonical-rq-replay.mjs`
- `.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

The active path uses pinned donor/E1/E2a composition plus one normal versioned C++ suite and one thin include/binding adapter.

Historical RQ0/RQ1/RQ2 Python patch chains are now provenance only. Do not extend them for new active research.

### RH0.4 — frozen replay / provenance cutover — PASS

Explicit-suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact:

`9968834538`

Checkpoint:

`docs/WHEEL_MODE5_RH0_CANONICAL_RQ_SUITE_REPLAY_RESULT_2026-09-05.md`

The new suite reproduced the decision-relevant frozen metrics essentially bit-for-bit, including the RQ1 topology transition and RQ2 sign-asymmetry sentinel. No replay gate was widened.

### RH0.5 — physical orientation scale / error budget — NEXT

Before resuming RQ2c physics:

1. recover the relevant current JV/donor wheel, steering and suspension geometry;
2. identify the smallest physically meaningful first orientation question;
3. choose challenge amplitude from real geometry/product need rather than numerical convenience;
4. identify the expected physical signal;
5. set permissible guide error clearly below that signal;
6. compare the existing `148.785 µrad` compliance with that budget;
7. only then decide whether 120 Hz is adequate, a stiffer guide is useful, or the guide architecture should change.

No automatic 240 Hz rerun is authorized.

### RH0.6 — continuation branch — OPEN

The current branch contains substantial discovery history and increasingly functions as an evidence archive. After RH0.5, deliberately decide whether active execution should remain here or move to a cleaner hardened continuation branch.

## 7. Still not validated

Important open areas include:

- dynamic full-annular contact/manifold semantics;
- side/inner/bore solver behavior;
- representative free camber/steer;
- lateral tire-force realism;
- suspension/chassis load transfer;
- near-limit braking/drive, lockup and sustained wheelspin;
- broader irregular-road/topology envelope;
- representative axle/suspension rig;
- wheel-mode5 product integration;
- Owner experiential acceptance of wheel-mode5.

## 8. Broader JV-Web product pressures remain open

Wheel-mode5 is an important research lane, not the whole product roadmap.

Legitimate future product work still includes:

- natural steering self-return/self-alignment;
- steering and handling geometry;
- camera and controls;
- UI/presentation;
- world/scan experience;
- performance;
- drivetrain/brake balance.

Do not opportunistically mix those into RH0 laboratory hardening, but also do not let wheel-mode5 become an endless lab detached from product uncertainty.

## 9. Do not do next by default

- Do not rerun 240 Hz merely to satisfy the old `<100 µrad` threshold.
- Do not tune the guide before a challenge-derived error budget exists.
- Do not reopen recycler micro-forensics.
- Do not extend historical RQ patch chains.
- Do not start camber/steer/load transfer before RH0.5.
- Do not claim donor outer-P75 results validate full annular geometry.
- Do not promote research to `main` or Owner Preview.
- Do not ask Owner to judge low-level laboratory metrics without an experiential consequence.

## 10. Fresh continuation

For normal product work:

1. verify live `main`;
2. read `AGENTS.md` and this file;
3. inspect only product source/tests relevant to the requested slice.

For wheel-mode5 research:

1. verify live `main` and research branch separately;
2. read `AGENTS.md`, this file and the wheel-mode5 router;
3. validate the evidence ledger if changing foundation/evidence status;
4. use the explicit RH0 suite as active donor-carrier apparatus;
5. continue **RH0.5 physical orientation/error-budget grounding**;
6. open historical experiment docs only when a specific ledger dependency or anomaly requires them.

Current boundary:

> **Steering I1 remains accepted product truth. Wheel-mode5 has strong but scoped laboratory evidence. The active RQ apparatus is now replay-qualified and explicit. RH0.5 physical grounding is next; new orientation physics and product promotion remain blocked.**
