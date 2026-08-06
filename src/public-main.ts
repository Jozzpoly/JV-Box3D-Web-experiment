function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function isLocalScanRequest(input: RequestInfo | URL): boolean {
  const url = new URL(requestUrl(input), window.location.href);
  return url.pathname.endsWith("/__jv_scan__/index.json") ||
    url.pathname === "/__jv_scan__/index.json";
}

const currentUrl = new URL(window.location.href);
currentUrl.searchParams.delete("jvSpawn");
window.history.replaceState(null, "", currentUrl.href);

const nativeFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  if (isLocalScanRequest(input)) {
    return new Response(
      JSON.stringify({
        available: false,
        reason: "PUBLIC_MAP_RELEASE_EXCLUDES_PRIVATE_SCAN",
      }),
      {
        status: 404,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }
  return nativeFetch(input, init);
};

await import("./main.js");
