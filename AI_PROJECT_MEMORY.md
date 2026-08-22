# AI project memory — JV Web

Updated: 2026-08-22
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED IN MAIN / NO ORDINARY ACTIVE LANE / PEDAL MECHANICAL + CONTACT-ZONE GROUNDING NEXT / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted tap-highlight integration executable: `86c99911a878136abee6485c88cd3ca2a18ed9fc`;
- Owner-tested tap-highlight candidate: `a8fb118bb75c3b15fbec20bd2537d4354077a16a`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- Owner-tested D/R candidate: `3f6acc821c9db9d4cd77845b8eb81f4625aaaef7`;
- D/R RED anchor: `9a4ed88113eea28ff14a0bc410843122c3bd6dbd`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- ordinary active product lane: none;
- Preview control lane: `preview/owner-control`;
- Preview JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/Public: `279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted mobile driving foundations

- dual-mode steering: `Obrót / DIRECT_ROTATION` + `Przeciąganie / RELATIVE_X`; tuning open;
- absolute-position pedals with frozen acquisition geometry; lower contact/zero zone, value curve and mechanical presentation open;
- independent throttle/brake pointer ownership;
- steering + pedal multitouch;
- D/R explicit pointer acquisition/lifecycle while other controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior;
- current D/R sign/re-sign semantics;
- browser tap highlight suppressed on custom mobile driving controls while product-owned feedback remains;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition, Plac E2R, Offroad, JSPREV2 and accepted A53 render-1x boundary.

## D/R durable result

Old click-only acquisition was not reliable for a non-primary second touch. RED `9a4ed881...` reproduced the problem. GREEN `3f6acc82...` added explicit D/R pointer capture/lifecycle without redesigning drivetrain semantics. Focused checks passed; Owner A53/Chrome video confirmed simultaneous throttle, brake, D/R and steering. Integration `bd8980eb...` passed the full Windows repository build.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`.

## Tap-highlight durable result

Owner video showed an intermittent cyan whole-target overlay on a pedal. Existing controls already disabled text selection; narrow candidate `a8fb118b...` added only `-webkit-tap-highlight-color: transparent` to custom mobile driving controls.

Owner A53/Chrome re-test: overlay gone, normal pedal feedback preserved, steering/D/R preserved. Integration `86c99911...` carries exact accepted CSS.

Classification: `OWNER ACCEPTED — MOBILE TOUCH-HIGHLIGHT POLISH`.

## Next work

Ground **pedal mechanical feedback + contact/zero semantics** before implementation.

Owner intent:

- allow acquisition at exact zero near the lower pedal area;
- roll smoothly from contact into analog actuation;
- treat roughly 5–10% lower zero/contact space as a hypothesis, not frozen spec;
- distinguish contact, actuation threshold and mechanical depression visually;
- never let presentation animation redefine input geometry under the finger.

Keep motor/brake balance, vehicle physics, D/R, steering and rig out of that slice.

## Later boundaries

- small brake dominating full throttle / low power -> later longitudinal handling;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel;
- later JURE/rig/handling;
- Friends/Public does not auto-advance with source.
