export type JvTextureFilterMode = "nearest" | "linear";

export interface JvProductViewSettings {
  readonly textureFilter: JvTextureFilterMode;
  readonly gridVisible: boolean;
}

type ViewSettingsListener = (settings: JvProductViewSettings) => void;

export const DEFAULT_JV_PRODUCT_VIEW_SETTINGS: JvProductViewSettings =
  Object.freeze({
    textureFilter: "nearest",
    gridVisible: false,
  });

let currentSettings = DEFAULT_JV_PRODUCT_VIEW_SETTINGS;
const listeners = new Set<ViewSettingsListener>();

export function getJvProductViewSettings(): JvProductViewSettings {
  return currentSettings;
}

export function replaceJvProductViewSettings(
  next: JvProductViewSettings,
): void {
  if (
    next.textureFilter !== "nearest" &&
    next.textureFilter !== "linear"
  ) {
    throw new Error("JV texture filter must be nearest or linear.");
  }
  if (typeof next.gridVisible !== "boolean") {
    throw new Error("JV grid visibility must be boolean.");
  }
  if (
    next.textureFilter === currentSettings.textureFilter &&
    next.gridVisible === currentSettings.gridVisible
  ) {
    return;
  }
  currentSettings = Object.freeze({
    textureFilter: next.textureFilter,
    gridVisible: next.gridVisible,
  });
  for (const listener of [...listeners]) {
    listener(currentSettings);
  }
}

export function setJvTextureFilter(
  textureFilter: JvTextureFilterMode,
): void {
  replaceJvProductViewSettings({
    ...currentSettings,
    textureFilter,
  });
}

export function setJvGridVisible(gridVisible: boolean): void {
  replaceJvProductViewSettings({
    ...currentSettings,
    gridVisible,
  });
}

export function subscribeJvProductViewSettings(
  listener: ViewSettingsListener,
): () => void {
  listeners.add(listener);
  listener(currentSettings);
  return () => {
    listeners.delete(listener);
  };
}
