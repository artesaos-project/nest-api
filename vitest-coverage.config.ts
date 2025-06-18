import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const viteTsconfigPaths = (await import('vite-tsconfig-paths')).default;

  return {
    test: {
      include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
      globals: true,
      root: './',
      setupFiles: ['./test/setup-e2e.ts'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts'],
      },
    },
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
      viteTsconfigPaths(),
    ],
  };
});