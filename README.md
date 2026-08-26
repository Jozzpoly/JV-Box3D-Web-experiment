# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile product used both as an R&D surface and as the source for accepted public Friends artifacts.

## Authority and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  accepted source / development main
  preview/owner-control -> Owner Preview Pages control lane

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends artifact / release main
```

Source `main` is accepted product/source authority. `preview/owner-control` is operational only: `preview/owner.json` pins one exact executable source candidate and may also pin explicitly approved static artifact layers with separate provenance. A candidate being live on Preview does not make it accepted product truth.

Friends/Public is artifact authority, not source authority. Source acceptance and Friends release acceptance are separate decisions.

## Current product direction

Accepted source protects a substantial product baseline: desktop/mobile product shell, Direct Rotation + Relative-X steering interaction foundations, absolute-position pedals, independent multitouch ownership, D/R pointer lifecycle, camera/fullscreen, accepted responsive UI boundaries, Plac E2R, Offroad, JSPREV2 and the accepted A53/Chrome render-1x scan boundary.

These are protected against accidental regression, not declared permanent implementation architecture.

Pedal Contact + Mechanical Feedback V1/V1.1 is rejected/deferred evidence. Accepted absolute-position pedals remain the baseline.

The current Friends artifact predates several later accepted source changes. Do not infer feature parity between source `main` and Friends/Public.

## Current program stage

JV-Web is the priority heir/product. JV_CORE / Native is a sealed primary donor/research record with active development stopped. JURE is an optional authoring/mechanical-truth donor and useful current tool, not a mandatory dependency or a frozen final authoring architecture.

Pre-Codex evidence reconstruction, architecture comparison, first-falsifier selection and responsibility assignment are complete through Gate 8.

The selected first next-generation falsifier is:

`FRONT-CORNER-AUTHORITY-ISOLATION-01`

Classification:

`M1 STRUCTURAL FALSIFIER / CONTROL-EQUIVALENCE PROBE / NOT PRODUCT-MECHANICS ACCEPTANCE`

It asks whether the current front-left M6 corner can be isolated behind one explicit owned-unit boundary while preserving exact current control behavior. It does **not** introduce new mechanical truth, select A1/A2, accept current FL mechanics or resolve final mating.

The historical `Front Mechanical Unit 01` idea is **not** the selected first implementation stage.

Gate 9 is the current stage: final pre-Codex source/document consolidation plus canonical validation. Fundamental falsifier implementation remains unauthorized until Gate 9 closes and a read-only Codex cold takeover passes.

A JURE -> JV-Web lowering/schema contract is not a pre-Codex freeze requirement. Pre-Codex work freezes evidence, constraints, provenance, negative knowledge, selected experiment semantics and remaining unknowns; later repo-native design challenge may still choose the consumer/lowering architecture.

Current routing belongs in `docs/PROJECT_STATE.md`. The exact selected experiment contract is `docs/FIRST_FALSIFIER.md`.

## Canonical toolchain

```text
Node 24.16.0
npm >=11.13.0 <12
packageManager npm@11.13.0
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

For source work:

```text
npm ci
npm run dev -- --host 0.0.0.0
```

Use validation proportional to causal blast radius. Full `npm run build` is for foundation/integration boundaries, final source close and accepted releases, not routine polish or read-only analysis. User-visible work still needs rendered/browser/device evidence.

## Start here

A fresh executor normally reads:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/FIRST_FALSIFIER.md` when working on the selected experiment
4. source/tests required by the selected task

During explicit takeover/handoff, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`.

Then only when relevant:

- `docs/ARCHITECTURE_HYPOTHESES.md` — Gate 6 authority/migration comparison; no architecture winner;
- `docs/INHERITANCE_MATRIX.md` — Gate 5 decision synthesis; later current-state corrections outrank stale wording;
- `docs/NEXT_GENERATION_TAKEOVER_LOOP_2026-08-25.md` — rationale and staged next-generation analysis loop;
- `docs/RECIPIENT_SURFACE.md` — detailed Recipient V1 evidence;
- `docs/donors/JV_CORE_DONOR_SEAL_2026-08-25.md` — sealed Native donor receipt;
- `docs/ARCHITECTURE.md` — stable current boundaries, not future architecture freeze;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — authored-truth/runtime separation constraints without mandatory-JURE commitment.

`AI_PROJECT_MEMORY.md` is a compact router. Dated audits and historical Git refs are evidence, not current instructions.

## Workflow

Prefer:

`small need -> smallest coherent source change -> causal check -> faithful render/device evidence only when causally relevant -> Owner judgement only when genuinely qualitative -> continue`

Do not create process machinery, branches, schemas or abstractions merely because a new executor/conversation exists. Resolve live repo/ref before writes.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
