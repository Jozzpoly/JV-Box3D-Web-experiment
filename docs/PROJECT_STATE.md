# JV Web — current project state

Updated: 2026-08-14
Owner: Jozz
Status: `FRIENDS R1 LIVE / USABILITY FOUNDATION CANDIDATE IN PROGRESS`

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
2. **Debug-only frame/viewport observer** — only while Debug is open, the browser samples average frame time/FPS and reports the actual WebGL canvas resolution and device pixel ratio. Closing Debug stops the sampling loop.
3. **Documentation reduction** — obsolete recovery/handoff/implementer/native-port documents are removed from the current tree rather than kept as competing inactive authorities. Git history preserves them.

These candidate changes are **not live and not owner-accepted yet**. They do not change vehicle physics, scan geometry, collision or normal rendering behavior.

## Performance facts established before optimization

Current approved scan:

```text
7 tiles
25 render groups / 25 textures
1,409,687 vertices
1,775,775 triangles
~111 MB source payload
```

Current renderer behavior:

- all scan groups are uploaded when the world renderer is created;
- all scan groups are drawn every frame;
- there is no frustum/tile culling, streaming or geometric LOD;
- WebGL1-compatible meshes are split into Uint16 chunks;
- texture policy currently provides nearest/linear filtering only.

Current scan data path retains only global `worldBounds`; individual render groups do not preserve their own bounds/tile identity in `JvWorldData`. The loader already visits every vertex and later creates a merged collision mesh plus another full bounds pass.

Therefore future culling does **not** require a new JSPREV2 source format. If measurement justifies it, group bounds can be preserved during existing parsing with little extra work. Do not add that contract until measurement shows it is useful.

## Rig/JURE boundary

Do not restart manual hardpoint reconstruction or the old steering-coupling expedition as the default next step.

FL lower placement, wishbone<->knuckle mating and final spatial steering geometry wait for better authored evidence from JURE. JV Web should later consume a small explicit authored-output contract rather than grow a second rig editor.

## Next sequence

1. Finish the usability candidate without touching vehicle mechanics.
2. Build it canonically once there is enough owner-visible value to justify one device/public test.
3. In that test use Debug to identify the exact build and record desktop/phone frame time, FPS, backing resolution and DPR.
4. Tune aspect-aware mobile camera/framing as a separate reversible commit; preserve normal desktop behavior.
5. Improve responsive controls only after camera composition is understood.
6. Use measured scan cost to choose the cheapest optimization: resolution/DPR, memory duplication, visibility/group culling, draw workload or texture path.
7. Consider geometric LOD/streaming only if simpler measured wins are insufficient.

## Explicit non-goals now

- old-build archaeology for remembered handling;
- final steering/handling work against the provisional rig;
- hiding/disabling the scan on phone instead of measuring it;
- speculative scan LOD architecture;
- another rig workbench inside JV Web;
- new process/documentation frameworks.
