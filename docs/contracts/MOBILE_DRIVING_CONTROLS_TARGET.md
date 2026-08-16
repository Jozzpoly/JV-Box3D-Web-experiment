# JV Web — mobile driving controls target

Status: `PRODUCT TARGET / IMPLEMENTATION PAUSED DURING FOUNDATION CLEANUP`
Owner: Jozz
Recovered and normalized: 2026-08-16

This is the durable interaction target recovered from owner feedback and the V2/V3 experiments. It is **not** authority for final vehicle rig geometry, steering physics or handling. It defines what the browser/mobile input layer should deliver when implementation resumes.

## 1. Product intent

Touch driving should become deliberately enjoyable and automotive rather than looking like a generic mobile gamepad.

Preserve the proven precision of Steering Control V2, then add richer mechanical visual feedback without allowing animation or layout changes to alter the command under the finger.

The implementation must remain easy to extend with later sensitivity tuning, haptics and alternative presentation, but there should be one normal production input path rather than parallel experimental runtimes.

## 2. Steering — preserved input semantics

The accepted V2 foundation remains the behavioral baseline:

```text
one thumb
horizontal X-only POSITION
normalized command [-1, +1]
release/cancel/lifecycle loss -> neutral 0
current product full-lock bridge -> approximately +/-35 degrees at the wheels
```

The current V2 adapter maps the pointer's absolute horizontal position inside the fixed control hitbox to `[-1,+1]`, with a small center dead zone. That mapping is the starting behavior because the owner accepted its feel. Sensitivity/dead-zone changes are later tuning questions, not part of the cleanup stage.

The old circular joystick metaphor must not return: it visually suggests a Y axis that does nothing.

Layout requirements:

- remove obsolete left/right steering buttons from the mobile driving surface;
- keep the steering control away from the extreme bottom/left screen edges and respect safe areas;
- remain reachable in portrait and landscape without consuming excessive world view.

## 3. Steering — target presentation

The preferred direction is the hybrid developed from the owner's feedback:

- a very wide, shallow steering-wheel arc / ellipse, viewed from above or at a steep angle;
- the physical gesture remains the proven X-only control;
- an internal wheel/mechanical layer rotates with steering command so the player immediately sees how much steering is applied;
- active-state emphasis may enlarge/lift the **internal visual mechanism**, but must not resize or move the hitbox used for command calculation during the gesture.

The previous prototype used roughly +/-108 degrees of visual wheel rotation at full command. Treat that as useful donor tuning only, not an accepted product constant.

The steering presentation and the steering input calculation must remain separate modules/boundaries. Presentation must not query or redefine input geometry during an active gesture.

## 4. Analog throttle and brake

Provide two independent vertical analog pedals:

```text
THROTTLE: relative upward travel from pointer-down -> 0..1
BRAKE:    relative upward travel from pointer-down -> 0..1
```

Required gesture semantics:

- touching a pedal establishes that touch position as local `0%` rather than jumping to an absolute value;
- moving the thumb upward progressively increases demand toward `100%`;
- moving back downward reduces demand toward `0%`;
- clamp the command to `[0,1]`;
- freeze the gesture origin and usable travel geometry at pointer-down;
- release, pointer cancel, lost capture, window blur, hidden document, page hide and dispose must fail closed to `0` for the owned pedal;
- pointer-capture failure must not create hidden demand.

Throttle and brake have independent pointer ownership. The system must support:

- steering + throttle simultaneously;
- steering + brake simultaneously;
- throttle + brake simultaneously when separate pointers own them.

Existing keyboard/digital demand remains a valid fallback. When explicit digital longitudinal demand is active, preserve its current priority over analog demand unless later product evidence justifies a different arbitration rule.

## 5. Pedal feedback

The controls should visually behave like mechanical pedals rather than plain buttons/sliders.

Desired feedback:

- the active pedal grows/lifts/becomes visually stronger;
- the neighboring inactive pedal may shrink and/or dim;
- pedal face/travel/fill should visibly follow the analog value;
- a percentage/value readout is allowed when it helps tuning or comprehension.

Critical invariant: **all of this feedback is presentation only**. A pedal that reads `70%` must remain `70%` if its visual size changes under a stationary thumb.

## 6. D / R direction selector

Replace the eventual separate reverse-drive button with a compact direction state selector:

```text
D <-> R
```

Owner decision: for now, allow D/R switching while throttle is held and regardless of vehicle speed. Do **not** add neutral, forced pedal release, speed interlocks or automatic safety lockouts unless real driving demonstrates that they are needed. The permissive behavior may enable useful or fun mechanics.

When direction changes while analog throttle is already active, the active throttle demand must immediately follow the selected direction from that input timestamp.

The input adapter and the visible selector must share one authoritative direction state. Reset/restart must not allow a UI state such as `D` while the command layer still behaves as `R`. Default start/reset direction is `D` unless the product later defines another explicit state.

## 7. Existing capabilities that this work must not regress

Preserve:

- Steering Control V2 precision and release-to-neutral behavior;
- recoverable mobile Debug open/close behavior;
- Fullscreen V1 on phone and desktop;
- Camera Manual Rig V1 and manual calibration freedom;
- the accepted A53 render-1x performance foundation;
- the current temporary ~35-degree JV-Web steering range;
- vehicle/Box3D drive physics unless the control task proves a physics change is necessary.

The 35-degree mapping is a temporary JV-Web product bridge, not final JURE/rig truth.

## 8. Architecture boundary

Implementation resumes in normal typed private source. No product control feature may depend on text replacement or runtime surgery against compiled `main.js`.

The failed public V3 gate produced:

```text
Driving V3 pedal reset: expected source fragment not found
```

That failure came from brittle delivery/patch-harness assumptions, not from owner rejection of the control concept. Do not repeat the `replaceOnce()`/compiled-runtime patching approach.

Preferred ownership:

```text
pointer/device adapters
    -> deterministic steering/longitudinal timelines
    -> normal host command path
    -> existing vehicle/physics layer

presentation/UI
    <- receives normalized control state for feedback
    X must not redefine active input geometry
```

Keep steering, analog longitudinal input, D/R state and presentation independently testable even when they are composed into one mobile HUD.

## 9. Validation contract for the next implementation stage

Before owner device testing:

1. focused pure tests for steering/pedal mapping and clamping;
2. lifecycle tests for release/cancel/lost capture/blur/visibility/pagehide/dispose;
3. pointer-capture failure must fail closed;
4. multitouch ownership tests;
5. D/R-under-throttle timestamp/state tests;
6. presentation invariant tests proving visual growth does not mutate gesture geometry;
7. host integration tests using the normal source path;
8. rendered browser smoke in portrait + short landscape + desktop where relevant.

For promotion to `main` / normal Friends publication, also require the repository's canonical Node/npm/TypeScript/Vite/real-Box3D gate and exact source/artifact identity.

Owner device validation remains the final gate for feel. Steering and pedals should be judged independently; one subsystem may pass while the other needs another iteration.

## 10. Donor evidence, not authority

Useful historical donor commits remain in Git and may be mined selectively:

```text
V3.1 analog foundation: db61b6610428032e17676583dc36cf84d44e84d1
V3.1 presentation:      e651209f3e67439ed1ffeafedeb1c0f919208020
V3.1 short-landscape:   c0b3ed2223a451cdacfd79f179efd2b88be7434f
later rebuild tip:      8736a2b63441cebf9a735f5c302ffaee2b7858bf
```

These are sources of tested ideas and failure evidence. None of them should be copied wholesale or treated as current product authority merely because they are newer than the clean pre-V3 foundation.
