# Wheel Mode5 RQ1d — signed cross-slope same-feature relative-normal result

Date: 2026-09-05

Status: **TRUSTED EXECUTED EXPERIMENTAL EVIDENCE**

This checkpoint does not alter accepted `main`, Owner Preview, product authority, bore/inner/side validation, or the status of a future native annular wheel shape.

## Question

After RQ0 qualified steady rolling and RQ1c survived a small longitudinal road-normal transition, does a small signed road-normal component along the wheel axle remain dynamically stable when the effective donor support feature is held constant?

This is deliberately not a free-camber test and not a topology-switch test.

## Apparatus

RQ1d is derived from the qualified RQ0 carrier and preserves:

- donor outer-P75 `b3Wheel`,
- wheel local/world spin axis `Z`,
- 1 m/s matched rolling,
- friction `0.9`,
- warm starting enabled,
- fixed static box-road contact family,
- planar axle locks (`linearZ`, `angularX`, `angularY`),
- no drive/brake torque,
- no recycler manipulation,
- no E2a2 diagnostic solver patches.

Only the static flat road is rotated around world `X`, so its normal obtains a signed `Z` component without introducing longitudinal grade acceleration.

Tested banks:

- `0 µrad`,
- `+10 µrad`,
- `-10 µrad`.

Actions run: `33955901494`

Job: `101279082268`

Source commit: `10bdaf41f18f6c5560f7db52437d9917108471fd`

Artifact: `wheel-mode5-rq1d-cross-slope-result` (`9966367600`)

## Important apparatus correction

RQ1d was initially designed under a hypothesis inherited from the unreduced recovered profile: flat support was expected to be a support segment with a tiny segment-to-vertex transition near `5.83 µrad`.

That hypothesis was falsified before accepting any dynamic result.

The executed effective-carrier probe (`33955759171`) showed that donor `b3MakeWheelProfile` reduces the recovered outer carrier to exactly three points:

| index | axial (m) | radius (m) |
|---:|---:|---:|
| 0 | -0.21875 | 0.5056460499763489 |
| 1 | -0.13330078125 | 0.5455107688903809 |
| 2 | +0.21875 | 0.5056460499763489 |

Flat support is therefore a unique crowned central vertex, index `1`.

Geometric equality with the neighbouring support vertices occurs only around:

- index 0: `+25.010515°`,
- index 2: `-6.460409°`.

Thus `0/+10/-10 µrad` are correctly classified as a **same-support-feature relative-normal perturbation**, not a topology crossing.

The two earlier RQ1d failures are apparatus/interpretation evidence, not dynamic failures.

## Executed support semantics

All three runs selected the same effective donor support feature:

- support first = `1`,
- support last = `1`,
- support point count = `1`.

Actual settled manifold normals resolved the road rotation:

- flat: `normal.z = 0`,
- `+10 µrad`: `normal.z ≈ -10.185912 µrad`,
- `-10 µrad`: `normal.z ≈ +10.199745 µrad`.

The signed sum is only about `0.0138 µrad`, so the response is effectively antisymmetric at this scale.

## Dynamic result

| metric | flat | +10 µrad | -10 µrad |
|---|---:|---:|---:|
| settled contact dropouts | 0 | 0 | 0 |
| settled feature-set changes | 0 | 0 | 0 |
| manifold point-count range | 1..1 | 1..1 | 1..1 |
| Y range | 0.674605 mm | 0.674665 mm | 0.674725 mm |
| max abs Vy | 48.942976 mm/s | 48.942883 mm/s | 48.932623 mm/s |
| max abs Vz | 0 | 0 | 0 |
| mean abs rolling slip | 0.0000933 mm/s | 0.0000943 mm/s | 0.0000933 mm/s |
| max abs rolling slip | 0.0004172 mm/s | 0.0004172 mm/s | 0.0004172 mm/s |
| mean normal impulse | 0.03592990 | 0.03592673 | 0.03592698 |
| normal impulse std | 0.01217211 | 0.01217262 | 0.01217310 |

Relative to flat:

- `+10 µrad` Y-range ratio = `1.00008835`,
- `-10 µrad` Y-range ratio = `1.00017671`,
- max-|Vy| ratios are approximately `1.0`,
- max-slip ratio = exactly `1.0` for both signed banks,
- contact-dropout delta = `0`,
- feature-change delta = `0`.

Signed `+/-` difference:

- Y-range difference ≈ `-0.0000596 mm`,
- max-|Vy| difference ≈ `0.01026 mm/s`,
- max-slip difference = `0`,
- final Vx difference = one float-scale step (`1.192e-7 m/s`),
- final omega difference = `-4.768e-7 rad/s`.

## Verdict

Within this deliberately narrow representative regime, a small signed axial component of the road normal is **not a material disturbance** when support identity remains on the same continuous donor profile vertex.

RQ1d therefore provides no evidence that contact recycling or the E2a2 static/dynamic semantics should be reopened.

It also demonstrates that the earlier tiny segment-to-vertex threshold belonged to the unreduced profile model, not to the effective donor dynamic carrier.

## What this does not validate

RQ1d does **not** validate:

- a genuine wheel-profile support topology crossing,
- realistic large camber or bank,
- free suspension/mounting dynamics,
- lateral tire force physics,
- bore/inner/side contacts,
- a native annular wheel shape,
- arbitrary terrain topology,
- product or Owner Preview acceptance.

The next RQ1 challenge should be qualitatively different rather than merely increasing the cross-slope angle until the effective donor carrier changes support vertex.
