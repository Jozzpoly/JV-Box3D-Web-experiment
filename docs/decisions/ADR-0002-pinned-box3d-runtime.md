# ADR-0002 — Pinned audited Box3D browser package

Date: 2026-08-03
Status: `ACCEPTED FOR THE REFERENCE RUNTIME`

## Decision

JV Web currently uses exactly:

```text
box3d.js@0.0.2
entrypoint: box3d.js/inline
binding: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

The package version is exact in `package.json` and `package-lock.json`. Direct binding calls are confined to `src/physics/box3d-boundary.ts` and owned physics implementations below that boundary.

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
- threaded and external-WASM variants are outside the current runtime;
- inline native helpers absent from embind require a named compatibility implementation and independent tests;
- package or engine updates require an explicit dependency review, lockfile/notices update and real boundary/contact rerun;
- unrelated application modules must not import `box3d.js` directly.

The future product backend may compile Box3D and native JV Core together instead of using this package. That migration does not invalidate this ADR for the existing `legacy_ts_m6` reference fixture.
