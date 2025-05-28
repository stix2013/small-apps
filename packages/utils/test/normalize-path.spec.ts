import { describe, expect, it } from 'vitest'
import { normalizePath } from '../src/normalize-path'

describe('normalizePath', () => {
  it('should remove query string from path', () => {
    expect(normalizePath('/path/to/resource?query=123')).toBe('/path/to/resource')
  })

  it('should remove trailing slash from path', () => {
    expect(normalizePath('/path/to/resource/')).toBe('/path/to/resource')
  })

  it('should remove both query string and trailing slash', () => {
    expect(normalizePath('/path/to/resource/?query=123')).toBe('/path/to/resource')
  })
  
  it('should handle query string that comes before a trailing slash (slash is part of path)', () => {
    // In this case, the slash is considered part of the path before query string removal
    expect(normalizePath('/path/to/resource/?id=1')).toBe('/path/to/resource') 
  })

  it('should not change path if no query string or trailing slash', () => {
    expect(normalizePath('/path/to/resource')).toBe('/path/to/resource')
  })

  it('should return an empty string for an empty input path', () => {
    expect(normalizePath('')).toBe('')
  })
  
  it('should return an empty string for an undefined input path', () => {
    expect(normalizePath(undefined as any)).toBe('');
  });

  it('should handle path that is just "/"', () => {
    expect(normalizePath('/')).toBe('') // Trailing slash removed
  })

  it('should handle path that is just "/?query=abc"', () => {
    expect(normalizePath('/?query=abc')).toBe('') // Query removed, then trailing slash removed
  })

  it('should not remove internal trailing slashes', () => {
    expect(normalizePath('/path//to//resource/')).toBe('/path//to//resource')
  })
  
  it('should handle path with query string but no value after ?', () => {
    expect(normalizePath('/path/to/resource?')).toBe('/path/to/resource')
  })

  it('should handle path that is just "?"', () => {
    expect(normalizePath('?')).toBe('')
  })

  it('should handle path with only a query string like "?a=b"', () => {
    expect(normalizePath('?a=b')).toBe('')
  })

  it('should not affect paths without leading slash', () => {
    expect(normalizePath('path/to/resource')).toBe('path/to/resource')
    expect(normalizePath('path/to/resource/')).toBe('path/to/resource')
    expect(normalizePath('path/to/resource?q=1')).toBe('path/to/resource')
    expect(normalizePath('path/to/resource/?q=1')).toBe('path/to/resource')
  })
})
