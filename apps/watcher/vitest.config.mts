import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true, // Assuming globals like vi, describe, it, etc., are desired
    environment: 'node', // Explicitly set environment if needed
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
});
