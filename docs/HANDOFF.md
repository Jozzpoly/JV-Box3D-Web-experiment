# JV Web — takeover handoff

Updated: 2026-08-24
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE LANE / DESKTOP HUD HEADER CLEANUP NEXT GROUNDING TARGET / CODEX TRANSITION READY / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
5. Do not revive closed steering, pedal, D/R, tap-highlight, contact-zone or desktop-capability experiments merely because historical refs remain visible.

## Exact accepted anchors

```text
accepted desktop/mobile capability-hygiene executable:
  319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c

accepted mobile tap-highlight executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R multitouch executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

pedal-contact V1 evidence only:
  8690368aa19242bb37b9476737ee9b1f5374724a

pedal-contact V1.1 evidence only:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

There is currently **no ordinary active product lane**. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## Accepted product boundary

Protect:

- dual-mode steering (`Obrót` + `Przeciąganie`), final feel/tuning open;
- absolute-position pedals with frozen acquisition geometry;
- independent throttle/brake pointer ownership;
- steering + pedal multitouch;
- D/R explicit pointer acquisition/lifecycle while other controls remain held;
- fail-closed lifecycle behavior and existing D/R sign/re-sign semantics;
- tap-highlight suppression on custom mobile driving controls;
- desktop/mobile capability hygiene: standard desktop hides mobile-only steering toolbar controls while mobile/narrow/coarse-pointer retains them;
- current camera/fullscreen/mobile composition and accepted map/scan/A53 performance foundations.

Keep drivetrain, motor/brake balance, vehicle physics and rig/JURE out of unrelated UI hygiene work.

## Pedal Contact V1/V1.1 — closed without acceptance

V1/V1.1 tested a lower zero/contact region on top of the accepted absolute-position pedal foundation.

Machine evidence was technically green, but Owner A53/Chrome use found the practical value too small to justify further tuning/presentation work.

Classification:

`OWNER VERDICT — NOT ACCEPTED / DEFERRED FOR NOW`

Do not integrate or continue the experiment by default. Accepted absolute-position pedal semantics remain the current baseline.

## Desktop/Mobile Capability Hygiene V1 — accepted

The large touch-driving surface was already correctly absent on standard desktop. The real mismatch was that pointer-steering toolbar controls remained exposed when their touch surface was absent.

Final accepted behavior:

- normal desktop hides `Kierownica: Obrót / Przeciąganie` and `Tło kier.`;
- shared locations, Pixel/Smooth, Grid and Fullscreen remain available;
- mobile/narrow/coarse-pointer retains steering modes and steering-plate control;
- visibility follows the same responsive boundary as the mobile driving surface and resynchronizes without reload;
- steering/pedal/D/R semantics are untouched.

Owner explicitly confirmed both desktop and mobile states on 2026-08-24. An earlier desktop screenshot exposed a CSS hidden/display regression; final accepted candidate fixed it and added regression coverage before integration `319f25de...`.

## Next checkpoint — Desktop HUD Header Cleanup grounding

Owner desktop evidence marks the top `scene-header` row as unnecessary ordinary product chrome:

- `JV Box3D Web · R1 / M6 Drive` on the left;
- `LIVE · GENERATION ... · CONTACTS` on the right.

Do **not** treat the dark region as an HTML spacer. The canvas already fills the scene and the renderer uses the full canvas viewport; the dark region is scene background above the horizon.

`Generation` and `Contacts` already exist in Debug telemetry. The likely smallest product direction is to hide/remove the ordinary `.scene-header` row on standard desktop and move the useful toolbar/actions upward. This remains a grounding hypothesis, not yet an accepted implementation.

Keep the first slice desktop-only unless device evidence requires mobile changes. Do not start a broad toolbar redesign.

## Codex transition

Codex should start from live Git, not from this snapshot. Before write:

1. resolve source `main`, `preview/owner-control`, Public `main` and any branch ahead of source `main`;
2. confirm accepted current state from `AGENTS.md` and `docs/PROJECT_STATE.md`;
3. independently inspect `src/main.ts`, `src/style.css`, debug telemetry duplication and the desktop screenshot evidence;
4. ground and freeze the smallest Desktop HUD Header Cleanup falsifier;
5. use test/render evidence proportional to the UI-only blast radius;
6. keep Friends/Public promotion separate.

## Separate later work

- capability inventory only from concrete mismatches;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- small brake dominating full throttle / broad low power -> longitudinal handling;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.
