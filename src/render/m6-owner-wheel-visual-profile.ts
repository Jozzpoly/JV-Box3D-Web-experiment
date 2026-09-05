export const M6_OWNER_WHEEL_VISUAL_STOCK_WIDTH_METERS = 0.4375 as const;

export const M6_OWNER_WHEEL_VISUAL_PROFILES = Object.freeze({
  stock: Object.freeze({
    id: "stock",
    widthMeters: M6_OWNER_WHEEL_VISUAL_STOCK_WIDTH_METERS,
  }),
  narrow: Object.freeze({
    id: "narrow",
    widthMeters: 0.36,
  }),
  slim: Object.freeze({
    id: "slim",
    widthMeters: 0.32,
  }),
} as const);

export type M6OwnerWheelVisualProfileId =
  keyof typeof M6_OWNER_WHEEL_VISUAL_PROFILES;

export type M6OwnerWheelVisualProfile = Readonly<{
  id: M6OwnerWheelVisualProfileId;
  widthMeters: number;
  widthScale: number;
}>;

export function resolveM6OwnerWheelVisualProfile(
  search: string,
): M6OwnerWheelVisualProfile {
  const raw = new URLSearchParams(search).get("jvWheelVisual");
  const id: M6OwnerWheelVisualProfileId =
    raw === "narrow" || raw === "slim" || raw === "stock"
      ? raw
      : "stock";
  const definition = M6_OWNER_WHEEL_VISUAL_PROFILES[id];
  return Object.freeze({
    id,
    widthMeters: definition.widthMeters,
    widthScale:
      definition.widthMeters / M6_OWNER_WHEEL_VISUAL_STOCK_WIDTH_METERS,
  });
}
