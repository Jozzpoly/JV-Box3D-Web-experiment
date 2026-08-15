# AI project memory — JV Web

Updated: 2026-08-15
Status: `FRIENDS R1 LIVE / LOW-LEVEL PERF VALIDATED SOURCE BOUNDARY`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it. Read `docs/PROJECT_STATE.md` for the detailed current boundary.

## Current authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- active private performance work: `work/friends-r1-live-perf` (resolve live SHA from Git; docs follow the repaired low-level checkpoint);
- repaired private source checkpoint: `checkpoint/perf-lowlevel-repaired-validated-2026-08-15@1ad19c67449fe8c87603b40d8e7c6e9c5cbcd422`;
- S1-S3 checkpoint: `checkpoint/perf-foundation-s3-2026-08-15@20eca0451c81581649e061c8bc61d45001e32601`;
- public moving Friends lane: `release/friends-r1@1297899c6dd25607f7da54a54bed28e8bb991630` at this validation boundary;
- public pre-lowlevel rollback: `checkpoint/pages-friends-r1-pre-lowlevel-2026-08-15@1297899c6dd25607f7da54a54bed28e8bb991630`;
- immutable known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

## Durable product truth

Plac E2R, Offroad, current owner vehicle and the full JSPREV2 scan form the owner-validated Friends browser foundation. Do not hide or simplify the scan merely because mobile is slow. Final rig/steering work remains separate and later, with JURE expected to provide better authored rig evidence.

Current scan stress case: 7 tiles, 25 groups/textures, 1,409,687 vertices, 5,327,325 indices and 1,775,775 triangles.

Physics performance work must preserve fixed 60 Hz stepping, existing solver/substeps and vehicle complexity unless an explicit later experiment changes that boundary.

## Current low-level direction

The private source candidate already attacks avoidable work before LOD/world partitioning:

- conservative scan-group culling + shared scan matrices/state batching;
- multiple required physics catch-up steps but at most one browser-frame presentation;
- rich M6 trace/visual snapshot only for the final presented catch-up state;
- direct Uint32 scan path on supported WebGL1 with legacy Uint16 fallback;
- Debug DOM work gated while hidden;
- normal browser caching + bounded two-way tile pipeline;
- runtime telemetry separating simulation-step count, physics time and presentation time.

A recursive audit rejected several false/simple narratives: pixel fill rate is only part of the A53 problem; checked-WebGL `getError()` is not a per-draw hot-path issue; Uint16-for-small-groups is a small refinement, not the main win; and the historical GPU-geometry estimate is not measured current residency.

## Validation truth

The exact owner-supplied ZIP was `5eeb7437604817d13f5c08ae959ebf1d745da482` and matched the live ref at takeover. The session obtained strong but explicitly noncanonical source/subsystem evidence:

- 41/41 focused renderer/loader/runtime tests PASS;
- 33/33 host/runtime tests PASS with an explicit nonexecuted Box3D import stub, including `4 physics steps -> 1 final capture/presentation`;
- 149/149 test/tool `.mjs` syntax checks PASS;
- documentation link audit PASS.

This does **not** prove numerical Box3D equivalence or a full bundle. Local npm installation is blocked by registry DNS. Private GitHub Actions was rejected before runner allocation by billing/spending limits. Therefore there is still no canonical `npm run check`, real Box3D regression pass, Vite build or measured low-level performance gain.

An accidental corrupt renderer commit `8bb65eb...` was detected during recursive validation and repaired without force-reset; current tree restores the renderer exactly from its good parent. Do not reuse 8bb as source.

## Next measured targets before heavy architecture

1. Box3D full-event-buffer copy performed every fixed step for diagnostic contact-begin information;
2. heavy decoded `JvWorldData` lifetime after GPU upload and Box3D mesh creation;
3. duplicate JS<->WASM getters/object allocation across visual frame + rich trace;
4. bounded texture decode/upload pressure;
5. optional VAO/WebGL binding fast path;
6. later VAW-friendly JSPREV3 asset format with precomputed bounds/index-width and GPU-friendly streams.

Do not change sleep/wake policy or collision topology without explicit physics-equivalence evidence.

A further local 10-file hardening patch exists as review evidence only, SHA-256 `9bc32817baf597884dcc11fd9e47b9015ebc6aa33642116b47e53a71c8650039`; it is not repo authority and must pass a real build before materialization/promotion.

## Immediate gate

Get a build-capable canonical private environment, run exact install + full checks + real Box3D tests + Friends build, then publish only to the moving public Friends lane and measure in normal Chrome on the Galaxy A53. Use the new HUD to decide the next bottleneck. LOD/world partitioning remain deferred.
