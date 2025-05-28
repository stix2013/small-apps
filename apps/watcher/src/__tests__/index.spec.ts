import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';
import request from 'supertest';
import * as Prometheus from 'prom-client';
import { app, server } from '../index'; // Adjust path as necessary if index.ts is not in parent dir
import { createCDRWatcher } from '../cdr';
import schedule from 'node-schedule';
import { loggers as mockLoggersArrayInstance } from '../utils/logger'; // To access the mocked loggers array
import {
  Matcher,
  FSWatcher,
  EmitArgs,
  ThrottleType,
  Throttler,
  WatchHelper,
  FSWatcherKnownEventMap,
  FSWatcherEventMap,
} from 'chokidar';
import { Path, EventName, NodeFsHandler } from 'chokidar/handler';
import { WatchEventType, Stats } from 'fs';

// --- Mock Dependencies for Graceful Shutdown ---
// Import to allow partial mocking if needed later
vi.mock('../monitoring', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../monitoring')>();
  return {
    ...actual, // Spread actual to keep other exports
    createSchedule: vi.fn().mockReturnValue(true), // Ensure jobs is truthy
  };
});

// Use vi.hoisted for mockWatcherCloseGlobal
const { mockWatcherCloseGlobal } = vi.hoisted(() => {
  return { mockWatcherCloseGlobal: vi.fn() };
});

vi.mock('../cdr', () => ({
  // Ensure createCDRWatcher is a vi.fn() itself, and immediately returns an object
  // that uses mockWatcherCloseGlobal for its 'close' method.
  createCDRWatcher: vi.fn().mockReturnValue({ close: mockWatcherCloseGlobal }),
}));

vi.mock('node-schedule', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node-schedule')>();
  const mockGracefulShutdownFn = vi.fn().mockResolvedValue(undefined);
  const mockScheduleJobFn = vi.fn();

  return {
    ...actual, // Spread actual for any other parts of node-schedule used
    // Provide named exports for completeness, though index.ts uses default.
    gracefulShutdown: mockGracefulShutdownFn,
    scheduleJob: mockScheduleJobFn,
    // Crucially, mock the default export structure:
    default: {
      ...{}, // Spread actual.default if it exists and has other properties
      gracefulShutdown: mockGracefulShutdownFn,
      scheduleJob: mockScheduleJobFn,
    },
  };
});

vi.mock('../utils/logger', () => ({
  loggers: [{ close: vi.fn() }, { close: vi.fn() }], // Mock a couple of loggers
  createLoggers: vi
    .fn()
    .mockReturnValue({
      logCdr: vi.fn(),
      logSimInnApi: vi.fn(),
      logSimInnSMS: vi.fn(),
    }),
  logCdrFilename: vi
    .fn()
    .mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      end: vi.fn(),
    }),
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
        server.close((err?: Error & { code?: string }) => {
          // Add type for err.code
          if (err) {
            // If the server is already closed, Node.js might give an error with this code.
            // For the purpose of this test's cleanup, we can ignore this specific error.
            if (err.code === 'ERR_SERVER_NOT_RUNNING') {
              console.warn(
                `Server was already closed or not running during metrics test cleanup: ${err.message}`
              );
              resolve();
            } else {
              // For other errors, still reject.
              console.error(
                'Error closing server in metrics test cleanup:',
                err.message
              );
              reject(err);
            }
          } else {
            resolve();
          }
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
    expect(response.headers['content-type']).toBe(
      Prometheus.register.contentType
    );

    // Assert body content for the test gauge
    const responseBody = response.text;
    expect(responseBody).toContain(
      '# HELP test_metric_for_testing A test metric'
    );
    expect(responseBody).toContain('# TYPE test_metric_for_testing gauge');
    expect(responseBody).toContain('test_metric_for_testing 123');
  });
});

describe('Graceful Shutdown on SIGINT', () => {
  let mockProcessExit: MockInstance;
  let mockServerClose: MockInstance;
  // const mockWatcherClose = vi.fn().mockResolvedValue(undefined); // Removed

  beforeEach(async () => {
    vi.resetAllMocks(); // Resets createCDRWatcher, mockWatcherCloseGlobal, schedule mocks, etc.

    // Re-establish default mock behaviors after reset:
    // For mockWatcherCloseGlobal (used by the watcher returned by createCDRWatcher)
    mockWatcherCloseGlobal.mockResolvedValue(undefined);

    // For createCDRWatcher itself (ensure it still returns the object with the now-reset-and-reconfigured mockWatcherCloseGlobal)
    vi.mocked(createCDRWatcher).mockReturnValue({
      close: mockWatcherCloseGlobal,
      closed: false,
      _readyCount: 0,
      _emitReady: function (): void {
        throw new Error('Function not implemented.');
      },
      _readyEmitted: false,
      _emitRaw: function (
        ev: WatchEventType,
        path: string,
        opts: unknown
      ): void {
        throw new Error('Function not implemented.');
      },
      _boundRemove: function (dir: string, item: string): void {
        throw new Error('Function not implemented.');
      },
      // _nodeFsHandler: new NodeFsHandler(),
      _addIgnoredPath: function (matcher: Matcher): void {
        throw new Error('Function not implemented.');
      },
      _removeIgnoredPath: function (matcher: Matcher): void {
        throw new Error('Function not implemented.');
      },
      add: function (
        paths_: Path | Path[],
        _origAdd?: string,
        _internal?: boolean
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      unwatch: function (paths_: Path | Path[]): FSWatcher {
        throw new Error('Function not implemented.');
      },
      getWatched: function (): Record<string, string[]> {
        throw new Error('Function not implemented.');
      },
      emitWithAll: function (event: EventName, args: EmitArgs): void {
        throw new Error('Function not implemented.');
      },
      _emit: function (
        event: EventName,
        path: Path,
        stats?: Stats
      ): Promise<FSWatcher | undefined> {
        throw new Error('Function not implemented.');
      },
      _handleError: function (error: Error): Error | boolean {
        throw new Error('Function not implemented.');
      },
      _throttle: function (
        actionType: ThrottleType,
        path: Path,
        timeout: number
      ): Throttler | false {
        throw new Error('Function not implemented.');
      },
      _incrReadyCount: function (): number {
        throw new Error('Function not implemented.');
      },
      _awaitWriteFinish: function (
        path: Path,
        threshold: number,
        event: EventName,
        awfEmit: (err?: Error, stat?: Stats) => void
      ): void {
        throw new Error('Function not implemented.');
      },
      _isIgnored: function (path: Path, stats?: Stats): boolean {
        throw new Error('Function not implemented.');
      },
      _isntIgnored: function (path: Path, stat?: Stats): boolean {
        throw new Error('Function not implemented.');
      },
      _getWatchHelpers: function (path: Path): WatchHelper {
        throw new Error('Function not implemented.');
      },
      // _getWatchedDir: function (directory: string): DirEntry {
      //   throw new Error('Function not implemented.');
      // },
      _hasReadPermissions: function (stats: Stats): boolean {
        throw new Error('Function not implemented.');
      },
      _remove: function (
        directory: string,
        item: string,
        isDirectory?: boolean
      ): void {
        throw new Error('Function not implemented.');
      },
      _closePath: function (path: Path): void {
        throw new Error('Function not implemented.');
      },
      _closeFile: function (path: Path): void {
        throw new Error('Function not implemented.');
      },
      _addPathCloser: function (path: Path, closer: () => void): void {
        throw new Error('Function not implemented.');
      },
      //@ts-ignore
      _readdirp: undefined,
      addListener: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      on: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      once: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      removeListener: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      off: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      removeAllListeners: function (eventName?: unknown): FSWatcher {
        throw new Error('Function not implemented.');
      },
      setMaxListeners: function (n: number): FSWatcher {
        throw new Error('Function not implemented.');
      },
      getMaxListeners: function (): number {
        throw new Error('Function not implemented.');
      },
      listeners: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K
      ): (K extends
        | 'unlink'
        | 'change'
        | 'add'
        | 'addDir'
        | 'unlinkDir'
        | keyof FSWatcherKnownEventMap
        ? FSWatcherEventMap[K] extends unknown[]
          ? (...args: FSWatcherEventMap[K]) => void
          : never
        : never)[] {
        throw new Error('Function not implemented.');
      },
      rawListeners: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K
      ): (K extends
        | 'unlink'
        | 'change'
        | 'add'
        | 'addDir'
        | 'unlinkDir'
        | keyof FSWatcherKnownEventMap
        ? FSWatcherEventMap[K] extends unknown[]
          ? (...args: FSWatcherEventMap[K]) => void
          : never
        : never)[] {
        throw new Error('Function not implemented.');
      },
      emit: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        ...args: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K]
          : never
      ): boolean {
        throw new Error('Function not implemented.');
      },
      listenerCount: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener?:
          | (K extends
              | 'unlink'
              | 'change'
              | 'add'
              | 'addDir'
              | 'unlinkDir'
              | keyof FSWatcherKnownEventMap
              ? FSWatcherEventMap[K] extends unknown[]
                ? (...args: FSWatcherEventMap[K]) => void
                : never
              : never)
          | undefined
      ): number {
        throw new Error('Function not implemented.');
      },
      prependListener: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      prependOnceListener: function <K>(
        eventName:
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          | K,
        listener: K extends
          | 'unlink'
          | 'change'
          | 'add'
          | 'addDir'
          | 'unlinkDir'
          | keyof FSWatcherKnownEventMap
          ? FSWatcherEventMap[K] extends unknown[]
            ? (...args: FSWatcherEventMap[K]) => void
            : never
          : never
      ): FSWatcher {
        throw new Error('Function not implemented.');
      },
      eventNames: function (): (
        | 'error'
        | 'unlink'
        | 'all'
        | 'change'
        | 'ready'
        | 'add'
        | 'addDir'
        | 'unlinkDir'
        | 'raw'
      )[] {
        throw new Error('Function not implemented.');
      },
    });

    // For schedule.gracefulShutdown (assuming 'schedule' is imported)
    // The top-level mock for 'node-schedule' should have mockGracefulShutdownFn = vi.fn().mockResolvedValue(undefined)
    // After resetAllMocks, this mock function needs its behavior re-applied.
    if (schedule && typeof schedule.gracefulShutdown === 'function') {
      vi.mocked(schedule.gracefulShutdown).mockResolvedValue(undefined);
    }
    // If createSchedule is mocked (as in previous fix attempt), re-establish its behavior too.
    // Assuming createSchedule is imported from '../monitoring' which is mocked at the top
    const { createSchedule } = await import('../monitoring'); // dynamically import to get the mocked version
    if (createSchedule && vi.isMockFunction(createSchedule)) {
      vi.mocked(createSchedule).mockReturnValue(true);
    }

    // Re-initialize spies on process.exit and server.close as resetAllMocks might restore original implementations
    mockProcessExit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as (
        code?: string | number | null
      ) => never);
    mockServerClose = vi
      .spyOn(server, 'close')
      .mockImplementation((callback?: (err?: Error) => void) => {
        if (callback) callback();
        return server;
      });

    // Clear logger mocks (ensure mockLoggersArrayInstance is the imported mock array)
    if (mockLoggersArrayInstance && mockLoggersArrayInstance.length > 0) {
      mockLoggersArrayInstance.forEach((logger) => {
        if (
          logger &&
          typeof logger.close === 'function' &&
          vi.isMockFunction(logger.close)
        ) {
          vi.mocked(logger.close).mockClear(); // Only clear if it's a mock function
        }
      });
    }
  });

  afterEach(() => {
    // Restore original implementations spied on by vi.spyOn if not automatically handled by resetAllMocks
    // For robust cleanup, explicitly restore spies created in beforeEach.
    mockProcessExit.mockRestore();
    mockServerClose.mockRestore();
  });

  it('should perform graceful shutdown on SIGINT', async () => {
    // Emit SIGINT to trigger the graceful shutdown handler in index.ts
    process.emit('SIGINT');

    // Wait for the server to be signaled to close, and for async operations in gracefulShutdownFlow to be called.
    // server.close() is called synchronously (in terms of starting the close) by the SIGINT handler.
    // Then, watcher.close() and schedule.gracefulShutdown() are awaited within gracefulShutdownFlow.

    // Ensure server.close() was called (it's the first action in the SIGINT handler)
    await vi.waitUntil(() => mockServerClose.mock.calls.length > 0, {
      timeout: 500,
      interval: 10,
    });

    // Wait for the main async shutdown operations to be initiated and their mocks to be called
    await vi.waitUntil(() => mockWatcherCloseGlobal.mock.calls.length > 0, {
      timeout: 1000,
      interval: 10,
    });
    await vi.waitUntil(
      () => vi.mocked(schedule.gracefulShutdown).mock.calls.length > 0,
      { timeout: 1000, interval: 10 }
    );

    // Assertions
    expect(mockWatcherCloseGlobal).toHaveBeenCalledTimes(1);
    expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);

    // Check that each mocked logger's close method was called
    expect(mockLoggersArrayInstance.length).toBeGreaterThanOrEqual(1); // Ensure we have loggers to check
    for (const logger of mockLoggersArrayInstance) {
      expect(logger.close).toHaveBeenCalledTimes(1);
    }

    expect(mockServerClose).toHaveBeenCalledTimes(1);
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });
});
