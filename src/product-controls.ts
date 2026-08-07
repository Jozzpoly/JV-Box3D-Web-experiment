import {
  getJvProductViewSettings,
  setJvGridVisible,
  setJvTextureFilter,
  subscribeJvProductViewSettings,
  type JvTextureFilterMode,
} from "./render/jv-product-view-settings.js";

export interface ProductLocationChoice {
  readonly label: string;
  readonly href: string;
  readonly active: boolean;
}

export interface ProductControlCapabilities {
  readonly locationChoices?: readonly ProductLocationChoice[];
  readonly textureFilter: boolean;
  readonly grid: boolean;
}

export interface InstallProductControlsOptions {
  readonly capabilities: ProductControlCapabilities;
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

function choiceStyle(active: boolean): string {
  return [
    "display:block",
    "padding:7px 9px",
    "border:0",
    "border-radius:7px",
    "color:#f4f6fa",
    `background:${active ? "#375f9c" : "rgba(255,255,255,0.08)"}`,
    "font:600 11px/1.2 system-ui,sans-serif",
    "text-decoration:none",
    "white-space:nowrap",
    "cursor:pointer",
  ].join(";");
}

function controlGroup(label: string): HTMLDivElement {
  const group = document.createElement("div");
  group.style.cssText = "display:grid;gap:4px";
  const heading = document.createElement("span");
  heading.textContent = label;
  heading.style.cssText = [
    "color:#8fa1bb",
    "font:700 9px/1.1 system-ui,sans-serif",
    "letter-spacing:.08em",
    "text-transform:uppercase",
  ].join(";");
  group.append(heading);
  return group;
}

export function installProductControls(
  options: InstallProductControlsOptions,
): void {
  const panel = document.querySelector<HTMLElement>(".panel");
  if (panel === null) {
    throw new Error("JV product controls require the mechanics panel.");
  }

  const { capabilities } = options;
  const controls = document.createElement("section");
  controls.setAttribute("aria-label", "JV product view controls");
  controls.style.cssText = [
    "display:flex",
    "flex-wrap:wrap",
    "gap:8px",
    "padding:8px",
    "margin-bottom:10px",
    "border:1px solid rgba(255,255,255,0.12)",
    "border-radius:10px",
    "background:rgba(10,12,16,0.62)",
  ].join(";");

  const locationChoices = capabilities.locationChoices ?? [];
  if (locationChoices.length > 1) {
    const locationGroup = controlGroup("Miejsce startu");
    const locationContainer = document.createElement("div");
    locationContainer.style.cssText = "display:flex;gap:4px";
    for (const choice of locationChoices) {
      const link = document.createElement("a");
      link.href = choice.href;
      link.textContent = choice.label;
      link.style.cssText = choiceStyle(choice.active);
      if (choice.active) {
        link.setAttribute("aria-current", "page");
      }
      locationContainer.append(link);
    }
    locationGroup.append(locationContainer);
    controls.append(locationGroup);
  }

  const textureButtons = new Map<
    JvTextureFilterMode,
    HTMLButtonElement
  >();
  if (capabilities.textureFilter) {
    const textureGroup = controlGroup("Filtrowanie tekstur");
    const textureChoices = document.createElement("div");
    textureChoices.style.cssText = "display:flex;gap:4px";
    const filters: readonly Readonly<{
      id: JvTextureFilterMode;
      label: string;
    }>[] = [
      { id: "nearest", label: "Piksele" },
      { id: "linear", label: "Wygładzanie" },
    ];
    for (const filter of filters) {
      const button = document.createElement("button");
      button.type = "button";
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
  if (capabilities.grid) {
    const viewGroup = controlGroup("Widok diagnostyczny");
    gridButton = document.createElement("button");
    gridButton.type = "button";
    gridButton.addEventListener("click", () => {
      const visible = !getJvProductViewSettings().gridVisible;
      setJvGridVisible(visible);
      rememberGridVisible(visible);
    });
    viewGroup.append(gridButton);
    controls.append(viewGroup);
  }

  const unsubscribe = subscribeJvProductViewSettings((settings) => {
    for (const [mode, button] of textureButtons) {
      const active = mode === settings.textureFilter;
      button.style.cssText = choiceStyle(active);
      button.setAttribute("aria-pressed", String(active));
    }
    if (gridButton !== null) {
      gridButton.textContent = settings.gridVisible
        ? "Grid: włączony"
        : "Grid: wyłączony";
      gridButton.style.cssText = choiceStyle(settings.gridVisible);
      gridButton.setAttribute(
        "aria-pressed",
        String(settings.gridVisible),
      );
    }
  });
  window.addEventListener("pagehide", unsubscribe, { once: true });
  panel.prepend(controls);
}
