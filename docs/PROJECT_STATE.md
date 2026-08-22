# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `DUAL-MODE STEERING + ABSOLUTE-POSITION PEDAL FOUNDATIONS ACCEPTED IN MAIN / PEDAL TUNING OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / D-R GROUNDING NEXT / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

mechanical pedal merge parent:
  e8e879a3185ca61cb924acf5490c24781dc84ad8

Owner-tested pedal runtime candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

Owner Preview control lane:
  preview/owner-control

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f
  receipt: receipts/jv_friends_scan_receipt.json

accepted Friends/public artifact authority:
  Jozzpoly/JV-Box3D-Web-Public/main
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` owns accepted source truth. Friends/Public remains a separate older artifact and currently predates both the dual-mode steering and absolute-position pedal source foundations.

There is no ordinary active product lane at this exact close boundary. The next intended work is D/R multitouch grounding; if a source experiment is opened, `docs/PROJECT_STATE.md` must be updated to name that one active lane.

## 2. Accepted mobile-control foundations

Protect unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; final tuning remains open;
- absolute-position throttle/brake mapping inside frozen pedal acquisition geometry;
- immediate pointer-down pedal value corresponding to touch position;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- core D/R command/sign semantics;
- P1.2/P1.3/P1.3.1 mobile composition, utility drawer and steering surface;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted Samsung Galaxy A53 / Chrome render-1x boundary.

Do not use pedal or D/R input work as a reason to change M6 physics, drivetrain, rig topology or steering semantics.

## 3. Absolute-position pedal foundation — integrated

The accepted pedal model is now absolute position inside geometry frozen at pointer-down:

```text
freeze pedal top + height on acquisition
current pointer Y -> [0,1]
bottom -> low command
top -> high command
pointer-down immediately applies represented value
outside range -> clamp 0/1
release/lifecycle loss -> 0
```

Owner-tested runtime source `e2d67ea1...` changed only:

- `src/input/pointer-analog-drive-adapter.ts`;
- `tests/analog-drive.test.mjs`.

Owner on Samsung Galaxy A53 / Chrome confirmed low/mid/high acquisition, small up/down corrections, full sweep/reversal, throttle+brake multitouch and steering+pedal coexistence, and judged the absolute-position model **better** than the previous relative-from-touch mapping.

Focused causal evidence on exact `e2d67ea1...`: repository-declared Node 24.16.0 / npm 11.13.0, `npm ci`, three directly relevant suites: **30/30 PASS**.

### Integration close evidence

Prospective merge `e8e879a3...` preserved the exact pedal adapter and direct test blobs from the Owner-tested candidate while taking current documentation from `main`.

The first full Windows close exposed one stale test fixture in `tests/mobile-driving-viewport-lifecycle.test.mjs`: its fake pedal returned only `height`, while the accepted absolute geometry contract requires `top + height`. Runtime behavior was not changed. The fixture was corrected only by adding `top: 0`.

Exact integration executable `315e41aa...` then passed:

- `windows-latest`;
- repository-declared Node/npm;
- exact clean checkout;
- `npm ci`;
- full `npm run build`;
- status context `jv/pedal-integration-close = success`.

Classification:

`OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL FOUNDATION IN SOURCE / TUNING OPEN`

## 4. Pedal neutral/contact zone — open tuning

Owner identified a concrete future refinement: it should be possible to touch the pedal at semantic zero and then roll smoothly into small input.

Current hypothesis:

- approximately the lower **5–10%** of acquisition travel may become a zero-command contact/buffer zone;
- touch inside that zone can remain exact `0`;
- crossing the threshold should transition smoothly into analog command;
- the exact percentage and value curve are **not frozen**;
- visual/mechanical feedback should eventually distinguish `contact/buffer` from actual pedal actuation.

Do not add this tuning by inertia during unrelated work. Coordinate it with future mechanical pedal feedback so command semantics and presentation agree.

## 5. D/R multitouch — next focused problem

Owner attempted to switch D/R while throttle remained held on Samsung Galaxy A53 / Chrome and reported that it **does not work**.

Source evidence localizes the weak boundary:

- D/R `pointerdown` currently only stops propagation;
- actual direction change relies on `click`;
- D/R has no explicit owned pointer lifecycle comparable to steering/pedals;
- the pedal-mapping change did not modify this path.

Core command semantics are separately tested: if a D/R toggle event arrives while throttle is held, the same current analog throttle value is re-signed at the toggle timestamp.

Classification:

`OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL MAPPING / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`

The next stage should first reproduce/falsify and ground the acquisition failure on the accepted baseline, then harden only pointer acquisition/lifecycle while preserving D/R drivetrain semantics.

## 6. Brake dominance / vehicle power observation

Owner observed that a very small brake input can dominate full throttle and reiterated that the vehicle is broadly underpowered.

Classification:

`OWNER OBSERVED — LONGITUDINAL/HANDLING FUTURE WORK / OUTSIDE CURRENT CONTROL INPUT SCOPE`

Do not change brake torque, motor power or longitudinal physics during D/R touch work or pedal presentation tuning.

## 7. Owner Preview and release boundary

Owner Preview V2 remains the normal iterative test surface and composes executable source separately from the exact approved JSPREV2 static layer.

After this close, Preview should point at accepted source `main` (resolve the live pointer rather than trusting this prose). The temporary pedal integration gate has been retired.

Friends/Public remains separately accepted and currently predates the later steering/pedal source integrations. Do not auto-promote it.

## 8. Living roadmap

There is no fixed `P1.4 -> P2 -> P3` scheduler. Current recommendation:

1. **D/R multitouch grounding + acquisition hardening** — reproduce the Owner-observed failure and establish robust pointer ownership/lifecycle without changing drivetrain semantics.
2. **Pedal mechanical feedback + neutral/contact-zone tuning** — coordinate physical-looking pedal actuation with a legible zero/contact/actuation boundary.
3. Desktop/mobile capability hygiene.
4. Portrait-specific composition.
5. Steering/pedal industrial-design convergence and later steering tuning from concrete feel evidence.
6. Later JURE / rig / handling, including longitudinal power/brake balance under its own scope.
7. Performance/LOD/streaming only from new measured need.

The ordering is a living priority map, not a permanent numbered roadmap.

## 9. Fresh-agent recovery

A fresh agent should resolve live source `main`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Recover these truths:

- dual-mode steering is accepted in source `main`, tuning open;
- absolute-position pedals are accepted in source `main`, neutral-zone/value-curve/mechanical feedback tuning open;
- `315e41aa...` is the exact pedal integration executable with full Windows `npm run build` PASS;
- Owner real-device D/R multitouch failed while throttle was held; acquisition is the next focused boundary;
- brake dominance/low power is separate future vehicle/handling work;
- Friends/Public remains a separate older accepted artifact.

Do not reopen pedal mapping selection, mix D/R work with drivetrain tuning, or begin large pedal visual redesign before the D/R acquisition boundary is understood.
