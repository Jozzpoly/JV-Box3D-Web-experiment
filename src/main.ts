import "./style.css";
import { F4VehicleHost } from "./app/f4-vehicle-host.js";
import type { SteeringCommand } from "./input/steering-command.js";
import { M6DebugRenderer } from "./render/m6-debug-renderer.js";
import {
  INITIAL_RATE_STEERING_PROFILE_ID,
  RATE_STEERING_PROFILES,
  type M6TraceFrame,
  type RateSteeringProfileId,
} from "./vehicle/m6/m6-topology-world.js";

function requireRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>("#app");
  if (root === null) {
    throw new Error("Missing #app root.");
  }
  return root;
}

const app = requireRoot();
app.innerHTML = `
  <main class="lab-shell">
    <section class="scene-panel" aria-label="M6 physical observer">
      <canvas data-scene aria-label="Live WebGL view of the Box3D M6 vehicle"></canvas>
      <header class="scene-header">
        <div>
          <p class="eyebrow">JV Box3D Web · F5 Visual Observer</p>
          <h1>Physical steering, finally visible</h1>
        </div>
        <p class="scene-state" data-scene-state>WAITING FOR PHYSICS</p>
      </header>
      <div class="scene-readouts" aria-live="polite">
        <div><span>Command</span><strong data-scene-command>RELEASE</strong></div>
        <div><span>Rack</span><strong data-scene-rack>0.0000 m</strong></div>
        <div><span>Chassis drift</span><strong data-scene-displacement>0.000 m</strong></div>
        <div><span>Step</span><strong data-scene-step>0</strong></div>
      </div>
      <div class="scene-legend" aria-hidden="true">
        <span class="legend-chassis">Chassis</span>
        <span class="legend-front">Front wheels</span>
        <span class="legend-rear">Rear wheels</span>
        <span class="legend-steering">Rack / observer links</span>
      </div>
      <p class="scene-help">
        Drag to orbit · wheel to zoom · A/D steers. Orange lines are visual observer guides to the wheel centres, not exact tie-rod endpoints.
      </p>
    </section>

    <aside class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Live mechanics laboratory</p>
          <h2>RATE steering</h2>
        </div>
        <p class="status" data-status>Validating native receipt and Box3D boundary…</p>
      </div>

      <label class="profile-control">
        <span>RATE experiment profile</span>
        <select data-rate-profile>
          ${RATE_STEERING_PROFILES.map(
            (profile) =>
              `<option value="${profile.id}"${
                profile.id === INITIAL_RATE_STEERING_PROFILE_ID
                  ? " selected"
                  : ""
              }>${profile.rackRateMetersPerSecond.toFixed(2)} m/s · lead ${(
                profile.maxTargetLeadMeters * 1000
              ).toFixed(0)} mm</option>`,
          ).join("")}
        </select>
      </label>

      <button type="button" data-restart>Destroy and rebuild physical world</button>

      <dl class="primary-metrics">
        <div><dt>Input</dt><dd data-command>RELEASE</dd></div>
        <div><dt>Actuator</dt><dd data-actuator>OFF</dd></div>
        <div><dt>Live rack</dt><dd data-rack>0.000000 m · 0.000000 m/s</dd></div>
        <div><dt>Drift from spawn</dt><dd data-displacement>0.000 m</dd></div>
        <div><dt>Contacts</dt><dd data-contacts>0</dd></div>
        <div><dt>Mechanics gate</dt><dd data-validation>NOT STARTED</dd></div>
      </dl>

      <details>
        <summary>Full trace and provenance</summary>
        <dl class="telemetry-grid">
          <div><dt>Native source</dt><dd data-native-source>PENDING</dd></div>
          <div><dt>Box3D</dt><dd data-box3d>PENDING</dd></div>
          <div><dt>Topology</dt><dd data-topology>PENDING</dd></div>
          <div><dt>Wheel backend</dt><dd data-wheel-backend>PENDING</dd></div>
          <div><dt>Collision group</dt><dd data-group>PENDING</dd></div>
          <div><dt>Generation</dt><dd data-generation>0</dd></div>
          <div><dt>Fixed step</dt><dd data-step>0</dd></div>
          <div><dt>RATE profile</dt><dd data-profile>PENDING</dd></div>
          <div><dt>Hands-on edge this step</dt><dd data-edge>NONE</dd></div>
          <div><dt>Commanded / live rack</dt><dd data-commanded-rack>NONE / 0.000000 m</dd></div>
          <div><dt>Target error</dt><dd data-target-error>0.000000 m</dd></div>
          <div><dt>Spring / requested motor / force cap</dt><dd data-spring>OFF · 0.000000 m/s · 0.00 N</dd></div>
          <div><dt>Physical rack friction</dt><dd data-friction>40.00 + 0.00 N</dd></div>
          <div><dt>Chassis position</dt><dd data-chassis-position>0.0000, 0.0000, 0.0000 m</dd></div>
          <div><dt>Chassis velocity</dt><dd data-chassis-velocity>0.0000, 0.0000, 0.0000 m/s</dd></div>
          <div><dt>Contact begins</dt><dd data-begins>0</dd></div>
          <div><dt>Four corners</dt><dd data-corners>PENDING</dd></div>
          <div><dt>Dropped render time</dt><dd data-dropped>0.00 ms</dd></div>
        </dl>
      </details>

      <p class="hint">
        RELEASE removes the steering target and disables the spring immediately. The renderer only observes copied Box3D transforms; it does not write back into physics.
      </p>
    </aside>
  </main>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Missing required F5 host element: ${selector}`);
  }
  return element;
}

const sceneCanvas = requireElement<HTMLCanvasElement>("[data-scene]");
const sceneStateElement = requireElement<HTMLElement>("[data-scene-state]");
const sceneCommandElement = requireElement<HTMLElement>("[data-scene-command]");
const sceneRackElement = requireElement<HTMLElement>("[data-scene-rack]");
const sceneDisplacementElement = requireElement<HTMLElement>("[data-scene-displacement]");
const sceneStepElement = requireElement<HTMLElement>("[data-scene-step]");
const statusElement = requireElement<HTMLElement>("[data-status]");
const profileSelect = requireElement<HTMLSelectElement>("[data-rate-profile]");
const nativeSourceElement = requireElement<HTMLElement>("[data-native-source]");
const box3dElement = requireElement<HTMLElement>("[data-box3d]");
const topologyElement = requireElement<HTMLElement>("[data-topology]");
const wheelBackendElement = requireElement<HTMLElement>("[data-wheel-backend]");
const groupElement = requireElement<HTMLElement>("[data-group]");
const generationElement = requireElement<HTMLElement>("[data-generation]");
const stepElement = requireElement<HTMLElement>("[data-step]");
const commandElement = requireElement<HTMLElement>("[data-command]");
const actuatorElement = requireElement<HTMLElement>("[data-actuator]");
const profileElement = requireElement<HTMLElement>("[data-profile]");
const edgeElement = requireElement<HTMLElement>("[data-edge]");
const commandedRackElement = requireElement<HTMLElement>("[data-commanded-rack]");
const targetErrorElement = requireElement<HTMLElement>("[data-target-error]");
const springElement = requireElement<HTMLElement>("[data-spring]");
const frictionElement = requireElement<HTMLElement>("[data-friction]");
const rackElement = requireElement<HTMLElement>("[data-rack]");
const displacementElement = requireElement<HTMLElement>("[data-displacement]");
const chassisPositionElement = requireElement<HTMLElement>("[data-chassis-position]");
const chassisVelocityElement = requireElement<HTMLElement>("[data-chassis-velocity]");
const contactsElement = requireElement<HTMLElement>("[data-contacts]");
const beginsElement = requireElement<HTMLElement>("[data-begins]");
const cornersElement = requireElement<HTMLElement>("[data-corners]");
const droppedElement = requireElement<HTMLElement>("[data-dropped]");
const validationElement = requireElement<HTMLElement>("[data-validation]");
const restartButton = requireElement<HTMLButtonElement>("[data-restart]");

const animationFrames = {
  request: (callback: FrameRequestCallback) =>
    window.requestAnimationFrame(callback),
  cancel: (handle: number) => window.cancelAnimationFrame(handle),
};

let renderer: M6DebugRenderer | null = null;
try {
  renderer = new M6DebugRenderer(sceneCanvas);
} catch (error: unknown) {
  sceneStateElement.textContent =
    `RENDERER UNAVAILABLE · ${formatError(error)}`;
  console.error(error);
}

let host: F4VehicleHost | null = null;
let startupGeneration = 0;

function selectedProfileId(): RateSteeringProfileId {
  const selected = RATE_STEERING_PROFILES.find(
    (profile) => profile.id === profileSelect.value,
  );
  if (selected === undefined) {
    throw new Error(`Unknown RATE profile: ${profileSelect.value}`);
  }
  return selected.id;
}

function formatCommand(command: SteeringCommand): string {
  switch (command.mode) {
    case "RELEASE":
      return "RELEASE";
    case "POSITION":
      return `POSITION ${command.value.toFixed(3)}`;
    case "RATE":
      return `RATE ${command.value.toFixed(3)}`;
  }
}

function formatVector(
  value: Readonly<{ x: number; y: number; z: number }>,
): string {
  return `${value.x.toFixed(4)}, ${value.y.toFixed(4)}, ${value.z.toFixed(4)}`;
}

function formatCorners(trace: M6TraceFrame): string {
  const labels = ["FL", "FR", "RL", "RR"] as const;
  return trace.corners
    .map(
      (corner, index) =>
        `${labels[index]} y=${corner.wheelPosition.y.toFixed(3)} ` +
        `coil=${corner.coiloverLength.toFixed(3)} ` +
        `spin=${corner.wheelSpinSpeed.toFixed(2)}`,
    )
    .join(" · ");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function renderTrace(trace: M6TraceFrame): void {
  renderer?.render(trace);
  const displacement = renderer?.displacement(trace) ?? 0;
  const steering = trace.steering;
  const command = formatCommand(trace.command);

  sceneStateElement.textContent =
    `LIVE · GENERATION ${trace.generation} · ${trace.worldContacts} CONTACTS`;
  sceneCommandElement.textContent = command;
  sceneRackElement.textContent = `${trace.rackTranslation.toFixed(4)} m`;
  sceneDisplacementElement.textContent = `${displacement.toFixed(3)} m`;
  sceneStepElement.textContent = String(trace.stepIndex);

  generationElement.textContent = String(trace.generation);
  stepElement.textContent = String(trace.stepIndex);
  commandElement.textContent = command;
  actuatorElement.textContent = trace.steeringActuator;
  profileElement.textContent =
    `${steering.profileId} · ${steering.rackRateMetersPerSecond.toFixed(2)} m/s · ` +
    `${(steering.maxTargetLeadMeters * 1000).toFixed(0)} mm cap`;
  edgeElement.textContent = steering.handsOnEdge;
  commandedRackElement.textContent =
    `${steering.commandedRack === null ? "NONE" : `${steering.commandedRack.toFixed(6)} m`} / ` +
    `${steering.liveRackTranslation.toFixed(6)} m`;
  targetErrorElement.textContent = `${steering.targetError.toFixed(6)} m`;
  springElement.textContent =
    `${steering.springEnabled ? "ON" : "OFF"} · ` +
    `${steering.requestedMotorSpeed.toFixed(6)} m/s · ` +
    `${steering.motorForceCap.toFixed(2)} N`;
  frictionElement.textContent =
    `${steering.rackFrictionBase.toFixed(2)} + ` +
    `${steering.rackFrictionLoadTerm.toFixed(2)} N`;
  rackElement.textContent =
    `${trace.rackTranslation.toFixed(6)} m · ` +
    `${trace.rackSpeed.toFixed(6)} m/s`;
  displacementElement.textContent = `${displacement.toFixed(3)} m`;
  chassisPositionElement.textContent = `${formatVector(trace.chassisPosition)} m`;
  chassisVelocityElement.textContent = `${formatVector(trace.chassisVelocity)} m/s`;
  contactsElement.textContent = String(trace.worldContacts);
  beginsElement.textContent = String(trace.worldContactBegins);
  cornersElement.textContent = formatCorners(trace);
  groupElement.textContent = String(trace.collisionGroupIndex);
  wheelBackendElement.textContent = trace.wheelBackendId;
  validationElement.textContent =
    trace.steeringActuator === "OFF" && trace.command.mode === "RELEASE"
      ? "RELEASE: spring OFF · motor 0 · no centering target"
      : trace.steeringActuator === "RATE"
        ? `RATE active · ${steering.handsOnEdge} · lead ${Math.abs(steering.targetError * 1000).toFixed(2)} mm`
        : "POSITION baseline drives physical rack";
}

function resetDisplay(): void {
  nativeSourceElement.textContent = "PENDING";
  box3dElement.textContent = "PENDING";
  topologyElement.textContent = "PENDING";
  wheelBackendElement.textContent = "PENDING";
  groupElement.textContent = "PENDING";
  profileElement.textContent = "PENDING";
  validationElement.textContent = "PENDING";
  cornersElement.textContent = "PENDING";
  displacementElement.textContent = "0.000 m";
  sceneCommandElement.textContent = "RELEASE";
  sceneRackElement.textContent = "0.0000 m";
  sceneDisplacementElement.textContent = "0.000 m";
  sceneStepElement.textContent = "0";
  sceneStateElement.textContent =
    renderer === null ? "RENDERER UNAVAILABLE" : "WAITING FOR PHYSICS";
}

async function startHost(): Promise<void> {
  const generation = ++startupGeneration;
  const rateProfileId = selectedProfileId();
  restartButton.disabled = true;
  profileSelect.disabled = true;
  resetDisplay();
  statusElement.textContent = "Validating native receipt and Box3D boundary…";
  host?.dispose();
  host = null;
  let droppedTotalMs = 0;

  try {
    const nextHost = await F4VehicleHost.start({
      now: () => performance.now(),
      animationFrames,
      windowTarget: window,
      documentTarget: document,
      isDocumentHidden: () => document.visibilityState === "hidden",
      generation,
      spawn: { x: 0, y: 1.2, z: 0 },
      rateProfileId,
      onVehicleStep: (_step, _input, trace) => {
        renderTrace(trace);
      },
      onFrame: (report) => {
        droppedTotalMs += report.droppedTimeMs;
        droppedElement.textContent = `${droppedTotalMs.toFixed(2)} ms`;
      },
      onFatalError: (error) => {
        if (generation !== startupGeneration) {
          return;
        }
        host = null;
        statusElement.textContent =
          `F5 runtime fault — resources disposed: ${formatError(error)}`;
        sceneStateElement.textContent = "PHYSICS FAULTED";
        validationElement.textContent = "FAULTED / DISPOSED";
        restartButton.disabled = false;
        profileSelect.disabled = false;
        console.error(error);
      },
    });

    if (generation !== startupGeneration) {
      nextHost.dispose();
      return;
    }

    host = nextHost;
    const nativeReceipt = nextHost.nativeReceipt;
    const box3dReceipt = nextHost.box3dReceipt;
    const version = box3dReceipt.engineVersion;
    const counters = nextHost.counters;
    const profile = nextHost.rateProfile;

    nativeSourceElement.textContent =
      `${nativeReceipt.source.commit.slice(0, 8)} · ` +
      `${nativeReceipt.serializedFieldCount}/76 fields`;
    box3dElement.textContent =
      `${box3dReceipt.identity.packageName}@${box3dReceipt.identity.packageVersion} · ` +
      `engine ${version.major}.${version.minor}.${version.revision}`;
    topologyElement.textContent =
      `${counters.bodyCount - 1} vehicle bodies · ` +
      `${counters.jointCount} joints · ${counters.shapeCount - 1} vehicle shapes`;
    profileElement.textContent =
      `${profile.id} · ${profile.rackRateMetersPerSecond.toFixed(2)} m/s · ` +
      `${(profile.maxTargetLeadMeters * 1000).toFixed(0)} mm cap`;
    generationElement.textContent = String(generation);
    statusElement.textContent =
      `Running — ${box3dReceipt.identity.packageName}@${box3dReceipt.identity.packageVersion}; ` +
      `K2b ${profile.rackRateMetersPerSecond.toFixed(2)} m/s generation ${generation}`;
  } catch (error: unknown) {
    if (generation !== startupGeneration) {
      return;
    }
    statusElement.textContent = `F5 startup rejected: ${formatError(error)}`;
    sceneStateElement.textContent = "PHYSICS NOT STARTED";
    validationElement.textContent = "NOT STARTED";
    console.error(error);
  } finally {
    if (generation === startupGeneration) {
      restartButton.disabled = false;
      profileSelect.disabled = false;
    }
  }
}

restartButton.addEventListener("click", () => {
  void startHost();
});
profileSelect.addEventListener("change", () => {
  void startHost();
});

window.addEventListener(
  "pagehide",
  () => {
    startupGeneration += 1;
    host?.dispose();
    host = null;
    renderer?.dispose();
    renderer = null;
  },
  { once: true },
);

void startHost();
