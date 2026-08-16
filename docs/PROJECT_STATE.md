# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING OWNER-DEVICE ALPHA LIVE / R0.1 SOURCE HYGIENE IMPLEMENTED / CANONICAL FULL CHECK PENDING`

## 1. Authority

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/mobile-driving-controls
live mobile-driving product source: d96e393c466aa41c6436c12bcb1b4ab1861828b0
runtime implementation checkpoint: f56be8c85ea2b26533eee89c050b1b55cf21ec4b
public Friends owner-device alpha: release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
public pre-alpha rollback: checkpoint/pages-before-mobile-driving-2026-08-16@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` remains unchanged. Only `work/mobile-driving-controls` is active ahead of it.

Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank summaries.

## 2. Read order for the next work

1. `AGENTS.md`;
2. this file;
3. `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` — owner intent;
4. `docs/MOBILE_DRIVING_ROADMAP_READINESS_AUDIT_2026-08-16.md` — pre-roadmap adversarial audit;
5. `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md` — deeper source/layout/input findings when needed;
6. source/tests for the active sub-slice.

Do not restart takeover, V3/V3.1 recovery, camera recovery, release-harness archaeology, compiled-runtime patching or final rig/handling work.

## 3. What the current alpha actually proves

The public owner-device alpha is real:

- exact private source identity is `d96e393c...`;
- canonical Windows `npm ci` evidence exists under Node 24.16.0 / npm 11.17.0 / TS 7.0.2 / Vite 8.1.5 / real `box3d.js@0.0.2`;
- canonical TypeScript typecheck passed;
- third-party verification passed;
- normal Vite production bundle was built;
- owner M6 full-rig generation passed;
- static portable/runtime/vehicle/path/privacy/network/build-identity validation passed;
- the initial preserved-scan candidate exposed a receipt/manifest byte mismatch and was not published;
- the release-layer byte problem was subsequently corrected and public `release/friends-r1@7766f711...` was published;
- Pages is built and the owner directly drove the result on desktop and Galaxy A53 / Chrome, including portrait/landscape/fullscreen states.

This proves a functioning browser/device alpha.

It does **not** prove that the complete repository unit-test suite passed for d96. The preserved Windows log explicitly ran `npm run typecheck` with `no unit-test suite`; the old suite also contained stale UI-regex tests inconsistent with the analog product DOM.

R0.1 has now reconciled those known stale mobile/UI test contracts in source. A new exact canonical `npm run check` execution is still required before the suite may be called green.

Do not upgrade typecheck/build/device proof into a `FULL npm run check PASS` claim without that execution evidence.

## 4. Protected product foundation

Preserve:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- owner-validated A53 render-1x performance foundation;
- Camera Manual Rig V1;
- Fullscreen V1;
- deterministic timestamped input architecture;
- independent throttle/brake multitouch ownership;
- D/R state and permissive D<->R-under-throttle behavior;
- fail-closed pointer/lifecycle handling;
- generation-safe presentation/RAF coalescing;
- current temporary steering bridge;
- JURE boundary for final rig/steering geometry and final handling.

No second hidden input/physics authority was found in the two preparatory audits. Presentation/release defects are not justification for another controls rewrite.

## 5. Current owner target

Exact owner intent is in:

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`

Key direction:

- fix mobile HUD clipping/competition first;
- pedals move to absolute frozen-geometry Y mapping after layout foundation;
- pedal magnitude should read as mechanical depression, not progress fill;
- preserve projected real-wheel concept but remove distracting shell and repair geometry;
- rotational steering is a later isolated A/B experiment; keep X-only until owner-proven replacement;
- final portrait composition follows proven mechanics rather than shrinking landscape.

## 6. Verified presentation/layout defects

### 6.1 Production CSS authority

Private source currently mixes:

```text
index.html -> mobile-driving-controls-v2.css
index.html -> mobile-driving-controls.css
main.ts    -> style.css
```

Vite emits the V2/current CSS in the entry chunk and base `style.css` as a dependency of dynamically imported `main.js`. The base CSS is appended later in the live artifact.

Historical equal-specificity rules can therefore override newer component intent.

Confirmed affected areas include:

- circular/blue steering shell reappearing around the new wheel;
- `.scene-actions` returning toward the lower driving region;
- action z-index ownership;
- generic `.mobile-control[data-active]` applying an outer active transform to new pedal targets;
- historical steering pseudo-elements/label rules surviving component generations.

P1.0 must remove competing ownership, not merely add stronger selectors.

### 6.2 Root viewport clipping

Current root contains:

```text
.scene-panel { height:100svh; min-height:420px; overflow:hidden; }
body { overflow:hidden; }
```

A short browser-chrome landscape viewport can therefore be smaller than the scene's enforced 420 px height and clip the lower product region.

The renderer derives projection/backing size/default responsive camera distance from `canvas.clientWidth/clientHeight`, so correct CSS scene geometry is the proper authority boundary.

### 6.3 No coordinated HUD layout owner

Header, toolbar, actions, readouts, driving controls and Debug panel are independent absolute siblings. Local offsets do not reserve space from one another.

After CSS/root repair, P1.2 must establish explicit minimal layout zones rather than accumulating more `top/right/bottom` patches.

### 6.4 Mixed responsive predicates

Base/current styles mix:

- coarse-pointer/hover media features;
- `max-width` mobile fallback;
- orientation/height breakpoints.

A narrow desktop browser is therefore not automatically equivalent to an A53 state. Rendered checks must distinguish narrow-desktop and coarse-pointer phone behavior or emulate the relevant media features.

## 7. Release/runtime authority finding

The live public root contains executable:

`jv-live-performance.js`

which is not in private source `index.html` and is recorded in `LIVE_BUILD.json` as a preserved performance overlay.

Normal root URL: effectively inert after parameter inspection.

Diagnostic/performance URLs can make it active:

- cap/replace global `devicePixelRatio` for `jvRenderScale`;
- patch WebGL draw methods for `jvPerfHud=1`;
- add a highest-z-index HUD;
- run a separate RAF sampler.

Private source already owns `jvRenderScale` and current performance-HUD instrumentation, so this is duplicated release-layer runtime authority.

**Do not preserve this overlay into the next Friends root candidate.** Future executable root behavior must come from private source. Static approved scan/data and necessary release metadata may still be preserved explicitly.

The existing owner-tested alpha does not need an emergency republish solely for this cleanup.

## 8. Validation semantics correction

### Static release gate

`check:friends-r1` and portable HTTP smoke prove:

- bytes/hashes;
- source/build identity;
- required runtime assets;
- approved scan/vehicle identity;
- project-path delivery;
- root index bytes.

They do not execute JavaScript or render the product in a browser.

### Browser execution gate

Must separately establish that the production artifact:

- executes its module graph;
- constructs DOM;
- applies intended CSS;
- initializes WebGL/product runtime;
- avoids fatal runtime/console failures.

### Owner-device gate

Separately judges layout, visibility, driving feel and device behavior.

Current alpha has owner-device proof. Future validation summaries must keep these classes explicit.

## 9. R0 — roadmap-readiness closure

### R0.1 — validation truth / test hygiene — SOURCE HYGIENE IMPLEMENTED; CANONICAL PROOF PENDING

The source-side reconciliation is complete without product/runtime changes.

#### KEEP

Behavioural coverage remains intact for:

- analog throttle/brake timeline integration;
- D/R held-throttle re-sign;
- independent multitouch ownership;
- second-pointer non-stealing;
- pointer-capture failure;
- pointercancel/lostpointercapture;
- visibility/pagehide/dispose release;
- steering POSITION/self-centering;
- frozen steering gesture geometry;
- orientation/fullscreen fail-closed lifecycle;
- generation monotonicity/stale callback rejection;
- RAF presentation coalescing;
- simultaneous pedal presentation state;
- legacy host pointer forwarding where that optional compatibility API still genuinely exists.

#### UPDATE

`tests/mobile-ui-contract.test.mjs` now protects current durable product semantics only:

- viewport-fit coverage without disabling browser zoom;
- exactly one owner-facing steering surface;
- exactly two owner-facing analog pedals, BRAKE and THROTTLE;
- one D/R selector;
- no legacy `data-pointer-control` binary buttons in product DOM;
- slider/accessibility semantics without pinning visual geometry;
- Debug starts closed/recoverable.

`tests/mobile-driving-integration-contract.test.mjs` now protects:

- typed analog controls + generation-scoped presentation wiring;
- owner-facing analog path rather than legacy binary product wiring;
- semantic BRAKE-before-THROTTLE DOM order;
- presentation-generation invalidation before old host disposal.

It no longer asserts the historical V2/current stylesheet order or visual implementation details that P1.0 is explicitly meant to replace.

`tests/toolchain-contract.test.mjs` now also pins validation truth:

- `npm test` is `node tools/run-tests.mjs`;
- `npm run check` includes typecheck + complete test runner + docs + third-party;
- default `tools/run-tests.mjs` execution discovers every top-level `tests/*.test.mjs` unless an explicit focused list is supplied.

#### DELETE

`tests/mobile-driving-controls-v2.test.mjs` was removed. It required the separate V2 stylesheet, hidden legacy binary steering targets, exact historical rack geometry and fixed Debug/action offsets. Those are superseded presentation implementation details and would directly force the wrong architecture back into P1.0.

#### Remaining R0.1 gate

Run **one exact canonical full `npm run check`** from the current active source and preserve the command/result log.

Until that run exists:

- R0.1 source hygiene = implemented;
- complete current suite = **NOT YET PROVEN GREEN**;
- P1.0 implementation remains blocked on this single proof boundary.

If the canonical suite fails, classify the exact failure before changing product source. Do not repair the product to satisfy a stale test.

### R0.2 — release-layer executable purity

Mandatory for the next owner-visible Friends publication:

- no historical executable JS/CSS inherited from public baseline;
- no `jv-live-performance.js` in root unless it becomes explicit private source (not currently needed);
- preserved release layer limited to approved static data/assets and explicit metadata/byte-preservation files;
- product source and preserved data/release layers recorded separately.

No separate public republish is required before private P1.0 work.

## 10. Main roadmap after canonical R0.1 proof

### P1.0 — production CSS authority

Split internally:

- **P1.0a** one deterministic source-controlled style-loading graph;
- **P1.0b** retire live V1/V2 component selectors that no longer own current controls;
- **P1.0c** build the real production artifact, inspect CSS ownership/chunks, ensure no release-layer executable overlay in the candidate, then render desktop/A53 states and pause for a new baseline.

Do not redesign pedal/steering semantics in P1.0.

### P1.1 — root viewport geometry

Resolve `svh/min-height/overflow` clipping and prove visible scene/canvas geometry.

### P1.2 — coordinated mobile HUD zones

One explicit composition for navigation/info, actions, steering, longitudinal controls, central world and Debug overlay.

### P1.3 — action/navigation policy

Camera/Reset/Debug/fullscreen/location remain reachable without pedal-drag competition.

### P1.4 — driving-zone sizing/spacing

Tune cluster placement only after the previous structural fixes.

### P1.5 — portrait sanity

Keep portrait usable; final intentional portrait design remains P7.

### P2

Absolute-position pedals in frozen geometry, immediate pointer-down demand, preserved ownership/lifecycle/D-R, then A53 tuning.

### P3

Mechanical pedal depression; no progress-meter authority; separate touch emphasis from value pose.

### P4

Steering visual cleanup after corrected cascade render: transparent acquisition zone, correct rim/spoke/hub geometry, lightweight material/depth.

### P5

Ellipse-normalized rotational steering experiment, kept isolated and A/B tested against working X-only.

### P6

Joint wheel/pedal industrial design and feel tuning.

### P7

Portrait-specific composition around proven mechanics.

## 11. Separate dependency flag

The inspected canonical `npm ci` output reported `1 high severity vulnerability` but did not identify the advisory in the captured evidence.

Do not run `npm audit fix` blindly and do not block P1 solely on this message. Before a broader stable/public release, triage the exact lockfile against current advisory data as a separate dependency-maintenance task.

## 12. Stop conditions

Stop and localize when:

- a validation summary claims a command not present in its execution log;
- static HTTP/package success is being called browser execution;
- a public root candidate contains executable JS/CSS not traceable to private source;
- CSS repair starts accumulating specificity/`!important` instead of removing competing ownership;
- stale UI tests start forcing obsolete binary/V2 UI back into source;
- viewport/layout work changes input/physics;
- animation changes authoritative gesture geometry;
- one presentation/release defect starts motivating a whole controls rewrite.

## 13. Exact next boundary

**Execute and preserve one canonical Windows `npm run check` for the reconciled current source.**

If green, R0.1 closes and the next implementation is **P1.0 — production CSS authority**.

Do not move pedals, redesign wheel visuals, change pedal mapping or prototype rotational steering before that proof boundary is closed.
