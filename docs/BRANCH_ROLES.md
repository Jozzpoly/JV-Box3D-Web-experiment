# JV Web — branch roles and preserved history

Updated: 2026-08-06  
Purpose: navigation only; always verify current branch tips through GitHub before acting.

## Active and authoritative lines

| Branch | Fixed identity | Role |
|---|---:|---|
| `repair/jv-web-release-r0` | base `c8e0bf24748b...`; current tip must be fetched | Controlled R0 repair line. Only current campaign work belongs here. |
| `product/jv-web-car-map-scan` | preserved `c8e0bf24748b...` | Strongest preserved product base. Freeze as comparison/rollback while R0 is developed. |
| `main` | navigation guard at `b48c50699a7c...`; fetch current tip | Minimal historical default branch. Not the current product implementation. |

## Frozen candidates

| Branch | Verified historical tip | Classification |
|---|---:|---|
| `candidate/jv-web-owner-vehicle-visual-r1` | `796b050b4b90...` | `FROZEN / BROKEN / SALVAGE ONLY`; no merge or continuation as a product line. |
| `candidate/jv-web-render-host-r1` | `e263e3e05ea2...` | Historical bounded render-host experiment; selective source review only. |

## Historical evidence and salvage lines

| Branch | Verified historical tip | Role |
|---|---:|---|
| `agent/jv-lit-normal-foundation` | `26c5022f8dfd...` | Historical lit-normal source and tests; never promote wholesale. |
| `agent/jv-real-vehicle-texture-scan-plan` | `d75660889cda...` | Historical architecture plan; not current product state. |
| `agent/jv-refoundation-control-plane` | `fd4d96fdf479...` | Historical operators/evidence model; its active-state claims are superseded. |
| `agent/jv-render-host-r1-validation-operator` | `b452c375b092...` | Historical validation operator tied to the render-host candidate. |
| `agent/jv-tiny-unlit-pass` | `f27b92d826e1...` | Historical tiny-proof/layer-control line. |
| `agent/jv-web-demonstrator-foundation` | `78150858049c...` | Historical large foundation formerly associated with PR #18. |
| `agent/jv-web-playable-runtime` | `d6aa218064c2...` | Earlier accepted playable reference; superseded by later product integration for current direction. |
| `agent/jv-web-playable-attached-gate-fix` | `0c3bb543f806...` | Historical recovery helper. |
| `agent/jv-web-playable-pathfix` | `99cbd10e7b65...` | Historical recovery helper. |
| `agent/jv-web-playable-recovery` | `99cbd10e7b65...` | Historical alias at the same tip. |
| `agent/jv-web-playable-recovery-v2` | `99cbd10e7b65...` | Historical alias at the same tip. |

## Rules

- Branch names and documents do not prove runtime quality.
- The current repair tip is dynamic; fetch it immediately before analysis or writes.
- Closed PR text is historical context, not the current work order.
- Do not delete these branches during R0; preservation is cheaper and safer than history rewriting.
- Do not merge or cherry-pick a complete historical branch into the repair line.
- Salvage must identify exact files/commits, restate the technical question and pass fresh gates on the current base.
- The product base remains the rollback target until an owner-accepted R0 commit supersedes it.
