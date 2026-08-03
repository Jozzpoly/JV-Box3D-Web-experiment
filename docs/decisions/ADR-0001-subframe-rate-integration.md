# ADR-0001 — Sub-frame steering taps use signed-time integration

Date: 2026-08-03
Status: `ACCEPTED FOR F1 HOST / TARGET-BROWSER VALIDATION PENDING`

## Context

Keyboard and touch buttons are digital devices, while the clean simulation advances at a fixed timestep. A press and release can both occur between two fixed-step boundaries. Polling only the current key state can lose that tap. Forcing every tap to remain active for one whole step preserves it, but invents a minimum duration and changes the driver's actual timing.

## Decision

For each fixed-step interval, the input timeline integrates the signed steering direction over real event time:

```text
LEFT  = +1
RIGHT = -1
both or neither = 0
```

The emitted `RATE` value is:

```text
signed active milliseconds / fixed-step milliseconds
```

Consequences:

- a short tap is preserved proportionally;
- a full-step hold emits `RATE ±1`;
- a step with zero signed integral emits `RELEASE`;
- events exactly at the end boundary apply to the next step;
- equal timestamps are ordered by monotonic insertion sequence;
- dropped simulation intervals consume events and update end state but emit no vehicle command;
- key-up does not create a return-to-zero phase or centre hold.

This decision concerns device-time sampling only. It does not choose the physical rack rate, servo law, target-lead cap or steering feel.

## Rejected alternatives

### Render-frame polling

Rejected because command traces depend on render cadence and sub-frame taps can disappear.

### One-step latch

Rejected as the default because it silently stretches every shorter tap to a full fixed step.

### Ignore sub-frame taps

Rejected because it directly destroys the precise digital steering behavior requested by Jozz.

## Evidence

The isolated F1 checkpoint passes deterministic tests for:

- 15/30/60/120 FPS equivalence;
- irregular render cadence;
- proportional sub-frame taps;
- boundary ordering;
- same-timestamp ordering;
- direction reversal;
- focus and visibility release;
- dropped-gap state advancement.

The current evidence was produced with TypeScript 5.8.3 and Node 22 in an isolated validation environment. The declared target remains Node 24 with the committed dependency versions. Target-toolchain and real-browser verification are still required before F1 completion.

## Revisit conditions

Revisit only if real browser timestamp behavior, mobile pointer timing or owner testing proves that proportional integration is unstable or unintuitive. Any replacement must preserve render-cadence independence and must not reintroduce automatic centering.