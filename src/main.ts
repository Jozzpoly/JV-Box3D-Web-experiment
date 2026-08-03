import "./style.css";
import { F4VehicleHost } from "./app/f4-vehicle-host.js";
import type { SteeringCommand } from "./input/steering-command.js";
import type { M6TraceFrame } from "./vehicle/m6/m6-topology-world.js";

function requireRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>("#app");
  if (root === null) {
    throw new Error("Missing #app root.");
  }
  return root;
}

const app = requireRoot();
app.innerHTML = `
  <section class="panel">
    <p class="eyebrow">JV Box3D Web</p>
    <h1>Current M6 Topology — F4</h1>
    <p class="status" data-status>Validating native receipt and Box3D boundary…</p>
    <dl>
      <div><dt>Native source</dt><dd data-native-source>PENDING</dd></div>
      <div><dt>Box3D</dt><dd data-box3d>PENDING</dd></div>
      <div><dt>Topology</dt><dd data-topology>PENDING</dd></div>
      <div><dt>Wheel backend</dt><dd data-wheel-backend>PENDING</dd></div>
      <div><dt>Collision group</dt><dd data-group>PENDING</dd></div>
      <div><dt>Generation</dt><dd data-generation>0</dd></div>
      <div><dt>Fixed step</dt><dd data-step>0</dd></div>
      <div><dt>Input command</dt><dd data-command>RELEASE</dd></div>
      <div><dt>Rack actuator</dt><dd data-actuator>OFF</dd></div>
      <div><dt>Rack</dt><dd data-rack>0.000000 m · 0.000000 m/s</dd></div>
      <div><dt>Chassis position</dt><dd data-chassis-position>0.0000, 0.0000, 0.0000 m</dd></div>
      <div><dt>Chassis velocity</dt><dd data-chassis-velocity>0.0000, 0.0000, 0.0000 m/s</dd></div>
      <div><dt>World contacts</dt><dd data-contacts>0</dd></div>
      <div><dt>Contact begins</dt><dd data-begins>0</dd></div>
      <div><dt>Four corners</dt><dd data-corners>PENDING</dd></div>
      <div><dt>Dropped render time</dt><dd data-dropped>0.00 ms</dd></div>
      <div><dt>Mechanics gate</dt><dd data-validation>PENDING</dd></div>
    </dl>
    <p class="hint">To jest rzeczywisty current-M6 body/joint graph: chassis, cztery double-wishbone corners, rack, tie-rods, toe-links, coilovers i legacy split wheel backend. RELEASE wyłącza steering spring/servo; RATE jest celowo tylko śledzone do eksperymentu F5.</p>
    <button type="button" data-restart>Destroy and rebuild current M6 world</button>
  </section>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Missing required F4 host element: ${selector}`);
  }
  return element;
}

const statusElement = requireElement<HTMLElement>("[data-status]");
const nativeSourceElement = requireElement<HTMLElement>("[data-native-source]");
const box3dElement = requireElement<HTMLElement>("[data-box3d]");
const topologyElement = requireElement<HTMLElement>("[data-topology]");
const wheelBackendElement = requireElement<HTMLElement>("[data-wheel-backend]");
const groupElement = requireElement<HTMLElement>("[data-group]");
const generationElement = requireElement<HTMLElement>("[data-generation]");
const stepElement = requireElement<HTMLElement>("[data-step]");
const commandElement = requireElement<HTMLElement>("[data-command]");
const actuatorElement = requireElement<HTMLElement>("[data-actuator]");
const rackElement = requireElement<HTMLElement>("[data-rack]");
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

let host: F4VehicleHost | null = null;
let startupGeneration = 0;

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

function formatVector(value: Readonly<{ x: number; y: number; z: number }>): string {
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
  generationElement.textContent = String(trace.generation);
  stepElement.textContent = String(trace.stepIndex);
  commandElement.textContent = formatCommand(trace.command);
  actuatorElement.textContent = trace.steeringActuator;
  rackElement.textContent =
    `${trace.rackTranslation.toFixed(6)} m · ` +
    `${trace.rackSpeed.toFixed(6)} m/s`;
  chassisPositionElement.textContent = `${formatVector(trace.chassisPosition)} m`;
  chassisVelocityElement.textContent = `${formatVector(trace.chassisVelocity)} m/s`;
  contactsElement.textContent = String(trace.worldContacts);
  beginsElement.textContent = String(trace.worldContactBegins);
  cornersElement.textContent = formatCorners(trace);
  groupElement.textContent = String(trace.collisionGroupIndex);
  wheelBackendElement.textContent = trace.wheelBackendId;
  validationElement.textContent =
    trace.steeringActuator === "OFF" && trace.command.mode === "RELEASE"
      ? "RELEASE: actuator OFF · no centering target"
      : trace.steeringActuator === "RATE_RESERVED"
        ? "RATE traced · actuator OFF until F5"
        : "POSITION drives physical rack";
}

function resetDisplay(): void {
  nativeSourceElement.textContent = "PENDING";
  box3dElement.textContent = "PENDING";
  topologyElement.textContent = "PENDING";
  wheelBackendElement.textContent = "PENDING";
  groupElement.textContent = "PENDING";
  validationElement.textContent = "PENDING";
  cornersElement.textContent = "PENDING";
}

async function startHost(): Promise<void> {
  const generation = ++startupGeneration;
  restartButton.disabled = true;
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
          `F4 runtime fault — resources disposed: ${formatError(error)}`;
        validationElement.textContent = "FAULTED / DISPOSED";
        restartButton.disabled = false;
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

    nativeSourceElement.textContent =
      `${nativeReceipt.source.commit.slice(0, 8)} · ` +
      `${nativeReceipt.serializedFieldCount}/76 fields`;
    box3dElement.textContent =
      `${box3dReceipt.identity.packageName}@${box3dReceipt.identity.packageVersion} · ` +
      `engine ${version.major}.${version.minor}.${version.revision}`;
    topologyElement.textContent =
      `${counters.bodyCount - 1} vehicle bodies · ` +
      `${counters.jointCount} joints · ${counters.shapeCount - 1} vehicle shapes`;
    generationElement.textContent = String(generation);
    statusElement.textContent =
      `Running — ${box3dReceipt.identity.packageName}@${box3dReceipt.identity.packageVersion}; ` +
      `current M6 generation ${generation}`;
  } catch (error: unknown) {
    if (generation !== startupGeneration) {
      return;
    }
    statusElement.textContent = `F4 startup rejected: ${formatError(error)}`;
    validationElement.textContent = "NOT STARTED";
    console.error(error);
  } finally {
    if (generation === startupGeneration) {
      restartButton.disabled = false;
    }
  }
}

restartButton.addEventListener("click", () => {
  void startHost();
});

window.addEventListener(
  "pagehide",
  () => {
    startupGeneration += 1;
    host?.dispose();
    host = null;
  },
  { once: true },
);

void startHost();
