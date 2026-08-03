import Box3D from 'box3d.js/inline';
import './style.css';
import { KeyboardInput } from './input';
import { M6ParityController } from './physics/m6-parity-controller';
import { prepareBox3dRuntime } from './physics/box3d-runtime';
import { M6WebRig } from './physics/m6-rig';
import { DEFAULT_M6_CONFIG } from './physics/rig-config';
import { createRenderContext, createRigVisuals } from './render/renderer';
import { createWorldScene } from './scene/world';

const canvas = requireElement<HTMLCanvasElement>('viewport');
const statusElement = requireElement<HTMLElement>('status');
const telemetryElement = requireElement<HTMLElement>('telemetry');
const errorElement = requireElement<HTMLElement>('error');

async function start(): Promise<void> {
  statusElement.textContent = 'Ładowanie Box3D WebAssembly…';
  const b3 = prepareBox3dRuntime(await Box3D());
  const version = b3.b3GetVersion();
  statusElement.textContent = `Box3D ${version.major}.${version.minor}.${version.revision} · JV M6 parity pass`;

  const render = createRenderContext(canvas);
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: -9.81, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  b3.b3World_SetContactTuning(worldId, 30, 10, 3);

  const worldResources = await createWorldScene(b3, worldId, render.scene);
  const spawnHeight = DEFAULT_M6_CONFIG.restDrop + DEFAULT_M6_CONFIG.wheelRadius + 0.08;
  const rig = new M6WebRig(b3, worldId, DEFAULT_M6_CONFIG, { x: 0, y: spawnHeight, z: 0 });
  const parityController = new M6ParityController(b3, rig);
  const chassisVisual = createRigVisuals(render.scene, rig);
  const input = new KeyboardInput();

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

    const driveInput = input.update();
    let catchUpSteps = 0;
    while (accumulator >= fixedDt && catchUpSteps < maxCatchUpSteps) {
      parityController.update(driveInput);
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
      telemetryElement.innerHTML = [
        `prędkość: <b>${telemetry.speedKmh.toFixed(1)} km/h</b>`,
        `rack: ${telemetry.rackTravel.toFixed(4)} / ${rig.config.rackTravel.toFixed(4)} m`,
        `tarcie racka: ${parity.rackFrictionForce.toFixed(0)} N`,
        `obciążenie drążków: ${parity.transverseTieRodLoad.toFixed(0)} N`,
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