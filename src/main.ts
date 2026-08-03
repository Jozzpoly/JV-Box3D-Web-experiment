import "./style.css";
import { CleanBrowserHost } from "./app/clean-browser-host.js";

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
    <h1>Clean Browser Core — F1</h1>
    <p class="status" data-status>Starting…</p>
    <dl>
      <div><dt>Fixed step</dt><dd>60 Hz</dd></div>
      <div><dt>Steering</dt><dd data-command>RELEASE</dd></div>
      <div><dt>Step</dt><dd data-step>0</dd></div>
      <div><dt>Dropped time</dt><dd data-dropped>0.00 ms</dd></div>
    </dl>
    <p class="hint">A / D lub strzałki: semantyczna komenda RATE. Puszczenie klawisza: RELEASE.</p>
    <button type="button" data-restart>Restart host</button>
  </section>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Missing required F1 host element: ${selector}`);
  }
  return element;
}

const statusElement = requireElement<HTMLElement>("[data-status]");
const commandElement = requireElement<HTMLElement>("[data-command]");
const stepElement = requireElement<HTMLElement>("[data-step]");
const droppedElement = requireElement<HTMLElement>("[data-dropped]");
const restartButton = requireElement<HTMLButtonElement>("[data-restart]");

let host: CleanBrowserHost | null = null;

const animationFrames = {
  request: (callback: FrameRequestCallback) => window.requestAnimationFrame(callback),
  cancel: (handle: number) => window.cancelAnimationFrame(handle),
};

function startHost(): void {
  host?.dispose();
  statusElement.textContent = "Running — no Box3D and no startup probes";
  let droppedTotalMs = 0;

  host = CleanBrowserHost.start({
    now: () => performance.now(),
    animationFrames,
    windowTarget: window,
    documentTarget: document,
    isDocumentHidden: () => document.visibilityState === "hidden",
    onStep: (step, input) => {
      stepElement.textContent = String(step.index);
      commandElement.textContent =
        input.command.mode === "RATE"
          ? `RATE ${input.command.value.toFixed(3)}`
          : input.command.mode;
    },
    onFrame: (report) => {
      droppedTotalMs += report.droppedTimeMs;
      droppedElement.textContent = `${droppedTotalMs.toFixed(2)} ms`;
    },
  });
}

restartButton.addEventListener("click", startHost);
window.addEventListener("pagehide", () => host?.dispose(), { once: true });
startHost();
