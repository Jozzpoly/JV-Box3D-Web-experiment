# AI project memory — JV Web

Updated: 2026-08-24
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE + WIDE-DESKTOP HUD CLEANUP ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / PRE-CODEX GROUNDING + WORKFLOW HARDENING NEXT / FINAL CODEX HANDOFF NOT YET FROZEN / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted wide-desktop HUD cleanup executable: `4a68b462580f32f97a9702eb1e0dd46d64600948`;
- Owner-tested wide-desktop HUD candidate: `7ad78797456dd9c3fb5e421e2eeacd2a98c5cc68`;
- accepted desktop/mobile capability-hygiene executable: `319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c`;
- accepted tap-highlight integration executable: `86c99911a878136abee6485c88cd3ca2a18ed9fc`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- ordinary active product lane: none expected after the HUD close; verify live;
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
- wide fine-pointer desktop hides the redundant ordinary `.scene-header` row and reuses the top row for product toolbar/actions;
- medium-width/mobile layout remains outside that wide-desktop HUD rule;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition, Plac E2R, Offroad, JSPREV2 and accepted A53 render-1x boundary.

## Pedal contact experiment — durable outcome

V1 `8690368a...` and V1.1 `6312906d...` explored a lower zero/contact region on top of accepted absolute-position pedals. The implementation was technically viable, but Owner A53/Chrome use judged the practical value too small to justify continued tuning/presentation effort.

Classification: `OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED`.

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## Latest accepted UI outcomes

### Desktop/mobile capability hygiene

- normal desktop hides `Kierownica: Obrót / Przeciąganie` and `Tło kier.`;
- shared controls remain;
- mobile/narrow/coarse-pointer retains steering modes and steering-plate control;
- input semantics unchanged.

Accepted integration: `319f25de...`.

### Wide desktop HUD cleanup

Owner wide-desktop evidence on exact `7ad78797...` confirmed the redundant `M6 Drive / LIVE · GENERATION · CONTACTS` first row is absent, toolbar/actions reuse that row without observed overlap, Debug still opens, and the scene/camera remain sane. The implementation is six lines of wide-desktop-only CSS plus contract coverage; accepted mechanical integration: `4a68b462...`.

## Next work — pre-Codex preparation, not takeover

Perform **Pre-Codex Grounding + Workflow Hardening** before freezing any final Codex handoff.

Audit live authority, branch/PR topology, accepted/deferred classification, validation tiers, Preview/static-layer contract, documentation drift, branch/ref hygiene, Owner/ChatGPT/Codex responsibility boundaries and the living roadmap.

Important transition principles:

- Codex must still verify live Git before write; a handoff is routing context, not proof;
- do not restart old recovery/publication campaigns or re-open rejected/deferred experiments from historical refs;
- small changes should keep the product loop: smallest source change -> causal validation -> faithful render/device evidence -> Owner judgement;
- full canonical validation belongs to foundation/milestone/release boundaries, not every polish iteration;
- Owner is primarily needed for look/feel/real-device evidence; executor owns code, repo work and machine validation;
- useful lessons from JURE, JV_CORE and other projects may be imported after their current groundings, but they are not evidence of JV-Web state.

The final Codex handoff is **not yet frozen**.

## Later product boundaries

- further capability hygiene only from concrete mismatches;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel;
- small brake dominating full throttle / low power -> longitudinal handling;
- later JURE/rig/handling;
- Friends/Public does not auto-advance with source.
