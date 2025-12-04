import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/backlog-pro/**/*.test.ts', 'tests/backlog-pro/**/*.test.tsx', 'tests/auth/**/*.test.ts', 'tests/auth/**/*.test.tsx', 'tests/supabase/**/*.test.ts', 'tests/calendar-filters-views/**/*.test.ts', 'tests/calendar-filters-views/**/*.test.tsx', 'tests/financial-period-filter/**/*.test.ts', 'tests/financial-period-filter/**/*.test.tsx'],
    setupFiles: ['./tests/backlog-pro/setup.ts', './tests/calendar-filters-views/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/components/ui/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
