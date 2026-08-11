# JV Web — orchestrator migration checkpoint

Updated: 2026-08-11
Status: **MIGRATION ACTIVE / PRODUCT WRITES FROZEN UNTIL FRESH ORCHESTRATOR ACCEPTS HANDOFF**

This is a deliberate semantic handoff at a clean boundary **before S2-PORT implementation begins**.

The previous orchestrator remains responsible only for preparing this checkpoint and supplemental transfer package. It must not continue product implementation after this boundary.

## Exact boundary to verify independently

Private repository:

```text
Jozzpoly/JV-Box3D-Web-experiment
```

At handoff completion the orchestrator must provide the exact final CONTROL TIP in the opening message. The intended state is:

```text
main == work/front-corner-golden-rebuild-r2
```

The fresh orchestrator must independently resolve both live refs before accepting this handoff. Do not trust a copied SHA merely because it appears in a prompt or transfer ZIP.

Golden native reference for the front-corner recovery lane:

```text
Jozzpoly/Box3d_FunProject
959aefb78587ce60cf2b8eb03ff82797a4165142
mode: READ ONLY
```

## Current product / transaction meaning

Accepted integrated product checkpoint carrying S1:

```text
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Everything after that checkpoint on current `main` is governance/documentation progression only; no S2-PORT product implementation has started.

Prepared future write transaction:

```text
work/front-corner-golden-rebuild-r2
purpose: S2-PORT fresh FL golden front-corner rebuild
state during migration: RESERVED / NO WRITES
```

`work/front-corner-golden-rebuild-r1` is abandoned pre-handoff cleanup debt and is never a source/base/evidence branch.

The current `docs/IMPLEMENTER_TASK.md` is a **prepared task packet for review**, not permission to launch an implementer while this migration checkpoint is active. This HANDOFF freeze temporarily suspends execution of that task until the fresh orchestrator returns `HANDOFF ACCEPTED` and explicitly starts the transaction.

Do not rewrite the task merely to toggle its status unless the fresh orchestrator finds a substantive defect.

## Semantic truth that must survive migration

### Protected S1

FL upper static FRONT+TOP relationship and real neutral suspension articulation are OWNER ACCEPTED and integrated.

Preserve the accepted chassis-side semantics and `PART_PAIR_ROLL_PINNED_STRETCH` mechanism. If the correct golden wheel-side rebuild proves that the old physical outboard endpoint came from rejected topology, the endpoint may be re-derived, but focused S1 regression and renewed owner-visible evidence are then required.

### S2 falsifier / authority reset

The previous one-knuckle interpretation is rejected.

Owner/source/golden contract:

```text
#6 Socket_ChassisMount_b
= suspension-side / non-steering structural member
= follows suspension articulation
= must not inherit steering rotation

#8 Socket_WheelCenter
= separate steerable structural member
= steers relative to #6
= must not wheel-spin

wheel
= follows #8 for steering
= has an independent wheel-spin DOF

#7 Socket_SteeringRod outboard
= follows the steerable member
```

Root cause already established: Web repeatedly reconstructed the rig from stale copied contracts, factory receipts, generated hardpoints and calibration layers instead of first preserving exact authored/source + working native behavior. Green tests then certified self-consistency of that derived model.

Do not restore this authority inversion.

### Steering-axis owner verdict

Exact authored source contains:

```text
Axis_SuspensionTravel_Top
Axis_SuspensionTravel_Bottom
Socket_WheelCenter
```

`Socket_WheelCenter` lies on the authored marker line and at its midpoint.

Owner accepted the **steering center / axis position** as the protected result. The old approximately 140 mm displaced kingpin is rejected.

Final runtime axis direction remains an engineering DOF: a modest technically justified caster/KPI-like tilt is allowed, but it must be introduced **about / through the accepted steering center**, not by translating the whole axis away from it.

## Fresh orchestrator bootstrap

Follow current `AGENTS.md` role-aware bootstrap.

Minimum migration read set:

1. current `AGENTS.md`;
2. current `AI_PROJECT_MEMORY.md`;
3. this `docs/HANDOFF.md`;
4. current `docs/PROJECT_STATE.md`;
5. current `docs/OWNER_CHECKPOINTS.md`;
6. current `docs/IMPLEMENTER_TASK.md`;
7. `docs/BRANCH_ROLES.md` only to confirm current branch lifecycle / abandoned `r1` / reserved `r2`.

Do not preload old chats, old handoff stacks, archived branches, historical campaign narratives or the previous implementer conversation as technical authority.

A supplemental transfer ZIP may be attached. It is owner/context evidence and a migration aid, **not source authority**. Current Git + exact source + direct owner checkpoints outrank it.

## Required takeover verification

Before any product write, the fresh orchestrator must independently verify:

- current `main` tip/tree;
- current `work/front-corner-golden-rebuild-r2` tip/tree;
- that no S2-PORT implementation commit exists yet;
- integrated S1 checkpoint and protected meaning;
- S2 one-knuckle falsifier and authority inversion;
- owner-accepted #6/#8/wheel DOF split;
- fixed steering center vs open axis direction;
- golden native ref exists and remains read only;
- `r1` is abandoned/non-authoritative;
- current S2-PORT packet is technically coherent and does not silently reintroduce rejected authority.

Do not create governance commits merely to document a successful takeover.

If the packet is coherent, return:

```text
HANDOFF ACCEPTED
```

and then launch the fresh implementer transaction from the verified reserved `r2` branch.

If a substantive contradiction exists, return:

```text
HANDOFF NEEDS CORRECTION
```

with exact evidence before any product write.

## Negative memory / operational warning

Recent orchestration produced excessive docs-only Git churn and several pre-handoff API mistakes. Product bytes remained intact, but this is a process failure mode to eliminate.

For the next stage:

- prefer complete prepared diffs over incremental governance edits;
- never use `main` or a future work branch for diagnostic/no-op API probes;
- the next meaningful Git progress should primarily be real S2-PORT product/evidence, not another long governance sequence;
- candidate runtime shown to the owner must be actual JV-Web/browser candidate behavior, not only a disposable diagnostic prototype.

Conversation continuity is expendable. Exact Git/source/evidence continuity is not.
