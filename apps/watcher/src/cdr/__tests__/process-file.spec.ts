import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processFile } from '../process-file';
import type { Stats } from 'node:fs';
import { FileError } from '@src/utils/file-error';
import { CDRLine } from '../convert-to-cdr-fields';

// --- Mock Dependencies ---

// @src/plugins/post-data
const mockPostData = vi.fn();
vi.mock('@src/plugins/post-data', () => ({
  postData: mockPostData,
}));

// @src/monitoring
const mockCounterProcessInc = vi.fn().mockReturnThis();
const mockCounterProcessLabels = vi.fn().mockReturnValue({ inc: mockCounterProcessInc });
const mockCounterProcess = { inc: mockCounterProcessInc, labels: mockCounterProcessLabels };

const mockHistogramPostDataObserve = vi.fn().mockReturnThis();
const mockHistogramPostDataLabels = vi.fn().mockReturnValue({ observe: mockHistogramPostDataObserve });
const mockHistogramPostData = { observe: mockHistogramPostDataObserve, labels: mockHistogramPostDataLabels };

const mockHistogramProcessObserve = vi.fn().mockReturnThis();
const mockHistogramProcessLabels = vi.fn().mockReturnValue({ observe: mockHistogramProcessObserve });
const mockHistogramProcess = { observe: mockHistogramProcessObserve, labels: mockHistogramProcessLabels };

const mockSetVolumeDataGaugeSet = vi.fn().mockReturnThis();
const mockSetVolumeDataGaugeLabels = vi.fn().mockReturnValue({ set: mockSetVolumeDataGaugeSet });
const mockSetVolumeDataGauge = { set: mockSetVolumeDataGaugeSet, labels: mockSetVolumeDataGaugeLabels };

const mockSetVolumeDataMsisdnGaugeSet = vi.fn().mockReturnThis();
const mockSetVolumeDataMsisdnGaugeLabels = vi.fn().mockReturnValue({ set: mockSetVolumeDataMsisdnGaugeSet });
const mockSetVolumeDataMsisdnGauge = { set: mockSetVolumeDataMsisdnGaugeSet, labels: mockSetVolumeDataMsisdnGaugeLabels };

vi.mock('@src/monitoring', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@src/monitoring')>();
  return {
    ...actual, // Import and retain actual enums/non-function exports
    counterProcess: mockCounterProcess,
    histogramPostData: mockHistogramPostData,
    histogramProcess: mockHistogramProcess,
    setVolumeDataGauge: mockSetVolumeDataGauge,
    setVolumeDataMsisdnGauge: mockSetVolumeDataMsisdnGauge,
  };
});

// @src/validation/cdr-file
const mockUseCdrFileValidation = vi.fn();
vi.mock('@src/validation/cdr-file', () => ({
  useCdrFileValidation: mockUseCdrFileValidation,
}));

// @src/utils/logger
const mockLoggerInfo = vi.fn();
const mockLoggerWarn = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerEnd = vi.fn(); // Assuming an 'end' method if the timer implies it
const mockLogCdrFilename = vi.fn().mockReturnValue({
  info: mockLoggerInfo,
  warn: mockLoggerWarn,
  error: mockLoggerError,
  end: mockLoggerEnd, // Mock the end method used by logger.end()
});
const mockCreateLoggers = vi.fn().mockReturnValue({
  logCdr: { // Assuming logCdr is an object with methods
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
});
vi.mock('@src/utils/logger', () => ({
  createLoggers: mockCreateLoggers,
  logCdrFilename: mockLogCdrFilename,
}));

// ./stats-to-cdr-file
const mockStatsToCdrFile = vi.fn();
vi.mock('../stats-to-cdr-file', () => ({
  statsToCdrFile: mockStatsToCdrFile,
}));

// ./read-cdr
const mockReadCdr = vi.fn();
vi.mock('../read-cdr', () => ({
  readCdr: mockReadCdr,
}));

// ./convert-to-cdr-fields
const mockConvertToCDRFields = vi.fn();
vi.mock('../convert-to-cdr-fields', () => ({
  convertToCDRFields: mockConvertToCDRFields,
}));

// --- Test Suite ---
describe('processFile', () => {
  const mockFilePath = '/path/to/testFile.cdr';
  const mockStats = { size: 1024, mtimeMs: 1234567890 } as Stats;
  const fixedTimestamp = 1678886400000; // Example: 2023-03-15T12:00:00.000Z

  let dateNowSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.resetAllMocks();
    dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

    // Default successful mock implementations
    mockUseCdrFileValidation.mockReturnValue({ prefix: 'testPrefix', filename: 'testFile.cdr' });
    mockStatsToCdrFile.mockReturnValue({
      id: 'file-id',
      name: 'testFile.cdr',
      path: mockFilePath,
      prefix: 'testPrefix',
      size: mockStats.size,
      lineCount: 0,
      lineInvalidCount: 0,
      status: 'PROCESSING',
      createdAt: new Date(fixedTimestamp),
      updatedAt: new Date(fixedTimestamp),
      startProcessingAt: fixedTimestamp,
      endProcessingAt: null,
      processingTimeInSeconds: 0,
    });
    mockReadCdr.mockReturnValue([
      ['voice', '20230101000000', '123', 'subA', 'subB'],
      ['sms', '20230101000100', '0', 'subC', 'subD'],
    ]);
    mockConvertToCDRFields.mockImplementation((lineParts: string[]): Partial<CDRLine> => ({
      valid: true,
      id: `cdr-${lineParts[3]}`, // e.g. cdr-subA
      recordType: lineParts[0] as any,
      timestamp: new Date(fixedTimestamp),
      subscriberIdA: lineParts[3],
      volumeDownload: lineParts[0] === 'voice' ? 100 : undefined, // Example data
      amountPrerated: lineParts[0] === 'voice' ? 0.5 : undefined,
    }));
    mockPostData.mockResolvedValue(undefined);

    // Ensure logger returns 'end' function for timer.
     mockLogCdrFilename.mockReturnValue({
      info: mockLoggerInfo,
      warn: mockLoggerWarn,
      error: mockLoggerError,
      end: mockLoggerEnd.mockReturnValue(1000), // Mock 'end' to return a duration
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('should successfully process a valid file', async () => {
    await processFile(mockFilePath, mockStats);

    expect(mockUseCdrFileValidation).toHaveBeenCalledWith(mockFilePath, mockStats);
    expect(mockStatsToCdrFile).toHaveBeenCalledWith(mockFilePath, mockStats, 'testPrefix', 'testFile.cdr');
    expect(mockReadCdr).toHaveBeenCalledWith(mockFilePath);
    expect(mockConvertToCDRFields).toHaveBeenCalledTimes(2);
    expect(mockConvertToCDRFields).toHaveBeenCalledWith(['voice', '20230101000000', '123', 'subA', 'subB']);
    expect(mockConvertToCDRFields).toHaveBeenCalledWith(['sms', '20230101000100', '0', 'subC', 'subD']);

    expect(mockCounterProcess.labels).toHaveBeenCalledWith('started');
    expect(mockCounterProcessInc).toHaveBeenCalledTimes(1);
    expect(mockHistogramProcess.labels).toHaveBeenCalledWith('processed');
    expect(mockHistogramProcessObserve).toHaveBeenCalled(); // Check if called, specific value is harder

    expect(mockSetVolumeDataGauge.labels).toHaveBeenCalledWith('testPrefix', 'voice');
    expect(mockSetVolumeDataGaugeSet).toHaveBeenCalledWith(100); // from mockConvertToCDRFields
    expect(mockSetVolumeDataGauge.labels).toHaveBeenCalledWith('testPrefix', 'sms');
    expect(mockSetVolumeDataGaugeSet).toHaveBeenCalledWith(0); // default for non-voice

    expect(mockSetVolumeDataMsisdnGauge.labels).toHaveBeenCalledWith('subA', 'testPrefix', 'voice');
    expect(mockSetVolumeDataMsisdnGaugeSet).toHaveBeenCalledWith(0.5); // from mockConvertToCDRFields
    expect(mockSetVolumeDataMsisdnGauge.labels).toHaveBeenCalledWith('subC', 'testPrefix', 'sms');
    expect(mockSetVolumeDataMsisdnGaugeSet).toHaveBeenCalledWith(0); // default for non-voice

    expect(mockPostData).toHaveBeenCalled();
    const postDataCallArg = mockPostData.mock.calls[0][0];
    expect(postDataCallArg.cdrFile.status).toBe('PROCESSED');
    expect(postDataCallArg.cdrFile.lineCount).toBe(2);
    expect(postDataCallArg.cdrFile.lineInvalidCount).toBe(0);
    expect(postDataCallArg.lines.length).toBe(2);
    expect(postDataCallArg.lines[0].subscriberIdA).toBe('subA');

    expect(mockHistogramPostData.labels).toHaveBeenCalledWith('success');
    expect(mockHistogramPostDataObserve).toHaveBeenCalled();

    expect(mockLogCdrFilename).toHaveBeenCalledWith('processFile', 'testFile.cdr');
    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('CDR testFile.cdr Processed'), expect.any(Object));
    expect(mockLoggerEnd).toHaveBeenCalled();
  });

  it('should handle FileError from useCdrFileValidation', async () => {
    const validationError = new FileError('Validation failed');
    mockUseCdrFileValidation.mockImplementation(() => {
      throw validationError;
    });

    await processFile(mockFilePath, mockStats);

    expect(mockCounterProcess.labels).toHaveBeenCalledWith('invalid_cdr');
    expect(mockCounterProcessInc).toHaveBeenCalledTimes(1);
    expect(mockHistogramProcess.labels).toHaveBeenCalledWith('failed');
    expect(mockHistogramProcessObserve).toHaveBeenCalled();

    expect(mockCreateLoggers().logCdr.error).toHaveBeenCalledWith(
      `Error processing file ${mockFilePath}: ${validationError.message}`,
      validationError
    );

    expect(mockPostData).toHaveBeenCalled();
    const postDataCallArg = mockPostData.mock.calls[0][0];
    expect(postDataCallArg.cdrFile.name).toBe(mockFilePath); // Fallback name
    expect(postDataCallArg.cdrFile.status).toBe('ERROR');
    expect(postDataCallArg.cdrFile.lineCount).toBe(0);
    expect(postDataCallArg.lines.length).toBe(0);

    expect(mockReadCdr).not.toHaveBeenCalled();
    expect(mockConvertToCDRFields).not.toHaveBeenCalled();
    expect(mockLoggerEnd).toHaveBeenCalled(); // Timer should still end
  });

  it('should handle readCdr returning empty data', async () => {
    mockReadCdr.mockReturnValue([]);

    await processFile(mockFilePath, mockStats);

    expect(mockLoggerWarn).toHaveBeenCalledWith(`File ${mockFilePath} no info`);
    expect(mockPostData).toHaveBeenCalled(); // Still called to update status
     const postDataCallArg = mockPostData.mock.calls[0][0];
    expect(postDataCallArg.cdrFile.status).toBe('EMPTY_CONTENT');
    expect(postDataCallArg.cdrFile.lineCount).toBe(0);
    expect(postDataCallArg.lines.length).toBe(0);
    expect(mockConvertToCDRFields).not.toHaveBeenCalled();
    expect(mockLoggerEnd).toHaveBeenCalled();
  });

  it('should handle readCdr returning null', async () => {
    mockReadCdr.mockReturnValue(null as any); // Simulate null return

    await processFile(mockFilePath, mockStats);

    expect(mockLoggerWarn).toHaveBeenCalledWith(`File ${mockFilePath} no info`);
     expect(mockPostData).toHaveBeenCalled(); // Still called to update status
     const postDataCallArg = mockPostData.mock.calls[0][0];
    expect(postDataCallArg.cdrFile.status).toBe('EMPTY_CONTENT');
    expect(postDataCallArg.cdrFile.lineCount).toBe(0);
    expect(postDataCallArg.lines.length).toBe(0);
    expect(mockConvertToCDRFields).not.toHaveBeenCalled();
    expect(mockLoggerEnd).toHaveBeenCalled();
  });


  it('should process lines with some invalid CDRs', async () => {
    mockReadCdr.mockReturnValue([
      ['voice', '20230101000000', '123', 'subA'],
      ['invalid_type', '20230101000100', '0', 'subB'], // This will be invalid
      ['sms', '20230101000200', '0', 'subC'],
    ]);

    mockConvertToCDRFields
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: true, id: 'cdr-A', recordType: parts[0] as any, subscriberIdA: 'subA', volumeDownload: 10, amountPrerated: 0.1 }))
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: false, id: 'cdr-B', recordType: parts[0] as any, subscriberIdA: 'subB' })) // Invalid CDR
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: true, id: 'cdr-C', recordType: parts[0] as any, subscriberIdA: 'subC', volumeDownload: 0, amountPrerated: 0.05 }));

    await processFile(mockFilePath, mockStats);

    expect(mockConvertToCDRFields).toHaveBeenCalledTimes(3);
    expect(mockPostData).toHaveBeenCalled();
    const postDataCallArg = mockPostData.mock.calls[0][0];
    expect(postDataCallArg.cdrFile.lineCount).toBe(3);
    expect(postDataCallArg.cdrFile.lineInvalidCount).toBe(1);
    expect(postDataCallArg.lines.length).toBe(2); // Only valid lines are sent
    expect(postDataCallArg.lines.map((l: CDRLine) => l.id)).toEqual(['cdr-A', 'cdr-C']);

    // Check MsisdnGauge calls for valid lines
    expect(mockSetVolumeDataMsisdnGauge.labels).toHaveBeenCalledWith('subA', 'testPrefix', 'voice');
    expect(mockSetVolumeDataMsisdnGaugeSet).toHaveBeenCalledWith(0.1);
    expect(mockSetVolumeDataMsisdnGauge.labels).not.toHaveBeenCalledWith('subB', 'testPrefix', 'invalid_type');
    expect(mockSetVolumeDataMsisdnGauge.labels).toHaveBeenCalledWith('subC', 'testPrefix', 'sms');
    expect(mockSetVolumeDataMsisdnGaugeSet).toHaveBeenCalledWith(0.05);

    expect(mockLoggerEnd).toHaveBeenCalled();
  });

  it('should handle postData failure', async () => {
    const postError = new Error('Post failed');
    mockPostData.mockRejectedValue(postError);

    await processFile(mockFilePath, mockStats);

    expect(mockPostData).toHaveBeenCalled();
    expect(mockHistogramPostData.labels).toHaveBeenCalledWith('error');
    expect(mockHistogramPostDataObserve).toHaveBeenCalled();
    // The main processFile function itself doesn't throw, but logs error via postData's catch
    // No direct logCdr.error for this in processFile, but postData might log it.
    // For this test, we only check metrics related to postData.
    expect(mockLoggerEnd).toHaveBeenCalled();
  });
});
