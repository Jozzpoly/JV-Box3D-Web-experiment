# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `FOUNDATION CLEANUP / FINAL MOBILE-DRIVING GROUNDING COMPLETE / CANONICAL PROMOTION GATE PENDING`

## 1. Authority during cleanup

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active cleanup lane: work/foundation-cleanup
clean product base: e04539c5132cd67c17bcfad86b2c9ae39c07ab51
public Friends branch: release/friends-r1@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
public Friends tree: byte/tree-equivalent to owner-tested Steering V2@2acd652f68d57497c8ce8886b2875789a70f4be3
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`work/foundation-cleanup` is a temporary normalization/grounding transaction only. It was created directly from exact pre-V3 source `e04539c...`, not from the later V3/revert/rebuild history. The mobile-driving target is now grounded; broad product implementation should begin only after this cleanup boundary is promoted/closed, unless the canonical environment remains the sole blocker and work is kept explicitly source-level and unpromoted.

Git/current source, reproducible execution evidence and direct owner observation outrank this file.

## 2. Protected product foundation

The clean base already contains the owner-accepted work that must survive cleanup:

- Friends browser foundation: Plac E2R, Offroad, owner vehicle and full approved JSPREV2 on desktop/phone;
- Performance foundation v1: owner-validated Galaxy A53 / normal Chrome / current full textured JSPREV2 / render scale 1x / culling ON;
- Camera Manual Rig V1: accepted manual orbit/pan/pinch/zoom/framing/inspection foundation;
- Fullscreen V1: owner-validated mobile + desktop;
- Steering Control V2: owner-accepted one-thumb X-only mobile steering foundation;
- V2 pointer lift/cancel/lifecycle neutralization is **`POSITION 0` self-centering**, not a redesign to semantic `RELEASE` during ordinary touch use;
- keyboard/digital steering keeps its existing priority while held;
- recoverable mobile Debug;
- current temporary JV-Web steering range of approximately +/-35 degrees at the wheels.

Owner acceptance remains scoped. Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive, handling and final steering physics are not established here. JURE remains the authoring boundary for final rig geometry.

See `docs/OWNER_CHECKPOINTS.md` only when a scoped acceptance claim needs the durable evidence ledger.

## 3. Mobile driving target recovered and grounded

The implementation target is explicit in:

`docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`

Core target:

```text
STEERING
- preserve V2 one-thumb X-only POSITION [-1,+1]
- pointer lift/cancel -> POSITION 0 self-centering
- keep the current ~35-degree product bridge
- freeze active gesture geometry instead of measuring layout every move
- replace generic joystick/rack presentation with a shallow projected panoramic wheel
- internal asymmetric wheel/index rotates; outer input geometry stays fixed

PEDALS
- independent analog THROTTLE and BRAKE
- pointer-down position = local 0
- relative upward travel -> 0..1
- freeze origin/travel geometry at pointer-down
- stable outer acquisition wells + animated inner pedal mechanisms
- independent pointer ownership and multitouch
- preserve simultaneous throttle + brake input

D/R
- compact state selector
- allow D<->R while throttle is held and at any speed for now
- no Neutral/release/speed interlocks unless real driving proves a need
- one input-layer direction state; UI renders it rather than owning another copy
```

Owner decisions locked during preparation:

- preserve simultaneous analog throttle + brake input;
- current M6 controller remains brake-priority when both values are non-zero; physical combined-pedal consequences are a later explicit physics/handling question rather than a hidden control-stage change;
- default hand layout is left-thumb steering / right-thumb longitudinal controls;
- landscape is the first owner-polished driving surface; portrait follows as a separate responsive substage using identical semantics;
- D/R remains permissive under throttle and at any speed;
- supplied Concept 4 and V1/V2 screenshots are design evidence/donors, not pixel-perfect specifications.

Grounding refinements that must survive implementation:

- product entry is `product-main.ts -> await import("./main.js") -> installProductControls()`; mobile driving belongs to normal `main`/host/input source, not `product-controls` or a second experimental entrypoint;
- input timelines should receive real pointer events, while visual HUD writes are coalesced to at most one `requestAnimationFrame` so presentation does not become a pointer-frequency DOM workload;
- command-coupled wheel/pedal motion should update directly (at most the RAF coalescing delay); easing belongs to discrete emphasis/lift/dim/selector transitions, not to the actual command indication;
- visual state callbacks must be **generation-scoped** so disposal of a stale async host cannot overwrite a newer HUD;
- restart should detach/disable the previous visual sink before old-host disposal, then bind a fresh neutral state (`steering 0`, `throttle 0`, `brake 0`, `D`) to the new generation;
- ordinary layout animation uses frozen gesture geometry; structural orientation/fullscreen transitions may explicitly fail closed for continuous gestures rather than silently remapping a held command;
- no live mobile `backdrop-filter`, large blur/glow or other compositing work that would reopen the accepted A53 performance bottleneck.

This is a product target, not a claim that any previous V3 implementation is accepted.

## 4. V3 / donor classification

The V3 product concept was not owner-rejected. The first public device gate failed before meaningful driving with:

```text
Driving V3 pedal reset: expected source fragment not found
```

The failure class was brittle public delivery based on text surgery against compiled runtime. It is evidence against that harness architecture, not against analog pedals or the steering concept.

Historical source remains available for selective donor use:

```text
db61b661...  V3.1 analog foundation
e651209f...  V3.1 presentation
c0b3ed22...  V3.1 short-landscape hardening
8736a2b6...  later post-rollback rebuild tip
```

The later rebuild's separated `PointerAnalogDriveAdapter` and hardened lifecycle tests are validated donor mechanisms worth mining selectively: frozen pedal origin/travel, source-specific release, independent pedal ownership, capture-failure fail-closed behavior, multitouch and D/R re-sign under held throttle.

Do not restore any donor wholesale merely because it is newer. Its direct presentation callbacks and surrounding host/UI integration are not current authority.

## 5. Repository cleanup boundary

The repository still has excessive historical branch refs. Cleanup policy:

1. `main` remains the only long-lived private product authority.
2. `work/foundation-cleanup` is the only active private lane during this transaction.
3. Old `work/*`, `candidate/*`, `repair/*`, `noop-*` and redundant `checkpoint/*` refs are historical only.
4. Valuable old branch tips have been captured in retained archive/history before deletion.
5. After the clean foundation is validated and promoted, retire the cleanup lane and redundant historical branch names rather than keeping parallel authorities.
6. Future `checkpoint/*` refs require a concrete rollback/evidence reason and should be retired when safely ancestral to retained authority/archive.

The public repository remains an artifact/release surface. Keep `release/r0` immutable and `release/friends-r1` as the moving Friends line. Public checkpoint pruning is lower priority than private source cleanup and must not weaken rollback evidence.

## 6. Grounding / validation evidence

Private GitHub Actions remain blocked by the account's private Actions billing/spending limit. Do not add workaround workflows; this is infrastructure, not product failure.

The owner-provided `work/foundation-cleanup` ZIP was independently reconstructed into Git tree `885bb4885d1384af3de2b0a189965303225ff49a`, exactly matching the branch tree at the download point before the later grounding-document commits.

Supplemental local evidence on that exact runtime source:

- documentation link audit: PASS;
- all 157 `.mjs` tool/test files: Node syntax PASS;
- dependency-free steering/longitudinal subset compiled with noncanonical TypeScript 5.8.3: PASS;
- focused steering-position / pointer-steering / longitudinal / keyboard-longitudinal / pointer-vehicle baseline: **29/29 PASS**;
- static Steering V2 + mobile UI contracts: **11/11 PASS**;
- direct source inspection confirms the current controller can represent simultaneous throttle+brake but M6 drive application is brake-priority;
- direct source inspection confirms V2 ordinary pointer release neutralizes through `POSITION 0`;
- direct source inspection confirms current `product-main.ts` imports normal `main` before product control injection;
- donor review confirms the later separated analog-drive adapter and its lifecycle tests are reusable evidence, not product authority.

Rendered frontend QA is **not** claimed in this grounding pass. Browser plugin is not available here; Playwright is not installed; direct headless Chromium cannot initialize its rendering backend in this environment. A temporary non-product control-lab was used only to reason about geometry/DOM ownership and was not committed or treated as visual proof.

Supplemental Node22/TS5.8 evidence is not canonical release proof.

A direct `npm ci` attempt using the known noncanonical `--force` execution path reached the expected Node/npm dev-engine warnings and then stalled on unavailable package retrieval; it did not expose a new source failure.

Before `main` is advanced through this foundation transaction, still require the exact repository toolchain boundary:

- Node 24.16.0;
- npm 11.13.x;
- lockfile dependencies;
- TypeScript/Vite versions pinned by the repository;
- real `box3d.js@0.0.2` coverage;
- `npm run check`;
- Friends/portable build checks;
- exact source/artifact/rollback identity for publication.

Rendered smoke is required before owner-facing UI handoff, but not to prove this docs-only cleanup transaction changed no runtime.

## 7. Recursive grounding result

The final preparation used an adversarial recursive loop:

1. **Authority falsification** — exact source/refs/PR/public fallback.
2. **Behavior falsification** — V2 steering semantics, longitudinal capability and physics boundary.
3. **Donor falsification** — keep only mechanisms supported by source/tests; reject wholesale V3 recovery.
4. **Lifecycle falsification** — capture failure, cancellation, visibility, disposal, restart and stale async generations.
5. **UI/performance falsification** — hitbox truth, gesture geometry, render cadence, compositing cost and responsive thumb zones.
6. **Convergence replay** — restart the critical checks after each material correction.

Material corrections found by the loop were fed back into the target/router before replay. The final two critical replay passes produced no new source/authority contradiction. The remaining unknowns are deliberately deferred because they require implementation/render/device evidence: exact wheel perspective/rotation feel, pedal travel tuning, final landscape spacing, portrait adaptation and physical combined-pedal behavior.

Those are implementation/owner-feel questions, not missing preparation facts.

## 8. Next sequence — implementation only after M0 promotion boundary

### M0 — close/promo foundation

1. run the canonical repository gate in an exact environment when available;
2. promote the cleanup foundation to `main` only after that gate;
3. retire the cleanup lane and stale branch refs that no longer provide unique rollback value.

### M1 — deterministic analog core

- extend the normal longitudinal timeline with analog source events;
- implement a separated analog pedal + D/R adapter using donor mechanisms selectively;
- keep current V2 steering intact;
- generation-scope presentation callbacks from the start;
- add focused tests before any visual redesign.

### M2 — landscape steering instrument

- semanticize/rename the steering adapter if useful;
- freeze steering geometry for the active gesture while preserving V2 `POSITION` behavior;
- implement the projected panoramic wheel with an asymmetric rotation index;
- value-linked visual rotation has no multi-frame easing lag.

### M3 — landscape pedal instrument + D/R

- fixed acquisition wells + internal mechanical pedal faces;
- presentation state coalesced to RAF;
- compact direction selector outside pedal drag paths;
- remove/retire obsolete binary mobile-drive presentation once replacement is proven.

### M4 — owner landscape feel gate

This is the first intended owner interruption. Judge steering and pedals independently through natural driving on the Galaxy A53 in normal Chrome/fullscreen as relevant.

### M5 — portrait adaptation

Preserve identical semantics; redesign spatial composition for narrow/tall use instead of shrinking landscape blindly.

### M6 — normal product integration / Friends candidate

Rendered QA, canonical build, exact artifact/source/rollback identity and final device check.

No additional general takeover/recovery/grounding loop is planned before M1. If work is restarted in a fresh conversation, read the files in the router order and continue from this boundary rather than reconstructing V3 history again.
