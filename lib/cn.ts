// Minimal className joiner (avoids pulling in clsx for a prototype).
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
