import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const APP_HOST = '127.0.0.1';
const APP_PORT = 4173;
const DEBUG_PORT = 9222;
const APP_URL = `http://${APP_HOST}:${APP_PORT}/`;
const DEBUG_URL = `http://127.0.0.1:${DEBUG_PORT}`;

let previewProcess;
let chromeProcess;
let chromeProfile;

try {
  previewProcess = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'preview', '--', '--host', APP_HOST, '--port', String(APP_PORT), '--strictPort'],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  pipeWithPrefix(previewProcess.stdout, '[preview]');
  pipeWithPrefix(previewProcess.stderr, '[preview]');
  await waitForHttp(APP_URL, 20_000);

  const chromeExecutable = await findChromeExecutable();
  chromeProfile = await mkdtemp(path.join(os.tmpdir(), 'jv-web-smoke-'));
  chromeProcess = spawn(chromeExecutable, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${chromeProfile}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  pipeWithPrefix(chromeProcess.stderr, '[chrome]');
  await waitForHttp(`${DEBUG_URL}/json/version`, 20_000);

  const targetResponse = await fetch(
    `${DEBUG_URL}/json/new?${encodeURIComponent(APP_URL)}`,
    { method: 'PUT' },
  );
  if (!targetResponse.ok) {
    throw new Error(`Chrome target creation failed: HTTP ${targetResponse.status}`);
  }
  const target = await targetResponse.json();
  if (!target.webSocketDebuggerUrl) throw new Error('Chrome returned no debugger WebSocket URL.');

  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: APP_URL });
  await sleep(3_000);

  const evaluation = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const status = document.getElementById('status');
      const telemetry = document.getElementById('telemetry');
      const error = document.getElementById('error');
      const canvas = document.getElementById('viewport');
      return {
        status: status?.textContent ?? '',
        telemetry: telemetry?.textContent ?? '',
        errorHidden: error?.hidden ?? false,
        errorText: error?.textContent ?? '',
        canvasWidth: canvas instanceof HTMLCanvasElement ? canvas.width : 0,
        canvasHeight: canvas instanceof HTMLCanvasElement ? canvas.height : 0,
      };
    })()`,
    returnByValue: true,
    awaitPromise: true,
  });
  const state = evaluation.result?.value;
  if (!state) throw new Error('Browser smoke test received no DOM state.');

  const failures = [];
  if (!state.errorHidden) failures.push(`visible error panel: ${state.errorText || '(empty)'}`);
  if (!state.status.startsWith('Box3D ')) failures.push(`unexpected status: ${state.status}`);
  if (!state.telemetry.includes('body/joint/contact')) {
    failures.push(`simulation telemetry did not start: ${state.telemetry}`);
  }
  if (state.canvasWidth <= 0 || state.canvasHeight <= 0) {
    failures.push(`invalid canvas size: ${state.canvasWidth}x${state.canvasHeight}`);
  }
  if (cdp.exceptions.length > 0) {
    failures.push(`uncaught browser exceptions:\n${cdp.exceptions.join('\n')}`);
  }
  if (failures.length > 0) throw new Error(failures.join('\n\n'));

  console.log(
    `[browser-smoke] OK: ${state.status}; canvas ${state.canvasWidth}x${state.canvasHeight}; ` +
    `telemetry active.`,
  );
  cdp.close();
} finally {
  terminate(chromeProcess);
  terminate(previewProcess);
  if (chromeProfile) await rm(chromeProfile, { recursive: true, force: true });
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener('message', (event) => this.onMessage(event));
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  close() {
    this.socket?.close();
  }

  onMessage(event) {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params?.exceptionDetails;
      this.exceptions.push(details?.exception?.description ?? details?.text ?? 'Unknown exception');
      return;
    }
    if (!message.id) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) pending.reject(new Error(`${message.error.message}: ${message.error.data ?? ''}`));
    else pending.resolve(message.result);
  }
}

async function findChromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known installation path.
    }
  }
  throw new Error(`Chrome executable not found. Checked:\n${candidates.join('\n')}`);
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

function pipeWithPrefix(stream, prefix) {
  stream?.setEncoding('utf8');
  stream?.on('data', (chunk) => {
    for (const line of chunk.trimEnd().split('\n')) {
      if (line) console.log(`${prefix} ${line}`);
    }
  });
}

function terminate(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
