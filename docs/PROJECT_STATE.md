# JV Web — accepted project state

Updated: 2026-08-11
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / GOLDEN FL FRONT-CORNER CONTRACT OWNER ACCEPTED / REBUILD NEXT`

## Product boundary

```text
private product authority: Jozzpoly/JV-Box3D-Web-experiment main
integrated S1 product checkpoint: 67d66ed412342fee5445b2901d85a663a084bf4e
product tree: f2e1836800719cc9cc7007631568c41e45471450
native golden reference: Jozzpoly/Box3d_FunProject @ 959aefb78587ce60cf2b8eb03ff82797a4165142 — READ ONLY
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

S1 FL upper static placement and real neutral live articulation remain OWNER ACCEPTED and integrated.

## Golden front-corner state

The parity investigation established a causal authority inversion: current Web R2/R3 copied stale role semantics and generic M6 hardpoint geometry instead of directly preserving the working native/source front-corner mechanism.

Owner has now accepted the recovered golden contract strongly enough to begin a fresh production rebuild:

```text
#6 Socket_ChassisMount_b
suspension-side / non-steering
follows wishbone/suspension articulation

#8 Socket_WheelCenter
separate steerable structural member
steers relative to #6
no wheel spin

wheel
follows #8 for steering
separate spin DOF
```

The exact authored source provides `Axis_SuspensionTravel_Top` and `Axis_SuspensionTravel_Bottom`; `Socket_WheelCenter` lies exactly on their line and midpoint.

### Steering-axis owner boundary

The critical accepted result is **axis position / steering center**, not mandatory perfect verticality.

Future implementation must keep the steering axis passing through the accepted source-derived WheelCenter steering center. A modest physically justified tilt/caster/KPI-like direction is allowed if it improves correct wheel behavior, provided the tilt occurs about that accepted center and does not reintroduce the rejected lateral/longitudinal kingpin offset.

The old generic generated axis that missed WheelCenter by roughly 139 mm is rejected as owner-rig authority.

## Root-cause chain to avoid

Do not repeat:

```text
stale JSON role contract
+ generic factory receipt caster/KPI/kingpinOffset
-> Web-generated hardpoints
-> R2 #6/#8 single-knuckle binding
-> R3 affine/shear toward generated hardpoints
-> tests proving self-consistency of the same derived model
```

The factory receipt may remain valid for generic native physics state, but it is not automatically visual/source-rig geometry authority.

## Fresh-context decision

The previous implementer conversation has accumulated long historical context, including the now-rejected authority hierarchy. It is intentionally retired for the next production transaction.

A fresh implementer conversation should bootstrap from current Git only and must not import the previous chat as technical authority.

Required initial reads:

1. current `AGENTS.md`;
2. current `AI_PROJECT_MEMORY.md`;
3. current `docs/OWNER_CHECKPOINTS.md`;
4. current `docs/IMPLEMENTER_TASK.md`.

Then inspect exact authored source, golden native files and current Web code as demanded by the task.

## Next product direction

The next transaction is **FL-only golden front-corner rebuild**.

Do not mirror FR yet. Do not proceed to general FL-lower polish, upright/hub packaging, dampers, cardans, stance or handling until the front-left runtime demonstrates:

- #6 suspension articulation without steering inheritance;
- #8 steering relative to #6;
- steering about the accepted center/position;
- separate wheel spin;
- preserved/appropriately revalidated S1 upper behavior.

The rebuild may change visual bindings, source-derived contracts, front steering hardpoint/axis logic and the minimum necessary physics/reference surface if evidence requires it. It should not add extra physics bodies merely to imitate the visual split if the working native mechanism can express the required DOFs with existing bodies/frames.

## Owner gate requirement

No promotion to `main` until Jozz visually validates the rebuilt FL front corner in real runtime. Use isolated, uncluttered views and make suspension motion, steering motion and wheel spin separately attributable.

Handling/stability/steering feel remain a later campaign.
