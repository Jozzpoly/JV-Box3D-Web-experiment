# JV Web — current handoff

Updated: 2026-08-10
Purpose: rolling continuation note. Replace stale content instead of appending history.

## Authority

```text
Private repo: Jozzpoly/JV-Box3D-Web-experiment
Active authority: main
(resolve live tip before every write)

Public repo: Jozzpoly/JV-Box3D-Web-Public
Frozen Pages branch: release/r0

Native reference: Jozzpoly/Box3d_FunProject
read-only for this campaign
```

Current owner-rig artifact remains reproducible:

```text
id: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

## V0 — current owner-visible truth

Canonical Windows validation passed exact Node/npm, dependency install, typecheck, deterministic generation, 13 focused tests and Vite production build. This proves reproducibility/internal consistency, not visual correctness.

Fresh OWNER OBSERVED state:

- chassis/body roughly acceptable;
- suspension/wishbones too far from the frame;
- damper/spring rigging wrong and substantial geometry enters wheels;
- cardans reach the hub region but do not visually mate at the correct differential location;
- upright/hub/suspension package is buried in wheels, so wheel placement is not yet judgeable with confidence;
- eventual stance should be slightly higher;
- driving feel, suspension stability and steering feel are strongly regressed but deliberately deferred;
- scan unexpectedly loads successfully, but scan work remains outside the active car lane.

Earlier R4 observations are HISTORICAL OWNER OBSERVED, not current visual authority.

## Recovery preparation — complete

The durable visual-recovery execution contract is `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

Work is interface-first/root-to-leaf and uses evidence layers E0-E5. A major V0 lesson is that local consistency E1 may be green while cross-asset geometry E2 and owner acceptance E4 fail.

Measurement-only T0 is available:

```text
npm run inspect:owner-rig-interfaces
```

Representative V0 deltas include front upper hinge authored->current ~0.216 m and front lower hinge ~0.155 m. These are evidence, not accepted thresholds.

Selective native prior art exists for corner landing, chassis/lower-arm/knuckle visual roles, live wishbone endpoint drawing, rack-center steering rod placement and diagnostics. Native remains read-only evidence, not automatic authority.

## Execution mode — orchestrator / implementer split

Jozz explicitly separated orchestration from implementation to control context overload.

Stable protocol:

`docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md`

Single active implementation contract:

`docs/IMPLEMENTER_TASK.md`

Roles:

```text
orchestrator -> current truth, dependency order, task packet, review, owner question, integration
implementer  -> one bounded technical task on one work branch, broad freedom inside declared scope
Jozz         -> product intent and final focused visual/feel acceptance
```

Important context firewall: a bounded implementer does not perform a cold takeover and does not preload this handoff/project history. It reads `AGENTS.md`, `IMPLEMENTER_TASK.md`, the execution protocol and only the task-required source.

During an active implementer work branch, `main` is frozen for ordinary writes. This preserves clean ancestry for review/integration.

## Active task prepared — S1-A

Task: **front chassis-to-wishbone attachment authority**.

Purpose: discriminate why the front wishbone package sits too far from rendered chassis and, only if justified, make the smallest visual/calibration correction for one chassis-side attachment relationship.

Protected during S1-A: physical suspension runtime/hardpoints, wheel mount contract, upright/knuckle pivot, dampers, steering rods, cardans, stance, handling, camera/UI/world/scan, native JV and public R0.

If evidence says the physical hardpoint itself must change, the implementer stops and returns the evidence; it does not rewrite physics in this slice.

The orchestrator will create/use one bounded branch:

```text
work/owner-rig-s1-attachment-authority
```

No product correction is accepted merely by opening this task. The implementer must return an exact candidate/evidence report for independent orchestrator review before Jozz is asked to validate anything.

## Next control step

Provide the new implementer conversation with the compact orchestrator handoff containing the exact work-branch starting SHA and direct instruction to execute `docs/IMPLEMENTER_TASK.md` without reconstructing project history.

The orchestrator then waits for the implementer return report/diff. Do not independently implement S1 in the orchestrator conversation while that slice is active.
