import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setVolumeDataMsisdnGauge } from '../set-volume-data-msisdn';
import { gaugeMsisdnVolumeData } from '@src/monitoring/prometheus/cdr';
import { CDRFileInfo, CDRLine } from '@src/types';

// Use vi.hoisted to define mocks that need to be used in vi.mock factories
const { mockLabels, mockSet } = vi.hoisted(() => {
  return {
    mockLabels: vi.fn().mockReturnThis(),
    mockSet: vi.fn()
  };
});

vi.mock('@src/monitoring/prometheus/cdr', () => ({
  gaugeMsisdnVolumeData: {
    labels: mockLabels, // Now mockLabels is properly initialized
    set: mockSet,       // Now mockSet is properly initialized
  },
}));

describe('setVolumeDataMsisdnGauge', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // This resets mockLabels and mockSet to basic vi.fn()

    // mockLabels is one of the consts from vi.hoisted, e.g.:
    // const { mockLabels, mockSet } = vi.hoisted(() => ({
    //   mockLabels: vi.fn().mockReturnThis(),
    //   mockSet: vi.fn()
    // }));
    // After vi.resetAllMocks(), mockLabels loses its .mockReturnThis() behavior. Re-apply it.
    mockLabels.mockReturnThis();
    // mockSet is fine as a basic vi.fn() after reset.
  });

  it('should correctly set gauges for valid CDR data', () => {
    // Corrected mockCdrFile to align with CDRFileInfo from '@src/types/index.ts'
    const mockCdrFile: CDRFileInfo = {
      group: 'testGroup',
      name: 'testfile.cdr',
      number: 'file1_num', // Added required property
      lines: { // Added required property
        total: 10,
        invalid: 0
      }
    };

    // Enhanced mockCdrLine to include properties used for labels
    const mockCdrLine: CDRLine = {
      id: 'line1',
      number: '12345',
      imsi: '123456789012345',
      eventTimestamp: new Date('2023-10-01T12:00:00Z'),
      eventTimestampNumber: 1696156800000,
      callIdentification: '123456789012345',// Example timestamp in milliseconds
      apn: 'internet',
      recordType: 'SMS',
      eventDuration: 60,
      msisdn: '12345', // Explicitly using 'msisdn'
      valid: true,
      volumeDownload: 100,
      volumeUpload: 50,
      amountPrerated: 0.1, // Not directly used in these labels, but good for completeness
      codeOperator: 'TestNet', // Used for 'network' label
      nulli: 0, // Used for 'offset' label
      errors: null,
    };

    setVolumeDataMsisdnGauge(mockCdrFile, mockCdrLine);

    expect(gaugeMsisdnVolumeData.labels).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledTimes(2);

    // First call for download
    expect(gaugeMsisdnVolumeData.labels).toHaveBeenNthCalledWith(1, {
      type: 'download',
      group: 'testGroup', // From mockCdrFile.group
      valid: 'true',      // Hardcoded in function
      msisdn: '12345',    // From mockCdrLine.msisdn
      offset: 0,          // From mockCdrLine.nulli
      network: 'TestNet', // From mockCdrLine.codeOperator
    });
    expect(mockSet).toHaveBeenNthCalledWith(1, 100);

    // Second call for upload
    expect(gaugeMsisdnVolumeData.labels).toHaveBeenNthCalledWith(2, {
      type: 'upload',
      group: 'testGroup', // From mockCdrFile.group
      valid: 'true',      // Hardcoded in function
      msisdn: '12345',    // From mockCdrLine.msisdn
      offset: 0,          // From mockCdrLine.nulli
      network: 'TestNet', // From mockCdrLine.codeOperator
    });
    expect(mockSet).toHaveBeenNthCalledWith(2, 50);
  });
});
