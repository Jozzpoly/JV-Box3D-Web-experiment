import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { validatePortableNetworkPolicy } from "../tools/portable-network-policy-lib.mjs";

async function withFixture(files, callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-network-"));
  try {
    for (const [path, content] of Object.entries(files)) {
      const absolutePath = resolve(root, path);
      const separator = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
      if (separator !== -1) {
        await mkdir(resolve(root, path.slice(0, separator)), { recursive: true });
      }
      await writeFile(absolutePath, content, "utf8");
    }
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("portable network policy accepts local/data resources and public navigation links", async () => {
  await withFixture(
    {
      "index.html": `<!doctype html>
        <script type="module" src="./assets/app.js"></script>
        <link rel="stylesheet" href="./assets/app.css">
        <a href="#about">About</a>
        <a href="mailto:test@example.com">Contact</a>
        <a href="https://github.com/Jozzpoly">Project owner</a>`,
      "assets/app.css": `.icon { background: url("data:image/svg+xml,%3Csvg/%3E"); }
        @import "./theme.css";`,
      "assets/theme.css": ".demo { display: block; }",
      "assets/app.js": "export {};\n",
    },
    async (root) => {
      assert.deepEqual(await validatePortableNetworkPolicy(root), []);
    },
  );
});

test("portable network policy rejects remote CDN resource dependencies", async () => {
  await withFixture(
    {
      "index.html": `<script src="https://cdn.example.com/game.js"></script>
        <img srcset="./small.png 1x, https://cdn.example.com/large.png 2x">`,
      "app.css": '.demo { background: url("//cdn.example.com/texture.png"); }',
    },
    async (root) => {
      const errors = await validatePortableNetworkPolicy(root);
      assert.ok(
        errors.filter((error) => error.includes("remote HTTP dependency")).length >= 2,
      );
      assert.ok(
        errors.some((error) => error.includes("protocol-relative remote URL")),
      );
    },
  );
});

test("portable network policy rejects executable and local-file resource schemes", async () => {
  await withFixture(
    {
      "index.html": `<iframe src="javascript:alert(1)"></iframe>
        <script src="file:///private/game.js"></script>`,
    },
    async (root) => {
      const errors = await validatePortableNetworkPolicy(root);
      assert.ok(errors.some((error) => error.includes("scheme javascript:")));
      assert.ok(errors.some((error) => error.includes("scheme file:")));
    },
  );
});