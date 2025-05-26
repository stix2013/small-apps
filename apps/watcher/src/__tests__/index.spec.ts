import { describe, it, expect, beforeAll, afterAll, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import * as Prometheus from 'prom-client';
import { app, server } from '../index'; // Adjust path as necessary if index.ts is not in parent dir
import { createCDRWatcher } from '../cdr';
import schedule from 'node-schedule';
import { loggers as mockLoggersArrayInstance } from '../utils/logger'; // To access the mocked loggers array

// --- Mock Dependencies for Graceful Shutdown ---
vi.mock('../cdr', () => ({
  createCDRWatcher: vi.fn(),
}));

vi.mock('node-schedule', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node-schedule')>();
  return {
    ...actual,
    gracefulShutdown: vi.fn().mockResolvedValue(undefined),
    scheduleJob: vi.fn(), // Also mock scheduleJob if it's called during init
  };
});

vi.mock('../utils/logger', () => ({
  loggers: [{ close: vi.fn() }, { close: vi.fn() }], // Mock a couple of loggers
  createLoggers: vi.fn().mockReturnValue({ logCdr: vi.fn(), logSimInnApi: vi.fn(), logSimInnSMS: vi.fn() }),
  logCdrFilename: vi.fn().mockReturnValue({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), end: vi.fn() })
}));


// --- Test Suite ---
describe('Integration Test for /metrics endpoint', () => {
  const testGauge = new Prometheus.Gauge({
    name: 'test_metric_for_testing',
    help: 'A test metric',
  });

  beforeAll(async () => {
    // The server is already started when ../index is imported.
    // Register a dummy metric for testing purposes
    Prometheus.register.registerMetric(testGauge);
    testGauge.set(123);
  });

  afterAll(async () => {
    // Close the server to prevent open handles
    await new Promise<void>((resolve, reject) => {
      if (server) {
        server.close((err) => {
          if (err) {
            // If server is already closed or other error
            // console.error('Error closing server in test:', err.message);
            // For tests, we might not want to fail if closing fails,
            // especially if the server might have been closed by SIGINT handling logic in index.ts itself.
            // However, for a clean test run, we expect it to close cleanly here.
            // If specific errors on close are problematic, they may need to be handled.
            return reject(err);
          }
          resolve();
        });
      } else {
        resolve(); // No server to close
      }
    });

    // Unregister the dummy metric
    Prometheus.register.removeSingleMetric('test_metric_for_testing');
    // Clear all metrics to ensure a clean state for other tests, if any
    Prometheus.register.clear();
  });

  it('GET /metrics should return Prometheus metrics', async () => {
    const response = await request(app).get('/metrics');

    // Assert status code
    expect(response.status).toBe(200);

    // Assert Content-Type header
    expect(response.headers['content-type']).toBe(Prometheus.register.contentType);

    // Assert body content for the test gauge
    const responseBody = response.text;
    expect(responseBody).toContain('# HELP test_metric_for_testing A test metric');
    expect(responseBody).toContain('# TYPE test_metric_for_testing gauge');
    expect(responseBody).toContain('test_metric_for_testing 123');
  });
});

describe('Graceful Shutdown on SIGINT', () => {
  let mockProcessExit: vi.SpyInstance;
  let mockServerClose: vi.SpyInstance;
  const mockWatcherClose = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    // Reset all general mocks that might have been called by server startup or other tests
    vi.resetAllMocks();

    // Re-mock specific implementations for this test suite
    vi.mocked(createCDRWatcher).mockReturnValue({ close: mockWatcherClose } as any);

    // Spy on process.exit before each test in this suite
    mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((() => { }) as (code?: number) => never);

    // Spy on server.close before each test in this suite
    // Ensure `server` is the actual server instance from `../index`
    mockServerClose = vi.spyOn(server, 'close').mockImplementation((callback?: (err?: Error) => void) => {
      if (callback) {
        callback();
      }
      return server; // Return the server instance as per the original signature
    });
    
    // Re-apply mocks for logger and schedule as they might be cleared by vi.resetAllMocks()
    // and are used by the SIGINT handler in index.ts
    vi.mocked(schedule.gracefulShutdown).mockResolvedValue(undefined);
    // Ensure mockLoggersArrayInstance is correctly re-assigned if necessary, or that the mock for loggers is robust
    // The mock for '../utils/logger' is at the top level, so it should persist unless explicitly cleared.
    // If loggers array instance needs to be specifically controlled per test:
    mockLoggersArrayInstance[0].close.mockClear();
    if (mockLoggersArrayInstance[1]) mockLoggersArrayInstance[1].close.mockClear();


  });

  afterEach(() => {
    // Restore spies after each test
    mockProcessExit.mockRestore();
    mockServerClose.mockRestore();
    mockWatcherClose.mockClear();
  });

  it('should perform graceful shutdown on SIGINT', async () => {
    // Emit SIGINT to trigger the graceful shutdown handler in index.ts
    process.emit('SIGINT');

    // Add a small delay to allow asynchronous operations in the SIGINT handler to proceed
    // This is important because the shutdown involves multiple async calls (watcher.close, schedule.gracefulShutdown)
    // and process.exit is called at the end of an async flow.
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay, adjust if needed

    // Assertions
    expect(mockWatcherClose).toHaveBeenCalled();
    expect(schedule.gracefulShutdown).toHaveBeenCalled();

    // Check that each mocked logger's close method was called
    expect(mockLoggersArrayInstance.length).toBeGreaterThanOrEqual(1); // Ensure we have loggers to check
    for (const logger of mockLoggersArrayInstance) {
      expect(logger.close).toHaveBeenCalled();
    }

    expect(mockServerClose).toHaveBeenCalled();
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });
});
