import { vi } from "vitest";

export const chokidarMock = {
  watch: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    close: vi.fn().mockResolvedValue(undefined),
  }),
};

export default {
  watch: chokidarMock.watch,
};
