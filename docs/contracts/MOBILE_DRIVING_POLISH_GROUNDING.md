# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL MECHANICAL + CONTACT-ZONE GROUNDING NEXT / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules. It does not define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Accepted foundations

```text
steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

D/R multitouch integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc
```

Protect:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`;
- absolute-position pedals with acquisition geometry frozen at pointer-down;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed continuous-control lifecycle;
- core D/R sign/re-sign semantics;
- product-owned active/focus/mechanical feedback without browser tap-highlight overlay;
- Camera, Fullscreen, Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53 performance boundary.

## 2. D/R multitouch — accepted boundary

Original A53 failure: hold throttle with one finger, operate D/R with another -> no switch.

Old implementation depended on browser `click` after D/R `pointerdown`. RED `9a4ed881...` proved that this was not a true second-pointer contract.

GREEN `3f6acc82...` established explicit D/R pointer capture, owned pointerup toggle, fail-closed cancellation/lifecycle release, independent pedal/steering ownership, double-toggle protection and keyboard/assistive click fallback. Command/sign semantics remained in the existing toggle path.

Focused candidate validation passed. Owner A53/Chrome video then confirmed simultaneous throttle, brake, D/R and steering. Integration `bd8980eb...` preserved exact D/R runtime/test blobs and passed full Windows repository build.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION`.

## 3. Mobile browser tap highlight — accepted polish

Owner recording exposed an intermittent cyan/translucent whole-target overlay over the throttle control. Existing pedal CSS already disabled user selection, making browser tap feedback the narrow leading diagnosis.

Candidate `a8fb118b...` changed only mobile driving polish CSS and set `-webkit-tap-highlight-color: transparent` on custom mobile controls and the steering touch surface.

Owner A53/Chrome re-test confirmed:

- cyan highlight no longer appears;
- custom pedal visual feedback remains;
- steering and D/R remain functional.

Integration `86c99911...` mechanically preserves the exact Owner-tested CSS with current accepted source history.

Classification: `OWNER ACCEPTED — MOBILE TOUCH-HIGHLIGHT POLISH`.

Do not generalize this into global selection/callout suppression without new evidence.

## 4. Next grounding target — pedal contact + mechanical feedback

Absolute-position pedal semantics are accepted. The next problem is not choosing a mapping model again; it is making **zero contact, onset of actuation and mechanical depression** coherent and legible.

Owner intent to preserve:

1. a finger should be able to acquire the lower pedal area at exact command zero;
2. moving through the initial region should transition smoothly into analog actuation;
3. roughly the lower 5–10% as zero/contact space is only a hypothesis to test;
4. the control should communicate `acquired/contact` before it communicates `pressed/actuating`;
5. visual/mechanical depression should track command without changing the frozen acquisition geometry used by input mapping;
6. full analog range and current multitouch ownership must remain available.

### What is open

- exact contact-zone size;
- whether the transition after the zone is linear or slightly shaped;
- visual language for contact versus actuation;
- mechanical travel amount and easing;
- whether throttle and brake should share one mechanical law or later diverge stylistically.

### What is protected

Do not change in this slice unless evidence forces it:

- steering modes or feel;
- D/R acquisition/sign semantics;
- throttle/brake independence;
- lifecycle fail-closed behavior;
- drivetrain, motor power, brake torque or vehicle physics;
- rig/JURE authority.

### Minimum falsifier direction

Prefer one small experiment that lets the Owner test:

- touch at the bottom -> exact zero without a jump;
- slowly roll through contact threshold -> smooth low-value onset;
- micro-adjust around threshold;
- reach full pedal range;
- release -> exact zero;
- steering + pedal and throttle + brake multitouch remain intact;
- presentation clearly distinguishes contact from actuation without moving the input scale.

Do not freeze the 5–10% number before device evidence.

## 5. Longitudinal handling — separate

Small brake input dominating full throttle and broad low vehicle power belong to a dedicated handling/longitudinal slice. They are not evidence against the accepted pedal input foundation and should not be mixed into contact/mechanical presentation.

## 6. Fault localization

```text
cyan overlay on custom touch control    -> browser/touch presentation polish (accepted fix exists)
D/R second-finger intent missed         -> D/R pointer acquisition/lifecycle
D/R event arrives but sign is wrong     -> D/R command semantics
gas drops during unrelated D/R touch    -> pointer ownership/lifecycle
cannot acquire pedal at exact zero      -> pedal contact-zone tuning
pedal value correct but contact unclear -> pedal presentation/mechanical feedback
small brake overwhelms full throttle    -> handling/longitudinal
```

## 7. Living sequence

- pedal mechanical/contact-zone grounding -> smallest falsifier;
- accept/reject/tune from Owner device evidence;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- later JURE/rig/handling;
- performance only from measured need.
