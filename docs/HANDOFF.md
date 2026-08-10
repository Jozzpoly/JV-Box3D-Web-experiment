# JV Web — current handoff

Updated: 2026-08-10
Purpose: rolling continuation note. Keep this short; replace stale content instead of appending history.

## Authority

```text
Private repo: Jozzpoly/JV-Box3D-Web-experiment
Active branch: main
R1 product baseline before documentation/repo maintenance:
  commit 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
  product tree e28515182d3a447374044d9ffc70943fb888328d
Maintenance lineage integrated the cleaned R1 source into default main without owner-rig product redesign.

Public repo: Jozzpoly/JV-Box3D-Web-Public
Frozen Pages branch: release/r0
```

Always resolve live tips before writing.

## Protected current vehicle baseline

Generated package:

```text
id: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

The current owner-rig implementation is intentionally frozen until Jozz revalidates it in game. Do not make a steering/upright/rod correction before that observation.

Protected during V0 revalidation:

- current complete owner-rig geometry and physical topology;
- current wheel placement;
- physical wheel spin center vs authored `Socket_WheelMount` distinction;
- front/rear suspension packaging, cardans and dampers exactly as currently generated;
- drivetrain, camera, world and UI.

`owner_r4` and `Tire=0` are owner/session observations, not persisted source presets.

## Why revalidate before new work

The previous development/handoff sequence was interrupted after R4 packaging and an initial steering investigation. Historical observations indicate that front steering/upright pivot and steering rods may still be wrong, but the new orchestrator must first obtain a fresh OWNER OBSERVED description of the complete current rig rather than planning corrections from inherited descriptions alone.

Known technical suspects remain hypotheses until after this owner checkpoint:

- front visual reference calibration has no independent authored lower-outboard marker and derives it as a parallel-upright inference;
- existing dynamic steering tests do not measure the decisive live kingpin/anchor relationship;
- steering-link visual calibration still has an old bounds/reference-length path.

Do not convert those suspects into patches during V0.

## Next checkpoint — V0 Owner Baseline Revalidation

**No product correction during V0.**

A local owner-validation package has been prepared from the exact R4 product tree and current deterministic owner-rig sources. Its launcher is intended to:

1. use exact Node 24.16.0 / npm 11.13.0;
2. install pinned dependencies;
3. typecheck;
4. regenerate the owner package;
5. verify 829944 bytes / 59 real bindings / exact GLB SHA above;
6. run focused owner-rig/steering regression tests;
7. build and start a stable local browser candidate.

The package does not introduce a post-R4 correction. It exists only to establish fresh owner observation.

## Owner interaction for V0

Jozz should only drive/look and describe what is currently present, especially:

- wheel placement and overall stance;
- front upper/lower arms and upright/knuckle behavior through steering;
- whether the visible steering pivot still looks wrong and how;
- steering rods and their apparent endpoints/length;
- dampers, rear package and cardans if anything still looks wrong;
- any driving/camera issue only if it materially obstructs rig evaluation.

Do not ask Jozz to diagnose source code or run manual technical debugging.

After V0, record the fresh owner observation in `docs/OWNER_CHECKPOINTS.md`. Only then choose the smallest next technical slice.

## Conditional next diagnostic — F0 Front Steering Truth

F0 is prepared but **deferred until after V0**. If the fresh owner observation still identifies steering/upright pivot as the first priority, instrument/measure FL and FR at neutral, partial and full lock:

1. upper-arm ball anchor vs knuckle upper anchor residual;
2. lower-arm ball anchor vs knuckle lower anchor residual;
3. live upper->lower kingpin line;
4. incremental knuckle rotation axis vs current live kingpin;
5. wheel spin-center distance/orbit around live kingpin;
6. actual steer angle;
7. rack endpoint vs knuckle steering-arm endpoint;
8. visual transforms of front knuckle and steering-link bindings.

Establish numerical tolerance from neutral/noise behavior before judging full-lock data. Do not assume F0 remains the first correction lane if V0 reveals a more fundamental current-state problem.

## Environment note

The orchestrator environment can deterministically regenerate the owner R3/R4 artifact from the recovered product snapshot, but it does not currently have registry access or an installed exact Windows/Node toolchain for a canonical browser build. Therefore canonical local build/runtime evidence for V0 is intentionally delegated to the self-contained launcher on Jozz's Windows machine; failures should be returned as logs rather than debugged manually by Jozz.
