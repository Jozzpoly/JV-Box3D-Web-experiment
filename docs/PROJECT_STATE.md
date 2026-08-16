# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING OWNER-DEVICE ALPHA LIVE / TECHNICAL POLISH AUDIT COMPLETE / P1.0 READY`

## 1. Authority

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/mobile-driving-controls
live mobile-driving runtime source: d96e393c466aa41c6436c12bcb1b4ab1861828b0
runtime implementation checkpoint: f56be8c85ea2b26533eee89c050b1b55cf21ec4b
public Friends owner-device alpha: release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
public pre-alpha rollback: checkpoint/pages-before-mobile-driving-2026-08-16@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` remains unchanged. `work/mobile-driving-controls` remains the only active lane ahead of it.

Git/current source, built artifact evidence and direct owner observation outrank this file.

## 2. Current read order

For the next mobile-driving work read:

1. `AGENTS.md`;
2. this file;
3. `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for current owner intent;
4. `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md` for verified implementation topology/root causes;
5. source/tests only for the active sub-slice.

`docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md` is historical/design foundation and is superseded where the post-alpha grounding changes a rule.

## 3. Alpha proof is real

The mobile-driving alpha is not pending validation anymore.

Canonical Windows build evidence exists with Node 24.16.0 / npm 11.17.0 / TypeScript 7.0.2 / Vite 8.1.5 / real box3d.js@0.0.2. The normal Vite bundle and Friends artifact validation passed after release-byte preservation was corrected.

Public artifact:

```text
release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
source recorded by build manifest: d96e393c466aa41c6436c12bcb1b4ab1861828b0
Pages status: built
```

Owner directly confirmed the public build works in desktop browser and on Samsung Galaxy A53 / Chrome and supplied portrait, browser-chrome landscape and fullscreen screenshots.

This is owner-device alpha proof, not final UX acceptance.

## 4. Protected product foundation

Preserve unless explicitly changed:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 render-1x performance foundation;
- Camera Manual Rig V1;
- Fullscreen V1 capability;
- deterministic timestamped input architecture;
- independent throttle/brake values and multitouch ownership;
- D/R state authority and permissive D<->R-under-throttle behavior;
- pointer capture/non-stealing/fail-closed lifecycle behavior;
- generation-safe presentation reset and RAF coalescing;
- temporary approximately +/-35-degree steering bridge;
- JURE boundary for final rig/steering geometry and final handling.

Do not restart V3/V3.1 recovery, camera recovery, release-harness work or compiled-runtime patching.

## 5. Owner-device product verdict

What works:

- analog throttle/brake are real and materially better than binary drive buttons;
- analog control architecture is worth polishing, not replacing;
- projected real-wheel metaphor is promising enough that the owner instinctively tries to rotate it as a physical wheel;
- desktop/phone/scan/fullscreen product foundation remains usable.

Not accepted:

- current mobile HUD composition;
- current relative-from-pointer-down pedal mapping;
- progress/fill pedal feedback;
- current pedal industrial design;
- visible steering background/shell;
- current rim/spoke geometry;
- X-only steering as necessarily final gesture;
- final portrait/landscape layout.

Current exact owner target is `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`.

## 6. Preparatory technical audit — key verified findings

Full evidence: `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md`.

### A. Production CSS authority is currently wrong

The source directly links V2/current mobile CSS from `index.html`, while `main.ts` imports base `style.css` through the dynamically imported main chunk.

The live Vite artifact therefore contains:

```text
index-C38K2YRz.css -> V2 + current mobile-driving styles
main-aKpBoyEj.css  -> base style.css, loaded as dependency of dynamic main.js
```

Vite's preload helper appends the main CSS link later. Equal-specificity historical base rules can therefore override current mobile rules in the live product.

Observed consequences include:

- old circular blue steering shell partially returning around the new wheel mechanism;
- old/lower `.scene-actions` placement competing with pedals;
- intended V2 action-rail z-index/placement not being a reliable live guarantee.

This is a production cascade regression, not merely a disliked new design choice.

### B. Root viewport can clip short landscape

Base CSS combines:

```text
.scene-panel { height: 100svh; min-height: 420px; overflow: hidden; }
body { overflow: hidden; }
```

If usable short-landscape viewport height is below 420 CSS px, the scene can remain taller than the visible browser viewport and its lower portion can be clipped.

The renderer uses `canvas.clientWidth/clientHeight` for render size, aspect and responsive camera distance, so hidden CSS height can also make camera framing describe space the user cannot actually see.

### C. HUD overlays have no shared composition owner

Header, toolbar, actions, readouts, mobile controls and Debug panel are independently absolutely positioned sibling overlays. Their local media rules do not reserve space from one another.

The correct P1 direction is coordinated product zones, not another set of unrelated offsets.

### D. Input seams are healthy

`CleanBrowserHost` and `F4VehicleHost` keep mobile input adapters/timelines separate from M6 physics and from UI presentation.

This allows:

- P1 layout work without input/physics changes;
- P2 pedal mapping change without presentation rewrite;
- P3 pedal visuals through existing `--pedal-value` state;
- P5 rotational steering as an isolated mapping experiment.

### E. Pedal mapping change is narrow but pointer-down semantics must change

Current adapter stores only target height + pointer-down origin and emits local 0% until movement.

Absolute position needs frozen `{top,height}` or equivalent geometry and must enqueue the initial position-derived value immediately after successful pointer capture.

Ownership/lifecycle/D-R logic should remain intact.

### F. Pedal visual metaphor currently contains conflicting cues

The progress fill is directly driven by value, while the pedal face only moves up to 9 px. Merely touching the pedal lifts/grows the entire mechanism, which can visually oppose the desired deeper depression at higher command.

P3 needs separate value-pose and contact-emphasis layers.

### G. Spoke disconnect is real geometry, not perception

The internal wheel is 214 px, rim inset/border gives roughly 82 px inner radius, while spokes are 70/61 px. They physically stop short of the rim by roughly 12–21 px.

### H. Static UI tests are not rendered truth

Some input/lifecycle tests remain valuable. Some UI regex tests are stale and still assert old binary/circular-control implementation details. Source stylesheet-order tests also missed the production CSS split/order problem.

Do not make product code satisfy stale tests. Classify UI tests KEEP / UPDATE / DELETE per slice and rely on rendered/device evidence for clipping, overlap and visual feel.

## 7. Refined work sequence

Do not jump directly to broad P1 layout tuning. P1 is now subdivided.

### P1.0 — production CSS authority

First restore deterministic built style ownership/order. No control redesign or input change.

Then build and inspect the real production artifact on desktop + A53 portrait/browser-landscape/fullscreen and Debug-open state.

This is a mandatory pause because correcting the cascade may materially change the steering shell and action rail before deliberate redesign.

### P1.1 — root viewport geometry

Resolve `100svh` / `min-height:420px` / hidden-overflow clipping and prove canvas client geometry matches the visible scene.

No local pedal offset workaround.

### P1.2 — one mobile HUD composition owner

Establish explicit minimal zones for top navigation/info, actions, left steering, right longitudinal controls, central world visibility and Debug overlay.

### P1.3 — action/navigation policy

Keep Camera/Reset/Debug/fullscreen/location controls reachable without sharing sustained pedal drag paths. Browser-chrome landscape and true fullscreen must both be evaluated.

### P1.4 — driving-zone sizing/spacing

Only after P1.0–P1.3 tune steering/pedal placement and central visible world area. Command semantics remain unchanged.

### P1.5 — portrait sanity

Keep portrait usable; final portrait design remains P7.

### P2 — absolute pedal input

Split into pure mapping, immediate pointer-down demand, lifecycle/ownership preservation and A53 tuning.

### P3 — mechanical pedal motion

Remove progress-meter authority, implement one lightweight physical depression pose, separate contact emphasis, then owner-device judge before styling overhaul.

### P4 — steering visual cleanup

First evaluate the corrected P1.0 render. Then make acquisition region visually transparent and repair wheel geometry/material/perspective while keeping X-only input.

### P5 — rotational steering experiment

First pure ellipse-normalized/unwrapped angle math, then isolated adapter experiment, then A/B against X-only on A53. Do not delete the baseline before owner proof.

### P6 — wheel/pedal industrial design + feel

Refine the accepted mechanisms together.

### P7 — portrait-specific composition

Design tall/narrow layout intentionally around proven mechanics.

## 8. Validation philosophy for polish

Use the smallest proof matching the changed risk:

```text
P1 layout      -> production build + rendered viewport matrix + owner device
P2 input       -> focused mapping/ownership/lifecycle tests + owner driving
P3/P4 visuals  -> source sanity + rendered/device judgement
P5 gesture     -> focused math/lifecycle tests + owner A/B driving
P6/P7          -> rendered/device proof + performance sanity
```

Full repository tests are not the routine gate for every visual slice, particularly while stale UI regex tests exist. Full release/foundation validation remains appropriate at promotion boundaries.

## 9. Stop conditions

Stop and localize when:

- layout work starts changing input/physics;
- pedal mapping work changes D/R or timeline arbitration;
- animation moves active command geometry;
- rotation work requires deleting X-only before owner comparison;
- clipping persists after root viewport repair;
- built CSS order still differs from intended source ownership after P1.0;
- rendered evidence contradicts static tests;
- one local defect starts motivating a whole controls rewrite.

## 10. Next boundary

This preparatory audit changes documentation only.

The next justified implementation is:

**P1.0 — production CSS authority.**

Do not start by moving pedals, redesigning the wheel or changing input semantics. First make the live production artifact render the intended current source hierarchy deterministically, then re-observe the real UI before P1.1/P1.2.
