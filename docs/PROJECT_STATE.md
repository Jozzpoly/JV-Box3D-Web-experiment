# JV Web — current project state

Updated: 2026-08-14
Owner: Jozz
Status: `FRIENDS R1 LIVE / USABILITY + PERFORMANCE FOUNDATION CANDIDATE`

## Accepted/live authority

```text
private accepted source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
public live branch: release/friends-r1
public live commit: 7161215e47f00573b8c1b5c31e5931c89f9d709a
public rollback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
private source used by live hotfix: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
```

Owner validated on real desktop and phone:

- Plac E2R works;
- Offroad works and is driveable over terrain;
- full public JSPREV2 scan loads, renders and runs with live physics;
- portrait and landscape both run;
- phone scan is heavy but still usable at low speed;
- phone camera/framing and responsive composition remain rough.

The current symmetric front bridge remains a useful temporary R1 driving baseline, not final rig/steering/handling authority.

## Current private candidate

Working branch:

`work/friends-r1-usability`

This branch is intentionally isolated from accepted `main` because later camera/UI changes require owner-visible validation before integration.

Implemented there so far:

1. **Exact build identity** — Vite embeds the exact private source SHA into the client bundle. Debug shows the short source SHA; the full SHA is also present in the DOM. The Friends release gate cross-checks that the bundle marker matches `build-manifest.json`.
2. **Debug-only frame/viewport observer** — only while Debug is open, the browser samples average frame cadence and reports backing resolution, effective canvas render scale and device DPR separately. Closing Debug stops the sampling loop. This is browser frame cadence, not a GPU profiler.
3. **Camera viewport diagnostics** — a pure helper quantifies current 45-degree vertical-FOV framing at different aspect ratios without changing camera behavior.
4. **JSPREV2 performance baseline** — pure helpers quantify current CPU/GPU geometry, collision duplication, WebGL1 draw-call lower bounds and base-level RGBA8 texture cost without changing scan data or rendering.
5. **Documentation reduction** — obsolete recovery/handoff/implementer/native-port/process documents are removed from the current tree. Git history preserves cold evidence; executable format contracts remain.

These candidate changes are **not live and not owner-accepted yet**. They do not change vehicle physics, scan geometry, collision, camera behavior or normal rendering behavior.

## Validation checkpoint

The candidate remains a normal descendant of accepted `main`; no vehicle/physics/rig/scan-geometry paths were changed by the usability work.

Targeted review found and corrected one interpretation bug before device testing: raw `devicePixelRatio` is not the effective render scale because the renderer already caps canvas scaling at 2x. Debug now reports the actual canvas-derived render scale separately from device DPR.

Supplemental syntax/type/math checks have passed in the available Node 22 / TypeScript 5.8 environment. This is **not** canonical Node 24.16 / npm 11.13 / TypeScript 7 / Vite 8 release validation and is not browser/device acceptance.

## Camera facts before tuning

Current camera uses a fixed 45-degree vertical FOV and a 16:9-like desktop composition with fixed chase distance.

At 9:16 portrait, the available horizontal coverage is only `81/256 ~= 31.64%` of the 16:9 reference. Fully preserving horizontal framing would require roughly `3.16x` chase distance, which is intentionally treated as an over-aggressive diagnostic rather than a product setting.

Preserving projected object area gives a softer geometric-mean candidate of `16/9 ~= 1.78x` at 9:16. This is still **not accepted tuning** and is not wired into the renderer. The next camera slice should be bounded, reversible and judged on a real phone while preserving normal desktop composition.

## Scan performance facts before optimization

Current approved scan:

```text
7 tiles
25 render groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
111,288,484 B source payload
```

Current parsed geometry baseline:

```text
render typed arrays:       66,419,284 B
collision typed arrays:    38,225,544 B
total typed-array geometry:104,644,828 B
estimated GPU geometry:    55,764,634 B
```

The collision copy is not merely renderer waste: it is the merged mesh passed to Box3D as the scan collision. Removing it therefore crosses the physics boundary and is not an automatic first optimization.

Current renderer behavior:

- all scan groups are uploaded when the world renderer is created;
- all scan groups are drawn every frame;
- WebGL1-compatible meshes are split to Uint16 chunks;
- 13 of the 25 current groups exceed 65,535 vertices;
- therefore the scan requires **at least 38 WebGL draw calls** before Offroad and other static world draws;
- there is no frustum/tile culling, streaming or geometric LOD.

All 25 approved scan textures are 1024x1024 RGBA and the renderer uploads them as `RGBA / UNSIGNED_BYTE` without mipmaps. Their base-level texel payload is therefore 104,857,600 B (100 MiB). Combined with the current geometry estimate, base scan GPU geometry + texels are about 160,622,234 B (~153.2 MiB), before driver/implementation overhead. Encoded PNG bytes are not GPU texture residency.

## Optimization order from current evidence

Do not pick one bottleneck before the real device measurement. Use the first candidate build to record frame cadence, backing resolution and effective render scale on Plac, Offroad and Scan.

Then prefer the cheapest evidence-backed lever:

1. **backing resolution / render scale** if fill/pixel workload dominates;
2. **texture footprint** if memory/upload pressure dominates — current 100 MiB base texels make this a serious candidate;
3. **visibility/group culling** if draw/triangle workload dominates — current scan has at least 38 draw calls and no culling;
4. **CPU collision-memory restructuring** only if memory evidence justifies crossing the physics boundary;
5. geometric LOD/streaming only if simpler measured wins are insufficient.

Current scan data retains only global `worldBounds`; render groups do not preserve individual bounds/tile identity in `JvWorldData`. The loader already visits every vertex, so later culling can preserve group bounds during parsing without changing the JSPREV2 source format. Do not add that contract until measurement selects culling as the next real lever.

## Rig/JURE boundary

Do not restart manual hardpoint reconstruction or the old steering-coupling expedition as the default next step.

FL lower placement, wishbone<->knuckle mating and final spatial steering geometry wait for better authored evidence from JURE. JV Web should later consume a small explicit authored-output contract rather than grow a second rig editor.

## Next sequence

1. Keep the current instrumentation/preparation candidate isolated from `main`.
2. Add one small bounded aspect-aware camera implementation without changing vehicle mechanics or desktop defaults unnecessarily.
3. Build canonically once the candidate has enough owner-visible value to justify one device/public test.
4. On desktop and phone, record exact build identity plus Plac/Offroad/Scan frame cadence, backing resolution and effective render scale.
5. Accept/reject/tune the camera from the real device result.
6. Select exactly one first scan optimization from measured evidence and remeasure before adding another.
7. Consider responsive-control refinements after camera composition is understood.

## Explicit non-goals now

- old-build archaeology for remembered handling;
- final steering/handling work against the provisional rig;
- hiding/disabling the scan on phone instead of measuring it;
- speculative scan LOD architecture;
- changing scan collision just to save memory without physics evidence;
- another rig workbench inside JV Web;
- new process/documentation frameworks.
