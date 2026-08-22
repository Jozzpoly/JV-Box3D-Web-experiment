# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / NO ORDINARY ACTIVE PRODUCT LANE / PEDAL MECHANICAL + CONTACT-ZONE GROUNDING NEXT / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

Owner-tested tap-highlight candidate:
  a8fb118bb75c3b15fbec20bd2537d4354077a16a

accepted D/R integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

Owner-tested D/R candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

D/R RED falsifier:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

ordinary active product lane:
  NONE

Owner Preview control lane:
  preview/owner-control

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## 2. Accepted control foundations

Preserve unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; final tuning open;
- absolute-position throttle/brake mapping inside acquisition geometry frozen at pointer-down;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior;
- existing D/R sign/re-sign command semantics;
- browser tap highlight suppressed on custom mobile driving touch controls while product-owned active/focus/mechanical feedback remains visible;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. D/R multitouch — accepted close

Owner initially reproduced an A53/Chrome failure: a second finger could not switch D/R while throttle remained held.

The weakness was localized to click-dependent acquisition rather than drivetrain sign semantics. RED `9a4ed881...` reproduced the missing second-pointer contract. GREEN `3f6acc82...` added explicit D/R pointer capture/lifecycle, kept pedal/steering ownership independent, prevented pointer-generated click double-toggle and retained keyboard/assistive click fallback.

Focused causal validation passed. Owner then supplied A53/Chrome video and explicitly confirmed simultaneous throttle, brake, D/R and steering operation. Capability/reliability is accepted; ergonomic simplicity of four-finger operation is not claimed.

Mechanical integration `bd8980eb...` preserved exact D/R runtime/test blobs plus current docs and passed `windows-latest`, repo-declared Node/npm, `npm ci`, full `npm run build`; status `jv/dr-integration-close = success`.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`.

## 4. Mobile browser highlight — accepted polish

Owner video exposed an intermittent cyan/translucent whole-target overlay on the throttle control. Existing pedal CSS already disabled text selection, so browser tap feedback was the leading diagnosis.

Candidate `a8fb118b...` changed only `src/mobile-driving-polish.css` and applied `-webkit-tap-highlight-color: transparent` to custom mobile driving controls. No input semantics, hit geometry, pointer ownership, drivetrain or physics changed.

Owner A53/Chrome validation:

- cyan/blue overlay no longer appears: PASS;
- normal pedal visual feedback remains: PASS;
- steering and D/R remain functional: PASS.

Mechanical integration `86c99911...` preserves the exact Owner-tested CSS blob plus current accepted documentation.

Classification: `OWNER ACCEPTED — MOBILE TOUCH-HIGHLIGHT POLISH`.

Do not broaden this into global selection/callout suppression without new evidence.

## 5. Next stage — pedal mechanical/contact grounding

Do **not** implement automatically from this document. First ground and freeze the next falsifier.

Accepted pedal semantics stay absolute-position + frozen acquisition geometry. Open questions are now presentation/tuning:

- lower zero/contact buffer, roughly 5–10% only as an Owner hypothesis, not a specification;
- how a finger can acquire the pedal at exact zero and roll smoothly into analog actuation;
- whether the transfer curve remains linear after the contact zone;
- how presentation distinguishes `contact/acquired`, `actuation threshold crossed`, and `mechanical depression`;
- how mechanical animation remains presentation-only and cannot move the input mapping beneath the finger.

The first experiment should preserve steering, D/R, throttle/brake independence, lifecycle semantics and vehicle physics. It should not address motor power or brake balance.

## 6. Separate handling observation

Owner observed that very small brake input can dominate full throttle and that the vehicle is broadly underpowered. Keep this for a dedicated longitudinal/handling stage, not pedal contact/mechanical presentation.

## 7. Living roadmap

Current recommendation:

1. pedal mechanical feedback + neutral/contact-zone grounding and smallest falsifier;
2. after evidence, integrate only accepted pedal tuning/presentation;
3. desktop/mobile capability hygiene;
4. portrait-specific composition;
5. steering/pedal industrial-design convergence and later steering feel tuning;
6. later JURE/rig/handling, including motor/brake balance;
7. performance scaling only from measured need.

No fixed P-stage scheduler.
