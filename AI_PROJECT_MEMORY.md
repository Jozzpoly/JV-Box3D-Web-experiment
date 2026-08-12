# AI project memory — JV Web

Updated: 2026-08-12
Status: `R1 ACTIVE / S2-K OWNER ACCEPTED / RIG MATING DEFERRED / R1-DRIVE-01 DISCOVERY COMPLETE / R1-STEER-01 ACTIVE`
Owner: Jozz

This is a short router. Current Git, exact authored source, reproducible execution evidence and direct owner observation outrank documentation or historical rig implementations.

## Product / transaction boundary

```text
accepted private product authority:
Jozzpoly/JV-Box3D-Web-experiment main
97055331a2eef8bdbf8411db243417591731e664

active research/product branch:
work/front-corner-golden-rebuild-r2
R1-DRIVE-01 discovery parent:
af71a419dcaab0037a6e4278f42e4449d15c0a31
S2 mechanics/source candidate beneath docs-only checkpoints:
a4468042550265d10c2fa4b13b926d9227040d89

public R0:
Jozzpoly/JV-Box3D-Web-Public release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
immutable during this lane
```

`main` still carries accepted S1 FL-upper static/live behavior. Current S2/R1 steering research remains isolated from `main`.

## Protected owner evidence

Preserve only what was actually accepted:

- S1 FL-upper static placement and live articulation;
- #6 `Socket_ChassisMount_b` is suspension-side / non-steering;
- #8 `Socket_WheelCenter` is a separate steerable source role relative to #6;
- steering center remains at the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin are separate from structural #8 spin;
- S2-GAME-01 broad Offroad regression checkpoint is accepted;
- S2-K direct in-game inspection confirmed #6/#8 relative motion around the expected center/axis.

None of this accepts current carrier/body topology, rack-to-angle law, tie-rod geometry, mass split, final caster/KPI direction, steering feedback architecture or handling.

## Deferred rig / mating debt

Owner explicitly deferred the current wishbone↔knuckle visual mating problem. FL lower placement is still wrong and the current arm/knuckle visuals can separate through articulation because trustworthy owner-authored mating frames do not yet exist.

Classification: `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`.

Do not mask it with offsets. Future rig/workbench work should establish explicit owner-authored mating points/frames through suspension + steering motion. This debt does not forbid steering/contact research that does not claim the current visual mating as authority.

## R1-DRIVE-01 technical discovery

Real/headless driving falsified the previous selection rule that the next problem should be chosen for being `rig-independent`. The dominant R1 driving defect is fundamental steering incoherence and must not be bypassed for an easier product tweak.

Current S2 product candidate mixes two mechanisms on the same axle:

- FL: centered #6→#8 steering DOF with one-way rack→angle law and no physical tie rod;
- FR: historical one-knuckle steering with a physical rack distance link.

Measured at approximately equal rack lock, FL steers about 14° while FR steers about 29–30° in **both** command directions. The larger angle therefore stays on FR instead of swapping to the inner wheel. This produces large left/right driving asymmetry.

Disposable causal interventions, not product candidates:

1. equal kinematic rack→angle on both front corners nearly eliminates left/right driving asymmetry, proving the mixed mechanism is causal, but removes genuine contact→rack back-drive;
2. merely adding a physical FL link while leaving mixed steering axes/topologies does not solve the problem;
3. ad-hoc explicit generalized-force / mapped-reaction couplings were either too soft, unstable or lost useful feedback and are rejected as current directions;
4. symmetric centered steering DOFs on both sides + solver-native bilateral distance links to one rack produce strong active symmetry and correct inner/outer angle swapping, so physical linkage itself is **not falsified**.

The symmetric physical experiment used source-derived #7 wheel-side geometry, but its rack-side anchor and mirrored FR carrier/revolute are explicit engineering hypotheses, not authority.

## Hands-off instability localization

The promising symmetric physical experiment still self-steers during straight hands-off running.

Causal findings:

- divergence persists after drive torque is removed and the car coasts from ~1.9 m/s, so drive torque is not required;
- divergence also persists with front suspension travel experimentally removed at approximately the settled ride length, so bump-steer from suspension travel is not required, although it may still contribute in the live suspension;
- steering-axis direction has a strong signed effect while the accepted WheelCenter center is unchanged;
- a small tilt producing positive mechanical trail improves straight stability; the equal opposite tilt worsens it;
- increasing positive trail gives a monotonic stability improvement in sensitivity probes, but no tested value is promoted to configuration truth;
- ±22% rack-side width sensitivity changes the result only moderately relative to the steering-axis/trail effect. Rack geometry remains open but is not currently the strongest causal lever.

The current legacy rolling contact is a spherical rolling shape. With a vertical steering axis through wheel center it has essentially no geometric mechanical trail at level-ground contact; the observed signed trail response is therefore physically meaningful evidence, not a reason to copy historical M6 caster values.

## R1-STEER-01 active question

Find a coherent front steering/contact mechanism that can satisfy all of:

1. same causal mechanism on FL and FR;
2. accepted WheelCenter steering center preserved;
3. left/right active-driving symmetry and inner/outer angle swap;
4. solver-native bidirectional `contact → wheel/knuckle → linkage/rack` feedback;
5. straight/hands-off stability without a hidden centering spring or servo-to-zero;
6. steering-axis direction justified by contact mechanics around the accepted center rather than copied M5/M6 numbers;
7. no dependency on fake wishbone↔knuckle visual offsets;
8. rack-side geometry remains explicitly provisional until authored/validated.

Do not commit any disposable R1-DRIVE/R1-STEER physics experiment to the product branch until it passes the relevant causal gates. Native recovery remains read-only and is evidence/falsifier material, not a golden rig.

## Next operation

Read `docs/HANDOFF.md`, then execute `docs/IMPLEMENTER_TASK.md`: continue `R1-STEER-01` by characterizing contact/steering-axis stability and only then build an owner-playable coherent-front candidate. Do not tune unrelated drive/brake/UX around the known mixed-steering defect.
