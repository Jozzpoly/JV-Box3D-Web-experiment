import { readFile } from "node:fs/promises";
import { extname, relative } from "node:path";
import { collectPortableFiles } from "./portable-build-lib.mjs";

function toPosix(path) {
  return path.replaceAll("\\", "/");
}

function classify(reference) {
  const value = reference.trim().replace(/^['"]|['"]$/g, "");
  if (
    value.length === 0 ||
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return { allowed: true, value };
  }
  if (value.startsWith("//")) {
    return { allowed: false, reason: "protocol-relative remote URL", value };
  }
  const scheme = value.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme === "http" || scheme === "https") {
    return { allowed: false, reason: "remote HTTP dependency", value };
  }
  if (scheme !== undefined) {
    return { allowed: false, reason: `unsafe or unsupported URL scheme ${scheme}:`, value };
  }
  return { allowed: true, value };
}

function scanReferences(text, patterns) {
  const references = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      references.push(match[1]);
    }
  }
  return references;
}

export async function validatePortableNetworkPolicy(root) {
  const errors = [];
  const files = await collectPortableFiles(root);

  for (const absolutePath of files) {
    const extension = extname(absolutePath).toLowerCase();
    let patterns;
    if (extension === ".html") {
      patterns = [/(?:src|href)\s*=\s*["']([^"']+)["']/gi];
    } else if (extension === ".css") {
      patterns = [/url\(([^)]+)\)/gi, /@import\s+(?:url\()?\s*["']([^"']+)["']/gi];
    } else {
      continue;
    }

    const sourcePath = toPosix(relative(root, absolutePath));
    const text = await readFile(absolutePath, "utf8");
    for (const reference of scanReferences(text, patterns)) {
      const result = classify(reference);
      if (!result.allowed) {
        errors.push(
          `${sourcePath} uses ${result.reason}: ${result.value}`,
        );
      }
    }
  }

  return errors;
}
