import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,mjs}'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['public/js/**/*.js']
    }
  }
});
