# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `DUAL-MODE STEERING FOUNDATION ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDAL DIRECTION OWNER-PREFERRED / PEDAL INTEGRATION OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted executable/source head before pedal experiment:
  bd4f6ad5df097b65536f7cb63d4fcb88691d9042

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active ordinary product lane:
  work/pedal-absolute-position

Owner-tested pedal candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview control lane:
  preview/owner-control

Owner Preview pointer source:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f
  receipt: receipts/jv_friends_scan_receipt.json

accepted Friends/public artifact authority:
  Jozzpoly/JV-Box3D-Web-Public/main
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` still owns accepted source truth. The pedal candidate is Owner-preferred but is not yet integrated into `main`. Preview selection and Owner approval of a direction do not silently promote source or Friends/Public.

## 2. Protected accepted foundation

Preserve unless a focused later slice explicitly changes it:

- dual-mode steering foundation: `Obrót` / `DIRECT_ROTATION` and `Przeciąganie` / `RELATIVE_X`, with tuning open;
- analog throttle/brake foundation and independent throttle/brake pointer ownership;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- core D/R command/sign semantics;
- P1.2/P1.3/P1.3.1 mobile composition, utility drawer and steering surface;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted Samsung Galaxy A53 / Chrome render-1x boundary.

Do not use pedal or D/R control work as a reason to change M6 physics, drivetrain, rig topology or steering semantics.

## 3. Absolute-position pedal semantics — Owner-preferred direction

Accepted pre-experiment pedals are **relative-from-touch displacement** controls: pointer-down begins at semantic zero and command grows from displacement relative to pointer-down `originY`.

Exact candidate `e2d67ea1...` changes only pedal mapping + direct tests:

- freezes pedal `top + height` at pointer-down;
- maps current pointer Y directly to `[0,1]` inside that frozen geometry;
- pointer-down immediately applies the represented low/mid/high value;
- movement outside the range clamps to `0` / `1`;
- release/lifecycle loss still returns the pedal to zero.

Candidate delta against the accepted executable baseline is limited to:

- `src/input/pointer-analog-drive-adapter.ts`;
- `tests/analog-drive.test.mjs`.

No CSS, pedal mechanical redesign, D/R redesign, steering, physics or drivetrain change belongs to this candidate.

### Machine evidence

Exact `e2d67ea1...` passed the focused causal check using repository-declared Node `24.16.0`, npm `11.13.0`, `npm ci` and three directly relevant suites: **30/30 PASS**. Status context: `jv/pedal-absolute-causal = success`.

A predecessor run was 29/30 only because a new test oracle incorrectly compared a final event value with a time-integrated interval command. Only the test was corrected; the product adapter blob did not change before the 30/30 PASS. The temporary causal workflow was then removed.

### Owner/device evidence

Owner tested the candidate on Samsung Galaxy A53 / Chrome through the normal Owner Preview and confirmed:

- low/mid/high initial touch behaves as intended;
- small up/down corrections work;
- full sweep/reversal works;
- throttle + brake multitouch works;
- steering + pedal coexistence works;
- overall absolute-position semantics are **better** than the accepted relative-from-touch mapping.

Classification:

`OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`

This does not yet accept final value curve, exact margins/dead bands, mechanical presentation or source integration.

## 4. Pedal neutral/contact zone — future tuning hypothesis

Owner identified a concrete limitation of the current absolute mapping: it is hard to touch the pedal at exactly semantic zero and then smoothly roll into small input.

Durable intent:

- reserve approximately the bottom **5–10%** of pedal acquisition travel as a possible zero-command contact/buffer zone;
- touching inside that region should be able to remain at exact `0`;
- moving beyond the threshold should transition smoothly into analog command rather than jump;
- the final threshold/range is **not frozen** by the current feedback;
- presentation should eventually distinguish “finger in contact / buffer zone” from “pedal actuation has begun”.

A likely mapping family for later falsification is `0` inside the lower buffer and a remapped continuous `[0,1]` above it, but do not implement a specific percentage/curve by inertia. Coordinate it with pedal mechanical feedback so semantics and visual contact/actuation cues agree.

## 5. D/R multitouch — real-device gap now evidenced

Owner attempted D/R switching while throttle remained held and reported that it **does not work** on the current A53 candidate.

Source comparison shows the D/R event path is unchanged between accepted `main` and the pedal candidate:

- `pointerdown` on D/R only stops propagation;
- actual direction change occurs on `click`;
- D/R has no explicit owned pointer lifecycle comparable to steering/pedals;
- the pedal candidate did not modify these direction listeners or their command semantics.

Core command semantics remain tested: if a D/R toggle event occurs while throttle is held, the same current analog value is re-signed at the toggle timestamp.

Classification:

`OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL-MAPPING DELTA / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`

Do not call this a pedal regression. Also do not overclaim that it is proven to predate the candidate until the accepted baseline is reproduced on device. The strongest next functional slice after pedal integration is D/R pointer-acquisition/lifecycle hardening while keeping drivetrain semantics unchanged.

## 6. Brake dominance / vehicle power observation

During simultaneous full throttle + very small brake input, Owner observed that braking strongly wins. Owner also reiterated that low vehicle power is a broader known limitation.

Classification:

`OWNER OBSERVED — LONGITUDINAL/HANDLING FUTURE WORK / OUTSIDE CURRENT CONTROL SEMANTICS SLICE`

Do not tune brake torque, motor power or longitudinal physics while closing pedal input semantics or D/R touch acquisition. Revisit under a dedicated vehicle/handling stage with its own evidence.

## 7. Owner Preview and release boundary

Owner behavior confirms the absolute-position candidate reached the real device through Owner Preview. Preview V2 remains an operational surface with executable source pinned separately from accepted JSPREV2 provenance.

Friends/Public remains separately accepted and currently predates both the dual-mode steering source integration and this pedal experiment. Do not auto-promote it.

## 8. Living roadmap

There is no fixed `P1.4 -> P2 -> P3` scheduler. Current recommendation:

1. **Pedal semantics integration close** — integrate exact Owner-preferred absolute-position foundation into accepted `main` without adding the future dead-zone/visual tuning in the same move.
2. **D/R multitouch acquisition grounding + hardening** — reproduce/falsify the real-device failure and replace click-dependent acquisition with an explicit robust pointer contract while preserving D/R drivetrain semantics.
3. **Pedal mechanical feedback + neutral/contact-zone tuning** — coordinate physical-looking actuation with a clearly legible zero/buffer/actuation threshold.
4. Desktop/mobile capability hygiene.
5. Portrait-specific composition.
6. Steering/pedal industrial-design convergence and later steering tuning from concrete feel evidence.
7. Later JURE / rig / handling, including longitudinal power/brake balance under its own scope.
8. Performance/LOD/streaming only from new measured need.

The ordering is a living priority map, not a permanent numbered roadmap.

## 9. Fresh-agent recovery

A fresh agent should resolve live `main`, `work/pedal-absolute-position`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Recover these truths:

- dual-mode steering is accepted in source `main`, tuning open;
- exact `e2d67ea1...` is the Owner-tested absolute-position pedal candidate with focused 30/30 PASS;
- Owner judged absolute-position pedals **better** and worth retaining, but they are not yet integrated into `main`;
- lower 5–10% zero/contact zone is a future tuning hypothesis, not a frozen spec;
- D/R failed real-device multitouch while throttle was held; source evidence does not attribute that failure to the pedal mapping delta;
- brake dominance/low power is separate future vehicle/handling work;
- Friends/Public remains a separate older accepted artifact.

Do not tune dead zones, redesign pedals, modify D/R or touch vehicle physics before the current pedal foundation is structurally closed unless new contradictory evidence requires it.
