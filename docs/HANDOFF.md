# JV Web — takeover handoff

Updated: 2026-08-18
Status: `HANDOFF READY / P1.3.1 OWNER-PREVIEW VALIDATED / PRODUCT WORK FROZEN / CANONICAL CONSOLIDATION PENDING / JURE PAUSED`

This snapshot belongs to `checkpoint/p1-3-1-handoff-2026-08-18`. Live Git and `docs/PROJECT_STATE.md` on the same checkpoint outrank this file. Private `main` remains accepted source/product authority; the checkpoint exists only so a fresh agent can reconstruct the active polish state without archaeology.

## Fresh entry — do this first

1. Resolve the live refs listed below independently.
2. Read `AGENTS.md`.
3. Read `docs/PROJECT_STATE.md` from `checkpoint/p1-3-1-handoff-2026-08-18`.
4. Read this handoff.
5. Inspect only the current utility-drawer source/test unless the selected next slice requires more.
6. Use `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for still-open pedal/steering intent only; its old “P1.2 next” staging text is superseded by this handoff.

Do not restart the P1.2/P1.3 publication-script campaign, source recovery, old Camera/Fullscreen reconstruction, P1 CSS repair, accepted-A53 optimization or JURE consumer work without new contradictory evidence.

## Exact state to recover

Verified immediately before the handoff docs commit:

```text
PRIVATE
main = bf4c5dc9585afb229fa4d29f780f67edb4eb077b
work/p1-3-utility-drawer = 1a17d12797f1cb515a35eae4d7f42681b1c5f010
work/p1-3-1-drawer-polish = 4cda838ea57d2716f3ff86db1c2865cc03ee06d4

PUBLIC
main = f512551dc41196bc8ca053357408c93b4b3725be
preview/p1-2-owner = 6cbe6146c945a12dadb92b4b3f601bfffb8ca280
preview tree = 1fca7addb2c1a83434ff614c8b21ae53be7bef5a

PAGES
https://jozzpoly.github.io/JV-Box3D-Web-Public/
Owner supplied live A53 screenshots from the P1.3.1 preview state.
```

The public preview branch name is intentionally left as `preview/p1-2-owner`; it is now just the stable polish-preview channel. Do not rename it during takeover.

## What changed in this conversation

### P1.2 — composition recovery

A very small short-landscape CSS change stopped mobile controls from reserving a destructive full-width bottom row. The Owner tested desktop + A53 and confirmed the intended functional result: useful world remains visible after rotation, controls do not cover important UI, nothing critical disappears, analog pedals/steering still work and browser/fullscreen/orientation transitions remain usable.

P1.2 was not a final visual-design success because the persistent top header/status/nav still consumed too much space.

### P1.3 — utility drawer foundation

Private source `1a17d127...` removed the persistent compact header and made the world/view toolbar transient behind a top-centre handle. It was canonical-built on the Owner machine with Node 24.16.0/npm 11.17.0, 458/458 tests, typecheck, docs/third-party and Vite 8.1.5 build PASS.

The public P1.3 preview was owner-tested and confirmed the correct interaction direction, but the open drawer was too narrow and looked visually squeezed.

### P1.3.1 — wide drawer polish

Private source `4cda838...` changes only `utility-drawer.ts`, `utility-drawer.css` and the drawer contract test. It widens the transient shell to safe-area width, scrolls only the inner rail, adds edge overflow affordance, improves group rhythm and replaces the old CSS chevron with an SVG in source.

Focused evidence: 6/6 drawer contract PASS, standalone TS sanity PASS, portrait/landscape Chromium sanity.

For speed of Owner visual iteration, the currently live public preview does **not** contain a canonical rebuild of `4cda838...`. It keeps canonical P1.3 assets and explicitly adds:

```text
assets/p13-1-drawer-polish-preview.css
assets/p13-1-drawer-polish-preview.js
P1_3_1_PREVIEW_OVERLAY.json
```

The receipt names source `4cda838...` and says canonical rebuild is required before product acceptance. This temporary root overlay must be removed during final consolidation.

## Current Owner verdict

The latest direct A53 verdict:

- portrait open drawer no longer looks brutally clipped;
- landscape open drawer is clearly better;
- closed state remains clean;
- the wide drawer fulfils its role and is accepted as a foundation for future non-essential options;
- the main driving view should contain only the most important driving information/controls;
- the drawer can later grow downward/multi-row when there are enough options to justify it;
- Camera/Reset/Debug may later become compact icons to clear more of the world view.

Design remains open:

- the Owner preferred the earlier simple drawer icon/chevron;
- do not over-interpret the current screenshot of the new SVG: the preview overlay leaves old compiled P1.3 `border-right/border-bottom` chevron CSS active, so the SVG is rendered together with a stale L/box shape. A clean canonical/source render of `4cda838...` would not have that exact collision;
- nevertheless preserve the Owner's preference for a simpler, more project-consistent handle design;
- horizontal scroll/fade has not received meaningful Owner judgement yet because the current visible option set did not require scrolling in the observed state.

## Steering roadmap feedback — save, do not implement during takeover

The Owner now explicitly wants a later steering-visual pass in which:

- the visible wheel becomes larger;
- it moves slightly upward;
- it is no longer visually clipped by the blue rectangular box;
- the visible mechanism can extend beyond the stable acquisition zone;
- the blue box becomes an optional contrast/background plate rather than mandatory visual framing.

Preserve X-only analog `POSITION` while doing that future visual slice. Do not conflate visual unboxing with rotational steering or steering-physics changes.

## Protected baseline

Preserve unless a later explicitly selected slice changes it:

- Plac E2R / Offroad / approved JSPREV2;
- owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- working X-only analog steering mapping;
- analog throttle/brake and independent multitouch ownership;
- fail-closed lifecycle and current D/R semantics;
- P1.2 lower-control/short-landscape composition;
- P1.3 principle: persistent-minimal driving HUD + transient utility surface;
- accepted A53 render-1x performance boundary;
- private `main` and public `main` remain untouched rollback authorities.

## Process lesson — do not repeat the publication detour

Several hours were lost to wrappers that failed for reasons unrelated to the product: over-strict npm equality, false raw-`dist` notice requirement, PowerShell native-stderr handling, exact-blob transport limits and other publication-harness mistakes.

Those attempts are closed process archaeology. Do not repair or reuse them.

The useful rule is:

### During active visual polish

```text
small typed source change
-> smallest relevant check
-> explicit fast preview when needed
-> real A53/desktop feedback
```

### Before declaring a slice accepted product truth

```text
accepted private source
-> canonical Node24/npm11 check/build
-> public preview composed from that build WITHOUT executable overlay
-> exact identity checks
-> Owner smoke
```

This keeps iteration fast without weakening final evidence.

## Immediate next decision after takeover

Do **not** begin implementation simply because this handoff exists.

First ground the refs and current Owner intent. Then choose between:

1. one small drawer-handle/visual polish pass if the Owner still wants it; or
2. if the drawer is considered good enough, canonical-consolidate P1.3.1 into a normal source build and remove the public preview overlay.

Only after that should the roadmap continue into later UI/driving-control work.

Potential later order, not a rigid branch plan:

`drawer finalisation -> action/icon cleanup -> driving-zone sizing -> portrait sanity -> absolute pedals -> mechanical pedal motion -> steering visual unboxing -> rotational steering A/B -> joint industrial design -> intentional portrait composition`

The steering visual preference captured above may justify moving that visual slice earlier if the Owner deliberately chooses it, but do not start it automatically.

## Explicit takeover non-goals

Do not:

- merge active work into private `main` during grounding;
- write public `main`;
- call P1.3.1 canonical while the overlay is present;
- rename refs for cosmetic cleanliness;
- reopen publication-gate tooling;
- change pedal mapping, steering mapping, drivetrain or physics while polishing drawer chrome;
- optimize the accepted scan again without new evidence;
- mix JURE authored-rig work into this UI continuation.
