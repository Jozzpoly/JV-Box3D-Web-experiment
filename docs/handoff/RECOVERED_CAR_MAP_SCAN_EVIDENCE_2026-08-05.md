# Recovered evidence — first full green JV-Web car + E2R + JSPREV2 checkpoint

Date recovered: 2026-08-08
Source class: **user-supplied local source archive / uncommitted historical record**
Do not treat this file as current product state.

## Provenance

Recovered from:

```text
JV-Box3D-Web-experiment(1).zip
SHA-256:
1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f
```

Archive repository working HEAD:

```text
agent/jv-refoundation-control-plane
fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

Original local path inside that working tree:

```text
docs/product-validation/CAR_MAP_SCAN.md
```

The file was modified in the archived working tree and was not the same committed document present on the historical product branch. This preservation record exists so the evidence boundary is not lost when the ZIP is no longer in active context.

## Exact historical identity recorded by the source

```text
product branch:
product/jv-web-car-map-scan

active visual-fix candidate:
c8e0bf24748b0a790a1c0039b1be801eef266580

first full green integrated product:
106312083875b5aa94cf1f9fc986ac3c26888aa5

accepted Web car baseline:
d6aa218064c2653f918cf7956d2fcd20a940caf3

native E2R/scan source used by the product:
Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142
```

## What the archived source states was proven at `106312...`

Exact Windows run:

```text
Node:       24.16.0
npm:        11.17.0
TypeScript: PASS
tests:      251/251 PASS
docs:       PASS
notices:    PASS
portable:   PASS
```

The selected private JSPREV2 asset passed the product's exact validation path.

Recorded asset metrics:

```text
7 tiles
25 groups
25 textures
1,775,775 triangles
```

Recorded browser/product observation:

- the integrated product started in the browser on localhost port 5175;
- accepted Web vehicle was visible and controllable;
- E2R/offroad content was present;
- rock islands and bumper banks were present;
- private JSPREV2 geometry rendered;
- Box3D scan collision worked;
- vehicle could be used on the scan;
- map/scan target switching worked.

This recovered record therefore gives substantially stronger evidence than the existence of scan code alone. It identifies `106312...` as the first full green integrated car + E2R + scan checkpoint.

## Owner-visible defects recorded at the green checkpoint

The same record explicitly says the green product was not visually finished:

1. texture atlas output on the scan was visibly scrambled/misaligned;
2. filtering behavior was forced LINEAR;
3. the observer grid was always drawn;
4. the primitive/debug vehicle visual remained active.

These are not reasons to invalidate the working scan geometry/collision result. They define the exact boundary of what was and was not accepted.

## Later visual-fix hypothesis/candidate

The archived record points to:

```text
c8e0bf24748b0a790a1c0039b1be801eef266580
```

as the subsequent visual-fix candidate.

The code changes/policies associated with that tip include:

```text
UNPACK_FLIP_Y_WEBGL = 0
NEAREST as default scan texture filter
live Pixels/Smoothing filter controls
grid OFF by default + toggle
view settings preserved across map/scan
```

Focused TypeScript/code review and isolated policy tests were recorded as successful.

## Evidence boundary

The recovered local record does **not** provide evidence of:

- a complete exact Windows repository/product gate at `c8e0bf...`;
- owner visual acceptance of `c8e0bf...` on the real scan;
- completed phone validation/performance of the scan product.

Therefore:

```text
106312... = strong green integration evidence + known visual defects
c8e0bf... = plausible coded visual correction requiring fresh validation
```

A future agent must not collapse those two evidence classes into one.

## Scan recovery implication

The safest high-value recovery strategy is:

1. port/reconcile the known-working `106312...` geometry/collision/world integration into current `development/jv-web-r1`;
2. preserve current R1 car/runtime boundaries rather than wholesale-merging the old product branch;
3. selectively bring over the `c8e0...` UV/filter/view-policy changes with fresh focused tests and owner visual observation;
4. re-establish the real private pack location;
5. confirm desktop behavior first;
6. then test a real phone and optimize only measured bottlenecks.

Do not redesign the scan architecture before proving that the recovered old path actually requires redesign.

## Relationship to the full private scan asset

The corresponding native history identifies pack:

```text
source-preview-aee5242a20848294
```

The supplied `box3d.zip` does not include the complete textured JSPREV2 pack. It includes native scan importer/cache code and a cooked collision cache, but that cache is not the original Web render asset.

A native historical document reports `1,770,391` triangles while this recovered Web run reports `1,775,775`. Preserve the discrepancy and remeasure the actual pack when recovered instead of guessing which historical count is "correct".
