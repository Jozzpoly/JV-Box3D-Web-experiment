# Wheel mode5 E2a2s1 — micro-bias native two-point retention result

Date: 2026-09-03
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source head: `e0f5698c65111de05c267d2ec9c4c754a973de0d`
Workflow run: `33806594572`
Job: `100818433258`

## Scope

E2a2s1 measured whether the validated E2a2q coupled two-point normal solver can actually receive a native two-point wheel/ground manifold when the diagnostic support endpoints have a very small unequal radial height.

Controls remained fixed:

- pinned Box3D.js / Box3D donor provenance,
- validated E2a2q coupled 2x2 normal mini-LCP,
- horizontal ground,
- friction = 0,
- X/Y angular lock,
- spin cases 0 and 40 rad/s,
- same diagnostic two-endpoint carrier used by E2a2s0.

The requested bias grid was fixed before execution. E2a2s1 additionally measured the effective support bias after the `b3Wheel` float/canonicalization path, so a requested microscopic bias was not counted as nonzero unless the actual wheel profile retained a nonzero radius difference.

Requested bias grid (mm):

`0, 0.0001, 0.00025, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5`

## Executed result

The native two-point unequal-separation regime exists, but is extremely narrow.

| requested bias | effective bias | topology after impulse | coupled pair solve |
| ---: | ---: | --- | --- |
| 0 mm | 0 mm | stable 2/2 | active, 3840 calls |
| 0.0001 mm | 0.0001192093 mm | stable 2/2 | active, 3840 calls |
| 0.00025 mm | 0.0002384186 mm | stable 2/2 | active, 3840 calls |
| 0.0005 mm | 0.0004768372 mm | stable 2/2 | active, 3840 calls |
| 0.001 mm | 0.001013279 mm | stable 2/2 | active, 3840 calls |
| 0.002 mm | 0.002026558 mm | stable 1/1 | inactive, 0 calls |
| 0.005–0.5 mm | nonzero as requested | stable 1/1 | inactive, 0 calls |

The topology classification was the same for spin 0 and spin 40.

At the largest retained unequal case, requested `0.001 mm` / effective `0.0010132789611816406 mm`:

- both feature IDs remain stable: `259` and `65795`,
- no contact dropouts,
- no feature-set changes,
- no contact-id changes,
- 350 settled pair geometry samples,
- measured settled separation delta exactly matches the effective profile bias,
- pair solver executes 3840 times,
- axis tilt remains 0 degrees.

For spin 0, the settled mean normal impulses split slightly but measurably:

- feature 259: `0.0012523643672466278`,
- feature 65795: `0.0011639539152383804`.

For spin 40:

- feature 259: `0.0012524678661221904`,
- feature 65795: `0.001163850131311587`.

At requested `0.002 mm` / effective `0.0020265579223632812 mm`, the manifold becomes exactly one point (`259`) and the pair solver is never called.

## Classification

### TRUSTED EXECUTED

- An effectively nonzero native two-point unequal-separation regime exists.
- The largest tested retained effective bias is about `1.013 µm`.
- The smallest tested one-point effective bias is about `2.027 µm`.
- Therefore the observed 2→1 native manifold transition lies inside that bounded interval for this diagnostic carrier and these controls.
- The transition result is independent of the tested spin 0 / 40 classification.

### FALSIFIED

The stronger interpretation suggested by E2a2s0 — that any nonzero support-height bias immediately collapses the native manifold to one point — is false.

### NOT YET VALIDATED

- Exact transition threshold inside ~1.013–2.027 µm.
- Sign symmetry of the transition when the opposite endpoint is lowered instead.
- Order invariance of the coupled solver in the retained unequal-separation regime.
- Dynamic semantics of crossing the 1↔2 topology boundary under continuous physical motion.
- Frictional/tangential coupling at the transition.
- Product/runtime suitability.

## Next bounded gate

Use the largest pre-qualified retained unequal case, requested bias `0.001 mm`, as a strict canonical↔reversed manifold-point order falsifier. Do not tune the bias after seeing reversal results.

If the E2a2q coupled solver remains invariant under point reversal there, the remaining frontier moves away from two-point solver ordering and onto the native 1↔2 manifold/active-set transition itself.
