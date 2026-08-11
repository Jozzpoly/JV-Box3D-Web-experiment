# AI project memory — JV Web

Updated: 2026-08-11
Status: `S1 FL UPPER INTEGRATED / S2 GOLDEN CONTRACT OWNER ACCEPTED / ORCHESTRATOR MIGRATION ACTIVE BEFORE S2-PORT`
Owner: Jozz

This is a router. Current Git, exact authored source, exact working native behavior and direct owner correction outrank documentation and agent confidence.

## Product authority

```text
Jozzpoly/JV-Box3D-Web-experiment main
integrated product checkpoint: 67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

native golden reference for front-corner rebuild:
Jozzpoly/Box3d_FunProject
959aefb78587ce60cf2b8eb03ff82797a4165142
READ ONLY

public R0:
Jozzpoly/JV-Box3D-Web-Public release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

## Protected integrated truth

FL upper static FRONT+TOP relationship and real neutral suspension articulation are OWNER ACCEPTED and integrated.

Preserve the accepted FL-upper mechanism and chassis-side semantics. If the golden front-corner rebuild legitimately changes the physical wheel-side joint location, do not preserve a stale outboard coordinate merely to keep an old hardpoint; re-run focused S1 regression and show any visible change in the new owner gate.

## Owner-accepted golden front-corner contract

The previous one-knuckle Web interpretation is rejected.

```text
#6 Socket_ChassisMount_b
= suspension-side / non-steering member
= follows suspension articulation

#8 Socket_WheelCenter
= separate steerable structural member
= steers relative to #6
= does not wheel-spin

wheel
= follows steering member
= has separate spin DOF
```

The authored `Axis_SuspensionTravel_Top/Bottom` markers establish the correct source registration/steering center and `Socket_WheelCenter` lies exactly on their line and midpoint.

Critical nuance: **steering-axis position/center is protected; final direction is not required to remain perfectly vertical.** A physically justified tilt/caster/KPI-like direction may be used, but it must rotate about/pass through the accepted WheelCenter steering center instead of reintroducing the old displaced ~140 mm kingpin.

## Root cause already established

Working native M6 behavior and the copied Web contract diverged:

- native working visual path: #6 non-steering arm/carrier frame, #8 steering knuckle frame;
- stale contract: both classified as knuckle;
- Web R2/R3 copied the stale collapse;
- generic receipt caster/KPI/kingpin-offset geometry became de facto owner-rig authority;
- R3 then transformed authored source toward those generated hardpoints;
- tests certified self-consistency of the derived Web model rather than parity with the mechanism being copied.

Do not restore this authority inversion.

## Current migration boundary

A controlled **fresh orchestrator migration is active before S2-PORT implementation begins**.

Read current `docs/HANDOFF.md` after this router. That checkpoint temporarily freezes product writes until the fresh orchestrator independently verifies the boundary and returns `HANDOFF ACCEPTED`.

Prepared future implementation branch:

```text
work/front-corner-golden-rebuild-r2
state during migration: RESERVED / NO WRITES
```

`work/front-corner-golden-rebuild-r1` is abandoned pre-handoff cleanup debt and must never be used as source/base/evidence.

The existing `docs/IMPLEMENTER_TASK.md` is the prepared S2-PORT packet to review. Do not launch an implementer from it while the migration freeze is active.

## Next operation

Start a **fresh orchestrator conversation**, not a fresh implementer yet.

The fresh orchestrator should independently resolve current private refs and the golden native ref, then follow the current `AGENTS.md` fresh-orchestrator bootstrap and the active migration checkpoint in `docs/HANDOFF.md`.

Do not preload the old orchestrator chat or previous implementer chat as authority.

If the handoff and prepared S2-PORT packet are coherent, the fresh orchestrator should accept the handoff without creating a takeover-only governance commit, then launch a fresh bounded implementer on the verified reserved `work/front-corner-golden-rebuild-r2` transaction.

## Workflow rule

When a working native mechanism exists, port/copy its demonstrated behavior first. Any Web divergence must be explicit and justified.

Secondary docs/contracts/receipts are evidence, not authority, until revalidated against owner/source/golden behavior.
