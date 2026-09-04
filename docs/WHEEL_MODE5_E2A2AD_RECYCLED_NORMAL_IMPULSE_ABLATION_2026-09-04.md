# Wheel mode5 E2a2ad — recycled normal-impulse ablation

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Trusted execution source: `9fa916e3f735f4303d5aa1c8cf6fecf2b3736355`
Workflow run: `33845301383`
Job: `100935770435`

## Scope

E2a2ad is a **bounded causal ablation**, not product-physics acceptance.

It continues the E2a2y/z/aa/ab/ac static-ground flat-P75 apparatus at:

- wheel spin `5 rad/s`;
- crossing angular speed `20 urad/s`;
- static 5 m support moved through `b3Body_SetTransform` before each step;
- E2a2q coupled normal solve;
- friction `0`;
- global warm starting **ON**;
- both `2 -> 1` and `1 -> 2` support-feature crossings.

E2a2ac established that recycler eligibility/cadence alone is insufficient: bypassing the recycled-manifold shortcut into fresh `b3UpdateContact` collapsed the amplified transient to the recycle-off path. E2a2ad asks one level deeper whether **solver-carried normal impulse state inside the recycled manifold** is necessary for that amplification.

## Intervention

On normal recycled-manifold shortcut steps only, after the existing cached anchors are reprojected into the current separation and the manifold point is marked `persisted=true`, the test arm sets:

`mp->normalImpulse = 0`

for each recycled manifold point.

Everything else in the shortcut remains intact:

- recycler eligibility;
- cached `anchorA` / `anchorB`;
- `baseSeparation` and current separation reprojection;
- `persisted` semantics;
- shortcut `continue`;
- contact identity;
- global warm-start setting.

Because friction is zero in this apparatus, normal impulse is the relevant solver-carried warm-start quantity under test.

Arms:

1. `recycle-normal`: `recycleDistance=0.05`, unchanged shortcut;
2. `recycle-zero-normal-impulse`: `recycleDistance=0.05`, same shortcut but recycled-point `normalImpulse` cleared;
3. `recycle-off`: `recycleDistance=0` control.

## Apparatus provenance

The first attempted execution at source `d098638d381c212de7a3ea157dce60e67337922d` stopped during composition because the test patch expected the wrong indentation depth for the donor-composed recycled-point block. Recovery and donor patch application had succeeded; no native/WASM build or runtime test occurred. This is **HISTORICAL-ONLY apparatus failure**, not physics evidence.

The anchor was corrected against the actual donor-composed source. The second execution at `9fa916e3f735f4303d5aa1c8cf6fecf2b3736355` passed donor recovery, composition, `git diff --check`, Box3D.js build/tests, and the E2a2ad runtime runner.

## Validity gates

For both crossing directions:

- normal and local-ablation arms: `recycledStepsMotion = 90 / 180`;
- the local ablation does not change transition timing relative to normal recycling:
  - `2 -> 1`: step `310` in both;
  - `1 -> 2`: step `350` in both;
- `contactDropoutsMotion = 0`;
- `contactIdChangesMotion = 0`;
- exactly one old feature persists through each topology switch;
- the intervention actually executed:
  - `2 -> 1`: `395` recycled manifold points zeroed over the full run;
  - `1 -> 2`: `305` points zeroed.

Therefore the causal comparison preserves recycler cadence and topology timing while changing the targeted solver-carried state.

## Executed result

| arm | direction | transition dVy | max |Vy| during motion |
|---|---|---:|---:|
| recycle-normal | `2 -> 1` | `+0.198434 mm/s` | `0.291349 mm/s` |
| zero recycled normal impulse | `2 -> 1` | `+0.194605 mm/s` | `0.287806 mm/s` |
| recycle-off | `2 -> 1` | `-0.048312 mm/s` | `0.048350 mm/s` |
| recycle-normal | `1 -> 2` | `+0.248166 mm/s` | `0.248412 mm/s` |
| zero recycled normal impulse | `1 -> 2` | `+0.215195 mm/s` | `0.275565 mm/s` |
| recycle-off | `1 -> 2` | `+0.000855 mm/s` | `0.001517 mm/s` |

Relative to normal recycling, locally removing carried normal impulse reduces the measured transition dVy by approximately:

- `1.93%` for `2 -> 1`;
- `13.29%` for `1 -> 2`.

The ablated recycler remains far from the recycle-off/fresh-manifold control in both directions.

## Causal verdict

### TRUSTED EXECUTED / BOUNDED CAUSAL EVIDENCE

Supported:

1. **Carried recycled `normalImpulse` is not necessary for the amplified transition transient.** The amplification largely survives when that state is cleared only on recycled shortcut steps.
2. Carried normal impulse is **not completely irrelevant**: it measurably modulates the `1 -> 2` case and weakly modulates `2 -> 1`.
3. E2a2ab's global warm-start result was not merely hidden by its broader baseline confound. A local intervention reaches the same stronger conclusion: the dominant cause lies elsewhere inside the recycled-manifold shortcut.
4. Combined with E2a2ac, the remaining causal mass shifts toward **reused manifold geometry / cached anchors + separation reprojection / skipped fresh narrow-phase update**, rather than ordinary solver impulse carry.

Not supported:

- that `normalImpulse` never matters in representative wheel contact;
- that all solver-carried state has been eliminated (only the normal impulse field was directly ablated here);
- that any observed transient is acceptable or unacceptable for the final vehicle.

## Current classification

### CURRENT ACCEPTED

Canonical JV-Web product `main` remains separate and untouched by this experiment.

### TRUSTED EXECUTED

The causal chain now includes E2a2y, E2a2z, E2a2aa, E2a2ab, E2a2ac, and E2a2ad in their documented bounded scopes.

### OPEN

Which remaining geometry/update semantic inside the recycled shortcut is responsible for most of the amplification:

- reuse of cached manifold anchors / `baseSeparation`;
- separation reprojection from those cached anchors;
- persisted feature semantics beyond normal-impulse carry;
- omission of fresh narrow-phase manifold generation/update.

### NOT VALIDATED

- final acceptability threshold for a real wheel;
- full annular wheel geometry;
- frictional rolling;
- free camber / steering dynamics;
- side / inner / bore contact;
- representative road interaction;
- product integration.

### HISTORICAL-ONLY

- the first E2a2ad composition failure at `d098638d...`;
- prior superseded/broken apparatus runs already classified historical in earlier checkpoints.

## Natural boundary / next move

Do not do another global warm-start or recycle-distance sweep.

The best next bounded split is **fresh geometry with controlled state restoration**:

1. retain the same recycler eligibility/cadence trigger;
2. on an eligible step, run the normal fresh narrow-phase/contact update so manifold geometry is regenerated;
3. restore only explicitly matched prior state (starting with normal impulse by feature ID) after the fresh update;
4. compare against normal recycle, force-fresh, and recycle-off controls.

This is the cleanest next test of whether **stale/reused geometry itself is the dominant necessary ingredient**. It should be implemented against the actual donor-composed `b3UpdateContact` feature-matching path, not by clearing or copying the entire manifold struct.
