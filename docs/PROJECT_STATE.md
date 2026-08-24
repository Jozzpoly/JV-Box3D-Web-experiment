# JV Web — current project state

Updated: 2026-08-24
Owner: Jozz
Status: `JV-WEB PRIORITY HEIR / ACCEPTED STEERING + PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT + DESKTOP-MOBILE CAPABILITY HYGIENE + WIDE-DESKTOP HUD CLEANUP / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / PRE-CODEX GROUNDING IN PROGRESS / RECIPIENT SURFACE GROUNDED / DONOR CLOSURE + CROSS-PROJECT SYNTHESIS + FINAL CANONICAL CLOSE PENDING / FINAL CODEX HANDOFF NOT YET FROZEN`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted wide-desktop HUD cleanup executable:
  4a68b462580f32f97a9702eb1e0dd46d64600948

Owner-tested wide-desktop HUD candidate:
  7ad78797456dd9c3fb5e421e2eeacd2a98c5cc68

accepted desktop/mobile capability-hygiene executable:
  319f25de3fe280c3a3b5bf4f4563d2fdb71e2a7c

accepted mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

rejected/deferred pedal contact V1:
  8690368aa19242bb37b9476737ee9b1f5374724a

rejected/deferred pedal contact V1.1:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

ordinary active product lane:
  NONE

Owner Preview control lane:
  preview/owner-control

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Resolve live `preview/owner.json` for the exact Preview source pointer; do not infer it from this snapshot. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## 2. Program-level Owner directive — JV-Web as heir

JV-Web is now the priority product of the Jozz Vehicle program and the intended heir of useful work across the surrounding projects. The target is not parity with an older implementation. JV-Web should become the highest-quality version we can build: useful as R&D, strong on desktop and phone, materially better to drive and inspect, and eventually credible as an Owner showcase/public product.

Current donor roles:

- **JV_CORE / Native** — primary donor and research record for rig, feel, wheel/contact, physics, assets, controls and historical Owner evidence. Native is a source of evidence and lessons, not a quality ceiling and not code that must be ported 1:1.
- **JURE** — optional authoring-tool/donor for authored neutral rig/geometric truth. JURE must prove practical value and must not become a mandatory dependency for completing JV-Web. Codex may later decide to use it, narrow its role or ignore it.
- **JV-Web** — HEIR / PRODUCT. Current accepted Web behavior is protected until a focused later slice deliberately improves it.
- **Codex** — future repo-native execution/synthesis context after the pre-Codex preparation passes. It is not authority over live Git or Owner judgement and may rewrite/reject donor implementations when evidence supports a better JV-Web design.

Inheritance rules:

1. Preserve **Owner product truth**: what looked, felt and behaved better in real use, within the scope actually observed.
2. Extract **portable mechanical/semantic truth**: frames, relations, control semantics, invariants, failure modes and validated constraints.
3. Treat **behavioural implementation** as a candidate technique, not sacred architecture.
4. Treat **legacy code** as the least authoritative layer: copy only when it remains the best justified implementation.
5. Cross-project state never becomes JV-Web proof merely by being current or accepted in its donor repository.
6. Do not build a unified three-project schema before concrete donor evidence requires one.

After JV_CORE and JURE finish their own donor/pre-Codex closures, construct a cross-project **Inheritance Matrix** before fundamental JV-Web redesign. Minimum columns: capability, donor, evidence, Owner status, portable truth, target JV-Web concern and Codex decision. This matrix is not frozen yet because donor closure is still in progress.

Unless the Owner redirects or a critical regression appears, do not start a new substantial JV-Web runtime slice before donor closure and cross-project synthesis are coherent.

## 3. Accepted control and UI foundations

Preserve unless a focused later slice explicitly changes them:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes; final tuning open;
- absolute-position throttle/brake mapping inside acquisition geometry frozen at pointer-down;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed cancel/lost-capture/lifecycle behavior and current D/R sign/re-sign semantics;
- browser tap highlight suppressed on custom mobile driving controls while product-owned feedback remains visible;
- standard desktop hides mobile-driving-only `Kierownica: Obrót / Przeciąganie` and `Tło kier.` controls, while shared locations, Pixel/Smooth, Grid and Fullscreen remain available;
- mobile/narrow/coarse-pointer surfaces retain steering modes and steering-plate controls;
- wide fine-pointer desktop hides the redundant ordinary `.scene-header` row and reuses the top row for the product toolbar and `Camera / Reset / Debug` actions;
- medium-width `<=900px` and mobile/coarse layout behavior remains outside that wide-desktop HUD rule;
- Camera Manual Rig V1, Fullscreen V1 and current mobile composition;
- Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53/Chrome render-1x boundary.

Do not use UI/control polish as a reason to change drivetrain, motor/brake balance, vehicle physics or rig authority.

## 4. Latest accepted UI closes

### Desktop/Mobile Capability Hygiene V1

Accepted behavior:

- standard desktop: `Kierownica: Obrót / Przeciąganie` absent;
- standard desktop: `Tło kier.` absent;
- shared Plac/Offroad/JSPREV2, Pixel/Smooth, Grid and Fullscreen remain;
- mobile/narrow/coarse-pointer: steering modes and steering plate remain available;
- responsive visibility follows the mobile-driving surface boundary and resynchronizes without reload;
- steering/pedal/D-R semantics are unchanged.

Owner confirmed both desktop and mobile states. An earlier screenshot exposed a CSS hidden/display regression; the final accepted slice fixed it and added regression coverage before integration `319f25de...`.

Classification: `OWNER ACCEPTED — DESKTOP/MOBILE CAPABILITY HYGIENE V1`.

### Wide Desktop HUD Header Cleanup V1

Source grounding proved that the perceived top strip is scene background, not reserved HTML layout. The accepted presentation-only rule applies only to `(min-width: 901px) and (hover: hover) and (pointer: fine)`:

- redundant `.scene-header` hidden;
- `.product-toolbar` at `top:16px`;
- `.scene-actions` at `top:16px`;
- `<=900px` and mobile/coarse/narrow rules unchanged;
- DOM, camera, renderer, canvas sizing, input semantics and physics untouched.

Owner evidence on exact `7ad78797...` confirmed the row is gone, toolbar/actions occupy the reclaimed row without observed overlap, Debug still opens with telemetry and no scene/camera regression was observed. Mechanical integration `4a68b462...` preserves the exact Owner-tested CSS/test blobs plus current documentation ancestry.

Classification: `OWNER ACCEPTED — WIDE DESKTOP HUD HEADER CLEANUP V1`.

## 5. Pedal contact V1/V1.1 — deferred

Accepted `main` does **not** contain the contact-zone experiment. Owner A53/Chrome evidence showed that a zero region existed, but its practical value was too small to justify continued tuning/presentation work.

Classification: `OWNER VERDICT — PEDAL CONTACT V1/V1.1 NOT ACCEPTED / DEFERRED FOR NOW`.

Do not integrate or continue percentage/hysteresis/contact-presentation tuning by default. Accepted absolute-position pedals remain the baseline. Revisit only if later pedal geometry/industrial design materially changes the value proposition.

## 6. Pre-Codex Grounding — verified findings so far

### Git/work queue

- open PRs: **NONE**;
- open issues: **NONE**;
- ordinary active product lane: **NONE**;
- integrated historical work branches checked so far are behind-only and contain no newer product truth;
- `checkpoint/p1-3-1-handoff-2026-08-18` is a historical divergent checkpoint whose unique delta is documentation only, not lost runtime;
- `work/pedal-contact-mechanics` is intentionally divergent with unmerged V1/V1.1 product/test commits; it is **rejected/deferred evidence**, not work to recover or merge;
- accidental refs such as `DO_NOT_USE*`, `PLEASE_IGNORE`, `noop*` and `__tmp_noop` are behind-only inert clutter. Current connector access cannot delete branch refs safely. They are not authority and must not trigger a cleanup/recovery campaign.

### Validation/toolchain

- canonical repository toolchain is explicit: Node `24.16.0`, `packageManager: npm@11.13.0`, npm `>=11.13 <12`, `engine-strict=true`;
- `npm run check` = typecheck + repository tests + docs links + third-party checks;
- `npm run build` = `check` + portable build/validation;
- source `main` currently has no standing Actions CI workflow; this is not automatically a product gap;
- milestone/foundation/release machine evidence should use exact repo toolchain and `npm run build`; ordinary polish should use causal checks proportional to risk;
- browser/render/device evidence remains separate from machine build evidence.

### Owner Preview

`preview/owner-control` remains a special operational lane. Preview V2:

- requires exact 40-character source SHA;
- exact-checks out a clean committed candidate;
- installs the repository-declared Node/npm;
- typechecks and builds/validates the portable executable;
- pins the accepted JSPREV2 layer to an exact Public commit/receipt;
- verifies all recorded scan runtime files/hashes before composition;
- preserves executable identity separately from static-layer provenance;
- fails before deploy when candidate/static-layer validation fails.

Audit verdict: **keep this workflow; do not redesign it merely for Codex transition**.

### Documentation hardening pass 1

Proven drift was removed from stable/current docs:

- `AGENTS.md` no longer calls accepted D/R multitouch an open issue and now records accepted capability/HUD boundaries;
- `README.md` no longer routes work to the closed D/R problem and explicitly marks the pre-Codex preparation stage;
- mobile-driving grounding no longer schedules already-accepted capability hygiene and keeps pedal-contact V1/V1.1 deferred;
- JURE consumer boundary keeps the durable geometry/authority rules but now labels 2026-08-16 JURE refs as historical evidence only.

`docs/ARCHITECTURE.md` and the Owner Preview workflow were audited and did not require a change in this pass.

### Recipient surface grounding

`docs/RECIPIENT_SURFACE.md` now records the current JV-Web vehicle as the recipient of future donor evidence without claiming donor state or freezing the Inheritance Matrix.

Current source-level findings include:

- the active `legacy_ts_m6` backend is explicitly a `REFERENCE_BROWSER_FIXTURE`, has `productPhysicsAuthority: false`, does not accept new product physics and has native parity `NOT_PROVEN`;
- the active wheel contact implementation is explicitly `legacy_m6_split_sphere_sidewall`;
- general wishbone hardpoints remain procedural while front-left steering uses a source-registered provisional special case;
- front-right steering remains an explicitly temporary symmetric kinematic bridge and the rack->angle/full-lock mapping is provisional;
- the neutral JURE-facing mechanism is a read-only comparison/lowering seam, not authored truth or a frozen JURE schema;
- current product visuals use build-generated R3, which is a deterministic calibrated derivative of R2 and can bind 59 real moving roots to the live M6;
- R3 visual calibration is not mechanical authority: tested treatments include visual-only mappings with physics unchanged;
- current visual binding/frame contracts already provide useful part/segment/part-pair seams and should be challenged only when a real donor rig proves a missing semantic.

This recipient map is the baseline against which final JV_CORE/JURE donor evidence should be challenged before implementation. It does not authorize a substantial runtime slice while donor closure remains pending.

## 7. Next stage inside the pre-Codex preparation

The final Codex handoff is **not yet frozen**. Recipient grounding is available; the cross-project Inheritance Matrix still waits for exact donor closure.

Next work should proceed in this order:

1. receive/ground the final current outputs of the separate JV_CORE and JURE donor/pre-Codex closures;
2. build the Inheritance Matrix and resolve donor conflicts at the level of evidence/semantics, not repository prestige;
3. define the first fundamental JV-Web quality program and explicitly challenge any proposed Native/JURE inheritance before implementation;
4. design and freeze the execution-context split between Owner, browser ChatGPT/orchestrator and Codex/repo executor;
5. decide whether branch/ref cleanup is worth doing with ordinary Git access or whether classification alone is safer;
6. complete remaining documentation consistency checks, including concise durable Owner acceptance for the newest UI closes if useful;
7. run one final canonical source validation on the exact post-hardening `main` (`npm ci` + `npm run build`) so tests, docs links, third-party and portable artifact contracts share one close anchor;
8. repoint/verify Owner Preview to that exact final accepted main + accepted JSPREV2;
9. perform a **read-only Codex cold-takeover dry run** and compare its reconstructed accepted/open/next state against live evidence and the Inheritance Matrix;
10. only after that PASS freeze the final Codex handoff and allow the first new fundamental product slice.

Do not modify product runtime merely to prepare the handoff.

## 8. Separate later product work

These remain candidate concerns, not a frozen implementation order:

- rigorous rig/visual-mechanical correction using donor evidence;
- wheel/contact and suspension/handling improvement;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling work;
- portrait-specific composition and further capability hygiene from concrete mismatches;
- performance scaling only from measured need;
- future JURE map-authoring integration if it becomes valuable after core vehicle quality;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler. Native/JV_CORE parity is an instrument, not the final JV-Web quality target.
