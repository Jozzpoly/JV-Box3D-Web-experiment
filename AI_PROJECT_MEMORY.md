# AI project memory — JV Web

Updated: 2026-08-22
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL CONTACT V1-V1.1 NOT ACCEPTED + DEFERRED / NO ORDINARY ACTIVE LANE / DESKTOP-MOBILE CAPABILITY HYGIENE NEXT / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted tap-highlight integration executable: `86c99911a878136abee6485c88cd3ca2a18ed9fc`;
- accepted D/R integration executable: `bd8980eba3e62b5a4b48df528be2db275addf7b4`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- ordinary active product lane: none;
- Preview control lane: `preview/owner-control`;
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

## Pedal contact experiment — durable outcome

V1 `8690368a...` and V1.1 `6312906d...` explored a nominal 10% lower zero/contact region while preserving accepted absolute-position semantics elsewhere.

Machine checks were green and live-identity probes proved the expected candidates were actually served by Preview. On Samsung Galaxy A53 / Chrome the Owner could detect a zero region, but judged its practical effect tiny and not worth further tuning/presentation effort.

Classification:

`OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED`

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Accepted absolute-position pedals remain the product baseline. Revisit only if later pedal geometry/industrial design materially changes the value of the idea.

## Next work

Ground **desktop/mobile capability hygiene** before implementation.

Inventory concrete controls and functions and classify each as:

- shared and useful on both;
- mobile-only;
- desktop-only;
- shared capability needing different presentation;
- unclear / requires Owner evidence.

Do not begin with blanket CSS hiding. Pick the smallest high-confidence mismatch after the inventory.

## Later boundaries

- portrait composition;
- steering/pedal industrial-design convergence and later steering feel;
- small brake dominating full throttle / low power -> longitudinal handling;
- later JURE/rig/handling;
- Friends/Public does not auto-advance with source.
