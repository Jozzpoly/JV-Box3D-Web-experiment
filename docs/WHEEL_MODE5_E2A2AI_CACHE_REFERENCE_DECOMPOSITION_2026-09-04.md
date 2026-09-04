# Wheel mode5 E2a2ai — cache/reference decomposition

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Input trusted checkpoint: `7e1b4c534119600cfacb2c3ce1054d5071024f3b` (E2a2ah)
Input executed workflow: `33865558771`, job `100999489386`

## Scope

E2a2ai is a **bounded derived mechanism analysis** over already-trusted, non-perturbing E2a2ah runtime telemetry plus a source audit of the pinned Box3D recycler path. It does not modify runtime physics and does not claim a new product-physics acceptance result.

The question is narrower than E2a2ah: where does the approximately `+0.118 mm` recycled-vs-fresh separation discrepancy arise?

Candidate explanations were:

1. stale `baseSeparation` accumulated over a long cache age;
2. the current `dot(dp, normal)` reprojection contribution;
3. a broader cache/reference-frame mismatch not reducible to simple age.

## Source-grounded recycler semantics

In pinned Box3D `physics_world.c`, a successful recycler shortcut computes:

`separation = baseSeparation + dot(dp, normal)`

where `dp` is reconstructed from the current body-center difference and cached-anchor rotations relative to `cachedRotationA/B`.

Crucially, the shortcut then executes `continue`. The normal cache refresh below the shortcut therefore does **not** run on a recycled step. On a non-recycled step the contact path refreshes:

- `cachedRotationA`;
- `cachedRotationB`;
- `cachedRelativePose`;

and later caches each manifold point's current `separation` into `baseSeparation`.

Therefore cache/reference age can be inferred from the spacing between recycler shortcuts in the bounded single-contact apparatus: an intervening non-recycled outer step refreshes the reference state.

## Re-analysis of executed E2a2ah telemetry

The motion-window E2a2ah shadow sequence around the transition occurs at steps:

`423, 425, 427, 429, 431, 433, 435, 437`

with `sequenceDelta = 1` at each sampled recycler event. The one-step gaps (`424`, `426`, `428`, etc.) are non-recycled contact updates and therefore traverse the cache-refresh path. Around the transition, the recycled contact is consequently using a reference generated only **one outer step earlier**, not a long-lived stale pose.

This falsifies the simple hypothesis that the `~0.118 mm` gap is primarily caused by many-step cache-age accumulation.

### Separation decomposition — matched feature 259

Representative E2a2ah values:

| step | base separation | reprojection term | recycled separation | fresh separation | base - fresh | recycled - fresh |
|---:|---:|---:|---:|---:|---:|---:|
| 423 | `-124.156 um` | `+124.693 um` | `+0.536 um` | `-118.017 um` | `-6.139 um` | `+118.554 um` |
| 425 | `-124.514 um` | `+124.693 um` | `+0.179 um` | `-118.017 um` | `-6.497 um` | `+118.196 um` |
| 427 | `-124.693 um` | `+124.693 um` | `~0 um` | `-118.613 um` | `-6.080 um` | `+118.613 um` |
| 429 | `-126.541 um` | `+124.931 um` | `-1.609 um` | `-119.805 um` | `-6.735 um` | `+118.196 um` |
| 431 | `-127.912 um` | `+122.368 um` | `-5.543 um` | `-123.858 um` | `-4.053 um` | `+118.315 um` |
| 433 | `-131.667 um` | `+123.322 um` | `-8.345 um` | `-126.600 um` | `-5.066 um` | `+118.256 um` |
| 435 | `-134.289 um` | `+123.560 um` | `-10.729 um` | `-129.223 um` | `-5.066 um` | `+118.494 um` |
| 437 | `-136.554 um` | `+123.799 um` | `-12.755 um` | `-131.011 um` | `-5.543 um` | `+118.256 um` |

Two facts are decisive in this bounded regime:

1. `baseSeparation` is already close to the same-transform fresh narrow-phase result: the residual is only about `4–7 um` in these representative samples.
2. The reprojection contribution is roughly `+122–125 um`, and adding it produces essentially the entire observed `~+118 um` recycled-vs-fresh discrepancy.

Thus the large discrepancy is **not already present in baseSeparation**. It is introduced overwhelmingly by the shortcut's reprojection/reference transform step.

This is consistent with the causal E2a2ae/ag ablations: removing the reprojection contribution collapsed the amplified transient close to the recycle-off path. E2a2ai now shows the same conclusion from a decomposition of non-perturbing telemetry rather than from an intervention alone.

## What this does and does not establish

### TRUSTED DERIVED MECHANISM EVIDENCE

Supported in the validated fixed-road `2 -> 1`, spin `5 rad/s`, crossing `20 urad/s`, recycle-distance `0.05 m` apparatus:

1. Long-lived cache age is not required for the separation discrepancy; around the transition the recycler reference is typically only one outer step old.
2. Cached `baseSeparation` is within single-digit micrometers of fresh separation in representative matched-feature samples.
3. The `dot(dp, normal)` reprojection contribution is about `+0.123–0.125 mm`, while the final recycled-vs-fresh error is about `+0.118 mm`.
4. Therefore the dominant discrepancy is introduced by the reprojection/reference-frame transformation, not inherited as a large stale `baseSeparation` error.
5. This independently reinforces the E2a2ae/ag causal result that reprojection is the necessary amplifier of the measured transient in this bounded case.

### NOT ESTABLISHED

- That the algebraic form `baseSeparation + dot(dp, normal)` is generically wrong for ordinary Box3D contacts.
- Whether the mismatch is specific to the custom wheel contact/anchor semantics, rapid wheel spin, this two-point flat-P75 carrier, or a more general recycler reference-frame issue.
- Which sub-term inside `dp` (center delta, rotated `anchorA`, rotated `anchorB`, normal frame) is responsible.
- Fixed-road `1 -> 2` behavior.
- Frictional rolling, full annular wheel geometry, free camber/steer, side/inner/bore contacts, or product integration.

## Interpretation

The frontier has moved. A generic "cache age" experiment is now low value: the relevant cache is already young when the discrepancy is present.

The next useful falsifier should target the **reprojection geometry itself**, not cache lifetime. The cleanest next bounded diagnostic is a non-perturbing term decomposition on the same fixed-road `2 -> 1` case that records, for each recycled matched point:

- current center-difference contribution;
- rotated cached `anchorA` contribution;
- rotated cached `anchorB` contribution;
- the normal used by the active manifold;
- the resulting dot-product components;
- corresponding fresh point/normal geometry.

A particularly high-value secondary axis is wheel spin while retaining recycler eligibility, because the current apparatus combines very slow crossing with `5 rad/s` spin. If the erroneous term scales primarily with spin rather than with the crossing motion, that would strongly implicate how recycled cached anchors are transformed for this rotating wheel contact.

Do not patch production recycler semantics yet and do not broaden into friction/full-wheel work until this reference-frame question is resolved.
