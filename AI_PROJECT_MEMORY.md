# AI project memory — JV Web

Updated: 2026-08-12
Status: `R1 ACTIVE / S2-K IN-GAME KNUCKLE CHECKPOINT OWNER ACCEPTED / RIG MATING DEFERRED / R1-DRIVE-01 NEXT`
Owner: Jozz

This is a short router. Current Git, exact authored source, reproducible execution evidence and direct owner observation outrank documentation or historical rig implementations.

## Product / transaction boundary

```text
accepted private product authority:
Jozzpoly/JV-Box3D-Web-experiment main
97055331a2eef8bdbf8411db243417591731e664

active FL research/product branch:
work/front-corner-golden-rebuild-r2
committed base before this checkpoint record:
8e79e69aa4912088bab453a0fb9b9b26afe9d6b0
S2-N mechanics/source candidate:
a4468042550265d10c2fa4b13b926d9227040d89

public R0:
Jozzpoly/JV-Box3D-Web-Public release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
immutable during this lane
```

`main` still carries accepted S1 FL-upper static/live behavior. S2 work remains isolated from `main`.

## Protected owner evidence

Preserve only what was actually accepted:

- S1 FL-upper static placement and live articulation;
- #6 `Socket_ChassisMount_b` is the suspension-side / non-steering source role;
- #8 `Socket_WheelCenter` is a distinct steerable source role relative to #6;
- steering remains centered around the accepted source-derived WheelCenter position;
- wheel orientation/spin is independent of structural #8 spin;
- S2-GAME-01 broad Offroad regression checkpoint is accepted;
- S2-K direct in-game inspection confirmed that #6 stays with suspension while #8 steers separately around the expected axis/center.

None of this accepts the current carrier/body topology, rack-to-angle law, tie-rod choice, mass split, bump-steer target, final caster/KPI direction, steering feedback architecture or handling.

## Deferred rig / mating problem

Owner-observed and explicitly **not to be patched with offsets**:

- FL lower wishbone static placement is still wrong;
- the current visual wishbone↔knuckle assembly does not have trustworthy mating/joint references that remain visually joined through suspension articulation;
- under motion the assembly can visibly separate, a problem already known from core JV;
- disposable S2-VIS lower-arm candidates were diagnostic hypotheses only and are not accepted geometry.

Classification: `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT / NOT AN S2-K REGRESSION`.

Do not spend further time fitting current arms/knuckle through ad-hoc offsets. A future dedicated rig/workbench campaign should establish explicit owner-authored mating points/frames and validate them through motion.

## Rig-sensitive freeze

Until that campaign, avoid changes whose validity depends on the unresolved front rig mating geometry: wishbone↔knuckle visual endpoints, opportunistic lower-arm remapping, damper/cardan endpoint polish tied to those points, or steering geometry justified by the current visual fit.

## Authority reset remains active

M5/M6 and later native rigs are experimental history/research evidence, not whole-rig authority. Use only mechanism-specific durable findings and falsifiers. Numeric/cross-asset coincidences remain hypotheses until independently validated.

## Next operation

Read `docs/HANDOFF.md`, then execute `docs/IMPLEMENTER_TASK.md`: `R1-DRIVE-01` moves back to the normal wheel-visible Offroad product and uses real driving evidence to identify the next high-value, rig-independent improvement. Do not reopen S2-K or solve deferred rig mating indirectly.
