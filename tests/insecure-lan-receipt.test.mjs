import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";

const root = fileURLToPath(new URL("../", import.meta.url));

test("pinned receipt validates when LAN HTTP exposes no SubtleCrypto", async () => {
  const receiptText = await readFile(
    resolve(root, "public/receipts/jv_m6_factory_receipt.json"),
    "utf8",
  );
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "crypto",
  );

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {},
    writable: true,
  });

  try {
    const snapshot = await validatePinnedNativeFactoryReceiptText(
      receiptText,
    );
    assert.equal(snapshot.serializedFieldCount, 76);
    assert.equal(
      snapshot.canonicalPayloadSha256,
      snapshot.raw.payloadReceipt.canonicalSha256,
    );
    assert.equal(snapshot.activeFeatures.rackCenteringAssistEnabled, false);
  } finally {
    if (originalDescriptor === undefined) {
      delete globalThis.crypto;
    } else {
      Object.defineProperty(globalThis, "crypto", originalDescriptor);
    }
  }
});
