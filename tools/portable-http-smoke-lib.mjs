import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function contentType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".wasm") return "application/wasm";
  if (extension === ".md") return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

function normalizedPrefix(prefix) {
  if (!prefix.startsWith("/") || !prefix.endsWith("/")) {
    throw new Error(`Portable HTTP prefix must start and end with '/': ${prefix}`);
  }
  return prefix;
}

function resolveRequest(root, prefixes, rawUrl) {
  const url = new URL(rawUrl, "http://127.0.0.1");
  const prefix = prefixes
    .slice()
    .sort((left, right) => right.length - left.length)
    .find((candidate) => url.pathname.startsWith(candidate));
  if (!prefix) {
    return null;
  }

  let relativePath = url.pathname.slice(prefix.length);
  if (relativePath.length === 0) {
    relativePath = "index.html";
  }
  let decoded;
  try {
    decoded = decodeURIComponent(relativePath);
  } catch {
    return null;
  }
  if (
    decoded.startsWith("/") ||
    decoded.includes("\\") ||
    decoded.split("/").some((segment) => segment === "..")
  ) {
    return null;
  }

  const absolutePath = resolve(root, decoded);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (absolutePath !== root && !absolutePath.startsWith(rootPrefix)) {
    return null;
  }
  return absolutePath;
}

async function startStaticServer(root, prefixes) {
  const acceptedPrefixes = prefixes.map(normalizedPrefix);
  const server = createServer(async (request, response) => {
    const absolutePath = resolveRequest(
      root,
      acceptedPrefixes,
      request.url ?? "/",
    );
    if (!absolutePath) {
      response.writeHead(404).end("Not found");
      return;
    }
    try {
      const bytes = await readFile(absolutePath);
      response.writeHead(200, {
        "Content-Type": contentType(absolutePath),
        "Content-Length": bytes.byteLength,
        "Cache-Control": "no-store",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolvePromise());
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new Error("Portable HTTP smoke could not obtain a local port.");
  }
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolvePromise, reject) =>
        server.close((error) => (error ? reject(error) : resolvePromise())),
      ),
  };
}

async function fetchBytes(url) {
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Portable HTTP smoke received ${response.status} for ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function smokePrefix(origin, prefix) {
  const baseUrl = new URL(prefix, origin);
  const manifestBytes = await fetchBytes(new URL("build-manifest.json", baseUrl));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error(`Portable manifest served at ${prefix} has no files.`);
  }

  const fetched = [];
  for (const record of manifest.files) {
    const bytes = await fetchBytes(new URL(record.path, baseUrl));
    if (bytes.byteLength !== record.bytes) {
      throw new Error(
        `${prefix}${record.path} byte count differs: ${bytes.byteLength} != ${record.bytes}`,
      );
    }
    const actualHash = sha256(bytes);
    if (actualHash !== record.sha256) {
      throw new Error(
        `${prefix}${record.path} SHA-256 differs: ${actualHash} != ${record.sha256}`,
      );
    }
    fetched.push(record.path);
  }

  const indexResponse = await fetch(new URL("index.html", baseUrl), {
    redirect: "error",
    cache: "no-store",
  });
  const indexType = indexResponse.headers.get("content-type") ?? "";
  if (!indexResponse.ok || !indexType.startsWith("text/html")) {
    throw new Error(`${prefix}index.html was not served as HTML.`);
  }

  return {
    prefix,
    fileCount: fetched.length,
    runtimeAssets: manifest.runtimeAssets ?? [],
    complianceFiles: manifest.complianceFiles ?? [],
  };
}

export async function smokePortableBuildOverHttp(
  root,
  prefixes = ["/", "/JV-Box3D-Web-experiment/"],
) {
  const server = await startStaticServer(resolve(root), prefixes);
  try {
    const results = [];
    for (const prefix of prefixes) {
      results.push(await smokePrefix(server.origin, normalizedPrefix(prefix)));
    }
    return results;
  } finally {
    await server.close();
  }
}