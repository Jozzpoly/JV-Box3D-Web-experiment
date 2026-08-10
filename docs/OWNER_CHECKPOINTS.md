# JV Web — owner checkpoint ledger

Updated: 2026-08-10

This ledger records only owner-visible decisions that future agents must preserve. It is not a test log and not a chronological development diary.

## How to record a checkpoint

For each accepted/rejected owner-visible slice record:

```text
checkpoint id
exact source commit/tree
artifact/package identity if relevant
changed mechanism/bindings
owner observation
classification: ACCEPTED / REJECTED / PARTIAL
protected scope after acceptance
remaining issue / next question
```

Do not record a session nickname as a reproducible preset unless its parameters are actually committed.

## P0 — playable owner vehicle foundation

```text
source: 81c9677e12a331953101eb2531ca8ab013a985f9
classification: OWNER ACCEPTED
```

Observed working foundation included real owner chassis + four wheels, Box3D/M6 drive/steer/brake/reset, heading-follow chase camera, orbit/zoom, Map/Offroad teleports and separated debug behavior.

Durable meaning: browser owner-vehicle integration is a proven playable baseline, not a hypothetical future slice.

## R2 — full owner rig first package

```text
source: 5d508485ba5c24e6552e324cfbbcb5ec19399fec
classification: OWNER REJECTED VISUALLY / TECHNICAL EVIDENCE ONLY
```

The full suspension/damper/cardan package was technically generated but owner observation found major calibration defects: suspension too wide/inside wheels, dampers misplaced and cardans wrong.

Durable meaning: do not resurrect R2 visual placement merely because its tests are green.

## R4 — current owner packaging baseline

```text
source lineage baseline: 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
product tree before documentation maintenance: e28515182d3a447374044d9ffc70943fb888328d
package id: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER PARTIAL ACCEPTANCE / CURRENT PROTECTED BASELINE
```

Owner observation from the latest playable session:

- wheel placement: excellent;
- suspension packaging: almost excellent;
- overall front/vehicle stance: still slightly too wide and too low;
- vehicle should eventually sit somewhat higher;
- front steering rods: visibly too short and should stretch/deform between real rack and knuckle endpoints;
- front steering/upright pivot: still visibly wrong in a recurring way and is the next priority.

Protected during steering work:

- wheel mount interface and handed wheel transforms;
- physical wheel spin center vs authored `Socket_WheelMount` distinction;
- rear package/cardans/dampers;
- current overall R4 packaging unless a later dedicated stance slice explicitly opens it.

Important provenance limit:

`owner_r4` and `Tire=0` were session-level observations/settings and are **not** currently persisted as exact repository presets. Preserve the visual/feel observation, but do not claim exact preset reproduction.

## Next checkpoint sequence

Use small owner-visible slices:

```text
F0  steering truth instrumentation — no owner acceptance required
F1  front upright/kingpin only — owner checkpoint
F2  front steering rods only — owner checkpoint
F3+ upper arm / lower arm / damper / stance only if still needed, one at a time
rear mechanisms only after front is closed, one mechanism at a time
I0  whole-rig integration check, no new redesign
```

Skip any slice that current evidence + owner observation already considers good. The sequence is a decomposition tool, not a mandatory roadmap.
