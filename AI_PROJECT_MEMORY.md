# AI Project Memory — JV Web spawn calibration branch

Updated: 2026-09-05
Owner: Jozz

## MODE

This is a bounded **spawn landmark calibration** work branch.

Status:

`PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE`

It is not accepted product source and not a general JV-Web takeover branch.

## AUTHORITY

Always resolve live:

`Jozzpoly/JV-Box3D-Web-experiment/main`

This branch was forked from `main@5b28cc03d22264010680deb95a04abd04661bc22`; that SHA is fork-point provenance, not current live authority.

Accepted executable snapshot remains `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` unless newer live evidence says otherwise.

Accepted JSPREV2 remains `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

## CORE CORRECTION

Do not repeat the earlier claim that ordinary Owner Preview's poor start came from `scanCenterSpawn()`.

Exact accepted source shows ordinary startup defaulted to `map` / `world.spawn = { x: 0, y: 1.2, z: 0 }`.

Accepted JSPREV2 begins around world `z = 320`.

Current stronger interpretation: poor spatial/semantic placement relative to the useful scan playground, not a proved scan-AABB-center collision fault.

## SEMANTIC LIMIT

Accepted scan metadata has no semantic road/village/start landmark.

Geometry-only methods can suggest flat/open candidates but cannot prove road semantics.

Do not tune heuristics until they produce the location the Owner is expected to want.

## EVIDENCE

Read:

`docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`

Then machine-readable detail if needed:

- `docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json`;
- `docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json`.

Exact scan re-read verified all seven tile sizes/SHA-256s and `1,409,687` vertices / `1,775,775` triangles.

Primary flat-region analysis found many candidates. Independent vertex-normal/candidate-local occupancy crosscheck rejected primary rank #1 and retained several stable regions.

Retain the existence of several broad stable flat regions; do not retain the primary ranking as semantic authority.

## CANDIDATES

Three deliberately separated crosscheck-passing regions are available only as opt-in:

- `scan-cal-a`
- `scan-cal-b`
- `scan-cal-c`

They are pack-pinned and runtime surface-height-resolved.

Default `map`, `offroad` and `scan` behavior is unchanged.

They are calibration labels, not road labels.

## VALIDATION

Candidate validation observed:

- `npm ci` PASS;
- typecheck PASS;
- all spawn calibration tests PASS;
- full tests `523 total / 516 pass / 7 fail`.

Seven red assertions are unrelated steering/mobile-UI expectations whose relevant source/test blobs match product baseline code. Do not attribute them to spawn or change steering inside this slice to make CI green.

The run stopped before portable build.

Candidate build status:

`UNVERIFIED`

## DO NOT

Do not automatically:

- promote this branch;
- publish candidate Preview/Pages before build qualification;
- call A/B/C roads;
- choose A/B/C algorithmically;
- add more geometry heuristics merely to get a semantic answer;
- weaken exact-source Preview provenance;
- fix unrelated steering baseline debt here;
- reopen wheel-mode5 research here.

## NEXT IF RESUMED

1. Resolve live main and current work head.
2. Qualify portable build.
3. Expose A/B/C in one bounded exact candidate preview.
4. Owner accepts one or rejects all.
5. If all fail, obtain explicit semantic landmark.
6. If one is accepted, make a fresh minimal branch from live main for the actual product change rather than promoting this calibration branch wholesale.
