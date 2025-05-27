import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processFile } from '../process-file';
import type { Stats } from 'node:fs';
import { FileError } from '@src/utils/file-error';
import { CDRLine } from '../convert-to-cdr-fields';

// --- Mock Dependencies ---

// @src/plugins/post-data
vi.mock('@src/plugins/post-data', () => ({
  postData: vi.fn(),
}));

// @src/monitoring
vi.mock('@src/monitoring', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@src/monitoring')>();
  const mockLabelsFn = () => ({ labels: vi.fn().mockReturnThis(), set: vi.fn(), inc: vi.fn().mockReturnThis(), observe: vi.fn() });
  return {
    ...actual, // Import and retain actual enums/non-function exports
    counterProcess: mockLabelsFn(),
    histogramPostData: mockLabelsFn(),
    histogramProcess: mockLabelsFn(),
    setVolumeDataGauge: vi.fn(), // Reverted to vi.fn()
    setVolumeDataMsisdnGauge: vi.fn(), // Reverted to vi.fn()
  };
});

// @src/validation/cdr-file
vi.mock('@src/validation/cdr-file', () => ({
  useCdrFileValidation: vi.fn(),
}));

// @src/utils/logger
vi.mock('@src/utils/logger', () => ({
  createLoggers: vi.fn().mockReturnValue({
    logCdr: { // Assuming logCdr is an object with methods
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    // Add other loggers if createLoggers returns them, e.g., logSimInnApi, logSimInnSMS
    logSimInnApi: { error: vi.fn() },
    logSimInnSMS: { error: vi.fn() },
  }),
  logCdrFilename: vi.fn().mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    end: vi.fn().mockReturnValue(0), // Mock the end method used by logger.end()
  }),
  // If 'loggers' array is directly imported and used from this module
  loggers: [{ close: vi.fn() }, { close: vi.fn() }],
}));

// ./stats-to-cdr-file
vi.mock('../stats-to-cdr-file', () => ({
  statsToCdrFile: vi.fn(),
}));

// ./read-cdr
vi.mock('../read-cdr', () => ({
  readCdr: vi.fn(),
}));

// ./convert-to-cdr-fields
vi.mock('../convert-to-cdr-fields', () => ({
  convertToCDRFields: vi.fn(),
}));


// --- Import mocked modules to use vi.mocked() ---
import { postData } from '@src/plugins/post-data';
import {
  counterProcess,
  histogramPostData,
  histogramProcess,
  setVolumeDataGauge,
  setVolumeDataMsisdnGauge,
} from '@src/monitoring';
import { useCdrFileValidation } from '@src/validation/cdr-file';
import { createLoggers, logCdrFilename } from '@src/utils/logger';
import { statsToCdrFile } from '../stats-to-cdr-file';
import { readCdr } from '../read-cdr';
import { convertToCDRFields } from '../convert-to-cdr-fields';


// --- Test Suite ---
describe('processFile', () => {
  const mockFilePath = '/path/to/testFile.cdr';
  const mockStats = { size: 1024, mtimeMs: 1234567890 } as Stats;
  const fixedTimestamp = 1678886400000; // Example: 2023-03-15T12:00:00.000Z

  let dateNowSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.resetAllMocks(); // This will also reset mocks defined with inline vi.fn()
    dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

    // Default successful mock implementations using vi.mocked()
    vi.mocked(useCdrFileValidation).mockReturnValue({ prefix: 'testPrefix', filename: 'testFile.cdr' });
    vi.mocked(statsToCdrFile).mockReturnValue({
      // Core CDRFileInfo fields:
      group: 'testPrefix',
      name: 'testFile.cdr',
      number: 'mockFileNumber', // Provide a default
      lines: { total: 0, invalid: 0 }, // Added required property
      birthtime: new Date(fixedTimestamp), // Optional in CDRFileInfo

      // Fields that processFile.ts adds or updates on the object from statsToCdrFile,
      // or that are expected by later assertions on this object.
      status: 'PROCESSING', // Set a default status
      lineCount: 0, // Will be updated by processFile
      lineInvalidCount: 0, // Will be updated by processFile
      startProcessingAt: fixedTimestamp, // Set a default
      endProcessingAt: null, // Default
      processingTimeInSeconds: 0, // Default

      // Keep other fields if they are used by processFile before being overwritten, or by assertions.
      // For example, if processFile itself uses cdrFile.id, cdrFile.path, cdrFile.size before replacing them.
      // Based on current processFile logic, these are not strictly needed from statsToCdrFile mock initially.
      // id: 'file-id', // Not directly used from statsToCdrFile result by processFile
      // path: mockFilePath, // Not directly used from statsToCdrFile result by processFile
      // size: mockStats.size, // Not directly used from statsToCdrFile result by processFile
      // prefix: 'testPrefix', // Replaced by group
      // createdAt: new Date(fixedTimestamp), // Not directly used
      // updatedAt: new Date(fixedTimestamp), // Not directly used
    });
    vi.mocked(readCdr).mockReturnValue([
      ['voice', '20230101000000', '123', 'subA', 'subB'],
      ['sms', '20230101000100', '0', 'subC', 'subD'],
    ]);
    vi.mocked(convertToCDRFields).mockImplementation((lineParts: string[]): Partial<CDRLine> => ({
      valid: true,
      id: `cdr-${lineParts[3]}`, // e.g. cdr-subA
      recordType: lineParts[0] as any,
      timestamp: new Date(fixedTimestamp),
      subscriberIdA: lineParts[3],
      volumeDownload: lineParts[0] === 'voice' ? 100 : undefined, // Example data
      amountPrerated: lineParts[0] === 'voice' ? 0.5 : undefined,
    }));
    vi.mocked(postData).mockResolvedValue(undefined);

    // Ensure logger returns 'end' function for timer and other logger mocks are correctly set up
    // The mock for logCdrFilename is already defined with inline vi.fn at the top level
    // If createLoggers needs specific setup for each test:
    vi.mocked(createLoggers).mockReturnValue({
      logCdr: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      logSimInnApi: { error: vi.fn() },
      logSimInnSMS: { error: vi.fn() },
    } as any);
    // logCdrFilename is already mocked at the top. If its 'end' method needs specific return for each test:
    vi.mocked(logCdrFilename).mockReturnValue({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        end: vi.fn().mockReturnValue(1000) // Mock 'end' to return a duration
    });

    // For prometheus client style mocks (labels().inc(), labels().observe(), labels().set())
    // Resetting and re-mocking the chained calls:
    vi.mocked(counterProcess.labels).mockReturnThis();
    vi.mocked(counterProcess.inc).mockReturnThis(); // or mockReturnValue(undefined) if it doesn't chain further
    vi.mocked(histogramPostData.labels).mockReturnThis();
    vi.mocked(histogramPostData.observe).mockReturnValue(undefined);
    vi.mocked(histogramProcess.labels).mockReturnThis();
    vi.mocked(histogramProcess.observe).mockReturnValue(undefined);

    // setVolumeDataGauge and setVolumeDataMsisdnGauge are mocked as vi.fn() directly,
    // not as objects with .labels and .set methods in this test file's mock factory.
    // Thus, the following lines would cause errors and are removed.
    // vi.mocked(setVolumeDataGauge.labels).mockReturnThis();  // Re-add these lines
    // vi.mocked(setVolumeDataGauge.set).mockReturnValue(undefined); // Re-add these lines
    // vi.mocked(setVolumeDataMsisdnGauge.labels).mockReturnThis(); // Re-add these lines
    // vi.mocked(setVolumeDataMsisdnGauge.set).mockReturnValue(undefined); // Re-add these lines

    // For setVolumeDataGauge and setVolumeDataMsisdnGauge:
    // These are now simple vi.fn()s, so no .labels or .set to reset here.
    // vi.resetAllMocks() handles resetting them.
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('should successfully process a valid file', async () => {
    await processFile(mockFilePath, mockStats);

    expect(useCdrFileValidation).toHaveBeenCalledWith(mockFilePath, mockStats);
    expect(statsToCdrFile).toHaveBeenCalledWith(mockFilePath, mockStats);
    expect(readCdr).toHaveBeenCalledWith(mockFilePath);
    expect(convertToCDRFields).toHaveBeenCalledTimes(2);
    expect(convertToCDRFields).toHaveBeenCalledWith(['voice', '20230101000000', '123', 'subA', 'subB']);
    expect(convertToCDRFields).toHaveBeenCalledWith(['sms', '20230101000100', '0', 'subC', 'subD']);

    expect(counterProcess.labels).toHaveBeenCalledWith({ label: 'success' });
    expect(counterProcess.inc).toHaveBeenCalledTimes(1);
    expect(histogramProcess.labels).toHaveBeenCalledWith('success');
    expect(histogramProcess.observe).toHaveBeenCalled(); // Check if called, specific value is harder

    // Corrected assertions for setVolumeDataGauge and setVolumeDataMsisdnGauge
    // These are called once for all processed lines (valid and invalid combined for totals)
    expect(setVolumeDataGauge).toHaveBeenCalledTimes(1);
    expect(setVolumeDataGauge).toHaveBeenCalledWith(
      expect.objectContaining({ group: 'testPrefix', name: 'testFile.cdr' }), // The cdrFile object from statsToCdrFile mock
      100, // totalDownload for 'voice'
      0,   // totalUpload for 'voice' (assuming convertToCDRFields mock doesn't provide volumeUpload for voice)
           // + totalDownload for 'sms' (undefined)
           // + totalUpload for 'sms' (undefined)
      0,   // totalInvalidDownload
      0    // totalInvalidUpload
    );
    
    // These are called for each valid line
    expect(setVolumeDataMsisdnGauge).toHaveBeenCalledTimes(2);
    expect(setVolumeDataMsisdnGauge).toHaveBeenCalledWith(
      expect.objectContaining({ group: 'testPrefix', name: 'testFile.cdr' }),
      expect.objectContaining({ recordType: 'voice', subscriberIdA: 'subA', valid: true, volumeDownload: 100, amountPrerated: 0.5 })
    );
    expect(setVolumeDataMsisdnGauge).toHaveBeenCalledWith(
      expect.objectContaining({ group: 'testPrefix', name: 'testFile.cdr' }),
      expect.objectContaining({ recordType: 'sms', subscriberIdA: 'subC', valid: true, volumeDownload: undefined, amountPrerated: undefined })
    );

    expect(postData).toHaveBeenCalled();
    // const postDataCallArg = vi.mocked(postData).mock.calls[0][0]; // Old way for just first arg
    const postDataCallArguments = vi.mocked(postData).mock.calls[0]; // Get all args for the first call
    const cdrFileArg = postDataCallArguments[0]; // This is the 'cdrFile' object
    const linesArg = postDataCallArguments[1];   // This is the 'lines' array

    // Corrected assertions:
    expect(cdrFileArg.status).toBe('PROCESSING');
    expect(cdrFileArg.lineCount).toBe(2);
    expect(cdrFileArg.lineInvalidCount).toBe(0);
    
    expect(linesArg.length).toBe(2);
    expect(linesArg[0].subscriberIdA).toBe('subA');

    expect(histogramPostData.labels).toHaveBeenCalledWith('success');
    expect(histogramPostData.observe).toHaveBeenCalled();

    expect(logCdrFilename).toHaveBeenCalledWith('processFile', 'testFile.cdr');
    // To check specific logger methods, you'd access them via the mocked createLoggers or logCdrFilename
    // For example, if logCdrFilename().info was called:
    expect(vi.mocked(logCdrFilename)().info).toHaveBeenCalledWith(expect.stringContaining('CDR testFile.cdr Processed'), expect.any(Object));
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled();
  });

  it('should handle FileError from useCdrFileValidation', async () => {
    const validationError = new FileError('Validation failed');
    vi.mocked(useCdrFileValidation).mockImplementation(() => {
      throw validationError;
    });

    await processFile(mockFilePath, mockStats);

    expect(counterProcess.labels).toHaveBeenCalledWith({ label: 'invalid_cdr' }); // Corrected assertion
    expect(counterProcess.inc).toHaveBeenCalledTimes(1);
    expect(histogramProcess.labels).toHaveBeenCalledWith('failed');
    expect(histogramProcess.observe).toHaveBeenCalled();

    expect(vi.mocked(createLoggers)().logCdr.error).toHaveBeenCalledWith(
      validationError.message // Expect only the message, as per processFile.ts
    );

    expect(postData).toHaveBeenCalled();
    const postDataCallArguments = vi.mocked(postData).mock.calls[0];
    const cdrFileArg = postDataCallArguments[0]; // This is the 'cdrFile' object
    const linesArg = postDataCallArguments[1];   // This is the 'lines' array

    expect(cdrFileArg.name).toBe(mockFilePath); // Corrected: Check 'name' on cdrFileArg
    expect(cdrFileArg.status).toBe('ERROR');    // Corrected: Check 'status' on cdrFileArg
    expect(cdrFileArg.lineCount).toBe(0);       // Corrected: Check 'lineCount' on cdrFileArg
    expect(linesArg.length).toBe(0);            // Corrected: Check 'length' on the linesArg (empty array)

    expect(readCdr).not.toHaveBeenCalled();
    expect(convertToCDRFields).not.toHaveBeenCalled();
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled(); // Timer should still end
  });

  it('should handle readCdr returning empty data', async () => {
    vi.mocked(readCdr).mockReturnValue([]);

    await processFile(mockFilePath, mockStats);

    expect(vi.mocked(logCdrFilename)().warn).toHaveBeenCalledWith('File no info'); // Corrected assertion
    expect(postData).toHaveBeenCalled(); // Still called to update status
    
    const postDataCallArguments = vi.mocked(postData).mock.calls[0];
    const cdrFileArg = postDataCallArguments[0]; // This is the 'cdrFile' object
    const linesArg = postDataCallArguments[1];   // This is the 'lines' array

    expect(cdrFileArg.status).toBe('EMPTY_CONTENT');
    expect(cdrFileArg.lineCount).toBe(0);
    expect(linesArg.length).toBe(0); // Assert that the 'lines' array passed is empty
    expect(convertToCDRFields).not.toHaveBeenCalled();
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled();
  });

  it('should handle readCdr returning null', async () => {
    vi.mocked(readCdr).mockReturnValue(null as any); // Simulate null return

    await processFile(mockFilePath, mockStats);

    expect(vi.mocked(logCdrFilename)().warn).toHaveBeenCalledWith('File no info'); // Corrected assertion
     expect(postData).toHaveBeenCalled(); // Still called to update status
     const postDataCallArg = vi.mocked(postData).mock.calls[0][0];
    expect(postDataCallArg.cdrFile.status).toBe('EMPTY_CONTENT');
    expect(postDataCallArg.cdrFile.lineCount).toBe(0);
    expect(postDataCallArg.lines.length).toBe(0);
    expect(convertToCDRFields).not.toHaveBeenCalled();
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled();
  });


  it('should process lines with some invalid CDRs', async () => {
    vi.mocked(readCdr).mockReturnValue([
      ['voice', '20230101000000', '123', 'subA'],
      ['invalid_type', '20230101000100', '0', 'subB'], // This will be invalid
      ['sms', '20230101000200', '0', 'subC'],
    ]);

    vi.mocked(convertToCDRFields)
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: true, id: 'cdr-A', recordType: parts[0] as any, subscriberIdA: 'subA', volumeDownload: 10, amountPrerated: 0.1 }))
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: false, id: 'cdr-B', recordType: parts[0] as any, subscriberIdA: 'subB' })) // Invalid CDR
      .mockImplementationOnce((parts: string[]): Partial<CDRLine> => ({ valid: true, id: 'cdr-C', recordType: parts[0] as any, subscriberIdA: 'subC', volumeDownload: 0, amountPrerated: 0.05 }));

    await processFile(mockFilePath, mockStats);

    expect(convertToCDRFields).toHaveBeenCalledTimes(3);
    expect(postData).toHaveBeenCalled();
    const postDataCall = vi.mocked(postData).mock.calls[0];
    const cdrFileArgFromPostData = postDataCall[0]; // First argument to postData
    const linesArgFromPostData = postDataCall[1];   // Second argument to postData

    expect(cdrFileArgFromPostData.lineCount).toBe(3);
    expect(cdrFileArgFromPostData.lineInvalidCount).toBe(1);
    expect(linesArgFromPostData.length).toBe(2); // Use the second argument for lines array
    expect(linesArgFromPostData.map((l: CDRLine) => l.id)).toEqual(['cdr-A', 'cdr-C']);

    // Check MsisdnGauge calls for valid lines
    // N.B. setVolumeDataMsisdnGauge is called for each *valid* line.
    // convertToCDRFields mock:
    //  - 1st call: valid, voice, subA, amountPrerated: 0.1 (this is what was in the original test for set call)
    //  - 2nd call: invalid, invalid_type, subB
    //  - 3rd call: valid, sms, subC, amountPrerated: 0.05 (this is what was in the original test for set call)
    
    // Asserting the calls based on the corrected understanding of setVolumeDataMsisdnGauge
    expect(setVolumeDataMsisdnGauge).toHaveBeenCalledWith(
        expect.objectContaining({ group: 'testPrefix', name: 'testFile.cdr' }),
        expect.objectContaining({ valid: true, subscriberIdA: 'subA', recordType: 'voice', amountPrerated: 0.1 })
    );
    // The invalid line for subB should not trigger a call to setVolumeDataMsisdnGauge
    expect(setVolumeDataMsisdnGauge).not.toHaveBeenCalledWith(
        expect.anything(), // cdrFile can be anything here
        expect.objectContaining({ subscriberIdA: 'subB' })
    );
    expect(setVolumeDataMsisdnGauge).toHaveBeenCalledWith(
        expect.objectContaining({ group: 'testPrefix', name: 'testFile.cdr' }),
        expect.objectContaining({ valid: true, subscriberIdA: 'subC', recordType: 'sms', amountPrerated: 0.05 })
    );
    
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled();
  });

  it('should handle postData failure', async () => {
    const postError = new Error('Post failed');
    vi.mocked(postData).mockRejectedValue(postError);

    await processFile(mockFilePath, mockStats);

    expect(postData).toHaveBeenCalled();
    expect(histogramPostData.labels).toHaveBeenCalledWith('error');
    expect(histogramPostData.observe).toHaveBeenCalled();
    // The main processFile function itself doesn't throw, but logs error via postData's catch
    // No direct logCdr.error for this in processFile, but postData might log it.
    // For this test, we only check metrics related to postData.
    expect(vi.mocked(logCdrFilename)().end).toHaveBeenCalled();
  });
});
