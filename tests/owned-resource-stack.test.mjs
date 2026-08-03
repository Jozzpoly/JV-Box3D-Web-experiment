import test from "node:test";
import assert from "node:assert/strict";
import {
  OwnedResourceStack,
  runResourceTransaction,
} from "../.test-dist/core/owned-resource-stack.js";

test("resources dispose in reverse order and disposal is idempotent", () => {
  const order = [];
  const stack = new OwnedResourceStack();
  stack.defer("first", () => order.push("first"));
  stack.defer("second", () => order.push("second"));

  assert.equal(stack.dispose().disposedCount, 2);
  assert.deepEqual(order, ["second", "first"]);
  assert.equal(stack.dispose().disposedCount, 0);
});

test("failed transaction disposes staged resources", () => {
  const order = [];
  assert.throws(() =>
    runResourceTransaction((resources) => {
      resources.defer("resource", () => order.push("disposed"));
      throw new Error("startup failed");
    }),
  );
  assert.deepEqual(order, ["disposed"]);
});

test("successful transaction transfers resource ownership", () => {
  const order = [];
  const transaction = runResourceTransaction((resources) => {
    resources.defer("resource", () => order.push("disposed"));
    return 42;
  });

  assert.equal(transaction.value, 42);
  assert.deepEqual(order, []);
  transaction.resources.dispose();
  assert.deepEqual(order, ["disposed"]);
});
