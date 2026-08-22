# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH ACCEPTED IN MAIN / MOBILE TAP-HIGHLIGHT POLISH ACTIVE / PEDAL TUNING OPEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted D/R integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

Owner-tested D/R runtime candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

D/R RED falsifier:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active ordinary product lane:
  work/mobile-touch-highlight-polish@a8fb118bb75c3b15fbec20bd2537d4354077a16a

Owner Preview pointer source:
  a8fb118bb75c3b15fbec20bd2537d4354077a16a

Owner Preview JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## 2. Accepted control foundations

Preserve unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; tuning open;
- absolute-position throttle/brake mapping inside geometry frozen at pointer-down;
- immediate represented pedal value at acquisition;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R as an explicit pointer-owned control that works while other continuous controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior;
- existing D/R sign/re-sign command semantics;
- Camera Manual Rig V1, Fullscreen V1, current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 3. D/R multitouch close — accepted

Owner previously observed on Samsung Galaxy A53 / Chrome that D/R did not switch while throttle was held by another finger.

Root cause was localized to acquisition: old D/R handling stopped `pointerdown` propagation but depended on later browser `click`. Existing tests injected `click()` and therefore did not prove second-finger pointer acquisition.

RED `9a4ed881...` modeled a held throttle pointer plus a second D/R `pointerdown -> pointerup`; old source failed as expected.

GREEN `3f6acc82...` introduced a scoped D/R pointer lifecycle:

- one explicit pointer capture;
- owned pointerup toggles;
- pointercancel/lost capture/lifecycle loss releases without toggling;
- pedal/steering pointers remain independently owned;
- pointer-generated click cannot double-toggle;
- keyboard/assistive click fallback remains;
- held-throttle re-sign path remains unchanged.

Focused exact-candidate validation passed with repo-declared toolchain, `npm ci`, typecheck, D/R tests, analog-drive, viewport lifecycle, host analog contract and mobile integration; status `jv/dr-multitouch-causal = success`.

Owner then supplied A53/Chrome video evidence and explicitly confirmed that throttle, brake, D/R and steering can all be operated concurrently. Ease of four-finger operation is not claimed; capability/reliability is accepted.

Mechanical integration candidate `bd8980eb...` preserved exact D/R runtime/test blobs plus current docs and passed `windows-latest`, repo-declared Node/npm, `npm ci`, full `npm run build`; status `jv/dr-integration-close = success`.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`.

## 4. Active mobile tap-highlight regression

The same Owner video shows an intermittent cyan/translucent overlay covering the throttle touch target around the reported ~13 s region. The overlay is visually distinct from the pedal's own fill/mechanical state.

Current pedal CSS already uses `user-select: none` and `-webkit-user-select: none`, so actual text selection is not the leading hypothesis. The observed whole-target overlay is more consistent with browser tap feedback.

Active candidate `a8fb118b...` changes only `src/mobile-driving-polish.css` and adds `-webkit-tap-highlight-color: transparent` to `.mobile-control` and `.mobile-steering-joystick` on the mobile/coarse-pointer surface. It does not change input semantics, hit geometry, pointer ownership, physics or custom active/focus presentation.

Classification: `OWNER OBSERVED — MOBILE BROWSER HIGHLIGHT ARTIFACT / ROOT CAUSE HYPOTHESIS: TAP HIGHLIGHT / CANDIDATE SELECTED ON PREVIEW / OWNER VERDICT OPEN`.

Do not broaden this to callout suppression, JS event interception or global selection rules unless A53 evidence shows the narrow fix is insufficient.

## 5. Pedal tuning remains later

Absolute-position pedals are accepted. Future tuning remains intentionally separate:

- lower zero/contact buffer, roughly 5–10% as a hypothesis rather than a frozen spec;
- smooth contact-to-actuation transition;
- final value curve;
- mechanical pedal feedback and industrial design.

## 6. Longitudinal handling remains separate

Owner observed that small brake input can dominate full throttle and that the vehicle is broadly underpowered. Keep this for a dedicated longitudinal/handling stage; do not mix it into touch polish or pedal presentation.

## 7. Living roadmap

Current recommendation:

1. verify/remove the mobile browser highlight artifact on A53;
2. if PASS, integrate that CSS-only polish and restore a clean no-active-lane baseline;
3. pedal mechanical feedback + neutral/contact-zone tuning;
4. desktop/mobile capability hygiene;
5. portrait-specific composition;
6. steering/pedal industrial-design convergence and later steering feel tuning;
7. later JURE/rig/handling, including motor/brake balance;
8. performance scaling only from measured need.

No fixed P-stage scheduler.
