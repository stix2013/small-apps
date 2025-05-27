import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeout } from '../src/timeout'
import { REFRESH_TIME_PERIOD } from '../src/const/refresh'

const { mockLoggerInfo } = vi.hoisted(() => {
  return { mockLoggerInfo: vi.fn() };
});

// Mock useLogger at the top level
vi.mock('../src/use-logger', () => ({
  useLogger: vi.fn(() => ({
    info: mockLoggerInfo, // Use the externally defined mockLoggerInfo
    error: vi.fn(), 
    warn: vi.fn(),
  })),
}));

describe('timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLoggerInfo.mockClear(); // Clear mock history before each test
  });

  afterEach(() => {
    // vi.restoreAllMocks() // This is removed as per instruction, to be more targeted
    vi.useRealTimers();
  });

  it('should return false if the difference is less than the period', () => {
    const prevTime = Date.now()
    vi.advanceTimersByTime(100) // Advance time by 100ms
    const currTime = Date.now()
    const period = 200
    
    expect(timeout(prevTime, currTime, period)).toBe(false)
    expect(mockLoggerInfo).toHaveBeenCalledWith(false, 100, period)
  })

  it('should return true if the difference is equal to the period', () => {
    const prevTime = Date.now()
    vi.advanceTimersByTime(200)
    const currTime = Date.now()
    const period = 200

    expect(timeout(prevTime, currTime, period)).toBe(true)
    expect(mockLoggerInfo).toHaveBeenCalledWith(true, 200, period)
  })

  it('should return true if the difference is greater than the period', () => {
    const prevTime = Date.now()
    vi.advanceTimersByTime(300)
    const currTime = Date.now()
    const period = 200

    expect(timeout(prevTime, currTime, period)).toBe(true)
    expect(mockLoggerInfo).toHaveBeenCalledWith(true, 300, period)
  })

  it('should use Date.now() for currTime if not provided', () => {
    const prevTime = Date.now() // t = 0
    vi.advanceTimersByTime(REFRESH_TIME_PERIOD - 100) // t = REFRESH_TIME_PERIOD - 100
    
    expect(timeout(prevTime)).toBe(false) 
    expect(mockLoggerInfo).toHaveBeenCalledWith(false, REFRESH_TIME_PERIOD - 100, REFRESH_TIME_PERIOD)

    // mockLoggerInfo.mockClear(); // Already cleared by beforeEach
    vi.advanceTimersByTime(200) // t = REFRESH_TIME_PERIOD + 100
    
    expect(timeout(prevTime)).toBe(true) 
    // The mock will have been called again, ensure to check the latest relevant call or use toHaveBeenCalledTimes with specific args
    expect(mockLoggerInfo).toHaveBeenCalledWith(true, REFRESH_TIME_PERIOD + 100, REFRESH_TIME_PERIOD)
  })

  it('should use REFRESH_TIME_PERIOD for period if not provided', () => {
    const prevTime = Date.now()
    vi.advanceTimersByTime(REFRESH_TIME_PERIOD)
    const currTime = Date.now()

    expect(timeout(prevTime, currTime)).toBe(true)
    expect(mockLoggerInfo).toHaveBeenCalledWith(true, REFRESH_TIME_PERIOD, REFRESH_TIME_PERIOD)
  })
  
  it('should handle prevTime being much older than currTime', () => {
    const prevTime = Date.now() 
    vi.advanceTimersByTime(REFRESH_TIME_PERIOD * 5) 
    const currTime = Date.now()

    expect(timeout(prevTime, currTime, REFRESH_TIME_PERIOD)).toBe(true)
    expect(mockLoggerInfo).toHaveBeenCalledWith(true, REFRESH_TIME_PERIOD * 5, REFRESH_TIME_PERIOD)
  })

  it('should handle currTime being slightly before prevTime (returns false, diff is negative)', () => {
    const currTimeFixed = Date.now() 
    vi.advanceTimersByTime(1000)    
    const prevTimeFixed = Date.now() 

    expect(timeout(prevTimeFixed, currTimeFixed, REFRESH_TIME_PERIOD)).toBe(false)
    expect(mockLoggerInfo).toHaveBeenCalledWith(false, -1000, REFRESH_TIME_PERIOD)
  })
})
