import { requireCleanSiteRelativeUrl } from "../assets/asset-contract.js";
import {
  decodeGlbRigidCpuAssetV1,
  type GlbRigidCpuAssetV1,
} from "./glb-rigid-mesh-decoder.js";
import {
  validateVehicleVisualAssetV1,
  type VehicleVisualAssetReceiptV1,
} from "./vehicle-visual-asset-gate.js";
import {
  assertVehicleVisualCpuOwnershipV1,
  type VehicleVisualCpuOwnershipReceiptV1,
} from "./vehicle-visual-cpu-gate.js";
import {
  validateVehicleVisualPackageV1,
  type VehicleVisualPackageV1,
} from "./vehicle-visual-package.js";
import { resolveVehicleVisualAssetUrl } from "./vehicle-visual-url.js";

export interface VehicleVisualFetchResponseV1 {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export type VehicleVisualFetcherV1 = (
  url: string,
  init: Readonly<{ signal?: AbortSignal }>,
) => Promise<VehicleVisualFetchResponseV1>;

export interface LoadedVehicleVisualRuntimeV1 {
  readonly packageUrl: string;
  readonly assetUrl: string;
  readonly visualPackage: VehicleVisualPackageV1;
  readonly assetReceipt: VehicleVisualAssetReceiptV1;
  readonly ownershipReceipt: VehicleVisualCpuOwnershipReceiptV1;
  readonly cpuAsset: GlbRigidCpuAssetV1;
}

function absoluteHttpUrl(value: string, label: string): URL {
  let result: URL;
  try {
    result = new URL(value);
  } catch (error: unknown) {
    throw new Error(`${label} must be an absolute URL.`, { cause: error });
  }
  if (result.protocol !== "http:" && result.protocol !== "https:") {
    throw new Error(`${label} must use HTTP or HTTPS.`);
  }
  return result;
}

async function requireOk(
  response: VehicleVisualFetchResponseV1,
  label: string,
): Promise<VehicleVisualFetchResponseV1> {
  if (!response.ok) {
    throw new Error(`${label} request failed with HTTP ${response.status}.`);
  }
  return response;
}

export async function loadVehicleVisualRuntimeV1(
  pageBaseUrl: string,
  packageUrl: string,
  options: Readonly<{
    signal?: AbortSignal;
    fetcher?: VehicleVisualFetcherV1;
  }> = {},
): Promise<LoadedVehicleVisualRuntimeV1> {
  const pageBase = absoluteHttpUrl(pageBaseUrl, "Vehicle visual page base URL");
  const cleanPackageUrl = requireCleanSiteRelativeUrl(
    packageUrl,
    "vehicle visual package URL",
  );
  const packageAbsoluteUrl = new URL(cleanPackageUrl, pageBase).href;
  const fetcher: VehicleVisualFetcherV1 =
    options.fetcher ??
    ((url, init) => fetch(url, init) as Promise<VehicleVisualFetchResponseV1>);
  const requestInit =
    options.signal === undefined ? {} : { signal: options.signal };

  const manifestResponse = await requireOk(
    await fetcher(packageAbsoluteUrl, requestInit),
    "Vehicle visual package",
  );
  const visualPackage = validateVehicleVisualPackageV1(
    await manifestResponse.json(),
  );
  const assetUrl = resolveVehicleVisualAssetUrl(
    pageBase.href,
    cleanPackageUrl,
    visualPackage.asset.url,
  );
  const assetResponse = await requireOk(
    await fetcher(assetUrl, requestInit),
    "Vehicle visual GLB",
  );
  const bytes = new Uint8Array(await assetResponse.arrayBuffer());
  const assetReceipt = await validateVehicleVisualAssetV1(
    visualPackage,
    bytes,
  );
  const cpuAsset = decodeGlbRigidCpuAssetV1(
    bytes,
    visualPackage.bindings.map((binding) => binding.nodeName),
  );
  const ownershipReceipt = assertVehicleVisualCpuOwnershipV1(
    visualPackage,
    cpuAsset,
  );

  return Object.freeze({
    packageUrl: packageAbsoluteUrl,
    assetUrl,
    visualPackage,
    assetReceipt,
    ownershipReceipt,
    cpuAsset,
  });
}
