# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the public Friends demo.

## Source and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  private source / development / accepted main

Jozzpoly/JV-Box3D-Web-Public
  generated public artifacts / GitHub Pages
```

Rig authoring belongs to the separate Jozz Universal Rig Editor (JURE). JV Web should consume explicit authored neutral rig/frame/relation outputs through the boundary in `docs/contracts/JURE_CONSUMER_BOUNDARY.md` instead of growing a second temporary rig editor.

Moving SHAs, the active work lane, rollback refs and the current validation boundary are intentionally kept out of this README. Read `docs/PROJECT_STATE.md` for current state.

## Development

Canonical toolchain:

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

For normal feature work, use the smallest relevant check:

```text
npm test -- tests/<relevant>.test.mjs
```

Use `npm run check` for broad foundation/integration gates. User-visible web changes also need rendered/browser validation; a passing build alone is not acceptance.

Friends release builds use `npm run build:friends-r1`. A release that changes the scan requires `JOZZ_SCAN_PREVIEW_PACK` pointing at the exact approved source pack; code-only releases may preserve the already-published scan.

## Start here

A fresh agent should read only:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests needed for the current task

During an explicit takeover/handoff, insert:

3. `docs/HANDOFF.md`

before opening broad history or implementation files.

Then use, only when relevant:

- `docs/ARCHITECTURE.md` — stable system boundaries;
- `docs/OWNER_CHECKPOINTS.md` — scoped owner acceptance;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — cross-project JURE/JV-Web ownership and first-consumer rules;
- `docs/contracts/` — other executable/external format contracts;
- `docs/baselines/` — reproducible historical baselines.

`AI_PROJECT_MEMORY.md` is a compact router. Old branch names and Git history are not current instructions.

## Everyday workflow

Prefer:

`small need -> small vertical slice -> targeted check -> rendered/device proof when relevant -> owner-visible result -> continue`

Keep one ordinary active work lane ahead of `main` only when real implementation requires isolation. Do not create branches, documents or validation machinery per conversation. Preserve important historical states with Git history/tags and keep branch navigation small.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
