import type { Placeholder } from "./types";

export function placeholder(label: string): Placeholder {
  return { kind: "placeholder", label };
}

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { kind?: unknown }).kind === "placeholder" &&
    typeof (value as { label?: unknown }).label === "string"
  );
}

/** Every placeholder label found anywhere inside `value`, in document order. */
export function listPlaceholders(value: unknown): string[] {
  if (isPlaceholder(value)) return [value.label];
  if (Array.isArray(value)) return value.flatMap(listPlaceholders);
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(listPlaceholders);
  }
  return [];
}
