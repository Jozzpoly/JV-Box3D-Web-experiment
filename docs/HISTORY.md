# JV Web — compressed development history

This file keeps only conclusions that still matter. Older pull requests are closed and may be deleted as branches; they are not required reading or integration steps.

**Current-campaign note (2026-08-08):** this file explains how the architecture arrived here; it does not schedule the current friend-demo. Full native JV Core + Box3D WASM migration remains the accepted long-term product-physics direction, but its execution is deferred for the current campaign. The active friend-demo may advance Web rendering, real authored assets, camera/mobile UX, world/scan presentation, configuration semantics and QoL while native JV remains read-only. A bounded port of an already-existing native `b3Wheel` mechanism is a separate allowed feasibility/port track and does not activate the full migration program.

## Prototype and failure recovery

The first browser prototype proved that Box3D/WASM could run a multi-body JV-style vehicle and render it interactively. It also exposed an unacceptable steering design: releasing input triggered host-driven return-to-zero and centre hold.

That failure established the permanent rule:

```text
RELEASE = immediate hands off
```

## Clean browser foundation

The project was rebuilt around:

- a bounded fixed-step clock;
- timestamped input timelines;
- transactional resource ownership;
- a typed Box3D boundary;
- exact Node/dependency/runtime identities.

## M6 reference vehicle

The clean line added:

- the current 18-body M6 topology;
- suspension and rack joints;
- physical `POSITION` steering;
- rack-space `RATE` experiments;
- a diagnostic WebGL observer;
- minimal wheel-motor drive, reverse, coast and braking;
- real-WASM tests and browser observations.

## Key architecture correction

A critical comparison showed that identical receipt values did not imply identical behavior. Native JV defines `maxDriveSpeed = 40` as a wheel motor limit in rad/s, while the TypeScript fixture interpreted it as a linear speed target.

The project therefore stopped treating the TypeScript M6 as product physics and selected native JV Core + Box3D in one WASM module as the long-term authority.

This conclusion still stands. What changed is **when** the migration is being executed: the current friend-demo deliberately uses the reference fixture while product-visible Web work proceeds, without claiming native parity.

## Repository cleanup

Early work produced many stacked draft PRs, phase-specific runners, audits and recovery documents. They were useful while finding the architecture, but became harder to understand than the project itself.

In August 2026:

- PR #18 was retargeted directly to `main`;
- all earlier PRs were closed as historical;
- current code and focused tests were preserved;
- duplicated process/audit/archive layers were removed;
- the repository returned to one active integration candidate.

Later R0 work established an exact public map-only rollback baseline and the R1 campaign re-opened product-facing work on a dedicated private development branch.

## Current meaning

The browser M6 remains a valuable deterministic reference fixture. It is not final vehicle behavior and not native parity.

For the current friend-demo:

- do not grow it into a silently authoritative second physics product;
- do allow bounded Web-local configuration semantics and presentation work whose status is explicit;
- use it to integrate real assets, camera/mobile UX, world/scan capabilities, settings state and QoL;
- selectively port already-existing native mechanisms through controlled boundaries when justified;
- keep full native/WASM authority migration as a later program unless Jozz explicitly changes priority.

Current scheduling authority lives in `AGENTS.md`, `AI_PROJECT_MEMORY.md` and `docs/HANDOFF.md`, not in this historical narrative.