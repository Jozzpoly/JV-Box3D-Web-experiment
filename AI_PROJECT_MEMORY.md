# AI project memory — JV Web

Updated: 2026-08-10
Status: `R0 PUBLISHED / R1 ACTIVE / OWNER VEHICLE INTEGRATED / OWNER REVALIDATION NEXT`
Owner: Jozz

This file is deliberately short. It is a navigation/current-state memory, not a history dump and not a handoff transcript. Current Git, executable evidence and direct owner observation outrank this file.

## Repository roles

```text
PRIVATE SOURCE / ACTIVE DEVELOPMENT
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

PUBLIC FRIEND-DEMO
Jozzpoly/JV-Box3D-Web-Public
release/r0 = frozen published rollback baseline

NATIVE JV
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

## Current product facts

- Current product entry is `index.html -> src/product-main.ts`.
- Current renderer loads the generated owner vehicle package `m6-owner-full-rig-r3`.
- Exact source generation reproduces 59 real bindings and GLB SHA-256 `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`.
- Wheel physical spin center and authored `Socket_WheelMount` are intentionally distinct and protected.
- Current browser physics remains `legacy_ts_m6`, a reference browser fixture, not native JV product-physics authority.
- Private LOCAL_FULL JSPREV2 wiring remains present; public R0 remains scan-free.

## Owner-observed vehicle baseline

The latest accepted session baseline is informally called **R4**. Jozz observed that wheel placement was excellent and suspension packaging was close, while the front steering/upright pivot still looked wrong and front steering rods were too short. Overall stance was still slightly wide/low.

`owner_r4` and `Tire=0` were session observations/settings, not persisted source presets. Do not claim exact reproduction of those names/settings unless they are explicitly encoded later.

See `docs/OWNER_CHECKPOINTS.md` for the evidence classification and protected baseline.

## Current continuation

Do **not** begin new steering correction yet.

```text
V0 Owner Baseline Revalidation
-> run the unchanged R4/R3 owner-rig product baseline
-> Jozz observes the complete current rig in game and describes its actual state
-> no new geometry/physics correction during V0

Only after V0 owner feedback
-> choose the smallest next technical slice from the observed problem
-> F0 Front Steering Truth remains a prepared diagnostic if the steering/upright pivot is still the priority
```

Do not simultaneously retune ride height, track width, rear suspension, cardans, drivetrain, camera or UI while establishing the baseline.

## Handoff/read order

Fresh continuation:

1. current refs
2. `AGENTS.md`
3. this file
4. `docs/HANDOFF.md`
5. exact source/tests for the active question

Deeper only when needed:

- `docs/PROJECT_STATE.md`
- `docs/OWNER_CHECKPOINTS.md`
- `docs/ARCHITECTURE.md`
- `docs/baselines/*`
- `docs/HISTORY.md`

Do not reconstruct old candidate branches by default. Git history is the archive; old branch names are not authority.
