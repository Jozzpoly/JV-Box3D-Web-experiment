# JV Web — current project state

Updated: 2026-08-18
Owner: Jozz
Status: `P1.3.1 OWNER-PREVIEW VALIDATED / HANDOFF FREEZE / PRODUCT WORK PAUSED / CANONICAL CONSOLIDATION PENDING / JURE PAUSED`

This file is the current-state router for the handoff checkpoint `checkpoint/p1-3-1-handoff-2026-08-18`. Live Git, executed evidence and direct Owner observation outrank this document. Private `main` remains accepted product/source authority; this checkpoint is a navigation snapshot, not a promotion of P1.3.1 to `main`.

## 1. Exact live anchors at handoff

Verified immediately before handoff preparation:

```text
private main / accepted source authority:
  bf4c5dc9585afb229fa4d29f780f67edb4eb077b

P1.3 utility drawer source:
  work/p1-3-utility-drawer@1a17d12797f1cb515a35eae4d7f42681b1c5f010

P1.3.1 drawer polish source:
  work/p1-3-1-drawer-polish@4cda838ea57d2716f3ff86db1c2865cc03ee06d4

public main / rollback authority:
  f512551dc41196bc8ca053357408c93b4b3725be

public owner-preview branch:
  preview/p1-2-owner@6cbe6146c945a12dadb92b4b3f601bfffb8ca280

public P1.3.1 preview tree:
  1fca7addb2c1a83434ff614c8b21ae53be7bef5a

Pages URL:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

The public preview branch name is now semantically stale; it still says `p1-2-owner` although it carries P1.3/P1.3.1 work. Do not rename it merely for tidiness during takeover. It is the active polish-preview channel and the Owner supplied live Pages screenshots from the P1.3.1 state.

The GitHub connector available during this handoff could not read the Pages settings/status endpoint reliably, so do not claim a connector-side Pages status. Owner-device screenshots prove that the Pages URL served the P1.3.1 preview behavior after the public preview update.

## 2. Evidence boundary

### P1.3 canonical source/build evidence

Private P1.3 source `1a17d127...` received the canonical Windows execution on the Owner machine:

- Node `24.16.0`;
- npm `11.17.0`, valid under repository contract `>=11.13.0 <12`;
- `npm ci` PASS;
- full `npm run check` PASS, **458/458 tests**;
- typecheck PASS;
- docs + third-party validation PASS;
- Vite `8.1.5` production build PASS;
- tracked worktree remained clean.

The later wrapper failure was a false post-build requirement for `THIRD_PARTY_NOTICES.md` inside raw Vite `dist`; it was not a build/product failure. Do not rerun or repair that build-kit campaign.

P1.3 was then composed into the public preview at `69bea00e6cad4d306179badddc451f5cd1f15302` with exact tree `3c0ee9289810bb93451cb0d43fc674afb770caff`, preserving the approved static scan/vehicle payload.

### P1.3.1 evidence is intentionally different

Private polish source `4cda838...` is one commit above P1.3 and changes only:

- `src/utility-drawer.css`;
- `src/utility-drawer.ts`;
- `tests/utility-drawer-contract.test.mjs`.

It preserves `product-main.ts`, `product-controls.ts`, `mobile-driving-controls.css`, steering, pedals, D/R, physics and rig code.

Pre-preview evidence for `4cda838...`:

- focused utility-drawer contract: **6/6 PASS**;
- standalone TypeScript sanity: PASS;
- Chromium responsive/render sanity for portrait + landscape;
- functional drawer interaction checks for open/close, accessibility state and overflow affordance.

P1.3.1 has **not** received a full canonical Node24/npm11 repository build. Instead the Owner-tested public root temporarily layers two small source-owned preview files over the canonical P1.3 build:

```text
assets/p13-1-drawer-polish-preview.css
assets/p13-1-drawer-polish-preview.js
P1_3_1_PREVIEW_OVERLAY.json
```

The receipt explicitly records source `4cda838...` and `canonicalRebuildRequiredBeforeProductAcceptance: true`.

This preview-overlay mechanism is acceptable only as a fast visual-polish loop. It must be removed and P1.3.1 must be built normally from private source before final product acceptance or promotion.

## 3. Owner verdict — P1.2 composition foundation

P1.2 solved the major composition regression that triggered this campaign. On Galaxy A53 / Chrome the Owner directly confirmed:

- rotation still leaves a useful world view;
- pedals no longer consume the whole bottom strip;
- steering/pedals no longer obscure useful controls/readouts;
- nothing critical falls outside the viewport;
- analog throttle/brake remain correct;
- steering remains correct;
- browser <-> fullscreen <-> orientation transitions work normally.

The Owner rejected only the remaining top-chrome composition: the persistent header/status/navigation consumed too much space and carried information that was not useful while driving.

Protected meaning: the P1.2 lower driving composition and input behavior are a working foundation. Do not reopen pedal/steering semantics to solve top-chrome design.

## 4. Owner verdict — P1.3 / P1.3.1 utility drawer

P1.3 removed the persistent mobile header and moved world/view options behind a compact top-center drawer handle. The Owner confirmed that this substantially cleans the driving view.

Initial P1.3 drawer behavior worked but its open shell was too narrow and looked like the old toolbar squeezed into a smaller box.

P1.3.1 widened the transient drawer to essentially the safe-area width and separated the stable outer shell from the horizontally scrollable inner rail. Owner-device screenshots and direct feedback confirm:

- portrait open state no longer looks brutally clipped;
- landscape open state is clearly better and the wide centred toolbar serves its purpose;
- closed state preserves the clean world view;
- the broad drawer is accepted as a useful foundation for housing future non-essential options;
- the main driving screen should contain only what is important during driving;
- future drawer growth may use additional vertical space rather than trying to keep every option in one narrow row.

This is **foundation/direction acceptance, not final visual-design acceptance**.

Open drawer-design feedback:

- the Owner preferred the earlier simple open/close chevron visually;
- the current P1.3.1 preview screenshot of the SVG chevron is additionally contaminated by a preview-overlay CSS collision: canonical P1.3 CSS still supplies the old `border-right`/`border-bottom` chevron geometry and the overlay did not reset those borders after replacing the element with SVG. The visible L/box shape is therefore not a faithful clean render of private source `4cda838...`;
- do not infer from the screenshot alone that the source SVG is inherently wrong; preserve the Owner preference for a simpler, better-fitting icon and re-evaluate in a clean source render;
- portrait scroll/fade behavior was not meaningfully Owner-tested because the currently visible option set fit without needing substantial scrolling. Revisit the affordance only when real drawer content requires it.

## 5. Protected baseline during continuation

Unless a later Owner-approved slice explicitly changes it, preserve:

- Plac E2R, Offroad and approved JSPREV2;
- current owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- X-only analog steering `POSITION` as the working input reference;
- analog throttle/brake foundation;
- independent multitouch ownership and fail-closed lifecycle behavior;
- current D/R semantics;
- P1.2 short-landscape lower-control composition;
- P1.3/P1.3.1 concept of persistent-minimal / transient-utility UI;
- accepted A53 render-1x performance boundary;
- public `main@f512551...` as rollback authority.

P1.3.1 must not be used as justification to alter physics, drivetrain, JURE boundaries or pedal/steering mapping.

## 6. Future UI roadmap captured from current Owner feedback

### Utility drawer / actions

- continue polishing the drawer only when work resumes; do not expand scope during handoff;
- use the drawer as the home for non-essential world/view/settings options;
- allow future multi-row / downward expansion when content justifies it;
- keep the closed driving surface visually sparse;
- Camera / Reset / Debug may later become compact icons to further clear the world view; this is future design work, not a requirement to implement immediately.

### Steering visual roadmap — important Owner preference, not immediate implementation

The Owner increasingly wants the visible steering wheel to:

- be larger;
- move slightly upward;
- not be visually clipped by the current blue rectangular acquisition/contrast box;
- visually extend outside that box while keeping stable touch acquisition geometry;
- retain the blue plate only as an optional contrast/background aid that could later be enabled when useful.

Do **not** change the working X-only steering mapping merely to achieve this visual result. Visible mechanism and acquisition geometry should remain separable.

This is a roadmap requirement only. It was explicitly not requested for implementation before handoff.

## 7. Correct polish/release loop going forward

The multi-hour P1.2/P1.3 publication detour demonstrated that validation infrastructure must remain proportional to the change.

For small visual-polish work while the Owner is actively iterating:

```text
private typed source change
-> smallest relevant source/test check
-> fast, explicit owner-preview if necessary
-> real A53/desktop judgement
-> revise locally
```

Do not run a full release campaign for every few-pixel visual experiment.

However, before declaring a polish slice accepted product truth:

```text
accepted private source
-> canonical Node24/npm11 check/build
-> normal composite/public preview without executable overlay
-> exact source/artifact identity check
-> Owner smoke
```

The temporary P1.3.1 public-root overlay is a deliberate preview exception and must not survive final consolidation.

Do not revive the obsolete Windows publication/build kits from this conversation. Their useful lessons are already captured here; their false validators and wrapper failures are process archaeology.

## 8. Handoff freeze and immediate next action

No further product implementation is authorized by this handoff checkpoint.

A fresh agent should first:

1. resolve live private `main`, `work/p1-3-utility-drawer`, `work/p1-3-1-drawer-polish`, public `main` and public preview refs;
2. read `AGENTS.md`;
3. read this `docs/PROJECT_STATE.md` from `checkpoint/p1-3-1-handoff-2026-08-18`;
4. read `docs/HANDOFF.md` from the same checkpoint;
5. inspect only `src/utility-drawer.ts`, `src/utility-drawer.css`, the focused drawer test and, when needed, the current public preview receipt;
6. treat `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` as future pedal/steering intent, but note that its sections saying “P1.2 next” are historical and superseded by this checkpoint.

After grounding, the likely first product decision is whether the drawer needs one more small visual pass (especially the handle/chevron) before canonical consolidation. Do not begin that implementation automatically; first verify live state and current Owner intent.

## 9. Explicit non-goals at handoff

Do not:

- merge P1.3/P1.3.1 into private `main` during takeover;
- modify public `main`;
- rename branches merely for cosmetic accuracy;
- rebuild publication-gate infrastructure;
- restart source recovery or old P1/P1.2 archaeology;
- change pedal semantics, steering mapping, drivetrain or physics while polishing the drawer;
- treat the preview overlay as canonical build evidence;
- start the steering-visual roadmap before the new conversation deliberately selects it;
- restart accepted A53 scan micro-optimization without new performance evidence;
- mix JURE authored-rig work into this UI handoff.
