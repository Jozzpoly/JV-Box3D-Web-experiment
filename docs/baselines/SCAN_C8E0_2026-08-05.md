# Recovered evidence — JV-Web car + E2R + JSPREV2 desktop scan line

Date reconciled: 2026-08-08
Source class: **recovered local source snapshot + raw historical Windows logs + direct owner observation**
Do not treat this file as current R1 behavior.

## 0. Why this record exists

The first recovered local `CAR_MAP_SCAN.md` was valuable but temporally incomplete: it described `c8e0bf...` while its final exact gate/review were still pending.

Later File Library recovery found the actual raw Windows execution for `c8e0bf...` and the direct owner feedback that followed it.

Therefore this file intentionally reconciles the evidence instead of preserving the stale local document literally.

Evidence order used here:

```text
raw exact run
> direct owner feedback tied to the run
> older local status document
> earlier planning notes
```

## 1. Recovery archive provenance

Old JV-Web source snapshot:

```text
JV-Box3D-Web-experiment(1).zip
SHA-256:
1b4657a69c69bf83e054d7f8f3535e6149e93506a03b1a811347c4c5e9e4a04f
```

Archived repository working HEAD:

```text
agent/jv-refoundation-control-plane
fd4d96fdf479e0d5649e49c73f1ce0cd68f52d0c
```

The archived working tree contained a modified local:

```text
docs/product-validation/CAR_MAP_SCAN.md
```

which helped reconstruct the historical sequence and known defects, but does not by itself define final c8e0 evidence status.

## 2. Relevant product lineage

```text
accepted early Web car baseline:
d6aa218064c2653f918cf7956d2fcd20a940caf3

scan integration line:
04713ab33ba8788d3ee404f2165484366b7a717b
84910b9c84edd33db5e1f09baf456f978f8368ca
106312083875b5aa94cf1f9fc986ac3c26888aa5
c8e0bf24748b0a790a1c0039b1be801eef266580

native E2R/scan source used historically:
Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142
```

## 3. `106312...` — first full green integrated checkpoint

Raw historical Windows evidence establishes exact target:

```text
106312083875b5aa94cf1f9fc986ac3c26888aa5
```

Environment and gate:

```text
Node: 24.16.0
npm:  11.17.0
TypeScript: PASS
tests: 251/251 PASS
docs/notices/portable build: PASS
JV WEB FOUNDATION GATE: PASS
JV WEB CAR + MAP + SCAN: SOURCE/PACKAGE/ASSET GATE PASS
```

Foundation gate log SHA-256:

```text
094be78abac3dad32ed7f4de3064dc0e9be65b5673032ed773db035a3a4980c7
```

Exact selected scan:

```text
source-preview-aee5242a20848294
7 tiles
25 groups
25 textures
1,775,775 triangles
```

Runtime/owner evidence at this stage established:

- accepted Web vehicle visible and controllable;
- E2R/offroad content present;
- rocks/bumper banks present;
- scan geometry rendered;
- scan Box3D collision worked;
- vehicle could be used on scan;
- map/scan switching worked.

Known visible defects at this checkpoint:

1. texture atlas appearance was scrambled/misaligned;
2. filtering was effectively LINEAR where pixel-style NEAREST was desired;
3. observer grid was always drawn;
4. primitive/debug vehicle remained active.

Interpretation:

```text
106312... = first full green integrated functional baseline
             + known visual defects
```

It remains extremely useful as the pre-fix causal baseline.

## 4. c8e0 visual-fix delta

Later product tip:

```text
c8e0bf24748b0a790a1c0039b1be801eef266580
message: fix(render): restore native scan UV and view controls
```

Relevant intended changes include:

```text
UNPACK_FLIP_Y_WEBGL = 0
NEAREST as default scan texture filter
live Pixels/Smoothing texture filter control
grid OFF by default + toggle
view settings preserved across map/scan
focused tests for settings/WebGL policy/UI wiring
```

The delta was deliberately limited to rendering/view/interface/tests rather than changing car physics, controls, map, scan collider or JSPREV2 parser.

## 5. `c8e0bf...` exact automated gate — PASS

An actual later raw Windows run exists and supersedes earlier plans that still described this gate as pending.

Exact identity:

```text
worktree branch: local/jv-web-car-map-scan-4
commit: c8e0bf24748b0a790a1c0039b1be801eef266580
Node: 24.16.0
npm: 11.17.0
receipt: 6a5cb337a7d4707946835e83e036365130c52459 (byte-exact)
```

Observed automated results:

```text
npm ci: PASS
typecheck: PASS
full test suite: PASS
docs: PASS
third-party: PASS
portable build: PASS
portable runtime assets: PASS
portable vehicle visual: PASS
portable paths/privacy/network/http: PASS
JV WEB FOUNDATION GATE: PASS
exact final JSPREV2 selection/deep validation: PASS
JV WEB CAR + MAP + SCAN: SOURCE/PACKAGE/ASSET GATE PASS
```

Gate log SHA-256:

```text
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

Selected scan contract:

```text
7 tiles
25 groups
25 textures
1,775,775 triangles
```

The integrated product then started at:

```text
http://localhost:5175
```

using that exact product worktree.

Interpretation:

```text
c8e0bf... = exact automated source/build/package/asset PASS
```

## 6. `c8e0bf...` direct owner observation

Direct feedback recorded immediately after the c8e0 validation/run states, in substance:

- scan displayed correctly;
- pixel smoothing was disabled by default and could be enabled;
- grid was disabled by default and could be enabled;
- vehicle collision worked correctly.

This binds the c8e0 visual fixes to real browser observation rather than code review alone.

Evidence class:

```text
OWNER OBSERVED — historical exact product line behavior
```

This should not be inflated into current-R1, public-R0, phone-scan or final-product acceptance.

## 7. Recovered teleport/rebuild debt

The same direct owner feedback identifies an important UX/performance issue:

- every map/scan teleport rebuilt the entire world;
- each teleport caused roughly one to several seconds of waiting;
- owner explicitly questioned why a location change required world reconstruction.

This is a real historical product issue, not a speculative future feature request.

Future location/teleport work should attempt to preserve world/scan correctness while decoupling simple repositioning from full reconstruction, provided lifecycle/ownership rules permit it safely.

## 8. Correct evidence classification

Use this classification going forward:

```text
106312...
  SOURCE/PACKAGE/ASSET GATE PASS
  integrated browser runtime observed
  known visual defects
  valuable causal pre-fix baseline

c8e0bf...
  SOURCE/PACKAGE/ASSET GATE PASS
  visual-fix code present
  integrated browser runtime launched
  OWNER OBSERVED:
    scan correct
    pixel filter control correct
    grid control correct
    collision correct
  known UX debt:
    teleport rebuilds world / multi-second wait
```

Do **not** describe c8e0 as "ungated" or "visual review pending" anymore.

Do **not** describe it as current R1 proof or mobile scan proof either.

## 9. Scan recovery implication for current R1

The strongest preserved desktop source to selectively recover from is:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

Recommended strategy:

1. map the exact current-R1 seams for world provider, renderer, private scan loading and lifecycle;
2. selectively reconcile c8e0 functionality rather than wholesale-merging its branch;
3. retain `106312...` as pre-fix comparison if the small c8e0 view delta becomes suspect;
4. establish the current accessible location of `source-preview-aee5242a20848294`;
5. validate the **new current-R1 integration**, not rerun old c8e0 merely to rediscover its historical PASS;
6. first establish desktop equivalence;
7. then perform real-phone scan observation;
8. optimize measured loading/render/texture/collision/memory bottlenecks only;
9. fix teleport world-rebuild behavior when integrating the product location system if safe.

## 10. Runtime pack boundary

The corresponding historical runtime pack is:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

The supplied `box3d.zip` does not contain that complete textured pack. It includes importer/cache code and a cooked `.b3mesh` collision cache, but that cache is not the original Web render asset.

Historical native documentation reports `1,770,391` triangles while exact Web gates report `1,775,775`; preserve the discrepancy and remeasure the actual pack when recovered.
