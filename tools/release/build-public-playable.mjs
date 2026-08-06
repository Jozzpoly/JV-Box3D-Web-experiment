import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { validatePublicPlayableArtifact } from "./public-playable-release-lib.mjs";

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, "../..");
const outputRoot = join(repositoryRoot, "dist-public");
const viteCli = join(repositoryRoot, "node_modules", "vite", "bin", "vite.js");

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error !== undefined) {
    throw new Error(`${label} could not start.`, { cause: result.error });
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${String(result.status)}.`);
  }
}

function capture(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(`${label} failed.`);
  }
  return result.stdout.trim();
}

run(process.execPath, [viteCli, "build", "--config", "vite.public.config.ts"], "Public Vite build");

const commit = capture("git", ["rev-parse", "HEAD"], "Public release commit identity");
await writeFile(join(outputRoot, ".nojekyll"), "", "utf8");
await writeFile(
  join(outputRoot, "release-manifest.json"),
  `${JSON.stringify({
    schema: "JV_WEB_PUBLIC_PLAYABLE_RELEASE_V1",
    mode: "MAP_ONLY_PUBLIC_R0",
    sourceCommit: commit,
    privateScanIncluded: false,
    githubPagesReady: true,
    publicationPerformed: false,
  }, null, 2)}\n`,
  "utf8",
);

const receipt = await validatePublicPlayableArtifact(outputRoot);
console.log(JSON.stringify(receipt, null, 2));
