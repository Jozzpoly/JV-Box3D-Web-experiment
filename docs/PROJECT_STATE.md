# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `CAMERA 1B OWNER-VALIDATED / PRIVATE ABSORPTION NEXT`

## Authority and active lane

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
current private lane source before Camera 1B absorption: dc8eab1ef3a24dcaab4b8fdff61da020c2518d5e
closed performance checkpoint: checkpoint/perf-foundation-v1-closed-2026-08-15
owner-tested performance code: checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c
public A53 proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public Camera 1B owner-device gate: release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d
public known-good rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git, reproducible execution evidence and direct owner observation outrank this file. `main` remains accepted authority until the canonical promotion gate is completed.

`work/friends-r1-usability` is the only ordinary active lane ahead of `main`. Old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless this section explicitly activates them. Do not encode transient ahead-counts here; derive them from Git when needed.

## Working product boundary

Friends currently includes Plac E2R, Offroad, the owner vehicle and the complete JSPREV2 scan on desktop/phone. The current vehicle's coherent-front bridge is a temporary product intermediate; final rig, steering feedback/back-drive and handling remain open. JURE owns future rig authoring.

Current JSPREV2 stress case:

```text
7 tiles / 25 groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
111,288,484 B published scan payload
```

Physics remains fixed 60 Hz with existing solver/substeps and vehicle complexity.

## Performance foundation v1 — closed scope

The private active source contains the validated low/medium-cost foundation: scan-group culling/state reuse, direct Uint32 index upload with safe WebGL1 fallbacks, parser-pass bounds/validation, bounded two-way tile loading, physics/presentation decoupling, deferred rich trace, hidden-debug suppression, startup/runtime telemetry and a lightweight mobile compositor policy.

Owner scope: Galaxy A53, normal Chrome, render scale 1x, DPR about 2.81, culling ON, current full textured JSPREV2.

Settled evidence reached 60 browser RAF/s and 60 scene presents/s at 16.7 ms average / 16.8 ms p95, including a scan view with 19/25 groups visible. Earlier settled samples were 57–58 present/s before convergence. One captured catch-up frame showed `sim 2 / physics 9.5 ms`; later sustained driving returned to `sim 1 / physics 0.7 ms`.

This closes lightweight optimization for the present stress case. It does **not** prove 60 fps at render scale 2x, cold-cache startup, other phones or future larger/multiple worlds.

One warm/cache scan sample reported `world 1337 ms`, `tiles 1127 ms` including `parse 268 ms`, `merge 53 ms`, `b3-world 3418 ms` and 25/25 textures ready with 776.2 ms cumulative synchronous texture-upload call time. Do not add nested timers or treat texture call time as GPU completion/residency.

## Camera usability — current boundary

Private `work/friends-r1-usability` currently contains Camera 1A at `dc8eab1...`: responsive framing, free-range zoom and distance-aware clipping while retaining the existing single-pointer orbit/wheel input path.

Camera 1B was built and owner-tested through the public noncanonical device gate after two publication-harness recoveries. Recovery V3 fixed only Pass2 overlay semantics in the gate; Camera 1B source/patch itself was unchanged by that recovery.

Exact public device evidence:

```text
public gate head: 4768abedaa67b7505ca963a0836879e42590b67d
private base named by gate: dc8eab1ef3a24dcaab4b8fdff61da020c2518d5e
local camera candidate named by gate: fde0127aa726bd57a97b5815572a4067e94c3807
camera patch SHA-256: fcc82118d607bed941b487d1f8222d291882c8f5ea51b600ade5b8ee04f1be78
camera runtime modules: 3
```

Owner verdict is `ACCEPTED — NARROW DEVICE/FEEL SCOPE`: focus/navigation around scan details worked well, Shift+scroll navigation improved usability, and approaching/inspecting a wall or corner and jumping to another scan area was no longer a fight with the camera. This does not accept every future gesture combination, presets/persistence, advanced assists, HUD/input redesign or automatic terrain/obstacle behavior.

**Important recovery boundary:** Camera 1B is not yet part of private source authority. The previous conversation ended immediately after the successful owner retest, before clean source absorption, canonical build/release promotion or the final durable checkpoint. The next task is to recover/verify the exact owner-tested camera slice and absorb only that slice into the existing active lane.

The public `release/friends-r1@4768abed...` head contains the Camera device-gate harness under `/camera-test/`; it is device evidence, not proof that the ordinary Friends root is a canonical Camera 1B release.

## Remaining formal promotion gate

Before advancing `main` / ordinary Friends release, run in the exact repo toolchain:

1. Node 24.16.0 + npm 11.13.x + lockfile dependencies;
2. `npm run check` with real Box3D coverage;
3. `npm run build:friends-r1` and portable checks;
4. rendered browser smoke of the resulting canonical artifact;
5. exact source/artifact/rollback identity verification.

Whether the current agent environment can execute this gate is session-specific and must be checked at execution time; do not preserve old environment failures as project truth.

## Next product phase

Immediate priority:

1. exact Camera 1B recovery/identity check;
2. clean Camera 1B absorption into `work/friends-r1-usability` with vehicle mechanics/performance/scan unchanged;
3. smallest relevant source checks plus rendered integration proof;
4. durable Camera 1B checkpoint and project-state update.

Only after that boundary is closed continue mobile usability with small owner-visible slices. Current candidate order:

1. camera persistence/presets;
2. immersive/fullscreen capability;
3. fresh HUD/settings review using current screenshots/build;
4. touch-control ergonomics and analog input foundation;
5. steering/joystick interaction;
6. advanced speed/turn/terrain/obstacle camera assists only after the manual foundation remains stable.

Keep vehicle mechanics unchanged unless a slice explicitly targets them. Automatic camera behavior must remain additive to manual user calibration.

Do not resume current-JSPREV2 micro-optimization by default. Future scaling work should be triggered by evidence and should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and a better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Documentation/workflow hygiene

Default context is `AGENTS.md` + this file + current source/tests. Use `ARCHITECTURE.md`, `OWNER_CHECKPOINTS.md`, contracts or baselines only for the question they answer.

Do not create per-agent handoffs, branch-role tables, campaign journals or duplicate roadmaps. When current truth changes, edit the existing living document and let Git preserve the previous version.
