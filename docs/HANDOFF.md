# JV-Web — handoff

Updated: 2026-09-01
Owner: Jozz

Use this file for an actual handoff/continuation. A new chat is **not** by itself a new takeover campaign.

## 1. Current mode

JV-Web is in bounded product iteration after a completed Steering I1 milestone consolidation.

The 2026-08-26 read-only strategic cold-takeover campaign is historical. Do not restart it unless new evidence creates a real strategic reason.

JV-Web is a standalone browser Jozz Vehicle product/R&D surface, separate from NextGen JV. It may learn from NextGen/JURE/JV_CORE/JES, but those projects do not own JV-Web live truth.

## 2. Start here

For a fresh continuation:

1. verify live `Jozzpoly/JV-Box3D-Web-experiment/main`;
2. read `AGENTS.md`;
3. read `docs/PROJECT_STATE.md`;
4. inspect only the source/tests relevant to the requested slice;
5. if steering is involved, read `docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md` and `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`.

Do not reconstruct the entire project history unless current evidence actually conflicts.

## 3. Current steering truth

The Steering I1 baseline established:

- touch steering pointer release defaults to semantic `RELEASE`;
- no hidden Owner-facing automatic return-to-zero is part of the current product behavior;
- the graphical steering wheel follows physical rack state while hands-off;
- re-grab begins from physical rack state, preventing UI/physics offset;
- 900 degrees total wheel range is the current default and Owner-used current-best;
- 360/540/720/1080 are available for later comparison, not final approved ratios;
- range preference persists in the browser session;
- artificial centering is retained only as an internal/test control path, not product configuration;
- natural physical self-return remains unresolved.

Owner feedback on the current 900-degree behavior was strongly positive, but scoped. Do not convert it into a claim that all ranges/devices or all steering physics are finalized.

## 4. Evidence boundary

### OWNER-OBSERVED

Owner directly confirmed on the current steering Preview that:

- hands-off UI/rack synchronization works;
- physics movement followed by re-grab no longer creates the previous offset/jump;
- current 900-degree driving feel is substantially better than before and better than expected.

Owner is currently learning 900 degrees rather than comparing range presets.

### EXECUTED EVIDENCE

The source candidate passed the canonical Owner Preview build/validation/composition path with unchanged accepted JSPREV2.

### NOT VALIDATED

- final steering range;
- Owner feel for non-900 presets;
- changing range during an already-active gesture;
- dedicated mobile session-persistence check;
- comprehensive whole-product regression during the final steering feedback checkpoint;
- useful natural physical self-return.

## 5. If steering work resumes

The strongest unresolved mechanical question is why the current physical system provides essentially no useful self-return/self-alignment.

A sensible future R2 would be bounded research, not an immediate physics rewrite:

- identify current geometry/contact/constraint/damping contributors;
- distinguish expected caster/trail/tire/contact effects from solver or representation limitations;
- design the smallest falsifier that can separate likely causes;
- preserve the accepted touch RELEASE/rack-sync baseline while testing physics.

Do **not** solve this by silently reintroducing automatic centering or a fake spring merely to produce visual return.

R2 is a candidate next slice, not an obligation. Re-ground current product priorities first.

## 6. If another product slice is chosen

Use the default workflow:

`small need -> smallest sensible change -> risk-matched test -> faithful render/device evidence -> Owner judgement`

Do not expand camera/UI/input work into drivetrain/rig/physics changes without causal need. Do not expand a mechanics experiment into a UI redesign.

## 7. Git / Preview discipline

- `main` is source authority after accepted consolidation.
- `preview/owner-control` is exact-source composition infrastructure only.
- Public/Friends artifacts remain separate authority.
- Historical `work/*`, checkpoint and accidental/noop branches are not current authority and do not require cleanup merely because they exist.
- Before writes, resolve repo/ref/current source again.
- Before promotion, re-check ancestry and use non-force fast-forward when available.

## 8. Things a new agent must not infer

Do not infer that:

- current M6/Box3D architecture is the future NextGen architecture;
- 900 degrees is permanently frozen;
- lack of natural self-return is accepted product behavior;
- artificial centering is an accepted substitute;
- old roadmap/falsifier documents are current tasks;
- a new chat means another cold takeover;
- historical branches should be consolidated or deleted automatically.

Current evidence should decide the next slice.
