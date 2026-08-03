import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputArgument = process.argv.indexOf("--output");
const outputPath =
  outputArgument >= 0 && process.argv[outputArgument + 1] !== undefined
    ? join(root, process.argv[outputArgument + 1])
    : join(root, "f2-browser-smoke.json");
const appUrl = "http://127.0.0.1:4173/";
const debugPort = 9222;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForHttp(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`, { cause: lastError });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const chrome = candidates.find((candidate) => existsSync(candidate));
  if (chrome === undefined) {
    throw new Error(`No Chrome/Chromium executable found. Tried: ${candidates.join(", ")}`);
  }
  return chrome;
}

async function waitForPageTarget(timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find(
          (target) => target.type === "page" && target.url.startsWith(appUrl),
        );
        if (page?.webSocketDebuggerUrl !== undefined) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome may still be starting.
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for the F2 Chrome target.");
}

class CdpClient {
  #socket;
  #nextId = 1;
  #pending = new Map();
  #listeners = new Map();

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new CdpClient(socket);
  }

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== undefined) {
        const pending = this.#pending.get(message.id);
        if (pending === undefined) {
          return;
        }
        this.#pending.delete(message.id);
        if (message.error !== undefined) {
          pending.reject(new Error(`${message.error.message} (${message.error.code})`));
        } else {
          pending.resolve(message.result ?? {});
        }
        return;
      }
      const listeners = this.#listeners.get(message.method);
      listeners?.forEach((listener) => listener(message.params ?? {}));
    });
  }

  on(method, listener) {
    const listeners = this.#listeners.get(method) ?? new Set();
    listeners.add(listener);
    this.#listeners.set(method, listeners);
  }

  call(method, params = {}) {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.#socket.close();
  }
}

async function evaluate(client, expression) {
  const result = await client.call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails !== undefined) {
    throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed.");
  }
  return result.result?.value;
}

const readStateExpression = `(() => {
  const text = (selector) => document.querySelector(selector)?.textContent?.trim() ?? null;
  return {
    status: text('[data-status]'),
    generation: Number(text('[data-generation]')),
    step: Number(text('[data-step]')),
    position: text('[data-position]'),
    contacts: text('[data-contacts]'),
    begins: Number(text('[data-begins]')),
    validation: text('[data-validation]'),
    restartDisabled: document.querySelector('[data-restart]')?.disabled ?? true,
    userAgent: navigator.userAgent,
  };
})()`;

function isPassingContactState(state, expectedGeneration) {
  if (state?.generation !== expectedGeneration || state.begins < 1) {
    return false;
  }
  if (!state.status?.startsWith("Running — box3d.js@0.0.2")) {
    return false;
  }
  if (state.restartDisabled) {
    return false;
  }
  const validation = state.validation ?? "";
  return ["B0", "B1", "B2", "B3", "B4", "B5"].every((id) =>
    validation.includes(`${id}:PASS`),
  );
}

async function waitForState(client, expectedGeneration, timeoutMs = 25_000) {
  const deadline = Date.now() + timeoutMs;
  let lastState = null;
  while (Date.now() < deadline) {
    lastState = await evaluate(client, readStateExpression);
    if (isPassingContactState(lastState, expectedGeneration)) {
      return lastState;
    }
    await delay(100);
  }
  throw new Error(
    `Timed out waiting for generation ${expectedGeneration}: ${JSON.stringify(lastState)}`,
  );
}

const preview = spawn(
  process.execPath,
  [
    join(root, "node_modules/vite/bin/vite.js"),
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4173",
    "--strictPort",
  ],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);
let chrome = null;
let client = null;
let profileDirectory = null;
const previewErrors = [];
preview.stderr.on("data", (chunk) => previewErrors.push(String(chunk)));

try {
  await waitForHttp(appUrl);
  profileDirectory = await mkdtemp(join(tmpdir(), "jv-f2-chrome-"));
  chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      `--remote-debugging-port=${debugPort}`,
      "--remote-debugging-address=127.0.0.1",
      `--user-data-dir=${profileDirectory}`,
      appUrl,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  const chromeErrors = [];
  chrome.stderr.on("data", (chunk) => chromeErrors.push(String(chunk)));
  client = await CdpClient.connect(await waitForPageTarget());
  const runtimeExceptions = [];
  const consoleErrors = [];
  client.on("Runtime.exceptionThrown", (params) => runtimeExceptions.push(params));
  client.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") {
      consoleErrors.push(params);
    }
  });
  await client.call("Runtime.enable");
  await client.call("Page.enable");

  const initial = await waitForState(client, 1);
  await evaluate(client, `document.querySelector('[data-restart]').click()`);
  const rebuilt = await waitForState(client, 2);
  if (runtimeExceptions.length > 0 || consoleErrors.length > 0) {
    throw new Error(
      `Browser reported errors: exceptions=${runtimeExceptions.length}, console=${consoleErrors.length}`,
    );
  }

  const receipt = {
    status: "PASS",
    sourceCommit: process.env.GITHUB_SHA ?? "LOCAL",
    box3dPackage: "box3d.js@0.0.2",
    initial,
    rebuilt,
    runtimeExceptions: 0,
    consoleErrors: 0,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(receipt, null, 2));
} catch (error) {
  if (previewErrors.length > 0) {
    console.error(previewErrors.join(""));
  }
  throw error;
} finally {
  client?.close();
  chrome?.kill("SIGTERM");
  preview.kill("SIGTERM");
  if (profileDirectory !== null) {
    await rm(profileDirectory, { recursive: true, force: true });
  }
}
