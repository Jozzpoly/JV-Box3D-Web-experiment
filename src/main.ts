import Box3D from 'box3d.js/inline';
import './style.css';
import { KeyboardInput } from './input';
import { KeyboardDriverInputModel } from './input-model';
import { loadRuntimeM6Config } from './physics/config-loader';
import { M6ParityController } from './physics/m6-parity-controller';
import { runM6ParityProbes, type M6ProbeReport } from './physics/m6-probes';
import { prepareBox3dRuntime } from './physics/box3d-runtime';
import { RackResponseWatchdog } from './physics/rack-response-watchdog';
import { M6WebRig } from './physics/m6-rig';
import {
  loadFrontRigContractPreflight,
  type FrontRigContractReport,
} from './render/front-rig-contract';
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
  const factoryProductReady = probes.passed
    && probes.handlingPulse.stable
    && probes.lowSpeedSteering.stable;
  if (usingFactory && !factoryProductReady) {
    throw new Error(
      `Factory M6/web input nie zaliczył bramek. `
      + `parity=${probes.passedCount}/${probes.totalCount}, `
      + `keyboardTap=${probes.handlingPulse.stable}, `
      + `lowSpeed=${probes.lowSpeedSteering.stable}`,
    );
  }

  statusElement.textContent = 'Preflight kontraktu przedniego rigu JV…';
  const frontRigContract = await loadFrontRigContractPreflight();
  exposeFrontRigReport(frontRigContract);
  if (!frontRigContract.loaded) {
    throw new Error(`Kontrakt przedniego rigu został odrzucony: ${frontRigContract.message}`);
  }
  console.info(`[jv-front-rig] ${frontRigContract.message}`);

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
  const rackWatchdog = new RackResponseWatchdog(b3, rig);

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
    `low-speed ${probes.lowSpeedSteering.stable ? 'OK' : 'diagnostyka'}`,
    `koła ${wheelVisualValid ? 'GLTF OK' : 'fallback'}`,
    `front-rig ${frontRigContract.resolvedNodeCount}/${frontRigContract.requiredNodeCount}`,
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
      rackWatchdog.update(modeledDriveInput);
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
      const rackResponse = rackWatchdog.telemetry;
      const inputTelemetry = driverInput.telemetry;
      const wheel = visualResult.report.wheel;
      const stationary = probes.lowSpeedSteering.stationary;
      const creep = probes.lowSpeedSteering.creep;
      telemetryElement.innerHTML = [
        `prędkość: <b>${telemetry.speedKmh.toFixed(1)} km/h</b>`,
        `skręt klawisz/model: ${inputTelemetry.rawSteer.toFixed(2)} / ${inputTelemetry.filteredSteer.toFixed(2)}`,
        `ręce: ${inputTelemetry.steeringEngaged ? 'SERVO' : 'SWOBODNE'} · hold ${inputTelemetry.centreHoldRemaining.toFixed(2)} s`,
        `rack: ${telemetry.rackTravel.toFixed(4)} / ${rig.config.rackTravel.toFixed(4)} m`,
        `rack ${rackResponse.mode}: target ${rackResponse.targetTranslation.toFixed(4)} · err ${rackResponse.error.toFixed(4)} m`,
        `rack v: ${rackResponse.speed.toFixed(4)} m/s · stall ${rackResponse.stalledFrames}/${rackResponse.maxStalledFrames} kl.`,
        `tarcie racka: ${parity.rackFrictionForce.toFixed(0)} N`,
        `obciążenie drążków: ${parity.transverseTieRodLoad.toFixed(0)} N`,
        `toe F/R: ${rig.config.frontToeDeg.toFixed(2)}° / ${rig.config.rearToeDeg.toFixed(2)}°`,
        `sondy parytetu: ${probes.passedCount}/${probes.totalCount}`,
        `keyboard tap: ${probes.handlingPulse.stable ? 'OK' : 'NIESTABILNY'}`,
        `low-speed postój/creep: ${stationary.stable ? 'OK' : 'UWAGA'} / ${creep.stable ? 'OK' : 'UWAGA'}`,
        `capture racka postój/creep: ${stationary.rackFractionAtServoRelease.toFixed(3)} / ${creep.rackFractionAtServoRelease.toFixed(3)}`,
        `stall sondy postój/creep: ${stationary.maxServoStallFrames}/${creep.maxServoStallFrames} kl.`,
        `koła GLTF: ${wheel.loaded ? `${wheel.cloneCount} · szkielety ${wheel.uniqueSkeletonCount}` : 'fallback'}`,
        `binding kół: ${wheel.attachedToWheelBodies ? 'OK' : 'BŁĄD'} · root ${wheel.maxBindingPositionError.toExponential(1)} m`,
        `środek opony: ${wheel.centerError.toExponential(1)} m · socket ${wheel.mountOffset.toFixed(4)} m`,
        `oś socketu: ${wheel.mountAxisError.toExponential(1)} m`,
        `front rig: ${frontRigContract.resolvedNodeCount}/${frontRigContract.requiredNodeCount} · skin ${frontRigContract.skinnedMeshCount}`,
        `ownership: M6 ${frontRigContract.m6CarrierBody} · JSON ${frontRigContract.nativeChassisMountBRidesBody}${frontRigContract.knownOwnershipDrift ? ' (drift)' : ''}`,
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

function exposeFrontRigReport(report: FrontRigContractReport): void {
  (window as Window & { __JV_FRONT_RIG_REPORT__?: FrontRigContractReport }).__JV_FRONT_RIG_REPORT__ = report;
}

function logProbeReport(report: M6ProbeReport): void {
  const straight = report.straight;
  const impact = report.steeringImpact;
  const handling = report.handlingPulse;
  const stationary = report.lowSpeedSteering.stationary;
  const creep = report.lowSpeedSteering.creep;
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
  console.info(
    `[jv-probe] low-speed stationary ${stationary.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `left=${stationary.leftPeakFraction.toFixed(3)}, right=${stationary.rightPeakFraction.toFixed(3)}, `
    + `capture=${stationary.rackFractionAtServoRelease.toFixed(3)}, final=${stationary.finalRackFraction.toFixed(3)}, `
    + `crossed=${stationary.crossedCentreOnReversal}, stall=${stationary.maxServoStallFrames} frames`,
  );
  console.info(
    `[jv-probe] low-speed creep ${creep.stable ? 'STABLE' : 'UNSTABLE'}: `
    + `left=${creep.leftPeakFraction.toFixed(3)}, right=${creep.rightPeakFraction.toFixed(3)}, `
    + `capture=${creep.rackFractionAtServoRelease.toFixed(3)}, final=${creep.finalRackFraction.toFixed(3)}, `
    + `crossed=${creep.crossedCentreOnReversal}, stall=${creep.maxServoStallFrames} frames, `
    + `speed=${creep.finalSpeedMs.toFixed(3)}m/s`,
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
