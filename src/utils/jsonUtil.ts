export const parseJson = <T>(value: string | undefined) => {
  try {
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
};
