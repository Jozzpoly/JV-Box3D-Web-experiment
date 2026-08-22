# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / PEDAL CONTACT + MECHANICAL V1 ACTIVE ON OWNER PREVIEW / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active ordinary product lane:
  work/pedal-contact-mechanics@8690368aa19242bb37b9476737ee9b1f5374724a

pedal contact RED anchor:
  6e228f103148b88c78f46a7cfc56bf2a0020c2c7

pedal contact logic GREEN anchor:
  0c259fe67d10c1a23479968fd0ab86f2d7bfce35

Owner Preview pointer source:
  8690368aa19242bb37b9476737ee9b1f5374724a

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## 2. Accepted control foundations

Preserve unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; final tuning open;
- absolute-position throttle/brake mapping inside acquisition geometry frozen at pointer-down;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior;
- existing D/R sign/re-sign command semantics;
- browser tap highlight suppressed on custom mobile driving touch controls while product-owned feedback remains visible;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. Recent accepted closes

D/R multitouch is accepted in source. RED `9a4ed881...` reproduced the old click-dependent acquisition weakness; GREEN `3f6acc82...` added explicit pointer lifecycle; Owner A53/Chrome video confirmed simultaneous throttle, brake, D/R and steering; integration `bd8980eb...` passed the full Windows repository build.

Mobile browser tap-highlight polish is accepted. Candidate `a8fb118b...` removed the browser cyan overlay without changing input semantics; Owner A53/Chrome confirmed overlay gone, pedal feedback preserved and steering/D/R preserved; integration `86c99911...` carries the exact accepted CSS.

## 4. Active experiment — Pedal Contact + Mechanical Feedback V1

Accepted `main` does **not** yet contain this experiment.

Purpose: test whether the accepted absolute-position pedal can support reliable exact-zero acquisition and a legible transition from contact into analog actuation without changing frozen acquisition geometry or other driving semantics.

Candidate `8690368a...` changes only:

- `src/input/pointer-analog-drive-adapter.ts`;
- `src/mobile-driving-ui.ts`;
- `src/mobile-driving-polish.css`;
- `tests/analog-drive.test.mjs`;
- `tests/mobile-driving-ui.test.mjs`.

V1 contract:

- lower 10% of frozen pedal geometry is an **experimental** zero/contact region;
- inside that region the pointer is owned and presentation is active while command remains exactly zero;
- above the threshold the remaining 90% is linearly rescaled to full `0..1` range;
- `data-active` means contact/ownership;
- derived `data-actuated` means active command above zero;
- contact-only state no longer dims the other pedal or mechanically depresses the pedal;
- inner mechanism/face/fill may animate from `--pedal-value`; outer acquisition geometry stays fixed.

10% is not accepted tuning and must not be frozen before Owner device evidence.

Evidence:

- RED `6e228f10...`: focused baseline falsifier failed as expected because accepted source lacks contact-zone and contact/actuation separation;
- first logic gate isolated one analog-suite failure to an over-strict floating-point test oracle; compile/typecheck and UI state already passed;
- test-only tolerance correction produced logic GREEN `0c259fe...` with compile, analog and UI suites PASS;
- exact final candidate `8690368a...` passed typecheck, analog-drive, mobile-driving-ui, mobile-driving integration, viewport lifecycle, clean-browser analog contract, D/R multitouch regression and bundle build; status `jv/pedal-contact-causal = success`;
- Owner Preview selects exact `8690368a...` plus the accepted JSPREV2 static layer.

Classification: `TECHNICALLY GREEN PEDAL CONTACT/MECHANICAL V1 / OWNER DEVICE VERDICT OPEN`.

## 5. Owner falsifier now required

On Samsung Galaxy A53 / Chrome judge:

1. touch near pedal bottom -> exact zero while contact is visibly acknowledged;
2. slowly cross the threshold -> smooth low-value onset without an obvious jump;
3. move repeatedly around threshold -> note any chatter/jitter;
4. full travel -> 100% remains easy to reach;
5. contact versus actual actuation is visually obvious enough;
6. throttle + brake, steering + pedal and pedal + D/R remain functional.

Possible outcomes remain deliberately separate: accept the model, keep model but retune zone size, add a later hysteresis falsifier if real chatter exists, adjust presentation only, or reject and return to accepted `main`.

## 6. Separate handling observation

Owner observed that very small brake input can dominate full throttle and that the vehicle is broadly underpowered. Keep this for a dedicated longitudinal/handling stage, not pedal contact/mechanical presentation.

## 7. Living roadmap

1. Owner-test exact pedal contact/mechanical V1;
2. if accepted, perform a structural integration close; if not, tune/reject only from device evidence;
3. desktop/mobile capability hygiene;
4. portrait-specific composition;
5. steering/pedal industrial-design convergence and later steering feel tuning;
6. later JURE/rig/handling, including motor/brake balance;
7. performance scaling only from measured need.

No fixed P-stage scheduler.
