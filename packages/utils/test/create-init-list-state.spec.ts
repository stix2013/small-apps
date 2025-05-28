import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitListState } from '../src/create-init-list-state'
import type { InitItemWithIndex } from '@yellow-mobile/types'

describe('createInitListState', () => {
  const initFn: InitItemWithIndex<string> = (index) => `item-${index}`
  const mockInitFn = vi.fn(initFn)

  beforeEach(() => {
    mockInitFn.mockClear()
  })

  it('should use bundles items first, then initFunction for remaining items', () => {
    const bundles = ['bundle-0', 'bundle-1']
    const result = createInitListState(3, bundles, mockInitFn)
    expect(result).toEqual(['bundle-0', 'bundle-1', 'item-2'])
    expect(mockInitFn).toHaveBeenCalledTimes(1)
    expect(mockInitFn).toHaveBeenCalledWith(2)
  })

  it('should use only initFunction if bundles is empty', () => {
    const bundles: string[] = []
    const result = createInitListState(3, bundles, mockInitFn)
    expect(result).toEqual(['item-0', 'item-1', 'item-2'])
    expect(mockInitFn).toHaveBeenCalledTimes(3)
    expect(mockInitFn).toHaveBeenCalledWith(0)
    expect(mockInitFn).toHaveBeenCalledWith(1)
    expect(mockInitFn).toHaveBeenCalledWith(2)
  })

  it('should return an empty list if count is 0', () => {
    const bundles = ['a', 'b']
    const result = createInitListState(0, bundles, mockInitFn)
    expect(result).toEqual([])
    expect(mockInitFn).not.toHaveBeenCalled()
  })

  it('should use all bundle items if count equals bundles length', () => {
    const bundles = ['bundle-0', 'bundle-1', 'bundle-2']
    const result = createInitListState(3, bundles, mockInitFn)
    expect(result).toEqual(bundles)
    expect(mockInitFn).not.toHaveBeenCalled()
  })

  it('should handle different data types for bundles and initFunction', () => {
    const numberBundles = [10, 20]
    const numberInitFn: InitItemWithIndex<number> = (index) => index * 100
    const mockNumberInitFn = vi.fn(numberInitFn)
    
    const result = createInitListState(4, numberBundles, mockNumberInitFn)
    expect(result).toEqual([10, 20, 200, 300])
    expect(mockNumberInitFn).toHaveBeenCalledTimes(2)
    expect(mockNumberInitFn).toHaveBeenCalledWith(2)
    expect(mockNumberInitFn).toHaveBeenCalledWith(3)
  })

  it('should handle cases where bundle items might be undefined (though type suggests T not T | undefined)', () => {
    // This case is tricky because bundles: T[] implies elements are of type T.
    // However, if a bundle somehow contains undefined where T is expected (e.g. T = string)
    // the original code would push initFunction(index) result.
    const bundles = ['a', undefined as any, 'c'] // Simulating an undefined element
    const result = createInitListState(3, bundles, mockInitFn)
    expect(result).toEqual(['a', 'item-1', 'c'])
    expect(mockInitFn).toHaveBeenCalledTimes(1)
    expect(mockInitFn).toHaveBeenCalledWith(1)
  })
})
