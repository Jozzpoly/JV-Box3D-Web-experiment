# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `FRIENDS R1 LIVE / PERFORMANCE CANDIDATE ACTIVE`

## Accepted/live authority

```text
private accepted source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
public live branch: release/friends-r1
public live commit: 7161215e47f00573b8c1b5c31e5931c89f9d709a
public rollback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
private source used by live hotfix: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
```

Owner already validated the live Friends release on real desktop and phone: Plac E2R, Offroad, driving/touch controls and the full JSPREV2 scan work. The phone scan is heavy but usable; camera/framing and phone performance remain improvement targets.

The temporary symmetric front steering bridge remains an R1 driving baseline, not final rig/steering authority. Final rig geometry waits for better JURE-authored evidence.

## Current private candidate

Working branch:

`work/friends-r1-usability`

Current candidate work is isolated from accepted `main` until canonical build + owner/device validation.

Implemented:

1. **Exact build identity** — release bundle carries its exact private source SHA and the Friends gate cross-checks it against `build-manifest.json`.
2. **Debug performance readout** — while Debug is open it reports frame cadence, backing resolution, effective render scale and device DPR separately.
3. **Camera preparation** — pure aspect-ratio math and a bounded responsive-distance candidate exist, but camera behavior is still not wired or changed.
4. **JSPREV2 cost baseline** — current CPU/GPU geometry, texture footprint and draw-call lower bound are quantified.
5. **PERF-S1: conservative scan frustum culling** — each scan group receives a local AABB once during renderer upload. A group is skipped only when all eight AABB corners prove it fully outside the same homogeneous clip plane. Scan geometry, textures, collision and source format are unchanged.
6. **PERF-S1 diagnostics** — Debug now also reports visible/total scan groups and visible/total scan draw calls.
7. **PERF-S2: render-matrix reuse** — the scan model is built once and the shared `viewProjection × scanModel` matrix is reused for culling and every visible scan draw. Identity-world draws use `viewProjection` directly instead of recomputing the same matrix per draw.
8. **Documentation reduction** — current docs describe current boundaries; Git history is the cold archive.

PERF-S1/S2 are source-reviewed performance candidates, not yet a claim of measured phone improvement. Conservative culling math passed supplemental strict TypeScript 5.8 checks and perspective/clip-space cases; matrix reuse passed bit-equivalence checks. Canonical Node 24.16 / npm 11.13 / TypeScript 7 / Vite 8 validation and real-device measurement are still pending.

## Current scan cost

```text
7 tiles
25 render groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
111,288,484 B source payload

render typed arrays:        66,419,284 B
collision typed arrays:     38,225,544 B
total typed-array geometry: 104,644,828 B
estimated GPU geometry:     55,764,634 B
base RGBA8 texture texels:  104,857,600 B (100 MiB)
```

The merged ~38.2 MB collision copy is passed to Box3D and is not disposable renderer waste.

Current WebGL1 Uint16 chunking makes 13/25 logical groups exceed one chunk, so the approved scan requires at least **38 scan draw calls** before other world draws. PERF-S1 can now skip whole groups and all of their chunks when offscreen; Debug exposes the actual visible counts.

All 25 scan textures are still created and loaded eagerly. Culling therefore reduces draw/triangle work only; it does **not** yet reduce scan download, texture decode, GPU texture residency or CPU collision memory.

## Performance direction

Do not add geometric LOD or rewrite collision before simpler evidence-backed levers are exhausted.

The next useful device candidate should let us measure:

```text
exact build SHA
frame ms / fps
canvas backing resolution
effective render scale / device DPR
visible scan groups / total groups
visible scan draws / total draws
```

From that one device pass choose the next lever:

1. **render/backing scale** if fps tracks pixel workload;
2. **texture resolution or visibility-driven texture residency** if memory/upload pressure dominates;
3. **Uint32 index fast path** only if draw-call pressure remains high and the phone supports it — it trades fewer draws for larger index buffers;
4. **bounded scan-load pipelining** if startup/download/parse time is the main problem;
5. collision-memory restructuring only with physics/memory evidence;
6. geometric LOD/streaming only if the simpler changes are insufficient.

Camera work stays prepared but separate from the first performance measurement so performance and composition changes are not mixed unnecessarily.

## Explicit boundaries now

- do not restart old-build handling archaeology;
- do not change final steering/rig against the provisional bridge;
- do not hide the full scan on phone instead of optimizing/measuring it;
- do not claim PERF-S1/S2 improved a real phone before device evidence;
- do not introduce speculative LOD/streaming architecture;
- do not create new orchestration/process frameworks.
