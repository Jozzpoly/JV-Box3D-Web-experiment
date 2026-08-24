# JV Web — takeover handoff

Updated: 2026-08-24
Status: `HANDOFF SNAPSHOT / JV-WEB PRIORITY HEIR / CURRENT CONTROL + UI FOUNDATIONS ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / DONOR CLOSURE + CROSS-PROJECT SYNTHESIS + PRE-CODEX HARDENING IN PROGRESS / FINAL CODEX HANDOFF NOT YET FROZEN`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Resolve any ordinary branch actually ahead of source `main` and any open PR before assuming the work queue is empty.
5. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
6. Do not revive closed steering, pedal, D/R, tap-highlight, desktop-capability/HUD or pedal-contact experiments merely because historical refs remain visible.
7. Do not treat JV_CORE/Native or JURE as JV-Web source authority. Donor evidence must be independently grounded and deliberately inherited.

## Program-level Owner directive

JV-Web is now the program priority and intended **HEIR / PRODUCT**. The long-term target is a version that can exceed Native/JV_CORE, exploit useful JURE authoring where justified, and eventually be strong enough to serve as an Owner showcase/public product.

Donor roles:

- **JV_CORE / Native** — primary donor/research record for rig, feel, wheel/contact, physics, assets, controls, known defects and Owner evidence. Native behaviour may be a valuable reference; Native implementation is not automatically the target.
- **JURE** — optional rig/geometry authoring donor. It must prove practical value and is not a required dependency for completing JV-Web.
- **JV-Web** — accepted product authority for Web. Existing accepted behaviour remains protected until a focused later slice intentionally improves it.
- **Codex** — future repo-native executor/synthesis context after preparation. Codex may port, rewrite, combine or reject donor implementations, but must preserve validated Owner/semantic truth unless contradictory evidence justifies change.

Inheritance order:

`Owner product truth -> portable mechanical/semantic truth -> candidate behavioural implementation -> legacy code`

Do not copy whole projects, freeze a unified schema prematurely or use parity with Native as the final success criterion. After donor closure, create an **Inheritance Matrix** covering capability, donor, evidence, Owner status, portable truth, target JV-Web concern and Codex decision.

## Exact accepted anchors

```text
accepted wide-desktop HUD cleanup executable:
  4a68b462580f32f97a9702eb1e0dd46d64600948

Owner-tested wide-desktop HUD candidate:
  7ad78797456dd9c3fb5e421e2eeacd2a98c5cc68

accepted desktop/mobile capability-hygiene executable:
  319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c

accepted mobile tap-highlight executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R multitouch executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

pedal-contact V1 evidence only:
  8690368aa19242bb37b9476737ee9b1f5374724a

pedal-contact V1.1 evidence only:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

There should currently be **no ordinary active product lane ahead of `main`**; verify this live rather than trusting the snapshot. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## Accepted product boundary

Protect:

- dual-mode steering (`Obrót` + `Przeciąganie`), final feel/tuning open;
- absolute-position pedals with frozen acquisition geometry;
- independent throttle/brake pointer ownership;
- steering + pedal multitouch;
- D/R explicit pointer acquisition/lifecycle while other controls remain held;
- fail-closed lifecycle behavior and existing D/R sign/re-sign semantics;
- tap-highlight suppression on custom mobile driving controls;
- standard desktop hides mobile-only steering toolbar controls while mobile/narrow/coarse-pointer retains them;
- wide fine-pointer desktop hides the redundant ordinary header row and reuses that row for toolbar/actions;
- medium-width and mobile composition are not redefined by the wide-desktop HUD rule;
- current camera/fullscreen/mobile composition and accepted map/scan/A53 performance foundations.

Keep drivetrain, motor/brake balance, vehicle physics and rig/JURE out of unrelated UI or handoff-hardening work.

## Closed/deferred pedal contact experiment

V1/V1.1 tested a lower zero/contact region on top of the accepted absolute-position pedal foundation. Machine evidence was technically green, but Owner A53/Chrome use found the practical value too small to justify further tuning/presentation work.

Classification: `OWNER VERDICT — NOT ACCEPTED / DEFERRED FOR NOW`.

Do not integrate or continue the experiment by default. Accepted absolute-position pedal semantics remain the current baseline.

## Latest accepted UI closes

### Desktop/Mobile Capability Hygiene V1

Owner confirmed normal desktop hides `Kierownica: Obrót / Przeciąganie` and `Tło kier.` while shared controls remain; mobile/narrow/coarse-pointer retains those mobile-driving controls. Final accepted integration: `319f25de...`.

### Wide Desktop HUD Header Cleanup V1

On exact Owner-tested `7ad78797...`, normal wide desktop showed the redundant first row removed, toolbar/actions sharing the reclaimed top row without observed overlap, Debug operational and no observed scene/camera regression. Mechanical accepted merge: `4a68b462...`.

## Pre-Codex state already grounded

Verified so far:

- no open PRs;
- no open issues;
- no ordinary active product lane;
- accepted historical work branches checked are behind-only;
- `work/pedal-contact-mechanics` is intentionally divergent rejected/deferred evidence, not work to recover;
- accidental `DO_NOT_USE* / PLEASE_IGNORE / noop* / __tmp_noop` refs are inert behind-only clutter, not authority;
- canonical Node/npm and build contracts are explicit in the repository;
- Owner Preview V2 exact-source + accepted-JSPREV2 composition is healthy and should not be redesigned merely for Codex;
- factual documentation hardening pass 1 removed stale D/R/capability routing and historical-current JURE ambiguity.

## Next stage — donor closure and cross-project synthesis

**Do not treat this snapshot as the final Codex handoff.** Before freezing takeover:

1. receive independently grounded donor closures from JV_CORE and JURE;
2. construct the Inheritance Matrix and challenge each proposed inheritance;
3. identify the first fundamental JV-Web quality program without assuming Native parity or JURE usage as goals;
4. freeze the Owner / browser-ChatGPT / Codex responsibility split;
5. finish remaining documentation/evidence consistency work;
6. run one final canonical `npm ci` + `npm run build` on the exact post-hardening `main`;
7. verify Owner Preview on that exact final source + accepted JSPREV2;
8. run a read-only Codex cold-takeover dry run;
9. only after that PASS freeze the final Codex handoff and begin new fundamental runtime work.

## Candidate later quality areas

Not a frozen order:

- rig and visual-mechanical correction using donor evidence;
- suspension/wheel/contact/handling improvement;
- steering and pedal feel/industrial-design convergence;
- longitudinal power/brake balance;
- portrait/capability/UI refinements from concrete evidence;
- future JURE map-authoring integration only after core vehicle quality justifies it;
- Friends/Public promotion remains a separate release decision.
