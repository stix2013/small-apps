import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { convertToCDRFields } from '../convert-to-cdr-fields';
import { validateCdrType } from '@src/validation/cdr-type';
import { getDateFromFormatted } from '@yellow-mobile/utils';
import { v4 as uuidV4 } from 'uuid';

// Mock external dependencies
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

vi.mock('@src/validation/cdr-type', () => ({
  validateCdrType: vi.fn(),
}));

vi.mock('@yellow-mobile/utils', () => ({
  getDateFromFormatted: vi.fn(),
}));

describe('convertToCDRFields', () => {
  const mockDate = new Date('2023-10-26T12:00:00.000Z');
  const mockUuid = 'test-uuid';

  beforeEach(() => {
    vi.resetAllMocks();
    (uuidV4 as Mock).mockReturnValue(mockUuid);
    (getDateFromFormatted as Mock).mockReturnValue(mockDate);
  });

  it('should correctly process a valid CDR line', () => {
    (validateCdrType as Mock).mockReturnValue('voice'); // Assuming 'voice' is a valid CDRType
    const cdrLineParts = [
      'voice', // recordType
      '20231026120000', // timestamp
      '12345', // eventDuration
      'subscriber123', // subscriberIdA
      'subscriber456', // subscriberIdB (optional)
      'loc1', // locationSubscriberA
      'loc2', // locationSubscriberB (optional)
      'SUCCESS', // eventResult
      '100', // volumeDownload (optional)
      '50', // volumeUpload (optional)
      '0.15', // amountPrerated (optional)
      'some-other-data', // any other parts
    ];

    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true);
    expect(result.id).toBe(mockUuid);
    expect(validateCdrType).toHaveBeenCalledWith('voice');
    expect(getDateFromFormatted).toHaveBeenCalledWith('20231026120000');
    expect(result.recordType).toBe('voice');
    expect(result.eventTimestamp).toEqual(mockDate);
    expect(result.eventDuration).toBe(12345);
    // expect(result.subscriberIdA).toBe('subscriber123');
    // expect(result.subscriberIdB).toBe('subscriber456');
    // expect(result.locationSubscriberA).toBe('loc1');
    // expect(result.locationSubscriberB).toBe('loc2');
    // expect(result.eventResult).toBe('SUCCESS');
    expect(result.volumeDownload).toBe(100);
    expect(result.volumeUpload).toBe(50);
    expect(result.amountPrerated).toBe(0.15);
  });

  it('should handle invalid recordType when validateCdrType throws an error', () => {
    const error = new Error('Invalid CDR Type');
    (validateCdrType as Mock).mockImplementation(() => {
      throw error;
    });

    const cdrLineParts = [
      'invalid_type', // recordType
      '20231026120000', // timestamp
      '12345', // eventDuration
      // ... other fields can be minimal as the focus is on recordType validation
    ];

    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(false);
    expect(result.id).toBe(mockUuid); // id should still be generated
    expect(validateCdrType).toHaveBeenCalledWith('invalid_type');
    expect(getDateFromFormatted).toHaveBeenCalledWith('20231026120000'); // This will still be called
    // The current implementation sets result.recordType before the try-catch.
    // If it were inside, it might be undefined or a default.
    // Based on the provided code, it will be 'invalid_type'.
    expect(result.recordType).toBe('invalid_type');
    expect(result.eventTimestamp).toEqual(mockDate); // timestamp is processed
    expect(result.eventDuration).toBe(12345); // eventDuration is processed
  });

  it('should handle edge cases for numeric parsing (missing or malformed values)', () => {
    (validateCdrType as Mock).mockReturnValue('sms'); // Assuming 'sms' is a valid CDRType

    const cdrLineParts = [
      'sms', // recordType
      '20231026120000', // timestamp
      '', // eventDuration (empty string)
      'subscriber123', // subscriberIdA
      'subscriber456', // subscriberIdB
      'loc1', // locationSubscriberA
      'loc2', // locationSubscriberB
      'SUCCESS', // eventResult
      'abc', // volumeDownload (malformed)
      '', // volumeUpload (empty string)
      'xyz', // amountPrerated (malformed)
    ];

    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true); // Still valid as per current logic, only recordType makes it invalid
    expect(result.id).toBe(mockUuid);
    expect(validateCdrType).toHaveBeenCalledWith('sms');
    expect(getDateFromFormatted).toHaveBeenCalledWith('20231026120000');
    expect(result.recordType).toBe('sms');
    expect(result.eventTimestamp).toEqual(mockDate);
    expect(result.eventDuration).toBe(0); // parseInt('') || 0 results in 0
    // expect(result.subscriberIdA).toBe('subscriber123');
    // expect(result.subscriberIdB).toBe('subscriber456');
    // expect(result.locationSubscriberA).toBe('loc1');
    // expect(result.locationSubscriberB).toBe('loc2');
    // expect(result.eventResult).toBe('SUCCESS');
    expect(result.volumeDownload).toBe(0); // parseFloat('abc') || 0 results in 0
    expect(result.volumeUpload).toBe(0); // parseFloat('') || 0 results in 0
    expect(result.amountPrerated).toBe(0); // parseFloat('xyz') || 0 results in 0
  });

  it('should handle optional fields being undefined (not present in array)', () => {
    (validateCdrType as Mock).mockReturnValue('data'); // Assuming 'data' is a valid CDRType
    const cdrLineParts = [
      'data', // recordType
      '20231026120000', // timestamp
      '500', // eventDuration
      'subscriberOnlyA', // subscriberIdA
      // subscriberIdB is missing
    ];
    // Fill remaining parts up to amountPrerated (index 10) with undefined effectively
    // by having a shorter array.

    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true);
    expect(result.id).toBe(mockUuid);
    expect(result.recordType).toBe('data');
    expect(result.eventTimestamp).toEqual(mockDate);
    expect(result.eventDuration).toBe(500);
    // expect(result.subscriberIdA).toBe('subscriberOnlyA');
    // expect(result.subscriberIdB).toBeUndefined();
    // expect(result.locationSubscriberA).toBeUndefined();
    // expect(result.locationSubscriberB).toBeUndefined();
    // expect(result.eventResult).toBeUndefined();
    expect(result.volumeDownload).toBe(0); // Default due to || 0
    expect(result.volumeUpload).toBe(0); // Default due to || 0
    expect(result.amountPrerated).toBe(0); // Default due to || 0
  });
});
