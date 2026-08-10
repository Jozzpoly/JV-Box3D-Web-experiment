import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PINNED_NATIVE_FACTORY_ARTIFACT_BLOB,
  gitBlobSha1,
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";

const receiptUrl = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const attributesUrl = new URL("../.gitattributes", import.meta.url);

test("pinned native receipt stays byte-exact under the repository checkout policy", async () => {
  const [text, attributes] = await Promise.all([
    readFile(receiptUrl, "utf8"),
    readFile(attributesUrl, "utf8"),
  ]);

  assert.match(
    attributes,
    /^public\/receipts\/jv_m6_factory_receipt\.json -text$/m,
    "the pinned receipt must be exempt from checkout line-ending conversion",
  );
  assert.equal(
    text.includes("\r"),
    false,
    "the checked-out receipt contains CR bytes and is no longer the pinned Git blob",
  );
  assert.equal(
    await gitBlobSha1(text),
    PINNED_NATIVE_FACTORY_ARTIFACT_BLOB,
  );

  const snapshot = await validatePinnedNativeFactoryReceiptText(text);
  assert.equal(snapshot.serializedFieldCount, 76);
  assert.equal(snapshot.source.commit, "a740dec74f4243679c71a17eb59723ee0b42f8bb");
});

test("Windows CRLF drift is detected instead of silently changing receipt provenance", async () => {
  const text = await readFile(receiptUrl, "utf8");
  const crlfText = text.replace(/\n/g, "\r\n");

  assert.notEqual(
    await gitBlobSha1(crlfText),
    PINNED_NATIVE_FACTORY_ARTIFACT_BLOB,
  );
  await assert.rejects(
    validatePinnedNativeFactoryReceiptText(crlfText),
    /receipt Git blob mismatch/,
  );
});
