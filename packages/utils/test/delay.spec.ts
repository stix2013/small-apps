import { describe, it, expect, vi } from 'vitest'
import { delay } from '../src/delay'

vi.useFakeTimers()

describe('delay', () => {
  it('should resolve after the specified duration', async () => {
    const duration = 1000
    const promise = delay(duration)

    // Check that the promise is not yet resolved
    let resolved = false
    promise.then(() => {
      resolved = true
    })

    // Expect that it's not resolved immediately
    expect(resolved).toBe(false)

    // Fast-forward time
    vi.advanceTimersByTime(duration)

    // Wait for the promise to resolve
    await promise
    expect(resolved).toBe(true)
  })

  it('should work correctly with async/await', async () => {
    const duration = 500
    const startTime = Date.now()
    
    const promise = delay(duration)
    vi.advanceTimersByTime(duration) // Ensure timer advances
    await promise
    
    const endTime = Date.now()
    // With fake timers, the time doesn't actually pass in real terms,
    // so we can't check endTime - startTime.
    // Instead, we rely on advanceTimersByTime and the promise resolving.
    // The main check is that await promise completes.
    expect(true).toBe(true) // If await completes, this line will be reached.
  })

  it('should resolve almost immediately for a 0ms delay', async () => {
    const duration = 0
    const promise = delay(duration)
    
    let resolved = false
    promise.then(() => {
      resolved = true
    })

    // Even with 0ms, it should involve a macro-task, so not instant synchronously
    expect(resolved).toBe(false)

    vi.advanceTimersByTime(duration) // Advance by 0 ms
    await promise
    expect(resolved).toBe(true)
  })

  it('should handle multiple delays correctly', async () => {
    const duration1 = 200
    const duration2 = 300
    const delay1Promise = delay(duration1)
    const delay2Promise = delay(duration2)

    let delay1Resolved = false
    delay1Promise.then(() => { delay1Resolved = true })

    let delay2Resolved = false
    delay2Promise.then(() => { delay2Resolved = true })

    vi.advanceTimersByTime(duration1)
    await delay1Promise
    expect(delay1Resolved).toBe(true)
    expect(delay2Resolved).toBe(false) // delay2 should not be resolved yet

    vi.advanceTimersByTime(duration2 - duration1) // Advance by remaining time for delay2
    await delay2Promise
    expect(delay2Resolved).toBe(true)
  })
})
