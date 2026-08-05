# JV Web refoundation control plane

## Purpose

This directory defines how JV Web is recovered into a trustworthy long-term project. It deliberately does not choose a product implementation by document alone.

The control plane exists to prevent four recurring failures:

1. long stacked branches becoming an undocumented alternate product history;
2. AI summaries being treated as primary evidence;
3. synthetic tests being promoted to browser or owner validation;
4. mutable native sources, dependencies and assets making historical checkpoints impossible to reproduce.

## Canonical reading order

1. [`VALIDATED_STATE.md`](VALIDATED_STATE.md) — what is known now.
2. [`DECISION_REGISTER.md`](DECISION_REGISTER.md) — accepted, provisional and rejected decisions.
3. [`EVIDENCE_STANDARD.md`](EVIDENCE_STANDARD.md) — what each status word means.
4. [`BRANCH_POLICY.md`](BRANCH_POLICY.md) — how work is isolated and integrated.
5. [`RECOVERY_PLAN.md`](RECOVERY_PLAN.md) — ordered gates before ordinary product work.
6. [`BASELINE_MATRIX.json`](BASELINE_MATRIX.json) — machine-readable refs and status.

## Refoundation objective

The project is ready for long-term work only when it has:

- one clean, owner-approved product branch;
- one current and concise AI memory;
- reproducible local gates with raw logs;
- pinned dependency, native and asset provenance;
- a real owner-authored vehicle surviving load, failure, destroy and rebuild;
- an accepted renderer direction proven on desktop and phone;
- explicit boundaries for scan rendering and future native JV Core WASM;
- no conflicting active handoffs or stacked PRs treated as canonical.

## Scope of this control plane

This control plane governs evidence, history and architecture recovery. It does not:

- certify any historical implementation branch as green;
- select Three.js solely by documentation;
- merge or close historical PRs;
- publish a site;
- add GitHub Actions;
- alter native JV.
