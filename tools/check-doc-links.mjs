import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const ignoredDirectories = new Set([
  ".git",
  ".test-dist",
  "dist",
  "node_modules",
]);
const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

async function collectMarkdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(path)));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
      files.push(path);
    }
  }
  return files;
}

function normalizeTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const angleWrapped =
    trimmed.startsWith("<") && trimmed.endsWith(">")
      ? trimmed.slice(1, -1)
      : trimmed;
  const withoutTitle = angleWrapped.match(/^(\S+)(?:\s+["'][^"']*["'])?$/)?.[1];
  return withoutTitle ?? angleWrapped;
}

function isExternalOrAnchor(target) {
  return (
    target.length === 0 ||
    target.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target) ||
    target.startsWith("//")
  );
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const markdownFiles = await collectMarkdownFiles(root);
const failures = [];
let checkedLinks = 0;

for (const sourcePath of markdownFiles.sort()) {
  const text = await readFile(sourcePath, "utf8");
  let match;
  while ((match = markdownLinkPattern.exec(text)) !== null) {
    const rawTarget = match[1];
    const target = normalizeTarget(rawTarget);
    if (isExternalOrAnchor(target)) {
      continue;
    }

    const pathPart = target.split("#", 1)[0].split("?", 1)[0];
    if (pathPart.length === 0) {
      continue;
    }

    checkedLinks += 1;
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathPart);
    } catch {
      failures.push({
        source: relative(root, sourcePath),
        target,
        reason: "invalid percent encoding",
      });
      continue;
    }

    const resolvedTarget = resolve(dirname(sourcePath), decodedPath);
    if (!resolvedTarget.startsWith(root)) {
      failures.push({
        source: relative(root, sourcePath),
        target,
        reason: "target escapes repository root",
      });
      continue;
    }

    if (!(await exists(resolvedTarget))) {
      failures.push({
        source: relative(root, sourcePath),
        target,
        reason: "missing target",
      });
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Documentation link audit failed: ${failures.length} broken link(s) across ${markdownFiles.length} Markdown file(s).`,
  );
  for (const failure of failures) {
    console.error(
      `- ${failure.source} -> ${failure.target} (${failure.reason})`,
    );
  }
  process.exit(1);
}

console.log(
  `Documentation link audit passed: ${checkedLinks} local link(s) across ${markdownFiles.length} Markdown file(s).`,
);
