# JV Web — accepted project state

Updated: 2026-08-13
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S2-K PROTECTED / R1-DRIVE-BRIDGE-01 OWNER ACCEPTED AS TEMPORARY INTERMEDIATE / FINAL STEERING + RIG OPEN`

## Product / transaction boundary

```text
private product authority: Jozzpoly/JV-Box3D-Web-experiment main
main control: 97055331a2eef8bdbf8411db243417591731e664
active R1 work branch: work/front-corner-golden-rebuild-r2
pre-bridge checkpoint tip: 4ad9de6fd0ff3b6b9193fa2fb17b7f77e0a67785
S2 mechanics/source base beneath bridge: a4468042550265d10c2fa4b13b926d9227040d89
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
native JV: READ ONLY mechanism evidence/research, not whole-rig authority
```

`main` remains unchanged during the current work transaction. The historical word `golden` in the branch name is workflow naming only.

## Owner-accepted evidence

Preserve narrowly:

- S1 FL upper static placement and live articulation;
- #6 `Socket_ChassisMount_b` is suspension-side / non-steering;
- #8 `Socket_WheelCenter` is a distinct steerable source role relative to #6;
- steering center remains at the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin are separate;
- S2-GAME-01 broad Offroad regression checkpoint;
- S2-K direct in-game #6/#8 motion/axis confirmation;
- R1-DRIVE-BRIDGE-01: owner accepts the current symmetric kinematic front only as a **temporary R1 intermediate** because straight driving and left/right steering are materially more coherent.

None of this accepts final steering physics, current rack->angle mapping, self-align/back-drive, final body topology, FR legacy axis/hardpoints, caster/KPI/trail, tie-rod/rack geometry or handling.

## Current temporary bridge

The bridge removes the proven mixed-mechanism defect with the smallest product delta:

- no new body/carrier/hardpoint/visual offset;
- remove the historical FR physical steering distance joint;
- command FR with the same provisional rack->angle mapping used by FL;
- no physical contact->rack feedback claim;
- visual package remains 59 real bindings / 829936 B / SHA-256 `1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc`.

Residual asymmetry and driving imperfections remain open.

## Deferred rig/workbench debt

Owner directly observed:

- FL lower wishbone placement remains wrong;
- current wishbone<->knuckle visuals lack trustworthy mating frames and can separate through articulation.

Classification: `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`.

Do not hide this with offsets. Do not tune future rack/tie-rod hardpoints to the old rig merely to improve visual mating or bump-steer. Future workbench/rig authoring must establish real owner-authored mating points/frames.

## Authority hierarchy after reset

For each mechanism, establish authority separately. There is no whole-rig M5/M6/latest-native golden.

Use, in order appropriate to the specific claim:

1. direct owner-accepted evidence;
2. exact authored source semantics/geometry for what the asset actually authors;
3. reproducible current Web runtime evidence;
4. later native/recovery findings as mechanism-specific evidence or falsifiers;
5. secondary contracts, receipts, calibration reports and tests only after revalidation.

Historical M5/M6 implementations, numeric caster/KPI/kingpin values and old Web calibration are not automatically transferable.

## Physical steering research status

Reproduced research establishes useful constraints, not configuration truth:

- the former mixed FL/FR steering mechanisms caused the dominant left/right asymmetry;
- a coherent bilateral physical front can recover active symmetry, so physical linkage itself is not falsified;
- weakly restoring bilateral constraints at product 4 substeps showed severe solver construction-order sensitivity;
- inherited constant 40 N rack stiction was harmful in that experimental graph;
- steering-joint angle is not chassis-relative toe;
- apparent scrub centering was confounded by toe preload and is rejected as a solution;
- positive longitudinal mechanical trail through WheelCenter produced plausible speed-dependent restoring behavior in a near-neutral-toe provisional experiment;
- the spatial physical tie-rod still produced several degrees of bump-steer because rack/suspension hardpoints remain provisional.

No tested trail, caster, KPI, scrub, tie-rod length or rack anchor is accepted.

## Current limiting problem

With the temporary bridge, broad straight/turn/brake probes no longer expose a larger catastrophic drive/contact defect than steering feedback. The clearest intentional limitation is that RATE `RELEASE` stops rack input but does not physically back-drive/self-align the rack.

The next bounded question is whether the pinned Web/Box3D boundary can provide an energy-consistent bilateral rack-translation <-> steering-coordinate coupling without guessed spatial mating points or hidden centering. If not, classify final physical steering as rig-authoring blocked rather than inventing another compensating mechanism.

See `docs/HANDOFF.md` and `docs/IMPLEMENTER_TASK.md` for the active transaction.
