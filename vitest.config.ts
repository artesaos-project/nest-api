import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const viteTsconfigPaths = (await import('vite-tsconfig-paths')).default;

  return {
    test: {
      globals: true,
      root: './',
    },
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
      viteTsconfigPaths(),
    ],
  };
});
