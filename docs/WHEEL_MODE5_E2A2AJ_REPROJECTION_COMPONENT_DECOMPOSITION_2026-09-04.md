# Wheel mode5 E2a2aj — reprojection component decomposition and forensic stop boundary

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Input trusted checkpoint: `16925ad7577e5e5b46dfb26c663e25aafe834d1a` (E2a2ai)
Successful executed workflow: `33894429237`, job `101093611255`
Executed head: `0067728d81dc1929a467dd562dd739d24ab6d0d0`

## Scope

E2a2aj is the deliberately final planned deep-forensic probe in the current E2a2 recycler investigation. It does not change product physics and does not propose a recycler fix.

The bounded question was whether the already-localized recycled separation reprojection

`dot(dp, normal)`

could be cleanly attributed to one source term in the validated fixed-road `2 -> 1` case. The authoritative recycler expression was decomposed exactly as:

- center term: `dot(dc, normal)`;
- wheel/body-A cached-anchor term: `-dot(rA, normal)`;
- support/body-B cached-anchor term: `dot(rB, normal)`;
- recomposed term: `center + anchorA + anchorB`.

The final apparatus is intentionally live-only and non-perturbing. It does not run shadow narrow phase, feature matching, manifold replacement, solver changes, recycler-policy changes or cache changes.

## Interrupted/apparatus provenance

Two earlier attempts in this iteration are **HISTORICAL-ONLY apparatus provenance** and are not physics evidence.

1. Workflow `33893921936` stopped during patch composition before build/runtime because the first E2a2aj patch assumed one E2a2ah telemetry reset site while the inherited diagnostic had two.
2. Workflow `33894081524` passed the new E2a2aj patch but failed during build because the inherited E2a2ah shadow-feature apparatus referred to `b3ManifoldPoint.id`, which is not present in the reconstructed pinned manifold-point structure used by this composition.

Rather than alter old shadow-feature semantics to make the new experiment pass, E2a2aj was simplified to the narrower apparatus actually required by the question: direct telemetry over the authoritative recycler path plus a cloned trusted fixed-road E2a2af runner.

Neither failed attempt reached the E2a2aj runtime experiment and neither is used below.

## Successful apparatus validation

Workflow `33894429237` passed:

- pinned Box3D.js recovery;
- pinned vendor Box3D identity;
- donor wheel patch recovery/application;
- all prerequisite solver/binding composition gates;
- `git diff --check`;
- Box3D.js build;
- Box3D.js test suite;
- the E2a2aj runtime assertions.

The diagnostic preserved exact equality with the uninstrumented E2a2af baseline for the bounded physics outputs asserted by the runner, including:

- fixed static road and zero ground transform writes;
- one `2 -> 1` transition at step `430`;
- `90` recycled motion steps;
- transition `dVy = 0.00019686052110046148 m/s`;
- topology/contact continuity and final-state telemetry covered by the test.

Therefore the component telemetry did not measurably perturb the tested physics path.

Algebraic closure also passed:

- maximum `abs((center + anchorA + anchorB) - dot(dp, normal))` = `3.722379915416241e-8 m` (~`0.037 um`);
- maximum `abs((baseSeparation + reprojection) - recycledSeparation)` = `0` in emitted float telemetry.

Status of the measurement apparatus: **TRUSTED EXECUTED / NON-PERTURBING COMPONENT DIAGNOSTIC**.

## Result

Across near-transition recycled points, mean absolute terms were approximately:

| term | mean absolute magnitude |
|---|---:|
| center `dot(dc,n)` | `0.645389929 m` |
| `-dot(rA,n)` | `0.545392891 m` |
| `dot(rB,n)` | `0.099872729 m` |
| final reprojection residual | `0.000124296 m` (~`124.30 um`) |

The crucial result is not that the center term has the largest absolute value. The three source terms are large and strongly cancelling. Their summed absolute magnitude is roughly **10,384 times** the magnitude of the final reprojection residual.

Representative point 0 values show the same structure:

- step `423`: `+0.645393431 - 0.545393050 - 0.099875666 = ~+0.000124715 m`, authoritative reprojection `+0.000124693 m`;
- step `431`: `+0.645387769 - 0.545393288 - 0.099872112 = +0.000122368 m`, equal to the authoritative reprojection at emitted precision;
- step `437`: `+0.645380855 - 0.545393646 - 0.099863403 = ~+0.000123806 m`, authoritative reprojection `+0.000123799 m`.

Across those samples the center and support-anchor terms themselves move by similar micrometer-scale amounts in opposite directions while the final residual remains near `0.123–0.125 mm`.

## Interpretation correction

E2a2aj **falsifies the naive attribution strategy** "choose the largest absolute subterm and call it the cause".

The output field `dominantComponentByMeanAbs` in the executable result is descriptive only and must **not** be interpreted as causal dominance. In this geometry, the reprojection is an ill-conditioned residual of much larger cancelling frame/anchor terms. A causal attribution would require a reference-state/delta decomposition (or another explicitly comparative construction), not comparison of absolute term magnitudes.

This does not weaken the prior E2a2 evidence that reprojection is the necessary amplifier of the measured transient. E2a2ae/ag causally removed that amplification by removing the reprojection contribution, while E2a2ah/ai independently showed the ~`0.118 mm` recycled-vs-fresh separation discrepancy and localized the discrepancy overwhelmingly to reprojection rather than stale `baseSeparation`.

What E2a2aj changes is the next question: the residual cannot responsibly be assigned to `dc`, `rA` or `rB` from absolute decomposition alone.

## Evidence status after E2a2aj

### TRUSTED EXECUTED / DERIVED within the bounded fixed-road `2 -> 1` regime

- Recycler-associated transient amplification is real in the validated apparatus.
- It is not explained primarily by crossing speed, global warm start or carried `normalImpulse`.
- Actual recycled-manifold shortcut execution is required for the amplification.
- Separation reprojection is a necessary amplifier in both transformed-ground and fixed-road causal tests.
- Fresh narrow phase and recycled separation differ by about `0.118 mm` in the trusted shadow diagnostic.
- `baseSeparation` is already within single-digit micrometers of fresh separation in representative matched samples; the large discrepancy is introduced overwhelmingly by reprojection/reference transformation.
- Long-lived cache age is not required around the transition.
- The authoritative reprojection algebra is now independently decomposed and numerically closed, but its small residual is produced by cancellation of much larger terms and is not cleanly attributable to one absolute component.

### NOT VALIDATED / OPEN

- Fixed-road `1 -> 2` external validity.
- Full annular wheel contact behavior under representative rolling.
- Frictional rolling and traction consequences.
- Free camber/steer and load-transfer behavior.
- Side/inner/bore contacts and irregular-road contact topology.
- Whether the bounded ~`0.12 mm` recycled/fresh discrepancy is materially harmful in representative vehicle dynamics.
- Any production mitigation or recycler change.
- Any general claim that Box3D's recycler formula is wrong for ordinary contacts.

## Forensic stop decision

**Do not open E2a2ak by default.**

The current forensic descent has crossed the point where another reference-frame micro-experiment is clearly more valuable than testing the mechanism in a representative wheel regime. E2a2 has done its job: it localized a real laboratory anomaly, eliminated several alternative explanations, transferred the key causal result to fixed road, and produced enough telemetry to recognize the remaining attribution problem without pretending it is solved.

If later representative wheel evidence shows that recycler reprojection is materially damaging real wheel behavior, the forensic lane can be reopened with a justified reference-state/delta decomposition and spin-sensitive falsifier. Until then, that work is deferred rather than silently assumed necessary.

## Next frontier

The next research stage should move **up one level** to a bounded representative wheel-mode5 qualification rather than patching the recycler.

The first rig should keep the road truly fixed and reuse existing diagnostics observationally, but introduce the smallest representative set needed to ask whether the discovered recycler discrepancy matters to actual wheel physics: intended annular wheel geometry, nonzero friction/rolling, controlled normal load and a bounded contact/topology challenge. The primary outcome should be material behavior — energy injection/jitter, grip discontinuity, topology instability or chassis/wheel disturbance — not reproduction of a laboratory `dVy` number for its own sake.

No product promotion is authorized by E2a2aj. Canonical `main` and Owner Preview remain outside this research branch.
