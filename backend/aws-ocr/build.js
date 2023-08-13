import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: ['./src/handler.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: './pulumi/dist/handler.js',
    // external: ['aws-sdk'],
    external: [],
    minify: false,
  })
  .catch(() => process.exit(1))
