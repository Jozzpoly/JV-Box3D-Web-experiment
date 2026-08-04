# ADR-0001 — Sub-frame steering taps use signed-time integration

Date: 2026-08-03
Status: `ACCEPTED`

## Context

Keyboard and touch buttons are digital devices, while the simulation advances at a fixed timestep. A press and release can both occur between two fixed-step boundaries. Polling only current key state can lose that tap. Forcing every tap to last one whole step preserves it but invents a minimum duration and changes the driver's timing.

## Decision

For each fixed-step interval, the input timeline integrates signed steering direction over real event time:

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
- key-up does not create return-to-zero or centre hold.

This decision concerns device-time sampling only. It does not choose physical rack rate, servo law, target-lead cap or final steering feel.

## Rejected alternatives

### Render-frame polling

Rejected because command traces depend on render cadence and sub-frame taps can disappear.

### One-step latch

Rejected as the default because it silently stretches every shorter tap to a full fixed step.

### Ignore sub-frame taps

Rejected because it destroys the precise digital steering behavior requested by Jozz.

## Evidence

The current automated suite covers:

- 15/30/60/120 FPS command-trace equivalence;
- irregular render cadence;
- proportional sub-frame taps;
- fixed-step boundary and same-timestamp ordering;
- direction reversal;
- focus and visibility release;
- dropped-gap state advancement;
- shared fixed-step sampling with longitudinal input.

The project has previously passed these contracts on Node 24. A fresh full gate is still required after the current repository cleanup before making a current-head PASS claim.

## Revisit conditions

Revisit only if real browser or mobile pointer timing proves proportional integration unstable or unintuitive. Any replacement must preserve render-cadence independence and must not reintroduce automatic centering.
