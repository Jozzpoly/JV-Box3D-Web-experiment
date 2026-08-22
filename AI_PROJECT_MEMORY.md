# AI project memory — JV Web

Updated: 2026-08-22
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL CONTACT + MECHANICAL V1.1 ACTIVE / FIRST OWNER ATTEMPT INCONCLUSIVE ON OBSERVABILITY / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted tap-highlight integration executable: `86c99911a878136abee6485c88cd3ca2a18ed9fc`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- active lane: `work/pedal-contact-mechanics@6312906d5ad3c6781605859cd1d9613d7f2e220a`;
- pedal contact RED: `6e228f103148b88c78f46a7cfc56bf2a0020c2c7`;
- pedal contact logic GREEN: `0c259fe67d10c1a23479968fd0ab86f2d7bfce35`;
- machine-green V1: `8690368aa19242bb37b9476737ee9b1f5374724a`;
- live V1.1: `6312906d5ad3c6781605859cd1d9613d7f2e220a`;
- Preview source: `6312906d5ad3c6781605859cd1d9613d7f2e220a`;
- Preview JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/Public: `279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted mobile driving foundations

- `Obrót / DIRECT_ROTATION` + `Przeciąganie / RELATIVE_X`; steering tuning open;
- absolute-position pedals with frozen pointer-down geometry;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer lifecycle while other controls remain held;
- fail-closed lifecycle and current D/R sign/re-sign semantics;
- tap-highlight suppression on custom touch controls;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition, Plac E2R, Offroad, JSPREV2 and accepted A53 render-1x boundary.

## Active pedal falsifier

`Pedal Contact + Mechanical Feedback V1.1` is **not accepted yet**.

Input model remains:

- lower 10% of frozen pedal height = exact-zero contact space;
- remaining 90% rescaled linearly to full 0..1;
- `data-active` = contact/ownership;
- `data-actuated` = real actuation above zero;
- contact-only does not dim peer or mechanically depress the pedal;
- outer input geometry remains stable.

Evidence path:

- RED `6e228f10...` failed on accepted baseline;
- logic GREEN `0c259fe...` followed a test-only float tolerance correction;
- V1 `8690368a...` passed typecheck, focused analog/UI/lifecycle/host/D-R integration suites and bundle build;
- first Owner A53 attempt said the change was not meaningfully visible;
- live-identity probe proved exact V1 was actually served, so deployment/cache was ruled out;
- recording review classified V1 as `INCONCLUSIVE — OBSERVABILITY/DISCOVERABILITY INSUFFICIENT`, not product failure;
- V1.1 `6312906d...` keeps mapping unchanged and changes only CSS to make the lower 10% contact shelf and contact-only state explicit;
- a second live-identity probe confirmed exact V1.1 is live; helper was removed.

Owner device evidence is now required. Do not integrate before it.

## Owner questions

- is the contact shelf visibly discoverable?
- can the pedal be acquired there at exact zero?
- is 0 -> low analog roll-in smooth?
- does repeated threshold crossing chatter?
- is 100% still practical?
- is contact visually distinct from real actuation?
- do throttle+brake, steering+pedal and pedal+D/R still work?

Possible next action depends on evidence: accept/integrate, retune only zone size, adjust only presentation, add hysteresis only if chatter is real, or reject.

## Later boundaries

- small brake dominating full throttle / low power -> longitudinal handling;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel;
- later JURE/rig/handling;
- Friends/Public does not auto-advance with source.
