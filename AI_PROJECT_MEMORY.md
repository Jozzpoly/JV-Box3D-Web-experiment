# AI project memory — JV Web

Updated: 2026-08-14
Status: `FRIENDS R1 LIVE / USABILITY FOUNDATION CANDIDATE IN PROGRESS`

This file is only a router. Current Git, runtime evidence and direct owner observation outrank it.

## Current product truth

- accepted private source authority: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- live public Friends: `release/friends-r1@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- private source used by that live hotfix: `0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb`;
- immutable rollback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`;
- current non-accepted usability/foundation candidate: `work/friends-r1-usability`.

Owner validated on real devices:

- Plac E2R works on desktop and phone;
- Offroad works and the car drives over terrain;
- full JSPREV2 scan works on desktop and phone after the Pages/CDN transport-length fix;
- phone scan is noticeably slow/heavy but still usable at low speed;
- phone camera/framing and parts of responsive UI remain rough.

## Vehicle truth

Keep the current temporary coherent-front bridge as the R1 baseline. It materially fixed the previous mixed left/right front mechanism.

Do **not** promote it to final steering architecture. Final rig, FL lower placement, wishbone/knuckle mating, steering back-drive/self-align and final handling remain open.

Do not resume the old bilateral steering-coupling experiment by default. Better rig geometry/frames are expected from JURE first.

## Scan truth

The current approved Friends scan is intentionally public. Pages-safe asset URLs are relative to the site base. Runtime integrity is based on decoded body bytes + JSPREV2 structure, not compressed HTTP `Content-Length`.

Current full scan metrics: 7 tiles, 25 groups/textures, 1,409,687 vertices, 1,775,775 triangles.

## Current direction

Foundation normalization pass 1 is complete on accepted `main`. The isolated usability candidate adds exact build identity, Debug-only frame/viewport observability and further documentation reduction without changing vehicle mechanics or scan geometry.

Next slices:

1. canonically build enough owner-visible usability work to justify one device test;
2. use the new Debug readouts to measure desktop/phone frame time, FPS, backing resolution and DPR;
3. tune mobile camera/framing as a separate reversible slice;
4. improve responsive controls after camera composition is understood;
5. choose simple measured scan wins before advanced LOD;
6. later consume authored rig outputs from JURE;
7. revisit final steering/feel only from improved rig evidence.

Read `docs/PROJECT_STATE.md` for the current boundary. Historical campaigns, handoffs, ADRs and orchestration proposals are recoverable from Git history only when a specific historical question requires them.
