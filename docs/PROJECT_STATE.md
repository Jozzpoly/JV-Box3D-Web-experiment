# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / PEDAL CONTACT V1-V1.1 DEFERRED / DESKTOP-MOBILE CAPABILITY HYGIENE CANDIDATE ON OWNER PREVIEW / OWNER VERDICT OPEN / JURE PAUSED`

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

rejected/deferred pedal contact V1:
  8690368aa19242bb37b9476737ee9b1f5374724a

rejected/deferred pedal contact V1.1:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

active ordinary product lane:
  work/desktop-mobile-capability-hygiene@cde805d8d140d2b07fc7519e1ce4a8274c3ab467

Owner Preview pointer source:
  cde805d8d140d2b07fc7519e1ce4a8274c3ab467

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
- browser tap highlight suppressed on custom mobile driving controls while product-owned feedback remains visible;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. Pedal contact V1/V1.1 — deferred

Accepted `main` does **not** contain the contact-zone experiment. Owner A53/Chrome evidence showed that a zero region existed, but its practical value was too small to justify continued tuning/presentation work.

Classification:

`OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED FOR NOW`

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Accepted absolute-position pedals remain the baseline. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## 4. Active experiment — Desktop/Mobile Capability Hygiene V1

Grounding found that the large `.mobile-controls` driving surface is already hidden on standard desktop and becomes visible only for coarse-pointer devices or viewports at/below 620 px. Blanket mobile-UI hiding would therefore be incorrect.

The high-confidence mismatch is narrower: `product-controls.ts` installed pointer-steering-only toolbar controls on every platform even when the steering touch surface itself was absent on standard desktop.

Candidate `cde805d8...` is limited to:

- `src/product-controls.ts`;
- `tests/product-entry.test.mjs`;
- `tests/mobile-ui-contract.test.mjs`.

V1 contract:

- `Kierownica: Obrót / Przeciąganie` is explicitly mobile-driving-surface-only;
- `Tło kier. ON/OFF` is explicitly mobile-driving-surface-only;
- shared `Grid` remains visible on desktop;
- locations, Pixel/Smooth and Fullscreen remain shared;
- visibility follows the same responsive condition as the mobile driving surface: `(hover: none) and (pointer: coarse), (max-width: 620px)`;
- visibility resynchronizes on media-query changes rather than being fixed once at startup;
- steering/pedal/D-R input semantics are unchanged.

The exact Preview pointer selects `cde805d8...`. Normal Owner Preview provides canonical install/typecheck/portable-build validation. No full milestone gate is justified before Owner render/device judgement for this localized UI-capability slice.

Classification: `DESKTOP-MOBILE CAPABILITY HYGIENE V1 / OWNER VERDICT OPEN`.

## 5. Owner checkpoint

Validate both sides of the responsive contract:

Desktop, normal-width window:

1. `Kierownica` group is absent;
2. `Tło kier.` button is absent;
3. Plac/Offroad/JSPREV2, Pixel/Smooth, Grid and Fullscreen remain usable.

Mobile / narrow/coarse-pointer surface:

1. `Obrót / Przeciąganie` remain present;
2. `Tło kier.` remains present;
3. steering, pedals and D/R remain functional.

If this passes, integrate as a small hygiene close. Do not expand the slice into a broad toolbar redesign.

## 6. Separate later work

- continue capability inventory only from concrete mismatches;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling stage;
- later JURE/rig integration and handling;
- performance scaling only from measured need;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler.
