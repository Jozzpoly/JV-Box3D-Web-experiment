# AI project memory — JV Web

Updated: 2026-08-07
Status: `R0 PUBLISHED / FOUNDATION GROUNDED / R1 DEVELOPMENT READY`
Owner: Jozz

This is a compact navigation map for a fresh agent. It must never override Git, exact source, raw evidence or owner validation.

## Current truth in one screen

```text
private repository:
  Jozzpoly/JV-Box3D-Web-experiment

closed R0 source:
  5ba6cc406b8c1541e29cd1ae59ffed78a7509284
  tree 08314a0182a38bbcd106e984dde73e737a1a13e7

public repository:
  Jozzpoly/JV-Box3D-Web-Public

published release:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
  tree f1c5c9a971208d89da05143f10913891a58b3b70

validated candidate ZIP SHA-256:
  f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

Pages:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
  built from release/r0 /(root), HTTPS enforced

public main:
  401068f5734c841d43907b71484bc03a2396c604
  retained as neutral control-plane/rollback reference
```

## R0 closure

R0 is not a candidate anymore.

Exact pre-public Windows evidence proved:

- canonical Windows 11 x64 toolchain;
- Node 24.16.0 / npm 11.13.0 / TypeScript 7.0.2 / Vite 8.1.5;
- 290/290 tests;
- two independent MAP_ONLY_R0 public builds;
- 14/14 files byte-identical;
- project-path Edge runtime;
- generation rebuild;
- zero `/__jv_scan__/` requests.

Exact publication evidence then proved:

- normal fast-forward promotion from public rollback `401068f...`;
- public commit `c3e33e3...` with sole parent `401068f...`;
- exact public tree `f1c5c9a...`;
- fresh clone after push reproduced the same HEAD/tree;
- Pages source configured as `release/r0 /`;
- Pages API status `built`;
- final live HTTPS Edge smoke reached Running/LIVE, generation 1→2 and zero scan requests.

Publication evidence ZIP SHA-256:

```text
18bed9b4ed11c8620afebfdc5f78a21750a945b60ee6e0baa6337a52a4437fd1
```

The owner then manually confirmed the live public page on desktop and a real smartphone. The vehicle drove, steered and braked; the page worked in phone portrait and landscape; offroad/terrain content and the standard scene were usable.

Classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED — exact public Edge
OWNER ACCEPTED — live desktop + real phone manual use
PUBLISHED — GitHub Pages
```

The manual phone proof is owner observation of the live URL, not a machine-generated device receipt.

## Product meaning of R0

R0 proves the end-to-end web delivery foundation:

```text
private source
→ deterministic public MAP_ONLY_R0 build
→ exact artifact
→ separate public artifact repository
→ GitHub Pages
→ desktop browser
→ real phone
```

R0 does NOT prove that the current synthetic M6 visual or `legacy_ts_m6` backend is the final JV product.

The public release deliberately excludes the private JSPREV2 scan.

## Known R0 debt

- synthetic/proof vehicle instead of intended final owner models;
- `legacy_ts_m6` is `REFERENCE_BROWSER_FIXTURE`, `productPhysicsAuthority:false`, native parity not proven;
- build manifest publication booleans describe build-time dormant state and are now historically stale;
- harmless host-level `/favicon.ico` 404;
- public `release/r0` and `main` are currently unprotected;
- default-branch normalization, stronger hardening, performance work and custom 404/favicon are deferred;
- private/local scan publication policy remains undecided.

Do not “fix” any of these by mutating the published R0 artifact in place.

## Next active line

Use:

```text
development/jv-web-r1
```

as the post-R0 product development branch. Verify its exact current tip before work.

R1 should be systematic:

1. define the target vehicle/product architecture before importing old candidate code;
2. selectively salvage only proven pieces from historical branches;
3. establish the real chassis/four-wheel visual path;
4. keep R0 behavior available as a regression reference;
5. preserve desktop and mobile usability continuously;
6. create new release artifacts rather than rewriting R0.

## Historical branches

- `product/jv-web-car-map-scan@c8e0bf...` — preserved pre-R0 product comparison line.
- `repair/jv-web-release-r0` — completed R0 release/foundation history.
- `candidate/jv-web-owner-vehicle-visual-r1@796b050...` — frozen/broken/salvage-only.
- other `agent/*` and old candidate lines — evidence/selective salvage only, never wholesale merge.

## Read next

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`
4. `docs/BRANCH_ROLES.md`
5. exact files relevant to the next R1 goal
