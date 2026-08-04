import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, rm, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { relative, resolve, sep } from "node:path";

function createGit(root) {
  return (args, options = {}) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: options.encoding ?? "utf8",
      maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function assertInsideRoot(root, path, label) {
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (path === root || !path.startsWith(rootPrefix)) {
    throw new Error(`${label} must be a file path inside the repository root.`);
  }
}

function exactCommit(git, ref) {
  const commit = git(["rev-parse", "--verify", `${ref}^{commit}`]);
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`Unable to resolve exact commit for ${ref}: ${commit}`);
  }
  return commit;
}

function parseBundleHeads(text) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(" ");
      if (separator === -1) {
        throw new Error(`Malformed git bundle head: ${line}`);
      }
      return {
        commit: line.slice(0, separator),
        ref: line.slice(separator + 1),
      };
    })
    .sort((left, right) => left.ref.localeCompare(right.ref));
}

function runGit(root, args, input = null) {
  const result = spawnSync("git", args, {
    cwd: root,
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
  return {
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

export async function createOrphanRefArchive({
  root: requestedRoot,
  bundlePath: requestedBundlePath,
  refs,
}) {
  const root = resolve(requestedRoot);
  const bundlePath = resolve(requestedBundlePath);
  const git = createGit(root);
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]));
  if (repositoryRoot !== root) {
    throw new Error(
      `Archive root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }
  assertInsideRoot(root, bundlePath, "Bundle output");
  if (!Array.isArray(refs) || refs.length === 0) {
    throw new Error("At least one exact Git ref is required.");
  }
  if (new Set(refs).size !== refs.length) {
    throw new Error("Orphan-ref archive contains duplicate refs.");
  }
  if (await exists(bundlePath)) {
    throw new Error(`Archive output already exists and will not be overwritten: ${bundlePath}`);
  }

  const relativeBundlePath = relative(root, bundlePath).split(sep).join("/");
  const ignored = spawnSync("git", ["check-ignore", "--quiet", "--", relativeBundlePath], {
    cwd: root,
    encoding: "utf8",
  });
  if (ignored.status !== 0) {
    throw new Error(
      `Archive output must be ignored by Git before creation: ${relativeBundlePath}`,
    );
  }

  const dirty = git(["status", "--porcelain", "--untracked-files=all"])
    .split(/\r?\n/)
    .filter(Boolean);
  if (dirty.length > 0) {
    throw new Error(
      `Orphan-ref archive requires a clean working tree; found ${dirty.length} changed or untracked path(s).`,
    );
  }

  const before = refs.map((ref) => ({ ref, commit: exactCommit(git, ref) }));

  try {
    runGit(root, ["bundle", "create", bundlePath, ...refs]);
    const verify = runGit(root, ["bundle", "verify", bundlePath]);
    const heads = parseBundleHeads(
      runGit(root, ["bundle", "list-heads", bundlePath]).stdout,
    );

    for (const expected of before) {
      const head = heads.find((entry) => entry.ref === expected.ref);
      if (head === undefined) {
        throw new Error(`Bundle does not expose expected ref ${expected.ref}.`);
      }
      if (head.commit !== expected.commit) {
        throw new Error(
          `Bundle ref ${expected.ref} differs: ${head.commit} != ${expected.commit}.`,
        );
      }
    }

    const after = refs.map((ref) => ({ ref, commit: exactCommit(git, ref) }));
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      throw new Error("A source ref changed while the archive was created.");
    }

    const bytes = await readFile(bundlePath);
    const information = await stat(bundlePath);
    if (!information.isFile() || information.size !== bytes.byteLength) {
      throw new Error("Bundle output is not a stable regular file.");
    }

    return {
      schemaVersion: 1,
      generatedAtUtc: new Date().toISOString(),
      sourceRepositoryRoot: ".",
      bundlePath: relativeBundlePath,
      bytes: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      refs: before,
      bundleHeads: heads,
      verifySummary: [verify.stdout, verify.stderr].filter(Boolean).join("\n"),
      sourceRefsUnchanged: true,
      remoteRefsDeleted: false,
      note:
        "Private recovery artifact only. Creation does not authorize or perform remote-ref deletion, repository visibility changes, merges or publication.",
    };
  } catch (error) {
    await rm(bundlePath, { force: true });
    throw error;
  }
}
