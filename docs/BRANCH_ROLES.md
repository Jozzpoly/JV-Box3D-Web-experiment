# JV Web — branch roles and preserved history

Updated: 2026-08-08
Purpose: navigation only; always fetch exact current tips before acting.

## Active development

| Branch | Role |
|---|---|
| `development/jv-web-r1` | Active private JV-Web core / post-R0 product-development line. New product work belongs here. |

## Closed / preserved product lines

| Branch | Role |
|---|---|
| `repair/jv-web-release-r0` | Closed R0 repair/release history. Do not use as ongoing feature lane. |
| `product/jv-web-car-map-scan` | **Strongest preserved historical desktop car+E2R+JSPREV2 baseline**, currently at `c8e0bf24748b...`: exact Windows source/build/package/asset gate PASS plus historical owner-observed correct scan, pixel-filter control, grid control and collision. Use for selective scan recovery, not wholesale merge. |
| private `main` | Historical/navigation default branch, not active product implementation. |

`106312083875...` inside the product line remains the important pre-fix causal baseline for scan UV/filter/view attribution.

Exact evidence and recovery pointers:

- [`handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`](handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md)
- [`handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`](handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md)

## Public repository

`Jozzpoly/JV-Box3D-Web-Public` is an artifact repository, not a source-development repo.

| Branch | Fixed R0 role |
|---|---|
| `main@401068f5734c...` | Neutral public control-plane/rollback reference. |
| `release/r0@c3e33e3dcd34...` | Frozen first public artifact, tree `f1c5c9a97120...`, Pages source. |

Do not edit R0 bytes in place.

## Frozen candidates

| Branch | Verified historical tip | Classification |
|---|---:|---|
| `candidate/jv-web-owner-vehicle-visual-r1` | `796b050b4b90...` | `FROZEN / BROKEN / SALVAGE ONLY`; useful importer/calibration/texture ideas, but live renderer remained incomplete. |
| `candidate/jv-web-render-host-r1` | `e263e3e05ea2...` | Historical bounded render-host experiment; selective review only. |

## Historical evidence / salvage lines

Existing `agent/*` refoundation, playable, render, texture and visual branches remain historical evidence or selective salvage sources. None becomes an authority merely because it contains more code.

## Native JV

`Jozzpoly/Box3d_FunProject` is not an active branch family of this campaign. It is maintained by another agent and remains read-only here.

It may be consulted for exact source assets, preset semantics and existing mechanisms to port, especially `b3Wheel`.

## Rules for R1

- Start from current `development/jv-web-r1`, not an old candidate.
- Preserve public R0 as regression/rollback reference.
- Use `product/jv-web-car-map-scan@c8e0bf...` as a proven historical scan behavior source, not as a new branch base.
- Salvage exact files/ideas only after restating the technical question and validating against current R1.
- Do not wholesale merge historical branches.
- Prefer bounded slices with visible runtime value over infrastructure-only expansion.
- Release engineering should remain lightweight until a new public artifact is worth publishing.
- Owner play/feel may change the order of otherwise valid tasks.
