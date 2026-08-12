# AI project memory — JV Web

Updated: 2026-08-12
Status: `R1 ACTIVE / S2-N NARROW FL CHECKPOINT OWNER ACCEPTED / IN-GAME VALIDATION NEXT`
Owner: Jozz

This is a short router. Current Git, exact authored source, exact execution evidence and direct owner observation outrank documentation or historical rig implementations.

## Product / transaction boundary

```text
accepted private product authority:
Jozzpoly/JV-Box3D-Web-experiment main
97055331a2eef8bdbf8411db243417591731e664

active FL candidate transaction:
work/front-corner-golden-rebuild-r2
S2-N accepted candidate parent:
a4468042550265d10c2fa4b13b926d9227040d89

authoritative public R0:
Jozzpoly/JV-Box3D-Web-Public release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
immutable during this transaction
```

`main` still carries accepted S1 FL-upper static/live behavior. S2-N is owner-accepted only at the narrower work-branch checkpoint and has not been promoted to `main`.

## S2-N protected meaning

Owner accepted only:

- #6 `Socket_ChassisMount_b` = suspension-side / non-steering source role;
- #8 `Socket_WheelCenter` = distinct steerable structural source role relative to #6;
- steering center passes through the source-derived WheelCenter position;
- wheel has independent orientation/spin relative to #8;
- S1 FL-upper remains protected.

Do **not** infer acceptance of current bodies/frames, `suspensionCarrierId`, current rack-to-angle law, tie-rod choice, rack anchor, bump-steer target, mass/inertia split, final caster/KPI/axis direction, back-drive, steering feel or handling.

## Open owner-observed defect

FL lower wishbone placement is still visibly wrong. Treat it as `OPEN / NOT ACCEPTED`, but do not let it reopen accepted S2-N facts or block the immediate in-game validation step unless runtime proves it is a safety/stability blocker.

## Authority reset that remains active

M5/M6 and later native rigs are experimental history/research evidence, not golden architecture. Use individual durable findings and falsifiers only. Authored asset roles/geometry, owner intent and later validated evidence outrank whole-rig copying.

Working abstractions such as suspension frame / steering frame / wheel frame, carrier bodies or physical tie rods remain hypotheses until evidence establishes their value.

## Next operation

Read `docs/HANDOFF.md`, then execute current `docs/IMPLEMENTER_TASK.md`: prepare and run the exact candidate through a real JV-Web browser/in-game owner gate with minimal product changes. Do not redesign steering physics before that playtest.
