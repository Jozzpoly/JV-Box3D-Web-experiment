# JV Web — public repository contract

Status: `R0 ARTIFACT PUBLISHED / PAGES LIVE`

## Exact public target

```text
repository:
  Jozzpoly/JV-Box3D-Web-Public

visibility:
  public

default/control branch:
  main@401068f5734c841d43907b71484bc03a2396c604

artifact branch:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

artifact tree:
  f1c5c9a971208d89da05143f10913891a58b3b70

Pages:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
  source release/r0 /(root)
  HTTPS enforced
```

## Repository separation

The private repository remains the source/build/development authority. The public repository is an artifact host.

Public release branches must not rebuild private source. They receive exact validated static bytes.

Do not copy into a public artifact:

- private Git history/development branches;
- `src/`, `node_modules`, caches or workspaces;
- JSPREV2 scan bytes/indexes/textures or `/__jv_scan__/`;
- local paths, credentials, temporary evidence or secrets;
- source maps or unapproved development-only data.

## Published R0 provenance

```text
source commit:
  5ba6cc406b8c1541e29cd1ae59ffed78a7509284

candidate ZIP SHA-256:
  f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public commit:
  c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

public tree:
  f1c5c9a971208d89da05143f10913891a58b3b70

previous public rollback:
  401068f5734c841d43907b71484bc03a2396c604
```

Publication evidence established a normal fast-forward promotion and a fresh-clone verification of the exact tree before Pages activation.

## Public release rule after R0

Never edit an already accepted release artifact in place merely to update metadata or cosmetics.

For R0 specifically, `build-manifest.json` contains build-time publication flags that say `DORMANT`/`publicReady:false`. Those fields are historically stale after publication but remain part of the validated artifact. Correct this model in a future manifest schema/release, not by mutating R0.

## Future promotion gate

A future release should at minimum require:

1. exact private source identity;
2. explicit public capability boundary;
3. reproducible public build;
4. positive payload allowlist;
5. sorted file hashes/manifest;
6. static and runtime network/privacy checks;
7. desktop runtime validation;
8. representative real-device owner validation when relevant;
9. known rollback;
10. byte-exact promotion to a new public commit.

Do not require unrelated historical R0 gates when they do not cover the new change.

## Branch roles

- `main` remains the neutral public control/documentation line for now.
- `release/r0` is the frozen first public release.
- later release naming/branching should be explicit; do not silently overwrite `release/r0`.
