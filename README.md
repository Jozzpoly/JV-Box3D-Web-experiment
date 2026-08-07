# JV Web

JV Web is the desktop/mobile browser demonstrator for Jozz Vehicle. It combines Box3D WebAssembly vehicle physics, E2R/offroad terrain, desktop/mobile controls and a dependency-light WebGL observer. A private LOCAL_FULL mode can also use local JSPREV2 data; the first public release is intentionally map-only.

## Current status — first public R0 is live

```text
private source:
  Jozzpoly/JV-Box3D-Web-experiment
  R0 source commit 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
  tree 08314a0182a38bbcd106e984dde73e737a1a13e7

public artifact:
  Jozzpoly/JV-Box3D-Web-Public
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
  tree f1c5c9a971208d89da05143f10913891a58b3b70

live:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R0 passed exact Windows source/artifact validation, reproducible two-build comparison, public-repository promotion verification and a final live GitHub Pages Edge smoke with zero scan requests. Jozz additionally validated the live page manually on desktop and a real smartphone, including driving, steering and braking.

Read [`AGENTS.md`](AGENTS.md), [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md), [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) and the canonical [`R0 published baseline`](docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md) before changing anything.

## What R0 proves

R0 proves the release foundation:

- exact private source → reproducible public artifact;
- structural `MAP_ONLY_R0`;
- no private JSPREV2 requests in the public runtime;
- separate public artifact repository;
- GitHub Pages project-path delivery;
- desktop browser runtime;
- real-phone owner validation;
- rollback to the previous public control commit.

## What R0 deliberately does not claim

The current public vehicle is still the synthetic/reference M6 demonstrator.

```text
runtime backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
product physics authority: false
native JV parity: NOT_PROVEN
```

The final owner chassis, real wheel visuals and broader product presentation are future work. Public R0 also intentionally excludes the private JSPREV2 scan.

## Controls

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse/free-area drag     orbit camera
mouse wheel              zoom
mobile buttons           multi-touch vehicle controls
```

## Development direction after R0

The R0 release lane is now frozen as a baseline. New product work belongs on `development/jv-web-r1`.

The next phase should improve the real product systematically rather than reopening release plumbing:

1. define and integrate the intended real chassis/four-wheel visual path;
2. decide which mechanics remain reference/demo and which become product authority;
3. preserve a continuously playable desktop/mobile build;
4. selectively salvage historical experimental work only after revalidation;
5. produce new versioned public artifacts instead of modifying R0 in place.

## Toolchain

Canonical R0 toolchain:

```text
Node 24.16.0
npm 11.13.0
TypeScript 7.0.2
Vite 8.1.5
```

Useful private-source commands remain:

```powershell
npm ci
npm run check
npm run dev -- --host 0.0.0.0
npm run build:public-r0
```

A release claim is valid only when tied to exact source, commands, environment, artifact hashes, runtime evidence and rollback.

## Known R0 limitations

- synthetic vehicle visual;
- native JV parity not proven;
- build-manifest publication flags describe the pre-public build-time state;
- harmless `/favicon.ico` 404 at the GitHub user-site root;
- branch protection/default-branch normalization and broader hardening are deferred;
- no general public reuse license is granted.

Third-party notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
