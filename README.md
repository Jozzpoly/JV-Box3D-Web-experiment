# JV Web

JV Web is the private desktop/mobile browser development line for Jozz Vehicle and the current R1 friend-demo campaign. The goal is a browser build that is useful and enjoyable to drive, investigate and show — not merely a technical demonstrator.

The private repository is the source/development laboratory. `Jozzpoly/JV-Box3D-Web-Public` is the publication surface. Native `Jozzpoly/Box3d_FunProject` remains read-only mechanism evidence/research for this campaign unless Jozz explicitly changes scope.

## Current R1 state

The current line includes:

- the browser Box3D reference vehicle and E2R/offroad world;
- desktop/mobile controls and chase/orbit/zoom camera support;
- optional private LOCAL_FULL JSPREV2 loading through the dev server;
- Jozz's authored chassis, wheels, suspension pieces, dampers and cardans;
- deterministic owner-vehicle generation and live loading;
- public-preview validation tooling for a later R1 Pages path;
- an owner-accepted **temporary** coherent-front driving bridge that removes the previous left/right mismatch caused by two different steering mechanisms on the front axle.

Current generated owner visual package:

```text
real bindings: 59
GLB bytes: 829936
SHA-256: 1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc
```

The temporary bridge is not final steering architecture. Physical steering feedback/self-align remains open, and the current wishbone<->knuckle mating plus FL lower placement remain deferred rig/workbench debt. Do not hide that debt with offsets or inherit M5/M6 geometry as current truth.

Current continuation details live in `AI_PROJECT_MEMORY.md` and `docs/HANDOFF.md`.

## Public baseline

Public R0 is closed and immutable:

```text
Jozzpoly/JV-Box3D-Web-Public
release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

R0 is rollback/evidence history, not a build profile current R1 must preserve. Exact closure lives in `docs/baselines/R0_PUBLISHED_2026-08-07.md`.

## Start here

For a fresh agent or handoff:

1. resolve current private/public refs;
2. read `AGENTS.md`;
3. read `AI_PROJECT_MEMORY.md`;
4. for active work read `docs/HANDOFF.md` and `docs/IMPLEMENTER_TASK.md`;
5. inspect only source/tests directly needed for the current question.

Use `docs/PROJECT_STATE.md` for current state and `docs/OWNER_CHECKPOINTS.md` for owner-validated checkpoints. Historical evidence is not current authority by default.

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

The exact toolchain contract is enforced by `package.json`, `.node-version` and `.npmrc`. Validation run under any different local toolchain must be labeled supplemental rather than canonical.

See `docs/DEVELOPMENT.md` and `docs/BRANCH_ROLES.md` for validation and branch lifecycle.

Third-party notices are in `THIRD_PARTY_NOTICES.md`. No general public reuse license is granted.
