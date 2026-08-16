# JV Web — mobile driving roadmap readiness audit

Date: 2026-08-16
Owner: Jozz
Classification: `ADVERSARIAL PRE-ROADMAP AUDIT / NO PRODUCT IMPLEMENTATION`

This is a second-order audit of the mobile-driving polish grounding and technical audit. It deliberately looks for additional classes of failure analogous to the production CSS-order regression: cases where source, test names, release metadata or local reasoning can appear correct while the actual built/public runtime has a different boundary.

It does not repeat the full findings of:

- `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` — owner intent;
- `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md` — source/layout/input technical audit.

Only newly discovered readiness issues, corrected evidence semantics and the exact pre-roadmap closure are recorded here.

## 1. Authority and audited boundary

Current private lane at audit start:

```text
work/mobile-driving-controls@a029e676a5affd4111cfc2dbeccee56ef9366386
accepted main@f8eb0908f5934aed2d504f34ce483a02754039ec
live alpha source@d96e393c466aa41c6436c12bcb1b4ab1861828b0
```

Current public owner-device alpha:

```text
release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
parent / rollback baseline@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
```

The public alpha is real and owner-tested on desktop and Galaxy A53 / Chrome. This audit does not revoke that evidence. It narrows what the build/release automation itself proved and identifies hidden runtime/release-layer differences that must not propagate into the next roadmap gates.

## 2. Executive readiness verdict

The core analog-control architecture remains a viable foundation. No second hidden mobile input implementation, parallel physics authority or renderer-specific mobile layout manager was found that would justify another rewrite.

The remaining foundational risks are concentrated in **presentation authority and evidence authority**:

1. production CSS ownership is non-deterministic relative to source intent because three historical/current style layers compete and Vite dynamically appends base CSS;
2. the public Friends root contains a historical executable performance overlay that is not part of private source;
3. the release evidence chain did not execute the complete repository unit-test suite for the preserved owner-side run that was inspected;
4. some current UI tests are statically inconsistent with the live source and therefore cannot be treated as a green full-suite baseline;
5. package/HTTP validators prove bytes, paths and identity but do not execute the browser application;
6. responsive predicates are split across width-only and coarse-pointer conditions, so a narrow desktop viewport is not a reliable proxy for a phone;
7. the canonical npm install reported one high-severity audit finding that has not been triaged. This is a separate dependency-maintenance risk, not evidence of a mobile-control defect.

The project should therefore close a small **R0 roadmap-readiness boundary** before treating P1.0 as ordinary product polishing.

## 3. New finding A — current full unit-test truth is not green evidence

Classification: `CONFIRMED SOURCE + OWNER-SIDE EXECUTION-EVIDENCE CONTRADICTION`

### 3.1 What the repository defines as full validation

Current `package.json` defines:

```text
npm run check
  -> typecheck
  -> test
  -> check:docs
  -> check:third-party
```

`tools/run-tests.mjs` runs every `tests/*.test.mjs` when no focused paths are supplied.

Therefore a claim that `npm run check` passed means the full current `.test.mjs` suite actually ran.

### 3.2 What the preserved Windows run actually executed

The preserved exact Windows log for the d96 alpha build (`RUN_20260816-144759`) records:

```text
npm ci
TypeScript typecheck (no unit-test suite)
  -> npm run typecheck
npm run check:third-party
npm run build:bundle
...
npm run check:friends-r1
```

It explicitly says `no unit-test suite`.

The user-facing package readme for that gate described `npm run check`, so the planned/instruction contract and the executable run diverged.

The inspected run later failed in `check:friends-r1` because the preserved scan receipt and manifest disagreed for `__jv_scan__/index.json`. The final public commit proves that the release-layer byte problem was subsequently corrected and the alpha was published, but no surviving evidence inspected in this audit proves that the complete unit-test suite was run in that later publication step.

### 3.3 Why this matters: the current suite contains known stale assertions

On exact live source `d96e393c...`, `tests/mobile-ui-contract.test.mjs` still requires historical binary button targets including:

```text
STEER_LEFT
STEER_RIGHT
FORWARD
REVERSE
BRAKE
```

and hidden legacy steering buttons.

Exact `d96e393c.../src/main.ts` instead contains the current analog wheel, BRAKE/THROTTLE analog pedals and D/R selector. Those old binary DOM targets are absent.

Therefore, without executing anything, the source itself proves that at least those historical regex assertions do not describe the live alpha DOM.

The correct evidence statement is:

```text
canonical Node/npm install + TS typecheck + normal Vite build + static artifact validation exist;
owner browser/device execution exists;
full current repository unit-test suite is NOT proven green for d96;
some UI-contract assertions are known stale and need reconciliation.
```

This is evidence-hygiene debt, not proof that the working analog runtime is defective.

## 4. New finding B — static Pages smoke is not browser execution

Classification: `CONFIRMED TOOL SEMANTICS`

`tools/validate-friends-r1.mjs` performs strong release checks including:

- exact required files;
- build/source identity;
- approved scan receipt and hashes;
- owner vehicle identity;
- source-map/source-pack exclusions;
- product markers;
- network/path policy;
- GitHub Pages project-path HTTP smoke.

`tools/portable-http-smoke-lib.mjs` serves the built directory and fetches every manifest file. It verifies exact bytes/hashes and verifies that the root URL serves the exact `index.html` bytes.

It **does not instantiate a browser, execute module JavaScript, apply CSS, create WebGL, build DOM or exercise pointer/fullscreen behavior**.

The internal field `entryPointVerified: true` therefore means the root `index.html` was served correctly, not that the browser entrypoint executed successfully.

For future evidence taxonomy:

```text
STATIC PACKAGE GATE
  bytes / hashes / paths / manifest / source identity / HTTP delivery

BROWSER EXECUTION GATE
  JS executed / DOM constructed / CSS applied / WebGL starts / no fatal console/runtime failure

OWNER DEVICE GATE
  actual A53/desktop usability, visual composition and feel
```

The current alpha has owner-device proof, so its browser execution is empirically real. The automation itself must simply not be credited with proving that class.

## 5. New finding C — public Friends root contains executable behavior outside private source

Classification: `CONFIRMED PUBLIC ARTIFACT FACT`

The public `7766f711.../index.html` contains:

```html
<script src="./jv-live-performance.js"></script>
```

The private source `index.html` does not.

`LIVE_BUILD.json` explicitly records this as:

```text
preservedPerformanceOverlay: jv-live-performance.js
```

The overlay is therefore not hidden, but it is a second executable runtime layer whose provenance is the historical public release layer rather than `d96e393c...` private source.

### 5.1 Normal URL behavior

On a normal URL with neither `jvRenderScale` nor `jvPerfHud=1`, the script reads parameters/devicePixelRatio and returns before instrumentation. It is not the cause of the normal alpha's steering/pedal layout regression.

### 5.2 Diagnostic/performance URL behavior

With query controls it actively changes runtime behavior:

- `jvRenderScale=1|1.5|2` can replace global `devicePixelRatio` with a capped getter before the application module runs;
- `jvPerfHud=1` patches `WebGLRenderingContext` and `WebGL2RenderingContext` draw methods;
- it adds a fixed diagnostic HUD at `z-index:2147483647`;
- it runs its own RAF sampling loop.

Current private source already owns the same product-level experiment domains:

- `src/render/jv-performance-experiment-settings.ts` parses `jvRenderScale` and provides the renderer's render-scale cap;
- `src/runtime/performance-observer.ts` owns the current `jvPerfHud` instrumentation path.

Therefore diagnostic URLs on the public alpha have **duplicated performance responsibility**.

### 5.3 Required future release rule

Do not preserve this historical executable overlay into the next Friends root candidate.

Future root product behavior should be:

```text
exact private source build
+ approved static scan/data assets
+ necessary static release metadata/byte-preservation files
```

not:

```text
private source build
+ executable JS/CSS inherited from an older public release
```

If a future diagnostic overlay is required, it must either be source-owned or live in an explicitly isolated test path rather than silently extending the root product runtime.

No emergency rollback of the current owner-tested alpha is required merely because the overlay exists; the correction belongs in the next candidate publication boundary.

## 6. New finding D — build-manifest source identity does not mean every artifact byte came from that source

Classification: `CONFIRMED PROVENANCE SEMANTICS`

The public `build-manifest.json` records:

```text
source.commit = d96e393c...
workingTreeClean = true
```

but its file list also contains release-layer additions such as:

```text
.gitattributes
LIVE_BUILD.json
jv-live-performance.js
```

The source commit therefore correctly identifies the private product-source basis, but it is not a complete provenance statement for every final public file.

This is acceptable only if the artifact layers are explicit.

For future publication evidence use separate concepts:

```text
productSourceCommit
builtProductPayload
preservedApprovedDataLayer
releaseMetadataLayer
```

Executable runtime files belong in `builtProductPayload`; they must not be smuggled through the release metadata/data layer.

Also note: the public build manifest retains pre-publication fields such as `publication.mode=DORMANT`, `publicReady=false` and `publishedByBuild=false` even though that exact payload is now live. Those fields describe how the candidate was built, not current Pages deployment state. Live publication truth comes from the public Git ref/Pages status/release receipt metadata, not those dormant fields.

## 7. New finding E — CSS contamination is broader than wheel shape/action placement

Classification: `CONFIRMED CASCADE ANALYSIS`

The first technical audit already established the production load order problem:

```text
new/V2 mobile CSS chunk first
base style.css chunk appended later with dynamic main import
```

The second pass confirms additional live collisions.

### 7.1 Generic active-state rule can affect the new pedal's outer target

Historical base CSS contains:

```css
.mobile-control[data-active] {
  transform: scale(.93);
  ...
}
```

Current pedals are still `.mobile-control` elements and `MobileDrivingUi` sets `data-active` on them.

The newer design intends only the inner `.mobile-pedal-mechanism` to animate while the outer acquisition element remains stable.

The later historical rule can therefore add a second active transform to the outer pedal element. Frozen pointer geometry prevents command remapping during the gesture, but presentation/hit-surface ownership is no longer what the source component intends.

### 7.2 Historical steering pseudo-element survives component generations

The three steering style generations all address `.mobile-steering-joystick` and its pseudo-elements. The current wheel stylesheet defines a new `::before` but not every earlier pseudo-element contract. Historical `::after` content can therefore survive even when the current DOM has moved to explicit wheel-stage/centre-tick children.

### 7.3 Label rules also overlap

Base/V2/current styles all define steering or mobile-control `small` rules with equal/near-equal specificity. The final built label position/font can therefore differ from the current stylesheet's local reading.

### 7.4 V2 is no longer a neutral foundation layer

`mobile-driving-controls-v2.css` still contains the old rack-shaped visual design, old pseudo-elements, action-rail positioning and tests asserting that it remains a separate owner-facing layer.

The current wheel DOM has superseded that presentation. Keeping V2 as a live cascade layer is now technical debt rather than a useful runtime abstraction.

P1.0 should therefore not merely reorder the three existing sheets. Its target should be **single current ownership**:

- one deterministic import graph;
- historical component selectors retired from the live base/V2 cascade;
- only still-valid shared layout/accessibility rules retained deliberately;
- built artifact inspected to prove that old selectors cannot resurrect behavior.

## 8. New finding F — responsive classification is split across different device predicates

Classification: `CONFIRMED SOURCE FACT / NOT YET A DEVICE FAILURE`

Base mobile CSS uses:

```text
(hover:none AND pointer:coarse) OR (max-width:620px)
```

for several mobile transformations including showing `.mobile-controls`.

Other current landscape/portrait rules require:

```text
hover:none AND pointer:coarse AND orientation:...
```

while the short-landscape rule uses width/height/orientation without the pointer predicate.

Consequences:

- a narrow desktop window can enter part of the mobile layout even with mouse/fine pointer;
- it may not enter every phone-specific rule that a coarse-pointer device enters;
- simply resizing desktop Chrome to A53 dimensions is not equivalent to an A53 responsive state;
- automated rendered checks must either emulate the input media features or treat narrow-desktop and coarse-phone as separate classes.

This does not require JavaScript device sniffing. P1.2 should establish a consistent CSS policy for the intended responsive classes.

## 9. New finding G — even the source-intended pre-cleanup action rail is not a full composition solution

Classification: `SOURCE GEOMETRY RISK`

V2 attempted to move Camera/Reset/Debug away from the bottom driving region. That is directionally useful, but the top toolbar, scene readout and action rail still use independently calculated offsets.

In mobile landscape, for example, toolbar and action vertical ranges can approach/overlap because no shared reserved zone exists.

Therefore fixing CSS order alone is a **diagnostic restoration slice**, not acceptance of the V2 layout.

Required sequence remains:

```text
P1.0 restore deterministic current styling
-> re-render and observe
-> P1.1 root viewport geometry
-> P1.2 coordinated HUD zones
```

Do not interpret an improved P1.0 screenshot as proof that P1 composition is finished.

## 10. Renderer/input adversarial re-check — no new foundational blocker found

Classification: `CONFIRMED SOURCE REVIEW`

The second pass deliberately searched for another hidden owner of mobile geometry or commands.

### Renderer

The M6 renderer does not keep an independent mobile viewport model. It derives render buffer size, projection aspect and responsive default chase distance from `canvas.clientWidth/clientHeight` each render.

Therefore correcting the CSS scene/canvas geometry remains the correct authority boundary. A second camera/viewport manager does not need to be reconciled.

### Pointer routing

Driving controls are sibling overlays above the canvas. Their pointer adapters own their local targets and use pointer capture/stopPropagation. Canvas camera gestures remain on the canvas rather than a competing ancestor path.

No evidence was found that steering/pedal events are simultaneously being interpreted as camera gestures in the current DOM topology.

### Gesture geometry

Current steering and pedals already freeze their gesture geometry at acquisition. Browser chrome/layout movement during an ordinary held gesture therefore does not continuously recompute command geometry.

Orientation/fullscreen remain explicit fail-closed boundaries. Do not add resize-triggered releases speculatively unless device evidence requires them.

### Host/generation

Generation reset before old-host disposal, independent input timelines and the presentation-only `MobileDrivingUi` boundary remain sound enough to preserve.

This second audit therefore strengthens the earlier conclusion: **do not reopen the analog-control architecture because of presentation/release defects**.

## 11. Dependency audit flag

Classification: `EXECUTION-EVIDENCE FLAG / NOT TRIAGED`

The inspected canonical `npm ci` output reported:

```text
1 high severity vulnerability
```

No package/advisory attribution was captured in the evidence inspected here, so this audit does not infer exploitability, runtime reachability or a required upgrade.

It is not a P1 mobile-polish blocker on present evidence.

Before a broader stable/public release boundary, run a deliberate dependency-advisory triage against the exact lockfile and current advisories rather than applying `npm audit fix` blindly.

## 12. R0 — roadmap readiness closure

Before ordinary P1 polishing is treated as routine, close the following small preparation boundary.

### R0.1 — validation truth / test hygiene

Goal: restore a trustworthy source-test baseline without making obsolete UI tests product authority.

Required work:

1. classify current mobile/UI tests as `KEEP / UPDATE / DELETE`;
2. remove/update assertions that require historical binary controls or historical V2 presentation;
3. retain input/lifecycle/generation tests that protect real invariants;
4. add/prepare a build-artifact-level assertion for stylesheet ownership/load graph rather than only checking source `<link>` order;
5. run the reconciled current suite in the canonical owner toolchain;
6. record the actual command list and result.

A future `FULL CHECK PASS` claim must correspond to actual `npm run check` execution, not typecheck-only execution.

This is test/evidence maintenance, not a product redesign.

### R0.2 — executable release-layer purity

Required at the **next Friends candidate publication**, not as an emergency republish of the existing alpha:

1. do not carry `jv-live-performance.js` into the new root artifact;
2. do not inject historical executable JS/CSS from public baseline;
3. preserve approved scan/data bytes and necessary static metadata only;
4. ensure `jvRenderScale` / `jvPerfHud` behavior comes from private source when those diagnostics are used;
5. manifest/evidence should describe the product-source layer separately from preserved data/release metadata.

### R0.3 — validation classes made explicit

Every owner-visible slice should state separately:

```text
SOURCE CHECK
BUILD/ARTIFACT CHECK
BROWSER EXECUTION CHECK
OWNER DEVICE CHECK
```

Do not collapse these into one word such as `validated`.

For layout work, the browser/rendered check must operate on the **production build artifact**, because the CSS-order defect is itself a dev/source-vs-build divergence.

## 13. Refined P1.0 entry after R0

Once R0.1 is closed, the first product implementation remains P1.0, but the target is now sharper.

### P1.0a — one style-loading graph

Remove mixed HTML-linked mobile sheets + dynamically imported base CSS ownership. Load the relevant styles from one deterministic source-controlled graph.

### P1.0b — retire historical live component layers

Do not preserve V1/V2 visual selectors merely because later CSS can override them.

Move/retain only still-valid shared rules deliberately. Remove dead or superseded steering/binary/mobile-control selectors from live ownership.

The objective is not higher selector specificity; it is less competing authority.

### P1.0c — production artifact proof

Inspect the built artifact for:

- intended CSS chunk/import order;
- absence of historical steering/pedal active rules that can win later;
- no release-layer executable overlay;
- expected DOM/CSS on desktop and A53 classes;
- Debug open/close recoverability.

Then pause and obtain a new rendered baseline before P1.1/P1.2.

## 14. Evidence matrix for the main roadmap

```text
R0.1 tests/evidence
  canonical npm run check after stale-test reconciliation

P1.0 CSS authority
  source review + normal Vite build + built CSS graph inspection + rendered smoke

P1.1 viewport
  rendered CSS/canvas geometry + A53 browser-chrome/fullscreen states

P1.2-P1.5 HUD
  rendered overlap/zones + owner visibility judgement

P2 pedal input
  focused mapping/ownership/lifecycle tests + A53 driving feel

P3/P4 visuals
  built render + owner visual/mechanical judgement

P5 rotation
  pure angle/unwrap/lifecycle tests + A/B device driving

public promotion
  full source check + artifact/static identity + browser execution + owner/public check as appropriate
```

## 15. Stop conditions strengthened by this audit

Stop and localize when:

- a public candidate contains executable root JS/CSS not traceable to private source;
- a gate description says `npm run check` but the execution log does not;
- `entryPointVerified` or HTTP success is being presented as browser execution;
- source CSS looks correct but built chunk ownership has not been inspected;
- an old test forces restoration of superseded binary/V2 UI;
- a CSS fix depends on increasing specificity/`!important` instead of removing competing ownership;
- narrow desktop dimensions are being treated as equivalent to coarse-pointer phone behavior without media emulation;
- a dependency warning is automatically “fixed” without package/advisory impact analysis;
- a presentation/release defect starts motivating another input/physics rewrite.

## 16. Final readiness conclusion

The second adversarial pass did find additional problems of the same general class as the CSS-order regression, but they are now localized:

```text
SOURCE/PRESENTATION AUTHORITY
  competing historical CSS layers

PUBLIC RUNTIME AUTHORITY
  historical jv-live-performance.js overlay

VALIDATION AUTHORITY
  typecheck-only preserved run vs planned full check
  stale UI tests
  static HTTP smoke vs actual browser execution

RESPONSIVE AUTHORITY
  mixed width/coarse-pointer classification
```

No corresponding hidden replacement architecture was found in input, host, physics or camera viewport ownership.

The project is therefore not in need of another recovery/rewrite. It needs a short R0 validation/evidence cleanup, then a deliberately clean P1.0 style-authority implementation.

After R0.1 + P1.0 production render proof, the main owner-driven roadmap can proceed layer-by-layer with substantially better fault localization than the alpha had.
