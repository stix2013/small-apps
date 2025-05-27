import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock instances
const { mockConsolaInstance, mockScopedConsolaInstance } = vi.hoisted(() => {
  return {
    mockConsolaInstance: {
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      withScope: vi.fn(),
    },
    mockScopedConsolaInstance: {
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
  };
});

// Mock 'consola' using the hoisted mock instance
vi.mock('consola', () => ({
  default: mockConsolaInstance,
}));

// Import the module to be tested AFTER the mocks are set up
import { useLogger } from '../src/use-logger';

describe('useLogger', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Ensure withScope returns a distinct mock for scoped instances
    mockConsolaInstance.withScope.mockReturnValue(mockScopedConsolaInstance);
  });

  it('should return the base consola instance if no scope is provided', () => {
    const logger = useLogger();
    expect(logger).toBe(mockConsolaInstance);
    expect(mockConsolaInstance.withScope).not.toHaveBeenCalled();
  });

  it('should call consola.withScope if a scope is provided', () => {
    const scope = 'TestScope';
    useLogger(scope);
    expect(mockConsolaInstance.withScope).toHaveBeenCalledTimes(1);
    expect(mockConsolaInstance.withScope).toHaveBeenCalledWith(scope);
  });

  it('should return the scoped consola instance if a scope is provided', () => {
    const scope = 'MyScope';
    const logger = useLogger(scope);
    expect(logger).toBe(mockScopedConsolaInstance);
  });

  // Example of how to test if the returned logger can be used
  it('returned logger (no scope) can call logging methods', () => {
    const logger = useLogger();
    logger.info('Test message');
    expect(mockConsolaInstance.info).toHaveBeenCalledWith('Test message');
  });

  it('returned logger (with scope) can call logging methods', () => {
    const scope = 'ScopedLogger';
    const logger = useLogger(scope);
    logger.warn('Scoped test message');
    expect(mockScopedConsolaInstance.warn).toHaveBeenCalledWith('Scoped test message');
    // Ensure the base instance was not called directly for this message
    expect(mockConsolaInstance.warn).not.toHaveBeenCalled();
  });
});
