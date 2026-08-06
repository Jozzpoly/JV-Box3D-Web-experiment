import test from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import {
  applyCanonicalLauncherEnvironment,
  buildCanonicalLauncherEnvironment,
} from "../tools/repair/run-r0b-toolchain-gate-entry.mjs";

test("R0-B launcher collapses duplicate Windows PATH casing", () => {
  const nodeExecutable = "C:\\toolchains\\node-v24.16.0\\node.exe";
  const environment = buildCanonicalLauncherEnvironment(
    { PATH: "upper-path", Path: "mixed-path", OTHER: "kept" },
    nodeExecutable,
    "win32",
  );
  const pathKeys = Object.keys(environment).filter(
    (key) => key.toLowerCase() === "path",
  );
  assert.deepEqual(pathKeys, ["Path"]);
  assert.equal(
    environment.Path,
    `${dirname(resolve(nodeExecutable))};upper-path`,
  );
  assert.equal(environment.NODE, resolve(nodeExecutable));
  assert.equal(environment.npm_node_execpath, resolve(nodeExecutable));
  assert.equal(environment.OTHER, "kept");
});

test("R0-B launcher uses one canonical POSIX PATH", () => {
  const nodeExecutable = "/toolchains/node-v24.16.0/bin/node";
  const environment = buildCanonicalLauncherEnvironment(
    { Path: "mixed-path", PATH: "upper-path" },
    nodeExecutable,
    "linux",
  );
  assert.deepEqual(
    Object.keys(environment).filter((key) => key.toLowerCase() === "path"),
    ["PATH"],
  );
  assert.equal(
    environment.PATH,
    `${dirname(resolve(nodeExecutable))}:mixed-path`,
  );
});

test("R0-B launcher mutates target to one canonical PATH key", () => {
  const target = { PATH: "upper", Path: "mixed", KEEP: "yes" };
  const nodeExecutable = "/toolchains/node-v24.16.0/bin/node";
  applyCanonicalLauncherEnvironment(target, nodeExecutable, "linux");
  assert.deepEqual(
    Object.keys(target).filter((key) => key.toLowerCase() === "path"),
    ["PATH"],
  );
  assert.equal(target.KEEP, "yes");
  assert.equal(target.NODE, resolve(nodeExecutable));
});
