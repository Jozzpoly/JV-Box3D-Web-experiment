import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function importSpecifiers(source) {
  const result = [];
  const pattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'](\.[^"']+)["']|import\(\s*["'](\.[^"']+)["']\s*\)/g;
  for (const match of source.matchAll(pattern)) {
    result.push(match[1] ?? match[2]);
  }
  return result;
}

function isCodeSpecifier(specifier) {
  const extension = extname(specifier).toLowerCase();
  return extension === "" || extension === ".js" || extension === ".ts";
}

async function resolveTypeScriptImport(fromFile, specifier) {
  const raw = resolve(dirname(fromFile), specifier);
  const candidates = specifier.endsWith(".js")
    ? [`${raw.slice(0, -3)}.ts`]
    : specifier.endsWith(".ts")
      ? [raw]
      : [`${raw}.ts`, join(raw, "index.ts")];
  for (const candidate of candidates) {
    try {
      await readFile(candidate, "utf8");
      return candidate;
    } catch {}
  }
  return null;
}

async function staticClosure(entryRelative) {
  const pending = [resolve(root, entryRelative)];
  const seen = new Set();
  const unresolved = [];
  const ignoredNonCodeImports = [];
  while (pending.length > 0) {
    const current = pending.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    const source = await readFile(current, "utf8");
    for (const specifier of importSpecifiers(source)) {
      if (!isCodeSpecifier(specifier)) {
        ignoredNonCodeImports.push({
          from: relative(root, current).replaceAll("\\", "/"),
          specifier,
        });
        continue;
      }
      const target = await resolveTypeScriptImport(current, specifier);
      if (target === null) {
        unresolved.push({ from: current, specifier });
      } else if (!seen.has(target)) {
        pending.push(target);
      }
    }
  }
  return {
    files: new Set([...seen].map((file) => relative(root, file).replaceAll("\\", "/"))),
    unresolved,
    ignoredNonCodeImports,
  };
}

test("MAP_ONLY_R0 stays scan-free while current R1 exposes its own location controls", async () => {
  const [html, entry, controls, localEntry] = await Promise.all([
    readFile(resolve(root, "map-only-r0.html"), "utf8"),
    readFile(resolve(root, "src/map-only-r0-main.ts"), "utf8"),
    readFile(resolve(root, "src/product-controls.ts"), "utf8"),
    readFile(resolve(root, "src/product-main.ts"), "utf8"),
  ]);

  assert.match(html, /src\/map-only-r0-main\.ts/);
  assert.doesNotMatch(html, /src\/product-main\.ts/);

  assert.match(entry, /configureProductWorldLoader\(loadMapOnlyR0World\)/);
  assert.match(entry, /createProductWorld\(\)/);
  assert.match(entry, /textureFilter: false/);
  assert.match(entry, /grid: true/);
  assert.doesNotMatch(entry, /local-full-product-world|jsprev2-scan|loadLocalJsprev2Scan|product-spawn|jvSpawn|JSPREV2|scan/i);

  assert.match(localEntry, /locationChoices:/);
  assert.match(localEntry, /Plac E2R/);
  assert.match(localEntry, /Offroad/);
  assert.match(localEntry, /Skan JSPREV2/);
  assert.match(localEntry, /targetUrl\("offroad"\)/);
  assert.match(localEntry, /targetUrl\("scan"\)/);
  assert.match(localEntry, /textureFilter: true/);
  assert.match(localEntry, /grid: true/);
  assert.match(localEntry, /loadLocalFullProductWorld/);

  assert.match(controls, /capabilities\.locationChoices \?\? \[\]/);
  assert.match(controls, /if \(locationChoices\.length > 1\)/);
  assert.match(controls, /if \(capabilities\.textureFilter\)/);
  assert.match(controls, /if \(capabilities\.grid\)/);
  assert.doesNotMatch(controls, /JSPREV2|jvSpawn|product-spawn|Skan JSPREV2/);

  const closure = await staticClosure("src/map-only-r0-main.ts");
  assert.deepEqual(closure.unresolved, []);
  assert.equal(
    closure.files.has("src/main.ts"),
    true,
    "MAP_ONLY_R0 closure must still include the shared runtime host",
  );
  assert.equal(
    closure.ignoredNonCodeImports.every(
      ({ specifier }) => specifier === "./style.css",
    ),
    true,
    "the public closure may ignore only the known non-code CSS import",
  );
  assert.ok(
    closure.ignoredNonCodeImports.length <= 1,
    "the public closure may ignore at most the one known CSS import",
  );
  for (const forbidden of [
    "src/scene/jsprev2-scan.ts",
    "src/scene/local-full-product-world.ts",
    "src/scene/product-spawn.ts",
    "src/product-main.ts",
  ]) {
    assert.equal(closure.files.has(forbidden), false, `${forbidden} must be absent from MAP_ONLY_R0 closure`);
  }

  const publicSource = (
    await Promise.all([...closure.files].map((file) => readFile(resolve(root, file), "utf8")))
  ).join("\n");
  assert.doesNotMatch(publicSource, /\/__jv_scan__\/|jvSpawn=scan|Skan JSPREV2|loadLocalJsprev2Scan/);
});
