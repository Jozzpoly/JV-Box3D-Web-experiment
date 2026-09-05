# Wheel mode5 RH0 — explicit canonical RQ suite replay

Date: 2026-09-05  
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`  
Executed source: `16cdbc5946da76ace72ce9e3d11874baca8bf2e4`  
Workflow run / job: `33963938554 / 101300561492`  
Artifact: `wheel-mode5-rh0-canonical-rq-replay` (`9968834538`)  
Artifact digest: `sha256:fb532fbea237557c3871f4cbfc3dd7e2debdfa7d8167f5fbbbb10cbdddca8ab6`

## Classification

**REPLAY_PASS / TRUSTED DIAGNOSTIC / RH0 NON-DRIFT EVIDENCE**

This run does not create a new wheel-physics qualification and does not broaden RQ0/RQ1/RQ2 scope. It establishes that the new explicit RH0 apparatus can reproduce the frozen canonical donor outer-carrier evidence without the historical scenario-specific RQ patch chain.

## Composition

The executed build used only:

1. pinned `box3d.js` `2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
2. pinned vendor Box3D `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
3. the exact recovered donor wheel diff;
4. E1 annular header generation;
5. existing E1 binding patch;
6. existing E2a binding patch;
7. `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`;
8. one thin adapter, `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`.

No RQ0/RQ1/RQ2 scenario-specific Python patch was used in this active path.

The suite owns:

- frozen named scenario configuration;
- common outer-P75 world/wheel construction;
- common contact sampling;
- common settled telemetry;
- RQ1 road/topology aggregation;
- one common RQ2 longitudinal implementation with torque direction as explicit scenario configuration.

## Frozen replay result

The existing RH0 contract passed without widening any gate.

### RQ0 matched rolling

- settled contact dropouts: `0`;
- feature changes: `0`;
- point count: `1..1`;
- Y range: `0.6746053696 mm`;
- max `|Vy|`: `48.9429757 mm/s`;
- mean slip: `0.0000932978 mm/s`;
- max slip: `0.0004172325 mm/s`;
- measured Vx and omega drift: emitted `0 / 0`.

### RQ0 zero-spin positive control

- contact and normal impulse both present;
- final spin is negative as expected;
- final slip: `0.0001192093 mm/s`.

The explicit suite therefore still exercises the ordinary tangential friction path rather than replaying only an already-matched kinematic state.

### RQ1c flat / 30 µrad

Flat control:

- top planes: `1`;
- feature changes: `0`;
- point count: `1..1`;
- post normal X: `0 µrad`.

30 µrad challenge:

- top planes: **`2`**;
- top-plane max normal X: `29.9999992 µrad`;
- feature changes: **`1`**;
- near-transition feature changes: **`1`**;
- point count: `1..1`;
- post mean normal X: `-29.9971668 µrad`;
- near Y-range ratio vs flat: `1.0`;
- near max-`|Vy|` ratio vs flat: `1.0`.

The refactor did not erase or manufacture the intended contact-feature transition.

### RQ2a brake20

- pulse dropout/churn: `0 / 0`;
- point count: `1..1`;
- max slip: `0.0488758087 mm/s`;
- Vx delta: `-0.5885983706 m/s`;
- omega delta: `+1.0789856911 rad/s`;
- rolling delta residual: `0.0000565944 mm/s` absolute;
- final slip: `0.00008940697 mm/s`.

### RQ2b drive20

- pulse dropout/churn: `0 / 0`;
- point count: `1..1`;
- max slip: `3.6782026291 mm/s`;
- Vx delta: `+0.5876292586 m/s`;
- omega delta: `-1.0825697184 rad/s`;
- end-pulse rolling mismatch: `2.9241808078 mm/s` absolute;
- final slip: `0.0002384186 mm/s`.

Drive/brake max-slip ratio: **`75.25609756x`**.

The known sign-asymmetric transient therefore survived the refactor rather than being accidentally normalized away.

## Comparison with the migration oracle

The emitted canonical metrics match the earlier legacy-composition bridge replay essentially bit-for-bit for the decision-relevant fields.

That matters because the two paths reach the same result through materially different orchestration:

- legacy bridge: many historical RQ helper/string patches composed into one build;
- explicit suite: one normal versioned C++ suite + one thin include/binding adapter.

This is stronger evidence than merely falling inside broad replay tolerances.

## Decision

**RH0.3 and the non-drift part of RH0.4 are satisfied.**

The explicit suite is now suitable to become the **active canonical donor outer-carrier apparatus**. Historical RQ0/RQ1/RQ2 workflows and patch scripts remain preserved as evidence/provenance and as a migration oracle, but they should no longer be extended for new active research scenarios.

This cutover does not authorize new physics yet. RH0 remains active because the next orientation challenge still needs a physically justified amplitude and apparatus-error budget before RQ2c continues.

## Next

1. update canonical ledger/router/project state to point active donor-carrier execution at the explicit RH0 suite;
2. retain old RQ workflows as historical provenance without deleting them;
3. perform RH0.5: recover a defensible wheel-orientation scale from actual JV/donor/product geometry and define the guide-compliance/error budget;
4. only then decide whether the existing 120 Hz local-axis guide is already adequate or needs a different/stiffer implementation.
