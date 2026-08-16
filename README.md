# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the public Friends demo.

## Source and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  private source / development / accepted main

Jozzpoly/JV-Box3D-Web-Public
  public artifact control plane + GitHub Pages artifacts
```

The public repository `main` is documentation/control-plane only. The deployed Friends application is served from `release/friends-r1`; resolve live refs and `docs/PROJECT_STATE.md` before making publication claims.

Rig authoring belongs to the separate Jozz Universal Rig Editor (JURE). JV Web consumes explicit authored neutral truth through the boundary in `docs/contracts/JURE_CONSUMER_BOUNDARY.md`; it must not grow a second temporary rig editor.

Moving SHAs, active maintenance/product scope, rollback refs and current evidence classification live in `docs/PROJECT_STATE.md`, not this README.

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

For normal scoped work use the smallest relevant check:

```text
npm test -- tests/<relevant>.test.mjs
```

Use `npm run check` for broad foundation/integration checks. User-visible web changes also need rendered/browser/device evidence; a passing build is not Owner acceptance.

## Neutral-rig diagnostics

JV contains a read-only neutral consumer projection used to expose current procedural M6 mechanical assumptions without feeding them back into runtime.

Diagnostic receipt:

```text
npm run export:jure-neutral-geometry
```

Exact neutral-foundation acceptance gate:

```text
npm run gate:neutral-rig-foundation
```

The exact gate is intentionally heavier: clean canonical clone, lockfile install, TypeScript, focused rig checks, deterministic provenance export and falsifiers, full repository check, production bundle/leak scan and final cleanliness. **The existence of this command is not evidence that it passed.** Read `docs/PROJECT_STATE.md` for the current exact execution status.

## Friends release

Friends release builds use:

```text
npm run build:friends-r1
```

A release that changes the scan requires `JOZZ_SCAN_PREVIEW_PACK` pointing at the exact approved source pack. Code-only releases may preserve the exact already-published scan under the release provenance rules. The public repository does not rebuild private source and should not be patched as a development workspace.

## Start here

A fresh agent normally reads:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests needed for the current task

During an explicit takeover/handoff, read `docs/HANDOFF.md` after `docs/PROJECT_STATE.md`.

Then, only when relevant:

- `docs/ARCHITECTURE.md` — stable system boundaries;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — JURE/JV ownership and first-consumer rules;
- `docs/contracts/` — other external/executable contracts;
- `docs/baselines/` — reproducible historical baselines.

`AI_PROJECT_MEMORY.md` is a compact router. Old branch names and Git history are not current instructions.

## Workflow

Prefer:

`small need -> small scoped change -> targeted check -> rendered/device proof when relevant -> Owner-visible result -> continue`

Use a temporary branch only when a concrete isolation/rollback need justifies it. Do not create branches, checkpoint refs, documents or validation machinery merely because a new conversation/agent/test exists. Historical Git state is evidence; branch names are navigation.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
