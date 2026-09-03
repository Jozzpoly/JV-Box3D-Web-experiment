# Wheel mode5 E2a2p — simultaneous two-point normal-solve result

Date: 2026-09-03

Status: **TRUSTED EXECUTED experimental evidence**. This is not product acceptance and not a production solver design.

## Question

E2a2o established that, under the E2a2k-r2 no-rotational-separation counterfactual, reversing only the two otherwise identical flat-support manifold points flips the sign of the off-axis response while leaving scalar dynamics unchanged. The pinned convex solver updates body velocity and angular velocity after point 0 before solving point 1.

E2a2p asks a narrower causal question:

> If the first two normal impulses are both computed from the same pre-point body state, and only then applied together, does the order-selected off-axis symmetry breaking disappear?

The E2a2p intervention is intentionally a diagnostic simultaneous/Jacobi pair solve. It does **not** include the cross-coupling term K12 and is **not** claimed to be a production block/LCP solver.

## Authority and provenance

Repository: `Jozzpoly/JV-Box3D-Web-experiment`

Experimental branch:
`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Valid source HEAD:
`d616d53c3052df936f50a1f9388d2f07e1947f66`

Pinned Box3D.js:
`2617a0ff763a60c9f17cee57c6ea72aab75a5077`

Pinned Box3D submodule:
`8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

Wheel donor reconstruction remains the already-pinned `B3X-WHEEL-001` patch derived from `Jozzpoly/Box3d_FunProject` and the previously recovered P75 annular-profile provenance.

The test remains under E2a2k-r2's **diagnostic no-rotational-anchor separation** counterfactual. That intervention is not a production proposal.

## Apparatus

Workflow:
`.github/workflows/wheel-mode5-e2a2p-simultaneous-two-point-falsifier.yml`

Relevant tools:
- `tools/wheel-mode5-e2a2p-patch-simultaneous-two-point-solve.py`
- `tools/wheel-mode5-e2a2p-r2-normalize-generated-tabs.py`
- `tools/wheel-mode5-e2a2p-patch-tilt-lock-binding.py`
- `tools/wheel-mode5-e2a2p-simultaneous-two-point-falsifier.mjs`
- prior E2a2o point-order reversal tool
- prior E2a2k-r2 no-rotational-separation tool

Matrix:
1. sequential no-rot baseline,
2. simultaneous/Jacobi canonical point order,
3. simultaneous/Jacobi reversed wheel-plane point order.

Each solver build runs:
- free P75 wheel spin 0 / 40 rad/s,
- angular-X/Y locked P75 wheel spin 0 / 40 rad/s,
- matched one-point sphere spin 0 / 40 rad/s control.

The matched-sphere control is deep-compared across solver variants.

## Invalid setup attempts

These runs are **APPARATUS-INVALID** and are not physics evidence for the simultaneous intervention.

### Run 1 — `33799770974`, job `100796110127`

The runner required `e2a2iRunMatchedSphereSpinAxisControl`, but the workflow had not composed the historical b→…→i binding chain. No E2a2p physics intervention executed.

### Run 2 — `33800186032`, job `100797543654`

After adding b→…→i, the historical E2a2m patch encountered duplicated runner anchors created by the historical diagnostic cloning chain. No E2a2p physics intervention executed.

Resolution: an E2a2p-only composition helper isolates exactly the base E2a2 function and reconstructs the already-validated X/Y tilt-lock control without modifying historical evidence tools.

### Run 3 — `33800393037`, job `100798215675`

The fresh sequential baseline executed and reproduced the prior result, but the simultaneous solver build failed because the generated C block contained literal `\\t` escape text. The simultaneous intervention therefore remained apparatus-invalid.

Resolution: a narrow r2 normalizer changes only literal `\\t` inside the E2a2p-generated block into real tab characters and fails if any literal escape remains.

## Valid execution

Workflow run:
**`33800662568`**

Job:
**`100799100020`**

Conclusion: **success**

All stages completed:
- pinned donor recovery,
- composed diagnostic bindings,
- sequential build/test + execution,
- simultaneous patch + syntax normalization,
- simultaneous canonical build/test + execution,
- wheel-plane point reversal,
- simultaneous reversed build/test + execution,
- matched-sphere cross-build equality checks.

## Sequential no-rot baseline

The valid run reproduces E2a2o/E2a2n's free no-rot state.

| Metric | Result |
|---|---:|
| spin40 - spin0 final Y | `-0.15866756439208984 mm` |
| spin40 - spin0 final Vy | `+0.004972150961634725 m/s` |
| total impulse ratio 40/0 | `1.2078119230167232` |
| spin40 point-count range | `1..2` |
| spin40 feature-set changes | `116` |
| spin40 final axis tilt | `0.2654081881046295 deg` |
| spin40 final angular X | `+0.15037032961845398 rad/s` |
| spin40 final angular Y | `-0.017656784504652023 rad/s` |
| spin40 final angular Z | `39.99922180175781 rad/s` |

The X/Y-locked control remains near invariant:

| Metric | Result |
|---|---:|
| final Y delta | `-0.0002980232238769531 mm` |
| final Vy delta | `-6.860524166540927e-7 m/s` |
| total impulse ratio 40/0 | `1.000394201006796` |
| point-count range | `2..2` |
| feature-set changes | `0` |
| axis tilt | `0 deg` |

## Simultaneous/Jacobi canonical result

With both first-two normal impulses computed from the same pre-point state and then applied together:

| Metric | Result |
|---|---:|
| spin40 - spin0 final Y | `-0.00017881393432617188 mm` |
| spin40 - spin0 final Vy | `-0.000002307587351424445 m/s` |
| total impulse ratio 40/0 | `1.000368854468691` |
| spin40 point-count range | `2..2` |
| spin40 feature-set changes | `0` |
| contact-ID changes | `0` |
| spin40 final axis tilt | `0 deg` |
| spin40 final angular X | `0 rad/s` |
| spin40 final angular Y | `0 rad/s` |
| spin40 final angular Z | `40 rad/s` |

The free and X/Y-locked results are numerically identical in the reported comparison metrics.

Detailed free states:

### spin0
- settled total impulse mean: `0.019323619082570076`
- final Y: `0.5454694032669067`
- final Vy: `2.927146852016449e-6`
- final angular XYZ: `0 / 0 / 0`

### spin40
- settled total impulse mean: `0.019330746685819966`
- settled total impulse std: `6.4497153598606945e-6`
- final Y: `0.5454692244529724`
- final Vy: `6.19559500592004e-7`
- final angular XYZ: `0 / 0 / 40`
- point-count range: `2..2`
- feature-set changes: `0`

Relative to the fresh sequential reference, the simultaneous intervention removes the observed off-axis state:
- angular X delta: `-0.15037032961845398 rad/s`
- angular Y delta: `+0.017656784504652023 rad/s`
- axis-tilt delta: `-0.2654081881046295 deg`

The large free spin-dependent impulse excess is also removed in this apparatus.

## Reversed point order

The wheel-plane manifold point order was then reversed using the same E2a2o intervention while keeping the simultaneous solver.

The complete reported result is identical to simultaneous canonical.

`deltaFromReference` between simultaneous-reversed and simultaneous-canonical is exactly zero for:
- free final Y,
- free final Vy,
- free angular X,
- free angular Y,
- free axis tilt,
- free impulse mean,
- locked final Y,
- locked impulse mean.

This is **exact order invariance in the measured E2a2p apparatus**.

## One-point matched-sphere control

The one-point matched-sphere control remains exactly equal across sequential, simultaneous canonical and simultaneous reversed builds.

For both solver variants:
- settled total impulse mean: `0.01932389661669731`
- settled final impulse mean: `0.0024163182824850082`
- settled Y range: `0`
- final Y: `0.5454419851303101`
- final Vy: `0`
- spin0 final angular Z: `0`
- spin40 final angular Z: `40`

This supports the intended narrowness of the E2a2p intervention in the tested one-point lane.

## Evidence verdict

E2a2p provides **TRUSTED EXECUTED causal evidence** that, in the isolated P75 two-point flat-support setup under E2a2k-r2 no-rot separation:

1. the sequential point-wise state update is responsible for the E2a2o order-selected off-axis symmetry breaking;
2. computing the first two point impulses from one common pre-point state removes the measured order dependence;
3. the off-axis angular response, tilt, 1↔2 topology churn and feature churn disappear together;
4. canonical and reversed point order become exactly invariant in the reported metrics;
5. the tested one-point matched-sphere lane remains unchanged.

E2a2p also falsifies the concern that a simple uncoupled simultaneous/Jacobi pair necessarily produces an obvious instability in this exact symmetric flat-support case. It does **not** establish that the uncoupled Jacobi method is physically correct for general two-point contact.

## NOT VALIDATED

E2a2p does **not** validate:
- a production wheel solver,
- the E2a2k-r2 no-rotational-separation intervention as production semantics,
- general simultaneous/Jacobi contact solving,
- arbitrary two-point manifolds,
- unequal/asymmetric two-point loads,
- tilted/cambered support,
- localized/shoulder contact,
- frictional contact,
- coupled normal effective mass (`K12`),
- complementarity handling for the two-point patch,
- general SIMD lane point-count semantics,
- dynamic vehicle integration,
- Owner/product acceptance.

## Next gate

The next bounded question should not be "ship Jacobi".

It should test a **coupled two-point normal solve** that accounts for the cross-contact effective-mass term `K12`, with a canonical/reversed invariance oracle and the same one-point sphere control.

Before implementing that experiment, derive the 3D `K12` expression directly from the pinned Box3D Jacobian/effective-mass conventions. Then test at least:
1. sequential no-rot baseline,
2. E2a2p simultaneous/Jacobi,
3. coupled two-point solve,
4. coupled solve with reversed order,
5. one-point sphere control,
6. an unequal/asymmetric two-point case after the exact symmetric flat-support closure.

The coupled experiment remains diagnostic until those gates are resolved.
