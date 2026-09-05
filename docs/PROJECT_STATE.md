# JV-Web — current project state

Updated: 2026-09-05  
Owner: Jozz

## 1. Product authority

Accepted source/product authority remains:

`Jozzpoly/JV-Box3D-Web-experiment/main@5b28cc03d22264010680deb95a04abd04661bc22`

Last Owner hands-on/current-best remains Steering I1:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Observed 2026-08-31; consolidated 2026-09-01.

No wheel-mode5 laboratory result is product acceptance or promotion. Owner Preview remains publication/composition infrastructure only.

## 2. Wheel-mode5 active research branch

Active hardened continuation branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Archival research ancestor:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Canonical wheel router:

`docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`

Machine-readable evidence:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

Active pointer:

`docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json`

RH0 closure:

`docs/WHEEL_MODE5_RH0_CLOSURE_2026-09-05.md`

## 3. Evidence model

Keep separate:

- **Annular Contact Semantics** — full tire boundary and future side/inner/bore contact/manifold semantics;
- **Donor Outer-Carrier Dynamics** — recovered donor outer-P75 `b3Wheel` carrier used for bounded dynamic research.

Outer-carrier evidence does not validate full annular side/inner/bore behavior.

## 4. Retained bounded findings

### Recycler/E2a2

A bounded recycler/reprojection discrepancy is real; trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation in the studied difficult transition. Recycler micro-forensics remain closed unless later representative material evidence makes them decision-relevant.

### RQ0 / RQ1 / RQ2a / RQ2b

Aligned flat-road rolling, one bounded road-normal transition, bounded braking and bounded drive qualified within their laboratory scopes. Retain the RQ2 longitudinal sign-asymmetry sentinel rather than explaining it microscopically without later material relevance.

### RQ2c0a 120 Hz

Corrected local-axis mount run measured max guide-axis error:

`148.785 µrad = 0.008525°`.

It truthfully failed its historical predeclared `<100 µrad` gate. That gate was not derived from product/challenge geometry and is no longer the routing target.

The 240 Hz follow-up never executed physics and remains apparatus-invalid provenance. Do not resurrect it as a stiffness campaign without new causal evidence.

## 5. RH0 Research Foundation Hardening

**Status: CLOSED.**

RH0.1–RH0.6 passed. The explicit RH0 suite is the active donor-carrier extension point; historical scenario-specific patch chains remain provenance only.

Canonical suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact `9968834538` reproduced canonical RQ0/RQ1c/RQ2a/RQ2b behavior essentially bit-for-bit.

## 6. Orientation qualification target and frozen gates

Grounding:

`docs/WHEEL_MODE5_RH0_5_ORIENTATION_CHALLENGE_AND_ERROR_BUDGET_2026-09-05.md`

First intentional yaw challenge remains:

`0° / +3.5° / -3.5°`

where `3.5°` is 10% of current `35°` driving full lock.

Challenge-derived research-instrument budgets remain:

- max settled axle-axis error `<= 0.035°`;
- max settled velocity-heading error `<= 0.035°`.

Frozen rolling-slip gate remains:

- max valid rolling slip `<= 0.002 mm/s`.

The historical 120 Hz angular-mount error is inside the challenge-derived angular budget, so 120 Hz / damping 1.0 carries forward unchanged unless later trusted evidence specifically makes angular compliance causal.

## 7. Zero-degree qualification frontier — RQ2C3 → RQ2C4 → D → E

Yaw is **not yet unlocked**. The required 0-degree apparatus qualification exposed a smaller blocker and has been investigated without relaxing gates.

### RQ2C3 — direct local-axis scalar guide

Trusted source:

`09712c613218f5b6bb40927673f714fd364f2bdf / 33968208611 / 101311971290`

The direct one-axis topology removed the helper-body carrier's millimetre-scale positional wandering, but its soft relaxation left:

- max heading error `0.04951397°` > `0.035°`;
- max cross-heading speed `0.864176 mm/s`;
- max slip `0.03457069 mm/s` > `0.002 mm/s`.

The helper-body chain remains closed.

### RQ2C4 — engine-native hard relax

Trusted source:

`13dfe885f8d949a25fa057f0cd47c7d86b95d817 / 33968699659 / 101313264377`

Hard-relax semantics made the direct translational/heading guide effectively exact:

- max heading error `1.33403e-8°`;
- max cross-heading speed `2.32831e-7 mm/s`;
- max cross-track `0.00683569 mm`;
- max plane separation `0.00380223 mm`.

But legacy max slip remained `0.03468990 mm/s`, essentially the old angular-mount signature.

### RQ2C4D — actual support-witness instrument audit

Trusted source:

`8a65846ff4e2a41a096221e5908f3899f694461b / 33969662893 / 101315812890`

Exact RQ2C4 primary metrics reproduced. The actual geometric support point measured:

- mean absolute witness slip `0.008013017 mm/s`;
- max absolute witness slip `0.034093857 mm/s`.

The actual witness retains `98.2818%` of the legacy maximum. Therefore the fixed-radius approximation is not the primary cause of the blocker.

### RQ2C4E — angular contribution localization

Trusted source:

`14b500c7f174c7107316fd9b31ef92b74964f501 / 33971215026 / 101319952137`

Frozen RH0, RQ2C4 primary non-drift, RQ2C4D witness non-drift and rigid-body reconstruction all passed.

At peak actual witness:

- witness `+0.034093857 mm/s`;
- rolling pair (`COM translation + pure current-axle spin`) `+0.034570694 mm/s`;
- non-spin/nutation `-0.000464480 mm/s`.

Settled rolling-pair mean signed / mean absolute is `99.726%`, so the residual is overwhelmingly one-signed rather than symmetric noise.

**Current interpretation:** the maximum 0-degree blocker is primarily inside incomplete cancellation of COM translation and pure current-axle spin. Non-spin can contribute/cancel elsewhere but is not the primary maximum source. This is kinematic localization, not yet contact-solver causality.

Actual-witness maximum remains **17.0469×** above the frozen `0.002 mm/s` gate.

## 8. Exact next bounded move — RQ2C4F

Do **not** execute `+3.5°/-3.5°` yet.

Predeclare and run one read-only 0-degree **rolling-pair closure localization** on exact RQ2C4D/E physics.

Use the initialized rolling state as the reference and decompose current rolling-pair residual exactly into:

1. COM tangential-velocity drift;
2. axle-spin-rate drift;
3. change in the exact geometric spin lever from current axle and actual support witness.

Require before interpretation:

- frozen RH0 replay PASS;
- exact RQ2C4 primary non-drift;
- RQ2C4D actual-witness non-drift;
- RQ2C4E rigid-body reconstruction integrity.

RQ2C4F is diagnostic only. It must not change mount stiffness, contact parameters, solver behavior, geometry, gates or yaw.

Routing after F:

- spin-rate drift dominates -> design a specific causal falsifier for how contact/constraint dynamics evolve spin; do not infer solver blame from kinematics alone;
- geometric spin-lever drift dominates -> inspect support/rolling geometry semantics before changing dynamics;
- translation drift dominates -> revisit the remaining longitudinal control/response assumption;
- mixed terms -> localize phase/correlation before intervention.

## 9. Still not validated

- `+3.5°/-3.5°` orientation equivalence;
- dynamic full-annular contact/manifold semantics;
- side/inner/bore solver behavior;
- representative lateral tire-force behavior;
- steer-under-load handling;
- camber thrust;
- suspension/chassis load transfer;
- near-limit traction/lockup/wheelspin;
- broad rough-road topology;
- production axle/suspension architecture;
- wheel-mode5 product integration and Owner acceptance.

## 10. Explicitly not next

Do not:

- run yaw while 0-degree actual-witness slip fails the frozen gate;
- rerun 240 Hz merely to satisfy the old 100 µrad gate;
- tune angular stiffness because RQ2C4E did not identify non-spin as the primary maximum source;
- relax or redefine the `0.002 mm/s` gate to force qualification;
- add torque, lateral slip demand, suspension/load transfer or camber;
- reopen recycler forensics;
- resurrect the closed helper-body carrier;
- promote wheel-mode5 to `main` or Owner Preview.

## 11. Fresh continuation

For wheel-mode5 research:

1. verify accepted `main` separately;
2. verify `research/wheel-mode5-rq2c-orientation-2026-09-05` live head;
3. read `AGENTS.md`, this file, the active pointer and canonical ledger;
4. preserve frozen RH0 and exact RQ2C4D/E non-drift barriers;
5. execute only the bounded RQ2C4F 0-degree diagnostic;
6. stop and classify before any physics intervention or yaw expansion.

Current boundary:

> **Steering I1 remains accepted product truth. RH0 is closed. RQ2C4D/E established that the real 0-degree slip blocker survives orientation-aware measurement and is dominated at its maximum by the COM-translation + pure-axle-spin rolling pair. The next work is one read-only RQ2C4F closure localization; yaw, stiffness tuning, gate relaxation and product promotion remain unauthorized.**
