import "./style.css";
import { F3ValidatedHost } from "./app/f3-validated-host.js";
import type { SteeringCommand } from "./input/steering-command.js";
import type { F2ValidationLevel } from "./physics/box3d-boundary.js";

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
    <h1>Native Factory Receipt — F3</h1>
    <p class="status" data-status>Validating pinned native receipt…</p>
    <dl>
      <div><dt>Native source</dt><dd data-native-source>PENDING</dd></div>
      <div><dt>Config schema</dt><dd data-config-fields>PENDING</dd></div>
      <div><dt>Wheel dimensions</dt><dd data-wheel>PENDING</dd></div>
      <div><dt>Rack contract</dt><dd data-rack>PENDING</dd></div>
      <div><dt>Optional assists</dt><dd data-assists>PENDING</dd></div>
      <div><dt>Solver profile</dt><dd data-solver>PENDING</dd></div>
      <div><dt>World generation</dt><dd data-generation>0</dd></div>
      <div><dt>Steering input</dt><dd data-command>RELEASE</dd></div>
      <div><dt>Physics step</dt><dd data-step>0</dd></div>
      <div><dt>Sphere Y</dt><dd data-position>3.0000 m</dd></div>
      <div><dt>Contacts</dt><dd data-contacts>0</dd></div>
      <div><dt>Contact begins</dt><dd data-begins>0</dd></div>
      <div><dt>Dropped time</dt><dd data-dropped>0.00 ms</dd></div>
      <div><dt>B0–B5</dt><dd data-validation>PENDING</dd></div>
    </dl>
    <p class="hint">F3 waliduje dokładny receipt wygenerowany przez native JV, a dopiero potem uruchamia znany fixture kontaktowy F2. Ten etap nadal nie buduje pojazdu ani modelu opony.</p>
    <button type="button" data-restart>Validate receipt and rebuild world</button>
  </section>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Missing required F3 host element: ${selector}`);
  }
  return element;
}

const statusElement = requireElement<HTMLElement>("[data-status]");
const nativeSourceElement = requireElement<HTMLElement>("[data-native-source]");
const configFieldsElement = requireElement<HTMLElement>("[data-config-fields]");
const wheelElement = requireElement<HTMLElement>("[data-wheel]");
const rackElement = requireElement<HTMLElement>("[data-rack]");
const assistsElement = requireElement<HTMLElement>("[data-assists]");
const solverElement = requireElement<HTMLElement>("[data-solver]");
const generationElement = requireElement<HTMLElement>("[data-generation]");
const commandElement = requireElement<HTMLElement>("[data-command]");
const stepElement = requireElement<HTMLElement>("[data-step]");
const positionElement = requireElement<HTMLElement>("[data-position]");
const contactsElement = requireElement<HTMLElement>("[data-contacts]");
const beginsElement = requireElement<HTMLElement>("[data-begins]");
const droppedElement = requireElement<HTMLElement>("[data-dropped]");
const validationElement = requireElement<HTMLElement>("[data-validation]");
const restartButton = requireElement<HTMLButtonElement>("[data-restart]");

const animationFrames = {
  request: (callback: FrameRequestCallback) => window.requestAnimationFrame(callback),
  cancel: (handle: number) => window.cancelAnimationFrame(handle),
};

let host: F3ValidatedHost | null = null;
let startupGeneration = 0;

function formatValidation(levels: readonly F2ValidationLevel[]): string {
  return levels.map((level) => `${level.id}:${level.status}`).join(" · ");
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

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function resetReceiptDisplay(): void {
  nativeSourceElement.textContent = "PENDING";
  configFieldsElement.textContent = "PENDING";
  wheelElement.textContent = "PENDING";
  rackElement.textContent = "PENDING";
  assistsElement.textContent = "PENDING";
  solverElement.textContent = "PENDING";
}

async function startHost(): Promise<void> {
  const generation = ++startupGeneration;
  restartButton.disabled = true;
  statusElement.textContent = "Validating pinned native factory receipt…";
  validationElement.textContent = "PENDING";
  resetReceiptDisplay();
  host?.dispose();
  host = null;
  let droppedTotalMs = 0;

  try {
    const nextHost = await F3ValidatedHost.start({
      now: () => performance.now(),
      animationFrames,
      windowTarget: window,
      documentTarget: document,
      isDocumentHidden: () => document.visibilityState === "hidden",
      onPhysicsStep: (step, input, snapshot) => {
        stepElement.textContent = String(step.index);
        commandElement.textContent = formatCommand(input.command);
        positionElement.textContent = `${snapshot.bodyPosition.y.toFixed(4)} m`;
        contactsElement.textContent = `${snapshot.activeContacts} / ${snapshot.activeContactPoints} points`;
        beginsElement.textContent = String(snapshot.contactBeginEvents);
        if (host !== null) {
          validationElement.textContent = formatValidation(host.physics.validationLevels);
        }
      },
      onFrame: (report) => {
        droppedTotalMs += report.droppedTimeMs;
        droppedElement.textContent = `${droppedTotalMs.toFixed(2)} ms`;
      },
      onFatalError: (error) => {
        if (generation !== startupGeneration) {
          return;
        }
        const failedHost = host;
        host = null;
        failedHost?.dispose();
        statusElement.textContent = `F3 runtime fault — resources disposed: ${formatError(error)}`;
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
    const receipt = nextHost.receipt;
    const physicsReceipt = nextHost.physics.receipt;
    const version = physicsReceipt.engineVersion;

    nativeSourceElement.textContent = `${receipt.source.commit.slice(0, 8)} · blob verified`;
    configFieldsElement.textContent = `${receipt.serializedFieldCount}/76 JozzFieldDesc fields`;
    wheelElement.textContent = `${receipt.derived.wheelRadius.toFixed(6)} m × ${receipt.derived.wheelWidth.toFixed(6)} m`;
    rackElement.textContent = `${receipt.derived.rackTravel.toFixed(6)} m · dead point ${receipt.derived.steeringDeadPointDegrees.toFixed(2)}°`;
    assistsElement.textContent = "rack centering OFF · upright assist OFF";
    solverElement.textContent = `60 Hz × ${receipt.solver.substeps} · gravity ${receipt.solver.gravity[1]} · CCD OFF`;
    generationElement.textContent = String(generation);
    validationElement.textContent = formatValidation(nextHost.physics.validationLevels);
    statusElement.textContent =
      `Running — ${physicsReceipt.identity.packageName}@${physicsReceipt.identity.packageVersion}, ` +
      `engine ${version.major}.${version.minor}.${version.revision}; native receipt ${receipt.source.commit.slice(0, 8)} verified`;
  } catch (error: unknown) {
    if (generation !== startupGeneration) {
      return;
    }
    statusElement.textContent = `F3 startup rejected: ${formatError(error)}`;
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
