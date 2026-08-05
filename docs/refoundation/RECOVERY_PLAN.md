# Recovery plan

Ordinary product development remains blocked until the control and architecture gates below are completed in order.

## R0 — control plane

Goal: establish one clean place for current state, evidence vocabulary and branch rules.

Pass criteria:

- this refoundation documentation exists on a clean branch from `main`;
- no implementation branch is declared canonical;
- every historical claim is classified by evidence level.

## R1 — historical green baseline

Target: `dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec`.

Procedure:

1. detached exact checkout;
2. exact Node/npm versions from the historical claim;
3. clean working tree;
4. `npm ci`;
5. full repository gate;
6. raw logs and artifact hashes;
7. no source changes during the run.

Outcome:

- `BASELINE_REPRODUCED`, or
- an attributable failure report.

Do not repair this branch during the baseline run.

## R2 — current red head

Target: `26c5022f8dfd33b8c5f80d0900d239a4d80966ea`.

Run the same environment and evidence format as R1. Capture every failure before changing anything.

Then classify each post-`dcec0a7…` change:

- general reusable protection;
- custom-renderer-specific;
- synthetic-fixture-only;
- build coupling;
- reject.

## R3 — PR #1 forensic recovery

Target web commit: `891c7561142b601f62ea76b68b0f55f8fababc6c`.

Required controls:

- pin one native JV commit;
- disable local native auto-detection;
- disable local session import;
- record dependency resolution because no reliable historical lock is present;
- hash every synchronized asset;
- distinguish historical owner evidence from the new forensic run.

Deliverable: a per-module salvage map, especially for:

- wheel marker contract;
- `SkeletonUtils.clone`;
- body and wheel loading;
- camera;
- disposal;
- failure fallback.

## R4 — real-car renderer spike

Question: can one Three.js scene/context owner render the real owner-authored vehicle through the current deterministic host without reintroducing old coupling?

Minimum scope:

- real body;
- four real wheels;
- transforms only from immutable `VehicleVisualFrameV1`;
- no persistent `b3BodyId` or `b3JointId` in render state;
- pinned package and asset hashes;
- validation before scene publication;
- abort and late-load disposal;
- load failure that leaves the debug observer usable;
- destroy/rebuild;
- context-loss behavior;
- desktop and phone observation.

Explicitly excluded:

- scan;
- textures beyond what is needed to answer the spike;
- final UI;
- final product physics;
- migration of the whole old renderer.

Decision:

- accept Three.js hybrid;
- reject with measured reasons;
- or run one narrower follow-up spike.

## R5 — clean product candidate

Only after R4:

- select a clean base;
- transfer approved modules in reviewable commits;
- create one canonical product branch;
- replace conflicting AI memories;
- mark old PRs superseded only after evidence is preserved.

## R6 — scan vertical slice

After the real vehicle is stable:

- visual/collision asset separation;
- explicit axes, scale and origin;
- GLB inspection and memory policy;
- real scan, not only synthetic fixtures;
- desktop and phone evidence.

## R7 — native JV Core WASM

- smallest portable native core;
- stable C ABI with units and coordinate frames;
- copied immutable snapshots;
- native and browser scenario corpus;
- trajectory and mechanism telemetry comparison;
- replace `legacy_ts_m6` only after parity acceptance.
