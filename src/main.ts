import "./style.css";
import { F4VehicleHost } from "./app/f4-vehicle-host.js";
import type {
  AnalogDrivePedal,
  PointerAnalogDriveControls,
  PointerDriveDirection,
} from "./input/pointer-analog-drive-adapter.js";
import type { SteeringCommand } from "./input/steering-command.js";
import { MobileDrivingUi } from "./mobile-driving-ui.js";
import { M6ProductRenderer } from "./render/m6-product-renderer.js";
import {
  formatBrowserRuntimeReport,
  inspectCurrentBrowserRuntime,
} from "./runtime/browser-runtime-report.js";
import {
  assertLegacyM6SceneSupport,
  loadScenePackageV1,
} from "./scene/scene-package.js";
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
  <main class="product-shell">
    <section class="scene-panel" aria-label="JV Web M6 drive">
      <canvas data-scene aria-label="Live WebGL view of the Box3D M6 vehicle"></canvas>

      <header class="scene-header">
        <div class="brand-lockup">
          <p class="eyebrow">JV Box3D Web · R1</p>
          <h1>M6 Drive</h1>
        </div>
        <p class="scene-state" data-scene-state>WAITING FOR PHYSICS</p>
      </header>

      <div class="product-toolbar" data-product-controls aria-label="World and view controls"></div>

      <div class="scene-actions" aria-label="Drive actions">
        <button type="button" class="scene-action" data-camera-reset title="Reset chase camera (C)">C · Kamera</button>
        <button type="button" class="scene-action" data-restart title="Reset physical vehicle (R)">R · Reset</button>
        <button type="button" class="scene-action" data-debug-toggle aria-expanded="false">Debug</button>
      </div>

      <div class="scene-readouts" aria-live="polite">
        <div><span>Speed</span><strong data-scene-speed>0.0 km/h</strong></div>
        <div><span>Drive</span><strong data-scene-drive>COAST</strong></div>
        <div><span>Steering</span><strong data-scene-command>RELEASE</strong></div>
        <div class="diagnostic-readout"><span>Rack</span><strong data-scene-rack>0.0000 m</strong></div>
        <div class="diagnostic-readout"><span>Travel</span><strong data-scene-displacement>0.000 m</strong></div>
        <div class="diagnostic-readout"><span>Step</span><strong data-scene-step>0</strong></div>
      </div>

      <p class="scene-help">
        <kbd>W/S</kbd> gaz / wstecz · <kbd>A/D</kbd> skręt · <kbd>Space</kbd> hamulec · <kbd>R</kbd> reset · <kbd>C</kbd> kamera · przeciągnij: orbit · kółko: zoom
      </p>

      <div class="mobile-controls" aria-label="Touch vehicle controls">
        <div class="mobile-control-cluster mobile-steering-controls" aria-label="Analog steering">
          <div class="mobile-steering-joystick" data-steering-joystick role="slider" aria-label="Analog steering" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0" aria-valuetext="CENTER">
            <span class="mobile-steering-wheel-stage" aria-hidden="true">
              <span class="mobile-steering-wheel-tilt">
                <span class="mobile-steering-wheel-rotor">
                  <span class="mobile-steering-wheel-rim"></span>
                  <span class="mobile-steering-spoke mobile-steering-spoke-a"></span>
                  <span class="mobile-steering-spoke mobile-steering-spoke-b"></span>
                  <span class="mobile-steering-spoke mobile-steering-spoke-c"></span>
                  <span class="mobile-steering-wheel-hub"></span>
                  <span class="mobile-steering-wheel-marker"></span>
                </span>
              </span>
              <span class="mobile-steering-center-tick"></span>
            </span>
            <small>STEER</small>
          </div>
        </div>
        <div class="mobile-control-cluster mobile-drive-controls" aria-label="Analog drive controls">
          <button type="button" class="mobile-control mobile-pedal mobile-pedal-brake" data-analog-pedal="BRAKE" role="slider" aria-label="Analog brake. Slide thumb upward for more input." aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0%">
            <span class="mobile-pedal-mechanism" aria-hidden="true">
              <span class="mobile-pedal-fill"></span>
              <span class="mobile-pedal-track"></span>
              <span class="mobile-pedal-face"></span>
            </span>
            <small>BRAKE</small>
          </button>
          <button type="button" class="mobile-control mobile-pedal mobile-pedal-throttle" data-analog-pedal="THROTTLE" role="slider" aria-label="Analog throttle. Slide thumb upward for more input." aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0%">
            <span class="mobile-pedal-mechanism" aria-hidden="true">
              <span class="mobile-pedal-fill"></span>
              <span class="mobile-pedal-track"></span>
              <span class="mobile-pedal-face"></span>
            </span>
            <small>THROTTLE</small>
          </button>
          <button type="button" class="mobile-control mobile-direction-selector" data-drive-direction="D" aria-label="Drive direction D. Tap to switch D/R." aria-pressed="false">
            <span data-direction-option="D">D</span>
            <span class="mobile-direction-divider" aria-hidden="true">/</span>
            <span data-direction-option="R">R</span>
          </button>
        </div>
      </div>

      <aside class="panel" data-debug-panel aria-hidden="true">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Mechanics debug</p>
            <h2>RATE steering + reference drive</h2>
          </div>
          <p class="status" data-status>Validating scene, receipt and Box3D boundary…</p>
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

        <dl class="primary-metrics">
          <div><dt>Steering input</dt><dd data-command>RELEASE</dd></div>
          <div><dt>Drive input</dt><dd data-drive>COAST</dd></div>
          <div><dt>Forward speed</dt><dd data-speed>0.000 m/s · 0.0 km/h</dd></div>
          <div><dt>Live rack</dt><dd data-rack>0.000000 m · 0.000000 m/s</dd></div>
          <div><dt>Travel from initial sample</dt><dd data-displacement>0.000 m</dd></div>
          <div><dt>Contacts</dt><dd data-contacts>0</dd></div>
          <div><dt>Steering actuator</dt><dd data-actuator>OFF</dd></div>
          <div><dt>Mechanics gate</dt><dd data-validation>NOT STARTED</dd></div>
        </dl>

        <details>
          <summary>Full trace and provenance</summary>
          <dl class="telemetry-grid">
            <div><dt>Browser runtime</dt><dd data-browser-runtime>PENDING</dd></div>
            <div><dt>Vehicle backend</dt><dd data-runtime-backend>PENDING</dd></div>
            <div><dt>Scene package</dt><dd data-scene-package>PENDING</dd></div>
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
            <div><dt>Drive target</dt><dd data-drive-target>0.000 m/s · 0.000 rad/s · taper 1.000</dd></div>
            <div><dt>Drive torque</dt><dd data-drive-torque>0.00 Nm/wheel · 0.00 Nm current</dd></div>
            <div><dt>Chassis position</dt><dd data-chassis-position>0.0000, 0.0000, 0.0000 m</dd></div>
            <div><dt>Chassis velocity</dt><dd data-chassis-velocity>0.0000, 0.0000, 0.0000 m/s</dd></div>
            <div><dt>Contact begins</dt><dd data-begins>0</dd></div>
            <div><dt>Four corners</dt><dd data-corners>PENDING</dd></div>
            <div><dt>Dropped render time</dt><dd data-dropped>0.00 ms</dd></div>
          </dl>
        </details>

        <p class="hint">
          Debug telemetry remains read-only. Product controls and camera do not own Box3D state.
        </p>
      </aside>
    </section>
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
const sceneDriveElement = requireElement<HTMLElement>("[data-scene-drive]");
const sceneSpeedElement = requireElement<HTMLElement>("[data-scene-speed]");
const sceneRackElement = requireElement<HTMLElement>("[data-scene-rack]");
const sceneDisplacementElement = requireElement<HTMLElement>("[data-scene-displacement]");
const sceneStepElement = requireElement<HTMLElement>("[data-scene-step]");
const statusElement = requireElement<HTMLElement>("[data-status]");
const profileSelect = requireElement<HTMLSelectElement>("[data-rate-profile]");
const browserRuntimeElement = requireElement<HTMLElement>("[data-browser-runtime]");
const runtimeBackendElement = requireElement<HTMLElement>("[data-runtime-backend]");
const scenePackageElement = requireElement<HTMLElement>("[data-scene-package]");
const nativeSourceElement = requireElement<HTMLElement>("[data-native-source]");
const box3dElement = requireElement<HTMLElement>("[data-box3d]");
const topologyElement = requireElement<HTMLElement>("[data-topology]");
const wheelBackendElement = requireElement<HTMLElement>("[data-wheel-backend]");
const groupElement = requireElement<HTMLElement>("[data-group]");
const generationElement = requireElement<HTMLElement>("[data-generation]");
const stepElement = requireElement<HTMLElement>("[data-step]");
const commandElement = requireElement<HTMLElement>("[data-command]");
const driveElement = requireElement<HTMLElement>("[data-drive]");
const speedElement = requireElement<HTMLElement>("[data-speed]");
const actuatorElement = requireElement<HTMLElement>("[data-actuator]");
const profileElement = requireElement<HTMLElement>("[data-profile]");
const edgeElement = requireElement<HTMLElement>("[data-edge]");
const commandedRackElement = requireElement<HTMLElement>("[data-commanded-rack]");
const targetErrorElement = requireElement<HTMLElement>("[data-target-error]");
const springElement = requireElement<HTMLElement>("[data-spring]");
const frictionElement = requireElement<HTMLElement>("[data-friction]");
const driveTargetElement = requireElement<HTMLElement>("[data-drive-target]");
const driveTorqueElement = requireElement<HTMLElement>("[data-drive-torque]");
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
const cameraResetButton = requireElement<HTMLButtonElement>("[data-camera-reset]");
const debugToggleButton = requireElement<HTMLButtonElement>("[data-debug-toggle]");
const debugPanel = requireElement<HTMLElement>("[data-debug-panel]");
const steeringJoystick = requireElement<HTMLElement>("[data-steering-joystick]");
const throttlePedal = requireElement<HTMLButtonElement>(
  '[data-analog-pedal="THROTTLE"]',
);
const brakePedal = requireElement<HTMLButtonElement>(
  '[data-analog-pedal="BRAKE"]',
);
const directionSelector = requireElement<HTMLButtonElement>(
  "[data-drive-direction]",
);

const mobileDrivingFrames = {
  request: (callback: FrameRequestCallback) =>
    window.requestAnimationFrame(callback),
  cancel: (handle: number) => window.cancelAnimationFrame(handle),
};

const mobileDrivingUi = new MobileDrivingUi(
  {
    steering: steeringJoystick,
    throttle: throttlePedal,
    brake: brakePedal,
    direction: directionSelector,
  },
  mobileDrivingFrames,
);

const analogDriveControls: PointerAnalogDriveControls = {
  throttle: throttlePedal,
  brake: brakePedal,
  direction: directionSelector,
};

function setDebugPanelOpen(open: boolean): void {
  debugPanel.toggleAttribute("data-open", open);
  debugPanel.setAttribute("aria-hidden", String(!open));
  debugToggleButton.setAttribute("aria-expanded", String(open));
  debugToggleButton.classList.toggle("is-active", open);
  renderer?.setDiagnosticsVisible(open);
}

function interactiveKeyboardTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement &&
    (target.matches("input, select, textarea, button, a") ||
      target.isContentEditable);
}

const browserRuntimeReport = inspectCurrentBrowserRuntime();
browserRuntimeElement.textContent = formatBrowserRuntimeReport(
  browserRuntimeReport,
);

const animationFrames = mobileDrivingFrames;

let renderer: M6ProductRenderer | null = null;
try {
  renderer = new M6ProductRenderer(sceneCanvas);
} catch (error: unknown) {
  sceneStateElement.textContent =
    `RENDERER UNAVAILABLE · ${formatError(error)}`;
  console.error(error);
}

let host: F4VehicleHost | null = null;
let startupGeneration = 0;
let observationOrigin: Readonly<{
  generation: number;
  x: number;
  z: number;
}> | null = null;

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

function formatDrive(trace: M6TraceFrame): string {
  const drive = trace.drive;
  return `${drive.mode} · T ${drive.command.throttle.toFixed(2)} · B ${drive.command.brake.toFixed(2)}`;
}

function formatSpeed(speedMetersPerSecond: number): string {
  return `${speedMetersPerSecond.toFixed(3)} m/s · ${(speedMetersPerSecond * 3.6).toFixed(1)} km/h`;
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
        `spin=${corner.wheelSpinSpeed.toFixed(2)} ` +
        `motor=${corner.driveMotorTorque.toFixed(1)}Nm`,
    )
    .join(" · ");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function chassisDisplacement(trace: M6TraceFrame): number {
  if (observationOrigin?.generation !== trace.generation) {
    observationOrigin = {
      generation: trace.generation,
      x: trace.chassisPosition.x,
      z: trace.chassisPosition.z,
    };
  }
  return Math.hypot(
    trace.chassisPosition.x - observationOrigin.x,
    trace.chassisPosition.z - observationOrigin.z,
  );
}

function renderTrace(trace: M6TraceFrame): void {
  if (renderer !== null) {
    try {
      renderer.render(trace);
    } catch (error: unknown) {
      renderer.dispose();
      renderer = null;
      console.error(error);
    }
  }

  const displacement = chassisDisplacement(trace);
  const drive = trace.drive;
  const command = formatCommand(trace.command);
  const driveText = formatDrive(trace);

  sceneStateElement.textContent =
    renderer === null
      ? `PHYSICS LIVE · RENDERER OFF · ${trace.worldContacts} CONTACTS`
      : `LIVE · GENERATION ${trace.generation} · ${trace.worldContacts} CONTACTS`;
  sceneCommandElement.textContent = command;
  sceneDriveElement.textContent = driveText;
  sceneSpeedElement.textContent = `${(drive.forwardSpeedMetersPerSecond * 3.6).toFixed(1)} km/h`;
  sceneRackElement.textContent = `${trace.rackTranslation.toFixed(4)} m`;
  sceneDisplacementElement.textContent = `${displacement.toFixed(3)} m`;
  sceneStepElement.textContent = String(trace.stepIndex);

  if (!debugPanel.hasAttribute("data-open")) {
    return;
  }

  const steering = trace.steering;
  const speedText = formatSpeed(drive.forwardSpeedMetersPerSecond);
  generationElement.textContent = String(trace.generation);
  stepElement.textContent = String(trace.stepIndex);
  commandElement.textContent = command;
  driveElement.textContent = driveText;
  speedElement.textContent = speedText;
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
  driveTargetElement.textContent =
    `${drive.targetLinearSpeedMetersPerSecond.toFixed(3)} m/s · ` +
    `${drive.targetWheelAngularSpeed.toFixed(3)} rad/s · ` +
    `taper ${drive.driveTaper.toFixed(3)}`;
  driveTorqueElement.textContent =
    `${drive.motorTorqueCapPerWheel.toFixed(2)} Nm/wheel · ` +
    `${drive.currentMotorTorqueTotal.toFixed(2)} Nm current · ` +
    `${drive.allWheelDrive ? "AWD" : "RWD"}`;
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

  const steeringGate =
    trace.steeringActuator === "OFF" && trace.command.mode === "RELEASE"
      ? "steering RELEASE"
      : `${trace.steeringActuator} steering`;
  validationElement.textContent =
    `${steeringGate} · ${drive.mode} drive · ` +
    `${drive.drivenCornerCount} driven corners`;
}

function resetDisplay(): void {
  runtimeBackendElement.textContent = "PENDING";
  scenePackageElement.textContent = "PENDING";
  nativeSourceElement.textContent = "PENDING";
  box3dElement.textContent = "PENDING";
  topologyElement.textContent = "PENDING";
  wheelBackendElement.textContent = "PENDING";
  groupElement.textContent = "PENDING";
  profileElement.textContent = "PENDING";
  validationElement.textContent = "PENDING";
  cornersElement.textContent = "PENDING";
  displacementElement.textContent = "0.000 m";
  driveElement.textContent = "COAST";
  speedElement.textContent = "0.000 m/s · 0.0 km/h";
  driveTargetElement.textContent = "0.000 m/s · 0.000 rad/s · taper 1.000";
  driveTorqueElement.textContent = "0.00 Nm/wheel · 0.00 Nm current";
  sceneCommandElement.textContent = "RELEASE";
  sceneDriveElement.textContent = "COAST";
  sceneSpeedElement.textContent = "0.0 km/h";
  sceneRackElement.textContent = "0.0000 m";
  sceneDisplacementElement.textContent = "0.000 m";
  sceneStepElement.textContent = "0";
  sceneStateElement.textContent =
    renderer === null ? "RENDERER UNAVAILABLE" : "WAITING FOR PHYSICS";
}

async function startHost(): Promise<void> {
  const generation = ++startupGeneration;
  mobileDrivingUi.beginGeneration(generation);
  const rateProfileId = selectedProfileId();
  restartButton.disabled = true;
  profileSelect.disabled = true;
  resetDisplay();
  statusElement.textContent =
    "Loading scene package and validating runtime boundaries…";
  host?.dispose();
  host = null;
  let droppedTotalMs = 0;

  try {
    const scene = await loadScenePackageV1();
    assertLegacyM6SceneSupport(scene);
    if (Math.abs(scene.spawn.yawRadians) > 1e-9) {
      throw new Error(
        "legacy_ts_m6 currently requires scene spawn yawRadians = 0.",
      );
    }
    if (generation !== startupGeneration) {
      return;
    }
    const [spawnX, spawnY, spawnZ] = scene.spawn.position;
    scenePackageElement.textContent =
      `${scene.id} · ${scene.units} · ${scene.collision.kind}`;

    const nextHost = await F4VehicleHost.start({
      now: () => performance.now(),
      animationFrames,
      windowTarget: window,
      documentTarget: document,
      isDocumentHidden: () => document.visibilityState === "hidden",
      analogDriveControls,
      onAnalogPedalStateChange: (
        pedal: AnalogDrivePedal,
        value: number,
        active: boolean,
      ) => {
        mobileDrivingUi.setPedal(generation, pedal, value, active);
      },
      onDriveDirectionChange: (direction: PointerDriveDirection) => {
        mobileDrivingUi.setDirection(generation, direction);
      },
      steeringJoystick,
      onSteeringJoystickStateChange: (value: number, active: boolean) => {
        mobileDrivingUi.setSteering(generation, value, active);
      },
      generation,
      spawn: { x: spawnX, y: spawnY, z: spawnZ },
      rateProfileId,
      onVehicleStep: (_step, _steering, _longitudinal, trace) => {
        renderTrace(trace);
      },
      onFrame: (report) => {
        droppedTotalMs += report.droppedTimeMs;
        if (debugPanel.hasAttribute("data-open")) {
          droppedElement.textContent = `${droppedTotalMs.toFixed(2)} ms`;
        }
      },
      onFatalError: (error) => {
        if (generation !== startupGeneration) {
          return;
        }
        host = null;
        statusElement.textContent =
          `Runtime fault — resources disposed: ${formatError(error)}`;
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
    const backend = nextHost.backend;
    const nativeReceipt = nextHost.nativeReceipt;
    const box3dReceipt = nextHost.box3dReceipt;
    const version = box3dReceipt.engineVersion;
    const counters = nextHost.counters;
    const profile = nextHost.rateProfile;

    runtimeBackendElement.textContent =
      `${backend.id} · authority ${backend.productPhysicsAuthority ? "YES" : "NO"} · ` +
      `parity ${backend.nativeParity} · command v${backend.commandContractVersion} · ` +
      `trace v${backend.traceContractVersion}`;
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
      `Running — ${scene.id}; ${backend.id}; ` +
      `${box3dReceipt.identity.packageName}@${box3dReceipt.identity.packageVersion}; ` +
      `RATE/POSITION steering + reference wheel drive; ` +
      `keyboard + analog steering + analog pedals + D/R; generation ${generation}`;
  } catch (error: unknown) {
    if (generation !== startupGeneration) {
      return;
    }
    statusElement.textContent = `Startup rejected: ${formatError(error)}`;
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

cameraResetButton.addEventListener("click", () => {
  renderer?.resetCamera();
});

debugToggleButton.addEventListener("click", () => {
  setDebugPanelOpen(!debugPanel.hasAttribute("data-open"));
});

window.addEventListener("keydown", (event) => {
  if (event.repeat || interactiveKeyboardTarget(event.target)) {
    return;
  }
  if (event.code === "KeyC") {
    event.preventDefault();
    renderer?.resetCamera();
    return;
  }
  if (event.code === "KeyR") {
    event.preventDefault();
    void startHost();
    return;
  }
  if (event.code === "Escape" && debugPanel.hasAttribute("data-open")) {
    setDebugPanelOpen(false);
  }
});

restartButton.addEventListener("click", () => {
  void startHost();
});
profileSelect.addEventListener("change", () => {
  void startHost();
});

window.addEventListener(
  "pagehide",
  () => {
    const generation = ++startupGeneration;
    mobileDrivingUi.beginGeneration(generation);
    host?.dispose();
    host = null;
    mobileDrivingUi.dispose();
    renderer?.dispose();
    renderer = null;
  },
  { once: true },
);

setDebugPanelOpen(false);
void startHost();