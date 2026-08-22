# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `DUAL-MODE STEERING FOUNDATION ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDAL FALSIFIER SELECTED ON OWNER PREVIEW / LIVE DEVICE + PEDAL FEEL OPEN / JURE PAUSED`

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

active pedal candidate:
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

`main` still owns accepted product truth. The pedal branch is an experiment only. Preview selection/deployment does not grant acceptance.

## 2. Accepted foundation protected during this slice

Protect unless a focused later slice explicitly changes it:

- dual-mode steering foundation: `Obrót` / `DIRECT_ROTATION` and `Przeciąganie` / `RELATIVE_X`, with tuning open;
- analog throttle/brake foundation and independent throttle/brake ownership;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- current D/R semantics;
- P1.2/P1.3/P1.3.1 mobile composition, utility drawer and steering surface;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted Samsung Galaxy A53 / Chrome render-1x boundary.

Do not use pedal polish as a reason to alter M6 physics, drivetrain, rig topology or steering semantics.

## 3. Active experiment — absolute-position pedal semantics

Accepted `main` pedals remain **relative-from-touch displacement** controls:

- pointer-down owns the pedal and begins at semantic `0`;
- command grows from vertical displacement relative to pointer-down `originY`.

Active candidate `e2d67ea1...` tests one narrow alternative:

- freeze the pedal acquisition rectangle (`top + height`) at pointer-down;
- map current pointer Y directly inside that frozen rectangle to `[0,1]`;
- bottom = low command, top = high command;
- pointer-down immediately applies the value represented by the touched position;
- movement outside the rectangle clamps safely to `0` / `1`;
- release/lifecycle loss still returns the pedal to zero.

Candidate delta against accepted `main` is limited to:

- `src/input/pointer-analog-drive-adapter.ts`;
- `tests/analog-drive.test.mjs`.

No CSS, pedal visual redesign, D/R redesign, steering, vehicle physics or drivetrain changes are part of this candidate.

## 4. Machine evidence

Exact `e2d67ea1...` passed a focused causal check using repository-declared Node `24.16.0`, npm `11.13.0`, `npm ci` and these suites:

- `tests/analog-drive.test.mjs`;
- `tests/clean-browser-host-analog-drive-contract.test.mjs`;
- `tests/mobile-driving-integration-contract.test.mjs`.

Result: **30/30 PASS**. Status context: `jv/pedal-absolute-causal = success`.

The first run on predecessor `c6015892...` was **29/30** because one new test incorrectly compared a final event value against a time-integrated interval command. Logs showed the product behavior itself was correct. Only the test oracle was corrected; the product adapter blob stayed unchanged before the successful rerun.

The one-off causal workflow was retired after recording the result. It is not permanent Preview infrastructure.

## 5. Owner Preview and validation boundary

Owner Preview V2 **pointer** is set to exact `e2d67ea1...` plus the unchanged accepted JSPREV2 layer. Normal lightweight Preview machinery remains the intended delivery path.

The pointer/deploy request is verified from live Git. This session does **not** independently prove the final live Pages build identity after that pointer change. Live delivery plus real-device behavior therefore remain part of the Owner checkpoint rather than being pre-claimed here.

Technical validation does not answer the product question. Still NOT VALIDATED by Owner/device evidence:

- whether immediate low/mid/high touch values feel more direct and intentional than relative-from-touch;
- micro-adjustment up/down while held;
- full-range sweep, reversal of finger motion and clamp feel;
- throttle + brake multitouch feel under the new mapping;
- steering + pedal coexistence under real driving;
- quick D/R change while throttle is held as a regression smoke.

Owner should judge the absolute model as `better / worse / ambiguous` and identify any specific feel problem. If ambiguous, build an explicit A/B only then; do not add a mode switch pre-emptively.

## 6. D/R multitouch — grounded next candidate, not a proven regression

Current core D/R semantics are already deliberate: while throttle is held, D -> R re-signs the same current analog throttle value at the toggle timestamp. Throttle and brake have independent pointer ownership.

The weaker boundary is touch acquisition: the D/R selector stops `pointerdown` propagation but performs the actual toggle through `click`; it does not own an explicit pointer lifecycle like steering/pedals. Existing tests prove command semantics, not a full real-device second-finger D/R gesture while other controls remain held.

Classification: `GROUNDED NEXT CANDIDATE / NOT YET IMPLEMENTED / NOT A PROVEN PRODUCT REGRESSION`.

If the pedal semantics slice is retained, the recommended next functional slice is D/R multitouch acquisition hardening before larger pedal mechanical presentation work.

## 7. Living roadmap

There is no fixed `P1.4 -> P2 -> P3` scheduler. Current priority map:

1. resolve the active absolute-position pedal falsifier from Owner device/feel evidence;
2. if retained, harden D/R multitouch acquisition without changing drivetrain semantics;
3. pedal mechanical feedback / mechanically legible presentation, kept separable from input semantics;
4. desktop/mobile capability hygiene;
5. portrait-specific composition;
6. steering/pedal industrial-design convergence;
7. later JURE / rig / handling work;
8. performance/LOD/streaming only from new measured need.

The ordering is a current recommendation, not a permanent numbered roadmap.

## 8. Fresh-agent recovery

A fresh agent should resolve live `main`, `work/pedal-absolute-position`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Recover these truths:

- dual-mode steering is accepted in source `main`, tuning open;
- accepted pedals are still relative-from-touch;
- exact `e2d67ea1...` is the active absolute-position falsifier with focused **30/30 PASS**;
- Owner Preview pointer selects that exact candidate + accepted JSPREV2, while final live/device proof remains open until observed;
- pedal feel is not yet Owner-accepted;
- D/R multitouch hardening is a grounded likely next slice, not an already-proven failure;
- Friends/Public remains a separate older accepted artifact.

Do not merge the pedal candidate, redesign pedal visuals or modify D/R/physics before Owner evidence resolves the active semantics question.
