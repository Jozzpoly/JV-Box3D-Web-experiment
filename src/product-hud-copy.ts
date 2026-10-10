// Player-facing HUD wording. The debug panel keeps the raw engineering
// readouts (mode names, normalized values, metres); the driving HUD shows what
// a player cares about, in the product's language.

export interface HudDriveInput {
  readonly mode: "COAST" | "THROTTLE" | "BRAKE";
  readonly command: Readonly<{ throttle: number; brake: number }>;
}

function percent(value: number): string {
  return `${Math.round(Math.min(1, Math.abs(value)) * 100)}%`;
}

export function formatHudDrive(drive: HudDriveInput): string {
  if (drive.mode === "BRAKE") {
    return `Hamulec ${percent(drive.command.brake)}`;
  }
  if (drive.mode === "THROTTLE") {
    return drive.command.throttle < 0
      ? `Wstecz ${percent(drive.command.throttle)}`
      : `Gaz ${percent(drive.command.throttle)}`;
  }
  return "Luz";
}

/**
 * Steering as the wheels actually point: positive rack = left, negative =
 * right, as a share of full lock. Small offsets read as straight.
 */
export function formatHudSteering(
  rackTranslation: number,
  rackTravel: number,
): string {
  if (!(rackTravel > 0) || !Number.isFinite(rackTranslation)) {
    return "Prosto";
  }
  const share = rackTranslation / rackTravel;
  if (Math.abs(share) < 0.03) {
    return "Prosto";
  }
  return `${share > 0 ? "Lewo" : "Prawo"} ${percent(share)}`;
}
