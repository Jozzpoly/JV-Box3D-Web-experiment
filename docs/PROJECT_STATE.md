# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `FRIENDS R1 LIVE / LOW-LEVEL PERFORMANCE SOURCE CANDIDATE`

## Authority and rollback

```text
private accepted: main@f8eb0908f5934aed2d504f34ce483a02754039ec
private perf foundation S1-S3: checkpoint/perf-foundation-s3-2026-08-15@20eca0451c81581649e061c8bc61d45001e32601
private active work: work/friends-r1-live-perf
private pre-execution checkpoint: checkpoint/perf-lowlevel-preexec-2026-08-15@05b0a6cbc275a9ac0f044c547fb90a277c06cecb
public moving Pages lane: release/friends-r1@1297899c6dd25607f7da54a54bed28e8bb991630
public known-good checkpoint: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git/ref and real runtime evidence outrank this file. `release/friends-r1` is a moving live-test lane; the known-good checkpoint is the immediate rollback target.

## Product truth

Owner-validated Friends baseline remains intact: Plac E2R, Offroad, driving/touch and the full JSPREV2 scan work on desktop and phone. Mobile performance, loading time, camera/framing and control UX are not accepted as final.

Current scan stress case:

```text
7 tiles / 25 groups / 25 textures
1,409,687 vertices
1,775,775 triangles
66,419,624 B binary geometry
44,858,270 B source textures
111,288,484 B published scan payload
~104.6 MB estimated CPU geometry
~55.8 MB historical Uint16-path GPU geometry estimate
~100 MiB base RGBA8 texture texels
```

The current objective is stable high-quality browser performance, with Samsung Galaxy A53 / Chrome as the primary mobile stress gate and 60 fps as the target. Do not trade away fixed-step physics, solver quality, vehicle complexity or scan quality merely to hit the number.

## Low-level performance candidate

S1-S3 checkpoint already provides conservative scan-group frustum culling, shared scan matrix reuse, logical-group WebGL state batching and source controls for culling/render scale.

The active lane now additionally contains source-reviewed low-level slices that do not intentionally change physics or scene geometry:

- decouple fixed-step catch-up from presentation: every required 60 Hz Box3D step still runs, but at most one presentation/render is emitted per browser frame;
- defer the expensive rich `M6TraceFrame`/visual snapshot until the final state actually presented for that browser frame, while preserving legacy `world.step(N)` semantics and accumulating contact-begin events across deferred captures;
- use direct Uint32 scan indices when WebGL1 exposes `OES_element_index_uint`, retaining the old Uint16 chunking fallback;
- stop hidden Debug telemetry DOM churn while the Debug panel is closed;
- restore normal browser caching for the scan and use bounded two-way tile fetch/parse pipelining instead of seven forced `no-store` sequential tile loads;
- expose lightweight runtime telemetry for browser cadence, executed simulation steps, physics time and presentation time.

These changes are **SOURCE CANDIDATE ONLY**. They have been reviewed by exact Git diffs, but this environment has no usable private-repo checkout and the repository currently exposes no CI status/workflow execution for the candidate. Do not claim a build/test pass or measured performance gain yet.

## Evidence from the first A53 A/B

Backing-scale A/B did not support a pure fill-rate explanation. Dropping from 2x to 1x removed about 75% of backing pixels but improved the observed browser cadence only from roughly 16–19 fps to about 27 fps. The code audit then found repeated presentation work during fixed-step catch-up and repeated rich trace construction as major avoidable CPU work.

Recent instrumented phone captures were made in a Messenger in-app browser; final mobile acceptance must be measured in Chrome on the Galaxy A53.

## Immediate gate

Before adding more invasive optimizations:

1. obtain an exact ZIP/check-out of `work/friends-r1-live-perf` at its current head;
2. run the canonical Node/npm install, TypeScript/test/build checks and inspect the produced artifact;
3. correct any source issue found by execution, including refining the Uint32 path so small scan groups keep the cheapest valid index representation;
4. publish the validated candidate only to the moving Friends Pages lane, preserving known-good rollback;
5. measure on A53 Chrome with the new HUD: browser fps/p95, simulation steps/frame, physics ms, presentation ms, visible scan groups/draws and loading behavior;
6. use those measurements to choose the next bottleneck rather than adding LOD/world partitioning speculatively.

Likely later low-level targets, only after execution evidence, include renderer/visual-frame allocation reuse, removal of redundant scan CPU copies, parser/bounds pass reduction and tighter texture/GPU residency handling. Heavy LOD, world partitioning and multi-scan streaming remain intentionally deferred until simpler losses are exhausted.

## Boundaries

- no reduction of fixed-step physics quality or vehicle topology/complexity for performance;
- no hidden removal of scan content on phone;
- no geometric LOD/world partitioning yet;
- no final steering/JURE work in this campaign;
- no measured-gain claims without real execution/device evidence;
- tests/docs remain proportional to product risk rather than becoming a project of their own.
