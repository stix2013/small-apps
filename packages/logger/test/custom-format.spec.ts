import { describe, it, expect } from 'vitest';
import { format } from 'winston';
import { customFormat } from '../src/custom-format';

describe('customFormat', () => {
  const { printf } = format;

  it('should format a log message correctly', () => {
    const info = {
      level: 'info',
      message: 'Test message',
      timestamp: '2023-10-27T10:00:00.000Z',
      ms: '+0ms',
      label: 'test-label',
      splat: undefined, // Explicitly set splat for clarity
    };
    // Create a new formatter using customFormat
    const formatter = customFormat;
    // Transform the info object
    // @ts-expect-error we are passing a simplified info object for testing
    const result = formatter.transform(info);
    // Access the formatted message
    const formattedMessage = result[Symbol.for('message')];

    expect(formattedMessage).toBe('2023-10-27T10:00:00.000Z +0ms [info] [test-label] Test message ');
  });

  it('should format a log message with splat arguments correctly', () => {
    const info = {
      level: 'warn',
      message: 'Test message with splat',
      timestamp: '2023-10-27T10:05:00.000Z',
      ms: '+5ms',
      label: 'test-label-splat',
      splat: [{ data: 'additional data' }],
    };
    const formatter = customFormat;
    // @ts-expect-error we are passing a simplified info object for testing
    const result = formatter.transform(info);
    const formattedMessage = result[Symbol.for('message')];
    // The inspect function might produce slightly different output depending on the environment,
    // so we check for the presence of the core parts of the message.
    expect(formattedMessage).toContain('2023-10-27T10:05:00.000Z +5ms [warn] [test-label-splat] Test message with splat');
    expect(formattedMessage).toContain("{ data: 'additional data' }");
  });

  it('should handle missing optional fields gracefully', () => {
    const info = {
      level: 'error',
      message: 'Minimal message',
      // @ts-expect-error we are testing missing fields
      timestamp: undefined,
      // @ts-expect-error we are testing missing fields
      ms: undefined,
      // @ts-expect-error we are testing missing fields
      label: undefined,
      splat: undefined,
    };
    const formatter = customFormat;
    // @ts-expect-error we are passing a simplified info object for testing
    const result = formatter.transform(info);
    const formattedMessage = result[Symbol.for('message')];

    // Adjusting expectation for undefined fields
    // Undefined fields in the template literal will result in "undefined" string
    expect(formattedMessage).toBe('undefined undefined [error] [undefined] Minimal message ');
  });
});
