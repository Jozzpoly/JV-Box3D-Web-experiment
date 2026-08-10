# JV Web — owner checkpoint ledger

Updated: 2026-08-10

This ledger records owner-visible decisions that future agents must preserve. It is not a generic test log.

## Evidence rule

For each meaningful owner-visible checkpoint keep exact source/artifact identity when available, the changed or observed scope, the owner verdict, what becomes protected, and what remains open.

Do not treat a green automated test as owner acceptance. Do not treat a session nickname as a reproducible preset unless its parameters are committed.

## P0 — playable owner vehicle foundation

```text
source: 81c9677e12a331953101eb2531ca8ab013a985f9
classification: OWNER ACCEPTED
```

Observed working foundation included real owner chassis + four wheels, Box3D/M6 drive/steer/brake/reset, chase camera, orbit/zoom, Map/Offroad teleports and separated debug behavior.

Durable meaning: browser owner-vehicle integration is proven playable history.

## R2 — full owner rig first package

```text
source: 5d508485ba5c24e6552e324cfbbcb5ec19399fec
classification: OWNER REJECTED VISUALLY / TECHNICAL EVIDENCE ONLY
```

Owner observation found major calibration defects: suspension too wide/inside wheels, dampers misplaced and cardans wrong. Do not resurrect R2 placement merely because its tests are green.

## R4 — historical partial observation

```text
source lineage baseline: 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
product tree before documentation maintenance: e28515182d3a447374044d9ffc70943fb888328d
package id: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: HISTORICAL OWNER PARTIAL OBSERVATION
```

Historical session observation said wheel placement was excellent, suspension packaging almost excellent, stance a little too wide/low, steering rods too short and front steering/upright pivot wrong.

This is **no longer the current protected visual baseline** after V0 below. `owner_r4` and `Tire=0` were session-level settings/labels and were never persisted as an exact reproducible preset. The discrepancy between R4 and V0 must remain explicit rather than being explained away without evidence.

## V0 — exact current owner-rig revalidation

```text
date: 2026-08-10
product lineage: unchanged R4/R3 owner-rig product tree
package id: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER OBSERVED / CURRENT VISUAL BASELINE REJECTED AS FINAL GEOMETRY
```

### Canonical execution evidence

Windows validation launcher completed with:

- Node 24.16.0;
- npm 11.13.0;
- pinned dependency install;
- TypeScript typecheck;
- exact deterministic owner-rig generation and identity verification;
- 13/13 focused owner-rig/steering tests PASS;
- Vite 8.1.5 production build PASS;
- artifact identity reverified after build;
- browser validation session launched and closed normally.

This proves that the observed rig is reproducible and that the current implementation satisfies its focused automated contracts. It does not make the visual geometry correct.

### OWNER OBSERVED visual state

Jozz reported and screenshots show:

- chassis/body is roughly in the right place and is currently the least problematic large element;
- suspension/wishbones are too far away from the frame;
- damper/spring rig is wrong: spring/segments move oddly and substantial damper geometry intersects or sits inside wheels;
- cardans reach the hub/wheel region but do not meet the differential at the correct visible location;
- suspension/upright/hub geometry between the wheel and wishbones is buried inside wheels;
- wheel placement cannot currently be accepted or rejected confidently because surrounding bad geometry hides the relevant interfaces;
- the general car/wishbone attitude is not disastrous, but the car should ultimately sit slightly higher.

### OWNER OBSERVED dynamic state — deferred

Driving feel, suspension stability and steering/controllability are strongly regressed relative to earlier playable experience.

Classification: **OWNER OBSERVED HIGH-SEVERITY DYNAMIC REGRESSION / DEFERRED BY OWNER**.

Do not tune this now. Visual rig correction comes first; handling/stability/steering feel is reopened only after the visual mechanical package is coherent.

### Incidental current observation

The scan unexpectedly loaded successfully in the V0 browser candidate. Record this as OWNER OBSERVED only. Do not divert the current car campaign into scan work.

### Protected meaning after V0

What is protected now is the **exact reproducible V0 starting artifact and its evidence**, not the visual placement of most rig parts.

Do not claim current wishbone, damper, cardan, hub/upright or wheel placement is owner accepted.

Do preserve:

- exact starting artifact identity for A/B comparison;
- current chassis/body as a roughly acceptable reference unless a selected slice proves a causal need to move it;
- the wheel-center vs `Socket_WheelMount` semantic distinction unless new evidence explicitly overturns it;
- the owner's decision to postpone physics/feel repair until visual rig work is closed.

## Next owner-checkpoint method

Future visual work uses very small dependency-driven slices. Each candidate should expose one visual question only.

Potential order after source dependency inspection:

```text
chassis <-> wishbone/suspension skeleton
-> hub/upright package
-> damper/spring rig
-> cardan endpoints
-> remaining local front/rear pieces
-> stance/ride height
-> whole-rig visual integration
-> later dynamic feel/stability/steering campaign
```

This is not permission to change all of those systems. Only one selected relationship may be open at a time, and accepted scope is frozen before moving on.
