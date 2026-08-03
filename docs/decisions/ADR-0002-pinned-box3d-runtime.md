# ADR-0002 — pinned audited Box3D browser package

Status: accepted for F2

## Decision

F2 uses exactly:

```text
box3d.js@0.0.2
entrypoint: box3d.js/inline
binding: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

The package version is exact in `package.json` and `package-lock.json`. All direct calls are confined to `src/physics/box3d-boundary.ts` and the owned fixture below that boundary.

## Evidence

```text
npm integrity:
sha512-ziC6IqMbMAYns1aJ7E1czhBEE2Kj+/QK9L16vMXOz7UaXKUj9gX7Za5ut+Dg3euHK6I/1brFSHOpmOwCI6FhYQ==

tarball SHA-256:
020ba0ca3ecfea79d8f776bdca982779e6d13f80ce437bc4a0dac18830bd62dd
```

The inline single-threaded runtime contains its WASM bytes and has no runtime CDN or external `.wasm` path.

## Constraints

- package identity does not prove vehicle parity;
- threaded and external-WASM variants are outside F2;
- inline native helpers absent from embind require a named compatibility registry and independent tests;
- package or engine updates require a new receipt, engine-delta review and B0–B5 rerun;
- no unrelated application module may import `box3d.js` directly.
