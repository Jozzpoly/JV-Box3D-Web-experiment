# Developing JV Web

Updated: 2026-08-08
Campaign: **R1 friend-demo development**

## Requirements

```text
Node 24
npm 11+
Git
modern browser with WebGL
```

The repository pins Node through `.node-version`, exact npm dependencies through `package-lock.json` and strict engine enforcement through `.npmrc`.

## Common commands

```powershell
npm ci
npm run dev
npm run check
npm run build
```

The historical guarded foundation gate remains available:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

but it is **not** the default requirement after every private R1 edit.

## Evidence levels

Keep these distinct:

```text
source present
focused/static checks
Node tests
portable build validation
browser observation
real phone observation
Jozz visual/driving acceptance
public publication
native parity
```

Never promote one level into another without evidence.

## R1 validation tiers

The project deliberately uses different validation weight for different kinds of work.

### Tier 1 — ordinary private development slice

Default for bounded implementation work.

Required:

- exact current branch/ref identity;
- clean attributable scope;
- focused tests/checks covering the changed subsystem;
- relevant TypeScript/build check when the change crosses those boundaries;
- smallest useful browser smoke if browser behavior changed;
- truthful statement of what was not tested.

Do not require Jozz to run a Windows package merely because code changed.

### Tier 2 — owner feel / visual / real-device checkpoint

Use when automation cannot answer the product question, for example:

- real vehicle proportions/placement;
- chase-camera feel;
- touch/pinch behavior;
- scan appearance/performance on a real phone;
- driving/configuration usefulness.

Agent prepares the exact candidate and performs all automatable validation first. Jozz should only need to drive/look/feel and report the requested observation.

### Tier 3 — public release candidate

Use only when a meaningful owner-visible slice is ready for Web-Public.

Required:

- exact source identity;
- reproducible public artifact;
- artifact file/hash closure;
- public-repo promotion verification;
- rollback point;
- live HTTPS smoke;
- owner acceptance appropriate to the release.

Do not recreate the R0 release campaign for every private checkpoint.

## Tests and implementation discipline

When adding or changing a mechanism:

1. state the narrow claim/question;
2. preserve the last known working baseline;
3. add focused regression/counterexample coverage where useful;
4. keep device input outside physics/controller authority;
5. preserve fixed-step/lifecycle ownership;
6. validate resource disposal/rebuild when touched;
7. distinguish source/test proof from browser/device/owner proof;
8. stop if a small slice expands into unrelated infrastructure.

For historical salvage:

- never wholesale-merge an old branch merely because it has more features;
- identify the exact useful file/idea/commit;
- compare it to current R1;
- transplant only what survives current assumptions;
- preserve provenance in the commit/documentation when it matters.

## Local/private scan development

The current private product can use local JSPREV2 through `JOZZ_SCAN_PREVIEW_PACK` and the dev-only Vite scan plugin. This is a local/private capability.

Do not infer from a successful local scan that GitHub Pages publication is solved. Public scan delivery requires its own explicit asset packaging/hosting decision.

## Runtime receipt

`public/receipts/jv_m6_factory_receipt.json` is a byte-pinned configuration input. `.gitattributes` disables text conversion for this file. If Windows changes its bytes, use the focused repair script rather than manually editing the receipt:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\repair-windows-receipt.ps1"
```

## Branch workflow

Active product work belongs on `development/jv-web-r1` until the project deliberately establishes a successor. Fetch its exact remote tip before every write.

PRs are optional process tools, not a requirement for every bounded private slice. Do not add custom GitHub Actions by default. Local/focused validation is sufficient at the current scale and avoids unnecessary CI cost and workflow clutter.

## Before integrating a private slice

- scope attributable and branch identity exact;
- relevant automated checks PASS;
- relevant browser behavior observed if changed;
- no accidental private/public asset leakage;
- state/known limitations updated when materially changed.

Jozz acceptance is required when the claim depends on his visual/play/feel judgment, not as a mechanical ritual for every code change.

## Before public promotion

Use the Tier 3 release process. Preserve R0; promote a new versioned artifact rather than modifying `release/r0` in place.