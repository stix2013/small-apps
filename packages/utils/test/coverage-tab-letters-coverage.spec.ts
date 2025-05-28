import { describe, expect, it } from 'vitest'
import { tabLettersCoverage } from '../src/coverage/tab-letters-coverage'
import type { TabItem } from '@yellow-mobile/types/app/tab'

describe('tabLettersCoverage', () => {
  it('should be an object', () => {
    expect(typeof tabLettersCoverage).toBe('object')
    expect(tabLettersCoverage).not.toBeNull()
  })

  it('should have correct properties for "ad" key', () => {
    const adData = tabLettersCoverage.ad
    expect(adData).toBeDefined()
    expect(adData.id).toBe('ad')
    expect(adData.value).toBe('a-d')
    expect(adData.text).toBe('ABCD')
  })

  it('should have correct properties for "il" key', () => {
    const ilData = tabLettersCoverage.il
    expect(ilData).toBeDefined()
    expect(ilData.id).toBe('il')
    expect(ilData.value).toBe('i-l')
    expect(ilData.text).toBe('IJKL')
  })

  it('should have correct properties for "vz" key', () => {
    const vzData = tabLettersCoverage.vz
    expect(vzData).toBeDefined()
    expect(vzData.id).toBe('vz')
    expect(vzData.value).toBe('v-z')
    expect(vzData.text).toBe('VWXYZ')
  })

  it('should have entries for all expected letter groups', () => {
    const expectedGroups = ['ad', 'eh', 'il', 'mp', 'qu', 'vz']
    for (const code of expectedGroups) {
      expect(tabLettersCoverage).toHaveProperty(code)
    }
    expect(Object.keys(tabLettersCoverage).length).toBe(expectedGroups.length)
  })

  it('each letter group item should have required string properties and correct structure', () => {
    for (const code in tabLettersCoverage) {
      // Use type assertion for safety if TabMap is a Record<string, TabItem>
      const item = tabLettersCoverage[code as keyof typeof tabLettersCoverage] as TabItem
      expect(item).toHaveProperty('id')
      expect(typeof item.id).toBe('string')
      expect(item).toHaveProperty('value')
      expect(typeof item.value).toBe('string')
      expect(item).toHaveProperty('text')
      expect(typeof item.text).toBe('string')
    }
  })
})
