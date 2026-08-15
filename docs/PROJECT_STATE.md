# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `PERFORMANCE FOUNDATION V1 OWNER-VALIDATED / CANONICAL PROMOTION PENDING`

## Authority and rollback

```text
private accepted: main@f8eb0908f5934aed2d504f34ce483a02754039ec
private active: work/friends-r1-live-perf
private validated source checkpoint: checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c
public isolated A53 proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public known-good Friends rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git/ref, reproducible execution evidence and direct owner observation outrank this document. `main` remains accepted authority until the canonical promotion gate is completed.

## Product boundary

The current Friends foundation preserves Plac E2R, Offroad, the owner vehicle and the complete JSPREV2 scan. The stress scan remains:

```text
7 tiles / 25 groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
66,419,624 B binary geometry
44,858,270 B encoded textures
111,288,484 B published scan payload
```

Physics remains fixed 60 Hz with the existing solver/substeps and vehicle complexity. No LOD, world partitioning, scan-content reduction or final steering/JURE work was used to obtain the current mobile result.

## What performance foundation v1 contains

The active source absorbs the grounded and device-tested low/medium-cost stack:

- scan-group frustum culling and shared scan matrix/WebGL pass state reuse;
- physics catch-up decoupled from presentation: multiple required steps, at most one presentation per browser frame;
- rich trace/visual materialization only for the final presented state;
- direct Uint32 scan-index upload when supported, Uint16 direct/chunk fallback otherwise;
- parser-pass finite validation and required scan bounds instead of later full geometry passes;
- normal browser caching and bounded two-way tile loading;
- hidden Debug work suppression;
- performance/startup telemetry including scan-loader phases and texture readiness/upload;
- mobile/coarse-pointer compositor policy that removes live backdrop blur and heavy shadows over the changing WebGL canvas.

The compositor change was a major measured correction, not cosmetic cleanup: on the Galaxy A53 the previous Offroad control case was around 35 present/s; with the mobile compositor policy it reached and sustained 60 present/s at 16.7 ms average / p95 16.8 ms.

## Owner-observed A53 Chrome result

Scope: Galaxy A53, normal Chrome, render scale 1x, DPR about 2.81, culling ON, current device-gate source.

Settled evidence:

- Offroad: 60 browser RAF/s and 60 scene present/s, 16.7 ms average, p95 16.8 ms;
- full textured JSPREV2 with 19/25 groups visible: 60 browser RAF/s and 60 scene present/s, 16.7 ms average, p95 16.8 ms;
- transient earlier settled scan samples were 57–58 present/s before converging to 60;
- one captured catch-up sample showed `sim 2 / physics 9.5 ms`; later stable driving returned to `sim 1 / physics 0.7 ms`.

This is sufficient evidence that the lightweight performance foundation achieved its current product goal. It is not evidence for 60 fps at render scale 2x, future larger/multiple scans, other devices or all camera views forever.

## Startup evidence and interpretation

One tested warm/cache scan run reported:

```text
product world: 1337 ms
index: 24 ms
tile pipeline: 1127 ms
parse CPU: 268 ms
collision merge: 53 ms
GPU synchronous setup/submission: 528 ms
Box3D module/boundary load: 520 ms
Box3D world create: 3418 ms
vehicle create: 22 ms
texture ready: 25/25
cumulative synchronous texImage2D call time: 776.2 ms
```

Interpretation rules:

- `parse 268 ms` is contained inside the `tiles 1127 ms` pipeline; do not add it again when estimating loader wall time;
- index + tile pipeline + collision merge is roughly 1204 ms and is consistent with the outer 1337 ms product-world measurement plus surrounding work;
- compared with the Offroad sample (`b3-world 389 ms`), the scan adds roughly 3.0 s to Box3D world construction in this warm run, making collision representation the strongest obvious future startup/scaling target;
- 776.2 ms texture upload is cumulative synchronous call time, not measured GPU completion or residency;
- the owner observed geometry loading materially faster than earlier builds and textures completing roughly a second after geometry, but this was not a controlled cold-cache network benchmark.

## Decision: close lightweight optimization, preserve scaling targets

Do not continue micro-optimizing this exact JSPREV2 by default. The remaining work is more valuable as future scaling architecture than as another benchmark pass on an asset already sustaining 60 Hz in the tested case.

When larger scans, multiple scans or higher render quality justify it, prefer this order:

1. **separate collision proxy/export** — reduce the expensive Box3D world build without changing visual scan fidelity;
2. **texture scheduling/residency** — bounded/priority decode and upload if startup hitches become material again;
3. **world-data lifetime** — release heavy decoded JS representations only after exact Box3D binding ownership is proven safe;
4. **VAW/JSPREV3 asset format** — precomputed bounds/index format, GPU-friendly streams and spatial chunks with a separate collision representation;
5. **LOD/world partitioning** — only once working-set measurements on future worlds require it.

Optional micro-wins such as VAO, scan-unlit or backface-culling A/B remain experiments, not current priorities.

## Remaining formal gate

The real A53 proof was produced by the isolated noncanonical native-ESM Pages device gate using exact `box3d.js@0.0.2`. It validates browser runtime behavior and device performance, but it is not the canonical release artifact.

Before promotion to `main` / ordinary Friends release:

1. run the exact repo toolchain: Node 24.16.0, npm 11.13.x, lockfile dependencies, real `box3d.js@0.0.2`, TypeScript 7 and Vite;
2. run full `npm ci` / `npm run check`, real Box3D regression coverage and `npm run build:friends-r1` plus portable artifact checks;
3. browser-smoke the canonical artifact without framework/runtime errors;
4. promote only after the artifact is tied back to the validated private source and existing rollbacks remain intact.

Until that gate, `main` stays untouched.

## Next product direction after promotion

Performance is no longer the dominant owner-observed problem on the A53. The next owner-visible phase should therefore move to mobile experience: camera/framing, touch controls, joystick/steering interaction and responsive UX. Final rig/JURE and vehicle handling remain separate later phases.
