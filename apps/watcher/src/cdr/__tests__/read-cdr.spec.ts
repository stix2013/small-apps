import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readCdr } from '../read-cdr';
import { FileError } from '@src/utils/file-error';
import fs from 'node:fs';

// Mock the 'node:fs' module
vi.mock('node:fs', () => ({
  default: { // Use default export if fs is imported as `import fs from 'node:fs'`
    readFileSync: vi.fn(),
  },
}));

describe('readCdr', () => {
  const mockFilePath = 'test-cdr-file.txt';

  beforeEach(() => {
    // Reset mocks before each test if needed, though readFileSync is fresh each time by re-assigning mockImplementation
    vi.mocked(fs.readFileSync).mockReset();
  });

  it('should correctly read and parse a valid CDR file', () => {
    const fileContent =
      'voice|20231026120000|12345|subA|subB|locA|locB|SUCCESS|10|5|0.1\n' +
      'sms|20231026120100|0|subC||locC||SENT|||0.05\n' +
      'data|20231026120200|3600|subD||locD||SUCCESS|1024|512|1.5';
    vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

    const result = readCdr(mockFilePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toEqual([
      ['voice', '20231026120000', '12345', 'subA', 'subB', 'locA', 'locB', 'SUCCESS', '10', '5', '0.1'],
      ['sms', '20231026120100', '0', 'subC', '', 'locC', '', 'SENT', '', '', '0.05'],
      ['data', '20231026120200', '3600', 'subD', '', 'locD', '', 'SUCCESS', '1024', '512', '1.5'],
    ]);
  });

  it('should skip empty lines or lines with only whitespace', () => {
    const fileContent =
      'voice|20231026120000|12345|subA\n' +
      '\n' + // Empty line
      '   \n' + // Line with only whitespace
      'sms|20231026120100|0|subC\n' +
      '  data|20231026120200|3600|subD  '; // Line with leading/trailing whitespace for content
    vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

    const result = readCdr(mockFilePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toEqual([
      ['voice', '20231026120000', '12345', 'subA'],
      ['sms', '20231026120100', '0', 'subC'],
      ['data', '20231026120200', '3600', 'subD'], // Note: .trim() on the line itself handles this
    ]);
  });

  it('should return an empty array for an empty file', () => {
    const fileContent = '';
    vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

    const result = readCdr(mockFilePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toEqual([]);
  });

  it('should correctly process a file with a single line', () => {
    const fileContent = 'voice|20231026120000|12345|subA|subB';
    vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

    const result = readCdr(mockFilePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toEqual([
      ['voice', '20231026120000', '12345', 'subA', 'subB'],
    ]);
  });

  it('should throw a FileError if readFileSync throws an error', () => {
    const originalError = new Error('File system error');
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw originalError;
    });

    expect(() => readCdr(mockFilePath)).toThrow(FileError);
    expect(() => readCdr(mockFilePath)).toThrow(`Cannot read ${mockFilePath}`);

    try {
      readCdr(mockFilePath);
    } catch (e) {
      expect(e).toBeInstanceOf(FileError);
      expect((e as FileError).message).toBe(`Cannot read ${mockFilePath}`);
      expect((e as FileError).originalError).toBe(originalError);
    }

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
  });
});
