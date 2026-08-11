# JV Web — owner checkpoint ledger

Updated: 2026-08-11

This ledger records owner-visible decisions future agents must preserve. It is not a test log or chronological chat summary.

## Evidence rule

For each meaningful checkpoint record exact source/artifact identity when available, owner verdict, protected meaning and what remains open.

A green automated test is not owner acceptance. A historical/session label is not reproducible authority unless its parameters were committed.

## P0 — playable owner vehicle foundation

```text
source: 81c9677e12a331953101eb2531ca8ab013a985f9
classification: OWNER ACCEPTED
```

Proved browser integration of real owner chassis/wheels, M6 drive/steer/brake/reset, chase/orbit camera, Map/Offroad and debug behavior.

Durable meaning: browser owner-vehicle integration has playable accepted history.

## R2 — first full owner rig package

```text
source: 5d508485ba5c24e6552e324cfbbcb5ec19399fec
classification: OWNER REJECTED VISUALLY / TECHNICAL EVIDENCE ONLY
```

Major calibration defects included suspension packaging, dampers and cardans. Do not resurrect R2 placement because tests are green.

## R4 — historical partial observation

```text
source lineage baseline: 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
product tree: e28515182d3a447374044d9ffc70943fb888328d
package: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: HISTORICAL OWNER PARTIAL OBSERVATION
```

Historical feedback said wheels excellent, suspension almost excellent, stance slightly wide/low, steering rods short and front steering/upright pivot wrong. This is not current visual authority; the historical preset was not persisted exactly.

## V0 — exact baseline revalidation

```text
date: 2026-08-10
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER OBSERVED / CURRENT BASELINE REJECTED AS FINAL GEOMETRY
```

Canonical Windows validation used Node 24.16.0 / npm 11.13.0, pinned install, typecheck, deterministic generation, 13/13 focused tests and production build.

Owner-visible baseline:

- chassis/body roughly acceptable;
- wishbones/suspension too far from frame;
- dampers/springs wrong and entering wheel region;
- cardans visibly miss correct differential mating;
- upright/hub/suspension package buried in wheels;
- wheel placement not globally judgeable while surrounding geometry is incoherent;
- final ride height likely slightly higher.

Dynamic state: `OWNER OBSERVED HIGH-SEVERITY DYNAMIC REGRESSION / DEFERRED BY OWNER`.

Do not tune handling/stability/steering feel until visual recovery closes.

## S1-D — FL upper static split-authority checkpoint

```text
date: 2026-08-10
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
package: m6-owner-full-rig-r3
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER ACCEPTED — STATIC FRONT+TOP / PARTIAL INTERFACE CHECKPOINT
```

Reviewed constraint:

```text
inboard X = midpoint(physical upperFront, physical upperRear).x
inboard Y/Z = S1-C semantic-main-chassis calibration components
outboard XYZ = existing physical upper ball
orientation = PART_PAIR_ROLL_PINNED_STRETCH
contact claim = NONE_CONSTRAINT_COMPOSED_VISUAL_ATTACHMENT
```

Source/test evidence removed the previous longitudinal residual of about `-0.155671 m` to `0 m` while preserving the accepted Y/Z and outboard relation.

Owner verdict:

- FRONT good enough at current precision;
- TOP previous longitudinal yaw removed and placement good enough;
- wheel-side geometry remains near/buried in the tire/upright region;
- visible FL upper mesh stretch/proportion is deferred unless later rigging requires changing it.

Protected meaning: preserve the accepted static FL upper inboard relationship. This does not accept FR, FL lower, upright/hub/wheel, final mesh scale or physical suspension topology.

## S1-LIVE — FL upper real suspension articulation

```text
date: 2026-08-11
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
classification: OWNER ACCEPTED — FL UPPER LIVE ARTICULATION / NEUTRAL SUSPENSION RANGE
```

The exact frozen source was exercised through the normal `M6TopologyWorld` path over 180 consecutive neutral frames containing natural extension, compression/bump, rebound and settling/rest.

Technical evidence, explicitly **supplemental toolchain evidence** (Node 22 rather than pinned Node 24):

- S1-D static 4/4 PASS;
- generic transform controls 10/10 PASS;
- existing real-M6 runtime test 1/1 PASS;
- maximum chassis-side endpoint residual about `9.11e-8 m`;
- maximum arm-side endpoint residual about `7.00e-8 m`;
- no observed flip/twist/discontinuity/singularity;
- worst adjacent full-frame change about `1.70058°` during faster initial motion.

Jozz reviewed a focused FRONT + TOP capture and answered that the FL upper behavior is correct. He noted that surrounding line clutter made the motion somewhat harder to read, but remained almost certain it was correct.

Protected meaning: the S1-D acceptance extends to natural FL upper placement/orientation and mounting preservation through the observed real neutral suspension range.

Still not accepted by S1-LIVE: FR, FL lower, upright/hub/wheel packaging, dampers, mesh proportion/scale, steering geometry, handling/dynamics/feel.

## S1-I — clean integration into `main`

```text
date: 2026-08-11
integrated commit: 67d66ed412342fee5445b2901d85a663a084bf4e
integrated tree: f2e1836800719cc9cc7007631568c41e45471450
integration parent: 220083612116ea055cc7ae39498bd59a61fbce70
shape: 2 commits / 8 files / fast-forward lineage
classification: INTEGRATED PRODUCT STATE / NO NEW OWNER GATE
```

The orchestrator independently reviewed the curated candidate and fast-forward promoted it to `main`.

Integration properties:

- no merge of frozen S1;
- no cherry-pick of S1 history;
- exactly four product files + four focused regression files changed;
- all eight curated blobs are byte-identical to the reviewed frozen implementation on the accepted surface;
- FR and physics remain unchanged;
- package remains 59 real bindings / 829944 bytes / SHA-256 `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`;
- focused tests 30/30 PASS;
- real-M6 candidate runtime 1/1 PASS plus the same 180-frame neutral endpoint/frame regression;
- GitHub CI was absent and is not classified as PASS.

No new owner gate was required because the integrated surface is the exact reviewed mechanism/calibration semantics with unchanged generated visual identity and reproduced live behavior.

Durable meaning: the accepted FL upper static + live result now belongs to `main`. Frozen `393ef...` is cold technical/history evidence, not a required development base.

## Owner-checkpoint method

Use small dependency-driven slices. Record exact accepted/rejected constraints rather than whole-asset labels. Preserve accepted DOFs while reopening only unresolved ones.

For the next owner-sensitive geometry gate, reduce visual clutter when practical; use isolation/fixed projection views only when they improve attribution rather than as tooling work for its own sake.

Handling/feel remains a separate later campaign.
