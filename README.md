# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the public Friends demo.

## Authority and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  private source / development / accepted main

Jozzpoly/JV-Box3D-Web-Public
  public artifact + GitHub Pages steady-state main
```

Private `main` is source/product authority. Public `main` is the steady-state artifact and Pages authority. Resolve live refs and `docs/PROJECT_STATE.md` before making moving-SHA or acceptance claims; exact executable/public anchors belong there, not in this README.

The public repository is artifact-only. Product fixes belong in private typed source and must be rebuilt/re-promoted; do not patch compiled public runtime as normal development.

Rig authoring belongs to the separate Jozz Universal Rig Editor (JURE). JV Web consumes explicit authored neutral truth through `docs/contracts/JURE_CONSUMER_BOUNDARY.md`; it must not grow a second rig editor.

## Canonical toolchain

```text
Node 24.16.0
npm >=11.13.0 <12
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

Typical local start:

```text
npm ci
npm run dev -- --host 0.0.0.0
```

For ordinary scoped work use the smallest relevant check, for example:

```text
npm test -- tests/<relevant>.test.mjs
```

Use `npm run check` for broad foundation/integration checks. Full canonical build/release validation is for foundation or release boundaries, not routine polish. User-visible work still needs rendered/browser/device evidence; a passing build is not Owner acceptance.

## Release notes

Friends-compatible production builds use the repository release/build scripts documented in `package.json` and current project state. Code-only releases may preserve the exact already-approved JSPREV2 public scan under the release provenance rules. A scan-changing release requires exact approved input/provenance validation.

## Start here

A fresh agent normally reads:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. source/tests needed for the selected task

During an explicit takeover/handoff, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`.

Then, only when relevant:

- `docs/ARCHITECTURE.md` — stable system boundaries;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` — durable mobile-control/polish intent and falsifiers;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — JURE/JV ownership;
- other `docs/contracts/` and `docs/baselines/` only for the active boundary.

`AI_PROJECT_MEMORY.md` is a compact router. Dated audits and old Git refs are historical evidence, not current instructions.

## Workflow

Prefer:

`small need -> smallest coherent source change -> causal check -> faithful render/device proof -> Owner judgement -> continue`

Use temporary branches/checkpoints only for a concrete isolation or rollback need. Do not create process machinery merely because a new agent, conversation or small polish iteration exists.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
