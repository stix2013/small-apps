import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertToCDRFields } from '../convert-to-cdr-fields';
import { validateCdrType } from '@src/validation/cdr-type';
import { v4 as uuidV4 } from 'uuid';

// Mock external dependencies
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

vi.mock('@src/validation/cdr-type', () => ({
  validateCdrType: vi.fn(),
}));

describe('convertToCDRFields', () => {
  const mockDate = new Date('2023-10-26T12:00:00.000Z'); // This might need adjustment later
  const mockUuid = 'test-uuid';

  beforeEach(() => {
    vi.resetAllMocks();
    (uuidV4 as Mock).mockReturnValue(mockUuid);
    // getDateFromFormatted is now inlined, so we don't mock it here.
    // The tests will use the actual implementation.
  });

  it('should correctly process a valid CDR line', () => {
    (validateCdrType as Mock).mockReturnValue('voice'); // Ensure this is a valid CDRType recognized by the function
    const cdrLineParts = [
      'voice',          // line[0] recordType
      '08123456789',    // line[1] number
      '08987654321',    // line[2] numberB
      '08987654321',    // line[3] numberDialed
      'msisdn001',      // line[4] msisdn
      'imsi001',        // line[5] imsi
      '20231026120000', // line[6] eventTimestamp
      '60',             // line[7] eventDuration
      '1024',           // line[8] volumeDownload
      '512',            // line[9] volumeUpload
      'OP001',          // line[10] codeOperator
      '0.25',           // line[11] amountPrerated
      'internet.apn',   // line[12] apn
      '7',              // line[13] nulli (timeOffset)
      'broadworks_data',// line[14] broadWorks
      'tele_S01',       // line[15] codeTeleService
      'bearer_B02',     // line[16] codeBearerService
      'overseas_X1',    // line[17] codeOverseas
      'video_yes',      // line[18] videoIndicator
      'source_A',       // line[19] source
      'service_01',     // line[20] serviceId
      '',               // line[21] (unused quantity)
      '',               // line[22] (unused custNumber)
      'Call to B',      // line[23] description
      'CID001'          // line[24] callIdentification
    ];

    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true);
    expect(result.id).toBe(mockUuid);
    expect(validateCdrType).toHaveBeenCalledWith('voice');
    // getDateFromFormatted is now inlined; direct call checks are removed.
    // We will rely on checking the resulting eventTimestamp.
    expect(result.recordType).toBe('voice');
    expect(result.number).toBe('08123456789');
    expect(result.numberB).toBe('08987654321');
    expect(result.numberDialed).toBe('08987654321');
    expect(result.msisdn).toBe('msisdn001');
    expect(result.imsi).toBe('imsi001');
    expect(result.eventTimestamp).toEqual(new Date('2023-10-26T11:53:00.000Z')); // Actual expected date
    expect(result.eventTimestampNumber).toBe(20231026120000);
    expect(result.eventDuration).toBe(60);
    expect(result.volumeDownload).toBe(1024);
    expect(result.volumeUpload).toBe(512);
    expect(result.codeOperator).toBe('OP001');
    expect(result.amountPrerated).toBe(0.25);
    expect(result.apn).toBe('internet.apn');
    expect(result.nulli).toBe(7);
    expect(result.broadWorks).toBe('broadworks_data');
    expect(result.codeTeleService).toBe('tele_S01');
    expect(result.codeBearerService).toBe('bearer_B02');
    expect(result.codeOverseas).toBe('overseas_X1');
    expect(result.videoIndicator).toBe('video_yes');
    expect(result.source).toBe('source_A');
    expect(result.serviceId).toBe('service_01');
    expect(result.description).toBe('Call to B');
    expect(result.callIdentification).toBe('CID001');
  });

  it('should handle invalid recordType when validateCdrType throws an error', () => {
    const error = new Error('Invalid CDR Type');
    (validateCdrType as Mock).mockImplementation(() => {
      throw error;
    });

    const cdrLineParts = [
      'invalid_type',   // line[0]
      'num1',           // line[1]
      'num2',           // line[2]
      'num3',           // line[3]
      'msisdn1',        // line[4]
      'imsi1',          // line[5]
      '20231026123000', // line[6] eventTimestamp
      '30',             // line[7] eventDuration
      '0',              // line[8] volumeDownload
      '0',              // line[9] volumeUpload
      'OP01',           // line[10] codeOperator
      '0.0',            // line[11] amountPrerated
      'apn.net',        // line[12] apn
      '0',              // line[13] nulli (timeOffset) - CRITICAL
    ];
    // Ensure array has 25 elements for safety, matching convertToCDRFields structure
    while(cdrLineParts.length < 25) cdrLineParts.push('');


    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(false);
    expect(result.id).toBe(mockUuid); // Assuming mockUuid is 'test-uuid' from beforeEach
    expect(validateCdrType).toHaveBeenCalledWith('invalid_type');
    // getDateFromFormatted is now inlined; direct call checks are removed.
    expect(result.recordType).toBe('invalid_type');
    expect(result.eventTimestamp).toEqual(new Date('2023-10-26T12:30:00.000Z')); // Actual expected date
    expect(result.eventDuration).toBe(30);
    expect(result.msisdn).toBe('msisdn1');
  });

  it('should handle edge cases for numeric parsing (missing or malformed values)', () => {
    (validateCdrType as Mock).mockReturnValue('sms'); // Ensure 'sms' is a valid CDRType

    const cdrLineParts = [
      'sms',            // line[0] recordType
      'any_number',     // line[1]
      'any_numberB',    // line[2]
      'any_dialed',     // line[3]
      'sms_msisdn',     // line[4] msisdn
      'sms_imsi',       // line[5] imsi
      '20231026130000', // line[6] eventTimestamp
      '',               // line[7] eventDuration (empty string)
      'abc',            // line[8] volumeDownload (malformed)
      '',               // line[9] volumeUpload (empty string)
      'OP002',          // line[10] codeOperator
      'xyz',            // line[11] amountPrerated (malformed)
      'sms.apn',        // line[12] apn
      '-5',             // line[13] nulli (timeOffset, e.g., a negative offset)
      // ... other fields can be minimal or empty strings
    ];
    // Fill up to index 13 if not already
    while(cdrLineParts.length <= 13) cdrLineParts.push('');


    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true); // As per original logic, only validateCdrType makes it invalid
    expect(result.id).toBe(mockUuid);
    expect(validateCdrType).toHaveBeenCalledWith('sms');
    // getDateFromFormatted is now inlined; direct call checks are removed.
    expect(result.recordType).toBe('sms');
    // The actual date will be 2023-10-26 13:00:00 with an offset of -00:05
    // which means 2023-10-26T13:05:00.000Z
    expect(result.eventTimestamp).toEqual(new Date('2023-10-26T13:05:00.000Z'));
    expect(result.eventDuration).toBe(0);      // parseInt('') || 0
    expect(result.volumeDownload).toBe(NaN);    // parseInt('abc') - will be NaN
    expect(result.volumeUpload).toBe(NaN);      // parseInt('') - will be NaN
    expect(result.amountPrerated).toBe(0.0);    // parseFloat('xyz') || 0.0
    expect(result.nulli).toBe(-5);
    expect(result.msisdn).toBe('sms_msisdn');
  });

  it('should handle optional fields being undefined (not present in array)', () => {
    (validateCdrType as Mock).mockReturnValue('data'); // Ensure 'data' is a valid CDRType
    const cdrLineParts = [
      'data',           // line[0] recordType
      'num_only',       // line[1] number
      '',               // line[2] numberB (empty)
      '',               // line[3] numberDialed (empty)
      'msisdn_data',    // line[4] msisdn
      '',               // line[5] imsi (empty)
      '20231026140000', // line[6] eventTimestamp
      '500',            // line[7] eventDuration
      '2048',           // line[8] volumeDownload
      '0',              // line[9] volumeUpload (explicitly 0)
      'OP_DATA',        // line[10] codeOperator
      '0.0',            // line[11] amountPrerated
      'data.apn',       // line[12] apn
      '0',              // line[13] nulli (timeOffset) - FIX: Explicitly set to "0"
      // line[14] (broadWorks) onwards will be undefined if not explicitly set
      // and if the array length is exactly 14. If shorter, they are still undefined.
    ];
    // If the intent is to test that fields at index 14+ are undefined due to array length,
    // and line[13] must be "0", the array should have length 14.
    // If cdrLineParts.length is already 14 (as it is by the definition above), this loop does nothing.
    // If it was shorter, it would extend it. For this specific fix, line[13] is the key.
    while(cdrLineParts.length < 14) cdrLineParts.push('');


    const result = convertToCDRFields(cdrLineParts);

    expect(result.valid).toBe(true);
    expect(result.id).toBe(mockUuid);
    // getDateFromFormatted is now inlined; direct call checks are removed.
    expect(result.recordType).toBe('data');
    expect(result.number).toBe('num_only');
    expect(result.numberB).toBe('');
    expect(result.msisdn).toBe('msisdn_data');
    // The actual date will be 2023-10-26 14:00:00 with an offset of +00:00
    expect(result.eventTimestamp).toEqual(new Date('2023-10-26T14:00:00.000Z'));
    expect(result.eventDuration).toBe(500);
    expect(result.volumeDownload).toBe(2048);
    expect(result.volumeUpload).toBe(0); // parseInt('0') is 0
    expect(result.amountPrerated).toBe(0.0);
    expect(result.apn).toBe('data.apn');
    expect(result.nulli).toBe(0);
    // Fields from line[14] onwards should be undefined if not set by convertToCDRFields
    expect(result.broadWorks).toBeUndefined();
    expect(result.codeTeleService).toBeUndefined();
    // ... and so on for other fields like description, callIdentification
    expect(result.description).toBeUndefined();
    expect(result.callIdentification).toBeUndefined();
  });
});
