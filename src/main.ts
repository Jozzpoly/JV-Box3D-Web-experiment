import Box3D from 'box3d.js/inline';
import './style.css';
import { KeyboardInput } from './input';
import { KeyboardDriverInputModel } from './input-model';
import { loadRuntimeM6Config } from './physics/config-loader';
import { M6ParityController } from './physics/m6-parity-controller';
import { runM6ParityProbes, type M6ProbeReport } from './physics/m6-probes';
import { prepareBox3dRuntime } from './physics/box3d-runtime';
import { M6WebRig } from './physics/m6-rig';
import {
  createRenderContext,
  createRigVisuals,
  type RigVisualReport,
} from './render/renderer';
import { createWorldScene } from './scene/world';

const canvas = requireElement<HTMLCanvasElement>('viewport');
const statusElement = requireElement<HTMLElement>('status');
const telemetryElement = requireElement<HTMLElement>('telemetry');
const errorElement = requireElement<HTMLElement>('error');

async function start(): Promise<void> {
  statusElement.textContent = 'Ładowanie Box3D WebAssembly i konfiguracji JV…';
  const [rawBox3d, runtimeConfig] = await Promise.all([
    Box3D(),
    loadRuntimeM6Config(),
  ]);
  const b3 = prepareBox3dRuntime(rawBox3d);
  const version = b3.b3GetVersion();
  const config = runtimeConfig.config;
  for (const warning of runtimeConfig.warnings) console.warn(`[jv-config] ${warning}`);

  statusElement.textContent = 'Sondy stabilności M6…';
  const probes = runM6ParityProbes(b3, config);
  exposeProbeReport(probes);
  logProbeReport(probes);

  const usingFactory = runtimeConfig.source === 'factory/uliczny';
  if (usingFactory && !probes.passed) {
    throw new Error(
      `Factory M6 nie zaliczył sond parytetu (${probes.passedCount}/${probes.totalCount}). `
      + `straight=${probes.straight.passed}, steeringImpact=${probes.steeringImpact.passed}`,
    );
  }

  const render = createRenderContext(canvas);
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: -9.81, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  b3.b3World_SetContactTuning(worldId, 30, 10, 3);

  const worldResources = await createWorldScene(b3, worldId, render.scene);
  const spawnHeight = config.restDrop + config.wheelRadius + 0.08;
  const rig = new M6WebRig(b3, worldId, config, { x: 0, y: spawnHeight, z: 0 });
  const parityController = new M6ParityController(b3, rig);

  statusElement.textContent = 'Walidacja wizualnych kontraktów JV…';
  const visualResult = await createRigVisuals(render.scene, rig);
  const chassisVisual = visualResult.root;
  exposeVisualReport(visualResult.report);

  const wheelVisualValid = visualResult.report.wheel.loaded
    && visualResult.report.wheel.markerContract
    && visualResult.report.wheel.independentSkeletons
    && visualResult.report.wheel.attachedToWheelBodies;
  statusElement.textContent = [
    `Box3D ${version.major}.${version.minor}.${version.revision}`,
    runtimeConfig.source,
    `sondy ${probes.passedCount}/${probes.totalCount}`,
    `klawiatura ${probes.handlingPulse.stable ? 'OK' : 'niestabilna'}`,
    `koła ${wheelVisualValid ? 'GLTF OK' : 'fallback'}`,
  ].join(' · ');

  const input = new KeyboardInput();
  const driverInput = new KeyboardDriverInputModel();

  const fixedDt = 1 / 60;
  const subSteps = 4;
  const maxCatchUpSteps = 5;
  let accumulator = 0;
  let previousSeconds = performance.now() / 1000;
  let telemetryClock = 0;
  let disposed = false;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    rig.destroy();
    b3.b3DestroyWorld(worldId);
    worldResources.dispose();
    render.dispose();
  };
  window.addEventListener('beforeunload', dispose, { once: true });

  const frame = (milliseconds: number) => {
    if (disposed) return;
    const seconds = milliseconds / 1000;
    const frameDt = Math.min(seconds - previousSeconds, 0.1);
    previousSeconds = seconds;
    accumulator += frameDt;

    const rawDriveInput = input.update();
    let catchUpSteps = 0;
    while (accumulator >= fixedDt && catchUpSteps < maxCatchUpSteps) {
      const modeledDriveInput = driverInput.update(rawDriveInput, fixedDt);
      parityController.update(modeledDriveInput);
      b3.b3World_Step(worldId, fixedDt, subSteps);
      accumulator -= fixedDt;
      catchUpSteps += 1;
    }
    if (catchUpSteps === maxCatchUpSteps) accumulator = 0;

    rig.syncVisuals();
    const updateRigVisuals = chassisVisual.userData.updateRigVisuals;
    if (typeof updateRigVisuals === 'function') updateRigVisuals();
    render.updateCamera(chassisVisual, frameDt);
    render.renderer.render(render.scene, render.camera);

    telemetryClock += frameDt;
    if (telemetryClock >= 0.2) {
      telemetryClock = 0;
      const telemetry = rig.getTelemetry();
      const parity = parityController.telemetry;
      const inputTelemetry = driverInput.telemetry;
      const wheel = visualResult.report.wheel;
      telemetryElement.innerHTML = [
        `prędkość: <b>${telemetry.speedKmh.toFixed(1)} km/h</b>`,
        `skręt klawisz/model: ${inputTelemetry.rawSteer.toFixed(2)} / ${inputTelemetry.filteredSteer.toFixed(2)}`,
        `rack: ${telemetry.rackTravel.toFixed(4)} / ${rig.config.rackTravel.toFixed(4)} m`,
        `tarcie racka: ${parity.rackFrictionForce.toFixed(0)} N`,
        `obciążenie drążków: ${parity.transverseTieRodLoad.toFixed(0)} N`,
        `toe F/R: ${rig.config.frontToeDeg.toFixed(2)}° / ${rig.config.rearToeDeg.toFixed(2)}°`,
        `sondy parytetu: ${probes.passedCount}/${probes.totalCount}`,
        `keyboard tap: ${probes.handlingPulse.stable ? 'OK' : 'NIESTABILNY'}`,
        `koła GLTF: ${wheel.loaded ? `${wheel.cloneCount} · szkielety ${wheel.uniqueSkeletonCount}` : 'fallback'}`,
        `binding kół: ${wheel.attachedToWheelBodies ? 'OK' : 'BŁĄD'} · ${wheel.maxBindingPositionError.toExponential(1)} m`,
        `fizyka: ${telemetry.physicsMs.toFixed(2)} ms`,
        `body/joint/contact: ${telemetry.bodyCount}/${telemetry.jointCount}/${telemetry.contactCount}`,
      ].join('<br>');
    }

    if (input.consumeRestart()) {
      dispose();
      window.location.reload();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function exposeProbeReport(report: M6ProbeReport): void {
  (window as Window & { __JV_PROBE_REPORT__?: M6ProbeReport }).__JV_PROBE_REPORT__ = report;
}

function exposeVisualReport(report: RigVisualReport): void {
  (window as Window & { __JV_VISUAL_REPORT__?: RigVisualReport }).__JV_VISUAL_REPORT__ = report;
}

function logProbeReport(report: M6ProbeReport): void {
  const straight = report.straight;
  const impact = report.steeringImpact;
  const handling = report.handlingPulse;
  console.info(
    `[jv-probe] straight ${straight.passed ? 'PASS' : 'FAIL'}: `
    + `dx=${straight.forwardMeters.toFixed(2)}m, dz=${straight.lateralMeters.toFixed(2)}m, `
    + `ratio=${straight.lateralRatio.toFixed(3)}, tilt=${straight.chassisTiltDeg.toFixed(1)}deg`,
  );
  console.info(
    `[jv-probe] steering-impact ${impact.passed ? 'PASS' : 'FAIL'}: `
    + `worst=${impact.worstRackFraction.toFixed(3)}, rest=${impact.atRestRackFraction.toFixed(3)}, `
    + `final=${impact.finalRackFraction.toFixed(3)}, yaw=${impact.finalYawRate.toFixed(3)}rad/s`,
  );
  console.info(
    `[jv-probe] keyboard-tap ${handling.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `peak=${handling.peakRackFraction.toFixed(3)}, final=${handling.finalRackFraction.toFixed(3)}, `
    + `yaw=${handling.finalYawRate.toFixed(3)}rad/s`,
  );
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

start().catch((error: unknown) => {
  console.error(error);
  statusElement.textContent = 'Błąd uruchamiania';
  errorElement.hidden = false;
  errorElement.textContent = error instanceof Error ? `${error.message}\n\n${error.stack ?? ''}` : String(error);
});
