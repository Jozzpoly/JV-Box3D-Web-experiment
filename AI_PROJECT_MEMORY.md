# AI project memory — JV Web

Updated: 2026-08-22
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH ACCEPTED IN MAIN / MOBILE TAP-HIGHLIGHT POLISH ACTIVE / PEDAL TUNING OPEN / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- Owner-tested D/R candidate: `3f6acc821c9db9d4cd77845b8eb81f4625aaaef7`;
- D/R RED anchor: `9a4ed88113eea28ff14a0bc410843122c3bd6dbd`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- active lane: `work/mobile-touch-highlight-polish@a8fb118bb75c3b15fbec20bd2537d4354077a16a`;
- Owner Preview pointer source: `a8fb118bb75c3b15fbec20bd2537d4354077a16a`;
- Preview JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/Public: `279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted foundations

- dual-mode steering: `Obrót / DIRECT_ROTATION` + `Przeciąganie / RELATIVE_X`; tuning open;
- absolute-position pedals with frozen acquisition geometry and immediate represented value; contact-zone/value-curve/mechanical tuning open;
- independent throttle/brake pointers and steering+pedal multitouch;
- D/R explicit pointer ownership/lifecycle, with held-throttle re-sign semantics preserved;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition, Plac E2R, Offroad, JSPREV2 and accepted A53 render-1x boundary.

## D/R close

Old D/R depended on browser `click` after `pointerdown`, so second-finger multitouch was not a real pointer contract.

- RED `9a4ed881...`: held throttle + second D/R pointer failed.
- GREEN `3f6acc82...`: explicit D/R capture/pointerup toggle, cancel/lost-capture fail-closed, no double-toggle, keyboard click fallback; focused causal suites PASS.
- Owner A53/Chrome video: throttle + brake + D/R + steering can coexist; Owner explicitly says this is the required capability.
- integration `bd8980eb...`: exact D/R runtime/test blobs + current docs; Windows full `npm run build` PASS, status `jv/dr-integration-close = success`.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`.

## Active highlight polish

Owner video also shows an intermittent cyan overlay on the throttle touch target around ~13 s. Pedals already disable text selection, and the whole-target translucent overlay is more consistent with browser tap highlight than product fill state.

Candidate `a8fb118b...` is CSS-only: on mobile/coarse-pointer surfaces, `.mobile-control` and `.mobile-steering-joystick` use `-webkit-tap-highlight-color: transparent`. No pointer/input/physics change.

Owner Preview selects the candidate. Owner A53 verdict is open. If the artifact remains, do not blindly add broader callout/selection suppression; re-ground the actual mechanism.

## Later boundaries

- pedal lower zero/contact buffer ~5–10% is only a tuning hypothesis;
- pedal mechanical feedback should distinguish contact from actuation;
- brake dominance / low power is later handling;
- Friends/Public does not auto-advance with source.

## Roadmap

`touch-highlight Owner check + close -> pedal mechanical feedback + neutral/contact tuning -> desktop/mobile hygiene -> portrait -> control industrial-design convergence -> later JURE/rig/handling`

Performance only from measured need.
