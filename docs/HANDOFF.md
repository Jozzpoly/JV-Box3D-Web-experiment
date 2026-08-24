# JV Web — takeover handoff

Updated: 2026-08-24
Status: `HANDOFF SNAPSHOT / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE + WIDE-DESKTOP HUD CLEANUP ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / PRE-CODEX GROUNDING + WORKFLOW HARDENING NEXT / FINAL CODEX HANDOFF NOT YET FROZEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Resolve any ordinary branch actually ahead of source `main` and any open PR before assuming the work queue is empty.
5. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
6. Do not revive closed steering, pedal, D/R, tap-highlight, desktop-capability/HUD or pedal-contact experiments merely because historical refs remain visible.

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

There should currently be **no ordinary active product lane ahead of `main`** after the HUD close; verify this live rather than trusting the snapshot. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

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

On exact Owner-tested `7ad78797...`, normal wide desktop showed:

- redundant `M6 Drive / LIVE · GENERATION · CONTACTS` row removed;
- toolbar at the reclaimed top-left row;
- `Camera / Reset / Debug` at the top-right row;
- no observed overlap;
- Debug still operational and rendering telemetry;
- no observed scene/camera regression.

The rule is desktop-only: `(min-width: 901px) and (hover: hover) and (pointer: fine)`. Medium/mobile rules remain outside this slice. Mechanical accepted merge: `4a68b462...`.

## Next stage — Pre-Codex Grounding + Workflow Hardening

**Do not treat this snapshot as the final Codex handoff.** The project is intentionally entering a separate preparation stage first.

Before any Codex takeover is frozen, independently audit:

1. live source `main`, Preview control/pointer, Public `main`, branches ahead of `main` and open PRs;
2. source vs Preview vs Friends/Public vs JSPREV2 authority;
3. accepted / experimental / rejected-deferred / future work labels;
4. causal-test vs milestone-build vs Owner/device evidence rules;
5. Owner Preview workflow, exact-candidate identity and accepted-static-layer parity;
6. `AGENTS.md`, `PROJECT_STATE`, `HANDOFF`, AI memory, README/architecture/workflow docs for drift or duplication;
7. branch/ref hygiene only to the extent it can change takeover safety;
8. explicit responsibility split between Owner, ChatGPT/orchestrator and Codex/executor;
9. living roadmap and anti-restart rules for closed recovery/publication campaigns;
10. useful lessons from JURE, JV_CORE and other projects only after their own current groundings are available; never treat cross-project history as JV-Web proof.

The output of that stage should be a coherent verdict about readiness, a hardened workflow contract where needed, and only then a final Codex handoff.

## Separate later product work

- capability inventory only from concrete mismatches;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- small brake dominating full throttle / broad low power -> longitudinal handling;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.
