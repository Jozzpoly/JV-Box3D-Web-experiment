# AI project memory — JV Web

Updated: 2026-08-24
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE LANE / DESKTOP HUD HEADER CLEANUP NEXT GROUNDING TARGET / CODEX TRANSITION READY / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted desktop/mobile capability-hygiene executable: `319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c`;
- accepted tap-highlight integration executable: `86c99911a878136abee6485c88cd3ca2a18ed9fc`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- ordinary active product lane: none;
- Preview control lane: `preview/owner-control`;
- Preview JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/Public: `279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted product foundations

- `Obrót / DIRECT_ROTATION` + `Przeciąganie / RELATIVE_X`; steering tuning open;
- absolute-position pedals with frozen pointer-down geometry;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer lifecycle while other controls remain held;
- fail-closed lifecycle and current D/R sign/re-sign semantics;
- tap-highlight suppression on custom touch controls;
- standard desktop hides mobile-driving-only steering toolbar controls; mobile/narrow/coarse-pointer retains them;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition, Plac E2R, Offroad, JSPREV2 and accepted A53 render-1x boundary.

## Pedal contact experiment — durable outcome

V1 `8690368a...` and V1.1 `6312906d...` explored a lower zero/contact region on top of accepted absolute-position pedals.

The implementation was technically viable, but Owner A53/Chrome use judged the practical value too small to justify continued tuning/presentation work.

Classification: `OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED`.

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## Desktop/mobile capability hygiene — durable outcome

Owner confirmed desktop and mobile behavior after the focused hygiene slice.

Accepted meaning:

- standard desktop hides `Kierownica: Obrót / Przeciąganie` and `Tło kier.`;
- shared location, texture, Grid and Fullscreen controls remain;
- mobile/narrow/coarse-pointer retains steering modes and steering-plate control;
- input semantics are unchanged.

Exact accepted integration executable: `319f25de...`.

## Next work

Ground **Desktop HUD Header Cleanup** before implementation.

Owner desktop evidence identifies the top ordinary-product row as likely redundant:

- `JV Box3D Web · R1 / M6 Drive`;
- `LIVE · GENERATION ... · CONTACTS`.

The canvas already occupies the full scene and WebGL renders across its full viewport; do not change camera/renderer/canvas to remove the perceived dark strip. `Generation` and `Contacts` already exist in Debug telemetry.

Likely smallest direction: hide/remove the ordinary desktop `.scene-header` row and move useful toolbar/actions upward. Keep mobile unchanged unless direct evidence requires otherwise. This is a grounding target, not frozen implementation.

## Codex routing

Before write, Codex must independently resolve live source `main`, `preview/owner-control`, Public `main`, and any branch ahead of source `main`. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md` and verify the next slice from current source rather than restarting old recovery/publication work.

## Later boundaries

- further capability hygiene only from concrete mismatches;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel;
- small brake dominating full throttle / low power -> longitudinal handling;
- later JURE/rig/handling;
- Friends/Public does not auto-advance with source.
