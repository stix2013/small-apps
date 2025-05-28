import { describe, expect, it } from 'vitest'
import { legendDescriptionCoverage } from '../src/coverage/legend-description-coverage'
import type { LegendDescription } from '@yellow-mobile/types/app/legend-description'

describe('legendDescriptionCoverage', () => {
  it('should be an array', () => {
    expect(Array.isArray(legendDescriptionCoverage)).toBe(true)
  })

  it('should contain exactly two legend descriptions', () => {
    expect(legendDescriptionCoverage.length).toBe(2)
  })

  it('should have the correct properties and values for the first item', () => {
    const firstItem: LegendDescription = legendDescriptionCoverage[0]
    expect(firstItem.text).toBe('3G / 4G band')
    expect(firstItem.classColor).toBe('coverage-4g')
  })

  it('should have the correct properties and values for the second item', () => {
    const secondItem: LegendDescription = legendDescriptionCoverage[1]
    expect(secondItem.text).toBe('No supported')
    expect(secondItem.classColor).toBe('coverage-none')
  })

  it('each item should conform to LegendDescription type (structure check)', () => {
    for (const item of legendDescriptionCoverage) {
      expect(item).toHaveProperty('text')
      expect(typeof item.text).toBe('string')
      expect(item).toHaveProperty('classColor')
      expect(typeof item.classColor).toBe('string')
    }
  })
})
