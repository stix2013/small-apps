import { describe, it, expect } from 'vitest'
import { convertFloat, convertFloatUndefined } from '../src/converters/convert-float'

describe('convertFloat', () => {
  it('should return 0 if value is null', () => {
    expect(convertFloat(null)).toBe(0)
  })

  it('should return 0 if value is undefined', () => {
    expect(convertFloat(undefined)).toBe(0)
  })

  it('should parse a valid float string', () => {
    expect(convertFloat('123.45')).toBe(123.45)
  })

  it('should parse a valid integer string', () => {
    expect(convertFloat('123')).toBe(123)
  })

  it('should parse "0" string to 0', () => {
    expect(convertFloat('0')).toBe(0)
  })

  it('should parse "0.0" string to 0', () => {
    expect(convertFloat('0.0')).toBe(0)
  })

  it('should parse a negative float string', () => {
    expect(convertFloat('-10.5')).toBe(-10.5)
  })

  it('should return NaN for non-numeric strings', () => {
    expect(convertFloat('abc')).toBeNaN()
  })

  it('should return NaN for an empty string', () => {
    expect(convertFloat('')).toBeNaN()
  })
})

describe('convertFloatUndefined', () => {
  it('should return undefined if value is null', () => {
    expect(convertFloatUndefined(null)).toBeUndefined()
  })

  it('should return undefined if value is undefined', () => {
    expect(convertFloatUndefined(undefined)).toBeUndefined()
  })

  it('should return undefined if value is number 0', () => {
    expect(convertFloatUndefined(0)).toBeUndefined()
  })

  it('should return undefined if value is string "0.0"', () => {
    expect(convertFloatUndefined('0.0')).toBeUndefined()
  })

  it('should parse a valid float string to number', () => {
    expect(convertFloatUndefined('123.45')).toBe(123.45)
  })

  it('should parse a valid integer string to number', () => {
    expect(convertFloatUndefined('123')).toBe(123)
  })

  it('should parse a negative float string to number', () => {
    expect(convertFloatUndefined('-10.5')).toBe(-10.5)
  })
  
  it('should return undefined if value is string "0"', () => {
    // parseFloat("0") is 0, which then leads to undefined
    expect(convertFloatUndefined('0')).toBeUndefined()
  })

  it('should return the number if value is a non-zero number', () => {
    expect(convertFloatUndefined(123.45)).toBe(123.45)
    expect(convertFloatUndefined(-10.5)).toBe(-10.5)
    expect(convertFloatUndefined(100)).toBe(100)
  })

  it('should return NaN for non-numeric strings (that are not "0.0")', () => {
    expect(convertFloatUndefined('abc')).toBeNaN()
  })

  it('should return NaN for an empty string', () => {
    expect(convertFloatUndefined('')).toBeNaN()
  })
})
