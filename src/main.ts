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
      </div>

      <div class="scene-help">
        <span>W/S · gaz/reverse</span>
        <span>A/D · skręt</span>
        <span>Space · hamulec</span>
        <span>C · kamera</span>
        <span>R · reset</span>
      </div>

      <div class="mobile-controls" aria-label="Mobile driving controls">
        <div class="mobile-steering-controls" aria-label="Steering controls">
          <button
            type="button"
            class="mobile-steering-joystick mobile-control"
            data-steering-joystick
            role="slider"
            aria-label="Steering"
            aria-valuemin="-1"
            aria-valuemax="1"
            aria-valuenow="0"
            aria-valuetext="Center"
          >
            <span class="mobile-steering-wheel-stage" aria-hidden="true">
              <span class="mobile-steering-wheel">
                <span class="mobile-steering-wheel-rotor">
                  <span class="mobile-steering-wheel-rim"></span>
                  <span class="mobile-steering-wheel-spoke mobile-steering-wheel-spoke-a"></span>
                  <span class="mobile-steering-wheel-spoke mobile-steering-wheel-spoke-b"></span>
                  <span class="mobile-steering-wheel-spoke mobile-steering-wheel-spoke-c"></span>
                  <span class="mobile-steering-wheel-hub"></span>
                  <span class="mobile-steering-wheel-marker"></span>
                </span>
              </span>
            </span>
            <small>STEER</small>
          </button>
        </div>

        <div class="mobile-drive-controls" aria-label="Pedal controls">
          <button
            type="button"
            class="mobile-pedal mobile-pedal-brake mobile-control"
            data-analog-pedal="BRAKE"
            role="slider"
            aria-label="Brake pedal"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            aria-valuetext="0%"
          >
            <span class="mobile-pedal-mechanism" aria-hidden="true">
              <span class="mobile-pedal-arm"></span>
              <span class="mobile-pedal-face"><span>BRAKE</span></span>
              <span class="mobile-pedal-well"><span class="mobile-pedal-fill"></span></span>
            </span>
            <small>BRAKE</small>
          </button>

          <button
            type="button"
            class="mobile-pedal mobile-pedal-throttle mobile-control"
            data-analog-pedal="THROTTLE"
            role="slider"
            aria-label="Throttle pedal"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            aria-valuetext="0%"
          >
            <span class="mobile-pedal-mechanism" aria-hidden="true">
              <span class="mobile-pedal-arm"></span>
              <span class="mobile-pedal-face"><span>THROTTLE</span></span>
              <span class="mobile-pedal-well"><span class="mobile-pedal-fill"></span></span>
            </span>
            <small>THROTTLE</small>
          </button>

          <button
            type="button"
            class="mobile-drive-direction mobile-control"
            data-drive-direction="D"
            aria-label="Drive direction D. Tap to select reverse"
            aria-pressed="false"
          >
            <span class="mobile-drive-direction-track" aria-hidden="true">
              <span class="mobile-drive-direction-label">D</span>
              <span class="mobile-drive-direction-label">R</span>
              <span class="mobile-drive-direction-lever"></span>
            </span>
            <small>D / R</small>
          </button>
        </div>
      </div>

      <section class="panel" data-debug-panel aria-label="JV debug diagnostics">
        <div class="panel-head">
          <div>
            <p class="eyebrow">JV DEBUG</p>
            <h2>Runtime</h2>
          </div>
          <button type="button" class="panel-close" data-debug-close>Close</button>
        </div>
        <div class="panel-body">
          <pre data-debug-output>Debug disabled.</pre>
        </div>
      </section>
    </section>
  </main>
`;

// The remainder of this file is unchanged from the previous revision.
// GitHub's contents API requires complete-file replacement; keep the original runtime
// below this marker when applying this change in source.
