# Developing JV Web

## Requirements

```text
Node 24
npm 11+
Git
modern browser with WebGL
```

The repository pins Node through `.node-version`, exact npm dependencies through `package-lock.json` and strict engine enforcement through `.npmrc`.

## Common commands

Install the exact dependency graph:

```powershell
npm ci
```

Run the development server:

```powershell
npm run dev
```

Run TypeScript, tests, documentation links and third-party checks:

```powershell
npm run check
```

Build and validate the portable package:

```powershell
npm run build
```

Run the complete guarded local gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

Preview the built package on the local network:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

## Evidence levels

Keep these distinct:

```text
source present
static review
Node tests
portable build validation
desktop browser observation
real phone observation
Jozz driving/visual acceptance
native parity
```

Do not turn one level into a claim about another.

## Tests

Tests include deterministic pure-JS contracts and real `box3d.js` runtime scenarios. The test runner compiles TypeScript test output into `.test-dist/`, which is ignored.

When adding a mechanism:

1. identify the physical or lifecycle claim;
2. add a negative/counterexample test where useful;
3. keep browser device input outside the controller;
4. preserve fixed-step determinism;
5. validate resource disposal and rebuild;
6. state what was not tested.

## Runtime receipt

`public/receipts/jv_m6_factory_receipt.json` is a byte-pinned configuration input. `.gitattributes` disables text conversion for this file. If Windows changes its bytes, use the focused repair script rather than editing it manually:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\repair-windows-receipt.ps1"
```

## Branch workflow

Use one active development branch and one active PR. Close or delete obsolete branches after useful conclusions are compressed into current code or short documentation.

Do not add custom GitHub Actions by default. Local validation is sufficient at the current scale and avoids unnecessary CI cost and public workflow clutter.

## Before proposing integration

- working tree clean;
- active branch pulled to the exact remote head;
- local gate PASS;
- browser smoke performed;
- known limitations updated in `PROJECT_STATE.md`;
- no private assets, local paths or credentials in the current tree;
- Jozz accepts the exact candidate.
