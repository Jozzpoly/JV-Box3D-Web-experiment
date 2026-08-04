# JV Box3D Web

Browser host and research environment for Jozz Vehicle, currently undergoing a fundamental architecture and documentation refoundation.

## Read first

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md)
3. [`docs/REFOUNDATION_LOOP_PL.md`](docs/REFOUNDATION_LOOP_PL.md)
4. [`docs/decisions/ADR-0003-native-jv-core-wasm.md`](docs/decisions/ADR-0003-native-jv-core-wasm.md)

Historical audits and handoffs are evidence, not active instructions. Their classification and migration are tracked in [`docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md`](docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md).

## Current truth

The browser runtime already demonstrates:

- deterministic fixed-step ownership;
- timestamped steering and longitudinal input;
- real `box3d.js` WASM worlds and contacts;
- a receipt-derived multi-body M6 reference vehicle;
- physical rack steering with `RELEASE | POSITION | RATE`;
- a read-only WebGL observer;
- physical wheel-motor drive, reverse, coast and braking;
- 75/75 local tests, TypeScript check, production build and browser execution on the latest validated pre-refoundation head.

This is a serious browser research fixture, but **not yet a native-parity JV product runtime**.

A critical audit found that the current TypeScript drive path interprets native `maxDriveSpeed = 40` as a linear target in `m/s`, while native JV defines it as a wheel rev limit in `rad/s` and scales torque rather than target speed with throttle. Green liveness and determinism tests therefore did not prove behavioral parity.

## Architecture direction

The product physics authority will be:

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
        TypeScript browser host/render/UI
```

The current TypeScript vehicle becomes the named reference backend:

```text
legacy_ts_m6
```

It remains useful for browser integration, lifecycle, input, rendering, A/B comparisons and known failure reproduction. It is not the destination for further product physics or future tire development.

## Owner rules

- Jozz owns feel, visual and product-default decisions.
- No hidden steering centering or other artificial default mechanics.
- `RELEASE` means hands off in the first fixed step.
- Legacy split sphere/sidewall is a regression baseline, not the future tire.
- Wheel Scope feeds knowledge and validated native backends, not automatic code promotion.
- No merge or ready-for-review transition without Jozz.
- No automatic workflow loops, self-modifying CI or Git Diff Patcher Bridge.

## Current working line

```text
agent/jv-web-refoundation
```

It starts from:

```text
agent/f5-dynamic-steering-validation
0d938e402f618ae34e0d959a9862d97c2f88a926
```

Historical stacked draft PRs remain untouched as evidence. Refoundation changes are isolated and reversible.

## Local reference runtime

Target environment:

```text
Node 24.x
npm 11.x
```

From the repository root:

```powershell
npm ci
npm run check
npm run build
npm run dev
```

The current reference runtime uses `box3d.js@0.0.2`. A custom native JV Core + Box3D WASM build is the next architectural milestone, not yet present on this branch.

## Repository roles

```text
src/core/        fixed-step and resource ownership
src/input/       semantic timestamped input
src/physics/     current box3d.js boundary
src/vehicle/m6/  legacy_ts_m6 reference backend
tests/           logic and real-WASM reference tests
docs/decisions/  accepted architecture decisions
docs/receipts/   measurements and immutable evidence
docs/archive/    historical audits, handoffs and quarantine evidence
```

## Immediate program

1. compress and archive stale documentation;
2. remove contradictory active status claims;
3. make the legacy backend identity explicit;
4. define units and semantics at every runtime boundary;
5. build the smallest native JV Core + Box3D WASM spike;
6. compare native and WASM scenario traces;
7. replace the browser physics backend only after parity evidence.
