# Wheel mode5 E2a2t — source-predicted native 1↔2 support transition

Date: 2026-09-03
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source head: `ab697815c907d89882aa71d7ea5a0b0620d5b39c`
Workflow run: `33808749243`
Job: `100825364444`

## Question

Is the observed native wheel-plane `2 point -> 1 point` transition explained exactly by the pinned donor's support-feature tolerance, including float32 quantization and symmetry under which tread endpoint is slightly lower?

## Source mechanism

Pinned donor `src/wheel_shape.c` defines:

```c
#define B3_WHEEL_EPS 1.0e-6f
```

For `b3WheelProfileSupportFeature`:

```c
float value = profile[i].x * axial + profile[i].y * radialLength;
...
float tolerance = b3MaxFloat( B3_WHEEL_EPS, 8.0f * FLT_EPSILON * ( 1.0f + fabsf( bestValue ) ) );
```

Adjacent support values within that tolerance are classified as one support segment. Otherwise the maximum is a unique vertex.

`b3CollideWheelAndPlane` maps that classification directly:

- `feature.index1 == feature.index2` -> one manifold point,
- otherwise -> two endpoints / two manifold points.

Speculative distance gates whether the selected support feature exists at all. It does not promote nearby profile samples into a wider footprint.

For the flat P75 support case:

- float32 radius: `0.5455107688903809 m`,
- source-predicted support tolerance: **`1.4739139260200318 µm`**.

Therefore the experiment predicted topology from the source before execution:

- effective support-value difference `<= 1.473913926 µm` -> two points,
- difference `> 1.473913926 µm` -> one point.

## Falsifier

Fixed requested bias grid (mm):

`0, 0.0010, 0.0012, 0.0013, 0.0014, 0.00145, 0.00147, 0.0015, 0.0016, 0.0018, 0.0020`

Every value was tested for:

- lowered axial endpoint `-1`,
- lowered axial endpoint `+1`,
- spin `0`,
- spin `40 rad/s`.

Total: **44 cases**.

The E2a2q coupled solver remained in the seam only so the dynamic carrier used the currently validated normal-solver path; topology prediction itself came only from the pinned support-feature source formula.

## Executed result

All **44/44** cases matched the source-predicted topology.

Most discriminating adjacent float32 cases:

| requested bias | effective bias | source prediction | observed |
| ---: | ---: | --- | --- |
| `0.00145 mm` | **`1.430511474609375 µm`** | 2 points | stable `2/2` |
| `0.00147 mm` | **`1.4901161193847656 µm`** | 1 point | stable `1/1` |

Thus:

- source tolerance = `1.473913926 µm`,
- largest observed two-point effective difference = **`1.430511475 µm`**,
- smallest observed one-point effective difference = **`1.490116119 µm`**.

The transition therefore occurs exactly where the pinned source model predicts, to the resolution available from the float32 profile values.

Sign symmetry also held:

- lowering the `-axial` endpoint or the `+axial` endpoint produced the same effective bias and the same point-count classification,
- in the one-point regime the surviving feature swapped correctly to the geometrically higher endpoint (`65795` vs `259`),
- spin 0 vs 40 did not change topology classification.

## Warm-start source grounding

Pinned Box3D contact update copies previous `normalImpulse` by `featureId`:

```c
if ( pt2->featureId == pt1->featureId )
{
    pt2->normalImpulse = pt1->normalImpulse;
    pt2->persisted = true;
}
```

A new point without a matching previous feature ID starts with zero normal impulse.

Therefore a native `2 -> 1` transition should preserve warm start for the surviving vertex instead of resetting the entire contact. A `1 -> 2` transition should preserve the existing vertex impulse while the newly appearing second constraint begins with zero warm start.

## Classification

### TRUSTED EXECUTED

- The flat-support native `1↔2` topology boundary is explained by the donor's explicit support-feature equality tolerance.
- The measured boundary agrees with the source formula at float32 resolution.
- The classification is symmetric under which endpoint is lower.
- Spin about the wheel axis does not move this boundary under the tested controls.
- The surviving vertex has stable profile-derived feature identity.

### FALSIFIED / RETIRED INTERPRETATION

The transition should no longer be described as an unexplained manifold collapse or as a speculative-distance effect. It is an intentional rigid support-feature classification with a tiny numeric equality band around a mathematically parallel segment.

### IMPORTANT PHYSICAL INTERPRETATION

For an ideal rigid flat tread against a plane, a true two-endpoint support segment exists only when the tread segment is parallel to the plane. Any real non-parallel orientation has a unique support vertex. The ~1.474 µm band is numerical equality tolerance, not a physical tire contact-patch width or compliance model.

### NOT YET VALIDATED

- whether crossing the 1↔2 boundary during continuous physical motion introduces a meaningful impulse / velocity / torque transient,
- whether partial feature-ID warm-start persistence is sufficient to make that crossing dynamically benign,
- friction/tangential behavior through the transition,
- arbitrary side/inner contacts,
- product/runtime suitability.

## Next bounded gate

Test **continuous physical crossing** of the source-predicted support-feature boundary while preserving the validated geometry and normal-solver seam.

The next experiment should vary relative wheel/plane orientation continuously across the threshold rather than mutate wheel profile geometry. It should measure point-count transitions, feature persistence, per-point impulse birth/death, total normal impulse, body vertical velocity/position and angular response at the exact transition steps.

Do not add friction yet. First isolate whether the normal-contact topology transition itself is dynamically benign or produces a discontinuity worth addressing.
