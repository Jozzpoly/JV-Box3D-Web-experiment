# `box3d.js@0.0.2` dependency receipt — 2026-08-03

Status: `MEASURED_FACT / ENGINE_DELTA_PENDING`

Evidence source:

```text
workflow: audit-box3d-js-source
run:      30816077386
job:      91694046725
artifact: 8856776966
```

## 1. Published npm artifact

```text
package:      box3d.js
version:      0.0.2
published:    2026-07-02T04:04:11.290Z
registry:     https://registry.npmjs.org
npm shasum:   e2162ffaa9fec9f908ac73873e78dfd5eb5120ac
npm integrity sha512:
ziC6IqMbMAYns1aJ7E1czhBEE2Kj+/QK9L16vMXOz7UaXKUj9gX7Za5ut+Dg3euHK6I/1brFSHOpmOwCI6FhYQ==

tarball SHA-256:
020ba0ca3ecfea79d8f776bdca982779e6d13f80ce437bc4a0dac18830bd62dd
```

Published tarball contains ten files and only prebuilt distribution artifacts plus metadata/readme/license. It does not contain the Box3D source tree or a textual upstream engine SHA.

## 2. Binding source identity

Npm metadata provides an exact `gitHead`:

```text
repository: https://github.com/isaac-mason/box3d.js.git
commit:     2617a0ff763a60c9f17cee57c6ea72aab75a5077
tree:       3ae30430b99c5f15fb10c8700ccbf2abf279953d
commit subject: chore: bump to v0.0.2
```

The v0.0.2 commit changes package metadata/version; the compiled distribution lineage is inherited from the same repository state and submodule recorded at that commit.

## 3. Upstream Box3D engine identity

The binding repository has:

```text
submodule path: vendor/box3d
submodule URL:  https://github.com/erincatto/box3d.git
engine commit:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
engine tag:     v0.1.0
commit date:    2026-06-30T10:57:46-07:00
commit subject: Missing functions (#21)
```

Computed audit source-tree hash for the checked-out engine submodule:

```text
89e82903cc5824a09f8742953813594e9587e82a77d4930c27927aade30ea122
```

The hash is a SHA-256 over the sorted per-file SHA-256 listing of tracked submodule files. It is an audit receipt, not a Git object ID.

## 4. Published binary/type hashes

```text
dist/box3d.d.ts
 e8b3384c1947295b42718f6d89701b87d46f1218234c1be232b99bba58b83fed

dist/box3d.inline.mjs
 efd1b669682cbacee92f6c30b6174a8d8f77e811c4a807d1494205df64bfe132

dist/box3d.mjs
 c43aaf85ac592b110f9d95f294726b4eebafadee68824764053c1bdb3d4be23d

dist/box3d.wasm
 2c7005a1ed14c5eca53b51e9c0c0295100b03b368fbaeb4a480d1a9783701e4c

dist/box3d.mt.inline.mjs
 104547a798b360f5adca91b228abbfa613c3b8be4b9e4baba62a63bd2aa3b6b0

dist/box3d.mt.mjs
 b53984d320b96c7a1c08ea846202cf19cf332fb558f0850b0985da712283925a

dist/box3d.mt.wasm
 382bc2c8d8f0be33b60a9756f9e472a6f420aa16df301110c41aed90f22af9d6
```

The contaminated PoC imports the single-threaded inline build.

## 5. Build semantics observed in binding source

The exact binding build script:

- builds the checked-out Box3D submodule as a Release static library;
- disables samples, unit tests, benchmarks, docs and validation;
- links `src/bindings.cpp` through Emscripten/embind;
- uses `-O3 -DNDEBUG` for release;
- enables SIMD128 and memory growth;
- exports ES modules;
- produces single-threaded and optional pthread variants;
- creates the inline build through Emscripten single-file output;
- post-processes generated TypeScript definitions and appends JS facade helpers.

The npm package therefore does not use the `Jozzpoly/Box3d_FunProject` source tree. It uses upstream Erin Catto Box3D at exact commit `8441b4a…`.

## 6. What this receipt proves

`PROVEN`:

- exact npm artifact identity and integrity;
- exact binding repository/commit/tree;
- exact upstream Box3D submodule commit;
- hashes of the binaries/types used by the old PoC;
- broad release build flags and binding path.

`NOT PROVEN YET`:

- semantic equivalence between upstream `erincatto/box3d@8441b4a…` and `Jozzpoly/Box3d_FunProject@959aefb…`;
- whether JV engine changes affect contacts, joints, mesh collision, rolling resistance, scheduling or APIs used by M6;
- whether rebuilding the binding today with a newer Emscripten toolchain reproduces the published WASM bytes;
- whether all C structs are marshalled identically through embind;
- whether the old PoC’s compatibility shim preserves every missing inline helper correctly.

## 7. Consequence for the clean rebuild

The old statement “Box3D WASM parity” is invalid. The correct description is:

```text
browser host using upstream Box3D v0.1.0 commit 8441b4a
with third-party embind bindings at 2617a0f,
while native JV runs a separate Jozzpoly fork at 959aefb.
```

Before product implementation adoption, one route must be chosen and receipted:

### Route A — build web binding from the exact JV engine fork

Advantages:

- one engine source of truth;
- engine patches and diagnostics can be shared deliberately;
- strongest parity boundary.

Requirements:

- audited Emscripten build in/alongside native repo;
- explicit export policy;
- deterministic artifact receipts;
- upstream/binding license preservation;
- web-safe patch review.

### Route B — stay on upstream npm engine and maintain an explicit delta contract

Advantages:

- smaller immediate toolchain burden.

Requirements:

- exact engine diff classification;
- tests proving every JV-used behavior is unaffected or faithfully adapted;
- unsupported fork-only behavior rejected;
- no use of the word parity outside the proven subset.

The engine delta audit decides whether Route B is technically honest. It does not decide product direction without owner approval.