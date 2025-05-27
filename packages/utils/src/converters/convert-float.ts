export function convertFloat (value: string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  return Number.parseFloat(value)
}

export function convertFloatUndefined (
  value: string | number | null | undefined
): number | undefined {
  if (value === null || value === undefined || value === 0 || value === '0' || value === '0.0') {
    return undefined
  }

  if (typeof value === 'string') {
    return Number.parseFloat(value)
  }

  return value
}
