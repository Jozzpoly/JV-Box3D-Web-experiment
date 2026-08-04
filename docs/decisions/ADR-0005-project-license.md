# ADR-0005 — JV Web project license

Date: 2026-08-04
Status: `PROPOSED / OWNER DECISION REQUIRED`
Decision owner: Jozz

## Context

The repository is intended to become public after `SOURCE_PUBLIC_READY_PASS`.

A public GitHub repository is not automatically open source. Without an explicit license, default copyright applies and third parties do not receive general permission to reproduce, distribute or create derivative works from the code.

The current candidate has exact third-party notices but no root project `LICENSE`.

A reachable historical surface already contains:

```text
PR #1 / agent/bootstrap-web-poc
MIT License
Copyright (c) 2026 Jozz Vehicle contributors
```

When the repository becomes public, that historical PR and its licensed content may become publicly visible unless an explicit history/ref strategy changes first.

## Scope separation

The project license decision applies only to the JV Web source files for which Jozz owns or controls the rights.

It does not automatically license:

- third-party Box3D, box3d.js, Vite or TypeScript code;
- native JV source copied from a separately governed repository;
- Blockbench/Blender models;
- vehicle art;
- scans and source photographs;
- textures, audio or fonts;
- future scene packages;
- trademarks, project names or logos.

Third-party terms remain in `THIRD_PARTY_NOTICES.md`. Public assets require their own rights manifest.

## Option A — MIT for current JV Web code

Proposed SPDX identifier:

```text
MIT
```

Properties:

- permits use, copy, modification, merge, publication, distribution, sublicensing and sale;
- requires preservation of the copyright and permission notice;
- includes the standard warranty/liability disclaimer;
- aligns with the historical MIT text on PR #1;
- is compatible with the permissive runtime dependencies currently used;
- produces the simplest public-history explanation.

Consequences:

- commercial reuse and forks are permitted;
- modified versions do not need to publish source changes;
- project identity/trademark protection must be handled separately;
- asset exclusions must be explicit.

Recommended only if Jozz intends broad permissive reuse of the code.

## Option B — public source with no open-source grant

Implementation:

- retain default copyright or add a precise all-rights-reserved notice reviewed for the intended jurisdiction;
- do not label the project open source;
- update README and contribution language accordingly.

Consequences:

- third parties can view the public source but do not receive a general reuse/distribution grant;
- GitHub's normal platform functionality does not replace a software license;
- the historical MIT content in PR #1 becomes inconsistent with the intended current policy unless it is explicitly accepted as a separately MIT-licensed historical subset or removed from the public collaboration/history surface before visibility changes;
- the current audit requirement for a root project license/rights notice must be satisfied with an exact owner-approved text.

This option requires the most careful historical cleanup and legal wording.

## Option C — Apache-2.0 for current JV Web code

Proposed SPDX identifier:

```text
Apache-2.0
```

Properties:

- permissive use and distribution;
- explicit patent grant and patent-termination terms;
- notice requirements are more structured than MIT.

Consequences:

- current code and historical PR #1 code would have different license histories unless Jozz relicenses the historical owner-controlled code consistently;
- provenance and NOTICE handling become more complex;
- this complexity currently provides no demonstrated project benefit.

Not recommended for the first public release unless the explicit patent terms are a deliberate owner requirement.

## Preliminary recommendation

```text
MIT for owner-controlled JV Web source
+ explicit asset exclusions
+ exact THIRD_PARTY_NOTICES
+ separate trademark/project-name statement
```

Reason:

- it matches the only historical project license already present;
- it minimizes contradictory public history;
- it is short, standard and machine-detectable;
- current runtime dependencies are already permissive;
- no contributor-license or patent-management requirement has been identified yet.

This recommendation is not approval. The broad commercial and sublicensing permissions are material and require Jozz's explicit decision.

## Required owner fields

Before creating `LICENSE`, Jozz must choose:

```text
license strategy:
  A — MIT
  B — public source / no open-source grant
  C — Apache-2.0
  OTHER — requires a new review

copyright holder text:
  e.g. "Jozz Vehicle contributors"
  or another exact owner-approved public/legal name

copyright year:
  2026 unless owner chooses a range
```

## Implementation gate after owner decision

1. create the exact root `LICENSE` or owner-approved rights notice;
2. pin its normalized SHA-256 and detected identifier in a receipt;
3. update README ownership/licensing status;
4. update the reachable-license inventory tests if the chosen identifier changes the expected classification;
5. run `audit:licenses` on the exact public candidate;
6. classify historical PR #1 explicitly;
7. ensure asset and native-source exclusions remain visible;
8. obtain Jozz's approval of the exact file bytes.

## Non-decision

No license is selected by this ADR while its status remains `PROPOSED / OWNER DECISION REQUIRED`.
