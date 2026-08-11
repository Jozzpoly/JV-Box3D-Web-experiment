# JV Web — accepted project state

Updated: 2026-08-11
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / S2 OWNER VALIDATION PENDING`

This document describes accepted/integrated product state and the current durable boundary.

## 1. Authority

```text
Private accepted/integrated product:
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

Integrated S1 product checkpoint:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

Frozen S1 cold evidence:
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32

Public R0:
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` is the product. Historical/frozen refs are not parallel product authority.

## 2. Product goal and dependency direction

Goal: a browser friend-demo that increasingly feels like Jozz's own game and is worth launching, driving, tuning and showing to friends.

Current recovery order:

```text
chassis / attachment frame
-> corner landing + kinematic roles
-> wishbones
-> upright / hub / wheel
-> dampers / steering / cardans
-> stance
-> whole-rig integration
-> later dynamics/feel
```

Do not tune downstream systems to hide unresolved upstream geometry.

## 3. Integrated S1 boundary

FL upper is now integrated and OWNER ACCEPTED at current precision for:

- static FRONT + TOP chassis-side placement;
- inboard X from physical upper hinge-axis midpoint;
- inboard Y/Z from accepted semantic-main-chassis calibration;
- existing physical upper ball as outboard;
- `PART_PAIR_ROLL_PINNED_STRETCH` through real neutral extension/compression/rebound/rest.

Integrated package invariants remain 59 real bindings, 829944 GLB bytes and SHA-256 `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`; physics was unchanged.

Not accepted by S1: FR, FL lower, upright/hub/wheel, dampers, steering geometry, cardans, mesh proportion, stance or dynamics/feel.

## 4. Current unresolved owner-visible truth

- upright/hub/suspension package remains buried in wheel region;
- dampers/springs remain visibly wrong and enter/intersect wheel region;
- cardans still miss correct visible mating, especially differential side;
- final stance likely needs to be slightly higher;
- global wheel placement cannot yet be accepted;
- handling/stability/steering controllability remain strongly regressed and deliberately deferred.

## 5. S2 technical evidence — REVIEW_READY, not accepted

A read-only technical investigation of the front-left corner found the current proposed role map internally supported by source hierarchy, contracts, generated binding semantics and 180-frame real-M6 differential motion.

Proposed interpretation:

- chassis-side: `Socket_ChassisMount_a`, `Socket_SingleDamper_Mount`, `Socket_SingleDamperUpper`, chassis-side role of `Socket_CardanDrive`;
- lower-arm-side: `Chassis_Bottom` and `Socket_SingleDamperLower`;
- knuckle/upright-side: `Socket_ChassisMount_b`, `Socket_WheelCenter`, `Socket_SteeringRod` outboard role, `Socket_CardanHub`;
- `Chassis_Top` and `Chassis_Bottom` are spanning wishbone parts; upper/lower ball regions are shared pivots.

Technical counterfactual wrong-body hypotheses diverged materially during real motion, so no obvious body-role swap was found.

However **Jozz has NOT validated this interpretation visually**. He explicitly stated that multiple earlier agents were similarly confident about this stage and produced badly wrong results. Therefore technical self-consistency is insufficient to close S2.

S2 remains OPEN.

## 6. Required owner semantic gate

Before S3, Jozz must see clearly:

1. the actual authored FL source rig with our role labels on the real parts/sockets;
2. the same interpretation in focused real-runtime motion;
3. which elements we believe follow chassis, lower arm and knuckle/upright;
4. where we believe shared pivots are.

The purpose is to let the owner correct our **understanding**, not accept final geometry.

Known warnings that must remain visible in reasoning:

- steering authored socket vs current physical arm position mismatch is about 0.222 m; steering geometry remains unaccepted;
- interface-audit cardan endpoint path is stale relative to R3;
- worst observed lower-ball shared-joint residual was about 6.263 mm; preserve as later evidence, not S2 role acceptance.

Only direct owner confirmation/correction can close this semantic gate.

## 7. Next step boundary

Do not start S3, FL lower geometry, upright/hub/wheel, damper, steering, cardan, FR, stance or dynamics work yet.

If owner accepts the role map, S2 closes and the likely next product slice is FL lower wishbone while preserving integrated FL upper.

If owner corrects/rejects any role, replan that semantic mapping first; do not patch geometry around a misunderstood mechanism.

## 8. Owner-validation ergonomics

The previous live gate was visually cluttered. Use isolated/fixed views and ghost/hide unrelated geometry when that improves attribution. Do not build persistent tooling unless needed; disposable owner evidence is sufficient.

## 9. Branch note

No S2 work branch is needed because S2 is read-only. Existing completed/accidental refs are cleanup-only and must not be used as product authority.

## 10. Public boundary

Published R0 remains immutable. R1 waits for meaningful integrated owner-visible progress.
