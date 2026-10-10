import test from "node:test";
import assert from "node:assert/strict";
import { formatHudDrive, formatHudSteering } from "../.test-dist/product-hud-copy.js";

test("driving HUD names drive state in player language", () => {
  assert.equal(formatHudDrive({ mode: "COAST", command: { throttle: 0, brake: 0 } }), "Luz");
  assert.equal(formatHudDrive({ mode: "THROTTLE", command: { throttle: 0.8, brake: 0 } }), "Gaz 80%");
  assert.equal(formatHudDrive({ mode: "THROTTLE", command: { throttle: -0.6, brake: 0 } }), "Wstecz 60%");
  assert.equal(formatHudDrive({ mode: "BRAKE", command: { throttle: 1, brake: 0.4 } }), "Hamulec 40%");
});

test("driving HUD reports where the wheels point as a share of full lock", () => {
  assert.equal(formatHudSteering(0, 0.075), "Prosto");
  assert.equal(formatHudSteering(0.001, 0.075), "Prosto");
  assert.equal(formatHudSteering(0.0375, 0.075), "Lewo 50%");
  assert.equal(formatHudSteering(-0.075, 0.075), "Prawo 100%");
  assert.equal(formatHudSteering(0.02, 0), "Prosto");
});
