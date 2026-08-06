# JV Web — public repository handoff contract

Status: `TARGET INITIALIZED / CONTROL PLANE ONLY / NO APPLICATION ARTIFACT`

## Exact public target

```text
repository:       Jozzpoly/JV-Box3D-Web-Public
visibility:       public
default branch:   main
control commit:   401068f5734c841d43907b71484bc03a2396c604
control tree:     d66569f5e557db01f2f0b7ee1bb465df208442aa
artifact branch:  release/r0
artifact tip:     401068f5734c841d43907b71484bc03a2396c604
Pages status:     NOT ENABLED BY THIS CAMPAIGN
artifact status:  NOT PRESENT
```

The public repository contains only publication guards, the artifact contract and `.nojekyll`. `release/r0` currently points to the same neutral control-plane commit as `main`; it is not a released application.

## Repository separation

The private repository remains the source, repair, build and evidence workspace. The public repository is not permitted to rebuild private source. It receives only exact bytes from an accepted static artifact after all private gates pass.

Do not copy:

- private Git history or development branches;
- `src/`, `node_modules`, package-manager caches or build workspaces;
- JSPREV2 scan bytes, indexes, textures or the `/__jv_scan__/` dependency;
- local filesystem paths, secrets, credentials, temporary tests or unreviewed receipts;
- inactive laboratory vehicle assets or source maps without separate approval.

## Promotion gate

Promotion to `release/r0` requires all of the following:

1. exact R0-B Node/npm/TypeScript/Vite evidence;
2. structural `MAP_ONLY_R0` with no scan capability or scan request;
3. reproducible, positive-allowlist artifact for `/JV-Box3D-Web-Public/`;
4. complete manifest and SHA-256 file table;
5. static path/network audit and runtime request capture;
6. desktop and real-phone validation of the exact artifact;
7. owner acceptance tied to the artifact hash;
8. known previous public commit for rollback.

Updating `release/r0`, accepting the artifact and enabling GitHub Pages are three separate operations. Pages must remain disabled until the promoted bytes and rollback are reverified in the public repository.
