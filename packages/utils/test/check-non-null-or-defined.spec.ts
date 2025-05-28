import { describe, expect, it } from 'vitest'
import { checkNonNullOrDefined } from '../src/check-non-null-or-defined'

describe('checkNonNullOrDefined', () => {
  it('should return undefined if value is null', () => {
    expect(checkNonNullOrDefined(null)).toBeUndefined()
  })

  it('should return undefined if value is undefined', () => {
    expect(checkNonNullOrDefined(undefined)).toBeUndefined()
  })

  it('should return the value if it is a non-null string', () => {
    const testString = 'hello'
    expect(checkNonNullOrDefined(testString)).toBe(testString)
  })

  it('should return the value if it is a number (including 0)', () => {
    expect(checkNonNullOrDefined(123)).toBe(123)
    expect(checkNonNullOrDefined(0)).toBe(0)
    expect(checkNonNullOrDefined(-10)).toBe(-10)
  })

  it('should return the value if it is an object', () => {
    const testObject = { a: 1, b: 'test' }
    expect(checkNonNullOrDefined(testObject)).toBe(testObject)
  })

  it('should return the value if it is an array', () => {
    const testArray = [1, 2, 3]
    expect(checkNonNullOrDefined(testArray)).toBe(testArray)
  })

  it('should return the value if it is a boolean', () => {
    expect(checkNonNullOrDefined(true)).toBe(true)
    expect(checkNonNullOrDefined(false)).toBe(false)
  })
})
