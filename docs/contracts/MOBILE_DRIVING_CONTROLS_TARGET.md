# JV Web — mobile driving controls target

Status: `PRODUCT TARGET / PRE-IMPLEMENTATION FOUNDATION`
Owner: Jozz
Recovered and refined: 2026-08-16

This is the durable interaction and implementation target for the next JV-Web mobile-driving stage. It is **not** authority for final vehicle rig geometry, steering physics or handling. It defines how the browser/mobile control surface should behave and how it should be integrated so later iteration stays fast and safe.

## 1. Product intent

Touch driving should become deliberately enjoyable, mechanical and automotive rather than looking or behaving like a generic mobile gamepad.

The control surface should feel like an **instrument attached to the simulated mechanism**: its visible motion must truthfully communicate command state, while the actual input mapping remains stable, precise and deterministic.

The implementation should preserve the owner-accepted precision of Steering Control V2, then add richer mechanical feedback without allowing animation, responsive layout or decorative motion to change the command under the finger.

Long-term extensibility matters, but avoid speculative frameworks. Build one clean production path that can later accept sensitivity tuning, haptics, handedness, alternative visual presentation and additive driving assists without replacing the input foundation.

## 2. Evidence from the previous UI iterations

The supplied owner screenshots establish useful design evidence rather than a single visual mockup to copy.

### Old binary mobile controls

What worked:

- primary driving controls lived in the two lower thumb zones;
- steering occupied the left hand and longitudinal controls the right;
- the centre of the world view remained largely unobstructed.

What failed as a long-term interaction model:

- LEFT/RIGHT and DRIVE/REVERSE were binary buttons for fundamentally continuous actions;
- three large right-side action buttons consumed space without expressing throttle/brake magnitude;
- the UI behaved like a generic mobile gamepad rather than a vehicle mechanism.

### Analog Steering V1 — circular joystick

What worked:

- proved that direct analog steering on the phone is viable;
- one-thumb absolute X `POSITION` control was a useful direction.

What failed:

- the circular shell and vertical guide visually advertised a Y axis that had no function;
- the control was much taller than the real interaction required;
- the large circle sat close to the bottom/left edge and consumed valuable world view;
- visual metaphor and actual degrees of freedom disagreed.

### Steering Control V2 — rack

What worked and is protected:

- the visible affordance became one-dimensional like the actual X-only command;
- the control became significantly shallower and more space-efficient;
- its placement moved away from the extreme screen edge;
- owner accepted its precision and practical driving behavior;
- Debug recovery and the ~35-degree product steering bridge were validated alongside it.

What remains open:

- the rack/slider communicates position accurately, but still does not feel strongly automotive;
- the moving rectangular thumb is useful as a calibration metaphor but weak as final mechanical feedback.

### Concept 4 — Split Pedals

Treat the supplied concept as a **design donor**, not a pixel-perfect specification.

Strong ideas to preserve:

- separate vertical throttle and brake instruments;
- clear analog travel rather than binary press state;
- compact D/R grouped with the longitudinal controls;
- steering and pedals form one coherent mechanical control language.

Do not copy blindly:

- the concept's steering rack is superseded by the panoramic-wheel direction;
- exact pedal order, dimensions, colors and labels remain implementation/tuning decisions;
- the final controls must fit the real JV viewport, performance constraints and existing HUD rather than the mockup frame.

## 3. Locked owner decisions for the next stage

### Simultaneous throttle + brake

Input must preserve independent analog throttle and brake simultaneously. Do not prevent the state merely because the current vehicle controller may choose a dominant effect.

Current source fact: `M6VehicleController.#applyDrive()` gives brake strict behavioral priority whenever `brake > epsilon`; therefore the present physics does **not** yet combine drive torque and brake torque even if the input command contains both values.

For this mobile-controls stage:

- preserve both input values and expose them accurately;
- do not silently rewrite vehicle physics just to simulate combined pedal consequences;
- record/telemeter both values so a later physics/handling stage can decide what simultaneous pedals should physically do.

### D/R switching

Allow `D <-> R` while throttle is held and regardless of speed. Do not add Neutral, forced pedal release, speed interlocks or safety lockouts unless real driving later proves a need.

A direction flip under active throttle should preserve throttle magnitude and change its sign from the same input timestamp. With the current drive controller this can create strong opposing drive torque while the vehicle is still moving in the previous direction; that behavior is intentionally permitted as an experiment rather than sanitized away.

### Default hand layout

Primary default:

```text
LEFT THUMB  -> steering
RIGHT THUMB -> throttle / brake / D-R cluster
```

Do not build a handedness setting in this stage. Keep semantic input ownership independent from CSS placement so a future mirrored layout can be added without changing timeline or vehicle logic.

### Responsive sequence

Landscape is the **primary driving/polish target first**. Portrait is a separate subsequent substage using the same interaction semantics.

This is sequencing, not permission to leave portrait broken. The purpose is to give the most important driving surface enough attention before adapting it to the narrower orientation.

## 4. Steering — preserved input semantics

The accepted V2 foundation remains the normal-driving behavioral baseline:

```text
one thumb
horizontal X-only POSITION
normalized command [-1, +1]
release/cancel/lifecycle loss -> neutral 0
current product full-lock bridge -> approximately +/-35 degrees at the wheels
```

The current V2 adapter maps the pointer's absolute horizontal position inside the control hitbox to `[-1,+1]`, with a small centre dead zone. Preserve that mapping for the first new driving candidate because its feel was owner-accepted.

Do not return to a circular joystick metaphor. No visible element should imply vertical steering movement.

### Gesture geometry hardening

V2 recomputes `getBoundingClientRect()` during pointer movement. The new steering control should instead freeze the active control geometry at pointer-down, exactly as the pedal gesture does, so an orientation/layout/fullscreen change cannot silently remap steering under a stationary finger.

Normal stable-viewport V2 behavior remains unchanged; this only hardens mid-gesture layout changes.

## 5. Steering — target mechanical presentation

Preferred design direction:

- fixed, shallow touch acquisition zone in the lower-left thumb region;
- inside it, a circular steering-wheel mechanism viewed from above at a steep perspective angle so it appears as a very wide shallow ellipse/arc;
- the user's finger still moves only left/right across the fixed zone;
- the internal wheel rotates with the steering command and therefore communicates applied lock.

### Important rendering detail

Do **not** fake this by drawing an already-squashed ellipse and rotating the ellipse itself; that would visibly change the ellipse orientation and can look like a wobbling plate rather than a wheel.

Prefer a circular internal wheel/rim projected with a steep 3D tilt and then rotated around its steering axis. The circular rim remains perspectively elliptical while asymmetric spokes/grip marks rotate inside it.

The rotating visual needs an **asymmetric index** — for example an offset spoke, grip marker or spoke pattern — because a perfectly symmetric rim does not communicate rotation clearly.

### Active feedback

On touch, the internal wheel may visually lift, become slightly less steep, grow or strengthen so it feels as though the mechanism comes toward the thumb.

Critical invariant:

> the outer input hitbox and the geometry captured at pointer-down do not move or resize during the gesture.

All active-state movement belongs to internal presentation layers.

The previous prototype used roughly +/-108 degrees of visual wheel rotation at full command. Treat that only as donor tuning. Full visual rotation, perspective angle and active lift are feel variables for the landscape polish pass.

## 6. Analog throttle and brake — gesture semantics

Provide two independent vertical analog pedals:

```text
THROTTLE: relative upward travel from pointer-down -> 0..1
BRAKE:    relative upward travel from pointer-down -> 0..1
```

Required behavior:

- touching anywhere inside a pedal's stable acquisition zone establishes that touch as local `0%`;
- upward travel progressively increases the value toward `100%`;
- moving back down reduces the value toward `0%`;
- clamp to `[0,1]`;
- freeze `originY` and usable travel at pointer-down;
- use a small start slop/dead movement region to reject unavoidable touch jitter, but tune it from device feel rather than inheriting V3 magic numbers blindly;
- release, cancel, lost capture, blur, hidden document, page hide and dispose fail closed to `0` for the owned pedal;
- pointer-capture failure must not create hidden demand;
- one pointer may own each pedal; a second pointer cannot steal an already-owned pedal.

The first landscape layout should start from the automotive ordering **BRAKE left / THROTTLE right** inside the right-hand cluster. This also places the more frequently sustained throttle closer to the outer/right thumb approach. Treat exact spacing and dimensions as owner-feel tuning, not mechanical authority.

## 7. Pedal mechanical presentation

Each pedal should have two distinct layers:

1. **stable acquisition well / hitbox** — fixed dimensions and location;
2. **mechanical pedal face** — visual element that may move, tilt, grow and change emphasis.

Desired feedback:

- analog value visibly changes the pedal face position/tilt/compression;
- active pedal may grow/lift and become more prominent;
- if exactly one pedal is active, its inactive neighbor may shrink/dim modestly;
- if throttle and brake are active simultaneously, both remain visually active — never shrink one merely because the other is pressed;
- visual grooves/segments may progressively strengthen with value, but avoid turning the pedal into a generic vertical progress bar;
- a numeric percentage is useful for development/debugging but should not be the primary production feedback.

Critical invariant:

> a pedal reading 70% remains 70% under a stationary finger even if its internal visual changes size or pose.

Do not scale or transform the element that defines initial pointer hit testing. Animate only its internal face.

## 8. D/R direction selector

Use a compact state control grouped underneath/beside the pedals, preferably a small mechanical rocker/segmented selector rather than a third full-size drive button.

```text
D <-> R
```

Requirements:

- default/reset direction is `D`;
- one authoritative input-layer state owns direction;
- presentation renders that state; presentation must never keep a second independent direction variable;
- switching direction under throttle re-emits the held throttle magnitude with the new sign at the same logical timestamp;
- brake state is unaffected;
- selector must remain usable while steering and/or a pedal pointer is active, including a third touch if the device/browser supplies it.

## 9. Multitouch and lifecycle contract

Required simultaneous combinations include:

- steering + throttle;
- steering + brake;
- throttle + brake;
- steering + throttle + D/R tap where the browser/device provides the extra pointer;
- steering + brake + D/R tap;
- throttle + brake using separate pointers.

Lifecycle rules:

- pointer capture is mandatory for continuous steering/pedal gestures;
- capture failure is fail-closed;
- release/cancel/lost capture clears only the source/pedal it owns;
- `blur`, `visibilitychange(hidden)`, `pagehide` and disposal clear owned continuous demand;
- restart/recreation cannot leave an old adapter holding direction/pedal state behind a newly reset UI;
- direction itself is persistent state during an active host lifetime, but new host/reset begins at explicit `D` unless later product design changes that rule.

## 10. UI composition and thumb zones

Preserve the strongest spatial idea visible across the old UI and V2:

```text
lower left  = primary steering instrument
lower right = primary longitudinal instrument
centre      = world/vehicle visibility
upper zones = location/camera/reset/debug and non-driving actions
```

Landscape first:

- steering and pedal clusters should feel balanced without being mirror-symmetric for its own sake;
- neither cluster should touch the extreme screen edge;
- respect safe-area insets;
- the right-side Camera/Reset/Debug rail must stay outside the sustained pedal drag zone;
- D/R must not sit directly in the normal upward drag path of a pedal;
- the main vehicle/world view should remain readable between the two thumb zones.

Portrait gets a separate layout pass after landscape feel is established. Do not shrink the landscape design blindly until it fits.

## 11. Performance constraints inherited from the A53 foundation

The accepted performance campaign showed that mobile compositing effects over the WebGL canvas can materially damage frame rate. New controls must not reintroduce that cost.

For the mobile driving surface:

- no live `backdrop-filter` over the WebGL view;
- avoid large blurred shadows/glows and expensive full-surface filters;
- prefer compositor-friendly `transform` and `opacity` for continuous feedback;
- use CSS custom properties for continuous steering/pedal visual state rather than rebuilding layout;
- freeze gesture geometry at pointer-down instead of calling layout measurement on every pointer move;
- do not perform production numeric text formatting/DOM writes on every pointer move unless a debug mode explicitly needs it;
- measure before adding visually expensive effects.

Mechanical does not mean graphically heavy. The control should feel alive through geometry and motion, not GPU-expensive decoration.

## 12. Source architecture for the implementation stage

Use normal typed private source only. No compiled-runtime patch harnesses, `replaceOnce()` surgery or alternate experimental runtime.

Preferred responsibilities:

```text
Pointer steering adapter
    -> owns one steering pointer
    -> freezes hitbox geometry at acquisition
    -> emits normalized POSITION events

Longitudinal timeline
    -> accepts digital fallback + analog throttle/brake sources
    -> deterministic timestamped integration
    -> preserves independent throttle/brake values

Pointer analog drive adapter
    -> owns pedal pointers + D/R state
    -> converts relative Y travel to analog values
    -> re-emits throttle on direction flip
    -> exposes one UI-facing state stream/callback

Mobile driving presentation
    -> renders steering/pedal/direction state
    -> owns no command semantics
    -> never redefines active gesture geometry

CleanBrowserHost / F4VehicleHost
    -> compose adapters/timelines into the existing command path

M6 vehicle controller
    -> unchanged in the control stage unless explicit physics evidence requires a separate follow-up
```

### Naming cleanup

Do not perpetuate prototype version names in normal source. Once replaced cleanly, prefer semantic names such as:

```text
pointer-steering-position-adapter.ts
pointer-analog-drive-adapter.ts
mobile-driving-ui.ts
mobile-driving-controls.css
```

Versions belong in Git/history/checkpoints, not permanent filenames such as `*-v3.ts`.

The existing V3/V3.1 and later rebuild commits are donor evidence only. Reuse individual ideas/tests after validation; do not transplant their entire host/UI stack.

## 13. Implementation sequence after foundation cleanup

### M0 — close repository foundation

- exact source identity;
- dependency/toolchain gate when canonical environment is available;
- promote cleanup foundation to `main` only after the gate;
- retire cleanup lane and redundant old branch names.

### M1 — deterministic analog core, no redesign

- extend longitudinal timeline with analog source events;
- implement separate analog pedal/D-R adapter;
- preserve existing V2 steering;
- prove simultaneous values, D/R-under-throttle, source arbitration and lifecycle behavior in focused tests.

### M2 — steering instrument, landscape

- rename/clarify steering adapter ownership if useful;
- freeze steering geometry at pointer-down;
- implement panoramic projected-wheel presentation over unchanged X-only POSITION mapping;
- validate no regression in full-lock access, recapture and release-to-neutral.

### M3 — pedal instrument + D/R, landscape

- implement fixed acquisition wells and internal mechanical pedal faces;
- add analog feedback without layout feedback loops;
- add compact D/R state control;
- tune travel, spacing and visual response on the real landscape viewport.

### M4 — owner landscape feel gate

This is the first justified pause for irreplaceable owner judgement. Test natural driving, not a patch/bootstrap mechanism.

Judge steering and pedals separately. A weak visual/feel detail causes a local iteration, not destruction of the whole input foundation.

### M5 — portrait adaptation

- preserve identical semantics;
- redesign spatial arrangement for narrow/tall use rather than scaling landscape blindly;
- retain reachable Debug, camera, reset and fullscreen behavior.

### M6 — product integration / Friends candidate

- rendered browser QA;
- canonical repository gate;
- normal source build/public artifact;
- exact source/artifact/rollback identity;
- one final device pass before promotion.

## 14. Validation contract

Before owner feel testing:

1. pure mapping/clamping tests for steering and pedals;
2. frozen-geometry tests proving layout changes do not alter an active command;
3. lifecycle tests for release/cancel/lost capture/blur/visibility/pagehide/dispose;
4. pointer-capture failure fail-closed;
5. multitouch ownership and non-stealing tests;
6. analog + digital source arbitration tests;
7. simultaneous throttle + brake preservation tests;
8. D/R-under-throttle timestamp/sign tests;
9. reset/restart single-direction-authority tests;
10. presentation tests proving visual growth/tilt does not mutate input geometry;
11. host integration through the normal source path;
12. rendered smoke and console health in the target landscape viewport before owner handoff.

For promotion to `main` / normal Friends publication, also require the repository's pinned Node/npm/TypeScript/Vite/real-Box3D gate and exact source/artifact identity.

## 15. Donor evidence, not authority

Useful historical donors remain in Git:

```text
V3.1 analog foundation: db61b6610428032e17676583dc36cf84d44e84d1
V3.1 presentation:      e651209f3e67439ed1ffeafedeb1c0f919208020
V3.1 short-landscape:   c0b3ed2223a451cdacfd79f179efd2b88be7434f
later rebuild tip:      8736a2b63441cebf9a735f5c302ffaee2b7858bf
```

Known useful donor ideas include analog timeline events, stable pedal origin/travel, source-specific release, pointer-capture hardening, multitouch lifecycle tests and separation of the analog pedal adapter from steering.

Known failure evidence includes compiled-runtime text patching, versioned parallel UI paths, broad rollback after delivery failure and coupling product acceptance to harness success.

Use Git history to recover code. Use this contract to decide whether recovered code still belongs in the product.
