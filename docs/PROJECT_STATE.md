# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `FRIENDS R1 LIVE / MOVING PERFORMANCE LANE`

## Authority and rollback

```text
private accepted: main@f8eb0908f5934aed2d504f34ce483a02754039ec
private perf foundation: checkpoint/perf-foundation-s3-2026-08-15@20eca0451c81581649e061c8bc61d45001e32601
private active work: work/friends-r1-live-perf
public moving Pages lane: release/friends-r1@55f607aa2ff793a63343bf1bd4b4ab99523a0ceb
public known-good checkpoint: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

The owner already validated the known-good Friends build on desktop and phone: Plac E2R, Offroad, driving/touch and the full JSPREV2 scan work. The scan is intentionally available on phone and remains the primary performance target.

`release/friends-r1` is now a moving live-test lane. Reversible experiments may be published there quickly after bounded checks. The known-good checkpoint is immutable and is the immediate rollback target.

## Performance foundation

Private checkpoint `20eca045...` contains:

- PERF-S1 conservative scan-group frustum culling;
- scan visible-group/draw diagnostics;
- PERF-S2 shared render-matrix reuse;
- PERF-S3 logical-group WebGL state batching;
- same-build source controls `jvScanCull=0` and `jvRenderScale=1|1.5|2`.

These source slices are reviewed candidates; they are not all deployed by the current public overlay yet.

Current scan facts:

```text
25 groups / 25 textures
1,409,687 vertices
1,775,775 triangles
>=38 scan draw calls from Uint16 chunking
~55.8 MB estimated GPU geometry
100 MiB base RGBA8 texture texels
~38.2 MB merged collision arrays
```

## Current live experiment

Public commit `55f607aa...` preserves the known-good compiled app, scan, vehicles, scenes and receipts byte-for-byte. It adds only a pre-app performance overlay and removes the stale canonical build manifest from the moving test lane.

Query controls:

```text
jvRenderScale=1
jvRenderScale=1.5
jvRenderScale=2
jvPerfHud=1
```

Without these parameters behavior remains the known-good default. The overlay was checked in Chromium with forced DPR 3: default resolves to 2x backing scale, while the explicit caps resolve to 1.5x / 1x / 2x as requested.

The public `LIVE_BUILD.json` records that this is a supplemental live experiment, not canonical release authority.

## Development loop now

1. preserve known-good checkpoint;
2. make one meaningful, reversible performance change;
3. run cheap source/syntax/scope checks;
4. publish to the moving Pages lane;
5. measure on real desktop/phone;
6. keep, revise or instantly roll back;
7. update this file briefly.

Do not require a full release ceremony for ordinary live experiments. Canonical build/release gates return when promoting a tested state to accepted authority.

## Next performance decision

First measure the scan at default, 1.5x and 1x backing scale with the live HUD. If FPS strongly follows pixel count, implement a proper source-level device/backing-scale policy. If it does not, prioritize texture residency/upload, scan-group draw cost and load pipeline before geometric LOD.

Boundaries remain: do not reopen final steering/JURE work, do not hide the scan on phone, and do not claim measured gains before real-device evidence.
