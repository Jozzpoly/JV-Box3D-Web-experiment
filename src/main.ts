import "./style.css";
import { F2ContactHost } from "./app/f2-contact-host.js";
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
    <h1>Typed Box3D Boundary — F2</h1>
    <p class="status" data-status>Loading audited WASM…</p>
    <dl>
      <div><dt>Fixed step</dt><dd>60 Hz × 4 substeps</dd></div>
      <div><dt>Steering input</dt><dd data-command>RELEASE</dd></div>
      <div><dt>Physics step</dt><dd data-step>0</dd></div>
      <div><dt>Sphere Y</dt><dd data-position>3.0000 m</dd></div>
      <div><dt>Contacts</dt><dd data-contacts>0</dd></div>
      <div><dt>Contact begins</dt><dd data-begins>0</dd></div>
      <div><dt>Dropped time</dt><dd data-dropped>0.00 ms</dd></div>
      <div><dt>B0–B5</dt><dd data-validation>PENDING</dd></div>
    </dl>
    <p class="hint">Ten ekran testuje wyłącznie typed WASM boundary i prawdziwy kontakt sfery z płaskim podłożem. Nie zawiera pojazdu ani modelu opony.</p>
    <button type="button" data-restart>Destroy and rebuild world</button>
  </section>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Missing required F2 host element: ${selector}`);
  }
  return element;
}

const statusElement = requireElement<HTMLElement>("[data-status]");
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

let host: F2ContactHost | null = null;
let startupGeneration = 0;

function formatValidation(levels: readonly F2ValidationLevel[]): string {
  return levels.map((level) => `${level.id}:${level.status}`).join(" · ");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function startHost(): Promise<void> {
  const generation = ++startupGeneration;
  restartButton.disabled = true;
  statusElement.textContent = "Loading audited box3d.js@0.0.2…";
  validationElement.textContent = "PENDING";
  host?.dispose();
  host = null;
  let droppedTotalMs = 0;

  try {
    const nextHost = await F2ContactHost.start({
      now: () => performance.now(),
      animationFrames,
      windowTarget: window,
      documentTarget: document,
      isDocumentHidden: () => document.visibilityState === "hidden",
      onPhysicsStep: (step, input, snapshot) => {
        stepElement.textContent = String(step.index);
        commandElement.textContent =
          input.command.mode === "RATE"
            ? `RATE ${input.command.value.toFixed(3)}`
            : input.command.mode;
        positionElement.textContent = `${snapshot.bodyPosition.y.toFixed(4)} m`;
        contactsElement.textContent = `${snapshot.activeContacts} / ${snapshot.activeContactPoints} points`;
        beginsElement.textContent = String(snapshot.contactBeginEvents);
        if (host !== null) {
          validationElement.textContent = formatValidation(host.validationLevels);
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
        host = null;
        statusElement.textContent = `F2 runtime fault — resources disposed: ${formatError(error)}`;
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
    validationElement.textContent = formatValidation(nextHost.validationLevels);
    const version = nextHost.receipt.engineVersion;
    statusElement.textContent =
      `Running — ${nextHost.receipt.identity.packageName}@${nextHost.receipt.identity.packageVersion}, ` +
      `engine ${version.major}.${version.minor}.${version.revision}`;
  } catch (error: unknown) {
    if (generation !== startupGeneration) {
      return;
    }
    statusElement.textContent = `F2 startup failed: ${formatError(error)}`;
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
