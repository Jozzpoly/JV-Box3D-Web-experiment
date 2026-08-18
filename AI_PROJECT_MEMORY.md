# AI project memory — JV Web

Updated: 2026-08-18
Status: `P1.3.1 OWNER-PREVIEW VALIDATED / HANDOFF FREEZE / CANONICAL CONSOLIDATION PENDING / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file. This version belongs to `checkpoint/p1-3-1-handoff-2026-08-18`; private `main` remains accepted source/product authority.

## Authority / refs

```text
private main: bf4c5dc9585afb229fa4d29f780f67edb4eb077b
P1.3 source: work/p1-3-utility-drawer@1a17d12797f1cb515a35eae4d7f42681b1c5f010
P1.3.1 source: work/p1-3-1-drawer-polish@4cda838ea57d2716f3ff86db1c2865cc03ee06d4
public main rollback: f512551dc41196bc8ca053357408c93b4b3725be
public preview: preview/p1-2-owner@6cbe6146c945a12dadb92b4b3f601bfffb8ca280
public P1.3.1 preview tree: 1fca7addb2c1a83434ff614c8b21ae53be7bef5a
```

Owner supplied live Galaxy A53 screenshots from the current P1.3.1 Pages preview.

## Accepted direction

P1.2 lower composition is a protected working foundation: world remains useful through orientation/fullscreen, controls do not hide critical UI, and steering/pedals did not regress.

P1.3 established the correct mobile chrome model: remove persistent top status/header and expose world/view options through a small top-centre transient drawer.

P1.3.1 widened the drawer to safe-area width. Owner verdict: portrait no longer looks brutally clipped, landscape is clearly better, closed view remains clean, and the wide drawer is a good foundation for future non-essential options. Main driving screen should show only essential information/controls.

Design still open: Owner prefers the earlier simpler drawer chevron. Current public preview of the new SVG is visually contaminated by stale P1.3 border-based chevron CSS because P1.3.1 is an overlay, not a clean rebuild. Scroll/fade is not yet meaningfully owner-tested because current content did not require it.

## Evidence boundary

P1.3 `1a17d127...` canonical Windows run: Node 24.16.0, npm 11.17.0, `npm ci`, full check **458/458 PASS**, typecheck, docs/third-party and Vite 8.1.5 build PASS.

P1.3.1 `4cda838...`: focused drawer **6/6 PASS**, standalone TS sanity and Chromium responsive sanity. No full canonical repository build yet.

Current public P1.3.1 proof is an explicit preview overlay on canonical P1.3:

```text
assets/p13-1-drawer-polish-preview.css
assets/p13-1-drawer-polish-preview.js
P1_3_1_PREVIEW_OVERLAY.json
```

The overlay receipt requires canonical rebuild before product acceptance. Remove the overlay when consolidating.

## Protected product baseline

Preserve Plac E2R, Offroad, approved JSPREV2, owner vehicle, Camera Manual Rig V1, Fullscreen V1, X-only analog steering `POSITION`, analog throttle/brake, independent multitouch, fail-closed lifecycle, D/R semantics, P1.2 short-landscape composition and accepted A53 render-1x performance.

Do not use drawer polish to change physics, drivetrain, steering/pedal semantics or JURE authority.

## Owner roadmap feedback

Future drawer: home for non-essential settings/options; may expand downward/multi-row. Camera/Reset/Debug may later become compact icons.

Future steering visual: larger wheel, slightly higher, not visually clipped by the blue box; visible wheel may extend beyond stable acquisition geometry; blue plate becomes optional contrast aid. Preserve working X-only mapping during that visual slice.

## Process rule

During visual polish use small source change -> smallest check -> explicit fast preview -> real A53 judgement. Do not rebuild release infrastructure for pixel-level iterations.

Before final acceptance: canonical Node24/npm11 source build -> public preview without executable overlay -> exact identity -> Owner smoke.

Obsolete Windows build/publication kits and their false-validator failures are closed archaeology; do not repair/reuse them.

## Takeover route

Read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

from `checkpoint/p1-3-1-handoff-2026-08-18`, then inspect only current drawer source/tests. `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` remains useful for future pedal/steering intent, but its old “P1.2 next” staging text is superseded.

Do not implement immediately after takeover. First verify live refs and current Owner intent. Then either do one small drawer-handle/design polish pass or, if the drawer is good enough, canonical-consolidate P1.3.1 and remove the public overlay.
