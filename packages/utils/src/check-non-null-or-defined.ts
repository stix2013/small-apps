export function checkNonNullOrDefined<T> (
  value: T | null | undefined
): T | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  return value
}
