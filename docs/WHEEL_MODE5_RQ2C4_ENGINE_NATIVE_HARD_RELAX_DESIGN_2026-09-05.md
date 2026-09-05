# Wheel mode5 RQ2C4 — engine-native hard-relax direct guide

Date: 2026-09-05

Status: **PREDECLARED / NOT YET EXECUTED**

This is bounded research apparatus only. It does not alter accepted product `main`, Owner Preview, final wheel/suspension/steering architecture, or full annular-contact semantics.

## Evidence entering RQ2C4

RQ2C3 replaced the falsified helper-body carrier with one direct scalar local-axis constraint on the existing `b3ParallelJoint`.

The 0° RQ2C3 run was trusted and informative:

- frozen RH0 replay passed in the same patched build;
- contact/topology/vertical gates passed;
- angular axle-axis gate passed at `0.008528° <= 0.035°`;
- direct plane guidance was extremely tight (`0.003802 mm` max plane separation, `0.006862 mm` max cross-track);
- but max heading error was `0.049514° > 0.035°`;
- and max rolling slip was `0.034571 mm/s > 0.002 mm/s`.

Therefore the direct topology is strongly supported positionally but the RQ2C3 implementation is not a valid yaw-qualification apparatus.

## Pinned solver finding

Pinned Box3D hard equality constraints receive the solver's existing `useBias` flag.

For example, the prismatic point-to-line equality initializes:

- `bias = 0`;
- `massScale = 1`;
- `impulseScale = 0`;

and only when `useBias == true` replaces those values with positional bias and `base->constraintSoftness`.

Thus the solver lifecycle is:

- biased solve: soft positional correction;
- relaxation solve: hard velocity equality with no bias and no impulse softness.

Historical `b3ParallelJoint` does not accept `useBias`; RQ2C3 therefore applied finite-hertz softness to its experimental scalar guide during both phases.

## RQ2C4 question

Does making only the experimental scalar local-axis guide participate in the pinned engine's native solve/relax equality semantics remove the residual cross-heading velocity and rolling-slip gate failures, without changing the direct topology or any qualification threshold?

## Frozen apparatus

RQ2C4 keeps RQ2C3 unchanged except for the solver lifecycle semantic below:

- same donor outer-P75 `b3Wheel`;
- same flat road;
- same `1 m/s`, `mu=0.9`, gravity `9.81 m/s²`;
- same `1/240 s` step with four substeps;
- same static yaw-rotated reference -> one `b3ParallelJoint` -> wheel topology;
- no helper bodies;
- no world-axis locks;
- same angular guide `120 Hz`, damping `1.0`, `maxTorque=FLT_MAX`;
- same direct scalar local-Z / axle-axis guide;
- same generic guide tuning `240 Hz`, damping `2.0` for the biased positional solve;
- same yaw set `0 / +3.5 / -3.5°`;
- same frozen RH0.5 gates.

## Only permitted solver change

The transient RQ2C4 patch may:

1. change internal `b3SolveParallelJoint(base, context)` to `b3SolveParallelJoint(base, context, useBias)`;
2. pass the already-existing `useBias` argument from `b3SolveJoint` into ParallelJoint;
3. for the **experimental scalar linear guide only**:
   - if `useBias == true`, preserve RQ2C3 exactly: `bias`, `massScale`, `impulseScale` from `base->constraintSoftness`;
   - if `useBias == false`, use the pinned equality-relaxation values: `bias=0`, `massScale=1`, `impulseScale=0`.

The historical two-axis angular ParallelJoint solve must remain byte-for-byte equivalent in its equations and tuning. The experimental feature remains default-off.

No hertz change, no extra iteration, no helper-body mass, no new force limit and no threshold change are allowed.

## Execution barrier

Before RQ2C4 physics:

1. reconstruct pinned Box3D.js + donor wheel patch;
2. apply the already-executed RQ2C3 direct-guide patch;
3. layer only the RQ2C4 solve/relax patch;
4. build and run the pinned Box3D.js test suite;
5. replay the frozen RH0 canonical suite in that exact composition;
6. require frozen RH0 validation PASS.

Then execute `0°` only.

## Frozen 0° gates

Unchanged:

- contact dropouts `= 0`;
- feature-set changes `= 0`;
- contact point count `1..1`;
- settled Y range `0.50..0.90 mm`;
- settled max `|Vy|` `35..65 mm/s`;
- settled max rotated slip `<= 0.002 mm/s`;
- max axle-axis error `<= 0.035°`;
- max heading error `<= 0.035°`.

Plane separation, cross-track and cross-heading speed remain diagnostics only.

## Predeclared interpretation

- **0° PASS:** execute `+3.5°/-3.5°` immediately with no retuning.
- **0° FAIL with frozen RH0 PASS:** do not start a hertz sweep and do not relax the gates. Diagnose the remaining failing gate(s) from this now engine-native direct-equality apparatus before deciding whether the synthetic mount qualification itself needs redesign.
- **frozen RH0 FAIL:** no RQ2C4 physics claim; repair/reground the transient patch first.
- **yaw pair PASS after 0° PASS:** bounded evidence supports the synthetic rotated-heading direct local-axis mount for this donor outer-carrier laboratory case only. It is not final suspension/steering acceptance.
