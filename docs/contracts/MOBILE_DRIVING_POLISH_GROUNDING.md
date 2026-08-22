# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH ACCEPTED / MOBILE TAP-HIGHLIGHT POLISH ACTIVE / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
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
```

Protect:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`;
- absolute-position pedals with frozen acquisition geometry and immediate represented value;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed continuous-control lifecycle;
- core D/R sign/re-sign semantics;
- Camera, Fullscreen, Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53 performance boundary.

## 2. D/R multitouch — accepted boundary

Original Owner A53 failure: hold throttle with one finger, operate D/R with another -> D/R did not switch.

Old implementation:

```text
D/R pointerdown -> stop propagation only
browser click   -> actual toggle
```

RED `9a4ed881...` proved that this was not a true second-pointer contract.

GREEN `3f6acc82...` established:

- D/R pointerdown captures one explicit pointer;
- only owned pointerup toggles;
- cancel/lost capture/lifecycle loss clears without toggle;
- throttle/brake/steering pointers remain independent;
- pointer-generated click cannot double-toggle;
- keyboard/assistive click fallback remains;
- command/sign semantics stay in the existing toggle path.

Focused candidate validation passed. Owner then supplied Samsung Galaxy A53 / Chrome video and explicitly confirmed simultaneous throttle, brake, D/R and steering operation. Ergonomic simplicity of four-finger use is not claimed; capability is accepted.

Integration `bd8980eb...` preserves exact D/R runtime/test blobs and passed full Windows repository build.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION`.

## 3. Active browser highlight regression

The same Owner recording shows an intermittent cyan/translucent overlay over the throttle touch target around the reported ~13 s region.

Pedals already declare `user-select: none` and `-webkit-user-select: none`. The artifact covers the full touch target and does not match the product fill/mechanical state. Leading hypothesis: browser tap highlight rather than actual text selection.

Active candidate:

```text
work/mobile-touch-highlight-polish@a8fb118bb75c3b15fbec20bd2537d4354077a16a
```

It changes only `src/mobile-driving-polish.css` and sets `-webkit-tap-highlight-color: transparent` on `.mobile-control` and `.mobile-steering-joystick` inside the mobile/coarse-pointer polish surface.

Preserve our own custom feedback: `data-active`, mechanical pedal fill/depression cues, D/R state and `:focus-visible`. Do not globally suppress selection/callouts or add JS interception unless A53 evidence shows the narrow fix fails.

Owner A53 verdict on this candidate is still required because the failure and fix are browser/device presentation behavior.

## 4. Pedal neutral/contact tuning — later

Absolute-position pedal semantics are accepted. Owner wants the ability to touch at exact zero and roll smoothly into actuation. Rough lower 5–10% zero/contact buffer remains a hypothesis, not a frozen value.

Future mechanical feedback should make three states legible:

1. acquired/contact;
2. actuation threshold crossed;
3. mechanical depression proportional to command.

Animated geometry must remain presentation-only.

## 5. Longitudinal handling — later

Small brake input dominating full throttle and broad low vehicle power belong to a dedicated handling/longitudinal slice, not touch polish or pedal presentation.

## 6. Fault localization

```text
cyan overlay on custom touch control    -> browser/touch presentation polish
D/R second-finger intent missed          -> D/R pointer acquisition/lifecycle
D/R event arrives but sign is wrong      -> D/R command semantics
gas drops during unrelated D/R touch     -> pointer ownership/lifecycle
cannot acquire pedal at exact zero       -> pedal contact-zone tuning
pedal value correct but looks wrong      -> pedal presentation
small brake overwhelms full throttle     -> handling/longitudinal
```

## 7. Living sequence

- verify/close the mobile browser highlight artifact;
- pedal mechanical feedback + neutral/contact tuning;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- later JURE/rig/handling;
- performance only from measured need.
