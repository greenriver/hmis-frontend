// Attempt to parse the string into a number
export function parseNumber(str: number | string): number | undefined {
  const num = Number(str);

  if (isNaN(num)) return undefined;
  if (isFinite(num)) return num;
}
