# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the public Friends demo.

## Live Friends R1

Public site:

`https://jozzpoly.github.io/JV-Box3D-Web-Public/`

Current public line:

- repo: `Jozzpoly/JV-Box3D-Web-Public`
- branch: `release/friends-r1`
- live commit: `7161215e47f00573b8c1b5c31e5931c89f9d709a`
- rollback: immutable `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`

Owner-validated on 2026-08-14:

- Plac E2R works on desktop and phone;
- Offroad works and is driveable over terrain;
- full public JSPREV2 scan works on desktop and phone;
- phone scan is heavy but usable at low speed and remains an intentional stress test for now;
- phone camera/framing and some responsive UI still need a dedicated pass.

The current vehicle uses an owner-accepted temporary coherent-front bridge. It is a useful product baseline, not final rig/steering/handling authority.

## Source and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  private source / development / accepted main

Jozzpoly/JV-Box3D-Web-Public
  public build artifacts / GitHub Pages

Jozzpoly/Box3d_FunProject
  native JV reference/research unless a task explicitly changes scope
```

Rig authoring is moving to the separate Jozz Universal Rig Editor (JURE). JV Web should consume authored rig/frame outputs later instead of continuing to guess hardpoints or growing another temporary rig editor.

## Development

Canonical runtime line:

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

For ordinary work, run the smallest relevant test rather than the whole suite:

```text
npm test -- tests/<relevant>.test.mjs
```

Use `npm run check` for broad foundation/integration checkpoints, not automatically after every tiny feature.

A Friends build with a new scan requires `JOZZ_SCAN_PREVIEW_PACK` pointing at the exact approved source pack. Code-only public hotfixes can preserve the already-published exact scan.

## Start here

A fresh agent should read:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. only the code/tests needed for the current task

`AI_PROJECT_MEMORY.md` is a short router. `docs/ARCHITECTURE.md` is for stable boundaries. Historical recovery/campaign/handoff files are cold evidence, not default context.

## Current direction

Foundation normalization pass 1 is complete: accepted Friends source is integrated into private `main`, stale steering/transaction instructions are inactive, and focused tests are supported.

Near-term order is now intentionally product-led:

1. make build/release/cache identity visible so deployment state is obvious;
2. improve phone camera/framing and responsive controls without changing vehicle mechanics;
3. measure scan bottlenecks on real desktop/phone behavior;
4. take the simplest high-value scan wins before considering advanced LOD;
5. integrate better authored rig data from JURE when its output contract is ready;
6. only then revisit final steering/handling from better geometry.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
