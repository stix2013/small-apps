import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setVolumeDataMsisdnGauge } from '../set-volume-data-msisdn';
import type { CDRLine } from '@src/cdr/convert-to-cdr-fields';
import type { CDRFileInfo } from '@src/cdr/stats-to-cdr-file';
import { gaugeMsisdnVolumeData } from '@src/monitoring/prometheus/cdr';

// Mock gaugeMsisdnVolumeData
const mockLabels = vi.fn().mockReturnThis();
const mockSet = vi.fn();
vi.mock('@src/monitoring/prometheus/cdr', () => ({
  gaugeMsisdnVolumeData: {
    labels: mockLabels,
    set: mockSet, // This is not directly used in the function, labels().set() is
  },
}));

describe('setVolumeDataMsisdnGauge', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Ensure the mock implementation is fresh for labels().set()
    mockLabels.mockClear().mockReturnThis(); // mockReturnThis is important
    // gaugeMsisdnVolumeData.labels itself returns an object with 'set', so we ensure 'set' is also fresh.
    // However, because mockLabels returns 'this' (the gaugeMsisdnVolumeData mock itself),
    // we need to ensure the 'set' method on the main mock object is the one being tracked if not mocking deeper.
    // Let's adjust the mock slightly for clarity if labels().set() is the pattern.
    // The initial mock structure implies gaugeMsisdnVolumeData.labels().set()
    // So, gaugeMsisdnVolumeData.labels returns an object (mockReturnThis = the main mock) that has a .set method.
    // So we re-assign gaugeMsisdnVolumeData.set to a new vi.fn() if that was the intent.
    // Or, if gaugeMsisdnVolumeData.labels returns a *different* object that has .set, that's more complex.
    // Given `labels = vi.fn().mockReturnThis()`, it means `gaugeMsisdnVolumeData.labels()` returns `gaugeMsisdnVolumeData`.
    // So `gaugeMsisdnVolumeData.labels().set()` is actually `gaugeMsisdnVolumeData.set()`.
    // Therefore, we just need to reset `mockSet`.
    mockSet.mockClear();
     // Re-assign the mock implementation for labels to return 'this' which has the 'set' method
    vi.mocked(gaugeMsisdnVolumeData.labels).mockImplementation(mockLabels);
    // And ensure the 'set' method on the main object is the one we are tracking
    gaugeMsisdnVolumeData.set = mockSet;


  });

  it('should correctly set gauges for valid CDR data', () => {
    const mockCdrFile: CDRFileInfo = {
      id: 'file1',
      name: 'testfile.cdr',
      path: '/path/to/testfile.cdr',
      prefix: 'testGroup', // Corresponds to 'group' in labels
      size: 1024,
      lineCount: 10,
      lineInvalidCount: 0,
      status: 'PROCESSED',
      createdAt: new Date(),
      updatedAt: new Date(),
      startProcessingAt: Date.now(),
      endProcessingAt: Date.now() + 1000,
      processingTimeInSeconds: 1,
      // These are not directly used by setVolumeDataMsisdnGauge but are part of the type
      codeOperator: 'TestNet', // Corresponds to 'network'
      nulli: 0, // Corresponds to 'offset'
    };

    const mockCdrLine: CDRLine = {
      id: 'line1',
      recordType: 'voice',
      timestamp: new Date(),
      eventDuration: 60,
      subscriberIdA: '12345', // Corresponds to 'msisdn'
      valid: true,
      volumeDownload: 100,
      volumeUpload: 50,
      // Other fields are not directly used by this function but are part of the type
      amountPrerated: 0.1,
      eventResult: 'SUCCESS',
      locationSubscriberA: 'locA',
    };

    setVolumeDataMsisdnGauge(mockCdrFile, mockCdrLine);

    expect(gaugeMsisdnVolumeData.labels).toHaveBeenCalledTimes(2);
    // gaugeMsisdnVolumeData.set is called after each labels call because labels returns 'this'
    expect(mockSet).toHaveBeenCalledTimes(2);


    // First call for download
    expect(gaugeMsisdnVolumeData.labels).toHaveBeenNthCalledWith(1, {
      type: 'download',
      group: 'testGroup',
      valid: 'true',
      msisdn: '12345',
      offset: 0,
      network: 'TestNet',
    });
    expect(mockSet).toHaveBeenNthCalledWith(1, 100);

    // Second call for upload
    expect(gaugeMsisdnVolumeData.labels).toHaveBeenNthCalledWith(2, {
      type: 'upload',
      group: 'testGroup',
      valid: 'true',
      msisdn: '12345',
      offset: 0,
      network: 'TestNet',
    });
    expect(mockSet).toHaveBeenNthCalledWith(2, 50);
  });
});
