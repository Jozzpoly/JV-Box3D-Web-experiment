# JV Web — current project state

Updated: 2026-08-24
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE ACCEPTED IN MAIN / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / DESKTOP HUD HEADER CLEANUP NEXT GROUNDING TARGET / CODEX TRANSITION READY / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted desktop/mobile capability-hygiene executable:
  319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c

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

ordinary active product lane:
  NONE

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## 2. Accepted control and UI foundations

Preserve unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; final tuning open;
- absolute-position throttle/brake mapping inside acquisition geometry frozen at pointer-down;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior and current D/R sign/re-sign semantics;
- browser tap highlight suppressed on custom mobile driving controls while product-owned feedback remains visible;
- standard desktop hides mobile-driving-only `Kierownica: Obrót / Przeciąganie` and `Tło kier.` controls, while shared locations, Pixel/Smooth, Grid and Fullscreen remain available;
- mobile/narrow/coarse-pointer surfaces retain the steering-mode and steering-plate controls;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. Desktop/Mobile Capability Hygiene V1 — accepted

Grounding found that `.mobile-controls` was already correctly absent on standard desktop; the real mismatch was narrower: pointer-steering-only toolbar controls were still exposed when their touch surface was absent.

Accepted behavior:

- standard desktop: `Kierownica: Obrót / Przeciąganie` absent;
- standard desktop: `Tło kier.` absent;
- shared Plac/Offroad/JSPREV2, Pixel/Smooth, Grid and Fullscreen remain;
- mobile/narrow/coarse-pointer: steering modes and steering plate remain available;
- responsive visibility tracks `(hover: none) and (pointer: coarse), (max-width: 620px)` and resynchronizes without reload;
- steering/pedal/D-R semantics are unchanged.

Owner evidence:

- desktop screenshot and explicit Owner judgement on 2026-08-24: desktop state is correct;
- explicit Owner judgement: mobile state is also correct;
- an earlier desktop screenshot exposed a real V1 bug where the steering group remained visible because its author-level `display:grid` overrode the semantic hidden state; the final candidate adds an explicit `[data-mobile-driving-only][hidden] { display:none; }` rule and regression coverage;
- exact accepted merge `319f25de...` preserves the final Owner-tested candidate plus current documentation ancestry.

Classification: `OWNER ACCEPTED — DESKTOP/MOBILE CAPABILITY HYGIENE V1`.

Do not expand this result into blanket platform hiding. Continue capability hygiene only from concrete observed mismatches.

## 4. Pedal contact V1/V1.1 — deferred

Accepted `main` does **not** contain the contact-zone experiment. Owner A53/Chrome evidence showed that a zero region existed, but its practical value was too small to justify continued tuning/presentation work.

Classification:

`OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED FOR NOW`

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Accepted absolute-position pedals remain the baseline. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## 5. Next grounding target — Desktop HUD Header Cleanup

Owner desktop evidence identifies the first-row HUD as unnecessary ordinary-product chrome:

- left overlay: `JV Box3D Web · R1 / M6 Drive`;
- right overlay: `LIVE · GENERATION ... · CONTACTS`.

Source grounding shows the canvas already fills the full scene and WebGL renders across it. The dark area above the horizon is scene background, not reserved HTML layout. Therefore do **not** change camera, canvas sizing or renderer merely to remove the perceived top strip.

The runtime `Generation` and `Contacts` information already exists in Debug telemetry. The next slice should first ground whether ordinary desktop should simply hide `.scene-header` and pull the useful toolbar/actions upward into the recovered HUD row. Keep mobile composition out of this slice unless direct device evidence requires it.

This is a next-target hypothesis, not an accepted implementation plan.

## 6. Codex transition

The project is ready to continue in Codex from live `main`. Codex must independently resolve live refs before write and treat this file as routing context rather than proof.

Recommended first Codex activity:

1. resolve live `main`, `preview/owner-control`, and Public `main`;
2. confirm no ordinary product lane is ahead of `main`;
3. inspect the desktop header/toolbar/action layout and current debug telemetry duplication;
4. design the smallest Desktop HUD Header Cleanup falsifier;
5. do not implement a broad UI redesign, publication campaign, physics change or mobile re-layout without new evidence.

## 7. Separate later work

- continue desktop/mobile capability inventory only from concrete mismatches;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling stage;
- later JURE/rig integration and handling;
- performance scaling only from measured need;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler.
