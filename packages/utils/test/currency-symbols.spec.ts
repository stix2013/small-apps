import { describe, it, expect } from 'vitest'
import { getCurrencySymbol, getSymbol } from '../src/currency-symbols'
// No need to mock the JSON, it's imported directly by the module

describe('getCurrencySymbol', () => {
  it('should return the correct symbol for a known currency code (USD)', () => {
    expect(getCurrencySymbol('USD')).toBe('$')
  })

  it('should return the correct symbol for a known currency code (EUR)', () => {
    expect(getCurrencySymbol('EUR')).toBe('€')
  })

  it('should return the correct symbol for a known currency code (JPY)', () => {
    expect(getCurrencySymbol('JPY')).toBe('¥')
  })

  it('should return the correct symbol for a known currency code (GBP)', () => {
    expect(getCurrencySymbol('GBP')).toBe('£')
  })
  
  it('should return an empty string for a currency code that does not exist', () => {
    expect(getCurrencySymbol('XYZ')).toBe('')
  })

  it('should be case-sensitive: return empty string for "usd" if "USD" is expected', () => {
    expect(getCurrencySymbol('usd')).toBe('') 
  })

  it('should return an empty string for an empty currency code', () => {
    expect(getCurrencySymbol('')).toBe('')
  })

  it('should handle currency codes that might be substrings of others (e.g. "ALL" vs "ARS")', () => {
    expect(getCurrencySymbol('ALL')).toBe('L'); // Albania Lek
    expect(getCurrencySymbol('ARS')).toBe('$'); // Argentina Peso
  });

  // Test a few more from the list
   it('should return the correct symbol for AFN', () => {
    expect(getCurrencySymbol('AFN')).toBe('؋');
  });

  it('should return the correct symbol for INR', () => {
    expect(getCurrencySymbol('INR')).toBe('₹');
  });

  it('should return the correct symbol for RUB', () => {
    expect(getCurrencySymbol('RUB')).toBe('₽');
  });
})

describe('getSymbol', () => {
  it('should be an alias for getCurrencySymbol and return correct symbol (USD)', () => {
    expect(getSymbol('USD')).toBe('$')
  })

  it('should be an alias and return empty string for non-existent code (XYZ)', () => {
    expect(getSymbol('XYZ')).toBe('')
  })

  it('should be an alias and return empty string for empty code', () => {
    expect(getSymbol('')).toBe('')
  })
})
