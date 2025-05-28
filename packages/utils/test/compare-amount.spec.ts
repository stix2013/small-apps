import { describe, expect, it } from 'vitest'
import { compareAmount } from '../src/compare-amount'
import type { Amount } from '@yellow-mobile/types'

describe('compareAmount', () => {
  const amountA: Amount = { currency: 'USD', value: 100 }
  const amountB: Amount = { currency: 'USD', value: 100 }
  const amountC: Amount = { currency: 'USD', value: 200 }
  const amountD: Amount = { currency: 'EUR', value: 100 }
  const amountE: Amount = { currency: 'EUR', value: 200 }
  const amountF: Amount = { currency: 'USD', value: 100.50 }
  const amountG: Amount = { currency: 'USD', value: 100.50 }
  const amountH: Amount = { currency: 'USD', value: 100.5 }


  it('should return true for amounts with the same currency and value', () => {
    expect(compareAmount(amountA, amountB)).toBe(true)
  })

  it('should return false for amounts with different values but same currency', () => {
    expect(compareAmount(amountA, amountC)).toBe(false)
  })

  it('should return false for amounts with different currencies but same value', () => {
    expect(compareAmount(amountA, amountD)).toBe(false)
  })

  it('should return false for amounts with different currencies and different values', () => {
    expect(compareAmount(amountA, amountE)).toBe(false)
  })

  it('should return true for amounts with the same currency and floating point value', () => {
    expect(compareAmount(amountF, amountG)).toBe(true)
  })
  
  it('should return true for amounts with the same currency and floating point value even if one has trailing zero', () => {
    expect(compareAmount(amountG, amountH)).toBe(true);
  });
})
