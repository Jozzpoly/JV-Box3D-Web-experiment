# AI project memory — JV Web

Updated: 2026-08-14
Status: `FRIENDS R1 LIVE / FOUNDATION NORMALIZATION / RIG + FINAL STEERING DEFERRED TO JURE`

This file is only a router. Current Git, runtime evidence and direct owner observation outrank it.

## Current product truth

- accepted private source line: `main` after Friends foundation integration;
- current Friends source baseline before documentation/tooling normalization: `0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb`;
- live public Friends: `release/friends-r1@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable rollback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Owner validated on real devices:

- Plac E2R: works on desktop and phone;
- Offroad: works and the car drives over terrain;
- full JSPREV2 scan: works on desktop and phone after the Pages/CDN transport-length fix;
- phone scan: noticeably slow/heavy but still usable at low speed;
- phone camera/framing and parts of responsive UI remain rough.

## Vehicle truth

Keep the current temporary coherent-front bridge as the R1 baseline. It materially fixed the previous mixed left/right front mechanism.

Do **not** promote it to final steering architecture. Final rig, FL lower placement, wishbone/knuckle mating, steering back-drive/self-align and final handling remain open.

Do not resume the old bilateral steering-coupling experiment by default. Better rig geometry/frames are expected from JURE first.

## Scan truth

The current approved Friends scan is intentionally public. Pages-safe asset URLs are relative to the site base. Runtime integrity is based on decoded body bytes + JSPREV2 structure, not compressed HTTP `Content-Length`.

Current full scan metrics: 7 tiles, 25 groups/textures, 1,409,687 vertices, 1,775,775 triangles.

## Next product phases

1. finish foundation cleanup and integrate accepted source into `main`;
2. simplify release/update diagnosis;
3. mobile camera/layout pass;
4. measure scan CPU/GPU/memory/draw bottlenecks and apply simple wins first;
5. later consume authored rig outputs from JURE;
6. revisit final steering/feel only from improved rig evidence.

Read `docs/PROJECT_STATE.md` for the current boundary. Historical campaign/handoff files are cold evidence only.
