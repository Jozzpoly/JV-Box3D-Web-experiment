# JV Web — accepted project state

Updated: 2026-08-10
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / IMPLEMENTATION FROZEN / S1 STATIC OWNER CHECKPOINT CAPTURED / NOT INTEGRATED`

This document describes the **accepted/integrated product state and durable current project boundary**. It is not an experiment log. `docs/HANDOFF.md` carries the currently frozen transaction/handoff state.

## 1. Authority model

```text
Private accepted product authority:
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

Frozen S1 experimental evidence:
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32
NOT INTEGRATED INTO main

Public artifact repo:
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

Native JV:
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

`main` and a work branch can temporarily carry different authority levels:

- `main` = accepted/integrated product;
- work branch = experimental implementation/evidence until explicitly integrated or abandoned.

Owner acceptance of a **sub-constraint** does not require merging a larger experimental branch.

## 2. Product goal and current campaign

Goal: a browser friend-demo that increasingly feels like Jozz's own game.

Current campaign: recover owner-vehicle visual/mechanical readability one attributable interface at a time.

Deferred until visual recovery closes:

- driving feel;
- suspension stability tuning;
- steering feel/rate;
- tire/contact tuning;
- drivetrain redesign;
- unrelated camera/UI polish;
- scan/world work;
- public R1 promotion.

Durable campaign contract: `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

## 3. Accepted `main` product baseline

The reproducible owner-rig baseline remains:

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

V0 canonical Windows execution proved exact Node 24.16.0 / npm 11.13.0, pinned install, typecheck, deterministic generation, 13 focused tests and production build.

V0 also proved that reproducibility/internal consistency does **not** mean visual correctness.

## 4. Current owner-visible truth

### Accepted static evidence outside `main`

On frozen work candidate `393ef460...`, Jozz accepted the selected **FL upper-wishbone static FRONT + TOP placement at current visual precision**.

This is durable owner evidence, recorded in `docs/OWNER_CHECKPOINTS.md`, but the experimental code is intentionally not integrated into `main` during orchestrator handoff preparation.

### Still unresolved

- wheel-side upright/hub/suspension geometry remains buried in the wheel;
- latest wheel-side S1-D view shows wishbone/wheel-side geometry reaching very near the tire;
- damper/spring rig remains wrong and enters/intersects the wheel region;
- cardans still miss correct visible mating, particularly differential side;
- mesh proportion/stretch for the S1-D FL upper arm is visibly imperfect and explicitly deferred unless later rigging requires change;
- final stance likely needs to be slightly higher;
- wheel placement still cannot be globally accepted while surrounding corner geometry is incoherent.

### Dynamic state — deferred

Owner reports strong regression of driving feel, suspension stability and steering/controllability relative to earlier playable experience.

Classification: `OWNER OBSERVED HIGH-SEVERITY DYNAMIC REGRESSION / DEFERRED`.

Do not tune dynamics during current visual recovery.

## 5. Evidence model

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance — later
```

Never promote E1 to E2/E4.

## 6. Recovery dependency model

```text
CHASSIS VISUAL FRAME
-> chassis/corner attachment skeleton
-> corner landing / kinematic body roles
-> wishbone relationships
-> upright / hub / wheel
-> dampers / steering / cardans
-> stance
-> whole-rig integration
-> later dynamics/feel campaign
```

The first FL upper static inboard relationship has now produced a narrow E4 checkpoint, but S1 as a whole is not complete.

## 7. Durable method learned from S1

Use interfaces and constraints, not whole assets, as work units.

For each interface separate:

```text
position X/Y/Z
orientation/frame
asset geometry/scale
live body ownership/articulation
```

Authority may be split per axis/constraint.

Owner views are projection evidence:

```text
FRONT -> primarily Y/Z
TOP   -> primarily X/Z
SIDE  -> primarily X/Y
```

Do not infer world offsets directly from screenshot pixels.

When possible, one iteration changes one independent degree of freedom and preserves already-supported constraints.

## 8. Public state

Public R0 is immutable on `release/r0`.

R1 publication resumes only after meaningful integrated owner-visible progress is worth publishing. Do not rebuild or replace R0 in place.

## 9. Current operational state

- implementation is intentionally frozen for orchestrator handoff;
- no implementer task is active;
- `main` is being used only for governance/current-state stabilization;
- frozen S1 work tip is exact evidence, not automatic merge input;
- S1-D static FL upper placement is owner accepted at current precision;
- live motion, FR, mesh scale and wheel-side integration remain open;
- dynamic recovery remains deferred;
- next operation is controlled orchestrator takeover O1, not product implementation.

See `docs/HANDOFF.md` for the compact takeover checkpoint and negative memory.
