import i18n from '@src/i18n'; // Adjust path as necessary

// Initialize i18next and load namespaces before tests run
beforeAll(async () => {
  // Ensure that i18next is initialized before tests run
  // The init method is asynchronous, so we need to wait for it to complete.
  if (!i18n.isInitialized) {
    // We need to wait for i18next to be initialized.
    // The initialization happens in i18n.ts, but it's async.
    // A common way to handle this is to listen for the 'initialized' event.
    await new Promise((resolve) => {
      i18n.on('initialized', resolve);
      // If it's already initialized by the time we set the listener, resolve immediately.
      if (i18n.isInitialized) resolve(true);
    });
  }
  await i18n.changeLanguage('en'); // Ensure English is loaded
});

describe('i18n', () => {
  it('should load translations correctly', () => {
    // Test a key from file-error.ts translations
    expect(i18n.t('fileError.defaultName')).toBe('FileError');

    // Test a key from process-file.ts translations
    const expectedInvalidCdr = 'Invalid CDR file: test.cdr';
    expect(i18n.t('processFile.invalidCdr', { fileName: 'test.cdr' })).toBe(expectedInvalidCdr);

    const expectedEmptyContent = 'File no info: empty.cdr';
    expect(i18n.t('processFile.emptyContent', { fileName: 'empty.cdr' })).toBe(expectedEmptyContent);

    const expectedLineInfo = 'Line 1 msisdn: 12345 down: 100 up:50 timestamp: 2023-01-01T12:00:00Z duration: 60 offset: 0';
    expect(i18n.t('processFile.lineInfo', {
      lineNumber: 1,
      msisdn: '12345',
      download: 100,
      upload: 50,
      timestamp: '2023-01-01T12:00:00Z',
      duration: 60,
      offset: 0
    })).toBe(expectedLineInfo);

    const expectedLineInvalid = 'Line 2 is invalid';
    expect(i18n.t('processFile.lineInvalid', { lineNumber: 2 })).toBe(expectedLineInvalid);

    const expectedProcessed = 'Processed: 1000ms, Started: 1672574400000';
    expect(i18n.t('processFile.processed', { duration: '1000', startTime: 1672574400000 })).toBe(expectedProcessed);
  });

  it('should fallback to default language if a key is missing (optional test)', async () => {
    // Temporarily change to a language that might miss a key or use a specific namespace
    // This test is more involved as it requires setting up a mock non-existent key or language
    // For simplicity, we'll assume 'en' is the fallback and test a key.
    // You might need to spyOn i18n.services.resourceStore.getData for more complex scenarios.

    // Example: Ensure it still returns a valid string or the key itself if not found, based on config
    const missingKey = 'this.key.does.not.exist';
    expect(i18n.t(missingKey)).toBe(missingKey); // Default i18next behavior returns the key
  });

  // Add more tests as needed, e.g., for language switching if that's a feature.
});
