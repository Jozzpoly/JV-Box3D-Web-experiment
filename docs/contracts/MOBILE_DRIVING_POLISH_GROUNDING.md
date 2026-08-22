# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / PEDAL CONTACT + MECHANICAL V1 ACTIVE ON PREVIEW / OWNER DEVICE VERDICT OPEN / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
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
- accepted absolute-position pedals with acquisition geometry frozen at pointer-down;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed continuous-control lifecycle;
- core D/R sign/re-sign semantics;
- product-owned active/focus/mechanical feedback without browser tap-highlight overlay;
- Camera, Fullscreen, Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53 performance boundary.

## 2. Accepted recent boundaries

D/R multitouch is accepted. RED `9a4ed881...` proved old click-only acquisition was not a true second-pointer contract. GREEN `3f6acc82...` established explicit D/R pointer lifecycle. Owner A53/Chrome video confirmed simultaneous throttle, brake, D/R and steering. Integration `bd8980eb...` preserved exact runtime/test blobs and passed full Windows repository build.

Mobile browser tap-highlight polish is accepted. Candidate `a8fb118b...` added only `-webkit-tap-highlight-color: transparent` on custom mobile touch controls; Owner A53/Chrome confirmed the cyan overlay disappeared while product feedback, steering and D/R remained functional. Integration `86c99911...` carries the exact accepted CSS.

## 3. Active Pedal Contact + Mechanical Feedback V1

Accepted absolute-position mapping remains the baseline. Active candidate:

```text
work/pedal-contact-mechanics@8690368aa19242bb37b9476737ee9b1f5374724a
```

The experiment is deliberately small and combines contact semantics with enough presentation to avoid lying to the Owner during feel validation.

### V1 semantics

- frozen acquisition geometry remains authoritative for the whole gesture;
- lower **10%** of that height is zero/contact space;
- pointer capture and `active=true` are valid in the contact zone while command stays exactly `0`;
- above the threshold the remaining 90% maps linearly to the full `0..1` range;
- full pedal input at the top remains `1`;
- no hysteresis is added in V1; only device evidence may justify it later.

The 10% value is an **experimental falsifier value**, chosen to be easy to hit on a phone. It is not an accepted tuning constant.

### V1 presentation

The existing state path already separates pointer ownership from analog value. Candidate formalizes that distinction for presentation:

- `data-active` = acquired/contact;
- derived `data-actuated` = acquired with value above zero;
- contact-only state may highlight ownership but must not mechanically depress the pedal;
- one contact-only pedal must not dim its peer as though it were producing demand;
- only inner mechanism/face/fill may follow `--pedal-value`;
- outer `.mobile-pedal` acquisition geometry must stay fixed.

This is **not** final pedal industrial design.

### Evidence

- RED `6e228f10...` failed the new contract on accepted old semantics as expected;
- first logic run: compile/typecheck PASS, UI PASS, analog FAIL from over-strict IEEE-754 exact comparison in the new test oracle;
- test-only tolerance correction yielded logic GREEN `0c259fe...` with compile/analog/UI PASS;
- exact final candidate `8690368a...` passed typecheck, analog-drive, mobile-driving-ui, mobile-driving integration, viewport lifecycle, clean-browser analog contract, D/R multitouch regression and bundle build; status `jv/pedal-contact-causal = success`;
- temporary validation helper was retired after the result;
- Owner Preview selects exact `8690368a...` plus the accepted JSPREV2 layer.

Classification: `TECHNICALLY GREEN / OWNER DEVICE VERDICT OPEN`.

## 4. Owner falsifier

On Samsung Galaxy A53 / Chrome:

1. touch near the pedal bottom and verify exact zero can be held while contact is visibly acknowledged;
2. roll slowly upward and judge whether zero-to-low-value onset is smooth;
3. cross the threshold repeatedly in both directions and report any chatter/jitter;
4. confirm full input remains easy to reach;
5. judge whether contact and actual mechanical depression are visually distinct enough;
6. regression smoke throttle+brake, steering+pedal and pedal+D/R.

Do not ask the Owner to judge motor power or brake dominance in this slice.

Possible outcomes:

- `PASS` -> preserve model and prepare integration close;
- `GOOD MODEL / WRONG ZONE` -> change only the contact-zone size;
- `THRESHOLD CHATTER` -> consider one minimal hysteresis falsifier;
- `VISUAL UNCLEAR` -> preserve input and change only presentation;
- `REJECT` -> return to accepted `main`.

## 5. Longitudinal handling — separate

Small brake input dominating full throttle and broad low vehicle power belong to a dedicated handling/longitudinal slice. They are not evidence against the accepted pedal input foundation and must not be mixed into contact/mechanical presentation.

## 6. Fault localization

```text
cyan overlay on custom touch control    -> browser/touch presentation polish (accepted fix exists)
D/R second-finger intent missed         -> D/R pointer acquisition/lifecycle
gas drops during unrelated D/R touch    -> pointer ownership/lifecycle
cannot acquire pedal at exact zero      -> pedal contact-zone tuning
contact looks like pressure at zero      -> pedal presentation state separation
threshold chatters under slow finger     -> possible contact-zone hysteresis, only after device evidence
pedal value correct but looks wrong      -> pedal presentation/mechanical feedback
small brake overwhelms full throttle     -> handling/longitudinal
```

## 7. Living sequence

- Owner-test active pedal contact/mechanical V1;
- accept/tune/reject from device evidence;
- if accepted, structural integration close;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- later JURE/rig/handling;
- performance only from measured need.
