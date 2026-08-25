# JV Web — current project state

Updated: 2026-08-25
Owner: Jozz
Status: `JV-WEB PRIORITY HEIR / ACCEPTED CONTROL + UI FOUNDATIONS PROTECTED / PEDAL CONTACT V1-V1.1 DEFERRED / NO ORDINARY ACTIVE PRODUCT LANE / JV_CORE SEALED DONOR + JURE/JV_CORE INHERITANCE MATRIX GROUNDED / FIRST FUNDAMENTAL MECHANICAL STAGE DEFINED FOR PLANNING / NO RUNTIME START / PRE-CODEX FINAL CLOSE PENDING`

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

JV-Web is the priority product of the Jozz Vehicle program and the intended heir of useful work across the surrounding projects. The target is not parity with an older implementation. JV-Web should become the highest-quality version we can build: useful as R&D, strong on desktop and phone, materially better to drive and inspect, and eventually credible as an Owner showcase/public product.

Current project roles:

- **JV_CORE / Native** — **SEALED DONOR / RESEARCH RECORD**. Active Native development is stopped under the current Owner directive. It remains the primary donor for rig, feel, wheel/contact, physics, assets, controls, known defects and historical Owner evidence, but is neither a quality ceiling nor code to port 1:1.
- **JURE** — optional authoring-tool/donor for authored neutral rig/geometric truth. JURE has earned influence through proven provenance, owner-local frames and neutral relations, but is not a required dependency for completing JV-Web.
- **JV-Web** — HEIR / PRODUCT. Current accepted Web behavior remains protected until a focused later slice deliberately improves it.
- **Codex** — future repo-native execution/synthesis context after the remaining pre-Codex preparation passes. Codex may rewrite/reject donor implementations when evidence supports a better JV-Web design, but does not outrank Owner truth or live Git.

Inheritance rules:

1. Preserve **Owner product truth** within the scope actually observed.
2. Extract **portable mechanical/semantic truth**: frames, relations, control semantics, invariants, failure modes and validated constraints.
3. Treat **behavioural implementation** as a candidate technique, not sacred architecture.
4. Treat **legacy code/defaults/docs** as the least authoritative layer.
5. Cross-project state never becomes JV-Web proof merely by being current or accepted in its donor repository.
6. Do not build a unified three-project schema before a concrete donor fragment proves the need.
7. Primary-donor status does not win conflicts automatically; Owner truth and evidence decide.

The existing `docs/INHERITANCE_MATRIX.md` now contains both JURE donor intake #1 and the sealed JV_CORE donor intake. `docs/donors/JV_CORE_DONOR_SEAL_2026-08-25.md` is the canonical Web-side receipt for Native closure.

No substantial new runtime slice starts merely because donor closure is complete. The matrix now defines the first fundamental stage for planning and falsification; physical mating and the narrow lowering contract still require deliberate resolution before runtime substitution.

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

These accepted controls/product UX are explicitly **outside the blast radius** of the first mechanical foundation stage.

Do not use donor intake or UI/control polish as a reason to opportunistically change drivetrain, motor/brake balance, wheel/contact architecture or unrelated product behavior.

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

## 6. Pre-Codex Grounding — verified findings

### Git/work queue

- open PRs: **NONE** at the last grounding pass;
- open issues: **NONE** at the last grounding pass;
- ordinary active product lane: **NONE**;
- integrated historical work branches checked are behind-only and contain no newer product truth;
- `checkpoint/p1-3-1-handoff-2026-08-18` is a historical divergent checkpoint whose unique delta is documentation only, not lost runtime;
- `work/pedal-contact-mechanics` is intentionally divergent with unmerged V1/V1.1 product/test commits; it is **rejected/deferred evidence**, not work to recover or merge;
- accidental refs such as `DO_NOT_USE*`, `PLEASE_IGNORE`, `noop*` and `__tmp_noop` are behind-only inert clutter and must not trigger a cleanup/recovery campaign.

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

### Recipient surface grounding

`docs/RECIPIENT_SURFACE.md` records the current JV-Web vehicle as the recipient of donor evidence.

Important current source-level findings remain:

- active `legacy_ts_m6` backend is explicitly a `REFERENCE_BROWSER_FIXTURE`, has `productPhysicsAuthority: false`, does not accept new product physics and has native parity `NOT_PROVEN`;
- active wheel contact is `legacy_m6_split_sphere_sidewall`;
- general wishbone hardpoints remain procedural while front-left steering uses a source-registered provisional special case;
- front-right steering remains an explicitly temporary symmetric kinematic bridge and rack->angle/full-lock mapping is provisional;
- current neutral JURE-facing mechanism is a read-only comparison/lowering seam, not authored truth or a frozen JURE schema;
- current product visuals use build-generated R3, a deterministic calibrated derivative of R2 that can bind 59 real moving roots to live M6;
- R3 visual calibration is not mechanical authority;
- current visual binding/frame contracts provide useful part/segment/part-pair seams but must be challenged by real donor semantics rather than replaced speculatively.

### JURE donor intake #1

JURE contributes proven authoring/provenance capabilities and semantic pressure:

- independent owner-local frames;
- neutral revolute/spherical relations separated from dynamics;
- deterministic Save/Open/relink;
- Owner-correctable relation/frame workflow with diagnostics + Undo/Redo.

But current outboard X-min candidates remain Owner-open and JURE is not a mandatory Web dependency.

### JV_CORE / Native donor closure

Native authority was independently resolved at `recovery/jv-reconstruction@b0a0082252cb1f3c964f804162233bc82254bc4b`. Owner-provided N2-B manifest integrity was independently checked 25/25.

The sealed donor adds decisive constraints:

- real M6 role topology corroborates a coherent wishbone relation graph;
- independent relation-local ownership is portable and corroborates JURE;
- an additional invented physical carrier body is rejected;
- G-RIG is Owner-sealed with known legacy representation debt but does **not** solve every final mating coordinate;
- historical G-FEEL source is anchored at `checkpoint/owner-feel-source-5b92e9c -> 5b92e9c...`; physical mechanism intent transfers, incomplete session tuning does not become fabricated precision;
- artificial rack centering remains OFF by default;
- deterministic mode5 large-angle anti-centering is preserved as known debt/source-localization evidence, not tuned away;
- mode5/new analytic real-width wheel is the Owner-selected current product/donor direction;
- live Native split-sphere factory default is stale implementation truth and is rejected as Web product target;
- mode5 itself is not final tire architecture and must be challenged later in Web.

Native program state:

```text
JV_CORE ACTIVE DEVELOPMENT = STOPPED
JV_CORE ROLE = SEALED DONOR / RESEARCH RECORD
```

Reopen Native only when a specific Web decision cannot be made from preserved evidence and the missing fact is genuinely cheaper/more reliable to obtain there.

## 7. First fundamental Web stage — defined, not yet implemented

The cross-project matrix now defines:

**Rig Truth Intake & Mechanical Foundation — Front Mechanical Unit 01**

Target: one coherent front suspension/wishbone mechanical unit, not a whole-car rewrite.

The stage deliberately excludes opportunistic wheel/contact redesign, G-FEEL tuning, drivetrain changes and accepted controls/UI.

### A. Truth intake

- select one front unit and name physical roles explicitly;
- map JV_CORE roles to JURE neutral elements by semantics, not donor names;
- reject any extra fictitious carrier and the common outboard surrogate;
- compare JV_CORE relation ownership, JURE authored frames and current Web procedural/source-registered hardpoints;
- expose unresolved physical mating as Owner-open rather than guessing;
- determine the minimum frame orientation/provenance needed by the real fragment;
- freeze a narrow lowering receipt only from proven needs.

### B. Owner physical mating / neutral coherence

Resolve the still-open outboard physical mating positions in an inspectable/correctable authoring path. JURE may supply that path if it remains useful, but cannot become a mandatory product dependency.

Require provenance, deterministic reopen/relink or equivalent receipt, neutral diagnostics and explicit Owner physical/visual judgement.

### C. Web lowering / visual placement

Lower only the accepted neutral fragment with explicit coordinate conversion and provenance. Validate neutral coherence and visual placement before changing runtime physics. Do not mix one donor hardpoint with incompatible procedural Web geometry.

### D. Isolated runtime mechanical substitution

Only after A-C pass may one coherent front unit replace its procedural counterpart behind protected product behavior.

Evidence must exceed `legacy_ts_m6` parity and include exact source/build identity, runtime relation/constraint identity, rendered coherence and no regression in protected controls/UI/scene capability. Owner judgement remains required for look/feel claims.

Wheel/contact enters this stage only if a concrete mechanical incompatibility makes validation impossible without a separately scoped contact change.

## 8. Remaining pre-Codex close

The final Codex handoff is **not yet frozen**. Donor closure and cross-project synthesis are now sufficiently grounded; remaining preparation should avoid turning into another product project.

Next work should proceed roughly in this order:

1. challenge the selected Front Mechanical Unit 01 roles/frames against live source once more when implementation planning begins;
2. resolve the Owner-open physical mating needed for that unit and freeze the narrow lowering/space-conversion receipt;
3. freeze the Owner / browser-ChatGPT / Codex responsibility split so Codex gets repository execution authority without becoming product-truth authority;
4. finish only material documentation/evidence consistency gaps revealed by that handoff preparation;
5. run one final canonical source validation on exact post-hardening `main` (`npm ci` + `npm run build`);
6. repoint/verify Owner Preview to that exact final source + accepted JSPREV2 if the final handoff requires it;
7. perform a **read-only Codex cold-takeover dry run** and compare its reconstructed accepted/open/next state against live evidence and `docs/INHERITANCE_MATRIX.md`;
8. only after that PASS freeze the final Codex handoff and allow the first new fundamental runtime slice.

Do not modify product runtime merely to prepare the handoff.

## 9. Separate later product work

These remain candidate concerns, not a frozen implementation order:

- wheel/contact architecture: mode5 is current Owner-selected donor direction but Web is expected to challenge/beat it;
- suspension/handling/G-FEEL improvement using historical Native feel and known-defect receipts as references/falsifiers;
- steering/pedal industrial-design convergence and later steering feel tuning;
- small brake dominating full throttle / broad low power -> dedicated longitudinal/handling work;
- portrait-specific composition and further capability hygiene from concrete mismatches;
- performance scaling only from measured need;
- future JURE map-authoring integration if it becomes valuable after core vehicle quality;
- Friends/Public promotion remains a separate release decision.

No fixed P-stage scheduler. Native/JV_CORE parity is an instrument, not the final JV-Web quality target.
