# Wheel mode5 RH0 — Research Foundation Hardening closure

Date: 2026-09-05  
Owner: Jozz  
Closing branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

## Verdict

**RH0 CLOSED / FOUNDATION HARDENED / NEW BOUNDED ORIENTATION QUALIFICATION MAY PROCEED**

RH0 was opened because the wheel-mode5 discovery branch had accumulated enough experiment-specific patch/workflow machinery that apparatus composition itself became a material source of error. The failed RQ2c0b composition was the concrete trigger.

RH0 did not change accepted product `main`, Owner Preview, Box3D recycler semantics or wheel-mode5 physics claims. It hardened how new evidence is produced and interpreted.

## Closure evidence

### RH0.1 — canonical evidence ledger — PASS

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

The current research state is represented with explicit source/run/job/artifact/status/scope/reopen provenance and separate annular-contact vs donor-outer-carrier evidence lanes.

### RH0.2 — invariant validation — PASS

Machine checks protect the important boundaries, including:

- RQ2c0b has no physics result;
- Q1 remains bounded to the tested laboratory rolling-transition envelope;
- the RQ2 braking/drive transient asymmetry remains visible;
- the original `acos` tilt result remains instrument-invalid;
- the historical `<100 µrad` threshold cannot silently become product truth.

Latest pre-closure foundation validation after apparatus cutover:

`33964189804` — **SUCCESS**.

### RH0.3 — explicit active apparatus — PASS

Active donor-carrier execution is now a normal versioned suite:

- `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`
- `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`
- `tools/wheel-mode5/rh0/wheel-mode5-rh0-canonical-rq-replay.mjs`
- `.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

New active scenarios no longer need to clone already-patched helpers through another scenario-specific Python string patch.

### RH0.4 — frozen replay / provenance cutover — PASS

Explicit-suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact:

`9968834538`

Checkpoint:

`docs/WHEEL_MODE5_RH0_CANONICAL_RQ_SUITE_REPLAY_RESULT_2026-09-05.md`

The suite reproduced canonical RQ0/RQ1c/RQ2a/RQ2b behavior essentially bit-for-bit, including the RQ1 two-face transition and the ~`75.256x` drive/brake max-slip sentinel.

Historical RQ workflows/patches remain provenance and migration evidence. They are no longer the active extension point.

### RH0.5 — physically grounded next challenge / error budget — PASS

`docs/WHEEL_MODE5_RH0_5_ORIENTATION_CHALLENGE_AND_ERROR_BUDGET_2026-09-05.md`

Accepted `main` establishes a degree-scale product steering mechanism:

- current native config max steering: `32°`;
- current JV-Web temporary driving full lock: `35°`;
- source-registered FL steering axis: `+Y` through wheel center;
- wheel spin axis: knuckle-local `Z`.

The next qualification is therefore a yaw-rotated RQ0-equivalence question, not arbitrary camber and not a stiffness sweep.

Selected bounded orientation set:

`0° / +3.5° / -3.5°`

where `3.5°` is exactly 10% of the current `35°` driving full-lock scale.

Challenge-derived angular/heading apparatus budget:

`1% of 3.5° = 0.035° = 610.865 µrad`.

The previous corrected 120 Hz max guide error (`148.785 µrad = 0.008525°`) is about `0.244%` of the intentional angle and about `4.11x` inside this new budget. That does not retroactively change the old 100 µrad FAIL; it removes the rationale for pre-emptive 240 Hz tuning before the new physically grounded experiment.

The new test must remove the remaining world `linearZ` lock, qualify a fully translational-free `0°` control first, then interpret the mirrored yaw pair only if that control is valid.

## RH0.6 — continuation branch decision

**Decision: stop extending the E2a-named discovery branch after RH0 closure and start a semantically clean continuation branch from the exact RH0 closing head.**

Target continuation branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Why branch now:

- the old branch name describes an earlier forensic stage and now miscommunicates active intent;
- it has become a valuable evidence/discovery archive;
- the active apparatus no longer requires understanding the historical patch chain to add a bounded scenario;
- a branch boundary gives future agents a clear post-hardening provenance checkpoint.

Why branch from the RH0 closing head rather than rebuild from `main` now:

- the explicit suite still legitimately depends on pinned E1/E2a donor composition and current canonical evidence files;
- transplanting only a guessed subset onto `main` would create a second recovery project and risk losing provenance/dependency assumptions;
- Git history depth itself is no longer the execution-path complexity after RH0.3;
- a cosmetic branch from `main` is not worth reintroducing apparatus uncertainty.

The old branch is therefore an **archival research ancestor**, not deleted or rewritten. The new continuation branch should become the only active wheel-mode5 execution home after creation.

## First post-RH0 stage

The next bounded stage is the orientation/mount qualification defined by RH0.5:

1. extend the explicit RH0 suite, not historical patch chains;
2. carry `120 Hz`, damping `1.0` unchanged;
3. remove world linear-Z lock;
4. run fully translational-free `0°` control;
5. if control passes, run `+3.5° / -3.5°` rotated-heading cases;
6. use rotated-frame slip and stable `atan2` axis/heading telemetry;
7. stop after classification.

No torque pulse, suspension/chassis integration, lateral slip-angle demand, camber sweep, recycler work or 240 Hz campaign belongs in the same stage.

## Product boundary

Accepted product authority remains:

`main@5b28cc03d22264010680deb95a04abd04661bc22`

Steering I1 remains the last Owner hands-on product acceptance. RH0 closure authorizes only continued laboratory research with a hardened apparatus; it does not authorize product promotion.
