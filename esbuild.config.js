let pnpPlugin = require('@yarnpkg/esbuild-plugin-pnp');
console.log(pnpPlugin);
require('esbuild')
  .build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'public/js/app.js',
    plugins: [{ name: 'pnpPlugin', setup: pnpPlugin.pnpPlugin }],
  })
  .catch(() => process.exit(1));
