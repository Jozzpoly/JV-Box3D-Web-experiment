import { readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const textExtensions = new Set([".html", ".js", ".css", ".json"]);
const failures = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(absolute);
      continue;
    }
    if (!textExtensions.has(extname(entry.name).toLowerCase())) {
      continue;
    }
    const text = await readFile(absolute, "utf8");
    const matches = text.match(/["'`](\/vehicles\/[^"'`?#]*)/g) ?? [];
    for (const match of matches) {
      failures.push(
        `${relative(dist, absolute).split(sep).join("/")} embeds root-absolute vehicle path ${match.slice(1)}.`,
      );
    }
  }
}

await visit(dist);
if (failures.length > 0) {
  throw new Error(`Portable vehicle path policy failed:\n${failures.join("\n")}`);
}
console.log("Portable vehicle path policy passed: no root-absolute /vehicles/ references.");
