# JV-Web — spawn calibration handoff

Updated: 2026-09-05
Owner: Jozz

Use this handoff only when continuing the bounded spawn-location calibration. It is not a general JV-Web takeover mandate.

## 1. Authority

Resolve live:

`Jozzpoly/JV-Box3D-Web-experiment/main`

before making product claims.

This work branch:

`work/spawn-landmark-calibration-2026-09-05`

was forked from `main@5b28cc03d22264010680deb95a04abd04661bc22`. That is historical fork-point provenance, not current live main.

Accepted Steering I1 executable snapshot remains `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` unless newer live main/Preview evidence says otherwise.

Accepted JSPREV2 remains `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

This branch is not accepted product source and should not be fast-forwarded wholesale to main.

## 2. Current classification

`PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE`

Canonical branch-local closure:

`docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`

Machine-readable evidence:

- `docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json`;
- `docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json`.

## 3. What was falsified

The earlier explanation that the ordinary Owner Preview bad start came from `scanCenterSpawn()` / AABB center is false for the relevant accepted executable startup.

Exact accepted source defaults to:

`map -> world.spawn = { x: 0, y: 1.2, z: 0 }`

Accepted JSPREV2 begins around world `z = 320`.

Retain the stronger interpretation: start placement is poor relative to the useful scan playground; this is not proven to be an AABB-center collision bug.

## 4. What geometry can and cannot say

Accepted scan metadata has no semantic road/start landmark.

Primary analysis plus an independent crosscheck support several broad stable flat regions.

They **cannot** establish that any region is a road.

Primary rank #1 failed the independent crosscheck; do not treat initial ranking as authority.

## 5. Candidate slice

Opt-in query targets only:

- `scan-cal-a`
- `scan-cal-b`
- `scan-cal-c`

They are spatially separated, crosscheck-passing, pack-pinned and surface-height-resolved.

Default `map`, `offroad` and `scan` behavior remains unchanged.

Do not rename these to road/start-final without Owner evidence.

## 6. Validation boundary

Observed candidate run:

- `npm ci` PASS;
- typecheck PASS;
- all new spawn tests PASS;
- full tests: `523 total / 516 pass / 7 fail`.

The seven red assertions are in steering/mobile-UI tests and their relevant source/test blobs match the product fork point / accepted current code. They are not evidence of a spawn regression.

The run stopped before `build:portable`, therefore candidate build is:

**UNVERIFIED**

Do not modify unrelated steering behavior/tests inside this task merely to obtain green status.

## 7. Current stop boundary

Do not:

- add more geometry heuristics to manufacture road semantics;
- choose A/B/C algorithmically;
- weaken Preview provenance;
- publish candidate Pages;
- promote this work branch to main;
- reopen wheel-mode5 research as part of spawn work;
- fix unrelated steering baseline debt inside this branch.

## 8. Natural next move if resumed

1. Resolve live main and this branch again.
2. Qualify portable build without altering candidate semantics.
3. Produce one bounded exact candidate preview exposing A/B/C.
4. Owner judges only whether one location is visibly useful / on or near the desired road.
5. If none is right, reject all and obtain explicit semantic landmark.
6. If one is accepted, prepare a **fresh minimal implementation branch from live main** carrying only the selected product change and appropriate tests/evidence.

The current branch is calibration evidence/apparatus, not the final promotion branch.
