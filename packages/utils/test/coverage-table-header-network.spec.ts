import { describe, it, expect } from 'vitest'
import { tableHeaderNetwork } from '../src/coverage/table-header-network'
import type { CoverageNetworkHeaderItem } from '@yellow-mobile/types/pages/coverage'

describe('tableHeaderNetwork', () => {
  it('should be an object', () => {
    expect(typeof tableHeaderNetwork).toBe('object')
    expect(tableHeaderNetwork).not.toBeNull()
  })

  it('should have correct properties for "01" key (Country)', () => {
    const header01 = tableHeaderNetwork['01']
    expect(header01).toBeDefined()
    expect(header01.id).toBe(1)
    expect(header01.title).toBe('Country')
    expect(header01.width).toBe('large')
    expect(header01.align).toBe('left')
  })

  it('should have correct properties for "03" key (Country Zone)', () => {
    const header03 = tableHeaderNetwork['03']
    expect(header03).toBeDefined()
    expect(header03.id).toBe(3)
    expect(header03.title).toBe('Country Zone')
    expect(header03.width).toBe('mid')
    expect(header03.align).toBe('left')
  })

  it('should have correct properties for "05" key (Network Coverage)', () => {
    const header05 = tableHeaderNetwork['05']
    expect(header05).toBeDefined()
    expect(header05.id).toBe(5)
    expect(header05.title).toBe('Network Coverage')
    expect(header05.width).toBe('large')
    expect(header05.align).toBe('center')
  })

  it('should have entries for all expected header keys', () => {
    const expectedKeys = ['01', '02', '03', '04', '05']
    for (const code of expectedKeys) {
      expect(tableHeaderNetwork).toHaveProperty(code)
    }
    expect(Object.keys(tableHeaderNetwork).length).toBe(expectedKeys.length)
  })

  it('each header item should have required properties and correct types', () => {
    for (const code in tableHeaderNetwork) {
      const item = tableHeaderNetwork[code as keyof typeof tableHeaderNetwork] as CoverageNetworkHeaderItem
      expect(item).toHaveProperty('id')
      expect(typeof item.id).toBe('number')
      expect(item).toHaveProperty('title')
      expect(typeof item.title).toBe('string')
      expect(item).toHaveProperty('width')
      expect(typeof item.width).toBe('string')
      expect(['small', 'mid', 'large'].includes(item.width)).toBe(true) // Validate width enum
      expect(item).toHaveProperty('align')
      expect(typeof item.align).toBe('string')
      expect(['left', 'center', 'right'].includes(item.align)).toBe(true) // Validate align enum
    }
  })
})
