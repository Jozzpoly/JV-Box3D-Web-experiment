# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `PERFORMANCE FOUNDATION V1 CLOSED / MOBILE USABILITY NEXT`

## Authority and active lane

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
closed performance checkpoint: checkpoint/perf-foundation-v1-closed-2026-08-15
owner-tested performance code: checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c
public A53 proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public known-good rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git, reproducible execution evidence and direct owner observation outrank this file. `main` remains accepted authority until the canonical promotion gate is completed.

`work/friends-r1-usability` is the only ordinary active lane ahead of `main`. Old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless this section explicitly activates them.

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

## Remaining formal promotion gate

The device proof used an isolated native-ESM Pages gate with real `box3d.js@0.0.2`, not the normal canonical Friends artifact.

Before advancing `main` / ordinary Friends release, run in the exact repo toolchain:

1. Node 24.16.0 + npm 11.13.x + lockfile dependencies;
2. `npm run check` with real Box3D coverage;
3. `npm run build:friends-r1` and portable checks;
4. rendered browser smoke of the resulting canonical artifact;
5. exact source/artifact/rollback identity verification.

The current agent environment remains blocked by Node/npm mismatch plus registry DNS, so lack of this gate is infrastructure evidence, not a known product failure.

The active lane is currently a linear 42 commits ahead of `main`, with no divergence. Prefer clearing this promotion boundary before any new multi-slice or foundation-scale campaign. If the infrastructure blocker persists, keep interim work to small independently reviewable usability slices on the single active lane rather than allowing another long-lived product branch to form.

## Next product phase

Performance is no longer the dominant owner-observed A53 problem. Continue on `work/friends-r1-usability` with small owner-visible slices focused on:

1. mobile camera/framing and easy navigation;
2. touch-control ergonomics;
3. steering/joystick interaction;
4. responsive layout/visual clarity.

Keep vehicle mechanics unchanged unless a slice explicitly targets them. For each UI slice: targeted tests first, then rendered desktop/mobile browser validation, then owner/device judgement when feel matters.

Do not resume current-JSPREV2 micro-optimization by default. Future scaling work should be triggered by evidence and should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and a better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Documentation/workflow hygiene

Default context is `AGENTS.md` + this file + current source/tests. Use `ARCHITECTURE.md`, `OWNER_CHECKPOINTS.md`, contracts or baselines only for the question they answer.

Do not create per-agent handoffs, branch-role tables, campaign journals or duplicate roadmaps. When current truth changes, edit the existing living document and let Git preserve the previous version.
