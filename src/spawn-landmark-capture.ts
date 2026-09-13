export interface SpawnLandmarkPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

const POSITION_PATTERN =
  /^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*m\s*$/;

export function parseSpawnLandmarkPosition(
  value: string,
): SpawnLandmarkPoint | null {
  const match = POSITION_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const point = {
    x: Number(match[1]),
    y: Number(match[2]),
    z: Number(match[3]),
  };
  return Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.z)
    ? point
    : null;
}

export function formatSpawnLandmarkToken(point: SpawnLandmarkPoint): string {
  return `JV_SCAN_LANDMARK x=${point.x.toFixed(4)} z=${point.z.toFixed(4)} chassisY=${point.y.toFixed(4)}`;
}

export function formatCustomSpawnUrl(
  point: SpawnLandmarkPoint,
  baseHref: string,
): string {
  const url = new URL(baseHref);
  url.searchParams.set("jvSpawn", "scan-custom");
  url.searchParams.set("jvSpawnX", point.x.toFixed(4));
  url.searchParams.set("jvSpawnZ", point.z.toFixed(4));
  return url.href;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Spawn landmark capture requires ${selector}.`);
  }
  return element;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function readFreshChassisPosition(): Promise<SpawnLandmarkPoint> {
  const debugPanel = requireElement<HTMLElement>("[data-debug-panel]");
  const stepElement = requireElement<HTMLElement>("[data-step]");
  const positionElement = requireElement<HTMLElement>("[data-chassis-position]");
  const wasOpen = debugPanel.hasAttribute("data-open");
  const previousVisibility = debugPanel.style.visibility;
  const initialStep = stepElement.textContent;

  if (!wasOpen) {
    debugPanel.style.visibility = "hidden";
    debugPanel.setAttribute("data-open", "");
  }

  try {
    for (let frame = 0; frame < 12; frame += 1) {
      await nextAnimationFrame();
      if (stepElement.textContent === initialStep) {
        continue;
      }
      const point = parseSpawnLandmarkPosition(positionElement.textContent ?? "");
      if (point !== null) {
        return point;
      }
    }
    throw new Error("Brak świeżej pozycji pojazdu. Spróbuj ponownie podczas aktywnej jazdy.");
  } finally {
    if (!wasOpen) {
      debugPanel.removeAttribute("data-open");
      debugPanel.style.visibility = previousVisibility;
    }
  }
}

async function tryCopy(text: string): Promise<boolean> {
  const clipboard = navigator.clipboard;
  if (clipboard === undefined || typeof clipboard.writeText !== "function") {
    return false;
  }
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function installSpawnLandmarkCapture(enabled: boolean): void {
  if (!enabled) {
    return;
  }

  const locationGroup = requireElement<HTMLElement>(
    ".product-control-group:first-child",
  );
  const locationRow = requireElement<HTMLElement>(
    ".product-control-group:first-child .product-choice-row",
  );
  if (locationRow.querySelector("[data-spawn-landmark-capture]") !== null) {
    throw new Error("Spawn landmark capture was installed more than once.");
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "product-choice spawn-landmark-capture-button";
  button.setAttribute("data-spawn-landmark-capture", "");
  button.title = "Utwórz link startujący z aktualnego miejsca";
  button.textContent = "Zapisz start";

  const output = document.createElement("small");
  output.className = "spawn-landmark-capture-output";
  output.setAttribute("role", "status");
  output.hidden = true;

  let pendingCopyUrl: string | null = null;

  button.addEventListener("click", async (event) => {
    event.stopPropagation();

    if (pendingCopyUrl !== null) {
      const url = pendingCopyUrl;
      pendingCopyUrl = null;
      button.textContent = "Zapisz start";
      const copied = await tryCopy(url);
      output.hidden = false;
      output.textContent = copied
        ? "Skopiowano link startowy."
        : `Kopiowanie niedostępne · ${url}`;
      return;
    }

    button.disabled = true;
    output.hidden = false;
    output.textContent = "Odczyt pozycji…";
    try {
      const point = await readFreshChassisPosition();
      const url = formatCustomSpawnUrl(point, window.location.href);
      const copied = await tryCopy(url);
      if (copied) {
        output.textContent =
          `Skopiowano start · x=${point.x.toFixed(2)} z=${point.z.toFixed(2)}`;
      } else {
        pendingCopyUrl = url;
        button.textContent = "Kopiuj link";
        output.textContent = `Start · ${url}`;
      }
    } catch (error: unknown) {
      output.textContent = error instanceof Error
        ? error.message
        : String(error);
    } finally {
      button.disabled = false;
    }
  });

  locationRow.append(button);
  locationGroup.append(output);
}
