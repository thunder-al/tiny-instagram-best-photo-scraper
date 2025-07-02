import { defineConfig, type UserConfig } from 'vite'
import fs from 'node:fs/promises'

export default defineConfig(async () => {
  const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'))

  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    /^node:/,
  ]

  return <UserConfig>{
    publicDir: false,
    build: {
      minify: false,
      sourcemap: true,
      lib: {
        entry: { index: './src/index.ts' },
        formats: ['es'],
        name: 'index',
      },
      target: 'esnext',
      rollupOptions: {
        output: {
          sourcemapExcludeSources: true,
          exports: 'named',
        },
        external: externals,
      },
    },
    esbuild: {
      minifyIdentifiers: false,
    },
    plugins: [
    ],
  }
})
