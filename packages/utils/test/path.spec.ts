import { describe, it, expect } from 'vitest'
import { getFullPath } from '../src/path'

describe('getFullPath', () => {
  it('should return the same URL if no port is provided', () => {
    const baseUrl = 'https://example.com/path'
    expect(getFullPath(baseUrl)).toBe(baseUrl)
  })

  it('should add port to URL if basePort is provided (number)', () => {
    const baseUrl = 'https://example.com/path'
    expect(getFullPath(baseUrl, 8080)).toBe('https://example.com:8080/path')
  })

  it('should add port to URL if basePort is provided (string)', () => {
    const baseUrl = 'https://example.com/path'
    expect(getFullPath(baseUrl, '8080')).toBe('https://example.com:8080/path')
  })

  it('should overwrite existing port in baseUrl if basePort is provided', () => {
    const baseUrl = 'https://example.com:3000/path'
    expect(getFullPath(baseUrl, 8080)).toBe('https://example.com:8080/path')
  })

  it('should preserve path and query parameters when changing port', () => {
    const baseUrl = 'http://localhost/api/data?id=123'
    expect(getFullPath(baseUrl, 8888)).toBe('http://localhost:8888/api/data?id=123')
  })

  it('should preserve username and password in URL', () => {
    const baseUrl = 'https://user:pass@example.com/path'
    expect(getFullPath(baseUrl, 1234)).toBe('https://user:pass@example.com:1234/path')
  })

  it('should handle http protocol', () => {
    const baseUrl = 'http://sub.example.com'
    // URL constructor adds trailing slash for domain only if path is empty.
    // Setting port to 80 (default for http) should not explicitly add it to href.
    expect(getFullPath(baseUrl, 80)).toBe('http://sub.example.com/') 
  })
  
  it('should handle https protocol', () => {
    const baseUrl = 'https://sub.example.com/test'
    // Setting port to 443 (default for https) should not explicitly add it to href.
    expect(getFullPath(baseUrl, 443)).toBe('https://sub.example.com/test')
  })

  it('should throw an error for an invalid baseUrl', () => {
    // URL constructor throws for invalid URLs
    expect(() => getFullPath('not a valid url')).toThrow()
    expect(() => getFullPath('')).toThrow() // Empty string is also invalid for URL constructor
  })
  
  it('should handle URL with trailing slash correctly when adding port', () => {
    const baseUrl = 'https://example.com/path/'
    expect(getFullPath(baseUrl, 9000)).toBe('https://example.com:9000/path/')
  })

  it('should handle IP address as hostname', () => {
    const baseUrl = 'http://127.0.0.1/api'
    expect(getFullPath(baseUrl, 5000)).toBe('http://127.0.0.1:5000/api')
  })
  
  it('should handle basePort as an empty string (results in default port for protocol)', () => {
    const baseUrlHttp = 'http://example.com/path';
    // new URL('http://example.com').port = '' results in port being cleared, using default 80
    expect(getFullPath(baseUrlHttp, '')).toBe('http://example.com/path'); // Port 80 is implicit

    const baseUrlHttps = 'https://example.com/path';
    // new URL('https://example.com').port = '' results in port being cleared, using default 443
    expect(getFullPath(baseUrlHttps, '')).toBe('https://example.com/path'); // Port 443 is implicit
  });

  it('should handle basePort as string "0" (this is a valid port number)', () => {
    const baseUrl = 'https://example.com/path';
    expect(getFullPath(baseUrl, '0')).toBe('https://example.com:0/path');
  });
})
