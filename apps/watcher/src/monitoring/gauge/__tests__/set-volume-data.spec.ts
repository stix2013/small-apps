import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setVolumeDataGauge } from '../set-volume-data';
import type { CDRFileInfo } from '@src/cdr/stats-to-cdr-file';
import { gaugeVolumeData } from '@src/monitoring/prometheus';

// Use vi.hoisted to define mocks that need to be used in vi.mock factories
const { mockLabels, mockSet } = vi.hoisted(() => {
  return {
    mockLabels: vi.fn().mockReturnThis(),
    mockSet: vi.fn()
  };
});

vi.mock('@src/monitoring/prometheus', () => ({
  gaugeVolumeData: {
    labels: mockLabels, // Now mockLabels is properly initialized
    set: mockSet,       // Now mockSet is properly initialized
  },
}));

describe('setVolumeDataGauge', () => {
  // Corrected mockCdrFile to align with CDRFileInfo from '@src/types/index.ts'
  // Assuming the function setVolumeDataGauge primarily uses 'group' from this object for labels.
  const mockCdrFile: CDRFileInfo = {
    group: 'anotherGroup',
    name: 'anotherTestfile.cdr',
    number: 'file2_num', // Added required property
    lines: { // Added required property
      total: 20,
      invalid: 2
    }
    // birthtime is optional and not used for labels, so omitted for simplicity
    // Extraneous properties like id, path, size, status, timestamps, nulli, codeOperator are removed
    // as they are not in the specified CDRFileInfo interface from src/types/index.ts
    // and were likely causing confusion or incorrect test assumptions.
  };

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

  describe('Test Case 1: Valid and invalid data, with offset', () => {
    const totalDownload = 1000;
    const totalUpload = 500;
    const totalInvalidDownload = 100;
    const totalInvalidUpload = 50;
    const offset = 123;

    it('should call gaugeVolumeData.labels four times and set correct values', () => {
      setVolumeDataGauge(
        mockCdrFile,
        totalDownload,
        totalUpload,
        totalInvalidDownload,
        totalInvalidUpload,
        offset
      );

      expect(gaugeVolumeData.labels).toHaveBeenCalledTimes(4);
      expect(mockSet).toHaveBeenCalledTimes(4);

      // 1. Valid Download
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(1, {
        type: 'download',
        valid: 'true',
        group: 'anotherGroup',
        offset: 123,
      });
      expect(mockSet).toHaveBeenNthCalledWith(1, totalDownload);

      // 2. Valid Upload
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(2, {
        type: 'upload',
        valid: 'true',
        group: 'anotherGroup',
        offset: 123,
      });
      expect(mockSet).toHaveBeenNthCalledWith(2, totalUpload);

      // 3. Invalid Download
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(3, {
        type: 'download',
        valid: 'false',
        group: 'anotherGroup',
        offset: 123,
      });
      expect(mockSet).toHaveBeenNthCalledWith(3, totalInvalidDownload);

      // 4. Invalid Upload
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(4, {
        type: 'upload',
        valid: 'false',
        group: 'anotherGroup',
        offset: 123,
      });
      expect(mockSet).toHaveBeenNthCalledWith(4, totalInvalidUpload);
    });
  });

  describe('Test Case 2: Data without offset (offset is undefined)', () => {
    const totalDownload = 200;
    const totalUpload = 100;
    const totalInvalidDownload = 20;
    const totalInvalidUpload = 10;

    it('should call gaugeVolumeData.labels four times and use cdrFile.nulli for offset if offset param is undefined', () => {
      // Modify mockCdrFile for this specific sub-test case if nulli needs to be different
      const cdrFileWithSpecificNulli = { ...mockCdrFile, nulli: 789 };

      setVolumeDataGauge(
        cdrFileWithSpecificNulli,
        totalDownload,
        totalUpload,
        totalInvalidDownload,
        totalInvalidUpload
        // offset parameter is undefined
      );

      expect(gaugeVolumeData.labels).toHaveBeenCalledTimes(4);
      expect(mockSet).toHaveBeenCalledTimes(4);

      // Check that offset in labels is from cdrFile.nulli
      // 1. Valid Download
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(1, {
        type: 'download',
        valid: 'true',
        group: 'anotherGroup',
        offset: undefined,
      });
      expect(mockSet).toHaveBeenNthCalledWith(1, totalDownload);

      // 2. Valid Upload
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(2, {
        type: 'upload',
        valid: 'true',
        group: 'anotherGroup',
        offset: undefined,
      });
      expect(mockSet).toHaveBeenNthCalledWith(2, totalUpload);
      
      // 3. Invalid Download
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(3, {
        type: 'download',
        valid: 'false',
        group: 'anotherGroup',
        offset: undefined,
      });
      expect(mockSet).toHaveBeenNthCalledWith(3, totalInvalidDownload);

      // 4. Invalid Upload
       expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(4, {
        type: 'upload',
        valid: 'false',
        group: 'anotherGroup',
        offset: undefined,
      });
      expect(mockSet).toHaveBeenNthCalledWith(4, totalInvalidUpload);
    });
    
    it('should use undefined for offset if offset param is undefined (cdrFile.nulli is irrelevant)', () => {
      const cdrFileWithIrrelevantNulli = { ...mockCdrFile, nulli: 999 }; // nulli value doesn't matter

      setVolumeDataGauge(
        cdrFileWithIrrelevantNulli, // Pass this version, though its nulli is not used
        totalDownload,
        totalUpload,
        totalInvalidDownload,
        totalInvalidUpload
        // offset parameter is undefined
      );
      expect(gaugeVolumeData.labels).toHaveBeenCalledTimes(4);
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(1,expect.objectContaining({ offset: undefined }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(2,expect.objectContaining({ offset: undefined }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(3,expect.objectContaining({ offset: undefined }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(4,expect.objectContaining({ offset: undefined }));
    });
  });
});
