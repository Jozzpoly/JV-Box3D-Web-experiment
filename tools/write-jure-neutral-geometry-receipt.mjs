import { readFile } from "node:fs/promises";
import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  buildLegacyM6FrontLeftNeutralGeometryReceipt,
} from "../.test-dist/vehicle/m6/m6-neutral-geometry.js";
import {
  serializeJvNeutralGeometryReceiptV1,
} from "../.test-dist/vehicle/neutral-mechanism.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);

const snapshot = validatePinnedNativeFactoryReceiptText(
  await readFile(receiptPath, "utf8"),
);
const config = m6TopologyConfigFromReceipt(snapshot);
const receipt = buildLegacyM6FrontLeftNeutralGeometryReceipt(config);

process.stdout.write(serializeJvNeutralGeometryReceiptV1(receipt));
