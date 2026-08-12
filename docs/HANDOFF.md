# JV Web — active transaction handoff

Updated: 2026-08-12
Status: **S2-K OWNER ACCEPTED / RIG MATING DEFERRED / R1-DRIVE-01 NEXT**

## Exact boundary

```text
private repo: Jozzpoly/JV-Box3D-Web-experiment
main: 97055331a2eef8bdbf8411db243417591731e664
active branch: work/front-corner-golden-rebuild-r2
committed base before this checkpoint record: 8e79e69aa4912088bab453a0fb9b9b26afe9d6b0
S2-N mechanics/source candidate: a4468042550265d10c2fa4b13b926d9227040d89
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Verify live refs immediately before every write. Native JV remains read-only. Do not touch private `main`, public R0 or Pages without a new explicit transaction decision.

## Accepted front-corner evidence

S2-N + S2-GAME-01 + S2-K establish only:

- #6 is suspension-side/non-steering;
- #8 is separate and steers relative to #6;
- direct in-game inspection with the FL wheel hidden confirmed that relative motion;
- steering motion is around the expected accepted WheelCenter-centered axis/center at current precision;
- wheel spin/orientation remains separate;
- S1 FL-upper remains protected;
- normal Offroad runtime showed no serious new regression at this stage.

Do not infer final steering physics or topology from this.

## Deferred rigging problem

Owner directly observed that the present wishbone/knuckle visual assembly lacks reliable mating references through articulation. As suspension motion changes, visual parts can separate instead of remaining joined at true mechanical interfaces.

This old/core-JV-class problem is deliberately deferred:

```text
classification: OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT
lower wishbone static placement: OPEN / NOT ACCEPTED
quick offset fitting: FORBIDDEN AS A SUBSTITUTE FOR RIGGING
```

The disposable S2-VIS-01 inspection packet was evidence tooling only. Its lower-arm lines/points were hypotheses and must not be promoted into product geometry.

## Rig-sensitive freeze

Until a dedicated owner-rigging/workbench campaign exists, do not opportunistically modify front wishbone↔knuckle endpoints, lower-arm visual mapping, or other interfaces whose correctness depends on those unresolved mating points. If another subsystem exposes the same debt, classify it rather than masking it.

## Next transaction — R1-DRIVE-01

Return to the normal wheel-visible product. Use real driving evidence to decide what currently most limits JV-Web as a believable, shareable car.

Prefer work that survives later rig replacement: runtime stability, input/control behavior, camera/reset/product UX, browser performance, contact/drive/brake issues that can be isolated from unresolved rig geometry, and instrumentation needed to distinguish causes.

Do not tune around the current visual rig. If an observed driving problem depends materially on unresolved suspension/steering hardpoints, mark it `RIG-SENSITIVE / DEFERRED` instead of compensating for it.

## Stop conditions

Stop and replan before:

- reopening an already accepted S2-K fact without contradictory evidence;
- changing rig-sensitive geometry to improve appearance in a few poses;
- copying M5/M6/latest-native whole-rig geometry as authority;
- promoting provisional S2 steering architecture into `main` merely because the current candidate is playable.
