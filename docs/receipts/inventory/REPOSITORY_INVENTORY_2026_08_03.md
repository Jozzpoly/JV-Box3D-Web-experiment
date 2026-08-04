# Repository inventory receipt — 2026-08-03

Status: `CORRECTED_BYTE_LEVEL_RECEIPT / SEMANTIC_COVERAGE_PARTIAL / PRIVATE_SCOPE_LIMITED`

## 1. Corrected workflow evidence

```text
workflow: audit-all-repository-inventory
run:      30820855552
job:      91710125384
artifact: 8858776745
artifact name: jozz-repository-inventory
artifact ZIP digest reported by GitHub:
sha256:e4707e2d63a1b19597042006ae698ab9a3a524377df36c645a1021c1f3209ef9
```

The inventory's internal deterministic content receipt is:

```text
d9d6b5ea4b64c779d23578bfecb17181597e87388dc3a93dfdc2259f4dcd926d
```

This is a SHA-256 over the sorted hashes of all receipt files stored below `snapshots/` in the artifact.

## 2. What one tree receipt contains

For every accessible tracked path the artifact records:

```text
path
Git mode
Git object type
Git object SHA
byte count
line count for text
SHA-256 of file content
classification: text / binary / LFS pointer / symlink / submodule
```

Each repository/ref also has:

```text
exact commit
commit date and subject
raw git tree
submodule status
sorted files.tsv
tree-receipt SHA-256
```

A tree receipt proves which bytes were in the audited Git snapshot. It does not prove that every file has already received semantic review.

## 3. Exact accessible snapshots

| Repository/ref | Commit | Files | Bytes | Text files | Text lines | Tree receipt SHA-256 |
|---|---|---:|---:|---:|---:|---|
| `Box3d_FunProject/main` | `959aefb78587ce60cf2b8eb03ff82797a4165142` | 550 | 13,690,807 | 548 | 309,327 | `4d8c59337df216165353772d7d4862a5052dc91d4072d888588a7e03eaea3080` |
| `Box3d_FunProject/jozz-scan-terrain-f0` | `761bd3ef60992f7dec3bcdddf1945fdbc1cb0825` | 588 | 14,832,058 | 586 | 330,459 | `71a682b3d08a3a7f726544ef628975a4daa034fcf6be49a7547ba806560d39b0` |
| `voxel-aeronautics-workshop/main` | `873933f1ebd8e98d05ad644a9dda2de47d467b1f` | 345 | 9,411,073 | 339 | 172,774 | `b8d9cd9120ee2654e71b55b1e5de150e29dbfd78a0922d71b452d77d08c0e032` |
| `Simply_game_experiment/master` | `b54904f22819fc10e9202e389f6b77a03d67636a` | 272 | 1,421,823 | 113 | 35,118 | `9d597301685de425191f8d8d4ce8a5658e38d83f7cb7f909ec0abbffc7891d02` |
| `JV-Box3D-Web-experiment/main` | `5c64903d753f893adc42be90e0c3d8053a95a922` | 1 | 144 | 1 | 3 | `377ac36693e3891ace6e8b7557d2c3b62c1c35a9763a4e05180a9ce158392530` |
| `JV-Box3D-Web-experiment/agent/bootstrap-web-poc` | `891c7561142b601f62ea76b68b0f55f8fababc6c` | 34 | 204,946 | 34 | 5,520 | `851d922440c387a4d3980ddc930f9edfa3729c428e023ff602732262ea4b0145` |
| `JV-Box3D-Web-experiment/agent/fundamental-audit-rebuild` at inventory time | `c6e659f4bb889342bc48b427f23a73810fac7dcf` | 16 | 116,628 | 16 | 2,921 | `49e94300d5e480d42e0cd031ec40f35814e3b7e245fc2edd77678abbbd92cf22` |

The clean audit branch continued after this receipt. Its row is therefore a historical snapshot, not the current HEAD.

## 4. Private repositories excluded from CI cloning

The workflow deliberately did not receive a broad personal token. These scopes are recorded as:

```text
JOZZ-ENGINEERING-SANDBOX/main
Coopege/main
HomeScan-Web-Builder/main
planet-matter-lab/main
Jozz_Test_Mod_0.04/main

status: CONNECTOR_ONLY_NO_RECURSIVE_TREE_RECEIPT
```

The GitHub connector can read known/searchable files in these repositories with the owner's authorization, but the currently available connector action set does not expose a complete recursive Git tree endpoint. Therefore no claim of complete byte-level inventory or semantic review is made for them.

## 5. Local working-tree limitation

This inventory sees only committed GitHub state. It cannot see:

- uncommitted local changes;
- ignored files;
- local build outputs;
- files outside the repository;
- a newer `C:\...\box3d` working tree not pushed to GitHub;
- local asset edits not committed or covered by a separate local receipt.

Remote GitHub is not treated as proof of the owner's local working tree.

## 6. Corrected inventory bug

The first successful-looking version passed `FETCH_HEAD` as both the checkout ref and the human ref label. As a result, two `Box3d_FunProject` branches could write into the same snapshot directory and the second overwrite the first receipt files.

The corrected workflow separates:

```text
ref_label   = main / jozz-scan-terrain-f0
checkout_ref = FETCH_HEAD
```

The corrected artifact proves two distinct directories and two distinct tree hashes.

The earlier artifact must not be used as the canonical inventory receipt.

## 7. GitHub Actions failure lesson

The forensic workflows were initially configured with automatic `push` and/or `pull_request` triggers while the audit branch was receiving many documentation commits.

Observed final workflow run numbers before disabling automation:

```text
audit-box3d-js-source          25
audit-box3d-engine-delta       16
audit-all-repository-inventory  5
```

This represents 46 workflow invocations. Some were necessary while correcting the tools; many repeated already-known evidence and should not have occurred.

The sequential disable operation itself caused three final duplicate runs because the GitHub contents connector can update only one file per commit:

```text
commit 83d9e360 — inventory became manual-only;
                  dependency and engine workflows ran once more
commit 21eadaa8 — engine became manual-only;
                  dependency workflow ran once more
commit 01de9b79 — dependency became manual-only;
                  no workflow runs followed
```

Current refoundation policy:

```text
forensic workflows removed from active tree
no replacement workflow created
receipts retained as evidence
```

The historical workflows must not be restored unless an exact source change creates a named evidence question and Jozz approves the cost.

## 8. Coverage vocabulary

### `BYTE_INVENTORIED`

Every tracked path in the exact accessible Git tree has an object/content receipt.

### `SEMANTICALLY_CLASSIFIED`

A file or subsystem has been read for role, source authority, risks and adoption status.

### `LINE_BY_LINE_COMPARED`

Two exact implementations have been compared for the named behavior.

### `RUNTIME_MEASURED`

A named scenario was executed with a pinned toolchain/config and produced a receipt.

### `OWNER_VALIDATED`

Jozz performed the manual test and issued the verdict.

The corrected public inventory establishes `BYTE_INVENTORIED` only. Selected native JV, wheel research, binding, host and asset paths received deeper review. The rest must not be described as fully understood.

## 9. Canonical usage

Use the inventory to:

- prove that a path existed in an exact snapshot;
- locate files that had not yet received semantic review;
- detect changed bytes before reusing an old conclusion;
- compute audit coverage by subsystem;
- prevent branch/ref confusion.

Do not use it to claim:

- correctness;
- product readiness;
- semantic understanding;
- runtime equivalence;
- owner approval.