# AI project memory — JV Web

Updated: 2026-08-16
Status: `P1 FOUNDATION OWNER-ACCEPTED / MAIN PROMOTION PREPARATION ACTIVE`

This file is a compact router only. Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank it.

## Authority

- accepted private authority remains `main@f8eb0908f5934aed2d504f34ce483a02754039ec` until an explicit promotion occurs;
- only ordinary active work lane: `work/mobile-driving-controls`;
- exact owner-tested P1 product source: `c9b5990b226685abe35851fc5e9496323096ecf7`;
- current public Friends artifact: `release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- immediate public rollback: `checkpoint/pages-before-p1-foundation-2026-08-16@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

The active lane is a linear descendant of current `main`. Do not treat it as accepted private authority until the Main Promotion Gate is green and promotion is explicitly approved.

## Accepted P1 foundation

Exact source `c9b5990b...` has canonical Windows P1 evidence:

- 48/48 focused P1/input/lifecycle tests PASS;
- TypeScript typecheck PASS;
- normal Vite production build PASS;
- clean-tree checks PASS;
- emitted CSS entry-linked with no late JS-owned CSS;
- base -> current mobile cascade verified;
- mobile scene historical 420px floor removed in the production CSS.

The exact source was then published as public `a325c279...` through the Friends release gate:

- existing `check:friends-r1` PASS;
- exact approved JSPREV2 preserved from Git object bytes;
- candidate/staged Git tree byte equivalence verified;
- ordinary non-force fast-forward publication;
- live manifest source = `c9b5990b...`;
- live scan index exact;
- historical `jv-live-performance.js` absent.

Owner directly tested the resulting Pages build on desktop and Galaxy A53 / Chrome across portrait, landscape, browser-chrome and fullscreen states. Steering and pedals work; the worst previous presentation failures are resolved well enough to close P1 foundation. Pedal design/interaction and later HUD/steering polish remain explicitly open.

## Current task: prepare promotion to main

Feature/polish work is paused.

Read first:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. source/tests only as needed for the promotion audit.

Do not restart recovery, camera work, P1 layout implementation, pedal redesign or rotational steering while the promotion boundary is active.

### Remaining evidence gate

A historical canonical full `npm run check` produced 439 PASS / 3 FAIL. Two failures were proven stale/incorrect test expectations and corrected. The remaining R1 bridge failure required near-identical left/right peak speed even though the owner-accepted temporary bridge explicitly permits residual asymmetry and does not claim final handling; that overconstraint was removed in promotion preparation without changing vehicle physics.

**Do not yet claim the current complete suite is green.** One fresh canonical full `npm run check` on the final promotion candidate is required.

The final promotion gate must also:

- prove all post-`c9b5990b...` changes are non-runtime/test-doc preparation unless separately revalidated;
- run normal production `build:bundle`;
- preserve clean-tree evidence;
- capture `npm audit --json` and classify the currently reported `1 high severity vulnerability` instead of blindly fixing it;
- verify the candidate remains a clean descendant of live `main`.

If all are satisfactory and the owner approves, promotion is fast-forward only. Create a concrete rollback/evidence ref for pre-promotion `main`; no force push and no accidental merge commit.

## Protected boundaries

Preserve:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 render-1x performance foundation;
- Camera Manual Rig V1 and Fullscreen V1;
- timestamped/fixed-step input architecture;
- independent throttle/brake ownership and fail-closed lifecycle;
- D/R-under-throttle semantics;
- generation-safe UI presentation;
- current X-only steering POSITION control as working reference;
- temporary steering/drive bridge as product intermediate only;
- JURE boundary for final authored rig/steering geometry and final handling.

## Validation classes

Keep separate:

1. source/unit/type checks;
2. build/artifact/static HTTP checks;
3. browser execution/render proof;
4. owner-device/feel judgement.

A focused suite is not a full-suite pass. A static Friends validator is not browser execution. Owner acceptance of current steering/pedals is not acceptance of final pedal design, final steering physics or final rig truth.

## Current documentation interpretation

Current truth:

- `AGENTS.md`;
- `docs/PROJECT_STATE.md`;
- this router;
- `docs/ARCHITECTURE.md`;
- `docs/OWNER_CHECKPOINTS.md`.

Owner-intent authority:

- `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`.

The dated mobile technical/readiness audits remain historical evidence. Their pre-P1 statements about V2 CSS, clipping cause, old public runtime overlay or pending R0.1 must not be treated as current state after the accepted P1 checkpoint.

## Development after main promotion

Resume only after the promotion boundary closes:

1. P1.2 coordinated HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals;
6. P3 mechanical pedal depression;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B experiment;
9. P6 joint wheel/pedal design + feel;
10. P7 intentional portrait composition.
