import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const APP_HOST = '127.0.0.1';
const APP_PORT = 4173;
const DEBUG_PORT = 9222;
const APP_URL = `http://${APP_HOST}:${APP_PORT}/`;
const DEBUG_URL = `http://127.0.0.1:${DEBUG_PORT}`;

const READ_BROWSER_STATE = `(() => {
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
    probes: window.__JV_PROBE_REPORT__ ?? null,
    visuals: window.__JV_VISUAL_REPORT__ ?? null,
    frontRig: window.__JV_FRONT_RIG_REPORT__ ?? null,
  };
})()`;

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

let previewProcess;
let chromeProcess;
let chromeProfile;

try {
  previewProcess = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'preview', '--', '--host', APP_HOST, '--port', String(APP_PORT), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    },
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
    '--enable-unsafe-swiftshader',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${chromeProfile}`,
    'about:blank',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });
  pipeWithPrefix(chromeProcess.stderr, '[chrome]');
  await waitForHttp(`${DEBUG_URL}/json/version`, 20_000);

  const targetResponse = await fetch(
    `${DEBUG_URL}/json/new?${encodeURIComponent(APP_URL)}`,
    { method: 'PUT' },
  );
  if (!targetResponse.ok) throw new Error(`Chrome target creation failed: HTTP ${targetResponse.status}`);
  const target = await targetResponse.json();
  if (!target.webSocketDebuggerUrl) throw new Error('Chrome returned no debugger WebSocket URL.');

  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: APP_URL });

  const state = await waitForBrowserReady(cdp, 15_000);
  const failures = [];
  if (!state.errorHidden) failures.push(`visible error panel: ${state.errorText || '(empty)'}`);
  if (!state.status.startsWith('Box3D ')) failures.push(`unexpected status: ${state.status}`);
  if (!state.telemetry.includes('body/joint/contact')) {
    failures.push(`simulation telemetry did not start: ${state.telemetry}`);
  }
  if (state.canvasWidth <= 0 || state.canvasHeight <= 0) {
    failures.push(`invalid canvas size: ${state.canvasWidth}x${state.canvasHeight}`);
  }
  if (!state.probes) {
    failures.push('missing window.__JV_PROBE_REPORT__');
  } else if (!state.probes.passed) {
    failures.push(`M6 parity probes failed: ${JSON.stringify(state.probes)}`);
  }
  if (!state.probes?.handlingPulse?.stable) {
    failures.push(`keyboard handling pulse is unstable: ${JSON.stringify(state.probes?.handlingPulse)}`);
  }
  if (!state.probes?.lowSpeedSteering) {
    failures.push('missing low-speed steering diagnostic');
  } else {
    const lowSpeed = state.probes.lowSpeedSteering;
    if (!lowSpeed.stationary?.finite || !lowSpeed.creep?.finite) {
      failures.push(`low-speed steering produced non-finite state: ${JSON.stringify(lowSpeed)}`);
    }
    if (!lowSpeed.stable) failures.push(`low-speed steering centre-capture failed: ${JSON.stringify(lowSpeed)}`);
    if (!(lowSpeed.stationary?.rackFractionAtServoRelease < 0.1)) {
      failures.push(`stationary rack was not centred before servo release: ${lowSpeed.stationary?.rackFractionAtServoRelease}`);
    }
    if (!(lowSpeed.creep?.rackFractionAtServoRelease < 0.1)) {
      failures.push(`creep rack was not centred before servo release: ${lowSpeed.creep?.rackFractionAtServoRelease}`);
    }
  }

  if (!state.frontRig) {
    failures.push('missing window.__JV_FRONT_RIG_REPORT__');
  } else {
    const frontRig = state.frontRig;
    if (!frontRig.loaded) failures.push(`front-rig bridge preflight failed: ${frontRig.message}`);
    if (frontRig.assetId !== 'jozz.one_sided_steering_suspension.v0') {
      failures.push(`unexpected front-rig assetId: ${frontRig.assetId}`);
    }
    if (!(frontRig.contractVersion >= 2)) failures.push(`front-rig contractVersion=${frontRig.contractVersion}`);
    if (frontRig.resolvedNodeCount !== frontRig.requiredNodeCount || frontRig.requiredNodeCount !== 13) {
      failures.push(`front-rig nodes ${frontRig.resolvedNodeCount}/${frontRig.requiredNodeCount}`);
    }
    if (frontRig.missingNodes?.length || frontRig.duplicateNodes?.length) {
      failures.push(`front-rig node ambiguity: missing=${frontRig.missingNodes}, duplicate=${frontRig.duplicateNodes}`);
    }
    if (!(frontRig.skinnedMeshCount > 0) || !(frontRig.uniqueSkeletonCount > 0)) {
      failures.push(`front-rig skin missing: meshes=${frontRig.skinnedMeshCount}, skeletons=${frontRig.uniqueSkeletonCount}`);
    }
    if (frontRig.m6CarrierBody !== 'lowerArm') failures.push(`unexpected M6 carrier mapping: ${frontRig.m6CarrierBody}`);
    const recognizedNativeOwnership = ['knuckle', 'carrier', 'lowerArm'].includes(frontRig.nativeChassisMountBRidesBody);
    if (!recognizedNativeOwnership) {
      failures.push(`unknown native ChassisMount_b ownership: ${frontRig.nativeChassisMountBRidesBody}`);
    }
  }

  if (!state.visuals) {
    failures.push('missing window.__JV_VISUAL_REPORT__');
  } else {
    const wheel = state.visuals.wheel;
    if (!wheel?.loaded) failures.push(`wheel glTF contract did not load: ${wheel?.message ?? 'unknown'}`);
    if (!wheel?.markerContract) failures.push('wheel marker contract is not active');
    if (wheel?.cloneCount !== 4) failures.push(`expected four visual wheel clones, got ${wheel?.cloneCount}`);
    if (!wheel?.independentSkeletons) {
      failures.push(
        `wheel skeletons are aliased: unique=${wheel?.uniqueSkeletonCount}, source=${wheel?.sourceSkinnedMeshCount}`,
      );
    }
    if (!wheel?.attachedToWheelBodies) {
      failures.push(`wheel visuals are detached/mis-centred: ${wheel?.message ?? 'unknown'}`);
    }
    if (!(wheel?.maxBindingPositionError <= 1e-5)) failures.push(`wheel root/body binding error=${wheel?.maxBindingPositionError}`);
    if (!(wheel?.centerError <= 1e-5)) failures.push(`wheel physical-centre error=${wheel?.centerError}`);
    if (!(wheel?.mountAxisError <= 1e-5)) failures.push(`wheel mount-axis error=${wheel?.mountAxisError}`);
    if (!(wheel?.mountOffset > 0 && wheel?.mountOffset < wheel?.requestedWidth * 0.5 + 1e-5)) {
      failures.push(`wheel mount offset is not inside the tyre half-width: ${wheel?.mountOffset}`);
    }
    if (!(wheel?.radiusError <= 1e-5)) failures.push(`wheel radius contract error=${wheel?.radiusError}`);
    if (!(wheel?.widthError <= 1e-5)) failures.push(`wheel width contract error=${wheel?.widthError}`);
  }

  if (cdp.exceptions.length > 0) failures.push(`uncaught browser exceptions:\n${cdp.exceptions.join('\n')}`);
  if (failures.length > 0) throw new Error(failures.join('\n\n'));

  const straight = state.probes.straight;
  const impact = state.probes.steeringImpact;
  const handling = state.probes.handlingPulse;
  const lowSpeed = state.probes.lowSpeedSteering;
  const wheel = state.visuals.wheel;
  const frontRig = state.frontRig;
  console.log(
    `[browser-smoke] parity ${state.probes.passedCount}/${state.probes.totalCount}: `
    + `straight dx=${straight.forwardMeters.toFixed(2)}m dz=${straight.lateralMeters.toFixed(2)}m `
    + `ratio=${straight.lateralRatio.toFixed(3)} tilt=${straight.chassisTiltDeg.toFixed(1)}deg; `
    + `impact worst=${impact.worstRackFraction.toFixed(3)} rest=${impact.atRestRackFraction.toFixed(3)} `
    + `final=${impact.finalRackFraction.toFixed(3)} yaw=${impact.finalYawRate.toFixed(3)}rad/s`,
  );
  console.log(
    `[browser-smoke] handling ${handling.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `peak=${handling.peakRackFraction.toFixed(3)} final=${handling.finalRackFraction.toFixed(3)} `
    + `yaw=${handling.finalYawRate.toFixed(3)}rad/s`,
  );
  console.log(
    `[browser-smoke] low-speed stationary ${lowSpeed.stationary.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `left=${lowSpeed.stationary.leftPeakFraction.toFixed(3)} right=${lowSpeed.stationary.rightPeakFraction.toFixed(3)} `
    + `capture=${lowSpeed.stationary.rackFractionAtServoRelease.toFixed(3)} `
    + `final=${lowSpeed.stationary.finalRackFraction.toFixed(3)} `
    + `crossed=${lowSpeed.stationary.crossedCentreOnReversal} stall=${lowSpeed.stationary.maxServoStallFrames}f`,
  );
  console.log(
    `[browser-smoke] low-speed creep ${lowSpeed.creep.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `left=${lowSpeed.creep.leftPeakFraction.toFixed(3)} right=${lowSpeed.creep.rightPeakFraction.toFixed(3)} `
    + `capture=${lowSpeed.creep.rackFractionAtServoRelease.toFixed(3)} `
    + `final=${lowSpeed.creep.finalRackFraction.toFixed(3)} `
    + `crossed=${lowSpeed.creep.crossedCentreOnReversal} `
    + `stall=${lowSpeed.creep.maxServoStallFrames}f speed=${lowSpeed.creep.finalSpeedMs.toFixed(3)}m/s`,
  );
  console.log(
    `[browser-smoke] front-rig preflight OK: nodes=${frontRig.resolvedNodeCount}/${frontRig.requiredNodeCount}, `
    + `skin=${frontRig.skinnedMeshCount}/${frontRig.uniqueSkeletonCount}, `
    + `M6 carrier=${frontRig.m6CarrierBody}, native JSON=${frontRig.nativeChassisMountBRidesBody}, `
    + `knownDrift=${frontRig.knownOwnershipDrift}`,
  );
  console.log(
    `[browser-smoke] wheels OK: clones=${wheel.cloneCount}, skeletons=${wheel.uniqueSkeletonCount}, `
    + `authored=${wheel.authoredRadius.toFixed(5)}x${wheel.authoredWidth.toFixed(5)}, `
    + `scale=${wheel.radialScale.toFixed(5)}/${wheel.axialScale.toFixed(5)}, `
    + `root=${wheel.maxBindingPositionError.toExponential(2)}m, `
    + `centre=${wheel.centerError.toExponential(2)}m, mount=${wheel.mountOffset.toFixed(5)}m`,
  );
  console.log(`[browser-smoke] OK: ${state.status}; canvas ${state.canvasWidth}x${state.canvasHeight}; telemetry active.`);
  cdp.close();
} finally {
  await terminateProcessTree(chromeProcess);
  await terminateProcessTree(previewProcess);
  if (chromeProfile) await removeDirectoryBestEffort(chromeProfile);
}

async function waitForBrowserReady(cdp, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastState = null;
  while (Date.now() < deadline) {
    const evaluation = await cdp.send('Runtime.evaluate', {
      expression: READ_BROWSER_STATE,
      returnByValue: true,
      awaitPromise: true,
    });
    lastState = evaluation.result?.value ?? null;
    if (lastState) {
      const telemetryReady = lastState.telemetry.includes('body/joint/contact');
      const appFailed = lastState.errorHidden === false;
      if (telemetryReady || appFailed) return lastState;
    }
    await sleep(200);
  }
  throw new Error(
    `Timed out waiting for browser simulation readiness after ${timeoutMs} ms. `
    + `Last state: ${JSON.stringify(lastState)}`,
  );
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

async function terminateProcessTree(child) {
  if (!child || child.exitCode !== null) return;
  sendSignal(child, 'SIGTERM');
  if (await waitForExit(child, 1_500)) return;
  sendSignal(child, 'SIGKILL');
  await waitForExit(child, 1_500);
}

function sendSignal(child, signal) {
  try {
    if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error;
  }
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.off('exit', onExit);
      resolve(value);
    };
    const onExit = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);
    child.once('exit', onExit);
  });
}

async function removeDirectoryBestEffort(directory) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return;
    } catch (error) {
      if (!['ENOTEMPTY', 'EBUSY', 'EPERM'].includes(error?.code)) throw error;
      await sleep(200 * (attempt + 1));
    }
  }
  console.warn(`[browser-smoke] Could not remove temporary Chrome profile: ${directory}`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
