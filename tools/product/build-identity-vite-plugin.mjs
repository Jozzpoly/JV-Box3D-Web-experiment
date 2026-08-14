import { execFileSync } from "node:child_process";

const FULL_GIT_SHA = /^[0-9a-f]{40}$/i;

function normalizeSourceCommit(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return FULL_GIT_SHA.test(trimmed) ? trimmed.toLowerCase() : null;
}

export function resolveJvBuildSourceCommit({
  env = process.env,
  cwd = process.cwd(),
} = {}) {
  if (env.JV_BUILD_SOURCE_COMMIT !== undefined) {
    const explicit = normalizeSourceCommit(env.JV_BUILD_SOURCE_COMMIT);
    if (explicit === null) {
      throw new Error(
        "JV_BUILD_SOURCE_COMMIT must be an exact 40-character Git SHA.",
      );
    }
    return explicit;
  }

  try {
    const detected = normalizeSourceCommit(
      execFileSync("git", ["rev-parse", "HEAD"], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
    return detected ?? "DEV";
  } catch {
    return "DEV";
  }
}

export function buildIdentityVitePlugin({ sourceCommit } = {}) {
  const resolved = sourceCommit ?? resolveJvBuildSourceCommit();
  if (resolved !== "DEV" && normalizeSourceCommit(resolved) === null) {
    throw new Error(
      "JV build identity requires DEV or an exact 40-character Git SHA.",
    );
  }

  const normalized = resolved === "DEV" ? "DEV" : resolved.toLowerCase();
  const marker = `JV_BUILD_SOURCE:${normalized}`;
  return {
    name: "jv-build-identity",
    config() {
      return {
        define: {
          __JV_BUILD_SOURCE_COMMIT__: JSON.stringify(normalized),
          __JV_BUILD_SOURCE_MARKER__: JSON.stringify(marker),
        },
      };
    },
  };
}
