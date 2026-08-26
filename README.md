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

The project is in a **pre-Codex next-generation analysis/handoff phase**. Donor closure and donor deconstruction are complete enough to proceed, but the first next-generation runtime falsifier and future architecture are deliberately not selected yet.

`Front Mechanical Unit 01` is a **leading falsifier candidate**, not an already-selected implementation stage.

Do not freeze a JURE -> JV-Web lowering/schema contract before the current donor/recipient/Owner-truth analysis is complete. Pre-Codex work freezes evidence, constraints, provenance, negative knowledge and unknowns; later repo-native design challenge chooses the consumer/lowering architecture.

Current next-stage routing belongs in `docs/PROJECT_STATE.md`.

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
3. source/tests required by the selected task

During explicit takeover/handoff, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`.

Then only when relevant:

- `docs/NEXT_GENERATION_TAKEOVER_LOOP_2026-08-25.md` — rationale and staged next-generation analysis loop;
- `docs/RECIPIENT_SURFACE.md` — detailed Recipient V1 evidence;
- `docs/INHERITANCE_MATRIX.md` — provisional donor evidence matrix, not current roadmap authority;
- `docs/donors/JV_CORE_DONOR_SEAL_2026-08-25.md` — sealed Native donor receipt;
- `docs/ARCHITECTURE.md` — stable current boundaries, not future architecture freeze;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — authored-truth/runtime separation constraints without mandatory-JURE commitment.

`AI_PROJECT_MEMORY.md` is a compact router. Dated audits and historical Git refs are evidence, not current instructions.

## Workflow

Prefer:

`small need -> smallest coherent source change -> causal check -> Owner Preview Pages -> faithful render/device proof -> Owner judgement -> continue`

Do not create process machinery, branches, schemas or abstractions merely because a new executor/conversation exists. Resolve live repo/ref before writes.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
