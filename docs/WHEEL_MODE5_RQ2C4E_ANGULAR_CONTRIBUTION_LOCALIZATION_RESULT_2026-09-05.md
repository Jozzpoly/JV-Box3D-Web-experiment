# Wheel mode5 RQ2C4E — angular contribution localization result

Date: 2026-09-05

Status: **TRUSTED DIAGNOSTIC / 0° BLOCKER LOCALIZED ONE LEVEL DEEPER**

Classification: **`RQ2C4E_MAX_WITNESS_RESIDUAL_ROLLING_PAIR_DOMINANT`**

This is bounded donor-carrier research evidence only. It is not product acceptance, yaw qualification, a stiffness result, or a causal attribution to the contact solver.

## Question

At exact RQ2C4D 0-degree physics, does the real support-witness tangential residual come mainly from:

- incomplete cancellation of COM translation and pure axle spin (`rolling pair`), or
- angular velocity not parallel to the current axle (`non-spin` / nutation)?

## Provenance

Trusted executed source:

`14b500c7f174c7107316fd9b31ef92b74964f501`

Successful workflow:

- run: `33971215026`
- job: `101319952137`
- artifact: `9970989529`
- artifact digest: `sha256:6ed6bdb6d137b575b3136364e55ec988e242a93ef404c9510c780a3863b283c4`

The immediately preceding apparatus commit `c25fe41169fc173c822180fadedadb6050d7eb7a` produced run `33971047347`, which stopped during workflow composition because two sanity-check `grep` expressions searched for literal escaped quotes. Both telemetry patches and adapters had already composed. Commit `14b500c7...` changed only those two workflow assertions; C++ telemetry, physics, validator and thresholds were unchanged. The failed run never reached build or physics and carries no physical evidence.

## Trust barrier

The successful run passed, in order:

1. exact pinned native/donor recovery;
2. RQ2C4 + RQ2C4D + RQ2C4E read-only composition;
3. full Box3D.js build/tests;
4. frozen RH0 replay and validator;
5. exact RQ2C4 0-degree physics;
6. RQ2C4 primary non-drift;
7. RQ2C4D actual-witness non-drift;
8. rigid-body reconstruction integrity.

`+3.5°/-3.5°` remained unexecuted.

## Decomposition

Using the actual support witness and actual local COM:

- `vTranslation = vCOM`;
- split angular velocity into current-axle `omegaSpin` and orthogonal `omegaNonSpin`;
- `vSpin = omegaSpin × rWorld`;
- `vNonSpin = omegaNonSpin × rWorld`;
- project each onto the rolling heading;
- define `rollingPair = translationTangent + spinTangent`.

The reconstructed point velocity `vCOM + vSpin + vNonSpin` was checked against authoritative `b3Body_GetLocalPointVelocity` before attribution.

## Reconstruction integrity — PASS

- mean absolute scalar error: `0.000017450 mm/s`;
- max absolute scalar error: `0.000063921 mm/s`;
- max vector error: `0.000119209 mm/s`.

All are below the predeclared `0.001 mm/s` instrument limit and far below the `~0.034 mm/s` signal.

## Settled localization

Actual witness:

- mean absolute: **`0.008013017 mm/s`**;
- max absolute: **`0.034093857 mm/s`**.

COM translation:

- mean signed: `+999.996551 mm/s`;
- max absolute: `1000.004530 mm/s`.

Pure axle spin tangent:

- mean signed: `-999.988103 mm/s`;
- max absolute: `999.997735 mm/s`.

Rolling pair (`translation + pure axle spin`):

- mean signed: **`+0.008447882 mm/s`**;
- mean absolute: **`0.008471062 mm/s`**;
- max absolute: **`0.034570694 mm/s`**.

Non-spin / nutation tangent:

- mean signed: `-0.001052397 mm/s`;
- mean absolute: `0.001736834 mm/s`;
- max absolute: `0.010048026 mm/s`;
- max non-spin angular speed: `0.021131953 rad/s`.

The rolling-pair signed mean is **99.726%** of its mean absolute magnitude, so its settled residual is overwhelmingly one-signed rather than a symmetric oscillation around zero.

## Peak actual-witness sample

At the exact sample where `|actual witness slip|` is maximal:

- actual witness: **`+0.034093857 mm/s`**;
- COM translation: `+1000.004530 mm/s`;
- pure axle spin: `-999.969959 mm/s`;
- rolling pair: **`+0.034570694 mm/s`**;
- non-spin: **`-0.000464480 mm/s`**;
- reconstructed witness: `+0.034106215 mm/s`;
- scalar reconstruction error: `+0.000012358 mm/s`.

At the blocker peak, the rolling pair is about **101.4%** of the actual witness residual; non-spin contributes only about **1.36%** of witness magnitude and slightly cancels the rolling-pair residual.

## Final sample

- rolling pair: `+0.005602837 mm/s`;
- non-spin: `-0.001601277 mm/s`;
- reconstructed witness: `+0.004001559 mm/s`;
- actual witness: `+0.003993511 mm/s`.

Non-spin is therefore not globally irrelevant; it can materially cancel part of the smaller residual late in the run. It is simply **not the primary source of the maximum blocker**.

## Decision

RQ2C4E changes the routing:

1. **Do not run a 240 Hz angular-mount comparison now.** The trusted data do not identify 120 Hz angular compliance/nutation as the main maximum-slip source.
2. The remaining maximum 0-degree blocker is localized primarily to incomplete cancellation of **COM translation + pure current-axle spin**.
3. This is not yet causal attribution. RQ2C4E does not distinguish spin-rate evolution from change in the exact spin/support lever geometry, nor does it assign either to the contact solver.
4. Actual-witness max slip is **17.0469×** the frozen `0.002 mm/s` gate. `+3.5°/-3.5°` remains blocked.

## Next bounded move

Predeclare **RQ2C4F rolling-pair closure localization** on the exact same 0-degree physics with read-only telemetry only.

The next diagnostic should separate the rolling-pair residual exactly into state evolution from its initialized rolling closure:

- change in COM tangential velocity;
- change in axle spin rate;
- change in the exact geometric spin lever from current axle and actual support witness.

Require frozen RH0, RQ2C4 primary non-drift, RQ2C4D witness non-drift and RQ2C4E reconstruction integrity before interpretation. Do not execute yaw, change stiffness, change contact parameters or relax any gate.
