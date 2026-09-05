# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05  
Owner: Jozz  
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`  
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`

Canonical machine-readable evidence:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

Retrospective audit:

`docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`

## 1. Current route

The experiment sequence is not the roadmap.

Current route:

> Steering I1 remains the last Owner hands-on product acceptance -> wheel-mode5 established scoped laboratory evidence through RQ2c0a -> the old experiment-specific patch chain hit a scaling limit -> RH0.1–RH0.4 hardened the evidence and replaced the active RQ apparatus -> **RH0.5 challenge-derived orientation/error-budget work is NEXT**.

New donor-carrier physics remains blocked until RH0.5 defines a physically justified next orientation challenge and an apparatus-error budget.

Do **not** resume the abandoned `120 -> 240 Hz until PASS` sequence.

## 2. Authority split

### Product truth

Accepted source/product authority remains:

`Jozzpoly/JV-Box3D-Web-experiment/main`

at:

`5b28cc03d22264010680deb95a04abd04661bc22`

The last Owner current-best is Steering I1, observed 2026-08-31 and consolidated 2026-09-01:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

It accepts steering interaction/control behavior only. Wheel-mode5, drivetrain, suspension, final rig/handling and natural physical steering self-return remain outside Owner acceptance.

### Research truth

The wheel-mode5 branch owns only scoped research evidence tied to exact executed source/run/job provenance.

A green laboratory workflow is not product acceptance and does not authorize promotion to `main` or Owner Preview.

## 3. Keep the two evidence lanes separate

### Annular Contact Semantics

This lane concerns the recovered full tire boundary and future native contact/manifold semantics, including side/inner/bore behavior.

Current direction:

- boundary/onset geometry can be smooth and convergent;
- raw triangle-selected side/inner manifold normal is not a viable direct dynamic semantic;
- profile-derived analytic normal strongly improves the demonstrated side/inner control;
- universal analytic-normal replacement is also wrong because broad flat support favors native pair normal and exposes witness ownership as a separate issue.

Dynamic full-annular semantics remain open.

### Donor Outer-Carrier Dynamics

This lane uses the recovered donor `b3Wheel` outer-P75 carrier for bounded rolling/contact/traction/mount-feasibility questions.

It is useful dynamic evidence, but it does **not** validate full annular side/inner/bore contact.

The effective carrier is a three-point crowned convex profile after `b3MakeWheelProfile` reduction.

## 4. Trusted bounded donor-carrier evidence

### E2a2 recycler forensics

A bounded recycler/reprojection discrepancy is real. Reprojection is a necessary amplifier in the studied difficult transition and trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation discrepancy.

Forensic descent remains closed by default. No recycler patch is authorized without later representative material harm.

### RQ0 — aligned flat-road rolling

Qualified within scope:

- zero contact dropout/churn;
- point count `1..1`;
- microscopic rolling slip;
- real tangential friction coupling demonstrated by zero-spin positive control.

Limitation: world-axis planar locks make this an aligned laboratory baseline, not a representative tilted-wheel mount.

### RQ1 / Q1-A — bounded rolling transition

RQ1c crossed a real `30 µrad` two-face road-normal transition with one expected feature change, zero dropout and no material disturbance above matched flat control.

RQ1d's `0/+10/-10 µrad` cross-slope remained neutral while support-feature identity stayed unchanged.

Canonical Q1 language:

> no material recycler/contact pathology was demonstrated in the tested **bounded laboratory rolling-transition envelope**.

This is not a broad rough-road guarantee.

### RQ2a / RQ2b — bounded longitudinal traction

At matched `0.20 * mu*m*g*R`, `0.5 s` pulses:

- braking and drive both retain zero dropout/churn and point count `1..1`;
- braking max slip ≈ `0.0488758 mm/s`;
- drive max slip ≈ `3.67820 mm/s`;
- drive end-pulse rolling mismatch ≈ `2.92418 mm/s` and then relaxes;
- drive/brake max-slip ratio ≈ `75.256x`.

The sign asymmetry is a retained regression sentinel, not currently a material failure requiring micro-forensics.

## 5. RQ2c0 status

The original world-axis angular locks are unsuitable for trustworthy tilted-wheel claims.

A `b3ParallelJoint` local-axis angular guide is a useful bounded mount-feasibility apparatus, not yet a representative axle/suspension.

### RQ2c0a 120 Hz

Corrected executed evidence:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Contact/rolling equivalence was supportive. Corrected max axis tilt:

`148.785 µrad = 0.008525°`.

The historical `<100 µrad` gate failed, but audit established that this threshold was not derived from product geometry or from a future challenge/error budget. It is therefore not a mechanical/product requirement.

### RQ2c0b 240 Hz attempt

`cdb0babf2165a7599a123079b46928dbd392c13f / 33958792392 / 101286854234`

**APPARATUS_INVALID / NO PHYSICS RESULT.**

Composition failed before Box3D build/runtime. Do not describe this as a 240 Hz physics FAIL and do not resume it as a stiffness sweep.

## 6. RH0 — Research Foundation Hardening

Status: **ACTIVE; RH0.1–RH0.4 PASS; RH0.5 NEXT**.

### RH0.1 — evidence ledger — PASS

Canonical status/provenance is centralized in:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

### RH0.2 — invariant validation — PASS

`tools/wheel-mode5-evidence-ledger-validate.mjs`

and the replay contract prevent important overclaim/non-drift regressions.

### RH0.3 — explicit active RQ harness — PASS

The active donor-carrier execution path is now:

- suite: `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`
- adapter: `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`
- runner: `tools/wheel-mode5/rh0/wheel-mode5-rh0-canonical-rq-replay.mjs`
- workflow: `.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

The build uses pinned donor/E1/E2a composition plus **one normal versioned C++ suite and one thin include/binding adapter**. Active scenario identity is no longer encoded through RQ0/RQ1/RQ2 Python string-patch chains.

Historical RQ workflows/scripts remain provenance. Do not extend them for new research.

### RH0.4 — frozen replay + provenance cutover — PASS

Migration oracle:

`f38b82195b2032cba49815f79770ecf8e8abce2a / 33959870475 / 101289762819`

Explicit suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact:

`9968834538`

Canonical checkpoint:

`docs/WHEEL_MODE5_RH0_CANONICAL_RQ_SUITE_REPLAY_RESULT_2026-09-05.md`

The explicit suite reproduced the decision-relevant canonical metrics essentially bit-for-bit, including RQ1 topology and the RQ2 sign-asymmetry sentinel. No replay gate was widened.

The explicit suite is therefore the **active canonical donor-carrier apparatus**.

### RH0.5 — challenge-derived orientation scale/error budget — NEXT

Before any new orientation physics:

1. recover actual current JV/donor wheel/steering/suspension geometry relevant to orientation;
2. identify a physically meaningful first controlled orientation question;
3. choose its amplitude from that geometry/product need, not from numerical convenience;
4. state the physical signal expected from the challenge;
5. define allowable guide compliance clearly below that signal;
6. compare the existing `148.785 µrad` 120 Hz compliance against that budget;
7. only then decide whether 120 Hz is already sufficient, whether a stiffer guide is justified, or whether the guide architecture must change.

### RH0.6 — continuation branch decision — OPEN

The current branch is increasingly an evidence archive from discovery. After RH0.5, deliberately decide whether active work should continue here or move to a cleaner hardened continuation branch. Do not make branch hygiene a destructive cleanup campaign.

## 7. RH0 exit gate

RH0 closes only when:

- ledger and replay validators remain green;
- explicit suite remains the active apparatus;
- frozen RQ0/RQ1c/RQ2a/RQ2b behavior and the sign-asymmetry sentinel remain preserved;
- the next orientation challenge has a physically justified amplitude and apparatus-error budget;
- continuation branch ownership is deliberate rather than inherited by accident.

## 8. Post-RH0 physics direction

If RH0 closes cleanly, resume RQ2c as bounded **local-axis orientation feasibility**, one meaningful DOF at a time.

Candidates after evidence justifies them include:

- controlled camber or steer;
- orientation-sensitive/lateral contact response;
- controlled load transfer;
- wheel/carrier/chassis coupling;
- physically selected irregular-road cases;
- eventual bridge back to annular semantics when side/inner/bore exposure becomes decision-relevant.

When wheel/contact work becomes faithful and experiential, return to Owner Preview and hands-on judgement.

## 9. Explicitly not next

Do not by default:

- rerun 240 Hz merely to make the old `<100 µrad` gate green;
- tune `ParallelJoint` stiffness without a challenge-derived error budget;
- start camber/steer/load-transfer physics before RH0.5;
- reopen E2a2 micro-forensics;
- increase torque or terrain severity just to manufacture failure;
- extend historical RQ patch chains;
- call donor outer-P75 evidence full annular validation;
- promote wheel-mode5 to `main` or Owner Preview.

## 10. Fresh continuation

For wheel-mode5 continuation:

1. verify live product `main` and active research branch separately;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md`;
3. read this router;
4. validate the evidence ledger/replay contract when changing foundations;
5. use the explicit RH0 suite as active donor-carrier apparatus;
6. continue **RH0.5**, not RQ2c0b and not recycler archaeology;
7. open older experiment documents only when a ledger dependency or anomaly requires them.

Current boundary:

> **Steering I1 remains last Owner hands-on product truth; wheel-mode5 has scoped laboratory evidence; RH0.1–RH0.4 are complete with an explicit replay-qualified apparatus; RH0.5 physical orientation/error-budget grounding is next; no new physics or product promotion is authorized yet.**
