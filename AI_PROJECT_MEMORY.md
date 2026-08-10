# AI project memory — JV Web

Updated: 2026-08-10
Status: `R0 PUBLISHED / R1 ACTIVE / V0 OWNER BASELINE OBSERVED / VISUAL RECOVERY PREPARED / PRODUCT CORRECTION NOT STARTED`
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

Prepared dependency order is interface-first: chassis/corner attachment authority -> corner body-role landing -> wishbones -> upright/hub/wheel -> dampers -> steering rods -> cardans -> stance -> whole-rig integration -> later handling/feel.

Native JV must be checked selectively before inventing a new mapping for a mechanism. Do not wholesale port native code.

Measurement-only tool is available:

```text
npm run inspect:owner-rig-interfaces
```

It compares authored placement, current physical targets and rendered-chassis proximity and groups the 59 real bindings. It deliberately does not define current values as accepted thresholds.

## Current continuation

No product correction has started after V0.

When Jozz explicitly opens implementation, begin with one smallest S1 chassis-to-wishbone attachment question. Measure/discriminate authority first, then make the minimum product correction, produce a stable candidate and ask one focused owner question. Freeze accepted scope before opening another mechanism.

Do not begin handling/stability/steering-feel tuning during visual recovery.

## Fresh-agent read order

1. current refs
2. `AGENTS.md`
3. this file
4. `docs/HANDOFF.md`
5. `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`
6. exact source/tests for the one active mechanism

Use `docs/PROJECT_STATE.md` and `docs/OWNER_CHECKPOINTS.md` for deeper current evidence. Do not reconstruct historical branches by default.
