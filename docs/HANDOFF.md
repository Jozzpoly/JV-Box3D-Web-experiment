# JV Web — active transaction handoff

Updated: 2026-08-12
Status: **S2-K OWNER ACCEPTED / RIG MATING DEFERRED / R1-DRIVE-01 DISCOVERY COMPLETE / R1-STEER-01 ACTIVE**

## Exact boundary

```text
private repo: Jozzpoly/JV-Box3D-Web-experiment
main: 97055331a2eef8bdbf8411db243417591731e664
active branch: work/front-corner-golden-rebuild-r2
R1-DRIVE-01 discovery parent: af71a419dcaab0037a6e4278f42e4449d15c0a31
S2 mechanics/source candidate beneath docs-only checkpoints: a4468042550265d10c2fa4b13b926d9227040d89
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Resolve live refs immediately before every write. Native JV remains read-only. Do not touch private `main`, public R0 or Pages without a later transaction decision.

## Accepted front-corner evidence

S1 + S2-N + S2-GAME-01 + S2-K establish only:

- accepted FL upper static/live behavior;
- #6 suspension-side/non-steering role;
- #8 distinct steering role relative to #6;
- direct in-game confirmation of #6/#8 relative motion;
- steering centered at the accepted source-derived WheelCenter position;
- independent wheel spin/orientation relationship.

Do not infer final steering topology or final physics from these checkpoints.

## Deferred rigging problem

Wishbone↔knuckle visual mating remains `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`. The current visuals can separate during articulation and FL lower placement is not accepted. Do not patch this with offsets or infer physics hardpoints from a visually convenient pose.

## R1-DRIVE-01 result — dominant driving problem located

The current work candidate is not a coherent front steering system:

```text
FL = centered steering DOF + one-way rack→angle / no physical tie rod
FR = historical one-knuckle steering + physical rack distance link
```

At approximately equal rack lock, FL produces ~14° while FR produces ~29–30° in both steering directions. The high-angle wheel therefore does not swap sides with turn direction. This creates a large left/right speed/yaw asymmetry in the real vehicle simulation.

A disposable equal-angle front intervention nearly removed the asymmetry, proving the mixed mechanism is causal, but also removed physical feedback and is not a candidate architecture.

A stronger disposable experiment gave both front corners the same WheelCenter-centered steering DOF and solver-native physical distance links to the same rack. It produced near-mirrored left/right driving and Ackermann-like inner/outer angle swapping. This means bilateral physical linkage remains a viable research direction when both corners share a coherent steering basis.

Its rack-side anchors and mirrored FR topology were experimental hypotheses only.

## Remaining blocker — hands-off contact/steering stability

The symmetric physical experiment still diverges during straight hands-off running.

Current causal evidence:

- divergence continues during coast after drive torque is removed;
- it also remains when front suspension travel is experimentally removed near settled ride height;
- therefore neither drive torque nor live suspension travel is required to trigger it;
- steering-axis tilt around the same accepted WheelCenter has a strong **signed** effect: positive mechanical trail stabilizes, opposite trail destabilizes;
- a larger positive-trail sensitivity sweep improves stability monotonically but does not establish a final caster/trail value;
- rack-side width variation has a smaller but real effect and remains an open engineering parameter.

Do not solve this by a centering spring, servo-to-zero, excessive stiction or copying historical M5/M6 caster/KPI values.

## Active transaction — R1-STEER-01

Goal: establish whether a coherent front steering/contact mechanism can provide both active steering symmetry and physically credible hands-off behavior before any product physics promotion.

Research gates:

1. FL/FR use one coherent causal mechanism;
2. steering center remains at accepted WheelCenter;
3. mirrored steering input gives mirrored vehicle response and the larger inner-wheel angle swaps sides;
4. tire/knuckle loads can back-drive the rack through the mechanism;
5. straight/hands-off running is stable over a representative speed window with no hidden centering target;
6. steering release behavior is physically explainable rather than frozen by friction;
7. axis/trail/scrub sensitivity is expressed around WheelCenter and not inherited as M6 authority;
8. rack-side geometry stays explicitly provisional;
9. no wishbone↔knuckle visual offset is used to make steering tests pass.

Only after a mechanism passes headless causal gates should it become an owner-playable A/B candidate.

## Stop / replan conditions

Stop before product promotion if:

- acceptable hands-off behavior requires a hidden centering force;
- stability requires arbitrary geometry with no defensible contact-mechanics interpretation;
- the legacy sphere-contact backend is shown to be the dominant limitation, in which case evaluate a bounded contact-backend/b3Wheel research lane rather than compensating steering around it;
- solving steering would require claiming the deferred visual rig mating as authority.
