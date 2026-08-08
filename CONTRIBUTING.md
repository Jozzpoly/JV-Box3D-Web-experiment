# Contributing to JV Web

JV Web is an owner-directed experimental vehicle/game-technology project. Technical review and focused contributions are welcome, but not every experiment becomes product behavior.

## Before changing code

For a cold start, read:

- `AGENTS.md`;
- `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`;
- the exact current source/test/evidence relevant to the proposed change.

Use `docs/PROJECT_STATE.md`, `docs/ARCHITECTURE.md` and the full handoff CORE as deeper references when the task needs them rather than mandatory pre-reading for every change.

Discuss substantial physics, architecture, dependency, asset or publishing changes before implementation.

## Important boundaries

The current TypeScript vehicle is `legacy_ts_m6`, a browser reference fixture. It is **not** native parity and must not become a second silently authoritative product-physics implementation.

Do not invent or tune new final-native drivetrain, suspension, tire/contact, aero or steering physics inside the TypeScript fixture and then present it as JV authority. The long-term accepted product-physics direction remains native JV Core + Box3D in one WASM authority boundary, but full execution of that migration is **deferred during the current friend-demo campaign**.

Bounded Web-local friend-demo semantics are allowed when their status is explicit and they do not claim native parity. Examples include:

- a clean FWD/RWD/AWD selection over the existing reference drive mechanisms;
- preset/config/state plumbing;
- browser/mobile UX and camera behavior;
- rendering/asset integration;
- QoL and world/location interaction.

The current campaign may also selectively port an already-existing accepted native mechanism such as `b3Wheel` through a controlled Web Box3D/Emscripten/binding path. That is not permission to restart tire/contact R&D in TypeScript.

`RELEASE` means immediate hands-off. Do not add hidden return-to-centre, centre hold, speed-sensitive steering or unnamed stabilization assists.

Renderer and UI code must not mutate physics directly.

## Pull requests and private slices

A useful change should state:

- exact scope and deliberate non-scope;
- expected behavior;
- tests or reproduction;
- known limitations;
- whether evidence comes from source review, Node tests, a browser, a real device or Jozz's driving/visual verdict.

Prefer small, reversible commits. Ordinary private R1 slices use focused validation; do not recreate the full R0 release ceremony for every edit.

The canonical R0 release toolchain is Node 24.16.0, npm 11.13.0, TypeScript 7.0.2 and Vite 8.1.5 on Windows 11 x64. Linux is outside the R0 release guarantee, not an additional release gate. Keep dependencies pinned and update `THIRD_PARTY_NOTICES.md` when required.

## Assets

Do not commit models, scans, photographs, textures, fonts or audio without clear ownership and redistribution rights. Private source captures and local workspaces must stay outside a public build unless a later release deliberately defines them as public artifact inputs.

The exact owner vehicle assets and recovery resources used for the current handoff are indexed in the resource map/attached pack. Do not ask Jozz to rediscover known resources before checking those sources.

## Automation and publication

Do not add custom GitHub Actions, deploy workflows, repository-visibility changes or Pages publication machinery by default. Public promotion is a separate deliberate release action and must preserve exact source/artifact/rollback provenance.

Never modify the closed public `release/r0` bytes in place.