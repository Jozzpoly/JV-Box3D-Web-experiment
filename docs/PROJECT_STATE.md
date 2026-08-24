# JV Web — current project state

Updated: 2026-08-24
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE + WIDE-DESKTOP HUD CLEANUP ACCEPTED IN MAIN / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / PRE-CODEX GROUNDING + WORKFLOW HARDENING NEXT / HANDOFF NOT YET FROZEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted wide-desktop HUD cleanup executable:
  4a68b462580f32f97a9702eb1e0dd46d64600948

Owner-tested wide-desktop HUD candidate:
  7ad78797456dd9c3fb5e421e2eeacd2a98c5cc68

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

Owner Preview control lane:
  preview/owner-control

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Resolve live `preview/owner.json` for the exact Preview source pointer; do not infer it from this snapshot. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

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
- mobile/narrow/coarse-pointer surfaces retain steering modes and steering-plate controls;
- wide fine-pointer desktop hides the redundant ordinary `.scene-header` row and reuses the top row for the product toolbar and `Camera / Reset / Debug` actions;
- medium-width `<=900px` and mobile/coarse layout behavior remains outside that wide-desktop HUD rule;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. Desktop/Mobile Capability Hygiene V1 — accepted

Grounding found that `.mobile-controls` was already correctly absent on standard desktop; the actual mismatch was pointer-steering toolbar controls exposed when their touch surface was absent.

Accepted behavior:

- standard desktop: `Kierownica: Obrót / Przeciąganie` absent;
- standard desktop: `Tło kier.` absent;
- shared Plac/Offroad/JSPREV2, Pixel/Smooth, Grid and Fullscreen remain;
- mobile/narrow/coarse-pointer: steering modes and steering plate remain available;
- responsive visibility follows the mobile-driving surface boundary and resynchronizes without reload;
- steering/pedal/D-R semantics are unchanged.

Owner confirmed both desktop and mobile states. An earlier screenshot exposed a CSS hidden/display regression; the final accepted slice fixed it and added regression coverage before integration `319f25de...`.

Classification: `OWNER ACCEPTED — DESKTOP/MOBILE CAPABILITY HYGIENE V1`.

Do not expand this result into blanket platform hiding. Continue capability hygiene only from concrete observed mismatches.

## 4. Wide Desktop HUD Header Cleanup V1 — accepted

Owner evidence identified the first ordinary-product row as redundant on a normal wide desktop:

- `JV Box3D Web · R1 / M6 Drive` on the left;
- `LIVE · GENERATION ... · CONTACTS` on the right.

Source grounding proved that the canvas already fills the scene and WebGL renders across its full viewport; the dark region above the horizon is scene background, not a reserved HTML strip. `Generation` and `Contacts` remain available in Debug telemetry.

The accepted change is deliberately presentation-only and scoped to `(min-width: 901px) and (hover: hover) and (pointer: fine)`:

- `.scene-header` is hidden;
- `.product-toolbar` moves to `top:16px`;
- `.scene-actions` moves to `top:16px`;
- `<=900px` layout rules remain unchanged;
- mobile/coarse/narrow rules remain unchanged;
- DOM, camera, renderer, canvas sizing, input semantics and physics are untouched.

Owner wide-desktop evidence on exact `7ad78797...` confirmed:

1. redundant first row absent;
2. toolbar correctly occupies the reclaimed top-left row;
3. `Camera / Reset / Debug` correctly occupies the top-right row;
4. no overlap observed;
5. Debug still opens and renders telemetry;
6. no observed scene/camera regression; mobile had already remained correct under the explicit desktop-only media boundary.

Mechanical integration `4a68b462...` preserves exact Owner-tested CSS/test blobs plus current documentation ancestry.

Classification: `OWNER ACCEPTED — WIDE DESKTOP HUD HEADER CLEANUP V1`.

## 5. Pedal contact V1/V1.1 — deferred

Accepted `main` does **not** contain the contact-zone experiment. Owner A53/Chrome evidence showed that a zero region existed, but its practical value was too small to justify continued tuning/presentation work.

Classification: `OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED FOR NOW`.

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Accepted absolute-position pedals remain the baseline. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## 6. Next stage — Pre-Codex Grounding + Workflow Hardening

The next stage is **not yet Codex takeover** and is not a new product feature.

Purpose: make JV-Web self-explanatory, operationally safe and high-quality for a separate execution context while preserving Owner intent and the current accepted product baseline.

The stage should independently audit and, only where evidence justifies it, harden:

1. live source `main`, `preview/owner-control`, Public `main`, active/ahead branches and open PRs;
2. authority boundaries between source, Preview, Friends/Public and accepted JSPREV2;
3. accepted / experimental / rejected-deferred / future work classification;
4. test/build contracts: causal checks vs milestone close vs Owner/device evidence;
5. Owner Preview workflow and rules for exact candidate identity/static-layer parity;
6. `AGENTS.md`, `PROJECT_STATE`, `HANDOFF`, AI memory, architecture/README and workflow documentation for drift or duplication;
7. branch/ref hygiene, including redundant historical/accidental refs, without launching a cleanup campaign that cannot change takeover safety;
8. responsibilities of ChatGPT/orchestrator, Codex/executor and Owner;
9. the living roadmap and explicit non-goals so Codex does not restart closed recovery/publication work or invent a fixed P-stage scheduler;
10. lessons worth importing from JURE, JV_CORE and other projects **only after their own current groundings produce reliable conclusions**. Cross-project memory is guidance, not proof of JV-Web state.

Do not freeze the Codex handoff until this audit has a coherent verdict. Do not modify product runtime merely to prepare the handoff.

## 7. Separate later product work

- further desktop/mobile capability inventory only from concrete mismatches;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling stage;
- later JURE/rig integration and handling;
- performance scaling only from measured need;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler.
