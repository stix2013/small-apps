import { describe, expect, it } from 'vitest'
import { getDateFromFormatted } from '../src/dates' // Assuming index.ts is exported as 'dates'

describe('getDateFromFormatted', () => {
  it('should throw error for undefined formatted string', () => {
    expect(() => getDateFromFormatted(undefined as any)).toThrow('Wrong formatted date')
  })

  it('should throw error for null formatted string', () => {
    expect(() => getDateFromFormatted(null as any)).toThrow('Wrong formatted date')
  })

  it('should throw error for empty formatted string', () => {
    expect(() => getDateFromFormatted('')).toThrow('Wrong formatted date')
  })

  it('should throw error for formatted string with incorrect length', () => {
    expect(() => getDateFromFormatted('20230101')).toThrow('Wrong formatted date') // Too short
    expect(() => getDateFromFormatted('2023010112300000')).toThrow('Wrong formatted date') // Too long
  })

  it('should parse a valid formatted string (CCYYMMDDHHMMSS) to UTC Date if no offset', () => {
    const formatted = '20230825143015'
    const date = getDateFromFormatted(formatted)
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7) // Month is 0-indexed (0-11)
    expect(date.getUTCDate()).toBe(25)
    expect(date.getUTCHours()).toBe(14)
    expect(date.getUTCMinutes()).toBe(30)
    expect(date.getUTCSeconds()).toBe(15)
  })

  it('should parse a valid formatted string with positive timeOffset (e.g., +02:00)', () => {
    const formatted = '20230825143015'
    const timeOffset = 200 // +02:00
    const date = getDateFromFormatted(formatted, timeOffset)
    // Expected UTC: 2023-08-25T12:30:15Z
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7)
    expect(date.getUTCDate()).toBe(25)
    expect(date.getUTCHours()).toBe(12)
    expect(date.getUTCMinutes()).toBe(30)
    expect(date.getUTCSeconds()).toBe(15)
  })
  
  it('should parse a valid formatted string with positive timeOffset with minutes (e.g., +05:30)', () => {
    const formatted = '20230825100000'
    const timeOffset = 530 // +05:30
    const date = getDateFromFormatted(formatted, timeOffset)
    // Expected UTC: 2023-08-25T04:30:00Z
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7)
    expect(date.getUTCDate()).toBe(25)
    expect(date.getUTCHours()).toBe(4)
    expect(date.getUTCMinutes()).toBe(30)
    expect(date.getUTCSeconds()).toBe(0)
  })

  it('should parse a valid formatted string with negative timeOffset (e.g., -03:00)', () => {
    const formatted = '20230825143015'
    const timeOffset = -300 // -03:00
    const date = getDateFromFormatted(formatted, timeOffset)
    // Expected UTC: 2023-08-25T17:30:15Z
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7)
    expect(date.getUTCDate()).toBe(25)
    expect(date.getUTCHours()).toBe(17)
    expect(date.getUTCMinutes()).toBe(30)
    expect(date.getUTCSeconds()).toBe(15)
  })
  
  it('should parse a valid formatted string with negative timeOffset with minutes (e.g., -03:30)', () => {
    const formatted = '20230825100000'
    const timeOffset = -330 // -03:30
    const date = getDateFromFormatted(formatted, timeOffset)
    // Expected UTC: 2023-08-25T13:30:00Z
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7)
    expect(date.getUTCDate()).toBe(25)
    expect(date.getUTCHours()).toBe(13)
    expect(date.getUTCMinutes()).toBe(30)
    expect(date.getUTCSeconds()).toBe(0)
  })

  it('should handle timeOffset 0 (UTC)', () => {
    const formatted = '20230825143015'
    const timeOffset = 0
    const date = getDateFromFormatted(formatted, timeOffset)
    expect(date.getUTCHours()).toBe(14)
  })
  
  it('should correctly format timezone string for single digit positive hours (e.g. +01:00)', () => {
    const formatted = '20240101100000';
    const date = getDateFromFormatted(formatted, 100); // +01:00
    // Expected UTC: 2024-01-01T09:00:00Z
    expect(date.getUTCHours()).toBe(9);
  });

  it('should correctly format timezone string for single digit negative hours (e.g. -01:00)', () => {
    const formatted = '20240101100000';
    const date = getDateFromFormatted(formatted, -100); // -01:00
    // Expected UTC: 2024-01-01T11:00:00Z
    // The original code has a slight bug for negative single digit hours: `-0${hh}` where hh is already negative.
    // So for -100, hh = -1. It becomes `-0-1:00` which is likely not intended.
    // Let's test current behavior. If Date constructor is lenient, it might work.
    // If `-${hh}` was intended, then for -100, hh=-1, it would be `-(-1):00` -> `+1:00`, which is wrong.
    // The logic `timezone = `-0${hh}:${mm}`` for `hh > -10` (e.g. hh=-1) becomes `-0-1:00`.
    // `new Date("2024-01-01T10:00:00.000-0-1:00")` is actually valid and interpreted as `+01:00` by JS Date.
    // So, 10:00 local time with offset -0-1:00 (effectively +01:00) means 09:00 UTC.
    // This is an observation of current behavior, not necessarily desired behavior.
    // With the fix: 10:00 local time with -01:00 offset is 11:00 UTC.
    expect(date.getUTCHours()).toBe(11); 
  });

  it('should correctly format timezone string for double digit negative hours (e.g. -10:00)', () => {
    const formatted = '20240101100000';
    const date = getDateFromFormatted(formatted, -1000); // -10:00
    // Expected UTC: 2024-01-01T20:00:00Z
    // Original code: `-${hh}:${mm}` for hh <= -10. For -1000, hh=-10. Becomes `--10:00` -> `+10:00`
    // `new Date("2024-01-01T10:00:00.000--10:00")` is interpreted as `+10:00` by JS Date.
    // So, 10:00 local time with offset --10:00 (effectively +10:00) means 00:00 UTC.
    // With the fix: 10:00 local time with -10:00 offset is 20:00 UTC.
    expect(date.getUTCHours()).toBe(20); 
  });

  // Test specific components
  it('should parse year, month, day, hour, minute, second correctly (UTC default)', () => {
    const formatted = '20251231235958'
    const date = getDateFromFormatted(formatted)
    expect(date.getUTCFullYear()).toBe(2025)
    expect(date.getUTCMonth()).toBe(11) // December
    expect(date.getUTCDate()).toBe(31)
    expect(date.getUTCHours()).toBe(23)
    expect(date.getUTCMinutes()).toBe(59)
    expect(date.getUTCSeconds()).toBe(58)
  })
})
