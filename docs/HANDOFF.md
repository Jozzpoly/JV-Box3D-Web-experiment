# JV Web — active transaction handoff

Updated: 2026-08-12
Status: **INTERRUPTION RECOVERED / S2-K PROTECTED / RIG MATING DEFERRED / R1-DRIVE-BRIDGE-01 OWNER GATE NEXT**

## Exact boundary

```text
private repo: Jozzpoly/JV-Box3D-Web-experiment
main: 97055331a2eef8bdbf8411db243417591731e664
active branch: work/front-corner-golden-rebuild-r2
pre-recovery docs tip: 9dc319c6f5811d18354923fafec2c14246ee801f
S2 mechanics/source candidate: a4468042550265d10c2fa4b13b926d9227040d89
public R0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44 — immutable
native JV: READ ONLY
```

Resolve live refs immediately before every write. No experimental R1 steering physics is committed to product code.

## Protected owner checkpoints

S1 + S2-N + S2-GAME-01 + S2-K establish only:

- accepted FL upper static/live behavior;
- #6 suspension-side/non-steering role;
- #8 separate steering role relative to #6;
- WheelCenter-centered steering position;
- independent wheel spin/orientation;
- direct in-game #6/#8 confirmation.

Do not infer final steering topology or physics.

## Deferred rig debt

Wishbone↔knuckle mating and FL lower placement remain `OWNER OBSERVED / DEFERRED RIG-WORKBENCH DEBT`.

Do not repair them with offsets. Do not tune physical rack/tie-rod geometry to the old visual rig merely to reduce separation or bump-steer.

## Recovery facts

Connection loss allowed hidden local work and two docs-only remote commits to occur. `1f354eeb...` was an accidental `TEMP` scratch commit; `9dc319c6...` removed its file. A continuing local sweep was found and killed. No product-code write occurred remotely.

All important physics claims were then rebuilt from the clean S2 mechanics baseline and rerun. Abandoned sweep outputs are not authority.

## R1 steering diagnosis

The current S2 mechanics candidate mixes incompatible front mechanisms and this is the dominant left/right driving defect. Equal kinematic steering proves the mismatch is causal. A symmetric physical front also proves bilateral linkage can recover active symmetry.

Physical research then found:

- severe `4 substeps` solver-order sensitivity in the weakly restoring bilateral graph;
- inherited constant 40 N rack stiction is harmful in the coherent physical graph;
- actual wheel heading/toe must be measured relative to chassis — steering-joint angle is not toe;
- apparent scrub-centering was strongly contaminated by toe preload;
- positive mechanical trail through the accepted WheelCenter can give physically plausible speed-dependent return without servo-to-zero;
- nevertheless the physical spatial tie rod still creates several degrees of bump-steer through representative suspension travel because rack/suspension hardpoints are provisional.

Therefore **do not promote or tune the physical candidate around the old rig**. Final physical steering remains coupled to future correct rig/rack authoring or a new generalized bilateral coupling.

## Current owner candidate — R1-DRIVE-BRIDGE-01

A clean disposable bridge is ready but uncommitted:

```text
mechanics base: a4468042550265d10c2fa4b13b926d9227040d89
vehicle topology: 19 bodies / 28 joints / 9 shapes
visual GLB: 829936 B
visual SHA-256: 1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc
supplemental suite: 326/326 PASS
```

Product delta:

- remove only the historical FR physical steering distance joint;
- command FR kinematically with the same provisional rack→angle mapping as FL through its existing twist coordinates;
- add no body, carrier, hardpoint, wheel offset or rig mating point.

This intentionally has no physical back-drive/self-align claim and does not accept the FR legacy axis/hardpoints. It is a bridge for coherent owner driving, not final steering.

## Next gate

Owner drives normal Offroad and answers only whether left/right response now behaves like one coherent car rather than two front mechanisms.

If owner rejects driving coherence, do not commit the bridge. If owner accepts it as a temporary R1 intermediate, then prepare a clean integration transaction while keeping final physical steering and rig/workbench debt explicitly open.
