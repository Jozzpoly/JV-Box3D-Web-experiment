# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / PEDAL CONTACT V1-V1.1 NOT ACCEPTED + DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / DESKTOP-MOBILE CAPABILITY HYGIENE NEXT / JURE PAUSED`

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

rejected/deferred pedal contact V1 machine-green candidate:
  8690368aa19242bb37b9476737ee9b1f5374724a

rejected/deferred pedal contact V1.1 observability candidate:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

ordinary active product lane:
  NONE

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

## 3. Pedal Contact + Mechanical Feedback V1/V1.1 — closed without integration

Accepted `main` does **not** contain this experiment. The accepted pedal foundation remains absolute-position mapping without the experimental contact-zone.

Evidence path:

- RED `6e228f103148b88c78f46a7cfc56bf2a0020c2c7` proved the accepted baseline did not satisfy the proposed contact/actuation contract;
- logic GREEN `0c259fe67d10c1a23479968fd0ab86f2d7bfce35` followed a test-only floating-point oracle correction;
- V1 `8690368a...` passed focused causal validation and bundle build;
- live-identity evidence proved Owner Preview really served exact V1;
- Owner A53/Chrome testing found that the practical zero/contact region was barely perceptible, roughly around 1% or less of the useful pedal interaction in feel, despite the nominal 10% transfer-function zone;
- V1.1 `6312906d...` changed only presentation observability and was also independently confirmed live;
- Owner then explicitly judged the feature not worth further effort and requested rapid grounding and continuation to higher-value work.

Classification:

`OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED FOR NOW`

Durable meaning:

- do **not** integrate `8690368a...` or `6312906d...` into accepted `main`;
- do not continue tuning percentages, hysteresis or contact presentation merely because the experiment exists;
- accepted absolute-position pedals remain the current product foundation;
- the idea may be revisited only if later pedal geometry/industrial design makes a meaningful contact zone valuable again.

This is a value/prioritization rejection, not evidence that the implementation was technically broken.

## 4. Next stage — Desktop/Mobile Capability Hygiene Grounding

Do not start with broad CSS hiding.

First inventory controls and functions that are present on desktop/mobile but have no useful effect, misleading semantics or duplicated ownership. For each item classify:

- useful on both desktop and mobile;
- mobile-only capability that should be hidden/disabled on desktop;
- desktop-only capability that should not pollute mobile;
- shared capability with different presentation needs;
- unclear / requires Owner evidence.

The first implementation slice should be the smallest high-confidence hygiene fix from that inventory. Preserve accepted mobile driving controls, steering/pedal/D-R semantics, physics, drivetrain and rig.

## 5. Separate later work

- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling stage;
- later JURE/rig integration and handling;
- performance scaling only from measured need;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler.
