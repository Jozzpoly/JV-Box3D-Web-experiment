# AI project memory — JV Web

Updated: 2026-08-10
Status: `R0 PUBLISHED / R1 ACTIVE / V0 OWNER BASELINE OBSERVED / VISUAL RIG CORRECTION NEXT`
Owner: Jozz

This file is deliberately short. It is a navigation/current-state memory, not a history dump. Current Git, executable evidence and direct owner observation outrank this file.

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

The frozen `archive/pre-cleanup-2026-08-10` and other retained historical/salvage refs are not ordinary takeover inputs.

## Reproducible current owner-rig artifact

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

The physical wheel spin center and authored `Socket_WheelMount` remain intentionally distinct. Current browser physics remains `legacy_ts_m6`, a reference browser fixture rather than native JV product-physics authority.

## V0 — fresh owner truth

On 2026-08-10 Jozz ran the unchanged reproducible rig through the exact Windows validation launcher. Exact Node 24.16.0 / npm 11.13.0, typecheck, deterministic generation, 13 focused tests and the Vite build completed successfully.

That technical PASS does **not** mean the rig is visually correct.

Fresh OWNER OBSERVED state:

- chassis/body placement is roughly acceptable;
- suspension/wishbones are too far from the frame;
- damper/spring rigging is wrong and large portions intersect/enter the wheels;
- cardans reach the hub/wheel region but do not meet the differential at the correct visible location;
- much of the suspension/upright/hub package between wheel and wishbones is buried inside the wheels;
- wheel placement cannot yet be judged confidently because other rig parts obscure it;
- overall arm angles are not disastrous, but the vehicle should sit slightly higher;
- driving feel, suspension stability and steering feel are strongly regressed; deliberately defer that lane until the visual rig is coherent;
- the scan unexpectedly loaded successfully in this validation session; useful OWNER OBSERVED fact, but outside the current car lane.

The earlier R4 observation remains historical evidence, not current visual authority. `owner_r4` / `Tire=0` were never persisted exact presets.

## Current continuation

Do not repair all assets at once and do not begin physics/feel tuning now.

```text
V0 current-state observation COMPLETE
-> treat exact V0 artifact as the comparison baseline, not as accepted geometry
-> map dependency order for visual rig corrections
-> change one small mechanism/relationship at a time
-> generate a stable candidate
-> Jozz validates that one visible question
-> record/freeze accepted result
-> only then open the next mechanism
```

The likely dependency root is chassis/wishbone/hardpoint placement, because hub/upright, damper and cardan evaluation depends on the basic chassis-to-wheel suspension skeleton. This is a planning hypothesis, not yet an implemented correction.

Do not work on handling/stability/steering feel until Jozz explicitly reopens that lane after visual rig closure.

## Fresh-agent read order

1. current refs
2. `AGENTS.md`
3. this file
4. `docs/HANDOFF.md`
5. exact source/tests for the one active mechanism

Use `docs/PROJECT_STATE.md` and `docs/OWNER_CHECKPOINTS.md` for deeper current evidence. Do not reconstruct historical branches by default.
