# F5 minimal drive — local gate receipt (2026-08-04)

## Attempt 1

Head before lifecycle fix:

```text
61b1f8d0dc1d8bf49d63195fc0f8d65567beddc9
```

Measured locally on Windows:

```text
TypeScript: PASS
Real WASM drive tests: PASS
Full suite: 70 PASS / 1 FAIL / 71 total
Build: STOPPED before Vite production bundle
Browser runtime: NOT STARTED
```

The single failure was not in drive physics. It exposed a lifecycle defect shared by both keyboard adapters:

```text
adapter now(): 0 ms
timeline cursor: 16.666666666666668 ms
dispose() attempted RELEASE_ALL at 0 ms
result: event rejected as consumed-past input
```

The real drive tests that passed included:

- pinned native drive field mapping;
- positive throttle moving the settled M6 toward local +X;
- reverse movement;
- braking;
- coast behavior;
- deterministic drive command replay.

## Source fix

Current head:

```text
f7c672e154fb3f4e21d4342dd47554a31733d0f4
```

Both steering and longitudinal keyboard adapters now clamp every emitted event timestamp to:

```text
max(now(), timeline.cursorTimeMs)
```

This prevents key events, blur/pagehide releases and disposal releases from being inserted into already-consumed timeline history.

Regression tests reproduce the stale-clock case for both adapters:

- active input at 0 ms;
- consume timeline through 10 ms;
- keep adapter clock at 0 ms;
- dispose without throwing;
- next interval starts released.

## Current truth

```text
Drive mechanics source: PRESENT
Real WASM drive tests on previous head: PASS
Lifecycle fix source: PRESENT
Full gate on current head: NOT YET EXECUTED
Browser drive smoke: NOT YET EXECUTED
PR #15: DRAFT / DO NOT MERGE
GitHub Actions: NOT RUN
```
