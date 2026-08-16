# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `P1 FOUNDATION OWNER-ACCEPTED / MAIN PROMOTION PREPARATION ACTIVE`

## 1. Current authority and exact accepted evidence

```text
accepted private authority:
  main@f8eb0908f5934aed2d504f34ce483a02754039ec

single active work lane:
  work/mobile-driving-controls

owner-tested P1 product source:
  c9b5990b226685abe35851fc5e9496323096ecf7

current public Friends artifact:
  release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f

public rollback immediately before P1 foundation:
  checkpoint/pages-before-p1-foundation-2026-08-16@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf

immutable public fallback:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` has not yet been promoted. `work/mobile-driving-controls` is the only ordinary work lane ahead of it.

The active lane is a linear descendant of `main`; the pre-promotion comparison on 2026-08-16 reported `ahead_by=124`, `behind_by=0` at product source `c9b5990b...`. Promotion must remain an ordinary fast-forward; do not rewrite `main`.

Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank this summary.

## 2. Product status now

The P1 foundation is a real public/browser/device checkpoint, not a source-only candidate.

Implemented and published from exact private source `c9b5990b...`:

- **P1.0a — deterministic CSS entry authority**: production CSS is entry-linked; dynamic JS no longer owns a later competing CSS preload;
- **P1.0b — current mobile CSS ownership**: the superseded V2 presentation stylesheet was removed from the active source/cascade and the still-needed focus/action/debug safety rules were transferred to the current owner;
- **P1.1a — short-viewport floor removal**: mobile `.scene-panel` can shrink below the historical desktop `420px` floor;
- **R0.2 release purity**: the moving Friends root no longer carries `jv-live-performance.js` or another historical executable public overlay.

The public release was assembled with the approved JSPREV2 runtime scan recovered from exact Git object bytes. The preserved scan index remains exactly 7256 bytes with SHA-256 `64a2cdf8ef30f245544d90786528e867186f0740c37aac415a5b8b0c4d7b885e`.

## 3. Validation truth

### 3.1 Canonical P1 foundation gate — PASS

Exact source: `c9b5990b226685abe35851fc5e9496323096ecf7`.

Canonical Windows evidence under Node `24.16.0` / npm `11.17.0` showed:

- focused P1/input/lifecycle suite: **48/48 PASS**;
- TypeScript `tsc --noEmit`: **PASS**;
- normal Vite `build:bundle`: **PASS**;
- clean source before/after install, focused gate and build: **PASS**;
- every emitted CSS asset linked directly by the entry HTML: **PASS**;
- late JS-owned CSS references: **NONE**;
- linked cascade base -> current mobile: **PASS**;
- mobile scene `min-height:0` override present in production CSS: **PASS**.

### 3.2 Friends release gate — PASS

The exact P1 source was rebuilt and validated before publication.

`check:friends-r1` passed its portable/static/runtime-assets/vehicle/path/privacy/network/build-identity/Friends checks. The candidate contained 57 static files and the exact approved JSPREV2 receipt and owner vehicle. The project-path HTTP smoke passed.

The staged public Git tree was byte-compared with the candidate before commit. Publication was an ordinary non-force fast-forward from `7766f711...` to public commit `a325c279...`.

The bounded live Pages probe verified:

- live build manifest source = exact `c9b5990b...`;
- live scan index = exact approved bytes;
- old `jv-live-performance.js` = absent.

### 3.3 Owner-device gate — ACCEPTED FOR P1 FOUNDATION

On 2026-08-16 the owner directly tested the current public build on desktop and Samsung Galaxy A53 / Chrome, including portrait, landscape, browser-chrome and fullscreen states.

Owner verdict for this boundary:

- steering works well;
- pedals work well enough as the current foundation;
- the worst previous presentation problems are resolved sufficiently to close this stage;
- current pedal design and pedal interaction are explicitly **not final** and will be changed substantially in later polish;
- the current result is satisfactory enough to begin preparation for promotion to `main`.

This acceptance does not claim final HUD composition, pedal semantics/design, steering visual design, rotational steering, rig geometry or handling.

## 4. Full repository suite truth

Do not conflate the focused P1 gate with a complete repository-suite PASS.

The earlier canonical full `npm run check` at R0.1 executed the real full suite and produced **439 PASS / 3 FAIL**. Classification found:

1. one import-format regex contract that did not reflect product behavior — corrected;
2. one longitudinal timeline expectation whose arithmetic was wrong — corrected;
3. one temporary R1 bridge test that required left/right peak-speed residual `<0.05 m/s` even though the accepted R1 bridge explicitly permits residual asymmetry and does not claim final handling.

The third assertion was removed during main-promotion preparation without changing vehicle/physics source. The test still protects the durable R1 invariants: topology, neutral straightness, maintained contacts, correct left/right turn direction and coherent steering geometry.

**A fresh canonical full `npm run check` on the final promotion candidate is still required before `main` may be called suite-green.**

Do not alter product physics merely to make provisional handling equations green.

## 5. Protected product foundation

Preserve through main preparation and later polish:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- owner-validated A53 render-1x performance foundation;
- Camera Manual Rig V1;
- Fullscreen V1;
- fixed-step/timestamped input architecture;
- independent throttle/brake multitouch ownership;
- D/R state and permissive D<->R-under-throttle behavior;
- fail-closed capture/lifecycle release;
- generation-safe UI presentation / <=1 RAF coalescing;
- current X-only steering POSITION control as the working reference;
- current temporary steering/drive bridge as a product intermediate only;
- JURE boundary for final authored rig/steering geometry and final handling.

Presentation cleanup is not justification for another input or physics rewrite.

## 6. Main-promotion preparation boundary

Feature/polish implementation is paused while this boundary is active.

Before promoting `work/mobile-driving-controls` to `main`, require all of the following:

1. **Current-state documentation truth**
   - `AGENTS.md`, `README.md`, `docs/PROJECT_STATE.md`, `AI_PROJECT_MEMORY.md`, `docs/ARCHITECTURE.md` and `docs/OWNER_CHECKPOINTS.md` must not instruct a future agent from superseded live refs or pending stages;
   - historical dated audits may remain historical; do not rewrite them to pretend they were authored after later fixes.

2. **Runtime-equivalence audit**
   - compare the final promotion candidate with owner-tested product source `c9b5990b...`;
   - any post-`c9b5990b` changes must be classified;
   - owner-device acceptance transfers only if product/runtime-bearing files are unchanged or separately revalidated.

3. **Canonical source gate**
   - fresh Windows clone;
   - exact Node/npm toolchain;
   - `npm ci`;
   - exact full `npm run check` with preserved output;
   - normal production `build:bundle` and clean-tree verification.

4. **Dependency advisory triage**
   - canonical installs currently report `1 high severity vulnerability` without naming it in the preserved short output;
   - capture `npm audit --json` for classification;
   - determine whether it affects production/runtime or only development/build tooling;
   - do **not** run `npm audit fix` blindly and do not change dependencies merely to clear a badge.

5. **Git promotion safety**
   - resolve live `main` and active-lane refs immediately before promotion;
   - candidate must remain a descendant of current `main` and `main` must not have moved unexpectedly;
   - create a concrete pre-promotion rollback/evidence ref for old `main` if promotion is approved;
   - promotion is fast-forward only, no force, no merge-by-accident.

If any requirement fails, stop and localize it. Do not broaden the scope into new product work.

## 7. Documentation classification

Current truth documents:

- `AGENTS.md` — operating contract;
- this file — moving project state;
- `AI_PROJECT_MEMORY.md` — compact router;
- `docs/ARCHITECTURE.md` — stable boundaries;
- `docs/OWNER_CHECKPOINTS.md` — scoped owner-visible acceptance.

Durable owner-intent contract:

- `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`.

Dated readiness/technical audits are historical evidence. Their descriptions of pre-P1 CSS contamination, old public overlay or pending R0.1 are not current-state instructions after this checkpoint.

## 8. Development after a successful main promotion

Do not resume feature work until the main-promotion boundary is explicitly closed.

The intended polish direction remains:

1. P1.2 coordinated mobile HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals using frozen geometry and immediate pointer-down demand;
6. P3 mechanical pedal depression rather than progress-meter authority;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B experiment against the working X-only reference;
9. P6 joint wheel/pedal industrial design and feel;
10. P7 intentional portrait composition.

## 9. Stop conditions

Stop and investigate if:

- a document upgrades planned or focused validation into a full-suite claim;
- owner-device acceptance is generalized to final physics/rig/handling;
- a promotion candidate changes runtime after the accepted `c9b5990b...` surface without renewed evidence;
- dependency maintenance starts changing the lockfile without a specific advisory/reachability reason;
- `main` moves or promotion ceases to be a clean fast-forward;
- public artifact state is mistaken for private source authority;
- feature work resumes before the promotion boundary is closed.

## 10. Exact next action

Finish the current-state documentation audit, then produce **one exact Main Promotion Gate** for the final active-lane candidate.

That gate must prove the complete `npm run check`, production build, runtime-equivalence boundary and dependency-advisory classification. If it is green and the owner approves promotion, only then fast-forward `main`.
