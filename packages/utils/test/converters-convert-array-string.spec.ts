import { describe, expect, it } from 'vitest'
import { convertArrayString } from '../src/converters/convert-array-string'

describe('convertArrayString', () => {
  it('should return an empty string if data is undefined', () => {
    expect(convertArrayString(undefined)).toBe('')
  })

  it('should return the string itself if data is a string', () => {
    const testString = 'hello world'
    expect(convertArrayString(testString)).toBe(testString)
  })

  it('should return an empty string if data is an empty string', () => {
    expect(convertArrayString('')).toBe('')
  })

  it('should concatenate all strings in an array', () => {
    const testArray = ['hello', ' ', 'world', '!']
    expect(convertArrayString(testArray)).toBe('hello world!')
  })

  it('should return an empty string if data is an empty array', () => {
    const testArray: string[] = []
    expect(convertArrayString(testArray)).toBe('')
  })

  it('should handle an array containing empty strings', () => {
    const testArray = ['', '', '']
    expect(convertArrayString(testArray)).toBe('')
  })

  it('should handle an array with a mix of empty and non-empty strings', () => {
    const testArray = ['hello', '', 'world', '']
    expect(convertArrayString(testArray)).toBe('helloworld')
  })

  it('should handle an array with a single string element', () => {
    const testArray = ['single']
    expect(convertArrayString(testArray)).toBe('single')
  })
})
