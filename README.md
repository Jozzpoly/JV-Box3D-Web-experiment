# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile product, practical vehicle-physics R&D surface and evidence-backed experimentation environment.

It is its own product line. It is **not NextGen JV Lite**, and discoveries from other JV projects do not automatically imply shared architecture.

## Start here

For current work, use this authority order:

1. live Git and exact executed evidence;
2. `AGENTS.md` — operating rules;
3. `docs/PROJECT_STATE.md` — the single live project-state router;
4. focused baseline/evidence documents only when the current question requires them.

`docs/HANDOFF.md` is only a compact continuation entry point. `AI_PROJECT_MEMORY.md` is retained as a compatibility pointer, not a second state ledger.

## Repository roles

```text
Jozzpoly/JV-Box3D-Web-experiment
  main                  accepted source + canonical documentation authority
  preview/owner-control exact-source Owner Preview composition infrastructure
  work/* / research/*   only genuinely active bounded work or research

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends/public artifact authority
```

Historical work should be preserved by exact commits, evidence and archive tags rather than permanent stale branch refs.

## Accepted product baseline

The current accepted executable/current-best product snapshot is Steering I1:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Detailed baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

High-level accepted truth includes:

- Direct Rotation and Relative-X touch steering;
- semantic `RELEASE` instead of hidden automatic pointer return-to-zero;
- hands-off steering presentation following the physical rack;
- re-grab anchored to live physical rack state;
- configurable 360/540/720/900/1080 degree ranges with 900 degrees current default/current-best;
- artificial centering kept out of the Owner-facing product controls;
- established desktop/mobile controls and accepted scan/render foundations.

Natural physical steering self-return and many broader handling/product questions remain open.

Do not infer acceptance of an experiment merely because it can be built or appears in Owner Preview.

## Toolchain

Canonical repository toolchain:

```text
Node 24.16.0
npm >=11.13.0 <12
packageManager npm@11.13.0
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

`box3d.js@0.0.2` is currently a deliberate reproducibility baseline. Upstream 0.1.x changes the binding/API contract and must be treated as a separate compatibility investigation rather than routine housekeeping.

## Local validation

From a clean checkout with the canonical Node/npm versions:

```bash
npm ci
npm run build
```

Useful narrower commands include:

```bash
npm run typecheck
npm run test
npm run check
npm run build:portable
```

A green build proves reproducibility for the exact source tested. It does not by itself establish Owner/product acceptance.

## Work discipline

- verify mutable refs before writing;
- keep accepted product truth separate from experimental evidence;
- prefer the smallest experiment that can change a decision;
- preserve negative evidence instead of tuning it away;
- reconcile existing assertions when an accepted contract changes, rather than only adding new tests;
- do not retain branches merely as historical storage when an immutable archive ref is sufficient;
- do not create or modify GitHub Actions without explicit Owner approval;
- do not make the Owner perform routine engineering work that can be handled by the project tooling/agent.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
