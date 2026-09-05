# JV Web — spawn landmark calibration work branch

This branch is a bounded **unpromoted product calibration lane**, not accepted JV-Web product source.

Status:

`PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE`

## Authority boundary

Accepted JV-Web product/source/documentation authority is always live:

`Jozzpoly/JV-Box3D-Web-experiment/main`

Resolve it before making a product claim.

This work branch was forked from product/code checkpoint:

`main@5b28cc03d22264010680deb95a04abd04661bc22`

That SHA is the branch fork point, **not current live main**. Main later advanced through documentation-only routing consolidation while the accepted Steering I1 executable snapshot remained:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Canonical accepted JSPREV2 remains:

`Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`

No runtime change from this branch has been promoted to `main` or canonical Owner Preview.

## Read first on this branch

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. `docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`;
4. `docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json` only for primary geometry details;
5. `docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json` for the independent crosscheck;
6. inspect `src/scene/product-spawn.ts` and `tests/product-spawn.test.mjs` only if implementation detail is needed.

For broader JV-Web truth, return to live `main`.

## What this branch established

An earlier working explanation claimed that ordinary Owner Preview's bad start came from `scanCenterSpawn()` selecting the scan AABB center. Exact accepted source falsified that claim: ordinary startup defaulted to `map` / `world.spawn`.

Accepted default start:

`{ x: 0, y: 1.2, z: 0 }`

Accepted JSPREV2 begins around world `z = 320`, so the stronger current interpretation is poor spatial/semantic placement relative to the scan playground rather than a proved AABB-center collision fault.

Accepted scan metadata contains no semantic road/start landmark.

The exact accepted scan geometry was re-read with all seven tile sizes/SHA-256s verified. A primary flat-region analysis and an independent vertex-normal/candidate-local occupancy crosscheck support several broad stable flat regions, but neither method can label a road.

Primary rank #1 failed the independent crosscheck, which is retained as evidence that the first ranking is not authority.

## Opt-in candidates

Three spatially separated crosscheck-passing regions exist only as:

- `?jvSpawn=scan-cal-a`
- `?jvSpawn=scan-cal-b`
- `?jvSpawn=scan-cal-c`

They are pack-pinned, surface-height-resolved and opt-in. Default `map`, `offroad` and `scan` behavior remains unchanged.

Do not call A/B/C roads or select one algorithmically.

## Validation boundary

Focused spawn tests and TypeScript typecheck passed.

A broader candidate validation run exposed seven steering/mobile-UI assertions whose relevant test/source blobs match the branch fork-point product source and accepted current code. They are not evidence of a spawn regression.

That red test step stopped before `build:portable`, therefore the candidate portable build remains:

`UNVERIFIED`

Do not repair unrelated steering behavior/tests inside this spawn slice merely to manufacture green status.

## Natural next gate

If this branch is resumed:

1. qualify the candidate portable build without weakening canonical provenance;
2. expose A/B/C only in a bounded candidate preview;
3. ask the Owner which, if any, is visibly a sensible start / on or near the desired road;
4. if none is right, reject all three and obtain an explicit semantic landmark instead of tuning geometry heuristics toward a desired answer;
5. after Owner acceptance, prepare a **fresh minimal product slice from live main** rather than promoting this whole work branch wholesale.

This branch is evidence/calibration apparatus, not a promotion candidate.
