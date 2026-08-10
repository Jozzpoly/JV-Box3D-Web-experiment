# AI project memory — JV Web

Updated: 2026-08-10
Status: `R0 PUBLISHED / R1 ACTIVE / V0 OWNER BASELINE OBSERVED / VISUAL RECOVERY PREPARED / ORCHESTRATOR-IMPLEMENTER SPLIT ACTIVE`
Owner: Jozz

This file is deliberately short. It is navigation/current-state memory, not a history dump. Current Git, executable evidence and direct owner observation outrank this file.

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

The frozen archive and retained salvage refs are not ordinary takeover inputs.

## Reproducible current owner-rig artifact

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

The physical wheel spin center and authored `Socket_WheelMount` remain intentionally distinct. Browser `legacy_ts_m6` remains a reference fixture rather than native product-physics authority.

## V0 — current owner truth

Exact Windows V0 execution passed toolchain/typecheck/deterministic generation/13 focused tests/build, but that is not visual acceptance.

Current OWNER OBSERVED state:

- chassis/body roughly acceptable;
- wishbones/suspension too far from the frame;
- damper/spring rig wrong and intersecting wheels;
- cardans do not visually mate correctly at the differential;
- upright/hub/suspension geometry is buried in wheels, so wheel placement is not yet reliably judgeable;
- ride height should eventually be slightly higher;
- driving feel/stability/steering feel are strongly regressed and explicitly deferred until visual recovery closes;
- scan unexpectedly works, but scan work remains outside the active lane.

Earlier R4 visual observations remain historical evidence only.

## Recovery preparation — complete

Durable execution contract: `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

Measurement-only tool:

```text
npm run inspect:owner-rig-interfaces
```

Prepared dependency order remains interface-first: chassis/corner attachment authority -> corner body-role landing -> wishbones -> upright/hub/wheel -> dampers -> steering rods -> cardans -> stance -> whole-rig integration -> later handling/feel.

## Execution split

Jozz intentionally separated the project into an orchestrator lane and a disposable bounded implementer lane to reduce context-overload failures.

Protocol: `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md`.

Active implementation packet: `docs/IMPLEMENTER_TASK.md`.

The orchestrator owns truth/scope/review/integration. The implementer owns only the current bounded technical task on its named work branch. Owner observations return to the orchestrator.

A bounded implementer does **not** use the normal fresh-agent read order below; it follows the smaller role-aware bootstrap in `AGENTS.md` and `IMPLEMENTER_TASK.md`.

During an active implementer slice, ordinary writes to `main` are frozen until review/integration/rejection closes the branch transaction.

## Current continuation

First prepared implementer task is S1-A: discriminate front chassis-to-wishbone attachment authority and make a minimum visual/calibration correction only if the cause is sufficiently proven. If physical hardpoints themselves are implicated, stop and replan rather than changing runtime physics in the same slice.

Do not begin handling/stability/steering-feel tuning during visual recovery.

## Fresh orchestrator / unspecialized-agent read order

1. current refs
2. `AGENTS.md`
3. this file
4. `docs/HANDOFF.md`
5. active control/campaign docs as required
6. exact source/tests for the one active question

Use `docs/PROJECT_STATE.md` and `docs/OWNER_CHECKPOINTS.md` for deeper current evidence. Do not reconstruct historical branches by default.
