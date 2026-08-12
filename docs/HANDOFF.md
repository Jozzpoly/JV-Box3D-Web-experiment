# JV Web — active transaction handoff

Updated: 2026-08-12
Status: **S2-N OWNER ACCEPTED / WORK BRANCH ACTIVE / IN-GAME VALIDATION NEXT**

## Exact boundary

```text
private repo: Jozzpoly/JV-Box3D-Web-experiment
main: 97055331a2eef8bdbf8411db243417591731e664
active branch: work/front-corner-golden-rebuild-r2
S2-N accepted candidate parent: a4468042550265d10c2fa4b13b926d9227040d89
candidate tree: 0eb726975c84b5df4783178fa4bb72907435f416
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Verify live refs immediately before every write. No writes to native JV, private `main`, public R0 or Pages during S2-GAME-01.

## Accepted vs provisional

S2-N owner acceptance is deliberately narrow. Preserve only:

- source #6 suspension-side / non-steering role;
- source #8 distinct relative-steering role;
- steering center at source-derived WheelCenter;
- wheel orientation/spin independent of #8 structural wheel-spin;
- accepted S1 FL-upper behavior.

The current carrier body, body topology, 50/50 mass split, rack-to-angle law, rack anchor and absence/presence of a physical tie rod are **candidate implementation hypotheses**, not project truth.

M5/M6/latest-native rigs are not whole-architecture authority. Use them only as mechanism-specific evidence/falsifiers where independently relevant.

## Open defect that must remain open

Owner observed on 2026-08-12 that the FL lower wishbone is still positioned incorrectly.

```text
classification: OWNER OBSERVED / OPEN / NOT ACCEPTED
```

Do not silently close it through S2-N. Do not broaden into a lower-arm rebuild before in-game validation unless the defect prevents a meaningful runtime gate.

## Next transaction — S2-GAME-01

Goal: move the exact S2-N candidate into **real JV-Web browser/in-game validation** with the smallest possible change surface.

Preferred order:

1. preserve S2-N product bytes/mechanics;
2. produce an exact runnable Windows/browser packet from the active candidate;
3. automated preflight: focused S2 + existing product/portable checks available in the execution lane;
4. owner playtest in actual Offroad/game runtime;
5. classify observations separately: hard failure, geometry defect, steering-physics hypothesis, general handling/feel;
6. only then choose the next engineering slice.

The first in-game gate is discovery/regression evidence, not final steering or lower-arm acceptance.

## Stop conditions

Stop before broadening if:

- S2-N accepted source/DOF facts regress;
- S1 upper regresses;
- the lower-arm defect makes runtime mechanically unusable rather than merely visibly wrong;
- the smallest next fix requires changing multiple independent vehicle subsystems;
- public R0/Pages would need to be modified just to obtain the first in-game evidence.
