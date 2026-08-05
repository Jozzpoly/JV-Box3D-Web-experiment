# Decision register

Statuses:

- `ACCEPTED` — may guide implementation;
- `PROVISIONAL` — must be proven by a named gate;
- `REJECTED` — do not pursue without a new owner decision;
- `SUPERSEDED` — retained for history.

| ID | Status | Decision | Evidence / gate |
|---|---|---|---|
| D-001 | ACCEPTED | Native JV remains physics and authored-native-asset authority. | Direct repository/source lineage. |
| D-002 | ACCEPTED | Product physics should use portable JV Core and Box3D in one future WASM module. | Shared memory/handle authority and confirmed semantic drift in the TS port. |
| D-003 | ACCEPTED | `legacy_ts_m6` is a reference/browser fixture only. | Native/TS drive semantics differ; parity is not proven. |
| D-004 | ACCEPTED | Renderer consumes stable semantic identities and immutable copied snapshots, never persistent Box3D handles. | Long-term native/WASM boundary. |
| D-005 | ACCEPTED | The product has one scene, camera and render-context owner. | Lifecycle and compositing risk of independent renderers. |
| D-006 | PROVISIONAL | Three.js owns product glTF scene graph, materials, textures and skinned assets. | Must pass R4 real-car spike on desktop and phone. |
| D-007 | PROVISIONAL | Current package/hash/budget/preflight contracts can be adapted around Three.js. | Must demonstrate failure isolation and no duplicate decode ownership in R4. |
| D-008 | ACCEPTED | Recover the PR #1 wheel marker contract concept, not the whole PR #1 host. | Source-confirmed useful mechanism plus unreproducible and coupled host. |
| D-009 | ACCEPTED | Real vehicle precedes scan activation. | Prevents two unresolved rendering problems from being combined. |
| D-010 | ACCEPTED | Historical implementation branches are salvage sources, not canonical product lines. | Size, stacking and evidence problems. |
| D-011 | REJECTED | Blind fast-forward or wholesale merge of the historical foundation stack into `main`. | Not reviewable or attributable. |
| D-012 | REJECTED | Continue adding final mechanics to TypeScript to imitate native JV. | Creates two drifting physics products. |
| D-013 | REJECTED | Treat synthetic tiny/lit fixtures as proof of a real vehicle pipeline. | Fixtures prove contracts only. |
| D-014 | REJECTED | Use two independent product renderers for vehicle and scan. | Context, camera, lifecycle and compositing ownership conflict. |
| D-015 | REJECTED | Make generated synthetic public staging a mandatory product-dev prerequisite before the product requires it. | Build coupling without user value. |
