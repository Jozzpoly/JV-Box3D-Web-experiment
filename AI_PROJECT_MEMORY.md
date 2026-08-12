# AI project memory — JV Web

Updated: 2026-08-12
Status: `R1 ACTIVE / S2-K OWNER ACCEPTED / RIG MATING DEFERRED / INTERRUPTION RECOVERED / R1-DRIVE-BRIDGE-01 OWNER GATE NEXT`
Owner: Jozz

Current Git, exact authored source, reproducible execution evidence and direct owner observation outrank documentation and historical M5/M6 rigs.

## Transaction boundary

```text
private main: 97055331a2eef8bdbf8411db243417591731e664
active research branch: work/front-corner-golden-rebuild-r2
pre-recovery docs tip: 9dc319c6f5811d18354923fafec2c14246ee801f
S2 mechanics/source candidate below docs checkpoints: a4468042550265d10c2fa4b13b926d9227040d89
public R0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44 — immutable
native JV: READ ONLY
```

No R1 steering experiment has been committed as product physics. `main` remains unchanged.

## Protected owner evidence

Preserve only:

- S1 FL-upper static + live articulation;
- #6 `Socket_ChassisMount_b` = suspension-side / non-steering source role;
- #8 `Socket_WheelCenter` = distinct steerable source role relative to #6;
- steering center at the accepted source-derived WheelCenter position;
- wheel spin/orientation separate from structural #8 spin;
- S2-GAME-01 broad Offroad checkpoint;
- S2-K direct in-game #6/#8 motion/axis confirmation.

None of this accepts final body topology, rack law, tie rod, rack anchor, caster/KPI/trail, mass split, self-align or handling.

## Deferred rig/workbench debt

Owner confirmed that current wishbone↔knuckle visuals lack trustworthy mating frames through articulation and FL lower placement is still wrong.

Classification: `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`.

Do not hide it with offsets or tune physical steering hardpoints to make this old rig look joined. Future rig/workbench authoring must establish real mating points/frames.

## Interruption recovery audit

The 2026-08-12 connection loss did not leave hidden product physics on GitHub, but work did continue invisibly for a period:

- one accidental docs-only commit `1f354eeb...` (`TEMP`) created a scratch file saying it should not exist;
- `9dc319c6...` removed that scratch file and wrote research notes;
- a local background sweep also continued after UI visibility was lost; it was found and killed;
- no hidden/background process remains;
- recovery did not trust those results: key experiments were rebuilt from the clean mechanics baseline and rerun independently.

Do not resume or cite abandoned sweep directories as authority.

## R1-DRIVE-01 durable discovery

The dominant current driving defect is the mixed front steering mechanism:

```text
FL = centered #6→#8 DOF + one-way rack→angle, no physical tie rod
FR = historical one-knuckle steering + physical rack distance link
```

At comparable rack lock this produced roughly ~14° FL vs ~29–30° FR in both directions and large left/right vehicle asymmetry.

Clean causal interventions established:

- equal kinematic rack→angle on both front wheels nearly removes the asymmetry;
- a coherent symmetric physical front also recovers active left/right symmetry and swaps the larger inner-wheel angle with direction;
- therefore the mixed mechanism is causal; physical bilateral linkage itself is not falsified.

## Physical steering research — corrected state

A clean symmetric physical front revealed important constraints:

- vertical/weakly restoring steering at product `4 substeps` has severe solver-order sensitivity: reversing only FL/FR joint construction order reverses spontaneous straight-line steering (~+33° ↔ -33° yaw); 8/16 substeps reduce the runaway strongly;
- the inherited constant `rackFrictionBase = 40 N` can arrest natural return and is not protected authority; load-dependent tie-rod friction is much less harmful;
- `steeringJointAngle` is not the same thing as actual chassis-relative toe/heading; previous interpretations that conflated them are rejected;
- scrub looked artificially effective when the provisional tie-rod length carried non-zero toe preload; near-neutral actual toe removed that apparent solution;
- with near-neutral actual toe, a positive longitudinal mechanical-trail experiment through the accepted WheelCenter gives physically plausible speed-dependent return and suppresses solver-order runaway. No tested trail value is accepted as final geometry.

The strongest physical candidate is still **not promotable** because its spatial tie-rod/rack geometry produces several degrees of bump-steer through representative suspension travel. Fixing that by tuning rack anchors to the current old suspension hardpoints would violate the deferred rig/workbench boundary.

Box3D.js 0.0.2 exposes no solver-native gear/rack-pinion coordinate joint that directly replaces the spatial tie rod while retaining bilateral back-drive. A future physical solution therefore needs correct rig/rack geometry or a separately designed generalized bilateral coupling.

## Active owner candidate — temporary bridge only

`R1-DRIVE-BRIDGE-01` is a disposable, uncommitted product candidate built from the clean S2 mechanics baseline:

- no new body/carrier/hardpoint/visual offset;
- removes only the historical FR physical tie-rod joint;
- FR receives the same provisional rack→angle command as FL through its existing twist DOFs;
- no contact→rack back-drive or final FR-axis claim;
- normal owner GLB remains byte-identical: 829936 B, SHA-256 `1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc`;
- supplemental full suite after boundary-test cleanup: 326/326 PASS;
- mirrored driving probe at 0.30 throttle: about `-41.34° / +41.44°` final yaw with four contacts; straight drift ~`-0.76°`.

This bridge exists to keep R1 moving while final physical steering remains an explicit research/workbench problem. Do not infer final steering architecture from it.

## Next operation

Run the owner in-game gate for `R1-DRIVE-BRIDGE-01`. Judge whether the car now behaves coherently left vs right. Do not ask the owner to approve final self-align/back-drive or deferred rig geometry.

Only after owner evidence decide whether the temporary bridge is worth committing/integrating as an R1 intermediate. Physical steering remains a separate unresolved lane.
