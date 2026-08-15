# AI project memory — JV Web

Updated: 2026-08-15
Status: `FRIENDS R1 LIVE / LOW-LEVEL PERFORMANCE SOURCE CANDIDATE`

This file is a router only. Current Git, reproducible runtime evidence and direct owner observation outrank it.

## Current authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- active private performance work: `work/friends-r1-live-perf`;
- S1-S3 performance checkpoint: `checkpoint/perf-foundation-s3-2026-08-15@20eca0451c81581649e061c8bc61d45001e32601`;
- low-level pre-execution checkpoint: `checkpoint/perf-lowlevel-preexec-2026-08-15@05b0a6cbc275a9ac0f044c547fb90a277c06cecb`;
- live public Friends lane: `release/friends-r1` (moving; resolve its current SHA from Git);
- immutable known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

## Durable product truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the owner-validated Friends browser foundation on desktop and phone. Phone performance/loading and mobile camera/control UX are still open.

Keep the temporary coherent-front drive bridge as the R1 product intermediate only. Final rig, steering back-drive/self-align and handling remain separate later work, with authored rig geometry expected from JURE.

Current scan stress case: 7 tiles, 25 groups/textures, 1,409,687 vertices and 1,775,775 triangles. Do not hide or simplify it merely because the phone is slow.

## Current performance direction

Render-scale A/B on the Galaxy A53 showed that pixel count is not the sole/main explanation for the poor cadence. The active source candidate attacks lower-level avoidable work first:

- fixed-step physics catch-up is decoupled from presentation so several required Box3D steps do not cause several full renders in one browser frame;
- rich vehicle/visual trace materialization is deferred to the final presented state rather than repeated for intermediate catch-up steps;
- scan rendering has a direct Uint32 index fast path when supported, with Uint16 fallback retained;
- hidden Debug DOM work is suppressed;
- scan loading uses normal browser caching and bounded two-way tile pipelining;
- runtime telemetry separates simulation-step count, physics time and presentation time.

Physics remains 60 Hz with the existing solver/substeps and current vehicle complexity. No LOD/world partitioning is part of this phase.

## Validation boundary / next gate

The current low-level stack is source/diff reviewed but **not executed in this environment**: there is no usable private-repo checkout and no CI workflow/status proving the candidate. Do not claim build/test success or performance gains.

Next: obtain the exact active-branch ZIP/check-out, run the canonical install/tests/build locally, correct any execution issues, then publish only to the moving Friends lane and measure in Chrome on the Samsung Galaxy A53. Use the new telemetry to choose the next low-level bottleneck before considering heavier architecture.

Read `docs/PROJECT_STATE.md` for the current technical boundary and immediate gate. Historical campaigns/handoffs remain in Git history unless a named historical question requires them.
