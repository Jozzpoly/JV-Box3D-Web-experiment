# JV-Web — spawn calibration project state

Updated: 2026-09-05
Owner: Jozz

Status: **PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE**

## 1. Authority

Live accepted product/source/documentation authority is:

`Jozzpoly/JV-Box3D-Web-experiment/main`

This branch is:

`work/spawn-landmark-calibration-2026-09-05`

It was created from product/code checkpoint:

`main@5b28cc03d22264010680deb95a04abd04661bc22`

That SHA is a **fork point**, not current live main. Main later advanced through docs-only routing consolidation.

Accepted Steering I1 executable snapshot remains:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Accepted JSPREV2 static input remains:

`Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`

No spawn runtime change from this branch is accepted product truth.

## 2. Owner need

Owner reported that the vehicle started in a poor place and wanted it moved to open space or preferably the road.

Bounded question:

> Can accepted scene/scan evidence provide credible safe start candidates without inventing unsupported road semantics?

## 3. Falsified hypothesis

Earlier interpretation: ordinary Owner Preview bad start came from `scanCenterSpawn()` / scan AABB center.

Verdict: **falsified for the relevant ordinary startup**.

Exact accepted source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` shows default startup resolves to `map` / `world.spawn`.

Accepted default:

`{ x: 0, y: 1.2, z: 0 }`

Accepted JSPREV2 begins around world `z = 320` and extends far beyond it. Current stronger interpretation is poor spatial/semantic placement relative to the scan playground, not a proved AABB-center collision fault.

## 4. Semantic evidence boundary

Accepted scan receipt/metadata contains no semantic road/village/start landmark.

No previously approved road coordinate was recovered.

Therefore geometry may identify safe/open candidates but cannot by itself prove "this is the road".

## 5. Geometry evidence

Primary analyzer:

`tools/spawn-analysis/jsprev2-spawn-landmark-analysis.mjs`

Primary evidence:

`docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json`

The first draft had a tile-order-dependent raster bug. It was caught before accepted execution and replaced by order-independent absolute local-grid rasterization.

Verified accepted scan:

- 7 tile binaries;
- 1,409,687 vertices;
- 5,327,325 indices;
- 1,775,775 triangles;
- every tile byte size and SHA-256 matched accepted receipt.

Primary classification:

`GEOMETRIC_SAFE_SPAWN_CANDIDATES_FOUND_NOT_ROAD_SEMANTICS`

Independent crosscheck:

`tools/spawn-analysis/jsprev2-spawn-candidate-crosscheck.mjs`

Crosscheck evidence:

`docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json`

Crosscheck uses encoded vertex normals + candidate-local 1 m occupancy rather than the primary global triangle-centroid raster.

Crosscheck classification:

`GEOMETRIC_CANDIDATE_REGIONS_CROSSCHECK_STABLE_NOT_SEMANTIC`

Passing primary ranks:

`2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 19`

Primary rank #1 failed the independent height-range crosscheck. Therefore the initial ranking is not authority; existence of several broad stable flat regions is the stronger retained result.

## 6. Candidate implementation

Opt-in only:

- `scan-cal-a` — source rank 6, pack-local X/Z `35.25, -59.25`;
- `scan-cal-b` — source rank 3, pack-local X/Z `54.75, -36.75`;
- `scan-cal-c` — source rank 4, pack-local X/Z `110.25, -11.25`.

Properties:

- default remains `map`;
- existing `offroad` and `scan` remain unchanged;
- calibration works only for `scan/photogrammetry-primary`;
- X/Z are evidence-derived local coordinates;
- Y is recomputed from actual collision surface at runtime;
- wrong/missing pack or missing surface fails closed;
- code does not call any candidate a road.

Implementation commit:

`8c21cc8cdbadaf1185fecaba848028a86df5cf8c`

Focused tests commit:

`6b66afd7105b521c9f0d39cf0ded8d504e02ebe9`

## 7. Validation

Candidate validation run:

- run `33979257193`;
- job `101341374863`;
- tested commit `9038433f2418af550da5368eb2ce34d02ee26fb5`;
- Node `24.16.0`;
- npm `11.13.0`.

Observed:

- `npm ci` PASS;
- TypeScript typecheck PASS;
- tests `523 total / 516 pass / 7 fail`;
- all new spawn calibration tests PASS.

The seven failures are steering/mobile-UI expectations unrelated to the spawn files. Relevant failing source/test blobs are identical between the work-branch product fork point and accepted product code, so they are provenance-grounded as pre-existing baseline debt unless later exact-main execution contradicts that conclusion.

The red suite stopped before `build:portable` / build identity / final diff check.

Candidate portable build status:

**UNVERIFIED**

## 8. Workflow cleanup

Temporary Actions workflows used to execute the bounded analysis/crosscheck/validation were removed from the live work branch after evidence collection.

They are not permanent project infrastructure.

## 9. Verdict

Supported:

- earlier `scanCenterSpawn()` default-start explanation was wrong;
- accepted default start is spatially outside/before the accepted scan playground;
- scan metadata cannot identify a road;
- several broad flat regions survive two geometry methods;
- A/B/C are bounded opt-in, pack-pinned, surface-resolved candidates;
- focused spawn tests and typecheck pass;
- seven broader-suite failures are not caused by spawn changes.

Not supported:

- A/B/C road semantics;
- Owner preference among A/B/C;
- portable build PASS;
- promotion to live main/Preview/Pages.

## 10. Natural next gate

Do not add more geometry heuristics merely to create a semantic answer.

If resumed:

1. independently qualify portable build;
2. run one bounded exact candidate preview with A/B/C;
3. Owner accepts one or rejects all;
4. if all fail, obtain explicit semantic landmark;
5. prepare a fresh minimal product slice from live main after Owner acceptance.

This whole work branch should not be promoted wholesale.
