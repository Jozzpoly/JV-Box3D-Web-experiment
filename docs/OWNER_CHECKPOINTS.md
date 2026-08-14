# JV Web — owner checkpoints

Updated: 2026-08-14

This is a compact ledger of owner-visible facts that future work must not silently overwrite. Detailed historical evidence remains in Git history and cold campaign/baseline documents.

A passing test is not owner acceptance. Acceptance is scoped to what Jozz actually observed.

## P0 — browser vehicle foundation

Classification: `OWNER ACCEPTED`

The browser product can load the owner vehicle, drive/steer/brake/reset, use Map/Offroad and use chase/orbit camera/debug controls. Later checkpoints refine this; they do not erase the basic product integration.

## S1 — FL upper placement/articulation

Classification: `OWNER ACCEPTED — NARROW`

The focused front-left upper suspension placement and live articulation were accepted at the tested precision/range. This did not validate the whole rig or lower suspension.

## S2 — front source/DOF semantics

Classification: `OWNER ACCEPTED — NARROW`

Preserve:

- `Socket_ChassisMount_b` / #6 is suspension-side and must not inherit steering rotation;
- `Socket_WheelCenter` / #8 is a distinct steerable member relative to #6;
- steering occurs around the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin remain distinct DOFs.

Do not expand this into authority for final carrier topology, rack law, tie rod, caster/KPI/trail or handling.

Owner-observed rig debt remains:

- FL lower placement is wrong;
- wishbone<->knuckle visual mating lacks trustworthy authored frames through articulation.

## R1-DRIVE-BRIDGE-01 — temporary coherent driving baseline

Date: 2026-08-13
Classification: `OWNER ACCEPTED — TEMPORARY PRODUCT INTERMEDIATE`

The temporary symmetric front removed the dominant two-mechanism left/right defect well enough to continue. Owner observed straight driving and materially more coherent left/right steering, with residual asymmetry/imperfections.

Not accepted:

- final steering physics/back-drive/self-align;
- provisional rack->angle mapping as future truth;
- final FR axis/hardpoints/topology;
- final caster/KPI/trail/tie-rod/rack geometry;
- final handling/feel;
- deferred rig mating.

## FRIENDS-R1-LIVE — public browser foundation

Date: 2026-08-14
Classification: `OWNER ACCEPTED — END-TO-END FRIENDS FOUNDATION`

Public release evidence:

```text
public branch: release/friends-r1
public commit: 7161215e47f00573b8c1b5c31e5931c89f9d709a
private source used by live hotfix: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
scan preview SHA-256: aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146
```

Owner directly confirmed:

- Plac E2R works on desktop;
- Offroad works and can be driven over terrain;
- full JSPREV2 scan works on desktop after the Pages/CDN fix;
- Plac E2R / Offroad / full scan also work on phone;
- phone scan is noticeably slow/heavy but remains usable at low speed;
- portrait and landscape both render the scan/vehicle;
- phone camera/framing and some responsive UI are not yet satisfactory and are explicitly deferred.

Protected meaning: GitHub Pages + browser runtime + public scan + current vehicle now form a real working product foundation.

This does **not** accept final mobile UX/performance, final vehicle rig, final steering physics or final driving feel.

## Durable method

When a later slice changes owner-visible behavior, record only the new durable verdict. Do not append test logs or rebuild the entire project chronology here.
