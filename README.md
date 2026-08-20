# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the accepted public Friends demo.

## Authority and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  public source / development / accepted main
  preview/owner-control -> Owner Preview Pages control lane

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends artifact / release main
```

Source `main` is accepted source/product authority. `preview/owner-control` is an operational deployment lane only: `preview/owner.json` pins one exact executable source candidate and may additionally pin explicitly approved static artifact layers with separate provenance. A candidate being live on Owner Preview does not make it accepted product truth.

Current Owner Preview V2 keeps executable and preserved data authority separate: the active steering candidate is built from exact source, while the already-approved JSPREV2 scan is composed from an exact accepted Friends/Public commit and validated against its release receipt. Preserved static data never becomes source authority.

`Jozzpoly/JV-Box3D-Web-Public/main` remains accepted Friends artifact/release authority, not source authority. Product fixes belong in normal typed source and must be rebuilt/validated before Preview or Friends publication; do not patch compiled public runtime as normal development.

Owner Preview Pages is the default iterative Owner-testing surface. It should preserve accepted capabilities unrelated to the active experiment unless an omission is deliberate, explicit and scoped. ZIP/local-Windows preview is forensic/emergency fallback only, not the normal Owner workflow. Resolve live refs and `docs/PROJECT_STATE.md` before making moving-SHA or acceptance claims; exact active/executable/artifact anchors belong there, not in this README.

Rig authoring belongs to the separate Jozz Universal Rig Editor (JURE). JV Web consumes explicit authored neutral truth through `docs/contracts/JURE_CONSUMER_BOUNDARY.md`; it must not grow a second rig editor.

## Canonical toolchain

```text
Node 24.16.0
npm >=11.13.0 <12
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

Developer/local source work can use:

```text
npm ci
npm run dev -- --host 0.0.0.0
```

This local path is an engineering capability, not the default Owner test loop. For ordinary scoped work use the smallest relevant check, for example:

```text
npm test -- tests/<relevant>.test.mjs
```

Use `npm run check` for broad foundation/integration checks. Full canonical build/release validation is for foundation or release boundaries, not routine polish. User-visible work still needs rendered/browser/device evidence; a passing build is not Owner acceptance.

## Release notes

Owner Preview candidates are built from exact committed executable source through the Preview control lane and remain experimental until explicitly accepted. If accepted static data is preserved in Preview, its repository/commit/receipt provenance must remain explicit and separate from executable build identity.

Friends-compatible production builds use the repository release/build scripts documented in `package.json` and current project state. Code-only Friends releases may preserve the exact already-approved JSPREV2 scan under the release provenance rules. A scan-changing release requires exact approved input/provenance validation.

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

`small need -> smallest coherent source change -> causal check -> Owner Preview Pages -> faithful render/device proof -> Owner judgement -> continue`

Use temporary branches/checkpoints only for a concrete isolation or rollback need. Do not create process machinery merely because a new agent, conversation or small polish iteration exists.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
