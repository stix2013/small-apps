import { describe, it, expect } from 'vitest'
import { capitalized } from '../src/capitalized'

describe('capitalized', () => {
  it('should capitalize the first letter of a word', () => {
    expect(capitalized('hello')).toBe('Hello')
  })

  it('should return an empty string if input is empty', () => {
    expect(capitalized('')).toBe('')
  })

  it('should handle single character strings', () => {
    expect(capitalized('a')).toBe('A')
  })

  it('should not change a string that is already capitalized', () => {
    expect(capitalized('World')).toBe('World')
  })

  it('should handle strings with leading/trailing spaces (no trimming)', () => {
    expect(capitalized('  spaced  ')).toBe('  spaced  ') 
  })

  it('should capitalize the first letter of a mixed case string', () => {
    expect(capitalized('mIxEdCaSe')).toBe('MIxEdCaSe')
  })

  it('should handle strings with numbers and symbols', () => {
    expect(capitalized('123hello')).toBe('123hello')
    expect(capitalized('!test')).toBe('!test')
  })
})
