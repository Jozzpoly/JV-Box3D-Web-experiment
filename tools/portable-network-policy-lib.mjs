import { readFile } from "node:fs/promises";
import { extname, relative } from "node:path";
import { collectPortableFiles } from "./portable-build-lib.mjs";

function toPosix(path) {
  return path.replaceAll("\\", "/");
}

function classifyResource(reference) {
  const value = reference.trim().replace(/^['"]|['"]$/g, "");
  if (
    value.length === 0 ||
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
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
    return {
      allowed: false,
      reason: `unsafe or unsupported resource URL scheme ${scheme}:`,
      value,
    };
  }
  return { allowed: true, value };
}

function attribute(tag, name) {
  return tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"),
  )?.[1] ?? null;
}

function htmlResourceReferences(text) {
  const references = [];
  const tagPattern = /<(script|link|img|source|audio|video|iframe)\b[^>]*>/gi;
  let match;
  while ((match = tagPattern.exec(text)) !== null) {
    const tagName = match[1].toLowerCase();
    const tag = match[0];
    const primary = attribute(tag, tagName === "link" ? "href" : "src");
    if (primary !== null) {
      references.push(primary);
    }

    const srcset = attribute(tag, "srcset");
    if (srcset !== null) {
      for (const candidate of srcset.split(",")) {
        const url = candidate.trim().split(/\s+/, 1)[0];
        if (url.length > 0) {
          references.push(url);
        }
      }
    }
  }

  const stylePattern = /\bstyle\s*=\s*["']([^"']+)["']/gi;
  while ((match = stylePattern.exec(text)) !== null) {
    references.push(...cssReferences(match[1]));
  }
  return references;
}

function cssReferences(text) {
  const references = [];
  const patterns = [
    /url\(([^)]+)\)/gi,
    /@import\s+(?:url\()?\s*["']([^"']+)["']/gi,
  ];
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
    const sourcePath = toPosix(relative(root, absolutePath));
    const text = await readFile(absolutePath, "utf8");
    const references =
      extension === ".html"
        ? htmlResourceReferences(text)
        : extension === ".css"
          ? cssReferences(text)
          : [];

    for (const reference of references) {
      const result = classifyResource(reference);
      if (!result.allowed) {
        errors.push(`${sourcePath} uses ${result.reason}: ${result.value}`);
      }
    }
  }

  return errors;
}