# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / PEDAL CONTACT + MECHANICAL V1.1 ACTIVE ON OWNER PREVIEW / FIRST OWNER ATTEMPT INCONCLUSIVE ON OBSERVABILITY / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

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
  work/pedal-contact-mechanics@6312906d5ad3c6781605859cd1d9613d7f2e220a

pedal contact RED anchor:
  6e228f103148b88c78f46a7cfc56bf2a0020c2c7

pedal contact logic GREEN anchor:
  0c259fe67d10c1a23479968fd0ab86f2d7bfce35

pedal contact V1 machine-green candidate:
  8690368aa19242bb37b9476737ee9b1f5374724a

pedal contact V1.1 observability candidate:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview pointer source:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

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

Do not use this pedal slice as a reason to change drivetrain, motor/brake balance, vehicle physics, steering, D/R or rig authority.

## 3. Active experiment — Pedal Contact + Mechanical Feedback V1.1

Accepted `main` does **not** yet contain this experiment.

Purpose: test whether the accepted absolute-position pedal can support reliable exact-zero acquisition and a legible transition from contact into analog actuation without changing frozen acquisition geometry or other driving semantics.

### Input contract — unchanged from V1

- lower 10% of frozen pedal geometry is an **experimental** zero/contact region;
- inside that region the pointer is owned and presentation is active while command remains exactly zero;
- above the threshold the remaining 90% is linearly rescaled to full `0..1` range;
- `data-active` means contact/ownership;
- derived `data-actuated` means active command above zero;
- contact-only does not dim the peer pedal or mechanically depress the pedal;
- inner mechanism/face/fill may animate from `--pedal-value`; outer acquisition geometry stays fixed.

10% is not accepted tuning and must not be frozen before Owner device evidence.

### Evidence before V1.1

- RED `6e228f10...`: accepted baseline failed the new contact/actuation contract as expected;
- first logic run isolated one analog-suite failure to an over-strict floating-point test oracle; compile/typecheck and UI state already passed;
- test-only tolerance correction produced logic GREEN `0c259fe...`;
- V1 `8690368a...` passed typecheck, analog-drive, mobile-driving-ui, mobile-driving integration, viewport lifecycle, clean-browser analog contract, D/R multitouch regression and bundle build; status `jv/pedal-contact-causal = success`.

### First Owner attempt — INCONCLUSIVE, not product FAIL

Owner tested the normal Pages URL on Samsung Galaxy A53 / Chrome and reported that no meaningful change was visible.

A temporary live-identity probe then independently confirmed that Pages was serving exact V1 `8690368a...`; deployment/cache was therefore not the cause. Review of the Owner recording showed at least one touch centered very near the pedal bottom while speed remained `0.0 km/h`, consistent with the zero/contact semantics being present, but the contact-only visual state was too subtle to make the experiment legible.

Classification of V1 Owner attempt: `INCONCLUSIVE — OBSERVABILITY/DISCOVERABILITY INSUFFICIENT`.

### V1.1 refinement

V1.1 `6312906d...` preserves the exact 10% mapping and all logic from V1. It changes only `src/mobile-driving-polish.css` relative to `8690368a...`:

- makes the lower 10% zero/contact shelf visibly present;
- strengthens the neutral contact-only border/glow;
- keeps mechanical depression tied to actuation/value rather than ownership;
- does not change hit geometry, pointer semantics, drivetrain or physics.

A second temporary live-identity probe confirmed exact `6312906d...` is now served by Owner Preview; the helper was then removed.

Classification: `PEDAL CONTACT/MECHANICAL V1.1 LIVE / OWNER DEVICE VERDICT OPEN`.

## 4. Owner falsifier now required

On Samsung Galaxy A53 / Chrome judge:

1. is the bottom contact shelf visibly discoverable before touching it?
2. touch inside that shelf -> exact zero while contact is clearly acknowledged;
3. slowly cross the threshold -> smooth low-value onset without an obvious jump;
4. move repeatedly around threshold -> report any chatter/jitter;
5. full travel -> 100% remains easy to reach;
6. contact versus actual actuation is visually obvious enough;
7. throttle + brake, steering + pedal and pedal + D/R remain functional.

Possible outcomes remain separate: accept the model, keep model but retune zone size, adjust presentation only, add hysteresis only if real chatter exists, or reject and return to accepted `main`.

## 5. Separate handling observation

Owner observed that very small brake input can dominate full throttle and that the vehicle is broadly underpowered. Keep this for a dedicated longitudinal/handling stage, not pedal contact/mechanical presentation.

## 6. Living roadmap

1. Owner-test exact pedal contact/mechanical V1.1;
2. if accepted, perform a structural integration close; if not, tune/reject only from device evidence;
3. desktop/mobile capability hygiene;
4. portrait-specific composition;
5. steering/pedal industrial-design convergence and later steering feel tuning;
6. later JURE/rig/handling, including motor/brake balance;
7. performance scaling only from measured need.

No fixed P-stage scheduler.
