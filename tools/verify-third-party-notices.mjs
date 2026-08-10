import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function normalizeText(text) {
  return `${text.replace(/\r\n/g, "\n").trimEnd()}\n`;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`);
  }
}

function requireNotice(notice, value, label) {
  if (!notice.includes(value)) {
    throw new Error(`THIRD_PARTY_NOTICES.md is missing ${label}.`);
  }
}

const noticePath = resolve(root, "THIRD_PARTY_NOTICES.md");
const notice = normalizeText(await readFile(noticePath, "utf8"));

const box3dPackage = await readJson(
  resolve(root, "node_modules", "box3d.js", "package.json"),
);
requireEqual(box3dPackage.name, "box3d.js", "box3d.js package name");
requireEqual(box3dPackage.version, "0.0.2", "box3d.js version");
requireEqual(box3dPackage.license, "MIT", "box3d.js declared license");

const box3dLicense = normalizeText(
  await readFile(resolve(root, "node_modules", "box3d.js", "LICENSE"), "utf8"),
);
requireEqual(
  sha256(box3dLicense),
  "0916e299b5f7cd92547a78ae0d5fb888dfe69f6930927d56da0d1129ab039615",
  "normalized box3d.js LICENSE SHA-256",
);
requireNotice(
  notice,
  box3dLicense.trimEnd(),
  "the exact box3d.js MIT license text",
);

const embeddedBox3dLicense = `MIT License

Copyright (c) 2026 Erin Catto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
requireNotice(
  notice,
  embeddedBox3dLicense,
  "the exact embedded Box3D MIT license text",
);

const vitePackage = await readJson(
  resolve(root, "node_modules", "vite", "package.json"),
);
requireEqual(vitePackage.name, "vite", "Vite package name");
requireEqual(vitePackage.version, "8.1.5", "Vite version");
requireEqual(vitePackage.license, "MIT", "Vite declared license");

const typescriptPackage = await readJson(
  resolve(root, "node_modules", "typescript", "package.json"),
);
requireEqual(typescriptPackage.name, "typescript", "TypeScript package name");
requireEqual(typescriptPackage.version, "7.0.2", "TypeScript version");
requireEqual(
  typescriptPackage.license,
  "Apache-2.0",
  "TypeScript declared license",
);

for (const requiredValue of [
  "2617a0ff763a60c9f17cee57c6ea72aab75a5077",
  "020ba0ca3ecfea79d8f776bdca982779e6d13f80ce437bc4a0dac18830bd62dd",
  "8441b4a06d6d09dcfb0b0f704df4d847d1437b92",
  "Vite | 8.1.5",
  "TypeScript | 7.0.2",
  "It does **not** grant a license to JV Web source code",
]) {
  requireNotice(notice, requiredValue, "required provenance or scope text");
}

console.log(
  "Third-party notice verification passed: exact box3d.js and embedded Box3D MIT texts, Vite 8.1.5 and TypeScript 7.0.2.",
);