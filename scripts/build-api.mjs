// Vercel's Node builder keeps relative imports unbundled for ESM projects, so
// bundle the Hono app into a single API function before `vite build` runs.
// Vercel only honours one dynamic segment in `api/`, so every `/api/*` and
// `/media/*` request is rewritten to this one function (see vercel.json).
import { rm } from 'node:fs/promises'
import { build } from 'esbuild'

await rm('api', { recursive: true, force: true })

await build({
  entryPoints: ['src/server/vercel-entry.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  packages: 'external',
  logLevel: 'info',
})
