# Tiny vehicle unlit pass — implementation plan

Status: `SOURCE PLAN / NO CODE ACTIVATED`
Base checkpoint: `4ace291a65c36e512b611cdb71e247b538955179`

## Scope

Implement the first real browser GLB draw without changing physics, input, scene collision, mobile controls or the existing debug renderer contract.

## Micro-iterations

1. Add an isolated `VehicleVisualUnlitPassV1` module with no `main.ts` integration.
2. Add deterministic tests for loading, first-frame publication, draw count and disposal.
3. Wire the pass through `M6DebugRenderer.installRenderPass()`.
4. Keep the debug vehicle visible until the first complete GLB frame.
5. Restore the debug vehicle when pass installation or rendering fails.
6. Run the exact Node 24 foundation gate.
7. Repeat desktop, LAN and phone smoke before hiding the debug fallback permanently.

## Required invariants

- one renderer-owned WebGL context;
- unlit capability validation before GPU publication;
- no NORMAL or TEXCOORD_0 silently ignored;
- no visual asset can affect physics;
- no partial GPU resource publication;
- first-frame callback occurs only after every draw succeeds;
- failure leaves the debug vehicle usable;
- disposal is idempotent;
- current green base checkpoint remains recoverable.

## Explicit non-goals

- no normals or lighting;
- no textures or images;
- no owner-authored final model;
- no static scan rendering;
- no native JV WASM changes;
- no merge or Ready transition.
