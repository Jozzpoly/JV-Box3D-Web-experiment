# Branch and checkpoint policy

## Branch roles

### `main`

Minimal, owner-reviewed control plane and eventually the clean product line. It must not absorb the historical implementation stack by fast-forward.

### recovery branches

Named `agent/jv-recovery-<scope>`. They reproduce, measure or extract from historical refs. They are not product branches.

### spike branches

Named `agent/jv-spike-<question>`. They answer one architectural question and must have explicit success and rejection criteria.

### product candidate branch

Created only after the renderer spike and baseline recovery. It receives selected code by small, attributable commits or clean rewrites.

## Rules

1. Every branch starts from an explicitly recorded commit.
2. Every PR states one question or one deliverable.
3. Stacking is exceptional. Maximum intentional stack depth is two, with the dependency named in both PRs.
4. A branch does not inherit the evidence status of its parent after any relevant change.
5. Generated files and test fixtures must not become mandatory for ordinary development unless the product runtime actually needs them.
6. A workstream must not mix:
   - history cleanup;
   - renderer selection;
   - product features;
   - native physics migration;
   - scan activation.
7. No force update of shared refs without Jozz.
8. No merge, Ready transition, branch deletion or historical PR closure without Jozz.
9. Prefer small commits by concept. Avoid “foundation” commits containing unrelated architecture, build, renderer and product changes.
10. Each active PR updates the machine-readable baseline only when evidence changes, not when plans change.

## Checkpoint record

Every meaningful checkpoint records:

```text
commit
parent
branch
workstream question
changed scope
exact commands
evidence class reached
known failures
next allowed action
rollback point
```

## Integration rule

Historical code is accepted per module or concept, never per branch reputation.

Each recovered item is classified:

- `REUSE_AS_IS`;
- `REUSE_AFTER_TEST`;
- `REWRITE_FROM_CONTRACT`;
- `REFERENCE_ONLY`;
- `REJECT`.

A clean product candidate must be reviewable without reading the entire historical 600+ commit stack.
