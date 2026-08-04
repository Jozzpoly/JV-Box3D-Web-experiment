export function requireNonEmptyString(
  value: unknown,
  label: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

export function requireStableIdentifier(
  value: unknown,
  label: string,
): string {
  const identifier = requireNonEmptyString(value, label);
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(identifier)) {
    throw new Error(
      `${label} must be a lowercase stable identifier using '.', '_' or '-' separators.`,
    );
  }
  return identifier;
}

export function requireSha256Hex(value: unknown, label: string): string {
  const hash = requireNonEmptyString(value, label);
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    throw new Error(`${label} must be a lowercase SHA-256 hex string.`);
  }
  return hash;
}

export function requirePositiveInteger(
  value: unknown,
  label: string,
): number {
  if (!Number.isInteger(value) || !(value as number > 0)) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return value as number;
}

export function requireCleanSiteRelativeUrl(
  value: unknown,
  label: string,
): string {
  const url = requireNonEmptyString(value, label);
  if (
    url.startsWith("/") ||
    url.includes("\\") ||
    url.includes("?") ||
    url.includes("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  ) {
    throw new Error(`${label} must be a clean site-relative URL.`);
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    throw new Error(`${label} contains invalid percent encoding.`);
  }
  const segments = decoded.split("/");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`${label} must remain inside its asset package.`);
  }
  return url;
}
