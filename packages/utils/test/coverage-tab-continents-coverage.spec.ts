import { describe, it, expect } from 'vitest'
import { tabContinentsCoverage } from '../src/coverage/tab-continents-coverage'
import type { TabContinentItem } from "@yellow-mobile/types/pages/coverage"


describe('tabContinentsCoverage', () => {
  it('should be an object', () => {
    expect(typeof tabContinentsCoverage).toBe('object')
    expect(tabContinentsCoverage).not.toBeNull()
  })

  it('should have correct properties for Africa (AF)', () => {
    const afData = tabContinentsCoverage.AF
    expect(afData).toBeDefined()
    expect(afData.id).toBe('af')
    expect(afData.value).toBe('AF')
    expect(afData.text).toBe('Africa')
    expect(afData.region).toBe('002')
    expect(afData.scale).toBeUndefined() // Or check for a default if applicable
  })

  it('should have correct properties for Europe (EU)', () => {
    const euData = tabContinentsCoverage.EU
    expect(euData).toBeDefined()
    expect(euData.id).toBe('eu')
    expect(euData.value).toBe('EU')
    expect(euData.text).toBe('Europe')
    expect(euData.region).toBe('150')
    expect(euData.scale).toBeUndefined()
  })

  it('should have correct properties for North America (NA), including scale', () => {
    const naData = tabContinentsCoverage.NA
    expect(naData).toBeDefined()
    expect(naData.id).toBe('na')
    expect(naData.value).toBe('NA')
    expect(naData.text).toBe('North America')
    expect(naData.region).toBe('019')
    expect(naData.scale).toBe('2x')
  })

  it('should have entries for all expected continents', () => {
    const expectedContinents = ['AF', 'AS', 'EU', 'NA', 'OC', 'SA']
    for (const code of expectedContinents) {
      expect(tabContinentsCoverage).toHaveProperty(code)
    }
    expect(Object.keys(tabContinentsCoverage).length).toBe(expectedContinents.length)
  })

  it('each continent item should have required string properties and correct structure', () => {
    for (const code in tabContinentsCoverage) {
      const item = tabContinentsCoverage[code as keyof typeof tabContinentsCoverage] as TabContinentItem<string>
      expect(item).toHaveProperty('id')
      expect(typeof item.id).toBe('string')
      expect(item).toHaveProperty('value')
      expect(typeof item.value).toBe('string')
      expect(item).toHaveProperty('text')
      expect(typeof item.text).toBe('string')
      expect(item).toHaveProperty('region')
      expect(typeof item.region).toBe('string')
      // Scale is optional
      if (item.scale !== undefined) {
        expect(typeof item.scale).toBe('string')
      }
    }
  })
})
