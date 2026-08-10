# JV Web

JV Web is the private desktop/mobile browser development line for Jozz Vehicle and the current friend-demo campaign. The goal is a browser build that is useful and enjoyable to drive, tune and show to friends — not merely a technical demonstrator.

The private repository is the source/development laboratory. `Jozzpoly/JV-Box3D-Web-Public` is the publication surface. Native `Jozzpoly/Box3d_FunProject` remains a read-only reference for this campaign unless Jozz explicitly changes scope.

## Current product state

The current R1 line already includes:

- the browser M6/Box3D reference vehicle and E2R/offroad world;
- desktop/mobile controls and chase/orbit/zoom camera support;
- optional private LOCAL_FULL JSPREV2 loading through the dev server;
- Jozz's authored chassis, wheels, front/rear suspension pieces, dampers and cardans;
- a deterministic owner-vehicle package generator;
- live loading of the generated `m6-owner-full-rig-r3` package;
- public-preview validation tooling for the later R1 Pages path.

The current owner-vehicle package reproduces to 59 real bindings and GLB SHA-256
`57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a` from repository sources.

The current high-priority vehicle issue is the front steering/upright visual-mechanical relationship. Do not broaden that into a whole-car rewrite. Current continuation details live in `docs/HANDOFF.md`.

## Public baseline

Public R0 is closed and immutable:

```text
Jozzpoly/JV-Box3D-Web-Public
release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R0 is a rollback/evidence baseline, not a build profile that current R1 must carry forward. Exact closure lives in `docs/baselines/R0_PUBLISHED_2026-08-07.md`.

## Start here

For a fresh agent or handoff, keep context deliberately small:

1. fetch the current private/public refs;
2. read `AGENTS.md`;
3. read `AI_PROJECT_MEMORY.md`;
4. if continuing active work, read `docs/HANDOFF.md`;
5. inspect only the exact source/tests needed for the current question.

Use `docs/PROJECT_STATE.md` for deeper current state and `docs/OWNER_CHECKPOINTS.md` for owner-validated vehicle checkpoints. Historical evidence should be loaded only when a current question points to it.

## Development

Canonical toolchain:

```text
Node 24.16.0
npm 11.13.0
TypeScript 7.0.2
Vite 8.1.5
```

Typical private workflow:

```powershell
npm ci
npm run check
npm run dev -- --host 0.0.0.0
```

The exact runtime/toolchain contract is enforced by `package.json`, `.node-version` and `.npmrc`.

See `docs/DEVELOPMENT.md` for validation tiers and `docs/BRANCH_ROLES.md` for branch lifecycle.

Third-party notices are in `THIRD_PARTY_NOTICES.md`. No general public reuse license is granted.
