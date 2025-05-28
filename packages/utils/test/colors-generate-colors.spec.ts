import { describe, expect, it, vi } from 'vitest'
import {
  darken,
  generateColors,
  hexToRgb,
  lighten,
  rgbToHex,
  toHex
} from '../src/colors/generate-colors'

describe('hexToRgb', () => {
  it('should convert hex with # to RGB object', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('should convert hex without # to RGB object', () => {
    expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('should be case-insensitive', () => {
    expect(hexToRgb('#fF00aa')).toEqual({ r: 255, g: 0, b: 170 })
  })

  it('should return undefined for invalid hex (too short)', () => {
    expect(hexToRgb('#F00')).toBeUndefined()
    expect(hexToRgb('F00')).toBeUndefined()
  })

  it('should return undefined for invalid hex (too long)', () => {
    expect(hexToRgb('#FF00000')).toBeUndefined()
  })

  it('should return undefined for invalid hex (non-hex characters)', () => {
    expect(hexToRgb('#GGHHII')).toBeUndefined()
  })

  it('should return undefined for empty string', () => {
    expect(hexToRgb('')).toBeUndefined()
  })
})

describe('toHex', () => {
  it('should convert 0 to "00"', () => {
    expect(toHex(0)).toBe('00')
  })

  it('should convert 15 to "0f"', () => {
    expect(toHex(15)).toBe('0f')
  })

  it('should convert 16 to "10"', () => {
    expect(toHex(16)).toBe('10')
  })

  it('should convert 255 to "ff"', () => {
    expect(toHex(255)).toBe('ff')
  })
})

describe('rgbToHex', () => {
  it('should convert RGB (255, 0, 0) to #ff0000', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
  })

  it('should convert RGB (0, 255, 0) to #00ff00', () => {
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
  })

  it('should convert RGB (0, 0, 255) to #0000ff', () => {
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
  })

  it('should convert RGB (128, 128, 128) to #808080', () => {
    expect(rgbToHex(128, 128, 128)).toBe('#808080')
  })
})

describe('lighten', () => {
  it('should lighten a hex color by intensity', () => {
    expect(lighten('#808080', 0.5)).toBe('#c0c0c0') // (128 + (255-128)*0.5) = 191.5 -> 192 -> c0
  })

  it('should return white (#ffffff) if intensity is 1', () => {
    expect(lighten('#FF0000', 1)).toBe('#ffffff')
  })

  it('should return the same color if intensity is 0', () => {
    expect(lighten('#00FF00', 0)).toBe('#00ff00')
  })

  it('should throw error for invalid hex string', () => {
    expect(() => lighten('invalid', 0.5)).toThrow('Lighten color empty')
  })
})

describe('darken', () => {
  it('should darken a hex color by intensity', () => {
    // darken #808080 (128,128,128) with intensity 0.5 -> (128*0.5) = 64 -> #404040
    expect(darken('#808080', 0.5)).toBe('#404040')
  })

  it('should return black (#000000) if intensity is 0', () => {
    // darken #FF0000 with intensity 0 -> (255*0, 0*0, 0*0) = (0,0,0) -> #000000
    expect(darken('#FF0000', 0)).toBe('#000000')
  })

  it('should return the same color if intensity is 1 (or close due to rounding)', () => {
     // Intensity 1 means color.r * 1, color.g * 1, color.b * 1
    expect(darken('#00FF00', 1)).toBe('#00ff00')
  })
  
  it('should return an empty string for invalid hex string', () => {
    expect(darken('invalid', 0.5)).toBe('')
  })
})

describe('generateColors', () => {
  const baseColorHex = '1a2b3c' // A dark color for better visibility of lightening/darkening
  const baseColorWithHash = `#${baseColorHex}`

  it('should generate a map of 10 color levels', () => { // Updated count from 9 to 10
    const colors = generateColors(baseColorHex)
    expect(Object.keys(colors).length).toBe(10) // Updated count
    expect(colors[500]).toBe(baseColorWithHash)
    // The loop for checking levels should ideally also include 500 if it's counted in the 10.
    // The original test had 500 in the loop.
    for (const level of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      expect(colors).toHaveProperty(String(level))
      expect(colors[level]).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('should correctly set colors[500] even if baseColor has ##', () => {
    const colors = generateColors(`##${baseColorHex}`)
    expect(colors[500]).toBe(baseColorWithHash)
  })

  it('should lighten colors for levels 50-400', () => {
    const colors = generateColors(baseColorHex)
    const baseRgb = hexToRgb(colors[500])!
    // Levels 50-400 should be lighter than 500
    for (const level of [50, 100, 200, 300, 400]) {
      const levelRgb = hexToRgb(colors[level])!
      // Check if at least one component is greater (simplified check for lightness)
      expect(levelRgb.r >= baseRgb.r || levelRgb.g >= baseRgb.g || levelRgb.b >= baseRgb.b).toBe(true)
      // A more robust check might be luminance, but this is a basic check
      if (colors[level] !== colors[500]) { // if not identical (intensity 0)
         expect(levelRgb.r > baseRgb.r || levelRgb.g > baseRgb.g || levelRgb.b > baseRgb.b || (levelRgb.r === baseRgb.r && levelRgb.g === baseRgb.g && levelRgb.b === baseRgb.b && level !== 500 )).toBe(true);
      }
    }
  })

  it('should darken colors for levels 600-900', () => {
    const colors = generateColors(baseColorHex)
    const baseRgb = hexToRgb(colors[500])!
    // Levels 600-900 should be darker than 500
    for (const level of [600, 700, 800, 900]) {
      const levelRgb = hexToRgb(colors[level])!
      expect(levelRgb.r <= baseRgb.r || levelRgb.g <= baseRgb.g || levelRgb.b <= baseRgb.b).toBe(true)
       if (colors[level] !== colors[500]) { // if not identical (intensity 1)
         expect(levelRgb.r < baseRgb.r || levelRgb.g < baseRgb.g || levelRgb.b < baseRgb.b || (levelRgb.r === baseRgb.r && levelRgb.g === baseRgb.g && levelRgb.b === baseRgb.b && level !== 500 )).toBe(true);
      }
    }
  })
  
  it('should handle invalid baseColor for generateColors (lighten throws, darken returns empty)', () => {
    // lighten will throw, darken will produce empty strings.
    // The current implementation of generateColors does not catch these errors.
    // So, lighten will throw and stop execution.
    expect(() => generateColors('invalid')).toThrow('Lighten color empty');

    // If lighten didn't throw, and darken returned empty string:
    // const colors = generateColors('invalid');
    // expect(colors[600]).toBe(''); // Example if darken was reached
  });
})
