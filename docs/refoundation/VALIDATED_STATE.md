# Validated state

Observed: 2026-08-05  
Mode: repository inspection and source audit; no exact local gate rerun in this control-plane change.

## Repository topology

| Ref | Exact commit | Status | Allowed use |
|---|---|---|---|
| `main` | `5c64903d753f893adc42be90e0c3d8053a95a922` | clean minimal control base | governance and future clean integration |
| `agent/jv-web-demonstrator-foundation` | `78150858049c64d5bcae1507f696b0bd8d074563` | historical implementation stack | source recovery only |
| `agent/jv-tiny-unlit-pass` | `f27b92d826e1192016873d8f341ac9ff80ad9ef8` | historical observed candidate | source and historical owner evidence |
| `agent/jv-real-vehicle-texture-scan-plan` | `d75660889cdafc21622fb5a6c2d067745ce40193` | documentation/planning branch | decision archaeology only |
| `agent/jv-lit-normal-foundation` | `26c5022f8dfd33b8c5f80d0900d239a4d80966ea` | quarantined current head | failure reproduction and selective salvage |
| detached historical checkpoint | `dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec` | historical green claim, rerun pending | first baseline candidate |
| PR #1 forensic checkpoint | `891c7561142b601f62ea76b68b0f55f8fababc6c` | not exactly reproducible alone | real-asset mechanism archaeology |

Visible branches are currently unprotected. The foundation stack is hundreds of commits ahead of the minimal `main`; it must not be integrated by blind fast-forward.

## What is source-confirmed

- The current host has a deterministic fixed-step architecture, source-aware keyboard/touch input and immutable visual-frame concepts.
- The current browser installs the tiny unlit vehicle pass, not the lit-normal pass.
- Lit-normal source code and synthetic fixtures exist, but that does not prove an active browser feature.
- PR #1 contains a real Three.js vehicle path, marker-derived wheel alignment and independent skinned-wheel cloning.
- PR #1 also depends on mutable or local native inputs and lacks enough pinned material for exact historical reproduction.
- HomeScan contains useful Three.js, GLTFLoader, import-inspection and lifecycle patterns, but is not a drop-in JV module.
- Native JV and the TypeScript fixture assign different semantics to `maxDriveSpeed`; the TypeScript backend is not product physics authority.

## What is not currently proven

- exact green state of `dcec0a7…` under a fresh rerun;
- complete failure set of `26c5022…`;
- stable browser behavior of lit-normal;
- real-car rendering through the current deterministic host;
- stable mobile GPU memory, upload time or FPS;
- context-loss recovery on real hardware;
- native/WASM product-physics parity;
- final renderer choice.

## Current project classification

```text
governance state:       RECOVERY CONTROLLED
product branch:         NOT YET SELECTED
current PR #21:         QUARANTINED
physics authority:      NATIVE JV CORE DIRECTION VALIDATED
renderer direction:     THREE.JS HYBRID LEADING HYPOTHESIS
ordinary feature work:  BLOCKED UNTIL R0–R4 GATES
```
