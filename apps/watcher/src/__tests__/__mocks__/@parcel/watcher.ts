import { vi } from "vitest";

// Store the callback and options for tests to inspect or use
let mockCallback: ((err: Error | null, events: any[]) => void) | null = null;
let mockOptions: any = null;
let mockPath: string | null = null;

const unsubscribeMock = vi.fn().mockResolvedValue(undefined);
const subscribeMock = vi
  .fn()
  .mockImplementation((path, callback, options) => {
    mockPath = path;
    mockCallback = callback;
    mockOptions = options;
    return Promise.resolve({
      unsubscribe: unsubscribeMock,
    });
  });

// Helper for tests to simulate events
const simulateEvent = (err: Error | null, events: any[]) => {
  if (mockCallback) {
    mockCallback(err, events);
  }
};

// Helper to get the stored callback for more complex assertions
const getSubscribedCallback = () => mockCallback;
const getSubscribedPath = () => mockPath;
const getSubscribedOptions = () => mockOptions;
const getUnsubscribeMock = () => unsubscribeMock;

export {
  subscribeMock as subscribe,
  unsubscribeMock, // Also exporting this if direct assertion on it is needed
  simulateEvent,
  getSubscribedCallback,
  getSubscribedPath,
  getSubscribedOptions,
  getUnsubscribeMock,
};

// Optional: Reset mocks before each test if this file is automocked
// (though usually done in test setup files)
// beforeEach(() => {
//   mockCallback = null;
//   mockOptions = null;
//   mockPath = null;
//   subscribeMock.mockClear();
//   unsubscribeMock.mockClear();
// });
