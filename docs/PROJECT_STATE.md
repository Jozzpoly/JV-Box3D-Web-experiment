# JV-Web — current project state

Updated: 2026-09-05
Owner: Jozz

## 1. Current routing

JV-Web is in **bounded product/R&D iteration**, not strategic cold takeover.

The read-only strategic takeover from 2026-08-26 is historical and superseded. Do not restart it automatically.

Current routing deliberately separates:

- accepted product/runtime truth on `main` plus the exact validated executable snapshot;
- retained wheel-mode5 research evidence on its research branch;
- bounded, unpromoted spawn calibration work on its work branch.

Default loop:

`real need / uncertainty -> smallest informative change or experiment -> risk-matched validation -> faithful evidence -> Owner judgement when experiential -> next iteration`

## 2. Live authority and exact snapshots

### Main / canonical documentation authority

`Jozzpoly/JV-Box3D-Web-experiment/main`

Always resolve its live head rather than trusting an embedded SHA. This 2026-09-05 consolidation is documentation-only and does not claim a new executable product validation.

Immediately before this docs-only consolidation, `main` was:

`5b28cc03d22264010680deb95a04abd04661bc22`

That commit itself changed only `docs/PROJECT_STATE.md` relative to its parent.

### Accepted executable product snapshot

Canonical Steering I1 Owner Preview executable source remains:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

No wheel-mode5 or spawn-calibration runtime change has been promoted into accepted product truth.

### Owner Preview

Live operational lane at this grounding:

`preview/owner-control@a6a6ed9e6d5ac62fe10be13cf81f1931b3370895`

`preview/owner.json` pins:

- executable source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- accepted JSPREV2 `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- receipt `receipts/jv_friends_scan_receipt.json`.

Preview is exact-source composition infrastructure, not source authority.

### Retained wheel research

Branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Verified head immediately before this main docs consolidation:

`0bce0eb7d96d27317597548563d193361363250b`

Classification:

`RQ2C_ORIENTATION_HOLD`

Treat that SHA as a checkpoint only; re-fetch live branch state when relevant.

### Spawn calibration

Branch:

`work/spawn-landmark-calibration-2026-09-05`

Verified head immediately before this main docs consolidation:

`c546d39670a41f54081673041e2072cf4ec7461a`

Classification:

`PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE`

Treat that SHA as a checkpoint only; re-fetch live branch state when relevant.

## 3. Accepted product baseline — Steering I1

Detailed accepted baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

### FACT / accepted current-best

- Direct Rotation and Relative-X remain explicit touch steering choices.
- Pointer release defaults to semantic `RELEASE`; ordinary touch steering does not command automatic return to zero.
- Hands-off graphical steering follows live physical rack state.
- New touch grabs re-anchor to current physical rack position.
- Configurable wheel ranges remain 360/540/720/900/1080 degrees.
- 900 degrees is current default/current-best, not final forever.
- Wheel-range preference is session-scoped.
- Artificial centering is not exposed as an Owner product setting.
- Useful natural physical steering self-return remains unresolved.

### OWNER-OBSERVED

On the accepted 900-degree steering Preview, the Owner confirmed:

- hands-off wheel/rack synchronization worked;
- physical steering movement followed by re-grab no longer caused the previous UI/physics offset;
- driving feel was substantially improved and better than expected within the tested scope.

Do not generalize this into whole-product or all-device acceptance.

## 4. Wheel-mode5 research closure

Wheel-mode5 research is retained as evidence but is not accepted product runtime.

Current high-level state:

- RQ0 aligned steady rolling — qualified within scope;
- RQ1 bounded road-normal transition — qualified within scope;
- RQ2a braking / RQ2b drive — qualified within scope;
- RH0 research-foundation hardening — PASS / CLOSED;
- RQ2C orientation — stopped at zero-degree HOLD before yaw.

The frozen zero-degree actual-support rolling-slip gate failed:

- max witness slip `0.034093857 mm/s`;
- gate `0.002 mm/s`;
- exceedance `17.0469x`.

RQ2C4D/E/F localized the residual enough to establish useful evidence. RQ2C4F attributes about `87.3%` of the peak rolling-pair magnitude to axle-spin-rate evolution. Source review identifies contact tangential friction as the unique obvious first-order direct axial-torque path in the aligned apparatus, but exact numerical per-subsystem ownership remains partial without new solver-level instrumentation.

Planned `+3.5°/-3.5°` yaw was **not executed** because the zero-degree gate failed.

Do not resume this sequence merely for completeness or tune the gate/contact physics to obtain PASS.

For exact research detail, resolve the research branch live and use its branch-local `docs/HANDOFF.md`, active pointer, current wheel roadmap, RQ2C4F closure and canonical evidence ledger.

## 5. Post-wheel spawn-location calibration

A broader product re-ground selected the Owner-reported poor spawn location as a bounded product problem worth investigating before automatically reopening wheel or steering micro-forensics.

The investigation is isolated on:

`work/spawn-landmark-calibration-2026-09-05`

Important retained findings:

1. **An earlier hypothesis was falsified.** The relevant accepted executable source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` defaults ordinary startup to `map` / `world.spawn`, not `scanCenterSpawn()`.
2. Accepted `world.spawn = { x: 0, y: 1.2, z: 0 }`, while accepted JSPREV2 begins around world `z = 320`. The stronger interpretation is therefore poor spatial/semantic placement relative to the scan playground, not a proved scan-center collision fault.
3. Accepted JSPREV2 metadata contains no semantic road/start landmark.
4. All seven accepted JSPREV2 tile sizes/hashes were verified while re-reading the exact geometry (`1,409,687` vertices / `1,775,775` triangles).
5. A primary flat-region analysis and an independent vertex-normal/candidate-local occupancy crosscheck both support the existence of several broad stable flat regions. They do **not** establish road semantics.
6. Primary rank #1 was rejected by the independent crosscheck, preventing the initial ranking from being treated as authority.
7. Three spatially separated crosscheck-passing regions exist only as opt-in `scan-cal-a/b/c` on the work branch. Default `map/offroad/scan` behavior remains unchanged; candidate Y is recomputed from collision surface.
8. Focused spawn tests and TypeScript typecheck passed.

Branch-local state record:

`docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`

That file exists on the spawn work branch, not on `main`.

## 6. Baseline test debt exposed during spawn validation

A candidate validation run (`33979257193`, job `101341374863`) executed Node `24.16.0`, `npm ci`, typecheck and the test suite.

Observed:

- `npm ci` — PASS;
- typecheck — PASS;
- tests — `523 total / 516 pass / 7 fail`;
- all new spawn calibration tests — PASS.

The seven failures are steering/mobile-UI expectations unrelated to the spawn files. Relevant failing test/source blobs were verified byte-identical between accepted `main` and the candidate branch. Therefore they are provenance-grounded as pre-existing baseline debt unless a future fresh exact-main execution contradicts that conclusion; do not attribute them to spawn.

The red suite stopped before `build:portable`, so the spawn candidate portable build remains **UNVERIFIED**.

Do not “repair” steering behavior or rewrite assertions inside the spawn slice merely to manufacture a green gate. Treat the baseline test debt as a separate maintenance decision if/when it becomes worth fixing.

## 7. Current open pressures

### Product / spawn

- qualify a candidate portable build if spawn calibration resumes;
- use bounded Owner A/B/C semantic judgement to identify a useful start location;
- if none is correct, obtain an explicit semantic landmark instead of tuning geometry heuristics to force one;
- no spawn candidate is currently approved for `main` or canonical Preview.

### Steering mechanics

Useful natural physical self-return remains unresolved. A future bounded steering slice may investigate physical causes, but it is not automatically next and must not reintroduce hidden artificial centering.

### Wheel/contact research

Representative lateral behavior, steer-under-load, camber thrust, load transfer, near-limit traction and broader topology remain open. The closed RQ2C microline should not reopen by sequence inertia.

### Broader product

Camera, UI, controls, world/scan experience, performance and playground quality remain legitimate future slices. Current Owner priorities should select among them.

## 8. What not to do by default

- Do not restart the 2026-08-26 cold takeover.
- Do not automatically resume RQ2C, yaw, recycler or solver micro-forensics.
- Do not relax the RQ2C slip gate or tune physics to obtain PASS.
- Do not promote wheel-mode5 into product runtime without a separate product decision.
- Do not call spawn A/B/C roads or promote them without build + Owner evidence.
- Do not weaken canonical Owner Preview provenance to expose an unqualified experiment.
- Do not repair unrelated steering tests inside the spawn slice.
- Do not turn JV-Web into NextGen JV Lite.
- Do not delete historical branches merely as cleanup ritual.

## 9. Fresh continuation order

1. Resolve live `main` and the exact branch(es) relevant to the requested work.
2. Read `AGENTS.md`.
3. Read this `docs/PROJECT_STATE.md`.
4. Read `docs/HANDOFF.md` for actual continuation/handoff routing.
5. If wheel-mode5 matters, resolve `research/wheel-mode5-rq2c-orientation-2026-09-05` and read its branch-local current evidence/router docs.
6. If spawn calibration matters, resolve `work/spawn-landmark-calibration-2026-09-05` and read its branch-local `docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`.
7. Inspect only source/tests/evidence needed for the current Owner need.

## 10. Current boundary

Steering I1 remains the accepted executable/current-best product baseline. Wheel RQ2C is a retained closed HOLD. Spawn calibration is PARTIAL and unpromoted.

There is no automatic next experiment.

Re-ground current Owner priority before opening another implementation/research line.
