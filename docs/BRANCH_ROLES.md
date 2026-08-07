# JV Web — branch roles and preserved history

Updated: 2026-08-07
Purpose: navigation only; always fetch exact current tips before acting.

## Active development

| Branch | Role |
|---|---|
| `development/jv-web-r1` | Active post-R0 product-development line. Starts from the R0 grounding checkpoint. New product work belongs here. |

## Closed/frozen authoritative lines

| Branch | Role |
|---|---|
| `repair/jv-web-release-r0` | Closed R0 repair/release history. Contains source/build-profile work that produced the first public release. Do not use as the ongoing feature lane. |
| `product/jv-web-car-map-scan` | Preserved pre-R0 product comparison line at `c8e0bf24748b...`. |
| private `main` | Historical/navigation default branch, not active product implementation. |

## Public repository

`Jozzpoly/JV-Box3D-Web-Public` is an artifact repository, not a source-development repo.

| Branch | Fixed R0 role |
|---|---|
| `main@401068f5734c...` | Neutral public control-plane/rollback reference. |
| `release/r0@c3e33e3dcd34...` | Frozen first public artifact, tree `f1c5c9a97120...`, Pages source. |

## Frozen candidates

| Branch | Verified historical tip | Classification |
|---|---:|---|
| `candidate/jv-web-owner-vehicle-visual-r1` | `796b050b4b90...` | `FROZEN / BROKEN / SALVAGE ONLY`; do not resume or merge wholesale. |
| `candidate/jv-web-render-host-r1` | `e263e3e05ea2...` | Historical bounded render-host experiment; selective review only. |

## Historical evidence/salvage lines

Existing `agent/*` refoundation, playable, render, texture and visual branches remain historical evidence or selective salvage sources. None is an authority merely because it has more features.

## Rules for R1

- Start from the current `development/jv-web-r1` tip, not from an old candidate.
- Preserve public R0 as a regression/rollback reference.
- Salvage exact files/ideas only after restating the technical question and validating against current R1.
- Do not wholesale merge historical branches.
- Prefer bounded product slices with visible runtime value over infrastructure-only expansion.
- Release engineering should become lightweight until a new public artifact is actually needed.
