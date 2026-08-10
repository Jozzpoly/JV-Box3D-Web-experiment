import { requireCleanSiteRelativeUrl } from "../assets/asset-contract.js";

function httpBaseUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error: unknown) {
    throw new Error("Vehicle visual base URL must be absolute.", {
      cause: error,
    });
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Vehicle visual base URL must use HTTP or HTTPS.");
  }
  return url;
}

export function resolveVehicleVisualAssetUrl(
  pageBaseUrl: string,
  packageUrl: string,
  assetUrl: string,
): string {
  const base = httpBaseUrl(pageBaseUrl);
  const cleanPackageUrl = requireCleanSiteRelativeUrl(
    packageUrl,
    "vehicle visual package URL",
  );
  const cleanAssetUrl = requireCleanSiteRelativeUrl(
    assetUrl,
    "vehicle visual asset URL",
  );

  const packageAbsolute = new URL(cleanPackageUrl, base);
  const packageDirectory = new URL("./", packageAbsolute);
  const assetAbsolute = new URL(cleanAssetUrl, packageDirectory);

  if (
    assetAbsolute.origin !== packageDirectory.origin ||
    !assetAbsolute.pathname.startsWith(packageDirectory.pathname)
  ) {
    throw new Error(
      "Vehicle visual asset URL must remain inside the package directory.",
    );
  }
  return assetAbsolute.href;
}
