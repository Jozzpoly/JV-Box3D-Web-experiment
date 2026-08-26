# JV Web — owner checkpoints

Updated: 2026-08-26

Compact ledger of durable Owner-visible acceptance. Git history preserves detailed campaign/test evidence. A passing test is not Owner acceptance; each entry below is limited to what Jozz actually observed or explicitly accepted.

## P0 — browser vehicle foundation

Classification: `OWNER ACCEPTED`

The browser product can load the owner vehicle, drive/steer/brake/reset, use Map/Offroad and use chase/orbit camera/debug controls. Later checkpoints refine this foundation rather than erase it.

## S1 / S2 — focused front suspension semantics

Classification: `OWNER ACCEPTED — NARROW`

Preserve:

- accepted front-left upper placement/articulation within the tested precision/range;
- `Socket_ChassisMount_b` / #6 is suspension-side and must not inherit steering rotation;
- `Socket_WheelCenter` / #8 is a distinct steerable member relative to #6;
- steering occurs around the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin remain distinct DOFs.

Still not accepted as final truth: lower placement, carrier topology, rack/tie-rod law, caster/KPI/trail, final rig or handling.

## R1-DRIVE-BRIDGE-01 — temporary coherent driving baseline

Date: 2026-08-13
Classification: `OWNER ACCEPTED — TEMPORARY PRODUCT INTERMEDIATE`

The temporary symmetric front removed the dominant left/right defect well enough to continue. Owner observed straight driving and materially more coherent steering. Residual asymmetry and final steering/rig/handling remained open.

## FRIENDS-R1-LIVE — public browser foundation

Date: 2026-08-14
Classification: `OWNER ACCEPTED — END-TO-END FRIENDS FOUNDATION`

Historical anchors:

```text
public release: 7161215e47f00573b8c1b5c31e5931c89f9d709a
private live-hotfix source: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
scan preview SHA-256: aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146
```

Owner confirmed Plac E2R, Offroad, full JSPREV2 and the current vehicle on desktop and phone. Phone scan was heavy but usable. Portrait and landscape rendered. This accepted the public browser product foundation, not final mobile UX/performance, rig or handling.

## PERF-FND-A53-01 — mobile performance foundation v1

Date: 2026-08-15
Classification: `OWNER ACCEPTED — PERFORMANCE SCOPE`

Historical anchors:

```text
private checkpoint: f42e16321d9edb26e10f44ab7c9eeda3c646291c
public device proof: a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
Samsung Galaxy A53 / Chrome / render scale 1x / scan culling ON
```

Owner observed the current Offroad and complete textured JSPREV2 stress cases reaching stable ~60 present/s after removal of expensive mobile backdrop effects. This protects the present A53 1x performance foundation from speculative re-optimization without new evidence. It does not establish universal startup time, scale 2x, other devices or larger scans.

## CAMERA-MANUAL-RIG-V1 — manual inspection/navigation foundation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MANUAL CAMERA FOUNDATION`

Historical owner-device proof: `4768abedaa67b7505ca963a0836879e42590b67d`.

Owner accepted orbit/pan/zoom and broad close/far/aerial inspection on desktop and phone as a usable manual-camera foundation. Future automatic assists must remain additive and must not silently overwrite manual user calibration.

## FULLSCREEN-V1 — immersive browser presentation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MOBILE + DESKTOP FULLSCREEN`

Historical owner-device proof: `8fe52a73554273fa710d2be2fdaf3a144d9056ba`.

Owner confirmed fullscreen entry/exit on mobile and desktop, portrait/landscape rendering and continued driving after transitions. This protects fullscreen capability, not universal every-browser behavior or final mobile layout.

## STEERING-CONTROL-V2 — mobile steering foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — MOBILE CONTROL FOUNDATION, DESIGN OPEN`

Historical owner-device proof: `2acd652f68d57497c8ce8886b2875789a70f4be3`.

Owner accepted X-only analog `POSITION` touch steering as materially better than V1 and good enough to continue. Mobile Debug open/close was also accepted. Visual language, rotational steering, final sensitivity/haptics/self-centering and vehicle steering geometry remained open.

## P1-FOUNDATION-01 — mobile driving presentation foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — PRODUCT/PRESENTATION FOUNDATION, DESIGN OPEN`

Historical anchors:

```text
owner-tested private source: c9b5990b226685abe35851fc5e9496323096ecf7
accepted Friends artifact: a325c279cfe63a0607dba33c3c635a1716e09f8f
```

Owner accepted the working steering and analog pedals, recovery from the worst mobile UI/presentation failures, and the short-viewport foundation. This did not accept final coordinated HUD, pedal mapping/mechanics/design, steering visual/gesture, portrait composition, rig or handling.

## P1.2 / P1.3 / P1.3.1 — coordinated mobile surface and clean steady-state

Date: 2026-08-18
Classification: `OWNER ACCEPTED — MOBILE COMPOSITION + UTILITY DRAWER + STEERING SURFACE / PUBLIC STEADY-STATE`

Exact anchors:

```text
owner-approved product source before test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

canonical executable source at product close:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

canonical source tree:
  cc2afeb7902f05d12edd98961b2a43f0706603c8

clean canonical preview artifact:
  fe5ba2c772dbb530848df5bcd55163171b5847bc

accepted public executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

device/browser:
  Samsung Galaxy A53 / Chrome
```

Canonical Windows close ran with Node 24.16.0 / npm 11.17.0, `npm ci`, normal repo `npm run build` and full repository tests **462/462 PASS**. The final test-only commit `cd7f5f89...` added coverage for the already-existing steering-plate setting; product source bytes accepted by Owner remained those from `23fe49c...`.

Owner directly confirmed on the final public surface:

- world and vehicle start correctly;
- steering works;
- throttle and brake work;
- utility drawer opens/closes;
- steering plate defaults OFF and OFF -> ON -> OFF works;
- landscape/browser and fullscreen show no obvious regression;
- JSPREV2 still loads.

Protected meaning:

- P1.2 short-landscape/lower-driving composition is a working baseline;
- P1.3 minimal persistent driving HUD + transient utility drawer is the current chrome model;
- P1.3.1 compact top actions, larger physical-wheel presentation and opt-in steering plate are the present surface foundation;
- X-only `POSITION` remains the accepted historical/reference steering path;
- analog pedals, independent multitouch ownership, fail-closed lifecycle, D/R command semantics, Camera Manual Rig V1, Fullscreen V1, Plac E2R, Offroad, JSPREV2 and owner vehicle remain protected unless a later focused slice explicitly changes them.

Still open at this checkpoint: final pedal mapping/mechanics/industrial design, final steering gesture/industrial design, final portrait-specific composition, final rig geometry and handling.

## STEERING-DUAL-MODE-DIRECTION-01 — retain both Owner-facing steering modes

Date: 2026-08-20
Classification: `OWNER ACCEPTED — EXPERIMENTAL PRODUCT DIRECTION / FINAL STEERING OPEN`

Exact evidence boundary:

```text
owner-tested steering source:
  1b25cf242a007b84f236155e6067539c825876ec

owner-tested steering tree:
  20bf084af97fe0c3b780e621467c53362b779303

Owner Preview control implementation:
  5a57c316a297763c7b6310712b5fd0a9469dcf96

Owner Preview JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

device/browser:
  Samsung Galaxy A53 / Chrome
```

Owner drove `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` and explicitly judged **both modes currently worth retaining and developing gradually**.

Durable meaning:

- Relative-X passed the first product-value falsifier and is not a disposable comparison mode;
- Direct Rotation remains a retained product direction;
- there is no requirement to force one winner or remove either mode;
- `X_POSITION` remains internal regression/reference, not a third Owner-facing product choice.

Not accepted by this historical checkpoint: final tuning, integration into accepted `main`, steering physics or vehicle handling changes.

## STEERING-DUAL-MODE-FOUNDATION-02 — integrated source foundation

Date: 2026-08-22
Classification: `OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`

Exact integration executable:

```text
4961cee419a88dc54a5f0ee743cc1ee65886a734
```

Evidence:

- merge commit preserves exact steering/test blobs from `1b25cf242a007b84f236155e6067539c825876ec` and current pre-close `main` documentation through separate parents;
- exact integration candidate passed repository-declared Node/npm on `windows-latest`, `npm ci`, and full `npm run build`; recorded status context: `jv/integration-close-windows = success`;
- Owner regression-tested the exact candidate on Samsung Galaxy A53 / Chrome and explicitly returned PASS for `Obrót`, `Przeciąganie`, steering + pedal multitouch, JSPREV2, fullscreen/basic UI and overall preservation of accepted behavior.

Durable meaning:

- both Owner-facing steering modes are accepted as a source-product foundation in `main`;
- the earlier X-only `POSITION` path remains historical/regression reference;
- future steering work should be small tuning/feel/design slices rather than reopening integration.

Still not accepted/frozen: final Direct tuning, final Relative-X gain curve, final full-lock/reversal/edge behavior, final sensitivity/haptics/self-centering/industrial design, steering physics/handling, or Friends/Public promotion of the dual-mode source foundation.

## PEDAL-ABSOLUTE-DIRECTION-01 — absolute-position pedal semantics

Date: 2026-08-22
Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`

Exact Owner-tested candidate:

```text
e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4
```

Machine evidence:

- repository-declared Node 24.16.0 / npm 11.13.0;
- `npm ci`;
- focused `analog-drive`, analog-host-contract and mobile-integration suites;
- **30/30 PASS**;
- status context `jv/pedal-absolute-causal = success`.

Owner real-device evidence on Samsung Galaxy A53 / Chrome:

- low/mid/high initial touch: PASS;
- small up/down correction: PASS;
- full-range sweep/reversal: PASS;
- throttle + brake multitouch: PASS;
- steering + pedal coexistence: PASS;
- overall comparison to relative-from-touch: **better**.

Durable meaning:

- absolute position inside frozen pedal acquisition geometry is the preferred pedal-input direction;
- immediate pointer-down value is valuable and should be preserved unless later evidence contradicts it;
- final integration into `main` remains a separate structural close;
- final dead-zone/value curve and mechanical presentation remain open.

Owner also identified a future tuning need: likely reserve roughly the lower **5–10%** as a zero/contact buffer so the finger can acquire the pedal at exact zero and then roll smoothly into analog actuation. This percentage is not frozen. Future presentation should make contact/buffer versus actual actuation legible.

During the same device smoke, D/R did **not** switch while throttle remained held. Source evidence shows that D/R acquisition relies on `click` and is unchanged by the pedal mapping candidate, so record this separately as an Owner-observed D/R multitouch acquisition gap, not as rejection of absolute pedal semantics. Accepted-main device reproduction is still open.

Owner also observed that very small brake input can dominate full throttle and reiterated broad low vehicle power. That belongs to a later longitudinal/handling stage, not this pedal-input checkpoint.

## PEDAL-ABSOLUTE-FOUNDATION-02 — integrated source foundation

Date: 2026-08-22
Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL FOUNDATION IN SOURCE / TUNING OPEN`

Exact integration executable:

```text
315e41aa3e68baaa74ab107d3ef0b82c14a2eb84
```

Evidence:

- mechanical merge `e8e879a3185ca61cb924acf5490c24781dc84ad8` preserves the exact pedal adapter/direct-test blobs from Owner-tested `e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4` while taking current documentation from `main`;
- first full Windows integration run exposed one stale viewport test fixture whose fake pedal omitted the newly required `top` geometry field; product runtime was not changed;
- the fixture-only follow-up `315e41aa...` adds `top: 0` to that fake pedal and leaves the Owner-tested adapter unchanged;
- exact `315e41aa...` passed repository-declared Node/npm on `windows-latest`, `npm ci`, and full `npm run build`; recorded status context: `jv/pedal-integration-close = success`.

Durable meaning:

- absolute-position pedal semantics are now part of accepted source `main`;
- the earlier relative-from-touch mapping is historical baseline rather than the accepted current product path;
- immediate pointer-down value and frozen acquisition geometry are accepted foundation behavior;
- future pedal work should be tuning/presentation slices rather than reopening the mapping choice without contradictory Owner evidence.

Still not accepted/frozen:

- exact lower zero/contact buffer size or current 5–10% hypothesis;
- final value curve;
- final pedal mechanical feedback / industrial design;
- D/R multitouch acquisition behavior at this historical checkpoint;
- longitudinal motor/brake balance;
- Friends/Public promotion of the pedal source foundation.

## D-R-MULTITOUCH-FOUNDATION-01 — explicit second-finger acquisition

Date: 2026-08-22
Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`

Exact evidence boundary:

```text
RED reproducer:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

Owner-tested GREEN candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

accepted integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

device/browser:
  Samsung Galaxy A53 / Chrome
```

Evidence:

- Owner first observed that D/R did not switch when throttle was held by another finger;
- source grounding localized the weakness to click-dependent acquisition rather than drivetrain sign semantics;
- RED test modeled held throttle plus a second D/R pointerdown/pointerup and failed on the old click-only path as expected;
- GREEN candidate gives D/R explicit pointer capture, toggles only on owned pointerup, cancels/lost-capture/lifecycle loss without toggle, prevents pointer-generated click double-toggle and keeps keyboard/assistive click fallback;
- focused exact-candidate validation passed with repo toolchain, `npm ci`, typecheck and D/R/analog/lifecycle/mobile integration suites; status `jv/dr-multitouch-causal = success`;
- Owner supplied A53/Chrome recording and explicitly confirmed simultaneous throttle, brake, D/R and steering operation. The accepted claim is capability/reliability, not that four-finger operation is ergonomically simple;
- mechanical integration `bd8980eb...` preserved exact D/R runtime/test blobs plus current docs and passed `windows-latest`, repo-declared Node/npm, `npm ci`, full `npm run build`; status `jv/dr-integration-close = success`.

Durable meaning:

- D/R is now a real pointer-owned multitouch control rather than a click-dependent second-finger hope;
- throttle/brake/steering ownership remains independent;
- D/R command/sign and held-throttle re-sign semantics remain the existing product semantics;
- future D/R work should be ergonomics/presentation only unless contradictory input evidence appears.

Not accepted/frozen here: vehicle power/brake balance, pedal neutral/contact tuning, pedal mechanical design, final steering feel, or Friends/Public promotion.

## GATE3-OWNER-TRUTH-2026-08-26 — scoped current synthesis

Classification: `OWNER TRUTH SYNTHESIS / NEGATIVE KNOWLEDGE / NO NEW PRODUCT ACCEPTANCE`

This section reconciles the durable checkpoints above with later direct Owner feedback. It does not promote machine evidence into Owner truth and does not choose future architecture or the first next-generation falsifier.

### Preserve as current product/stability truth

- browser product can load and drive the owner vehicle across the accepted world surfaces;
- P1.2/P1.3/P1.3.1 lower-driving composition, minimal persistent HUD and wide utility-drawer model are the current mobile presentation foundation, not permanent layout architecture;
- Camera Manual Rig V1 and Fullscreen V1 remain useful foundations;
- Samsung Galaxy A53 / Chrome / render-1x is an accepted JSPREV2 performance boundary, not a universal mobile-performance claim;
- both `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` remain Owner-facing steering directions worth retaining and developing; `X_POSITION` is only historical/regression reference;
- absolute-position throttle/brake with immediate pointer-down value and frozen acquisition geometry is the preferred pedal-input foundation;
- throttle/brake independent ownership, steering + pedal multitouch, D/R explicit pointer lifecycle and fail-closed lifecycle behavior remain protected capabilities.

### Preferred directions, not final tuning/architecture

- direct mechanical feel should become more natural and precise without hiding vehicle behavior behind silent input-dependent assists;
- steering return/self-alignment should come from the physical/mechanical/contact system rather than an artificial centering default;
- the small lower pedal zero/contact buffer remains a useful tuning hypothesis, but its exact size and curve are not frozen;
- current visual/mechanical authoring should move toward explicit authored sockets/frames/relations and coherent moving parts, without implying that JURE or any current schema is permanent architecture.

### Foundation-only / temporary / tolerated

- R1 symmetric front steering is a successful temporary product bridge, not final steering topology;
- current owner-vehicle visual package is useful product/rendering evidence but does not establish final physical rig truth;
- current mobile chrome and portrait/landscape composition may be redesigned deliberately as long as accepted world visibility, controls and transitions are not accidentally regressed.

### Rejected, deferred or superseded directions and why

- relative-from-touch pedal mapping is superseded because absolute-position mapping gave the Owner more direct and predictable control;
- click-only D/R acquisition is superseded because it failed on real device while another finger held throttle;
- Pedal Contact + Mechanical Feedback V1/V1.1 is `NOT ACCEPTED / DEFERRED`: technical functionality did not justify the interaction/iteration cost and the later contact-zone attempt produced too little useful zero/contact region to warrant continued struggle. This rejection does **not** reject the separate small zero/contact-buffer tuning hypothesis;
- large persistent mobile header/toolbar arrangements that consume useful driving view are negative knowledge; the accepted lower-driving composition and utility-drawer model exist partly to avoid that failure mode;
- unsafe JURE inspect/edit coupling is negative knowledge: inspection must not silently mutate authored truth. SAFE-INSPECT fixes that demonstrated workflow failure but does not constitute Owner acceptance of physical mating;
- artificial rack centering is not an acceptable default substitute for unresolved physical return/self-alignment;
- stale visual/mechanical convenience parenting, loose/intersecting suspension presentation and implausible damper/cardan behavior are not acceptable quality targets merely because the visual package renders and moves.

### Current Owner-visible quality pressure

The most material unresolved Owner-visible pressure is not the accepted input lifecycle or publication surface. It clusters around:

1. steering mechanics/return/contact quality;
2. longitudinal power/brake balance — Owner directly observed broadly low power and very small brake input dominating full throttle;
3. rig/visual-mechanical coherence, including suspension/damper/cardan behavior and physical-authority clarity;
4. exact upper/lower outboard mating, which remains not fairly judged after the earlier JURE inspection/clarity failure.

These product pressures may overlap with Gate 2 architecture debt, but the overlap does not choose a solution automatically.

### Explicitly open / not fairly judged

- final Direct Rotation tuning;
- final Relative-X gain curve;
- full-lock/reversal/edge behavior;
- final haptics/self-centering/steering industrial design;
- steering physics and vehicle handling;
- final pedal zero/contact buffer, value curve and mechanical presentation;
- longitudinal motor/brake balance;
- final rig geometry and physical/visual lowering;
- exact upper/lower outboard physical mating;
- final portrait-specific composition;
- final authored-tool and runtime architecture.

## Durable method

For future Owner-visible slices, record only the durable verdict and exact evidence boundary. Do not append runner logs or rebuild project chronology here. Prefer small source change -> causal check -> faithful Owner Preview/device evidence -> Owner judgement.
