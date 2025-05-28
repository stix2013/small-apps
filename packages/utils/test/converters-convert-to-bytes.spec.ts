import { describe, expect, it } from 'vitest'
import { convertToBytes } from '../src/converters/convert-to-bytes'

describe('convertToBytes', () => {
  const K = 1024

  // Test with value as number
  it('should correctly convert Bytes to Bytes (number input)', () => {
    expect(convertToBytes(100, 'Bytes')).toBe(100)
  })

  it('should correctly convert KB to Bytes (number input)', () => {
    expect(convertToBytes(1, 'KB')).toBe(K)
    expect(convertToBytes(2.5, 'KB')).toBe(K * 2.5)
  })

  it('should correctly convert MB to Bytes (number input)', () => {
    expect(convertToBytes(1, 'MB')).toBe(K * K)
  })

  it('should correctly convert GB to Bytes (number input)', () => {
    expect(convertToBytes(1, 'GB')).toBe(K * K * K)
  })

  // Test with value as string
  it('should correctly convert KB to Bytes (string input)', () => {
    expect(convertToBytes('2', 'KB')).toBe(K * 2)
  })

  it('should correctly convert MB to Bytes (string input with decimal)', () => {
    // parseInt will take "2.5" as 2
    expect(convertToBytes('2.5', 'MB')).toBe(K * K * 2) 
  })

  it('should return 0 if value is a non-numeric string', () => {
    expect(convertToBytes('abc', 'KB')).toBe(0)
  })

  it('should return 0 if value is an empty string', () => {
    expect(convertToBytes('', 'KB')).toBe(0)
  })
  
  // Test edge cases
  it('should return 0 if value is negative number', () => {
    expect(convertToBytes(-100, 'KB')).toBe(0)
  })

  it('should default to Bytes if unit is invalid', () => {
    expect(convertToBytes(100, 'InvalidUnit')).toBe(100)
  })
  
  it('should correctly convert 0 value', () => {
    expect(convertToBytes(0, 'KB')).toBe(0)
    expect(convertToBytes('0', 'MB')).toBe(0)
  })

  // Test with custom k
  it('should use custom k value for conversion (k=1000)', () => {
    const kCustom = 1000
    expect(convertToBytes(1, 'KB', kCustom)).toBe(kCustom)
    expect(convertToBytes(1, 'MB', kCustom)).toBe(kCustom * kCustom)
    expect(convertToBytes('2', 'GB', kCustom)).toBe(kCustom * kCustom * kCustom * 2)
  })

  // Test higher units
  it('should correctly convert TB to Bytes', () => {
    expect(convertToBytes(1, 'TB')).toBe(K * K * K * K)
  })

  it('should correctly convert YB to Bytes', () => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const ybIndex = sizes.indexOf('YB')
    expect(convertToBytes(1, 'YB')).toBe(Math.pow(K, ybIndex))
  })
  
  it('should handle string value with leading/trailing spaces if parseInt handles it', () => {
    expect(convertToBytes('  2  ', 'KB')).toBe(K * 2); // parseInt('  2  ') is 2
  });
})
