export function hexToRgb (hex: string) {
  const colorParts = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)

  if (!colorParts) {
    return undefined
  }

  const [, r, g, b] = colorParts

  return {
    r: Number.parseInt(r, 16),
    g: Number.parseInt(g, 16),
    b: Number.parseInt(b, 16)
  }
}

export const toHex = (c: number) => `0${c.toString(16)}`.slice(-2)

export function rgbToHex (r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function lighten (hex: string, intensity: number) {
  const color = hexToRgb(hex)

  if (color === null || color === undefined) {
    throw new Error('Lighten color empty')
  }

  const r = Math.round(color.r + (255 - color.r) * intensity)
  const g = Math.round(color.g + (255 - color.g) * intensity)
  const b = Math.round(color.b + (255 - color.b) * intensity)

  return rgbToHex(r, g, b)
}

export function darken (hex: string, intensity: number) {
  const color = hexToRgb(hex)

  if (color === null || color === undefined) {
    return ''
  }

  const r = Math.round(color.r * intensity)
  const g = Math.round(color.g * intensity)
  const b = Math.round(color.b * intensity)

  return rgbToHex(r, g, b)
}

export function generateColors (baseColorInput: string) { // Renamed parameter for clarity
  const normalizedBaseColor = `#${baseColorInput.replace(/^#+/, '')}`; // Ensure single # prefix or add if missing

  const colors = {
    500: normalizedBaseColor
  } as Record<number, string>

  const intensityMap = {
    50: 0.95,
    100: 0.9,
    200: 0.75,
    300: 0.6,
    400: 0.3,
    600: 0.9,
    700: 0.75,
    800: 0.6,
    900: 0.49
  } as Record<number, number>

  for (const level of [50, 100, 200, 300, 400]) {
    colors[level] = lighten(normalizedBaseColor, intensityMap[level])
  }

  for (const level of [600, 700, 800, 900]) {
    colors[level] = darken(normalizedBaseColor, intensityMap[level])
  }

  return colors
}
