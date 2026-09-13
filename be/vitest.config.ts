import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 20000,
    // 3min due to downloading mongo image and starting container - testcontainers
    hookTimeout: 180000,
  },
});
