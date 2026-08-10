import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { portableDigestHex } from "../.test-dist/core/portable-digest.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const encoder = new TextEncoder();

function nodeDigest(algorithm, bytes) {
  return createHash(algorithm).update(bytes).digest("hex");
}

function deterministicBytes(length) {
  return Uint8Array.from(
    { length },
    (_, index) => (index * 73 + length * 19) & 0xff,
  );
}

test("software SHA-1 and SHA-256 match standard known vectors", async () => {
  const vectors = [
    {
      text: "",
      sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
      sha256:
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      text: "abc",
      sha1: "a9993e364706816aba3e25717850c26c9cd0d89d",
      sha256:
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    },
    {
      text: "The quick brown fox jumps over the lazy dog",
      sha1: "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
      sha256:
        "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
    },
  ];

  for (const vector of vectors) {
    const bytes = encoder.encode(vector.text);
    assert.equal(await portableDigestHex("SHA-1", bytes, null), vector.sha1);
    assert.equal(
      await portableDigestHex("SHA-256", bytes, null),
      vector.sha256,
    );
  }
});

test("software digest matches Node across SHA padding boundaries", async () => {
  for (const length of [0, 1, 55, 56, 57, 63, 64, 65, 127, 128, 1024]) {
    const bytes = deterministicBytes(length);
    assert.equal(
      await portableDigestHex("SHA-1", bytes, null),
      nodeDigest("sha1", bytes),
      `SHA-1 length ${length}`,
    );
    assert.equal(
      await portableDigestHex("SHA-256", bytes, null),
      nodeDigest("sha256", bytes),
      `SHA-256 length ${length}`,
    );
  }
});

test("digest falls back when a nominal subtle provider rejects the operation", async () => {
  const bytes = encoder.encode("LAN HTTP insecure context");
  const rejectingProvider = {
    async digest() {
      throw new TypeError("SubtleCrypto unavailable in insecure context");
    },
  };

  assert.equal(
    await portableDigestHex("SHA-256", bytes, rejectingProvider),
    nodeDigest("sha256", bytes),
  );
});

test("software SHA-1 validates the exact pinned receipt Git blob", async () => {
  const text = await readFile(
    resolve(root, "public/receipts/jv_m6_factory_receipt.json"),
    "utf8",
  );
  const content = encoder.encode(text);
  const header = encoder.encode(`blob ${content.byteLength}\0`);
  const bytes = new Uint8Array(header.byteLength + content.byteLength);
  bytes.set(header);
  bytes.set(content, header.byteLength);

  assert.equal(
    await portableDigestHex("SHA-1", bytes, null),
    "6a5cb337a7d4707946835e83e036365130c52459",
  );
});

test("receipt validation no longer calls crypto.subtle directly", async () => {
  const source = await readFile(
    resolve(root, "src/config/native-factory-receipt.ts"),
    "utf8",
  );
  assert.match(source, /portableDigestHex/);
  assert.doesNotMatch(source, /crypto\.subtle\.digest/);
});
