# JV Web — mobile driving polish technical audit

Date: 2026-08-16
Owner: Jozz
Classification: `PREPARATORY TECHNICAL AUDIT / NO PRODUCT IMPLEMENTATION`

This audit verifies the actual source/runtime surfaces behind the first live mobile-driving alpha before any polishing implementation begins.

It complements `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`:

- the grounding document is owner-intent authority;
- this document records verified technical structure, risks, fault boundaries and the proposed sub-slicing of implementation work.

The purpose is to prevent another layer of positional/UI patches based on assumptions. Findings below distinguish source fact, live-build fact, owner-rendered evidence and inference.

## 1. Exact evidence boundary

Live owner-device source:

```text
private runtime source: d96e393c466aa41c6436c12bcb1b4ab1861828b0
public Friends alpha: 7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
active lane before this audit: work/mobile-driving-controls@d15c7387236b922cb33347f4fed95f7ffa291bad
```

The live public build manifest records clean private source `d96e393c...`.

Owner-rendered evidence includes desktop and Samsung Galaxy A53 / Chrome screenshots in portrait, browser-chrome landscape and fullscreen landscape.

No `.ts`, `.css`, physics, renderer or public artifact is changed by this audit stage.

## 2. Verified runtime/UI ownership map

### 2.1 Startup and DOM ownership

`src/product-main.ts`:

1. configures product world/spawn;
2. dynamically imports `./main.js`;
3. installs build/performance instrumentation;
4. appends product controls through `installProductControls()`.

`src/main.ts` is the actual owner of the scene/HUD DOM scaffold. It creates sibling overlays inside one `.scene-panel`:

```text
canvas [data-scene]
scene-header
product-toolbar
scene-actions          Camera / Reset / Debug
scene-readouts         Speed / diagnostics
scene-help
mobile-controls
  mobile-steering-controls
  mobile-drive-controls
panel                  Debug sheet/panel
```

The layout is therefore not currently a coordinated HUD grid. It is a set of independently positioned siblings sharing the same scene rectangle.

### 2.2 Product toolbar ownership

`src/product-controls.ts` appends `.product-controls` into `[data-product-controls]` after `main.ts` has created the mount.

On mobile, base CSS hides all `.product-control-group` elements except the first location group. The fullscreen button is deliberately appended directly to `.product-controls`, outside those groups, so it remains visible beside the location buttons.

Fullscreen state changes update only button state/text. There is no current fullscreen-specific HUD layout coordinator.

### 2.3 Input/presentation ownership

`src/app/clean-browser-host.ts` owns composition of:

- keyboard steering;
- keyboard longitudinal input;
- pointer analog drive adapter;
- pointer steering position adapter;
- steering/longitudinal timelines;
- fixed-step clock.

`src/app/f4-vehicle-host.ts` passes those commands to the existing M6 vehicle path. It does not own mobile layout.

`src/mobile-driving-ui.ts` is presentation-only and receives already-resolved steering/pedal/direction state. It writes CSS custom properties/ARIA at at most one RAF commit.

This separation is healthy and should be preserved. Layout, pedal mapping, pedal presentation and steering gesture can be changed independently if the current boundaries are respected.

## 3. Critical finding A — production CSS cascade is not the source-intended cascade

Classification: `CONFIRMED LIVE BUILD FACT`

Source `index.html` explicitly links:

```text
mobile-driving-controls-v2.css
mobile-driving-controls.css
```

Meanwhile `src/main.ts` imports `./style.css`.

The production Vite build splits these into separate CSS chunks:

```text
index-C38K2YRz.css  -> V2 + current mobile-driving CSS
main-aKpBoyEj.css   -> base style.css
```

The public entry JS declares `main-aKpBoyEj.css` as a dependency of the dynamically imported `main-BmRke85_.js` and Vite's preload helper appends the stylesheet link to `<head>` before resolving the dynamic import.

Therefore the base `style.css` chunk is appended after the already-linked V2/current mobile stylesheet chunk.

Equal-specificity rules from the old base mobile styles can consequently override newer rules in the live build.

### 3.1 Concrete live consequences

The current source mobile-driving stylesheet intends:

```text
.mobile-steering-joystick
  width: 184..244 px portrait
  height: 76..96 px portrait
  border-radius: 24 px
  shallow projected-wheel shell
```

Base `style.css` still contains the old circular joystick rule:

```text
.mobile-steering-joystick
  width/height: 118..154 px
  border-radius: 50%
  circular radial blue background
```

Because the selector specificity is equal and the base CSS chunk is loaded later, the live alpha can receive the old circular shell while retaining the new internal wheel children.

This matches the owner screenshot: the new wheel mechanism is visibly inside a large circular blue container even though the current source stylesheet describes a shallow shell.

The owner's observation that the UI looked as if it had returned toward the old large circular control is therefore not only a design reaction. Part of it is a production cascade regression.

### 3.2 Action-rail consequence

`mobile-driving-controls-v2.css` intentionally moves `.scene-actions` to a top-right column so Camera/Reset/Debug stays away from the lower driving region.

Base `style.css` later redefines `.scene-actions` in mobile/landscape media queries at the lower-right/bottom region.

The same build-order mechanism can therefore pull the action rail back into the pedal zone in the live artifact.

This matches the supplied short-landscape screenshots where action buttons and pedals compete for the same region.

### 3.3 Z-index consequence

V2 source sets:

```text
.panel[data-open] z-index: 18
.scene-actions     z-index: 22
```

Base `style.css` later contains the shared overlay rule that gives `.scene-actions` z-index 4.

Because that later rule has equal selector specificity for `.scene-actions`, the intended `z-index:22` recoverability guarantee is not reliable in the production cascade.

A future rendered Debug-open check is required after cascade ownership is corrected.

### 3.4 Test blind spot

`tests/mobile-driving-integration-contract.test.mjs` verifies only that the two explicit source links occur in V2 -> current order inside `index.html`.

It does not validate the final production CSS ordering created by the dynamic `main.ts` import.

This test therefore passed the source-order idea while missing the production cascade inversion.

### Decision

Do not begin visual polishing on top of the current cascade.

The first implementation sub-slice must establish deterministic style ownership in the built artifact and prove the resulting rendered state before layout redesign continues.

## 4. Critical finding B — viewport root can be larger than the usable short-landscape viewport

Classification: `SOURCE FACT + HIGH-CONFIDENCE OWNER-EVIDENCE MATCH; RENDERED MEASUREMENT STILL REQUIRED`

Base CSS defines:

```text
body         min-height: 100vh; overflow: hidden
.product-shell min-height: 100svh
.scene-panel width: 100vw; height: 100svh; min-height: 420px; overflow: hidden
canvas       width: 100%; height: 100%
```

On a short landscape mobile viewport, browser/system chrome can reduce the usable CSS height below 420 px.

In that case:

1. `height:100svh` asks for the small viewport height;
2. `min-height:420px` refuses to let `.scene-panel` become shorter than 420 px;
3. body overflow is hidden;
4. the bottom portion of the panel can lie outside the visible browser viewport and be clipped.

This is a plausible direct mechanism for the owner's report that reversing/rotating the phone loses part of the usable screen/interface.

### Renderer coupling

`M6WorldRenderer.#resize()` uses `canvas.clientWidth/clientHeight` for:

- WebGL render-buffer dimensions;
- projection aspect ratio;
- responsive default chase-camera distance.

If the CSS canvas remains 420 px high while only a shorter portion is actually visible due outer viewport clipping, the camera can frame for geometry the user cannot see.

Therefore this is potentially both a HUD clipping problem and a camera framing/viewable-area mismatch, even though camera code itself is not the source of the layout defect.

### Decision

P1 must fix/validate root viewport geometry before tuning individual control offsets.

Do not compensate this failure by pushing pedals upward with another arbitrary `bottom` value.

## 5. Critical finding C — no single owner exists for mobile HUD composition

Classification: `CONFIRMED SOURCE FACT`

The following siblings are absolutely positioned independently:

```text
scene-header
product-toolbar
scene-actions
scene-readouts
mobile-controls
panel
```

There is no shared reserved-zone model or CSS grid defining their mutual exclusion.

This creates implicit collisions whenever viewport height/width changes.

### Current mobile ownership examples

- header: top safe-area;
- toolbar: top safe-area + 48 px;
- speed readout: top safe-area + 94 px;
- action rail: conflicting historical top/bottom rules across stylesheets;
- mobile driving controls: bottom safe-area;
- Debug panel: bottom sheet when open.

Each rule can be locally correct and the whole composition can still fail.

### Decision

After cascade and root-viewport repair, P1 should define coordinated zones/variables for:

- top information/navigation region;
- left driving acquisition zone;
- right driving acquisition zone;
- action/tool region;
- central world visibility region;
- Debug overlay state.

This does not require a framework or general layout engine. One explicit product layout is enough.

## 6. Pedal input audit

Classification: `CONFIRMED SOURCE FACT`

Current `PointerAnalogDriveAdapter` stores per active pointer:

```text
pointerId
pedal
target
originY
travelPx
value
```

Current mapping:

```text
travelPx = clamp(0.82 * targetHeight, 72, 132)
upwardDelta = originY - clientY
first 6 px = slop
relative upward travel -> 0..1
```

### 6.1 Important pointer-down behavior

Current pointer-down:

- reads only target height;
- captures pointer;
- records `originY = event.clientY`;
- sets internal value 0;
- tells presentation `value=0, active=true`;
- does **not** enqueue analog throttle/brake demand into the timeline until pointer movement changes the value.

That behavior is correct for the superseded local-zero model but directly incompatible with the new owner target.

For absolute-position pedals, pointer-down must compute and enqueue the initial value immediately after successful capture.

### 6.2 Geometry change required for P2

Current target contract exposes only:

```text
getBoundingClientRect() -> { height }
```

Absolute Y mapping requires frozen vertical position as well, at minimum:

```text
{ top, height }
```

or equivalent top/bottom bounds.

The new active geometry should store immutable pedal coordinates captured once at acquisition. It should not read layout again during pointermove.

### 6.3 What should remain untouched

Current adapter already correctly provides:

- independent brake/throttle pointer ownership;
- no pointer stealing;
- simultaneous brake + throttle;
- capture failure fail-closed;
- release/cancel/lost capture cleanup;
- blur/pagehide/visibility cleanup;
- orientation/fullscreen fail-closed release;
- D/R persistence;
- same-timestamp throttle re-sign under D/R change;
- per-pointer source IDs/timestamp integration.

P2 should preserve these mechanisms and replace the mapping seam only.

## 7. Pedal presentation audit

Classification: `CONFIRMED SOURCE FACT + OWNER REJECTION`

`MobileDrivingUi` already exposes clean presentation state:

```text
--pedal-value: 0..1
[data-active]
[data-peer-active]
```

That is a good seam. P3 does not need new physics or timeline state.

### 7.1 Current progress-meter behavior

Current CSS makes `.mobile-pedal-fill` height directly equal to `--pedal-value * 100%`.

That is exactly the progress-bar/level-meter feedback the owner rejected.

### 7.2 Current mechanical motion is too weak

The visible pedal face moves at most:

```text
translateY(value * 9px)
```

while the whole mechanism's touch-active state moves upward and grows:

```text
translateY(-6px) scale(1.075, 1.045)
```

This creates two different depth cues:

- command value moves the face slightly downward;
- merely being touched lifts/grows the mechanism toward the user.

For the intended real-pedal metaphor, value pose and contact emphasis need separate visual layers so active-touch emphasis cannot fight physical depression.

### Decision

P3 should use the existing `--pedal-value`, but replace the primary fill metaphor with a lightweight hinge/depression pose. Active-contact emphasis must be secondary and orthogonal to command depth.

## 8. Steering presentation audit

Classification: `CONFIRMED SOURCE FACT + PRODUCTION CASCADE CONTAMINATION`

Current DOM correctly separates:

```text
stable steering acquisition element
  wheel stage
    projected circular wheel
      rotating rotor
        rim
        asymmetric spokes
        hub
        marker
```

That structure is compatible with an invisible hitbox and visible mechanical wheel.

### 8.1 Spokes really are too short

Internal wheel size is 214 x 214 px.

Rim uses:

```text
inset: 12px
border: 13px
```

Approximate inner rim radius is therefore about 82 px.

Current primary spoke lengths are 70 px and the third is 61 px.

They consequently terminate roughly 12–21 px before the inner rim, which directly explains the owner-visible disconnected-spoke problem.

### 8.2 Current shell cannot be judged cleanly yet

The current source still gives the acquisition element a visible dark/blue shell, so even after fixing cascade the owner's desire for a visually transparent acquisition zone remains valid.

However the *size and circularity* visible in the live screenshot are contaminated by the later-loaded base V1 style. Steering P4 must therefore start only after P1.0 has restored deterministic production styling, so the actual current design can be evaluated before further redesign.

## 9. Steering gesture audit

Classification: `CURRENT X-ONLY PATH CONFIRMED HEALTHY; ROTATIONAL PATH NOT IMPLEMENTED`

Current steering adapter freezes only:

```text
left
width
```

and maps horizontal position through a 0.08 dead zone to signed `[-1,+1]`.

It already provides:

- immediate pointer-down command;
- frozen acquisition geometry;
- pointer capture;
- release to `POSITION 0`;
- viewport/fullscreen fail-closed neutralization;
- keyboard priority through the host arbitration path.

### 9.1 Why rotation is not a trivial replacement

A real rotational gesture needs stable two-dimensional geometry:

```text
centre X/Y
projected X/Y radii or equivalent local transform
pointer start angle
unwrapped angular delta
current command / visual steering angle
```

The visible wheel is a projected circle (`scaleY(.34)`) offset within its current hitbox. The child visual transform is deliberately decoupled from the acquisition geometry.

Reading the transformed child DOM continuously would reintroduce the presentation -> input feedback loop the current architecture successfully avoids.

### Decision

P5 should add an explicit frozen rotational-gesture geometry contract or equivalent pure mapping seam. It should not derive command geometry from a moving/animated child every pointermove.

The existing X-only adapter remains the comparison baseline until owner-device rotation wins.

## 10. Fullscreen/orientation audit

Classification: `CONFIRMED SOURCE FACT`

Current input behavior is deliberately safe:

- `orientationchange` releases active continuous controls;
- `fullscreenchange` releases pedals and self-centres steering;
- direction state survives those releases during the same host lifetime.

This means structural layout changes at orientation/fullscreen boundaries can be deliberate without silently remapping a held command.

Current CSS, however, has no single explicit fullscreen layout authority. Fullscreen changes mostly alter viewport dimensions plus the toolbar button label.

P1 can use CSS `:fullscreen`/viewport classes or a similarly narrow mechanism without changing input semantics.

## 11. Test audit — what is trustworthy and what is stale

### 11.1 Keep as high-value protection

Input/lifecycle tests are meaningful for the upcoming work:

- analog source integration;
- independent pedal ownership;
- capture failure fail-closed;
- pointercancel/lost capture;
- visibility/pagehide/orientation/fullscreen release;
- D/R held-throttle re-sign;
- frozen steering geometry;
- steering release-to-zero;
- generation-safe presentation;
- RAF coalescing.

### 11.2 Update when pedal semantics change

`tests/analog-drive.test.mjs` explicitly asserts the old relative-origin mapping and fake pedal geometry with height only.

For P2 it should be revised to prove the new absolute mapping while retaining the independent ownership/lifecycle tests.

### 11.3 Stale/historical UI tests

`tests/mobile-ui-contract.test.mjs` still expects historical binary pointer-control buttons and computes layout size from the old circular joystick/base CSS.

Those assertions are not current product truth.

`tests/mobile-driving-controls-v2.test.mjs` verifies V2 layout rules that the live production cascade can later override.

`tests/mobile-driving-integration-contract.test.mjs` checks source stylesheet order but not final bundled CSS order.

These regex tests must not be allowed to force product code back toward obsolete UI. Before P1 implementation they should be classified individually as:

```text
KEEP       real invariant
UPDATE     invariant remains but source form changed
DELETE     historical implementation assertion
```

### 11.4 Rendered truth remains necessary

No regex/static CSS test can prove:

- controls are actually visible;
- no clipping occurs;
- action rail and pedals do not overlap;
- fullscreen/browser-chrome layout is usable;
- the central world remains readable;
- mechanical depth reads correctly to the owner.

For these slices, source checks are support tooling. Rendered browser/device proof is the acceptance evidence.

## 12. Refined implementation decomposition

The broad P1–P7 sequence remains useful, but each packet is now split further so each problem receives enough attention.

## P1 — responsive HUD composition

### P1.0 — production CSS authority

Goal: make the rendered build obey one deterministic style order before redesigning coordinates.

Work:

- remove the current split ownership where base mobile CSS is dynamically appended after newer mobile layers;
- establish one deterministic stylesheet/import order in the normal source path;
- do not redesign wheel/pedal/input semantics in this sub-slice;
- build and inspect the resulting production artifact, not only dev/source CSS.

Proof:

- built CSS order/ownership inspection;
- desktop sanity;
- A53 portrait;
- A53 browser-chrome landscape both physical orientations;
- A53 fullscreen landscape;
- Debug-open reachability.

Stop and re-evaluate after this slice because it may materially change the visible wheel/action rail before any deliberate redesign.

### P1.1 — viewport root geometry

Goal: eliminate root clipping independently of control placement.

Work:

- resolve `100svh` / `min-height:420px` / hidden-overflow conflict;
- prove canvas/client viewport matches actual usable scene area;
- preserve camera behavior unless evidence shows a separate camera issue.

Proof:

- no hidden lower strip in short landscape;
- canvas/client dimensions match visible scene region;
- fullscreen transition remains healthy;
- no new scrolling trap.

### P1.2 — one owner for mobile layout zones

Goal: replace accidental sibling collisions with explicit composition.

Define a minimal coordinated layout for:

```text
top navigation/info
actions
left steering acquisition
right longitudinal acquisition
central world visibility
Debug overlay
```

Do not introduce a generic UI framework.

### P1.3 — action/navigation policy

Goal: keep Camera/Reset/Debug/fullscreen/location actions reachable without occupying pedal drag paths.

Treat browser-chrome short landscape and true fullscreen as separate rendered states.

### P1.4 — driving-zone sizing/spacing

Goal: tune only steering/pedal cluster placement and reserved central visibility after P1.0–P1.3 are stable.

No steering/pedal semantic redesign yet.

### P1.5 — portrait sanity boundary

P1 only guarantees portrait remains usable. Final portrait composition remains P7 after driving mechanics are proven.

## P2 — absolute pedal input

### P2.0 — pure absolute mapping

Create/test a pure Y -> `[0,1]` function from frozen `{top,height}` or equivalent geometry.

Variables to keep explicit for owner tuning:

- usable top/bottom margins;
- clamp behavior outside bounds;
- optional response curve.

Do not introduce a curve until linear absolute mapping has been device-tested.

### P2.1 — immediate pointer-down demand

After successful pointer capture:

- compute initial value from touch Y;
- enqueue timeline value immediately;
- present the same value immediately.

### P2.2 — preserve lifecycle/ownership

Re-run only relevant current ownership/lifecycle/D-R tests with new geometry.

### P2.3 — A53 feel tuning

Tune usable margins/curve only from real driving evidence.

## P3 — mechanical pedal motion

### P3.0 — remove progress-meter authority

Stop using vertical fill as the primary production magnitude cue.

### P3.1 — one physical depression pose

Use `--pedal-value` to drive a lightweight transform-based hinge/depth pose.

### P3.2 — separate contact emphasis

Keep `data-active` feedback on a wrapper/layer that does not contradict value-dependent depression.

### P3.3 — device judgement

Judge whether the pedal visually reads as being physically pressed before doing full styling work.

## P4 — steering visual cleanup

### P4.0 — evaluate corrected cascade output

Do not redesign against the contaminated live screenshot alone. First inspect P1.0 output.

### P4.1 — invisible/stable acquisition zone

Remove visible background plate while preserving a forgiving stable input region.

### P4.2 — geometric wheel correctness

Repair rim/spoke/hub connection and projected proportions.

### P4.3 — lightweight material/depth polish

No steering-gesture change yet.

## P5 — rotational steering gesture experiment

### P5.0 — pure ellipse-normalized angle math

Prove:

- projected ellipse normalization;
- angle wrapping/unwrapping;
- sign convention;
- command clamp;
- degenerate near-centre behavior.

### P5.1 — isolated adapter experiment

Keep X-only baseline available for direct comparison. Avoid rewriting host/physics.

### P5.2 — owner A/B feel gate

Judge direct rotation against X-only on A53.

Only the winner becomes the default path.

## P6 — joint industrial design / feel

After mechanics are accepted, refine wheel/pedal visual language together.

Keep rendering lightweight and evidence-led.

## P7 — portrait-specific composition

Design portrait deliberately around the proven mechanics instead of shrinking landscape.

## 13. Validation matrix by slice

Use the smallest proof matching the changed risk.

```text
P1 CSS/layout      -> build artifact + rendered viewport matrix + owner device
P2 pedal mapping   -> focused pure/input/lifecycle tests + owner driving
P3 pedal motion    -> source sanity + rendered/device visual judgement
P4 wheel visuals   -> built/rendered comparison + owner judgement
P5 rotation input  -> focused math/lifecycle tests + A/B owner driving
P6 design/feel     -> owner device + performance sanity
P7 portrait        -> portrait rendered/device matrix
```

Full repository tests are not a routine gate for every polish slice, especially while stale historical UI regex tests remain. Foundation/release gates remain appropriate at promotion boundaries.

## 14. Stop conditions

Stop the current slice and localize instead of broadening when:

- a layout fix begins changing input values;
- a pedal mapping fix changes D/R, timeline arbitration or M6 physics;
- a visual animation changes active hit geometry;
- a rotational experiment requires deleting the working X-only baseline before owner comparison;
- short-landscape clipping persists after root viewport geometry is corrected;
- production CSS order differs from source intent after P1.0;
- rendered behavior contradicts a static CSS/test claim;
- one local failure starts motivating a whole controls rewrite.

## 15. Current preparatory conclusion

The analog-control architecture is not the primary problem to solve next.

The most urgent verified issue is **presentation/layout authority**:

1. production CSS order currently allows historical base mobile rules to override newer mobile-driving rules;
2. root scene geometry can exceed a short mobile viewport because of `min-height:420px` plus hidden overflow;
3. independent absolute overlays have no shared composition authority;
4. static UI tests do not currently prove the rendered product and some are stale.

Therefore the next implementation should begin with **P1.0 — production CSS authority**, followed by **P1.1 — viewport root geometry**, before any deliberate control repositioning.

Only after those two sub-slices should the project judge the true current wheel/pedal layout and proceed into broader HUD composition.
