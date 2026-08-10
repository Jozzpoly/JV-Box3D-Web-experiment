# AI project memory — JV Web

Updated: 2026-08-10
Status: `R0 PUBLISHED / R1 ACTIVE / IMPLEMENTATION FROZEN / ORCHESTRATOR HANDOFF PREP`
Owner: Jozz

This file is a **router**, not project history. Current Git, exact execution evidence and direct owner observation outrank documentation.

## Repository roles

```text
PRIVATE SOURCE / ACCEPTED PRODUCT AUTHORITY
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

FROZEN S1 EXPERIMENT / OWNER-VALIDATED EVIDENCE
work/owner-rig-s1-attachment-authority
frozen tip: 393ef4600be5c83ef42bced4a8a451446e372c32
tree:       92c896a8b0579a66b3c5381b777baf853a469908

PUBLIC FRIEND-DEMO
Jozzpoly/JV-Box3D-Web-Public
release/r0
frozen published tip: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

NATIVE JV
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

`main` and the frozen work branch intentionally mean different things:

- `main` = accepted/integrated product state;
- frozen work branch = newer experimental product/evidence that is **not integrated into main**.

Do not merge or continue the frozen branch merely because it contains newer code.

## Current owner checkpoint

S1-D FL upper-wishbone **static FRONT + TOP geometry is OWNER ACCEPTED at the current visual precision**.

Exact reviewed candidate:

```text
commit: 393ef4600be5c83ef42bced4a8a451446e372c32
tree:   92c896a8b0579a66b3c5381b777baf853a469908
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

Acceptance is deliberately narrow. Live articulation, FR mirroring, mesh proportion/stretch and wheel-side upright/hub packaging are **not accepted**.

Owner also observed from the wheel-side view that wishbone/wheel-side geometry reaches the tire region and the intermediate upright/hub package remains buried in the wheel. That is downstream evidence, not an S1-D rejection.

## Implementation state

**FROZEN FOR CONTROLLED ORCHESTRATOR HANDOFF.**

`docs/IMPLEMENTER_TASK.md` on `main` must remain INACTIVE until the new orchestrator passes takeover gates and deliberately opens a new bounded task.

Handling/stability/steering-feel recovery remains deferred until visual recovery closes.

## Fresh orchestrator bootstrap

1. Resolve live private/public refs.
2. Read `AGENTS.md`.
3. Read this file.
4. Read `docs/HANDOFF.md`.
5. Reconstruct accepted vs frozen transaction state before implementation.
6. Read `docs/OWNER_CHECKPOINTS.md` and `docs/PROJECT_STATE.md` only as needed to verify the reconstruction.
7. Load campaign/source/tests only for a named question.

Do not reconstruct old chats or archived branches by default.

The first new-orchestrator operation is **state reconstruction only**, not implementation.
