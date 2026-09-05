# JV-Web — bounded spawn landmark calibration

Date: 2026-09-05

Status: **PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE**

This document records a bounded post-wheel product investigation. It is branch-local evidence and does **not** change canonical product authority, accepted executable runtime, or the closed RQ2C wheel verdict.

## 1. Exact provenance

Live product/source/documentation authority is always:

`Jozzpoly/JV-Box3D-Web-experiment/main`

Resolve `main` live. This work branch was forked from the exact product/code checkpoint:

- fork point: `main@5b28cc03d22264010680deb95a04abd04661bc22`
- fork-point tree: `b37a19380f934bd3da796a7e9989872b6617fdab`

After this branch was created, `main` advanced by a **documentation-only** routing consolidation. That later docs advance does not change the runtime baseline used by this investigation.

Canonical accepted Owner Preview executable source remains:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Accepted JSPREV2 static input remains:

- repository: `Jozzpoly/JV-Box3D-Web-Public`
- commit: `a325c279cfe63a0607dba33c3c635a1716e09f8f`
- receipt: `receipts/jv_friends_scan_receipt.json`
- pack id: `scan/photogrammetry-primary`

This work branch is:

`work/spawn-landmark-calibration-2026-09-05`

No spawn implementation from this branch has been promoted to `main` or canonical Owner Preview.

## 2. Owner problem being investigated

The Owner had previously reported that the car spawned in a poor place and wanted the start moved to open space or, preferably, onto the road.

The bounded question here is therefore:

> Can existing accepted scene/scan evidence identify a better, physically valid start candidate without guessing a semantic road location or reopening broader vehicle work?

This is not a map redesign and not a new wheel/steering campaign.

## 3. Important hypothesis falsified

An earlier working interpretation said that the bad Owner start was caused by `scanCenterSpawn()` selecting the geometric center of the scan AABB.

**That interpretation is false for the relevant ordinary Owner Preview startup.**

Exact source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` proves:

- `parseProductSpawnTarget("")` resolves to `"map"`;
- `"scan"` is opt-in through `?jvSpawn=scan`;
- ordinary default startup therefore resolves to `world.spawn`, not `scanCenterSpawn()`.

Accepted product world defines:

```text
world.spawn = { x: 0, y: 1.2, z: 0 }
```

The accepted JSPREV2 transform places the scan approximately from world `z = 320` to `z = 1419`.

Therefore the stronger current interpretation is:

- default spawn is physically valid on the synthetic map;
- but it is spatially/semantically far from the intended photogrammetry village/road playground;
- the evidence does **not** show that an AABB-center collision bug caused the original Owner complaint.

This correction must be preserved in future reasoning.

## 4. Existing metadata cannot name a road

The exact accepted scan receipt contains provenance, file hashes, byte counts and geometry metrics, but no semantic road/village/start landmark.

No previously approved road coordinate was recovered from the repository evidence inspected in this investigation.

Therefore hard-coding a guessed `x/z` and calling it a road would be unsupported.

## 5. Primary geometry analysis

Branch-local analyzer:

- `tools/spawn-analysis/jsprev2-spawn-landmark-analysis.mjs`

Machine-readable evidence:

- `docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json`

Before the first accepted execution, self-review found and fixed a real methodological bug: initial raster keys depended on a running `minimumX/minimumZ`, making results potentially tile-order dependent. That version was not used as evidence. The retained analyzer uses order-independent absolute local-grid coordinates.

The accepted pack was re-read and verified directly:

- tiles: `7`
- vertices: `1,409,687`
- indices: `5,327,325`
- triangles: `1,775,775`
- every tile's byte size and SHA-256 matched the accepted receipt

Primary classification:

`GEOMETRIC_SAFE_SPAWN_CANDIDATES_FOUND_NOT_ROAD_SEMANTICS`

Key primary measurements:

- raw flat cells: `31,084`
- qualified flat cells: `15,576`
- low-flat cells: `11,096`
- raw geometric candidates: `3,075`

The primary ranking was explicitly not treated as semantic truth.

## 6. Independent crosscheck

A second method was intentionally made different from the primary triangle-centroid raster:

- analyzer: `tools/spawn-analysis/jsprev2-spawn-candidate-crosscheck.mjs`
- evidence: `docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json`
- signal: encoded vertex normals + candidate-local 1 m occupancy
- no primary global-raster phase

Crosscheck classification:

`GEOMETRIC_CANDIDATE_REGIONS_CROSSCHECK_STABLE_NOT_SEMANTIC`

Primary top-20 ranks that passed the independent crosscheck:

`2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 19`

Importantly, primary rank `#1` was rejected by the crosscheck because its occupied height range was `1.0319 m`, above the frozen `1.0 m` limit.

Therefore:

- the exact ranking is not robust enough to be treated as authority;
- the existence of several broad, flat and geometrically stable regions **is** supported by two methods;
- neither method can establish that a region is a road rather than a roof, yard, courtyard, parking area or another flat structure.

## 7. Opt-in calibration candidates

A minimal candidate slice was added only on this work branch in `src/scene/product-spawn.ts`.

New opt-in targets:

- `?jvSpawn=scan-cal-a`
- `?jvSpawn=scan-cal-b`
- `?jvSpawn=scan-cal-c`

They were selected from crosscheck-passing regions with deliberate spatial separation rather than simply taking primary ranks 1–3:

| Target | Source rank | Pack-local X/Z |
| --- | ---: | --- |
| `scan-cal-a` | 6 | `35.25, -59.25` |
| `scan-cal-b` | 3 | `54.75, -36.75` |
| `scan-cal-c` | 4 | `110.25, -11.25` |

Safety properties:

- `map`, `offroad` and existing `scan` behavior remain unchanged;
- default remains `map`;
- calibration targets are opt-in only;
- calibration is pinned to exact pack id `scan/photogrammetry-primary`;
- `x/z` are evidence-derived pack-local coordinates;
- `y` is **not** hard-coded — runtime resolves actual collision-surface height again;
- missing scan, wrong pack or missing collision surface fails closed;
- code deliberately does not call any candidate a road.

Implementation commit:

- `8c21cc8cdbadaf1185fecaba848028a86df5cf8c`

Focused tests commit:

- `6b66afd7105b521c9f0d39cf0ded8d504e02ebe9`

## 8. Validation result

Temporary validation run performed before workflow cleanup:

- run: `33979257193`
- job: `101341374863`
- tested branch commit: `9038433f2418af550da5368eb2ce34d02ee26fb5`
- Node: `v24.16.0`
- npm: `11.13.0`

Observed:

- `npm ci`: PASS
- `npm run typecheck`: PASS
- test suite: `523 total / 516 pass / 7 fail`
- every new spawn calibration test: PASS

The seven failures are in pre-existing steering/mobile UI tests, not the spawn code:

1. direct wheel rotation expected `POSITION -0.75`, actual `-0.2`;
2. steering interaction provider test expected `-0.75`, actual `-0.2`;
3. `pointercancel` test expects artificial recenter to `0`, current behavior preserves `-0.2` while releasing ownership;
4. `lostpointercapture` has the same stale centering expectation;
5. steering-range integration source-regex expects an older literal range-button representation;
6. fullscreen lifecycle expects `POSITION 0`, current behavior emits `RELEASE`;
7. mobile UI source-regex expects an older literal `matchMedia(...)` formatting/shape.

These failures were provenance-checked as pre-existing baseline debt. Relevant source/test blob SHAs are identical between the product fork point and the spawn candidate branch, including:

- `tests/clean-browser-host-joystick.test.mjs`: `bb4ec97a3c4802cb0ec7fa7092b618eb33e90d9e`
- `src/app/clean-browser-host.ts`: `5c8f4b718ebba2a0973a471ce5d7afd19b08ed9d`
- `src/input/pointer-steering-joystick-adapter.ts`: `4c5fd42b7a6727af57a4acf8451f68dfc0b586db`
- `src/product-controls.ts`: `dbbfda7b2ea47274b1d4ddd7b91f03a02bb91880`

Because the later live `main` advance is documentation-only, those runtime/test blobs remain unaffected by that documentation consolidation.

No steering/UI source or test was changed merely to make this spawn investigation green.

Because `npm run check` stopped at those seven baseline failures, that run did **not** execute:

- `npm run build:portable`
- `tools/validate-build-identity.mjs`
- final `git diff --check`

A separate isolated local build could not be obtained in the available environment because repository/archive network retrieval was unavailable there.

Therefore candidate portable build remains **UNVERIFIED**. It must not be promoted on the strength of focused tests alone.

## 9. Workflow cleanup

Three temporary GitHub Actions workflow files used during this bounded investigation were removed from the work branch after evidence collection.

No workflow from this investigation is intended to become permanent project infrastructure.

## 10. Verdict

**PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE**

Supported claims:

- the earlier `scanCenterSpawn()` explanation of the original default-start problem was wrong;
- accepted default spawn is spatially outside/before the accepted scan playground;
- accepted scan metadata has no semantic road landmark;
- multiple broad flat candidate regions exist and survive two different geometry checks;
- A/B/C opt-in targets are bounded, pack-pinned and surface-resolved;
- focused spawn tests and TypeScript typecheck pass;
- the seven observed full-suite failures are pre-existing steering/UI baseline debt, not spawn regressions.

Not supported yet:

- that A, B or C is a road;
- that any candidate is the Owner-preferred spawn;
- that the candidate portable build passes;
- that the candidate is ready for `main`, Owner Preview canonical pointer, Pages or publication.

## 11. Natural next gate

Do **not** add more geometry heuristics merely to manufacture a semantic answer.

The next useful gate is one bounded Owner calibration comparison of A/B/C in an exact candidate preview after a portable build is independently qualified.

Owner judgement should answer only:

- is this visibly a sensible place to start?
- is one candidate on/near the desired road or otherwise clearly better?
- if none are right, reject all three and obtain an explicit semantic landmark rather than tuning geometry thresholds to the desired answer.

Only after one candidate is Owner-accepted should a minimal product spawn change be prepared and revalidated for possible promotion.
