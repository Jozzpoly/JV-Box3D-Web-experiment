# JV Web — implementer task

Updated: 2026-08-12
Status: **ACTIVE**
Task: **S2-GAME-01 — exact S2-N candidate into real browser/in-game owner validation**
Mode: **PRODUCT RUNTIME GATE / NO STEERING-PHYSICS REDESIGN BEFORE PLAYTEST**

## Authority and write scope

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
write branch: work/front-corner-golden-rebuild-r2
control main: 97055331a2eef8bdbf8411db243417591731e664
S2-N accepted candidate parent: a4468042550265d10c2fa4b13b926d9227040d89
public R0: immutable
native JV: read only
```

Before any write, independently resolve `main` and the work-branch tip. All writes remain fast-forward descendants of the verified work tip. Do not create another branch.

## One objective

Get the actual S2-N JV-Web candidate into a real owner-playable browser/in-game session with minimal product disturbance, so subsequent engineering is selected from runtime evidence rather than another architecture assumption.

## Protected S2-N facts

Preserve:

- source #6 suspension-side / non-steering role;
- source #8 distinct steering motion relative to #6;
- source-derived WheelCenter steering center;
- independent wheel orientation/spin relative to #8;
- accepted S1 FL-upper behavior.

These facts do not prescribe the future physics topology.

## Explicitly provisional / not owner accepted

Do not encode as new requirements:

- `suspensionCarrierId` or current body count/naming;
- 50/50 carrier/knuckle mass or inertia split;
- current rack-to-angle law;
- physical/non-physical tie rod choice or rack-side anchor;
- zero bump-steer;
- final caster/KPI/axis direction;
- steering back-drive, self-aligning behavior, steering feel or handling.

## Known open defect

FL lower wishbone placement is owner-observed wrong and remains `OPEN / NOT ACCEPTED`.

Do not fix it opportunistically before the first in-game gate unless it prevents a meaningful playtest. During owner validation, keep it visible as known debt rather than asking the owner to re-approve it.

## Implementation preference

Prefer **no physics changes** in S2-GAME-01. Reuse the existing product runtime, Offroad location, vehicle controls, camera and portable/public-preview tooling. A small launcher/evidence helper outside product code is preferred over adding a special S2 viewer or permanent debug architecture.

Public Pages currently serves immutable `release/r0`; do not repoint Pages merely for this gate. A disposable local Windows/browser package is acceptable and preferred for the first playtest.

## Automated preflight

Before asking the owner to play:

1. exact source/candidate identity;
2. focused S2 source/DOF test;
3. full available regression suite;
4. generated owner GLB identity;
5. portable/public-preview static/path/privacy checks where the execution environment permits them;
6. launcher/package integrity and explicit toolchain classification.

A Linux/platform-tool failure is not a product failure. If final bundling can only be executed on the owner's Windows machine, package the exact Windows dependencies already supplied and make the owner action one-click; do not ask for manual build commands.

## Owner playtest question

Do **not** ask whether final steering physics is correct.

Ask for actual in-game observations:

- does the vehicle launch and remain mechanically stable enough to drive;
- does steering visibly/runtime behave without new catastrophic regressions;
- does suspension motion expose any new source/DOF breakage;
- does the known lower-arm misplacement merely remain visible or cause runtime interference/instability;
- what behavior now most strongly limits the sense of a real JV car.

Classify feedback before modifying code.

## Return states

`OWNER_PLAYTEST_READY` — exact runnable package is prepared; automated preflight is coherent.

`REPLAN` — current candidate cannot provide meaningful in-game evidence without a substantive product change.

`BLOCKED` — exact runtime bytes/dependency required for the playtest are unavailable; request only the missing artifact.
