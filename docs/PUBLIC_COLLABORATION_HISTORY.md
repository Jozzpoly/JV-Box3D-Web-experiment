# JV Web — public collaboration and pull-request history

Updated: 2026-08-04
Status: `CANONICAL PUBLIC HISTORY MAP`
Owner: Jozz

## Purpose

JV Web was developed through a deliberately stacked sequence of draft pull requests. GitHub will expose those pull requests when the repository becomes public, but their open state must not be interpreted as twelve competing merge proposals.

This document classifies the complete pull-request set observed on 2026-08-04. It preserves evidence while identifying the current authority.

No pull request listed here is approved for merge or ready-for-review solely because it appears in this index.

## Current authority

```text
architecture authority: PR #17 / agent/jv-web-refoundation
active source-public and portable-package candidate: PR #18 / agent/jv-web-demonstrator-foundation
product physics authority: future native JV Core + Box3D WASM, not a current PR
owner approval authority: Jozz
```

The intended public default branch has not yet been selected or updated. `main` remains stale and private.

## Pull-request map

| PR | Classification | Durable value | Public interpretation |
|---|---|---|---|
| #1 | `QUARANTINED HISTORICAL PROTOTYPE` | runnable browser experiments, asset/render lessons, rejected steering failure evidence | never merge wholesale; contains historical root MIT license and rejected host-driven centering |
| #2 | `SUPERSEDED FOUNDATION RECOVERY` | audit recovery, early contracts and branch model | historical bridge from quarantine to clean implementation; current state/docs have precedence |
| #4 | `F1 HISTORICAL VALIDATED CHECKPOINT` | fixed-step host, timestamped steering timeline, lifecycle | retained engineering evidence; later branches inherit it |
| #6 | `F2 HISTORICAL VALIDATED CHECKPOINT` | typed Box3D/WASM boundary, real contact, rebuild lifecycle | retained dependency/runtime evidence; old custom workflow policy is superseded |
| #8 | `CLOSED QUARANTINED FAILED EXPERIMENT` | evidence of unsafe self-modifying validation and failed F3 attempt | do not resume or merge |
| #9 | `F3 HISTORICAL VALIDATED CHECKPOINT` | strict native factory receipt validation | retained configuration/provenance evidence |
| #11 | `F4 HISTORICAL VALIDATED CHECKPOINT` | current M6 topology fixture and deterministic vehicle host | retained topology/reference-runtime evidence, not native parity |
| #13 | `F5 STEERING RESEARCH` | physical rack-space RATE profiles and deterministic matrix | experimental candidates only; no approved product default |
| #14 | `VISUAL OBSERVER CHECKPOINT` | read-only physical transform observer | retained browser-observation evidence |
| #15 | `LEGACY DRIVE FIXTURE WITH ERRATUM` | drive/reverse/brake/coast liveness and determinism | central `40 m/s` interpretation is wrong; native value is a `40 rad/s` wheel rev limit; do not use as product drivetrain specification |
| #16 | `DYNAMIC STEERING MEASUREMENT` | held-lock and post-RELEASE rack-excursion receipts | diagnostic evidence; no force-clamp or steering fix approved |
| #17 | `REFOUNDATION ARCHITECTURE` | one physics authority, native JV Core WASM direction, documentation cleanup | current architecture authority; locally validated but still draft/unmerged |
| #18 | `ACTIVE DEMONSTRATOR FOUNDATION` | portable package, source-public gates, compliance/history tooling, mobile/scene contracts | current active candidate; remains draft and unapproved for merge/publication |

## Issue map

| Issue | Classification | Interpretation |
|---|---|---|
| #3 | `COMPLETED F1 MILESTONE` | historical milestone receipt |
| #5 | `COMPLETED F2 MILESTONE` | historical Box3D boundary milestone |
| #7 | `COMPLETED F3 MILESTONE` | historical factory-receipt milestone |
| #10 | `COMPLETED F4 MILESTONE` | historical topology milestone |
| #12 | `HISTORICAL F5 RATE RESEARCH` | remains useful research context; not the current release roadmap |

## Complete observed public discussion surface

The repository owner had twelve pull requests at the time of this inventory:

```text
#1, #2, #4, #6, #8, #9, #11, #13, #14, #15, #16, #17, #18
```

Correction: the sequence above contains thirteen numbers because PR numbers are sparse and all thirteen listed PR records were returned by the GitHub repository query. The canonical count is therefore:

```text
13 pull requests total
12 open draft pull requests
1 closed quarantined pull request (#8)
0 merged pull requests
```

Available bodies and top-level comments for all thirteen records were reviewed through the GitHub connector. No obvious credential, token, Jozz-local filesystem path or private owner e-mail was observed.

This is not a byte-level audit of every GitHub internal object. Formal reviews and inline threads were separately checked for the highest-risk PRs and none were found. The source/history scanner and manual GitHub settings/log review remain independent gates.

## Historical claims with explicit precedence

### Drive units

```text
superseded PR #15 wording: maxDriveSpeed = 40 m/s
native JV source meaning: maxDriveSpeed = 40 rad/s wheel rev limit
```

The PR #15 erratum and current refoundation documents have precedence.

### Backend authority

```text
legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

A green historical fixture test does not establish native JV parity.

### Steering release

```text
RELEASE = hands off in the first fixed step
```

Any historical host-driven return-to-centre or centre-hold behavior is rejected failure evidence.

## Public presentation policy

Before `SOURCE_PUBLIC_READY_PASS`:

1. this history map is linked from the public README;
2. PR #15 retains its prominent erratum;
3. PR #1 and #8 remain visibly quarantined;
4. current README/state identifies PR #17 and #18 as authorities;
5. Jozz decides whether superseded open drafts remain open or are closed as historical without deletion;
6. no PR is merged merely to simplify the public list;
7. no historical discussion is rewritten to manufacture a cleaner past.

## Owner decision still required

The repository can be public with historical draft PRs if their meaning is explicit. Closing superseded drafts may make the public surface easier to navigate, but it is not a security requirement and is not performed automatically.

Jozz must choose one policy before public visibility:

```text
A. preserve all historical drafts open, with this map as authority
B. close superseded drafts as historical, preserving bodies/comments and branches
C. selectively close only the clearly completed/quarantined stacks
```

None of these choices changes source code or establishes merge approval.
