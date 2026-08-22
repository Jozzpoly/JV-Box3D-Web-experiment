import type { PointerSteeringInteraction } from "./input/pointer-steering-joystick-adapter.js";
import {
  getJvProductViewSettings,
  setJvGridVisible,
  setJvSteeringPlateVisible,
  setJvTextureFilter,
  subscribeJvProductViewSettings,
  type JvTextureFilterMode,
} from "./render/jv-product-view-settings.js";

export interface ProductLocationChoice {
  readonly label: string;
  readonly href: string;
  readonly active: boolean;
  readonly availabilityProbeUrl?: string;
  readonly unavailableMessage?: string;
}

export interface ProductControlCapabilities {
  readonly locationChoices?: readonly ProductLocationChoice[];
  readonly textureFilter: boolean;
  readonly grid: boolean;
  readonly steeringPlate?: boolean;
  readonly fullscreen?: boolean;
}

export type ProductSteeringInteraction = Extract<
  PointerSteeringInteraction,
  "DIRECT_ROTATION" | "RELATIVE_X"
>;

export interface ProductSteeringInteractionControls {
  readonly get: () => ProductSteeringInteraction;
  readonly set: (interaction: ProductSteeringInteraction) => void;
}

export interface InstallProductControlsOptions {
  readonly capabilities: ProductControlCapabilities;
  readonly steeringInteraction?: ProductSteeringInteractionControls;
}

function rememberTextureFilter(mode: JvTextureFilterMode): void {
  const url = new URL(window.location.href);
  if (mode === "nearest") {
    url.searchParams.delete("jvTextureFilter");
  } else {
    url.searchParams.set("jvTextureFilter", mode);
  }
  window.history.replaceState(null, "", url.href);
}

function rememberGridVisible(visible: boolean): void {
  const url = new URL(window.location.href);
  if (visible) {
    url.searchParams.set("jvGrid", "1");
  } else {
    url.searchParams.delete("jvGrid");
  }
  window.history.replaceState(null, "", url.href);
}

function rememberSteeringPlateVisible(visible: boolean): void {
  const url = new URL(window.location.href);
  if (visible) {
    url.searchParams.set("jvSteeringPlate", "1");
  } else {
    url.searchParams.delete("jvSteeringPlate");
  }
  window.history.replaceState(null, "", url.href);
}

function controlGroup(label: string): HTMLDivElement {
  const group = document.createElement("div");
  group.className = "product-control-group";
  const heading = document.createElement("span");
  heading.className = "product-control-label";
  heading.textContent = label;
  group.append(heading);
  return group;
}

function setChoiceActive(
  element: HTMLAnchorElement | HTMLButtonElement,
  active: boolean,
): void {
  element.classList.toggle("is-active", active);
  element.setAttribute("aria-pressed", String(active));
}

function isAvailableScanIndex(value: unknown): boolean {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>)["available"] === true;
}

function fullscreenAvailable(): boolean {
  return document.fullscreenEnabled === true &&
    typeof document.documentElement.requestFullscreen === "function" &&
    typeof document.exitFullscreen === "function";
}

export function installProductControls(
  options: InstallProductControlsOptions,
): void {
  const mount =
    document.querySelector<HTMLElement>("[data-product-controls]") ??
    document.querySelector<HTMLElement>(".panel");
  if (mount === null) {
    throw new Error("JV product controls require a product toolbar or mechanics panel.");
  }

  const { capabilities } = options;
  const controls = document.createElement("section");
  controls.className = "product-controls";
  controls.setAttribute("aria-label", "JV product controls");

  const notice = document.createElement("p");
  notice.className = "product-control-notice";
  notice.setAttribute("role", "status");
  notice.hidden = true;

  const locationChoices = capabilities.locationChoices ?? [];
  if (locationChoices.length > 1) {
    const locationGroup = controlGroup("Miejsce startu");
    const locationContainer = document.createElement("div");
    locationContainer.className = "product-choice-row";
    for (const choice of locationChoices) {
      const link = document.createElement("a");
      link.href = choice.href;
      link.textContent = choice.label;
      link.className = "product-choice";
      link.classList.toggle("is-active", choice.active);
      if (choice.active) {
        link.setAttribute("aria-current", "page");
      }
      if (!choice.active && choice.availabilityProbeUrl !== undefined) {
        link.addEventListener("click", async (event) => {
          event.preventDefault();
          if (link.getAttribute("aria-busy") === "true") {
            return;
          }
          link.setAttribute("aria-busy", "true");
          notice.hidden = true;
          try {
            const response = await fetch(choice.availabilityProbeUrl!, {
              cache: "no-store",
            });
            const contentType = response.headers.get("content-type") ?? "";
            const available =
              response.ok &&
              contentType.toLowerCase().includes("application/json") &&
              isAvailableScanIndex(await response.json());
            if (available) {
              window.location.assign(choice.href);
              return;
            }
          } catch {
            // Optional local capability: surface a product-level message only.
          } finally {
            link.removeAttribute("aria-busy");
          }
          notice.textContent =
            choice.unavailableMessage ??
            "Ta lokalizacja jest niedostępna w tym buildzie.";
          notice.hidden = false;
        });
      }
      locationContainer.append(link);
    }
    locationGroup.append(locationContainer);
    controls.append(locationGroup);
  }

  const textureButtons = new Map<JvTextureFilterMode, HTMLButtonElement>();
  if (capabilities.textureFilter) {
    const textureGroup = controlGroup("Tekstury");
    const textureChoices = document.createElement("div");
    textureChoices.className = "product-choice-row";
    const filters: readonly Readonly<{
      id: JvTextureFilterMode;
      label: string;
    }>[] = [
      { id: "nearest", label: "Pixel" },
      { id: "linear", label: "Smooth" },
    ];
    for (const filter of filters) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "product-choice";
      button.textContent = filter.label;
      button.addEventListener("click", () => {
        setJvTextureFilter(filter.id);
        rememberTextureFilter(filter.id);
      });
      textureButtons.set(filter.id, button);
      textureChoices.append(button);
    }
    textureGroup.append(textureChoices);
    controls.append(textureGroup);
  }

  let gridButton: HTMLButtonElement | null = null;
  let steeringPlateButton: HTMLButtonElement | null = null;
  if (capabilities.grid || capabilities.steeringPlate === true) {
    const viewGroup = controlGroup("Widok");
    const viewChoices = document.createElement("div");
    viewChoices.className = "product-choice-row";

    if (capabilities.grid) {
      gridButton = document.createElement("button");
      gridButton.type = "button";
      gridButton.className = "product-choice";
      gridButton.addEventListener("click", () => {
        const visible = !getJvProductViewSettings().gridVisible;
        setJvGridVisible(visible);
        rememberGridVisible(visible);
      });
      viewChoices.append(gridButton);
    }

    if (capabilities.steeringPlate === true) {
      steeringPlateButton = document.createElement("button");
      steeringPlateButton.type = "button";
      steeringPlateButton.className = "product-choice";
      steeringPlateButton.addEventListener("click", () => {
        const visible = !getJvProductViewSettings().steeringPlateVisible;
        setJvSteeringPlateVisible(visible);
        rememberSteeringPlateVisible(visible);
      });
      viewChoices.append(steeringPlateButton);
    }

    viewGroup.append(viewChoices);
    controls.append(viewGroup);
  }

  const steeringButtons = new Map<
    ProductSteeringInteraction,
    HTMLButtonElement
  >();
  const steeringInteraction = options.steeringInteraction;
  const syncSteeringButtons = (): void => {
    if (steeringInteraction === undefined) {
      return;
    }
    const active = steeringInteraction.get();
    for (const [mode, button] of steeringButtons) {
      setChoiceActive(button, mode === active);
    }
  };
  if (steeringInteraction !== undefined) {
    const steeringGroup = controlGroup("Kierownica");
    const steeringChoices = document.createElement("div");
    steeringChoices.className = "product-choice-row";
    const interactions: readonly Readonly<{
      id: ProductSteeringInteraction;
      label: string;
    }>[] = [
      { id: "DIRECT_ROTATION", label: "Obrót" },
      { id: "RELATIVE_X", label: "Przeciąganie" },
    ];
    for (const interaction of interactions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "product-choice";
      button.textContent = interaction.label;
      button.addEventListener("click", () => {
        steeringInteraction.set(interaction.id);
        syncSteeringButtons();
      });
      steeringButtons.set(interaction.id, button);
      steeringChoices.append(button);
    }
    steeringGroup.append(steeringChoices);
    controls.append(steeringGroup);
    syncSteeringButtons();
  }

  let fullscreenButton: HTMLButtonElement | null = null;
  let syncFullscreenButton: (() => void) | null = null;
  if (capabilities.fullscreen === true && fullscreenAvailable()) {
    fullscreenButton = document.createElement("button");
    fullscreenButton.type = "button";
    fullscreenButton.className = "product-choice";
    fullscreenButton.setAttribute("aria-label", "Przełącz pełny ekran");
    syncFullscreenButton = () => {
      const active = document.fullscreenElement !== null;
      fullscreenButton!.textContent = active
        ? "Wyjdź z pełnego"
        : "Pełny ekran";
      setChoiceActive(fullscreenButton!, active);
    };
    fullscreenButton.addEventListener("click", async () => {
      fullscreenButton!.disabled = true;
      notice.hidden = true;
      try {
        if (document.fullscreenElement === null) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch {
        notice.textContent =
          "Pełny ekran jest niedostępny w tej przeglądarce lub kontekście.";
        notice.hidden = false;
      } finally {
        fullscreenButton!.disabled = false;
        syncFullscreenButton!();
      }
    });
    document.addEventListener("fullscreenchange", syncFullscreenButton);
    syncFullscreenButton();
    controls.append(fullscreenButton);
  }

  controls.append(notice);
  mount.append(controls);

  const unsubscribe = subscribeJvProductViewSettings((settings) => {
    for (const [mode, button] of textureButtons) {
      setChoiceActive(button, mode === settings.textureFilter);
    }
    if (gridButton !== null) {
      gridButton.textContent = settings.gridVisible ? "Grid ON" : "Grid OFF";
      setChoiceActive(gridButton, settings.gridVisible);
    }
    if (steeringPlateButton !== null) {
      steeringPlateButton.textContent = settings.steeringPlateVisible
        ? "Tło kier. ON"
        : "Tło kier. OFF";
      setChoiceActive(steeringPlateButton, settings.steeringPlateVisible);
    }
  });
  window.addEventListener(
    "pagehide",
    () => {
      unsubscribe();
      if (syncFullscreenButton !== null) {
        document.removeEventListener("fullscreenchange", syncFullscreenButton);
      }
    },
    { once: true },
  );
}
