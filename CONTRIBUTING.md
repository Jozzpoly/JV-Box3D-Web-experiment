# Contributing to JV Web

JV Web is an owner-directed experimental vehicle-physics project. Technical review and focused contributions are welcome, but not every experiment becomes product behavior.

## Before changing code

Read:

- `README.md`;
- `docs/PROJECT_STATE.md`;
- `docs/ARCHITECTURE.md`;
- the relevant test or steering contract.

Discuss substantial physics, architecture, dependency, asset or publishing changes before implementation.

## Important boundaries

The current TypeScript vehicle is `legacy_ts_m6`, a browser reference fixture. Do not add new product drivetrain, suspension, tire, aero or steering mechanics to it. Product physics belongs in the future native JV Core + Box3D WASM backend.

`RELEASE` means immediate hands-off. Do not add hidden return-to-centre, centre hold, speed-sensitive steering or unnamed stabilization assists.

Renderer and UI code must not mutate physics directly.

## Pull requests

A useful PR should state:

- exact scope and deliberate non-scope;
- expected behavior;
- tests or reproduction;
- known limitations;
- whether evidence comes from source review, Node tests, a browser or Jozz's driving verdict.

Prefer small, reversible commits. The canonical R0 release toolchain is Node 24.16.0, npm 11.13.0, TypeScript 7.0.2 and Vite 8.1.5 on Windows 11 x64. Linux is outside the R0 release guarantee, not an additional release gate. Keep dependencies pinned and update `THIRD_PARTY_NOTICES.md` when required.

## Assets

Do not commit models, scans, photographs, textures, fonts or audio without clear ownership and redistribution rights. Private source captures and local workspaces must stay outside the public build.

## Automation and publication

Do not add custom GitHub Actions, deploy scripts, repository-visibility changes or Pages publication without Jozz's explicit approval.
