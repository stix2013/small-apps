import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setVolumeDataGauge } from '../set-volume-data';
import type { CDRFileInfo } from '@src/cdr/stats-to-cdr-file';
import { gaugeVolumeData } from '@src/monitoring/prometheus';

// Mock gaugeVolumeData
const mockLabels = vi.fn().mockReturnThis();
const mockSet = vi.fn();
vi.mock('@src/monitoring/prometheus', () => ({
  gaugeVolumeData: {
    labels: mockLabels,
    set: mockSet, // As per pattern: labels().set() means labels returns 'this', then .set is called on 'this'.
  },
}));

describe('setVolumeDataGauge', () => {
  const mockCdrFile: CDRFileInfo = {
    id: 'file2',
    name: 'anotherTestfile.cdr',
    path: '/path/to/anotherTestfile.cdr',
    prefix: 'anotherGroup', // Corresponds to 'group'
    size: 2048,
    lineCount: 20,
    lineInvalidCount: 2,
    status: 'PROCESSED',
    createdAt: new Date(),
    updatedAt: new Date(),
    startProcessingAt: Date.now(),
    endProcessingAt: Date.now() + 2000,
    processingTimeInSeconds: 2,
    // nulli corresponds to 'offset' when offset parameter is not provided to setVolumeDataGauge
    nulli: 0,
    codeOperator: 'OpNet', // Not directly used in labels by setVolumeDataGauge, but part of type
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockLabels.mockClear().mockReturnThis();
    mockSet.mockClear();
    // Ensure the mock setup is correct for labels().set() pattern
    vi.mocked(gaugeVolumeData.labels).mockImplementation(mockLabels);
    gaugeVolumeData.set = mockSet;
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
        offset: 789, // from cdrFileWithSpecificNulli.nulli
      });
      expect(mockSet).toHaveBeenNthCalledWith(1, totalDownload);

      // 2. Valid Upload
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(2, {
        type: 'upload',
        valid: 'true',
        group: 'anotherGroup',
        offset: 789, // from cdrFileWithSpecificNulli.nulli
      });
      expect(mockSet).toHaveBeenNthCalledWith(2, totalUpload);
      
      // 3. Invalid Download
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(3, {
        type: 'download',
        valid: 'false',
        group: 'anotherGroup',
        offset: 789, // from cdrFileWithSpecificNulli.nulli
      });
      expect(mockSet).toHaveBeenNthCalledWith(3, totalInvalidDownload);

      // 4. Invalid Upload
       expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(4, {
        type: 'upload',
        valid: 'false',
        group: 'anotherGroup',
        offset: 789, // from cdrFileWithSpecificNulli.nulli
      });
      expect(mockSet).toHaveBeenNthCalledWith(4, totalInvalidUpload);
    });
    
    it('should use 0 for offset if offset param is undefined and cdrFile.nulli is also undefined/null', () => {
      const cdrFileWithUndefinedNulli = { ...mockCdrFile, nulli: undefined as any };

      setVolumeDataGauge(
        cdrFileWithUndefinedNulli,
        totalDownload,
        totalUpload,
        totalInvalidDownload,
        totalInvalidUpload
      );
      expect(gaugeVolumeData.labels).toHaveBeenCalledTimes(4);
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(1,expect.objectContaining({ offset: 0 }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(2,expect.objectContaining({ offset: 0 }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(3,expect.objectContaining({ offset: 0 }));
      expect(gaugeVolumeData.labels).toHaveBeenNthCalledWith(4,expect.objectContaining({ offset: 0 }));
    });
  });
});
